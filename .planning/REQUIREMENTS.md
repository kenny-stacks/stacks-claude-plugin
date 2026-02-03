# Requirements: Stacks Skills v1.1

**Defined:** 2026-02-03
**Core Value:** Enable developers to build high-quality Clarity smart contracts through enforced TDD workflow and 90%+ test coverage, with seamless frontend integration.

## v1.1 Requirements

Requirements for fuzz testing integration and trigger expansion. Continues from v1.0.

### Fuzz Testing

- [ ] **FUZZ-01**: Skill guides property-based test execution with `npx rv`
- [ ] **FUZZ-02**: Skill guides invariant test execution for state consistency verification
- [ ] **FUZZ-03**: Skill explains shrinking to find minimal failing cases
- [ ] **FUZZ-04**: Skill explains seed replay for reproducible failures
- [ ] **FUZZ-05**: Skill explains context tracking during test sequences
- [ ] **FUZZ-06**: Skill documents dialers for JavaScript pre/post hooks (event verification)
- [ ] **FUZZ-07**: Reference file `clarity-fuzz.md` with 10 property testing patterns

### Trigger Expansion

- [ ] **TRIG-01**: Skill description includes expanded keywords (STX, Bitcoin L2, devnet, SIP-009, SIP-010)
- [ ] **TRIG-02**: Skill description includes explicit "Use when..." context section

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Advanced Fuzz Testing

- **FUZZ-08**: Custom manifests for test doubles
- **FUZZ-09**: Multi-contract simultaneous fuzzing guidance
- **FUZZ-10**: CI integration patterns for fuzz test seeds

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Generic "blockchain" keywords | Causes false positives on Ethereum/Solana |
| Automatic invariant generation | Too complex, users define properties |
| GUI/visual fuzz testing tools | CLI-focused workflow |
| Mainnet fuzz testing | Safety concern, devnet/testnet only |
| Embedded fuzzer implementation | Use Rendezvous, don't rebuild |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FUZZ-01 | — | Pending |
| FUZZ-02 | — | Pending |
| FUZZ-03 | — | Pending |
| FUZZ-04 | — | Pending |
| FUZZ-05 | — | Pending |
| FUZZ-06 | — | Pending |
| FUZZ-07 | — | Pending |
| TRIG-01 | — | Pending |
| TRIG-02 | — | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9 (pending roadmap)

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
