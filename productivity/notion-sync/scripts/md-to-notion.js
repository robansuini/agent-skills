#!/usr/bin/env node
/**
 * Markdown to Notion page converter
 * Parses markdown and creates a Notion page with formatted blocks
 *
 * Usage: md-to-notion.js <markdown-file> <parent-page-id> <page-title>
 */

const fs = require('fs');
const {
  checkApiKey,
  notionRequest,
  parseMarkdownToBlocks,
  appendBlocksBatched,
} = require('./notion-utils.js');

checkApiKey();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3 || args[0] === '--help') {
    console.error('Usage: md-to-notion.js <markdown-file> <parent-page-id> <page-title>');
    console.error('');
    console.error('Example:');
    console.error('  md-to-notion.js draft.md "abc123..." "Newsletter Draft"');
    process.exit(1);
  }

  const [mdFile, parentId, pageTitle] = args;

  if (!fs.existsSync(mdFile)) {
    console.error(`Error: File not found: ${mdFile}`);
    process.exit(1);
  }

  try {
    const markdown = fs.readFileSync(mdFile, 'utf8');
    const blocks = parseMarkdownToBlocks(markdown, { richText: 'markdown' });

    console.log(`Parsed ${blocks.length} blocks from markdown`);

    // Create page with first 100 blocks
    const page = await notionRequest('/v1/pages', 'POST', {
      parent: { page_id: parentId },
      properties: {
        title: { title: [{ text: { content: pageTitle } }] }
      },
      children: blocks.slice(0, 100)
    });
    console.log(`✓ Created page: ${page.url}`);

    // Append remaining blocks in batches
    if (blocks.length > 100) {
      await appendBlocksBatched(page.id, blocks.slice(100));
      console.log(`✓ Appended ${blocks.length - 100} remaining blocks`);
    }

    console.log(`\n✅ Successfully created Notion page!`);
    console.log(`📄 URL: ${page.url}`);
    console.log(`🆔 Page ID: ${page.id}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
