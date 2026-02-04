---
name: plugin-help
description: Display Stacks plugin capabilities, available commands, and example prompts. Use when user runs /stacks:help or asks about plugin features.
license: MIT
metadata:
  author: "Stacks Skills Contributors"
  version: "1.0.0"
allowed-tools:
  - Read
---

# Plugin Help Skill

Display comprehensive help information about the Stacks plugin.

## Instructions

When this skill is invoked, display the following information to the user:

---

## Stacks Plugin v1.0.0

Enhances Claude for developing Clarity smart contracts on the Stacks blockchain.

### Available Commands

| Command | Description |
|---------|-------------|
| `/stacks:init` | Initialize the plugin for your project. Copies knowledge files and optionally starts dev servers. |
| `/stacks:help` | Show this help information. |
| `/stacks:expert-advice` | Get expert review of your Clarity contracts against best practices and security patterns. |
| `/stacks:update-docs` | Refresh the documentation index to get latest Stacks doc paths. |

### Available Skills

| Skill | When It Activates |
|-------|-------------------|
| **run-tests** | When you want to run tests, check coverage, or debug test failures. |
| **deploy-contract** | When you want to deploy contracts to testnet or mainnet. |
| **start-dev-server** | When you want to start Clarinet devnet and frontend servers for local development. |
| **plugin-help** | When you ask about plugin capabilities or run `/stacks:help`. |

### Example Prompts

**Getting Started:**
- "Initialize the Stacks plugin" → Runs `/stacks:init`
- "Start the dev servers" → Invokes start-dev-server skill
- "What can the Stacks plugin do?" → Shows this help

**Contract Development:**
- "Create a new counter contract"
- "Add a transfer function to my token contract"
- "Write tests for the vault contract"

**Code Review:**
- "Review my contracts for best practices" → Runs `/stacks:expert-advice`
- "Check my contract for security issues"
- "Optimize my contract storage"

**Testing:**
- "Run the tests" → Invokes run-tests skill
- "Check test coverage"
- "Why is toBeOk not a function?"

**Deployment:**
- "Deploy my contract to testnet" → Invokes deploy-contract skill
- "Deploy to mainnet"
- "What are the deployment steps?"

**Frontend Integration:**
- "Connect the wallet to my app"
- "Add a button to call the transfer function"
- "Show me how to use post-conditions"

**Debugging:**
- "Why is my contract call failing?"
- "Debug this transaction error"
- "Check devnet status"

### Quick Reference

**Essential Clarinet Commands:**
```bash
clarinet new my-project      # Create new project
clarinet contract new token  # Add contract
clarinet check               # Validate contracts
clarinet console             # Interactive REPL
clarinet devnet start        # Start local blockchain
```

**Test Commands:**
```bash
npm run test           # Run all tests
npm run test:coverage  # Run with coverage report
npm run test:watch     # Watch mode
```

### Plugin Features

- **Live Documentation**: Fetches current Stacks docs before writing code to avoid outdated patterns
- **Chrome DevTools MCP**: Browser console access for frontend debugging
- **SessionStart Hook**: Automatic detection of uninitialized Stacks projects
- **Expert Review**: Contract analysis against Clarity Book best practices
- **Test Diagnosis**: Automatic diagnosis of common test failures

### Documentation

For the latest Stacks documentation, I can fetch from: `https://docs.stacks.co`

### Getting Help

- Ask me any question about Stacks/Clarity development
- Run `/stacks:expert-advice` for contract reviews
- Check the [Clarity Book](https://book.clarity-lang.org) for language reference
- Visit [docs.stacks.co](https://docs.stacks.co) for official documentation

---

*Stacks Plugin v1.0.0 | MIT | [Report Issues](https://github.com/kenny-stacks/stacks-claude-plugin/issues)*
