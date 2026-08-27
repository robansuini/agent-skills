#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

function discoverTests(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return discoverTests(entryPath);
    if (entry.isFile() && /^test-.*\.js$/.test(entry.name)) return [entryPath];
    return [];
  });
}

const tests = discoverTests(__dirname)
  .map((test) => path.relative(repoRoot, test))
  .sort();

for (const test of tests) {
  console.log(`\n▶ ${test}`);

  const result = spawnSync(process.execPath, [test], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    console.error(`Failed to run ${test}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log('\n✅ All tests passed.');
