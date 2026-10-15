# Connecting to stamp3 via MCP

This guide walks you through setting up a local MCP connection to the
stamp3 DAP orchestrator.

## stamp3 Connection Details

The stamp3 orchestrator configuration (from `~/.blueprint-assist/config.json`):

| Setting | Value |
|---------|-------|
| **Orchestrator Domain** | `orchestrator.v1.dap.stamp3.tme.lab` |
| **Portal Domain** | `portal.v1.dap.stamp3.tme.lab` |
| **Org ID** | `<YOUR_ORG_ID>` (from your config.json) |
| **Client ID** | `<YOUR_CLIENT_ID>` (from your config.json) |

## Prerequisites

- VS Code 1.99+ (with native MCP support) or Devin Desktop
- Network connectivity to the MCP endpoints and stamp3 orchestrator
- VPN connection to reach the TME lab environment

## Quick Start

### 1. Get a Customer Token

Exchange your stamp3 credentials for an OIDC token. Get your credentials
from `~/.blueprint-assist/config.json` under the `stamp3` orchestrator
profile.

```bash
# stamp3 credentials (from your ~/.blueprint-assist/config.json)
export PORTAL_DOMAIN="portal.v1.dap.stamp3.tme.lab"
export CLIENT_ID="<YOUR_CLIENT_ID>"
export CLIENT_SECRET="<YOUR_CLIENT_SECRET>"
export ORG_ID="<YOUR_ORG_ID>"

# Get the token (use -k for self-signed certs)
CUSTOMER_TOKEN=$(curl -sk -X POST "https://${PORTAL_DOMAIN}/api/v1/oidc/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "scope=internal" \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode "org_id=${ORG_ID}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')

echo $CUSTOMER_TOKEN
```

**PowerShell alternative:**

```powershell
# stamp3 credentials (from your ~/.blueprint-assist/config.json)
$PORTAL_DOMAIN = "portal.v1.dap.stamp3.tme.lab"
$CLIENT_ID = "<YOUR_CLIENT_ID>"
$CLIENT_SECRET = "<YOUR_CLIENT_SECRET>"
$ORG_ID = "<YOUR_ORG_ID>"

# Skip cert validation for self-signed certs
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$body = @{
    grant_type = "client_credentials"
    scope = "internal"
    client_id = $CLIENT_ID
    client_secret = $CLIENT_SECRET
    org_id = $ORG_ID
}

$response = Invoke-RestMethod -Uri "https://$PORTAL_DOMAIN/api/v1/oidc/token" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $body `
    -SkipCertificateCheck

$CUSTOMER_TOKEN = $response.access_token
Write-Output $CUSTOMER_TOKEN
```

> **Note:** Tokens are short-lived. Refresh before they expire.

### 2. Configure Your IDE

#### VS Code

The configuration is already created at `.vscode/mcp.json` with stamp3
details pre-filled. When you start VS Code:

1. Open this project folder
2. Press `Ctrl+Shift+P` > **MCP: List Servers**
3. You'll be prompted only for the **Customer Token** (paste from step 1)
4. Click **Start Server** if not already running

The org ID and orchestrator domain are already configured for stamp3.

#### Devin Desktop

Copy the configuration to your Devin Desktop MCP settings:

```json
{
  "mcpServers": {
    "blueprint-assist-stamp3": {
      "serverUrl": "https://ai-bp-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "orchestrator.v1.dap.stamp3.tme.lab",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    },
    "blueprint-assist-agent-stamp3": {
      "serverUrl": "https://agent-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "orchestrator.v1.dap.stamp3.tme.lab",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    }
  }
}
```

#### Devin CLI

Set the environment variables before running Devin:

```bash
export DAP_CUSTOMER_TOKEN="<your-token-from-step-1>"
export DAP_ORG_ID="<YOUR_ORG_ID>"
```

The `.devin/mcp.json` configuration uses these environment variables along
with the stamp3 orchestrator domain.

## Verify Connection

### Test with an unauthenticated tool

```bash
curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_datetime",
      "arguments": {}
    }
  }'
```

Expected: JSON response with current server time.

### Test with authenticated tools

```bash
curl -s -X POST https://ai-bp-mcp-server.sp.dell.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "x-dap-customer-token: ${CUSTOMER_TOKEN}" \
  -H "x-dap-org-id: ${ORG_ID}" \
  -H "x-dap-orchestrator-domain: orchestrator.v1.dap.stamp3.tme.lab" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_blueprints",
      "arguments": {}
    }
  }'
```

Expected: List of blueprints from stamp3.

## Available Tools

### Knowledge Tools (no auth required)

| Tool | Purpose |
|------|---------|
| `list_node_types` | List node types for a plugin |
| `get_node_type` | Full node type definition |
| `get_plugin_docs` | Plugin documentation |
| `search_docs` | Keyword search across docs |
| `find_blueprint_examples` | Search blueprint examples |
| `lint_blueprint` | Validate blueprint YAML |
| `get_datetime` | Current server datetime |

### DAP Tools (auth required)

| Tool | Purpose |
|------|---------|
| `list_blueprints` | List blueprints on stamp3 |
| `get_blueprint` | Get blueprint details |
| `create_blueprint` | Upload a new blueprint |
| `list_deployments` | List deployments |
| `create_deployment` | Create a deployment |
| `start_execution` | Start a workflow (install/uninstall) |
| `get_execution` | Check execution status |
| `list_secrets` | List secrets (metadata only) |

### Agent Tools (auth required)

| Tool | Purpose |
|------|---------|
| `plan_blueprint` | Plan a new blueprint |
| `edit_blueprint` | Modify blueprint YAML |
| `review_blueprint` | Review blueprint for issues |
| `package_blueprint` | Package blueprint for upload |

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| DNS errors | VPN not connected | Connect to VPN |
| `401 AUTH_MISSING_HEADERS` | Missing headers | Include all three: token, org-id, orchestrator-domain |
| `AUTH_CLIENT_CREDENTIALS_FAILED` | Expired token | Re-fetch token from portal |
| `AUTH_INVALID_DOMAIN` | Bad orchestrator domain | Use bare hostname without scheme |
| `EXTERNAL_UNREACHABLE` | Can't reach stamp3 | Check network/VPN |
| MCP server not listed | Config not loaded | Reload VS Code window |

## Example Prompts

Once connected, try these in your AI chat:

```text
What DAP tools do you have available?
```

```text
List the blueprints on stamp3.
```

```text
What node types are available in the vSphere plugin?
```

```text
Create a simple blueprint plan for a VM with 4 CPUs and 16 GB memory.
```

## MCP Endpoints

| Server | URL |
|--------|-----|
| Gateway MCP (DAP operations) | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| Agent MCP (authoring) | `https://agent-mcp-server.sp.dell.com/mcp` |
| Health check | `https://ai-bp-mcp-server.sp.dell.com/health` |

## Related Documentation

- [MCP Demo README](README.md)
- [MCP Demo Runbook](RUNBOOK.md)
- [Setup Checklist](setup-checklist.md)
