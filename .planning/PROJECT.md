# Stacks Skills

## What This Is

A Claude Code plugin for Stacks blockchain development. A single comprehensive `stacks-dev` skill guides developers through the entire development lifecycle using enforced TDD workflow: from contract design through testing, implementation, coverage verification, and React/Next.js frontend integration.

## Core Value

Enable developers to build high-quality Clarity smart contracts through enforced TDD workflow and 90%+ test coverage, with seamless frontend integration.

## Requirements

### Validated

- PLUG-01: Plugin has valid plugin.json with name, description, and skill references -- v1.0
- PLUG-02: Plugin follows Claude Code plugin directory structure -- v1.0
- PLUG-03: Plugin loads via `--plugin-dir` flag for testing -- v1.0
- SPEC-01: Skill has `name` field (1-64 chars, lowercase + hyphens) -- v1.0
- SPEC-02: Skill has `description` field (1-1024 chars) -- v1.0
- SPEC-03: Skill has `license` field -- v1.0
- SPEC-04: Skill has `metadata` field with author and version -- v1.0
- SPEC-05: Skill has `allowed-tools` field -- v1.0
- SPEC-06: Skill passes `skills-ref validate` -- v1.0
- SPEC-07: Skill follows progressive disclosure -- v1.0
- SPEC-08: Skill uses optional directories correctly -- v1.0
- SKIL-01: Single `stacks-dev` skill with valid SKILL.md -- v1.0
- SKIL-02: Auto-loading when user mentions Stacks/Clarity/Clarinet -- v1.0
- SKIL-03: Skill body under 600 lines with references -- v1.0
- SKIL-04: Progressive disclosure (reference files on-demand) -- v1.0
- SKIL-05: File references one level deep -- v1.0
- DSGN-01: Pseudo code before implementation -- v1.0
- DSGN-02: Reviews against Clarity Book best practices -- v1.0
- DSGN-03: Modular contract architecture recommendations -- v1.0
- DSGN-04: References authoritative sources -- v1.0
- TEST-01: Tests-first workflow enforcement -- v1.0
- TEST-02: Unit tests using Clarinet SDK -- v1.0
- TEST-03: Coverage validation with Vitest -- v1.0
- TEST-04: 90%+ coverage gate -- v1.0
- CONT-01: Clarity contracts following best practices -- v1.0
- CONT-02: Coding style patterns -- v1.0
- CONT-03: Storage patterns -- v1.0
- CONT-04: Upgradability patterns -- v1.0
- CLAR-01: Project setup with clarinet new -- v1.0
- CLAR-02: Syntax validation with clarinet check -- v1.0
- CLAR-03: Interactive testing with clarinet console -- v1.0
- CLAR-04: Local development with clarinet devnet -- v1.0
- CLAR-05: Deployment management -- v1.0
- FRNT-01: Wallet integration with @stacks/connect -- v1.0
- FRNT-02: Contract calls with @stacks/transactions -- v1.0
- FRNT-03: React/Next.js patterns -- v1.0
- FRNT-04: Network configuration with @stacks/network -- v1.0
- QUAL-01: Verification steps for self-checking -- v1.0
- QUAL-02: Required tools declared in frontmatter -- v1.0
- QUAL-03: Clear phase transitions -- v1.0

### Active

- [ ] FUZZ-01: Rendezvous fuzz testing integration
- [ ] TRIG-01: Expanded trigger keywords for broader auto-invocation

## Current Milestone: v1.1 Fuzz Testing & Trigger Expansion

**Goal:** Add property-based fuzz testing with Rendezvous and improve skill auto-invocation coverage.

**Target features:**
- Rendezvous fuzz testing workflow integrated into TDD phases
- Expanded skill description keywords for broader trigger matching
- Documentation for property-based testing patterns

### Out of Scope

- Mobile app development -- web-first with React/Next.js only
- Vue/Svelte/other frameworks -- React/Next.js only, reduces scope
- Mainnet deployment automation -- safety concern, devnet/testnet focus
- Embedded reference docs -- link to authoritative sources, don't duplicate
- Multi-skill orchestration -- validated single skill handles use case well

## Context

### Current State (v1.0 shipped)

- **SKILL.md**: 595 lines with 5-phase TDD workflow
- **Reference files**: 5 files totaling ~1,150 lines
- **Tech stack**: Claude Code plugin, Clarinet, Stacks.js v8+
- **Quality**: 39/39 requirements validated, audit passed

### Key Technologies

**Clarity** -- Smart contract language for Stacks
**Clarinet** -- Development toolkit (project setup, testing, devnet, deployment)
**Stacks.js** -- Frontend libraries (@stacks/connect, @stacks/transactions, @stacks/network)

### Authoritative Sources

- **Stacks Docs**: https://docs.stacks.co/
- **Clarity Book**: https://book.clarity-lang.org/
- **Rendezvous Docs**: https://stacks-network.github.io/rendezvous/ (for v2 fuzz testing)

## Constraints

- **Skill Format**: Must follow Claude Code skill specification
- **Plugin Structure**: Shareable as installable plugin
- **Source of Truth**: Reference official docs, don't duplicate
- **Coverage Gate**: 90%+ required before frontend integration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-skill MVP | Avoid premature orchestration; validate concept first | Good -- handles full workflow |
| Progressive disclosure | Keep SKILL.md focused; load references on-demand | Good -- 595 lines main, refs loaded as needed |
| Soft TDD enforcement | Redirect, don't block; respect user autonomy | Good -- maintains quality without frustration |
| 90% coverage gate with override | Enforce quality without being unreachable | Good -- balances rigor with flexibility |
| React/Next.js only | Most common Stacks frontend stack | Good -- clear scope, extensible later |
| v8+ @stacks/connect | Modern API patterns only | Good -- avoids deprecated patterns |

---
*Last updated: 2026-02-03 after v1.1 milestone start*
