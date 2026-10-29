# Section 019: Blueprint Assist MCP Server

> **Integration reference: Model Context Protocol (MCP) servers for Blueprint Assist.** This section covers both MCP server components - the gateway for direct DAP operations and the agent server for natural-language queries - and how to connect MCP-compatible clients to each.

## Overview

The Dell Automation Platform MCP server allows external applications’ LLMs/AI Assistants to interact with Dell Automation Platform without the need for custom API integration.  Via the MCP server, AI Assistants can query about existing documentation and plugins, blueprints on the Orchestrator, and deploy blueprints.  Dell Automation Platform’s Blueprint AI Assistant also leverages this MCP Server to manage blueprints on the Orchestrator.

Blueprint Assist exposes two MCP servers, each serving a different use case:

| Server | Purpose | Tools | Endpoint |
| --- | --- | --- | --- |
| **MCP Server** (gateway) | Direct DAP operations - blueprints, deployments, plugins, secrets | ~37 tools (some credential-free) | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| **Agent MCP Server** | Natural-language agent queries and granular blueprint-authoring tools | `ask_bpa_agent` (natural language) plus 2 decision-trace tools and 13 stateless authoring/pattern tools | `https://agent-mcp-server.sp.dell.com/mcp` |

Both servers implement the [Model Context Protocol](https://modelcontextprotocol.io/) and can be connected to IDEs (VS Code, Windsurf), AI agents, or custom applications.

**Local deployment options:**

- **MCP Server (gateway)**: Run locally via `dap-bpa mcp-server` (v0.27.0+)

- **Agent MCP Server**: Download the `agent-mcp-server` container image (`agent-mcp-server-0.32.0.tar.gz`) from [Dell Automation Studio](https://automation.dell.com/catalog) and run it with Podman or Docker (v0.32.0+)

---

## Which Server Should I Use?

| Use Case | Recommendation |
| --- | --- |
| IDE integration for blueprint development | Agent MCP Server (authoring tools) or MCP Server (gateway) |
| AI agent that needs structured DAP operations | MCP Server (gateway) |
| Natural-language queries ("list my blueprints", "deploy X") | Agent MCP Server |
| Blueprint planning, editing, reviewing, packaging | Agent MCP Server (granular authoring tools) |
| Pattern learning / customer inventory conventions | Agent MCP Server (pattern MCP tools) |
| Knowledge tools (node types, docs, linting) without credentials | MCP Server (gateway) |
| Blueprint description generation from a ZIP package | Agent MCP Server |
| Local CLI-based workflows | `dap-bpa` CLI (Section 13) |
| Local agent server for development/testing | `agent-mcp-server` container image (v0.32.0+) |
| Air-gapped or offline environments | `agent-mcp-server` container (`BPA_DEPLOYMENT_MODE=air-gapped` + local LLM) + `dap-bpa mcp-server` |

---

## Authentication

As of v0.29.3 the MCP servers use an **OIDC customer-token** model. Callers obtain a short-lived token from the DAP portal and pass it in the `x-dap-customer-token` header; the server uses pinned service-account configuration to acquire the actor token and perform delegated exchange. Raw `x-dap-client-id`/`x-dap-client-secret` forwarding has been removed from the cloud endpoints. Orchestrator and organization context are still supplied via headers; the portal domain is no longer read from request headers.

| Header | Value |
| --- | --- |
| `x-dap-customer-token` | OIDC token obtained from the DAP portal |
| `x-dap-orchestrator-domain` | Your orchestrator hostname |
| `x-dap-org-id` | Your organization ID |

```bash
export DAP_CUSTOMER_TOKEN="<your-customer-token>"
export DAP_ORCHESTRATOR_DOMAIN="<your-orchestrator-domain>"
export DAP_ORG_ID="<your-org-id>"
```

---

## Server 1: MCP Server (Gateway)

### Gateway: What It Does

The MCP Server is a gateway that exposes DAP operations as MCP tools. Tools are organized in two tiers:

- **Knowledge tools** - no credentials required (node types, docs, linting, examples)
- **DAP tools** - credentials required (blueprints, deployments, plugins, secrets)

### Tool Catalog

#### Knowledge Tier (no credentials required)

| Tool | Description | Key Parameters |
| --- | --- | --- |
| `get_datetime` | Current server time | _(none)_ |
| `list_node_types` | List node types for a plugin | `plugin_name` |
| `get_node_type` | Get node type schema | `plugin_name`, `node_type_name` |
| `get_plugin_docs` | Plugin documentation | `plugin_name` |
| `get_node_type_docs` | Node type documentation | `plugin_name`, `node_type_name` |
| `search_docs` | Search documentation | `query` |
| `find_blueprint_examples` | Find example blueprints | `query` _(required)_ |
| `get_blueprint_example` | Get a specific example | `example_id` |
| `lint_blueprint` | Validate blueprint YAML | `blueprint_content` _(only; `filename` not accepted)_ |
| `fetch_github_context` | Fetch context from GitHub | `repo_url`, `file_paths` _(array, required)_ |

#### DAP Tier (credentials required)

**Read**: `list_blueprints`, `get_blueprint`, `list_deployments`, `get_deployment`, `list_executions`, `get_execution`, `list_events`, `get_events`, `list_plugins`, `get_plugin`, `list_secrets`

**Write**: `create_blueprint`, `update_blueprint`, `delete_blueprint`, `stamp_blueprint`, `create_deployment`, `update_deployment`, `delete_deployment`, `start_execution`, `cancel_execution`, `resume_execution`, `create_secret`, `update_secret`, `delete_secret`, `upload_plugin`, `delete_plugin`, `summarize_blueprint_description`

### Gateway: Connecting an IDE

#### VS Code

VS Code 1.99+ has native MCP support. Create `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "blueprint-assist": {
      "type": "http",
      "url": "https://ai-bp-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "${input:dapCustomerToken}",
        "x-dap-org-id": "${input:dapOrgId}",
        "x-dap-orchestrator-domain": "${input:dapOrchestratorDomain}"
      }
    }
  },
  "inputs": [
    {
      "id": "dapCustomerToken",
      "type": "promptString",
      "description": "DAP customer OIDC token (obtain from the DAP portal)",
      "password": true
    },
    {
      "id": "dapOrgId",
      "type": "promptString",
      "description": "DAP Org ID"
    },
    {
      "id": "dapOrchestratorDomain",
      "type": "promptString",
      "description": "DAP Orchestrator domain (e.g. your-orchestrator.automation.dell.com)"
    }
  ]
}
```

VS Code will prompt for each value on first use and cache them per session. The `"password": true` flag masks the customer token.

If you prefer no prompts, replace `${input:...}` with literal values - but add `.vscode/mcp.json` to `.gitignore` if you do.

**Verify the connection:**

1. `Ctrl+Shift+P` → **MCP: List Servers**
2. `blueprint-assist` should be listed - click **Start Server** if not running

| Issue | Fix |
| --- | --- |
| Server not listed | Reload VS Code window after creating the file |
| DNS errors on portal/orchestrator domains | Connect to AWS VPN first |
| Auth errors | Double-check all 5 header values match your DAP client credentials |
| `mcp-session-id` errors | VS Code handles session init automatically - restart via **MCP: List Servers** |

#### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "blueprint-assist": {
      "serverUrl": "https://ai-bp-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "<YOUR_ORCHESTRATOR_DOMAIN>",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    }
  }
}
```

#### Local (CLI) for Development

As of v0.27.0, you can run the MCP server locally using the CLI:

```bash
dap-bpa mcp-server
```

Then configure your MCP client to connect to the local server (`http://localhost:<port>/mcp`). Use `dap-bpa mcp-server --help` for available flags.

