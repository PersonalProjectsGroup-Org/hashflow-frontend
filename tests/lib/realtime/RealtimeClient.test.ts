import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type EventSourceLike,
  type RealtimeClient,
  type WebSocketLike,
  createRealtimeClient,
} from '../../../src/lib/realtime/RealtimeClient';

class FakeEventSource implements EventSourceLike {
  static instances: FakeEventSource[] = [];
  closed = false;
  openListener: (() => void) | null = null;
  errorListener: (() => void) | null = null;
  readonly url: string;
  private readonly handlers = new Map<
    string,
    Set<(event: MessageEvent) => void>
  >();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    const set =
      this.handlers.get(type) ?? new Set<(event: MessageEvent) => void>();
    set.add(listener);
    this.handlers.set(type, set);
  }

  removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    this.handlers.get(type)?.delete(listener);
  }

  onOpen(listener: () => void): void {
    this.openListener = listener;
  }

  onError(listener: () => void): void {
    this.errorListener = listener;
  }

  close(): void {
    this.closed = true;
  }

  open(): void {
    this.openListener?.();
  }

  error(): void {
    this.errorListener?.();
  }

  emit(type: string, data: string): void {
    const event = new MessageEvent(type, { data });
    this.handlers.get(type)?.forEach((listener) => listener(event));
  }
}

class FakeWebSocket implements WebSocketLike {
  static instances: FakeWebSocket[] = [];
  closed = false;
  openListener: (() => void) | null = null;
  errorListener: (() => void) | null = null;
  closeListener: (() => void) | null = null;
  readonly url: string;
  private readonly messageListeners = new Set<(event: MessageEvent) => void>();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.messageListeners.add(listener);
  }

  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.messageListeners.delete(listener);
  }

  onOpen(listener: () => void): void {
    this.openListener = listener;
  }

  onError(listener: () => void): void {
    this.errorListener = listener;
  }

  onClose(listener: () => void): void {
    this.closeListener = listener;
  }

  close(): void {
    this.closed = true;
  }

  open(): void {
    this.openListener?.();
  }

  error(): void {
    this.errorListener?.();
  }

  closeFromServer(): void {
    this.closeListener?.();
  }

  emitMessage(data: string): void {
    const event = new MessageEvent('message', { data });
    this.messageListeners.forEach((listener) => listener(event));
  }
}

function createTestClient(): RealtimeClient {
  return createRealtimeClient({
    sseUrl: 'https://api.example.test/events',
    wsUrl: 'wss://api.example.test/ws',
    backoff: {
      baseDelayMs: 1000,
      maxDelayMs: 4000,
      randomizeDelay: (delayMs) => delayMs,
    },
    createEventSource: (url) => new FakeEventSource(url),
    createWebSocket: (url) => new FakeWebSocket(url),
  });
}

