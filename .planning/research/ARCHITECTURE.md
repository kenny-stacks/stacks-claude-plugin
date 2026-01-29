# Architecture Patterns: Multi-Skill Claude Code Plugin

**Domain:** Claude Code Plugin Development (Orchestrator + Specialized Skills)
**Researched:** 2026-01-29
**Confidence:** HIGH

## Recommended Architecture

Multi-skill Claude Code plugins follow an **orchestrator-coordinator pattern** where a primary orchestrator skill routes tasks to specialized domain skills, with each skill owning clear boundaries and responsibilities.

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

### Component Boundaries

| Component | Responsibility | Communicates With | Context Type |
|-----------|----------------|-------------------|--------------|
| **stacks (orchestrator)** | Route tasks, coordinate workflow phases, maintain state | All specialized skills | Main conversation |
| **clarity-design** | Pseudo-code, logic flow, best practices review | orchestrator, clarity-contract | Fork/inline |
| **clarity-contract** | Write actual Clarity smart contract code | orchestrator, clarity-design | Inline |
| **clarity-unit-tests** | TDD implementation with Clarinet SDK | orchestrator, clarity-contract | Inline |
| **clarity-fuzz** | Property tests, invariant validation | orchestrator, clarity-unit-tests | Fork (isolated) |
| **clarity-coverage** | Coverage analysis, enforce 90%+ gate | orchestrator, clarity-unit-tests | Fork (read-only) |
| **clarinet** | CLI commands, setup, devnet, deployment | orchestrator (all phases) | Inline |
| **stacks-frontend** | Stacks.js integration, wallet, contract calls | orchestrator, clarity-contract | Inline |

### Data Flow

**Phase 1: Design Phase**
```
User request → stacks orchestrator
  → clarity-design (fork: Explore agent, read-only)
  → Returns: design document with pseudo-code
  → orchestrator presents to user
```

**Phase 2: Implementation Phase**
```
User approval → stacks orchestrator
  → clarity-contract (inline, full tools)
  → clarity-unit-tests (inline, TDD loop)
  → Iterative: write test → implement → verify
```

**Phase 3: Validation Phase**
```
Implementation complete → stacks orchestrator
  → clarity-fuzz (fork: general-purpose, isolated context)
  → clarity-coverage (fork: Explore agent, read-only)
  → Both run in parallel, return summary
  → orchestrator gates on coverage threshold
```

**Phase 4: Deployment**
```
Tests passing + coverage met → stacks orchestrator
  → clarinet (inline, Bash access for CLI)
  → Deployment steps with verification
```

## Architecture Patterns for Multi-Skill Plugins

### Pattern 1: Orchestrator as Router (RECOMMENDED)

**What:** Single orchestrator skill that analyzes tasks and routes to specialized skills.

**When:** You have 5+ specialized skills with clear boundaries and distinct domains.

**Why:** Prevents skill collision, maintains conversation context, enables workflow coordination.

**Implementation:**

```yaml
# skills/stacks/SKILL.md
---
name: stacks
description: Orchestrator for Stacks blockchain development. Coordinates design, implementation, testing, and deployment of Clarity smart contracts through enforced TDD workflow.
skills:
  - clarity-design
  - clarity-contract
  - clarity-unit-tests
  - clarity-fuzz
  - clarity-coverage
  - clarinet
  - stacks-frontend
---

You are the Stacks development orchestrator. Coordinate specialized skills to build high-quality Clarity smart contracts.

## Workflow Phases

1. **Design Phase**: Use clarity-design skill for pseudo-code and architecture
2. **Implementation Phase**: Coordinate clarity-contract and clarity-unit-tests for TDD
3. **Validation Phase**: Run clarity-fuzz and clarity-coverage in parallel
4. **Deployment Phase**: Use clarinet skill for deployment

## Routing Rules

- Design questions → clarity-design (fork: Explore)
- Contract implementation → clarity-contract + clarity-unit-tests (inline)
- Property testing → clarity-fuzz (fork: general-purpose)
- Coverage checks → clarity-coverage (fork: Explore)
- CLI operations → clarinet (inline)
- Frontend integration → stacks-frontend (inline)

## Quality Gates

- Coverage must be 90%+ before deployment
- All tests must pass before fuzzing
- Design review before implementation

Present phase completion and gate results to user before proceeding.
```

