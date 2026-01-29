# Clarinet CLI Reference

## Contents

- [Project Setup](#project-setup)
- [Development Commands](#development-commands)
- [Local Development](#local-development)
- [Deployment Commands](#deployment-commands)
- [Quick Reference](#quick-reference)
- [External References](#external-references)

## Project Setup

### Create New Project

```bash
clarinet new my-project
cd my-project
```

Creates project structure:
```
my-project/
  Clarinet.toml        # Project configuration
  contracts/           # Clarity contracts
  tests/               # Test files
  settings/            # Network settings
```

### Add New Contract

```bash
clarinet contract new counter
```

Creates:
- `contracts/counter.clar` - Contract source
- `tests/counter.test.ts` - Test file

## Development Commands

### Check Syntax and Types

```bash
clarinet check
```

Validates all contracts for:
- Syntax errors
- Type errors
- Undefined references

Run after every contract change.

### Interactive Console

```bash
clarinet console
```

Opens REPL for:
- Testing functions interactively
- Inspecting contract state
- Experimenting with Clarity code

### Run Tests

```bash
# Run all tests
clarinet test

# Run with coverage
clarinet test --coverage

# Run specific test file
clarinet test tests/counter.test.ts

# Watch mode (re-run on changes)
clarinet test --watch
```

## Local Development

### Start Devnet

```bash
clarinet devnet start
```

Starts local Stacks blockchain with:
- Bitcoin regtest node
- Stacks node
- Pre-funded test accounts

### Stop Devnet

```bash
clarinet devnet stop
```

### Devnet Configuration

Edit `settings/Devnet.toml`:

```toml
[network]
name = "devnet"

[[accounts]]
name = "deployer"
mnemonic = "..."
balance = 10_000_000_000_000

[[accounts]]
name = "wallet_1"
mnemonic = "..."
balance = 1_000_000_000_000
```

## Deployment Commands

### Generate Deployment Plan

```bash
# For devnet
clarinet deployments generate --devnet

# For testnet
clarinet deployments generate --testnet

# For mainnet
clarinet deployments generate --mainnet
```

Creates deployment plan in `deployments/` directory.

### Apply Deployment

```bash
# Apply to devnet
clarinet deployments apply --devnet

# Apply to testnet (requires funded wallet)
clarinet deployments apply --testnet

# Apply to mainnet (requires funded wallet)
clarinet deployments apply --mainnet
```

### Deployment Plan Structure

```yaml
# deployments/default.devnet-plan.yaml
---
id: 0
name: Deploy counter contract
network: devnet
actions:
  - action: deploy
    contract: counter
    sender: deployer
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `clarinet new <name>` | Create new project |
| `clarinet contract new <name>` | Add contract to project |
| `clarinet check` | Validate contracts |
| `clarinet console` | Interactive REPL |
| `clarinet test` | Run unit tests |
| `clarinet test --coverage` | Run tests with coverage |
| `clarinet devnet start` | Start local network |
| `clarinet devnet stop` | Stop local network |
| `clarinet deployments generate` | Create deployment plan |
| `clarinet deployments apply` | Execute deployment |

### Common Flags

| Flag | Purpose |
|------|---------|
| `--manifest-path <path>` | Specify Clarinet.toml location |
| `--devnet` | Target devnet network |
| `--testnet` | Target testnet network |
| `--mainnet` | Target mainnet network |
| `--coverage` | Generate coverage report |
| `--watch` | Re-run on file changes |

## Command Automation

When executing Clarinet commands, the skill applies different automation levels based on command impact.

### Auto-Execute Commands

These commands run without confirmation (safe, reversible, or local-only):

| Command | When to Auto-Run | Notes |
|---------|------------------|-------|
| `clarinet check` | After every contract edit | Always safe, just validates |
| `clarinet test` | When running test suites | Local execution only |
| `clarinet contract new <name>` | Adding contracts | Creates files, confirm creation in response |
| `clarinet deployments generate --devnet` | Preparing devnet deployment | Just creates plan file |
| `clarinet deployments apply --devnet` | Deploying to local devnet | Local network, easily reset |

### Confirmation Required

These commands require explicit user confirmation:

| Command | Reason | Confirmation Pattern |
|---------|--------|---------------------|
| `clarinet new <name>` | May overwrite existing project | Check for Clarinet.toml first, warn if exists |
| `clarinet devnet start` | Long-running process, needs dedicated terminal | Suggest opening in separate terminal |
| `clarinet deployments apply --testnet` | Costs real testnet tokens | Show plan summary, request confirmation |
| `clarinet deployments apply --mainnet` | Costs real STX | Show plan summary, explicit "deploy to mainnet" confirmation |
| Network tier escalation | Moving from devnet to testnet/mainnet | Always confirm tier change |

### Pre-Command Detection

Before executing commands, check prerequisites:

```bash
# Check for existing project (before clarinet new)
if [ -f "Clarinet.toml" ]; then
  echo "WARNING: Clarinet.toml already exists"
fi

# Check for Clarinet installation (before any command)
if ! command -v clarinet &> /dev/null; then
  echo "Clarinet not found. Install: brew install clarinet"
fi

# Check for Docker (before devnet commands)
if ! docker info &> /dev/null; then
  echo "Docker not running. Start Docker Desktop first."
fi
```

### Decision Tree

```
User requests CLI operation
    |
    ├── Is it a read/check operation?
    │   └── YES → Auto-execute (clarinet check, clarinet test)
    |
    ├── Is it creating local files?
    │   ├── New contract → Auto-execute, confirm creation
    │   └── New project → Check for existing, warn if overwrite
    |
    ├── Is it a deployment?
    │   ├── Devnet → Auto-execute (local network)
    │   ├── Testnet → Show plan, request confirmation
    │   └── Mainnet → Show plan, explicit confirmation required
    |
    └── Is it starting a service?
        └── Devnet start → Suggest dedicated terminal, don't auto-background
```

## External References

### Clarinet Documentation
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)
- [Clarinet Installation](https://docs.stacks.co/reference/clarinet/installation)
- [Deployment Plans](https://docs.stacks.co/reference/clarinet/deployments)

---

*Reference file for stacks-dev skill - CLI commands*
