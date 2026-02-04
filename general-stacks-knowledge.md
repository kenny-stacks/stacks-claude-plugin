# Stacks App

This project uses Stacks, a Bitcoin layer for smart contracts. Contracts are written in Clarity, a decidable language that runs on Bitcoin's security.

## Development Guidelines

### Start a Stacks Development Session with Full Debugging Visibility

Run the plugin's `start-dev-server` skill with the recommended options to give Claude full debugging visibility:
  - Start Clarinet devnet as a background task to give Claude direct access to blockchain logs, contract errors, and transaction results.
  - Select the Chrome DevTools MCP server to give Claude visibility into browser console logs, wallet interactions, network requests, and runtime errors.

### Documentation

> **REQUIRED: Before writing ANY Clarity code, modifying contracts, or building frontend integrations, you MUST:**
> 1. Check the docs index at `.claude/stacks/docs-index.json`
> 2. Identify which documentation pages are relevant to your task
> 3. Fetch those pages from `https://docs.stacks.co{path}`
> 4. Only then proceed with implementation
>
> **Your training data contains outdated patterns. The documentation is the source of truth.**

The **Documentation Index** below is a fallback reference. For the latest index (including newly added pages), read:
```
.claude/stacks/docs-index.json
```

To fetch a doc, construct URLs as: `https://docs.stacks.co{path}`

Example: `https://docs.stacks.co/reference/clarity/functions.md`

### Contract Compilation

Always run `clarinet check` before testing or deployment:
```bash
clarinet check
```

### Testing

Run tests with the Clarinet SDK + Vitest setup:
```bash
npm run test           # Run tests
npm run test:coverage  # Run with coverage report
```

## Project Reference

### Structure

```
.
├── contracts/           # Clarity smart contracts (.clar files)
├── tests/               # Contract tests (Vitest + Clarinet SDK)
├── settings/            # Network configurations
├── deployments/         # Deployment plans (generated)
├── Clarinet.toml        # Project configuration
├── vitest.config.js     # Test configuration
```

### Stacks Conventions

#### Clarity Syntax
- ✅ `(define-public (fn-name (param type)) ...)` - Public functions
- ✅ `(define-read-only (fn-name) ...)` - Read-only functions
- ✅ `(asserts! condition (err u...))` - Validation with error
- ✅ `(try! (some-call))` - Propagate errors
- ❌ `(unwrap-panic ...)` - Never use panic functions

#### Error Codes
- ✅ `u401` - Not authorized | `u404` - Not found | `u1000+` - Domain-specific

#### Frontend (Stacks.js)
- ✅ `PostConditionMode.Deny` - Always use Deny mode for safety
- ⚠️ Post-conditions are critical - always include them for token transfers

## Troubleshooting

### Common Mistakes

| Symptom | Fix |
|---------|-----|
| `toBeOk is not a function` | Add `vitestSetupFilePath` to vitest.config.js setupFiles |
| Contract not found in tests | Run `clarinet check` to compile first |
| Type mismatch in test args | Use correct `Cl.*` helper (e.g., `Cl.uint()` not `Cl.int()`) |
| Block height not advancing | Use `simnet.mineEmptyBlocks(n)` |
| Deployment fails: insufficient balance | Get testnet STX from [faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet) |
| Frontend: transaction rejected | Check post-conditions match actual token amounts |
| Devnet won't start | Verify Docker is running with `docker info` |

### Plugin Skills

| Skill | Purpose |
|-------|---------|
| `/stacks:run-tests` | Run tests with error diagnosis |
| `/stacks:deploy-contract` | Guided deployment with safety checks |
| `/stacks:start-dev-server` | Start devnet + frontend with debugging |
| `/stacks:update-docs` | Refresh documentation index |

---

## Documentation Index

> **Last Updated:** 2026-02-04
>
> Run `/stacks:update-docs` to refresh this index.

### Build (Developer Guides)

