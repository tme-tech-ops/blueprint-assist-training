# Section 019: Blueprint Assist MCP Server

> **Integration reference: Model Context Protocol (MCP) servers for Blueprint Assist.** This section covers both MCP server components - the gateway for direct DAP operations and the agent server for natural-language queries - and how to connect MCP-compatible clients to each.

## Overview

The Dell Automation Platform MCP server allows external applications’ LLMs/AI Assistants to interact with Dell Automation Platform without the need for custom API integration.  Via the MCP server, AI Assistants can query about existing documentation and plugins, blueprints on the Orchestrator, and deploy blueprints.  Dell Automation Platform’s Blueprint AI Assistant also leverages this MCP Server to manage blueprints on the Orchestrator.

Blueprint Assist exposes two MCP servers, each serving a different use case:

| Server | Purpose | Tools | Endpoint |
| --- | --- | --- | --- |
| **MCP Server** (gateway) | Direct DAP operations - blueprints, deployments, plugins, secrets | ~37 tools (some credential-free) | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| **Agent MCP Server** | Natural-language agent queries and granular blueprint-authoring tools | `ask_bpa_agent` (legacy monolithic tool) replaced by a registry of stateless authoring tools plus pattern-learning MCP tools | `https://agent-mcp-server.sp.dell.com/mcp` |

Both servers implement the [Model Context Protocol](https://modelcontextprotocol.io/) and can be connected to IDEs (VS Code, Windsurf), AI agents, or custom applications.

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

1. **`POST /mcp`** - MCP endpoint exposing the natural-language `ask_bpa_agent` tool and the granular authoring/pattern tools
2. **`POST /api/v1/invoke`** - REST endpoint for natural-language agent queries
3. **`POST /api/v1/blueprints/summarize`** - AI-generated blueprint descriptions from ZIP packages
4. **`POST /api/v1/questions/ask`** and **`POST /api/v1/questions/update`** (v0.30.1+) - Question Engine for interactive prompt refinement
5. **`GET /api/v1/decision-traces`** and related endpoints (v0.30.1+) - Decision Trace API for reasoning transparency
6. **`GET /api/v1/analytics/deployments`** and **`POST /api/v1/analytics/export`** (v0.30.1+) - Analytics Dashboard API
7. **`GET /docs`** (v0.28.0+) - unauthenticated endpoint that returns human-readable connection instructions (required headers, a token-acquisition one-liner, and a `curl` example). Auth errors on actionable paths now include `hint` and `docs` fields pointing here, so a rejected request tells you exactly how to connect. This endpoint is available on both the gateway and agent MCP servers.

### Agent Authoring & Pattern Tools (v0.29.3)

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
| `pattern_record_decisions` | Apply accept/override/reject decisions to customer pattern candidates |

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

The Question Engine enables interactive prompt refinement and coaching workflows. Use it to ask clarifying questions during blueprint authoring or to guide users through complex decisions.

#### Start a question session: `POST /api/v1/questions/ask`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/questions/ask \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "intent": "deploy a 3-tier web application",
    "context": {"platform": "vsphere", "environment": "production"}
  }'
```

**Response:**

```json
{
  "session_id": "qs-20260912-001",
  "questions": [
    {
      "id": "q1",
      "text": "How many web server instances do you need?",
      "type": "number",
      "default": 2
    },
    {
      "id": "q2",
      "text": "Which database engine should be used?",
      "type": "choice",
      "options": ["postgresql", "mysql", "mssql"]
    }
  ],
  "status": "awaiting_answers"
}
```

#### Update answers: `POST /api/v1/questions/update`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/questions/update \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{
    "session_id": "qs-20260912-001",
    "answers": {"q1": 3, "q2": "postgresql"}
  }'
```

The response may contain follow-up questions or a final refined prompt ready for blueprint generation.

### Decision Trace REST API (v0.30.1+)

Decision traces capture the reasoning steps, tool calls, and conclusions from agent interactions. Use these endpoints to retrieve and export traces for auditing, debugging, or learning.

#### List traces: `GET /api/v1/decision-traces`

```bash
curl -s -X GET "https://agent-mcp-server.sp.dell.com/api/v1/decision-traces?limit=10" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID"
```

**Response:**

```json
{
  "traces": [
    {
      "trace_id": "dt-20260912-001",
      "timestamp": "2026-09-12T14:30:00Z",
      "intent": "analyze blueprint security",
      "tools_used": ["lint_blueprint", "get_node_type_docs"],
      "status": "completed"
    }
  ],
  "total": 42,
  "has_more": true
}
```

#### Get a specific trace: `GET /api/v1/decision-traces/:trace_id`

```bash
curl -s -X GET https://agent-mcp-server.sp.dell.com/api/v1/decision-traces/dt-20260912-001 \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID"
```

**Response:**

