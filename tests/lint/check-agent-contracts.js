#!/usr/bin/env node

/**
 * Static checks that catch common agent regressions in notion-sync entrypoints.
 * Run: node tests/lint/check-agent-contracts.js
 *
 * Not named test-*.js so tests/run-all.js does not execute this file.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const scriptsDir = path.join(repoRoot, 'productivity/notion-sync/scripts');

const BARE_TOKEN_ARG_PATTERNS = [
  /\.includes\(\s*['"]--token['"]\s*\)/,
  /===\s*['"]--token['"]/,
  /==\s*['"]--token['"]/,
  /\.startsWith\(\s*['"]--token=/,
  /Set\(\s*\[[^\]]*['"]--token['"]/,
  /case\s+['"]--token['"]\s*:/,
];

function introducesBareTokenArgvParsing(source) {
  return BARE_TOKEN_ARG_PATTERNS.some((pattern) => pattern.test(source));
}

const entrypoints = fs
  .readdirSync(scriptsDir)
  .filter((name) => name.endsWith('.js') && name !== 'notion-utils.js')
  .map((name) => path.join(scriptsDir, name));

let failures = 0;

for (const file of entrypoints) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(repoRoot, file);

  try {
    assert(
      source.includes('stripTokenArg'),
      `${rel}: must call stripTokenArg for argv normalization`
    );
    assert(
      source.includes('checkApiKey'),
      `${rel}: must call checkApiKey() so missing credentials fail predictably`
    );
    assert(
      !introducesBareTokenArgvParsing(source),
      `${rel}: must not parse bare --token from argv (use NOTION_API_KEY only)`
    );
  } catch (err) {
    console.error(`✗ ${err.message}`);
    failures += 1;
  }
}

const simpleArgsTest = path.join(repoRoot, 'tests/notion-sync/test-simple-command-args.js');
const simpleSource = fs.readFileSync(simpleArgsTest, 'utf8');
if (simpleSource.includes('oc-sent-v2.test-fixture.end')) {
  console.error(
    '✗ test-simple-command-args.js: use ntn_dummy_token_for_tests for portable CLI tests (sentinel needs Node 22.21+)'
  );
  failures += 1;
}

if (failures > 0) {
  console.error(`\n${failures} agent contract check(s) failed.`);
  process.exit(1);
}

console.log(`✅ Agent contract checks passed (${entrypoints.length} notion entrypoints).`);
