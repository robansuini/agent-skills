# Changelog

## 3.0.1 — 2026-09-08

### Security

- Declares environment, outbound-network, and local file capabilities in the
  AgentSkill manifest, including `NOTION_API_KEY` and `api.notion.com`.
- Expands the discovery description to disclose read, create, update, schema,
  batch-edit, and archive operations before invocation.
- Requires `--confirm-archive` before a page can be archived.

## 3.0.0 — 2026-09-08

### Breaking

- Removed `--token-file`, `--token-stdin`, and automatic
  `~/.notion-token` credential loading.
- Requires `NOTION_API_KEY` to be supplied by the host runtime's secret manager.

### Security

- Uses OpenClaw's protected `NOTION_API_KEY` secret with an exact
  `api.notion.com` destination binding.
- Routes `https.request` through Node's native proxy-aware `https.Agent`, so
  OpenClaw can substitute the protected credential only at authorized egress.
- Keeps the core client portable on Node.js 18+ while automatically enabling
  destination-bound protected egress for OpenClaw sentinels.
- Fails before network activity when an OpenClaw sentinel is present but the
  Gateway proxy, CA, or supported protected-mode Node runtime is unavailable.
- Fails legacy credential flags with migration guidance and avoids echoing
  inline legacy token values.

### Migration

- Added [references/MIGRATION-V3.md](references/MIGRATION-V3.md), covering
  protected-store setup, egress enablement, safe verification, legacy residue
  removal, token rotation guidance, and rollback to v2.5.3.
