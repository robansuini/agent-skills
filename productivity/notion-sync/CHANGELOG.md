# Changelog

## 3.0.0 — 2026-09-08

### Breaking

- Removed `--token-file`, `--token-stdin`, and automatic
  `~/.notion-token` credential loading.
- Requires OpenClaw 2026.9.1+, Node.js 22.21+/24.5+/25+, and Gateway-hosted execution for
  the protected-secret workflow.

### Security

- Uses OpenClaw's protected `NOTION_API_KEY` secret with an exact
  `api.notion.com` destination binding.
- Routes `https.request` through Node's native proxy-aware `https.Agent`, so
  OpenClaw can substitute the protected credential only at authorized egress.
- Rejects plaintext `NOTION_API_KEY` values and fails before network activity
  when the Gateway proxy, CA, or supported Node runtime is unavailable.
- Fails legacy credential flags with migration guidance and avoids echoing
  inline legacy token values.

### Migration

- Added [references/MIGRATION-V3.md](references/MIGRATION-V3.md), covering
  protected-store setup, egress enablement, safe verification, legacy residue
  removal, token rotation guidance, and rollback to v2.5.3.
