# Clarity Test-Driven Development Patterns

## Contents

- [Collaborative TDD Workflow](#collaborative-tdd-workflow)
- [Soft TDD Enforcement](#soft-tdd-enforcement)
- [Vitest + Clarinet SDK Setup](#vitest--clarinet-sdk-setup)
- [Test Patterns](#test-patterns)
- [Coverage Analysis](#coverage-analysis)
- [External References](#external-references)

## Collaborative TDD Workflow

**Propose → approve → write** cycle:

1. **Analyze design doc** → identify test categories
2. **Propose test scenarios** at high level to user
3. **User approves/modifies** scenarios
4. **Write all test code** in batch after approval
5. **Run tests** (all should fail - RED phase)
6. **Implement contract** to make tests pass (GREEN phase)
7. **Refactor** while keeping tests green

### Scenario Presentation Format

Present scenarios grouped by category:

```
Happy Path:
- User deposits 1000 tokens successfully
- User withdraws 500 tokens successfully

Edge Cases:
- Deposit zero amount → ERR-INVALID-AMOUNT
- Withdraw more than balance → ERR-INSUFFICIENT-BALANCE

Error Handling:
- Non-owner calls admin function → ERR-NOT-AUTHORIZED
```

**After approval, write all tests in batch** - not incremental per function.

### Example Test

```typescript
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

it("should deposit tokens successfully", () => {
  const wallet1 = simnet.getAccounts().get("wallet_1")!;
  const response = simnet.callPublicFn("token", "deposit", [Cl.uint(1000)], wallet1);
  expect(response.result).toBeOk(Cl.bool(true));

  const balance = simnet.callReadOnlyFn("token", "get-balance", [Cl.principal(wallet1)], wallet1);
  expect(balance.result).toBeOk(Cl.uint(1000));
});

it("should reject zero amount", () => {
  const wallet1 = simnet.getAccounts().get("wallet_1")!;
  const response = simnet.callPublicFn("token", "deposit", [Cl.uint(0)], wallet1);
  expect(response.result).toBeErr(Cl.uint(400)); // ERR-INVALID-AMOUNT
});
```

## Soft TDD Enforcement

**Redirect when user writes contract before tests:**
"Following TDD, let's write tests first. This helps us think through edge cases before implementation. Should we start with test scenarios?"

**If user insists:** Proceed without blocking.

**TDD tracking:**
```
Phase 2 Progress: [█████░░░░░] 50% complete
TDD: ✓ followed  (or  TDD: ⚠ skipped)
```

## Vitest + Clarinet SDK Setup

### Configuration

**vitest.config.js:**

```javascript
import { defineConfig } from 'vitest/config';
import { vitestSetupFilePath } from "@hirosystems/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [vitestSetupFilePath],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
    }
  }
});
```

**package.json scripts:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

**Installation:**
```bash
npm install @hirosystems/clarinet-sdk @stacks/transactions
npm install -D vitest @vitest/coverage-v8
```

## Test Patterns

### Multi-User Scenarios

```typescript
it("should transfer tokens between accounts", () => {
  const [sender, recipient] = [simnet.getAccounts().get("wallet_1")!, simnet.getAccounts().get("wallet_2")!];

  simnet.callPublicFn("token", "mint", [Cl.uint(1000)], sender);
  const transfer = simnet.callPublicFn("token", "transfer", [Cl.uint(500), Cl.principal(recipient)], sender);
  expect(transfer.result).toBeOk(Cl.bool(true));

  const senderBalance = simnet.callReadOnlyFn("token", "get-balance", [Cl.principal(sender)], sender);
  expect(senderBalance.result).toBeOk(Cl.uint(500));
  const recipientBalance = simnet.callReadOnlyFn("token", "get-balance", [Cl.principal(recipient)], recipient);
  expect(recipientBalance.result).toBeOk(Cl.uint(500));
});
```

### Mining Blocks

```typescript
it("should allow withdrawal after lock period", () => {
  const wallet1 = simnet.getAccounts().get("wallet_1")!;
  simnet.callPublicFn("vault", "lock", [Cl.uint(1000)], wallet1);
  simnet.mineEmptyBlocks(100);
  const response = simnet.callPublicFn("vault", "unlock", [], wallet1);
  expect(response.result).toBeOk(Cl.uint(1000));
});
```

### Custom Matchers

```typescript
// Response types
expect(response.result).toBeOk(Cl.bool(true));
expect(response.result).toBeErr(Cl.uint(404));

// Value types
expect(value).toBeUint(1000);
expect(value).toBePrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
expect(value).toBeSome(Cl.uint(100));
expect(value).toBeNone();
```

## Coverage Analysis

### Running Coverage

```bash
npm run test:coverage        # Or: vitest run --coverage
```

**IMPORTANT:** Use `vitest run --coverage`, NOT `clarinet test --coverage` (deprecated).

### Coverage Report Format

```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
--------------------|---------|----------|---------|---------|------------------
contracts/token.clar|   94.23 |    87.50 |  100.00 |   94.23 | 45,67-69
contracts/vault.clar|   78.12 |    66.67 |   85.71 |   78.12 | 23,56,78-82
```

**With 90% thresholds**, tests fail if coverage drops below target:
```
ERROR: Coverage for lines (78.12%) does not meet threshold (90%)
```

### Viewing HTML Report

```bash
npm run test:coverage
open coverage/index.html
```

Red = uncovered lines, Yellow = partially covered branches

### Auto-Suggest Tests for Gaps

When coverage is below 90%, suggest scenarios:

```
Coverage gaps:
1. Line 45 (token.clar): Zero-amount check → "should reject transfer with zero amount"
2. Lines 67-69 (token.clar): Admin auth → "should reject admin-mint from non-owner"
```

## External References

### Official Documentation
- [Testing with Clarinet SDK](https://docs.stacks.co/clarinet/testing-with-clarinet-sdk) - Setup, simnet API, custom matchers
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage) - Coverage providers, thresholds, reporters
- [Clarity Book Chapter 7: Testing](https://book.clarity-lang.org/ch07-04-testing-your-contract.html) - Testing philosophy

### Additional Resources
- [Vitest API Reference](https://vitest.dev/api/) - Test framework API
- [@stacks/transactions Cl Helpers](https://github.com/hirosystems/stacks.js/tree/main/packages/transactions) - Clarity value construction

---

*Reference file for stacks-dev skill - TDD phase (Phase 2)*
