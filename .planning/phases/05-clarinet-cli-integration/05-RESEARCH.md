# Phase 5: Clarinet CLI Integration - Research

**Researched:** 2026-01-29
**Domain:** Clarinet CLI workflow automation and orchestration
**Confidence:** HIGH

## Summary

Clarinet is the official Stacks blockchain development toolkit providing CLI commands for project setup, validation, testing, local development, and deployment. This phase focuses on how the skill orchestrates these CLI commands to guide users through the full development lifecycle—NOT on Clarinet's internal implementation.

Research reveals that effective CLI integration requires four distinct capabilities:
1. **Command automation** with smart defaults and destructive action guards
2. **Error interpretation** that translates technical output into actionable guidance
3. **Devnet lifecycle management** ensuring proper setup before frontend/deployment phases
4. **Deployment safety** with network-specific confirmation gates

The context decisions already specify the approach (auto-execute most commands, confirm destructive ones, auto-fix simple errors up to 3 attempts). This research identifies technical patterns for implementing those decisions.

**Primary recommendation:** Build CLI orchestration layer that executes commands automatically, interprets errors intelligently, and provides graduated safety gates based on network (devnet = auto, testnet/mainnet = confirm + verify).

## Standard Stack

### Core CLI Commands

Clarinet provides a comprehensive CLI for the full development workflow:

| Command | Purpose | Auto-Execute? | Output Handling |
|---------|---------|---------------|-----------------|
| `clarinet new <name>` | Initialize project structure | Yes (with check for existing Clarinet.toml) | Confirm creation, show directory structure |
| `clarinet contract new <name>` | Add contract and test scaffold | Yes | Confirm files created |
| `clarinet check [file]` | Syntax and type validation | Yes (automatic after edits) | Parse errors, suggest fixes |
| `clarinet console` | Interactive REPL environment | Guide only | Provide example commands |
| `clarinet test` | Run unit tests | Yes | Parse failures, show summary |
| `clarinet test --coverage` | Test coverage analysis | Yes | Parse coverage %, enforce 90% gate |
| `clarinet devnet start` | Launch local blockchain | Guide (suggest dedicated terminal) | Check Docker, verify startup |
| `clarinet devnet stop` | Shutdown devnet | Remind at session end | Confirm shutdown |
| `clarinet deployments generate --<network>` | Create deployment plan | Yes | Show plan location |
| `clarinet deployments apply --<network>` | Execute deployment | Devnet: auto, Others: confirm | Verify contract on-chain (non-devnet) |

**Installation detection:**
```bash
# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "Clarinet CLI not found. Install via:"
    echo "  macOS: brew install clarinet"
    echo "  Linux: Download from https://github.com/hirosystems/clarinet/releases"
fi

# Verify version
clarinet --version
```

