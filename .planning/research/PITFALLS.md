# Domain Pitfalls: Claude Code Skill/Plugin Development

**Domain:** Claude Code plugin development with orchestrator + specialized skills architecture
**Researched:** 2026-01-29
**Confidence:** HIGH (based on official Claude Code documentation and 2026 community patterns)

## Critical Pitfalls

Mistakes that cause rewrites, major refactoring, or fundamental architecture failures.

### Pitfall 1: Unnecessary Orchestration Complexity
**What goes wrong:** Creating elaborate multi-skill orchestration when a single skill would suffice. Teams invest weeks building complex orchestrator patterns only to discover improved prompting on a single skill achieved equivalent results.

**Why it happens:** Premature optimization. The excitement of building a sophisticated architecture leads developers to over-engineer before validating the actual need for coordination.

**Consequences:**
- Wasted development time building unnecessary coordination logic
- Increased maintenance overhead from managing multiple skills
- Higher cognitive load for users learning multiple commands
- Brittle systems where one skill failure breaks entire workflows
- Context pollution from unnecessary skill-to-skill handoffs

**Prevention:**
- Start with a single skill for your entire workflow
- Add orchestration ONLY when you hit concrete limitations
- Ask: "What specific failure happens without orchestration?"
- Validate that simple sequential execution truly doesn't work
- Remember: "The recommendation is to start simple, as single-agent architecture handles way more use cases than expected"

**Detection:**
- Your orchestrator mostly calls skills in fixed sequence
- Skills don't actually share state or coordinate decisions
- Removing the orchestrator and running skills manually works fine
- Most skill invocations are deterministic rather than dynamic
- Users avoid your complex orchestration and run skills individually

**Phase Impact:** Foundation/Architecture phase. Get this wrong early and you'll rebuild the entire system.

---

### Pitfall 2: Context Window Explosion
**What goes wrong:** Skills that load massive amounts of content into context, causing performance degradation, token budget exhaustion, and Claude "forgetting" earlier instructions.

**Why it happens:**
- Not understanding that Claude's context holds EVERYTHING: conversation, files read, command output
- Treating file reads as "free" operations
- Loading documentation or examples that should be progressively disclosed
- Skills that explore broadly rather than target specifically

**Consequences:**
- Claude makes mistakes it wouldn't make with cleaner context
- Auto-compaction triggers unexpectedly, losing important context
- Token costs skyrocket
- Skill execution slows dramatically
- Critical instructions get lost in noise

**Prevention:**
- Keep SKILL.md under 500 lines
- Move detailed reference material to separate files that Claude loads on-demand
- Use progressive disclosure: reference supporting files from SKILL.md
- Design skills to target specific files/directories rather than broad exploration
- Use subagents with `context: fork` for research-heavy tasks
- Test skills with `/context` to see actual token consumption

**Detection:**
- `/context` shows character budget warnings about excluded skills
- Skill execution triggers auto-compaction
- Claude stops following skill instructions mid-execution
- Users report "Claude forgot what I told it"
- Token costs are unexpectedly high for simple operations

**Phase Impact:** Every phase. This degrades all skill performance if not caught early.

---

### Pitfall 3: Skill Namespace Conflicts
**What goes wrong:** Multiple plugins define skills with the same name, creating ambiguity or silent failures. Or project-level skills conflict with personal/enterprise skills, with unclear precedence.

**Why it happens:**
- Not understanding plugin namespacing (plugins use `/plugin-name:skill-name` format)
- Converting standalone commands to plugin skills without accounting for namespace changes
- Assuming skill names are globally unique
- Missing the precedence rules: enterprise > personal > project

**Consequences:**
- Skills don't trigger when expected
- Wrong skill version executes (enterprise overrides project version)
- Users invoke wrong skill due to naming collision
- Silent failures where Claude uses unexpected skill implementation
- Plugin installation breaks existing workflows

**Prevention:**
- Plugin skills are ALWAYS namespaced: `/my-plugin:skill-name`
- Document skill precedence clearly: enterprise > personal > project
- Use descriptive plugin names that won't conflict: `/stacks-dev:init` not `/dev:init`
- Test plugin installation in clean environment to verify namespace behavior
- Check for conflicts: `grep -r "^name:" .claude/skills/*/SKILL.md`

**Detection:**
- `/skill-name` works in one environment but fails in another
- Claude invokes unexpected skill version
- Skill appears twice in `/help` output with different namespaces
- Users report "the skill does something different than documented"

**Phase Impact:** Distribution phase. Not critical during development, catastrophic during rollout.

