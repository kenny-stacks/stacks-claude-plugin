---
name: stacks-dev
description: Stacks blockchain development assistant. Guides Clarity smart contract development using test-driven development with Clarinet CLI. Use when working with Stacks, Clarity smart contracts, Clarinet projects, or when building applications on the Stacks blockchain.
license: Apache-2.0
metadata:
  author: "Stacks Skills Contributors"
  version: "0.1.0"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Stacks Development Assistant

This skill guides you through Clarity smart contract development using an enforced test-driven development (TDD) workflow with the Clarinet CLI toolkit.

## Core Capabilities

- **Design-First Approach**: Define contract requirements, data structures, and public interfaces before coding
- **Test-Driven Development**: Write comprehensive tests before implementation (enforced)
- **Clarinet Integration**: Leverage Clarinet for project scaffolding, testing, coverage, and deployment
- **Quality Assurance**: Verify 90%+ coverage and security patterns before deployment
- **Frontend Integration**: Connect contracts to web applications using Stacks.js

## When This Skill Activates

This skill automatically activates when you mention:
- "Stacks" or "Stacks blockchain"
- "Clarity" or "Clarity smart contract"
- "Clarinet" or "Clarinet project"
- Working with `.clar` files or `Clarinet.toml`

---

## Workflow Overview

Development follows 5 sequential phases with verification gates between each:

```
Phase 1       Phase 2       Phase 3           Phase 4          Phase 5
Design    ->  Tests     ->  Implementation -> Verification  -> Frontend
[user gate]   [auto gate]   [auto gate]       [auto+user]      [user gate]
```

**Progress Format:** Each phase shows `Phase X/5: [Phase Name]`

**Gate Types:**
- **User Gate**: Requires your confirmation before proceeding
- **Auto Gate**: Verification must pass automatically
- **Auto+User**: Automated checks plus your security review

**Navigation:** You can request to jump phases, but I'll warn about skipping verification.

---

## Phase 1/5: Design

**Purpose:** Define contract requirements before writing any code.

### Steps

1. **Gather Requirements**
   - What problem does this contract solve?
   - Who are the users (principals)?
   - What operations do they need?

2. **Define Data Structures**
   - State variables (`define-data-var`)
   - Maps for key-value storage (`define-map`)
   - Constants for fixed values (`define-constant`)

3. **Specify Public Interface**
   - Public functions with inputs/outputs
   - Read-only functions for queries
   - Error codes and response types

4. **Consider Upgradability**
   - Will this contract need updates?
   - Should it delegate to other contracts?

**Reference:** For design patterns, see [references/clarity-design.md](references/clarity-design.md)

### Verification

Before proceeding, confirm:
- [ ] Requirements documented and understood
- [ ] Data structures defined (vars, maps, constants)
- [ ] Public function signatures specified
- [ ] Error codes defined
- [ ] Upgradability approach decided

### Gate: User Confirmation

When you confirm the design is complete, we proceed to Phase 2.

**Ready to proceed?** Confirm or request changes.

---

## Phase 2/5: Tests
**TDD Status:** [✓ followed | ⚠ skipped]

**Purpose:** Write comprehensive unit tests BEFORE implementation.

### Why Tests First?

Test-driven development ensures:
- Contract behavior is specified before code exists
- Implementation matches your requirements
- Regressions are caught automatically
- Edge cases are considered early

### Collaborative Test Generation

I'll propose test scenarios organized by category:

**Happy Path:**
- [Scenario description with expected outcome]

**Edge Cases:**
- [Zero/boundary values, empty inputs]

**Error Handling:**
- [Authorization failures, validation errors]

Review and approve the scenarios. After approval, I'll write all test code in batch.

### Steps

1. **Create Contract Scaffold**
   ```bash
   clarinet contract new my-contract
   ```
   Creates: `contracts/my-contract.clar` and `tests/my-contract.test.ts`

2. **I Propose Test Scenarios**
   Based on the design doc, I'll suggest test scenarios for each function

3. **You Review and Approve**
   Confirm the scenarios cover your requirements

4. **I Write Test Files**
   Implement all approved scenarios in batch

5. **Run Tests (Should Fail)**
   ```bash
   clarinet test
   ```
   Tests should fail now - no implementation exists yet (RED phase)

**Reference:** For testing patterns, see [references/clarity-tdd.md](references/clarity-tdd.md)

### TDD Compliance

If you request contract code before tests exist, I'll gently redirect:
"Following TDD, let's write tests first. This helps catch edge cases early."

If you prefer to proceed anyway, I'll continue and track the workflow:
- **TDD: ✓ followed** - Tests written before implementation
- **TDD: ⚠ skipped** - Contract written before tests (increased coverage threshold)

