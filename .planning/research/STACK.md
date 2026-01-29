# Technology Stack: Claude Code Skills Plugin

**Project:** stacks-skills
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

Claude Code skills plugins follow the [Agent Skills open standard](https://agentskills.io) with Claude-specific extensions. The stack is file-based (no build tools required), using Markdown with YAML frontmatter for configuration, standard directory conventions for organization, and optional scripts in any language for execution logic.

**Core principle:** Progressive disclosure. Skills load metadata (~100 tokens) at startup, full instructions (<5k tokens) when activated, and supporting files only when referenced.

## Recommended Stack

### File Formats

| Format | Purpose | Required | Validation |
|--------|---------|----------|------------|
| `SKILL.md` | Skill definition with frontmatter + instructions | Yes (per skill) | [skills-ref validator](https://github.com/agentskills/agentskills/tree/main/skills-ref) |
| `plugin.json` | Plugin manifest with metadata + configuration | Yes (plugin root) | Built-in `/plugin validate` |
| Markdown (`.md`) | Reference documentation, templates | Optional | None (freeform) |
| Any scripting language | Executable logic (bash, python, node, etc.) | Optional | Language-specific |

**Why these formats:**
- Markdown is human-readable, version-controllable, and LLM-friendly
- YAML frontmatter provides structured metadata without heavyweight tooling
- No compilation or build steps required
- Works with existing development workflows (git, CI/CD, etc.)

### Directory Structure (Multi-Skill Plugin)

```
stacks-skills/                          # Plugin root
├── .claude-plugin/                     # Plugin metadata directory
│   └── plugin.json                     # Required: plugin manifest
├── skills/                             # Agent Skills (model-invoked)
│   ├── stacks-orchestrator/            # Orchestrator skill
│   │   ├── SKILL.md                    # Skill entrypoint
│   │   ├── references/                 # Optional: detailed docs
│   │   │   ├── workflow.md             # Workflow reference
│   │   │   └── phase-templates.md      # Phase templates
│   │   └── scripts/                    # Optional: executables
│   │       └── validate-project.sh     # Validation script
│   ├── clarity-tdd/                    # TDD skill
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── clarinet-sdk.md         # SDK reference
│   │   │   └── test-patterns.md        # Test patterns
│   │   └── scripts/
│   │       └── run-tests.sh
│   ├── coverage-enforcer/              # Coverage skill
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── check-coverage.sh
│   ├── fuzz-testing/                   # Fuzz testing skill
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   └── rendezvous-guide.md
│   │   └── scripts/
│   │       └── run-fuzz.sh
│   └── frontend-integration/           # Frontend skill
│       ├── SKILL.md
│       └── references/
│           └── react-patterns.md
├── agents/                             # Optional: custom subagents
│   └── stacks-expert.md                # Domain specialist subagent
├── hooks/                              # Optional: event handlers
│   └── hooks.json                      # Hook configuration
├── .mcp.json                          # Optional: MCP server config
├── README.md                          # Plugin documentation
├── LICENSE                            # License file
└── CHANGELOG.md                       # Version history
```

**Critical constraints:**

1. **Only `plugin.json` goes inside `.claude-plugin/`**
   - Everything else (skills/, agents/, hooks/, etc.) MUST be at plugin root
   - This is the most common mistake in plugin development

2. **Skills use directory structure (`skill-name/SKILL.md`)**
   - Not flat files like legacy commands
   - Directory name must match frontmatter `name` field
   - Lowercase letters, numbers, hyphens only (max 64 chars)

3. **Namespace isolation**
   - Plugin skills are invoked as `/plugin-name:skill-name`
   - Prevents conflicts between plugins
   - Cannot override this (security feature)

### SKILL.md Format

Every skill requires a `SKILL.md` file with this structure:

```markdown
---
name: skill-name
description: What this skill does and when to use it. Claude uses this to decide when to activate.
allowed-tools: Read Bash Grep Glob
disable-model-invocation: false
user-invocable: true
context: inline
---

# Main Instructions

Step-by-step instructions that Claude follows when skill is activated.

## When to Use This Skill

Specific triggers and scenarios.

## Process

1. Step one with clear action
2. Step two with expected outcome
3. Step three with validation

## Examples

[Concrete examples showing input/output]

## References

- For detailed API docs, see [reference.md](references/reference.md)
- For example patterns, see [examples.md](references/examples.md)
```

**Frontmatter fields (Agent Skills standard):**

| Field | Required | Purpose | Constraints |
|-------|----------|---------|-------------|
| `name` | Yes | Identifier (becomes `/plugin:name`) | Lowercase, hyphens, 1-64 chars |
| `description` | Yes | When Claude should activate this skill | 1-1024 chars, include keywords |
| `license` | No | License reference | Keep short |
| `compatibility` | No | Environment requirements | 1-500 chars |
| `metadata` | No | Custom key-value pairs | Arbitrary data |
| `allowed-tools` | No | Pre-approved tools (experimental) | Space-delimited list |

**Claude Code extensions (beyond Agent Skills standard):**

| Field | Purpose | Values |
|-------|---------|--------|
| `disable-model-invocation` | Prevent Claude from auto-activating | `true`/`false` (default: `false`) |
| `user-invocable` | Show in `/` menu | `true` (default)/`false` |
| `allowed-tools` | Tools skill can use without permission | Tool names (e.g., `Read, Grep, Glob`) |
| `disallowedTools` | Tools to explicitly deny | Tool names |
| `model` | Model to use when skill is active | `sonnet`, `opus`, `haiku`, `inherit` |
| `context` | Execution context | `inline` (default) or `fork` |
| `agent` | Which subagent when `context: fork` | Agent name (e.g., `Explore`, `Plan`) |
| `argument-hint` | Autocomplete hint | Text (e.g., `[issue-number]`) |
| `hooks` | Skill-scoped lifecycle hooks | Hook configuration |

**String substitutions available in skill content:**

| Variable | Replaced With |
|----------|---------------|
| `$ARGUMENTS` | All arguments passed to skill |
| `$ARGUMENTS[N]` | Specific argument by index (0-based) |
| `$N` | Shorthand for `$ARGUMENTS[N]` (e.g., `$0`) |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `` !`command` `` | Command output (preprocessed before Claude sees it) |

### Plugin Manifest Format

`plugin.json` defines plugin metadata and component locations:

```json
{
  "name": "stacks-skills",
  "version": "1.0.0",
  "description": "Claude Code plugin for Stacks blockchain development with enforced TDD workflow",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://github.com/yourusername"
  },
  "homepage": "https://github.com/yourusername/stacks-skills",
  "repository": "https://github.com/yourusername/stacks-skills",
  "license": "MIT",
  "keywords": ["stacks", "blockchain", "clarity", "tdd", "testing"],
  "skills": "./skills/",
  "agents": "./agents/",
  "hooks": "./hooks/hooks.json"
}
```

**Required fields:**
- `name` - Unique identifier (kebab-case, becomes skill namespace)

**Recommended fields:**
- `version` - Semantic versioning (MAJOR.MINOR.PATCH)
- `description` - Plugin purpose (shown in plugin manager)
- `author` - Attribution info
- `repository` - Source code location

**Component path fields:**

| Field | Default | Purpose | Format |
|-------|---------|---------|--------|
| `skills` | `skills/` | Additional skill directories | String or array of paths |
| `agents` | `agents/` | Additional agent files | String or array of paths |
| `hooks` | (none) | Hook configuration | Path to `hooks.json` or inline object |
| `mcpServers` | `.mcp.json` | MCP server config | Path to `.mcp.json` or inline object |
| `lspServers` | `.lsp.json` | LSP server config | Path to `.lsp.json` or inline object |
| `commands` | `commands/` | Legacy command files (use `skills/` instead) | String or array of paths |
| `outputStyles` | (none) | Custom output styling | Path to styles directory |

**Path rules:**
- All paths MUST be relative and start with `./`
- Custom paths SUPPLEMENT defaults (don't replace them)
- Multiple paths can be specified as arrays
- Paths can point to files or directories depending on component type

**Environment variables:**

| Variable | Value | Use Case |
|----------|-------|----------|
| `${CLAUDE_PLUGIN_ROOT}` | Absolute path to plugin directory | Scripts, hooks, MCP servers requiring absolute paths |

**Example with inline components:**

```json
{
  "name": "stacks-skills",
  "version": "1.0.0",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/lint-clarity.sh $FILE"
          }
        ]
      }
    ]
  }
}
```

### Skill Organization Patterns

**Option 1: Flat Structure (Simple plugins, 1-3 skills)**

```
skills/
├── skill-one/
│   └── SKILL.md
├── skill-two/
│   └── SKILL.md
└── skill-three/
    └── SKILL.md
```

**Option 2: Progressive Disclosure (Complex skills with supporting files)**

```
skills/
└── complex-skill/
    ├── SKILL.md              # <500 lines, references other files
    ├── references/           # Loaded on-demand
    │   ├── api-reference.md  # Detailed API docs
    │   └── examples.md       # Usage examples
    ├── scripts/              # Executable logic
    │   └── processor.py
    └── assets/               # Static resources
        ├── template.json
        └── diagram.png
```

**Option 3: Category Grouping (This plugin - multiple related skills)**

For this Stacks plugin with 5 distinct but related skills, use category grouping:

```
skills/
├── stacks-orchestrator/      # Coordination skill
│   ├── SKILL.md
│   └── references/
│       └── workflow.md
├── clarity-tdd/              # Testing category
│   ├── SKILL.md
│   ├── references/
│   │   └── test-patterns.md
│   └── scripts/
│       └── run-tests.sh
├── coverage-enforcer/        # Testing category
│   ├── SKILL.md
│   └── scripts/
│       └── check-coverage.sh
├── fuzz-testing/             # Testing category
│   ├── SKILL.md
│   ├── references/
│   │   └── rendezvous-guide.md
│   └── scripts/
│       └── run-fuzz.sh
└── frontend-integration/     # Integration category
    ├── SKILL.md
    └── references/
        └── react-patterns.md
```

**Orchestrator pattern for multi-skill plugins:**

The orchestrator skill coordinates other skills. Include these sections:

```markdown
---
name: stacks-orchestrator
description: Orchestrates Stacks blockchain development workflow. Use when starting new Clarity contracts, coordinating testing phases, or managing project lifecycle.
---

# Stacks Development Orchestrator

Coordinates specialized skills for high-quality Clarity smart contract development.

## Available Skills

- `/stacks-skills:clarity-tdd` - TDD workflow with Clarinet SDK
- `/stacks-skills:coverage-enforcer` - Enforce test coverage requirements
- `/stacks-skills:fuzz-testing` - Property-based testing with Rendezvous
- `/stacks-skills:frontend-integration` - React/Next.js integration

## Workflow Phases

1. **Contract Design** - Architecture and interface design
2. **TDD Setup** - Test infrastructure with Clarinet SDK
3. **Test-Driven Development** - Red-green-refactor cycle
4. **Coverage Enforcement** - Validate coverage thresholds
5. **Fuzz Testing** - Property-based testing for edge cases
6. **Frontend Integration** - Connect to React/Next.js

## When to Delegate

[Specific conditions for activating each specialized skill]
```

### Skill Communication Patterns

Skills cannot directly invoke other skills, but can coordinate through:

**1. Documentation references:**
```markdown
After writing tests, use the coverage-enforcer skill to validate thresholds.
See `/stacks-skills:coverage-enforcer` for coverage validation.
```

**2. Workflow instructions:**
```markdown
## Multi-Phase Process

1. Use this skill to write tests
2. Recommend user run `/stacks-skills:coverage-enforcer` to validate coverage
3. If coverage insufficient, return to step 1
```

**3. Orchestrator coordination:**
The orchestrator skill explicitly delegates to specialized skills based on phase.

**Anti-pattern: Don't try to invoke skills from within skills**
- Skills cannot call other skills programmatically
- Skills cannot use `Skill(name)` tool
- Orchestrator should be invoked by user, then coordinates subsequent skills

## Supporting Technologies

### Version Control
- **Git** - Standard for plugin distribution
- All files are text-based (excellent for version control)
- Plugin marketplaces reference git repositories

### Validation Tools
- **skills-ref** - Official Agent Skills validator
  ```bash
  skills-ref validate ./skill-name
  ```
- **Claude Code built-in** - `/plugin validate` command
- **JSON validators** - For plugin.json schema validation

### Scripting Languages
Skills can include scripts in any language installed on user's machine:

| Language | Typical Use | Installation Requirement |
|----------|-------------|--------------------------|
| Bash | System operations, git commands, file manipulation | Built-in (Unix/Mac) |
| Python | Data processing, API calls, complex logic | User must install |
| Node.js | JavaScript/TypeScript tools, npm integration | User must install |
| Go | High-performance processing | User must install |

**Best practices:**
- Check for script dependencies with clear error messages
- Include installation instructions in README.md
- Use `compatibility` field in frontmatter to document requirements

### Distribution Mechanisms

| Mechanism | Use Case | Setup Complexity |
|-----------|----------|------------------|
| `--plugin-dir` flag | Local development, testing | Low (one-time flag) |
| Git repository | Team sharing, version control | Low (git clone) |
| Plugin marketplace | Public/private distribution | Medium (marketplace JSON) |
| Managed settings | Enterprise deployment | High (admin-controlled) |

**Recommended flow:**
1. Develop with `--plugin-dir ./stacks-skills`
2. Test with teammates via git repository
3. Distribute publicly via plugin marketplace
4. Enterprise deploys via managed settings

## Alternatives Considered

### Build Tool-Based Approach (e.g., npm, bundlers)

**Why not:**
- Adds complexity without benefit (no compilation needed)
- Breaks simplicity of markdown-based approach
- Requires users to install build toolchain
- Counter to Agent Skills open standard (designed for portability)

**When it might make sense:**
- If bundling complex TypeScript-based MCP servers
- If generating documentation from code
- For this plugin: Overkill. Stick to simple markdown + scripts.

### Monolithic Skill Design (One skill does everything)

**Why not:**
- Violates progressive disclosure principle
- Loads unnecessary context (all phases active simultaneously)
- Harder to maintain and test
- Poor user experience (can't invoke specific phases)

**Better approach:**
- Multiple focused skills (one per phase/concern)
- Orchestrator coordinates them
- Each skill loads only relevant context

### Direct File Modification (Skills edit SKILL.md files)

**Why not:**
- Skills are read-only by design
- Plugin cache system prevents in-place modification
- Would break version control and distribution
- Anti-pattern in Claude Code architecture

**Correct approach:**
- Skills read their own reference files
- Skills can read/write project files (user's code)
- Skills cannot modify themselves or other skills

## Installation & Setup

### For Plugin Development

```bash
# Create plugin structure
mkdir -p stacks-skills/.claude-plugin
mkdir -p stacks-skills/skills/{skill-name}

# Create manifest
cat > stacks-skills/.claude-plugin/plugin.json <<EOF
{
  "name": "stacks-skills",
  "version": "0.1.0",
  "description": "Stacks blockchain development plugin"
}
EOF

# Create first skill
cat > stacks-skills/skills/skill-name/SKILL.md <<EOF
---
name: skill-name
description: What this skill does
---

Instructions here.
EOF

# Test locally
claude --plugin-dir ./stacks-skills
```

### For Plugin Distribution

**Via Git Repository:**
```bash
# User clones repo
git clone https://github.com/username/stacks-skills
cd stacks-skills

# User installs plugin
claude plugin install . --scope user
```

**Via Plugin Marketplace:**

Create `marketplace.json`:
```json
{
  "plugins": [
    {
      "name": "stacks-skills",
      "source": "https://github.com/username/stacks-skills",
      "description": "Stacks blockchain development with enforced TDD workflow",
      "keywords": ["stacks", "blockchain", "clarity", "tdd"],
      "version": "1.0.0"
    }
  ]
}
```

Users install:
```bash
claude plugin install stacks-skills@marketplace-name
```

## Anti-Patterns to Avoid

### 1. Putting Components Inside `.claude-plugin/`

**Wrong:**
```
stacks-skills/
└── .claude-plugin/
    ├── plugin.json
    ├── skills/           # ❌ Won't load
    └── agents/           # ❌ Won't load
```

**Right:**
```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json     # ✅ Only manifest here
├── skills/             # ✅ At plugin root
└── agents/             # ✅ At plugin root
```

### 2. Using Absolute Paths

**Wrong:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [{
          "command": "/Users/kenny/stacks-skills/scripts/lint.sh"  // ❌ Breaks for other users
        }]
      }
    ]
  }
}
```

**Right:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [{
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh"  // ✅ Portable
        }]
      }
    ]
  }
}
```

### 3. Monolithic SKILL.md Files

**Wrong:**
```markdown
---
name: stacks-all-in-one
description: Does everything for Stacks development
---

[5000 lines covering contract design, TDD, fuzz testing, frontend, deployment...]
```

**Right:**
```markdown
---
name: clarity-tdd
description: TDD workflow specifically for Clarity contracts with Clarinet SDK
---

[500 lines focused on TDD workflow]

For detailed API reference, see [references/clarinet-api.md](references/clarinet-api.md)
```

### 4. Skills Trying to Invoke Other Skills

**Wrong (this doesn't work):**
```markdown
After writing tests, invoke the coverage skill:

Skill(stacks-skills:coverage-enforcer)
```

**Right:**
```markdown
After writing tests, recommend running coverage validation:

"Your tests are written. Now run `/stacks-skills:coverage-enforcer` to validate coverage thresholds."
```

### 5. Path Traversal Outside Plugin

**Wrong:**
```json
{
  "skills": "../shared-utils/skills/"  // ❌ Won't work after plugin caching
}
```

**Right:**
```
stacks-skills/
├── .claude-plugin/
│   └── plugin.json
├── skills/
└── shared-utils/      # ✅ Include inside plugin
    └── helpers.sh
```

Or use symlinks:
```bash
ln -s /path/to/shared-utils ./shared-utils  # ✅ Followed during cache copy
```

### 6. Assuming Scripts Are Executable

**Wrong:**
```bash
#!/bin/bash
# No explicit executable check
curl -X POST https://api.example.com/deploy
```

**Right:**
```bash
#!/bin/bash

# Check for required dependencies
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed." >&2
    echo "Install with: apt-get install curl (Ubuntu) or brew install curl (Mac)" >&2
    exit 1
fi

curl -X POST https://api.example.com/deploy
```

### 7. Using Legacy Command Format for New Skills

**Wrong (legacy format):**
```
commands/
└── skill-name.md     # ❌ Old format, lacks supporting files
```

**Right (Agent Skills format):**
```
skills/
└── skill-name/
    ├── SKILL.md      # ✅ Modern format
    ├── references/   # ✅ Can include supporting files
    └── scripts/
```

## Token Budget Considerations

Understanding token usage helps optimize skill design:

| Phase | Token Cost | What Loads |
|-------|------------|------------|
| Startup | ~100 per skill | Metadata only (`name` + `description`) |
| Activation | <5000 (recommended) | Full `SKILL.md` content |
| Reference | Variable | Individual reference files on-demand |

**Optimization strategies:**

1. **Keep SKILL.md concise** (<500 lines)
   - Core instructions only
   - Reference detailed docs in separate files

2. **Use progressive disclosure**
   - Don't load everything upfront
   - "For X details, see [reference.md](references/reference.md)"

3. **Single-purpose skills**
   - Better to have 5 focused skills (5 × 100 = 500 tokens at startup)
   - Than 1 mega-skill (5000 tokens always loaded)

4. **Smart orchestration**
   - Orchestrator activates phase-specific skills
   - Only relevant skills load into context

**For this plugin:**
- 5 skills × ~100 tokens = ~500 tokens at startup (metadata only)
- When user invokes orchestrator → ~3000 tokens (orchestrator SKILL.md)
- When orchestrator delegates to TDD skill → ~4000 tokens (TDD SKILL.md)
- Total active context: ~7000 tokens for two skills
- Other 3 skills remain dormant (only metadata loaded)

**Anti-pattern:** Loading all reference docs into single SKILL.md
- Would be ~20k+ tokens always active
- Violates progressive disclosure
- Hurts Claude's ability to focus

## Version Management

Follow semantic versioning in `plugin.json`:

```json
{
  "version": "MAJOR.MINOR.PATCH"
}
```

**Version semantics:**
- **MAJOR**: Breaking changes (incompatible skill name changes, removed features)
- **MINOR**: New features (new skills, backward-compatible enhancements)
- **PATCH**: Bug fixes (typos, script fixes, doc improvements)

**Release checklist:**
1. Update version in `plugin.json`
2. Document changes in `CHANGELOG.md`
3. Test with `--plugin-dir` locally
4. Tag release in git: `git tag v1.0.0`
5. Update marketplace entry if applicable
6. Users run `claude plugin update stacks-skills`

**Best practices:**
- Start at `0.1.0` for initial development
- Move to `1.0.0` when API is stable
- Use pre-release tags for testing: `2.0.0-beta.1`

## Debugging & Development Tools

### Built-in Commands

| Command | Purpose |
|---------|---------|
| `claude --debug` | Show plugin loading details, errors |
| `/plugin` | Interactive plugin manager (list, install, validate) |
| `/plugin validate` | Validate plugin structure |
| `/agents` | View/edit subagents (if using agents/) |
| `--plugin-dir ./path` | Load plugin from local directory |

### External Validators

```bash
# Validate Agent Skills format
skills-ref validate ./skills/skill-name

# Validate JSON syntax
jq . .claude-plugin/plugin.json
```

### Common Debug Scenarios

**Plugin not loading:**
```bash
# Check debug output
claude --debug --plugin-dir ./stacks-skills

# Look for:
# - "loading plugin" messages
# - JSON parse errors in plugin.json
# - Permission errors
# - Path resolution issues
```

**Skill not appearing:**
```bash
# Verify structure
ls -la stacks-skills/skills/skill-name/SKILL.md

# Check name matches directory
head -5 stacks-skills/skills/skill-name/SKILL.md
# Should show: name: skill-name

# Test invocation
/stacks-skills:skill-name
```

**Hook not firing:**
```bash
# Verify executable bit
chmod +x stacks-skills/scripts/hook-script.sh

# Test script manually
./stacks-skills/scripts/hook-script.sh

# Check hook matcher syntax
cat hooks/hooks.json
```

## Quality Assurance

### Pre-Distribution Checklist

- [ ] All SKILL.md files have valid frontmatter (validate with skills-ref)
- [ ] Plugin.json is valid JSON with required `name` field
- [ ] Directory structure: components at root, only plugin.json in .claude-plugin/
- [ ] All paths are relative and start with `./`
- [ ] Scripts use `${CLAUDE_PLUGIN_ROOT}` for absolute paths
- [ ] Scripts are executable (`chmod +x`)
- [ ] Scripts check for dependencies with clear error messages
- [ ] README.md documents installation and usage
- [ ] CHANGELOG.md tracks version history
- [ ] License file included
- [ ] Tested with `--plugin-dir` flag
- [ ] Version follows semantic versioning
- [ ] No hardcoded absolute paths
- [ ] No path traversal outside plugin root

### Testing Strategy

**Unit testing (per skill):**
```bash
# Test skill in isolation
claude --plugin-dir ./stacks-skills

# In session:
/stacks-skills:skill-name [test-arguments]

# Verify:
# - Skill activates correctly
# - Instructions are clear
# - Referenced files load
# - Scripts execute successfully
```

**Integration testing (multi-skill workflow):**
```bash
# Test orchestrator coordinating skills
claude --plugin-dir ./stacks-skills

# In session:
/stacks-skills:stacks-orchestrator
# Follow suggested workflow through multiple skills
```

**Cross-platform testing:**
- Test on macOS, Linux, Windows (if targeting multiple platforms)
- Verify script compatibility (bash scripts need shebang lines)
- Check path separators and executability

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| File formats | HIGH | Official docs + Agent Skills spec |
| Directory structure | HIGH | Official docs + validation tools |
| SKILL.md schema | HIGH | Agent Skills spec + Claude Code extensions |
| Plugin.json schema | HIGH | Official plugin reference docs |
| Distribution mechanisms | HIGH | Official marketplace and CLI docs |
| Orchestrator patterns | MEDIUM | Inferred from multi-skill docs, community examples |
| Token optimization | MEDIUM | Progressive disclosure principle documented, specific numbers not authoritative |
| Cross-platform compatibility | MEDIUM | Bash scripts common but Windows support varies |

## Sources

### Official Documentation (HIGH confidence)
- [Claude Code Skills](https://code.claude.com/docs/en/skills) - Skill creation, configuration, features
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins) - Plugin structure, distribution
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) - Custom subagent configuration
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference) - Complete technical specifications
- [Agent Skills Specification](https://agentskills.io/specification) - Open standard format
- [Agent Skills Overview](https://agentskills.io) - Standard background and adoption

### Community Resources (MEDIUM confidence)
- [Anthropics Skills Repository](https://github.com/anthropics/skills) - Official example skills
- [Agent Skills GitHub](https://github.com/agentskills/agentskills) - Open standard repository
- [Claude Code Plugins Plus Skills](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) - Community examples
- [Awesome Claude Skills](https://github.com/VoltAgent/awesome-claude-skills) - Curated list

### Search Results (LOW confidence - used for validation only)
- [Optimizing Claude Code Blog Post](https://mays.co/optimizing-claude-code) - Best practices discussion
- [How We Use Claude Code Skills](https://huggingface.co/blog/sionic-ai/claude-code-skills-training) - Real-world usage patterns

## Next Steps

For roadmap creation, this stack research implies:

1. **Phase structure should match skill boundaries**
   - Each major skill (TDD, coverage, fuzz, frontend) = potential phase
   - Orchestrator ties them together

2. **Early phases focus on plugin structure**
   - Set up plugin.json and directory structure first
   - Validates build system before writing skills

3. **Mid phases develop individual skills**
   - One skill per phase for focused development
   - Test each skill independently

4. **Late phases integrate and orchestrate**
   - Build orchestrator skill last (requires other skills to exist)
   - Add hooks, MCP servers if needed
   - Polish distribution (README, CHANGELOG, marketplace entry)

5. **Likely research flags:**
   - Clarinet SDK integration (Phase: TDD skill)
   - Rendezvous fuzz testing (Phase: Fuzz skill)
   - Stacks.js frontend integration (Phase: Frontend skill)
   - Each will need domain-specific research
