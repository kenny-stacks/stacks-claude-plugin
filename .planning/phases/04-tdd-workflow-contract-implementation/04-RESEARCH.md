# Phase 4: TDD Workflow & Contract Implementation - Research

**Researched:** 2026-01-29
**Domain:** Clarity smart contract testing and implementation with Clarinet SDK
**Confidence:** HIGH

## Summary

Phase 4 implements test-driven development for Clarity smart contracts using the Clarinet SDK testing framework with Vitest. The research confirms that Clarinet SDK provides a complete testing solution with simnet (simulated blockchain), TypeScript test files, and Vitest integration with custom matchers. Coverage tooling is available through Vitest's `--coverage` flag, which generates HTML and LCOV reports showing uncovered lines, branches, functions, and statements.

The standard approach is: write tests using `simnet.callPublicFn()` and `simnet.callReadOnlyFn()`, validate with custom matchers (`toBeOk`, `toBeErr`, `toBeUint`), run tests with `vitest`, and analyze coverage to identify gaps. Clarity best practices from the Clarity Book Chapter 13 provide clear patterns for coding style, storage optimization, and upgradability that can be programmatically checked.

**Primary recommendation:** Enforce collaborative TDD workflow (propose test scenarios → user approves → write tests → implement contract → verify coverage) using Clarinet SDK's established patterns. Leverage Vitest coverage thresholds as enforcement gates and auto-suggest tests for uncovered code paths identified in coverage reports.

## Standard Stack

The established libraries/tools for Clarity testing and implementation:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @hirosystems/clarinet-sdk | Latest | Simulated blockchain testing environment | Official Hiro/Stacks testing framework; provides simnet API |
| vitest | Latest | Test runner and assertion framework | Official test framework for Clarinet SDK; replaces older Deno-based approach |
| @stacks/transactions | Latest | Clarity value construction (Cl helpers) | Official library for building Clarity types in TypeScript |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | Latest | Fast coverage provider using V8 profiler | Default; faster and lower memory; use unless targeting non-V8 runtimes |
| @vitest/coverage-istanbul | Latest | Universal coverage provider | When targeting Firefox, Bun, or non-V8 environments |
| vitest-environment-clarinet | Latest | Vitest environment setup | Auto-installed; provides simnet instance in test context |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Vitest is officially supported; faster, better ESM support, native TypeScript |
| @vitest/coverage-v8 | Istanbul provider | Istanbul works everywhere but slower; V8 is 99% use case |
| Clarinet SDK tests | Manual clarinet console testing | Console is for exploration; SDK enables CI/CD automation |

**Installation:**
```bash
npm install @hirosystems/clarinet-sdk @stacks/transactions
npm install -D vitest @vitest/coverage-v8
```

## Architecture Patterns

### Recommended Project Structure
```
project/
├── Clarinet.toml           # Project manifest
├── contracts/
│   └── my-contract.clar    # Clarity source
├── tests/
│   └── my-contract.test.ts # TypeScript tests
├── vitest.config.js        # Test configuration
└── package.json            # Scripts: test, test:coverage, test:watch
```

### Pattern 1: Test File Structure
**What:** Standard Vitest describe/it blocks with simnet API calls
**When to use:** All Clarity contract testing
**Example:**
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

describe("counter contract", () => {
  it("should increment counter", () => {
    const wallet1 = simnet.getAccounts().get("wallet_1")!;

    const response = simnet.callPublicFn(
      "counter",
      "increment",
      [],
      wallet1
    );

    expect(response.result).toBeOk(Cl.bool(true));

    const count = simnet.getDataVar("counter", "count");
    expect(count).toBeUint(1);
  });
});
```

### Pattern 2: Testing Error Conditions
**What:** Use `toBeErr()` matcher with specific error codes
**When to use:** Validating authorization, input validation, business logic errors
**Example:**
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk
it("should reject unauthorized caller", () => {
  const notOwner = simnet.getAccounts().get("wallet_2")!;

  const response = simnet.callPublicFn(
    "my-contract",
    "admin-function",
    [],
    notOwner
  );

  expect(response.result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
});
```

