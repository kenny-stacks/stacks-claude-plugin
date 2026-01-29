# Clarity Contract Implementation Guide

This reference supports **Phase 3: Implementation** of the stacks-dev workflow. Use it when writing Clarity contract code after tests are passing (TDD green phase).

## Coding Style Patterns (CONT-02)

### Sequential Asserts Pattern

Replace nested if statements with sequential asserts.

**BAD: Nested if statements**
```clarity
(define-public (transfer (amount uint) (recipient principal))
  (if (> amount u0)
    (if (<= amount (get-balance tx-sender))
      (ok (do-transfer amount recipient))
      (err u100))
    (err u101)))
```

**GOOD: Sequential asserts**
```clarity
(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u101))           ;; ERR-ZERO-AMOUNT
    (asserts! (<= amount (get-balance tx-sender)) (err u100)) ;; ERR-INSUFFICIENT-BALANCE
    (ok (do-transfer amount recipient))))
```

### Explicit Error Handling

Always use explicit error codes, never panic functions.

```clarity
;; BAD
(unwrap-panic (map-get? users tx-sender))

;; GOOD
(unwrap! (map-get? users tx-sender) (err u404))  ;; ERR-NOT-FOUND
(try! (some-function))  ;; Propagates error
```

### Unnecessary Begin Removal

Only use `begin` for multiple sequential expressions.

```clarity
;; BAD
(define-read-only (get-balance (account principal))
  (begin (default-to u0 (map-get? balances account))))

;; GOOD
(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? balances account)))
```

### Error Code Conventions

```clarity
;; Standard errors (400-499)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))

;; Domain-specific (1000+)
(define-constant ERR-INSUFFICIENT-BALANCE (err u1000))
(define-constant ERR-ZERO-AMOUNT (err u1001))
```

## Storage Patterns (CONT-03)

### Hash Storage for Large Data

Store hash on-chain, data off-chain (IPFS/Gaia).

```clarity
(define-map data-hashes principal (buff 20))

(define-public (store-data-hash (data (string-utf8 10000)))
  (let ((hash (hash160 data)))
    (map-set data-hashes tx-sender hash)
    (ok hash)))
```

**Use for:** Documents, metadata, audit trails

### Minimize On-Chain Storage

Store only what's needed; compute derived values.

```clarity
;; BAD: Redundant field
(define-map user-data principal {
  balance: uint,
  total-deposited: uint,
  net-balance: uint  ;; Can compute from above!
})

;; GOOD: Compute in read-only function
(define-read-only (get-net-balance (account principal))
  (match (map-get? user-data account)
    data (get balance data)
    u0))
```

**Key points:**
- Users pay per byte stored
- Prefer `uint` over `string` where possible
- Use `at-block` for historical queries instead of storing snapshots

### Data Separation

Separate data contracts from logic contracts.

```
contracts/
  logic.clar    # Business rules
  storage.clar  # Persistent data
```

This enables logic upgrades without data migration.

## Upgradability Patterns (CONT-04)

**Note:** See clarity-design.md for ExecutorDAO architectural pattern. This section covers implementation-level patterns.

### Dynamic Principals

Use data variables for upgradable contract references.

```clarity
;; WRONG: Hard-coded (cannot upgrade)
(define-constant logic-contract .logic-v1)

;; RIGHT: Upgradable via data-var
(define-data-var logic-contract principal .logic-v1)

(define-public (execute)
  (let ((current-logic (var-get logic-contract)))
    (as-contract (contract-call? current-logic process))))

(define-public (set-logic-contract (new-logic principal))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (ok (var-set logic-contract new-logic))))
```

### Trait-Based Dispatch

```clarity
;; 1. Define trait
(define-trait processor-trait
  ((process (uint) (response uint uint))))

;; 2. Implement trait
(impl-trait .processor-trait)

;; 3. Dispatch through trait reference
(use-trait processor .traits.processor-trait)
(define-data-var current-processor principal .logic-v1)

(define-public (execute (value uint))
  (contract-call? (var-get current-processor) process value))
```

## Auto-Fix Guidance

**Purpose:** Documents which violations SKILL.md Phase 3 can auto-fix vs ask first.

### Auto-Fixable (Apply Without Asking)

Mechanical fixes with no semantic impact:

1. **Remove unnecessary `begin` blocks**
   - `(begin (ok true))` → `(ok true)`

2. **Replace `unwrap-panic` with `unwrap!` + error code**
   - `(unwrap-panic x)` → `(unwrap! x ERR-UNWRAP-FAILED)`

3. **Add missing error constant definitions**
   - `(err u401)` → Add `(define-constant ERR-NOT-AUTHORIZED (err u401))` at top
   - Replace inline usage with constant

4. **Format error codes consistently**
   - Add inline comments: `(err u1000) ;; ERR-INSUFFICIENT-BALANCE`

### Ask Before Fixing (User Confirmation Required)

Changes that may affect logic or architecture:

1. **Restructuring nested if → sequential asserts**
   - May change execution order or error precedence

2. **Moving data to separate contract**
   - Architectural change, affects deployment

3. **Adding upgrade mechanisms**
   - Security implications, governance considerations

## Review Workflow

From CONTEXT.md decisions:

1. Review after each function implementation
2. Auto-fix violations, explain what was changed and WHY
3. Educational feedback: link to Clarity Book section
4. Run `clarinet check` after every modification

## External References

### Clarity Book (Authoritative)

- [Ch13-01: Coding Style](https://book.clarity-lang.org/ch13-01-coding-style.html) - Sequential asserts, error handling
- [Ch13-02: Storage Optimization](https://book.clarity-lang.org/ch13-02-what-to-store-on-chain.html) - Hash storage, at-block
- [Ch13-03: Upgradability](https://book.clarity-lang.org/ch13-03-contract-upgradability.html) - Dynamic principals, traits
- [Ch13-00: Best Practices](https://book.clarity-lang.org/ch13-00-best-practices.html) - Complete checklist

### Stacks Documentation

- [Clarity Language Reference](https://docs.stacks.co/clarity/language-overview) - Language features
- [Language Functions](https://docs.stacks.co/clarity/language-functions) - Built-in functions

---

*Reference file for stacks-dev skill - Implementation phase (Phase 3)*
