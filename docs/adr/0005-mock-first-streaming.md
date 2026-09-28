# ADR-0005: Mock-first streaming

## Status

Accepted

## Context

The frontend is being built before the backend contract (hashflow-infra)
lands. Every user story must be demoable and testable without the real
SSE/WS endpoints, and the realtime wire format must not be guessed.

## Decision

- `src/lib/realtime/mockRealtimeClient.ts` implements the same interface
  as the real `RealtimeClient` and emits the same wire-format events:
  telemetry every 10s, prices every 30s, plus simulated alerts,
  suggestions, and news.
- The mock honors the spec's state rules (RN01–RN03: throttling at 85°C,
  shutdown at 95°C).
- Selection is driven by the `VITE_REALTIME_MODE` environment flag
  (`mock` default for dev/tests, `real` when the backend exists).

## Consequences

- Stories are demoable from day one; tests run against a deterministic
  stream.
- Swapping to the real backend is a configuration change, not a rewrite.
- The mock doubles as a living example of the wire contract for the
  backend team.
