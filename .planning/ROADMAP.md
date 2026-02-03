# Roadmap: Stacks Skills Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-01-29)
- 🚧 **v1.1 Fuzz Testing & Trigger Expansion** - Phases 7-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) - SHIPPED 2026-01-29</summary>

**Delivered:** Claude Code plugin for Stacks blockchain development with enforced TDD workflow and comprehensive testing

**Key accomplishments:**
- Valid Claude Code plugin structure with skills-ref validation passing
- 5-phase TDD workflow orchestration (Design → Tests → Implementation → Verification → Frontend)
- Progressive disclosure reference system (5 reference files for on-demand loading)
- Collaborative TDD workflow with soft enforcement and 90% coverage gate
- Full Clarinet CLI integration for project lifecycle
- React/Next.js frontend patterns with Stacks.js v8+ and post-condition security

**Stats:**
- 61 files created/modified
- ~1,790 lines of skill content (SKILL.md + references)
- 6 phases, 13 plans, 39 requirements
- 1 day (4.5 hours active development)

</details>

### 🚧 v1.1 Fuzz Testing & Trigger Expansion (In Progress)

**Milestone Goal:** Add property-based fuzz testing with Rendezvous and improve skill auto-invocation coverage.

**Target features:**
- Rendezvous fuzz testing workflow integrated into TDD phases
- Expanded skill description keywords for broader trigger matching
- Documentation for property-based testing patterns

#### Phase 7: Stack Integration
**Goal**: Add Rendezvous package to project stack for fuzz testing capability
**Depends on**: Nothing (isolated addition to existing v1.0 stack)
**Requirements**: FUZZ-01 (partial - installation foundation)
**Success Criteria** (what must be TRUE):
  1. Developer can install @stacks/rendezvous via npm with no dependency conflicts
  2. Running `npx rv --version` returns version 0.13.1 successfully
  3. Node.js version compatibility (20/22/24) is documented in installation instructions
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

#### Phase 8: Reference Documentation
**Goal**: Create comprehensive property-based testing patterns reference for developers
**Depends on**: Phase 7 (Rendezvous context established)
**Requirements**: FUZZ-07
**Success Criteria** (what must be TRUE):
  1. clarity-fuzz.md reference file exists with all 10 property testing patterns documented
  2. Each pattern includes concrete Clarity code examples showing implementation
  3. Reference distinguishes between property tests (function behavior) and invariant tests (state consistency)
  4. Seed-based reproduction workflow for debugging failing tests is documented
  5. Common invariants (balance consistency, supply conservation) are documented with examples
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

#### Phase 9: SKILL.md Workflow Integration
**Goal**: Integrate fuzz testing as parallel validation track in Phase 4 verification workflow
**Depends on**: Phase 8 (clarity-fuzz.md must exist to reference)
**Requirements**: FUZZ-01, FUZZ-02, FUZZ-03, FUZZ-04, FUZZ-05, FUZZ-06
**Success Criteria** (what must be TRUE):
  1. Phase 2 is renamed from "Tests" to "Unit Tests" with forward reference to fuzz tests
  2. Phase 4 describes parallel execution of unit tests (Vitest) and fuzz tests (Rendezvous)
  3. SKILL.md explains when to run npx rv for property tests vs invariant tests
  4. SKILL.md explains shrinking process to find minimal failing cases
  5. SKILL.md explains seed replay for reproducing failures deterministically
  6. SKILL.md explains context tracking during test sequences
  7. SKILL.md documents dialers for JavaScript pre/post hooks (event verification)
  8. Quick Reference section includes Rendezvous commands (npx rv)
  9. SKILL.md remains under 600-line budget through compression elsewhere
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

#### Phase 10: Trigger Expansion
**Goal**: Improve skill auto-invocation coverage with Stacks-specific keywords
**Depends on**: Nothing (isolated change, can run parallel with Phase 9)
**Requirements**: TRIG-01, TRIG-02
**Success Criteria** (what must be TRUE):
  1. Skill description includes expanded keywords (STX, Bitcoin L2, devnet, SIP-009, SIP-010)
  2. Skill description includes explicit "Use when..." context section
  3. Skill description remains under 1024 character limit
  4. Testing confirms NO false positives on Ethereum/Solana/generic testing prompts
  5. Testing confirms skill still activates on all valid Stacks development prompts
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: Testing & Validation
**Goal**: Verify end-to-end fuzz testing workflow with real Clarity contract
**Depends on**: Phase 9 AND Phase 10 (all integration changes complete)
**Requirements**: All v1.1 requirements (validation phase)
**Success Criteria** (what must be TRUE):
  1. Sample Clarity contract passes both unit tests (Vitest) and fuzz tests (Rendezvous)
  2. Phase 4 parallel validation workflow executes correctly (unit + fuzz)
  3. Fuzz test failure reproduction works via seed replay
  4. Coverage aggregation correctly reports unit test coverage and fuzz test pass/fail
  5. Skill auto-invocation works with expanded triggers (tested against diverse prompts)
  6. No false positives detected when testing with Ethereum/Solana/generic prompts
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

#### Phase 12: Documentation & Release
**Goal**: Document v1.1 features and tag release
**Depends on**: Phase 11 (validation complete)
**Requirements**: None (documentation phase)
**Success Criteria** (what must be TRUE):
  1. README.md updated with v1.1 features (fuzz testing, trigger expansion)
  2. Example fuzz test scenarios added to project documentation
  3. Phase 4 workflow changes documented in user-facing docs
  4. Release notes created highlighting fuzz testing integration and trigger improvements
  5. Git tag v1.1 created and ready for distribution
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 7 → 8 → 9 → 10 → 11 → 12
(Note: Phase 10 can run parallel with Phase 9, but both must complete before Phase 11)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-01-29 |
| 2. Skill Structure | v1.0 | 2/2 | Complete | 2026-01-29 |
| 3. TDD Workflow | v1.0 | 2/2 | Complete | 2026-01-29 |
| 4. Testing & Verification | v1.0 | 2/2 | Complete | 2026-01-29 |
| 5. Clarinet Integration | v1.0 | 2/2 | Complete | 2026-01-29 |
| 6. Frontend Integration | v1.0 | 2/2 | Complete | 2026-01-29 |
| 7. Stack Integration | v1.1 | 0/1 | Not started | - |
| 8. Reference Documentation | v1.1 | 0/1 | Not started | - |
| 9. SKILL.md Workflow Integration | v1.1 | 0/1 | Not started | - |
| 10. Trigger Expansion | v1.1 | 0/1 | Not started | - |
| 11. Testing & Validation | v1.1 | 0/1 | Not started | - |
| 12. Documentation & Release | v1.1 | 0/1 | Not started | - |