**Advantages:**
- Clear separation of concerns
- Workflow state maintained in orchestrator context
- User sees phase transitions and gates
- Parallel execution for independent tasks (fuzz + coverage)

**Trade-offs:**
- Orchestrator adds one layer of indirection
- Requires explicit routing logic in orchestrator prompt

### Pattern 2: Skill Handoff Chain

**What:** Skills delegate directly to each other without central orchestrator.

**When:** Linear workflow with natural handoff points (A always leads to B leads to C).

**Why:** Reduces indirection, natural for pipeline workflows.

**Implementation:**

Each skill includes handoff logic in its prompt:

```yaml
# skills/clarity-design/SKILL.md
---
name: clarity-design
description: Design Clarity contracts with pseudo-code and best practices
---

After completing design, suggest: "Design complete. Ready to implement? I'll hand off to clarity-contract skill."
```

**Advantages:**
- No central orchestrator needed
- Natural conversation flow
- Lower token overhead

**Trade-offs:**
- Harder to maintain workflow state across handoffs
- No central coordination for parallel tasks
- User must drive phase transitions

**Verdict:** NOT recommended for this project (7 skills, parallel phases, quality gates require coordination).

### Pattern 3: Subagent Swarm

**What:** Orchestrator spawns subagents for each specialized task, running concurrently.

**When:** Tasks are highly independent with minimal shared context.

**Why:** Maximum parallelism, isolated contexts prevent contamination.

**Implementation:**

```yaml
# skills/stacks/SKILL.md
---
name: stacks
description: Swarm orchestrator for parallel Clarity development tasks
context: fork
agent: general-purpose
---

For each user request:
1. Decompose into independent tasks
2. Spawn subagents for parallel execution
3. Collect results
4. Synthesize and present to user

Task → Subagent mapping:
- Design exploration → clarity-design (background)
- Security review → clarity-security (background)
- Test implementation → clarity-unit-tests (foreground)
```

**Advantages:**
- Maximum parallelism for independent tasks
- Isolated contexts prevent cross-contamination
- Subagent results summarized before returning to main conversation

**Trade-offs:**
- Subagents can't spawn other subagents (limits nesting depth)
- Higher complexity for managing task dependencies
- Background subagents auto-deny permission prompts (must pre-approve tools)
- Verbose subagent results can consume main conversation context

**Verdict:** Useful for specific phases (parallel fuzz + coverage), but not as primary architecture.

### Pattern 4: Progressive Disclosure

**What:** Start with minimal context, load specialized skills only when needed.

**When:** Large plugin with many skills, want to minimize context overhead.

**Why:** Reduces token usage, keeps conversation focused, prevents skill collision.

**Implementation:**

```yaml
# skills/stacks/SKILL.md (orchestrator - always loaded)
---
name: stacks
description: Stacks blockchain development orchestrator
---

## Available Skills (loaded on-demand)

Reference supporting files for specialized knowledge:
- [clarity-design.md](clarity-design.md) - Contract design patterns
- [clarity-testing.md](clarity-testing.md) - TDD workflow details
- [clarity-security.md](clarity-security.md) - Security checklist

Load relevant file when user request matches domain.
```

Supporting files are NOT auto-loaded; orchestrator references them explicitly when needed:

"For contract design, I'll consult the design patterns. Let me read [clarity-design.md]..."

**Advantages:**
- Minimal token overhead initially
- Orchestrator controls context loading
- Supporting files can be large (detailed reference)

**Trade-offs:**
- Requires explicit Read calls to load context
- Orchestrator must know when to load each file
- Supporting files aren't invokable skills (no `/clarity-design`)