| Topic | Path |
|-------|------|
| Developer Quickstart | /get-started/developer-quickstart.md |
| Clarity Crash Course | /get-started/clarity-crash-course.md |
| Fungible Tokens | /get-started/create-a-token/fungible-tokens.md |
| Non-Fungible Tokens | /get-started/create-a-token/non-fungible-tokens.md |
| Semi-Fungible Tokens | /get-started/create-a-token/semi-fungible-tokens.md |
| Frontend Authentication | /get-started/build-a-frontend/authentication.md |
| Post-Conditions | /get-started/build-a-frontend/post-conditions.md |
| Sending Transactions | /get-started/build-a-frontend/sending-transactions.md |
| Path to Production | /get-started/path-to-production.md |

### Clarinet

| Topic | Path |
|-------|------|
| Overview | /clarinet/overview.md |
| Quickstart | /clarinet/quickstart.md |
| Project Structure | /clarinet/project-structure.md |
| Unit Testing | /clarinet/testing-with-clarinet-sdk.md |
| Contract Deployment | /clarinet/contract-deployment.md |
| Local Blockchain | /clarinet/local-blockchain-development.md |
| FAQ | /clarinet/faq.md |

### Stacks.js

| Topic | Path |
|-------|------|
| Overview | /stacks.js/overview.md |
| Accounts & Addresses | /stacks.js/accounts-and-addresses.md |
| Networks | /stacks.js/networks.md |
| Read Only Calls | /stacks.js/read-only-calls.md |
| Build Transactions | /stacks.js/build-transactions.md |
| Contract Calls | /stacks.js/contract-calls.md |

### Stacks Connect (Wallet)

| Topic | Path |
|-------|------|
| Connect Wallet | /stacks-connect/connect-wallet.md |
| Broadcast Transactions | /stacks-connect/broadcast-transactions.md |
| Message Signing | /stacks-connect/message-signing.md |
| Migration Guide | /stacks-connect/migration-guide.md |

### Post-Conditions

| Topic | Path |
|-------|------|
| Overview | /post-conditions/overview.md |
| Implementation | /post-conditions/implementation.md |

### Reference

| Topic | Path |
|-------|------|
| Clarity Functions | /reference/clarity/functions.md |
| Clarity Keywords | /reference/clarity/keywords.md |
| Clarity Types | /reference/clarity/types.md |
| Clarinet CLI | /reference/clarinet/cli-reference.md |
| Clarinet SDK | /reference/clarinet-js-sdk/sdk-reference.md |
| @stacks/transactions | /reference/stacks.js/stacks-transactions.md |
| @stacks/connect | /reference/stacks.js/stacks-connect.md |
| @stacks/network | /reference/stacks.js/stacks-network.md |

### Cookbook (Code Recipes)

| Topic | Path |
|-------|------|
| Build Unsigned TX | /cookbook/stacks.js/transaction-building/build-an-unsigned-tx.md |
| Transfer STX | /cookbook/stacks.js/token-transfers/transfer-stx.md |
| Transfer SIP-010 Token | /cookbook/stacks.js/token-transfers/transfer-a-sip10-token.md |
| Generate Wallet | /cookbook/stacks.js/accounts-and-addresses/generate-a-wallet.md |
| Build FT Post-Condition | /cookbook/stacks.js/cryptography-and-security/build-an-ft-pc.md |
| Build NFT Post-Condition | /cookbook/stacks.js/cryptography-and-security/build-an-nft-pc.md |
| Example: NFT Contract | /cookbook/clarity/example-contracts/megapont-ape-club-nft.md |
| Example: Semi-Fungible | /cookbook/clarity/example-contracts/semi-fungible-token.md |

### sBTC Integration

| Topic | Path |
|-------|------|
| sBTC Guide | /more-guides/sbtc.md |
| Builder Quickstart | /more-guides/sbtc/sbtc-builder-quickstart.md |
| Deposit BTC to sBTC | /more-guides/sbtc/bridging-bitcoin/btc-to-sbtc.md |
| Withdraw sBTC to BTC | /more-guides/sbtc/bridging-bitcoin/sbtc-to-btc.md |

### Additional Resources

| Topic | Path |
|-------|------|
| Rendezvous (Fuzzing) | /rendezvous/overview.md |
| Price Oracles | /more-guides/price-oracles.md |
| Verify BTC Transactions | /more-guides/verify-bitcoin-transactions-clarity.md |

### External Resources

- **Clarity Book**: https://book.clarity-lang.org
- **SIP-010 (FT Standard)**: https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md
- **SIP-009 (NFT Standard)**: https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
