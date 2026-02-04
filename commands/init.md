# /stacks:init

Initialize the Stacks plugin for this project. This command sets up knowledge files and optionally starts development servers.

## What This Does

This command will give Claude access to comprehensive Stacks development knowledge including:
- Clarity smart contract best practices
- Test-driven development patterns with Clarinet SDK
- Frontend integration with Stacks.js
- Common pitfalls and how to avoid them

## Instructions

### Step 0: User Confirmation

Tell the user:
"This will incorporate the `general-stacks-knowledge.md` file into your project, giving Claude access to Stacks/Clarity development best practices, testing patterns, and frontend integration guidance. Shall I proceed?"

Wait for user confirmation before continuing.

### Step 1: Create Documentation Index

Fetch the latest documentation index and save it as JSON. Run this command:

```bash
mkdir -p .claude/stacks && curl -s "https://docs.stacks.co/llms.txt" | grep -E '^\s*-\s*\[' | grep -v '/zh/\|/es/' | sed 's/.*\[\([^]]*\)\](\([^)]*\)).*/{"title":"\1","path":"\2"}/' | jq -s '{lastUpdated:"'"$(date +%Y-%m-%d)"'",source:"https://docs.stacks.co/llms.txt",docs:.}' > .claude/stacks/docs-index.json
```

If `jq` is not installed, tell the user to install it (`brew install jq`) or create the JSON file manually by reading the curl output and writing the JSON structure.

### Step 2: Copy Knowledge File

Copy the knowledge file to the user's project:

```bash
mkdir -p .claude/stacks/knowledge && cp "${CLAUDE_PLUGIN_ROOT}/general-stacks-knowledge.md" .claude/stacks/knowledge/
```

### Step 3: Update CLAUDE.md

Check if CLAUDE.md exists. If not, create it. Then append the import reference if not already present:

```markdown
@import .claude/stacks/knowledge/general-stacks-knowledge.md
```

### Step 4: Completion Notice

Tell the user:
"The Stacks plugin has been initialized! You can run `/stacks:help` to see available commands and capabilities."

### Step 5: Offer Development Server Setup

Ask the user if they would like to start the development environment:

"Would you like me to start the development servers? This includes:
- **Clarinet devnet**: Local Stacks blockchain (requires Docker)
- **Frontend dev server**: Automatically detected from your package.json

This gives Claude end-to-end visibility for debugging both smart contracts and frontend code."

If the user agrees:
1. Invoke the `start-dev-server` skill to start both servers
2. Remind them about Chrome DevTools MCP for frontend debugging: "The Chrome DevTools MCP server is configured in this plugin. You can use it to inspect frontend console output and network requests."

### Step 6: Recommend Best Practices

Suggest:
"For the best development experience, I recommend:
1. Use `/stacks:expert-advice` before deploying contracts for a security and best practices review
2. Run tests with coverage: `npm run test:coverage`
3. Keep devnet running in a dedicated terminal for faster iteration"

## Notes

- The knowledge file is copied (not symlinked) so it persists even if the plugin is uninstalled
- Users can customize the knowledge file after copying
- The `.claude/stacks/knowledge/` directory is also where the opt-out file is stored
