# Roadmap: Stacks Skills Plugin

**Project:** stacks-skills
**Created:** 2026-01-29
**Depth:** Standard (5-8 phases)
**Approach:** Single-skill MVP (per research findings)

## Overview

This roadmap delivers a Claude Code plugin for Stacks blockchain development with enforced TDD workflow. The approach follows research recommendations: start with a single comprehensive `stacks-dev` skill that handles the full development lifecycle, then refine based on actual usage patterns. The phases progress from foundation setup through core skill implementation to specialized workflow capabilities and frontend integration.

## Phases

### Phase 1: Plugin Foundation & Compliance

**Goal:** Create valid, installable plugin structure that passes all Agent Skills spec validations.

**Dependencies:** None

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md - Create plugin structure, SKILL.md with frontmatter, optional directories
- [x] 01-02-PLAN.md - Validate with skills-ref and test plugin loading

**Requirements:**
- PLUG-01: Plugin has valid plugin.json with name, description, and skill references
- PLUG-02: Plugin follows Claude Code plugin directory structure (skills/ at root, .claude-plugin/ for metadata only)
- PLUG-03: Plugin loads via `--plugin-dir` flag for testing, installable via marketplaces for distribution
- SPEC-01: Skill has `name` field (1-64 chars, lowercase + hyphens, matches directory name)
- SPEC-02: Skill has `description` field (1-1024 chars, describes what skill does AND when to use it)
- SPEC-03: Skill has `license` field specifying license terms
- SPEC-04: Skill has `metadata` field with author and version
- SPEC-05: Skill has `allowed-tools` field declaring required tools
- SPEC-06: Skill passes `skills-ref validate` validation
- SPEC-07: Skill follows progressive disclosure (~100 tokens metadata, <5k instructions)
- SPEC-08: Skill uses optional directories correctly (references/, scripts/, assets/)

**Success Criteria:**
1. Plugin directory structure exists with .claude-plugin/plugin.json and skills/stacks-dev/SKILL.md
2. `claude --plugin-dir /path/to/stacks-skills` successfully loads plugin for testing
3. `skills-ref validate ./skills/stacks-dev` passes all validation checks
4. Skill appears in `/help` menu and auto-loads when user mentions "Stacks" or "Clarity"
5. Skill YAML frontmatter contains all required fields (name, description, license, metadata, allowed-tools)

---

### Phase 2: Core Skill Structure

**Goal:** Implement the single comprehensive `stacks-dev` skill with progressive disclosure and workflow orchestration.

**Dependencies:** Phase 1 (plugin foundation must exist)

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md - Create reference files for progressive disclosure (clarity-design.md, clarity-tdd.md, clarity-cli.md, clarity-frontend.md)
- [x] 02-02-PLAN.md - Write SKILL.md workflow orchestration with 5 phases, gates, and verification steps
- [x] 02-03-PLAN.md - Validate complete skill structure and test auto-invocation

**Requirements:**
- SKIL-01: Single `stacks-dev` skill with valid SKILL.md and YAML frontmatter
- SKIL-02: Skill description triggers auto-loading when user mentions Stacks, Clarity, or Clarinet
- SKIL-03: Skill body stays under 500 lines (use supporting files for reference material)
- SKIL-04: Skill uses progressive disclosure (reference files loaded on-demand)
- SKIL-05: File references are one level deep (no nested reference chains)
- QUAL-01: Skill includes verification steps so Claude can self-check work
- QUAL-02: Skill declares required tools in frontmatter (allowed-tools)
- QUAL-03: Skill provides clear phase transitions (design → tests → contract → coverage → frontend)

**Success Criteria:**
1. SKILL.md body is under 500 lines with workflow instructions
2. Reference files exist in references/ subdirectory (clarity-patterns.md, best-practices.md, frontend-integration.md)
3. Skill auto-invokes when user says "I want to build a Clarity contract"
4. Skill guides user through all workflow phases with clear transition points
5. Skill includes verification steps that Claude executes after each phase

---

### Phase 3: Design & Planning Phase

**Goal:** Enable contract design with pseudo code, logic flow, and best practices review.

**Dependencies:** Phase 2 (core skill structure must exist)

**Requirements:**
- DSGN-01: Skill guides user to write pseudo code before implementation
- DSGN-02: Skill reviews designs against Clarity Book best practices (coding style, storage, upgradability)
- DSGN-03: Skill recommends modular contract architecture for upgradability
- DSGN-04: Skill references authoritative sources (Clarity Book, Stacks docs) not embedded docs

**Success Criteria:**
1. User provides contract requirements and skill produces pseudo code design document
2. Design document includes modular architecture recommendations (data separation, logic contracts)
3. Skill applies Clarity Book best practices checks (no unnecessary begin, meaningful errors, storage optimization)
4. Skill links to specific Clarity Book sections and Stacks docs rather than duplicating content
5. Design artifacts are saved to project directory for reference during implementation

