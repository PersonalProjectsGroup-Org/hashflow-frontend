# Implementation Plan: Real-Time Mining Monitoring Dashboard

**Branch**: `001-real-time-dashboard` | **Date**: 2026-08-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-real-time-dashboard/spec.md`

---

## Summary

Build the Hashflow single-page operations dashboard: a live rig-supervision grid (telemetry cards streaming over SSE every 10s), an RN04 profitability table with an editable kWh price, a market panel (BTC/ETC/RVN prices + recharts sparklines every 30s), and a right-hand tabbed panel (Alertas / Sugestões / Notícias) fed by WebSocket push events. The UI is dark-themed per the Figma prototype, fully internationalized (English default + pt-BR), and implements the adaptive alert UX: on HIGH-impact events the palette shifts and the affected rig is spotlighted. No refresh buttons; 60fps under sustained streaming.

The repo (`hashflow-frontend`) is a fresh Vite + React + TS scaffold, so this plan includes the foundational setup (dependencies, design system, streaming layer, i18n, routing) as Phase 0, then the six user stories from the spec.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Node ≥ 20 — already scaffolded (Vite 8)

**Primary Dependencies** (to add in Phase 0; all in the constitution-approved stack):
- `react-router-dom` — SPA routing
- `@tanstack/react-query` — server state (REST fetches: rig list, settings)
- `axios` — HTTP client (single configured instance in `src/lib/`)
- `zustand` — client/realtime state (telemetry, alerts, prices, suggestions, news, UI prefs)
- `tailwindcss` + `@headlessui/react` — styling + accessible primitives (design tokens as CSS variables)
- `react-hook-form` + `zod` — kWh editor form + validation
- `lucide-react` — icons (the exact set used in the design: activity, server, trending-up, arrow-right-left, cpu, power, bell, newspaper, radio, triangle-alert, zap, refresh-cw, clock, zap, circle)
- `recharts` — market sparklines (design renders recharts; Area/Line only in v1)
- `i18next` + `react-i18next` — internationalization (EN default + pt-BR; locale files structured for future languages)

**Storage**: No backend DB in this repo. Client-side persistence only: `localStorage` for the kWh price and the language preference (via a small settings store). Server state lives in React Query caches; realtime state lives in Zustand stores (bounded ring buffers for sparklines/history).

**Testing**: Vitest + React Testing Library + `user-event`; MSW for REST mocking; a hand-written `MockRealtimeClient` implementing the same interface as the real WS/SSE client (swappable via an environment flag / DI). Unit tests for formatters, stores (Zustand), i18n dictionaries, and the streaming client; component tests per user story.

**Target Platform**: Modern evergreen desktop browsers (Chromium/Firefox/Safari), desktop-first ≥1280px (design target 1280×1080), graceful ≥1024px.

**Project Type**: Single-page web application (Vite SPA), feature-first structure.

**Performance Goals**: Smooth 60fps interaction during sustained telemetry streaming (20+ rigs); telemetry reflected on-card in ≤1s; adaptive palette shift ≤1s; no memory growth over a 30-minute session (SC-001/002/007).

**Constraints**: No manual refresh controls; no default exports (named exports only); no `as` casts; no Redux; no extra state/client/styling/routing libraries beyond the approved stack without a constitution amendment; every change must pass `npm run lint` and `npm run type-check`; realtime values are rendered as received (simulation lives in the backend).

**Scale/Scope**: v1 = single-page dashboard per spec; up to a few dozen rigs, 3 coins, single operator (no auth). Multi-page areas (rig management, history, settings) out of scope until new designs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution principle | Plan compliance |
|------------------------|-----------------|
| I. Feature-Driven Architecture (`src/features/<kebab-case>/`, shared primitives in `src/components/ui/`, PascalCase files, named exports, types derived from shared OpenAPI) | ✅ `src/features/dashboard/` with `components/`, `hooks/`, `services/`, `stores/`; `src/components/ui/` primitives; typed client in `src/services/` and `src/types/` (locally mirrored until `hashflow-infra` OpenAPI exists) |
| II. Real-Time Telemetry & SSE-First (no manual refresh; reconnection, state resync, backpressure) | ✅ SSE for periodic metrics (telemetry 10s, prices 30s) + WebSocket for alert events; `RealtimeClient` with auto-reconnect (exponential backoff) and resync; no refresh controls anywhere |
| III. Adaptive User Experience (palette shift on High-impact; spotlight critical modules; sentiment badges) | ✅ Theme token swap on `highImpactActive`; rig spotlight + reorder; news sentiment badges (green/red/gray) |
| IV. High-Frequency Stream Performance (60fps; chart cleanup; fine-grained Zustand selectors) | ✅ Selector-scoped subscriptions; memoized chart components with cleanup; rAF-batched telemetry ingestion; bounded buffers |
| V. Strict State and Library Separation (Zustand, no Redux; React Query for server state; RHF + Zod forms; axios; lucide icons) | ✅ As defined in Technical Context; kWh editor uses RHF+Zod; no Redux |
| Stack constraints (React 19, Vite, TS, Tailwind + Headless UI, react-router-dom only) | ✅ All additions are within the approved set (i18n is neither state/client/styling/routing, so no amendment required) |
| Named exports only; no `as` casts; lint + type-check gates | ✅ Enforced in tasks and CI-style local checks |

**Result**: PASS — no violations; Complexity Tracking below remains empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-real-time-dashboard/
├── spec.md              # Feature specification (this feature)
├── plan.md              # This file
├── data-model.md        # Entities → TS types + wire formats (Phase 1)
└── tasks.md             # /speckit-tasks output (Phase 2)
```