For source-level development against the repo:

```json
{
  "servers": {
    "blueprint-assist-local": {
      "command": "node",
      "args": ["<path-to-repo>/packages/mcp-server/dist/server.js", "--stdio"]
    }
  }
}
```

### MCP Protocol Usage

All requests go to `POST /mcp`.

**Knowledge-tier tools are stateless** - they do not require an `initialize` call or a session ID. Call them directly. DAP-tier tools require credential headers on every request; if your client also sends a session ID from a prior `initialize`, the server will accept it, but it is not required for credential-bearing requests either.

#### Call a knowledge tool (no credentials, no session required)

```bash
curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "lint_blueprint",
      "arguments": {"blueprint_content": "tosca_definitions_version: dell_1_1\ndescription: my blueprint"}
    }
  }'
```

#### Initialize a session (optional; used by some MCP clients)

```bash
SESSION_RESPONSE=$(curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -D - \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {"name": "my-app", "version": "1.0"}
    }
  }')

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -i 'mcp-session-id:' | awk '{print $2}' | tr -d '\r')
```

> `initialize` requires credentials (`x-dap-*` headers) and returns `401 AUTH_MISSING_HEADERS` without them. Most MCP-compatible clients (VS Code, Windsurf) handle session init automatically - you do not need to manage this manually.

#### Call a DAP tool (credentials required)

```bash
curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_blueprints",
      "arguments": {"limit": 10}
    }
  }'
```

> The `Accept: application/json, text/event-stream` header is required on every `/mcp` request. Omitting it returns `406 Not Acceptable`.

---

## Server 2: Agent MCP Server

### Agent: What It Does

The Agent MCP Server wraps Blueprint Assist's LLM agent in an HTTP/MCP interface. You can send natural-language queries (the server internally orchestrates skills using Claude Sonnet via AWS Bedrock) or call granular, stateless, text-in/text-out blueprint-authoring tools directly.

It exposes the following interfaces:

1. **`POST /mcp`** - MCP endpoint exposing the natural-language `ask_bpa_agent` tool, the decision-trace tools, and the granular authoring/pattern tools
2. **`POST /api/v1/invoke`** (+ `POST /api/v1/invoke/confirm`) - REST endpoint for natural-language agent queries and destructive-action confirmation
3. **`POST /api/v1/blueprints/summarize`** - AI-generated blueprint descriptions from ZIP packages
4. **`POST /api/v1/scans/day2-upgrade`** - Day-2 upgrade scan of a deployment (DAP logs, CVEs, third-party patches)
5. **`POST /rest/v1/question_sessions`** and **`PATCH /rest/v1/question_sessions/:session_id`** - Question Engine for interactive prompt refinement
6. **`GET /rest/v1/prompt_examples`** - Example prompts for an intent
7. **`GET /rest/v1/llm_usage`**, **`/users`**, **`/balance`** - LLM token usage and balance for your org
8. **`GET /docs`** (v0.28.0+) - unauthenticated endpoint that returns human-readable connection instructions (required headers, a token-acquisition one-liner, and a `curl` example). Auth errors on actionable paths now include `hint` and `docs` fields pointing here, so a rejected request tells you exactly how to connect. This endpoint is served by the v0.32.0 agent container (verified locally). As of 2026-10-16, `GET /docs` returned `404` on both hosted endpoints (`agent-mcp-server.sp.dell.com` and `ai-bp-mcp-server.sp.dell.com`), so don't rely on it there.

### Agent Authoring & Pattern Tools (v0.29.3+)

The Agent MCP Server now registers small, stateless tools in addition to the legacy monolithic `ask_bpa_agent`:

