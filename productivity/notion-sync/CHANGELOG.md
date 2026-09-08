# Changelog

## 3.0.0 — 2026-09-08

### Breaking

- Removed `--token-file`, `--token-stdin`, and automatic
  `~/.notion-token` credential loading.
- Requires OpenClaw 2026.9.1+, Node.js 24+, and Gateway-hosted execution for
  the protected-secret workflow.

### Security

- Uses OpenClaw's protected `NOTION_API_KEY` secret with an exact
  `api.notion.com` destination binding.
- Replaced `https.request` with proxy-aware global `fetch`, so OpenClaw can
  substitute the protected credential only at authorized egress.
- Fails legacy credential flags with migration guidance and avoids echoing
  inline legacy token values.

### Migration

- Added [references/MIGRATION-V3.md](references/MIGRATION-V3.md), covering
  protected-store setup, egress enablement, safe verification, legacy residue
  removal, token rotation guidance, and rollback to v2.5.3.
