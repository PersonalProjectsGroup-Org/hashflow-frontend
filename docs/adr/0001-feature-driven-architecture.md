# ADR-0001: Feature-driven architecture

## Status

Accepted

## Context

The app grows feature by feature (rig supervision, profitability, alerts,
suggestions, news, adaptive UX). A flat `src/components` tree does not scale:
feature code leaks across folders, and shared primitives mix with feature
components. The team constitution requires feature-first organization and
named exports only.

## Decision

- Feature code lives under `src/features/<kebab-case>/` with `components/`,
  `hooks/`, `stores/`, and `services/` subfolders (e.g.
  `src/features/dashboard/`).
- Shared design-system primitives live under `src/components/ui/`
  (PascalCase files, e.g. `Card.tsx`, `Badge.tsx`).
- Shared libs (`axios`, query client, i18n, realtime) live under `src/lib/`.
- Contract types live under `src/types/` (locally mirrored until
  `hashflow-infra` publishes OpenAPI-generated types).
- **Named exports only** — no default exports in `src/` (enforced by ESLint,
  see ADR-0007). Config files at the repo root are exempt (tooling requires
  default exports).
- **No `as` casts or non-null assertions** in app code (enforced by ESLint).

## Consequences

- New features slot in as sibling folders without touching shared code.
- The folder structure mirrors the product's feature boundaries.
- The ESLint rules make the constitution checkable in CI, not just convention.