| Tool | Purpose |
| --- | --- |
| `plan_blueprint` | Scaffold a blueprint plan from a natural-language description |
| `edit_blueprint` | Apply a change request and/or lint errors to a file set |
| `review_blueprint` | Score and review a file set with structured issues/suggestions |
| `summarize_blueprint` | Generate a natural-language summary plus component/deployment-type classification |
| `package_blueprint` | Assemble a file set into a base64 ZIP compatible with `create_blueprint`, auto-generating `metadata.yaml` |
| `get_authoring_guide` | Bundled static authoring reference docs |
| `get_mcp_guide` | Bundled static MCP reference docs |
| `complete_code` | Tiered inline completion (schema → docs retrieval → single token-capped LLM call) at a cursor position |
| `pattern_trigger_learning_run` | Extract candidate customer patterns from a directory of blueprint YAML files (optional exemplar blueprint IDs weight confidence higher) |
| `pattern_query_local` | Query the local pattern knowledge base by pattern type and confidence |
| `pattern_record_decisions` | Apply accept/override/reject decisions to customer pattern candidates |
| `pattern_run_validate` | Validate blueprint YAML content against a pattern set's learned customer patterns |
| `pattern_get_trigger_words` | Return trigger words, example prompts, and the pattern-dependency flag for each skill |

All `pattern_*` tools take a pattern-set name (a DAP profile).

These tools are thin adapters over the shared authoring and pattern libraries used by the CLI, so behavior stays consistent whether you call them from an IDE, an agent, or the terminal. For the full customer-pattern workflow (extraction pipeline, confidence scoring, review, CI gating), see [Section 023 - Customer Pattern Learning](../section-023-customer-patterns/content.md).

### Agent: Connecting an IDE

```json
{
  "servers": {
    "blueprint-assist-agent": {
      "type": "http",
      "url": "https://agent-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "${input:dapCustomerToken}",
        "x-dap-org-id": "${input:dapOrgId}",
        "x-dap-orchestrator-domain": "${input:dapOrchestratorDomain}"
      }
    }
  },
  "inputs": [
    {
      "id": "dapCustomerToken",
      "type": "promptString",
      "description": "DAP customer OIDC token (obtain from the DAP portal)",
      "password": true
    },
    {
      "id": "dapOrgId",
      "type": "promptString",
      "description": "DAP Org ID"
    },
    {
      "id": "dapOrchestratorDomain",
      "type": "promptString",
      "description": "DAP Orchestrator domain (e.g. your-orchestrator.automation.dell.com)"
    }
  ]
}
```

### Agent: Running Locally (v0.32.0+)

As of v0.32.0, the Agent MCP Server is available as a downloadable **container image** (`agent-mcp-server-0.32.0.tar.gz`, OCI/Docker archive) from [Dell Automation Studio](https://automation.dell.com/catalog). This allows you to run the full agent server locally for development, testing, or air-gapped environments.

> **Ready-made kit**: [`4.examples/agent-mcp-server-local/`](https://github.com/tme-tech-ops/blueprint-assist-training/blob/main/4.examples/agent-mcp-server-local/README.md) contains a `compose.yaml`, an annotated `env.example`, and smoke tests for the steps below (`smoke-test.sh` for bash, `smoke-test.ps1` for Windows PowerShell).

| Image detail | Value |
| --- | --- |
| Image tag | `agent-mcp-server:0.32.0` |
| Base | Alpine 3.23, Node.js 20 |
| Size | ~125 MB compressed / ~453 MB loaded |
| Listens on | `3000/tcp` (`PORT` env var) |
| Runs as | UID/GID `1001:1001` (non-root) |
| Healthcheck | `GET /health` every 30s |

#### Prerequisites

- Podman (recommended; on Windows/macOS run `podman machine init` once and `podman machine start` after each reboot) with a compose provider (`docker-compose` or `podman-compose`) on `PATH`. Docker Desktop also works: swap `podman` for `docker`
- A DAP **service-account** (predefined client) ID and secret - the server uses these to perform delegated token exchange for every caller
- An LLM backend: AWS credentials with Bedrock access (connected mode) **or** a local LLM endpoint (air-gapped mode)

#### Load and Run

```bash
# 1. Start the Podman VM (Windows/macOS; `podman machine init` once first)
podman machine start                                  # Docker: start Docker Desktop

# 2. Load the image
podman load -i agent-mcp-server-0.32.0.tar.gz        # or: docker load -i ...

# 3. Configure (see Environment Variables below)
cd 4.examples/agent-mcp-server-local
cp env.example .env                                  # edit values

# 4. Start
podman compose up -d                                  # or: docker compose up -d
# Equivalent without compose:
# podman run -d --name agent-mcp-server --env-file .env -p 127.0.0.1:3000:3000 -v bpa-data:/home/nodeapp agent-mcp-server:0.32.0

# 5. Verify
curl -s http://localhost:3000/health                  # {"status":"ok",...}
curl -s http://localhost:3000/docs                    # connection instructions + token recipe
```

After a reboot, run steps 1 and 4 again (`podman machine start`, then `podman compose up -d`). Podman has no background daemon, so `restart: unless-stopped` doesn't bring the container back when the VM restarts.

There are no CLI flags - all configuration is via environment variables. To change the host port, change the port mapping (e.g. `-p 127.0.0.1:8080:3000`) or set `HOST_PORT=8080` for the compose file.

The server **fails fast** at startup if required configuration is missing:

```text
[agent-mcp-server] Fatal: missing required environment variable AWS_REGION
[agent-mcp-server] Missing required environment variables: DAP_PREDEFINED_CLIENT_ID, DAP_PREDEFINED_CLIENT_SECRET, DAP_PORTAL_DOMAIN. Refusing to start ...
[agent-mcp-server] DAP_ALLOWED_ORCHESTRATOR_DOMAINS must be configured. ... Refusing to start without a pinned allowlist (SSRF risk).
```

The local server exposes the same endpoints as the cloud-hosted version, including:

- `POST /mcp` - MCP endpoint for tools

- `POST /api/v1/invoke` (+ `/api/v1/invoke/confirm`) - REST endpoint for natural-language queries
- `POST /api/v1/blueprints/summarize` - Blueprint summarization
- `POST /api/v1/scans/day2-upgrade` - Day-2 upgrade scan
- `POST /rest/v1/question_sessions`, `PATCH /rest/v1/question_sessions/:session_id` - Question Engine
- `GET /rest/v1/prompt_examples`, `/rest/v1/llm_usage` - Prompt examples and LLM usage
- `GET /docs` - Connection instructions (unauthenticated)
- `GET /health` - Liveness (unauthenticated)

#### Obtaining a Customer Token for the Local Server

Callers still send `x-dap-customer-token`. The token must be minted with `scope=internal:exchangeable` and `audience` set to the **local server's** `DAP_PREDEFINED_CLIENT_ID` - otherwise delegation fails with `AUTHENTICATION_FAILED`. `GET /docs` returns the exact recipe for your configuration:

```bash
dap-bpa mint-token --audience <service-account-client-id> --copy
```

> Don't add `--verify --mcp-url http://localhost:3000/mcp`, even though `/docs` suggests it. `--verify` sends `tools/list` without an MCP session, which the Agent MCP Server rejects with `400 No valid session ID provided` before checking the token, so it always reports "inconclusive". Verify with a real `initialize` instead, e.g. `./smoke-test.sh` (or `.\smoke-test.ps1` on Windows) from the local kit with `DAP_CUSTOMER_TOKEN` set.

Don't hand-write the token request: if you can't use the CLI, copy the raw request `GET /docs` shows for this server, so the scope and audience always match its configuration.

#### Connecting an IDE to the Local Agent Server

Configure your MCP client to point to the local server instead of the cloud endpoint:

**VS Code** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "blueprint-assist-agent-local": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "x-dap-customer-token": "${input:dapCustomerToken}",
        "x-dap-org-id": "${input:dapOrgId}",
        "x-dap-orchestrator-domain": "${input:dapOrchestratorDomain}"
      }
    }
  },
  "inputs": [
    {
      "id": "dapCustomerToken",
      "type": "promptString",
      "description": "DAP customer OIDC token",
      "password": true
    },
    {
      "id": "dapOrgId",
      "type": "promptString",
      "description": "DAP Org ID"
    },
    {
      "id": "dapOrchestratorDomain",
      "type": "promptString",
      "description": "DAP Orchestrator domain"
    }
  ]
}
```

**Windsurf** (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "blueprint-assist-agent-local": {
      "serverUrl": "http://localhost:3000/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "<YOUR_ORCHESTRATOR_DOMAIN>",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    }
  }
}
```

