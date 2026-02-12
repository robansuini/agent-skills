#!/usr/bin/env node
/**
 * Inspect a Notion database schema (properties and types)
 *
 * Usage: get-database-schema.js <database-id>
 */

const { checkApiKey, notionRequest, stripTokenArg } = require('./notion-utils.js');

checkApiKey();

async function main() {
  const args = stripTokenArg(process.argv.slice(2));
  const dbId = args[0];

  if (!dbId || dbId === '--help') {
    console.error('Usage: get-database-schema.js <database-id>');
    process.exit(1);
  }

  try {
    const db = await notionRequest(`/v1/databases/${dbId}`, 'GET');
    console.log(JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
