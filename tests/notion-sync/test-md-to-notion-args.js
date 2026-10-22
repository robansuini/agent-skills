#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('md-to-notion.js', {
  forbiddenFailureOutput: ['File not found', 'at main'],
});

expectSuccess(['--help'], 'Usage: md-to-notion.js');
expectSuccess(['draft.md', 'parent-id', 'Title', '-h'], 'Usage: md-to-notion.js');
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
