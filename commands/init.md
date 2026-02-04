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

Fetch the latest documentation index and save it as JSON for fast lookups:

```bash
mkdir -p ~/.claude/cache
```

Fetch the docs index:
```bash
curl -s "https://docs.stacks.co/llms.txt"
```

Parse the output and create a JSON file at `~/.claude/cache/stacks-docs-index.json` with this structure:
```json
{
  "lastUpdated": "YYYY-MM-DD",
  "source": "https://docs.stacks.co/llms.txt",
  "docs": [
    { "title": "Developer Quickstart", "path": "/get-started/developer-quickstart.md", "category": "build" },
    { "title": "Clarity Functions", "path": "/reference/clarity/functions.md", "category": "reference" }
  ]
}
```

Categorize paths as:
- `build` - `/get-started/*`
- `clarinet` - `/clarinet/*`
- `stacksjs` - `/stacks.js/*`
- `connect` - `/stacks-connect/*`
- `postconditions` - `/post-conditions/*`
- `reference` - `/reference/*`
- `cookbook` - `/cookbook/*`
- `sbtc` - `/more-guides/sbtc/*` and `/learn/sbtc/*`
- `other` - Everything else

Filter out non-English docs (skip paths containing `/zh/` or `/es/`).

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
