# Research Summary: Stacks Skills Plugin

**Project:** stacks-skills
**Date:** 2026-01-29
**Purpose:** Claude Code plugin for Stacks blockchain development with enforced TDD workflow

## Executive Summary

Claude Code skills plugins are file-based systems using Markdown with YAML frontmatter, following the Agent Skills open standard with Claude-specific extensions. The recommended architecture for this multi-skill Stacks development plugin is an **orchestrator-coordinator pattern**: a primary `stacks` orchestrator skill routes tasks to seven specialized domain skills (clarity-design, clarity-contract, clarity-unit-tests, clarity-fuzz, clarity-coverage, clarinet, stacks-frontend), each owning clear phase boundaries and enforcing quality gates.

The critical success factor is **progressive disclosure**: skills load metadata (~100 tokens) at startup, full instructions (<5k tokens) when activated, and supporting files only when referenced. This prevents context window explosion while maintaining focused expertise per skill. For Stacks development specifically, the TDD workflow naturally maps to skill boundaries, with the coverage skill enforcing a 90%+ threshold gate before frontend integration can proceed.

**Key architectural decision**: Start with a SINGLE skill for MVP validation. Only add orchestration if concrete limitations emerge. The research strongly warns: "The recommendation is to start simple, as single-agent architecture handles way more use cases than expected." Premature orchestration complexity is the #1 critical pitfall that causes rewrites.

## Stack

**File Formats:**
- `SKILL.md` - Skill definition with YAML frontmatter + Markdown instructions (required per skill)
- `plugin.json` - Plugin manifest with metadata (required, goes in `.claude-plugin/` directory only)
- Markdown `.md` files - Reference documentation, templates (loaded on-demand)
- Any scripting language - Executable logic (bash, python, node) in `scripts/` subdirectories

**Directory Structure (Multi-Skill Plugin):**
```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json                    # ONLY the manifest goes here
├── skills/                             # All skills at plugin root
│   ├── stacks/                         # Orchestrator skill
│   ├── clarity-design/                 # Design phase
│   ├── clarity-contract/               # Implementation
│   ├── clarity-unit-tests/             # TDD workflow
│   ├── clarity-fuzz/                   # Property testing
│   ├── clarity-coverage/               # Coverage gating
│   ├── clarinet/                       # CLI orchestration
│   └── stacks-frontend/                # Frontend integration
├── agents/                             # Optional: custom subagents
├── hooks/                              # Optional: lifecycle hooks
└── README.md
```

**Critical Constraints:**
1. Only `plugin.json` goes inside `.claude-plugin/` - everything else MUST be at plugin root
2. Skills use directory structure (`skill-name/SKILL.md`), not flat files
3. Namespace isolation: Skills invoked as `/plugin-name:skill-name`
4. Keep SKILL.md under 500 lines; move detailed docs to `references/` subdirectory

**SKILL.md Format:**
```yaml
---
name: skill-name                        # Required: lowercase, hyphens, 1-64 chars
description: What and when to use       # Required: 1-1024 chars, include keywords
allowed-tools: Read Bash Grep Glob      # Optional: pre-approved tools
disable-model-invocation: false         # Optional: prevent auto-invoke
user-invocable: true                    # Optional: show in / menu
context: inline                         # Optional: inline (default) or fork
---

# Main Instructions
[Step-by-step instructions Claude follows]

For detailed patterns, see [reference.md](references/reference.md)
```

**String Substitutions:**
- `$ARGUMENTS` or `$0, $1, $2...` - Pass arguments to skills
- `${CLAUDE_SESSION_ID}` - Current session ID
- `!`command`` - Inject command output before Claude sees prompt (dynamic context)

**Validation Tools:**
- `skills-ref validate ./skill-name` - Official Agent Skills validator
- `/plugin validate` - Claude Code built-in validation
- `claude --debug --plugin-dir ./stacks-skills` - Debug plugin loading

## Features

**Table Stakes (Must Have):**
- SKILL.md with valid frontmatter (`name`, `description` required)
- Clear, keyword-rich descriptions for auto-invocation ("Use when working with Clarity contracts...")
- Focused scope (one skill per distinct task/phase)
- Progressive disclosure (metadata always loaded, full content when invoked, references on-demand)
- Plugin structure with proper namespace (`/stacks-skills:clarity-tdd`)
- Invocation control (`disable-model-invocation: true` for user-only skills)
- File reference paths (relative from skill root)

