---
name: start-dev-server
description: Start Clarinet devnet and frontend development servers. Use when the user wants to run their Stacks project locally for testing and development.
license: Apache-2.0
metadata:
  author: "Stacks Skills Contributors"
  version: "1.0.0"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

# Start Dev Server Skill

This skill starts the local development environment for Stacks projects, including the Clarinet devnet (local blockchain) and the frontend development server.

## When to Use

- User wants to test contracts locally
- User is starting frontend development
- User asks to "start devnet" or "run the project"
- After `/stacks:init` when user wants to start development

## Instructions

### Step 1: Check Prerequisites

**Docker Check:**
```bash
docker info > /dev/null 2>&1 && echo "Docker is running" || echo "Docker is NOT running"
```

If Docker is not running, tell the user:
"Clarinet devnet requires Docker to run. Please start Docker Desktop and try again."

**Project Check:**
Verify `Clarinet.toml` exists in the project root. If not:
"This doesn't appear to be a Clarinet project. Would you like me to create one with `clarinet new`?"

### Step 2: Ask About Background Tasks

Ask the user:
"How would you like me to run the dev servers?

1. **Background tasks** (Recommended) - I'll run them as background tasks so I can monitor logs and respond to errors automatically.
2. **External terminal** - You run them manually in separate terminal windows. This gives you more control over the output.

Which do you prefer?"

### Step 3: Start Clarinet Devnet

**If background tasks:**
```bash
clarinet devnet start
```
Run this in background mode. Monitor the output for:
- "Stacks node is ready" or similar startup confirmation
- Any error messages

**If external terminal:**
Tell the user:
"In a new terminal window, run:
```
clarinet devnet start
```
Keep this terminal open during development. Let me know when you see the node is ready."

### Step 4: Verify Devnet Health

Wait for devnet to be ready, then verify:
```bash
curl -s http://localhost:20443/v2/info | head -c 200
```

If successful, you should see JSON with `stacks_tip_height` and other node info.

If it fails after 60 seconds, suggest:
- Check the devnet terminal for errors
- Try `clarinet devnet stop` then `clarinet devnet start`
- Verify Docker has enough resources allocated

### Step 5: Detect and Start Frontend

**Detect package manager and dev script:**

Check for package.json:
```bash
cat package.json 2>/dev/null | grep -A 20 '"scripts"'
```

Detect package manager by checking for lock files:
- `pnpm-lock.yaml` → use `pnpm`
- `yarn.lock` → use `yarn`
- `bun.lockb` → use `bun`
- `package-lock.json` or default → use `npm`

Detect dev script (in order of preference):
- `dev` script → `{pm} run dev`
- `start` script → `{pm} run start`
- `serve` script → `{pm} run serve`

**If frontend detected:**

For background tasks:
```bash
npm run dev  # or appropriate command
```
Run in background mode.

For external terminal:
"In another terminal window, run:
```
npm run dev
```
This will start your frontend dev server."

**If no frontend detected:**
"I didn't find a frontend dev script in package.json. If you have a frontend, let me know the command to start it."

### Step 6: Verify Frontend

Common frontend ports to check:
- Vite: `http://localhost:5173`
- Next.js: `http://localhost:3000`
- Create React App: `http://localhost:3000`

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### Step 7: Connect Browser Console Access (Important!)

**This step is critical for effective development and debugging.** Without browser console access, Claude cannot see client-side errors, warnings, or React issues that occur in the browser.

Use the AskUserQuestion tool to ask the user which method they'd like to use for giving Claude visibility into the browser console:

| Option | Description |
|--------|-------------|
| **Chrome DevTools MCP (Recommended)** | Use the `mcp__plugin_stacks_chrome-devtools` tool bundled with this plugin. Open Chrome DevTools in your browser and Claude gains visibility into console logs, network requests, and runtime errors. |
| **Built-in Browser** | Use Claude Code's built-in browser connection (check status with `/browser` command) |
| **Manual** | User will manually copy/paste console output when needed |

If the user selects **Chrome DevTools MCP**:
1. Confirm the MCP server is available (it's configured in the plugin's `plugin.json`)
2. Instruct the user to open their app in Chrome and open DevTools (F12 or Cmd+Option+I)
3. Explain that Claude can now see console output, network requests, and errors

If the user selects **Manual**:
- Let them know they can paste console output anytime during debugging
- Remind them this option requires more back-and-forth but gives them full control

### Step 8: Summary

Provide a summary:
"Development environment is ready!

**Services running:**
- Clarinet devnet: http://localhost:20443 (Stacks node)
- Frontend: http://localhost:{port}

**Useful commands:**
- Stop devnet: `clarinet devnet stop`
- Run tests: `npm run test`
- Check contract: `clarinet check`
- Console: `clarinet console`

**Tips:**
- Contracts auto-deploy to devnet on startup
- Changes to contracts require devnet restart
- Use `clarinet console` for interactive contract testing"

## Notes

- Devnet requires Docker with sufficient resources (4GB+ RAM recommended)
- Contracts in the `contracts/` directory are automatically deployed to devnet
- The devnet state persists in `.devnet/` between sessions
- Frontend should be configured to use devnet network (localhost:20443)