---

### Phase 4: TDD Workflow & Contract Implementation

**Goal:** Enforce tests-first workflow with Clarinet SDK unit tests and contract implementation.

**Dependencies:** Phase 3 (design phase outputs provide contract structure)

**Requirements:**
- TEST-01: Skill enforces tests-first workflow (write tests before contract implementation)
- TEST-02: Skill guides writing unit tests using Clarinet SDK
- TEST-03: Skill validates test coverage using Clarinet coverage tools
- TEST-04: Skill enforces 90%+ coverage gate before proceeding to frontend
- CONT-01: Skill guides writing Clarity contracts following best practices
- CONT-02: Skill applies coding style patterns (no unnecessary begin, meaningful errors, asserts over nested ifs)
- CONT-03: Skill applies storage patterns (hash storage, minimize on-chain data)
- CONT-04: Skill applies upgradability patterns (modular architecture, dynamic principals)

**Success Criteria:**
1. User cannot proceed to contract implementation until tests are written
2. Skill generates Clarinet SDK test files with comprehensive test cases covering contract functions
3. Contract code passes all tests on first run (TDD loop: write test, implement to pass)
4. Skill runs `clarinet test --coverage` and blocks progression if coverage < 90%
5. Contract code follows all Clarity Book best practices (verified through skill's review step)

---

### Phase 5: Clarinet CLI Integration

**Goal:** Guide project setup, validation, local development, and deployment using Clarinet CLI.

**Dependencies:** Phase 4 (contracts and tests must exist to run CLI commands)

**Requirements:**
- CLAR-01: Skill guides project setup with `clarinet new` and `clarinet contracts new`
- CLAR-02: Skill uses `clarinet check` for syntax and type validation
- CLAR-03: Skill guides interactive testing with `clarinet console`
- CLAR-04: Skill guides local development with `clarinet devnet start`
- CLAR-05: Skill guides deployment with `clarinet deployments generate` and `clarinet deployments apply`

**Success Criteria:**
1. Skill initializes new Clarinet project structure when user starts from scratch
2. Skill runs `clarinet check` after every contract modification and reports errors
3. Skill provides `clarinet console` commands for user to test functions interactively
4. Skill starts devnet and verifies contract deployment before frontend integration
5. Skill generates deployment plans and executes them with user confirmation

---

### Phase 6: Frontend Integration

**Goal:** Connect deployed contracts to React/Next.js applications using Stacks.js libraries.

**Dependencies:** Phase 5 (contracts must be deployed to devnet), Phase 4 (90%+ coverage gate must pass)

**Requirements:**
- FRNT-01: Skill guides wallet integration using @stacks/connect
- FRNT-02: Skill guides contract calls using @stacks/transactions
- FRNT-03: Skill provides React/Next.js patterns for Stacks integration
- FRNT-04: Skill guides network configuration using @stacks/network

**Success Criteria:**
1. Skill generates wallet connection component using @stacks/connect
2. Skill generates contract call functions using @stacks/transactions with proper error handling
3. Skill provides React hooks or Next.js patterns for contract state management
4. Skill configures network settings (devnet, testnet) using @stacks/network
5. Frontend successfully calls deployed contract functions and displays results

---

## Progress Tracking

| Phase | Status | Requirements | Completed |
|-------|--------|--------------|-----------|
| 1 - Plugin Foundation & Compliance | ✓ Complete | 11 | 11/11 |
| 2 - Core Skill Structure | ✓ Complete | 8 | 8/8 |
| 3 - Design & Planning Phase | Pending | 4 | 0/4 |
| 4 - TDD Workflow & Contract Implementation | Pending | 8 | 0/8 |
| 5 - Clarinet CLI Integration | Pending | 5 | 0/5 |
| 6 - Frontend Integration | Pending | 4 | 0/4 |

**Total Coverage:** 39/39 requirements mapped (100%)

---

## Notes

**Single-Skill MVP Approach:**
This roadmap follows research findings that recommend starting with a single comprehensive skill rather than premature multi-skill orchestration. The `stacks-dev` skill will handle the entire workflow (design → test → implement → deploy → frontend) within one cohesive skill file, using progressive disclosure to keep the core instructions under 500 lines.

**Quality Gates:**
- Phase 4 enforces 90%+ test coverage before allowing frontend integration
- Each phase includes verification steps so Claude can self-check work
- Skill references authoritative sources (Clarity Book, Stacks docs) rather than duplicating content

**Future Considerations:**
If the single skill proves insufficient (context window issues, exceeds 500 lines even with progressive disclosure, or user confusion), Phase 7+ could introduce specialized skills (clarity-design, clarity-tdd, stacks-frontend) with optional orchestrator coordination. However, this should only be done based on concrete evidence of limitations, not anticipated needs.

---

*Last updated: 2026-01-29 (Phase 2 complete)*
