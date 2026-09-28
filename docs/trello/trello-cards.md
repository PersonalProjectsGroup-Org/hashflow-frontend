# Trello Cards — Real-Time Mining Monitoring Dashboard

Source: `specs/001-real-time-dashboard/tasks.md` (T001–T063) · Generated with the `trello-task` skill.

**Board conventions:** Lists `Backlog → To Do → In Progress → In Review → Done`. Labels-only (Custom Fields are paid): type labels (`feature`/`chore`/`design`/`docs`/`infra`) + priority labels (`P0`–`P3`); estimate & component live in the description.

**How to use:** for each card, copy the fenced block into the Trello card composer (first line = card title, rest = description), then apply the `📋 Card setup` line manually (labels/list).

**Batches:** create cards batch by batch, implement each batch, then move to the next.

| Batch | Scope | Tasks | Cards | List |
|---|---|---|---|---|
| 1 | Setup (deps + tooling) | T001–T005 | 5 | To Do |
| 2 | Foundation — design system | T006–T012 | 7 | To Do |
| 3 | Foundation — lib & shell | T013–T023 | 11 | To Do |
| 4 | US1 — Live Rig Supervision (MVP) | T024–T031 | 8 | To Do |
| 5 | US2 — Profitability & Market | T032–T038 | 7 | Backlog |
| 6 | US3 — Impact Alerts | T039–T045 | 7 | Backlog |
| 7 | US4 — Switch Suggestions | T046–T049 | 4 | Backlog |
| 8 | US5 — News Sentiment | T050–T053 | 4 | Backlog |
| 9 | US6 — Adaptive UX | T054–T057 | 4 | Backlog |
| 10 | Polish & quality gates | T058–T063 | 6 | Backlog |

---

## Phase 1 — Setup (List: To Do)

```markdown
T001 Install core runtime dependencies

## Goal
Install the runtime libraries the app needs so the foundation and user stories can be built on the constitution-approved stack.

## Context
`tasks.md` Phase 1 · `plan.md` §Dependencies · constitution stack (React 19 + Vite + TS, Tailwind, Zustand, React Query, i18next, recharts, etc.)

## Acceptance Criteria
- `react-router-dom`, `@tanstack/react-query`, `axios`, `zustand`, `tailwindcss`, `@headlessui/react`, `react-hook-form`, `zod`, `lucide-react`, `recharts`, `i18next`, `react-i18next` are in `dependencies`
- Versions are compatible with React 19 + Vite (no peer-dep warnings)

## Technical Notes
- Use the repo's package manager (npm, per `package-lock.json`)

## Steps
1. `npm install <all runtime deps>`
2. Commit the updated `package.json` + lockfile

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 1h · Component: Frontend

```markdown
T002 Install dev tooling (Vitest, Testing Library, MSW)

## Goal
Install test tooling so every user story can be written test-first as required by the workflow.

## Context
`tasks.md` Phase 1 (T002, parallel) · `plan.md` §Testing

## Acceptance Criteria
- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, `jsdom` are in `devDependencies`

## Technical Notes
- Parallel task — no dependency on T001 beyond npm itself

## Steps
1. `npm install -D <dev deps>`

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 1h · Component: Frontend

```markdown
T003 Configure Tailwind and design tokens

## Goal
Wire up Tailwind (v4 style) with PostCSS and a CSS entry that exposes the GitHub-dark design tokens for the app.

## Context
`tasks.md` Phase 1 · `plan.md` §Architecture · spec FR-016/FR-017 (colors from design: #3fb950, #f85149, #e3b341, #f0883e, #58a6ff)

## Acceptance Criteria
- `tailwind.config`/CSS entry present with design tokens
- `npm run dev` compiles with Tailwind classes

## Technical Notes
- Parallel with T004

## Steps
1. Add Tailwind + PostCSS config
2. Import Tailwind in `src/index.css`

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 2h · Component: Frontend

```markdown
T004 Configure Vitest test runner

## Goal
Set up Vitest with jsdom so unit and component tests can run for every story.

## Context
`tasks.md` Phase 1 · `plan.md` §Testing · spec SC-002/SC-008 (60fps, 1s latency) need automated verification

## Acceptance Criteria
- `vitest.config.ts` and `src/test/setup.ts` exist
- `npm test` script added to `package.json` and runs green

## Technical Notes
- Parallel with T003

## Steps
1. Create `vitest.config.ts` (jsdom env, setup file)
2. Add `test` script

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 1h · Component: Frontend

