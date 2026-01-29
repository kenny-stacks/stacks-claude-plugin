# Manual Verification Steps

## Testing During Development

Use the `--plugin-dir` flag to load the plugin without installation:

```bash
claude --plugin-dir /Users/kenny/Code/stacks-skills
```

## Verification Checklist

### 1. Plugin Loads Successfully
- Run the command above
- Claude Code should start without errors
- No plugin loading errors in output

### 2. Skill Appears in Help Menu
- In the Claude Code session, type `/help`
- Look for `stacks-skills:stacks-dev` in the skills list

### 3. Direct Skill Invocation
- Type `/stacks-skills:stacks-dev`
- Skill should activate and display Stacks development guidance

### 4. Auto-Activation on Keywords
- Type "I want to build a Clarity contract"
- The stacks-dev skill should auto-load based on description keywords (Stacks, Clarity, Clarinet)

## Loading Multiple Plugins

You can load multiple plugins at once:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

## After Development

When ready to share, distribute through a plugin marketplace. Users can then install via:

```bash
/plugin install <marketplace-url>
```

See [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) for distribution options.
