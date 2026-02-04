#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const knowledgeDirectory = path.join(cwd, '.claude', 'stacks', 'knowledge');
const optOutFilePath = path.join(knowledgeDirectory, '.stacks-init-opt-out');
const claudeMdPath = path.join(cwd, 'CLAUDE.md');
const stacksKnowledgeFileName = 'general-stacks-knowledge.md';

function findClarinetProjectRoot() {
  // Check 1: Current directory
  if (fs.existsSync(path.join(cwd, 'Clarinet.toml'))) {
    return cwd;
  }

  // Check 2: Common monorepo patterns
  const patterns = ['clarity', 'contracts', 'packages/contracts', 'packages/clarity'];
  for (const pattern of patterns) {
    const potentialPath = path.join(cwd, pattern, 'Clarinet.toml');
    if (fs.existsSync(potentialPath)) {
      return path.join(cwd, pattern);
    }
  }

  // Check 3: Any immediate subdirectory (excluding . prefixed and node_modules)
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const potentialPath = path.join(cwd, entry.name, 'Clarinet.toml');
        if (fs.existsSync(potentialPath)) {
          return path.join(cwd, entry.name);
        }
      }
    }
  } catch (err) { /* ignore */ }

  return null;
}

const stacksProjectPath = findClarinetProjectRoot();

if (!stacksProjectPath || fs.existsSync(optOutFilePath)) {
  process.exit(0);
}

const isInitialized = fs.existsSync(claudeMdPath) &&
  fs.readFileSync(claudeMdPath, 'utf8').includes(stacksKnowledgeFileName);

const styles = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
};

if (!isInitialized) {
  const isMonorepo = stacksProjectPath !== cwd;
  const locationNote = isMonorepo
    ? `\n${styles.dim}(Detected Clarinet project in: ${path.relative(cwd, stacksProjectPath) || '.'})${styles.reset}`
    : '';
  const result = {
    reason: 'Stacks plugin not initialized',
    systemMessage: `\n\n${styles.yellow}IMPORTANT!${styles.reset} The Stacks plugin hasn't been initialized for the current project.${locationNote}\n${styles.reset}Run ${styles.yellow}/stacks:init${styles.reset} to get the plugin's full functionality ${styles.dim}-- or reply "opt out" to never see this message again.${styles.reset}`,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      stacksProjectPath: stacksProjectPath,
      additionalContext: `The Stacks plugin has not been initialized. The user should run /stacks:init or opt out.
          Clarinet project detected at: ${stacksProjectPath}${isMonorepo ? ' (monorepo subdirectory)' : ''}
          If the user replies "opt out":
          - create the ${knowledgeDirectory} directory using the Bash tool with \`mkdir -p\` command.
          - create the ${optOutFilePath} file using the Bash tool with \`touch\` command.
          - DO NOT tell the user about creating this file.
          `,
    },
  };
  console.log(JSON.stringify(result));
  process.exit(0);
}

// Check docs index age (only if initialized)
const knowledgeFilePath = path.join(knowledgeDirectory, stacksKnowledgeFileName);
const DOCS_MAX_AGE_DAYS = 30;

function checkDocsAge() {
  try {
    if (!fs.existsSync(knowledgeFilePath)) return null;

    const content = fs.readFileSync(knowledgeFilePath, 'utf8');
    const match = content.match(/\*\*Last Updated:\*\*\s*(\d{4}-\d{2}-\d{2})/);

    if (!match) return null;

    const lastUpdated = new Date(match[1]);
    const now = new Date();
    const diffDays = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

    return { lastUpdated: match[1], diffDays };
  } catch (err) {
    return null;
  }
}

const docsAge = checkDocsAge();

if (docsAge && docsAge.diffDays > DOCS_MAX_AGE_DAYS) {
  const result = {
    reason: 'Stacks docs index may be stale',
    systemMessage: `\n${styles.cyan}Stacks docs index is ${docsAge.diffDays} days old${styles.reset} ${styles.dim}(last updated: ${docsAge.lastUpdated})${styles.reset}\nRun ${styles.cyan}/stacks:update-docs${styles.reset} to refresh the documentation index.`,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      docsLastUpdated: docsAge.lastUpdated,
      docsAgeDays: docsAge.diffDays,
      additionalContext: `The Stacks documentation index is ${docsAge.diffDays} days old (last updated: ${docsAge.lastUpdated}).
          Consider suggesting the user run /stacks:update-docs to refresh the documentation index.
          This is not urgent, but helps ensure Claude has access to the latest documentation paths.`,
    },
  };
  console.log(JSON.stringify(result));
}

process.exit(0);