**Differentiators (High Value):**
- **Dynamic context injection** - Use `!`clarinet test --coverage`` to inject real-time data
- **Argument support** - `$ARGUMENTS` for flexible inputs (`/migrate-component SearchBar React Vue`)
- **Subagent execution** - `context: fork` with `agent: Explore` for isolated research tasks
- **Supporting files for composition** - `scripts/`, `references/`, `assets/` keep SKILL.md focused
- **Tool restrictions** - `allowed-tools: Read, Grep, Glob` for read-only analysis
- **Quality gates as skill boundaries** - Coverage skill blocks frontend skill until 90%+ achieved
- **Examples and templates** - Concrete input/output examples guide Claude's behavior
- **Multi-skill orchestration** - Orchestrator routes to specialized skills based on workflow phase

**Anti-Features (Explicitly Avoid):**
- Duplicate reference docs (link to official docs instead)
- Monolithic "do everything" skills (split into focused skills)
- Deep reference chains (keep references one level deep)
- Hard-coded paths or URLs (use relative paths, arguments, or dynamic injection)
- Auto-invoke for destructive operations (`disable-model-invocation: true` for deploy/delete)
- Generic skill names ("helper", "utils" → use "testing", "deploying", "analyzing")
- Missing argument hints (add `argument-hint: [issue-number]` in frontmatter)
- Ignoring context budget (keep SKILL.md under 500 lines)

**Feature Dependencies:**
```
clarity-design
    ↓
clarity-unit-tests (requires: design artifacts exist)
    ↓
clarity-contract (requires: tests exist, implements to pass tests)
    ↓
clarity-fuzz (requires: contract exists, adds property tests)
    ↓
clarity-coverage (requires: all tests exist, measures coverage)
    ↓ (gate: 90%+ coverage)
stacks-frontend (requires: contract deployed to devnet, coverage passed)
```

**MVP Recommendation:**
1. Plugin structure with valid manifest
2. Orchestrator skill (`stacks`) that routes to specialized skills
3. Phase-specific skills: clarity-design, clarity-unit-tests, clarity-contract, clarity-fuzz, clarity-coverage, stacks-frontend
4. Clarinet helper skill (standalone, no dependencies)
5. Dynamic context injection for test results, coverage reports
6. Quality gates enforced at skill boundaries

**Defer to Post-MVP:**
- Hooks integration (automate linting/formatting after file writes)
- Subagent forking (main conversation sufficient for MVP)
- Visual output generation (interactive HTML reports)
- Session-specific logging
- LSP integration

## Architecture

**Recommended Pattern:** Orchestrator-Coordinator

```
stacks (orchestrator)
│
├─ Context Management Layer
│  └─ Loads relevant skills based on task analysis
│
├─ Routing Layer
│  ├─ Analyzes user intent
│  ├─ Determines workflow phase
│  └─ Delegates to specialized skill
│
└─ Specialized Skills (Domain Experts)
   ├─ clarity-design      → Contract design & best practices
   ├─ clarity-contract    → Clarity code implementation
   ├─ clarity-unit-tests  → Test-driven development
   ├─ clarity-fuzz        → Property testing & invariants
   ├─ clarity-coverage    → Coverage analysis & gating
   ├─ clarinet            → CLI orchestration & devnet
   └─ stacks-frontend     → Frontend integration
```

**Component Boundaries:**

| Component | Responsibility | Context Type | Agent Type |
|-----------|----------------|--------------|------------|
| stacks (orchestrator) | Route tasks, coordinate phases, maintain state | inline | inherit |
| clarity-design | Pseudo-code, logic flow, best practices | fork | Explore |
| clarity-contract | Write Clarity smart contract code | inline | inherit |
| clarity-unit-tests | TDD implementation with Clarinet SDK | inline | inherit |
| clarity-fuzz | Property tests, invariant validation | fork | general-purpose |
| clarity-coverage | Coverage analysis, enforce 90%+ gate | fork | Explore |
| clarinet | CLI commands, setup, devnet, deployment | inline | inherit |
| stacks-frontend | Stacks.js integration, wallet, contract calls | inline | inherit |

**Data Flow:**

**Phase 1 - Design:**
```
User request → stacks orchestrator
  → clarity-design (fork: Explore agent, read-only)
  → Returns: design document with pseudo-code
  → orchestrator presents to user
```

**Phase 2 - Implementation:**
```
User approval → stacks orchestrator
  → clarity-contract (inline, full tools)
  → clarity-unit-tests (inline, TDD loop)
  → Iterative: write test → implement → verify
```