**Verdict:** Complement to orchestrator pattern, not replacement. Use for large reference docs.

## Recommended Architecture for Stacks Plugin

**Primary Pattern:** Orchestrator as Router (Pattern 1)
**Supplemental:** Progressive Disclosure (Pattern 4) for reference docs
**Tactical:** Subagent Swarm (Pattern 3) for parallel validation phase

### Rationale

1. **7 specialized skills require coordination:** Handoff chain (Pattern 2) would be fragile across 7 skills
2. **Workflow has clear phases and gates:** Orchestrator maintains workflow state and enforces quality gates
3. **Some phases are parallel (fuzz + coverage):** Orchestrator can spawn subagents tactically
4. **TDD workflow is iterative:** Inline execution (clarity-contract + clarity-unit-tests) keeps tight feedback loop
5. **User approval at phase transitions:** Orchestrator presents phase results and asks before proceeding

### Component Structure

```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
│
├── skills/
│   ├── stacks/                        # Orchestrator (ALWAYS loaded)
│   │   └── SKILL.md
│   │
│   ├── clarity-design/                # Design phase skill
│   │   ├── SKILL.md
│   │   └── design-patterns.md         # Reference (loaded on-demand)
│   │
│   ├── clarity-contract/              # Implementation skill
│   │   ├── SKILL.md
│   │   └── examples/
│   │       └── sample-contract.clar
│   │
│   ├── clarity-unit-tests/            # TDD skill
│   │   ├── SKILL.md
│   │   └── test-template.ts
│   │
│   ├── clarity-fuzz/                  # Property testing skill
│   │   └── SKILL.md
│   │
│   ├── clarity-coverage/              # Coverage gating skill
│   │   └── SKILL.md
│   │
│   ├── clarinet/                      # CLI orchestration skill
│   │   └── SKILL.md
│   │
│   └── stacks-frontend/               # Frontend integration skill
│       └── SKILL.md
│
└── README.md                          # Plugin documentation
```

### Skill Invocation Rules

| Skill | Invocable by Claude | Invocable by User | Context | Agent Type |
|-------|---------------------|-------------------|---------|------------|
| stacks | Yes (description match) | Yes (`/stacks`) | inline | inherit |
| clarity-design | Via orchestrator | Yes (`/stacks:clarity-design`) | fork | Explore |
| clarity-contract | Via orchestrator | Yes | inline | inherit |
| clarity-unit-tests | Via orchestrator | Yes | inline | inherit |
| clarity-fuzz | Via orchestrator | Yes | fork | general-purpose |
| clarity-coverage | Via orchestrator | Yes | fork | Explore |
| clarinet | Via orchestrator | Yes | inline | inherit |
| stacks-frontend | Via orchestrator | Yes | inline | inherit |

**Note:** All skills are user-invocable directly using namespaced commands (`/stacks:clarity-design`). The orchestrator is the recommended entry point, but users can bypass for specific tasks.

### State Management

**Orchestrator Context (Main Conversation):**
- Current workflow phase (design / implement / validate / deploy)
- Quality gate results (coverage %, tests passing)
- User approvals at phase transitions
- Summary of subagent results (not full transcripts)

**Specialized Skill Context:**
- **Inline skills** (contract, unit-tests, clarinet, frontend): Share orchestrator context
- **Forked skills** (design, fuzz, coverage): Isolated context, return summary only

**Persistence:**
- Orchestrator writes phase results to `.planning/design/`, `.planning/tests/` as needed
- Coverage results written to `.planning/coverage/report.md`
- Fuzzing results written to `.planning/fuzz/findings.md`

These artifacts provide persistence across sessions and enable phase-specific research later.

### Coordination Mechanisms

**1. Task Delegation**

Orchestrator uses Skill tool to invoke specialized skills:

```
# Orchestrator decides:
"User wants to design a token contract. I'll delegate to clarity-design skill."

# Invocation:
Skill(clarity-design) with arguments: "Design a SIP-010 fungible token contract..."
```

