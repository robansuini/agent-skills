#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptsDir = path.join(repoRoot, 'productivity/notion-sync/scripts');
const sourcePath = path.join(scriptsDir, 'notion-utils.js');
const searchScript = path.join(scriptsDir, 'search-notion.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const sentinel = 'oc-sent-v2.test-fixture.end';

function runSearch(args) {
  return spawnSync(process.execPath, [searchScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, NOTION_API_KEY: '' },
  });
}

function fixture({ env = {}, version = '24.13.0', status = 200 } = {}) {
  const requests = [];
  let reads = 0;
  const context = {
    module: { exports: {} },
    console,
    process: {
      argv: ['node', 'check.js', '--token-file', '/old-token'],
      env,
      versions: { node: version },
    },
    Buffer,
    require(id) {
      if (id === 'fs') {
        return {
          existsSync: () => true,
          readFileSync: () => { reads++; return 'old-file-token'; },
        };
      }
      if (id === 'https') {
        return {
          Agent: class { constructor(options) { this.options = options; } },
          request(options, callback) {
            requests.push(options);
            const request = new EventEmitter();
            request.write = () => {};
            request.end = () => {
              const response = new EventEmitter();
              response.statusCode = status;
              callback(response);
              response.emit('data', JSON.stringify({ object: 'user', message: 'rejected' }));
              response.emit('end');
            };
            return request;
          },
        };
      }
      return require(id);
    },
  };
  vm.runInNewContext(source, context, { filename: sourcePath });
  return { api: context.module.exports, requests, reads: () => reads };
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

(async () => {
  const env = {
    NOTION_API_KEY: sentinel,
    HTTPS_PROXY: 'http://127.0.0.1:12345',
    NODE_EXTRA_CA_CERTS: '/gateway/ca.pem',
    NO_PROXY: '*',
    https_proxy: 'http://wrong-proxy:12345',
  };

  for (const version of ['22.21.0', '24.5.0', '24.13.0', '25.0.0']) {
    const current = fixture({ env, version });
    assert.equal(current.api.getApiKey(), sentinel);
    assert.equal(current.reads(), 0, 'protected mode must not read a legacy token file');
    assert.equal((await current.api.notionRequest('/v1/users/me', 'GET')).object, 'user');
    assert.equal(current.requests[0].hostname, 'api.notion.com');
    assert.equal(current.requests[0].headers.Authorization, `Bearer ${sentinel}`);
    assert.equal(current.requests[0].agent.options.proxyEnv.HTTPS_PROXY, env.HTTPS_PROXY);
    assert.equal(current.requests[0].agent.options.proxyEnv.NO_PROXY, undefined);
    assert.equal(current.requests[0].agent.options.proxyEnv.https_proxy, undefined);
  }

  for (const options of [
    { env, version: '18.20.0' },
    { env, version: '22.20.0' },
    { env, version: '24.4.0' },
    { env: { ...env, HTTPS_PROXY: '' } },
    { env: { ...env, NODE_EXTRA_CA_CERTS: '' } },
  ]) {
    const current = fixture(options);
    await assert.rejects(current.api.notionRequest('/v1/users/me', 'GET'), /Gateway-hosted exec/);
    assert.equal(current.requests.length, 0, 'must fail before network activity');
  }

  const portable = fixture({
    env: { NOTION_API_KEY: 'secret-manager-test-value' },
    version: '18.20.0',
  });
  assert.equal((await portable.api.notionRequest('/v1/users/me', 'GET')).object, 'user');
  assert.equal(portable.requests[0].headers.Authorization, 'Bearer secret-manager-test-value');
  assert.equal(portable.requests[0].agent, undefined, 'portable credentials use normal HTTPS transport');

  const malformedSentinel = fixture({
    env: { ...env, NOTION_API_KEY: 'oc-sent-v2.incomplete' },
  });
  await assert.rejects(malformedSentinel.api.notionRequest('/v1/users/me', 'GET'), /valid NOTION_API_KEY sentinel/);
  assert.equal(malformedSentinel.requests.length, 0, 'malformed sentinels must fail before network activity');

  const rejected = fixture({ env, status: 401 });
  await assert.rejects(rejected.api.notionRequest('/v1/users/me', 'GET'), /Authentication failed/);

  console.log('All protected-secret migration tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
