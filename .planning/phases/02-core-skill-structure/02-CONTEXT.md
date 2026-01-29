# Phase 2: Core Skill Structure - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the single comprehensive `stacks-dev` skill with progressive disclosure and workflow orchestration. This phase establishes how Claude guides users through the Stacks development lifecycle (design → tests → contract → coverage → frontend) with clear transitions and verification. Specific workflow phase content (design patterns, TDD enforcement, CLI commands, frontend code) belongs in Phases 3-6.

</domain>

<decisions>
## Implementation Decisions

### Workflow transitions
- Explicit gates: Claude won't proceed to next phase until user confirms completion
- Warn and allow: Claude warns about skipping but lets user override if they insist
- Progress indicator: Show current phase and remaining phases (e.g., "Phase 2/5: Writing Tests")
- Backward navigation: Claude asks "This will revisit design — continue?" before jumping back

### Reference file strategy
- Workflow only in core: SKILL.md contains phase orchestration; all patterns/examples in references/
- On-demand loading: Load reference files only when user asks or when entering a specific phase
- Fetch and summarize: Claude reads external docs (Clarity Book, Stacks docs) and provides relevant excerpts
- One reference file per phase: clarity-design.md, clarity-tdd.md, clarity-cli.md, clarity-frontend.md

### Verification behavior
- After each phase: Automatic verification before transitioning to next phase
- Both artifacts and commands: Check files exist AND run commands (clarinet check, clarinet test) where applicable
- Progressive reporting: Summary first ("All checks passed" or "2 issues found"), offer details if issues
- Fix automatically: Claude attempts to fix issues and re-verify without waiting for direction

### Auto-invocation triggers
- Moderate aggressiveness: Trigger on "Clarity", "Stacks", "Clarinet" explicitly; include "smart contract", "blockchain" when context suggests Stacks
- File detection: Automatically invoke when Clarinet.toml detected in project
- Context-aware: Don't invoke if user is clearly working on non-Stacks code (e.g., Solidity)
- Positive description only: Keep skill description focused on Stacks/Clarity/Clarinet keywords; no competing platform mentions

### Claude's Discretion
- Exact phrasing of progress indicators and gate messages
- How to determine "context suggests Stacks" for moderate trigger terms
- Specific verification commands per phase
- How many fix attempts before escalating to user

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for skill structure and orchestration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-skill-structure*
*Context gathered: 2026-01-29*