### Verification (Automatic)

I will verify:
- [ ] Test file exists for each contract
- [ ] All public functions have at least one test
- [ ] `clarinet check` passes (no syntax errors)
- [ ] `clarinet test` runs (tests fail as expected - RED phase)

### Gate: Automated Verification

When verification passes, we proceed automatically to Phase 3.

**If verification fails:**
1. I'll identify missing tests or issues
2. Attempt to fix automatically
3. Re-run verification
4. Escalate to you if issues persist after 3 attempts

---

## Phase 3/5: Implementation
**TDD Status:** [✓ followed | ⚠ skipped]

**Purpose:** Write Clarity code to pass tests.

### Steps

1. **Implement Data Structures**
   - Add `define-data-var` declarations
   - Add `define-map` declarations
   - Add `define-constant` values

2. **Implement Functions One at a Time**
   - Start with simplest function
   - Run tests after each function
   - Move to next when tests pass

3. **Apply Best Practices**
   - Use meaningful error codes (`err u100` with comments)
   - Avoid unnecessary `begin` blocks
   - Use `asserts!` for validation
   - Keep functions focused

4. **Iterate Until Green**
   ```bash
   clarinet test
   ```
   Continue until all tests pass.

**Reference:** For implementation patterns, see [references/clarity-implementation.md](references/clarity-implementation.md)

### Best Practices Review

After each function, I'll review for Clarity best practices:

**Coding Style:**
- Sequential asserts instead of nested if
- Meaningful error codes (HTTP-like: 400, 401, 404)
- No unnecessary begin blocks
- No unwrap-panic (use unwrap! with error codes)

**Storage:**
- Hash storage for large data
- Minimal on-chain storage
- Efficient map usage

**Upgradability:**
- Dynamic principals for upgradable references
- Data/logic separation where appropriate

I'll auto-fix mechanical violations (unnecessary begin, unwrap-panic) and explain what changed.
For structural changes (nested if → asserts), I'll ask first.

After implementation, I'll run `clarinet check` to verify syntax and type correctness.

### Verification (Automatic)

I will verify:
- [ ] All tests pass (`clarinet test` exits 0)
- [ ] No syntax errors (`clarinet check` passes)
- [ ] Best practices applied

### Gate: Automated Verification

When all tests pass, we proceed automatically to Phase 4.

**If tests fail:**
1. I'll analyze the failure
2. Attempt to fix the implementation
3. Re-run tests
4. Escalate to you if issues persist after 3 attempts

---

## Phase 4/5: Verification
**TDD Status:** [✓ followed | ⚠ skipped - 95% coverage required]

**Purpose:** Ensure quality through coverage and security review.

### Steps

1. **Run Coverage Analysis**
   ```bash
   npm run test:coverage
   ```
   Uses Vitest with Clarinet SDK for coverage reporting.

2. **Verify Coverage Threshold**
   - Target: 90%+ line coverage (95% if TDD skipped)
   - Identify any uncovered functions

3. **Security Review**
   - Check for common vulnerabilities
   - Review error handling
   - Verify access control

4. **Fix and Re-run**
   - Add tests for uncovered code
   - Fix security issues
   - Re-verify until thresholds met

**Reference:** For coverage commands, see [references/clarity-cli.md](references/clarity-cli.md)

### Coverage Display

After every test run, I'll show coverage status:

```
Coverage: 87% (target: 90%)
├── Lines: 87%
├── Functions: 100%
├── Branches: 75%
└── Statements: 88%

Uncovered:
- transfer() line 45: zero-amount validation branch
- admin-set-fee() lines 67-70: entire function
```

### Coverage Gap Analysis

When below 90%, I'll identify specific gaps and suggest tests:

"Line 45 is the zero-amount check in transfer().
Suggested test: 'should reject transfer with zero amount → ERR-INVALID-AMOUNT'"

Accept suggestions or provide your own test scenarios.

### Coverage Gate Override

**Standard threshold:** 90%

If coverage is below 90% and you want to proceed anyway:
- Say "proceed anyway" or "skip coverage gate"
- I'll note the override and continue to Phase 5
- No justification required

**If TDD was skipped:** Threshold increases to 95%

### Verification (Automatic)

I will verify:
- [ ] Coverage >= 90% (or 95% if TDD skipped)
- [ ] All functions tested
- [ ] Uncovered lines identified with suggested tests
- [ ] Security review completed

### Auto-Fix Loop

If coverage < 90%:
1. Identify uncovered functions/lines
2. Write additional tests
3. Re-run coverage analysis
4. Repeat up to 3 attempts
5. Escalate if threshold not achieved