---

### Pitfall 4: Verification Gap
**What goes wrong:** Skills that produce plausible-looking but incorrect output because Claude can't verify its own work. Users become the only feedback loop, manually checking every execution.

**Why it happens:**
- Skills don't include success criteria or verification steps
- Assuming Claude can self-assess without concrete tests
- Not providing examples of expected output
- Missing the "Claude performs dramatically better when it can verify its own work" principle

**Consequences:**
- High error rate in skill execution
- Every skill invocation requires manual verification
- Users lose trust in skills and stop using them
- Silent failures where incorrect output looks correct
- Technical debt accumulates from undetected mistakes

**Prevention:**
- Include verification steps IN the skill instructions
- Provide test cases, expected outputs, or screenshots
- Use `allowed-tools` to grant Bash access for running tests
- Add examples showing correct vs incorrect output
- Design skills to produce testable artifacts
- Consider post-execution hooks for automatic validation

**Detection:**
- Users frequently report "the skill did X but it should do Y"
- Skill executions often require follow-up corrections
- You can't tell if skill succeeded without manual inspection
- Edge cases fail silently
- Users create "review" skills to check other skills' output

**Phase Impact:** Testing/MVP phase. Without verification, you can't confidently release.

---

### Pitfall 5: Permission Ambiguity
**What goes wrong:** Skills that require specific tools but don't declare them, causing either:
- Permission prompts interrupting autonomous workflows
- Skills failing because they can't access needed tools
- Security risks from granting overly broad permissions

**Why it happens:**
- Not understanding the `allowed-tools` field in frontmatter
- Assuming Claude can "figure out" what permissions it needs
- Granting blanket permissions that violate security policies
- Not testing skills with restrictive permission settings

**Consequences:**
- Skills interrupt autonomous workflows with permission prompts
- Users grant excessive permissions to "make it work"
- Security audit failures
- Skills behave differently in sandboxed vs unrestricted environments
- Deployment blocked by enterprise security policies

**Prevention:**
- Use `allowed-tools` frontmatter field to declare required tools
- Be specific: `allowed-tools: "Bash(npm test *), Bash(git commit *)"` not `Bash`
- Test skills with `/permissions` set to restrictive mode
- Document permission requirements in README
- Consider sandbox compatibility from the start
- Use `--allowedTools` flag during headless testing

**Detection:**
- Skills work in development but fail in production/CI
- Excessive permission prompts during skill execution
- Security team flags your plugin as high-risk
- Skills fail with cryptic errors about tool access
- `/permissions` shows unexpected tool usage

**Phase Impact:** Security/Deployment phase. Can block production rollout entirely.

---

### Pitfall 6: Bloated CLAUDE.md Loading
**What goes wrong:** Treating skills as documentation dump rather than executable instructions. The skill content becomes a reference manual that fills context without providing actionable guidance.

**Why it happens:**
- Migrating documentation directly into skills without adapting format
- Including "just in case" information that applies rarely
- Not understanding the difference between reference (load on-demand) and task (execute immediately) content
- Missing the "Keep SKILL.md under 500 lines" guideline

**Consequences:**
- Skill descriptions exceed character budget (default 15,000 characters)
- Claude can't see all available skills (some excluded from context)
- Performance degradation from excessive context loading
- Critical skills don't trigger because their descriptions weren't loaded
- Users resort to `/skill-name` invocation because auto-triggering fails

