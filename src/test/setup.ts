import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver, and recharts' ResponsiveContainer needs one to
// measure its container (T011). Stub it to report a fixed size synchronously so
// charts actually render in tests; disconnect() tracks recharts' unmount cleanup.
class ResizeObserverStub implements ResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const entry: ResizeObserverEntry = {
      target,
      contentRect: new DOMRect(0, 0, 200, 40),
      borderBoxSize: [{ inlineSize: 200, blockSize: 40 }],
      contentBoxSize: [{ inlineSize: 200, blockSize: 40 }],
      devicePixelContentBoxSize: [{ inlineSize: 200, blockSize: 40 }],
    };
    this.callback([entry], this);
  }

  unobserve(): void {}

  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub;
}
