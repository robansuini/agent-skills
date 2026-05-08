#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROMPTS_FILE = path.join(__dirname, '..', 'prompts.json');

function loadPrompts() {
  return JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
}

function getCategories(prompts) {
  const cats = {};
  for (const p of prompts) {
    cats[p.category] = (cats[p.category] || 0) + 1;
  }
  return cats;
}

function printPrompt(p, verbose = true) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🎯 ${p.title}`);
  console.log(`   Category: ${p.category} | ID: ${p.id}`);
  console.log(`${'─'.repeat(60)}`);
  if (verbose) {
    console.log(`\n📋 PROMPT:\n${p.prompt}`);
    console.log(`\n🕐 WHEN TO USE:\n${p.context}`);
    console.log(`\n📄 OUTPUT FORMAT:\n${p.output_format}`);
    console.log(`\n💡 EXAMPLE:\n${p.example}`);
  }
  console.log();
}

const USAGE_CMD = `node ${path.relative(process.cwd(), __filename)}`;

function getUniqueCategories(prompts) {
  return [...new Set(prompts.map(p => p.category))];
}

function resolveCategoryOrExit(categories, query, normalizedQuery) {
  const exact = categories.find(c => c.toLowerCase() === normalizedQuery);
  if (exact) return exact;

  const matches = categories.filter(c => c.toLowerCase().includes(normalizedQuery));
  if (matches.length === 1) return matches[0];

  if (!matches.length) {
    console.log(`No category matching "${query}"`);
    process.exit(1);
  }

  console.log(`Ambiguous category "${query}". Did you mean:`);
  for (const c of matches.slice().sort((a, b) => a.localeCompare(b))) {
    console.log(`  - ${c}`);
  }
  process.exit(1);
}

function printUsage() {
  console.log(`
🎯 Leadership Prompts CLI

Usage:
  ${USAGE_CMD} list                    List all categories
  ${USAGE_CMD} random [category]       Random prompt (optionally from category)
  ${USAGE_CMD} search <keyword>        Search prompts by keyword
  ${USAGE_CMD} show <prompt-id>        Show a specific prompt
  ${USAGE_CMD} category "Name"         All prompts in a category
`);
}

function failUsage(message) {
  console.log(message);
  process.exit(1);
}

function printCategoryList(prompts) {
  const cats = getCategories(prompts);
  console.log('\n📂 Leadership Prompt Categories:\n');
  for (const cat of Object.keys(cats).sort((a, b) => a.localeCompare(b))) {
    console.log(`  ${cat} (${cats[cat]} prompts)`);
  }
  console.log(`\n  Total: ${prompts.length} prompts`);
  console.log(`\nUse: ${USAGE_CMD} category "Category Name"`);
}

function printRandomPrompt(prompts, query, normalizedQuery) {
  const filtered = query
    ? prompts.filter(p => p.category.toLowerCase().includes(normalizedQuery))
    : prompts;
  if (!filtered.length) { console.log('No prompts found.'); return; }
  printPrompt(filtered[Math.floor(Math.random() * filtered.length)]);
}

function findPrompts(prompts, normalizedQuery) {
  return prompts.filter(p =>
    p.id.toLowerCase().includes(normalizedQuery) ||
    p.title.toLowerCase().includes(normalizedQuery) ||
    p.prompt.toLowerCase().includes(normalizedQuery) ||
    p.context.toLowerCase().includes(normalizedQuery) ||
    p.category.toLowerCase().includes(normalizedQuery)
  );
}

function printSearchResults(prompts, query, normalizedQuery) {
  const results = findPrompts(prompts, normalizedQuery);
  if (!results.length) { console.log(`No prompts matching "${query}"`); return; }
  console.log(`\n🔍 ${results.length} prompt(s) matching "${query}":\n`);
  for (const p of results) printPrompt(p, false);
}

function printPromptById(prompts, query, normalizedQuery) {
  const prompt = prompts.find(p => p.id.toLowerCase() === normalizedQuery);
  if (!prompt) { console.log(`No prompt with ID "${query}". Use 'list' or 'search' to find IDs.`); return; }
  printPrompt(prompt);
}

function printCategoryPrompts(prompts, query, normalizedQuery) {
  const categories = getUniqueCategories(prompts);
  const category = resolveCategoryOrExit(categories, query, normalizedQuery);
  const results = prompts.filter(p => p.category === category);
  console.log(`\n📂 ${category} (${results.length} prompts):\n`);
  for (const p of results) printPrompt(p, false);
}

function runCommand(command, query, normalizedQuery) {
  if (command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  switch (command) {
    case 'list':
      printCategoryList(loadPrompts());
      break;
    case 'random':
      printRandomPrompt(loadPrompts(), query, normalizedQuery);
      break;
    case 'search':
      if (!query) failUsage(`Usage: ${USAGE_CMD} search <keyword>`);
      printSearchResults(loadPrompts(), query, normalizedQuery);
      break;
    case 'show':
      if (!query) failUsage(`Usage: ${USAGE_CMD} show <prompt-id>`);
      printPromptById(loadPrompts(), query, normalizedQuery);
      break;
    case 'category':
      if (!query) failUsage(`Usage: ${USAGE_CMD} category "Category Name"`);
      printCategoryPrompts(loadPrompts(), query, normalizedQuery);
      break;
    default:
      printUsage();
      if (command) process.exit(1);
  }
}

const [,, command, ...args] = process.argv;
const query = args.join(' ').trim();
const normalizedQuery = query.toLowerCase();

runCommand(command, query, normalizedQuery);