beforeEach(() => {
  FakeEventSource.instances = [];
  FakeWebSocket.instances = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SSE transport', () => {
  it('opens the EventSource lazily on first SSE subscription', () => {
    const client = createTestClient();
    client.subscribe('telemetry', vi.fn());

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0].url).toBe(
      'https://api.example.test/events',
    );
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('shares one EventSource across SSE topics', () => {
    const client = createTestClient();
    client.subscribe('telemetry', vi.fn());
    client.subscribe('price', vi.fn());
    client.subscribe('snapshot', vi.fn());

    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it('dispatches parsed telemetry frames to telemetry listeners', () => {
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('telemetry', listener);
    const es = FakeEventSource.instances[0];
    es.open();

    es.emit(
      'telemetry',
      JSON.stringify({
        rigId: 'r1',
        hashrate: 122000000,
        temperatureC: 75.6,
        powerWatts: 301,
        status: 'ONLINE',
        timestamp: '2026-08-14T00:00:00.000Z',
      }),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        rigId: 'r1',
        temperatureC: 75.6,
        status: 'ONLINE',
      }),
    );
  });

  it('ignores malformed or non-string SSE frames', () => {
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('telemetry', listener);
    const es = FakeEventSource.instances[0];

    es.emit('telemetry', '{not valid json');
    es.emit('telemetry', '');

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('WebSocket transport', () => {
  it('opens the WebSocket lazily on first WS subscription and routes envelopes', () => {
    const client = createTestClient();
    const alertListener = vi.fn();
    client.subscribe('alert', alertListener);

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeEventSource.instances).toHaveLength(0);

    const ws = FakeWebSocket.instances[0];
    ws.open();
    ws.emitMessage(
      JSON.stringify({ type: 'alert', payload: { id: 'a1', impact: 'HIGH' } }),
    );

    expect(alertListener).toHaveBeenCalledWith({ id: 'a1', impact: 'HIGH' });
  });

  it('routes suggestion, suggestion.removed and news envelopes', () => {
    const client = createTestClient();
    const suggestion = vi.fn();
    const removed = vi.fn();
    const news = vi.fn();
    client.subscribe('suggestion', suggestion);
    client.subscribe('suggestion.removed', removed);
    client.subscribe('news', news);
    const ws = FakeWebSocket.instances[0];

    ws.emitMessage(
      JSON.stringify({ type: 'suggestion', payload: { id: 's1' } }),
    );
    ws.emitMessage(
      JSON.stringify({ type: 'suggestion.removed', payload: { id: 's1' } }),
    );
    ws.emitMessage(JSON.stringify({ type: 'news', payload: { id: 'n1' } }));

    expect(suggestion).toHaveBeenCalledWith({ id: 's1' });
    expect(removed).toHaveBeenCalledWith({ id: 's1' });
    expect(news).toHaveBeenCalledWith({ id: 'n1' });
  });

  it('ignores envelopes with unknown types or missing payload', () => {
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('alert', listener);
    const ws = FakeWebSocket.instances[0];

    ws.emitMessage(JSON.stringify({ type: 'unknown.topic', payload: {} }));
    ws.emitMessage(JSON.stringify({ payload: {} }));
    ws.emitMessage('{not json');

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('subscription lifecycle', () => {
  it('stops delivering after unsubscribe', () => {
    const client = createTestClient();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = client.subscribe('telemetry', first);
    client.subscribe('telemetry', second);
    const es = FakeEventSource.instances[0];

    unsubscribe();
    es.emit('telemetry', JSON.stringify({ rigId: 'r1' }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    const unsubscribe2 = client.subscribe('price', vi.fn());
    unsubscribe2();
    unsubscribe2(); // idempotent
    expect(FakeEventSource.instances).toHaveLength(1);
  });
});

describe('reconnect with exponential backoff', () => {
  it('reconnects SSE with backoff 1s → 2s → 4s cap across consecutive failures', () => {
    vi.useFakeTimers();
    const client = createTestClient();
    client.subscribe('telemetry', vi.fn());

    // Connection refused: error fires without an open, so backoff must grow.
    FakeEventSource.instances[0].error();
    expect(FakeEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(999);
    expect(FakeEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(2);

    FakeEventSource.instances[1].error();
    vi.advanceTimersByTime(1999);
    expect(FakeEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(3);

    FakeEventSource.instances[2].error();
    vi.advanceTimersByTime(3999);
    expect(FakeEventSource.instances).toHaveLength(3);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(4);
  });

  it('resets the backoff after a successful open', () => {
    vi.useFakeTimers();
    const client = createTestClient();
    client.subscribe('telemetry', vi.fn());
    const es1 = FakeEventSource.instances[0];
    es1.open();

    es1.error();
    vi.advanceTimersByTime(1000);
    const es2 = FakeEventSource.instances[1];
    es2.open();
    es2.error();
    vi.advanceTimersByTime(999);
    expect(FakeEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(3);
  });

  it('reconnects WebSocket on error and on close without doubling', () => {
    vi.useFakeTimers();
    const client = createTestClient();
    client.subscribe('alert', vi.fn());
    const ws1 = FakeWebSocket.instances[0];
    ws1.open();

    ws1.error();
    ws1.closeFromServer(); // browser fires both for one failure
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    const ws2 = FakeWebSocket.instances[1];
    ws2.open();
    ws2.closeFromServer();
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });

  it('keeps delivering live events after a reconnect', () => {
    vi.useFakeTimers();
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('telemetry', listener);
    const es1 = FakeEventSource.instances[0];
    es1.open();
    es1.emit('telemetry', JSON.stringify({ rigId: 'r1', tick: 1 }));

    es1.error();
    vi.advanceTimersByTime(1000);
    const es2 = FakeEventSource.instances[1];
    es2.open();
    es2.emit('telemetry', JSON.stringify({ rigId: 'r1', tick: 2 }));

    expect(listener).toHaveBeenNthCalledWith(1, { rigId: 'r1', tick: 1 });
    expect(listener).toHaveBeenNthCalledWith(2, { rigId: 'r1', tick: 2 });
  });
});

describe('snapshot resync', () => {
  it('replays the last snapshot to late subscribers', async () => {
    const client = createTestClient();
    client.subscribe('snapshot', vi.fn());
    const es = FakeEventSource.instances[0];
    es.emit(
      'snapshot',
      JSON.stringify({ rigs: [], telemetry: [], prices: [] }),
    );

    const late = vi.fn();
    client.subscribe('snapshot', late);
    await Promise.resolve();

    expect(late).toHaveBeenCalledWith({ rigs: [], telemetry: [], prices: [] });
  });

  it('refreshes the replay cache with the snapshot received after reconnect', async () => {
    vi.useFakeTimers();
    const client = createTestClient();
    const live = vi.fn();
    client.subscribe('snapshot', live);
    const es1 = FakeEventSource.instances[0];
    es1.emit(
      'snapshot',
      JSON.stringify({ rigs: [{ id: 'r1' }], telemetry: [], prices: [] }),
    );

    es1.error();
    vi.advanceTimersByTime(1000);
    const es2 = FakeEventSource.instances[1];
    es2.open();
    es2.emit(
      'snapshot',
      JSON.stringify({
        rigs: [{ id: 'r1' }, { id: 'r2' }],
        telemetry: [],
        prices: [],
      }),
    );

    const late = vi.fn();
    client.subscribe('snapshot', late);
    await Promise.resolve();

    expect(live).toHaveBeenLastCalledWith(
      expect.objectContaining({ rigs: [{ id: 'r1' }, { id: 'r2' }] }),
    );
    expect(late).toHaveBeenCalledWith(
      expect.objectContaining({ rigs: [{ id: 'r1' }, { id: 'r2' }] }),
    );
  });
});

describe('disconnect', () => {
  it('closes transports, clears listeners and cancels pending reconnects', () => {
    vi.useFakeTimers();
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('telemetry', listener);
    client.subscribe('alert', vi.fn());
    const es = FakeEventSource.instances[0];
    const ws = FakeWebSocket.instances[0];
    es.open();
    ws.open();

    es.error();
    client.disconnect();

    expect(es.closed).toBe(true);
    expect(ws.closed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);

    // A late error after disconnect must not open a new transport.
    es.error();
    vi.advanceTimersByTime(60_000);
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('does not deliver events after disconnect', () => {
    const client = createTestClient();
    const listener = vi.fn();
    client.subscribe('telemetry', listener);
    const es = FakeEventSource.instances[0];
    es.open();

    client.disconnect();
    es.emit('telemetry', JSON.stringify({ rigId: 'r1' }));

    expect(listener).not.toHaveBeenCalled();
  });
});
