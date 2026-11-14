# Blueprint Assist MCP Guide

The Blueprint Assist MCP server exposes DAP operations via the [Model Context Protocol](https://modelcontextprotocol.io) (MCP) at the `/mcp` HTTP endpoint. MCP clients (Claude Desktop, MCP Inspector, IDEs, custom tooling) connect to this endpoint to list and call DAP tools without writing integration code.

This guide covers authentication, request format, common workflows, testing, and troubleshooting.

## Deployed Endpoints

| Environment | URL |
|---|---|
| Production | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| Staging | `https://ai-bp-mcp-server.staging.sp.dell.com/mcp` |
| Dev (VPN required) | `https://ai-bp-mcp-server.dev.sp.dell.com/mcp` |

Each server publishes its own connection details — endpoint, required headers, and the token audience — at `GET /docs` (no auth required).

> The separate **agent** MCP server (natural-language `ask_bpa_agent` tool) lives at `https://agent-mcp-server.sp.dell.com/mcp` — see `packages/agent-mcp-server/README.md`. This guide covers the DAP tools server.

---

## Authentication

The MCP endpoint uses a **pre-obtained customer token** for authentication (SA-12622). Your client ID and client secret are used only to obtain a short-lived OIDC token from the portal — they are never sent to the MCP server.

For how to create a DAP client and obtain your client ID, client secret, and org ID, see `packages/skills/dap/references/onboarding-setup.md`.

### Getting a Customer Token

The gateway's token delegation only accepts tokens minted with **`scope=internal:exchangeable`** and **`audience=<the MCP server's predefined client id>`**. A token minted with any other scope, or without the audience, mints fine but every authenticated call is rejected with `401 AUTH_CLIENT_CREDENTIALS_FAILED`.

Find the audience value in the `token_audience` field of the gateway's `GET /docs` response (no auth required). Background on the auth model is in the training site's *orchestration-service-auth* section: <https://tme-tech-ops.github.io/blueprint-assist-training/>.

The easiest path is the bundled CLI, which owns the recipe:

```bash
CUSTOMER_TOKEN=$(dap-bpa mint-token --audience <token_audience>)

# or mint and test delegation against the gateway in one go:
dap-bpa mint-token --audience <token_audience> --verify
```

> **For AI agents walking a user through setup:** offer to run `dap-bpa mint-token` (or the curl below) for the user, and run the connectivity checks in this guide (health check, `tools/list`, or `mint-token --verify`) yourself rather than asking the user to paste commands. Keep the token out of your context and transcript: prefer `mint-token --verify` for connectivity checks (it reports delegation status without you handling the token), and when the user needs the token, mint with `--out <file>` or `--copy`, or have the user's own shell capture it (`export CUSTOMER_TOKEN=$(dap-bpa mint-token ...)`) — do not run a bare `mint-token` and capture its stdout yourself.

Equivalent curl:

```bash
CUSTOMER_TOKEN=$(curl -s -X POST "https://${PORTAL_DOMAIN}/api/v1/oidc/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "scope=internal:exchangeable" \
  --data-urlencode "audience=${TOKEN_AUDIENCE}" \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode "org_id=${ORG_ID}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
```

**Python** (using `requests`):

```python
import requests

resp = requests.post(
    f"https://{PORTAL_DOMAIN}/api/v1/oidc/token",
    data={
        "grant_type": "client_credentials",
        "scope": "internal:exchangeable",
        "audience": TOKEN_AUDIENCE,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "org_id": ORG_ID,
    },
)
resp.raise_for_status()
customer_token = resp.json()["access_token"]
```

**TypeScript**:

```typescript
const params = new URLSearchParams({
  grant_type: 'client_credentials',
  scope: 'internal:exchangeable',
  audience: TOKEN_AUDIENCE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  org_id: ORG_ID,
});
const resp = await fetch(`https://${PORTAL_DOMAIN}/api/v1/oidc/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString(),
});
const { access_token: customerToken } = await resp.json();
```

Tokens are short-lived; refresh before they expire and update the `x-dap-customer-token` header on your next request.

### Required Headers

Authenticated requests require three headers:

| Header | Value |
|---|---|
| `x-dap-customer-token` | Your OIDC token obtained from the portal (see above) |
| `x-dap-org-id` | Your organization ID (the Portal Identity Management Client dashboard refers to this as "Tenant ID") |
| `x-dap-orchestrator-domain` | Your orchestrator hostname (e.g. `your-orchestrator.automation.dell.com`) |

### What requires the headers

In deployed (gateway) mode:

- `initialize` and `tools/list` **require all three headers** — a client with no headers cannot even list tools (`401 AUTH_MISSING_HEADERS`).
- `tools/call` on **DAP tools** requires all three headers.
- `tools/call` on **knowledge tools** works without headers: `list_node_types`, `get_node_type`, `get_plugin_docs`, `get_node_type_docs`, `search_docs`, `find_blueprint_examples`, `get_blueprint_example`, `lint_blueprint`, `get_datetime`, `fetch_github_context`.

The simplest approach: send all three headers on every request.

---

## MCP Request Format

All requests are JSON-RPC 2.0 POSTs to `/mcp` with `Content-Type: application/json` and `Accept: application/json, text/event-stream`. Responses are returned as a Server-Sent Events stream (`event: message` / `data: {...}` lines).

> **No session ID required.** The deployed gateway is stateless — there is no `mcp-session-id` header. Each POST is independent; you can call `tools/call` directly without running `initialize` first. MCP clients (MCP Inspector, IDE extensions) perform the `initialize` handshake automatically, which is fine.

### Get Session (optional)

```bash
curl -i -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "x-dap-customer-token: ${CUSTOMER_TOKEN}" \
  -H "x-dap-org-id: ${ORG_ID}" \
  -H "x-dap-orchestrator-domain: ${ORCHESTRATOR_DOMAIN}" \
  -d '{
    "jsonrpc": "2.0", "id": 1, "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {"name": "my-client", "version": "1.0"}
    }
  }'
```

### List Available Tools

```bash
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "x-dap-customer-token: ${CUSTOMER_TOKEN}" \
  -H "x-dap-org-id: ${ORG_ID}" \
  -H "x-dap-orchestrator-domain: ${ORCHESTRATOR_DOMAIN}" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}'
```

### Call a Tool

```bash
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "x-dap-customer-token: ${CUSTOMER_TOKEN}" \
  -H "x-dap-org-id: ${ORG_ID}" \
  -H "x-dap-orchestrator-domain: ${ORCHESTRATOR_DOMAIN}" \
  -d '{
    "jsonrpc": "2.0", "id": 3, "method": "tools/call",
    "params": {"name": "list_blueprints", "arguments": {}}
  }'
```

---

## Available Tools

### Knowledge tools (no auth required)

| Tool | Purpose |
|---|---|
| `list_node_types` | List node types for a plugin |
| `get_node_type` | Full node type definition |
| `get_plugin_docs` | Plugin documentation |
| `get_node_type_docs` | Node type documentation |
| `search_docs` | Keyword search across plugin docs |
| `find_blueprint_examples` | Search blueprint examples |
| `get_blueprint_example` | Get example by ID |
| `lint_blueprint` | Validate blueprint YAML |
| `stamp_blueprint` | Add BpA origin indicator to blueprint YAML *(requires auth in gateway mode)* |
| `get_datetime` | Current server datetime (RFC3339) |
| `fetch_github_context` | Fetch files from a GitHub repo for generation context |

### DAP read tools (auth required)

`list_blueprints`, `get_blueprint`, `list_deployments`, `get_deployment`, `list_executions`, `get_execution`, `list_events`, `get_events`, `list_plugins`, `get_plugin`, `list_secrets`

### DAP write tools (auth required)

`create_blueprint`, `update_blueprint`, `delete_blueprint`, `create_deployment`, `update_deployment`, `delete_deployment`, `start_execution`, `cancel_execution`, `resume_execution`, `create_secret`, `update_secret`, `delete_secret`, `upload_plugin`, `delete_plugin`

Destructive tools (`delete_*`, forced `cancel_execution`) require human-in-the-loop confirmation — see `packages/mcp-server/README.md` (destructive action confirmation / HITL section).

### AI-powered tools (auth required)

`summarize_blueprint_description` — generate an AI description for a base64-encoded blueprint ZIP.

> There is no `deploy_blueprint` or `set_secret` tool. Deploying is `create_deployment` + `start_execution`; secrets use `create_secret` / `update_secret`.

---

## End-to-End Workflows

All examples below assume the three auth headers are set; they are abbreviated as `"${AUTH[@]}"`:

```bash
AUTH=(-H "x-dap-customer-token: ${CUSTOMER_TOKEN}" \
      -H "x-dap-org-id: ${ORG_ID}" \
      -H "x-dap-orchestrator-domain: ${ORCHESTRATOR_DOMAIN}")
```

### 1. List and Inspect Blueprints

```bash
# List all blueprints
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"list_blueprints","arguments":{}}}'

# Get details for a specific blueprint
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"get_blueprint","arguments":{"blueprint_id":"my-blueprint"}}}'
```

### 2. Deploy a Blueprint and Poll Execution Status

Deploying is two steps: create a deployment from the blueprint, then start the `install` workflow.

```bash
# Create a deployment
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"create_deployment",
                 "arguments":{"blueprint_id":"my-blueprint","deployment_id":"my-deployment"}}}'

# Start the install workflow
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"start_execution",
                 "arguments":{"deployment_id":"my-deployment","workflow_id":"install"}}}'

# Poll execution status (use execution id from the start_execution response)
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",
       "params":{"name":"get_execution",
                 "arguments":{"execution_id":"<execution-id>"}}}'
```

Repeat the `get_execution` call until `status` is `terminated` (success), `failed`, or `cancelled`.

### 3. Manage Secrets

```bash
# List secrets (metadata only, never values)
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"list_secrets","arguments":{}}}'

# Create a secret
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"create_secret",
                 "arguments":{"key":"my-secret","value":"my-value"}}}'

# Update an existing secret
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${AUTH[@]}" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",
       "params":{"name":"update_secret",
                 "arguments":{"key":"my-secret","value":"new-value"}}}'
```

---

## Testing the Server

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector@latest
```

1. Open the browser page the inspector prints.
2. Transport: **Streamable HTTP**.
3. URL: `https://ai-bp-mcp-server.sp.dell.com/mcp` (or staging/local).
4. Under Authentication, add the three `x-dap-*` headers as JSON:

```json
{
  "x-dap-customer-token": "<CUSTOMER_TOKEN>",
  "x-dap-org-id": "<ORG_ID>",
  "x-dap-orchestrator-domain": "<ORCHESTRATOR_DOMAIN>"
}
```

5. Connect, then use **List Tools** and call e.g. `list_blueprints`.

### Health Check

```bash
curl -i ${MCP_SERVER}/health
# Expected: {"status":"ok","transport":"http"}
```

### Unauthenticated Tool (No Headers Required)

```bash
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"get_datetime","arguments":{}}}'
```

### Negative Cases

**Missing auth headers:**
```bash
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"list_blueprints","arguments":{}}}'
# Expected: HTTP 401, error code AUTH_MISSING_HEADERS
```

**Invalid token:**
```bash
curl -s -X POST ${MCP_SERVER}/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "x-dap-customer-token: invalid-or-expired-token" \
  -H "x-dap-org-id: ${ORG_ID}" \
  -H "x-dap-orchestrator-domain: ${ORCHESTRATOR_DOMAIN}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"list_blueprints","arguments":{}}}'
# Expected error code: AUTH_CLIENT_CREDENTIALS_FAILED
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| DNS `NXDOMAIN` for portal or orchestrator | AWS VPN not connected | Connect to AWS VPN |
| `401 AUTH_MISSING_HEADERS` | One or more `x-dap-*` headers absent (also returned by `initialize`/`tools/list` without headers) | Include all three: `x-dap-customer-token`, `x-dap-org-id`, `x-dap-orchestrator-domain` |
| `AUTH_CLIENT_CREDENTIALS_FAILED` | Token delegation failed — token expired, or minted without `scope=internal:exchangeable` / with a wrong `audience` | Re-mint with `dap-bpa mint-token --audience <token_audience>` (audience from the gateway's `GET /docs`) and retry; `--verify` confirms delegation |
| `AUTH_INVALID_DOMAIN` | Orchestrator domain failed validation or is not in the allowlist | Use a bare hostname (no path/scheme); check `DAP_ALLOWED_ORCHESTRATOR_DOMAINS` |
| `EXTERNAL_AUTH_FAILED` | DAP rejected the delegated token during a tool call (e.g. expired) | Retry; verify credentials |
| `EXTERNAL_UNREACHABLE` | Server can't reach the orchestrator | Check network policies and egress rules; verify orchestrator domain |
| 403 from ALB | Blocked by WAF | Check WAF logs and rules |
| Tool not found: `deploy_blueprint` / `set_secret` | Tools were renamed | Use `create_deployment` + `start_execution`; `create_secret` / `update_secret` |
