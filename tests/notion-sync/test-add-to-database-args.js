#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('add-to-database.js', {
  forbiddenFailureOutput: ['Could not reach Notion API'],
});

expectSuccess(['--help'], 'Usage: add-to-database.js');
expectSuccess(['-h'], 'Usage: add-to-database.js');
expectSuccess(['--json', '--help'], 'Usage: add-to-database.js');
expectFailure(['db-id', 'Title', 'input.md', '--unknown'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', 'input.md', '--unknown', '--json'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', '--unknown'], 'Unknown option: --unknown');
expectFailure(['db-id', 'Title', 'input.md', 'extra'], 'Unexpected argument: extra');

console.log('All add-to-database arg parsing tests passed.');
