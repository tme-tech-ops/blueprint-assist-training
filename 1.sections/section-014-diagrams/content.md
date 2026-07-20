# Section 014: Blueprint Assist Architecture Diagrams

A visual reference for the Blueprint Assist system architecture, workflows, and component relationships.

---

## 1. System Architecture Overview

The dap-bpa system spans three deployment blocks. Block 1 (local/IDE) is the current model; Block 2 (MCP Server) and Block 3 (cloud deployment) will be availabe in the future.

```mermaid
flowchart TD
    User([👤 User / Engineer])

    subgraph BLOCK1["BLOCK 1 — Blueprint Assist (Local / IDE)"]
        direction TB
        IDE["🖥️ IDE\n(Windsurf / Claude Code / \nCursor)"]
        Skills["📦 dap-bpa Skills\n(dap, dap-scripts, \ndap-deployment-update, \ndap-service-composition)"]
        LLM["🤖 LLM\n(Claude / GPT)"]
        CLI["⚙️ dap-bpa CLI\n• knowledge blueprints\n• knowledge plugins\n• blueprint lint\n• blueprint validate\n• orchestrator"]
        Blueprint["📄 Blueprint\n(YAML)"]
    end

    subgraph BLOCK2["BLOCK 2 — MCP Server"]
        MCP["🔌 MCP Server\n• list_blueprints\n• list_deployments\n• create_blueprint\n• create_deployment"]
    end

    subgraph BLOCK3["BLOCK 3 — Cloud Deployment"]
        direction TB
        MCPCloud["🔌 MCP Server\n(list_blueprints, \ncreate_deployment, ...)"]
        BPAService["⚙️ dap-bpa Service\n(Skills + LLM + CLI)"]
    end

    DAP1["🏗️ DAP Orchestrator\n(On-Prem / SaaS \nDell Distributed \nPrivate Cloud)"]
    DAP2["🏗️ DAP Orchestrator\n(On-Prem / SaaS \nDell Distributed \nPrivate Cloud)"]
    ExternalSys1(["🔗 External System\n(AIOps / SNOW / CI/CD)"])
    ExternalSys2(["🔗 External System\n(AIOps / SNOW / CI/CD)"])

    User --> IDE
    IDE --> Skills
    Skills --> LLM
    LLM -- "calls dap-bpa CLI" --> CLI
    CLI -- "refines" --> LLM
    LLM -- "satisfied" --> Blueprint
    Blueprint -- "REST API" --> DAP1

    ExternalSys1 --> MCP
    MCP -- "REST API" --> DAP1

    ExternalSys2 --> MCPCloud
    MCPCloud --> BPAService
    MCPCloud --> DAP2
```

---

## 2. Blueprint Authoring Workflow

How dap-bpa takes a natural language request and produces a deployable blueprint.

```mermaid
sequenceDiagram
    actor User
    participant IDE as IDE + Skills
    participant LLM as LLM (Claude / GPT)
    participant CLI as dap-bpa CLI
    participant KB as Knowledge Base
    participant DAP as DAP Orchestrator

    User->>IDE: "Build a vSphere VM blueprint"
    IDE->>LLM: Invoke dap skill
    LLM->>CLI: dap-bpa knowledge blueprints find "vsphere vm"
    CLI->>KB: Query local knowledge base
    KB-->>CLI: Example blueprints
    CLI-->>LLM: Return examples + context
    LLM->>CLI: dap-bpa knowledge plugins list vsphere
    CLI->>KB: Query plugin node types
    KB-->>CLI: vsphere node types
    CLI-->>LLM: Node type definitions
    LLM->>LLM: Generate blueprint YAML
    LLM->>CLI: dap-bpa blueprint lint --file blueprint.yaml --verify
    CLI-->>LLM: Lint errors (if any)
    LLM->>LLM: Fix errors → retry
    LLM-->>IDE: ✅ Valid blueprint
    IDE-->>User: Blueprint ready
    User->>CLI: dap-bpa orchestrator blueprints upload ...
    CLI->>DAP1: Upload blueprint archive
    DAP1-->>CLI: Blueprint ID
    User->>CLI: dap-bpa orchestrator deployments create ...
    CLI->>DAP1: Create deployment
    DAP1-->>CLI: Deployment ID
```

