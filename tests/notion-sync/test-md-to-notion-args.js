#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'productivity/notion-sync/scripts/md-to-notion.js');

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
  assert(!output.includes('File not found'), 'Argument validation should run before file access');
  assert(!output.includes('at main'), 'Should not print a raw stack trace');
}

function expectHelp(args) {
  const result = run(args);
  const output = (result.stdout || '') + (result.stderr || '');

  assert.strictEqual(result.status, 0, `Expected zero exit for: ${args.join(' ')}. Got:\n${output}`);
  assert(output.includes('Usage: md-to-notion.js'), `Expected usage output. Got:\n${output}`);
}

expectHelp(['--help']);
expectHelp(['draft.md', 'parent-id', 'Title', '-h']);
expectFailure([], 'Usage: md-to-notion.js');
expectFailure(['draft.md', 'parent-id'], 'Usage: md-to-notion.js');
expectFailure(
  ['draft.md', 'parent-id', 'Title', '--dry-run'],
  'Unknown option: --dry-run'
);
expectFailure(
  ['draft.md', 'parent-id', 'Title', 'extra'],
  'Unexpected argument: extra'
);
expectFailure(
  ['draft.md', 'parent-id', 'Title', '--dry-run', '--json'],
  '"error": "Unknown option: --dry-run"'
);

console.log('All md-to-notion arg parsing tests passed.');
