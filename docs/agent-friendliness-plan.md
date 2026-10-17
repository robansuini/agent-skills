# Agent-friendliness rearchitecture plan

**Status:** Draft (inverse-pyramid priority)  
**Repo:** [robansuini/agent-skills](https://github.com/robansuini/agent-skills)  
**Inspired by:** [poteto on fearless agent parallelism](https://x.com/poteto/status/2111133080526495985) and [pstack](https://github.com/cursor/plugins/tree/main/pstack) workflows (`poteto-mode`, verification skills, interrogate, blast-radius).

This plan answers open questions with **prototype evidence** from this repository’s history (87 non-merge commits; ~30 directly tagged `fix`/`test` for CLI validation, security, or harness gaps). Human review is explicitly **last** in the rollout order.

---

## Goals

Agents should be able to:

1. Change one skill without copying divergent CLI patterns.
2. Prove behavior with one command (`node tests/run-all.js` + project verification skill).
3. Fail **before** network I/O or filesystem escape on malformed input.
4. Ship PRs that match maintainer expectations without re-learning from 80+ prior fix PRs.

Non-goals: maximizing prose in README/AGENTS.md, adding TypeScript for its own sake, or broad refactors without a failing test first.

---

## Evidence: how @robansuini reviews (GitHub)

Public review signal on this repo is thin in inline threads (one historical README path question on PR #20). **Approval reviews** consistently cite:

- Full suite green with **assertion counts** (e.g. “281 repository tests”, “288 notion-sync assertions”).
- **Stack integration** after conflict resolution, not only isolated files.
- Security/metadata alignment (SkillSpector, ClawHub, capability disclosure) on notion-sync releases.

**Proxy signal from merged PR bodies and @axos-ai review comments** (same maintainer stack, AI-DLC-lite gate) encodes Roberto’s bar:

| Theme | Example | Agent lesson |
|--------|---------|----------------|
| Fail fast, no network | `--type` must error before `notionRequest` | Parser tests must assert absence of `api.notion.com` in output |
| No silent ignores | Reject unknown flags and extra positionals | “Compiles” ≠ correct CLI |
| Flag-as-value traps | `--type --json` is missing value, not type `--json` | Validate “next token absent or starts with `-`” |
| Harness completeness | New `test-*.js` must appear in `tests/run-all.js` + README list | Discovery runner reduces but does not remove registration discipline |
| Destructive ops | `--confirm-archive` required | Explicit consent flags for irreversible-ish actions |
| Security boundaries | Remove global `--allow-unsafe-paths`; per-path read/write grants | Agents must not reintroduce “escape hatch” flags |
| Credentials | No `--token` on argv; runtime `NOTION_API_KEY` only | Never patch in token flags for “local testing” |
| Metadata honesty | Skill frontmatter env + capabilities match real behavior | Scanner failures are release blockers |

---

## Evidence: recurring agent pitfalls (commit archaeology)

Sorted by frequency in `git log --grep=validate|argument|security|test:` (30/87 commits).

### P1 — CLI contract drift (highest)

**Symptom:** Scripts share `notion-utils.js` but each reimplements positional/flag loops.

**Historical fixes:** PRs #43–#83 series (`query-database`, `search-notion`, `md-to-notion`, `batch-update`, `watch-notion`, `add-to-database`, `update-page-properties`, `notion-to-md`, simple commands).

**Prototype data:** `tests/notion-sync/test-*-args.js` (9 files) duplicate `spawnSync` harness; only `test-simple-command-args.js` used protected sentinel `oc-sent-v2.*`, which **breaks on Node &lt; 22.21** (verified locally: v22.14.0 fails `delete-notion-page` success path). Other suites use `ntn_dummy_token_for_tests`.

**Target shape:** One `tests/notion-sync/cli-harness.js` + optional `parseNotionCli(argv, schema)` in `notion-utils.js` so agents add flags in one place.

### P2 — Test wiring amnesia

**Symptom:** Regression test lands without `run-all.js` / README mention.

**Historical fixes:** #50, #56, #48 review thread (“wire into aggregate runner”).

**Prototype data:** `tests/run-all.js` already auto-discovers `test-*.js` (commit `bcc07f3`). Remaining gap: **README** individual-suite list still manual; agents update one and not the other.

**Target shape:** Drop README per-file list; single source of truth = discovery + verification skill “Doctor”.

### P3 — Security regressions

**Symptom:** Path symlinks, credential leakage, undeclared capabilities.

**Historical fixes:** #7, #12, #84–#87, `design.md` (safe write-path canonicalization).

**Target shape:** All path touches go through `resolveSafePath`; security tests live beside `test-normalize.js`; no new “debug” bypass flags without `design.md`.

### P4 — Leadership CLI edge cases

**Symptom:** Category ambiguity, help exit codes, empty search.

**Historical fixes:** #35, #39, #41, #47, `test-cli.js`, dispatch table (#65).

**Target shape:** Mirror notion-sync: schema-driven dispatch table + args tests only (no network).

### P5 — Environment assumptions

**Symptom:** CI/agent VM Node version differs from OpenClaw protected-secret requirements.

**Prototype:** Protected sentinel tests require Node 22.21+ / 24.5+ / 25+ (`notion-utils.js` `supportsNativeProxy`). Portable arg tests should use **non-sentinel** dummy keys unless explicitly testing protected transport.

---

## Inverse-pyramid rollout

### Tier 1 — Code structure, types, boundaries (do first)

| Work item | Rationale | Acceptance |
|-----------|-----------|------------|
| **CLI schema module** | Single parser for “unknown option”, “unexpected positional”, “flag needs value” | All notion scripts call shared parser; delete duplicated loops |
| **Test harness module** | One `runScript(name, args, env)` with default `ntn_dummy_token_for_tests` | New tests import harness; sentinel only in `test-secrets-migration.js` |
| **Error channel contract** | JSON vs plain: `hasJsonFlag()` + structured `{ error }` | Documented in harness; lint enforces pattern |
| **Boundary map** | `notion-utils.js` exports only stable surface; scripts are thin `main()` | No new cross-script requires except utils |
| **Leadership dispatch** | Keep table-driven `leadership-prompts.js`; extract `commands.js` if grows | Behavior frozen by `test-cli.js` |

**Architect sketch (usage-first):**

```text
# Agent adds a new flag --foo to query-database.js

1. Extend schema in notion-utils parseNotionCli schema object
2. Add 3 tests: unknown neighbor, missing value, success path (mocked)
3. node tests/run-all.js
4. /verify-agent-skills drive "query database help"
```

**Module map (target):**

```text
productivity/notion-sync/scripts/
  notion-utils.js      # HTTP, paths, token, parseNotionCli, shared validators
  *.js                 # thin entrypoints
tests/notion-sync/
  cli-harness.js       # spawn, env defaults, expectFailure/Success
  mock-notion-api.js
  test-*-args.js       # contract tests only
```

### Tier 2 — Lint, tests, CI

| Work item | Status in repo | Next step |
|-----------|----------------|-----------|
| Aggregate test runner | ✅ `discoverTests` | Add `npm test` alias via `package.json` |
| **Agent CLI contract lint** | 🆕 `tests/lint/test-agent-contracts.js` | Fails if any notion script skips `stripTokenArg` or lacks `checkApiKey` guard |
| **Node doctor** | 🆕 verification skill | Warn when Node too old for protected tests |
| GitHub Actions | 🆕 `.github/workflows/test.yml` | `node tests/run-all.js` on push/PR |
| Skill metadata validation | Manual `quick_validate.py` | Add to CI when Python available (optional job) |

### Tier 3 — Minimal prose (`AGENTS.md`)

Keep under ~40 lines:

- Repo root commands only.
- Point to `docs/agent-friendliness-plan.md` for architecture.
- Point to `.cursor/skills/verify-agent-skills/SKILL.md` for proof obligations.
- “Do not add credential flags; copy `ntn_dummy_token_for_tests` in tests.”

### Tier 4 — Human review (last)

- CODEOWNERS stays; agents open **draft** PRs with validation transcript.
- Run **pstack interrogate** + **blast-radius** on each PR before publish (see companion PRs).

---

## Prototypes shipped with this plan (separate draft PRs)

1. **Verification skill** — `.cursor/skills/verify-agent-skills/` (launch: `node tests/run-all.js`; doctor: Node + test discovery count).
2. **CLI contract lint** — static checks for notion entrypoints.
3. **CI workflow** — GitHub Actions test job.
4. **Test fixture fix** — align `test-simple-command-args.js` token with portable dummy key (unblocks Node 22.14 CI).

---

## Metrics (how we know agents improved)

| Metric | Baseline (2026-10) | Target |
|--------|-------------------|--------|
| `fix:*args*` / `fix:*validate*` commits per quarter | ~15 in burst | Trend down |
| PR review loops on “wire run-all” | Observed on #48 | Zero (discovery + lint) |
| Time-to-green for new agent PR | Manual README lists | Single `npm test` + verify skill |
| SkillSpector TM/LP findings on release | 0 at #87 | Stay 0 |

---

## Open questions — answered with data (not surveys)

| Question | Answer |
|----------|--------|
| Should we add TypeScript? | **No first.** Pitfalls are CLI contracts and security, not type inference. Revisit if scripts exceed ~1.5k LOC per entry. |
| Monorepo package.json? | **Yes, minimal** — `{"scripts":{"test":"node tests/run-all.js","lint:agent":"node tests/lint/test-agent-contracts.js"}}` for agent discoverability. |
| Duplicate README test list? | **Remove** in favor of verification skill + `run-all.js` discovery (README keeps one aggregate command). |
| Protected vs portable tests? | **Split:** portable dummy token default; sentinel only in `test-secrets-migration.js` + normalize transport cases. |

---

## Suggested PR stack (draft only, do not merge)

1. `docs/agent-friendliness-plan.md` (this file)  
2. `verify-agent-skills` + `AGENTS.md` + test token fix  
3. `test.yml` + agent contract lint + `package.json`

Each PR body includes one line: **pstack interrogate / blast-radius:** &lt;result&gt;.

---

## References

- `design.md` — path canonicalization decision record (template for future security edits).
- `tests/notion-sync/test-simple-command-args.js` — pattern for “no api.notion.com in stderr”.
- pstack skills: `architect`, `create-verification-skill`, `interrogate`, `blast-radius`, `poteto-mode`.
