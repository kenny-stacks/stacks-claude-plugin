# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-03

### Added

- **Plugin Structure**: Converted from skill to full Claude Code plugin following the wasp plugin pattern
- **Commands**:
  - `/stacks:init` - Initialize plugin for a project, copy knowledge files, optionally start dev servers
  - `/stacks:help` - Display plugin capabilities and available commands
  - `/stacks:expert-advice` - Expert review of Clarity contracts against best practices
- **Skills**:
  - `start-dev-server` - Start Clarinet devnet and frontend development servers
  - `plugin-help` - Display comprehensive help information
- **Hooks**:
  - SessionStart hook to detect uninitialized Stacks projects and prompt for `/stacks:init`
- **MCP Integration**:
  - Chrome DevTools MCP server for browser console access and frontend debugging
- **Knowledge File**:
  - `general-stacks-knowledge.md` - Consolidated Stacks/Clarity development knowledge
  - Copied to user projects during `/stacks:init`

### Changed

- Restructured from single skill (`skills/stacks-dev/`) to full plugin architecture
- Plugin name changed from `stacks-skills` to `stacks`
- Knowledge content consolidated from multiple reference files into single `general-stacks-knowledge.md`

### Removed

- `skills/stacks-dev/` directory and all contents:
  - `SKILL.md` (5-phase TDD workflow)
  - `references/clarity-design.md`
  - `references/clarity-tdd.md`
  - `references/clarity-implementation.md`
  - `references/clarity-cli.md`
  - `references/clarity-frontend.md`

## [0.1.0] - Initial Release

### Added

- Initial `stacks-dev` skill with 5-phase TDD workflow
- Reference documentation files for Clarity development
- Design, testing, implementation, verification, and frontend phases
