# Skills Architecture: Planned Service Integration (Roadmap)

> **Forward-looking — not part of the current release.** This document describes
> planned architecture for integrating dap-bpa into automated, service-level
> workflows. It is provided for context and is subject to change. The shipping
> product is the authoring architecture described in
> [`content.md`](content.md): your IDE/agent, the skills, the `dap-bpa` CLI, and the
> DAP orchestrator.

## Why this exists

Today an engineer authors blueprints interactively in their IDE. The roadmap
extends that same capability to *programmatic* callers — an AIOps platform, an
ITSM workflow, a CI/CD pipeline — so blueprints can be listed, created, and
deployed without an interactive session. Two building blocks make that possible:
the **MCP Server** and a **cloud-hosted deployment** of dap-bpa itself.

## The full architecture (planned)

```text
========================================================================
      BLUEPRINT ASSIST (BPA) -- SERVICE INTEGRATION (ROADMAP)
========================================================================

  AIOps (Roadmap)
   |
   v
========================================================================
  MCP SERVER (On-Prem OR Cloud)
========================================================================

  +---------------------------------------+
  | MCP Server                            |
  |  - list_blueprints                    |
  |  - list_deployments                   |
  |  - create_blueprint                   |
  |  - create_deployment                  |
  +---------------------------------------+
                       |
                       | REST / API
                       v
  +---------------------------------------+
  | DAP Orchestrator                      |
  | (On-Prem or Cloud)                    |
  +---------------------------------------+

========================================================================

  AIOps (Roadmap)
   |
   v
========================================================================
  AWS CLOUD DEPLOYMENT
========================================================================

  +-------------------------------------------------------+
  | Kubernetes (EKS)                                      |
  |                                                       |
  |  +----------------------+ +----------------------+    |
  |  | MCP Server           | | dap-bpa Service          |    |
  |  |  - list_blueprints   | |  - Agent / Skills    |    |
  |  |  - list_deployments  | |  - LLM  <loop        |    |
  |  |  - create_blueprint  | |  - dap-bpa CLI  (loop)   |    |
  |  |  - create_deployment | |  - Blueprint Gen     |    |
  |  +----------------------+ +----------------------+    |
  |                                                       |
  +-------------------------------------------------------+

========================================================================
LEGEND
  +-------------+   Box   = service / component
  | Component   |   |     = data / control flow
  +-------------+   loop  = refinement (dap-bpa CLI -> LLM)
  AIOps (Roadmap) = external automation platform calling in
========================================================================
```

## MCP Server

- Exposes a set of tools — `list_blueprints`, `list_deployments`,
  `create_blueprint`, `create_deployment` — that LLM agents and external systems
  call to interact with DAP
- Translates those tool calls into DAP REST API requests; it is the bridge
  between AI agents / external systems and the DAP orchestrator
- Can be deployed on-premises or in the cloud

## Cloud Deployment (AWS EKS)

- Kubernetes (EKS) deployment of the MCP Server alongside a **dap-bpa Service**
- The MCP Server calls an **Agent** — the cloud-native equivalent of the IDE,
  carrying the same skills — which drives the dap-bpa Service through the same
  refinement loop as the authoring architecture, with AWS Bedrock as the LLM
- Turns blueprint generation into a callable service rather than an interactive
  IDE session

## Planned integration points

- **AIOps / external systems to MCP Server**: an AIOps platform, ITSM tooling,
  monitoring system, or CI/CD pipeline calls the MCP Server's tools to trigger
  DAP operations programmatically
- **MCP Server to DAP Orchestrator**: the MCP Server translates those tool calls
  into DAP REST API requests

## Source

This architecture is described in
`3.resources/reference-docs/New skills based architecture.pdf`.
