# Agent Skills

A collection of skills for AI agents following the [Agent Skills](https://agentskills.io/) format. Skills are packaged instructions and scripts that extend agent capabilities across compatible platforms (Claude Code, OpenClaw, Windsurf, etc.).

Skills are organized by category for easy discovery.

## Available Skills

### Productivity

#### notion-sync

Bi-directional sync and management for Notion pages and databases. Enables collaborative editing, research tracking, and project management through seamless markdown ↔ Notion integration.

**Use when:**
- Working with Notion workspaces for collaborative editing
- Syncing markdown files to/from Notion pages
- Monitoring Notion pages for changes
- Managing research databases or project tracking
- Converting between markdown and Notion formats

**Key features:**
- **Markdown → Notion**: Push local markdown files to Notion with full formatting support (headings, lists, code blocks, links)
- **Notion → Markdown**: Pull Notion content back to local markdown files
- **Change detection**: Monitor pages for edits with automatic state tracking
- **Database management**: Search, query, and update database pages with filters and sorting
- **Property updates**: Set status, tags, dates, and other database properties programmatically

**Example workflows** (start from repository root):

```bash
# Move into the notion-sync skill once
cd productivity/notion-sync

# Push draft to Notion for collaborative editing
node scripts/md-to-notion.js "draft.md" "<parent-id>" "Draft Title"

# Monitor for changes
node scripts/watch-notion.js "<page-id>" "draft.md"

# Pull updates back
node scripts/notion-to-md.js "<page-id>" "draft-updated.md"

# Search workspace
node scripts/search-notion.js "newsletter"

# Query database with filters
node scripts/query-database.js "<db-id>" \
  --filter '{"property": "Status", "select": {"equals": "Complete"}}'

# Update page properties
node scripts/update-page-properties.js "<page-id>" Status "Published" --type select
```

**Supported formatting:**
- Headings (H1-H3)
- Bold/italic text  
- Links
- Bullet lists
- Code blocks with syntax highlighting
- Horizontal dividers

### Leadership

#### leadership-prompts

Curated library of 25+ practical prompts for engineering leaders covering 1-on-1 prep, team health, retrospectives, technical strategy, hiring, career development, and stakeholder communication.

**Use when:**
- Preparing for non-routine 1-on-1s or difficult feedback conversations
- Running post-incident retrospectives with clear follow-through
- Planning quarterly technical strategy or architecture direction
- Structuring hiring and promotion decisions
- Writing concise, high-signal stakeholder updates

**Key features:**
- **Prompt library**: Battle-tested prompts with real-world leadership context
- **Fast discovery CLI**: List categories, search by keyword, and fetch random prompts
- **Structured outputs**: Prompts are designed to produce meeting-ready artifacts
- **Placeholder variables**: Easy adaptation to your exact team and scenario

**Example workflows** (start from repository root):

```bash
# Move into the leadership-prompts skill once
cd leadership/leadership-prompts

# List prompt categories
node scripts/leadership-prompts.js list

# Search by keyword
node scripts/leadership-prompts.js search "promotion"

# Get one random prompt
node scripts/leadership-prompts.js random

# Show a specific prompt
node scripts/leadership-prompts.js show career-dev-promotion
```

## Installation

### For OpenClaw

```bash
# Clone or download this repository to your workspace
cd ~/your-workspace
git clone https://github.com/robansuini/agent-skills.git

# Skills are automatically discovered by OpenClaw agents
```

### For Claude Code / Other Agents

Skills following the Agent Skills format are automatically discoverable when placed in the appropriate skills directory for your agent platform.

## Usage

Skills are automatically available once installed. Agents will use them when relevant tasks are detected.

**Examples:**

```
"Sync this draft to Notion so we can collaborate"
"Check if the Notion page has been updated"
"Pull the latest version from Notion"
"Search my Notion workspace for AI-related pages"
"Update the status to Complete in the research database"
```

## Repository Structure

Skills are organized by category:

```
agent-skills/
├── productivity/
│   └── notion-sync/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── leadership/
│   └── leadership-prompts/
│       ├── SKILL.md
│       ├── prompts.json
│       └── scripts/
├── development/     (coming soon)
├── communication/   (coming soon)
└── research/        (coming soon)
```

Each skill follows the agentskills.io format:

```
skill-name/
├── SKILL.md          # Instructions with YAML frontmatter
├── scripts/          # Executable code (optional)
└── references/       # Additional documentation (optional)
```

## Requirements

### Notion Integration Setup

1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Store it securely in your environment (or use `--token-file` / `--token-stdin` in scripts):
   ```bash
   export NOTION_API_KEY="your-token-here"
   ```
5. Share your Notion pages/databases with the integration

### Node.js

Scripts require Node.js v18+ (uses built-in modules only, no npm install needed).

## Contributing

Contributions are welcome! To add a new skill:

1. Fork this repository
2. Create a new directory with your skill name
3. Add `SKILL.md` with proper YAML frontmatter
4. Include scripts and references as needed
5. Update this README with skill description
6. Submit a pull request

## License

MIT - See [LICENSE](LICENSE) for details.

## Maintainers

- [@robansuini](https://github.com/robansuini) - Roberto Ansuini
- [@axos-ai](https://github.com/axos-ai) - Axos AI Assistant

## Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Agent Skills GitHub](https://github.com/agentskills/agentskills)
- [Example Skills](https://github.com/anthropics/skills)
