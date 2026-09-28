# ADR-0004: Zustand for realtime state, React Query for server state

## Status

Accepted

## Context

Two very different kinds of data exist: high-frequency streaming state
(telemetry, prices, alerts) and request/response server state (rig list,
settings). Streaming data bypasses cache semantics (no staleness, no
invalidation), while REST data is a natural fit for a cache with
staleTime and retries. The 60fps requirement (SC-002) means updates must
not trigger re-render storms.

## Decision

- **Zustand** owns realtime/client state: per-rig telemetry slices with
  selector-scoped subscriptions, rAF-batched writes, and bounded ring
  buffers for history/sparklines. Only changed slices re-render.
- **React Query** (with a shared axios instance) owns REST fetches: rig
  list and settings, with default staleTime and centralized error
  handling.
- Persisted user preferences (kWh price, language) live in a small
  settings store backed by `localStorage`.

## Consequences

- Streaming updates stay off the React Query cache, keeping high-frequency
  writes cheap and predictable.
- REST fetches get caching/retry/dedup for free.
- Performance audits (T058) can rely on selector scoping being in place.