**2. Parallel Execution**

For validation phase, orchestrator spawns two subagents concurrently:

```
Task(clarity-fuzz, background: true)  # Property testing
Task(clarity-coverage, background: true)  # Coverage analysis

# Both return summaries to orchestrator
# Orchestrator synthesizes and checks coverage gate
```

**3. Sequential Dependencies**

Orchestrator enforces workflow order:

```
Design approved? → Yes
  → Run clarity-contract + clarity-unit-tests (TDD loop)

Tests passing? → Yes
  → Run clarity-fuzz + clarity-coverage (parallel)

Coverage ≥ 90%? → Yes
  → Offer deployment via clarinet

Coverage < 90%? → No
  → Return to TDD phase, highlight untested paths
```

**4. User Communication**

Orchestrator presents phase transitions:

```
"Design phase complete. I've created a pseudo-code outline in .planning/design/.
Review the design before I proceed to implementation? [Y/n]"

"Validation complete. Coverage: 92% ✓ | Property tests: Passed ✓
Ready to deploy to devnet? [Y/n]"
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Flat Skill Namespace Without Orchestrator

**What:** All 7 skills loaded simultaneously, Claude decides which to use.

**Why bad:**
- High token overhead (7 skill descriptions always in context)
- Skill collision risk (Claude might use wrong skill)
- No workflow coordination (phases can execute out of order)
- No quality gating enforcement

**Instead:** Use orchestrator to control skill loading and enforce workflow phases.

### Anti-Pattern 2: Monolithic Skill

**What:** Single `stacks` skill that contains all logic for design, implementation, testing, fuzzing, coverage, deployment.

**Why bad:**
- Massive prompt (5000+ lines)
- Can't isolate context (design research pollutes implementation)
- Can't run phases in parallel
- Hard to maintain and extend

**Instead:** Decompose into specialized skills coordinated by orchestrator.

### Anti-Pattern 3: Subagent-Heavy Architecture

**What:** Every skill runs as a forked subagent.

**Why bad:**
- Subagent results return to main conversation (context bloat)
- TDD loop requires tight iteration (fork overhead on every cycle)
- Subagents can't spawn other subagents (limits nesting)
- Background subagents can't ask clarifying questions

**Instead:** Use inline skills for iterative workflows (TDD), fork only for isolated tasks (fuzz, coverage).

### Anti-Pattern 4: No Orchestrator (Skill Handoff Chain)

**What:** clarity-design hands off to clarity-contract, which hands off to clarity-unit-tests, etc.

**Why bad:**
- No central state management (phase context lost across handoffs)
- Can't enforce quality gates between phases
- Can't run parallel tasks (fuzz + coverage)
- User must drive every transition

**Instead:** Use orchestrator to maintain workflow state and coordinate phases.

### Anti-Pattern 5: Shared Context for Validation

**What:** Run fuzzing and coverage in main conversation context.

**Why bad:**
- Verbose fuzzing output (1000+ lines) pollutes main context
- Coverage details (per-file analysis) bloat conversation
- Can't run in parallel (sequential execution)

**Instead:** Fork subagents for validation, return summaries only.

## Context Management Strategy

### Token Budget Allocation

Assuming ~100K token context window:

| Context Layer | Token Budget | Contents |
|---------------|--------------|----------|
| **System Prompt** | 5K | Claude Code base prompt + orchestrator skill |
| **Conversation History** | 40K | User messages + Claude responses |
| **Active Skills** | 10K | Currently loaded specialized skills (1-2 at a time) |
| **Codebase Context** | 30K | Contract code, tests, related files |
| **Tool Results** | 10K | Recent command output, file reads |
| **Reserve** | 5K | Buffer for context spikes |

### Progressive Disclosure Strategy

**Phase 1: Design**
- Load: orchestrator + clarity-design
- Total: ~8K tokens (orchestrator 3K + design 5K)
- Exploration result: Summary only (500 tokens)

**Phase 2: Implementation**
- Load: orchestrator + clarity-contract + clarity-unit-tests
- Total: ~12K tokens (orchestrator 3K + contract 5K + tests 4K)
- Codebase context: Growing (contract + tests accumulate)

**Phase 3: Validation**
- Fork subagents (design + fuzz isolated)
- Main context: orchestrator + summaries only
- Total: ~5K tokens (orchestrator 3K + summaries 2K)

**Phase 4: Deployment**
- Load: orchestrator + clarinet
- Total: ~7K tokens (orchestrator 3K + clarinet 4K)

### Context Compaction Triggers

- Auto-compact at 95% capacity (default)
- Manual compact after validation phase (before deployment)
- Preserve quality gate results and user approvals

## Build Order & Dependencies

Suggested implementation sequence for the plugin:

### Phase 1: Orchestrator Foundation (Week 1)

**Goal:** Build orchestrator that can route to placeholder skills.

**Components:**
1. `plugin.json` manifest
2. `skills/stacks/SKILL.md` orchestrator with routing logic
3. Placeholder skills (stub implementations) for testing routing

**Success Criteria:**
- Orchestrator correctly identifies task type from user input
- Orchestrator can invoke placeholder skills
- User can invoke orchestrator with `/stacks`

### Phase 2: Core TDD Loop (Week 2)

**Goal:** Enable iterative contract development with tests.

**Dependencies:**
- Orchestrator foundation complete

**Components:**
1. `skills/clarity-contract/SKILL.md` - Contract implementation
2. `skills/clarity-unit-tests/SKILL.md` - Test writing
3. `skills/clarinet/SKILL.md` - CLI integration (for running tests)

**Integration:**
- Orchestrator delegates to contract + unit-tests for TDD loop
- Clarinet skill runs `clarinet test` commands

**Success Criteria:**
- Write test → Implement code → Verify cycle works
- Tests run via clarinet CLI
- Orchestrator maintains TDD context across iterations

### Phase 3: Design Phase (Week 3)

**Goal:** Pre-implementation design and pseudo-code.

**Dependencies:**
- Core TDD loop proven
- Clarinet skill can scaffold projects

**Components:**
1. `skills/clarity-design/SKILL.md` - Design exploration
2. Supporting file: `design-patterns.md` - Best practices reference

**Integration:**
- Orchestrator spawns design as Explore subagent (read-only, fork)
- Design results written to `.planning/design/`

**Success Criteria:**
- Design phase produces pseudo-code outline
- Best practices reference loaded on-demand
- User approves design before implementation

### Phase 4: Validation Phase (Week 4)

**Goal:** Property testing and coverage gating.

**Dependencies:**
- Core TDD loop complete
- Subagent spawning tested

**Components:**
1. `skills/clarity-fuzz/SKILL.md` - Rendezvous fuzzing
2. `skills/clarity-coverage/SKILL.md` - Coverage analysis

**Integration:**
- Orchestrator spawns both as background subagents (parallel)
- Coverage skill enforces 90%+ gate
- Results written to `.planning/fuzz/` and `.planning/coverage/`

**Success Criteria:**
- Fuzzing and coverage run in parallel
- Coverage gate blocks deployment if threshold not met
- Summaries returned to orchestrator (not full output)

### Phase 5: Frontend Integration (Week 5)

**Goal:** Stacks.js wallet and contract call integration.

**Dependencies:**
- Contract implementation mature
- Testing workflow proven

**Components:**
1. `skills/stacks-frontend/SKILL.md` - Frontend integration

**Integration:**
- Orchestrator offers frontend integration after contract deployment
- Frontend skill generates Stacks.js code for wallet + contract calls

**Success Criteria:**
- Generate TypeScript code for contract interaction
- Include wallet connection logic
- Follow Stacks.js best practices

### Dependency Graph

```
plugin.json (manifest)
    ↓
