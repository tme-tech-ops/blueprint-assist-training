---
name: mcp-dapo-setup
description: >-
  Use when the user asks how to connect to Dell's MCP server for DAP — the Blueprint Assist
  MCP endpoint of the Dell Automation Platform Orchestrator (DAPO) — how to authenticate
  with the MCP endpoint, how to use MCP tools, "how do I set up MCP", "how do I call a DAP tool
  via MCP", "blueprint assist agent", "mcp-session-id",
  "how do I test the MCP server", or any request to set up, configure, or troubleshoot a connection
  to the Blueprint Assist MCP endpoint.
---

# Blueprint Assist MCP Setup

This skill guides operators and developers through connecting an MCP client to the Blueprint Assist agent, authenticating with DAP credentials, and running DAP operations over the MCP protocol.

## Reference Files

| File | Content |
|---|---|
| `references/mcp-guide.md` | Authentication, MCP request format, end-to-end workflows, testing, and troubleshooting |

## Routing

All requests covered by this skill should load `references/mcp-guide.md` and follow its guidance. Cross-link to #514 (MCP Inspector guide) for inspector-based testing rather than duplicating that setup here.
