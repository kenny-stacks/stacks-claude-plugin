# stacks-claude-plugin

Enhances Claude for developing Clarity smart contracts on the Stacks blockchain.

## Installation

Install from the Claude Code plugin marketplace or manually:

```bash
claude plugin install stacks
```

## Getting Started

After installing, navigate to a Clarinet project and run:

```
/stacks:init
```

This will:
1. Copy knowledge files to your project (`.claude/stacks/knowledge/`)
2. Update your CLAUDE.md with the import reference
3. Optionally start development servers (devnet + frontend)

## Available Commands

| Command | Description |
|---------|-------------|
| `/stacks:init` | Initialize the plugin for your project |
| `/stacks:help` | Show plugin capabilities and commands |
| `/stacks:expert-advice` | Get expert review of your contracts |

## Features

### Knowledge Integration
Comprehensive Clarity/Stacks best practices automatically loaded into context:
- Clarity coding style and patterns
- Test-driven development with Clarinet SDK
- Storage optimization techniques
- Contract upgradability patterns
- Frontend integration with Stacks.js

### Development Server Management
Start your local development environment with a single command:
- **Clarinet devnet**: Local Stacks blockchain (requires Docker)
- **Frontend dev server**: Auto-detected from package.json

### Chrome DevTools MCP
Browser console access for frontend debugging is configured automatically. See client-side errors, React issues, and network requests directly in Claude.

### Expert Contract Review
Get your contracts analyzed against:
- Clarity Book best practices (Ch13)
- Security patterns and common vulnerabilities
- Storage optimization opportunities
- Code style consistency

### SessionStart Hook
Automatically detects uninitialized Stacks projects and prompts you to run `/stacks:init`.

## Project Structure

```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata + Chrome DevTools MCP
├── commands/
│   ├── init.md               # /stacks:init command
│   ├── help.md               # /stacks:help command
│   └── expert-advice.md      # /stacks:expert-advice command
├── skills/
│   ├── start-dev-server/     # Dev server management
│   │   └── SKILL.md
│   └── plugin-help/          # Help display
│       └── SKILL.md
├── hooks/
│   ├── hooks.json            # SessionStart hook config
│   └── check-stacks-init.js  # Project detection script
└── general-stacks-knowledge.md  # Knowledge file for user projects
```

## Requirements

- **Clarinet**: Install via `brew install clarinet` (macOS) or [download from releases](https://github.com/hirosystems/clarinet/releases)
- **Docker**: Required for running devnet
- **Node.js**: For running tests with Vitest

## Example Prompts

**Getting Started:**
- "Initialize the Stacks plugin"
- "Start the dev servers"
- "What can the Stacks plugin do?"

**Contract Development:**
- "Create a new token contract following SIP-010"
- "Add a transfer function with proper authorization"
- "Write tests for the vault contract"

**Code Review:**
- "Review my contracts for best practices"
- "Check my contract for security issues"
- "Optimize my contract storage"

**Frontend:**
- "Connect the wallet to my app"
- "Add post-conditions to the transfer call"

## Documentation

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Book](https://book.clarity-lang.org)
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)

## License

Apache-2.0
