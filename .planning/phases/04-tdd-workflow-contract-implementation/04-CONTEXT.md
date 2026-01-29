# Phase 4: TDD Workflow & Contract Implementation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce tests-first workflow with Clarinet SDK unit tests and contract implementation. Users write tests before implementing Clarity contracts. A 90% coverage gate prevents progression to frontend integration. Contract code follows Clarity Book best practices.

</domain>

<decisions>
## Implementation Decisions

### TDD Enforcement Behavior
- Soft redirect when user tries to write contract code before tests
- If user insists, proceed without requiring acknowledgment
- Track and display TDD compliance status in phase progress ("TDD: ✓ followed" or "TDD: ⚠ skipped")
- Batch test writing at start based on design doc, not incremental per function

### Test Generation Approach
- Collaborative: Claude proposes test scenarios, user approves, Claude writes code
- Present test cases at high-level scenario level ("Test that transfer fails with insufficient balance")
- Categorize tests into structured groups: happy path, edge cases, error handling
- Write test code directly to file after user approves scenarios (no preview step)

### Coverage Gate Handling
- Show coverage after every test run, not just at gate
- When below 90%, show specific gaps: list uncovered functions/branches with suggestions
- Auto-suggest additional test scenarios for uncovered code
- User can override 90% gate by saying "proceed anyway" — no justification required

### Contract Review Workflow
- Review after each function AND again when full contract is implemented
- Auto-fix best practice violations and explain what was changed
- Educational feedback: explain WHY the pattern matters with Clarity Book reference
- Run `clarinet check` automatically after every contract modification

### Claude's Discretion
- Exact format of TDD compliance display
- How to group test categories in output
- Coverage report formatting
- Order of best practice checks

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-tdd-workflow-contract-implementation*
*Context gathered: 2026-01-29*