---

## 3. Monitor Agent Lifecycle

The `dap-bpa monitor` command automates the full blueprint test loop.

```mermaid
flowchart LR
    Start([Start]) --> Upload["Upload Blueprint\ndap-bpa orchestrator blueprints upload"]
    Upload --> Create["Create Deployment\ndap-bpa orchestrator deployments create"]
    Create --> Install["Run install workflow\ndap-bpa orchestrator executions start"]
    Install --> Poll{"Poll until\ncomplete"}
    Poll -- "running" --> Poll
    Poll -- "success" --> Workflows["Run additional\nworkflows (optional)"]
    Poll -- "failure" --> Diagnose["🤖 LLM Diagnostician\nAnalyze events → Generate fix → Retry"]
    Diagnose --> Install
    Workflows --> Uninstall["Run uninstall workflow\n(unless --keep)"]
    Uninstall --> Cleanup["Cleanup deployment\n& blueprint"]
    Cleanup --> End([Done ✅])
```

---

## 4. Component Relationships

How the dap-bpa components relate to one another at a glance.

```mermaid
graph TD
    subgraph User Layer
        User([Engineer])
        IDE["IDE\n(Windsurf / Claude Code)"]
    end

    subgraph dap-bpa Layer
        Skills["dap-bpa Skills\n(Markdown + SKILL.md)"]
        CLI["dap-bpa CLI\nv0.28.2"]
        MCP["MCP Server\n(Roadmap)"]
    end

    subgraph Knowledge Layer
        KB["Local Knowledge Base\n(~/.blueprint-assist/)"]
        Plugins["Plugin Docs\n(vsphere, aws, k8s, ...)"]
        Examples["Blueprint Examples"]
    end

    subgraph Orchestration Layer
        DAP["DAP Orchestrator\n(Dell Distributed Private Cloud)"]
        Blueprints["Blueprints"]
        Deployments["Deployments"]
        Secrets["Secrets"]
        OrcPlugins["Plugins"]
    end

    User --> IDE
    IDE --> Skills
    Skills --> CLI
    CLI --> KB
    KB --> Plugins
    KB --> Examples
    CLI -- "REST API\n--trust-all" --> DAP
    MCP -- "REST API" --> DAP
    DAP --> Blueprints
    DAP --> Deployments
    DAP --> Secrets
    DAP --> OrcPlugins
```

---

## 5. SSL/TLS Connection Options

Quick reference for connecting to orchestrators with certificate issues.

```mermaid
flowchart TD
    Connect["Connect to DAP Orchestrator"] --> SSLError{"SSL Error?"}
    SSLError -- "No" --> OK(["✅ Connected"])
    SSLError -- "Yes" --> A["Add `--trust-all`\n*(self-signed / dev only)*"]
    A --> OK
```

---

## 6. Specification-Driven Development Feedback Loop

The complete SDD cycle from specification through deployment back to specification improvement.

```mermaid
flowchart LR
    Spec["📋 Specification"] --> BPA["🔧 Build with BPA"]
    BPA --> Deploy["🚀 Upload & Deploy"]
    Deploy --> Test{"✅ Test & Validate"}
    Test -- "❌ Failed" --> Fix["🔧 Fix Blueprint"]
    Fix --> BPA
    Test -- "✅ Success" --> Learn["📊 Learn & Analyze"]
    Learn --> Improve["🔄 Update Specification"]
    Improve --> Spec
```

**Detailed feedback loop documentation**: [Specification Feedback Loop](specification-feedback-loop.md)

---

## Reference

- **Full CLI commands**: [Section 013 — dap-bpa CLI Command Reference](../section-013-bpa-cli-commands/content.md)
- **Skills architecture narrative**: [Section 005 — Skills-Based Architecture](../section-005-skills-architecture/content.md)
- **Monitor deep-dive**: [Section 008 — Blueprint Monitoring](../section-008-blueprint-monitoring/content.md)
- **Authentication & SSL**: [Section 003 — Orchestration Service Authentication](../section-003-orchestration-service-auth/content.md)
- **Specification methodology**: [Section 018 — Specification Considerations](../section-018-spec-considerations/content.md)
- **Feedback loop details**: [Specification Feedback Loop](specification-feedback-loop.md)