```markdown
T005 Verify lint and type-check with new tooling

## Goal
Confirm the new tooling does not break the constitution gates before any feature work starts.

## Context
`tasks.md` Phase 1 · constitution gates: `npm run lint` + `npm run type-check` green; named exports only; no `as` casts

## Acceptance Criteria
- `npm run lint` passes
- `npm run type-check` passes

## Steps
1. Run both commands and fix any findings

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 0.5h · Component: Frontend

---

## Phase 2 — Foundation (List: To Do · BLOCKS all user stories)

```markdown
T006 Define theme tokens as CSS variables

## Goal
Define the GitHub-dark palette as CSS variables so the adaptive alert palette swap can re-theme the whole app globally.

## Context
`tasks.md` Phase 2 · `plan.md` §Architecture · spec FR-016 + design colors (green #3fb950, red #f85149, yellow #e3b341, orange #f0883e, blue #58a6ff; bg/foreground/border/card/muted)

## Acceptance Criteria
- Tokens live in `src/index.css` as CSS variables
- Switching the variable set (calm ↔ alert) re-themes globally (used by US6)

## Technical Notes
- No user story work may start until this phase is complete (critical path)

## Steps
1. Add `:root` token set (calm)
2. Prepare the alert token set for T056

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: design, P1 · Estimate: 2h · Component: Frontend

```markdown
T007 Build Card UI primitive

## Goal
Create the reusable Card component used by rig cards and panels.

## Context
`tasks.md` Phase 2 · `plan.md` §Components · design: `rounded-md border bg-card` cards with hover border

## Acceptance Criteria
- `src/components/ui/Card.tsx` exists with named export
- Used by RigCard and panels without layout regressions

## Technical Notes
- Parallel with T008–T012
- Named exports only (constitution)

## Steps
1. Implement Card with border/rounded/bg variants

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T008 Build Badge UI primitive

## Goal
Create the Badge primitive for status/impact/type badges (ONLINE, HIGH, GPU, etc.).

## Context
`tasks.md` Phase 2 · design: uppercase mono badges with colored borders (blue ONLINE, red OFFLINE)

## Acceptance Criteria
- `src/components/ui/Badge.tsx` with status/impact/type variants
- Colors match design (#58a6ff border/text for ONLINE, #f85149 for OFFLINE)

## Technical Notes
- Parallel with T007, T009–T012

## Steps
1. Implement Badge variants

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T009 Build Button UI primitive

## Goal
Create the Button primitive used across the app (incl. icon-only buttons).

## Context
`tasks.md` Phase 2 · design: icon buttons (power on/off, kWh edit) with hover transitions

## Acceptance Criteria
- `src/components/ui/Button.tsx` with variants incl. icon-only
- Accessible (aria-labels usable, T063)

## Technical Notes
- Parallel with T007–T012

## Steps
1. Implement Button variants

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T010 Build ProgressBar UI primitive

## Goal
Create the temperature severity bar shown in each rig card.

## Context
`tasks.md` Phase 2 · design: `h-1 rounded-full` bar colored by temp (green/orange/red)

## Acceptance Criteria
- `src/components/ui/ProgressBar.tsx` renders a colored fill bar
- Fill width maps to the value (e.g. 75.6°C → ~75.6%)

## Technical Notes
- Parallel with T007–T012

## Steps
1. Implement ProgressBar with color thresholds

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T011 Build Sparkline UI primitive

## Goal
Create the memoized recharts mini line chart used by the market panel (30s updates).

## Context
`tasks.md` Phase 2 · `plan.md` §Components · 60fps requirement (SC-002) — must not leak listeners/animations

## Acceptance Criteria
- `src/components/ui/Sparkline.tsx` renders a mini recharts line chart
- Memoized with proper cleanup (no leaks over a 30-min session, SC-008)

## Technical Notes
- Parallel with T007–T012; performance-critical

## Steps
1. Implement Sparkline with recharts
2. Verify unmount cleanup

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T012 Build Tabs UI primitive

## Goal
Create the Tabs primitive for the side panel (Alertas / Sugestões / Notícias).

## Context
`tasks.md` Phase 2 · design: side panel tabs with count badges (15 / 3 / 5)

## Acceptance Criteria
- `src/components/ui/Tabs.tsx` supports tab switching
- Works with count badges (US3–US5)

## Technical Notes
- Parallel with T007–T011

## Steps
1. Implement Tabs

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T013 Configure axios instance

## Goal
Set up the shared axios instance (base URL from env, interceptors) for all REST calls.

## Context
`tasks.md` Phase 2 · `plan.md` §Data layer · `data-model.md` REST endpoints (`/api/rigs`, `/api/alerts`, `/api/news`, `/api/suggestions`, `/api/market/prices`, `/api/rigs/{id}/telemetry`)

## Acceptance Criteria
- `src/lib/axios.ts` exports a configured instance
- Base URL read from env; error handling interceptor present

## Technical Notes
- Parallel with T014–T022

## Steps
1. Implement axios instance + interceptors

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: infra, P1 · Estimate: 1h · Component: Frontend

```markdown
T014 Configure React Query client

## Goal
Set up the React Query client (staleTime, error handling) for REST data fetching.

## Context
`tasks.md` Phase 2 · `plan.md` §State (Zustand for realtime + React Query for REST)

## Acceptance Criteria
- `src/lib/queryClient.ts` exports a configured client
- Default staleTime and error handling set

## Technical Notes
- Parallel with T013, T015–T022

## Steps
1. Implement queryClient

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: infra, P1 · Estimate: 1h · Component: Frontend

```markdown
T015 Scaffold i18n (EN + pt-BR)

## Goal
Set up i18next with English (default) and Brazilian Portuguese locale files covering spec Appendix A copy.

## Context
`tasks.md` Phase 2 · spec FR-016 (i18n, EN default + pt-BR, extensible) · spec Appendix A copy pairs ("Supervisão de Rigs", "Nenhum alerta", "Clique para editar kWh", "Telemetria a cada 10s · Preços a cada 30s")

## Acceptance Criteria
- `src/lib/i18n.ts` + `src/locales/en.json` + `src/locales/pt-BR.json` exist
- EN is the default; switching works (T021/T059)
- Structure allows adding future languages

## Technical Notes
- Parallel with T013–T022
- All user-visible strings must be keyed (T059)

## Steps
1. Install/configure i18next + react-i18next
2. Add Appendix A keys for both locales

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T016 Create RealtimeClient abstraction

## Goal
Build the SSE + WebSocket transport abstraction with unified subscribe, auto-reconnect with backoff, and snapshot resync.

## Context
`tasks.md` Phase 2 · `plan.md` §Realtime (SSE-first per constitution) · `data-model.md` wire formats · spec RN06/RN07 (alert channels/cooldown)

## Acceptance Criteria
- `src/lib/realtime/RealtimeClient.ts` with `subscribe(topic, cb)` over SSE + WS
- Auto-reconnect with exponential backoff and snapshot resync on reconnect
- No leaked listeners over 30-min session (SC-008)

## Technical Notes
- Parallel with T017
- Both transports share one interface

## Steps
1. Implement SSE transport
2. Implement WS transport
3. Add reconnect/backoff + resync

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: infra, P1 · Estimate: 4h · Component: Frontend

```markdown
T017 Create MockRealtimeClient

## Goal
Build a mock streaming client (same interface) so all stories are demoable before the backend contract lands.

## Context
`tasks.md` Phase 2 · `plan.md` §Mock-first streaming · spec assumptions (mock fallback, same wire format) · RN01–RN03 status transitions

## Acceptance Criteria
- `src/lib/realtime/mockRealtimeClient.ts` implements the same interface
- Emits telemetry every 10s, prices every 30s, simulated alerts/suggestions/news
- Honors RN01–RN03 (throttling at 85°C, shutdown at 95°C)
- Selected via `VITE_REALTIME_MODE`

## Technical Notes
- Parallel with T016

## Steps
1. Implement mock client + event generators
2. Wire env-based selection

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: infra, P1 · Estimate: 4h · Component: Frontend

```markdown
T018 Mirror contract types from data-model

## Goal
Create the TypeScript types for all entities and events from the data model.

## Context
`tasks.md` Phase 2 · `data-model.md` (Rig, Telemetry, Coin, Profitability, Alert, SwitchSuggestion, NewsItem + SSE/WS events) · hashflow-infra OpenAPI generates server-side types

## Acceptance Criteria
- `src/types/api.ts` + `src/types/events.ts` match `data-model.md`
- No `as` casts used (constitution)

## Technical Notes
- Parallel with T013–T022

## Steps
1. Port entity types
2. Port event/wire types

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 2h · Component: Frontend

```markdown
T019 Build shared formatters

## Goal
Create number/unit formatters matching the design's exact formatting (FR-017).

## Context
`tasks.md` Phase 2 · spec FR-017: hashrate (MH/s, GH/s, TH/s), currency (`$62,661`, `+$14.237`), temperature, power, relative time ("1m atrás")

## Acceptance Criteria
- `src/utils/format.ts` exports hashrate, currency, temperature, power, relative-time formatters
- Output matches design examples exactly

## Technical Notes
- Parallel with T013–T022; used by US1/US2

## Steps
1. Implement formatters
2. Add locale-aware relative time

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 2h · Component: Frontend

```markdown
T020 Build impact helpers

## Goal
Create helpers mapping impact levels to colors/channels/cooldown display (RN06/RN07).

## Context
`tasks.md` Phase 2 · spec RN06 (impact channels: palette shift + spotlight), RN07 (15-min cooldown)

## Acceptance Criteria
- `src/utils/impact.ts` maps impact → color, channels, cooldown window text
- Used by US3 (alerts) and US6 (adaptive UX)

## Technical Notes
- Parallel with T013–T022

## Steps
1. Implement impact helpers

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T021 Build settings store (kWh + language)

## Goal
Create the persisted settings store for kWh price and language, wired to i18n.

## Context
`tasks.md` Phase 2 · `plan.md` §State · spec FR-016 (language switch) + kWh editor (US2)

## Acceptance Criteria
- `uiStore` (or shared store) holds kWh price + language, persisted to `localStorage`
- Language switch updates i18n immediately

## Technical Notes
- Parallel with T013–T022

## Steps
1. Implement store + persistence
2. Wire language switch to i18n

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T022 Create routes and main layout shell

## Goal
Set up routing and the main layout shell (header + main + side panel) matching the design's h-screen flex column.

## Context
`tasks.md` Phase 2 · design: `flex flex-col h-screen overflow-hidden` shell · `plan.md` §Layout

## Acceptance Criteria
- `src/routes/index.tsx` (single dashboard route) + `src/layouts/MainLayout.tsx`
- Layout matches design structure (header, scrollable main, side panel)

## Technical Notes
- Parallel with T013–T022

## Steps
1. Add react-router route
2. Build MainLayout shell

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T023 Build header component

## Goal
Build the header: logo, Live indicator, rigs count, profit/day, switch count, coin prices, kWh editor trigger, language switch.

## Context
`tasks.md` Phase 2 · design: hashflow logo (blue), pulsing Live dot, "Rigs: 5/6", "+$14.237", "3 sugestões de troca", BTC/ETC/RVN prices, kWh button, language switch (new, not in design)

## Acceptance Criteria
- `src/features/dashboard/components/Header.tsx` renders all design elements
- Counts/profit/prices stream from stores (US1/US2 wiring, T030)
- kWh editor trigger + language switch present

## Technical Notes
- Parallel with T013–T022; language switch is an addition to the design (flagged in plan)

## Steps
1. Implement header layout
2. Add kWh + language controls

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 3h · Component: Frontend

---

## Phase 3 — US1 Live Rig Supervision (List: To Do · MVP)

```markdown
T024 Unit test the telemetry store

## Goal
Verify selector updates, rAF batching, and bounded buffer behavior of the telemetry store (test-first).

## Context
`tasks.md` Phase 3 · spec US1 + SC-002 (60fps) · `plan.md` §State

## Acceptance Criteria
- `tests/unit/telemetryStore.test.ts` covers selector updates, rAF batching, bounded buffer
- Test fails before implementation (T026), passes after

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 3h · Component: Frontend

```markdown
T025 Component test RigCard

## Goal
Test that RigCard renders values, colors, and status transitions (test-first).

## Context
`tasks.md` Phase 3 · design: status dot + badge, 2×2 metrics grid, temp severity bar

## Acceptance Criteria
- `tests/component/RigCard.test.tsx` covers values, colors, status transitions (ONLINE/THROTTLING/OFFLINE)
- Fails before implementation (T028)

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: chore, P1 · Estimate: 2h · Component: Frontend

```markdown
T026 Implement the telemetry store

## Goal
Create the selector-scoped per-rig telemetry store with rAF batching and a bounded buffer.

## Context
`tasks.md` Phase 3 · `plan.md` §State · spec SC-002 (60fps @ 20+ rigs) — selector-scoped re-renders

## Acceptance Criteria
- `src/features/dashboard/stores/telemetryStore.ts` with per-rig slices, selector-scoped
- Updates batched via rAF; buffer bounded; T024 passes

## Technical Notes
- [P] parallel; store → hook → component order

## Steps
1. Implement store

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 4h · Component: Frontend

```markdown
T027 Implement useTelemetry hook

## Goal
Expose rig telemetry slices to components via a hook subscribing through RealtimeClient.

## Context
`tasks.md` Phase 3 · `plan.md` §State/Hooks

## Acceptance Criteria
- `useTelemetry` in `src/features/dashboard/hooks/useTelemetry.ts` subscribes per-rig slices
- Unsubscribes on unmount (no leaks, SC-008)

## Technical Notes
- [P] parallel

## Steps
1. Implement hook

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T028 Implement RigCard component

## Goal
Build the rig card: status dot + badge, type badge, power action, 2×2 metrics, temperature severity bar, uptime, model.

## Context
`tasks.md` Phase 3 · design: exact card anatomy (Hashrate, Temperatura w/ bar, Consumo + $/day, Lucro/dia + coin); offline dimmed + 0 hashrate + standby power

## Acceptance Criteria
- `src/features/dashboard/components/RigCard.tsx` renders per design
- Status colors correct; offline cards show 0.0 hashrate and dimmed
- T025 passes

## Technical Notes
- Power action uses Button primitive (T009)

## Steps
1. Implement RigCard

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 4h · Component: Frontend

```markdown
T029 Implement RigGrid

## Goal
Build the responsive rig grid with offline cards dimmed.

## Context
`tasks.md` Phase 3 · design: `repeat(auto-fill, minmax(280px, 1fr))` grid

## Acceptance Criteria
- `src/features/dashboard/components/RigGrid.tsx` responsive grid
- Offline cards dimmed (`opacity-60`)

## Technical Notes
- Sequential (depends on T028)

## Steps
1. Implement RigGrid

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 2h · Component: Frontend

```markdown
T030 Wire header counts from telemetry store

## Goal
Show live rig counts and total profit/day in the header from the telemetry store.

## Context
`tasks.md` Phase 3 · design: "Rigs: 5/6", "+$14.237" · RN04 consistency (header totals match table, US2)

## Acceptance Criteria
- Header shows online/total rigs and total profit/day, updated live
- No refresh button anywhere (spec requirement)

## Steps
1. Connect header to telemetry store

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 1h · Component: Frontend

```markdown
T031 REST rigs fetch + MSW handlers

## Goal
Add the REST rigs fetch via dashboardApi + React Query with MSW handlers for tests.

## Context
`tasks.md` Phase 3 · `data-model.md` `/api/rigs` · `plan.md` §Data layer

## Acceptance Criteria
- `dashboardApi.ts` + React Query hook for `/api/rigs`
- MSW handlers cover `/api/rigs`

## Steps
1. Implement API layer
2. Add MSW handlers

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: To Do · Labels: feature, P1 · Estimate: 3h · Component: Frontend

---

## Phase 4 — US2 Profitability & Market (List: Backlog)

```markdown
T032 Unit test formatters and RN04 math

## Goal
Verify formatting and the profitability formula within ±$0.01 tolerance (SC-004), test-first.

## Context
`tasks.md` Phase 4 · spec RN04 (revenue − energy cost) + SC-004 (±$0.01) + FR-017 formatting

## Acceptance Criteria
- `tests/unit/profitability.test.ts` covers formatters + RN04 math with tolerance
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P2 · Estimate: 3h · Component: Frontend

```markdown
T033 Component test KwhEditor

## Goal
Test kWh editing: valid input updates, invalid input handled (test-first).

## Context
`tasks.md` Phase 4 · spec RN04 (kWh editor) · design: "Clique para editar kWh"

## Acceptance Criteria
- `tests/component/KwhEditor.test.tsx` covers valid + invalid input
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P2 · Estimate: 2h · Component: Frontend

```markdown
T034 Implement ProfitabilityTable

## Goal
Build the RN04 profitability table (Rig | Moeda | Faturamento | Custo Energia | Lucro Líquido) with green/red values.

## Context
`tasks.md` Phase 4 · design: table with mono values, red energy cost, green/red net profit

## Acceptance Criteria
- `src/features/dashboard/components/ProfitabilityTable.tsx` matches design columns/colors
- Recomputed when kWh changes (T035)

## Technical Notes
- [P] parallel

## Steps
1. Implement table

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T035 Implement KwhEditor

## Goal
Build the inline kWh editor (react-hook-form + zod) that persists to settings and recomputes profitability.

## Context
`tasks.md` Phase 4 · spec RN04 + FR-017 · design: header "$0.08/kWh" trigger

## Acceptance Criteria
- `src/features/dashboard/components/KwhEditor.tsx` inline edit, validation (zod), persistence
- Invalid input rejected/clamped (T060); T033 passes

## Technical Notes
- [P] parallel

## Steps
1. Implement editor with react-hook-form + zod

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T036 Implement market store and useMarketPrices hook

## Goal
Create the market store (prices + ring-buffer history) and its hook, updated every 30s.

## Context
`tasks.md` Phase 4 · `plan.md` §State · spec: prices every 30s

## Acceptance Criteria
- `marketStore.ts` holds prices + ring-buffer history; `useMarketPrices` hook exists
- 30s updates from RealtimeClient

## Technical Notes
- [P] parallel

## Steps
1. Implement store + hook

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T037 Implement MarketPanel

## Goal
Build the market panel: coin price + sparkline per ticker, updating every 30s.

## Context
`tasks.md` Phase 4 · design: BTC/ETC/RVN prices with sparklines · Sparkline primitive T011

## Acceptance Criteria
- `src/features/dashboard/components/MarketPanel.tsx` renders coins with sparklines
- Updates every 30s without leaks

## Steps
1. Implement panel with Sparkline

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T038 Profitability API fetch + MSW handlers

## Goal
Add REST fetches for market prices and telemetry snapshots with MSW handlers.

## Context
`tasks.md` Phase 4 · `data-model.md` `/api/market/prices`, `/api/rigs/{id}/telemetry`

## Acceptance Criteria
- dashboardApi + React Query for both endpoints
- MSW handlers present

## Steps
1. Implement API + MSW

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 2h · Component: Frontend

---

## Phase 5 — US3 Impact Alerts Feed (List: Backlog)

```markdown
T039 Unit test alerts store

## Goal
Test ordering, dedupe during cooldown (RN07), and count in the alerts store (test-first).

## Context
`tasks.md` Phase 5 · spec RN06/RN07 (impact channels, 15-min cooldown)

## Acceptance Criteria
- `tests/unit/alertsStore.test.ts` covers ordering, dedupe, count
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P2 · Estimate: 3h · Component: Frontend

```markdown
T040 Component test AlertsFeed

## Goal
Test badges, timestamps, and the empty state of the alerts feed (test-first).

## Context
`tasks.md` Phase 5 · design: LOW/MEDIUM/HIGH badges, relative times, "Nenhum alerta"/"No alerts"

## Acceptance Criteria
- `tests/component/AlertsFeed.test.tsx` covers badges, timestamps, empty state
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P2 · Estimate: 2h · Component: Frontend

```markdown
T041 Implement alerts store

## Goal
Create the alerts store: append live alerts, dedupe per cooldown window, expose count and latest HIGH.

## Context
`tasks.md` Phase 5 · spec RN07 (no duplicate email-level alerts within cooldown)

## Acceptance Criteria
- `alertsStore.ts` appends live, dedupes per cooldown, exposes count + latest HIGH
- T039 passes

## Technical Notes
- [P] parallel

## Steps
1. Implement store

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T042 Implement useAlerts hook

## Goal
Expose the alerts feed to components via a hook.

## Context
`tasks.md` Phase 5

## Acceptance Criteria
- `useAlerts` in `src/features/dashboard/hooks/useAlerts.ts`

## Technical Notes
- [P] parallel

## Steps
1. Implement hook

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 1h · Component: Frontend

```markdown
T043 Implement AlertsFeed

## Goal
Build the alerts feed with severity-colored icons, impact badges, relative times, and locale-aware empty state.

## Context
`tasks.md` Phase 5 · design: triangle-alert icons colored by severity, LOW/MEDIUM/HIGH, "2h atrás" · i18n (T015)

## Acceptance Criteria
- `src/features/dashboard/components/AlertsFeed.tsx` per design
- Empty state localized ("Nenhum alerta"/"No alerts"); T040 passes

## Steps
1. Implement feed

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 3h · Component: Frontend

```markdown
T044 Add alerts tab with count badge

## Goal
Add the Alertas tab with live count badge to the side panel.

## Context
`tasks.md` Phase 5 · design: tabs with counts (Alertas 15)

## Acceptance Criteria
- SidePanel shows Alertas tab with count from alertsStore

## Steps
1. Wire tab + badge

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 2h · Component: Frontend

```markdown
T045 Alerts REST + WS + MSW handlers

## Goal
Fetch alert history from REST and subscribe to live `alert` events, with MSW handlers.

## Context
`tasks.md` Phase 5 · `data-model.md` `/api/alerts` + WS `alert` event

## Acceptance Criteria
- `/api/alerts` history fetch + WS subscription wired
- MSW handlers present

## Steps
1. Implement REST + WS wiring
2. Add MSW handlers

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P2 · Estimate: 2h · Component: Frontend

---

## Phase 6 — US4 Profit Switch Suggestions (List: Backlog)

```markdown
T046 Unit test suggestions store + threshold

## Goal
Test threshold filtering (≥10%) and GPU-only enforcement in the suggestions store (test-first).

## Context
`tasks.md` Phase 6 · spec RN08–RN10 (≥10% better alternative coin, GPU-only, ASICs excluded)

## Acceptance Criteria
- `tests/unit/suggestionsStore.test.ts` covers threshold + GPU-only rules
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T047 Implement suggestions store

## Goal
Create the suggestions store: from/to coin, profits, improvement percentage, GPU-only enforcement.

## Context
`tasks.md` Phase 6 · spec RN08–RN10 · design: from/to coins with profit deltas

## Acceptance Criteria
- `suggestionsStore.ts` with from/to coin, profits, improvementPct; GPU-only (no ASICs)
- T046 passes

## Technical Notes
- [P] parallel

## Steps
1. Implement store

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 3h · Component: Frontend

```markdown
T048 Implement useSuggestions hook and SuggestionsFeed

## Goal
Expose suggestions via a hook and render the feed with from/to coins and profits.

## Context
`tasks.md` Phase 6 · design: switch rows with coins and profit deltas

## Acceptance Criteria
- `useSuggestions` hook + `SuggestionsFeed.tsx` component
- Renders from/to coins and profits; below-threshold absent

## Technical Notes
- [P] parallel

## Steps
1. Implement hook + component

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 3h · Component: Frontend

```markdown
T049 Sugestões tab + REST/WS wiring

## Goal
Add the Sugestões tab with count badge and wire live suggestions via WS and REST, with MSW handlers.

## Context
`tasks.md` Phase 6 · design: tabs (Sugestões 3) · `data-model.md` `/api/suggestions` + WS `suggestion`/`suggestion.removed`

## Acceptance Criteria
- Tab + count in SidePanel; WS + REST wiring
- MSW handlers present

## Steps
1. Wire tab, WS, REST, MSW

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 2h · Component: Frontend

---

## Phase 7 — US5 News Feed with Sentiment (List: Backlog)

```markdown
T050 Component test NewsFeed

## Goal
Test sentiment badge colors and source/title rendering (test-first).

## Context
`tasks.md` Phase 7 · spec RN11/RN12 (relevance + sentiment) · design: POSITIVE green / NEGATIVE red / NEUTRAL gray

## Acceptance Criteria
- `tests/component/NewsFeed.test.tsx` covers sentiment colors, source/title
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T051 Implement news store and useNews hook

## Goal
Create the news store and hook for sentiment-tagged news items.

## Context
`tasks.md` Phase 7 · spec RN11/RN12 · `data-model.md` NewsItem (title, source, sentiment)

## Acceptance Criteria
- `newsStore.ts` + `useNews` hook
- [P] parallel

## Technical Notes
- [P] parallel within phase

## Steps
1. Implement store + hook

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 2h · Component: Frontend

```markdown
T052 Implement NewsFeed and Notícias tab

## Goal
Build the news feed (title, source, sentiment badge) and add the Notícias tab with count.

## Context
`tasks.md` Phase 7 · design: news rows with sentiment badges (green/red/gray)

## Acceptance Criteria
- `NewsFeed.tsx` renders title, source, sentiment badge with correct colors
- Notícias tab with count in SidePanel; T050 passes

## Steps
1. Implement feed + tab

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 3h · Component: Frontend

```markdown
T053 News REST + WS + MSW handlers

## Goal
Fetch news from REST and subscribe to live `news` events, with MSW handlers.

## Context
`tasks.md` Phase 7 · `data-model.md` `/api/news` + WS `news` event

## Acceptance Criteria
- `/api/news` fetch + WS subscription wired
- MSW handlers present

## Steps
1. Implement REST + WS wiring
2. Add MSW handlers

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 2h · Component: Frontend

---

## Phase 8 — US6 Adaptive Alert UX (List: Backlog)

```markdown
T054 Unit test uiStore theme state machine

## Goal
Test `highImpactActive` transitions in the uiStore theme state machine (test-first).

## Context
`tasks.md` Phase 8 · spec RN06 (palette shift + spotlight on HIGH-impact) · `plan.md` §Adaptive UX

## Acceptance Criteria
- `tests/unit/uiStore.test.ts` covers highImpactActive transitions
- Fails before implementation

## Technical Notes
- [P] parallel within phase

## Steps
1. Write the failing test

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T055 Extend uiStore with highImpactActive

## Goal
Derive `highImpactActive` in uiStore from the latest HIGH alert within the active window.

## Context
`tasks.md` Phase 8 · spec RN06/RN07 · depends on alertsStore (US3)

## Acceptance Criteria
- `highImpactActive` derived from latest HIGH alert state
- T054 passes

## Technical Notes
- [P] parallel

## Steps
1. Extend uiStore

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 2h · Component: Frontend

```markdown
T056 Theme token swap on HIGH impact

## Goal
Switch CSS variables between calm and alert red/amber palettes when a HIGH-impact event is active.

## Context
`tasks.md` Phase 8 · spec RN06 · tokens from T006 · wiring in MainLayout

## Acceptance Criteria
- Palette shifts on `highImpactActive`, restores on clear

## Steps
1. Wire token swap in MainLayout + index.css

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 3h · Component: Frontend

```markdown
T057 Rig spotlight on HIGH alerts

## Goal
Highlight the affected rig card with an alert ring and reorder it to the top of the grid on HIGH; restore on clear.

## Context
`tasks.md` Phase 8 · spec RN06 · targets rig cards from US1

## Acceptance Criteria
- Affected rig gets alert ring + reorders to top on HIGH (animated)
- Restores on clear

## Steps
1. Implement spotlight in RigGrid/RigCard

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: feature, P3 · Estimate: 3h · Component: Frontend

---

## Phase 9 — Polish & Cross-Cutting (List: Backlog)

```markdown
T058 60fps streaming audit

## Goal
Verify selector-scoped re-renders, chart cleanup, and no leaked listeners/intervals over a 30-min streaming session.

## Context
`tasks.md` Phase 9 · spec SC-002/SC-008 (60fps @ 20+ rigs, 30-min stability)

## Acceptance Criteria
- Profiling shows no re-render storms; charts/listeners cleaned up
- 30-min MockRealtimeClient session runs without leaks

## Technical Notes
- [P] parallel

## Steps
1. Audit + fix findings

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 4h · Component: Frontend

```markdown
T059 i18n coverage check

## Goal
Verify every user-visible string is keyed in en.json + pt-BR.json and the language switch works and persists.

## Context
`tasks.md` Phase 9 · spec FR-016 + Appendix A copy pairs

## Acceptance Criteria
- No hardcoded user-visible strings; both locales complete
- Switch works and persists (T021)

## Technical Notes
- [P] parallel

## Steps
1. Audit strings + fix gaps

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T060 Number formatting audit

## Goal
Audit number formatting across locales (FR-017): no raw NaN/Infinity; invalid kWh input rejected/clamped.

## Context
`tasks.md` Phase 9 · spec FR-017 + RN04

## Acceptance Criteria
- All formatted values clean in both locales; invalid kWh handled (T035)

## Technical Notes
- [P] parallel

## Steps
1. Audit + fix

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T061 Run full quality gates

## Goal
Run the complete lint, type-check, and test suite and fix all findings.

## Context
`tasks.md` Phase 9 · constitution gates (lint + type-check green, named exports, no casts)

## Acceptance Criteria
- `npm run lint`, `npm run type-check`, `npm test` all pass

## Steps
1. Run all three and fix findings

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 2h · Component: Frontend

```markdown
T062 Update README with run instructions

## Goal
Document how to run the app in mock vs real mode and how to run tests.

## Context
`tasks.md` Phase 9 · README currently minimal (starter template)

## Acceptance Criteria
- README covers `VITE_REALTIME_MODE` mock/real, dev server, and test commands

## Steps
1. Update README

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: docs, P3 · Estimate: 1h · Component: Frontend

```markdown
T063 Accessibility pass

## Goal
Add focus states, aria labels on icon buttons (power, kWh editor), and keyboard tab navigation.

## Context
`tasks.md` Phase 9 · design uses icon-only buttons (needs aria-labels)

## Acceptance Criteria
- Focus states visible; icon buttons have aria-labels
- Tabs navigable by keyboard

## Technical Notes
- [P] parallel

## Steps
1. Audit + fix a11y issues

## Definition of Done
- Code reviewed
- Tests passing
- Merged/deployed
```

📋 Card setup — List: Backlog · Labels: chore, P3 · Estimate: 3h · Component: Frontend