```json
{
  "trace_id": "dt-20260912-001",
  "timestamp": "2026-09-12T14:30:00Z",
  "intent": "analyze blueprint security",
  "steps": [
    {
      "step": 1,
      "action": "lint_blueprint",
      "input": {"file": "blueprint.yaml"},
      "output": {"issues": 2, "warnings": 1},
      "reasoning": "Running lint to identify structural issues before deeper analysis"
    },
    {
      "step": 2,
      "action": "get_node_type_docs",
      "input": {"plugin": "vsphere", "type": "dell.nodes.vsphere.Server"},
      "output": {"properties": ["..."]},
      "reasoning": "Looking up node type to verify security-related properties"
    }
  ],
  "final_decision": "Blueprint has 2 security issues: hardcoded credentials in line 45, overly permissive firewall rule in line 78",
  "confidence": 0.92,
  "alternatives_considered": [
    {"option": "ignore warning W003", "rejected_because": "warning indicates potential secret exposure"}
  ]
}
```

#### Export traces: `POST /api/v1/decision-traces/export`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/decision-traces/export \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{"from": "2026-09-01", "to": "2026-09-12", "format": "json"}'
```

### Analytics Dashboard REST API (v0.31.0+)

The Analytics Dashboard provides deployment insights and usage metrics. The dashboard UI is available at `https://agent-mcp-server.sp.dell.com/dashboard` (requires Dell Identity OIDC authentication via PKCE flow).

**v0.31.0 completion features:**
- **OIDC sign-in**: PKCE authorization-code flow against Dell Identity POC authority
- **Frontend RBAC**: JWT role extraction, route guards (Export tab hidden for viewers), tenant-name masking for non-admins
- **Backend rate limiting**: Rate limits on `/aggregates` and `/trends` endpoints
- **Real data**: All six Overview KPIs, cohort/retention charts, and top-tenants table now use real API data
- **Advanced visualizations**: Dual-line, treemap, stacked area, and box plots on Products/Reliability tabs
- **Rolling windows**: 7/30/90-day rolling window aggregates via `?window=7d`
- **Analytics enabled**: Event collection enabled for dev, staging, and production MCP servers

The REST API enables programmatic access to the same data.

#### Get deployment analytics: `GET /api/v1/analytics/deployments`

```bash
curl -s -X GET "https://agent-mcp-server.sp.dell.com/api/v1/analytics/deployments?period=30d" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID"
```

**Response:**

```json
{
  "period": "30d",
  "summary": {
    "total_deployments": 127,
    "successful": 118,
    "failed": 9,
    "success_rate": 0.929
  },
  "by_blueprint": [
    {"blueprint_id": "vsphere-vm", "count": 45, "success_rate": 0.96},
    {"blueprint_id": "k8s-cluster", "count": 32, "success_rate": 0.91}
  ],
  "by_day": [
    {"date": "2026-09-11", "deployments": 8, "successful": 7},
    {"date": "2026-09-12", "deployments": 5, "successful": 5}
  ]
}
```

#### Export analytics: `POST /api/v1/analytics/export`

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/analytics/export \
  -H "Content-Type: application/json" \
  -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-org-id: $DAP_ORG_ID" \
  -d '{"period": "90d", "format": "csv", "include": ["deployments", "errors", "usage"]}'
```

Returns a CSV file with detailed deployment history, error breakdowns, and usage metrics for reporting and compliance.

### Additional MCP Tools (v0.31.0+)

The Agent MCP Server exposes these additional tools for v0.30.1+ and v0.31.0 features:

| Tool | Purpose |
| ---- | ------- |
| `question_ask` | Start a question session with an intent |
| `question_update` | Submit answers and get follow-up questions or refined prompt |
| `decision_trace_list` | List available decision traces |
| `decision_trace_get` | Retrieve a specific trace by ID |
| `decision_trace_export` | Export traces in structured format |
| `get_decision_trace` | Retrieve decision trace for a blueprint (v0.31.0+, RBAC-gated on blueprint_id) |
| `validate_decision_trace` | Validate a decision trace (v0.31.0+, RBAC-gated on blueprint_id) |
| `pattern_learn` | Extract pattern candidates from blueprint files |
| `pattern_review` | List current candidates and confidence scores |
| `pattern_validate` | Validate a blueprint against accepted patterns |
| `pattern_status` | Return pattern-set health and statistics |

> **v0.31.0 security changes**: Destructive skills (`delete_blueprint`, `delete_deployment`, `cancel_execution`, `start_execution`, `create_secret`) are now blocked on `/invoke` and `ask_bpa_agent` - requests return `DESTRUCTIVE_SKILL_BLOCKED` instead of executing. The mcp-server no longer self-confirms destructive tool calls for headless clients (requires `BPA_MCP_ALLOW_ECHO_CONFIRMATION=1` opt-in). The injection-pattern output filter now covers the agent path, not just mcp-server.

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
| **Tools/Commands** | ~30 subcommands | ~37 MCP tools | `ask_bpa_agent` + granular authoring/pattern tools |
| **LLM orchestration** | No | No | Yes (Bedrock/Claude) |
| **IDE integration** | Via skills (Section 4) | Native MCP client | Native MCP client |
| **Offline support** | Yes | No | No |
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
