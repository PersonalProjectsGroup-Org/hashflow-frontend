<!--
Sync Impact Report:
- Version change: draft → 1.0.0
- List of modified principles:
  - PRINCIPLE_1: [PRINCIPLE_1_NAME] → I. Feature-Driven Architecture (Feature-First)
  - PRINCIPLE_2: [PRINCIPLE_2_NAME] → II. Real-Time Telemetry & SSE-First (No Manual Refresh)
  - PRINCIPLE_3: [PRINCIPLE_3_NAME] → III. Adaptive User Experience (Visual Rigor)
  - PRINCIPLE_4: [PRINCIPLE_4_NAME] → IV. High-Frequency Stream Performance (60fps Rendering)
  - PRINCIPLE_5: [PRINCIPLE_5_NAME] → V. Strict State and Library Separation
- Added sections:
  - Core Technology Stack and Constraints
  - Development Workflow and Integrity Rules
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated/aligned)
  - .specify/templates/spec-template.md (✅ updated/aligned)
  - .specify/templates/tasks-template.md (✅ updated/aligned)
- Follow-up TODOs: None (All placeholders successfully resolved)
-->

# Hashflow Frontend Constitution

## Core Principles

### I. Feature-Driven Architecture (Feature-First)
Structure all application-specific code inside `src/features/` (e.g., `dashboard`, `rigs`, `financials`, `alerts`, `news`) using kebab-case folder names. Shared primitives must go in `src/components/ui/` with PascalCase for files and strict named exports. Types must be strictly generated and derived from the shared OpenAPI 3.0 specification to ensure end-to-end type safety.

**Rationale**: Promotes highly coherent, scalable, and isolated features that are easy to develop, test, and maintain as the platform expands.

### II. Real-Time Telemetry & SSE-First (No Manual Refresh)
The application must consume a continuous, active stream via WebSockets and Server-Sent Events (SSE) for telemetry and monitoring. Manual "refresh" buttons are strictly prohibited. The system must handle stream reconnection, state synchronization, and backpressure seamlessly.

**Rationale**: Real-time accuracy is critical for crypto mining monitoring where delayed events can result in hardware damage or financial loss.

### III. Adaptive User Experience (Visual Rigor)
The UI must dynamically adapt layout and visual hierarchy based on active system telemetry. When a "High-impact" event is detected (e.g., a rig temperature exceeding 95°C), the interface must shift its color palette (e.g., from calm blue/green to high-visibility alert red/amber) and prioritize critical status modules. The news feed must display color-coded badges for sentiment: green (positive), red (negative), and gray (neutral).

**Rationale**: Operators must be immediately drawn to critical status anomalies without cognitive fatigue from scanning dense data grids.

### IV. High-Frequency Stream Performance (60fps Rendering)
The frontend must maintain smooth 60fps rendering under active, high-frequency telemetry streams. Chart components (Recharts/Visx) must be optimized with robust cleanup to prevent memory leaks during prolonged data streaming. State updates must leverage fine-grained Zustand selectors to ensure only the directly affected components re-render, bypassing global React render passes.

**Rationale**: Heavy data visualization must not degrade system responsiveness or cause browser tabs to crash due to memory leaks.

### V. Strict State and Library Separation
Global client-side state must reside in specialized Zustand stores (NEVER use Redux). Server state and caching are strictly delegated to `@tanstack/react-query`. Form state and client-side validation must be handled via `react-hook-form` paired with declarative `Zod` schemas. Axios must be used for HTTP client requests, and `lucide-react` for standard icons.

**Rationale**: Separation of concerns prevents "prop drilling" and global rendering bottlenecks while maintaining highly predictable data flows.

## Core Technology Stack and Constraints
The application uses React 19, Vite, and TypeScript as its core foundation. Styling is strictly managed using Tailwind CSS combined with Headless UI for accessible, unstyled interactive components. Navigation is handled by `react-router-dom`. No other state management, client, styling, or routing libraries are allowed without a formal amendment.

## Development Workflow and Integrity Rules
All components and utility modules must use strictly named exports; default exports are forbidden to ensure consistent imports. Type system rules must be adhered to explicitly: never use casts (`as`) or suppress warning/TS checks unless explicitly justified and documented. Every feature change must be fully validated by running standard lint and type-checking commands (`npm run lint` and `npm run type-check`) to ensure the build remains clean and correct.

## Governance
This Constitution is the supreme architectural guidance for the Hashflow Frontend repository. Any deviations or exceptional patterns must be documented under the "Complexity Tracking" section of implementation plans and formally reviewed. Changes or additions to this document require a minor or major version bump and a documented migration strategy.

**Version**: 1.0.0 | **Ratified**: 2026-07-11 | **Last Amended**: 2026-07-11