#### Building Blueprints with Devin Desktop and the Local Agent Server

> **Full step-by-step guide**: [`4.examples/agent-mcp-server-local/README.md` → _Building Blueprints from Devin Desktop_](https://github.com/tme-tech-ops/blueprint-assist-training/blob/main/4.examples/agent-mcp-server-local/README.md#building-blueprints-from-devin-desktop), with a ready-made [`devin-desktop-mcp-config.json`](https://github.com/tme-tech-ops/blueprint-assist-training/blob/main/4.examples/agent-mcp-server-local/devin-desktop-mcp-config.json).

**Connect two servers.** The Agent MCP Server has the authoring tools but no knowledge or lint tools, so pair it with the gateway:

| Devin Desktop entry | `serverUrl` | Provides |
| --- | --- | --- |
| `bpa-gateway` | `https://ai-bp-mcp-server.sp.dell.com/mcp` | Node types, docs, examples, `lint_blueprint`, `create_blueprint` |
| `bpa-agent-local` | `http://localhost:3000/mcp` | `plan_blueprint`, `edit_blueprint`, `review_blueprint`, `package_blueprint`, `complete_code`, `pattern_*`, `ask_bpa_agent` |

**Authoring loop:** `plan_blueprint` → research with `list_node_types` / `get_node_type_docs` / `find_blueprint_examples` → `edit_blueprint` → `lint_blueprint` (repeat edit/lint until clean) → `review_blueprint` → `package_blueprint` → `create_blueprint`.

**Setup checklist** (details for each step in the kit README):

1. **Network**: the orchestrator and portal must resolve and be reachable. For a lab environment, connect to its VPN; hosts-file entries must be repeated in `compose.yaml` `extra_hosts`, because the container doesn't see your Windows `hosts` file.
2. **Portal and service account**: `DAP_PORTAL_DOMAIN` and `DAP_PREDEFINED_CLIENT_ID`/`SECRET` must come from the **same portal** that issues your tokens. For a lab environment that's the lab's own portal, not the production portal.
3. **Allowlist**: add your orchestrator to `DAP_ALLOWED_ORCHESTRATOR_DOMAINS` (e.g. `*.<lab-domain>`), or requests fail with `INVALID_DOMAIN`.
4. **TLS**: the server always verifies certificates. For self-signed lab portals, mount the lab CA and set `NODE_EXTRA_CA_CERTS=/certs/lab-ca.pem`.
5. **Restart and test from inside the container**: `podman exec agent-mcp-server wget -q --spider https://<portal>`.
6. **Token**: mint with `--audience` set to the local server's `DAP_PREDEFINED_CLIENT_ID` (a hosted-server token won't work), then verify with `smoke-test.sh` / `smoke-test.ps1` (not `mint-token --verify`, see above). The gateway entry keeps using your normal token.
7. **Devin Desktop**: paste both entries with their tokens and org ID; `bpa-agent-local` should list 16 tools.
8. **Token refresh**: tokens are short-lived and Devin's headers are static. Re-mint and paste when calls start returning `AUTHENTICATION_FAILED`.

