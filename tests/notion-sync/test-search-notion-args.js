#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('search-notion.js', {
  forbiddenFailureOutput: ['SyntaxError:', 'at main'],
});

expectSuccess(['-h'], 'Usage: search-notion.js', 'Searching for:');
expectFailure(['query', '--filter'], '--filter requires page or database');
expectFailure(['query', '--filter', 'workspace'], '--filter must be page or database');
expectFailure(['query', '--limit'], '--limit must be a positive integer');
expectFailure(['query', '--limit', 'abc'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--limit', '0'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--limit', '101'], '--limit must be a positive integer between 1 and 100');
expectFailure(['query', '--sort', 'title'], 'Unknown option: --sort');
expectFailure(['query', 'extra'], 'Unexpected argument: extra');

console.log('All search-notion arg parsing tests passed.');
