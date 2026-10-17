# Full test suite

## Sub-features

- Auto-discovered `tests/**/test-*.js`
- Notion-sync argument contracts (mocked HTTP)
- Leadership schema + CLI

## How to get to it (user POV)

Clone repo, `cd` to root, ensure Node 18+.

## Driving it with shell

```bash
npm test 2>&1 | tee /tmp/verify-agent-skills-evidence/run-all.log
```

## Gotchas

- Protected OpenClaw sentinel tests need Node 22.21+ / 24.5+ / 25+; use doctor in the skill.
- CLI arg tests must use `ntn_dummy_token_for_tests`, not `oc-sent-v2.*`, unless testing protected transport.