> **Destructive actions**: deletes, `start_execution`, `cancel_execution`, and `create_secret` via `ask_bpa_agent` need MCP elicitation (a human approve/deny prompt). Devin Desktop support for elicitation has not been verified. If calls return `refused_no_elicitation`, perform those operations with the gateway tools or the `dap-bpa` CLI.

#### Environment Variables

The local agent server is configured entirely via environment variables (see [`env.example`](https://github.com/tme-tech-ops/blueprint-assist-training/blob/main/4.examples/agent-mcp-server-local/env.example)).

**Required** - the server refuses to start without these:

| Variable | Description |
| --- | --- |
| `AWS_REGION` | AWS region for Bedrock (e.g. `us-east-1`); required even in air-gapped mode |
| `DAP_PREDEFINED_CLIENT_ID` | Service-account client ID used for delegated token exchange (also the token `audience`) |
| `DAP_PREDEFINED_CLIENT_SECRET` | Service-account client secret |
| `DAP_PORTAL_DOMAIN` | Pinned DAP portal domain (e.g. `dsp-portal.automation.dell.com`) - never read from headers |
| `DAP_ALLOWED_ORCHESTRATOR_DOMAINS` | Comma-separated orchestrator hostnames/wildcards (e.g. `*.automation.dell.com`); requests for other domains get `INVALID_DOMAIN` |

**LLM backend - connected mode (default, AWS Bedrock):**

| Variable | Description | Default |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` | Bedrock credentials (standard AWS SDK chain; `AWS_PROFILE` also works with a mounted `~/.aws`) | _(none)_ |
| `BEDROCK_MODEL_NAME` | Bedrock model ID | `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| `BEDROCK_TIMEOUT_MS` / `AGENT_TIMEOUT_MS` | Bedrock call / agent orchestration timeouts | `60000` |

**LLM backend - air-gapped mode (local LLM endpoint):**

| Variable | Description | Default |
| --- | --- | --- |
| `BPA_DEPLOYMENT_MODE` | `connected` or `air-gapped` | `connected` |
| `LLM_ENDPOINT_URL` | Local LLM base URL; must be loopback or a private IP in air-gapped mode | _(none)_ |
| `LLM_ENDPOINT_PROVIDER` | API shape: `anthropic`, `openai`, `bedrock`, `llama` | _(none)_ |
| `LLM_MODEL` | Model name to request | provider default |
| `LLM_CREDENTIAL` | Resolved API key for the local endpoint | _(none)_ |
| `LLM_TIMEOUT_MS` | Per-request timeout | `30000` |

If air-gapped mode is set but the local endpoint is missing or unreachable, the server stays up in a degraded, linter-only mode (`MODEL_BACKEND_DEGRADED`).

**Optional:**

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Container listen port | `3000` |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` |
| `ENTITLEMENT_MODE` | BPA license check: `enforce`, `dry-run` (log only), `skip` (local dev only) | `enforce` |
| `BPA_ANALYTICS_ENABLED` | Set `false` to disable analytics event shipping | enabled |
| `DAP_DOCS_URL` | URL advertised by `/docs` and in auth-error `docs` hints (set to `http://localhost:3000/docs` locally) | derived from portal domain |
| `BPA_MCP_SESSION_TTL_MIN` | Idle MCP session TTL in minutes | `30` |
| `AGENT_AIR_GAPPED` | `true` hides the decision-trace tools (separate from `BPA_DEPLOYMENT_MODE`) | `false` |
| `NODE_EXTRA_CA_CERTS` | Path (inside the container) to extra CA certs, e.g. a lab CA for self-signed portals/orchestrators | _(none)_ |
| `BPA_PATTERNS_ROOT` | Where pattern sets are stored | `~/.blueprint-assist/knowledge/patterns` |
| `BPA_ANALYTICS_DATA_DIR` | Analytics salt and unsent-event buffer | `~/.blueprint-assist/analytics` |
| `BPA_TRACE_ALLOWED_ROOT` | Restrict decision-trace writes to this directory tree | _(unrestricted)_ |

> **Note**: Unlike the gateway's knowledge tier, every Agent MCP Server tool and REST endpoint (except `/health` and `/docs`) requires the three `x-dap-*` headers - including on a local deployment. A request without them returns `401 MISSING_CREDENTIALS` with `hint`/`docs` fields. `/mcp` is also session-based: you must `initialize` (with credentials) and send the returned `Mcp-Session-Id` on subsequent calls, otherwise you get `400 No valid session ID provided`. MCP clients such as VS Code handle this automatically.

> **Persistent storage**: the container keeps its on-disk state (pattern sets, analytics salt) under `/home/nodeapp/.blueprint-assist`. `podman restart` keeps it, but recreating the container (`compose down`, `up -d` after a `.env` change, image upgrade) wipes it unless a volume is mounted. The kit's `compose.yaml` mounts a named volume `bpa-data` at `/home/nodeapp` for this. Decision traces are written next to the blueprint path the tool receives, so mount your blueprint workspace as well. MCP sessions, question sessions, and pending confirmations are in memory only and don't survive a restart. See [the kit README → *Persistent storage*](https://github.com/tme-tech-ops/blueprint-assist-training/blob/main/4.examples/agent-mcp-server-local/README.md#persistent-storage).

### REST API: `/api/v1/invoke`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/invoke \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{"query": "list my blueprints"}'
```

**Response** (HTTP 200):

```json
{
  "status": "success",
  "summary": "I found 3 blueprints in your DAP orchestrator...",
  "result_payload": {
    "skill_results": [
      {
        "skill": "list_blueprints",
        "status": "success",
        "data": { "items": [...] }
      }
    ]
  },
  "used_skills": ["list_blueprints"],
  "diagnostics": {
    "iterations": 2,
    "stop_reason": "end_turn",
    "token_usage": { "input_tokens": 1234, "output_tokens": 456 }
  }
}
```

| `status` | Meaning |
| --- | --- |
| `success` | Agent completed; all skills succeeded |
| `partial` | Agent ran but some skills failed; partial results in `result_payload` |
| `failed` | Agent threw an exception; see `diagnostics.stop_reason` |

> `/invoke` is a deprecated alias for `/api/v1/invoke`. Migrate to the versioned path.

### Blueprint Summarization: `/api/v1/blueprints/summarize`

Generates an AI description of a blueprint ZIP package. Do not set `Content-Type` manually - let `curl -F` handle it.

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/blueprints/summarize \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -F "blueprint_package=@/path/to/blueprint.zip;type=application/zip" \
  -F "instructions=Focus on networking and security"
```

| Constraint | Limit | Error code |
| --- | --- | --- |
| File type | ZIP only | `invalid_file_type` |
| File size | 50 MB | `file_too_large` |
| Blueprint content | Must contain `blueprint.yaml` at root | `invalid_blueprint_package` |
| Rate limit | 10 req/min per user | `rate_limit_exceeded` |
| Instructions length | 10 KB max | `invalid_instructions` |

### Question Engine REST API (v0.30.1+)

The Question Engine enables interactive prompt refinement and coaching workflows. Use it to ask clarifying questions during blueprint authoring or to guide users through complex decisions. Sessions are scoped to the caller's org; a session ID from another org returns `404 NOT_FOUND`.

#### Start a question session: `POST /rest/v1/question_sessions`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/rest/v1/question_sessions \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "intent": {
      "raw_input": "deploy a 3-tier web application on vSphere",
      "missing_constraints": ["number of web server instances", "database engine"],
      "conflicting_inputs": [],
      "low_confidence": ["network segment for the app tier"],
      "security_risks": [],
      "cost_warnings": []
    },
    "origin": "api"
  }'
```

`intent` is a **structured object**, not a free-text string - questions are generated from the uncertainty signals you list. A plain string is accepted but produces no questions.

| Field | Each entry becomes a question with |
| --- | --- |
| `intent.missing_constraints` | impact `high`, category `correctness` |
| `intent.conflicting_inputs` | impact `high`, category `correctness` |
| `intent.low_confidence` | impact `medium`, category `performance` |
| `intent.security_risks` | impact `high`, category `security` |
| `intent.cost_warnings` | impact `medium`, category `cost` |
| `intent.raw_input` | _(not a question)_ original user text, used for context and secret redaction |
| `origin` | _(not a question)_ `ide`, `cli`, `mcp`, or `api` |

All array fields are optional string arrays. A missing `intent` returns `400 VALIDATION_ERROR`. Credential-looking values in any field are redacted from the generated questions.

**Response** (HTTP 201, illustrative values):

```json
{
  "session_id": "<org-id>:6f1c2a9e-4b7d-4e0a-9c3f-2d8e1b5a7c40",
  "origin": "api",
  "cap": 5,
  "slots_used": 3,
  "questions": [
    {
      "question_id": "q1",
      "text": "How many web server instances do you need?",
      "rationale": "Instance count drives node_templates scaling and load-balancer config",
      "impact": "high",
      "category": "correctness",
      "quick_answers": ["1", "2", "3"],
      "recommended_default": "2"
    },
    {
      "question_id": "q2",
      "text": "Which database engine should be used?",
      "rationale": "Determines the database plugin and node type",
      "impact": "high",
      "category": "correctness",
      "quick_answers": ["postgresql", "mysql", "mssql"],
      "recommended_default": "postgresql"
    },
    {
      "question_id": "q3",
      "text": "Which network segment should the app tier use?",
      "rationale": "Low-confidence input; affects network node configuration",
      "impact": "medium",
      "category": "performance",
      "quick_answers": ["default"],
      "recommended_default": "default"
    }
  ],
  "assumptions": [],
  "coaching_recommended": false
}
```

`cap` is the maximum number of questions for the session (default 5); when the cap is reached, remaining gaps are filled with recorded `assumptions` (`cap_driven: true`) instead of more questions.

#### Submit answers: `PATCH /rest/v1/question_sessions/:session_id`

```bash
curl -s -X PATCH "https://agent-mcp-server.sp.dell.com/rest/v1/question_sessions/$SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "answers": [
      {"question_id": "q1", "value": "3"},
      {"question_id": "q2", "value": "postgresql"}
    ]
  }'