### Gate: Automated + User Confirmation

When automated checks pass, I'll present a security summary for your review.

**What you'll review:**
- Coverage report summary
- Any security considerations
- Confirmation to proceed to frontend

---

## Phase 5/5: Frontend

**Purpose:** Integrate contract with web application.

### Steps

1. **Start Devnet**
   ```bash
   clarinet devnet start
   ```
   Local blockchain running at `localhost:3999`

2. **Connect Wallet**
   - Use `@stacks/connect` for wallet integration
   - Handle wallet connection/disconnection

3. **Call Contract Functions**
   - Use `@stacks/transactions` for contract calls
   - Handle transaction signing
   - Process transaction results

4. **Handle Results and Errors**
   - Parse contract responses
   - Display user-friendly messages
   - Handle transaction failures

**Reference:** For frontend patterns, see [references/clarity-frontend.md](references/clarity-frontend.md)

### Verification (Manual)

You verify:
- [ ] Contract deployed to devnet
- [ ] Wallet connects successfully
- [ ] Contract calls work from frontend
- [ ] Error handling works correctly

### Gate: User Verification

This is the final phase. You verify the integration works as expected.

**Deployment options after verification:**
- Stay on devnet for more testing
- Deploy to testnet for public testing
- Deploy to mainnet for production

---

## Navigation

### Jumping Between Phases

You can request to jump to any phase:
- "Go to design" - Returns to Phase 1
- "Skip to implementation" - Jumps to Phase 3
- "Review tests" - Returns to Phase 2

### Phase Skipping Warning

**If you request to skip phases:**

I'll warn: "Skipping [Phase X] increases risk. You'll need to complete [skipped verification] before deployment. Continue anyway?"

If you confirm:
- I'll track what was skipped
- Required verification before deployment increases
- Coverage threshold may increase (95%+ for skipped TDD)

### Backward Navigation

**If you want to revisit an earlier phase:**

I'll ask: "This returns to [Phase X] and may require re-verification of later phases. Continue?"

This ensures you understand that changes may cascade.

---

## Verification Behavior

### Automatic Verification After Each Phase

When you complete a phase, I automatically:
1. Run verification checks (files, commands)
2. Report summary: "All checks passed" or "X issues found"
3. Offer details if issues exist

### Auto-Fix Attempts

When verification fails:
1. **Attempt 1:** Identify issue, apply fix, re-verify
2. **Attempt 2:** Try alternative fix, re-verify
3. **Attempt 3:** Final attempt with different approach
4. **Escalate:** Present issues and ask for your guidance

### Issue Reporting

**Summary format:**
```
Verification: 2 issues found
- Missing test for `transfer` function
- Coverage at 85% (target: 90%)

Attempting auto-fix (1/3)...
```

**After fixes:**
```
Verification: All checks passed
- Tests: 12/12 passing
- Coverage: 94%

Ready to proceed to [Next Phase].
```

---

## Quick Reference

### Essential Commands

```bash
# Project setup
clarinet new my-project
clarinet contract new my-contract

# Development
clarinet check                  # Syntax validation
clarinet console                # Interactive REPL

# Testing
clarinet test                   # Run all tests
npm run test:coverage           # With coverage report (Vitest)

# Deployment
clarinet devnet start           # Local blockchain
clarinet deployment apply -p deployments/default.devnet-plan.yaml
```

### Phase Summary

| Phase | Purpose | Gate | Reference |
|-------|---------|------|-----------|
| 1. Design | Define requirements | User confirmation | [clarity-design.md](references/clarity-design.md) |
| 2. Tests | Write tests first | Auto verification | [clarity-tdd.md](references/clarity-tdd.md) |
| 3. Implement | Pass tests | Auto verification | [clarity-cli.md](references/clarity-cli.md) |
| 4. Verify | Coverage + security | Auto + user | [clarity-cli.md](references/clarity-cli.md) |
| 5. Frontend | Web integration | User verification | [clarity-frontend.md](references/clarity-frontend.md) |

### Getting Help

- "Show me design patterns" - Loads design reference
- "How do I test this?" - Loads TDD reference
- "What clarinet commands?" - Loads CLI reference
- "Help with frontend" - Loads frontend reference

---

## Quality Standards

This skill enforces:

1. **TDD Required**: Tests must exist before implementation
2. **90% Coverage**: Minimum threshold before deployment
3. **Error Handling**: All public functions must handle errors
4. **Security Review**: Manual review before mainnet deployment

**Exceptions require explicit acknowledgment** and increase verification requirements.

---

*stacks-dev v0.1.0 | Apache-2.0 | [Report Issues](https://github.com/stacks-skills/stacks-skills/issues)*
