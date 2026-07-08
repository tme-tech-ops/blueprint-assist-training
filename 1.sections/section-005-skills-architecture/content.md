# Section 005: Skills-Based Architecture

## New Skills Architecture Overview

### Architecture Philosophy

The Blueprint Assist skills-based architecture represents a paradigm shift from monolithic blueprint templates to modular, composable skills. This approach enables greater flexibility, reusability, and maintainability of infrastructure deployments.

### Core Principles

1. **Modularity**: Each skill encapsulates a specific area of expertise
2. **Composability**: Several skills can inform a single piece of work
3. **Reusability**: The same skills serve every blueprint you build
4. **Currency**: Skills ship with each dap-bpa release, so guidance and platform capabilities stay in step
5. **Discoverability**: Skills are easily discoverable and self-documenting

### Architecture Components

#### Skill Definition

Each skill is a markdown knowledge package:

- **SKILL.md**: when the skill applies (its trigger description) and how the agent should work
- **Reference files**: deep-dive material the agent consults on demand — CLI commands, blueprint rules, troubleshooting guides, worked examples
- **Rules**: authoring standards installed alongside the skills into your agent

#### Knowledge Base

Local reference store that:

- Holds per-plugin node types, properties, and documentation
- Holds the blueprint example library
- Is queried by the agent — and by you — through `dap-bpa knowledge` commands
- Updates with each dap-bpa release, and can be extended with `dap-bpa knowledge plugins add`

#### The Refinement Loop

The "engine" of the architecture is a loop between the agent's LLM and the `bpa` CLI:

- The LLM reads the skills to understand how to work
- It calls the `bpa` CLI for knowledge lookup, linting, and validation
- It refines the blueprint until the checks pass
- Only then is the blueprint description ready for the orchestrator

## System Architecture

When you author a blueprint with BPA, four parts work together: your IDE/agent with its skills, the LLM behind the agent, the `bpa` CLI, and the DAP orchestrator.

```text
========================================================================
      BLUEPRINT ASSIST (BPA) -- AUTHORING ARCHITECTURE
========================================================================

  User
   |
   v
  +----------------------------------+
  | IDE / Agent                      |
  |  +----------------------------+  |
  |  | Skills                     |  |
  |  +----------------------------+  |
  +----------------------------------+
                    |
                    | invokes
                    v
             +-------------+
  +--------- |    LLM      | <---------+
  |          +-------------+           |
  | calls                      refine  |
  v                                    |
  +-----------------------------+
  | dap-bpa CLI                     |  (refines back to LLM)
  |  - knowledge blueprints     |
  |  - knowledge plugins        |
  |  - blueprint examples       |
  |  - blueprint lint           |
  |  - blueprint validate       |
  +-----------------------------+
                    |
                    | satisfied
                    v
  +-----------------------------+
  | Blueprint Description       |
  +-----------------------------+
                    |
                    | REST API
                    v
            +---------------------+
            |  DAP Orchestrator   |
            |  (On-Prem/Cloud)    |
            +---------------------+

========================================================================
LEGEND
  +-------------+   Box   = service / component
  | Component   |   |     = data / control flow
  +-------------+   loop  = refinement (dap-bpa CLI -> LLM)
  User = the engineer authoring the blueprint
========================================================================
```

### Architecture Overview

- **IDE / Agent**: your development environment with the dap-bpa skills installed
- **LLM**: the model behind your agent; reads the skills, processes natural language, and generates the blueprint
- **dap-bpa CLI**: command-line interface to the knowledge base, linting, and validation
- **Refinement loop**: the LLM calls the `bpa` CLI for knowledge, linting, and validation, and refines the blueprint until the checks pass
- **DAP Orchestrator**: receives the finished blueprint over REST for deployment

### Key Integration Points

