---
name: run-tests
description: Run Clarity contract tests and diagnose common errors. Use when the user wants to run tests, check coverage, or debug test failures in a Stacks/Clarinet project.
license: Apache-2.0
metadata:
  author: "Stacks Skills Contributors"
  version: "1.0.0"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Run Tests Skill

This skill runs Clarity contract tests using Vitest + Clarinet SDK and helps diagnose common errors.

## When to Use

- User wants to run tests
- User asks about test coverage
- User encounters test failures or errors
- After implementing contract changes to verify correctness

## Instructions

### Step 1: Verify Project Setup

**Check for Clarinet project:**
```bash
ls Clarinet.toml 2>/dev/null && echo "Clarinet project found" || echo "No Clarinet.toml found"
```

If no `Clarinet.toml`, check common monorepo locations:
- `clarity/Clarinet.toml`
- `contracts/Clarinet.toml`
- `packages/contracts/Clarinet.toml`

If found in subdirectory, `cd` there first.

**Check test setup exists:**
```bash
ls vitest.config.js vitest.config.ts 2>/dev/null
ls package.json 2>/dev/null
```

If missing vitest config, tell the user:
"I don't see a Vitest configuration. Would you like me to set up the testing environment? I'll create:
- `vitest.config.js` with Clarinet SDK setup
- Test scripts in `package.json`
- A sample test file"

### Step 2: Run Contract Check First

Always run `clarinet check` before tests to compile contracts:

```bash
clarinet check
```

**Common errors:**
- **Syntax errors** - Show the error and offer to fix
- **Unknown function** - Contract may reference undefined function
- **Type mismatch** - Function argument types don't match

If `clarinet check` fails, diagnose and fix before proceeding to tests.

### Step 3: Run Tests

**Detect test command from package.json:**
```bash
cat package.json | grep -A 5 '"scripts"'
```

Run tests (in order of preference):
1. If `test` script exists: `npm run test`
2. Otherwise: `npx vitest run`

```bash
npm run test
```

### Step 4: Diagnose Common Errors

**Error: "toBeOk is not a function" or "toBeErr is not a function"**

This means the Clarinet SDK vitest setup file is missing.

Check vitest.config.js:
```bash
cat vitest.config.js
```

**Fix:** Ensure `setupFiles` includes the Clarinet SDK setup:
```javascript
import { vitestSetupFilePath } from "@hirosystems/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    setupFiles: [vitestSetupFilePath],
    // ...
  }
});
```

---

**Error: "Contract not found" or "Unknown contract"**

The contract hasn't been compiled or isn't registered in `Clarinet.toml`.

**Fix:**
1. Run `clarinet check` to compile
2. Verify contract is in `Clarinet.toml`:
```bash
cat Clarinet.toml | grep -A 2 '\[contracts\.'
```

---

**Error: Type mismatches in test arguments**

Common `Cl.*` helper mistakes:

| Clarity Type | Correct Helper |
|--------------|----------------|
| `uint` | `Cl.uint(123)` |
| `int` | `Cl.int(-5)` |
| `bool` | `Cl.bool(true)` |
| `principal` | `Cl.principal("ST1...")` or `Cl.standardPrincipal("ST1...")` |
| `(string-ascii N)` | `Cl.stringAscii("hello")` |
| `(string-utf8 N)` | `Cl.stringUtf8("hello")` |
| `(buff N)` | `Cl.buffer(Uint8Array.from([...]))` or `Cl.bufferFromHex("deadbeef")` |
| `(optional T)` | `Cl.some(value)` or `Cl.none()` |
| `(list T)` | `Cl.list([...])` |
| `(tuple {...})` | `Cl.tuple({ key: value })` |

---

**Error: Block height not advancing / timing issues**

Tests that depend on block height need to mine blocks:

```typescript
// Mine empty blocks to advance chain
simnet.mineEmptyBlocks(10);

// Or mine block with specific transactions
simnet.mineBlock([
  tx.callPublicFn("contract", "function", [], sender)
]);
```

---

**Error: "simnet is not defined"**

The global `simnet` is provided by the Clarinet SDK setup file. Ensure:
1. `vitestSetupFilePath` is in vitest config
2. `globals: true` is set in vitest config

### Step 5: Run Coverage (Optional)

If the user asks for coverage or wants to see test coverage:

```bash
npm run test:coverage
```

Or if no coverage script exists:
```bash
npx vitest run --coverage
```

**Interpret coverage results:**
- **Lines/Statements**: Percentage of code lines executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called

Recommend 90%+ coverage for production contracts.

**If coverage is low:**
- Identify untested functions from the report
- Suggest specific test cases for uncovered branches
- Check for untested error conditions

### Step 6: Summarize Results

**If all tests pass:**
"All tests passed! Summary:
- X test suites
- Y tests passed
- Coverage: Z% (if run)"

**If tests fail:**
"Test run completed with failures:
- X tests passed
- Y tests failed

Failed tests:
1. `test name` - Brief description of failure
   Suggested fix: ...

Would you like me to help fix these failures?"

## Common Test Patterns Reference

**Testing successful public function:**
```typescript
const response = simnet.callPublicFn("contract", "function", [Cl.uint(100)], sender);
expect(response.result).toBeOk(Cl.bool(true));
```

**Testing error conditions:**
```typescript
const response = simnet.callPublicFn("contract", "function", [Cl.uint(0)], sender);
expect(response.result).toBeErr(Cl.uint(400));
```

**Testing read-only functions:**
```typescript
const result = simnet.callReadOnlyFn("contract", "get-value", [], sender);
expect(result.result).toBeUint(100);
```

**Testing events/prints:**
```typescript
const response = simnet.callPublicFn("contract", "function", [], sender);
expect(response.events).toContainEqual(
  expect.objectContaining({ event: "print_event" })
);
```

## Notes

- Always run `clarinet check` before tests to ensure contracts compile
- The `simnet` global is provided by Clarinet SDK setup
- Use `simnet.getAccounts().get("wallet_1")` for test accounts
- Contracts are auto-deployed to simnet based on `Clarinet.toml`