**Phase 3 - Validation:**
```
Implementation complete → stacks orchestrator
  → clarity-fuzz (fork: general-purpose, isolated context)
  → clarity-coverage (fork: Explore agent, read-only)
  → Both run in parallel, return summary
  → orchestrator gates on coverage threshold
```

**Phase 4 - Deployment:**
```
Tests passing + coverage met → stacks orchestrator
  → clarinet (inline, Bash access for CLI)
  → Deployment steps with verification
```

**Coordination Mechanisms:**
1. **Task Delegation** - Orchestrator uses Skill tool to invoke specialized skills
2. **Parallel Execution** - Validation phase spawns fuzz + coverage as concurrent background subagents
3. **Sequential Dependencies** - Orchestrator enforces workflow order and quality gates
4. **User Communication** - Orchestrator presents phase transitions and gate results before proceeding

**State Management:**
- **Orchestrator context:** Current phase, quality gate results, user approvals, subagent summaries
- **Inline skills:** Share orchestrator context (contract, unit-tests, clarinet, frontend)
- **Forked skills:** Isolated context, return summary only (design, fuzz, coverage)
- **Persistence:** Write phase results to `.planning/design/`, `.planning/tests/`, `.planning/coverage/`, `.planning/fuzz/`

**Context Management:**

Token Budget Allocation (assuming ~100K window):
- System Prompt: 5K (Claude Code base + orchestrator)
- Conversation History: 40K
- Active Skills: 10K (1-2 specialized skills at a time)
- Codebase Context: 30K (contract code, tests)
- Tool Results: 10K
- Reserve: 5K

Progressive Disclosure Strategy:
- **Design Phase:** orchestrator + clarity-design = ~8K tokens, summary result = 500 tokens
- **Implementation Phase:** orchestrator + contract + tests = ~12K tokens, codebase grows
- **Validation Phase:** orchestrator + summaries only = ~5K tokens (subagents forked)
- **Deployment Phase:** orchestrator + clarinet = ~7K tokens

## Pitfalls

**CRITICAL PITFALLS (cause rewrites/major refactoring):**

### 1. Unnecessary Orchestration Complexity
**What:** Building complex multi-skill orchestration when a single skill would suffice.

**Why Critical:** Wasted weeks building coordination logic only to discover improved prompting on one skill achieved equivalent results.

**Prevention:**
- **START WITH A SINGLE SKILL FOR MVP**
- Add orchestration ONLY when you hit concrete limitations
- Ask: "What specific failure happens without orchestration?"
- Validate that simple sequential execution truly doesn't work

**Detection:** Orchestrator mostly calls skills in fixed sequence; users run skills manually instead.

**Phase Impact:** Foundation/Architecture - get this wrong early, rebuild entire system.

### 2. Context Window Explosion
**What:** Skills load massive amounts of content, causing performance degradation and token exhaustion.

**Prevention:**
- Keep SKILL.md under 500 lines
- Move detailed reference to separate files loaded on-demand
- Design skills to target specific files, not broad exploration
- Use `context: fork` for research-heavy tasks
- Test with `/context` to see actual token consumption

**Detection:** `/context` shows character budget warnings; auto-compaction triggers; Claude stops following instructions mid-execution.

**Phase Impact:** Every phase - degrades all skill performance.

### 3. Skill Namespace Conflicts
**What:** Multiple plugins define same skill name, creating ambiguity or silent failures.

**Prevention:**
- Plugin skills ALWAYS namespaced: `/my-plugin:skill-name`
- Understand precedence: enterprise > personal > project
- Use descriptive plugin names: `/stacks-dev:init` not `/dev:init`
- Test in clean environment

**Detection:** Skill works in one environment, fails in another; Claude invokes unexpected version.

**Phase Impact:** Distribution - catastrophic during rollout.

### 4. Verification Gap
**What:** Skills produce plausible but incorrect output because Claude can't verify its own work.

**Prevention:**
- Include verification steps IN skill instructions
- Provide test cases, expected outputs, examples
- Use `allowed-tools` to grant Bash for running tests
- Design skills to produce testable artifacts

**Detection:** High error rate; every execution requires manual verification; users lose trust.

**Phase Impact:** Testing/MVP - can't confidently release without verification.

### 5. Permission Ambiguity
**What:** Skills require specific tools but don't declare them, causing permission prompts or failures.

