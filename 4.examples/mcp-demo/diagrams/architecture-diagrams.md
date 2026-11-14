# MCP Demo Architecture Diagrams

> ASCII diagrams for slides and presentations. Copy these directly into
> your presentation materials.

---

## Diagram 0: The Three-Layer Model

**Use in**: Opening / Why MCP explanation

```text
┌───────────────────────────────┐
│        INTELLIGENCE           │
│                               │
│      AI / LLM / Agent         │
│                               │
│ "What does the user want?"    │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│          INTERFACE            │
│                               │
│             MCP               │
│                               │
│ "What can I do and how        │
│  do I invoke it?"             │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│          EXECUTION            │
│                               │
│ Dell Automation Platform      │
│                               │
│ "Do the work."                │
└───────────────────────────────┘
```

### Responsibility Matrix (for slides)

```text
┌─────────────────┬────────────────────────────────────────────────┐
│     LAYER       │              RESPONSIBILITY                    │
├─────────────────┼────────────────────────────────────────────────┤
│ AI / Agent      │ Natural-language understanding                 │
│                 │ Reasoning and intent interpretation            │
│                 │ Selecting appropriate tools                    │
│                 │ Explaining results to user                     │
├─────────────────┼────────────────────────────────────────────────┤
│ MCP             │ Tool discovery                                 │
│                 │ Tool schemas                                   │
│                 │ Standard AI/tool interface                     │
│                 │ Context exchange                               │
│                 │ Client portability                             │
├─────────────────┼────────────────────────────────────────────────┤
│ DAP             │ Workflow execution                             │
│                 │ Orchestration                                  │
│                 │ Secrets management                             │
│                 │ Infrastructure integrations                    │
│                 │ Lifecycle management                           │
│                 │ Policy / controls                              │
│                 │ Execution history                              │
└─────────────────┴────────────────────────────────────────────────┘
```

---

## Diagram 0b: Multi-Client Value Proposition

**Use in**: Why MCP explanation

### Without MCP (repeated integration)

```text
Claude ─────────────► Custom DAP Integration ─┐
                                              │
VS Code ────────────► Custom DAP Integration ─┼──► DAP
                                              │
Enterprise Agent ───► Custom DAP Integration ─┘
```

### With MCP (single integration)

```text
 VS Code ──────────┐
                   │
 Claude ───────────┤
                   │
 AI Assistant ─────┼──► MCP ──► Blueprint Assist / DAP
                   │
 Enterprise Agent ─┤
                   │
 Future AI Client ─┘
```

---

## Diagram 1: MCP Architecture Overview

**Use in**: Step 1 (Opening)

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

---

## Diagram 2: Two MCP Servers

**Use in**: Step 7 (Plan a New Blueprint)

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

### Expanded Version (with tool examples)

```text
                         AI CLIENT
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
     ┌─────────────────┐        ┌─────────────────┐
     │   AGENT MCP     │        │   GATEWAY MCP   │
     │     SERVER      │        │     SERVER      │
     ├─────────────────┤        ├─────────────────┤
     │ plan_blueprint  │        │ list_blueprints │
     │ edit_blueprint  │        │ create_blueprint│
     │ review_blueprint│        │ list_deployments│
     │ package_blueprint│       │ start_execution │
     │ summarize       │        │ list_plugins    │
     └────────┬────────┘        └────────┬────────┘
              │                          │
              └────────────┬─────────────┘
                           ▼
                  ┌─────────────────┐
                  │ DAP ORCHESTRATOR│
                  └─────────────────┘
```

---

## Diagram 3: Authoring Flow

**Use in**: Step 8 (Build the Blueprint)

```text
User Intent

"I need a VMware development environment."

        ↓

plan_blueprint

        ↓

get_node_type / docs

        ↓

Generate blueprint

        ↓

lint_blueprint

        ↓

review_blueprint

        ↓

package_blueprint
```

### Horizontal Version

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Intent  │ → │   Plan   │ → │  Lookup  │ → │ Generate │ → │   Lint   │ → │ Package  │
│          │    │          │    │          │    │          │    │          │    │          │
│ "I need  │    │ plan_    │    │ get_node │    │ YAML     │    │ lint_    │    │ package_ │
│ a VM..." │    │ blueprint│    │ _type    │    │ creation │    │ blueprint│    │ blueprint│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Diagram 4: Validate/Fix Cycle