```

`answers` must be an array of `{question_id, value}` objects (values are stored as strings). The response (HTTP 200) is the updated session with each question's `answer` filled in. Once no questions are pending, the session may include `follow_ups` - suggestions with a `category` (`default-applied`, `assumption`, `low-confidence`), `description`, and `action_hint`.

#### Prompt examples: `GET /rest/v1/prompt_examples`

```bash
curl -s -G https://agent-mcp-server.sp.dell.com/rest/v1/prompt_examples \
  --data-urlencode 'intent={"raw_input":"deploy a web app","missing_constraints":["database engine"],"conflicting_inputs":[],"low_confidence":[]}' \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID"
```

Returns `{"examples": [...]}`. The optional `intent` query parameter is a JSON-encoded intent object (same shape as above); an unparseable value returns `200 {"examples": []}`.

### Decision Traces (v0.31.0+)

Decision traces capture the reasoning behind blueprints the agent generates. They are exposed **only as MCP tools** on `/mcp` - there is no REST API for listing or exporting traces.

| Tool | Arguments | Returns |
| --- | --- | --- |
| `get_decision_trace` | `blueprint_id` _(required)_, `org_id` | The structured decision trace for that blueprint |
| `validate_decision_trace` | `blueprint_id` _(required)_, `org_id`, `component_categories` (string array) | `validation_result`, `missing_sections`, `expected_categories`, `recommendations` |

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "validate_decision_trace",
      "arguments": {"blueprint_id": "vsphere-3tier-web"}
    }
  }'
```

