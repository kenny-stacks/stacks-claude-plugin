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

## External References

### Clarinet Documentation
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)
- [Clarinet Installation](https://docs.stacks.co/reference/clarinet/installation)
- [Deployment Plans](https://docs.stacks.co/reference/clarinet/deployments)

---

*Reference file for stacks-dev skill - CLI commands*
