# ADR-0006: Internationalization

## Status

Accepted

## Context

The spec requires all user-visible copy to be internationalized
(FR-016), shipping English (default) and Brazilian Portuguese for v1,
with the ability to add languages without structural changes. Numbers
and units are locale-invariant per FR-017.

## Decision

- `i18next` + `react-i18next` initialized in `src/lib/i18n.ts`.
- Locale files per language under `src/locales/` (`en.json` default,
  `pt-BR.json`), structured for future languages.
- All user-visible strings are keyed; no hardcoded copy in components
  (audited in T059).
- The language preference persists (settings store) and switches i18n
  immediately.
- Number/currency/unit formatting is locale-invariant, handled by shared
  formatters in `src/utils/format.ts` (FR-017).

## Consequences

- Adding a language = adding one locale file and a UI entry.
- Copy changes don't touch components; components don't leak copy.
- A coverage check (T059) keeps both locales in sync.
