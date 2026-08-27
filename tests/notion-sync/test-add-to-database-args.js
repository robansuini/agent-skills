#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/add-to-database.js');

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

function expectSuccess(args, expectedSubstring) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for: ${args.join(' ')}. Got:\n${output}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );
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

expectSuccess(['--help'], 'Usage: add-to-database.js');
expectSuccess(['-h'], 'Usage: add-to-database.js');
expectSuccess(['--json', '--help'], 'Usage: add-to-database.js');
expectFailure(['db-id', 'Title', 'input.md', '--unknown'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', 'input.md', '--unknown', '--json'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', '--unknown'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', 'input.md', 'extra'], 'Unexpected argument: extra');

console.log('All add-to-database arg parsing tests passed.');
