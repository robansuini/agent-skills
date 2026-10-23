#!/usr/bin/env node

const { createCliHarness } = require('./cli-harness');

const { expectFailure, expectSuccess } = createCliHarness('update-page-properties.js', {
  forbiddenFailureOutput: ['Could not reach Notion API'],
});

expectSuccess(['-h'], 'Usage: update-page-properties.js');
expectSuccess(['--help'], 'Usage: update-page-properties.js');
expectFailure([], 'Usage: update-page-properties.js');
expectFailure(['page-id'], 'Usage: update-page-properties.js');
expectFailure(['page-id', 'Status'], 'Usage: update-page-properties.js');
expectFailure(['page-id', 'Status', 'Done', '--type'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--type', '--json'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--type', '--unknown'], '--type requires a value');
expectFailure(['page-id', 'Status', 'Done', '--unknown'], 'Unknown option: --unknown');
expectFailure(['page-id', 'Status', 'Done', 'extra'], 'Unexpected argument: extra');

console.log('All update-page-properties arg parsing tests passed.');