### Pattern 3: Multi-User Scenarios
**What:** Test interactions between multiple wallet accounts
**When to use:** Token transfers, marketplace transactions, authorization checks
**Example:**
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk
it("should transfer between accounts", () => {
  const accounts = simnet.getAccounts();
  const sender = accounts.get("wallet_1")!;
  const recipient = accounts.get("wallet_2")!;

  // Setup: sender mints tokens
  simnet.callPublicFn("token", "mint", [Cl.uint(1000)], sender);

  // Action: sender transfers to recipient
  const transfer = simnet.callPublicFn(
    "token",
    "transfer",
    [Cl.uint(500), Cl.principal(recipient)],
    sender
  );

  expect(transfer.result).toBeOk(Cl.bool(true));

  // Verify: both balances updated
  const senderBalance = simnet.callReadOnlyFn(
    "token", "get-balance", [Cl.principal(sender)], sender
  );
  expect(senderBalance.result).toBeUint(500);

  const recipientBalance = simnet.callReadOnlyFn(
    "token", "get-balance", [Cl.principal(recipient)], recipient
  );
  expect(recipientBalance.result).toBeUint(500);
});
```

### Pattern 4: Coverage Configuration
**What:** Vitest config with coverage thresholds and reporters
**When to use:** Enforce 90%+ coverage gate before deployment
**Example:**
```javascript
// Source: https://vitest.dev/config/coverage
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
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  }
});
```

### Pattern 5: Collaborative Test Scenario Approval
**What:** Present test scenarios at high level, get approval, then write code
**When to use:** TDD workflow - before writing any test code
**Example workflow:**
```
1. Analyze design doc → identify test categories
2. Present scenarios:
   "Happy Path:
    - User deposits 1000 tokens successfully
    - User withdraws 500 tokens successfully

   Edge Cases:
    - Deposit zero amount → ERR-INVALID-AMOUNT
    - Withdraw more than balance → ERR-INSUFFICIENT-BALANCE

   Error Handling:
    - Non-owner calls admin function → ERR-NOT-AUTHORIZED"

