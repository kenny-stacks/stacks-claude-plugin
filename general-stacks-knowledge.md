# Stacks Development Knowledge

This knowledge file provides essential guidance for Clarity smart contract development on the Stacks blockchain. It is automatically imported into projects initialized with the Stacks plugin.

## Documentation Reference

For the latest Stacks documentation, fetch from: **https://docs.stacks.co/llms.txt**

This provides up-to-date references for:
- Clarity language features and functions
- Stacks.js SDK usage
- Clarinet CLI commands
- Deployment and testing guides

---

## Clarity Best Practices

### Coding Style (from Clarity Book Ch13)

**1. Sequential Asserts Pattern**

Replace nested if statements with sequential asserts for clearer validation:

```clarity
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

**2. Explicit Error Handling**

Always use explicit error codes, never panic functions:

```clarity
;; BAD
(unwrap-panic (map-get? users tx-sender))

;; GOOD
(unwrap! (map-get? users tx-sender) (err u404))  ;; ERR-NOT-FOUND
(try! (some-function))  ;; Propagates error
```

**3. Unnecessary Begin Removal**

Only use `begin` for multiple sequential expressions:

```clarity
;; BAD
(define-read-only (get-balance (account principal))
  (begin (default-to u0 (map-get? balances account))))

;; GOOD
(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? balances account)))
```

**4. Error Code Conventions**

Use HTTP-style codes for standard errors, domain-specific codes for business logic:

```clarity
;; Standard errors (400-499)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))

;; Domain-specific (1000+)
(define-constant ERR-INSUFFICIENT-BALANCE (err u1000))
(define-constant ERR-ZERO-AMOUNT (err u1001))
```

### Storage Optimization

- **Hash on-chain, data off-chain**: Store 32-byte hash; keep full data in IPFS/Gaia
- **Minimize storage**: Users pay per byte; compute derived values when possible
- **Compact types**: Prefer `uint` over `string` where semantics allow
- **Use `at-block` for history**: Query past state instead of storing snapshots

### Upgradability Patterns

**Dynamic Principals** for upgradable contract references:

```clarity
;; WRONG: Cannot upgrade
(define-constant logic-contract .logic-v1)

;; RIGHT: Can upgrade by changing data-var
(define-data-var logic-contract principal .logic-v1)

(define-public (set-logic-contract (new-logic principal))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (ok (var-set logic-contract new-logic))))
```

---

## Test-Driven Development

### Vitest + Clarinet SDK Setup

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

### Test Patterns

```typescript
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

it("should deposit tokens successfully", () => {
  const wallet1 = simnet.getAccounts().get("wallet_1")!;
  const response = simnet.callPublicFn("token", "deposit", [Cl.uint(1000)], wallet1);
  expect(response.result).toBeOk(Cl.bool(true));
});

