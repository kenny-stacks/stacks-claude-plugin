# Feature Landscape: Claude Code Skills

**Domain:** Claude Code Skills for Stacks Blockchain Development
**Researched:** 2026-01-29
**Confidence:** HIGH (based on official documentation and Agent Skills specification)

## Executive Summary

Effective Claude Code skills combine three layers: **invocation mechanics** (how skills are discovered and activated), **content design** (what instructions they contain), and **architectural patterns** (how they compose with other skills and agents). For Stacks blockchain development, this translates to an orchestrator skill that routes to specialized phase-specific skills, each using progressive disclosure to manage context efficiently while maintaining high quality through enforced gates.

---

## Table Stakes

Features users expect. Missing these = skills won't work properly.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **SKILL.md with valid frontmatter** | Required by Agent Skills spec. Claude Code won't recognize skills without it. | Low | `name` and `description` fields are mandatory. See [agentskills.io/specification](https://agentskills.io/specification) |
| **Clear, keyword-rich description** | Claude uses description to decide when to auto-invoke. Poor description = never invoked. | Low | Include what the skill does AND when to use it. "Extracts text from PDFs. Use when working with PDF documents or when user mentions PDFs." |
| **Focused scope** | Skills that try to do too much confuse Claude and waste context. | Medium | One skill per distinct task/phase. Anti-pattern: "general-dev-helper" that does everything. |
| **Progressive disclosure** | Description (~100 tokens) always loaded. Full SKILL.md (~2-5k tokens) loaded when invoked. References loaded on-demand. | Medium | Keep SKILL.md under 500 lines. Move detailed reference material to separate files. |
| **Plugin structure** | Skills in plugins use namespace (`plugin:skill-name`) to prevent conflicts. | Low | Plugins require `.claude-plugin/plugin.json` manifest. See [Claude Code plugins docs](https://code.claude.com/docs/en/plugins) |
| **Proper invocation control** | Skills need `disable-model-invocation: true` for user-only commands (like deploy) or `user-invocable: false` for background knowledge. | Low | Default = both user and Claude can invoke. |
| **File reference paths** | Reference supporting files with relative paths from skill root. | Low | `[reference](references/REFERENCE.md)` not `../../other/path.md` |
| **Validation** | Skills must pass `skills-ref validate` from the Agent Skills reference library. | Low | Catches malformed frontmatter and naming violations early. |

---

## Differentiators

Features that set excellent skills apart. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dynamic context injection** | Real-time data via `!`command`` preprocessing makes skills contextual. | Medium | Example: `!`gh pr diff`` fetches actual PR data before Claude sees the prompt. See [Claude Code skills docs](https://code.claude.com/docs/en/skills#inject-dynamic-context) |
| **Argument support** | `$ARGUMENTS` or `$0`, `$1`, etc. make skills flexible for different inputs. | Low | `/migrate-component SearchBar React Vue` with `$0` = SearchBar, `$1` = React, `$2` = Vue |
| **Subagent execution** | `context: fork` with `agent: Explore` runs skills in isolated context for heavy research tasks. | High | Use when skill needs deep exploration without polluting main conversation context. |
| **Supporting files for composition** | `scripts/`, `references/`, `assets/` keep main SKILL.md focused and enable code execution. | Medium | Visual output pattern: skill orchestrates, bundled script generates interactive HTML. |
| **Tool restrictions** | `allowed-tools: Read, Grep, Glob` creates read-only or write-only modes for safety. | Low | Critical for deployment or destructive operations. |
| **Quality gates as skill boundaries** | Each skill enforces preconditions (tests exist) and postconditions (coverage passes) before proceeding. | High | For Stacks: coverage-skill blocks frontend-skill unless 90%+ coverage achieved. |
| **Hooks integration** | Skills trigger hooks on lifecycle events (PostToolUse for linting after Write). | Medium | Automates quality checks without explicit user commands. |
| **Session awareness** | `${CLAUDE_SESSION_ID}` enables session-specific logging and state tracking. | Low | Useful for debugging multi-session workflows or tracking skill execution history. |
| **Examples and templates** | Concrete input/output examples in SKILL.md or `examples/` directory guide Claude's behavior. | Low | Clarifies expected format and edge cases. |
| **Multi-skill orchestration** | Orchestrator skill routes to specialized skills based on workflow phase. | High | Stacks pattern: `stacks` skill delegates to `clarity-design`, `clarity-unit-tests`, `clarity-fuzz`, etc. |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in skill development.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Duplicate reference docs** | Wastes context loading information already in official docs. | Reference authoritative sources with WebFetch or Context7. "For Clarity syntax, see https://docs.stacks.co/clarity" |
| **Monolithic "do everything" skills** | Description can't capture when to invoke, wastes context, hard to maintain. | Split into focused skills. One skill per workflow phase or distinct task. |
| **Deep reference chains** | Loading `references/guide.md` which references `details/syntax.md` which references `examples/code.md` wastes context. | Keep references one level deep from SKILL.md. Flatten if needed. |
| **Hard-coded paths or URLs** | Breaks portability across projects and environments. | Use relative paths, accept arguments, or inject via `!`command`` preprocessing. |
| **Auto-invoke for destructive operations** | Claude shouldn't decide when to deploy, delete, or publish. | Add `disable-model-invocation: true` for deploy, commit with side effects, or data deletion skills. |
| **Generic skill names** | "helper", "utils", "general" names provide no signal about purpose. | Use gerund form (verb + -ing): "testing", "deploying", "reviewing", "analyzing" |
| **Missing argument hints** | Users don't know what to pass to `/skill-name ???` | Add `argument-hint: [issue-number]` or `[filename] [format]` in frontmatter. |
| **Duplicate functionality across skills** | Copy-pasted instructions in multiple skills create maintenance burden and confusion. | Extract shared knowledge to CLAUDE.md (project-wide) or a reference file included by multiple skills. |
| **Ignoring context budget** | Loading 10,000+ token SKILL.md files consumes context Claude needs for actual work. | Keep SKILL.md under 500 lines (~2-5k tokens). Split larger content into references. |
| **No error handling in scripts** | Scripts that fail silently or with cryptic errors break trust. | Include clear error messages, validate inputs, handle edge cases gracefully. |
| **Overly permissive tool access** | `allowed-tools: Bash(*)` grants unrestricted shell access. | Whitelist specific commands: `Bash(git:*)`, `Bash(npm:test)`. Be restrictive. |

---

## Feature Dependencies

Skills for Stacks development have a natural dependency chain based on the enforced workflow:

```
clarity-design
    ↓
clarity-unit-tests (requires: design artifacts exist)
    ↓
clarity-contract (requires: tests exist, implements to pass tests)
    ↓
clarity-fuzz (requires: contract exists, adds property-based tests)
    ↓
clarity-coverage (requires: all tests exist, measures coverage)
    ↓ (gate: 90%+ coverage)
stacks-frontend (requires: contract deployed to devnet, coverage passed)
```

**Orchestrator dependency:**
```
stacks (orchestrator)
    ↓ (routes to phase-specific skills)
All specialized skills
```

**Supporting skill (no dependencies):**
```
clarinet (standalone: can be invoked at any time for CLI operations)
```

**Key principle:** Each skill enforces its preconditions and validates its postconditions before allowing progression to the next phase. This creates quality gates.

---

## Patterns for AI Agent Effectiveness

Based on Claude Code best practices, Agent Skills specification, and agentic AI design patterns research:

### Pattern 1: Progressive Disclosure
**What:** Three-tier context loading: metadata (always), instructions (when invoked), resources (on-demand).
**When:** All skills should follow this to avoid context waste.
**Example:**
```yaml
# Tier 1: Metadata (always loaded, ~100 tokens)
---
name: clarity-coverage
description: Analyze Clarity test coverage and enforce 90%+ threshold. Use after running tests or before frontend integration.
---

# Tier 2: Instructions (loaded when invoked, ~2-5k tokens)
Analyze test coverage for Clarity contracts:
1. Run `clarinet test --coverage`
2. Parse coverage report
3. Verify 90%+ coverage threshold
4. Generate detailed gap analysis

For coverage format details, see [REFERENCE.md](references/coverage-format.md)

# Tier 3: Resources (loaded on explicit reference)
# references/coverage-format.md contains detailed coverage report parsing rules
```

### Pattern 2: Orchestrator + Specialists
**What:** One orchestrator skill understands the full workflow and routes to phase-specific specialist skills.
**When:** Multi-phase workflows with clear progression (TDD workflow, deployment pipeline, data pipeline).
**Example:**
```yaml
# stacks/SKILL.md (orchestrator)
---
name: stacks
description: Orchestrates Stacks blockchain development workflow from design through frontend integration. Use for new contracts or full-stack Stacks apps.
---

Route user requests to the appropriate skill:
- Design/pseudo code → /stacks-skills:clarity-design
- Unit tests → /stacks-skills:clarity-unit-tests
- Contract implementation → /stacks-skills:clarity-contract
- Fuzz testing → /stacks-skills:clarity-fuzz
- Coverage analysis → /stacks-skills:clarity-coverage
- Frontend integration → /stacks-skills:stacks-frontend

Enforce quality gates: no frontend integration until 90%+ coverage achieved.
```

### Pattern 3: Reference, Don't Duplicate
**What:** Link to authoritative sources instead of embedding large reference material.
**When:** Official documentation exists and is accessible (Stacks docs, Clarity Book, API references).
**Example:**
```markdown
## Clarity Best Practices

For comprehensive Clarity coding patterns and optimizations, see the [Clarity Book](https://book.clarity-lang.org/).

Key patterns to follow:
- Eliminate unnecessary `begin` blocks (runtime cost)
- Use `asserts!` or `try!` instead of nested conditionals
- Store hashes, not voluminous data

For complete storage optimization techniques, see [Clarity Book: Storage](https://book.clarity-lang.org/ch12-00-storage.html)
```

### Pattern 4: Dynamic Context Injection
**What:** Use `!`command`` preprocessing to fetch real-time data before Claude sees the prompt.
**When:** Skills need current state (git status, test results, API responses).
**Example:**
```markdown
## Current Test Status
- Test results: !`clarinet test --json`
- Coverage report: !`clarinet test --coverage --json`

Analyze the current test results and identify failing tests or coverage gaps.
```

### Pattern 5: Quality Gates with Skill Boundaries
**What:** Skills enforce preconditions (validate inputs) and postconditions (validate outputs) before allowing workflow progression.
**When:** Workflows where quality standards must be enforced (TDD, security reviews, coverage thresholds).
**Example:**
```yaml
# clarity-frontend/SKILL.md
---
name: stacks-frontend
description: Integrate Clarity contracts with React/Next.js frontend. Use only after contracts pass coverage gates.
---

## Preconditions (enforced)
1. Contract deployed to devnet (`clarinet deployments` shows active deployment)
2. Test coverage ≥ 90% (`clarinet test --coverage` report exists and passes)
3. Contract ABI available

If preconditions fail, STOP and direct user to /stacks-skills:clarity-coverage first.

## Implementation
[Frontend integration steps...]

## Postconditions (validate)
1. Wallet connection works
2. Contract calls succeed on devnet
3. Transaction signing functional
```

### Pattern 6: Subagent Forking for Research
**What:** Use `context: fork` with `agent: Explore` for deep research tasks that would pollute main conversation.
**When:** Skills need to read many files, explore codebases, or generate comprehensive reports.
**Example:**
```yaml
---
name: deep-research
description: Research codebase architecture and patterns thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
4. Return structured report to main conversation
```

### Pattern 7: Tool Restrictions for Safety
**What:** Use `allowed-tools` to limit what Claude can do when skill is active.
**When:** Read-only analysis, restricted deployment, or preventing accidental destructive operations.
**Example:**
```yaml
---
name: contract-analyzer
description: Analyze Clarity contract for security issues (read-only)
allowed-tools: Read, Grep, Glob
---

Analyze contract security without making any changes.
Claude can only read files when this skill is active.
```

---

## MVP Recommendation

For Stacks Skills plugin MVP, prioritize:

### Phase 1: Core Table Stakes
1. **Plugin structure** with valid manifest (`.claude-plugin/plugin.json`)
2. **SKILL.md files** with proper frontmatter for all skills
3. **Progressive disclosure** (keep SKILL.md files under 500 lines)
4. **Clear descriptions** with keywords for auto-invocation

### Phase 2: Orchestrator + Specialists
5. **Orchestrator skill** (`stacks`) that routes to specialized skills
6. **Phase-specific skills** for each workflow stage:
   - `clarity-design`
   - `clarity-unit-tests`
   - `clarity-contract`
   - `clarity-fuzz`
   - `clarity-coverage`
   - `stacks-frontend`
7. **Clarinet helper skill** (standalone, no dependencies)

### Phase 3: Differentiators
8. **Dynamic context injection** for test results, coverage reports, deployment status
9. **Quality gates** enforced at skill boundaries (coverage before frontend)
10. **Reference files** for detailed Clarity patterns, test templates, frontend examples

### Defer to Post-MVP

- **Hooks integration**: Can be added later to automate linting, formatting after file writes
- **Subagent forking**: Not critical for MVP; main conversation context sufficient for initial version
- **Visual output generation**: Interactive HTML reports for coverage/testing can come later
- **Session-specific logging**: Helpful for debugging but not core functionality
- **LSP integration**: Clarity LSP could be separate plugin

---

## Stacks-Specific Feature Priorities

| Feature Category | Stacks Skills Application | Priority |
|-----------------|---------------------------|----------|
| **Orchestrator pattern** | `stacks` skill routes to design → tests → implementation → fuzz → coverage → frontend | CRITICAL |
| **Quality gates** | Coverage skill blocks frontend skill until 90%+ achieved | CRITICAL |
| **Reference to docs** | Link to Stacks docs, Clarity Book, Rendezvous docs instead of duplicating | HIGH |
| **Dynamic context** | Inject `clarinet test --coverage` results before coverage analysis | HIGH |
| **Argument support** | Pass contract names, test files, component names to skills | MEDIUM |
| **Tool restrictions** | Coverage analysis should be read-only (`allowed-tools: Read, Bash(clarinet:*)`) | MEDIUM |
| **Supporting files** | `references/clarity-patterns.md`, `templates/test-template.md`, `examples/fuzz-examples.md` | MEDIUM |
| **Hooks** | Auto-format Clarity after Write, auto-test after contract changes | LOW (post-MVP) |
| **Subagents** | Deep codebase research could use Explore agent | LOW (post-MVP) |

---

## Sources

### Official Documentation (HIGH confidence)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic Official Skills Repository](https://github.com/anthropics/skills)

### Best Practices and Patterns (MEDIUM confidence, verified with official sources)
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [Anthropic: Claude Code Best Practices for Agentic Coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Skill Authoring Best Practices - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### Ecosystem Research (MEDIUM confidence)
- [Agent Skills Specification Overview](https://agentskills.io/specification)
- [Agent Design Patterns for 2026](https://rlancemartin.github.io/2026/01/09/agent_design/)
- [4 Agentic AI Design Patterns & Real-World Examples](https://research.aimultiple.com/agentic-ai-design-patterns/)
- [Spring AI Agentic Patterns: Agent Skills](https://spring.io/blog/2026/01/13/spring-ai-generic-agent-skills/)

### Community Resources (LOW-MEDIUM confidence)
- [Awesome Claude Skills Collection](https://github.com/VoltAgent/awesome-claude-skills)
- [Awesome Claude Code Skills](https://github.com/travisvn/awesome-claude-skills)
- [Gend.co: Claude Skills and CLAUDE.md Guide](https://www.gend.co/blog/claude-skills-claude-md-guide)

---

**Confidence Assessment:**
- **Table Stakes**: HIGH (directly from Agent Skills spec and Claude Code docs)
- **Differentiators**: HIGH (verified patterns from official examples and docs)
- **Anti-Features**: MEDIUM-HIGH (derived from common mistakes discussed in best practices guides)
- **Patterns**: HIGH (combination of official docs and validated design patterns)
- **Stacks-Specific Priorities**: HIGH (based on Stacks development workflow requirements and skill composition patterns)
