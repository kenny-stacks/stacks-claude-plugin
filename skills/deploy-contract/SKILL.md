---
name: deploy-contract
description: Guide deployment of Clarity contracts to testnet or mainnet with pre-flight checks and safety prompts. Use when the user wants to deploy contracts to a live network.
license: MIT
metadata:
  author: "Stacks Skills Contributors"
  version: "1.0.0"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Deploy Contract Skill

This skill guides safe deployment of Clarity contracts to Stacks testnet or mainnet.

## When to Use

- User wants to deploy contracts to testnet
- User wants to deploy contracts to mainnet
- User asks about deployment process
- After development is complete and user is ready to go live

## Instructions

### Step 1: Pre-Flight Checks

Run these checks before any deployment:

**1.1 Contract Compilation:**
```bash
clarinet check
```
If this fails, stop and help fix errors first.

**1.2 Test Suite:**
```bash
npm run test 2>&1 | tail -20
```
If tests fail, strongly recommend fixing before deployment.

**1.3 Test Coverage (Recommended):**
```bash
npm run test:coverage 2>&1 | grep -A 5 "Coverage summary" || echo "No coverage script found"
```

Tell the user:
"Pre-flight check results:
- Contracts compile: [PASS/FAIL]
- Tests pass: [PASS/FAIL]
- Coverage: [X%] (recommend 90%+ for production)

[If any fail]: I recommend fixing these issues before deploying.
[If all pass]: Ready for deployment. Which network?"

### Step 2: Network Selection

Ask the user:
"Which network would you like to deploy to?

1. **Testnet** (Recommended for first deployment)
   - Free STX from faucet
   - Safe for testing
   - Contracts can be redeployed with fresh accounts

2. **Mainnet**
   - Real STX required
   - Contracts are permanent and immutable
   - Requires extra safety checks

Which would you prefer?"

### Step 3A: Testnet Deployment

**Generate deployment plan:**
```bash
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`.

**Show the deployment plan:**
```bash
cat deployments/default.testnet-plan.yaml
```

Explain what will be deployed and estimated costs.

**Check STX balance:**

Tell the user:
"Before deploying, ensure your testnet account has STX for transaction fees.

**Get free testnet STX:**
1. Visit the Stacks Testnet Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter your testnet address
3. Request STX (may take a few minutes)

Do you have sufficient testnet STX? Let me know when ready to deploy."

**Apply deployment:**
```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

**Post-deployment:**
Show the deployed contract addresses and explorer links:
"Deployment complete!

Your contracts are now live on testnet:
- `contract-name`: [address]
  Explorer: https://explorer.hiro.so/txid/[txid]?chain=testnet

**Next steps:**
- Test your contracts on testnet thoroughly
- Check transactions in the explorer
- When ready for mainnet, run this skill again and select mainnet"

### Step 3B: Mainnet Deployment

**IMPORTANT: Extra safety for mainnet**

**3B.1 Require testnet deployment first:**

Ask:
"Have you successfully deployed and tested these contracts on testnet?

Mainnet deployment is permanent. I strongly recommend:
1. Deploy to testnet first
2. Thoroughly test all functionality
3. Have contracts reviewed for security

If you haven't deployed to testnet yet, would you like to do that first?"

If user hasn't tested on testnet, encourage them to do so first.

**3B.2 Security Checklist:**

Present this checklist to the user:
"**Mainnet Deployment Security Checklist**

Please confirm each item:

- [ ] **Testnet Testing**: Contracts thoroughly tested on testnet
- [ ] **Security Review**: Contracts audited for common vulnerabilities
  - Re-entrancy protection
  - Integer overflow/underflow
  - Access control verified
  - Post-conditions used in frontend
- [ ] **Sufficient STX**: Account has enough STX for deployment fees
- [ ] **Key Security**: Deployment keys are securely backed up
- [ ] **Hardware Wallet**: Consider using hardware wallet for mainnet deployments

For professional security review, consider:
- Formal audit from security firms
- Community review on Discord/Forum
- Running `/stacks:expert-advice` for best practices check

Type 'confirmed' when you've reviewed this checklist, or ask questions about any item."

**3B.3 Generate mainnet plan:**
```bash
clarinet deployments generate --mainnet
```

**Show deployment plan and cost estimate:**
```bash
cat deployments/default.mainnet-plan.yaml
```

**3B.4 Final confirmation:**

"**FINAL CONFIRMATION**

You are about to deploy to **MAINNET**. This action:
- Costs real STX
- Is permanent and irreversible
- Makes contracts publicly accessible

Contracts to deploy:
[List contracts from plan]

Estimated cost: [X STX]

Type 'deploy to mainnet' to proceed, or 'cancel' to abort."

**3B.5 Apply mainnet deployment:**

Only proceed if user explicitly confirms.

```bash
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

For priority deployment (higher fees, faster confirmation):
```bash
clarinet deployments apply -p deployments/default.mainnet-plan.yaml --high-cost
```

**Post-deployment:**
"Mainnet deployment complete!

Your contracts are now live:
- `contract-name`: [address]
  Explorer: https://explorer.hiro.so/txid/[txid]?chain=mainnet

**IMPORTANT REMINDERS:**
- Contracts are now immutable - any bugs are permanent
- Monitor transactions in the explorer
- Keep deployment keys secure
- Consider using a multisig for admin functions

Congratulations on your mainnet launch!"

### Step 4: Troubleshooting

**Error: Insufficient balance**
"Your account doesn't have enough STX for deployment fees.

For testnet: Get free STX at https://explorer.hiro.so/sandbox/faucet?chain=testnet
For mainnet: Transfer STX from an exchange or wallet"

**Error: Contract already exists**
"A contract with this name already exists at this address.

Options:
1. Use a different contract name
2. Deploy from a different account
3. For testnet: Create a fresh account"

**Error: Transaction timeout**
"The transaction is taking longer than expected.

Check status: https://explorer.hiro.so/txid/[txid]?chain=[network]

The transaction may still succeed. Wait and check the explorer before retrying."

**Error: Nonce mismatch**
"There's a nonce mismatch, likely from a pending transaction.

Wait for pending transactions to confirm, then retry deployment."

## Notes

- Testnet and mainnet deployments use different accounts
- Contract names must be unique per account
- Deployment plans can be customized in the YAML file
- Use `--high-cost` flag for priority mainnet deployments
- Always verify contracts compile (`clarinet check`) before deployment