**Use in**: Step 9 (Validate Before Deployment)

```text
edit_blueprint
      ↓
lint_blueprint
      ↓
    PASS
```

### With Error Flow

```text
                    ┌─────────────┐
                    │   Validate  │
                    │ lint_blueprint
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        ┌─────────┐               ┌─────────┐
        │  PASS   │               │  ERROR  │
        └────┬────┘               └────┬────┘
             │                         │
             ▼                         ▼
        ┌─────────┐               ┌─────────┐
        │ Continue│               │   Fix   │
        │ to DAP  │               │edit_blueprint
        └─────────┘               └────┬────┘
                                       │
                                       └──→ [Back to Validate]
```

---

## Diagram 5: Complete Loop

**Use in**: Step 12 (Close the Loop)

```text
        HUMAN INTENT
             │
             ▼
        AI ASSISTANT
             │
             │ MCP
             ▼
      BLUEPRINT ASSIST
             │
       ┌─────┴─────┐
       ▼           ▼
    AUTHOR       OPERATE
       │           │
       └─────┬─────┘
             ▼
     DELL AUTOMATION
        PLATFORM
             │
             ▼
        BLUEPRINT
             │
             ▼
       INFRASTRUCTURE
             │
             ▼
       EXECUTION DATA
             │
             │ MCP
             ▼
        AI ASSISTANT
             │
             ▼
           USER
```

---

## Diagram 6: MCP Lifecycle

**Use in**: Summary / Reference

```text
┌──────────┐   ┌────────────┐   ┌────────┐   ┌──────────┐   ┌─────────┐   ┌────────┐   ┌─────────┐
│ DISCOVER │ → │ UNDERSTAND │ → │ AUTHOR │ → │ VALIDATE │ → │ PUBLISH │ → │ DEPLOY │ → │ MONITOR │
└──────────┘   └────────────┘   └────────┘   └──────────┘   └─────────┘   └────────┘   └─────────┘
     │               │              │              │             │            │            │
     ▼               ▼              ▼              ▼             ▼            ▼            ▼
 tools/list    find_examples   plan_blueprint  lint_blueprint  create_    create_      get_
               get_node_type   edit_blueprint  review_         blueprint  deployment   execution
               get_plugin_docs                 blueprint                  start_       get_events
                                                                          execution
```

---

## Diagram 7: Tool Categories

**Use in**: Step 3 (Tool Discovery)

```text
┌─────────────────────────────────────────────────────────────┐
│                    MCP TOOL CATALOG                         │
├─────────────────────────────┬───────────────────────────────┤
│     KNOWLEDGE TOOLS         │         DAP TOOLS             │
│   (no credentials needed)   │    (credentials required)     │
├─────────────────────────────┼───────────────────────────────┤
│ • search_docs               │ • list_blueprints             │
│ • get_plugin_docs           │ • get_blueprint               │
│ • list_node_types           │ • create_blueprint            │
│ • get_node_type             │ • list_deployments            │
│ • find_blueprint_examples   │ • create_deployment           │
│ • lint_blueprint            │ • start_execution             │
│ • get_node_type_docs        │ • get_execution               │
│                             │ • list_plugins                │
│                             │ • list_secrets                │
└─────────────────────────────┴───────────────────────────────┘
```

---

## Diagram 8: Deployment Status

**Use in**: Step 12 (Close the Loop)

```text
MCP-DEMO-01

Status: In Progress

✓ Blueprint uploaded
✓ Deployment created
✓ Network validated
✓ Storage selected
→ Creating virtual machine
○ Post-deployment validation
```

---

## Diagram 9: Blueprint Summary Format

**Use in**: Step 6 (Understand a Blueprint)

```text
Blueprint: VMware SQL Development Environment

Components
────────────────────
vSphere VM
Network
Storage
Operating System

Inputs
────────────────────
VM Name
CPU
Memory
Network
Datastore

Workflow
────────────────────
Create VM
Configure networking
Attach storage
Validate deployment
```

---

## Usage Notes

### For Slides

1. Use monospace font (Consolas, Courier New, or similar)
2. White text on dark background works well for ASCII art
3. Consider adding subtle color coding for different components

### For Documentation

These diagrams render correctly in:

- GitHub Markdown
- VS Code preview
- Most documentation systems

### For Live Demo

Keep the relevant diagram visible on your secondary monitor or have them
ready to paste into a notes app during the presentation.
