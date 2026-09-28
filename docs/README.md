# Hashflow Frontend — Documentation

Map of this repo's documentation. **Decisions live as immutable ADRs;
requirements live in the spec; tasks live on the Trello board.**

## Index

| Path                              | What                                                                                            | Lifecycle                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `docs/spec.md`                    | Requirements contract — user stories (US1–US6), FR/RN/SC rules, design details, Appendix A copy | Living — update when requirements change       |
| `docs/adr/`                       | Architecture Decision Records (one decision per file)                                           | Immutable — superseded, never rewritten        |
| `docs/data-model.md`              | Entities → TS types + REST/SSE/WS wire formats                                                  | Stopgap — replaced by `hashflow-infra` OpenAPI |
| `docs/trello/`                    | Trello board generation source (`tasks.md` + full card manifest)                                | **Remove once all board batches are created**  |
| `docs/checklists/requirements.md` | Requirements traceability checklist                                                             | Process artifact                               |

## Architecture decisions

| ADR                                             | Decision                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| [0001](adr/0001-feature-driven-architecture.md) | Feature-driven architecture; named exports only; no `as` casts                        |
| [0002](adr/0002-approved-frontend-stack.md)     | Approved stack (React 19 + Vite + TS, Tailwind v4, Zustand, React Query, …); no Redux |
| [0003](adr/0003-sse-first-realtime.md)          | SSE-first realtime (10s/30s metrics) + WebSocket for alerts; one `RealtimeClient`     |
| [0004](adr/0004-zustand-for-realtime-state.md)  | Zustand for realtime state, React Query for server state                              |
| [0005](adr/0005-mock-first-streaming.md)        | Mock-first streaming behind the same interface (`VITE_REALTIME_MODE`)                 |
| [0006](adr/0006-internationalization.md)        | i18next — EN default + pt-BR, all copy keyed                                          |
| [0007](adr/0007-constitution-gates.md)          | Constitution gates enforced by ESLint + CI                                            |

## Creating Trello cards (trello-task skill)

The board is created from `docs/trello/`:

```
docs/spec.md ──(speckit-tasks)──▶ docs/trello/tasks.md
                                  ──(trello-task skill)──▶ card blocks ──paste──▶ Trello
```

- `docs/trello/trello-cards.md` is the full manifest of all 63 cards
  (T001–T063) with batch order and list assignments — see its README for
  the step-by-step.
- Batches 1–3 (T001–T023, setup + foundation) → **To Do**; batches 4–10
  (T024–T063, user stories + polish) → **Backlog**.
- Delete `docs/trello/` once every batch exists on the board — the files
  are derivable from `docs/spec.md` again whenever needed.

## Repo conventions

- Named exports only, no `as` casts / non-null assertions (enforced by
  `npm run lint`).
- `npm run lint`, `npm run format:check`, `npm run type-check`,
  `npm test`, `npm run build` must all pass (CI enforces).