(`research.md`, `quickstart.md`, `contracts/` will be added if the backend contract or a runnable mock requires separate documentation.)

### Source Code (repository root — single frontend project)

```text
src/
├── components/
│   └── ui/                          # Design-system primitives (PascalCase, named exports)
│       ├── Badge.tsx                # Status/impact/type badges
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ProgressBar.tsx          # Temperature severity bar
│       ├── Sparkline.tsx            # recharts-based mini line chart (market panel)
│       ├── Tabs.tsx                 # Alertas/Sugestões/Notícias tabs
│       └── ...
├── features/
│   └── dashboard/
│       ├── components/              # Feature components
│       │   ├── Header.tsx           # logo, Live, rigs count, profit/day, kWh editor, lang switch
│       │   ├── RigCard.tsx          # rig telemetry card
│       │   ├── RigGrid.tsx          # responsive grid of RigCards
│       │   ├── ProfitabilityTable.tsx
│       │   ├── MarketPanel.tsx      # coin prices + sparklines
│       │   ├── AlertsFeed.tsx
│       │   ├── SuggestionsFeed.tsx
│       │   ├── NewsFeed.tsx
│       │   ├── SidePanel.tsx        # tabs + feeds
│       │   └── KwhEditor.tsx        # RHF + Zod inline edit
│       ├── hooks/                   # Streaming hooks
│       │   ├── useTelemetry.ts
│       │   ├── useMarketPrices.ts
│       │   ├── useAlerts.ts
│       │   ├── useSuggestions.ts
│       │   └── useNews.ts
│       ├── services/                # API client functions (axios) for REST
│       │   └── dashboardApi.ts
│       ├── stores/                  # Zustand stores
│       │   ├── telemetryStore.ts
│       │   ├── alertsStore.ts
│       │   ├── marketStore.ts
│       │   ├── suggestionsStore.ts
│       │   ├── newsStore.ts
│       │   └── uiStore.ts           # theme (adaptive), language, kWh
│       └── index.ts
├── layouts/
│   └── MainLayout.tsx               # header + main area + side panel shell
├── lib/
│   ├── axios.ts                     # configured axios instance
│   ├── queryClient.ts
│   ├── i18n.ts                      # i18next init, EN + pt-BR resources
│   └── realtime/
│       ├── RealtimeClient.ts        # WS/SSE abstraction (connect, subscribe, reconnect)
│       └── mockRealtimeClient.ts    # dev/mock implementation (same interface)
├── routes/
│   └── index.tsx                    # route definitions (single dashboard route in v1)
├── services/                        # shared API client functions
├── stores/                          # shared Zustand stores (if any beyond feature)
├── types/
│   ├── api.ts                       # mirrored contract types (Rig, Telemetry, ...)
│   └── events.ts                    # WS/SSE event shapes
├── utils/
│   ├── format.ts                    # number/currency/units/relative-time formatters
│   └── impact.ts                    # impact-level helpers (colors, channels, cooldown display)
├── App.tsx
└── main.tsx

src/locales/
├── en.json                          # English dictionary (default)
└── pt-BR.json                       # Portuguese (BR) dictionary (Appendix A)

tests/
├── unit/                            # formatters, stores, i18n, realtime client
├── component/                       # per user-story component tests
└── integration/                     # dashboard flows with MSW + MockRealtimeClient
```