**Prevention:**
- Separate reference content (supporting files) from task content (SKILL.md)
- Use progressive disclosure: reference supporting files from SKILL.md
- Set `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable if needed
- Regularly audit skill descriptions: "Is this 10-word summary sufficient?"
- Use `user-invocable: false` for background-only skills
- Run `/context` to check for character budget warnings

**Detection:**
- `/context` shows warnings about excluded skills
- Claude doesn't auto-invoke skills when descriptions match task
- Skill list in `/help` is incomplete
- Multiple skills with 500+ line descriptions
- Token costs high even for simple operations

**Phase Impact:** Performance/Scaling phase. System works with 5 skills, breaks with 20.

---

### Pitfall 7: Insufficient Skill Description Specificity
**What goes wrong:** Vague skill descriptions that don't give Claude enough signal about when to trigger. Either skills fire too often (false positives) or never fire (false negatives).

**Why it happens:**
- Writing descriptions for human readers, not for Claude's pattern matching
- Being too generic: "Helps with development tasks"
- Not including trigger keywords users would naturally say
- Failing to test description matching with realistic user prompts

**Consequences:**
- Skills trigger on wrong tasks (false positives)
- Users must manually invoke with `/skill-name` (false negatives)
- Multiple skills fire simultaneously, causing confusion
- Users lose confidence in automatic skill loading
- Context pollution from incorrectly triggered skills

**Prevention:**
- Include specific trigger phrases in description
- Test with realistic user prompts: "Would I say these exact words?"
- Add context clues: "Use when...", "Applies to...", "Relevant for..."
- Be specific about scope: "Stacks blockchain Clarity contracts" not "smart contracts"
- Iterate based on false positive/negative patterns
- Use `disable-model-invocation: true` for sensitive skills

**Detection:**
- Ask "What skills are available?" and description sounds unclear
- Skill fires on unrelated tasks
- Users report: "I asked about X and got skill Y"
- You frequently use `/skill-name` instead of relying on auto-trigger
- Multiple skills have overlapping descriptions

**Phase Impact:** Usability/Refinement phase. Makes well-architected skills unusable.

---

### Pitfall 8: Subagent Context Mismatch
**What goes wrong:** Using `context: fork` for skills that need conversation history, or NOT using it for skills that pollute main context with exploration.

**Why it happens:**
- Not understanding when skills should run in isolation vs inline
- Treating `context: fork` as "always better" or "never needed"
- Missing that subagents don't have access to conversation history
- Not considering token consumption of exploration tasks

**Consequences:**
- Skills that need conversation context fail in forked mode
- Research skills pollute main conversation with hundreds of file reads
- Context window fills with irrelevant exploration
- Subagent results lose important context from main conversation
- Users confused by inconsistent skill behavior

**Prevention:**
- Use `context: fork` for: research, exploration, independent verification
- DON'T use for: skills needing conversation history, sequential workflows
- Test both modes to understand behavior difference
- Document in skill description whether it runs in forked context
- Consider hybrid: main skill in inline mode delegates to subagent for research

**Detection:**
- Skill fails with "I don't have context about..." in forked mode
- Main conversation context fills rapidly during skill execution
- Subagent results repeat information from conversation
- Skills behave unexpectedly after context changes
- Token costs vary wildly between skill executions

**Phase Impact:** Architecture phase. Changing context mode later requires skill redesign.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or reduced effectiveness.

### Pitfall 9: Missing Argument Validation
**What goes wrong:** Skills accept arguments via `$ARGUMENTS` but don't validate format, causing cryptic failures when users provide wrong input.

**Prevention:**
- Document expected argument format in `argument-hint` frontmatter
- Include validation instructions in skill content
- Provide clear error messages for invalid arguments
- Use examples: `argument-hint: "[issue-number]"` or `[filename] [format]`

**Detection:**
- Users report "skill failed with unclear error"
- Skill works sometimes, fails others based on input format
- You spend time debugging user input issues

---

### Pitfall 10: Hook Timing Misunderstanding
**What goes wrong:** Using hooks when instructions in SKILL.md would suffice, or vice versa. Hooks are deterministic and ALWAYS fire; instructions are advisory.

**Prevention:**
- Use hooks for: "must happen every time with zero exceptions"
- Use SKILL.md instructions for: "usually do this, but use judgment"
- Test what happens when hook conditions are met
- Document hook behavior clearly in README
- Consider whether user needs override capability

**Detection:**
- Users complain "skill does X even when I don't want it to"
- Instructions in SKILL.md sometimes ignored by Claude
- Hook fires in unexpected situations
- Need to disable plugin to prevent hook execution

---

### Pitfall 11: LSP Server Binary Assumptions
**What goes wrong:** Plugin includes LSP server configuration but assumes users have language server binary installed. Users install plugin, code intelligence features fail silently.

**Prevention:**
- Document required binary installations in README
- Include installation script or clear installation instructions
- Test plugin installation on clean system
- Consider pre-install checks or validation hooks
- Provide helpful error messages when binary missing

**Detection:**
- Users report "code intelligence not working"
- Plugin installs but features don't activate
- Error logs show "command not found: gopls"
- Works on your machine, fails for users

---

### Pitfall 12: Circular Skill Dependencies
**What goes wrong:** Skill A invokes skill B, which invokes skill C, which invokes skill A. Infinite loops or deep recursion.

**Prevention:**
- Design skills to be terminal (don't invoke other skills)
- If skills must coordinate, use explicit orchestrator pattern
- Document skill dependency graph
- Test skill chains for cycles
- Set maximum delegation depth

**Detection:**
- Skill execution hangs or times out
- Context fills with repeated skill invocations
- Error logs show deep call stacks
- Token costs explode for simple operations

---

### Pitfall 13: Environment Variable Dependency
**What goes wrong:** Skills rely on environment variables that aren't documented or validated, causing silent failures in different environments.

**Prevention:**
- Document all required environment variables in README
- Include validation in skill: "Check that GITHUB_TOKEN is set"
- Provide clear error messages when vars missing
- Consider .env.example file
- Test in clean environment without your personal config

**Detection:**
- Skills work locally but fail in CI
- Users report "skill doesn't work" without error message
- Debugging reveals missing env var assumptions
- Works after `export SOME_VAR=...` but this wasn't documented

---

### Pitfall 14: Marketplace Distribution Format Errors
**What goes wrong:** Plugin works with `--plugin-dir` but fails when distributed through marketplace due to incorrect structure, missing manifest fields, or path assumptions.

**Prevention:**
- Test installation from marketplace before public release
- Validate plugin.json against schema
- Use relative paths, never absolute paths
- Follow official directory structure exactly
- Test on different OS (paths, line endings, permissions)

**Detection:**
- Plugin loads locally but marketplace installation fails
- Users report "plugin not found" after installation
- Skills don't appear in namespace after install
- Plugin version shows incorrect or missing metadata

---

### Pitfall 15: Over-Reliance on Pre-Existing Knowledge
**What goes wrong:** Skills assume Claude "knows" current library APIs or patterns without verification. Claude's training data is 6-18 months stale.

**Prevention:**
- Include current API patterns in skill or supporting files
- Link to official documentation: "Refer to https://..."
- Don't assume library capabilities without verification
- Test skills with latest library versions
- Include version constraints in documentation

**Detection:**
- Skill generates deprecated API usage
- Claude uses old patterns that no longer work
- Users report "this code doesn't match current docs"
- Frequent corrections needed after skill execution

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 16: Missing argument-hint Frontmatter
**What goes wrong:** Users invoke `/skill-name` but don't know what arguments to provide. Discovery is painful.

**Prevention:**
- Always include `argument-hint` in frontmatter for skills that take arguments
- Example: `argument-hint: "[contract-name]"` or `[test-file] [coverage-threshold]`

---

### Pitfall 17: Unclear Skill vs Command Terminology
**What goes wrong:** Confusion between commands (legacy `.claude/commands/`), skills (`.claude/skills/`), and plugin-namespaced skills.

**Prevention:**
- Use "skill" consistently in documentation
- Note that commands are legacy, skills are current
- Clarify that both create slash commands
- Explain plugin namespacing upfront

---

### Pitfall 18: No README or Usage Documentation
**What goes wrong:** Users install plugin but don't know what skills exist, what they do, or how to invoke them.

**Prevention:**
- Include comprehensive README.md at plugin root
- Document each skill with examples
- Include troubleshooting section
- Add GIF/video showing usage for complex workflows

---

### Pitfall 19: Version Field Neglect
**What goes wrong:** Plugin versions never increment, causing confusion about which version users have installed and breaking update mechanisms.

**Prevention:**
- Use semantic versioning: MAJOR.MINOR.PATCH
- Increment on every release
- Document changes in CHANGELOG.md
- Test update flow from old to new version

---

### Pitfall 20: Missing License Information
**What goes wrong:** Legal ambiguity prevents enterprise adoption or community contributions.

**Prevention:**
- Include `license` field in plugin.json
- Add LICENSE file at plugin root
- Use standard license (MIT, Apache-2.0, etc.)
- Clarify contribution terms

---

## Phase-Specific Warnings

Critical considerations for each development phase.

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Foundation/Planning** | Unnecessary orchestration complexity | Start with single skill. Validate orchestration need before building it. Ask: "What breaks without orchestration?" |
| **Architecture** | Subagent context mode mismatch | Decide inline vs fork early. Research skills → fork. Sequential workflows → inline. |
| **Skill Development** | Context window explosion | Keep SKILL.md under 500 lines. Move reference material to supporting files with progressive disclosure. |
| **Testing** | Verification gap | Build verification INTO skills. Include test cases, expected outputs, validation steps. |
| **Security** | Permission ambiguity | Declare required tools with `allowed-tools`. Test in restrictive mode. Document permission requirements. |
| **Performance** | Bloated CLAUDE.md loading | Audit total skill description length. Set SLASH_COMMAND_TOOL_CHAR_BUDGET if needed. Monitor with `/context`. |
| **Usability** | Skill description vagueness | Include specific trigger phrases. Test with realistic user prompts. Iterate based on false positives/negatives. |
| **Integration** | Environment variable dependency | Document all required env vars. Validate in skill. Test in clean environment. |
| **Distribution** | Plugin structure errors | Validate manifest. Use relative paths. Test installation from marketplace on clean system. |
| **Deployment** | Namespace conflicts | Understand precedence: enterprise > personal > project. Test in all environments. Use descriptive plugin names. |
| **Maintenance** | Missing version increments | Use semantic versioning. Update on every release. Maintain CHANGELOG.md. |

## Architecture-Specific Warnings

For orchestrator + specialized skills architecture specifically:

### Dynamic Routing Complexity
**Problem:** Orchestrator must classify requests and route to correct skill. Misrouting causes poor results.

**Prevention:**
- Keep routing logic simple and explicit
- Use clear skill descriptions for routing decisions
- Log routing decisions for debugging
- Test with ambiguous user prompts
- Consider whether routing adds value vs. direct skill invocation

### Shared State Management
**Problem:** Multiple skills need to coordinate state (current test results, contract modifications, etc.).

**Prevention:**
- Use filesystem for state: write to `.planning/state/` directory
- Pass state explicitly via arguments rather than assuming shared context
- Document state dependencies between skills
- Clean up state after workflow completion
- Consider whether skills actually need shared state

### Skill Composition Brittleness
**Problem:** Workflow depends on skills executing in sequence, but one skill failure breaks everything.

**Prevention:**
- Design skills to be idempotent (can retry safely)
- Include error handling in orchestrator
- Validate preconditions before invoking next skill
- Provide meaningful error messages for failure points
- Test partial execution scenarios

### Orchestrator Permission Scope
**Problem:** Orchestrator needs different permissions than specialized skills, causing security/usability tension.

**Prevention:**
- Use `allowed-tools` per skill, not globally
- Test orchestrator with both restrictive and permissive settings
- Document minimum required permissions clearly
- Consider sandbox compatibility
- Separate read-only exploration from write operations

## Testing Checklist for Plugin Release

Before distributing your plugin, verify:

- [ ] Plugin works with `--plugin-dir` in clean environment
- [ ] All skills have clear descriptions with trigger phrases
- [ ] Skills under 500 lines, reference material in supporting files
- [ ] `argument-hint` provided for skills accepting arguments
- [ ] Required tools declared in `allowed-tools` frontmatter
- [ ] Permission requirements documented in README
- [ ] Environment variable dependencies documented
- [ ] Plugin.json has valid name, description, version, license
- [ ] Namespace doesn't conflict with common plugin names
- [ ] Tested installation from marketplace (not just --plugin-dir)
- [ ] Skills include verification steps or expected outputs
- [ ] Context consumption checked with `/context`
- [ ] Subagent skills use appropriate context mode
- [ ] README includes usage examples and troubleshooting
- [ ] Works on multiple OS (test paths, line endings)

## Sources

**Official Documentation (HIGH confidence):**
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins)
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)

**Community Insights (MEDIUM confidence):**
- [Claude Code Multi-Agent Orchestration System](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f)
- [Optimizing Claude Code: Skills, Plugins, and the Art of Teaching Your AI](https://mays.co/optimizing-claude-code)
- [Medium: Your AI has infinite knowledge and zero habits](https://medium.com/@elliotJL/your-ai-has-infinite-knowledge-and-zero-habits-heres-the-fix-e279215d478d)

**Architecture Patterns (MEDIUM confidence):**
- [Microsoft Learn: AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Kanerika: AI Agent Orchestration in 2026](https://kanerika.com/blogs/ai-agent-orchestration/)
- [Claude Blog: When to use multi-agent systems](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
- [Cloud Geometry: Why Multi-Agent Systems Need Real Architecture](https://www.cloudgeometry.com/blog/from-solo-act-to-orchestra-why-multi-agent-systems-demand-real-architecture)

**Practical Guidance (MEDIUM confidence):**
- [Building /deep-plan: A Claude Code Plugin](https://pierce-lamb.medium.com/building-deep-plan-a-claude-code-plugin-for-comprehensive-planning-30e0921eb841)
- [The best way to do agentic development in 2026](https://dev.to/chand1012/the-best-way-to-do-agentic-development-in-2026-14mn)
- [Claude Code in 2026: End-to-End SDLC Workflow](https://developersvoice.com/blog/ai/claude_code_2026_end_to_end_sdlc/)
