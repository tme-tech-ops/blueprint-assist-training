# Section 019: Blueprint Assist MCP Server

> **Integration reference: Model Context Protocol (MCP) servers for Blueprint Assist.** This section covers both MCP server components — the gateway for direct DAP operations and the agent server for natural-language queries — and how to connect MCP-compatible clients to each.

## Overview

The Dell Automation Platform MCP server allows external applications’ LLMs/AI Assistants to interact with Dell Automation Platform without the need for custom API integration.  Via the MCP server, AI Assistants can query about existing documentation and plugins, blueprints on the Orchestrator, and deploy blueprints.  Dell Automation Platform’s Blueprint AI Assistant also leverages this MCP Server to manage blueprints on the Orchestrator.

Blueprint Assist exposes two MCP servers, each serving a different use case:

| Server | Purpose | Tools | Endpoint |
| --- | --- | --- | --- |
| **MCP Server** (gateway) | Direct DAP operations — blueprints, deployments, plugins, secrets | 37 tools (some credential-free) | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| **Agent MCP Server** | Natural-language agent queries orchestrated by an LLM | 1 tool: `ask_bpa_agent` | `https://agent-mcp-server.sp.dell.com/mcp` |

Both servers implement the [Model Context Protocol](https://modelcontextprotocol.io/) and can be connected to IDEs (VS Code, Windsurf), AI agents, or custom applications.

---

## Which Server Should I Use?

| Use Case | Recommendation |
| --- | --- |
| IDE integration for blueprint development | MCP Server (gateway) |
| AI agent that needs structured DAP operations | MCP Server (gateway) |
| Natural-language queries ("list my blueprints", "deploy X") | Agent MCP Server |
| Knowledge tools (node types, docs, linting) without credentials | MCP Server (gateway) |
| Blueprint description generation from a ZIP package | Agent MCP Server |
| Local CLI-based workflows | `dap-bpa` CLI (Section 13) |

---

## Authentication

All operations that communicate with the DAP require authentication before the operation can be processed.  These five parameters are required in the credentials header of the operation command:​

| Header | Value |
| --- | --- |
| `x-dap-client-id` | Your DAP client ID |
| `x-dap-client-secret` | Your DAP client secret |
| `x-dap-orchestrator-domain` | Your orchestrator hostname |
| `x-dap-portal-domain` | Your DAP portal hostname |
| `x-dap-org-id` | Your organization ID |

```bash
export DAP_CLIENT_ID="<your-client-id>"
export DAP_CLIENT_SECRET="<your-client-secret>"
export DAP_ORCHESTRATOR_DOMAIN="<your-orchestrator-domain>"
export DAP_PORTAL_DOMAIN="<your-portal-domain>"
export DAP_ORG_ID="<your-org-id>"
```

---

## Server 1: MCP Server (Gateway)

### Gateway: What It Does

The MCP Server is a gateway that exposes DAP operations as MCP tools. Tools are organized in two tiers:

- **Knowledge tools** — no credentials required (node types, docs, linting, examples)
- **DAP tools** — credentials required (blueprints, deployments, plugins, secrets)

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
        "x-dap-client-id": "${input:dapClientId}",
        "x-dap-client-secret": "${input:dapClientSecret}",
        "x-dap-portal-domain": "${input:dapPortalDomain}",
        "x-dap-org-id": "${input:dapOrgId}",
        "x-dap-orchestrator-domain": "${input:dapOrchestratorDomain}"
      }
    }
  },
  "inputs": [
    {
      "id": "dapClientId",
      "type": "promptString",
      "description": "DAP Client ID"
    },
    {
      "id": "dapClientSecret",
      "type": "promptString",
      "description": "DAP Client Secret",
      "password": true
    },
    {
      "id": "dapPortalDomain",
      "type": "promptString",
      "description": "DAP Portal domain (e.g. your-portal.automation.dell.com)"
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

VS Code will prompt for each value on first use and cache them per session. The `"password": true` flag masks the client secret.

If you prefer no prompts, replace `${input:...}` with literal values — but add `.vscode/mcp.json` to `.gitignore` if you do.

**Verify the connection:**

1. `Ctrl+Shift+P` → **MCP: List Servers**
2. `blueprint-assist` should be listed — click **Start Server** if not running

| Issue | Fix |
| --- | --- |
| Server not listed | Reload VS Code window after creating the file |
| DNS errors on portal/orchestrator domains | Connect to AWS VPN first |
| Auth errors | Double-check all 5 header values match your DAP client credentials |
| `mcp-session-id` errors | VS Code handles session init automatically — restart via **MCP: List Servers** |

#### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "blueprint-assist": {
      "serverUrl": "https://ai-bp-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-client-id": "<YOUR_CLIENT_ID>",
        "x-dap-client-secret": "<YOUR_CLIENT_SECRET>",
        "x-dap-orchestrator-domain": "<YOUR_ORCHESTRATOR_DOMAIN>",
        "x-dap-portal-domain": "<YOUR_PORTAL_DOMAIN>",
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

**Knowledge-tier tools are stateless** — they do not require an `initialize` call or a session ID. Call them directly. DAP-tier tools require credential headers on every request; if your client also sends a session ID from a prior `initialize`, the server will accept it, but it is not required for credential-bearing requests either.

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

> `initialize` requires credentials (`x-dap-*` headers) and returns `401 AUTH_MISSING_HEADERS` without them. Most MCP-compatible clients (VS Code, Windsurf) handle session init automatically — you do not need to manage this manually.

#### Call a DAP tool (credentials required)

```bash
curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "x-dap-client-id: $DAP_CLIENT_ID" \
  -H "x-dap-client-secret: $DAP_CLIENT_SECRET" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-portal-domain: $DAP_PORTAL_DOMAIN" \
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

The Agent MCP Server wraps Blueprint Assist's LLM agent in an HTTP/MCP interface. Instead of calling individual DAP tools, you send natural-language queries and the server internally orchestrates the appropriate skills using Claude Sonnet via AWS Bedrock.

It exposes the following interfaces:

1. **`POST /mcp`** — MCP endpoint exposing the `ask_bpa_agent` tool
2. **`POST /api/v1/invoke`** — REST endpoint for natural-language agent queries
3. **`POST /api/v1/blueprints/summarize`** — AI-generated blueprint descriptions from ZIP packages
4. **`GET /docs`** (v0.28.0+) — unauthenticated endpoint that returns human-readable connection instructions (required headers, a token-acquisition one-liner, and a `curl` example). Auth errors on actionable paths now include `hint` and `docs` fields pointing here, so a rejected request tells you exactly how to connect. This endpoint is available on both the gateway and agent MCP servers.

### Agent: Connecting an IDE

```json
{
  "servers": {
    "blueprint-assist-agent": {
      "type": "http",
      "url": "https://agent-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-client-id": "${input:dapClientId}",
        "x-dap-client-secret": "${input:dapClientSecret}",
        "x-dap-portal-domain": "${input:dapPortalDomain}",
        "x-dap-org-id": "${input:dapOrgId}",
        "x-dap-orchestrator-domain": "${input:dapOrchestratorDomain}"
      }
    }
  },
  "inputs": [
    {
      "id": "dapClientId",
      "type": "promptString",
      "description": "DAP Client ID"
    },
    {
      "id": "dapClientSecret",
      "type": "promptString",
      "description": "DAP Client Secret",
      "password": true
    },
    {
      "id": "dapPortalDomain",
      "type": "promptString",
      "description": "DAP Portal domain (e.g. your-portal.automation.dell.com)"
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
  -H "x-dap-client-id: $DAP_CLIENT_ID" \
  -H "x-dap-client-secret: $DAP_CLIENT_SECRET" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-portal-domain: $DAP_PORTAL_DOMAIN" \
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

Generates an AI description of a blueprint ZIP package. Do not set `Content-Type` manually — let `curl -F` handle it.

```bash
curl -s -X POST https://agent-mcp-server.sp.dell.com/api/v1/blueprints/summarize \
  -H "x-dap-client-id: $DAP_CLIENT_ID" \
  -H "x-dap-client-secret: $DAP_CLIENT_SECRET" \
  -H "x-dap-orchestrator-domain: $DAP_ORCHESTRATOR_DOMAIN" \
  -H "x-dap-portal-domain: $DAP_PORTAL_DOMAIN" \
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
│ /mcp — 37 tools         │  │ /mcp — ask_bpa_agent         │
│ 5-header auth           │  │ /api/v1/invoke               │
│ (knowledge tools free)  │  │ 5-header auth                │
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
| **Auth** | Config file | 5 credential headers | 5 credential headers |
| **Tools/Commands** | ~30 subcommands | 37 MCP tools | 1 tool (`ask_bpa_agent`) |
| **LLM orchestration** | No | No | Yes (Bedrock/Claude) |
| **IDE integration** | Via skills (Section 4) | Native MCP client | Native MCP client |
| **Offline support** | Yes | No | No |
| **Knowledge tools** | No | Yes (no auth) | No |

---

## Troubleshooting

### MCP Server (gateway)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `406 Not Acceptable` | Missing `Accept` header | Add `-H "Accept: application/json, text/event-stream"` |
| `AUTH_MISSING_HEADERS` on DAP tools | Missing credential headers | Verify all five `x-dap-*` headers are set |
| `EXTERNAL_UNREACHABLE` | Auth OK; pod can't reach orchestrator | Check orchestrator domain and network connectivity |
| Knowledge tools return errors | Server unreachable | `curl https://ai-bp-mcp-server.sp.dell.com/health` |

### Agent MCP Server

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401 MISSING_CREDENTIALS` | One or more headers absent | Verify all five `x-dap-*` headers are present |
| `401 AUTHENTICATION_FAILED` | Wrong credentials or expired | Re-check credentials in DAP portal |
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
2. **For authenticated DAP access**: Add the five `x-dap-*` credential headers to your IDE MCP config
3. **For natural-language queries from applications**: Use the Agent MCP Server's `/api/v1/invoke` REST endpoint
4. **For CLI-based workflows**: See Section 13 (`dap-bpa` CLI Commands)
