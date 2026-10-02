/**
 * RealtimeClient — the single transport abstraction for live data (ADR-0003).
 *
 * SSE carries periodic metrics (telemetry 10s, price 30s, snapshot on connect);
 * WebSocket carries alert-grade events (alert, suggestion, news).
 *
 * Responsibilities:
 * - `subscribe(topic, cb)` opens the matching transport lazily and returns an
 *   unsubscribe function (no leaked listeners — SC-008).
 * - Auto-reconnect with exponential backoff per transport.
 * - Snapshot resync: the backend re-sends `event: snapshot` on every SSE
 *   connect; the client also replays the last snapshot to late subscribers so
 *   late-mounting components get current state without a refresh button
 *   (FR-015).
 *
 * Payload types mirror `docs/data-model.md` §Wire Formats; T018 relocates
 * them to `src/types/events.ts` when the OpenAPI contract lands.
 */

// ---------------------------------------------------------------------------
// Wire payload types (mirrored from data-model.md)
// ---------------------------------------------------------------------------

export type RigType = 'GPU' | 'ASIC';
export type RigStatus = 'ONLINE' | 'THROTTLING' | 'OFFLINE';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface Rig {
  id: string;
  name: string;
  model: string;
  type: RigType;
  status: RigStatus;
  algorithm: string;
  coin: string;
  maxHashrate: number;
  maxPowerWatts: number;
  uptimeSeconds: number;
  createdAt: string;
}

export interface TelemetryReading {
  rigId: string;
  hashrate: number;
  temperatureC: number;
  powerWatts: number;
  status: RigStatus;
  timestamp: string;
}

export interface PricePoint {
  ticker: string;
  price: number;
  timestamp: string;
}

/** SSE `snapshot` event — sent on connect: initial rigs + latest readings. */
export interface RealtimeSnapshot {
  rigs: Rig[];
  telemetry: TelemetryReading[];
  prices: PricePoint[];
}

export interface ImpactAlert {
  id: string;
  subject: { rigId?: string; coin?: string };
  impact: ImpactLevel;
  messageKey: string;
  messageArgs?: Record<string, string | number>;
  channels: Array<'dashboard' | 'websocket' | 'webhook' | 'email'>;
  timestamp: string;
  cooldownUntil?: string;
}

export interface SwitchSuggestion {
  id: string;
  rigId: string;
  rigName: string;
  fromCoin: string;
  toCoin: string;
  fromProfitUsd: number;
  toProfitUsd: number;
  improvementPct: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: Sentiment;
  relatedCoins: string[];
  publishedAt: string;
}

/** Topic → payload map. `subscribe(topic)` narrows the payload type per topic. */
export interface RealtimeEventMap {
  telemetry: TelemetryReading;
  price: PricePoint;
  snapshot: RealtimeSnapshot;
  alert: ImpactAlert;
  suggestion: SwitchSuggestion;
  'suggestion.removed': { id: string };
  news: NewsItem;
}

export type RealtimeTopic = keyof RealtimeEventMap;

export type RealtimeListener<K extends RealtimeTopic> = (
  payload: RealtimeEventMap[K],
) => void;

export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// Transport abstractions (structural, so tests inject fakes; adapters wrap the
// native EventSource / WebSocket below)
// ---------------------------------------------------------------------------

export interface EventSourceLike {
  addEventListener(type: string, listener: (event: MessageEvent) => void): void;
  removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void;
  onOpen(listener: () => void): void;
  onError(listener: () => void): void;
  close(): void;
}

export interface WebSocketLike {
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void;
  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void;
  onOpen(listener: () => void): void;
  onError(listener: () => void): void;
  onClose(listener: () => void): void;
  close(): void;
}

/** Thin, cast-free adapters so the client never touches native objects directly. */
class EventSourceAdapter implements EventSourceLike {
  private readonly source: EventSource;

  constructor(url: string) {
    this.source = new EventSource(url);
  }

  addEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    this.source.addEventListener(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void,
  ): void {
    this.source.removeEventListener(type, listener);
  }

  onOpen(listener: () => void): void {
    this.source.addEventListener('open', listener);
  }

  onError(listener: () => void): void {
    this.source.addEventListener('error', listener);
  }

  close(): void {
    this.source.close();
  }
}

class WebSocketAdapter implements WebSocketLike {
  private readonly socket: WebSocket;

  constructor(url: string) {
    this.socket = new WebSocket(url);
  }

  addEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.socket.addEventListener(type, listener);
  }

  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.socket.removeEventListener(type, listener);
  }

  onOpen(listener: () => void): void {
    this.socket.addEventListener('open', listener);
  }

  onError(listener: () => void): void {
    this.socket.addEventListener('error', listener);
  }

  onClose(listener: () => void): void {
    this.socket.addEventListener('close', listener);
  }

  close(): void {
    this.socket.close();
  }
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/** Topics delivered over each transport (data-model.md §Wire Formats). */
const SSE_TOPICS: readonly RealtimeTopic[] = ['telemetry', 'price', 'snapshot'];
const WS_TOPICS: readonly RealtimeTopic[] = [
  'alert',
  'suggestion',
  'suggestion.removed',
  'news',
];
const TOPIC_SET: ReadonlySet<string> = new Set([...SSE_TOPICS, ...WS_TOPICS]);

export interface BackoffOptions {
  /** First reconnect delay. */
  baseDelayMs: number;
  /** Ceiling for the exponential growth. */
  maxDelayMs: number;
  /** Maps a raw backoff delay to the actual one (defaults to jittered). */
  randomizeDelay: (delayMs: number) => number;
}

export interface RealtimeClientOptions {
  sseUrl: string;
  wsUrl: string;
  backoff?: Partial<BackoffOptions>;
  /** Test seams — default to the native transports. */
  createEventSource?: (url: string) => EventSourceLike;
  createWebSocket?: (url: string) => WebSocketLike;
}

export interface RealtimeClient {
  /**
   * Registers a listener for a topic, lazily opening the transport that
   * carries it. Returns an unsubscribe function; removing the last listener
   * for a topic drops it from the registry (no leaks, SC-008).
   *
   * Subscribing to `snapshot` replays the most recent snapshot immediately
   * (microtask) so late subscribers start from current state.
   */
  subscribe<K extends RealtimeTopic>(
    topic: K,
    listener: RealtimeListener<K>,
  ): Unsubscribe;
  /** Closes both transports, cancels reconnect timers, clears all listeners. */
  disconnect(): void;
}

const DEFAULT_BACKOFF: BackoffOptions = {
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  randomizeDelay: (delayMs) => delayMs * (0.5 + Math.random() * 0.5),
};

type TransportStatus = 'closed' | 'open' | 'reconnecting';

/** Owns one transport instance + its reconnect state. */
class Transport {
  status: TransportStatus = 'closed';
  instance: EventSourceLike | WebSocketLike | null = null;
  private readonly controller: ReconnectController;

  constructor(backoff: BackoffOptions) {
    this.controller = new ReconnectController(backoff);
  }

  scheduleReconnect(reconnect: () => void): void {
    if (this.status === 'closed') return;
    this.status = 'reconnecting';
    this.controller.schedule(reconnect);
  }

  onOpen(): void {
    this.status = 'open';
    this.controller.reset();
  }

  markReconnecting(): void {
    this.status = 'reconnecting';
  }

  stop(): void {
    this.status = 'closed';
    this.controller.stop();
  }

  get hasPendingReconnect(): boolean {
    return this.controller.hasPendingTimer;
  }

  get reconnectAttempt(): number {
    return this.controller.attempt;
  }
}

class ReconnectController {
  attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly backoff: BackoffOptions;

  constructor(backoff: BackoffOptions) {
    this.backoff = backoff;
  }

  schedule(reconnect: () => void): void {
    if (this.timer !== null) return;
    const rawDelay = Math.min(
      this.backoff.baseDelayMs * 2 ** this.attempt,
      this.backoff.maxDelayMs,
    );
    const delay = this.backoff.randomizeDelay(rawDelay);
    this.attempt += 1;
    this.timer = setTimeout(() => {
      this.timer = null;
      reconnect();
    }, delay);
  }

  reset(): void {
    this.attempt = 0;
  }

  stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  get hasPendingTimer(): boolean {
    return this.timer !== null;
  }
}