1. **User to IDE/Agent**: Direct interaction for blueprint development
2. **Agent to LLM**: Skills give the LLM its DAP context and working method
3. **LLM to dap-bpa CLI**: Refinement loop for blueprint generation
4. **dap-bpa to DAP Orchestrator**: REST API calls for blueprint upload, deployment creation, workflow execution, and event streaming

## Where Composition Lives

Skills are reference knowledge, not workflow steps — they don't execute or chain. Composition in dap-bpa happens at the **blueprint** level: node templates and their relationships express ordering and dependency, and ServiceComponents compose whole deployments from other blueprints (the `dap-service-composition` skill teaches the agent these patterns). Section 7 covers building composed blueprints and Section 10 covers the anatomy that makes it work.

## Engineering Best Practices

The skills exist to produce blueprints that follow sound engineering principles. These are the standards the skills teach — and the linter enforces:

### Single Responsibility

Each blueprint or service component should have one clear purpose:

- ✅ Good: "Deploy a hardened Ubuntu VM"
- ❌ Bad: "Create complete multi-tier application infrastructure in one blueprint" — compose it from service components instead

### Idempotency

Blueprints should converge rather than duplicate when re-run:

- Use declarative configurations via the appropriate plugin
- Implement `check_drift` and `update` operations for Day-2 changes (rule ND-009)
- Handle existing resources gracefully

### Fail Fast

Validate early, before anything reaches the orchestrator:

- The refinement loop lints and validates continuously during authoring
- Required inputs carry constraints so bad values are caught at deploy time, not mid-workflow
- Provide clear error messages in lifecycle scripts

### Self-Documenting

Blueprints document themselves through:

- A description on every input (rule IN-001)
- A maintained CHANGELOG.yaml (rule BS-009)
- Capability-based outputs that state what the deployment provides (rule CP-001)

### Skill Development

> **Note**: Custom skill development is an advanced topic intended for dap-bpa contributors and platform teams. End users building blueprints work with the existing skill catalog. Custom skill authoring guidance will be covered in a separate reference document.

For contributors, the shape of the work is:

1. **Define the skill's purpose** — the specific expertise it adds, its trigger phrases, and the use cases it serves
2. **Write the SKILL.md and reference files** — the trigger description, working method, and the deep-dive material the agent consults
3. **Verify the guidance** — confirm an agent following the skill produces valid, lintable blueprints (the skills folder ships with its own `TESTING.md` covering verification)

Skills are published as part of the dap-bpa release, not individually.

### Skill Versioning

Skills version with the dap-bpa release: updating the `bpa` binary updates the skill content, and re-running `dap-bpa setup-ide <ide>` pushes the updated skills into your agent. There is no per-skill version to pin or resolve — the release version (e.g. v0.27.0) identifies the whole set. Blueprint versioning is a separate concern, handled with semantic versioning and CHANGELOG.yaml (Section 7).

## Integration Patterns

### How dap-bpa Integrates

dap-bpa integrates with the DAP orchestrator over its REST API: blueprint upload, deployment creation, workflow execution, event streaming, and secrets. This is how everything you author reaches the platform.

### How Blueprints Integrate

Blueprints reach external tooling through DAP plugins — Ansible, Terraform, Helm, Kubernetes, and the rest of the catalog in Section 4. The blueprint declares the integration declaratively; the orchestrator's plugins execute it. This is why plugin knowledge, not custom glue code, is the heart of what the skills teach.

## Reference

- Plugin node type reference: `dap-bpa knowledge plugins docs <plugin>`
- Planned service-integration architecture (MCP Server, AIOps integration, cloud deployment): [`future-architecture.md`](future-architecture.md) — forward-looking, not part of the current release
- Architecture source document: `3.resources/reference-docs/New skills based architecture.pdf` in this repository

## Next Steps

1. **Section 7: Building Blueprints** — apply the skills architecture to author your first blueprint
2. **Section 11: Skill Anatomy** — detailed breakdown of how a skill file is structured
3. **Section 13: dap-bpa CLI Command Reference** — `dap-bpa knowledge` commands for exploring plugins and node types
