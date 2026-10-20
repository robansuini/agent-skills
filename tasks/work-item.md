# Work item: make test discovery the documentation source of truth

## Goal

Prevent the README test list from drifting behind the suites that
`tests/run-all.js` discovers automatically.

## Scope

- Use the repository-standard `npm test` command in the README.
- Document automatic `tests/**/test-*.js` discovery instead of maintaining a
  partial per-file list.

## Acceptance criteria

- Contributors have one documented full-suite command.
- Adding a discovered test does not require a README edit.
- The full test suite passes.

## Design

No design document is required: this is a documentation-only change with no
runtime, security, dependency, or interface impact.

## Validation

- Passed: `npm test`
- Passed: `npm run lint:agent`
- Passed: `git diff --check`
