#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/notion-to-md.js');

function run(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
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
  assert(!output.includes('Could not reach Notion API'), 'Should fail before making a Notion API request');
  assert(!output.includes('at main'), 'Should not print a raw stack trace');
}

function expectHelp(args) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for: ${args.join(' ')}. Got:\n${output}`);
  assert(output.includes('Usage: notion-to-md.js'), `Expected usage output. Got:\n${output}`);
}

expectHelp(['--help']);
expectHelp(['page-id', 'output.md', '-h']);
expectFailure([], 'Usage: notion-to-md.js');
expectFailure(['page-id', '--dry-run'], 'Unknown option: --dry-run');
expectFailure(['page-id', 'output.md', 'extra'], 'Unexpected argument: extra');
expectFailure(
  ['page-id', 'output.md', '--dry-run', '--json'],
  '"error": "Unknown option: --dry-run"'
);

console.log('All notion-to-md arg parsing tests passed.');
