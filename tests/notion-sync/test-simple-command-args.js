#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');

function run(scriptName, args) {
  return spawnSync('node', [
    path.join(repoRoot, 'productivity/notion-sync/scripts', scriptName),
    ...args,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      NOTION_API_KEY: 'ntn_dummy_token_for_tests',
    },
  });
}

function expectFailure(scriptName, args, expectedSubstring) {
  const result = run(scriptName, args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.notStrictEqual(result.status, 0, `Expected non-zero exit for ${scriptName}: ${args.join(' ')}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );
  assert(!output.includes('api.notion.com'), 'Should fail before making a Notion API request');
}

function expectSuccess(scriptName, args, expectedSubstring) {
  const result = run(scriptName, args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for ${scriptName}: ${args.join(' ')}. Got:\n${output}`);
  assert(
    output.includes(expectedSubstring),
    `Expected output to include "${expectedSubstring}". Got:\n${output}`
  );
}

expectSuccess('delete-notion-page.js', ['-h'], 'Usage: delete-notion-page.js');
expectFailure('delete-notion-page.js', ['page-id', '--unknown'], 'Unknown option: --unknown');
expectFailure('delete-notion-page.js', ['page-id', 'extra'], 'Unexpected argument: extra');
expectFailure('delete-notion-page.js', ['page-id', '--unknown', '--json'], '"error"');

expectSuccess('get-database-schema.js', ['-h'], 'Usage: get-database-schema.js');
expectFailure('get-database-schema.js', ['db-id', '--unknown'], 'Unknown option: --unknown');
expectFailure('get-database-schema.js', ['db-id', 'extra'], 'Unexpected argument: extra');
expectFailure('get-database-schema.js', ['db-id', 'extra', '--json'], '"error"');

console.log('All simple command arg parsing tests passed.');