it("should reject zero amount", () => {
  const wallet1 = simnet.getAccounts().get("wallet_1")!;
  const response = simnet.callPublicFn("token", "deposit", [Cl.uint(0)], wallet1);
  expect(response.result).toBeErr(Cl.uint(400)); // ERR-INVALID-AMOUNT
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

---

## Clarinet CLI Quick Reference

| Command | Purpose |
|---------|---------|
| `clarinet new <name>` | Create new project |
| `clarinet contract new <name>` | Add contract to project |
| `clarinet check` | Validate contracts |
| `clarinet console` | Interactive REPL |
| `clarinet test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage (Vitest) |
| `clarinet devnet start` | Start local network (requires Docker) |
| `clarinet devnet stop` | Stop local network |

### Devnet Lifecycle

1. **Verify Docker running**: `docker info`
2. **Start devnet**: `clarinet devnet start` (in dedicated terminal)
3. **Health check**: Node responds at `localhost:20443`
4. **Stop when done**: `clarinet devnet stop`

### Console Commands

```clarity
;; Call read-only function
>> (contract-call? .counter get-count)

;; Call public function
>> (contract-call? .counter increment)

;; Switch caller
>> ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK

;; Get balances
>> ::get_assets_maps

;; Advance blocks
>> ::advance_chain_tip 100
```

---

## Frontend Integration (Stacks.js)

### Setup

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

### Wallet Connection (v8+ API)

```typescript
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

// Connect
const response = await connect();
const data = getLocalStorage();
const address = data?.stxAddress;

// Check connection
if (isConnected()) { /* ... */ }

// Disconnect
disconnect();
```

### Contract Calls

**Read-Only:**

```typescript
import { fetchCallReadOnlyFunction, cvToValue, Cl } from "@stacks/transactions";

const result = await fetchCallReadOnlyFunction({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "my-token",
  functionName: "get-balance",
  functionArgs: [Cl.principal(address)],
  network: getNetwork(),
  senderAddress: address,
});
return cvToValue(result).value;
```

**Write (With Signing):**

```typescript
import { openContractCall } from "@stacks/connect";

await openContractCall({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "my-token",
  functionName: "transfer",
  functionArgs: [Cl.uint(amount), Cl.principal(recipient), Cl.none()],
  onFinish: (data) => console.log("TX:", data.txId),
});
```

### Post-Conditions (CRITICAL)

Always include post-conditions for STX/token operations:

```typescript
import { Pc, PostConditionMode } from "@stacks/transactions";

await openContractCall({
  // ... contract details ...
  postConditions: [
    Pc.principal(senderAddress)
      .willSendEq(amount)
      .ft('ST1...contract.token', 'token-name')
  ],
  postConditionMode: PostConditionMode.Deny, // ALWAYS use Deny
});
```

### Network Configuration

```typescript
import { StacksMainnet, StacksTestnet, StacksDevnet } from "@stacks/network";

export function getNetwork() {
  switch (process.env.NEXT_PUBLIC_STACKS_NETWORK) {
    case "mainnet": return new StacksMainnet();
    case "testnet": return new StacksTestnet();
    default: return new StacksDevnet({ url: 'http://localhost:20443' });
  }
}
```

---

## Design Document Template

Create a design document for each contract before implementation:

```markdown
# Contract: {contract-name}

## Purpose
[What problem does this contract solve? Who are the users?]

## Data Structures

### Constants
- `CONTRACT-OWNER`: tx-sender (deployer principal)
- `ERR-NOT-AUTHORIZED`: (err u401)
- `ERR-NOT-FOUND`: (err u404)

### Data Variables
- `{var-name}` ({type}): {purpose}

### Maps
- `{map-name}` ({key-type} => {value-type}): {purpose}

## Public Interface

### Public Functions
- `function-name(param: type) -> (response ok-type err-type)`
  - Purpose: {what it does}
  - Authorization: {who can call}

### Read-Only Functions
- `function-name(param: type) -> return-type`

### Error Codes
- u401: Not authorized
- u404: Not found
- u1000+: Domain-specific errors
```

---

## External References

### Clarity Book (Authoritative)
- [Best Practices](https://book.clarity-lang.org/ch13-00-best-practices.html)
- [Coding Style](https://book.clarity-lang.org/ch13-01-coding-style.html)
- [Storage Optimization](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html)
- [Contract Upgradability](https://book.clarity-lang.org/ch13-03-contract-upgradability.html)
- [Testing](https://book.clarity-lang.org/ch07-04-testing-your-contract.html)

### Stacks Documentation
- [Clarity Overview](https://docs.stacks.co/clarity/overview)
- [Language Functions](https://docs.stacks.co/clarity/language-functions)
- [Clarinet CLI](https://docs.stacks.co/reference/clarinet/cli-reference)
- [Testing with Clarinet SDK](https://docs.stacks.co/clarinet/testing-with-clarinet-sdk)

### Standards (SIPs)
- [SIP-009: NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [SIP-010: Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)

### Stacks.js
- [Connect Wallet](https://docs.stacks.co/stacks-connect/connect-wallet)
- [@stacks/transactions](https://docs.stacks.co/reference/stacks.js/stacks-transactions)
- [Post-Conditions](https://docs.stacks.co/post-conditions/implementation)

---

*Stacks Plugin v1.0.0 | Apache-2.0*