Behavior to know:

- **Where traces come from**: a trace is recorded when the agent generates a blueprint (via `ask_bpa_agent` or `/api/v1/invoke`). Traces are held **in memory** on the server instance for 1 hour (max 500 entries), keyed by org + blueprint ID - they do not survive a restart and are not shared across replicas.
- **RBAC**: the caller must have read access to `blueprint_id` on the orchestrator; otherwise the tool returns `AUTHORIZATION_ERROR`. `blueprint_id` must match `[a-zA-Z0-9_.-]+` (`BAD_REQUEST` otherwise).
- **Not found**: `TRACE_NOT_FOUND` when no trace is stored (expired, other instance, or never generated).
- **Air-gapped**: when `AGENT_AIR_GAPPED=true`, both tools are removed from `tools/list` and calls return `UNAVAILABLE_IN_AIR_GAP`.

### LLM Usage REST API

Read-only token-usage endpoints for your org, rate-limited to 60 requests/min per org. The org comes from the verified token, not the raw header, so callers cannot read another org's data.

| Endpoint | Returns |
| --- | --- |
| `GET /rest/v1/llm_usage` | Org-level token consumption |
| `GET /rest/v1/llm_usage/users` | Per-user breakdown (hashed user IDs only, no PII) |
| `GET /rest/v1/llm_usage/balance` | Lightweight remaining-token balance |

```bash
curl -s https://agent-mcp-server.sp.dell.com/rest/v1/llm_usage/balance \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID"
```

These fail closed: if no token cap is configured for the org, or usage storage is unavailable, they return `503` rather than a partial result. On a local container this is the expected response unless quota tracking (`QUOTA_ENABLED=true`, DynamoDB) is configured.

> **Analytics Dashboard**: the dashboard and `/api/v1/analytics/*` APIs are covered in [Section 029 - Analytics Dashboard](../section-029-analytics-dashboard/content.md). They are **not** served by the `agent-mcp-server` v0.32.0 container, so they aren't available on a local deployment.

### Day-2 Upgrade Scan: `POST /api/v1/scans/day2-upgrade`

Scans a running deployment for upgrade issues and returns findings (with optional blueprint-patch suggestions).

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/scans/day2-upgrade \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "deployment_id": "my-deployment",
    "scan_options": {"sources": ["dap_logs", "cve", "third_party_patch"]}
  }'
```

| Source | What it checks |
| --- | --- |
| `dap_logs` | Deployment execution logs, analyzed against the troubleshooting corpus + LLM |
| `cve` | Known CVEs in discovered components (Trivy) |
| `third_party_patch` | Newer npm / PyPI / OCI / Helm versions (OCI and Helm limited to `BPA_PATCH_REGISTRY_ALLOWLIST`) |

Omit `scan_options` to run all sources. The scan times out after 90 seconds (`504 SCAN_TIMEOUT`); a missing or malformed `deployment_id` returns `400`.

### MCP Tool Summary

Full `tools/list` for v0.32.0:

| Group | Tools |
| --- | --- |
| Natural language | `ask_bpa_agent` |
| Decision traces | `get_decision_trace`, `validate_decision_trace` |
| Authoring | `plan_blueprint`, `edit_blueprint`, `review_blueprint`, `summarize_blueprint`, `package_blueprint`, `complete_code`, `get_authoring_guide`, `get_mcp_guide` |
| Patterns | `pattern_trigger_learning_run`, `pattern_query_local`, `pattern_record_decisions`, `pattern_run_validate`, `pattern_get_trigger_words` |

The Question Engine is REST-only - there are no `question_*` MCP tools.

> **v0.32.0 destructive-skill confirmation gate**: Destructive operations (`delete_blueprint`, `delete_deployment`, `cancel_execution`, `start_execution`, `create_secret`) now require explicit approve/deny round-trip instead of blocking outright. REST endpoints (`POST /mcp`, `POST /api/v1/invoke`) return `202 { requiresConfirmation: true, confirmationToken }` and expose `POST /api/v1/invoke/confirm` (+ `/invoke/confirm` alias) to resolve it. MCP endpoint uses native `server.elicitInput()` to ask a human synchronously. Confirmation tokens are one-time, session- and principal-scoped, and bound to a SHA-256 hash of the original arguments. The `BPA_MCP_ALLOW_ECHO_CONFIRMATION` opt-in is removed entirely - clients without MCP elicitation support are now always refused (`refused_no_elicitation`). The injection-pattern output filter covers the agent path.

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│ IDE / Application / AI Agent (MCP Client)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴─────────────┐
              │                          │
              ▼                          ▼
┌─────────────────────────┐  ┌──────────────────────────────┐
│ MCP Server (gateway)    │  │ Agent MCP Server              │
│ /mcp - ~37 tools        │  │ /mcp - ask_bpa_agent +       │
│ customer-token auth     │  │     granular authoring tools │
│ (knowledge tools free)  │  │ /api/v1/invoke               │
│                         │  │ customer-token auth          │
│                         │  │ LLM orchestration (Bedrock)  │
└──────────┬──────────────┘  └──────────────┬───────────────┘
           │                                │
           └──────────────┬─────────────────┘
                          │ HTTPS / REST
                          ▼
           ┌──────────────────────────────┐
           │ Dell Automation Platform     │
           │ Orchestrator                 │
           └──────────────────────────────┘
```

