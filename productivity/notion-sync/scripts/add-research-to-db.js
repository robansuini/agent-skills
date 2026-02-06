#!/usr/bin/env node
/**
 * Add research report page to Ax Resources database (simple version)
 */

const fs = require('fs');
const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2025-09-03';

function notionRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function parseRichText(text) {
  const richText = [];
  const maxLength = 2000;
  
  if (text.length <= maxLength) {
    richText.push({
      type: 'text',
      text: { content: text }
    });
  } else {
    richText.push({
      type: 'text',
      text: { content: text.substring(0, maxLength) }
    });
  }
  
  return richText;
}

function parseMarkdown(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentParagraph = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text && text.length > 0) {
        blocks.push({
          type: 'paragraph',
          paragraph: {
            rich_text: parseRichText(text)
          }
        });
      }
      currentParagraph = [];
    }
  };
  
  for (let line of lines) {
    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push({
        type: 'heading_3',
        heading_3: { rich_text: parseRichText(line.substring(4)) }
      });
    } else if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push({
        type: 'heading_2',
        heading_2: { rich_text: parseRichText(line.substring(3)) }
      });
    } else if (line.startsWith('# ')) {
      flushParagraph();
      blocks.push({
        type: 'heading_1',
        heading_1: { rich_text: parseRichText(line.substring(2)) }
      });
    } else if (line.startsWith('---')) {
      flushParagraph();
      blocks.push({ type: 'divider', divider: {} });
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }
  
  flushParagraph();
  return blocks;
}

(async () => {
  const dbId = '43c69506-c4ca-420f-b295-3c522850c251';
  const title = 'Newsletter Research: Leadership AI Coverage - Feb 2026';
  const mdPath = 'projects/blindspots-remediation/research-insights-2026-02.md';
  
  console.log('Adding research report to Ax Resources database...\n');
  
  // Create database page
  const pageData = {
    parent: {
      type: 'database_id',
      database_id: dbId
    },
    properties: {
      'Name': {
        title: [{ text: { content: title } }]
      }
    }
  };
  
  console.log('Creating database entry...');
  const page = await notionRequest('/v1/pages', 'POST', pageData);
  console.log(`✓ Page created: ${page.id}`);
  console.log(`  URL: https://notion.so/${page.id.replace(/-/g, '')}`);
  
  // Read and parse markdown
  const markdown = fs.readFileSync(mdPath, 'utf8');
  const blocks = parseMarkdown(markdown);
  console.log(`\nParsed ${blocks.length} blocks from markdown`);
  
  // Add content in batches
  const batchSize = 100;
  for (let i = 0; i < blocks.length; i += batchSize) {
    const batch = blocks.slice(i, i + batchSize);
    console.log(`Adding blocks ${i + 1}-${Math.min(i + batchSize, blocks.length)}...`);
    
    await notionRequest(`/v1/blocks/${page.id}/children`, 'PATCH', {
      children: batch
    });
    
    if (i + batchSize < blocks.length) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }
  
  console.log(`\n✅ Successfully added to Ax Resources!`);
  console.log(`📄 URL: https://notion.so/${page.id.replace(/-/g, '')}`);
  console.log(`\n💡 Add Type, Tags, Status properties manually in Notion`);
  
})().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
