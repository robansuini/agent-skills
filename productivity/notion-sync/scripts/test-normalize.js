#!/usr/bin/env node
/**
 * Test for normalizeId function
 */

const { normalizeId } = require('./notion-to-md.js');

// Test cases
const testCases = [
  // With hyphens (standard UUID format)
  {
    input: 'abc12345-6789-0123-4567-890abcdef012',
    expected: 'abc12345-6789-0123-4567-890abcdef012',
    desc: 'Standard UUID with hyphens'
  },
  // Without hyphens (compact format)
  {
    input: 'abc12345678901234567890abcdef012',
    expected: 'abc12345-6789-0123-4567-890abcdef012',
    desc: 'Compact format without hyphens'
  },
  // Mixed case
  {
    input: 'ABC12345678901234567890ABCDEF012',
    expected: 'ABC12345-6789-0123-4567-890ABCDEF012',
    desc: 'Uppercase compact format'
  },
  // Already normalized with hyphens
  {
    input: '12a85c78-1e0b-481a-98d5-e122e8e9c5f3',
    expected: '12a85c78-1e0b-481a-98d5-e122e8e9c5f3',
    desc: 'Real Notion UUID'
  },
  // Real Notion ID without hyphens
  {
    input: '12a85c781e0b481a98d5e122e8e9c5f3',
    expected: '12a85c78-1e0b-481a-98d5-e122e8e9c5f3',
    desc: 'Real Notion UUID without hyphens'
  },
  // Invalid length (should return as-is)
  {
    input: 'tooshort',
    expected: 'tooshort',
    desc: 'Invalid format (too short)'
  }
];

console.log('Testing normalizeId function:\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  const result = normalizeId(test.input);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✓ Test ${idx + 1}: ${test.desc}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Output:   ${result}`);
    passed++;
  } else {
    console.log(`✗ Test ${idx + 1}: ${test.desc}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Got:      ${result}`);
    failed++;
  }
  console.log();
});

console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
