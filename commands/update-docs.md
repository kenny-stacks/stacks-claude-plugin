# /stacks:update-docs

Refresh the documentation index (both JSON cache and knowledge file) by fetching the latest from docs.stacks.co/llms.txt.

## When to Use

- When the plugin suggests the documentation index may be stale
- When you notice missing or outdated documentation paths
- Periodically to ensure you have the latest docs structure

## Instructions

### Step 1: Fetch Current llms.txt

Fetch the latest documentation index:

```bash
curl -s "https://docs.stacks.co/llms.txt"
```

Parse the output to extract all documentation paths. The format is:
```
- [Title](/path/to/doc.md)
- [Title](/path/to/doc.md): Description
```

### Step 2: Update JSON Cache

Update the JSON docs index at `.claude/stacks/docs-index.json`:

```bash
mkdir -p .claude/stacks && curl -s "https://docs.stacks.co/llms.txt" | grep -E '^\s*-\s*\[' | grep -v '/zh/\|/es/' | sed 's/.*\[\([^]]*\)\](\([^)]*\)).*/{"title":"\1","path":"\2"}/' | jq -s '{lastUpdated:"'"$(date +%Y-%m-%d)"'",source:"https://docs.stacks.co/llms.txt",docs:.}' > .claude/stacks/docs-index.json
```

If `jq` is not installed, tell the user to install it (`brew install jq`) or create the JSON file manually.

### Step 3: Read Current Knowledge File

Read the current knowledge file to get its structure:

```bash
cat "${CLAUDE_PROJECT_ROOT}/.claude/stacks/knowledge/general-stacks-knowledge.md"
```

If the file doesn't exist at that path, check:
- `${CLAUDE_PLUGIN_ROOT}/general-stacks-knowledge.md` (plugin source)

### Step 4: Update Documentation Index

Replace the "Documentation Index" section (everything after `## Documentation Index`) with the fresh data.

**Important formatting rules:**

1. Update the "Last Updated" date to today's date (YYYY-MM-DD format)

2. Organize paths into these categories:
   - **Build** - `/get-started/*` paths
   - **Clarinet** - `/clarinet/*` paths
   - **Stacks.js** - `/stacks.js/*` paths
   - **Stacks Connect** - `/stacks-connect/*` paths
   - **Post-Conditions** - `/post-conditions/*` paths
   - **Reference** - `/reference/*` paths
   - **Cookbook** - `/cookbook/*` paths
   - **sBTC** - `/more-guides/sbtc/*` and `/learn/sbtc/*` paths
   - **Additional Resources** - Other useful paths

3. Use table format:
   ```markdown
   | Topic | Path |
   |-------|------|
   | Title | /path/to/doc.md |
   ```

4. Keep the "External Resources" section at the end with the static links.

5. Filter out non-English documentation (skip paths containing `/zh/` or `/es/`).

### Step 5: Write Updated File

Write the updated knowledge file back to:
```
${CLAUDE_PROJECT_ROOT}/.claude/stacks/knowledge/general-stacks-knowledge.md
```

### Step 6: Confirm Update

Tell the user:
```
Documentation index updated!

**Last Updated:** {today's date}
**Total Paths:** {count of documentation paths}

Updated:
- .claude/stacks/docs-index.json (JSON index for fast lookups)
- .claude/stacks/knowledge/general-stacks-knowledge.md (embedded index)
```

## Notes

- This updates the PROJECT's knowledge file, not the plugin source
- The plugin source file serves as the initial template
- Users can customize their local knowledge file after init
- Run this periodically or when prompted by the session start hook