3. User approves/modifies scenarios
4. Write test code implementing approved scenarios
```

### Anti-Patterns to Avoid
- **Generic failure tests**: Don't use `testFail` - verify specific error codes with `toBeErr(Cl.uint(code))`
- **Hard-coded test values**: Use meaningful constants and explain business logic
- **Single-operation testing only**: Test operation sequences, not just isolated calls
- **Testing only happy paths**: Every public function needs error condition tests
- **Skipping state verification**: After state-changing calls, verify with `getDataVar` or read-only functions
- **Ignoring test isolation**: Don't assume state carries between tests (each test gets fresh simnet)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clarity type construction | String serialization, manual type building | `Cl` helpers from @stacks/transactions | Type-safe, handles edge cases, official API |
| Test assertions | Generic expect().toBe() | Custom matchers: toBeOk, toBeErr, toBeUint | Clarity-specific, better error messages, type validation |
| Coverage reporting | Manual code analysis, custom scripts | Vitest --coverage with v8/istanbul | Industry standard, HTML/LCOV output, threshold enforcement |
| Blockchain simulation | Mock objects, fake state | simnet from Clarinet SDK | Accurate Clarity VM simulation, contract deployment, block mining |
| Coverage gap analysis | Manual inspection, custom parsers | HTML coverage report (browser view) | Visual highlighting, line-by-line, branch coverage visualization |
| Test file generation | Manual file creation | `clarinet contract new <name>` | Auto-creates contract + test stub, updates Clarinet.toml |

**Key insight:** Clarinet SDK provides complete testing infrastructure. Don't reinvent coverage tools, assertion libraries, or blockchain simulation. Custom solutions miss edge cases (Clarity type nuances, VM behavior, cost analysis).

## Common Pitfalls

### Pitfall 1: Missing vitestSetupFilePath in Config
**What goes wrong:** Tests fail with "simnet is not defined" or custom matchers don't work
**Why it happens:** `vitestSetupFilePath` initializes simnet instance and registers custom matchers before tests run
**How to avoid:** Always include in vitest.config.js:
```javascript
import { vitestSetupFilePath } from "@hirosystems/clarinet-sdk/vitest";
export default defineConfig({
  test: {
    setupFiles: [vitestSetupFilePath]
  }
});
```
**Warning signs:** ReferenceError for simnet, "toBeOk is not a function" errors

### Pitfall 2: Not Running clarinet check After Contract Changes
**What goes wrong:** Tests report "contract not found" despite contract file existing
**Why it happens:** Clarinet needs to compile contracts before simnet can load them
**How to avoid:** Run `clarinet check` after every contract modification, or add to test script: `"test": "clarinet check && vitest run"`
**Warning signs:** Contract-not-found errors when contract file clearly exists

### Pitfall 3: Using Positive Coverage Thresholds for Coverage Gates
**What goes wrong:** Coverage threshold failures don't provide actionable feedback about what's uncovered
**Why it happens:** Positive thresholds (lines: 90) just say "not enough coverage" without specifics
**How to avoid:** Use coverage reports to identify gaps, then suggest specific tests. Thresholds enforce, reports guide.
**Warning signs:** User doesn't know what to test next after threshold failure

### Pitfall 4: Writing Implementation Before Tests (TDD Violation)
**What goes wrong:** Tests become validation afterthoughts instead of design drivers; lower quality tests
**Why it happens:** Natural impulse to code first; existing code makes tests feel like busywork
**How to avoid:** Soft redirect: "Following TDD, let's write tests first. This helps us think through edge cases before implementation. Should we start with test scenarios?"
**Warning signs:** User writes contract code in initial phase steps

### Pitfall 5: Not Testing Error Codes Explicitly
**What goes wrong:** Tests pass for wrong error reasons; changes break error handling silently
**Why it happens:** Only checking `isErr` without validating the specific error code
**How to avoid:** Always use `toBeErr(Cl.uint(EXPECTED_CODE))` not just `expect(response.result).not.toBeOk()`
**Warning signs:** Test descriptions say "rejects invalid input" but don't specify expected error

### Pitfall 6: Assuming Test State Persists Between Tests
**What goes wrong:** Tests pass in isolation but fail when run together; order-dependent tests
**Why it happens:** Documentation says "fresh chain before each test" but it's easy to forget
**How to avoid:** Each test should set up its own state; use beforeEach for common setup
**Warning signs:** Tests pass individually but fail in suite; different results when reordering

### Pitfall 7: Missing Coverage for Edge Cases (Zero, Max, Boundary Values)
**What goes wrong:** Production bugs with zero amounts, integer overflow, boundary conditions
**Why it happens:** Happy path focus; coverage metrics hit 90% without testing boundaries
**How to avoid:** Explicitly categorize edge cases during test scenario approval: "Edge Cases: zero amount, max uint, empty principal"
**Warning signs:** High coverage but no tests for zero, very large numbers, or empty values

### Pitfall 8: Unclear Test Descriptions
**What goes wrong:** Failed tests don't indicate what functionality broke; hard to debug
**Why it happens:** Generic descriptions like "it works" or "should pass"
**How to avoid:** Use descriptive patterns: "should reject transfer when sender has insufficient balance"
**Warning signs:** Multiple similar tests without clear differentiation

## Code Examples

Verified patterns from official sources:

### Simnet API Methods
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk

// Get test accounts
const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;

// Call public (state-changing) function
const response = simnet.callPublicFn(
  "contract-name",
  "function-name",
  [Cl.uint(100), Cl.principal(wallet1)],
  wallet1 // tx-sender
);

// Call read-only function
const balance = simnet.callReadOnlyFn(
  "contract-name",
  "get-balance",
  [Cl.principal(wallet1)],
  wallet1
);

// Read data variable
const totalSupply = simnet.getDataVar("token", "total-supply");

// Read map entry
const userRecord = simnet.getMapEntry(
  "registry",
  "users",
  Cl.principal(wallet1)
);

// Mine empty blocks (for time-dependent logic)
simnet.mineEmptyBlocks(100);
```

### Clarity Value Construction with Cl Helpers
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk
import { Cl } from "@stacks/transactions";

// Primitives
Cl.uint(1000)
Cl.int(-500)
Cl.bool(true)
Cl.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")

