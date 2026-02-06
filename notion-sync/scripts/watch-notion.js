#!/usr/bin/env node
/**
 * Notion Page Watcher
 * Monitors a Notion page for changes and suggests next actions
 */

const fs = require('fs');
const path = require('path');
const { getPage, getAllBlocks, blocksToMarkdown } = require('./notion-to-md.js');

const STATE_FILE = path.join(__dirname, '../memory/notion-watch-state.json');

// Load watch state
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { pages: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Save watch state
function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// Check a specific page for changes
async function checkPage(pageId, localPath) {
  try {
    const state = loadState();
    const pageState = state.pages[pageId] || {};
    
    // Fetch current page state
    const page = await getPage(pageId);
    const lastEditedTime = page.last_edited_time;
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';
    
    // Check if page was edited since last check
    const hasChanges = !pageState.lastEditedTime || 
                      new Date(lastEditedTime) > new Date(pageState.lastEditedTime);
    
    const result = {
      pageId,
      title,
      lastEditedTime,
      hasChanges,
      localPath,
      actions: []
    };
    
    if (hasChanges) {
      // Fetch blocks and convert to markdown
      const blocks = await getAllBlocks(pageId);
      const notionMarkdown = blocksToMarkdown(blocks);
      
      // Compare with local file if it exists
      let localMarkdown = '';
      let localDiffers = false;
      
      if (fs.existsSync(localPath)) {
        localMarkdown = fs.readFileSync(localPath, 'utf8');
        // Simple comparison (could be enhanced with proper diff)
        localDiffers = localMarkdown.trim() !== notionMarkdown.trim();
      }
      
      result.notionMarkdown = notionMarkdown;
      result.localDiffers = localDiffers;
      result.blockCount = blocks.length;
      
      // Suggest actions
      if (pageState.lastEditedTime) {
        result.actions.push(`📝 Page edited since last check (${new Date(pageState.lastEditedTime).toLocaleString()})`);
      } else {
        result.actions.push('🆕 First time checking this page');
      }
      
      if (localDiffers) {
        result.actions.push(`⚠️  Local markdown differs from Notion version`);
        result.actions.push(`💡 Suggested: Sync Notion → markdown to update local file`);
      }
      
      // Update state
      pageState.lastEditedTime = lastEditedTime;
      pageState.lastChecked = new Date().toISOString();
      pageState.title = title;
      state.pages[pageId] = pageState;
      saveState(state);
      
    } else {
      result.actions.push('✓ No changes since last check');
    }
    
    return result;
    
  } catch (error) {
    return {
      pageId,
      error: error.message,
      actions: [`❌ Error checking page: ${error.message}`]
    };
  }
}

// Watch configuration
async function watchNewsletter() {
  const pageId = '2f838506-15da-816d-9ab6-cbc7c56e8184'; // v5 page
  const localPath = '/Users/axos/clawd/projects/blindspots-remediation/newsletter-draft-ai-leadership-v5.md';
  
  return await checkPage(pageId, localPath);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Default: check newsletter
    const result = await watchNewsletter();
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  
  if (args[0] === 'check') {
    const pageId = args[1];
    const localPath = args[2];
    
    if (!pageId || !localPath) {
      console.error('Usage: watch-notion.js check <page-id> <local-path>');
      process.exit(1);
    }
    
    const result = await checkPage(pageId, localPath);
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  
  console.error('Usage: watch-notion.js [check <page-id> <local-path>]');
  process.exit(1);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
} else {
  module.exports = { checkPage, watchNewsletter };
}
