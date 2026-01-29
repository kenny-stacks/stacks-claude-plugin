# Phase 1: Plugin Foundation & Compliance - Research

**Researched:** 2026-01-29
**Domain:** Claude Code Plugin Structure & Agent Skills Specification
**Confidence:** HIGH

## Summary

This phase establishes the foundational plugin structure and ensures compliance with both the Claude Code plugin system and the Agent Skills open standard. The research covers three key domains:

1. **Plugin Structure** - Claude Code plugins require a `.claude-plugin/plugin.json` manifest with all other components (skills/, agents/, hooks/) at the plugin root. The `plugin.json` defines identity, namespace, and component paths.

2. **Agent Skills Specification** - Skills follow the open standard at agentskills.io, using `SKILL.md` files with YAML frontmatter containing required `name` and `description` fields, plus optional `license`, `metadata`, `allowed-tools`, and `compatibility` fields.

3. **Validation** - The `skills-ref` Python library validates skill compliance. Install via `pip install skills-ref`, validate via `skills-ref validate ./path/to/skill`.

**Primary recommendation:** Create the minimal valid plugin structure first, validate immediately with `skills-ref`, then install locally with `--plugin-dir` to verify before adding any functionality.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| skills-ref | 0.1.1 | Validate Agent Skills SKILL.md files | Official validator from Anthropic, published on PyPI |
| Python | >=3.11 | Required for skills-ref | skills-ref dependency requirement |
| Claude Code | 1.0.33+ | Plugin host with `/plugin` command | Target platform; version requirement for plugin support |

### Supporting

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| jq | any | Validate plugin.json syntax | Quick JSON syntax check: `jq . .claude-plugin/plugin.json` |
| claude --debug | built-in | Debug plugin loading | When plugins fail to load or skills don't appear |
| /plugin validate | built-in | Interactive plugin validation | During development after `--plugin-dir` loading |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| skills-ref (Python) | skills-ref-rs (Rust) | Rust version has feature parity but Python is more accessible |
| skills-ref (Python) | go-agentskills (Go) | Go version exists but Python is the reference implementation |
| Manual validation | Web validator at claude-plugins.dev | Web validator is community-built, less authoritative |

**Installation:**
```bash
pip install skills-ref
# OR with uv:
uv add skills-ref
```

## Architecture Patterns

### Recommended Project Structure

```
stacks-skills/                          # Plugin root
├── .claude-plugin/                     # Metadata directory (ONLY plugin.json here)
│   └── plugin.json                     # Required: plugin manifest
├── skills/                             # Agent Skills directory
│   └── stacks-dev/                     # Skill directory (name must match frontmatter)
│       ├── SKILL.md                    # Required: skill entrypoint
│       ├── references/                 # Optional: on-demand documentation
│       ├── scripts/                    # Optional: executable scripts
│       └── assets/                     # Optional: templates, static files
├── LICENSE                             # License file (Apache-2.0 or MIT)
├── README.md                           # Plugin documentation
└── CHANGELOG.md                        # Version history
```

### Pattern 1: Minimal Valid Plugin

**What:** The absolute minimum structure to pass validation and install successfully.

**When to use:** Phase 1 - establishing foundation before adding functionality.

**Example:**

```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── stacks-dev/
        └── SKILL.md
```

**plugin.json (minimal):**
```json
{
  "name": "stacks-skills",
  "description": "Claude Code plugin for Stacks blockchain development",
  "version": "0.1.0"
}
```

**SKILL.md (minimal compliant):**
```yaml
---
name: stacks-dev
description: Stacks blockchain development assistant. Use when working with Clarity smart contracts, Clarinet projects, or Stacks blockchain development.
license: Apache-2.0
metadata:
  author: Your Name
  version: "0.1.0"
allowed-tools: Read Bash Grep Glob
---

# Stacks Development Assistant

Instructions for Stacks blockchain development...
```

### Pattern 2: Progressive Disclosure Structure

**What:** Skill content organized for efficient context loading.

**When to use:** When skill needs detailed reference material but should stay under 500 lines.

**Example:**
```
skills/stacks-dev/
├── SKILL.md                    # ~100-300 lines: core instructions
├── references/
│   ├── clarity-patterns.md     # Loaded on-demand when doing contract work
│   ├── clarinet-commands.md    # Loaded when user asks about CLI
│   └── testing-guide.md        # Loaded during TDD phase
├── scripts/
│   └── validate-project.sh     # Executable validation script
└── assets/
    └── contract-template.clar  # Template file
```

**SKILL.md references supporting files:**
```markdown
## Additional Resources

For detailed information:
- Contract patterns: see [references/clarity-patterns.md](references/clarity-patterns.md)
- CLI reference: see [references/clarinet-commands.md](references/clarinet-commands.md)
- Testing guide: see [references/testing-guide.md](references/testing-guide.md)
```

### Anti-Patterns to Avoid

