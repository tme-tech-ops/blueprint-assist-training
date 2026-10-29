# Connecting to a Lab Orchestrator via MCP

This guide walks you through setting up a local MCP connection to the
lab DAP orchestrator.

## Lab Connection Details

The lab orchestrator configuration (from `~/.blueprint-assist/config.json`):

| Setting | Value |
|---------|-------|
| **Orchestrator Domain** | `<YOUR_ORCHESTRATOR_DOMAIN>` |
| **Portal Domain** | `<YOUR_PORTAL_DOMAIN>` |
| **Org ID** | `<YOUR_ORG_ID>` (from your config.json) |
| **Client ID** | `<YOUR_CLIENT_ID>` (from your config.json) |

## Prerequisites

- VS Code 1.99+ (with native MCP support) or Devin Desktop
- Network connectivity to the MCP endpoints and lab orchestrator
- VPN connection to reach the lab environment

## Quick Start

### 1. Get a Customer Token

Don't hand-write a token request. The MCP server only accepts tokens minted
with the right scope **and** audience, and both come from the server itself.
`dap-bpa mint-token` owns the recipe (`scope=internal:exchangeable`), the
same approach as
[Section 026: MCP Token Management](../../1.sections/section-026-mcp-token-management/content.md).

1. Get the current token recipe for this environment (no auth needed):

   ```bash
   curl -s <mcp-endpoint>/docs
   ```

   Use the `token_audience` value (the server's predefined client ID). Each
   MCP server has its own; if the gateway and agent servers report different
   values, mint one token per server.

2. Mint the token with the CLI, which uses your lab profile in
   `~/.blueprint-assist/config.json`:

   ```bash
   export CUSTOMER_TOKEN=$(dap-bpa mint-token --audience <value-from-docs> --trust-all)
   export ORG_ID="<YOUR_ORG_ID>"
   ```

   ```powershell
   $CUSTOMER_TOKEN = dap-bpa mint-token --audience <value-from-docs> --trust-all
   $ORG_ID = "<YOUR_ORG_ID>"
   ```

   `--trust-all` is only for a lab portal with self-signed certificates; drop
   it for public endpoints. Add `--copy` to put the token on the clipboard.
   If your profile doesn't match the lab, override with `--portal-domain`,
   `--org-id`, or `--orchestrator-domain`.

> **Note:** Tokens are short-lived. When calls start failing, re-run
> `dap-bpa mint-token`. Don't reuse an old token or type one from memory.

### 2. Configure Your IDE

#### VS Code

The configuration is already created at `.vscode/mcp.json` with lab
details pre-filled. When you start VS Code:

1. Open this project folder
2. Press `Ctrl+Shift+P` > **MCP: List Servers**
3. You'll be prompted only for the **Customer Token**. Paste the output of
   `dap-bpa mint-token` from step 1, not a token typed from memory or saved
   from an earlier session
4. Click **Start Server** if not already running

The org ID and orchestrator domain are already configured for the lab.

#### Devin Desktop

Copy the configuration to your Devin Desktop MCP settings. Replace
`<YOUR_CUSTOMER_TOKEN>` with fresh `dap-bpa mint-token` output from step 1
(one per server if their audiences differ):

```json
{
  "mcpServers": {
    "blueprint-assist-lab": {
      "serverUrl": "https://ai-bp-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "<YOUR_ORCHESTRATOR_DOMAIN>",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    },
    "blueprint-assist-agent-lab": {
      "serverUrl": "https://agent-mcp-server.sp.dell.com/mcp",
      "headers": {
        "x-dap-customer-token": "<YOUR_CUSTOMER_TOKEN>",
        "x-dap-orchestrator-domain": "<YOUR_ORCHESTRATOR_DOMAIN>",
        "x-dap-org-id": "<YOUR_ORG_ID>"
      }
    }
  }
}
```

> **Running the Agent MCP Server locally instead?** See [`../agent-mcp-server-local/README.md` → *Building Blueprints from Devin Desktop*](../agent-mcp-server-local/README.md#building-blueprints-from-devin-desktop). The local server needs a lab service account, the lab CA, and its own token.

#### Devin CLI

Set the environment variables before running Devin. The token comes from
`dap-bpa mint-token`, using the `token_audience` from `<mcp-endpoint>/docs`
(step 1):

```bash
export DAP_CUSTOMER_TOKEN=$(dap-bpa mint-token --audience <value-from-docs> --trust-all)
export DAP_ORG_ID="<YOUR_ORG_ID>"
export DAP_ORCHESTRATOR_DOMAIN="<YOUR_ORCHESTRATOR_DOMAIN>"
```

The `.devin/mcp.json` configuration reads all three values from these
environment variables, so no lab hostnames or credentials are committed.
When the token expires, re-run the `mint-token` line and restart Devin.
Keep any machine-specific Devin settings in `.devin/*.local.json`
(git-ignored).

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
  -H "x-dap-orchestrator-domain: <YOUR_ORCHESTRATOR_DOMAIN>" \
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

Expected: List of blueprints from the orchestrator.

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
| `list_blueprints` | List blueprints on the orchestrator |
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
| `AUTH_CLIENT_CREDENTIALS_FAILED` | Expired token, or minted with the wrong scope/audience | Re-mint with `dap-bpa mint-token --audience <token_audience from /docs>` |
| `AUTH_INVALID_DOMAIN` | Bad orchestrator domain | Use bare hostname without scheme |
| Auth configuration error (server-side) | The MCP server's own auth setup is incomplete (e.g. its predefined client / token exchange isn't configured), so no client token can succeed | Not fixable from the client. Re-minting won't help; report it to the server operator with the full error response |
| `EXTERNAL_UNREACHABLE` | Can't reach the orchestrator | Check network/VPN |
| MCP server not listed | Config not loaded | Reload VS Code window |

## Example Prompts

Once connected, try these in your AI chat:

```text
What DAP tools do you have available?
```

```text
List the blueprints on the orchestrator.
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
