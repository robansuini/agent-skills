# Migrating notion-sync from v1/v2 to v3

Version 3.0.0 moves Notion credentials into OpenClaw's protected secret store
and sends them through destination-bound Gateway egress. This is intentionally
breaking: the skill no longer reads `--token-file`, `--token-stdin`, or
`~/.notion-token`.

## Before upgrading

- Upgrade OpenClaw to 2026.9.1 or later.
- Use Node.js 24 or later.
- Keep notion-sync v2.5.3 installed until the v3 verification step succeeds.
- Ensure the Notion integration is shared only with the pages and databases it
  needs.

## 1. Store the token without exposing it

Preferred agent flow:

1. The agent lists secret metadata with the OpenClaw `secrets` tool.
2. If `NOTION_API_KEY` is missing, the agent requests it as a protected
   secret with `allowedHosts: ["api.notion.com"]`.
3. Enter the token only in OpenClaw's masked prompt or trusted Control UI.

Operator flow:

1. Open **Settings → Secrets**.
2. Add `NOTION_API_KEY` as a **Protected secret**.
3. Set the exact allowed host to `api.notion.com`.

Never paste the token into chat. Never put it in a command, URL, repository,
`.env` file, or skill configuration as plaintext.

## 2. Enable protected egress

```bash
openclaw config set secrets.egressProxy.enabled true --strict-json
openclaw gateway restart
```

The proxy gives Gateway-hosted commands an opaque `NOTION_API_KEY` sentinel.
The real value is substituted only when a request goes to the allowed HTTPS
host. No host binding means no substitution.

If you manage skill configuration directly, `metadata.openclaw.primaryEnv`
maps the skill's `apiKey` field to `NOTION_API_KEY`; use the protected
store SecretRef returned by OpenClaw, never a plaintext value.

## 3. Verify v3

Start a new agent run after saving or changing the secret. Ask the agent to
perform a read-only search, for example:

> Search Notion for a page title I know exists.

Verification is complete when:

- the command uses Gateway-hosted exec;
- no credential appears in chat, logs, commands, or process arguments;
- the request reaches only `api.notion.com`; and
- the expected Notion result is returned.

Do not verify by printing `NOTION_API_KEY` or inspecting the command
environment.

## 4. Remove legacy residue

Only after v3 works:

- remove old `--token-file` and `--token-stdin` arguments from scripts,
  automations, and documentation;
- remove `NOTION_API_KEY` plaintext exports from shell profiles, service
  environments, `.env` files, and CI settings no longer in use;
- securely remove obsolete `~/.notion-token` and other token files; and
- run `openclaw secrets audit --check`.

If the token may have appeared in chat, shell history, logs, process listings,
or source control, rotate it in Notion after migration.

## Rollback

Pin notion-sync v2.5.3 while diagnosing the OpenClaw setup. Do not restore a
plaintext token as a workaround. Recheck the protected entry's host binding,
the egress proxy setting, Gateway restart, execution host, and fresh-run
snapshot before retrying v3.

## Removed credential sources

| v1/v2 source | v3 action |
| --- | --- |
| bare `--token` | already unsupported; use protected `NOTION_API_KEY` |
| `--token-file <path>` | migrate file contents through masked secret entry, then remove file |
| `--token-stdin` | use the OpenClaw `secrets` request flow |
| automatic `~/.notion-token` | migrate, verify, then securely remove |
| plaintext shell/service env | replace with protected store entry and destination binding |
