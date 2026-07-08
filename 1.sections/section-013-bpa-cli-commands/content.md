# Section 013: dap-bpa CLI Command Reference

A practical reference for the `dap-bpa` CLI, organized by workflow. Every command supports `--help`; use `dap-bpa --help` to discover top-level command groups and `dap-bpa <group> --help` to drill into any group.

## How to Use This Reference

- **Angle brackets** `<value>` = required argument you supply
- **Square brackets** `[--flag]` = optional flag
- **Global flags**: `--help`, `--json` (force JSON output), `--fields <a b c>` (limit returned fields), `--trust-all` (bypass SSL verification, dev only), `--orchestrator <name>` or `-o <name>` (select a configured orchestrator profile). `--dry-run` previews without writing on the commands that support it (`knowledge blueprints add`, `knowledge plugins fetch`, `setup-ide`).

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

# — OR — do steps 3-5 automatically with the Monitor Agent:
dap-bpa monitor --file my-blueprint/blueprint.yaml --inputs '{"key":"val"}'
```

---

## Command Groups

### Authentication & Setup

| Command | Purpose |
| --------- | --------- |
| `dap-bpa setup` | Interactive wizard — orchestrator URL, tenant, LLM credentials (Bedrock / OpenAI) |
| `dap-bpa setup-ide <ide>` | Install dap-bpa skills into a supported IDE. Supported IDEs: windsurf, claude-code, cursor, jetbrains, vscode, antigravity |
| `dap-bpa status` | Check current setup status and verify orchestrator connection |
| `dap-bpa upgrade --file <zip>` | Replace running binary from a new distribution zip |
| `dap-bpa mcp-server` | Start the Blueprint Assist MCP server locally (v0.27.0+) |

### Blueprint Authoring & Validation

| Command | Purpose |
| --------- | --------- |
| `dap-bpa blueprint lint --file <path>` | Lint a blueprint YAML; also verifies imported files exist (v0.27.0+) |
| `dap-bpa blueprint lint --file <path> --verify` | Lint + zero-byte file check |
| `dap-bpa blueprint lint --file <path> --report-fp` | Lint and emit a false-positive report |
| `dap-bpa blueprint lint --content "<yaml>"` | Lint a YAML string directly (no file) |
| `dap-bpa blueprint validate <node> --file <path>` | Validate a specific node template |
| `dap-bpa blueprint validate-all --file <path>` | Validate every node template in the blueprint |

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
| `dap-bpa knowledge blueprints scan <dir>` | **DEPRECATED** — use `add` instead |
| `dap-bpa knowledge blueprints registry <file>` | **DEPRECATED** — use `add` instead |

### Knowledge: Node Types

Resolve TOSCA / plugin node types referenced in blueprints.

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge plugins list <plugin>` | List node types provided by a plugin |
| `dap-bpa knowledge plugins get <plugin> <node_type>` | Get a specific plugin node type |
| `dap-bpa knowledge plugins docs <plugin>` | Full plugin reference |
| `dap-bpa knowledge plugins node-type-docs <plugin> <node_type>` | Docs for a specific node type |

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

| Command | Purpose |
| --------- | --------- |
| `dap-bpa knowledge plugins fetch <plugin>` | Fetch plugin docs from upstream |
| `dap-bpa knowledge plugins fetch --all` | Fetch docs for every registered plugin |
| `dap-bpa knowledge plugins add <name-or-path>` | Import a custom plugin to the knowledge base |

### Orchestrator: Blueprints

| Command | Purpose |
| --------- | --------- |
| `dap-bpa orchestrator blueprints upload --file <path> --id <id> --revision <ver>` | Upload a blueprint archive; prints DAP console inventory URL on success (v0.27.0+) |
| `... --application-file-name <name>` | Upload with a custom entrypoint file |
| `... --visibility <visibility>` | Set blueprint visibility |
| `dap-bpa orchestrator blueprints get <blueprint_id> --fields id state` | Check upload / processing state |
| `dap-bpa orchestrator blueprints list [--filter <expr>]` | List blueprints |
| `dap-bpa orchestrator blueprints delete <id> [--force]` | Delete a blueprint |

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

1. Uploads the blueprint archive (zip archives with loose files are auto-repacked with a wrapping directory)
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
| `dap-bpa monitor --status` | Show status of most recent session |
| `dap-bpa monitor --status --execution-id <id>` | Show status of a specific session |
| `dap-bpa monitor --status --session-id <id>` | Show status by session ID |
| `dap-bpa monitor --daemon-status` | Show whether the background daemon is running |
| `dap-bpa monitor --daemon-stop` | Stop the background daemon |

---

## Common Flags & Patterns

### Help & Discovery

```bash
dap-bpa --help                       # top-level groups
dap-bpa orchestrator --help          # one group
dap-bpa orchestrator deployments --help
dap-bpa monitor --help
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
| `command not found: bpa` | `bpa` is deprecated as of v0.27.0 — use `dap-bpa` instead. If `dap-bpa` is also missing, re-run the installer (Section 2) and open a new terminal |
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

## Reference

- **CLI version**: this reference covers dap-bpa v0.27.0
- **Deprecation note**: the `bpa` command alias is deprecated as of v0.27.0; use `dap-bpa` for all commands
- **Setup**: Section 2 — Installation
- **Authentication**: Section 3 — Orchestration Service Authentication
- **Blueprint Monitoring**: Section 8 — Blueprint Monitoring
- **Blueprint Reasoning**: Section 9 — Blueprint Reasoning
- **Hands-on exercises**: Section 12 — Hands-on Workshop
