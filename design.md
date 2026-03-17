# design.md — notion-sync safe write-path canonicalization

## Context
`resolveSafePath(..., { mode: 'write' })` currently resolves only the immediate parent when the full path does not exist. If the path includes a symlink ancestor plus missing deeper directories, lexical checks can incorrectly treat it as in-workspace even though writes resolve outside workspace.

## Decision
For non-existent write paths:
1. Walk up to the nearest existing ancestor.
2. Resolve that ancestor via `fs.realpathSync`.
3. Rebuild candidate path as `realAncestor + remainder`.
4. Enforce existing workspace-boundary check on canonicalized candidate.

## Why this is enough
- Closes symlink-ancestor escape path while preserving normal writes.
- Keeps current CLI contract (`--allow-unsafe-paths` remains explicit override).
- Small isolated change (utility + tests), low blast radius.

## Validation
- Add regression tests for:
  - nested in-workspace write path (allowed),
  - symlink-ancestor escape write path (blocked),
  - same escape path with `--allow-unsafe-paths` (allowed).
