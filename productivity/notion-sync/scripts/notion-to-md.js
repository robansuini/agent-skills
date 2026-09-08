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
  extractTitle,
  stripTokenArg,
  hasJsonFlag,
  log,
  resolveSafePath,
} = require('./notion-utils.js');

/**
 * Fetch page metadata
 */
async function getPage(pageId) {
  const id = normalizeId(pageId);
  return notionRequest(`/v1/pages/${encodeURIComponent(id)}`, 'GET');
}

function extractPageTitle(page) {
  return extractTitle(page).replace(/^\(Untitled\)$/, 'Untitled');
}

async function main() {
  const args = stripTokenArg(process.argv.slice(2));
  const isHelp = args.includes('--help');

  if (isHelp || args.length < 1) {
    console.log('Usage: notion-to-md.js <page-id> [output-file] [--json] [--allow-unsafe-paths]');
    console.log('');
    console.log('Example:');
    console.log('  notion-to-md.js "abc123..." newsletter.md --json');
    process.exit(isHelp ? 0 : 1);
  }

  const unknownOption = args.find(arg => arg.startsWith('-'));
  const invalidArgument = unknownOption || args[2];
  if (invalidArgument) {
    const message = unknownOption
      ? `Unknown option: ${unknownOption}`
      : `Unexpected argument: ${invalidArgument}`;
    if (hasJsonFlag()) console.log(JSON.stringify({ error: message }, null, 2));
    else log(`Error: ${message}`);
    process.exit(1);
  }

  const [pageIdArg, outputFile = null] = args;
  const pageId = normalizeId(pageIdArg);

  let safeOutputFile = null;
  if (outputFile) {
    try {
      safeOutputFile = resolveSafePath(outputFile, { mode: 'write' });
    } catch (error) {
      if (hasJsonFlag()) console.log(JSON.stringify({ error: error.message }, null, 2));
      else log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  try {
    const page = await getPage(pageId);
    const title = extractPageTitle(page);

    const blocks = await getAllBlocks(pageId);
    const markdown = blocksToMarkdown(blocks);

    if (safeOutputFile) {
      const fs = require('fs');
      fs.writeFileSync(safeOutputFile, `# ${title}\n\n${markdown}`, 'utf8');
      if (!hasJsonFlag()) {
        log(`✓ Saved to ${safeOutputFile}`);
      }
    } else if (!hasJsonFlag()) {
      console.log(markdown);
    }

    const result = {
      markdown,
      pageId,
      title,
      lastEditedTime: page.last_edited_time,
      blockCount: blocks.length,
    };

    if (hasJsonFlag()) {
      console.log(JSON.stringify({ markdown, pageId }, null, 2));
    }

    return result;
  } catch (error) {
    if (hasJsonFlag()) {
      console.log(JSON.stringify({ error: error.message }, null, 2));
    } else {
      log(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  checkApiKey();
  main();
} else {
  // Re-export utilities for backwards compatibility (v1.0.x)
  // Prefer importing from notion-utils.js directly for new code
  module.exports = {
    getPage,
    main,
    extractPageTitle,
    getAllBlocks,
    blocksToMarkdown,
    normalizeId,
  };
}
