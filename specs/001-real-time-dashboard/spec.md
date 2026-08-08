# Feature Specification: Real-Time Mining Monitoring Dashboard

**Feature Branch**: `001-real-time-dashboard`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "Build the Hashflow real-time mining monitoring dashboard: live rig supervision with telemetry cards, profitability analysis with an editable energy (kWh) price, a market panel with coin prices and sparklines, and a tabbed side panel for alerts, profit-switch suggestions, and news with sentiment — matching the approved Figma prototype (https://salsa-aloha-60920975.figma.site/, local copy: HashFlow.html) and the frontend requirements in the Hashflow project plan (RN01–RN12)."

---

## Overview

Hashflow is a crypto mining monitoring and automation platform. The frontend delivers a single-page, always-on operations dashboard (no refresh buttons) that lets an operator supervise all mining rigs in real time, understand each rig's profitability, react to impact events, and act on profit-switching opportunities. All data is streamed live from the backend; the dashboard is a passive, high-fidelity monitor that reorganizes itself to draw attention to critical situations.

The user interface is **multi-language (i18n)**: v1 ships **English (default)** and **Brazilian Portuguese (pt-BR)** (the design's copy is pt-BR), with an architecture that supports adding more languages later without structural changes. The application is desktop-first (minimum target width ~1280px) and dark-themed, following the GitHub-dark style palette defined in the design.

---

## User Scenarios & Testing

### User Story 1 - Live Rig Supervision (Priority: P1)

An operator opens the dashboard and immediately sees every registered rig as a card: name, model, type (GPU/ASIC), live status (ONLINE / THROTTLING / OFFLINE), current hashrate with unit, current temperature with a color-coded severity bar, power consumption, and daily profit for the coin currently mined. Telemetry updates automatically every 10 seconds and on every status change — the operator never presses a refresh button. A header strip shows how many rigs are online (e.g., "Rigs: 5/6") and the aggregate daily profit.

**Why this priority**: Live rig supervision is the core purpose of the platform. Without it, the operator cannot detect overheating, throttling, or offline rigs — the failure mode this product exists to prevent.

**Independent Test**: Can be fully tested with a simulated telemetry stream: rigs appear with correct values, update on each 10-second tick, and change status/colors when the stream reports THROTTLING or OFFLINE — delivering the monitoring value with no other feature enabled.

**Acceptance Scenarios**:

1. **Given** at least one rig is registered, **When** the dashboard loads, **Then** every rig is shown as a card with name, model, type, status badge, hashrate, temperature, power, daily profit, and uptime, and the header shows the online/total rig count.
2. **Given** a rig is ONLINE, **When** its telemetry reports a temperature above 85°C, **Then** the rig transitions to THROTTLING (hashrate halved) and the status badge, dot, and temperature bar reflect the throttling state in its designated color.
3. **Given** a rig's temperature reaches 95°C, **When** the next telemetry reading arrives, **Then** the rig is shown OFFLINE with hashrate zero and standby power (≈5% of maximum), the card is visually dimmed, and a HIGH alert is raised in the alerts feed.
4. **Given** a rig is OFFLINE, **When** telemetry resumes with normal values, **Then** the rig returns to ONLINE and the card is re-highlighted.
5. **Given** the dashboard is streaming, **When** several telemetry ticks arrive per second, **Then** the interface remains fluid (no visual stutter, no memory growth) while only the affected cards re-render.

### User Story 2 - Profitability Analysis (Priority: P2)

The operator can see, per rig and in aggregate, the profitability picture: a table (RN04) listing each rig's coin, revenue (faturamento), energy cost (custo energia), and net profit (lucro líquido), plus a header total ("Lucro/dia"). The operator can click the kWh price in the header and edit it (e.g., $0.08/kWh); all energy costs and net profits update immediately. A "Mercado" panel shows the price of each supported coin (BTC, ETC, RVN) with a small price-history sparkline, refreshed every 30 seconds.

**Why this priority**: Profitability is the decision currency of the operator — it drives whether a rig is worth keeping online and feeds directly into the profit-switching feature. It is highly valuable and low-risk to build after live supervision.

**Independent Test**: Can be fully tested with static financial data: the table renders correct values per the RN04 formula, editing the kWh price recomputes costs and profits, and the market panel shows prices with sparklines — delivering the financial overview without streaming.

**Acceptance Scenarios**:

1. **Given** telemetry and price data exist, **When** the operator views the profitability table, **Then** each rig shows coin, revenue, energy cost, and net profit, with negative profits highlighted in red and positive profits in green.
2. **Given** the header shows the current kWh price, **When** the operator clicks it and enters a new price, **Then** every energy cost and net profit recomputes immediately and the new price is shown in the header.
3. **Given** the market panel is visible, **When** prices update (every 30s), **Then** each coin's price and sparkline reflect the latest values without user action.
4. **Given** a coin's price changes by ≥5% in the 10-minute window, **When** the change is detected, **Then** a HIGH market alert appears in the alerts feed.

### User Story 3 - Impact Alerts Feed (Priority: P2)

A side panel lists impact alerts in reverse-chronological order, each with a severity-colored icon, an impact badge (LOW / MEDIUM / HIGH), and a relative timestamp ("1m atrás"). A tab badge shows the number of alerts (e.g., 15). New alerts (throttling events, emergency shutdowns, webhook-triggered market swings) appear live as they are generated by the backend; the empty state shows "Nenhum alerta".

**Why this priority**: Alerts are how the operator learns about problems without watching every value. This completes the reactive loop begun by live supervision and is required before the adaptive-UX behavior (User Story 6) can be demonstrated.

**Independent Test**: Can be fully tested with a canned alert feed: alerts render with correct impact badges and times, new alerts append live, and the badge count updates — delivering the notification center without rigs or prices.

**Acceptance Scenarios**:

1. **Given** alerts exist, **When** the operator opens the Alertas tab, **Then** alerts are listed newest-first with severity-colored icons, impact badges, and relative timestamps, and the tab shows the total count.
2. **Given** the feed is open, **When** a new alert is generated by the backend, **Then** it appears at the top of the feed within one second without a page reload.
3. **Given** no alerts exist, **When** the operator opens the Alertas tab, **Then** the panel shows the "Nenhum alerta" empty state.
4. **Given** a HIGH alert is triggered for a rig or coin, **Then** the same trigger cannot raise another email-level notification for 15 minutes (cooldown), and the feed reflects only the first occurrence.

### User Story 4 - Profit Switch Suggestions (Priority: P3)

A "Sugestões" tab lists profit-switching recommendations: for each eligible GPU rig, the current coin, the suggested coin, the projected profit of each, and the improvement. A suggestion appears only when the alternative coin's projected net profit is at least 10% higher than the current coin's (RN10); the header badge shows the suggestion count (e.g., 3).

**Why this priority**: Switch suggestions create actionable value beyond monitoring, but depend on the profitability engine and are relevant only for GPU rigs, so they are lower priority than supervision and alerts.

**Independent Test**: Can be fully tested with computed suggestion data: eligible GPU rigs with a ≥10% better alternative coin are listed with both profits shown; rigs below the threshold are not listed — delivering the recommendation view without live streaming.

**Acceptance Scenarios**:

1. **Given** a GPU rig where an alternative coin projects ≥10% higher net profit, **When** the operator opens the Sugestões tab, **Then** the rig appears with current coin, suggested coin, and both profit projections, and the header count includes it.
2. **Given** a GPU rig where no alternative coin reaches the 10% threshold, **When** the operator opens the Sugestões tab, **Then** the rig is not listed as a suggestion.
3. **Given** an ASIC rig, **When** the operator opens the Sugestões tab, **Then** it never appears, regardless of profitability (RN08).

### User Story 5 - News Feed with Sentiment (Priority: P3)

A "Notícias" tab lists relevant crypto news items with their source, a title, and a sentiment tag — green (positive), red (negative), gray (neutral) — per the keyword-dictionary rules (RN12). Only news mentioning a supported coin is shown (RN11).

**Why this priority**: News sentiment informs operator decisions (e.g., market outlook for a mined coin) but is peripheral to the monitoring loop, so it is the lowest-priority panel.

**Independent Test**: Can be fully tested with a static news list: items render with sources and correct sentiment colors, and items without a supported-coin mention are absent — delivering the news view with no streaming.

**Acceptance Scenarios**:

1. **Given** news items exist, **When** the operator opens the Notícias tab, **Then** each item shows title, source, and a sentiment tag colored green (positive), red (negative), or gray (neutral).
2. **Given** a news item whose title/body contains no supported coin or ticker, **When** the feed is built, **Then** the item is not shown (RN11).
3. **Given** an item whose text contains a negative keyword (e.g., "Hack", "Ban", "Crash"), **When** it is displayed, **Then** its tag is red; a positive keyword (e.g., "Rally", "Adoption") yields green; no match or a tie yields gray (RN12).

### User Story 6 - Adaptive Alert UX (Priority: P3)

When a HIGH-impact event occurs (rig at 95°C or a ≥5% market swing), the whole dashboard adapts: the color palette shifts from the calm dark blue/green scheme to alert red/amber tones, and the affected rig (or coin) is visually spotlighted — raised, highlighted, and reordered toward the top so the operator's eye lands on it immediately. When the event resolves, the interface returns to the calm scheme.

**Why this priority**: This is a differentiating, cross-cutting requirement of the product (constitution principle III) but depends on alerts, supervision, and layout working first, so it is implemented last among the user stories.

**Independent Test**: Can be fully tested with a synthetic HIGH alert: the palette visibly shifts, the affected rig is spotlighted, and the scheme restores when the alert clears — delivering the adaptive behavior with any data source.

**Acceptance Scenarios**:

1. **Given** the dashboard in calm state, **When** a HIGH alert fires, **Then** the palette shifts to alert tones and the affected rig/coin is highlighted and moved to the operator's primary focus area.
2. **Given** multiple HIGH alerts, **When** the operator is scanning, **Then** every affected item is spotlighted without re-rendering unrelated cards.
3. **Given** all HIGH alerts have cleared, **When** the impact window ends, **Then** the dashboard returns to the calm palette automatically.

### Edge Cases

- All rigs offline (0/6): header count shows 0 online, cards dim, aggregate profit reflects standby power only, no charts break.
- Connection loss: the live stream disconnects and reconnects; the UI must reconnect transparently, resume streaming, and never lose already-rendered state; stale indicators (e.g., "Live" badge) must not mislead the operator.
- Rapid status flapping (throttle → normal → throttle within seconds): the UI must render the latest state without flicker or duplicated alerts.
- Very high-frequency streams (many rigs, sub-second updates): the interface must remain at 60fps and not grow memory (no leaked listeners/intervals).
- Invalid kWh input (empty, negative, non-numeric, absurdly large): rejected or clamped with a visible hint; calculations never show NaN/Infinity.
- Rig with no current coin (e.g., paused): daily profit shows $0.00, not missing/garbage values.
- Emoji/unicode and long names in news titles and rig names: truncated gracefully without breaking layout.
- A coin whose price history is shorter than 10 minutes (market is new): volatility calculation degrades to "no change" instead of erroring.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display every registered rig as a card showing name, model, type (GPU/ASIC), status badge, hashrate with unit, temperature, power consumption, daily profit, current coin, and uptime.
- **FR-002**: System MUST update rig telemetry automatically (at minimum every 10 seconds and on every status change) with no user-initiated refresh; a manual refresh control is prohibited.
- **FR-003**: System MUST reflect the business rules in status presentation: OFFLINE rigs show hashrate 0 and standby power (≈5% of max); THROTTLING is shown when temperature exceeds 85°C; emergency shutdown (OFFLINE) when temperature reaches 95°C (RN01–RN03).
- **FR-004**: System MUST color-code rig status (online / throttling / offline) and temperature severity consistently with the design palette (green = normal, amber/orange = warning, red = critical).
- **FR-005**: System MUST show, in the header, the online/total rig count and the aggregate daily profit, updating live.
- **FR-006**: System MUST display a per-rig profitability table (RN04): coin, revenue (faturamento), energy cost (custo energia), and net profit (lucro líquido), with negative values in red and positive in green.
- **FR-007**: System MUST allow the operator to edit the kWh price from the header (design: "$0.08/kWh", "Clique para editar kWh") and MUST recompute all energy costs and net profits immediately and consistently.
- **FR-008**: System MUST show a market panel with the price and a price-history sparkline for each supported coin, updating every 30 seconds without user action.
- **FR-009**: System MUST deliver an alerts feed (Alertas) listing alerts newest-first with severity-colored icons, impact badges (LOW/MEDIUM/HIGH), and relative timestamps, and a live count badge on the tab.
- **FR-010**: System MUST respect impact-level channels for display purposes: LOW → dashboard only; MEDIUM → WebSocket + webhook; HIGH → WebSocket + webhook + email (RN06), and MUST honor the 15-minute cooldown per trigger (RN07) so duplicate notifications are not shown.
- **FR-011**: System MUST show a profit-switch suggestions feed (Sugestões) listing only GPU rigs where an alternative coin's projected net profit exceeds the current coin's by at least 10% (RN08–RN10), with both profit projections and a live count badge.
- **FR-012**: System MUST show a news feed (Notícias) with title, source, and a sentiment tag (green positive / red negative / gray neutral), including only items relevant to supported coins (RN11–RN12).
- **FR-013**: System MUST implement adaptive UX: on any HIGH-impact event, shift the color palette to alert tones and spotlight the affected rig/coin; restore the calm scheme when the event clears.
- **FR-014**: System MUST remain responsive (smooth 60fps) under sustained high-frequency telemetry and MUST NOT leak memory or accumulate stale listeners over long sessions.
- **FR-015**: System MUST recover transparently from stream disconnects (automatic reconnection, state resync) without operator intervention.
- **FR-016**: System MUST internationalize all user-facing copy (statuses, units, labels, alerts, empty states) and MUST ship both English (default) and Brazilian Portuguese (pt-BR) for v1; the operator MUST be able to switch language, and the architecture MUST allow adding new languages without structural changes (see Appendix A for the design's copy in both languages).
- **FR-017**: System MUST format numbers and currency as shown in the design (e.g., "$62,661", "$27.80", "+$14.237", "122.0 MH/s", "2.53 GH/s", "108.6 TH/s", "5/6") and MUST NOT display raw values such as NaN, Infinity, or unlocalized decimals.
- **FR-018**: System MUST handle empty states gracefully (no rigs, no alerts, no news, no suggestions) with appropriate neutral messaging rather than broken layout.

### Key Entities

- **Rig**: A registered mining machine. Attributes: name, model, type (GPU/ASIC), status (ONLINE/THROTTLING/OFFLINE), maximum hashrate, maximum power (watts), algorithm, mined coin, uptime. Relationships: generates telemetry; owns profitability; raises alerts.
- **Telemetry**: A periodic snapshot of a rig's state: rig, hashrate, temperature (°C), power (watts), status, timestamp. Governed by RN01–RN03.
- **Coin**: A supported cryptocurrency (BTC, ETC, RVN in the design). Attributes: ticker, name, current price, price history (for sparklines and volatility windows).
- **Profitability**: Per-rig financial result derived per RN04: revenue, energy cost (from power, 24h, and the user's kWh price), net profit.
- **Alert**: An impact event: subject (rig and/or coin), impact level (LOW/MEDIUM/HIGH), message (pt-BR), output channels, timestamp. Subject to the 15-minute cooldown per trigger.
- **SwitchSuggestion**: A profit-switch recommendation: rig, current coin, suggested coin, projected profits of both, improvement percentage (≥10% threshold). GPU rigs only.
- **NewsItem**: A relevant news article: title, source, sentiment (POSITIVE/NEGATIVE/NEUTRAL), related coins, published timestamp. Relevance and sentiment per RN11–RN12.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A telemetry update is reflected on the corresponding rig card within 1 second of arrival, with no user action.
- **SC-002**: The dashboard maintains smooth 60fps interaction (no sustained frame drops) while 20+ rigs stream telemetry, verified over a 30-minute session.
- **SC-003**: An operator can identify the rig or coin behind a HIGH-impact alert within 5 seconds of the alert appearing.
- **SC-004**: Every displayed net-profit value matches the RN04 formula within numerical tolerance (±$0.01) for a given kWh price.
- **SC-005**: 100% of alerts generated by the backend during a session appear in the feed; no alert is silently dropped.
- **SC-006**: Editing the kWh price updates every affected cost/profit figure in under 1 second and remains consistent across header, table, and rig cards.
- **SC-007**: The adaptive palette shift on a HIGH event is visible within 1 second and reverts automatically when the event clears.
- **SC-008**: The dashboard survives 5 consecutive stream disconnects/reconnects (including a mid-transmission kill) without requiring a reload or losing data.

## Assumptions

- The backend services (telemetry, financial, agent, news) and the OpenAPI contract are provided by the `hashflow-infra` repository; the frontend consumes documented REST + WebSocket/SSE endpoints and renders values as-is (the simulation logic lives in the backend per RN01–RN03).
- For frontend development before the backend contract is finalized, the interface is built against the agreed contract shapes (see plan) and can run against a mock stream with the same wire format.
- v1 scope is the single-page dashboard exactly as designed; dedicated multi-page areas (e.g., separate rig management, history, or settings pages) are out of scope until new designs are provided.
- Authentication is out of scope for v1: a single operator views the dashboard without login (the design contains no auth flow). Multi-user accounts are a future increment.
- UI copy is fully internationalized (i18n): v1 supports English (default) and Brazilian Portuguese (pt-BR, the design's language), switchable by the operator; new languages are additive later. Numeric/currency formatting follows the design's US-style conventions (commas for thousands, periods for decimals, "$" prefix) and is identical across locales for v1.
- Desktop-first: the design targets a 1280px+ viewport; graceful behavior down to ~1024px is expected, and mobile layouts are out of scope for v1.
- The user's kWh price defaults to $0.08/kWh (as designed) and is stored locally until a backend settings endpoint exists.
- Supported coins are BTC, ETC, and RVN for v1 (per the design's market panel); additional coins are additive later.
- The design's typo "sugestãoões de troca" is corrected to "sugestões de troca" in implementation.

---

## Appendix A — UI Copy (EN / PT-BR)

Reference pairs for the v1 dictionary. English is the default locale; pt-BR matches the design. Keys are illustrative; the implementation uses an i18n key-per-string approach.

| Area | Key (EN) | English (default) | Português (BR) |
|------|----------|--------------------|----------------|
| Header | live | Live | Ao vivo |
| Header | rigsCount | Rigs: {online}/{total} | Rigs: {online}/{total} |
| Header | profitDay | Profit/day | Lucro/dia |
| Header | switchCount | {n} switch suggestions | {n} sugestões de troca |
| Header | editKwh | Click to edit kWh | Clique para editar kWh |
| Header | telemetryTicker | Telemetry every 10s · Prices every 30s | Telemetria a cada 10s · Preços a cada 30s |
| Section | rigSupervision | Rig Supervision | Supervisão de Rigs |
| Section | profitabilityTable | Profitability Analysis (RN04) | Análise de Lucratividade (RN04) |
| Status | online | Online | Online |
| Status | throttling | Throttling | Throttling |
| Status | offline | Offline | Offline |
| RigCard | hashrate | Hashrate | Hashrate |
| RigCard | temperature | Temperature | Temperatura |
| RigCard | power | Consumption | Consumo |
| RigCard | profitDay | Profit/day | Lucro/dia |
| RigCard | uptime | Uptime: {value} | Uptime: {value} |
| RigCard | turnOff | Turn off rig | Desligar rig |
| RigCard | turnOn | Turn on rig | Ligar rig |
| Table | rig | Rig | Rig |
| Table | coin | Coin | Moeda |
| Table | revenue | Revenue | Faturamento |
| Table | energyCost | Energy Cost | Custo Energia |
| Table | netProfit | Net Profit | Lucro Líquido |
| Panel | market | Market | Mercado |
| Tab | alerts | Alerts | Alertas |
| Tab | suggestions | Suggestions | Sugestões |
| Tab | news | News | Notícias |
| Alerts | noAlerts | No alerts | Nenhum alerta |
| Time | minutesAgo | {n}m ago | {n}m atrás |
| Time | hoursAgo | {n}h ago | {n}h atrás |
| Impact | low | LOW | BAIXO |
| Impact | medium | MEDIUM | MÉDIO |
| Impact | high | HIGH | ALTO |

Notes:
- Status badges, coin tickers, units (MH/s, °C, W), and the LIVE indicator are locale-invariant (kept as-is in both languages, matching the design).
- The design renders impact levels as LOW / MEDIUM / HIGH even in pt-BR; the table above offers localized variants as the v1 choice, defaulting to the design's values if the team prefers.