/** Interface with a method param so listeners of narrower payloads are assignable (method bivariance). */
interface ListenerSlot {
  notify(payload: unknown): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRealtimeTopic(value: unknown): value is RealtimeTopic {
  return typeof value === 'string' && TOPIC_SET.has(value);
}

function isWsEnvelope(
  value: unknown,
): value is { type: string; payload: unknown } {
  return (
    isRecord(value) && typeof value.type === 'string' && 'payload' in value
  );
}

function parseJson(data: unknown): unknown {
  if (typeof data !== 'string') return undefined;
  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
}

function createRealtimeClientImpl(
  options: RealtimeClientOptions,
): RealtimeClient {
  const backoff: BackoffOptions = { ...DEFAULT_BACKOFF, ...options.backoff };
  const createEventSource =
    options.createEventSource ?? ((url: string) => new EventSourceAdapter(url));
  const createWebSocket =
    options.createWebSocket ?? ((url: string) => new WebSocketAdapter(url));

  const listeners = new Map<RealtimeTopic, Set<ListenerSlot>>();
  const sse = new Transport(backoff);
  const ws = new Transport(backoff);
  let lastSnapshotRaw: string | undefined;

  function addListener(topic: RealtimeTopic, slot: ListenerSlot): void {
    const set = listeners.get(topic);
    if (set === undefined) {
      listeners.set(topic, new Set([slot]));
    } else {
      set.add(slot);
    }
  }

  function removeListener(topic: RealtimeTopic, slot: ListenerSlot): void {
    const set = listeners.get(topic);
    if (set === undefined) return;
    set.delete(slot);
    if (set.size === 0) listeners.delete(topic);
  }

  function dispatch(topic: RealtimeTopic, payload: unknown): void {
    const set = listeners.get(topic);
    if (set === undefined) return;
    set.forEach((slot) => slot.notify(payload));
  }

  /** Parses + caches + dispatches a raw SSE frame; used for live and replayed snapshots. */
  function dispatchRawSse(topic: RealtimeTopic, raw: string): void {
    const payload = parseJson(raw);
    if (payload === undefined) return;
    if (topic === 'snapshot') lastSnapshotRaw = raw;
    dispatch(topic, payload);
  }

  function handleSseEvent(topic: RealtimeTopic, event: MessageEvent): void {
    if (typeof event.data !== 'string') return;
    dispatchRawSse(topic, event.data);
  }

  function handleWsMessage(event: MessageEvent): void {
    const envelope = parseJson(event.data);
    if (!isWsEnvelope(envelope)) return;
    if (!isRealtimeTopic(envelope.type)) return;
    dispatch(envelope.type, envelope.payload);
  }

  function closeTransport(transport: Transport): void {
    const instance = transport.instance;
    transport.instance = null;
    if (instance !== null) {
      instance.close();
    }
  }

  function openSse(): void {
    // One instance at a time; skip while a reconnect is already pending or an
    // instance is live. The reconnect timer clears itself before re-invoking.
    if (sse.instance !== null || sse.hasPendingReconnect) return;
    const source = createEventSource(options.sseUrl);
    sse.instance = source;
    sse.markReconnecting();
    source.onOpen(() => sse.onOpen());
    source.onError(() => {
      closeTransport(sse);
      sse.scheduleReconnect(() => openSse());
    });
    for (const topic of SSE_TOPICS) {
      source.addEventListener(topic, (event) => handleSseEvent(topic, event));
    }
  }

  function openWs(): void {
    if (ws.instance !== null || ws.hasPendingReconnect) return;
    const socket = createWebSocket(options.wsUrl);
    ws.instance = socket;
    ws.markReconnecting();
    socket.onOpen(() => ws.onOpen());
    socket.onError(() => {
      closeTransport(ws);
      ws.scheduleReconnect(() => openWs());
    });
    socket.onClose(() => {
      closeTransport(ws);
      ws.scheduleReconnect(() => openWs());
    });
    socket.addEventListener('message', handleWsMessage);
  }

  function ensureTransport(topic: RealtimeTopic): void {
    if (SSE_TOPICS.includes(topic)) {
      openSse();
    } else {
      openWs();
    }
  }

  return {
    subscribe<K extends RealtimeTopic>(
      topic: K,
      listener: RealtimeListener<K>,
    ): Unsubscribe {
      // Method syntax keeps `notify` bivariant, so the narrower payload type is
      // accepted where ListenerSlot expects `unknown` — no casts (constitution).
      const slot = {
        notify(payload: RealtimeEventMap[K]): void {
          listener(payload);
        },
      };
      addListener(topic, slot);
      ensureTransport(topic);

      if (topic === 'snapshot') {
        const raw = lastSnapshotRaw;
        if (raw !== undefined) {
          queueMicrotask(() => dispatchRawSse('snapshot', raw));
        }
      }

      return () => removeListener(topic, slot);
    },

    disconnect(): void {
      sse.stop();
      ws.stop();
      closeTransport(sse);
      closeTransport(ws);
      listeners.clear();
      lastSnapshotRaw = undefined;
    },
  };
}

/**
 * Creates the app-wide RealtimeClient. Transports open lazily on first
 * subscribe and reconnect with exponential backoff; call `disconnect()` for
 * teardown (e.g. HMR / app unmount).
 */
export function createRealtimeClient(
  options: RealtimeClientOptions,
): RealtimeClient {
  return createRealtimeClientImpl(options);
}
