# ADR-0003: SSE-first realtime with WebSocket for alert events

## Status

Accepted

## Context

The dashboard must stream telemetry (every 10s), market prices (every 30s),
and push alert-grade events immediately. The team constitution is
SSE-first: no manual refresh controls, reconnection with state resync, and
one transport abstraction so the backend contract can evolve.

## Decision

- One `RealtimeClient` abstraction (`src/lib/realtime/RealtimeClient.ts`)
  exposes `subscribe(topic, cb)` over both transports.
- **SSE** carries periodic metrics: telemetry ticks (10s) and price ticks
  (30s).
- **WebSocket** carries alert-grade events (immediate push, includes
  MEDIUM/HIGH dispatches).
- Auto-reconnect with exponential backoff and a snapshot resync on
  reconnect.
- No refresh buttons anywhere (spec requirement).
- A `MockRealtimeClient` implements the same interface for development and
  tests (see ADR-0005).

## Consequences

- Components subscribe once and never poll; the client owns reconnect
  and resync.
- Adding a new streamed topic is a one-line subscription change.
- Performance constraints (60fps, no listener leaks) are enforced in the
  client and audited (T058).
