# MCP Demo: AI to Dell Automation Platform through MCP

> **Live demonstration: 10-15 minutes** | Showcases the complete MCP lifecycle
> from natural-language intent to deployed infrastructure.

## Overview

This demo shows how MCP (Model Context Protocol) enables AI assistants to
interact directly with Dell Automation Platform through Blueprint Assist.
Unlike generic MCP demos with fictitious tools, this demonstration uses the
**actual Blueprint Assist MCP implementation** with real DAP operations.

## Demo Lifecycle

```text
Discover → Understand → Author → Validate → Publish → Deploy → Monitor
```

Each stage uses capabilities that exist in the Blueprint Assist MCP servers.

## Architecture

```text
                    USER
                      │
             Natural Language
                      │
                      ▼
             ┌────────────────┐
             │ AI / IDE Agent │
             │ VS Code, etc.  │
             └───────┬────────┘
                     │
                     │ MCP
                     ▼
        ┌────────────────────────┐
        │ Blueprint Assist       │
        │ MCP Server             │
        │                        │
        │ Knowledge Tools        │
        │ DAP Tools              │
        └───────────┬────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ Dell Automation        │
        │ Platform Orchestrator  │
        └───────────┬────────────┘
                    │
                    ▼
               BLUEPRINTS
                    │
                    ▼
        Infrastructure / Services
```

## Two MCP Servers

Blueprint Assist exposes two complementary MCP servers:

```text
                    AI CLIENT
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
       AGENT MCP             GATEWAY MCP
          SERVER                SERVER
             │                   │
       Author / Reason       Operate DAP
             │                   │
             └─────────┬─────────┘
                       ▼
                 DAP ORCHESTRATOR
```

| Server | Purpose | Key Tools |
| ------ | ------- | --------- |
| **Gateway MCP Server** | Structured DAP operations | `list_blueprints`, `create_deployment`, `start_execution` |
| **Agent MCP Server** | Natural-language authoring | `plan_blueprint`, `edit_blueprint`, `review_blueprint` |

## Files in This Demo

| File | Purpose |
| ---- | ------- |
| [README.md](README.md) | This overview |
| [why-mcp.md](why-mcp.md) | **Start here** - Why MCP matters and when to use it vs. direct API |
| [RUNBOOK.md](RUNBOOK.md) | Step-by-step live demo script with exact prompts and speaker notes |
| [setup-checklist.md](setup-checklist.md) | Pre-demo environment verification |
| [STAMP3-SETUP.md](STAMP3-SETUP.md) | stamp3 orchestrator connection guide |
| [vs-code-mcp-config.json](vs-code-mcp-config.json) | VS Code MCP configuration template |
| [devin-desktop-mcp-config.json](devin-desktop-mcp-config.json) | Devin Desktop MCP configuration template |
| [mcp-demo-presentation.pptx](mcp-demo-presentation.pptx) | PowerPoint presentation for the demo |
| [diagrams/](diagrams/) | Architecture diagrams for slides |

## Prerequisites

- VS Code 1.99+ with native MCP support (or Devin Desktop)
- DAP customer token (obtain from DAP portal)
- DAP orchestrator access with at least one existing blueprint
- Network connectivity to MCP endpoints

## Quick Start

1. Review [setup-checklist.md](setup-checklist.md)
2. Configure your IDE using the provided templates
3. Follow [RUNBOOK.md](RUNBOOK.md) during the live demo

## Key Messages

1. **MCP is not required** - You could build a direct AI-to-DAP integration. MCP
   becomes valuable when you want portability across multiple AI clients.
2. **Tools are discovered, not assumed** - These are capabilities the MCP server
   actually advertises, not things the AI thinks DAP can do.
3. **Three-layer model** - AI understands intent, MCP standardizes the
   interface, DAP does the work.
4. **Explicit artifacts** - Generated blueprints remain inspectable,
   versionable, and governable.
5. **Strategic positioning** - DAP automation becomes a consumable toolset for
   the broader agentic ecosystem.

## The One-Liner

> "AI understands what I want. MCP standardizes what the AI can do. Dell
> Automation Platform does the work."

## Closing Statement

> "MCP doesn't replace Dell Automation Platform. MCP makes Dell Automation
> Platform accessible to the agentic ecosystem."
>
> "Blueprint Assist turns intent into automation. MCP makes that automation
> accessible to AI. Dell Automation Platform turns it into action."

## Related Documentation

- [Section 019: Blueprint Assist MCP Server](../../1.sections/section-019-mcp-server/content.md)
- [Section 026: MCP Token Management](../../1.sections/section-026-mcp-token-management/content.md)
- [Section 004: Skills Overview](../../1.sections/section-004-skills-overview/content.md)
