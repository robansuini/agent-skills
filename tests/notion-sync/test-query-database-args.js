#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('query-database.js', {
  forbiddenFailureOutput: ['SyntaxError:', 'at JSON.parse'],
});

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