**Structure Decision**: Single-project frontend (Option 1/2 hybrid — no `backend/` here; the backend lives in the separate `hashflow-backend` repo). The layout follows the constitution's feature-first rule exactly: feature code under `src/features/dashboard/`, shared primitives under `src/components/ui/`, global stores in `src/stores/`, contract types in `src/types/`. Routing is minimal in v1 (one route) but set up via `react-router-dom` so later features (rigs, settings) slot in as sibling feature folders.

## Architecture & Data Flow

```text
hashflow-backend (external, via hashflow-infra contract)
   │  REST (axios + React Query): rigs, settings, initial snapshot
   │  SSE: telemetry ticks (every 10s) + price ticks (every 30s)
   │  WebSocket: alert-level events (immediate push)
   ▼
src/lib/realtime/RealtimeClient (WS + SSE abstraction, auto-reconnect + resync)
   ▼
Zustand stores (selector-scoped subscriptions, rAF-batched writes, bounded buffers)
   │  telemetryStore ──► RigGrid / RigCard (only changed rig re-renders)
   │  marketStore    ──► MarketPanel / header prices
   │  alertsStore    ──► AlertsFeed + tab badges + uiStore.highImpactActive
   │  suggestionsStore / newsStore ──► tabs
   ▼
uiStore (adaptive theme) ──► theme tokens (CSS variables) swap on HIGH impact
```

Key decisions:

1. **Streaming split (SSE vs WS)** matches the plan: SSE for periodic metrics (telemetry 10s, prices 30s — matching the design's footer), WebSocket for alert-grade events (immediate, includes MEDIUM/HIGH dispatches). One `RealtimeClient` manages both transports with a unified subscription API and shared reconnect/resync logic.
2. **Zustand for realtime state** (not React Query) — high-frequency streaming bypasses cache semantics; React Query is used only for REST fetches (rigs list, settings). This matches constitution V.
3. **rAF batching + selector subscriptions** for 60fps: telemetry ticks are queued and flushed per animation frame; each `RigCard` subscribes to its own rig slice.
4. **Theme as CSS variables** (`--color-accent`, `--color-alert-bg`, …) driven by `uiStore.highImpactActive`, so the palette shift is a token swap, not a component rewrite.
5. **i18n**: `i18next` with `en` (default) + `pt-BR` resource files keyed per Appendix A; language persisted in `localStorage`; a compact language switch added to the header (new control beyond the design, flagged in Complexity Tracking-free notes).
6. **Mock-first**: `MockRealtimeClient` + MSW provide the wire format before Raphael's services exist; the real client is enabled by an env flag (`VITE_REALTIME_MODE=mock|ws`).
7. **Unit formatting** is locale-invariant per spec FR-017 (US-style), via `utils/format.ts` shared by all components.

## Phases

- **Phase 0 — Foundation (blocks everything)**: install deps; Tailwind + design tokens (GitHub-dark palette: `#3fb950` green, `#f85149` red, `#e3b341` yellow, `#f0883e` orange, `#58a6ff` blue); `src/components/ui/` primitives (Card, Badge, Button, ProgressBar, Sparkline, Tabs); `src/lib/` (axios, queryClient, i18n with en + pt-BR); `RealtimeClient` + mock; types mirror; routes + MainLayout shell; `npm run lint` + `type-check` green.
- **Phase 1 — US1 Live Rig Supervision (P1, MVP)**: telemetry store + `useTelemetry`; `RigCard`/`RigGrid`; header counts + profit/day; status/color semantics (RN01–RN03).
- **Phase 2 — US2 Profitability & Market (P2)**: `ProfitabilityTable` (RN04); `KwhEditor` (RHF+Zod, localStorage); market store + `MarketPanel` sparklines; header profit total.
- **Phase 3 — US3 Impact Alerts (P2)**: alerts store + `AlertsFeed`; tab badges; live push; cooldown display (RN07); empty state.
- **Phase 4 — US4 Switch Suggestions (P3)**: suggestions store + feed; 10% threshold display; GPU-only (RN08–RN10).
- **Phase 5 — US5 News with Sentiment (P3)**: news store + feed; sentiment badges (RN11–RN12).
- **Phase 6 — US6 Adaptive UX (P3)**: `uiStore` theme swap + rig spotlight/reorder on HIGH; restore on clear.

Each phase ends with its user story independently testable (per spec), and a green `npm run lint` + `npm run type-check`.

## Complexity Tracking

*Empty — Constitution Check passed with no violations.*