// Complex types
Cl.tuple({
  amount: Cl.uint(1000),
  recipient: Cl.principal("ST...")
})

Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3)])

Cl.some(Cl.uint(100))
Cl.none()

Cl.ok(Cl.bool(true))
Cl.error(Cl.uint(401))
```

### Custom Vitest Matchers
```typescript
// Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk

// Response type matchers
expect(response.result).toBeOk(Cl.bool(true));
expect(response.result).toBeErr(Cl.uint(404));

// Value type matchers
expect(value).toBeUint(1000);
expect(value).toBeInt(-500);
expect(value).toBeBool(true);
expect(value).toBePrincipal("ST...");
expect(value).toBeSome(Cl.uint(100));
expect(value).toBeNone();
```

### Clarity Best Practices: Sequential Asserts Pattern
```clarity
;; Source: https://book.clarity-lang.org/ch13-01-coding-style.html

;; BAD: Nested if statements
(define-public (transfer (amount uint) (recipient principal))
  (if (> amount u0)
    (if (<= amount (get-balance tx-sender))
      (ok (do-transfer amount recipient))
      (err u100))
    (err u101)))

;; GOOD: Sequential asserts
(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u101))           ;; ERR-ZERO-AMOUNT
    (asserts! (<= amount (get-balance tx-sender)) (err u100)) ;; ERR-INSUFFICIENT-BALANCE
    (ok (do-transfer amount recipient))))
```

### Clarity Best Practices: Explicit Error Handling
```clarity
;; Source: https://book.clarity-lang.org/ch13-01-coding-style.html

;; BAD: Panic functions (no error information)
(unwrap-panic (map-get? users tx-sender))
(unwrap-err-panic some-value)

;; GOOD: Explicit error codes
(unwrap! (map-get? users tx-sender) (err u404))  ;; ERR-NOT-FOUND
(try! (some-function))  ;; Propagates error
```

### Coverage Report Analysis Workflow
```bash
# Source: https://docs.stacks.co/clarinet/testing-with-clarinet-sdk

# Run tests with coverage
npm run test:coverage

# Generate HTML visualization (macOS)
brew install lcov
genhtml coverage/lcov.info --branch-coverage -o coverage/html
open coverage/html/index.html

# Analyze report:
# 1. Red highlighting = uncovered lines
# 2. Yellow highlighting = partially covered branches
# 3. Branch coverage shows if/else paths not tested
# 4. Function list shows which functions have 0% coverage
```

### Vitest Configuration for Coverage Thresholds
```javascript
// Source: https://vitest.dev/config/coverage

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],

      // Percentage thresholds (90% minimum)
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },

      // Include Clarity-related files
      include: ['contracts/**/*.clar'],

      // Exclude test files and examples
      exclude: ['tests/**', 'examples/**']
    }
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Clarinet console REPL testing | Clarinet SDK + Vitest automated tests | 2023 (Clarinet SDK announcement) | Enables CI/CD, coverage reporting, regression prevention |
| Deno-based testing | Vitest with TypeScript | 2024 (Clarinet SDK evolution) | Better IDE support, faster execution, familiar ecosystem |
| Manual coverage tracking | Automated Vitest coverage with thresholds | Current standard | Enforces quality gates, identifies gaps automatically |
| Generic test assertions | Custom Clarity matchers (toBeOk, toBeErr) | Clarinet SDK release | Type-safe, better error messages, Clarity-aware |
| Per-function TDD cycles | Batch test writing from design doc | Emerging best practice (2026) | Faster initial velocity, comprehensive coverage planning |

**Deprecated/outdated:**
- **clarinet test --coverage**: This was expected CLI syntax but doesn't exist. Use `vitest run --coverage` instead (Vitest integration is the official approach).
- **Deno test files**: Early Clarinet used Deno. Current standard is Vitest with TypeScript.
- **unwrap-panic/unwrap-err-panic**: Clarity Book explicitly discourages these; use `unwrap!` with error codes.

## Open Questions

Things that couldn't be fully resolved:

