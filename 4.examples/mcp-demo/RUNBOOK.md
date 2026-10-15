# MCP Demo Runbook: AI to Dell Automation Platform

> **Duration**: 10-15 minutes | **Format**: Live demo with speaker notes
>
> Keep this open on a second monitor while presenting.

---

## Pre-Demo Checklist

- [ ] VS Code open with MCP server connected and running
- [ ] DAP Orchestrator tab open in browser (for verification)
- [ ] At least one existing blueprint in DAP for the "understand" section
- [ ] Network connectivity verified
- [ ] This runbook open on second monitor

---

## Step 1: Opening (1 minute)

### Speaker Script

> "We've already shown how Blueprint Assist can help us build and
> understand Dell Automation Platform blueprints. Now I want to take
> that one step further.
>
> What if I want another AI assistant—VS Code, Windsurf, an enterprise
> agent, or eventually any MCP-compatible application—to interact
> directly with Dell Automation Platform?
>
> That's where MCP comes in."

### Show on Screen

Display the architecture diagram:

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

### Speaker Script (continued)

> "The MCP server becomes the standardized interface between the AI and
> Dell Automation Platform.
>
> The AI doesn't have to understand every DAP REST API. It discovers
> tools and calls them through MCP."

---

## Step 2: Show MCP is Real (30 seconds)

### Action

1. Open `.vscode/mcp.json` in VS Code
2. Show the configuration briefly

### Speaker Script

> "There isn't a custom VS Code extension doing this. VS Code is acting
> as an MCP client.
>
> I've registered the Blueprint Assist MCP server and supplied my DAP
> context and authentication."

### Action

Run command: `Ctrl+Shift+P` → **MCP: List Servers**

### Expected Result

```text
blueprint-assist       Running
```

### Speaker Script

> "Don't worry about the JSON-RPC details. The key point is: AI client
> connects to MCP, MCP connects to DAP."

---

## Step 3: Tool Discovery (1 minute)

### Prompt

```text
What Dell Automation Platform tools do you have available?
```

### Expected MCP Call

```text
tools/list
```

### Expected Response (highlight these categories)

**Knowledge Tools** (no credentials required):

- `search_docs`
- `get_plugin_docs`
- `list_node_types`
- `get_node_type`
- `find_blueprint_examples`
- `lint_blueprint`

**DAP Tools** (credentials required):

- `list_blueprints`, `get_blueprint`, `create_blueprint`
- `list_deployments`, `get_deployment`, `create_deployment`
- `list_executions`, `get_execution`, `start_execution`
- `list_plugins`
- `list_secrets`

### Speaker Script

> "This is the first important difference between MCP and simply giving
> an LLM some documentation.
>
> These aren't things the AI *thinks* Dell Automation Platform can do.
>
> These are capabilities that the MCP server is *actually advertising*."

---

## Step 4: Knowledge Tools (2 minutes)

### Prompt 1

```text
Find me a blueprint example for deploying infrastructure on VMware vSphere.
```

### Expected MCP Call

```text
find_blueprint_examples
```

### Prompt 2

```text
What node types are available in the vSphere plugin?
```

### Expected MCP Call

```text
list_node_types
```

### Prompt 3

```text
Explain the node type I would use to create a VM.
```

### Expected MCP Calls

```text
get_node_type
get_node_type_docs
```

### Speaker Script

> "Notice that I haven't connected the AI directly to VMware.
>
> Blueprint Assist is providing the domain knowledge needed to understand
> how Dell Automation Platform models that infrastructure."

---

## Step 5: Cross to Live DAP (1 minute)

### Prompt

```text
List the blueprints currently available on my Dell Automation Platform Orchestrator.
```

### Expected MCP Call

```text
list_blueprints
```

### Expected Response

Your actual DAP blueprints appear.

### Speaker Script (PAUSE here for effect)

> "We've just crossed an important boundary.
>
> A moment ago we were asking Blueprint Assist for knowledge.
>
> Now the same MCP interface is talking to my *actual* Dell Automation
> Platform environment."

---

## Step 6: Understand a Blueprint (1 minute)

### Action

Pick one existing blueprint from the list.

### Prompt

```text
Tell me what this blueprint does.
```

### Expected MCP Call

```text
summarize_blueprint
```

### Expected Response Format

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

### Speaker Script

> "So MCP isn't simply providing CRUD operations against DAP.
>
> We're combining the operational capabilities of Dell Automation Platform
> with the intelligence of Blueprint Assist."

---

## Step 7: Plan a New Blueprint (1 minute)

### Prompt

```text
I need a simple development environment on VMware. Create a blueprint plan for a VM with 4 CPUs, 16 GB of memory, networking and storage.
```

### Expected MCP Call (Agent MCP Server)

```text
plan_blueprint
```

### Show on Screen

Display the two-server architecture:

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

### Speaker Script

