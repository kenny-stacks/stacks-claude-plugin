# Manual Verification Steps

## Testing During Development

Use the `--plugin-dir` flag to load the plugin without installation:

```bash
claude --plugin-dir /Users/kenny/Code/stacks-skills
```

## Verification Checklist

### 1. Plugin Loads Successfully
- Run the command above
- Claude Code should start without errors
- No plugin loading errors in output

### 2. Hook Detection Test
- Navigate to a directory with `Clarinet.toml`
- Start Claude Code with the plugin
- Should see prompt: "The Stacks plugin hasn't been initialized..."
- User should be prompted to run `/stacks:init` or opt out

### 3. Test /stacks:init
- Run `/stacks:init` in a Clarinet project
- Verify:
  - Knowledge file copied to `.claude/stacks/knowledge/general-stacks-knowledge.md`
  - CLAUDE.md updated with import statement
  - Offered to start dev servers

### 4. Test /stacks:help
- Run `/stacks:help`
- Should display plugin capabilities, commands, and example prompts

### 5. Test /stacks:expert-advice
- Run `/stacks:expert-advice` in a project with `.clar` files
- Should:
  - Find and read all Clarity contracts
  - Analyze against best practices
  - Present structured review with issues and recommendations

### 6. Test start-dev-server Skill
- Say "start the dev servers"
- Should:
  - Check Docker is running
  - Start `clarinet devnet start`
  - Detect and start frontend dev server
  - Verify both are running

### 7. Test Chrome DevTools MCP
- Verify `plugin.json` includes MCP server config
- When frontend is running, Chrome DevTools access should be available

### 8. Test Opt-Out Flow
- In the hook prompt, reply "opt out"
- Should create `.claude/stacks/knowledge/.stacks-init-opt-out`
- Next session should not show the init prompt

## Testing in Different Scenarios

### New Clarinet Project
```bash
mkdir test-project && cd test-project
clarinet new .
claude --plugin-dir /path/to/stacks-skills
# Should trigger init prompt
```

### Existing Project (No Init)
```bash
cd existing-clarinet-project
claude --plugin-dir /path/to/stacks-skills
# Should trigger init prompt if not initialized
```

### Already Initialized Project
```bash
cd initialized-project
# Has .claude/stacks/knowledge/general-stacks-knowledge.md
# And CLAUDE.md with import
claude --plugin-dir /path/to/stacks-skills
# Should NOT trigger init prompt
```

## Loading Multiple Plugins

You can load multiple plugins at once:

```bash
claude --plugin-dir ./stacks-skills --plugin-dir ./other-plugin
```

## After Development

When ready to share, publish to the plugin marketplace:

```bash
claude plugin publish
```

Users can then install via:

```bash
claude plugin install stacks
```