**Source:** [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference), [Installing Clarinet](https://book.clarity-lang.org/ch01-01-installing-tools.html)

### Supporting Technologies

| Tool | Purpose | Integration Point |
|------|---------|-------------------|
| Docker | Required for `clarinet devnet` | Health check before devnet commands |
| Git | Version control | Optional (skill assumes project in git) |
| Node.js/npm | Test execution environment | Installed with Clarinet SDK |

**Docker requirement:**
```bash
# Check Docker status before devnet operations
if ! docker info &> /dev/null; then
    echo "Docker is required for clarinet devnet but not running."
    echo "Start Docker Desktop and try again."
    exit 1
fi
```

**Source:** [Run a local devnet](https://docs.hiro.so/stacks/clarinet/guides/run-a-local-devnet), [GitHub Issues #159](https://github.com/hirosystems/clarinet/issues/159)

### Configuration Files

| File | Location | Purpose | When Modified |
|------|----------|---------|---------------|
| `Clarinet.toml` | Project root | Project config, contract registry | Project setup, adding contracts |
| `settings/Devnet.toml` | Project settings | Devnet accounts, balances | Devnet customization |
| `settings/Testnet.toml` | Project settings | Testnet deployment config, mnemonic | Testnet deployment |
| `settings/Mainnet.toml` | Project settings | Mainnet deployment config, mnemonic | Mainnet deployment |
| `deployments/*.yaml` | Project deployments | Generated deployment plans | Before deployment |

**Clarinet.toml structure:**
```toml
[project]
name = "my-project"
requirements = []  # External contract dependencies

[contracts.my-contract]
path = "contracts/my-contract.clar"
clarity_version = 2  # or 3 for Nakamoto epoch

# Analysis passes (optional)
# analysis = ["check_checker"]  # or ["all"]
```

**Source:** [Creating A New Project](https://book.clarity-lang.org/ch07-01-creating-a-new-project.html), [Clarinet.toml example](https://gitlab.com/riot.ai/clarity-boom-pool/-/blob/master/Clarinet.toml)

## Architecture Patterns

### Pattern 1: Command Execution Wrapper

**What:** Unified execution layer that runs Clarinet commands, captures output, and handles errors consistently.

**When to use:** For all automated Clarinet command invocation.

**Example:**
```typescript
async function runClarinetCommand(
  command: string,
  options: {
    cwd?: string;
    autoRetry?: boolean;
    confirmDestruct?: boolean;
  }
): Promise<{ success: boolean; output: string; error?: string }> {
  // Check for destructive operations
  if (options.confirmDestruct && isDestructive(command)) {
    const confirmed = await getUserConfirmation(command);
    if (!confirmed) return { success: false, output: '', error: 'Cancelled by user' };
  }

  // Execute command
  const result = await exec(`clarinet ${command}`, { cwd: options.cwd });

  // Parse output and errors
  if (result.exitCode !== 0 && options.autoRetry) {
    return await retryWithFix(command, result.stderr);
  }

  return {
    success: result.exitCode === 0,
    output: result.stdout,
    error: result.stderr
  };
}
```

**Implementation notes:**
- Use Bash tool for actual command execution
- Capture both stdout and stderr
- Parse exit codes (0 = success)
- Return structured result for downstream processing

**Source:** Inferred from CLI reference and best practices

### Pattern 2: Error Parser & Auto-Fix

**What:** Parse `clarinet check` output to extract error type, location, and message, then suggest or auto-apply fixes.

**When to use:** After every contract modification when `clarinet check` fails.

**Example error types:**

```typescript
interface ClarinetError {
  type: 'syntax' | 'type' | 'analysis' | 'unknown';
  file: string;
  line?: number;
  column?: number;
  message: string;
  autoFixable: boolean;
  suggestion?: string;
}

// Common auto-fixable patterns
const autoFixPatterns = [
  {
    // Unnecessary begin block
    pattern: /begin block with single expression/,
    fix: 'Remove unnecessary begin wrapper',
    autoApply: true
  },
  {
    // unwrap-panic usage
    pattern: /unwrap-panic used/,
    fix: 'Replace with unwrap! and explicit error code',
    autoApply: false  // Requires error code selection
  },
  {
    // Type mismatch
    pattern: /expecting.*found.*/,
    fix: 'Type mismatch - review function signature',
    autoApply: false
  }
];
```

**Example error output:**
```
Error: Analysis error: expecting expression of type 'response', found 'uint'
  at contracts/counter.clar:15:5
```

**Parsed result:**
```typescript
{
  type: 'type',
  file: 'contracts/counter.clar',
  line: 15,
  column: 5,
  message: "expecting expression of type 'response', found 'uint'",
  autoFixable: false,
  suggestion: "Wrap uint in (ok uint-value) to return response type"
}
```

**Source:** [Common Clarity Errors](https://loneshadow.medium.com/common-clarity-errors-cf6906815521), [GitHub Issue #259](https://github.com/hirosystems/clarinet/issues/259)

### Pattern 3: Devnet Lifecycle Management

**What:** Coordinate devnet startup, health checking, and graceful shutdown.

**When to use:** Before frontend integration or manual deployment testing.

**Workflow:**
```
1. Check Docker status
   ├─ Docker running? → Continue
   └─ Docker not running → Error with install/start instructions

2. Suggest dedicated terminal
   "Run in separate terminal: clarinet devnet start"
   "This keeps logs visible for debugging."

3. Wait for user to start devnet

4. Verify devnet health
   ├─ Check Stacks node responding (curl localhost:20443/v2/info)
   ├─ Verify contracts deployed
   └─ Confirm ready for integration

5. Session end reminder
   "Remember to stop devnet: clarinet devnet stop"
```

**Health check example:**
```bash
# Check if devnet is responding
curl -s http://localhost:20443/v2/info | jq -r '.stacks_tip_height'

# Should return a block height (numeric value)
# If curl fails or returns error, devnet not ready
```

**Why not run in background?**
- User loses access to devnet logs (critical for debugging)
- Process management complexity (cleanup on crashes)
- Context decisions specify dedicated terminal approach

**Source:** [Run a local devnet](https://docs.hiro.so/stacks/clarinet/guides/run-a-local-devnet), [Devnet troubleshooting](https://docs.hiro.so/clarinet/troubleshooting), Context decisions

### Pattern 4: Tiered Deployment Safety

**What:** Network-specific safety gates with increasing verification for production environments.

**When to use:** For all deployment operations.

**Tiered approach:**

| Network | Confirmation Required? | Dry-Run/Simulation? | On-Chain Verification? | Mnemonic Encryption? |
|---------|------------------------|---------------------|------------------------|----------------------|
| Devnet | No (auto-deploy) | No | No (trust output) | No (test accounts) |
| Testnet | Yes | Yes (show plan first) | Yes (verify contract exists) | Recommended |
| Mainnet | Yes (explicit) | Yes (show plan + costs) | Yes (verify contract exists) | Required |

**Workflow for testnet/mainnet:**
```
1. Generate deployment plan
   clarinet deployments generate --testnet --medium-cost

2. Show plan to user
   - Contract names
   - Estimated fees
   - Network endpoints
   - Deployer address

3. Request explicit confirmation
   "Deploy to testnet? Costs ~X STX. Type 'yes' to confirm."

4. Apply deployment
   clarinet deployments apply --testnet

5. Verify on-chain
   - Query contract existence via Stacks API
   - Confirm contract code hash matches
   - Show explorer link

6. Update project state
   - Mark contract as deployed
   - Save deployment transaction ID
```

**Mnemonic security:**
```bash
# Encrypt sensitive deployment keys
clarinet deployments encrypt

# Prompts for password, stores encrypted mnemonic
# User enters password when running apply
```

**Source:** [Contract Deployment](https://docs.stacks.co/clarinet/contract-deployment), [Deployment Plans Guide](https://docs.hiro.so/clarinet/how-to-guides/how-to-use-deployment-plans), Context decisions

### Pattern 5: Console Command Guidance

**What:** Provide example console commands for interactive testing without executing them.

**When to use:** When user wants to manually test contract functions interactively.

**Example guidance:**
```
To test your contract interactively:

1. Start console:
   clarinet console

2. Call public functions:
   (contract-call? .my-contract increment)
   (contract-call? .my-contract get-count)

3. Inspect state:
   (var-get count)
   (map-get? balances tx-sender)

4. Switch tx-sender:
   ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK

5. Mint test STX:
   ::mint_stx ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK 1000000

6. Exit console:
   Ctrl+D or Ctrl+C twice
```

**Why not auto-execute console commands?**
- Console is interactive REPL (can't batch commands easily)
- User needs to see state changes in real-time
- Trial-and-error workflow benefits from direct interaction

**Available console commands:**
- `::help` - Show all console commands
- `::set_tx_sender <principal>` - Change transaction sender
- `::mint_stx <principal> <amount>` - Add test STX to account
- `::trace` - Enable execution tracing
- `::debug` - Debug mode for step-through

**Source:** [Interacting With Your Contract](https://book.clarity-lang.org/ch07-03-interacting-with-your-contract.html), [CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command execution | Custom shell wrapper | Bash tool directly | Bash tool handles working directory, output capture, error codes |
| Error parsing | Regex extraction from raw output | Structured parsing with fallback to raw output | Error formats may change across versions |
| Deployment plan generation | Manual YAML construction | `clarinet deployments generate` | Handles network-specific configs, cost estimation, proper YAML structure |
| On-chain verification | Custom Stacks API queries | Stacks API libraries or curl to known endpoints | API stability and schema changes |
| Mnemonic management | Custom encryption | `clarinet deployments encrypt` | Proper security, key derivation, tested implementation |

**Key insight:** Clarinet already provides rich CLI commands for all operations. The skill's job is orchestration and interpretation, not reimplementation. Focus on capturing output, parsing errors intelligently, and guiding the user through the workflow.

## Common Pitfalls

### Pitfall 1: Assuming Clarinet is Installed

**What goes wrong:** Skill attempts to run `clarinet` commands without verifying CLI is installed, leading to cryptic "command not found" errors.

**Why it happens:** Development environments vary; Clarinet is not universally installed.

**How to avoid:**
```bash
# Check before first use in session
if ! command -v clarinet &> /dev/null; then
    cat << 'EOF'
Clarinet CLI not found. Install it:

macOS:
  brew install clarinet

Linux:
  # Download from releases page
  curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-linux-x64.tar.gz | tar xz
  sudo mv clarinet /usr/local/bin/

Windows:
  # Download MSI installer from releases page
  # Or use: winget install clarinet

Verify: clarinet --version
EOF
    exit 1
fi
```

**Warning signs:**
- First command attempt returns "command not found"
- User mentions "I just cloned this project"

**Source:** [Installing Clarinet](https://book.clarity-lang.org/ch01-01-installing-tools.html)

### Pitfall 2: Forgetting Docker for Devnet

**What goes wrong:** `clarinet devnet start` fails with "Unable to start Devnet: make sure that Docker is installed on this machine and running."

**Why it happens:** Docker Desktop must be running before devnet commands work. Easy to forget, especially after system restarts.

**How to avoid:**
```bash
# Health check before devnet operations
function checkDocker() {
  if ! docker info &> /dev/null; then
    echo "Docker is required for clarinet devnet but is not running."
    echo ""
    echo "Install Docker Desktop:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Linux: https://docs.docker.com/desktop/install/linux-install/"
    echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo ""
    echo "Then start Docker Desktop and try again."
    return 1
  fi
  return 0
}

# Call before devnet commands
checkDocker || exit 1
clarinet devnet start
```

**Warning signs:**
- Error message mentions Docker
- User on fresh machine or after reboot

**Source:** [GitHub Issue #159](https://github.com/hirosystems/clarinet/issues/159), [Devnet troubleshooting](https://docs.hiro.so/clarinet/troubleshooting)

### Pitfall 3: Overwriting Clarinet.toml Without Warning

**What goes wrong:** Running `clarinet new <name>` in existing project directory overwrites configuration, losing contract registrations and settings.

**Why it happens:** User (or skill) attempts project initialization without checking for existing project.

**How to avoid:**
```bash
# Before running clarinet new
if [ -f "Clarinet.toml" ]; then
    echo "Warning: Clarinet.toml already exists in this directory."
    echo "Running 'clarinet new' will overwrite your existing project."
    echo ""
    echo "Options:"
    echo "1. Cancel and use existing project"
    echo "2. Add contracts with: clarinet contract new <name>"
    echo "3. Create new project in different directory"
    echo ""
    read -p "Proceed with overwrite? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi
fi

clarinet new "$PROJECT_NAME"
```

**Warning signs:**
- User asks to initialize project in directory with .clar files
- Context shows previous work on contracts

**Source:** Context decisions, best practices

### Pitfall 4: Not Running clarinet check After Edits

**What goes wrong:** User implements contract changes, runs tests, and gets cryptic failures because syntax/type errors weren't caught first.

**Why it happens:** Tests can fail for two reasons: (1) contract has syntax errors, (2) logic doesn't match expectations. Skipping `clarinet check` means mixing these failure modes.

**How to avoid:**
```bash
# Automatic check after every contract edit
function afterContractEdit() {
  local contract_file="$1"

  echo "Validating syntax..."
  if ! clarinet check "$contract_file"; then
    echo ""
    echo "Syntax or type errors found. Fix these before running tests."
    parseAndExplainErrors  # Custom function to interpret errors
    return 1
  fi

  echo "✓ Syntax valid. Ready to test."
  return 0
}

# Call after Edit tool modifies .clar file
afterContractEdit "contracts/my-contract.clar"
```

**Warning signs:**
- Test failures with parse errors in output
- User confused by test framework error vs contract error

**Source:** Context decisions (auto-run check after edits), development best practices

### Pitfall 5: Infinite Auto-Fix Loop

**What goes wrong:** Skill detects error, attempts fix, error persists, attempts again, repeats indefinitely.

**Why it happens:** Error is complex and requires human judgment, but skill keeps trying automated fixes.

**How to avoid:**
```typescript
const MAX_FIX_ATTEMPTS = 3;

async function attemptAutoFix(error: ClarinetError, attemptNumber = 1): Promise<boolean> {
  if (attemptNumber > MAX_FIX_ATTEMPTS) {
    // Stop trying, explain to user
    console.log(`\nAuto-fix failed after ${MAX_FIX_ATTEMPTS} attempts.`);
    console.log(`Error: ${error.message}`);
    console.log(`\nThis error requires manual intervention. ${error.suggestion || ''}`);
    return false;
  }

  // Try to fix
  const fixed = await applyFix(error);

  // Verify fix worked
  const recheckResult = await runClarinetCheck();

  if (recheckResult.success) {
    console.log(`✓ Auto-fix successful on attempt ${attemptNumber}`);
    return true;
  }

  // Fix didn't work, try again or give up
  if (error.autoFixable && attemptNumber < MAX_FIX_ATTEMPTS) {
    return attemptAutoFix(error, attemptNumber + 1);
  }

  return false;
}
```

**Warning signs:**
- Same error appears multiple times in sequence
- Skill makes same modification repeatedly

**Source:** Context decisions (limit 3 attempts)

### Pitfall 6: Trusting Devnet Without Health Check

**What goes wrong:** Skill proceeds to frontend integration assuming devnet is ready, but devnet is still starting up or failed to start properly.

**Why it happens:** `clarinet devnet start` returns immediately, but actual blockchain startup takes time.

**How to avoid:**
```bash
# Wait for devnet to be ready
function waitForDevnet() {
  local max_attempts=30
  local attempt=0

  echo "Waiting for devnet to start..."

  while [ $attempt -lt $max_attempts ]; do
    # Check if Stacks node is responding
    if curl -s http://localhost:20443/v2/info &> /dev/null; then
      echo "✓ Devnet ready"
      return 0
    fi

    attempt=$((attempt + 1))
    echo "  Still starting... ($attempt/$max_attempts)"
    sleep 2
  done

  echo "✗ Devnet failed to start after ${max_attempts} attempts"
  echo "Check Docker logs: docker logs clarinet-stacks-node-1"
  return 1
}

# After user starts devnet
waitForDevnet || exit 1
```

**Warning signs:**
- Frontend integration fails with "connection refused"
- User reports devnet started but nothing works

**Source:** [Devnet troubleshooting](https://docs.hiro.so/clarinet/troubleshooting), development experience

### Pitfall 7: Deploying Without Balance Check

**What goes wrong:** Deployment to testnet/mainnet fails because deployer account lacks sufficient STX for transaction fees.

**Why it happens:** User hasn't requested testnet faucet tokens or mainnet account isn't funded.

**How to avoid:**
```bash
# Before testnet deployment
function checkBalance() {
  local network="$1"
  local deployer_address="$2"

  # Query balance via Stacks API
  local balance=$(curl -s "https://api.${network}.hiro.so/v2/accounts/${deployer_address}" | jq -r '.balance')

  if [ "$balance" == "null" ] || [ -z "$balance" ]; then
    echo "Cannot verify deployer balance. Proceeding with caution..."
    return 0
  fi

  # Convert from microSTX to STX
  local stx_balance=$(echo "scale=6; $balance / 1000000" | bc)

  echo "Deployer balance: ${stx_balance} STX"

  if (( $(echo "$stx_balance < 1" | bc -l) )); then
    echo ""
    echo "Warning: Low balance. Deployment may fail."
    echo "Request testnet tokens: https://explorer.hiro.so/sandbox/faucet"
    read -p "Continue anyway? (yes/no): " confirm
    [ "$confirm" = "yes" ] || return 1
  fi

  return 0
}

checkBalance "testnet" "$DEPLOYER_ADDRESS"
```

**Warning signs:**
- Deployment fails with "insufficient funds"
- User hasn't mentioned faucet/funding

**Source:** [Contract Deployment](https://docs.stacks.co/clarinet/contract-deployment), development best practices

## Code Examples

Verified patterns from official sources:

### Creating New Project

```bash
# Source: https://book.clarity-lang.org/ch07-01-creating-a-new-project.html

# Initialize new Clarinet project
clarinet new my-stacks-project
cd my-stacks-project

# Directory structure created:
# my-stacks-project/
#   Clarinet.toml        # Project configuration
#   contracts/           # Clarity contracts
#   tests/               # Test files
#   settings/            # Network configurations
#     Devnet.toml
#     Testnet.toml
#     Mainnet.toml
```

### Adding Contract to Project

```bash
# Source: https://book.clarity-lang.org/ch07-01-creating-a-new-project.html

# Add new contract
clarinet contract new counter

# Creates:
# - contracts/counter.clar
# - tests/counter.test.ts
# Updates Clarinet.toml with contract registration
```

### Validating Contract Syntax

```bash
# Source: https://docs.stacks.co/reference/clarinet/cli-reference

# Check all contracts in project
clarinet check

# Check specific contract
clarinet check contracts/counter.clar

# Output on success:
# ✔ Syntax of 1 contract(s) successfully checked

# Output on error:
# Error: Analysis error: expecting expression of type 'response', found 'uint'
#   at contracts/counter.clar:15:5
```

### Running Tests with Coverage

```bash
# Source: https://docs.stacks.co/reference/clarinet/cli-reference

# Run all tests
clarinet test

# Run with coverage analysis
clarinet test --coverage

# Output includes coverage percentage per contract
# Example:
# counter.clar    | 95.2%   | 20/21 lines covered
```

### Enabling Check-Checker Analysis

```toml
# Source: https://www.hiro.so/blog/new-safety-checks-in-clarinet
# Add to Clarinet.toml

[project]
name = "my-project"
analysis = ["check_checker"]  # Enable specific analysis
# or
analysis = ["all"]  # Enable all current and future analyses
```

```bash
# Run analysis
clarinet check

# Output shows additional warnings:
# WARNING: USE OF POTENTIALLY UNCHECKED DATA
# (contract-call? .token transfer amount tx-sender recipient)
# NOTE: SOURCE OF UNTRUSTED INPUT HERE
# (define-public (transfer-tokens (amount uint) (recipient principal)) ...)
```

### Interactive Console Usage

```bash
# Source: https://book.clarity-lang.org/ch07-03-interacting-with-your-contract.html

# Start console
clarinet console

# Console displays available wallets and contracts
# Then accepts Clarity expressions:

# Call contract function
>> (contract-call? .counter increment)
(ok u1)

# Query read-only function
>> (contract-call? .counter get-count)
(ok u1)

# Change tx-sender for next call
>> ::set_tx_sender ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK

# Mint test STX to account
>> ::mint_stx ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK 1000000

# Exit console
>> Ctrl+D
```

### Deployment Workflow

```bash
# Source: https://docs.stacks.co/clarinet/contract-deployment

# 1. Generate deployment plan for testnet
clarinet deployments generate --testnet --medium-cost

# Creates: deployments/default.testnet-plan.yaml

# 2. (Optional) Encrypt mnemonic for security
clarinet deployments encrypt
# Prompts for password, updates settings/Testnet.toml with encrypted_mnemonic

# 3. Review deployment plan
cat deployments/default.testnet-plan.yaml

# Example plan structure:
# ---
# id: 0
# name: Deploy counter
# network: testnet
# stacks-node: https://api.testnet.hiro.so
# bitcoin-node: http://bitcoin.testnet:18332
# plan:
#   batches:
#     - id: 0
#       transactions:
#         - contract-publish:
#             contract-name: counter
#             source: contracts/counter.clar
#             sender: deployer

# 4. Apply deployment
clarinet deployments apply --testnet
# Prompts for password if mnemonic is encrypted
# Broadcasts transactions to network
# Outputs transaction IDs

# 5. Verify deployment
# Query contract via Stacks API
curl https://api.testnet.hiro.so/v2/contracts/interface/ST1234.../counter
```

### Devnet Health Check

```bash
# Source: Inferred from devnet troubleshooting docs

# Check if Docker is running
docker info &> /dev/null || echo "Docker not running"

# Start devnet (in separate terminal)
clarinet devnet start

# Health check: Query Stacks node info
curl -s http://localhost:20443/v2/info | jq '{
  network: .network_id,
  height: .stacks_tip_height,
  ready: (if .stacks_tip_height > 0 then true else false end)
}'

# Expected output when ready:
# {
#   "network": "devnet",
#   "height": 42,
#   "ready": true
# }

# Stop devnet when done
clarinet devnet stop
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual TOML editing to add contracts | `clarinet contract new` auto-updates Clarinet.toml | Clarinet v0.x | Reduces config errors |
| No deployment plan concept | YAML-based deployment plans with cost estimation | Clarinet ~v0.14 | Safer testnet/mainnet deployments |
| Unencrypted mnemonics in settings | `clarinet deployments encrypt` for mnemonic encryption | Clarinet v3.11+ | Improved security |
| Manual safety checks | `check_checker` analysis pass for unchecked data flows | Clarinet v0.21.2 | Catches security vulnerabilities |
| Epoch 2.x default | Epoch 3.0 (Nakamoto) default with Clarity 3 | Clarinet v2.11.0 | Must specify `clarity_version` in Clarinet.toml |
| `clarity-repl` standalone tool | Integrated into `clarinet console` | Clarinet v1.x | Unified developer experience |

**Deprecated/outdated:**
- **Standalone clarity-repl**: Now integrated into `clarinet console` command
- **Manual balance checking before deployment**: Should be automated in skill workflow
- **Unencrypted testnet/mainnet mnemonics**: Security risk; always use `clarinet deployments encrypt`

**Source:** [Clarinet Releases](https://github.com/hirosystems/clarinet/releases), [New Safety Checks](https://www.hiro.so/blog/new-safety-checks-in-clarinet), [Updates for Clarinet](https://docs.hiro.so/stacks/nakamoto/guides/clarinet)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact error message formats across Clarinet versions**
   - What we know: Error format includes file:line:column and message
   - What's unclear: Whether format is stable across versions, if structured output mode exists
   - Recommendation: Parse conservatively with fallback to raw output display

2. **Devnet startup time variability**
   - What we know: Devnet takes time to start, requires Docker
   - What's unclear: Typical startup time, what factors affect it (machine specs, Docker config)
   - Recommendation: Use health check polling with generous timeout (30 attempts × 2s = 60s max)

3. **Console command completeness**
   - What we know: Basic console commands (::set_tx_sender, ::mint_stx, ::help)
   - What's unclear: Full list of available :: commands, documentation completeness
   - Recommendation: Reference ::help output, provide common patterns but not exhaustive list

4. **Network switching edge cases**
   - What we know: User can switch from testnet to mainnet
   - What's unclear: How to detect accidental switches, whether to block certain transitions
   - Recommendation: Always confirm network when user mentions testnet/mainnet, show current network in prompts

## Sources

### Primary (HIGH confidence)

- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference) - Complete command documentation
- [Installing Clarinet](https://book.clarity-lang.org/ch01-01-installing-tools.html) - Installation methods
- [Creating A New Project](https://book.clarity-lang.org/ch07-01-creating-a-new-project.html) - Project structure
- [Interacting With Your Contract](https://book.clarity-lang.org/ch07-03-interacting-with-your-contract.html) - Console usage
- [Contract Deployment](https://docs.stacks.co/clarinet/contract-deployment) - Deployment workflow
- [New Safety Checks in Clarinet](https://www.hiro.so/blog/new-safety-checks-in-clarinet) - Check-checker analysis
- [Clarinet GitHub](https://github.com/hirosystems/clarinet) - Source repository

### Secondary (MEDIUM confidence)

- [Run a local devnet](https://docs.hiro.so/stacks/clarinet/guides/run-a-local-devnet) - Devnet setup (redirects encountered)
- [Guide to Deploying a Stacks Contract](https://cuddleofdeath.hashnode.dev/guide-to-deploying-a-stacks-contract-w-clarinet-cli) - Community guide
- [Common Clarity Errors](https://loneshadow.medium.com/common-clarity-errors-cf6906815521) - Error examples
- [Clarity Best Practices](https://www.certik.com/resources/blog/clarity-best-practices-and-checklist) - CertiK checklist
- [Updates for Clarinet](https://docs.hiro.so/stacks/nakamoto/guides/clarinet) - Nakamoto updates

### Tertiary (LOW confidence)

- [GitHub Issues](https://github.com/hirosystems/clarinet/issues) - Community troubleshooting (issue #159, #259)
- Various blog posts and tutorials - Supplementary context

## Metadata

**Confidence breakdown:**
- Standard stack (commands, config files): HIGH - Official CLI reference and Clarity Book
- Architecture patterns (error parsing, safety gates): MEDIUM - Inferred from docs and best practices, not prescriptive official patterns
- Pitfalls: HIGH - Combination of official troubleshooting docs and explicit context decisions
- Code examples: HIGH - Directly from official documentation with source citations

**Research date:** 2026-01-29
**Valid until:** ~90 days (Clarinet is actively developed but CLI commands are stable)

---

*Research complete. Ready for planning phase.*
