#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/query-database.js');

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

function expectFailure(args, expectedSubstring, forbiddenSubstring = null) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.notStrictEqual(result.status, 0, `Expected non-zero exit for: ${args.join(' ')}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );

  // Ensure we didn't crash with an uncaught exception / stack trace.
  assert(!output.includes('SyntaxError:'), 'Should not print a raw SyntaxError stack trace');
  assert(!output.includes('at JSON.parse'), 'Should not print JSON.parse stack trace');
  if (forbiddenSubstring) {
    assert(
      !output.includes(forbiddenSubstring),
      `Expected output not to include "${forbiddenSubstring}". Got:\n${output}`
    );
  }
}

function expectSuccess(args, expectedSubstring, forbiddenSubstring = null) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for: ${args.join(' ')}. Got:\n${output}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );

  if (forbiddenSubstring) {
    assert(
      !output.includes(forbiddenSubstring),
      `Expected output not to include "${forbiddenSubstring}". Got:\n${output}`
    );
  }
}

expectSuccess(['-h'], 'Usage: query-database.js', 'Fetching database info');
expectFailure(['db-id', '--filter', '{not-json'], 'Invalid JSON for --filter');
expectFailure(['db-id', '--sort', '{not-json'], 'Invalid JSON for --sort');
expectFailure(['db-id', '--filter'], '--filter requires a JSON value');
expectFailure(['db-id', '--sort'], '--sort requires a JSON value');
expectFailure(['db-id', '--limit'], '--limit must be a positive integer');
expectFailure(['db-id', '--limit', 'abc'], '--limit must be a positive integer between 1 and 100');
expectFailure(['db-id', '--limit', '0'], '--limit must be a positive integer between 1 and 100');
expectFailure(
  ['db-id', '--limit', '101'],
  '--limit must be a positive integer between 1 and 100',
  'Fetching database info'
);
expectFailure(['db-id', '--unknown'], 'Unknown option: --unknown');
expectFailure(['db-id', 'extra'], 'Unexpected argument: extra');
expectFailure(
  ['db-id', '--json'],
  '"error"',
  'Unknown option: --json'
);

console.log('All query-database arg parsing tests passed.');
