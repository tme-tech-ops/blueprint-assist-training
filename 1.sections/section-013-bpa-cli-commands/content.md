# Section 013: dap-bpa CLI Command Reference

A practical reference for the `dap-bpa` CLI, organized by workflow. Every command supports `--help`; use `dap-bpa --help` to discover top-level command groups and `dap-bpa <group> --help` to drill into any group.

## How to Use This Reference

- **Angle brackets** `<value>` = required argument you supply
- **Square brackets** `[--flag]` = optional flag
- **Global flags**: `--help`, `--json` (force JSON output, including on error paths), `--output json|yaml|table` (output format, table default on TTY for list/get), `--output wide` (table with all columns), `--no-headers` (omit table header), `--fields <a,b,c>` (limit returned fields; comma-separated, space-separated, or repeated, v0.33.0+), `--trust-all` (bypass SSL verification, dev only; see [SSL Certificate Handling](#ssl-certificate-handling)), `--no-tunnel` (bypass a profile's SSH tunnel, v0.33.0+), `--orchestrator <name>` or `-o <name>` (select a configured orchestrator profile), `--debug` (print each API request and response with credentials redacted; NDJSON with JSON output). `--dry-run` previews without writing on the commands that support it (`knowledge blueprints add`, `knowledge plugins fetch`, `setup-ide`, `orchestrator blueprints|deployments|plugins delete --filter`, `orchestrator deployments delete <id>`, and `orchestrator executions cancel|resume` with list filters); `mint-token` and `trace record|compose` refuse `--dry-run`. `DAP_OUTPUT` env var sets default output format; `DAP_NO_DEPRECATION_NOTICES=1` silences deprecated flag warnings in CI.
- **Strict flag validation** (v0.28.0+): the CLI now parses flags with [commander.js](https://github.com/tj/commander.js). Unknown flags, missing values, and conflicting flags fail fast with a usage error (exit `2` since v0.32.0) and an actionable message, and `--help` output is generated directly from the command registry (so it can never drift from the real surface). Internal errors are mapped to user-facing messages with exit codes; stack traces are suppressed in production.
- **Excess positional arguments rejected** (v0.29.3): extra positionals are no longer silently dropped; the CLI derives each command's allowed positional count from its argsSpec and fails with an actionable error naming the first unexpected token, plus a `--help` hint.
- **Global `--json` accepted before the command** (v0.29.3): `dap-bpa --json blueprint lint ...` now works and produces output identical to the trailing placement.
- **Alias surface restored** (v0.28.1): the v0.28.0 CommandRegistry refactor silently broke several v0.27.0 aliases - `knowledge blueprints scan`, `k p g` (`knowledge plugins get`), and the `knowledge examples add/scan/registry` family among them. v0.28.1 restores every alias to its v0.27.0 target, and `CommandRegistry.register` now throws on a duplicate command name or alias so a collision is a hard startup failure rather than a silent retarget.
- **Exit code changes** (v0.32.0): Usage errors now exit 2 (was 1). Timeout on `wait`/`watch`/`logs --follow` exits 124 (was 1). Malformed JSON in input files exits 1; malformed inline JSON exits 2.
- **Rate limiting** (v0.32.0): Client rate limit is 240 requests/minute with burst of 5; honors `Retry-After` headers.
- **New exit codes** (v0.33.0): `3` for any HTTP 401 or 403 (authentication or authorization failed) and `4` when a bulk `--plan` no longer matches the selection (nothing changed). See [Exit Codes](#exit-codes) for the full table.
- **Credentials from the environment** (v0.33.0+): `DAP_CLIENT_ID`, `DAP_CLIENT_SECRET`, `DAP_ORG_ID`, and `DAP_TOKEN` take precedence over `config.json`, and the CLI can run from environment variables alone with no config file on disk (useful on CI runners). Credential values on the command line (`--token`, `--client-secret`, `--password`, `--secret`, `--api-token`) are rejected with exit `2` and never echoed. A world-readable `config.json` that contains secrets gets a non-blocking warning. `DAP_CA_CERT`, `DAP_CLIENT_CERT`, `DAP_CLIENT_KEY`, and `DAP_TRUST_ALL` also apply when a profile is selected explicitly.
- **Clearer connection errors** (v0.33.0+): TLS and network failures are reported as such (`TLS error connecting to <host>: <CODE>` with a `DAP_CA_CERT` hint; `ECONNREFUSED`, `ENOTFOUND`, and timeouts name the host and port) and exit `1`, instead of being reported as bad credentials. A 403 leads with the server's own reason. The raw portal error body is shown only with `--debug`.
- **Polling survives API outages** (v0.33.0+): `executions wait|watch`, `executions logs --follow`, `deployments logs --follow`, and `deployments delete --wait` keep polling through network errors and 502/503/504 responses, backing off to 30 seconds with one warning when the API goes away and one when it returns. They stop only at `--timeout` (exit 124).
- **Faster lint** (v0.33.0+): lint time no longer grows quadratically with blueprint size; a 200 KB blueprint lints in under a second.

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

> **Release notes** (v0.33.0+): run `dap-bpa release-notes` to see what changed in the installed version.

### Authentication & Setup

| Command | Purpose |
| --------- | --------- |
| `dap-bpa setup` | Interactive wizard - orchestrator URL, tenant, LLM credentials (Bedrock / OpenAI). As of v0.33.0 the Client Secret prompt no longer echoes keystrokes and accepts a pasted secret, and a `--trust-all` choice is saved to the profile |
| `dap-bpa setup --ca-cert <path> [--orchestrator <name>]` | Trust a private CA (PEM) for the orchestrator's server certificate. Ignored when `trustAll` is also set on the profile; v0.33.1 warns about that combination |
| `dap-bpa setup-ide <ide>` | Install dap-bpa skills into a supported IDE. Supported IDEs: devin, claude-code, cursor, jetbrains, vscode, antigravity, cline, codex (`windsurf` replaced by `devin` in v0.31.0; `codex` restored as named target; the `antigravity` target also covers Gemini CLI and Goose). Use `--to <dir>` for custom install path or `--rules-to <dir>` for separate rules destination. `--isv` adds the `isv-blueprints` skill; as of v0.33.0 an installed copy is kept in sync on later runs without `--isv`. v0.33.0 also reports orphaned skill directories on every run (offering to remove retired Dell skills on an interactive terminal, never under `--yes`) and exits `2` for an unknown IDE |
| `dap-bpa verify-skills [--skill <name>] [--report [--ide <id>]]` | Scan installed skills and classify each as dell-provided, customer-modified, unsigned, or invalid-signature; exit 1 on invalid signature (v0.31.0+). `--skill` filters to a specific skill; `--report` generates compliance output. As of v0.33.0, unsigned skills are broken down by lineage: `stale-dell` (an old install of a skill still shipped), `orphaned-dell` (a retired Dell skill), or `custom` (your own content), shown in a Lineage column and in `--json` / `--report` output |
| `dap-bpa release-notes` | Print the release notes for the installed version (v0.33.0+). The installer copies them to `~/.blueprint-assist/RELEASE_NOTES.md` on every install and upgrade, so the command works offline |
| `dap-bpa status` | Check current setup status and verify orchestrator connection |
| `dap-bpa upgrade` | Find a downloaded distribution zip (cwd, `~/Downloads`) and install it - no `--file` needed (v0.28.0+) |
| `dap-bpa upgrade --file <zip>` | Replace running binary from an explicit distribution zip; v0.29.3 sweeps stale `.bpa-upgrade-<ts>`, `.bpa-daemon-upgrade-<ts>`, and `.bpa-rollback-<ts>` staging files at startup before copying |
| `dap-bpa upgrade --version <x>` | Install a specific already-downloaded version |
| `dap-bpa upgrade --check` | Check Artifactory for a newer version - exit `0` (up-to-date), `10` (update available), `1` (error), for CI gates (v0.28.0+) |
| `dap-bpa upgrade --rollback` | Restore the previous binary from its timestamped `.bak` backup (v0.28.0+); v0.29.3 sweeps leftover rollback staging files at startup (the sweep never throws) |
| `dap-bpa mcp-server` | Start the Blueprint Assist MCP server locally (v0.27.0+) |
| `dap-bpa mint-token [--verify] [--export\|--json\|--out <file>\|--copy]` | Mint MCP gateway tokens with correct recipe (scope=internal:exchangeable + --audience); `--verify` tests the token against the gateway (v0.31.0+). The v0.33.1 `--help` still lists a `--client-secret` override, but credential flags are rejected (exit 2); set `DAP_CLIENT_ID`, `DAP_CLIENT_SECRET`, and `DAP_ORG_ID` instead |

### Blueprint Authoring & Validation

| Command | Purpose |
| --------- | --------- |
| `dap-bpa blueprint lint --file <path>` | Lint a blueprint YAML; also verifies imported files exist (v0.27.0+). Human-readable output is the default; use `--json` or `--output json` for the LSP-shaped JSON payload. Exits `0` even when it reports errors; in scripts, check `errorsFound` in the JSON output |
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
| `dap-bpa knowledge patterns validate <blueprint-file> [--pattern-set <name>] [--strict-naming]` | Validate a blueprint against learned conventions (exits 1 on a violation). `--strict-naming` (v0.33.0+) fails nodes that no naming pattern covers, for CI gates; by default they pass |
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

Record, compose, and display the design-decision trace for a generated blueprint (see [Section 009](../section-009-blueprint-reasoning/content.md#decision-trace-understanding-ai-reasoning-v0301)). The IDE agent normally drives these commands while it generates a blueprint. On the Agent MCP Server, traces are available through the `get_decision_trace` / `validate_decision_trace` MCP tools.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa trace record --blueprint <name> --category <compute\|storage\|network\|security> --choice <text> --rationale <text>` | Record one design decision (repeatable `--alternative`, `--constraint`, `--assumption`) (v0.31.0+) |
| `dap-bpa trace compose --file <blueprint.yaml>` | Compose, validate, and save the trace as `<name>.decision-trace.md` / `.json` next to the blueprint; clears the recorded decisions (v0.31.0+) |
| `dap-bpa trace show --file <blueprint.yaml>` | Display the saved trace; filter with `--category` or `--search <keyword>` (v0.31.0+) |

> There are no `dap-bpa decision-trace list|get|export` commands. Traces are per-blueprint files, so you find them by blueprint path, not by trace ID.

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
| `dap-bpa orchestrator blueprints delete <id> [--yes]` | Delete a blueprint; prompts for confirmation on TTY when `--yes` absent, fails on non-TTY without `--yes` (v0.32.0+; `--force` deprecated) |
| `dap-bpa orchestrator blueprints delete --filter <expr> [--dry-run [--plan-out <file>] \| --plan <file>] [--continue-on-error]` | Bulk delete the blueprints matching a filter (v0.33.0+); see [Bulk Operations](#bulk-operations-v0330) |
| `dap-bpa orchestrator blueprints download <id> [--output <path>] [--extract-to <dir>] [--overwrite]` | Download a blueprint archive (v0.32.0+); `--extract-to` refuses non-empty `<dir>/<id>` unless `--overwrite` given |
| `dap-bpa orchestrator blueprints update <id> [--file <path>] [--display-name <name>] [--tags <json>]` | Update blueprint metadata and/or content; `--file` replaces the blueprint archive |
| `dap-bpa orchestrator blueprints upload --file <path> --id <id> --revision <ver> --validate` | Upload with pre-validation (v0.32.0+) |

### Orchestrator: Deployments

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator deployments create --blueprint-id <id> [--deployment-id <id>] [--display-name <name>] [--inputs <json>] [--environment <env-id>]` | Create a deployment |
| `dap-bpa orchestrator deployments list [--filter <expr>]` | List deployments |
| `dap-bpa orchestrator deployments get <deployment_id>` | Get deployment details |
| `dap-bpa orchestrator deployments update <id> --body <json\|file\|@file>` | PATCH deployment metadata (NOT a deployment update workflow). As of v0.33.0 the body may contain only `name`, `description`, and `tags`; any other key is rejected with exit 2 before the API is called. To change inputs or the blueprint, use `deployment-updates initiate` |
| `dap-bpa orchestrator deployments delete <id> [--yes] [--force] [--dry-run]` | Delete a deployment (v0.32.0+); `--dry-run` previews the impact (children and what blocks the delete). `--force` (v0.33.0+) force-deletes a deployment with live nodes and still asks for confirmation |
| `... --wait [--timeout <s>] [--interval <s>]` | After the delete is accepted, wait until the deployment is gone (v0.33.0+); exit 124 on timeout (default 3600 s, `0` = no limit), 1 if the delete fails |
| `dap-bpa orchestrator deployments delete --filter <expr> [--force] [--dry-run [--plan-out <file>] \| --plan <file>] [--continue-on-error]` | Bulk delete the deployments matching a filter (v0.33.0+); hidden deployments are excluded. See [Bulk Operations](#bulk-operations-v0330) |
| `dap-bpa orchestrator deployments add-label <id> --label <key=value> [--label ...]` | Add labels and keep the existing ones (v0.33.0+) |
| `dap-bpa orchestrator deployments remove-label <id> --label <key[=value]> [--label ...]` | Remove labels and keep the others (v0.33.0+); a bare key removes every value of it |
| `dap-bpa orchestrator deployments set-labels <id> --replace --label <key=value> [--label ...] [--yes]` | Replace all labels (v0.33.0+ requires `--replace`, shows what will be dropped, and asks first) |
| `dap-bpa orchestrator deployments capabilities <id>` | Show the capabilities (outputs) a deployment exposes |
| `dap-bpa orchestrator deployments logs <deployment_id> [--follow]` | Stream deployment logs (v0.32.0+); defaults to readable text on TTY, NDJSON when piped |

> **Labels** (v0.33.0+): `csys-*` labels are managed by DAP. `add-label` and `remove-label` refuse them, and `set-labels` keeps them as they are. To filter by label, use `--filter "label:<key> eq <value>"`, not `labels.<key>`.

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
  [--yes] \
  [--force] \
  [--no-delete-blueprint] \
  [--no-tail]
```

The command asks for confirmation; `--yes` skips the prompt and is required when stdin is not a terminal. `--force` (v0.33.0+) force-deletes a deployment that still has live nodes, matching `deployments delete --force`. It never skips the confirmation prompt on its own.

**What it does:**

1. Gets deployment info
2. Starts the uninstall workflow
3. Tails execution events (unless `--no-tail`)
4. Deletes the deployment
5. Deletes the blueprint (unless `--no-delete-blueprint`)

**Example:**

```bash
dap-bpa uninstall my-app-deployment --yes
```

### Orchestrator: Executions

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator executions list` | List executions |
| `dap-bpa orchestrator executions get <execution_id>` | Get execution details / status |
| `dap-bpa orchestrator executions start --deployment-id <id> --workflow-id <name> [--parameters <json\|file\|@file>]` | Start a workflow (e.g. `install`, `uninstall`, custom); `--workflow-id` defaults to `install` |
| `... --force` | Start even if another execution of the deployment is running (v0.33.0+) |
| `... --queue` | Queue behind a running execution instead of failing (v0.33.0+) |
| `... --scheduled-time <iso>` | Start at a future ISO-8601 time, for example `2026-12-01T03:00:00Z` (v0.33.0+) |
| `... --dry-run` | The workflow's own dry run: creates a real execution that runs no operations (a request is sent; this is not a CLI preview) |
| `dap-bpa orchestrator executions cancel <execution_id> [--force \| --kill]` | Cancel an execution (v0.32.0+); `--force` stops without waiting for running operations, `--kill` also kills their processes |
| `dap-bpa orchestrator executions resume <execution_id> [--force]` | Resume (retry) a failed, cancelled, or paused execution (v0.32.0+); `--force` also re-runs operations that started but never finished |
| `dap-bpa orchestrator executions cancel\|resume [--deployment-id <id>] [--status <s,...>] [--since <time>] [--until <time>] [--dry-run [--plan-out <file>] \| --plan <file>] [--continue-on-error]` | Bulk cancel or resume (v0.33.0+). Only your own executions are selected; bulk resume is limited to failed and cancelled executions. See [Bulk Operations](#bulk-operations-v0330) |
| `dap-bpa orchestrator executions wait <execution_id> [--timeout <s>] [--interval <s>]` | Wait for execution to complete (v0.32.0+); exit 0 on success, 1 on failure or cancel, 124 on timeout; `--timeout 0` waits indefinitely |
| `dap-bpa orchestrator executions watch <execution_id> [--timeout <s>] [--interval <s>]` | Like `wait`, with each status change on stderr (v0.32.0+) |
| `dap-bpa orchestrator executions logs <execution_id> [--follow] [--timeout <s>] [--interval <s>]` | Print execution events and logs (v0.32.0+); `--follow` streams them until the execution ends |

> **Timeout behavior** (v0.32.0+): `wait`, `watch`, and `logs --follow` take `--timeout` in seconds, default to a 1-hour timeout, and exit 124 on timeout (not 1). Polling uses growing intervals (2s up to 30s with jitter); `--interval <s>` keeps a fixed wait. As of v0.33.0 they keep polling through API outages until the timeout.

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
| `... --validate-dependencies` | Check the wagon locally before upload (v0.33.0+): readable, metadata complete, not already uploaded. A failure stops the upload with exit 1; platform and Python versions are reported as not checked |
| `dap-bpa orchestrator plugins download <plugin_id> [--output <path>]` | Download a plugin |
| `dap-bpa orchestrator plugins delete <plugin_id> [--yes] [--force]` | Delete a plugin; as of v0.33.0 it asks for confirmation like every other single-ID delete (`--yes` skips it). `--force` deletes a plugin that is in use |
| `dap-bpa orchestrator plugins delete --filter <expr> [--force] [--dry-run [--plan-out <file>] \| --plan <file>] [--continue-on-error]` | Bulk delete the plugins matching a filter (v0.33.0+); see [Bulk Operations](#bulk-operations-v0330) |

### Orchestrator: Secrets

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator secrets list [--filter <expr>]` | List secrets |
| `dap-bpa orchestrator secrets get <name>` | Get secret metadata |
| `dap-bpa orchestrator secrets create <name> --value-from-file <path> [--type <t>] [--display-name x] [--description x]` | Create a secret from file (v0.32.0+); `--type <t>` validates against platform schema; `--trim` drops trailing newline |
| `dap-bpa orchestrator secrets create <name> --value-from-stdin [--type <t>]` | Create a secret from stdin (v0.32.0+) |
| `... --update-if-exists` | Overwrite the secret if it already exists (v0.33.0+). Without it, an existing name returns HTTP 409 |
| `dap-bpa orchestrator secrets update <name> --value-from-file <path>` | Update a secret value (v0.32.0+); `--value-from-stdin` or metadata-only (`--display-name`, `--description`) also work |
| `dap-bpa orchestrator secrets delete <name> [--yes]` | Delete one secret (v0.32.0+); asks for confirmation unless `--yes` |

> **v0.32.0 breaking change**: `secrets create` now uses a positional `<name>` argument instead of `--key`. The `--value` flag is removed for security (secrets on command line leak via process list, shell history, CI logs) - use `--value-from-file` or `--value-from-stdin` instead. Empty/whitespace-only values are rejected (exit 2). A single trailing newline triggers a stderr warning with stored length; use `--trim` to drop it.
>
> **v0.33.0 breaking change**: bulk `secrets delete` (`--all` / `--filter`) is removed. Delete secrets one name at a time.

### Orchestrator: Tunnel (v0.33.0+)

For lab orchestrators that are reachable only through an SSH jump host. dap-bpa starts and supervises your own OpenSSH client (`ssh` / `ssh.exe`); it never stores or reads private keys, so `~/.ssh/config` settings such as `ProxyJump`, `ProxyCommand`, and identity files apply as usual. See [Section 016 - Tunnel Connections](../section-016-tunnel-connections/content.md) for setup.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator tunnel start [--profile <name>] [--port <port>] [--interactive] [--verbose]` | Start a background SSH tunnel for a profile (defaults to the active profile). The local port defaults to `18443` and falls back through `18444`-`18500` if taken. `--interactive` gives SSH a terminal for password or MFA prompts |
| `dap-bpa orchestrator tunnel status [--profile <name>]` | Check that the tunnel is up and healthy; exits 1 when it is down |
| `dap-bpa orchestrator tunnel stop [--profile <name>]` | Stop the tunnel |
| `dap-bpa orchestrator tunnel list [--json]` | List active and configured tunnels |

When a profile defines a tunnel, orchestrator commands for that profile go through `127.0.0.1:<port>` automatically, with the HTTP Host header and TLS SNI set to the real orchestrator domain. If the tunnel is not running, the command fails and prints the exact `tunnel start` command to run. `--no-tunnel` bypasses the tunnel. Tunnels to a profile marked as production are refused. Session state is kept in `~/.blueprint-assist/tunnels/<profile>.json`.

```bash
dap-bpa orchestrator tunnel start --profile lab
dap-bpa orchestrator blueprints list -o lab    # goes through the tunnel
dap-bpa orchestrator tunnel stop --profile lab
```

> **Corporate proxies** (v0.33.0+): `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` are detected automatically; a per-profile proxy setting takes precedence. Loopback destinations (including the tunnel) always bypass the proxy, and proxy passwords are redacted from logs.

### Bulk Operations (v0.33.0+)

`orchestrator blueprints|deployments|plugins delete` take `--filter <expr>` instead of an ID, and `orchestrator executions cancel|resume` take the `executions list` filters (`--deployment-id`, `--status`, `--since`, `--until`). Bulk runs are guarded:

- A narrowing filter is required: `--all` on its own is refused
- The CLI prints the matched set and, on a terminal, asks you to type the count. `--yes` is not accepted for a bulk run
- More than `DAP_BULK_MAX_ITEMS` (default 20) matches is refused (exit 2)
- A run stops at the first failure and reports the rest as skipped; `--continue-on-error` keeps going
- Bulk `executions cancel|resume` select only your own executions

In CI, where there is no terminal, write a plan, approve it, then apply it. The apply acts only if the selection still matches the plan exactly, and exits `4` otherwise:

```bash
dap-bpa orchestrator deployments delete --filter "label:env eq dev" --dry-run --plan-out plan.json
# review and approve plan.json
dap-bpa orchestrator deployments delete --filter "label:env eq dev" --plan plan.json
```

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
dap-bpa orchestrator deployments get <id> --fields id,display_name,deployment_status
```

### Orchestrator Selection

```bash
dap-bpa orchestrator blueprints list -o production            # use a configured orchestrator profile
dap-bpa orchestrator blueprints list --orchestrator staging   # long form
```

### SSL Certificate Handling

```bash
dap-bpa setup --ca-cert ./private-ca.pem -o lab   # preferred: trust a private CA
dap-bpa orchestrator blueprints list --trust-all  # bypass SSL verification (dev only)
```

Prefer `setup --ca-cert`, which verifies the real certificate. `--trust-all` (or `trustAll: true` in the config) turns verification off entirely, so a `caCert`, `clientCert`, or `clientKey` on the same profile is ignored; v0.33.1 warns about that combination at setup and on every command. v0.33.1 also fixes `trustAll` on the compiled binary, where the token and OIDC discovery calls previously still verified certificates and failed against self-signed portals with `unable to verify the first certificate`.

### Exit Codes

| Code | Meaning |
| ---- | ------- |
| `0` | Success |
| `1` | Runtime error: API or HTTP failure (including not found), network, TLS, missing credentials or config, file not found, lint or validation findings, a declined confirmation prompt, or a bulk run in which some items failed |
| `2` | Usage error: unknown command or flag, missing or invalid argument, a destructive command run without a terminal and without its skip-confirmation flag, a credential passed on the command line, or a bulk selection over `DAP_BULK_MAX_ITEMS` |
| `3` | Authentication or authorization failed: HTTP 401 or 403 from any request (v0.33.0+) |
| `4` | Aborted by policy: a `--plan` no longer matches the selection; nothing changed (v0.33.0+) |
| `10` | `upgrade --check` only: a newer version is available |
| `124` | `--timeout` passed (`executions wait\|watch\|logs --follow`, `deployments logs --follow`, `deployments delete --wait`). The CLI stopped waiting; the execution or delete keeps running |

> `blueprint lint` exits `0` even when it reports findings; check `errorsFound` in the `--json` output.

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
| `401 / 403` from orchestrator (exit 3) | Run `dap-bpa setup` to configure orchestrator credentials, then `dap-bpa status` to verify. A 403 message starts with the server's reason. Check that `DAP_CLIENT_ID` / `DAP_CLIENT_SECRET` / `DAP_ORG_ID` / `DAP_TOKEN` are not set to stale values, since they override `config.json` |
| `Credential values are not accepted as command-line arguments` (exit 2) | Pass credentials through `DAP_TOKEN`, `DAP_CLIENT_ID`, `DAP_CLIENT_SECRET`, and `DAP_ORG_ID` instead of flags |
| Command fails with a `tunnel start` hint | The profile defines an SSH tunnel that is not running: run the printed `dap-bpa orchestrator tunnel start` command, or add `--no-tunnel` |
| `ERR_TUNNEL_PORT_CONFLICT` | Every local port from `18443` to `18500` is taken; free one or pass `--port` |
| `blueprint upload` hangs or fails | Re-run `dap-bpa blueprint lint --file <path> --verify` locally first |
| Deployment stuck | `dap-bpa orchestrator events get <execution_id>` for live events |
| Unknown command | `dap-bpa --help` to rediscover command groups and their subcommands |
| `TLS error connecting to <host>` | Trust the orchestrator's CA with `dap-bpa setup --ca-cert <pem>` (or `DAP_CA_CERT`). Use `--trust-all` only for self-signed lab certificates; on v0.33.0 and earlier it did not cover token calls on the compiled binary, so upgrade to v0.33.1 |

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
dap-bpa orchestrator secrets create gcp_service_account \
  --value-from-file ~/sa-key.json \
  --update-if-exists

echo "Step 6: Upload and deploy"
dap-bpa orchestrator blueprints upload --file ./gcp-blueprint --id gcp-app --revision 1.0.0
dap-bpa orchestrator deployments create --blueprint-id gcp-app --inputs ./inputs.json
```

### Workflow 3: CI/CD Pipeline with Token-Based API Access

```bash
#!/bin/bash
# GitHub Actions / CI pipeline workflow

set -e

# Step 1: Credentials come from CI secrets as environment variables
# (v0.33.0+: no config file needed; credential flags are rejected)
export DAP_CLIENT_ID="$CI_DAP_CLIENT_ID"
export DAP_CLIENT_SECRET="$CI_DAP_CLIENT_SECRET"
export DAP_ORG_ID="$CI_DAP_ORG_ID"

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

- **CLI version**: this reference covers dap-bpa v0.33.1
- **Breaking changes (v0.33.0)**:
  - Credential values on the command line (`--token`, `--client-secret`, `--password`, `--secret`, `--api-token`) are rejected with exit 2; use `DAP_*` environment variables
  - HTTP 401/403 exit 3 (was 1); a bulk `--plan` mismatch exits 4
  - Bulk delete and cancel need a narrowing filter and a typed count (no `--yes`), and are capped at `DAP_BULK_MAX_ITEMS` (default 20)
  - Bulk `secrets delete` is removed
  - `deployments set-labels` requires `--replace`
  - `deployments update --body` accepts only `name`, `description`, and `tags`
  - `plugins delete <id>` asks for confirmation (use `--yes` in scripts)
- **Breaking changes (v0.32.0)**:
  - Usage errors exit 2 (was 1)
  - `blueprints delete --force` deprecated in favor of `--yes`
  - `secrets create` uses positional `<name>` (was `--key`); `--value` removed - use `--value-from-file` or `--value-from-stdin`
  - `wait`/`watch`/`logs --follow` exit 124 on timeout (was 1), default 1-hour timeout
  - `blueprints download --extract-to` refuses non-empty target unless `--overwrite`
  - `blueprints delete`/`download`, `plugins delete`, `secrets delete`, `uninstall` print JSON when piped (was text)
- **Breaking change (v0.31.0)**: the `bpa` command alias is removed; only `dap-bpa` ships - update any scripts or PATH aliases
- **Setup**: Section 2 - Installation
- **Authentication**: Section 3 - Orchestration Service Authentication
- **SSH tunnels**: Section 16 - Tunnel Connections
- **Blueprint Monitoring**: Section 8 - Blueprint Monitoring
- **Blueprint Reasoning**: Section 9 - Blueprint Reasoning
- **Hands-on exercises**: Section 12 - Hands-on Workshop
