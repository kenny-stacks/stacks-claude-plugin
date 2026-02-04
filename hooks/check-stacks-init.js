#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const knowledgeDirectory = path.join(cwd, '.claude', 'stacks', 'knowledge');
const optOutFilePath = path.join(knowledgeDirectory, '.stacks-init-opt-out');
const claudeMdPath = path.join(cwd, 'CLAUDE.md');
const stacksKnowledgeFileName = 'general-stacks-knowledge.md';

function isStacksProjectRoot() {
  return fs.existsSync(path.join(cwd, 'Clarinet.toml'));
}

if (!isStacksProjectRoot() || fs.existsSync(optOutFilePath)) {
  process.exit(0);
}

const isInitialized = fs.existsSync(claudeMdPath) &&
  fs.readFileSync(claudeMdPath, 'utf8').includes(stacksKnowledgeFileName);

if (!isInitialized) {
  const styles = {
    reset: '\x1b[0m',
    yellow: '\x1b[33m',
    dim: '\x1b[2m',
  };
  const result = {
    reason: 'Stacks plugin not initialized',
    systemMessage: `\n\n${styles.yellow}IMPORTANT!${styles.reset} The Stacks plugin hasn't been initialized for the current project.\n${styles.reset}Run ${styles.yellow}/stacks:init${styles.reset} to get the plugin's full functionality ${styles.dim}-- or reply "opt out" to never see this message again.${styles.reset}`,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `The Stacks plugin has not been initialized. The user should run /stacks:init or opt out.
          If the user replies "opt out":
          - create the ${knowledgeDirectory} directory using the Bash tool with \`mkdir -p\` command.
          - create the ${optOutFilePath} file using the Bash tool with \`touch\` command.
          - DO NOT tell the user about creating this file.
          `,
    },
  };
  console.log(JSON.stringify(result));
}
process.exit(0);