1. **Coverage threshold per-file vs global enforcement**
   - What we know: Vitest supports `coverage.thresholds.perFile: true` option
   - What's unclear: Whether this is useful for Clarity projects (typically few contracts)
   - Recommendation: Use global thresholds for MVP; per-file if project has >5 contracts with varying criticality

2. **Auto-fix automation limits**
   - What we know: CONTEXT.md specifies "auto-fix best practice violations" and "review after each function"
   - What's unclear: How aggressive auto-fixes should be (change code without asking vs suggest + ask)
   - Recommendation: Auto-fix only mechanical changes (unnecessary `begin`, `unwrap-panic` → `unwrap!`). Ask before logic changes (nested if → asserts might change execution order).

3. **Test scenario granularity**
   - What we know: CONTEXT.md wants "high-level scenario" approval, not "preview test code"
   - What's unclear: How detailed scenarios should be (just function name vs full parameter examples)
   - Recommendation: Medium detail - "Test that transfer fails with ERR-INSUFFICIENT-BALANCE when sender has 100 tokens but tries to send 200" (specifies behavior + error code, not exact test code)

4. **Coverage gap suggestion automation**
   - What we know: Coverage reports show uncovered lines/branches; CONTEXT wants "auto-suggest additional test scenarios for uncovered code"
   - What's unclear: How to parse coverage output and map to meaningful test suggestions
   - Recommendation: Read HTML/LCOV report → identify uncovered line ranges → map to contract functions → suggest scenarios like "Line 45 is uncovered - this is the zero-amount check in transfer(). Suggested test: 'should reject transfer with zero amount'"

## Sources

### Primary (HIGH confidence)
- [Clarinet SDK Testing Documentation](https://docs.stacks.co/clarinet/testing-with-clarinet-sdk) - Setup, API, patterns
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage) - Coverage providers, configuration
- [Vitest Coverage Config](https://vitest.dev/config/coverage) - Thresholds, reporters
- [Clarity Book Ch13-01: Coding Style](https://book.clarity-lang.org/ch13-01-coding-style.html) - Sequential asserts, error handling
- [Clarity Book Ch13-02: Storage Optimization](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html) - Hash storage, at-block
- [Clarity Book Ch13-03: Upgradability](https://book.clarity-lang.org/ch13-03-contract-upgradability.html) - Modular architecture, dynamic principals
- [Clarity Book Ch07-04: Testing](https://book.clarity-lang.org/ch07-04-testing-your-contract.html) - Testing philosophy

### Secondary (MEDIUM confidence)
- [Hiro Blog: Announcing Clarinet SDK](https://www.hiro.so/blog/announcing-the-clarinet-sdk-a-javascript-programming-model-for-easy-smart-contract-testing) - Rationale, design decisions
- [TDD for Ethereum Smart Contracts](https://www.krayondigital.com/blog/tdd-for-ethereum-smart-contracts-guide) - TDD principles (cross-verified with Clarity patterns)
- [Test-Driven Development Guide 2026](https://monday.com/blog/rnd/test-driven-development-tdd/) - Red-green-refactor cycle
- [Smart Contract Testing Anti-Patterns](https://www.linkedin.com/advice/0/what-some-common-pitfalls-anti-patterns-avoid-contract) - What not to do
- [Medium: Audited, Tested, and Still Broken](https://medium.com/coinmonks/audited-tested-and-still-broken-smart-contract-hacks-of-2025-a76c94e203d1) - Real-world testing failures

### Tertiary (LOW confidence)
- Various web search results about TDD workflow enforcement (general software engineering, not Clarity-specific)
- GitHub issues about Vitest coverage edge cases (not blocking issues, just community discussions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Hiro/Stacks documentation, current npm packages verified
- Architecture: HIGH - Verified patterns from official docs with working examples
- Pitfalls: HIGH - Derived from official docs warnings + real-world project examples
- TDD workflow: MEDIUM - General TDD principles applied to Clarity context (no Clarity-specific TDD enforcement research, but principles are universal)
- Coverage analysis: HIGH - Vitest official docs, Clarinet SDK integration verified

**Research date:** 2026-01-29
**Valid until:** 2026-04-29 (90 days - stable ecosystem, mature tools)
