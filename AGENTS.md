# Agent guide (minimal)

This repo packages **Agent Skills** (CLI scripts + `SKILL.md`). Prefer code and tests over long docs.

## Prove your work

```bash
npm test
# or: node tests/run-all.js
```

For the full verification loop (doctor, evidence paths), read `.cursor/skills/verify-agent-skills/SKILL.md`.

## Editing notion-sync CLIs

- Parse argv with `stripTokenArg` and validate **before** `notionRequest` or file I/O.
- Reject unknown flags and extra positionals; treat a following `--flag` as a missing value when a flag requires a value.
- Never add `--token` or file-based credential flags; use `NOTION_API_KEY` via the host runtime.
- Path access: `resolveSafePath` with explicit `--allow-read-path` / `--allow-write-path` grants only.
- Destructive archive: require `--confirm-archive`.

## Tests

- Add `tests/**/test-*.js`; `tests/run-all.js` discovers them automatically.
- Use `NOTION_API_KEY: 'ntn_dummy_token_for_tests'` in CLI contract tests unless testing protected-secret transport (`test-secrets-migration.js`, parts of `test-normalize.js`).
- Assert failures do not mention `api.notion.com` when testing argument parsing.

## Architecture plan

See `docs/agent-friendliness-plan.md` on branches that include it (draft PR).
