# Tasks: Real-Time Mining Monitoring Dashboard

**Input**: Design documents from `/specs/001-real-time-dashboard/` (spec.md, plan.md, data-model.md)

**Prerequisites**: plan.md (required), spec.md (required), data-model.md (required)

**Organization**: Tasks are grouped by user story (US1–US6) so each story can be implemented, tested, and demoed independently. [P] = can run in parallel (different files).

**Constitution gates on every PR/step**: `npm run lint` + `npm run type-check` green; named exports only; no `as` casts.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies and tooling

- [ ] T001 Install app dependencies: `react-router-dom`, `@tanstack/react-query`, `axios`, `zustand`, `tailwindcss`, `@headlessui/react`, `react-hook-form`, `zod`, `lucide-react`, `recharts`, `i18next`, `react-i18next`
- [ ] T002 [P] Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, `jsdom`
- [ ] T003 [P] Configure Tailwind (v4 style) + PostCSS; add `tailwind.config`/CSS entry with design tokens
- [ ] T004 [P] Configure Vitest (`vitest.config.ts`, `src/test/setup.ts`) and add `test` script to `package.json`
- [ ] T005 Verify `npm run lint` and `npm run type-check` pass with the new tooling

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story starts

**⚠️ CRITICAL**: No user story work begins until this phase is complete

### Design system & theme

- [ ] T006 Define theme tokens as CSS variables in `src/index.css`: GitHub-dark palette (green `#3fb950`, red `#f85149`, yellow `#e3b341`, orange `#f0883e`, blue `#58a6ff`, bg/foreground/border/card/muted) so the adaptive palette swap can re-theme globally (plan §Architecture)
- [ ] T007 [P] `Card` primitive in `src/components/ui/Card.tsx`
- [ ] T008 [P] `Badge` primitive (status/impact/type variants) in `src/components/ui/Badge.tsx`
- [ ] T009 [P] `Button` primitive in `src/components/ui/Button.tsx`
- [ ] T010 [P] `ProgressBar` primitive (temperature severity bar) in `src/components/ui/ProgressBar.tsx`
- [ ] T011 [P] `Sparkline` primitive (recharts mini line chart, memoized + cleanup) in `src/components/ui/Sparkline.tsx`
- [ ] T012 [P] `Tabs` primitive in `src/components/ui/Tabs.tsx`

### Lib & infra

- [ ] T013 Configure axios instance in `src/lib/axios.ts` (base URL from env, interceptors)
- [ ] T014 Configure React Query client in `src/lib/queryClient.ts` (staleTime, error handling)
- [ ] T015 Scaffold i18n in `src/lib/i18n.ts` + `src/locales/en.json` + `src/locales/pt-BR.json` (keys from spec Appendix A; EN default)
- [ ] T016 Create `RealtimeClient` abstraction in `src/lib/realtime/RealtimeClient.ts`: SSE + WebSocket transports, unified `subscribe(topic, cb)`, auto-reconnect with exponential backoff, snapshot resync on reconnect
- [ ] T017 Create `MockRealtimeClient` in `src/lib/realtime/mockRealtimeClient.ts` (same interface; emits telemetry every 10s, prices every 30s, simulated alert/suggestion/news events; honors RN01–RN03 status transitions) and wire selection via `VITE_REALTIME_MODE`
- [ ] T018 Mirror contract types in `src/types/api.ts` and `src/types/events.ts` from data-model.md
- [ ] T019 Shared formatters in `src/utils/format.ts`: hashrate units (MH/s, GH/s, TH/s), currency (`$62,661`, `+$14.237`), temperature, power, relative time ("1m atrás"), per spec FR-017
- [ ] T020 Impact helpers in `src/utils/impact.ts`: impact → color, channels (RN06), cooldown window display (RN07)
- [ ] T021 Settings store in `src/features/dashboard/stores/uiStore.ts` (or shared `src/stores/`): kWh price + language, persisted to `localStorage`, with the language switch wired to i18n
- [ ] T022 Routes in `src/routes/index.tsx` (single dashboard route via `react-router-dom`) and `src/layouts/MainLayout.tsx` shell: header + main area + side panel, matching the design layout (h-screen flex column)
- [ ] T023 Header component in `src/features/dashboard/components/Header.tsx`: logo, Live indicator, Rigs count (online/total), profit/day, switch-count, coin prices, kWh editor trigger, language switch

**Checkpoint**: Foundation ready — `npm run dev` shows the design shell; lint + type-check green. User stories can now proceed in parallel if staffed.

---

## Phase 3: User Story 1 — Live Rig Supervision (Priority: P1) 🎯 MVP

**Goal**: Rig cards stream live telemetry with correct status/color semantics; header shows rig counts and total profit/day. No refresh button anywhere.

**Independent Test**: With `MockRealtimeClient`, rig cards appear with correct values and update on each 10s tick; forcing THROTTLING (85°C) and OFFLINE (95°C) states updates cards immediately.

### Tests for User Story 1

- [ ] T024 [P] [US1] Unit test telemetry store (selector updates, rAF batching, bounded buffer) in `tests/unit/telemetryStore.test.ts`
- [ ] T025 [P] [US1] Component test RigCard renders values, colors, and status transitions in `tests/component/RigCard.test.tsx`