stacks (orchestrator) ←─────────────────┐
    ↓                                    │
clarinet (CLI) ←────────────────────────┤
    ↓                                    │
clarity-design (optional first phase) ──┤
    ↓                                    │
clarity-contract + clarity-unit-tests ──┤  (all depend on orchestrator)
    ↓                                    │
clarity-fuzz + clarity-coverage ────────┤
    ↓                                    │
stacks-frontend (optional) ─────────────┘
```

**Critical Path:**
1. orchestrator → clarinet → TDD loop (contract + unit-tests)
2. Everything else depends on TDD loop being solid

**Parallel Tracks:**
- Design phase can be developed independently (week 3)
- Frontend can be developed independently (week 5)
- Validation phase needs TDD loop complete first (week 4)

## Testing Strategy

### Unit Testing Skills (Isolated)

Test each skill independently before integration:

**Test approach:**
1. Create test project with known contract
2. Invoke skill directly (`/stacks:clarity-contract`)
3. Verify skill produces expected output
4. Check skill respects tool restrictions (read-only vs full access)

**Example test cases:**

```
# clarity-design skill
Input: "Design a counter contract"
Expected: Pseudo-code outline, design doc in .planning/design/

# clarity-unit-tests skill
Input: "Write tests for increment function"
Expected: Clarinet test file with describe/it blocks

