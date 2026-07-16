#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const tests = [
  'tests/leadership-prompts/test-cli.js',
  'tests/notion-sync/test-normalize.js',
  'tests/notion-sync/test-query-database-args.js',
  'tests/notion-sync/test-search-notion-args.js',
  'tests/notion-sync/test-simple-command-args.js',
  'tests/notion-sync/test-update-page-properties-args.js',
];

for (const test of tests) {
  console.log(`\n▶ ${test}`);

  const result = spawnSync(process.execPath, [test], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    console.error(`Failed to run ${test}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log('\n✅ All tests passed.');