### Implementation for User Story 1

- [ ] T026 [P] [US1] Telemetry store in `src/features/dashboard/stores/telemetryStore.ts` (per-rig slices, selector-scoped)
- [ ] T027 [P] [US1] `useTelemetry` hook in `src/features/dashboard/hooks/useTelemetry.ts` (subscribes rig slices via RealtimeClient)
- [ ] T028 [P] [US1] RigCard component in `src/features/dashboard/components/RigCard.tsx` (status dot + badge, type badge, power on/off action, 2×2 metrics grid, temperature severity bar, uptime, model — per design)
- [ ] T029 [US1] RigGrid component in `src/features/dashboard/components/RigGrid.tsx` (responsive grid `repeat(auto-fill, minmax(280px, 1fr))`; offline cards dimmed)
- [ ] T030 [US1] Wire header counts (online/total, total profit/day) from telemetry store in Header.tsx
- [ ] T031 [US1] REST rigs fetch via `src/features/dashboard/services/dashboardApi.ts` + React Query; MSW handlers for `/api/rigs`

**Checkpoint**: US1 fully functional and demoable independently (MVP: monitor rigs live).

---

## Phase 4: User Story 2 — Profitability & Market (Priority: P2)

**Goal**: RN04 profitability table, editable kWh price, market panel with sparklines; header profit/day total consistent everywhere.

**Independent Test**: Static financial data renders correct values; editing kWh recomputes all figures; market prices update every 30s.

### Tests for User Story 2

- [ ] T032 [P] [US2] Unit test formatters + RN04 math in `tests/unit/profitability.test.ts` (tolerance ±$0.01, SC-004)
- [ ] T033 [P] [US2] Component test KwhEditor (valid input, invalid input handling) in `tests/component/KwhEditor.test.tsx`

### Implementation for User Story 2

- [ ] T034 [P] [US2] ProfitabilityTable in `src/features/dashboard/components/ProfitabilityTable.tsx` (Rig | Moeda | Faturamento | Custo Energia | Lucro Líquido; green/red values)
- [ ] T035 [P] [US2] KwhEditor in `src/features/dashboard/components/KwhEditor.tsx` (react-hook-form + zod; inline edit from header; persists to settings store/localStorage)
- [ ] T036 [P] [US2] Market store in `src/features/dashboard/stores/marketStore.ts` (prices + ring-buffer history) and `useMarketPrices` hook
- [ ] T037 [US2] MarketPanel in `src/features/dashboard/components/MarketPanel.tsx` (coin price + Sparkline per ticker; 30s updates)
- [ ] T038 [US2] Profitability API fetch (`/api/market/prices`, `/api/rigs/{id}/telemetry` snapshots) via dashboardApi + React Query; MSW handlers

**Checkpoint**: US1 AND US2 both work independently; header totals match table totals.

---

## Phase 5: User Story 3 — Impact Alerts Feed (Priority: P2)

**Goal**: Live alerts feed with impact badges, relative times, and tab count; empty state; no duplicate email-level alerts within cooldown (RN07).

**Independent Test**: Canned alert feed renders newest-first with correct badges; new WS alerts append live; badge count updates; "Nenhum alerta"/"No alerts" when empty.

### Tests for User Story 3

- [ ] T039 [P] [US3] Unit test alerts store (ordering, dedupe during cooldown, count) in `tests/unit/alertsStore.test.ts`
- [ ] T040 [P] [US3] Component test AlertsFeed (badges, timestamps, empty state) in `tests/component/AlertsFeed.test.tsx`

### Implementation for User Story 3

- [ ] T041 [P] [US3] Alerts store in `src/features/dashboard/stores/alertsStore.ts` (append live, dedupe per cooldown window, expose count + latest HIGH)
- [ ] T042 [P] [US3] `useAlerts` hook in `src/features/dashboard/hooks/useAlerts.ts`
- [ ] T043 [US3] AlertsFeed in `src/features/dashboard/components/AlertsFeed.tsx` (severity-colored triangle-alert icons, LOW/MEDIUM/HIGH badges, relative time; empty state per locale)
- [ ] T044 [US3] Alerts tab with count badge in SidePanel (`src/features/dashboard/components/SidePanel.tsx`)
- [ ] T045 [US3] REST history fetch `/api/alerts` + WS `alert` event subscription; MSW handlers

**Checkpoint**: US1–US3 independently functional.

---

## Phase 6: User Story 4 — Profit Switch Suggestions (Priority: P3)

**Goal**: Sugestões tab listing GPU rigs with ≥10% better alternative coin (RN08–RN10); header count badge.

**Independent Test**: Canned suggestions render with from/to coins and profits; rigs below threshold absent; ASICs never listed.

### Tests for User Story 4

- [ ] T046 [P] [US4] Unit test suggestions store + threshold filtering in `tests/unit/suggestionsStore.test.ts`

### Implementation for User Story 4