# clarity-coverage skill
Input: "Analyze coverage for counter.clar"
Expected: Coverage report, gate pass/fail decision
```

### Integration Testing (Orchestrator + Skills)

Test workflow coordination:

**Test scenarios:**

1. **Full happy path:** Design → Implement → Test → Validate → Deploy
2. **Coverage gate failure:** Implement with poor coverage → Gate blocks deployment
3. **Parallel validation:** Verify fuzz + coverage run concurrently
4. **TDD iteration:** Write test → Fail → Implement → Pass cycle

**Test approach:**
```
# Test full workflow
/stacks Design and implement a SIP-010 token contract

# Verify phases execute in order:
1. Design phase completes (output in .planning/design/)
2. User approves → TDD phase starts
3. Tests + implementation iterate
4. Validation runs (parallel subagents)
5. Coverage gate checked
6. Deployment offered if gate passes
```

### Context Pollution Testing

Verify isolated contexts prevent contamination:

**Test approach:**
1. Run fuzzing (verbose output)
2. Check main conversation context
3. Verify fuzz details NOT present in main context (only summary)

**Expected:**
- Subagent transcript contains full fuzz output
- Main conversation receives summary only (<1000 tokens)

## Performance Considerations

### Latency Optimization

**Design choices affecting latency:**

| Choice | Latency Impact | Trade-off |
|--------|----------------|-----------|
| Inline skills (TDD loop) | Low (no subagent spawn) | Context accumulates in main conversation |
| Forked subagents (design, fuzz, coverage) | Medium (subagent spawn overhead) | Isolated context prevents bloat |
| Sequential execution | High (wait for each phase) | Simplicity, enforced dependencies |
| Parallel execution (fuzz + coverage) | Low (concurrent) | Complexity, requires independence |

**Optimization strategies:**

1. **Keep TDD loop inline:** Contract + unit-tests share main context for tight iteration
2. **Parallelize validation:** Fuzz + coverage run concurrently (50% latency reduction)
3. **Use Haiku for exploration:** Design phase uses Explore agent (faster, cheaper)
4. **Cache design decisions:** Write to .planning/design/ for reuse across sessions

### Token Efficiency

**Token overhead per phase:**

| Phase | Orchestrator | Specialized Skills | Subagent Results | Total |
|-------|--------------|-------------------|------------------|-------|
| Design | 3K | 5K (clarity-design) | 500 summary | ~8.5K |
| Implementation | 3K | 9K (contract + tests) | N/A (inline) | ~12K |
| Validation | 3K | N/A (forked) | 2K summaries | ~5K |
| Deployment | 3K | 4K (clarinet) | N/A (inline) | ~7K |

**Total for full workflow:** ~33K tokens (well within 100K budget)

**Efficiency techniques:**

1. **Progressive disclosure:** Load only active phase skills
2. **Subagent isolation:** Keep verbose output in subagent context
3. **Reference files:** Large docs loaded on-demand, not always present
4. **Context compaction:** Auto-compact after validation phase

## Scalability Considerations

### Scaling to More Skills

| Skill Count | Orchestrator Complexity | Recommended Pattern |
|-------------|------------------------|---------------------|
| 1-3 skills | No orchestrator needed | Direct skill invocation |
| 4-7 skills | Simple routing logic | Orchestrator as router (RECOMMENDED) |
| 8-15 skills | Routing + sub-orchestrators | Hierarchical orchestration |
| 16+ skills | Complex routing | Domain-based sub-orchestrators |

**Current project:** 7 skills → Orchestrator as Router is ideal

**If expanding beyond 15 skills:**
- Split into sub-orchestrators (e.g., `stacks-testing-orchestrator` for fuzz + coverage + integration)
- Main orchestrator routes to sub-orchestrators
- Each sub-orchestrator manages its domain

### Scaling to More Complex Workflows

**Current workflow:** Linear phases with one parallel step (fuzz + coverage)

**If workflow becomes complex graph:**
- Add workflow state machine to orchestrator
- Track dependencies between tasks
- Support conditional branching (e.g., if security review fails → return to design)

**Example complex workflow:**

```
Design → Security Review
           ↓ (if fails)
          Design
           ↓ (if passes)
       Implement → TDD Loop → Static Analysis
                                    ↓
                     ┌──────────────┴──────────────┐
                     ↓                             ↓
                Fuzzing (parallel)          Coverage Analysis
                     ↓                             ↓
                     └──────────────┬──────────────┘
                                    ↓
                              Gate Check
                                    ↓
                              Deployment
