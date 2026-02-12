#!/usr/bin/env node
/**
 * Archive (soft-delete) a Notion page
 *
 * Usage: delete-notion-page.js <page-id>
 */

const { checkApiKey, notionRequest } = require('./notion-utils.js');

checkApiKey();

async function main() {
  const pageId = process.argv[2];

  if (!pageId || pageId === '--help') {
    console.error('Usage: delete-notion-page.js <page-id>');
    console.error('');
    console.error('Note: This archives the page (sets archived: true), not permanent deletion.');
    process.exit(1);
  }

  try {
    console.log(`Archiving page: ${pageId}`);
    const result = await notionRequest(`/v1/pages/${pageId}`, 'PATCH', { archived: true });
    console.log('✓ Page archived successfully');
    console.log(`  Page ID: ${result.id}`);
    console.log(`  Archived: ${result.archived}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
