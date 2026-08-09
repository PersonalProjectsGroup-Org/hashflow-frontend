# ADR-0007: Constitution gates enforced by ESLint and CI

## Status

Accepted

## Context

The team constitution defines gates — lint + type-check green, named
exports only, no `as` casts — that were originally conventions. With the
tooling stack in place (T001–T005) they can be enforced mechanically so
reviewers don't have to police style.

## Decision

- **ESLint enforces** (in `eslint.config.js`):
  - no `as` casts (`@typescript-eslint/consistent-type-assertions`,
    `assertionStyle: never`)
  - no non-null assertions (`@typescript-eslint/no-non-null-assertion`)
  - no default exports in `src/**` (inline `constitution/no-default-export`
    rule — `eslint-plugin-import` doesn't support ESLint 10 yet)
- **CI** (`.github/workflows/ci.yml`) runs lint, format:check, type-check,
  test, and build on every PR and push to `master`.
- **Pre-commit** (husky + lint-staged) formats and lints staged files so
  violations are caught before they reach a PR.
- Config files at the repo root keep default exports (tooling requires
  them); the rules target `src/`.

## Consequences

- "The constitution" is a checkable, CI-blocking gate rather than a
  guideline.
- Violations surface in the editor, at commit time, and in CI — three
  chances before review.
- When `eslint-plugin-import` supports ESLint 10, the inline rule can be
  replaced by `import/no-default-export`.
