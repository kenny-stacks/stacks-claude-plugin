# /stacks:expert-advice

Get expert-level review and advice for your Clarity smart contracts.

## What This Does

This command performs a comprehensive review of your Clarity contracts against best practices, security patterns, and common pitfalls. It provides actionable recommendations for improvement.

## Instructions

### Step 1: Explore Contracts

Find all Clarity contracts in the project:

```bash
find . -name "*.clar" -type f | grep -v node_modules
```

Read each contract file to understand the codebase.

### Step 2: Fetch Latest Documentation

Fetch the latest Stacks documentation for reference:

```
https://docs.stacks.co/llms.txt
```

Use this to ensure advice aligns with current best practices and API versions.

### Step 3: Review Against Best Practices

Analyze each contract for:

**Coding Style (Clarity Book Ch13)**
- [ ] No unnecessary `begin` blocks
- [ ] Sequential `asserts!` instead of nested `if`
- [ ] Explicit error codes (no `unwrap-panic`)
- [ ] Meaningful error constants (HTTP-style + domain-specific)
- [ ] Single `let` blocks where applicable

**Security Patterns**
- [ ] Authorization checks on sensitive functions
- [ ] Input validation (bounds checking, type validation)
- [ ] Proper use of `asserts!` vs `unwrap!` vs `try!`
- [ ] Post-conditions for STX/token transfers in frontend
- [ ] No reentrancy vulnerabilities
- [ ] Safe arithmetic (overflow/underflow considerations)

**Storage Optimization**
- [ ] Minimal on-chain storage
- [ ] Hash storage for large data
- [ ] No redundant computed fields
- [ ] Efficient map usage

**Upgradability (if applicable)**
- [ ] Dynamic principals for upgradable references
- [ ] Data/logic separation
- [ ] Clear governance patterns

### Step 4: Generate Report

Present findings in this format:

```markdown
## Contract Review: {contract-name}

### Summary
[Brief overview of what the contract does]

### Strengths
- [Good patterns observed]

### Issues Found

#### Critical (Security)
- [Issue description]
  - Location: `contracts/name.clar:line`
  - Fix: [Suggested fix with code]

#### High (Best Practices)
- [Issue description]
  - Location: `contracts/name.clar:line`
  - Fix: [Suggested fix]

#### Medium (Optimization)
- [Issue description]

#### Low (Style)
- [Issue description]

### Recommendations
1. [Prioritized action items]

### References
- [Relevant documentation links]
```

### Step 5: Offer Fixes

After presenting the report, ask:
"Would you like me to apply any of these fixes? I can:
1. Apply all auto-fixable issues (style, unnecessary begin blocks, etc.)
2. Fix specific issues one by one
3. Just keep the report for manual review"

If the user wants fixes applied:
- For auto-fixable issues (style violations), apply directly
- For structural changes (nested if -> asserts), show the proposed change and confirm
- Run `clarinet check` after each modification to verify syntax

### Step 6: Test Coverage Check

If tests exist, suggest running coverage:

"I also recommend checking test coverage with `npm run test:coverage`. Would you like me to analyze coverage gaps and suggest additional tests?"

## Notes

- This command is most useful before deploying to testnet/mainnet
- It focuses on Clarity-specific patterns from the Clarity Book
- For frontend code review, use standard code review practices
- Consider running this periodically during development, not just at the end
