# Phase 5: Clarinet CLI Integration - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Guide project setup, validation, local development, and deployment using Clarinet CLI commands. This phase defines HOW the skill orchestrates CLI workflows — command automation, error handling, devnet management, and deployment safety. The CLI itself is external tooling; this phase configures the skill's approach to using it.

</domain>

<decisions>
## Implementation Decisions

### Command Automation
- Auto-execute most commands (skill runs them, shows output)
- Destructive commands require confirmation (config overwrites, devnet restart)
- Detect existing Clarinet.toml before `clarinet new` and warn if found
- After `clarinet contracts new`, just confirm creation (don't auto-open file)

### Error Handling
- Summarize `clarinet check` errors in readable format (don't just pass through raw output)
- Auto-fix simple/obvious errors automatically
- Explain complex errors for manual intervention
- Limit auto-fix attempts to 3, then stop and explain
- Run `clarinet check` automatically after every contract edit

### Devnet Workflow
- Start devnet before entering frontend phase (Phase 5 in SKILL.md)
- Always check devnet health before attempting deployments
- Suggest user runs devnet in dedicated terminal tab (not background process)
- Always remind user to stop devnet when ending session

### Deployment Safety
- Auto-deploy to devnet without confirmation
- Confirm before testnet/mainnet deployments
- Run dry-run simulation before non-devnet deployments
- Confirm network switching when user mentions testnet/mainnet
- Verify contract exists on-chain after non-devnet deployments
- Trust devnet deployment output without verification

### Claude's Discretion
- Exact error message formatting
- Health check implementation details
- Order of operations within each CLI step

</decisions>

<specifics>
## Specific Ideas

- "Suggest user runs devnet in separate terminal" — keep devnet logs visible without cluttering main workflow
- Tiered safety: devnet is trusted sandbox, testnet/mainnet get extra safeguards

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-clarinet-cli-integration*
*Context gathered: 2026-01-29*