```

**Orchestrator would need:**
- Workflow state tracking (current node, completed nodes)
- Conditional routing based on results
- Parallel task coordination with dependency resolution

## Sources

**Official Documentation (HIGH confidence):**
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) - Official skills architecture, invocation patterns, context management
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents) - Subagent patterns, context forking, tool restrictions
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) - Plugin structure, skill namespacing, multi-skill coordination

**2026 Ecosystem Patterns (MEDIUM confidence):**
- [GitHub - ruvnet/claude-flow](https://github.com/ruvnet/claude-flow) - Multi-agent orchestration framework
- [GitHub - wshobson/agents](https://github.com/wshobson/agents) - Multi-agent orchestration patterns
- [Claude Code Multi-Agent Orchestration Gist](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f) - Task system patterns
- [The Task Tool: Claude Code's Agent Orchestration System](https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2) - Task delegation mechanics
- [LangChain Multi-Agent Architecture Guide](https://www.blog.langchain.com/choosing-the-right-multi-agent-architecture/) - Industry patterns for multi-agent systems
- [Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) - Enterprise orchestration patterns
- [Google Multi-Agent Design Patterns](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system) - Sequential, concurrent, handoff patterns
- [2026 Architect's Guide to AI Agent Orchestration](https://dev.to/ridwan_sassman_3d07/the-2026-architects-dilemma-orchestrating-ai-agents-not-writing-code-the-paradigm-shift-from-219c) - Paradigm shift to agent coordination

**Community Resources (MEDIUM confidence):**
- [Understanding Claude Code: Skills vs Commands vs Subagents vs Plugins](https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins) - Component boundary definitions
- [Complete Claude Code Guide: Skills, MCP & Tool Integration](https://mrzacsmith.medium.com/the-complete-claude-code-guide-skills-mcp-tool-integration-part-2-20dcf2fb8877) - Integration best practices
- [Claude Skills and CLAUDE.md Guide 2026](https://www.gend.co/blog/claude-skills-claude-md-guide) - Team coordination patterns
