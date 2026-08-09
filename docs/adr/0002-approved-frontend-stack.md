# ADR-0002: Approved frontend stack

## Status

Accepted

## Context

The foundation needs a stable, constitution-approved stack so all user
stories build on the same primitives. The plan must avoid framework churn
and library sprawl (explicitly: no Redux).

## Decision

The stack is:

- React 19 + Vite (TypeScript, strict) — app framework and bundler
- Tailwind CSS v4 (CSS-first via `@tailwindcss/postcss`) + design tokens as
  CSS variables — styling
- `@headlessui/react` — accessible primitives
- `react-hook-form` + `zod` — forms and validation
- `zustand` — client/realtime state (see ADR-0004)
- `@tanstack/react-query` + `axios` — server state / REST (see ADR-0004)
- `react-router-dom` — SPA routing (single route in v1)
- `lucide-react` — icons
- `recharts` — market sparklines
- `i18next` + `react-i18next` — internationalization (see ADR-0006)

Adding any state/client/styling/routing library beyond this list requires a
constitution amendment. No Redux.

## Consequences

- New dependencies are deliberate and reviewed.
- The design system (Tailwind tokens) and the data layer (axios + React
  Query + Zustand) are fixed points every story builds on.