**Prevention:**
- Use `allowed-tools` frontmatter to declare required tools
- Be specific: `allowed-tools: "Bash(npm test *), Bash(git commit *)"` not `Bash`
- Test with restrictive permission settings
- Document requirements in README

**Detection:** Skills work in dev, fail in production; excessive permission prompts; security audit failures.

**Phase Impact:** Security/Deployment - can block production rollout.

### 6. Bloated CLAUDE.md Loading
**What:** Skill descriptions exceed character budget; some skills excluded from context.

**Prevention:**
- Keep SKILL.md under 500 lines
- Use progressive disclosure
- Set `SLASH_COMMAND_TOOL_CHAR_BUDGET` if needed
- Run `/context` to check for warnings

**Detection:** `/context` shows excluded skills; Claude doesn't auto-invoke; incomplete skill list in `/help`.

**Phase Impact:** Performance/Scaling - works with 5 skills, breaks with 20.

### 7. Insufficient Skill Description Specificity
**What:** Vague descriptions cause false positives (wrong skill triggers) or false negatives (skill never triggers).

**Prevention:**
- Include specific trigger phrases in description
- Test with realistic user prompts
- Be specific about scope: "Stacks blockchain Clarity contracts" not "smart contracts"
- Use `disable-model-invocation: true` for sensitive skills

**Detection:** Skill fires on wrong tasks; users must manually invoke with `/skill-name`; overlapping descriptions.

**Phase Impact:** Usability/Refinement - makes well-architected skills unusable.

### 8. Subagent Context Mismatch
**What:** Using `context: fork` for skills needing conversation history, or NOT using it for exploration tasks.

**Prevention:**
- Use `context: fork` for: research, exploration, independent verification
- DON'T use for: skills needing conversation history, sequential workflows
- Test both modes to understand behavior

**Detection:** Skill fails with "I don't have context about..."; main context fills rapidly; unexpected behavior.

**Phase Impact:** Architecture - changing context mode later requires skill redesign.

