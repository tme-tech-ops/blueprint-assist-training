# MCP Demo Setup Checklist

> Complete this checklist **before** the live demo to ensure everything works smoothly.

---

## Environment Requirements

### IDE Setup

- [ ] **VS Code 1.99+** installed (or Windsurf with MCP support)
- [ ] Native MCP support enabled (VS Code has this built-in as of 1.99)
- [ ] AI chat panel accessible (`Ctrl+Shift+I` or via View menu)

### Network Connectivity

- [ ] Can reach `https://ai-bp-mcp-server.sp.dell.com/mcp` (Gateway)
- [ ] Can reach `https://agent-mcp-server.sp.dell.com/mcp` (Agent)
- [ ] VPN connected if required for your environment

### DAP Credentials

- [ ] **Customer Token**: Minted via `dap-bpa mint-token --audience <value>`,
      using the `token_audience` shown by `GET <mcp-endpoint>/docs` (valid, not
      expired). Mint it fresh before the demo; don't reuse an old `curl` command
      or a token from an earlier session
- [ ] **Orchestrator Domain**: Your orchestrator hostname
- [ ] **Org ID**: Your organization ID

```bash
# Test connectivity (optional)
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

---

## MCP Configuration

### VS Code

1. Create `.vscode/mcp.json` in your demo project folder
2. Copy configuration from [vs-code-mcp-config.json](vs-code-mcp-config.json)
3. Reload VS Code window (`Ctrl+Shift+P` → **Developer: Reload Window**)

### Verify MCP Server

1. `Ctrl+Shift+P` → **MCP: List Servers**
2. Confirm `blueprint-assist` shows as **Running**
3. If not running, click **Start Server**

| Status | Action |
| ------ | ------ |
| Running | Ready for demo |
| Stopped | Click Start Server |
| Error | Check credentials and network |
| Not listed | Reload VS Code window |

---

## DAP Orchestrator Preparation

### Required Content

- [ ] **At least one existing blueprint** in DAP for the "understand" section
  - Ideally a VMware/vSphere blueprint for consistency with demo prompts
  - Should have clear components (VM, network, storage)

- [ ] **Orchestrator UI accessible** in browser for verification steps
  - Bookmark the blueprints page
  - Bookmark the deployments page

### Recommended Blueprint for Demo

If you don't have a suitable blueprint, consider uploading one of these
from the training examples:

- `simple-os-ubuntu-bare-metal`
- Any vSphere-based blueprint

---

## Demo Environment Layout

### Recommended Screen Setup

**Primary Monitor (audience-facing):**

- VS Code with AI chat panel open
- MCP configuration file visible initially

**Secondary Monitor (presenter reference):**

- This checklist
- [RUNBOOK.md](RUNBOOK.md) for speaker notes
- DAP Orchestrator browser tab

### VS Code Layout

```text
┌─────────────────────────────────────────────────┐
│  Explorer  │  Editor (mcp.json initially)       │
│            │                                     │
│            │                                     │
│            ├─────────────────────────────────────┤
│            │  AI Chat Panel                      │
│            │                                     │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```

---

## Pre-Demo Dry Run

### Quick Verification Sequence

Run through these prompts to verify everything works:

1. **Tool Discovery**

   ```text
   What DAP tools do you have?
   ```

   Expected: List of tools appears

2. **Knowledge Tool**

   ```text
   What node types are in the vSphere plugin?
   ```

   Expected: List of vSphere node types

3. **DAP Tool**

   ```text
   List my blueprints.
   ```

   Expected: Your actual DAP blueprints

4. **Authoring Tool**

   ```text
   Create a simple blueprint plan for a VM.
   ```

   Expected: Blueprint plan generated

If all four work, you're ready for the demo.

---

## Backup Plans

### If MCP Server Won't Connect

1. Check VPN connection
2. Verify token hasn't expired (obtain fresh token)
3. Restart VS Code completely
4. Fall back to showing the configuration and explaining conceptually

### If DAP Operations Fail

1. Verify orchestrator is accessible directly in browser
2. Check org ID matches your credentials
3. Use knowledge-tier tools only (no credentials required)

### If Demo Takes Too Long

Skip to these key moments:

1. Tool discovery (Step 3)
2. List blueprints (Step 5)
3. Validate blueprint (Step 9)
4. Closing statement (Step 13)

---

## Post-Demo Cleanup

- [ ] Delete any demo deployments created: `MCP-DEMO-01`
- [ ] Delete any demo blueprints if desired
- [ ] Note any issues encountered for future improvement

---

## Quick Reference: Endpoints

| Server | Endpoint |
| ------ | -------- |
| Gateway MCP | `https://ai-bp-mcp-server.sp.dell.com/mcp` |
| Agent MCP | `https://agent-mcp-server.sp.dell.com/mcp` |
| Docs (unauthenticated) | `https://ai-bp-mcp-server.sp.dell.com/docs` |

## Quick Reference: Required Headers

| Header | Value |
| ------ | ----- |
| `x-dap-customer-token` | Your OIDC token from DAP portal |
| `x-dap-orchestrator-domain` | Your orchestrator hostname |
| `x-dap-org-id` | Your organization ID |