> "This is where the architecture gets really interesting.
>
> The Agent MCP Server provides the intelligence for planning,
> authoring, reviewing and packaging.
>
> The gateway MCP server provides structured operations against Dell
> Automation Platform."

---

## Step 8: Build the Blueprint (2 minutes)

### Prompt

```text
Build that blueprint.
```

### Expected MCP Call Sequence

```text
plan_blueprint
    ↓
get_node_type / get_node_type_docs
    ↓
[Generate blueprint YAML]
    ↓
lint_blueprint
    ↓
review_blueprint
    ↓
package_blueprint
```

### Speaker Script

> "We've moved from natural-language intent to a deterministic
> infrastructure-as-code artifact.
>
> And that's important—the AI isn't hiding the automation.
>
> We still have an explicit blueprint that can be inspected, versioned,
> validated and governed."

---

## Step 9: Validate Before Deployment (1 minute)

### Setup (Optional)

If possible, introduce a small error beforehand for dramatic effect.

### Prompt

```text
Validate this blueprint before we put it into DAP.
```

### Expected MCP Call

```text
lint_blueprint
```

### Expected Response (if error exists)

```text
ERROR

Required property "network_name" missing
```

### Follow-up Prompt

```text
Fix the issue and validate it again.
```

### Expected MCP Call Sequence

```text
edit_blueprint
    ↓
lint_blueprint
    ↓
PASS
```

### Speaker Script

> "We're not trusting the LLM's output simply because it looks correct.
>
> We're validating the resulting artifact against the automation model."

---

## Step 10: Publish to DAP (1 minute)

### Prompt

```text
Upload this blueprint to my Dell Automation Platform Orchestrator.
```

### Expected MCP Call

```text
create_blueprint
```

### Action

Switch to DAP Orchestrator browser tab. Show the blueprint.

### Speaker Script

> "And there it is.
>
> We started with a natural-language requirement in an AI client.
>
> Blueprint Assist helped us construct and validate the automation.
>
> MCP connected that experience to Dell Automation Platform.
>
> And the resulting artifact is now managed by DAP."

---

## Step 11: Deploy (1 minute)

### Prompt

```text
Deploy the blueprint we just created as MCP-DEMO-01.
```

### Expected MCP Call Sequence

```text
create_deployment
    ↓
start_execution
```

### Follow-up Prompt

```text
Show me the status of the deployment.
```

### Expected MCP Calls

```text
get_deployment
get_execution
get_events
```

### Action

Switch briefly to Orchestrator and show the workflow executing.

---

## Step 12: Close the Loop (1 minute)

### Prompt

```text
What's happening with my deployment?
```

### Expected Response Format

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

### Show on Screen

Display the complete loop diagram:

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

## Step 13: Closing (30 seconds)

### Speaker Script

> "What you just saw wasn't an AI chatbot with access to some Dell documentation.
>
> We started with human intent.
>
> Blueprint Assist provided the domain knowledge and authoring intelligence
> to turn that intent into an explicit, deterministic Dell Automation
> Platform blueprint.
>
> MCP provided the standardized interface that allowed the AI client to
> discover those capabilities and interact with Dell Automation Platform.
>
> Dell Automation Platform remained the execution and lifecycle engine.
>
> And once execution started, MCP brought the operational context back to the AI."

### Pause, Then Deliver the Headline

> "**MCP doesn't replace Dell Automation Platform. MCP makes Dell
> Automation Platform accessible to the agentic ecosystem.**"

### Final Line

> "**Blueprint Assist turns intent into automation. MCP makes that
> automation accessible to AI. Dell Automation Platform turns it into
> action.**"

---

## Quick Reference: MCP Lifecycle

| Stage | Tool(s) | Server |
| ----- | ------- | ------ |
| **Discover** | `tools/list` | Gateway |
| **Understand** | `find_blueprint_examples`, `get_node_type`, `get_plugin_docs` | Gateway |
| **Author** | `plan_blueprint`, `edit_blueprint` | Agent |
| **Validate** | `lint_blueprint`, `review_blueprint` | Gateway / Agent |
| **Publish** | `create_blueprint` | Gateway |
| **Deploy** | `create_deployment`, `start_execution` | Gateway |
| **Monitor** | `get_execution`, `get_events` | Gateway |

---

## Troubleshooting During Demo

| Issue | Quick Fix |
| ----- | --------- |
| MCP server not responding | `Ctrl+Shift+P` → **MCP: Restart Server** |
| Auth errors | Verify token hasn't expired; re-obtain from DAP portal |
| Slow responses | Normal for first call; subsequent calls are faster |
| Blueprint validation fails | Use the error as a teaching moment for the validate/fix cycle |

---

## Post-Demo Resources

Point audience to:

- [Section 019: Blueprint Assist MCP Server](../../1.sections/section-019-mcp-server/content.md)
- [Section 026: MCP Token Management](../../1.sections/section-026-mcp-token-management/content.md)
- [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
