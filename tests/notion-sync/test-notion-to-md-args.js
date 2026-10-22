#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('notion-to-md.js', {
  forbiddenFailureOutput: ['Could not reach Notion API', 'at main'],
});

expectSuccess(['--help'], 'Usage: notion-to-md.js');
expectSuccess(['page-id', 'output.md', '-h'], 'Usage: notion-to-md.js');
expectFailure([], 'Usage: notion-to-md.js');
expectFailure(['page-id', '--dry-run'], 'Unknown option: --dry-run');
expectFailure(['page-id', 'output.md', 'extra'], 'Unexpected argument: extra');
expectFailure(
  ['page-id', 'output.md', '--dry-run', '--json'],
  '"error": "Unknown option: --dry-run"'
);

console.log('All notion-to-md arg parsing tests passed.');
