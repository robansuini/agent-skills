# Leadership prompts CLI

## Sub-features

- `list`, `random`, `search`, `show`, `category`

## How to get to it (user POV)

From repo root:

```bash
node leadership/leadership-prompts/scripts/leadership-prompts.js list
```

## Driving it with shell

```bash
node leadership/leadership-prompts/scripts/leadership-prompts.js random > /tmp/verify-agent-skills-evidence/leadership-random.txt
echo exit:$?
```

## Gotchas

- Ambiguous category names exit non-zero with suggestions (by design).