- [ ] T047 [P] [US4] Suggestions store in `src/features/dashboard/stores/suggestionsStore.ts` (from/to coin, profits, improvementPct; GPU-only enforcement)
- [ ] T048 [P] [US4] `useSuggestions` hook + SuggestionsFeed component in `src/features/dashboard/components/SuggestionsFeed.tsx`
- [ ] T049 [US4] Sugestões tab with count badge in SidePanel; WS `suggestion`/`suggestion.removed` subscription; REST `/api/suggestions`; MSW handlers

**Checkpoint**: US1–US4 independently functional.

---

## Phase 7: User Story 5 — News Feed with Sentiment (Priority: P3)

**Goal**: Notícias tab with sentiment-tagged items (RN11–RN12); green/red/gray badges.

**Independent Test**: Static news list renders with correct sentiment colors; irrelevant items absent.

### Tests for User Story 5

- [ ] T050 [P] [US5] Component test NewsFeed (sentiment badge colors, source/title) in `tests/component/NewsFeed.test.tsx`

### Implementation for User Story 5

- [ ] T051 [P] [US5] News store in `src/features/dashboard/stores/newsStore.ts` + `useNews` hook
- [ ] T052 [US5] NewsFeed component in `src/features/dashboard/components/NewsFeed.tsx` (title, source, sentiment badge); Notícias tab with count in SidePanel
- [ ] T053 [US5] REST `/api/news` fetch + WS `news` subscription; MSW handlers

**Checkpoint**: US1–US5 independently functional.

---

## Phase 8: User Story 6 — Adaptive Alert UX (Priority: P3)

**Goal**: On HIGH-impact events, palette shifts to alert tones and the affected rig/coin is spotlighted; restores when cleared.

**Independent Test**: Synthetic HIGH alert visibly shifts palette, spotlights the rig, and restores on clear.

### Tests for User Story 6

- [ ] T054 [P] [US6] Unit test uiStore theme state machine (highImpactActive transitions) in `tests/unit/uiStore.test.ts`

### Implementation for User Story 6

- [ ] T055 [P] [US6] Extend `uiStore` with `highImpactActive` derived from alertsStore (latest HIGH within active window)
- [ ] T056 [US6] Theme token swap: CSS variables switch on `highImpactActive` (calm ↔ alert red/amber) in `src/index.css` + wiring in MainLayout
- [ ] T057 [US6] Rig spotlight: affected rig card gets alert ring highlight + reorder to top of RigGrid on HIGH (animate via `transition-all`, restore on clear)

**Checkpoint**: All six user stories independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance, i18n completeness, quality gates

- [ ] T058 [P] 60fps audit: verify selector-scoped re-renders, chart cleanup, no leaked listeners/intervals over 30-min streaming session (SC-002/SC-008)
- [ ] T059 [P] i18n coverage check: every user-visible string keyed in `en.json` + `pt-BR.json` (spec Appendix A); language switch works and persists
- [ ] T060 [P] Number formatting audit across locales (FR-017): no raw NaN/Infinity; invalid kWh input rejected/clamped
- [ ] T061 Run full `npm run lint`, `npm run type-check`, `npm test`; fix findings
- [ ] T062 Update `README.md` with run instructions (mock vs real mode, test commands)
- [ ] T063 [P] Accessibility pass: focus states, aria labels on icon buttons (power, kWh editor), tab keyboard navigation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundation; proceed in priority order (P1 → P2 → P3) or in parallel if staffed
- **Polish (Phase 9)**: Depends on the desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundation — no dependency on other stories (MVP)
- **US2 (P2)**: After Foundation — shares formatters/store patterns with US1 but independently testable
- **US3 (P2)**: After Foundation — independent feed; feeds `uiStore` used by US6
- **US4 (P3)**: After Foundation — consumes profitability data shape (US2) but testable with canned data
- **US5 (P3)**: After Foundation — fully independent
- **US6 (P3)**: Depends on US3 (HIGH alert state) and US1 (rig spotlight targets) — implement last

### Within Each User Story

- Tests (where included) written first and failing before implementation
- Store → hook → component → wiring order
- Story complete (independently testable) before moving to the next priority

### Parallel Opportunities

- All [P] tasks run in parallel within their phase
- T007–T012 (UI primitives) parallel; T013–T022 (lib/infra) parallel after T006–T012 where sensible
- Once Foundation completes, US1/US2/US3 can start in parallel (different files/stores)
- US4/US5 independent of each other

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational)
2. Complete Phase 3 (US1 — Live Rig Supervision)
3. **STOP and VALIDATE**: test US1 independently; demo the live monitoring MVP
4. Deploy/demo if ready

### Incremental Delivery

1. Foundation → US1 (MVP: live rig supervision) → demo
2. US2 (profitability + market) → US3 (alerts) → demo (operations-ready core)
3. US4 (suggestions) → US5 (news) → US6 (adaptive UX) → polish → release

---

## Notes

- [P] tasks = different files, no dependencies
- Story labels (US1–US6) map tasks to the spec's user stories for traceability
- The design's exact copy is in spec Appendix A (en.json/pt-BR.json keys)
- Verify tests fail before implementing; commit after each task or logical group
- Stop at each checkpoint to validate the story independently
