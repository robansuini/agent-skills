#!/usr/bin/env node
/**
 * Add a markdown file as a page in a Notion database
 *
 * Usage: add-to-database.js <database-id> <page-title> <markdown-file-path>
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
    console.error('Usage: add-to-database.js <database-id> <page-title> <markdown-file-path>');
    console.error('');
    console.error('Example:');
    console.error('  add-to-database.js <db-id> "Research Report" research.md');
    process.exit(1);
  }

  const [dbId, title, mdPath] = args;

  if (!fs.existsSync(mdPath)) {
    console.error(`Error: File not found: ${mdPath}`);
    process.exit(1);
  }

  try {
    console.log('Adding page to database...');
    console.log(`  Database: ${dbId}`);
    console.log(`  Title: ${title}`);
    console.log(`  Source: ${mdPath}\n`);

    // Create database page
    const page = await notionRequest('/v1/pages', 'POST', {
      parent: { type: 'database_id', database_id: dbId },
      properties: {
        'Name': { title: [{ text: { content: title } }] }
      }
    });
    console.log(`✓ Page created: ${page.id}`);
    console.log(`  URL: https://notion.so/${page.id.replace(/-/g, '')}`);

    // Parse and upload content
    const markdown = fs.readFileSync(mdPath, 'utf8');
    const blocks = parseMarkdownToBlocks(markdown);
    console.log(`\nParsed ${blocks.length} blocks from markdown`);

    await appendBlocksBatched(page.id, blocks);

    console.log(`\n✅ Successfully added to database!`);
    console.log(`📄 URL: https://notion.so/${page.id.replace(/-/g, '')}`);
    console.log(`\n💡 Add additional properties (Type, Tags, Status) manually in Notion`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
