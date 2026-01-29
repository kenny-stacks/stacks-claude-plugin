# Clarity Test-Driven Development Patterns

## Contents

- [TDD Philosophy](#tdd-philosophy)
- [Clarinet Test Structure](#clarinet-test-structure)
- [Common Test Patterns](#common-test-patterns)
- [Testing Errors](#testing-errors)
- [Coverage Analysis](#coverage-analysis)
- [External References](#external-references)

## TDD Philosophy

Test-driven development for Clarity contracts:

1. **RED** - Write a test that fails (expected behavior not yet implemented)
2. **GREEN** - Write minimal code to make the test pass
3. **REFACTOR** - Clean up code while keeping tests green

Benefits: document expected behavior, catch security issues early, enable confident refactoring.

## Clarinet Test Structure

### Test File Location

```
project/
  contracts/my-contract.clar
  tests/my-contract.test.ts
```

### Vitest Framework

```typescript
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

describe("my-contract", () => {
  it("should do something", () => {
    // ARRANGE - Set up state
    const sender = simnet.getAccounts().get("wallet_1")!;

    // ACT - Call function
    const response = simnet.callPublicFn(
      "my-contract", "my-function", [Cl.uint(100)], sender
    );

    // ASSERT - Verify result
    expect(response.result).toBeOk(Cl.bool(true));
  });
});
```

## Common Test Patterns

### Testing Public Functions

```typescript
it("should mint tokens to caller", () => {
  const caller = simnet.getAccounts().get("wallet_1")!;

  const response = simnet.callPublicFn(
    "my-token", "mint", [Cl.uint(1000)], caller
  );
  expect(response.result).toBeOk(Cl.bool(true));

  // Verify state change
  const balance = simnet.callReadOnlyFn(
    "my-token", "get-balance", [Cl.principal(caller)], caller
  );
  expect(balance.result).toBeOk(Cl.uint(1000));
});
```

### Testing Read-Only Functions

```typescript
it("should return correct balance", () => {
  const account = simnet.getAccounts().get("wallet_1")!;

  const response = simnet.callReadOnlyFn(
    "my-token", "get-balance", [Cl.principal(account)], account
  );
  expect(response.result).toBeOk(Cl.uint(0));
});
```

### Testing Edge Cases

```typescript
it("should handle zero amount", () => {
  const sender = simnet.getAccounts().get("wallet_1")!;

  const response = simnet.callPublicFn(
    "my-token", "transfer", [Cl.uint(0), Cl.principal(sender)], sender
  );
  expect(response.result).toBeErr(Cl.uint(400)); // ERR-INVALID-AMOUNT
});
```

## Testing Errors

### Expected Error Pattern

```typescript
it("should reject unauthorized caller", () => {
  const notOwner = simnet.getAccounts().get("wallet_2")!;

  const response = simnet.callPublicFn(
    "my-contract", "admin-function", [], notOwner
  );
  expect(response.result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
});
```

### Multiple Error Conditions

```typescript
describe("transfer validation", () => {
  it("should reject zero amount", () => { /* ... */ });
  it("should reject insufficient balance", () => { /* ... */ });
  it("should reject self-transfer", () => { /* ... */ });
});
```

## Coverage Analysis

### Running Coverage

```bash
clarinet test --coverage
```

### Coverage Goals

- Target 90%+ line coverage before deployment
- All public functions tested
- All error paths tested
- Edge cases for numeric boundaries

### Finding Uncovered Code

```bash
clarinet test --coverage --json > coverage.json
```

Look for functions with 0% coverage, untested error branches.

## External References

### Clarinet Documentation
- [Testing with Clarinet SDK](https://docs.stacks.co/reference/clarinet-sdk/testing)
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)

### Vitest Framework
- [Vitest Documentation](https://vitest.dev/)
- [Expect API](https://vitest.dev/api/expect.html)

### Stacks Transactions
- [@stacks/transactions Cl helpers](https://github.com/hirosystems/stacks.js/tree/main/packages/transactions)

---

*Reference file for stacks-dev skill - TDD phase*
