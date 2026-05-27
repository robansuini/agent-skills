#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/search-notion.js');

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

  assert(!output.includes('SyntaxError:'), 'Should not print a raw SyntaxError stack trace');
  assert(!output.includes('at main'), 'Should not print a raw stack trace');
}

expectFailure(['query', '--filter'], '--filter requires page or database');
expectFailure(['query', '--filter', 'workspace'], '--filter must be page or database');
expectFailure(['query', '--limit'], '--limit requires a positive integer');
expectFailure(['query', '--limit', 'abc'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--limit', '0'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--limit', '101'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--sort', 'title'], 'Unknown option: --sort');
expectFailure(['query', 'extra'], 'Unexpected argument: extra');

console.log('All search-notion arg parsing tests passed.');