- **Components inside .claude-plugin/**: NEVER put skills/, agents/, or hooks/ inside `.claude-plugin/`. Only `plugin.json` goes there.
- **Monolithic SKILL.md**: DON'T create a 5000+ line SKILL.md. Keep under 500 lines, use references/ for detailed docs.
- **Absolute paths in plugin.json**: All paths MUST be relative and start with `./`.
- **Name mismatch**: Skill directory name MUST match the `name` field in frontmatter.
- **Missing description keywords**: Description MUST include trigger keywords users would naturally say.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter validation | Custom parser | skills-ref validate | Handles edge cases, character limits, name format rules |
| Plugin structure validation | Manual checks | claude --debug + /plugin validate | Catches directory structure errors, manifest issues |
| Skill description matching | Custom logic | Claude's built-in matching | Claude uses description field for auto-activation |
| JSON schema validation | Manual field checks | jq + Claude Code built-in | Both validate syntax; Claude Code validates semantics |

**Key insight:** The validation tooling is comprehensive. Don't replicate what `skills-ref validate` and `claude --debug` already catch.

## Common Pitfalls

### Pitfall 1: Directory Structure Errors

**What goes wrong:** Components placed inside `.claude-plugin/` instead of plugin root, causing skills/agents/hooks to silently not load.

**Why it happens:** Misreading documentation, assuming `.claude-plugin/` is the "main" directory.

**How to avoid:**
- `.claude-plugin/` contains ONLY `plugin.json`
- Everything else goes at plugin root: `skills/`, `agents/`, `hooks/`, `.mcp.json`

**Warning signs:** Skills don't appear in `/help`, `claude --debug` shows no skill loading messages.

### Pitfall 2: Name Field Violations

**What goes wrong:** `skills-ref validate` fails with name field errors.

**Why it happens:** Common mistakes include:
- Uppercase letters (`Stacks-Dev` vs `stacks-dev`)
- Starting/ending with hyphens (`-stacks-dev-`)
- Consecutive hyphens (`stacks--dev`)
- Name exceeds 64 characters
- Name doesn't match directory name

**How to avoid:**
- Use only lowercase letters, numbers, and single hyphens
- Keep under 64 characters
- Directory name MUST match `name` field exactly
- Validate immediately: `skills-ref validate ./skills/stacks-dev`

**Warning signs:** `skills-ref validate` outputs validation errors.

### Pitfall 3: Vague Description Field

**What goes wrong:** Claude never auto-loads the skill because description lacks trigger keywords.

**Why it happens:** Writing descriptions for humans ("Helps with development") instead of for pattern matching.

**How to avoid:**
- Include specific keywords users would say: "Stacks", "Clarity", "Clarinet", "smart contracts"
- Include "Use when..." clause
- Test with realistic prompts

**Warning signs:** Must always use `/plugin:skill-name` because auto-activation never works.

### Pitfall 4: Missing allowed-tools Declaration

**What goes wrong:** Skill requires tools but doesn't declare them, causing permission prompts or failures.

**Why it happens:** Testing in permissive environment, not declaring tool requirements upfront.

**How to avoid:**
- Add `allowed-tools` in frontmatter: `allowed-tools: Read Bash Grep Glob`
- Be specific: `Bash(git:*) Bash(clarinet:*)` not just `Bash`
- Test with restrictive permissions

**Warning signs:** Skill works locally but fails in CI or for other users.

### Pitfall 5: Context Explosion from Large SKILL.md

**What goes wrong:** Skill exceeds token budget, either excluded from context or causing performance issues.

**Why it happens:** Treating SKILL.md as documentation dump instead of concise instructions.

**How to avoid:**
- Keep SKILL.md under 500 lines
- Move detailed content to `references/` directory
- Use progressive disclosure: reference files loaded on-demand

**Warning signs:** `/context` shows character budget warnings, skill excluded from context.

## Code Examples

Verified patterns from official sources:

### Minimal Valid plugin.json

```json
{
  "name": "stacks-skills",
  "description": "Claude Code plugin for Stacks blockchain development with enforced TDD workflow",
  "version": "0.1.0",
  "author": {
    "name": "Your Name"
  },
  "license": "Apache-2.0",
  "repository": "https://github.com/username/stacks-skills"
}
```
Source: [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)

### Minimal Valid SKILL.md Frontmatter

```yaml
---
name: stacks-dev
description: Stacks blockchain development assistant. Guides Clarity smart contract development, Clarinet CLI usage, and TDD workflow. Use when working with Stacks, Clarity, or Clarinet, or when user mentions smart contracts on Stacks.
license: Apache-2.0
metadata:
  author: Your Name
  version: "0.1.0"
allowed-tools: Read Bash Grep Glob
---
```
Source: [Agent Skills Specification](https://agentskills.io/specification)

### Complete SKILL.md with Progressive Disclosure

```yaml
---
name: stacks-dev
description: Stacks blockchain development assistant. Guides Clarity smart contract development, Clarinet CLI usage, and TDD workflow. Use when working with Stacks, Clarity, or Clarinet, or when user mentions smart contracts on Stacks.
license: Apache-2.0
metadata:
  author: Your Name
  version: "0.1.0"
allowed-tools: Read Bash Grep Glob Write Edit
---

# Stacks Development Assistant

You are a Stacks blockchain development expert. Help users build high-quality Clarity smart contracts using test-driven development.

## Core Workflow

1. **Design** - Understand requirements, review best practices
2. **Test First** - Write tests using Clarinet SDK before implementation
3. **Implement** - Write Clarity contract code to pass tests
4. **Verify** - Run tests, check coverage, validate quality

## When to Load Additional Context

- For Clarity patterns: read [references/clarity-patterns.md](references/clarity-patterns.md)
- For Clarinet CLI: read [references/clarinet-commands.md](references/clarinet-commands.md)
- For testing: read [references/testing-guide.md](references/testing-guide.md)

## Quick Reference

### Common Clarinet Commands
- `clarinet new project-name` - Create new project
- `clarinet contract new name` - Add contract
- `clarinet check` - Validate syntax
- `clarinet test` - Run tests

## Verification

After any action, verify:
- [ ] Code compiles: `clarinet check`
- [ ] Tests pass: `clarinet test`
- [ ] Changes match requirements
```
Source: [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)

### Validation Commands

```bash
# Install skills-ref validator
pip install skills-ref

# Validate skill directory
skills-ref validate ./skills/stacks-dev

# Read skill properties as JSON (useful for debugging)
skills-ref read-properties ./skills/stacks-dev

# Validate plugin.json syntax
jq . .claude-plugin/plugin.json

# Test plugin loading with debug output
claude --debug --plugin-dir ./stacks-skills

# Interactive plugin validation
# (after loading with --plugin-dir)
/plugin validate
```
Source: [skills-ref PyPI](https://pypi.org/project/skills-ref/), [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)

### Plugin Installation Test

```bash
# Test local installation
claude --plugin-dir /path/to/stacks-skills

# Verify skill appears
/help
# Should show: /stacks-skills:stacks-dev

# Test skill invocation
/stacks-skills:stacks-dev

# Install to user scope
claude plugin install . --scope user
```
Source: [Claude Code Create Plugins](https://code.claude.com/docs/en/plugins)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.claude/commands/` flat files | `skills/name/SKILL.md` directory structure | 2025 | Skills support directories with references/, scripts/, assets/ |
| Commands only | Agent Skills standard | 2025 | Open standard, cross-platform compatibility |
| No validation tooling | skills-ref validator | Jan 2026 | Automated validation before deployment |
| Implicit tool permissions | `allowed-tools` frontmatter | 2025 | Explicit tool declarations, better security |

**Deprecated/outdated:**
- `.claude/commands/` flat command files: Still work but `skills/` directory structure recommended
- Manual YAML validation: Use `skills-ref validate` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Exact character limit for skill descriptions in context**
   - What we know: Default budget is 15,000 characters across all skill descriptions
   - What's unclear: Exact allocation per skill, whether budget is configurable without env var
   - Recommendation: Keep individual descriptions under 500 characters, monitor with `/context`

2. **skills-ref validate exit codes**
   - What we know: Returns validation problems as list
   - What's unclear: Whether non-zero exit code on failure (for CI integration)
   - Recommendation: Check output for "problems" in addition to exit code

3. **Plugin caching behavior on updates**
   - What we know: Plugins are copied to cache during installation
   - What's unclear: Whether `claude plugin update` re-validates or just re-caches
   - Recommendation: Always validate before update, test after

## Sources

### Primary (HIGH confidence)
- [Agent Skills Specification](https://agentskills.io/specification) - Complete SKILL.md format, field constraints, directory structure
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) - plugin.json schema, CLI commands, debugging
- [Claude Code Create Plugins](https://code.claude.com/docs/en/plugins) - Plugin structure quickstart, installation
- [Claude Code Skills](https://code.claude.com/docs/en/skills) - SKILL.md format, frontmatter reference, progressive disclosure
- [skills-ref PyPI](https://pypi.org/project/skills-ref/) - Official validator, version 0.1.1, installation

### Secondary (MEDIUM confidence)
- [skills-ref GitHub](https://github.com/agentskills/agentskills/tree/main/skills-ref) - CLI usage, Python API
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) - Official plugin examples

### Tertiary (LOW confidence)
- Community plugin examples for pattern validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation and PyPI package
- Architecture: HIGH - Official Claude Code documentation with clear examples
- Pitfalls: HIGH - Drawn from official docs warnings and existing project PITFALLS.md

**Research date:** 2026-01-29
**Valid until:** 2026-03-29 (60 days - stable specification, infrequent changes)
