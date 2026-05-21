#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'leadership/leadership-prompts/scripts/leadership-prompts.js');

function run(args) {
  return spawnSync('node', [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function expectSuccess(args, checks) {
  const result = run(args);
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }

  assert.strictEqual(result.status, 0, `${args.join(' ')} should exit 0`);
  for (const check of checks) {
    assert.ok(check(result.stdout), `${args.join(' ')} output check failed`);
  }
}

function expectFailure(args, checks) {
  const result = run(args);
  assert.notStrictEqual(result.status, 0, `${args.join(' ')} should exit non-zero`);
  for (const check of checks) {
    assert.ok(check(result.stdout + result.stderr), `${args.join(' ')} failure output check failed`);
  }
}

expectSuccess([], [
  output => output.includes('Leadership Prompts CLI'),
  output => output.includes('Usage:'),
]);

expectSuccess(['--help'], [
  output => output.includes('Leadership Prompts CLI'),
  output => output.includes('Usage:'),
]);

expectSuccess(['-h'], [
  output => output.includes('Leadership Prompts CLI'),
  output => output.includes('Usage:'),
]);

expectSuccess(['list'], [
  output => output.includes('Leadership Prompt Categories'),
  output => output.includes('Total:'),
]);

expectSuccess(['search', 'career-dev-promotion'], [
  output => output.includes('career-dev-promotion'),
]);

expectFailure(['search'], [
  output => output.includes('Usage:'),
  output => output.includes('search <keyword>'),
]);

expectSuccess(['show', 'CAREER-DEV-PROMOTION'], [
  output => output.includes('ID: career-dev-promotion'),
  output => output.includes('PROMPT:'),
]);

expectFailure(['show'], [
  output => output.includes('Usage:'),
  output => output.includes('show <prompt-id>'),
]);

expectFailure(['show', 'missing-prompt-id'], [
  output => output.includes('No prompt with ID "missing-prompt-id"'),
]);

expectSuccess(['category', 'Team Health'], [
  output => output.includes('Team Health'),
  output => output.includes('ID: team-health'),
]);

expectFailure(['category'], [
  output => output.includes('Usage:'),
  output => output.includes('category "Category Name"'),
]);

expectFailure(['category', 't'], [
  output => output.includes('Ambiguous category "t"'),
  output => output.includes('- Team Health'),
]);

expectSuccess(['random'], [
  output => output.includes('ID:'),
  output => output.includes('PROMPT:'),
]);

expectFailure(['random', 'not-a-category'], [
  output => output.includes('No prompts found.'),
]);

expectFailure(['not-a-command'], [
  output => output.includes('Usage:'),
]);

console.log('All leadership-prompts CLI tests passed.');
