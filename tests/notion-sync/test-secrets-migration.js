#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptsDir = path.join(repoRoot, 'productivity/notion-sync/scripts');
const searchScript = path.join(scriptsDir, 'search-notion.js');

function runSearch(args) {
  return spawnSync(process.execPath, [searchScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, NOTION_API_KEY: '' },
  });
}

for (const args of [
  ['query', '--token', 'legacy-value'],
  ['query', '--token=legacy-value'],
  ['query', '--token-file', '/tmp/legacy-token'],
  ['query', '--token-stdin'],
]) {
  const result = runSearch(args);
  const output = (result.stdout || '') + (result.stderr || '');
  assert.notStrictEqual(result.status, 0, `Expected migration failure for ${args.join(' ')}`);
  assert(output.includes('notion-sync v3 no longer accepts CLI or file-based tokens'));
  assert(output.includes('references/MIGRATION-V3.md'));
  assert(!output.includes('Could not reach Notion API'));
  assert(!output.includes('at checkApiKey'));
  assert(!output.includes('legacy-value'));
}

{
  const result = runSearch(['query', '--token-file', '/tmp/legacy-token', '--json']);
  const parsed = JSON.parse(result.stdout);
  assert.notStrictEqual(result.status, 0);
  assert(parsed.error.includes('--token-file is not supported'));
}

async function testProtectedSentinelTransport() {
  const sentinel = 'oc-sent-v2.test-value.end';
  process.env.NOTION_API_KEY = sentinel;

  let request = null;
  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ results: [] }),
    };
  };

  const { notionRequest, _resetTokenCache } = require(path.join(scriptsDir, 'notion-utils.js'));
  _resetTokenCache();

  const response = await notionRequest('/v1/search', 'POST', { query: 'roadmap' });
  assert.deepStrictEqual(response, { results: [] });
  assert.strictEqual(request.url, 'https://api.notion.com/v1/search');
  assert.strictEqual(request.options.method, 'POST');
  assert.strictEqual(request.options.headers.Authorization, `Bearer ${sentinel}`);
  assert.strictEqual(request.options.body, JSON.stringify({ query: 'roadmap' }));
}

testProtectedSentinelTransport()
  .then(() => console.log('All protected-secret migration tests passed.'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
