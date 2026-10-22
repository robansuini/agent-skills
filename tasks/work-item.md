# Work item: shared notion CLI test harness

## Intent

Remove duplicated process-spawn and assertion setup from notion-sync CLI contract tests.

## Scope

- Add a reusable harness with the portable dummy API key as its default.
- Migrate the six focused argument-parsing suites that duplicate the same setup.
- Preserve suite-specific fail-fast assertions through configurable forbidden output.

## Acceptance criteria

- Migrated suites use one shared spawn implementation.
- Existing success, failure, and no-side-effect assertions remain intact.
- `npm test`, `npm run lint:agent`, and `git diff --check` pass.

## Design decision

No design document is required. This is a test-only refactor with no runtime,
security-boundary, dependency, or public-interface change.

## Status

- [x] Work item defined
- [x] Implementation complete
- [x] Validation complete

## Validation results

- Six migrated argument suites passed individually.
- `npm test` passed (all discovered suites; 288 notion-sync assertions).
- `npm run lint:agent` passed (10 notion entrypoints).
- `git diff --check` passed.
