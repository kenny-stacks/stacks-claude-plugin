#!/usr/bin/env node
// Fetch latest Stacks docs index in background, cache for Claude to use
// Called by SessionStart hook - runs silently each session

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'stacks-docs-index.json');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Run fetch in background (non-blocking)
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const https = require('https');

  const cacheFile = ${JSON.stringify(cacheFile)};
  const LLMS_TXT_URL = 'https://docs.stacks.co/llms.txt';

  function fetchLlmsTxt() {
    return new Promise((resolve, reject) => {
      https.get(LLMS_TXT_URL, { timeout: 15000 }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  function parseLlmsTxt(content) {
    const lines = content.split('\\n');
    const entries = [];
    const sectionPattern = /^## (.+)$/;
    let currentSection = 'General';

    for (const line of lines) {
      const sectionMatch = line.match(sectionPattern);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        continue;
      }

      // Match: - [Title](/path/to/doc.md) or - [Title](/path/to/doc.md): Description
      const linkMatch = line.match(/^[-*] \\[([^\\]]+)\\]\\((\\/[^)]+)\\)(?::\\s*(.+))?$/);
      if (linkMatch) {
        const [, title, docPath, description] = linkMatch;
        // Skip non-English docs
        if (docPath.includes('/zh/') || docPath.includes('/es/')) continue;
        entries.push({
          section: currentSection,
          title: title.trim(),
          path: docPath.trim(),
          description: description ? description.trim() : null
        });
      }
    }

    return entries;
  }

  function categorizeEntries(entries) {
    const categories = {
      build: [],
      clarinet: [],
      stacksJs: [],
      stacksConnect: [],
      postConditions: [],
      reference: [],
      cookbook: [],
      sbtc: [],
      rendezvous: [],
      tutorials: [],
      other: []
    };

    for (const entry of entries) {
      const p = entry.path;
      if (p.startsWith('/get-started/')) categories.build.push(entry);
      else if (p.startsWith('/clarinet/')) categories.clarinet.push(entry);
      else if (p.startsWith('/stacks.js/')) categories.stacksJs.push(entry);
      else if (p.startsWith('/stacks-connect/')) categories.stacksConnect.push(entry);
      else if (p.startsWith('/post-conditions/')) categories.postConditions.push(entry);
      else if (p.startsWith('/reference/')) categories.reference.push(entry);
      else if (p.startsWith('/cookbook/')) categories.cookbook.push(entry);
      else if (p.includes('/sbtc') || p.startsWith('/more-guides/sbtc')) categories.sbtc.push(entry);
      else if (p.startsWith('/rendezvous/')) categories.rendezvous.push(entry);
      else if (p.startsWith('/tutorials/')) categories.tutorials.push(entry);
      else categories.other.push(entry);
    }

    return categories;
  }

  async function main() {
    try {
      const content = await fetchLlmsTxt();
      const entries = parseLlmsTxt(content);
      const categories = categorizeEntries(entries);

      const result = {
        fetchedAt: new Date().toISOString(),
        totalEntries: entries.length,
        categories,
        allEntries: entries
      };

      fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
    } catch (err) {
      // Silent failure - cache will just be stale
    }
  }

  main();
`], {
  stdio: 'ignore',
  detached: true,
  windowsHide: true
});

child.unref();
