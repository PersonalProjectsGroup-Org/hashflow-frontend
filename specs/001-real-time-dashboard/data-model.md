# Data Model: Real-Time Mining Monitoring Dashboard

**Source**: [spec.md](spec.md) Key Entities | **Place**: `src/types/` (mirror of the `hashflow-infra` OpenAPI contract; regenerate from the spec when available)

All types are written without `as` casts and use strict named exports. Units and status enums are locale-invariant (FR-017).

## Enums

```ts
export type RigType = "GPU" | "ASIC";
export type RigStatus = "ONLINE" | "THROTTLING" | "OFFLINE";
export type ImpactLevel = "LOW" | "MEDIUM" | "HIGH";
export type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
```

## Entities

### Rig

```ts
export interface Rig {
  id: string;            // uuid
  name: string;          // e.g. "RTX 4090 Beast"
  model: string;         // e.g. "RTX 4090"
  type: RigType;
  status: RigStatus;
  algorithm: string;     // e.g. "ETCHash"
  coin: string;          // ticker currently mined, e.g. "ETC"
  maxHashrate: number;   // hash/s (raw; display unit derived)
  maxPowerWatts: number;
  uptimeSeconds: number; // derived from firstSeen/status
  createdAt: string;     // ISO-8601
}
```

### Telemetry

```ts
export interface Telemetry {
  rigId: string;
  hashrate: number;      // hash/s (0 when OFFLINE per RN01)
  temperatureC: number;  // °C
  powerWatts: number;    // 5% of max in standby when OFFLINE (RN01)
  status: RigStatus;     // effective status after RN02/RN03 rules
  timestamp: string;     // ISO-8601
}
```

### Coin & Price

```ts
export interface Coin {
  ticker: string;        // "BTC" | "ETC" | "RVN" (v1)
  name: string;          // "Bitcoin", "Ethereum Classic", "Ravencoin"
}

export interface PricePoint {
  ticker: string;
  price: number;         // USD
  timestamp: string;     // ISO-8601
}

export interface CoinMarket {
  ticker: string;
  currentPrice: number;
  history: PricePoint[]; // bounded ring buffer for sparklines + 10-min volatility window (RN05)
  delta10mPct: number;   // (current - price10mago) / price10mago * 100
}
```

### Profitability (derived, RN04)

```ts
export interface RigProfitability {
  rigId: string;
  coin: string;
  revenueUsd: number;       // (hashrate / globalDifficulty) * blockReward * coinPrice
  energyCostUsd: number;    // ((powerWatts * 24) / 1000) * kwhPrice
  netProfitUsd: number;     // revenueUsd - energyCostUsd
  kwhPriceUsed: number;     // for traceability
}
```

### Alert

```ts
export interface ImpactAlert {
  id: string;
  subject: { rigId?: string; coin?: string };
  impact: ImpactLevel;
  messageKey: string;      // i18n key (e.g. "alert.throttling", "alert.emergencyShutdown")
  messageArgs?: Record<string, string | number>; // { rigName, temperatureC, ... }
  channels: Array<"dashboard" | "websocket" | "webhook" | "email">; // RN06
  timestamp: string;       // ISO-8601
  cooldownUntil?: string;  // RN07 — 15 min per trigger
}
```

### SwitchSuggestion (RN08–RN10)

```ts
export interface SwitchSuggestion {
  id: string;
  rigId: string;
  rigName: string;
  fromCoin: string;
  toCoin: string;
  fromProfitUsd: number;   // projected net profit over 24h, current coin
  toProfitUsd: number;     // projected net profit over 24h, alternative coin
  improvementPct: number;  // (toProfit - fromProfit) / fromProfit * 100 — must be ≥ 10
}
```

### NewsItem (RN11–RN12)

```ts
export interface NewsItem {
  id: string;
  title: string;
  source: string;          // e.g. "CoinDesk", "CryptoSlate"
  sentiment: Sentiment;    // keyword-dictionary result
  relatedCoins: string[];
  publishedAt: string;     // ISO-8601
}
```

## Wire Formats (realtime)

### SSE events

```text
event: telemetry            // every 10s
data: { "rigId": "...", "hashrate": 122000000, "temperatureC": 75.6, "powerWatts": 301, "status": "ONLINE", "timestamp": "..." }

event: price                // every 30s
data: { "ticker": "ETC", "price": 27.8, "timestamp": "..." }

event: snapshot             // on connect — initial rigs + latest telemetry + prices
data: { "rigs": [...], "telemetry": [...], "prices": [...] }
```

### WebSocket messages (alert-grade, immediate)

```text
{ "type": "alert", "payload": { ImpactAlert } }
{ "type": "suggestion", "payload": { SwitchSuggestion } }   // added/updated
{ "type": "suggestion.removed", "payload": { "id": "..." } }
{ "type": "news", "payload": { NewsItem } }
```

## REST endpoints consumed (via `src/services/` + React Query)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/rigs` | Rigs list (initial + refetch) |
| GET | `/api/rigs/{id}/telemetry` | Single-rig telemetry snapshot |
| GET | `/api/market/prices` | Current prices + history window |
| GET | `/api/alerts` | Alert history (initial feed) |
| GET | `/api/news` | News list with sentiment |
| GET | `/api/suggestions` | Active switch suggestions |
| GET/PUT | `/api/settings/kwh` | User kWh price (fallback: localStorage only until endpoint exists) |

*Endpoints are illustrative of the `hashflow-infra` contract; final paths/schemas come from the shared OpenAPI spec. The typed client in `src/types/api.ts` is the single place to update when the contract lands.*
