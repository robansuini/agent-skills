#!/usr/bin/env node
/**
 * Notion page to Markdown converter
 * Fetches a Notion page and converts blocks to markdown
 *
 * Usage: notion-to-md.js <page-id> [output-file]
 */

const {
  checkApiKey,
  notionRequest,
  normalizeId,
  getAllBlocks,
  blocksToMarkdown,
} = require('./notion-utils.js');

/**
 * Fetch page metadata
 */
async function getPage(pageId) {
  const id = normalizeId(pageId);
  return notionRequest(`/v1/pages/${encodeURIComponent(id)}`, 'GET');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args[0] === '--help') {
    console.error('Usage: notion-to-md.js <page-id> [output-file]');
    console.error('');
    console.error('Example:');
    console.error('  notion-to-md.js "abc123..." newsletter.md');
    process.exit(1);
  }

  const pageId = normalizeId(args[0]);
  const outputFile = args[1] || null;

  try {
    const page = await getPage(pageId);
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';

    const blocks = await getAllBlocks(pageId);
    const markdown = blocksToMarkdown(blocks);

    if (outputFile) {
      const fs = require('fs');
      fs.writeFileSync(outputFile, `# ${title}\n\n${markdown}`, 'utf8');
      console.log(`✓ Saved to ${outputFile}`);
    } else {
      console.log(markdown);
    }

    return { title, lastEditedTime: page.last_edited_time, markdown, blockCount: blocks.length };
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkApiKey();
  main();
} else {
  // Re-export utilities for backwards compatibility (v1.0.x)
  // Prefer importing from notion-utils.js directly for new code
  module.exports = { getPage, main, getAllBlocks, blocksToMarkdown, normalizeId };
}