---

## Comparison: CLI vs MCP Server vs Agent MCP Server

| Feature | `dap-bpa` CLI | MCP Server (gateway) | Agent MCP Server |
| --- | --- | --- | --- |
| **Interface** | Shell commands | MCP tools | MCP + REST |
| **Auth** | Config file | customer-token + org/orchestrator headers | customer-token + org/orchestrator headers |
| **Tools/Commands** | ~30 subcommands | ~37 MCP tools | 16 MCP tools (`ask_bpa_agent` + decision-trace + authoring/pattern) |
| **LLM orchestration** | No | No | Yes (Bedrock/Claude) |
| **IDE integration** | Via skills (Section 4) | Native MCP client | Native MCP client |
| **Offline support** | Yes | No | Local container in air-gapped mode (v0.32.0+) |
| **Knowledge tools** | Yes (wiki, patterns, types) | Yes (no auth) | No (authoring/pattern tools instead) |

---

## Troubleshooting

### MCP Server (gateway)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `406 Not Acceptable` | Missing `Accept` header | Add `-H "Accept: application/json, text/event-stream"` |
| `AUTH_MISSING_HEADERS` on DAP tools | Missing credential headers | Verify `x-dap-customer-token`, `x-dap-orchestrator-domain`, and `x-dap-org-id` are set |
| `EXTERNAL_UNREACHABLE` | Auth OK; pod can't reach orchestrator | Check orchestrator domain and network connectivity |
| Knowledge tools return errors | Server unreachable | `curl https://ai-bp-mcp-server.sp.dell.com/health` |

### Agent MCP Server

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401 MISSING_CREDENTIALS` | One or more headers absent | Verify `x-dap-customer-token`, `x-dap-orchestrator-domain`, and `x-dap-org-id` are present |
| `401 AUTHENTICATION_FAILED` | Customer token invalid or expired | Re-acquire the OIDC token from the DAP portal |
| `403 ENTITLEMENT_CHECK_FAILED` | No active BPA license | Verify BPA entitlement in DAP portal |
| `429 QUOTA_EXCEEDED` | Org hit hourly token budget | Wait for reset (see `Retry-After` header) |
| `406 Not Acceptable` on `/mcp` | Missing `Accept` header | Add `-H "Accept: application/json, text/event-stream"` |
| `422 invalid_blueprint_package` | ZIP missing `blueprint.yaml` at root | Check archive structure |

### Agent MCP Server (local container)

| Symptom | Cause | Fix |
| --- | --- | --- |
| Container exits: `missing required environment variable AWS_REGION` | `AWS_REGION` unset | Set it in `.env` (required even in air-gapped mode) |
| Container exits: `Missing required environment variables: DAP_PREDEFINED_CLIENT_ID, ...` | Service-account config missing | Set `DAP_PREDEFINED_CLIENT_ID`, `DAP_PREDEFINED_CLIENT_SECRET`, `DAP_PORTAL_DOMAIN` |
| Container exits: `DAP_ALLOWED_ORCHESTRATOR_DOMAINS must be configured` | No orchestrator allowlist | Set e.g. `DAP_ALLOWED_ORCHESTRATOR_DOMAINS=*.automation.dell.com` |
| `INVALID_DOMAIN` | `x-dap-orchestrator-domain` not in allowlist | Add the hostname/wildcard to `DAP_ALLOWED_ORCHESTRATOR_DOMAINS` |
| `AUTHENTICATION_FAILED: Failed to acquire actor token` | Wrong service-account creds, or token minted without `audience=<DAP_PREDEFINED_CLIENT_ID>` / `scope=internal:exchangeable` | Re-check `.env`; re-mint the token per `GET /docs` |
| `400 No valid session ID provided` | `tools/list`/`tools/call` sent without an `initialize` session | Call `initialize` first and pass `Mcp-Session-Id` |
| `docker: failed to connect to the docker API` | Docker Desktop not running | Start Docker Desktop, or use Podman (`podman machine start`) |
| `MODEL_BACKEND_DEGRADED` | Air-gapped mode with unreachable/invalid `LLM_ENDPOINT_*` | Fix the local LLM endpoint; the server re-probes every 30s |
| Browser shows `Cannot GET /` (or `Cannot GET /mcp`) | Normal: there's no page at `/`, and `/mcp` accepts `POST` only | Open `http://localhost:3000/health` or `/docs` to check the server |

---

## Related Resources

- **Section 002**: Installation & Setup
- **Section 003**: Orchestration Service Authentication
- **Section 004**: Skills Overview (IDE integration)
- **Section 013**: `dap-bpa` CLI Command Reference
- **MCP Specification**: <https://modelcontextprotocol.io/>

---

## Next Steps

1. **For IDE integration**: Add the MCP server config to your VS Code or Windsurf settings and verify knowledge tools work without credentials
2. **For authenticated DAP access**: Add `x-dap-customer-token`, `x-dap-orchestrator-domain`, and `x-dap-org-id` to your IDE MCP config
3. **For natural-language queries from applications**: Use the Agent MCP Server's `/api/v1/invoke` REST endpoint
4. **For blueprint authoring from an IDE**: Use the Agent MCP Server's granular authoring tools (`plan_blueprint`, `edit_blueprint`, `review_blueprint`, etc.)
5. **For CLI-based workflows**: See Section 13 (`dap-bpa` CLI Commands)
