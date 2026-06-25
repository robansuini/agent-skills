#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/update-page-properties.js');

function run(args) {
  return spawnSync('node', [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      NOTION_API_KEY: 'ntn_dummy_token_for_tests',
    },
  });
}

function expectFailure(args, expectedSubstring) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.notStrictEqual(result.status, 0, `Expected non-zero exit for: ${args.join(' ')}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );

  assert(!output.includes('Could not reach Notion API'), 'Should fail before attempting a network request');
}

function expectSuccess(args, expectedSubstring) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for: ${args.join(' ')}. Got:\n${output}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );
}

expectSuccess(['--help'], 'Usage: update-page-properties.js');
expectFailure([], 'Usage: update-page-properties.js');
expectFailure(['page-id'], 'Usage: update-page-properties.js');
expectFailure(['page-id', 'Status'], 'Usage: update-page-properties.js');
expectFailure(['page-id', 'Status', 'Done', '--type'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--type', '--json'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--type', '--unknown'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--unknown'], 'Unknown option: --unknown');
expectFailure(['page-id', 'Status', 'Done', 'extra'], 'Unexpected argument: extra');

console.log('All update-page-properties arg parsing tests passed.');