**MODERATE PITFALLS:**
- Missing argument validation (cryptic failures on wrong input)
- Hook timing misunderstanding (hooks fire deterministically; instructions are advisory)
- LSP server binary assumptions (plugin installs but features don't work)
- Circular skill dependencies (infinite loops)
- Environment variable dependency (silent failures in different environments)
- Marketplace distribution format errors (works locally, fails when distributed)
- Over-reliance on pre-existing knowledge (Claude's training data is stale)

**MINOR PITFALLS:**
- Missing `argument-hint` frontmatter
- Unclear skill vs command terminology
- No README or usage documentation
- Version field neglect
- Missing license information

## Implications for Roadmap

### Suggested Phase Structure

**IMPORTANT: Start with Single Skill MVP, NOT full orchestration**

Based on the critical pitfall research, the roadmap should follow this approach:

#### Phase 1: Single-Skill MVP (Week 1-2)
**Goal:** Validate that Claude Code skills can effectively guide Stacks/Clarity development.

**Components:**
- Basic plugin structure (`plugin.json`, directory layout)
- ONE comprehensive skill that handles the full workflow (design → test → implement → validate)
- Test with real Clarity contract development

**Success Criteria:**
- Single skill successfully guides TDD workflow
- No context window issues
- Clear verification of outputs

**Rationale:** Research strongly warns against premature orchestration. "The recommendation is to start simple, as single-agent architecture handles way more use cases than expected." Validate the concept before investing in coordination complexity.

#### Phase 2: Split Into Core Skills (Week 3-4) - ONLY IF NEEDED
**Goal:** If Phase 1 hits concrete limitations, decompose into specialized skills.

**Components:**
- `clarity-design` - Design phase skill
- `clarity-tdd` - Combined testing + implementation skill (keep TDD loop tight)
- `clarinet` - CLI operations skill

**Triggers to proceed:**
- Single skill exceeds 500 lines and can't be condensed
- Context window fills during normal usage
- Distinct phases need different tool permissions
- Users report confusion from too much in one skill

**Rationale:** Only split when you hit actual problems, not anticipated ones.

#### Phase 3: Advanced Testing Skills (Week 5-6) - OPTIONAL
**Goal:** Add specialized testing if TDD skill proves insufficient.

**Components:**
- `clarity-fuzz` - Property testing with Rendezvous
- `clarity-coverage` - Coverage analysis and gating

**Integration:**
- These skills can be standalone, invoked directly by users
- NO orchestrator needed yet - user drives workflow

**Triggers to proceed:**
- Coverage enforcement becomes complex enough to warrant separate skill
- Fuzz testing patterns are reusable enough to justify extraction

#### Phase 4: Orchestrator (Week 7-8) - ONLY IF COMPLEXITY DEMANDS IT
**Goal:** Add orchestration if coordination complexity becomes user burden.

**Components:**
- `stacks` orchestrator skill that routes to specialized skills
- Quality gates enforced at skill boundaries

**Triggers to proceed:**
- Users frequently invoke skills in wrong order
- Quality gate enforcement (coverage before frontend) is manual burden
- 5+ skills exist and workflow coordination is complex

**Rationale:** Orchestrator is last resort, not starting point.

#### Phase 5: Frontend Integration (Week 9+) - INDEPENDENT TRACK
**Goal:** Add frontend integration capability.

**Components:**
- `stacks-frontend` - Stacks.js wallet and contract call integration

**Integration:**
- Can be developed independently
- Standalone skill invoked when user needs frontend

**Rationale:** Frontend is distinct domain, doesn't depend on orchestration architecture.

### Research Flags

**Phases Needing Deeper Research:**
1. **Clarinet SDK Integration** - Phase 2/3 (TDD skill) needs research on Clarinet test patterns, SDK APIs
2. **Rendezvous Fuzz Testing** - Phase 3 (Fuzz skill) needs research on property testing patterns for Clarity
3. **Stacks.js Frontend Integration** - Phase 5 (Frontend skill) needs research on wallet integration, contract calls

**Phases With Well-Documented Patterns:**
- Plugin structure setup (Phase 1) - official docs comprehensive
- SKILL.md format (all phases) - Agent Skills spec is authoritative
- Subagent patterns (if needed in Phase 3+) - well-documented in Claude Code docs

### Build Order Dependencies

**Critical Path:**
```
plugin.json (manifest)
    ↓
Single comprehensive skill (MVP)
    ↓
[VALIDATE: Does this work? Do we need to split?]
    ↓
clarity-design + clarity-tdd + clarinet (IF needed)
    ↓
[VALIDATE: Is coordination complex enough to warrant orchestrator?]
    ↓
clarity-fuzz + clarity-coverage (OPTIONAL)
    ↓
stacks orchestrator (ONLY if complexity demands)
    ↓
stacks-frontend (INDEPENDENT)
```

**Parallel Tracks:**
- Frontend can be developed anytime after contract implementation patterns proven
- Documentation and examples can be developed alongside any phase

### Quality Gates Per Phase

| Phase | Gate | Criteria |
|-------|------|----------|
| Phase 1 (MVP) | Concept validation | Single skill successfully guides TDD workflow; context under 500 lines |
| Phase 2 (Split) | Necessity validation | Concrete evidence that single skill is insufficient |
| Phase 3 (Testing) | Reusability validation | Testing patterns proven worth extracting to dedicated skills |
| Phase 4 (Orchestrator) | Complexity validation | Coordination burden on users justifies orchestration overhead |
| Phase 5 (Frontend) | Integration validation | Frontend patterns work with existing contract development flow |

### Risk Mitigation Strategy

**High Risk: Context Window Explosion**
- Mitigation: Test with `/context` after every skill addition
- Monitor: Keep SKILL.md files under 500 lines at all times
- Fallback: Aggressively move content to `references/` subdirectories

**High Risk: Premature Orchestration**
- Mitigation: Build Phase 1 single-skill MVP FIRST
- Validate: Gather concrete evidence of limitations before splitting
- Fallback: If orchestration proves unnecessary, simpler plugin is better outcome

**Medium Risk: Skill Description Vagueness**
- Mitigation: Test each skill description with realistic user prompts
- Iterate: Refine descriptions based on false positive/negative patterns
- Validate: Check auto-invocation works before moving to next phase

**Medium Risk: Verification Gap**
- Mitigation: Include verification steps in every skill from Phase 1
- Validate: Skills must self-verify outputs using tests, checks, or examples
- Fallback: Add verification as post-execution hooks if needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack (file formats, directory structure)** | HIGH | Official Claude Code docs + Agent Skills spec are authoritative and comprehensive |
| **Features (table stakes, differentiators)** | HIGH | Directly from Agent Skills spec and Claude Code documentation with community validation |
| **Architecture (orchestrator pattern)** | MEDIUM-HIGH | Patterns inferred from multi-skill docs and 2026 multi-agent research. Critical caveat: start simple first |
| **Pitfalls (critical mistakes)** | HIGH | Based on official best practices, community post-mortems, and 2026 AI agent orchestration research |
| **MVP Recommendations** | MEDIUM | Strong evidence for "start simple" but specific Stacks workflow needs validation |
| **Token Optimization** | MEDIUM | Progressive disclosure principle documented; specific numbers (~100 tokens metadata, <5k instructions) are guidelines not hard limits |

### Gaps to Address

**During Phase 1 (MVP):**
- Validate that Claude Code skills can effectively guide Clarity contract development (no prior examples found)
- Test whether single skill handles full TDD workflow without splitting
- Determine actual context consumption for Stacks development tasks

**During Phase 2 (If Splitting):**
- Identify specific breaking points where single skill becomes unmanageable
- Validate that skill coordination actually improves UX vs. single skill

**During Phase 3+ (Advanced Features):**
- Research Clarinet SDK integration patterns (SDK API, test patterns, coverage tools)
- Research Rendezvous property testing (how to integrate with Clarity contracts)
- Research Stacks.js frontend integration (wallet connection, contract calls, transaction signing)

**Throughout Development:**
- Monitor actual token consumption vs. estimates
- Validate auto-invocation triggers work with realistic user prompts
- Test in multiple environments (macOS, Linux, Windows if targeting cross-platform)

## Sources

### Official Documentation (HIGH confidence)
- [Claude Code Skills](https://code.claude.com/docs/en/skills) - Skill creation, configuration, features
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins) - Plugin structure, distribution
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) - Custom subagent configuration
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference) - Complete technical specifications
- [Agent Skills Specification](https://agentskills.io/specification) - Open standard format
- [Agent Skills Overview](https://agentskills.io) - Standard background and adoption
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)

### Architecture & Patterns (MEDIUM confidence)
- [Microsoft Learn: AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Google Multi-Agent Design Patterns](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system)
- [Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [LangChain Multi-Agent Architecture Guide](https://www.blog.langchain.com/choosing-the-right-multi-agent-architecture/)
- [Claude Blog: When to use multi-agent systems](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)

### Community Resources (MEDIUM confidence)
- [Anthropics Skills Repository](https://github.com/anthropics/skills) - Official example skills
- [Agent Skills GitHub](https://github.com/agentskills/agentskills) - Open standard repository
- [Claude Code Plugins Plus Skills](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) - Community examples
- [Awesome Claude Skills](https://github.com/VoltAgent/awesome-claude-skills) - Curated list
- [Claude Code Multi-Agent Orchestration Gist](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f)

### Practical Guidance (MEDIUM confidence)
- [Building /deep-plan: A Claude Code Plugin](https://pierce-lamb.medium.com/building-deep-plan-a-claude-code-plugin-for-comprehensive-planning-30e0921eb841)
- [Optimizing Claude Code: Skills, Plugins, and the Art of Teaching Your AI](https://mays.co/optimizing-claude-code)
- [Complete Claude Code Guide: Skills, MCP & Tool Integration](https://mrzacsmith.medium.com/the-complete-claude-code-guide-skills-mcp-tool-integration-part-2-20dcf2fb8877)
- [The best way to do agentic development in 2026](https://dev.to/chand1012/the-best-way-to-do-agentic-development-in-2026-14mn)

## Open Questions

**For Phase 1 Validation:**
1. Can a single skill effectively guide the full Stacks TDD workflow (design → test → implement → fuzz → coverage → frontend)?
2. What is the actual context consumption for realistic Clarity contract development?
3. Do Stacks-specific workflows have characteristics that demand multi-skill architecture?

**For Architecture Decisions:**
4. At what point does orchestration overhead become worthwhile vs. user manually invoking skills?
5. Should quality gates (90% coverage) be enforced by skills or left to user discretion?
6. Is forked context beneficial for Clarity-specific exploration, or does inline work better?

**For Domain Integration:**
7. How should Clarinet SDK patterns be integrated (dynamic context injection vs. reference docs)?
8. What Rendezvous property testing patterns are most valuable for Clarity contracts?
9. What Stacks.js frontend integration patterns should be included vs. referenced externally?

**For Distribution:**
10. Should this be a single plugin or separate plugins (stacks-dev, stacks-testing, stacks-frontend)?
11. What enterprise/team configurations might affect skill precedence and namespace conflicts?
12. Should sandbox mode compatibility be a requirement for all skills?
