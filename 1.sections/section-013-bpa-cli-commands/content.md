# Section 013: dap-bpa CLI Command Reference

A practical reference for the `dap-bpa` CLI, organized by workflow. Every command supports `--help`; use `dap-bpa --help` to discover top-level command groups and `dap-bpa <group> --help` to drill into any group.

## How to Use This Reference

- **Angle brackets** `<value>` = required argument you supply
- **Square brackets** `[--flag]` = optional flag
- **Global flags**: `--help`, `--json` (force JSON output), `--fields <a b c>` (limit returned fields), `--trust-all` (bypass SSL verification, dev only), `--orchestrator <name>` or `-o <name>` (select a configured orchestrator profile). `--dry-run` previews without writing on the commands that support it (`knowledge blueprints add`, `knowledge plugins fetch`, `setup-ide`).
- **Strict flag validation** (v0.28.0+): the CLI now parses flags with [commander.js](https://github.com/tj/commander.js). Unknown flags, missing values, and conflicting flags fail fast with exit code `1` and an actionable message, and `--help` output is generated directly from the command registry (so it can never drift from the real surface). Internal errors are mapped to user-facing messages with exit codes; stack traces are suppressed in production.
- **Excess positional arguments rejected** (v0.29.3): extra positionals are no longer silently dropped; the CLI derives each command's allowed positional count from its argsSpec and fails with an actionable error naming the first unexpected token, plus a `--help` hint.
- **Global `--json` accepted before the command** (v0.29.3): `dap-bpa --json blueprint lint ...` now works and produces output identical to the trailing placement.
- **Alias surface restored** (v0.28.1): the v0.28.0 CommandRegistry refactor silently broke several v0.27.0 aliases - `knowledge blueprints scan`, `k p g` (`knowledge plugins get`), and the `knowledge examples add/scan/registry` family among them. v0.28.1 restores every alias to its v0.27.0 target, and `CommandRegistry.register` now throws on a duplicate command name or alias so a collision is a hard startup failure rather than a silent retarget.

## Quick Start: End-to-End Blueprint Workflow

```bash
# 1. Find an example close to what you want
dap-bpa knowledge blueprints find "kubernetes helm"

# 2. Lint and validate locally
dap-bpa blueprint lint --file my-blueprint/blueprint.yaml --verify
dap-bpa blueprint validate-all --file my-blueprint/blueprint.yaml

# 3. Upload to the orchestrator
dap-bpa orchestrator blueprints upload \
  --file my-blueprint.zip --id my-bp --revision 1.0.0

# 4. Create a deployment
dap-bpa orchestrator deployments create \
  --blueprint-id my-bp --inputs inputs.json --display-name "dev-run"

# 5. Run install + track execution
dap-bpa orchestrator executions start --deployment-id <deployment_id> --workflow-id install
dap-bpa orchestrator executions get <execution_id>

# - OR - do steps 3-5 automatically with the Monitor Agent:
dap-bpa monitor --file my-blueprint/blueprint.yaml --inputs '{"key":"val"}'
```

---

## Command Groups

### Authentication & Setup

| Command | Purpose |
| --------- | --------- |
| `dap-bpa setup` | Interactive wizard - orchestrator URL, tenant, LLM credentials (Bedrock / OpenAI) |
| `dap-bpa setup-ide <ide>` | Install dap-bpa skills into a supported IDE. Supported IDEs: devin, claude-code, cursor, jetbrains, vscode, antigravity, cline, codex (`windsurf` replaced by `devin` in v0.31.0; `codex` restored as named target; the `antigravity` target also covers Gemini CLI and Goose). Use `--to <dir>` for custom install path or `--rules-to <dir>` for separate rules destination |
| `dap-bpa verify-skills [--skill <name>] [--report [--ide <id>]]` | Scan installed skills and classify each as dell-provided, customer-modified, unsigned, or invalid-signature; exit 1 on invalid signature (v0.31.0+). `--skill` filters to a specific skill; `--report` generates compliance output |
| `dap-bpa status` | Check current setup status and verify orchestrator connection |
| `dap-bpa upgrade` | Find a downloaded distribution zip (cwd, `~/Downloads`) and install it - no `--file` needed (v0.28.0+) |
| `dap-bpa upgrade --file <zip>` | Replace running binary from an explicit distribution zip; v0.29.3 sweeps stale `.bpa-upgrade-<ts>`, `.bpa-daemon-upgrade-<ts>`, and `.bpa-rollback-<ts>` staging files at startup before copying |
| `dap-bpa upgrade --version <x>` | Install a specific already-downloaded version |
| `dap-bpa upgrade --check` | Check Artifactory for a newer version - exit `0` (up-to-date), `10` (update available), `1` (error), for CI gates (v0.28.0+) |
| `dap-bpa upgrade --rollback` | Restore the previous binary from its timestamped `.bak` backup (v0.28.0+); v0.29.3 sweeps leftover rollback staging files at startup (the sweep never throws) |
| `dap-bpa mcp-server` | Start the Blueprint Assist MCP server locally (v0.27.0+) |
| `dap-bpa mint-token [--verify] [--export\|--json\|--out <file>\|--copy]` | Mint MCP gateway tokens with correct recipe (scope=internal:exchangeable + --audience); `--verify` tests the token against the gateway (v0.31.0+) |

### Blueprint Authoring & Validation

| Command | Purpose |
| --------- | --------- |
| `dap-bpa blueprint lint --file <path>` | Lint a blueprint YAML; also verifies imported files exist (v0.27.0+). Human-readable output is the default; use `--json` or `--output json` for the LSP-shaped JSON payload |
| `dap-bpa blueprint lint --file <path> --verify` | Lint + zero-byte file check |
| `dap-bpa blueprint lint --file <path> --schema` | Validate node templates against plugin schemas from the local knowledge base, aggregating all schema failures in one run |
| `dap-bpa blueprint lint --file <path> --report-fp` | Lint and emit a false-positive report |
| `dap-bpa blueprint lint --content "<yaml>"` | Lint a YAML string directly (no file) |
| `dap-bpa blueprint validate <node> --file <path>` | Validate a specific node template |
| `dap-bpa blueprint validate-all --file <path>` | Validate every node template in the blueprint. Works offline: validation falls back to node-type schemas bundled in the knowledge base, `knowledge plugins add` persists a real registry under `~/.blueprint-assist/plugins/`, and wagon-style layouts (`files/plugin.yaml`) are accepted |
| `dap-bpa blueprint visualize --file <path> [--output <path>] [--diff <path>] [--export <json or yaml>] [--execution-status-url <url>] [--serve [--port <number>]]` | Generate a self-contained interactive HTML visualization of the blueprint (see [Section 21](../section-021-blueprint-visualizer/content.md)). As of v0.28.2 this produces a React-based diagram (install-flow, platform detection, plugins, and a Risk Analysis panel) with React inlined and no CDN requests; `.riskignore` next to the blueprint root suppresses risk findings. Additional options include `--serve` / `--port` for an in-IDE preview server and `--diff`, `--export`, and `--execution-status-url` for comparing, exporting, and live-status overlays. The `--file` path must be within the current working directory |
| `dap-bpa blueprint stamp --file <path> [--check]` | Stamp a blueprint with origin indicator at generation time (v0.31.0+); deterministic stamp-if-absent behavior. `--check` verifies existing stamp without modifying |

### Knowledge: Blueprint Examples

Used during authoring to discover patterns and templates.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge blueprints find "<query>"` | Semantic search for example blueprints |
| `dap-bpa knowledge blueprints find "<query>" --plugin <p>` | Search filtered by plugin |
| `dap-bpa knowledge blueprints find "<query>" --type single` | Filter results by blueprint type |
| `dap-bpa knowledge blueprints get <id>` | Retrieve an example blueprint |
| `dap-bpa knowledge blueprints get <id> --include-files` | Retrieve example + all supporting files |
| `dap-bpa knowledge blueprints add <dir-or-archive>` | Import a local blueprint into the knowledge library |
| `dap-bpa knowledge blueprints add <path> --name <slug>` | Import with custom name |
| `dap-bpa knowledge blueprints add <path> --library <dir>` | Import to custom library directory |
| `dap-bpa knowledge blueprints add <path> --scan-depth <n> --copy-depth <n>` | Fine-tune filesystem traversal |
| `dap-bpa knowledge blueprints add <path> --main-file-names <names>` | Override main-file detection |
| `dap-bpa knowledge blueprints add <path> --allow-file-types <exts>` | Restrict file types during import |
| `dap-bpa knowledge blueprints scan <dir>` | **DEPRECATED** - use `add` instead |
| `dap-bpa knowledge blueprints registry <file>` | **DEPRECATED** - use `add` instead |

### Knowledge: Node Types

Resolve TOSCA / plugin node types referenced in blueprints. Use these commands when you need to discover what a plugin can deploy, which properties a node type accepts, and which schema the blueprint validator will check against.

Plugin knowledge commands are **authoring-time** lookups against the local dap-bpa knowledge base. They do not require a live orchestrator connection. This is different from `dap-bpa orchestrator plugins ...`, which queries the runtime plugins installed on a specific DAP orchestrator. In practice, use `knowledge plugins` while writing and validating the blueprint locally, then use orchestrator commands to confirm the target environment can run it.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge plugins list <plugin>` | List node types provided by a plugin |
| `dap-bpa knowledge plugins get <plugin> <node_type>` | Get a specific plugin node type |
| `dap-bpa knowledge plugins docs <plugin>` | Full plugin reference |
| `dap-bpa knowledge plugins node-type-docs <plugin> <node_type>` | Docs for a specific node type |
| `dap-bpa knowledge types get <type>` | Resolve any type - searches plugin types first, then base types |
| `dap-bpa knowledge types list` | List all known types (base + plugin) |
| `dap-bpa list-node-types [<plugin>]` | Alias for `knowledge plugins list` |

### Knowledge: Documentation

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge docs search <query> [--plugin <p>] [--limit <n>]` | Semantic search across docs |
| `dap-bpa knowledge docs find <query>` | Alias for `search` |
| `dap-bpa knowledge docs get <path>` | Fetch a specific doc by path |

### Knowledge: Secret Types

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge secret-type list` | List all secret types |
| `dap-bpa knowledge secret-type get <type>` | Get details for a specific secret type |

### Knowledge: Plugin Management

Plugin management keeps the local authoring knowledge current. Fetching plugin documentation updates the node type and schema reference used by the agent and by local validation. Adding a custom plugin lets teams document internal or partner-provided capabilities so the same authoring workflow works for non-default plugins.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge plugins fetch <plugin>` | Fetch plugin docs from upstream |
| `dap-bpa knowledge plugins fetch --all` | Fetch docs for every registered plugin |
| `dap-bpa knowledge plugins add <name-or-path>` | Import a custom plugin to the knowledge base |

### Knowledge: Customer Patterns

Learn, review, and validate your own blueprint conventions from existing blueprints. Patterns are stored locally under `~/.blueprint-assist/knowledge/patterns/<pattern-set>/`. For the full end-to-end workflow (concepts, confidence scoring, IDE skill, MCP tools, CI/CD examples), see [Section 023 - Customer Pattern Learning](../section-023-customer-patterns/content.md).

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge patterns learn --blueprints-dir <path> [--pattern-set <name>]` | Propose pattern candidates from a directory of blueprints (interactive review wizard); `--json` emits candidates for scripted review |
| `dap-bpa knowledge patterns review --accept <id,...> --reject <id,...> [--pattern-set <name>]` | Accept/reject pattern candidates |
| `dap-bpa knowledge patterns review --decisions <file> [--pattern-set <name>]` | Apply accept/override/reject decisions in one batch from a JSON file |
| `dap-bpa knowledge patterns validate <blueprint-file> [--pattern-set <name>]` | Validate a blueprint against learned conventions |
| `dap-bpa knowledge patterns status [--pattern-set <name>]` | Show pattern-set health, schema version, and feedback-score summary |
| `dap-bpa knowledge patterns list [--pattern-set <name>]` | List pattern sets and their contents |
| `dap-bpa knowledge patterns export --output <file> [--pattern-set <name>]` | Export a pattern set to JSON |
| `dap-bpa knowledge patterns import --input <file>` | Import a pattern set from JSON |
| `dap-bpa knowledge patterns migrate [--pattern-set <name>]` | Migrate a pattern set to the latest schema |
| `dap-bpa knowledge patterns feedback --input <file> [--pattern-set <name>]` | Store pattern feedback and update attribution metadata (v0.30.1+) |

### Questions & Prompt Coaching

Interactive prompt refinement and coaching workflows for blueprint authoring.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa questions ask --intent <intent>` | Ask a question with specified intent for interactive prompt refinement (v0.30.1+) |
| `dap-bpa questions update --answers <answers>` | Update question answers in a coaching workflow (v0.30.1+) |

### Decision Trace

Access and manage decision records and reasoning traces from blueprint authoring and deployment workflows. As of v0.31.0, decision trace is wired end-to-end across REST, MCP, and CLI/IDE paths.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa decision-trace list` | List all decision traces (v0.30.1+) |
| `dap-bpa decision-trace get <trace_id>` | Retrieve a specific decision trace with full reasoning (v0.30.1+) |
| `dap-bpa decision-trace export --output <file>` | Export decision traces to JSON for analysis (v0.30.1+) |
| `dap-bpa trace record` | Record a decision trace to file-backed store (v0.31.0+) |
| `dap-bpa trace compose` | Compose a decision trace from skill-call inputs (v0.31.0+) |
| `dap-bpa trace show` | Display a decision trace (v0.31.0+) |

### Wiki Knowledge Base

Browse and maintain the local knowledge base from the terminal.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa wiki toc` | Display table of contents for the knowledge base (v0.30.1+) |
| `dap-bpa wiki search <query>` | Search the knowledge base (v0.30.1+) |
| `dap-bpa wiki read <topic>` | Read a specific knowledge base topic (v0.30.1+) |
| `dap-bpa wiki status` | Show knowledge base health and statistics (v0.30.1+) |
| `dap-bpa wiki lint` | Validate knowledge base structure and content (v0.30.1+) |
| `dap-bpa wiki synthesize` | Run maintainer synthesis to update knowledge base content (v0.30.1+) |

### Orchestrator: Blueprints

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator blueprints upload --file <path> --id <id> --revision <ver>` | Upload a blueprint archive or directory (v0.31.0+ accepts directories, auto-tars with YAML entrypoint detection); prints the DAP console inventory URL and a local checksum on success for integrity verification (v0.28.0+) |
| `... --application-file-name <name>` | Upload with a custom entrypoint file |
| `... --visibility <visibility>` | Set blueprint visibility |
| `dap-bpa orchestrator blueprints get <blueprint_id> --fields id state` | Check upload / processing state |
| `dap-bpa orchestrator blueprints list [--filter <expr>]` | List blueprints |
| `dap-bpa orchestrator blueprints delete <id> [--force]` | Delete a blueprint; prompts for confirmation on TTY when `--force` absent, fails on non-TTY without `--force` (v0.31.0+) |
| `dap-bpa orchestrator blueprints download <id> [--output <path>] [--extract-to <dir>]` | Download a blueprint archive from the orchestrator (v0.30.1+); `--output` specifies the download path, `--extract-to` extracts the archive to a directory |
| `dap-bpa orchestrator blueprints update <id> [--file <path>] [--display-name <name>] [--tags <json>]` | Update blueprint metadata and/or content (v0.30.1+); `--file` replaces the blueprint archive, `--display-name` updates the display name, `--tags` sets tags as JSON |

### Orchestrator: Deployments

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator deployments create --blueprint-id <id> [--deployment-id <id>] [--display-name <name>] [--inputs <json>] [--environment <env-id>]` | Create a deployment |
| `dap-bpa orchestrator deployments list [--filter <expr>]` | List deployments |
| `dap-bpa orchestrator deployments get <deployment_id>` | Get deployment details |
| `dap-bpa orchestrator deployments update <id> --inputs <json>` | Update deployment inputs |
| `dap-bpa orchestrator deployments update <id> --body <json-file>` | PATCH deployment metadata (NOT a deployment update workflow) |

### Orchestrator: Deployment Updates (Full Workflow)

For non-trivial changes (blueprint swap, schema changes) that need the full update pipeline.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator deployment-updates initiate <deployment_id> --body <body.json>` | Initiate a full update |
| `dap-bpa orchestrator deployment-updates list` | List all updates |
| `dap-bpa orchestrator deployment-updates list <deployment_id>` | List updates for one deployment |
| `dap-bpa orchestrator deployment-updates get <update_id>` | Get update details |

### Workflow Wrappers (Complete Workflows)

High-level commands that orchestrate multiple steps end-to-end.

#### Install Wrapper

Performs complete installation: upload blueprint → create deployment → start install workflow → tail events

```bash
dap-bpa install \
  --file blueprint.tar.gz \
  --blueprint-id my-blueprint \
  [--deployment-id my-dep] \
  [--inputs inputs.json] \
  [--no-tail]
```

**What it does:**

1. Uploads the blueprint archive or directory (v0.31.0+ accepts directories, auto-tars with YAML entrypoint detection; zip archives with loose files are auto-repacked with a wrapping directory)
2. Creates a deployment with provided inputs
3. Starts the install workflow
4. Tails execution events in real-time (unless `--no-tail`)

**Example:**

```bash
dap-bpa install \
  --file ./my-app.tar.gz \
  --blueprint-id my-app-v1 \
  --inputs ./prod-inputs.json
```

#### Uninstall Wrapper

Performs complete uninstall: run uninstall workflow → tail events → delete deployment → delete blueprint

```bash
dap-bpa uninstall <deployment_id> \
  [--no-delete-blueprint] \
  [--no-tail]
```

**What it does:**

1. Gets deployment info
2. Starts the uninstall workflow
3. Tails execution events (unless `--no-tail`)
4. Deletes the deployment
5. Deletes the blueprint (unless `--no-delete-blueprint`)

**Example:**

```bash
dap-bpa uninstall my-app-deployment
```

### Orchestrator: Executions

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator executions list` | List executions |
| `dap-bpa orchestrator executions get <execution_id>` | Get execution details / status |
| `dap-bpa orchestrator executions start --deployment-id <id> --workflow-id <name>` | Start a workflow (e.g. `install`, `uninstall`, custom) |

### Orchestrator: Events

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator events list [--limit <n>]` | List recent events |
| `dap-bpa orchestrator events list --from-dt <dt> --to-dt <dt>` | Filter events by time range |
| `dap-bpa orchestrator events get <execution_id>` | Stream events for a specific execution |

### Orchestrator: Plugins (DAPO API)

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator plugins list [--filter <expr>]` | List plugins on the orchestrator |
| `dap-bpa orchestrator plugins get <plugin_id>` | Get plugin details |
| `dap-bpa orchestrator plugins upload --file <path.wgn\|.zip> [--name <n>] [--visibility tenant\|global]` | Upload a plugin |
| `dap-bpa orchestrator plugins download <plugin_id> [--output <path>]` | Download a plugin |
| `dap-bpa orchestrator plugins delete <plugin_id> [--force]` | Delete a plugin |

### Orchestrator: Secrets

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator secrets list [--filter <expr>]` | List secrets |
| `dap-bpa orchestrator secrets get <name>` | Get secret metadata |
| `dap-bpa orchestrator secrets create --key <name> --value <v> [--type x] [--display-name x] [--description x]` | Create a secret |

### Monitor

The **Blueprint Monitor Agent** provides fully automated lifecycle testing.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa monitor --file <blueprint.yaml>` | Run upload → deploy → install → (workflows) → uninstall → cleanup |
| `dap-bpa monitor --deployment-id <id>` | Start install workflow and monitor existing deployment |
| `dap-bpa monitor --execution-id <id>` | Monitor an already-running execution |
| `... --inputs '<json>'` | Supply deployment inputs inline |
| `... --workflow <name>` | Specify which workflow to run |
| `... --assert 'key=regex'` | Validate outputs against regex assertions |
| `... --keep` | Preserve resources after the run for debugging |
| `... --detach` | Return immediately (default: attached mode) |
| `... --timeout <duration>` | Set timeout for the operation |
| `... --poll-interval <seconds>` | How often to poll status (default: 10s) |
| `... --callback <url>` | POST result to this URL when done |
| `... --no-update-check` | Skip the startup check for a newer dap-bpa version (also settable via `DAP_NO_UPDATE_CHECK=1`, v0.28.0+) |
| `dap-bpa monitor --status` | Show status of most recent session (no orchestrator auth required, v0.31.0+) |
| `dap-bpa monitor --status --execution-id <id>` | Show status of a specific session |
| `dap-bpa monitor --status --session-id <id>` | Show status by session ID |
| `dap-bpa monitor --list` | List monitor sessions (no orchestrator auth required, v0.31.0+) |
| `dap-bpa monitor --events` | Show monitor events (no orchestrator auth required, v0.31.0+) |
| `dap-bpa monitor --daemon-status` | Show whether the background daemon is running (no orchestrator auth required, v0.28.0+) |
| `dap-bpa monitor --daemon-stop` | Stop the background daemon (no orchestrator auth required, v0.28.0+; now exits non-zero on failure, v0.31.0+) |

> **Single-binary daemon (v0.28.0+):** the background daemon now runs as a mode of `dap-bpa` itself (`dap-bpa --daemon-mode`) rather than a separate sibling binary, and its bin entry is now `dap-bpa-daemon`. A version field in the lockfile lets the CLI detect a stale daemon and restart it automatically on the next `dap-bpa monitor` call, so CLI↔daemon version skew can no longer occur. Old `bpa-daemon` binaries left in `~/.local/bin` or `/usr/local/bin` are unused and can be removed.
>
> **v0.29.3 upgrade/daemon fixes:** `dap-bpa upgrade --check` now queries the correct Artifactory directory and reports actionable errors on 401/403/404. Released zips and the Windows NSIS installer now ship `bpa-daemon`/`bpa-daemon.exe` alongside `dap-bpa`, and `upgrade` installs the daemon when the source zip contains one. `install.sh` no longer aborts in non-interactive shells (CI/pipes) and auto-installs IDE skills when no TTY is present.

### Wiki (Knowledge Base Browser)

Browse the local knowledge base from the terminal. Useful for discovering docs, checking coverage, and validating knowledge-base schemas. Wiki schema governance is formalized in `knowledge/SCHEMA.md`.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa wiki toc` | Table of contents of the knowledge base |
| `dap-bpa wiki search <query>` | Search across all knowledge sources |
| `dap-bpa wiki read <path>` | Read a specific knowledge base document |
| `dap-bpa wiki status` | Knowledge base coverage report |
| `dap-bpa wiki lint` | Validate docs against schema |
| `dap-bpa wiki synthesize plugin <plugin> --out <dir>` | Synthesize plugin documentation from the knowledge base (maintainer tool; hidden from standard help). Output goes to an explicit `--out` directory; results are cached via SHA-256 content hashes in frontmatter so unchanged sources are skipped; generated docs are auto-linted |
| `dap-bpa wiki synthesize patterns --out <dir>` | Synthesize cross-plugin patterns from blueprints (maintainer tool) |
| `dap-bpa wiki synthesize troubleshooting --out <dir>` | Synthesize troubleshooting guides from logs (maintainer tool) |

---

## Common Flags & Patterns

### Help & Discovery

```bash
dap-bpa --help                       # top-level groups
dap-bpa orchestrator --help          # one group
dap-bpa orchestrator deployments --help
dap-bpa monitor --help
dap-bpa wiki --help
dap-bpa knowledge patterns --help
```

### List Filtering

Most `list` commands accept `--filter` for server-side filtering. The orchestrator expects a filter expression made of a field and an operator, not a shell glob, so patterns such as `webapp-*` are rejected with an HTTP 400. Check your orchestrator's supported filter syntax before relying on it.

### Output Formats

```bash
dap-bpa orchestrator deployments get <id> --json | jq '.deployment_status'
dap-bpa orchestrator deployments get <id> --fields id display_name deployment_status
```

### Orchestrator Selection

```bash
dap-bpa orchestrator blueprints list -o production            # use a configured orchestrator profile
dap-bpa orchestrator blueprints list --orchestrator staging   # long form
```

### SSL Certificate Handling

```bash
dap-bpa orchestrator blueprints list --trust-all  # bypass SSL verification (dev only)
```

---

## Complete Workflow Example

Here's an end-to-end example using the workflow wrappers:

```bash
# 1. Install a blueprint
dap-bpa install \
  --file ./my-microservice.tar.gz \
  --blueprint-id my-microservice-v1 \
  --inputs ./prod-inputs.json

# Output shows:
# 📦 Starting installation workflow...
# 1️⃣  Uploading blueprint...
#    ✓ Blueprint uploaded: my-microservice-v1
# 2️⃣  Creating deployment...
#    ✓ Deployment created: my-microservice-v1-deployment
# 3️⃣  Starting install workflow...
#    ✓ Execution started: abc-123-def
# 4️⃣  Tailing execution events...
#    📝 12:34:56 [node1] Starting installation...
#    📝 12:35:01 [node1] Installation complete
#    ✓ Execution completed successfully

# 2. Check deployment status
dap-bpa orchestrator deployments get my-microservice-v1-deployment

# 3. Later, uninstall everything
dap-bpa uninstall my-microservice-v1-deployment

# Output shows:
# 🗑️  Starting uninstall workflow...
# 1️⃣  Getting deployment info...
#    ✓ Deployment: my-microservice-v1-deployment
#    ✓ Blueprint: my-microservice-v1
# 2️⃣  Starting uninstall workflow...
#    ✓ Execution started: xyz-789-abc
# 3️⃣  Tailing execution events...
#    📝 12:40:10 [node1] Starting uninstall...
#    📝 12:40:15 [node1] Uninstall complete
# 4️⃣  Deleting deployment...
#    ✓ Deployment deleted: my-microservice-v1-deployment
# 5️⃣  Deleting blueprint...
#    ✓ Blueprint deleted: my-microservice-v1
# ✓ Uninstall complete
```

---

## Troubleshooting the CLI

| Symptom | First thing to try |
| --------- | ------------------- |
| `command not found: bpa` | The `bpa` alias is removed as of v0.31.0 - use `dap-bpa` instead. If `dap-bpa` is also missing, re-run the installer (Section 2) and open a new terminal |
| `401 / 403` from orchestrator | Run `dap-bpa setup` to configure orchestrator credentials, then `dap-bpa status` to verify |
| `blueprint upload` hangs or fails | Re-run `dap-bpa blueprint lint --file <path> --verify` locally first |
| Deployment stuck | `dap-bpa orchestrator events get <execution_id>` for live events |
| Unknown command | `dap-bpa --help` to rediscover command groups and their subcommands |
| SSL certificate errors | Use `--trust-all` flag for self-signed certificates (dev only) |

---

## Programmatic Access (TypeScript/JavaScript)

For programmatic access to Blueprint Assist, use the full client library:

```typescript
import { createFullClient, loadConfig } from '@blueprint-assist/core';

const config = loadConfig();
const client = createFullClient({
  host: config.orchestratorDomain,
  token: config.token,
});

// Upload blueprint
const blueprint = await client.blueprints.create({
  blueprint_archive: blob,
  blueprint_id: 'my-blueprint',
});

// Create deployment
const deployment = await client.deployments.create({
  blueprint_id: 'my-blueprint',
  inputs: { server_ip: '10.0.1.100' },
});

// Start execution
const execution = await client.executions.start({
  deployment_id: deployment.id,
  workflow_id: 'install',
});

// Monitor execution
const exec = await client.executions.get(execution.id);
const events = await client.events.get(execution.id);
```

For complete examples and SDK documentation, see `packages/core/DAP_CLIENT_USAGE.md`.

---

## Advanced CLI: New Commands in v0.30.1+

### Question Engine: Interactive Prompt Coaching

```bash
# Start coaching session with initial intent
dap-bpa questions ask --intent "Deploy Kubernetes on AWS"

# Answer questions (interactive CLI will prompt)
# Then retrieve refined prompt
dap-bpa questions show --refined-prompt

# Use refined prompt for blueprint generation
PROMPT=$(dap-bpa questions show --refined-prompt)
dap-bpa blueprint generate --prompt "$PROMPT" --output ./my-kubernetes-blueprint
```

### GCP Platform: Natural Language Resource Extraction

```bash
# Extract resources from description
dap-bpa gcp extract-resources \
  --description "Deploy a Cloud Run service with Cloud SQL and Cloud Storage"

# Generate blueprint from extracted resources
dap-bpa gcp generate-blueprint \
  --resources resources.json \
  --output ./gcp-blueprint

# Validate GCP credentials locally
dap-bpa gcp validate-credentials \
  --service-account-json ~/sa-key.json \
  --project-id my-gcp-project
```

### MCP Token Management: Secure API Access

```bash
# Mint a token for MCP Gateway
dap-bpa mint-token --audience mcp-gateway

# Verify token against gateway
dap-bpa mint-token --audience mcp-gateway --verify

# Export token to file (for scripts)
dap-bpa mint-token --audience orchestrator-api --out ~/.blueprint-assist/tokens/api-token

# Copy token to clipboard (for manual Postman/curl testing)
dap-bpa mint-token --audience mcp-gateway --copy

# Get JSON output for programmatic use
dap-bpa mint-token --audience orchestrator-api --json
```

### Skill Benchmarking: Quality Assurance

```bash
# Run all benchmarks for a skill
dap-bpa skill benchmark run my-skill

# Run specific test cases
dap-bpa skill benchmark run my-skill --test-ids gen-001,gen-002

# View historical scores
dap-bpa skill benchmark history my-skill

# Run automated analysis
dap-bpa skill analyze all --output-format report
```

### Wiki Knowledge Base: Offline Documentation

```bash
# Browse local knowledge base
dap-bpa wiki toc

# Search knowledge base
dap-bpa wiki search "Kubernetes node types"

# Read specific documentation
dap-bpa wiki read kubernetes-plugin

# Check knowledge base status
dap-bpa wiki status

# Synthesize improvements to knowledge base
dap-bpa wiki synthesize --analysis-file ~/ki-analysis.json
```

### Blueprint Stamping: Origin Tracking

```bash
# Stamp a blueprint with origin indicator
dap-bpa blueprint stamp --file ./my-blueprint/blueprint.yaml

# Check existing stamp
dap-bpa blueprint stamp --file ./my-blueprint/blueprint.yaml --check

# Output shows:
# {
#   "status": "stamped",
#   "origin": "blueprint-assist",
#   "generated_at": "2026-09-14T10:30:00Z",
#   "version": "v0.31.0",
#   "model": "claude-opus-5"
# }
```

### Dashboard Analytics: Business Intelligence

```bash
# Open analytics dashboard
dap-bpa dashboard open

# Export analytics data
dap-bpa dashboard export \
  --time-range 30d \
  --metrics deployments,costs,teams \
  --format csv \
  --output ~/deployments-report.csv

# View dashboard metrics from CLI
dap-bpa orchestrator profile get --show-analytics
```

---

## Practical Workflows Using New Commands

### Workflow 1: Interactive Blueprint Generation with Coaching

```bash
#!/bin/bash
# Complete workflow: Questions → Blueprint → Validate → Lint → Fix

echo "Step 1: Start coaching session"
dap-bpa questions ask --intent "Deploy a multi-tier web application"

# [User answers questions interactively]

echo "Step 2: Get refined prompt"
REFINED_PROMPT=$(dap-bpa questions show --refined-prompt)

echo "Step 3: Generate blueprint"
dap-bpa blueprint generate --prompt "$REFINED_PROMPT" --output ./generated-blueprint

echo "Step 4: Lint and repair automatically"
dap-bpa blueprint lint --file ./generated-blueprint/blueprint.yaml --repair

echo "Step 5: Visualize and review risks"
dap-bpa blueprint visualize --file ./generated-blueprint --serve

echo "✓ Blueprint ready. Open http://localhost:XXXX to review."
```

### Workflow 2: GCP Deployment with Full Validation

```bash
#!/bin/bash
# Complete GCP workflow: Extract → Generate → Validate → Deploy

DESCRIPTION="Deploy a Cloud Run service with PostgreSQL and Cloud Storage"

echo "Step 1: Extract GCP resources"
dap-bpa gcp extract-resources --description "$DESCRIPTION"

echo "Step 2: Generate blueprint"
dap-bpa gcp generate-blueprint --resources resources.json --output ./gcp-blueprint

echo "Step 3: Validate GCP credentials"
dap-bpa gcp validate-credentials \
  --service-account-json ~/sa-key.json \
  --project-id my-gcp-project

echo "Step 4: Lint and validate"
dap-bpa blueprint lint --file ./gcp-blueprint/blueprint.yaml --verify
dap-bpa blueprint validate-all --file ./gcp-blueprint/blueprint.yaml

echo "Step 5: Create secrets in orchestrator"
dap-bpa orchestrator secrets create \
  --name gcp_service_account \
  --secret-schema service_account_json \
  --file ~/sa-key.json

echo "Step 6: Upload and deploy"
dap-bpa orchestrator blueprints upload --file ./gcp-blueprint --id gcp-app --revision 1.0.0
dap-bpa orchestrator deployments create --blueprint-id gcp-app --inputs ./inputs.json
```

### Workflow 3: CI/CD Pipeline with Token-Based API Access

```bash
#!/bin/bash
# GitHub Actions / CI pipeline workflow

set -e

# Step 1: Setup credentials
dap-bpa setup --non-interactive \
  --mcp-client-id "$MCP_CLIENT_ID" \
  --mcp-client-secret "$MCP_CLIENT_SECRET"

# Step 2: Validate blueprint
dap-bpa blueprint lint --file ./blueprint.yaml --verify

# Step 3: Mint token for API access
TOKEN=$(dap-bpa mint-token --audience orchestrator-api)

# Step 4: Upload blueprint using token
curl -X POST https://orchestrator-api.dell.com/api/v1/blueprints \
  -H "Authorization: Bearer $TOKEN" \
  -F "blueprint_archive=@./blueprint.tar.gz" \
  -F "blueprint_id=my-app" \
  -F "revision=1.0.0"

# Step 5: Create deployment using token
DEPLOY_RESPONSE=$(curl -X POST https://orchestrator-api.dell.com/api/v1/deployments \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "blueprint_id": "my-app",
    "display_name": "prod-deploy",
    "inputs": {}
  }')

DEPLOYMENT_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id')

# Step 6: Start execution
curl -X POST https://orchestrator-api.dell.com/api/v1/executions \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"deployment_id\": \"$DEPLOYMENT_ID\",
    \"workflow_id\": \"install\"
  }"

echo "✓ Deployment initiated: $DEPLOYMENT_ID"
```

### Workflow 4: Skill Benchmarking & Continuous Improvement

```bash
#!/bin/bash
# Weekly skill quality assessment

set -e

SKILL_NAME="dap-vsphere"

echo "Running benchmark suite for $SKILL_NAME"

# Run benchmarks
dap-bpa skill benchmark run "$SKILL_NAME" \
  --fail-on-regression 2.0

if [ $? -eq 0 ]; then
  echo "✓ Benchmarks passed"
else
  echo "⚠ Benchmarks failed - investigating"
  
  # Show historical trend
  dap-bpa skill benchmark history "$SKILL_NAME"
fi

# Run automated analysis
echo "Running weekly analysis..."
dap-bpa skill analyze all --output-format report

# Save report
mv skill-analysis-report-*.md ~/reports/weekly-analysis.md

echo "✓ Skill assessment complete"
```

---

## Reference

- **CLI version**: this reference covers dap-bpa v0.31.0
- **Breaking change**: the `bpa` command alias is removed as of v0.31.0; only `dap-bpa` ships - update any scripts or PATH aliases
- **Setup**: Section 2 - Installation
- **Authentication**: Section 3 - Orchestration Service Authentication
- **Blueprint Monitoring**: Section 8 - Blueprint Monitoring
- **Blueprint Reasoning**: Section 9 - Blueprint Reasoning
- **Hands-on exercises**: Section 12 - Hands-on Workshop
