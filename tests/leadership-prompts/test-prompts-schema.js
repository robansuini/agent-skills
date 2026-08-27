#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const promptsPath = path.join(repoRoot, 'leadership/leadership-prompts/prompts.json');
const skillPath = path.join(repoRoot, 'leadership/leadership-prompts/SKILL.md');

const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
const skillMarkdown = fs.readFileSync(skillPath, 'utf8');

const requiredFields = [
  'id',
  'category',
  'title',
  'prompt',
  'context',
  'output_format',
  'example',
];

assert(Array.isArray(prompts), 'prompts.json should contain an array');
assert(prompts.length > 0, 'prompts.json should not be empty');

const ids = new Set();
const countsByCategory = new Map();

for (const [index, prompt] of prompts.entries()) {
  assert(prompt && typeof prompt === 'object', `Prompt at index ${index} should be an object`);

  for (const field of requiredFields) {
    assert.strictEqual(
      typeof prompt[field],
      'string',
      `${prompt.id || `Prompt ${index}`} should have string field "${field}"`
    );
    assert(prompt[field].trim().length > 0, `${prompt.id} should have non-empty field "${field}"`);
  }

  assert.match(prompt.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${prompt.id} should be kebab-case`);
  assert(!ids.has(prompt.id), `Duplicate prompt id: ${prompt.id}`);
  ids.add(prompt.id);

  countsByCategory.set(prompt.category, (countsByCategory.get(prompt.category) || 0) + 1);
}

const documentedCounts = new Map();
for (const line of skillMarkdown.split(/\r?\n/)) {
  const match = line.match(/^\|\s+\*\*(.+?)\*\*\s+\|\s+(\d+)\s+\|/);
  if (match) {
    documentedCounts.set(match[1], Number(match[2]));
  }
}

assert(documentedCounts.size > 0, 'SKILL.md should document category counts');

assert.deepStrictEqual(
  [...countsByCategory.keys()].sort(),
  [...documentedCounts.keys()].sort(),
  'Documented categories should match prompts.json categories'
);

for (const [category, expectedCount] of documentedCounts.entries()) {
  assert.strictEqual(
    countsByCategory.get(category),
    expectedCount,
    `${category} documented count should match prompts.json`
  );
}

console.log('All leadership prompt schema tests passed.');
