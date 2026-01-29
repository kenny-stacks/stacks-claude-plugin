# Requirements: Stacks Skills

**Defined:** 2026-01-29
**Core Value:** Enable developers to build high-quality Clarity smart contracts through enforced TDD workflow and comprehensive testing

## v1 Requirements

Requirements for initial release. Single `stacks-dev` skill covering full workflow.

### Plugin Foundation

- [ ] **PLUG-01**: Plugin has valid plugin.json with name, description, and skill references
- [ ] **PLUG-02**: Plugin follows Claude Code plugin directory structure (skills/ at root, .claude-plugin/ for metadata only)
- [ ] **PLUG-03**: Plugin is installable via `claude plugins add` from local path or git URL

### Agent Skills Spec Compliance

- [ ] **SPEC-01**: Skill has `name` field (1-64 chars, lowercase + hyphens, matches directory name)
- [ ] **SPEC-02**: Skill has `description` field (1-1024 chars, describes what skill does AND when to use it)
- [ ] **SPEC-03**: Skill has `license` field specifying license terms
- [ ] **SPEC-04**: Skill has `metadata` field with author and version
- [ ] **SPEC-05**: Skill has `allowed-tools` field declaring required tools
- [ ] **SPEC-06**: Skill passes `skills-ref validate` validation
- [ ] **SPEC-07**: Skill follows progressive disclosure (~100 tokens metadata, <5k instructions)
- [ ] **SPEC-08**: Skill uses optional directories correctly (references/, scripts/, assets/)

### Skill Structure

- [ ] **SKIL-01**: Single `stacks-dev` skill with valid SKILL.md and YAML frontmatter
- [ ] **SKIL-02**: Skill description triggers auto-loading when user mentions Stacks, Clarity, or Clarinet
- [ ] **SKIL-03**: Skill body stays under 500 lines (use supporting files for reference material)
- [ ] **SKIL-04**: Skill uses progressive disclosure (reference files loaded on-demand)
- [ ] **SKIL-05**: File references are one level deep (no nested reference chains)

### Design Phase

- [ ] **DSGN-01**: Skill guides user to write pseudo code before implementation
- [ ] **DSGN-02**: Skill reviews designs against Clarity Book best practices (coding style, storage, upgradability)
- [ ] **DSGN-03**: Skill recommends modular contract architecture for upgradability
- [ ] **DSGN-04**: Skill references authoritative sources (Clarity Book, Stacks docs) not embedded docs

### TDD Workflow

- [ ] **TEST-01**: Skill enforces tests-first workflow (write tests before contract implementation)
- [ ] **TEST-02**: Skill guides writing unit tests using Clarinet SDK
- [ ] **TEST-03**: Skill validates test coverage using Clarinet coverage tools
- [ ] **TEST-04**: Skill enforces 90%+ coverage gate before proceeding to frontend

### Contract Implementation

- [ ] **CONT-01**: Skill guides writing Clarity contracts following best practices
- [ ] **CONT-02**: Skill applies coding style patterns (no unnecessary begin, meaningful errors, asserts over nested ifs)
- [ ] **CONT-03**: Skill applies storage patterns (hash storage, minimize on-chain data)
- [ ] **CONT-04**: Skill applies upgradability patterns (modular architecture, dynamic principals)

### Clarinet CLI

- [ ] **CLAR-01**: Skill guides project setup with `clarinet new` and `clarinet contracts new`
- [ ] **CLAR-02**: Skill uses `clarinet check` for syntax and type validation
- [ ] **CLAR-03**: Skill guides interactive testing with `clarinet console`
- [ ] **CLAR-04**: Skill guides local development with `clarinet devnet start`
- [ ] **CLAR-05**: Skill guides deployment with `clarinet deployments generate` and `clarinet deployments apply`

### Frontend Integration

- [ ] **FRNT-01**: Skill guides wallet integration using @stacks/connect
- [ ] **FRNT-02**: Skill guides contract calls using @stacks/transactions
- [ ] **FRNT-03**: Skill provides React/Next.js patterns for Stacks integration
- [ ] **FRNT-04**: Skill guides network configuration using @stacks/network

### Quality & Verification

- [ ] **QUAL-01**: Skill includes verification steps so Claude can self-check work
- [ ] **QUAL-02**: Skill declares required tools in frontmatter (allowed-tools)
- [ ] **QUAL-03**: Skill provides clear phase transitions (design → tests → contract → coverage → frontend)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Fuzz Testing

- **FUZZ-01**: Skill guides property-based testing with Rendezvous
- **FUZZ-02**: Skill guides invariant testing with Rendezvous
- **FUZZ-03**: Skill explains Rendezvous test file structure ({contract-name}.tests.clar)
- **FUZZ-04**: Skill guides writing custom dialers for advanced validation

### Multi-Skill Architecture

- **ARCH-01**: Split into orchestrator + specialized skills if single skill hits limitations
- **ARCH-02**: Orchestrator routes to appropriate specialized skill based on context
- **ARCH-03**: Specialized skills run in forked context where appropriate

### Advanced Features

- **ADVN-01**: Dynamic context injection for test results and coverage reports
- **ADVN-02**: Subagent execution for long-running operations
- **ADVN-03**: Token standard templates (SIP-009, SIP-010)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Mobile app development | Web-first with React/Next.js only |
| Vue/Svelte/other frameworks | React/Next.js only for v1, reduces scope |
| Mainnet deployment automation | Safety concern — devnet/testnet focus, manual mainnet |
| Embedded reference docs | Link to authoritative sources, don't duplicate |
| Multi-skill orchestration (v1) | Research shows single skill handles most cases; defer unless needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLUG-01 | Phase 1 | Pending |
| PLUG-02 | Phase 1 | Pending |
| PLUG-03 | Phase 1 | Pending |
| SPEC-01 | Phase 1 | Pending |
| SPEC-02 | Phase 1 | Pending |
| SPEC-03 | Phase 1 | Pending |
| SPEC-04 | Phase 1 | Pending |
| SPEC-05 | Phase 1 | Pending |
| SPEC-06 | Phase 1 | Pending |
| SPEC-07 | Phase 1 | Pending |
| SPEC-08 | Phase 1 | Pending |
| SKIL-01 | Phase 2 | Pending |
| SKIL-02 | Phase 2 | Pending |
| SKIL-03 | Phase 2 | Pending |
| SKIL-04 | Phase 2 | Pending |
| SKIL-05 | Phase 2 | Pending |
| QUAL-01 | Phase 2 | Pending |
| QUAL-02 | Phase 2 | Pending |
| QUAL-03 | Phase 2 | Pending |
| DSGN-01 | Phase 3 | Pending |
| DSGN-02 | Phase 3 | Pending |
| DSGN-03 | Phase 3 | Pending |
| DSGN-04 | Phase 3 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 4 | Pending |
| TEST-03 | Phase 4 | Pending |
| TEST-04 | Phase 4 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CLAR-01 | Phase 5 | Pending |
| CLAR-02 | Phase 5 | Pending |
| CLAR-03 | Phase 5 | Pending |
| CLAR-04 | Phase 5 | Pending |
| CLAR-05 | Phase 5 | Pending |
| FRNT-01 | Phase 6 | Pending |
| FRNT-02 | Phase 6 | Pending |
| FRNT-03 | Phase 6 | Pending |
| FRNT-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39/39 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after roadmap creation*
