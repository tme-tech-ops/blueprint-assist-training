# Section 000: Quick Start — Zero to Hero

**Goal**: Install BPA, connect it to your AI IDE, and author or analyze your first blueprint — all in under 15 minutes.

---

## How dap-bpa Works (60-second overview)

Blueprint Assist has two moving parts:

1. **`dap-bpa` CLI** — runs locally on your machine. Lints blueprints, queries plugin docs, talks to the DAP orchestrator, and runs automated lifecycle tests.
2. **AI skills** — loaded into your IDE agent (Windsurf, Claude Code, Devin, Cursor). These give your agent the context it needs to generate valid, deployable DAP blueprints instead of hallucinating them.

You use both together: chat with your agent to design and author blueprints, use `dap-bpa` commands to validate and deploy them.

> **Offline vs. online**: Authoring, linting, and blueprint reasoning work with no orchestrator access. Uploading, deploying, and monitoring require a live DAP orchestrator connection. Steps 2–5 work entirely offline.

---

## Step 1 — Prerequisites

Check these off before you start:

- [ ] **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 20.04+
- [ ] **RAM**: 8 GB minimum (16 GB recommended)
- [ ] **Git** installed
- [ ] **dap-bpa installer**: available from [Dell Automation Studio](https://automation.dell.com/catalog)
- [ ] **AI IDE**: Windsurf or Claude Code installed (see Step 3 — install dap-bpa first)
- [ ] **DAP orchestrator credentials**: *optional — skip if starting with offline authoring only*

---

## Step 2 — Install BPA

### Windows (recommended: NSIS installer)

```powershell
# Run the downloaded setup executable
.\bpa-win-x64-*-setup.exe
```

### Windows (PowerShell script alternative)

```powershell
$zip = Get-ChildItem bpa-win-x64-v0.*-*.zip | Select-Object -First 1
Expand-Archive $zip.Name -DestinationPath bpa
cd bpa; .\install.ps1
```

### macOS / Linux / WSL

```bash
chmod +x install.sh
./install.sh
```

### Confirm it worked

```bash
dap-bpa --version
dap-bpa --help
```

If `dap-bpa` is not found, open a new terminal so the PATH update takes effect.

> **Detailed install reference**: [Section 2 — Installation](../section-002-installation/content.md)

---

## Step 3 — Install an AI IDE

dap-bpa skills work with Windsurf, Claude Code, Cursor, Devin, and others. **Windsurf is recommended for new users**.

### Windsurf

Download and install from [windsurf.com](https://windsurf.com/).
When prompted for an SSO key on first launch, enter: `dell`

### Devin (optional, Windows)

```powershell
irm https://static.devin.ai/cli/setup.ps1 | iex
```

When prompted for an SSO key on first launch, enter: `dell`

> If using both, install Windsurf before Devin.
>
> **IDE comparison**: [Section 17 — Model and Architecture Decisions](../section-017-model-architecture-decisions/content.md)

---

## Step 4 — Load dap-bpa Skills into Your IDE

This single command is what makes your AI agent understand Dell Automation Platform blueprints:

```bash
# Windsurf
dap-bpa setup-ide windsurf

# Claude Code
dap-bpa setup-ide claude-code

# Cursor
dap-bpa setup-ide cursor

# Devin
dap-bpa setup-ide windsurf   # Devin reads from the Windsurf skills directory
```

dap-bpa installs its curated blueprint skills and rules into your IDE's agent directory. The agent picks them up automatically — no further registration needed.

**Verify the full setup state:**

```bash
dap-bpa status
```

---

## Step 5 — Your First Blueprint (offline)

No orchestrator? No problem. This works entirely from the training repo files on your workstation.

### 5a. Explore the knowledge base

```bash
# Search by keyword to find relevant examples
dap-bpa knowledge blueprints find "ubuntu bare-metal"
dap-bpa knowledge blueprints find "kubernetes"
dap-bpa knowledge blueprints find "vsphere vm"

# Look up what node types a plugin provides
dap-bpa knowledge plugins list vsphere
```

### 5b. Lint a blueprint

Download any blueprint from [automation.dell.com/catalog](https://automation.dell.com/catalog), then run:

```bash
dap-bpa blueprint lint \
  --file path/to/your/blueprint.yaml \
  --verify
```

You should see a structured JSON diagnostics report. Any findings listed are real lint issues in the file — reading them is your first look at what the linter checks and why it matters before deploying.

### 5c. Ask your agent about it

Open your blueprint file in Windsurf, start a new chat, and try one of these prompts:

```text
@dap-bpa What does this blueprint deploy, and what inputs does it require?
```

```text
@dap-bpa What skills do you have?
```

```text
@dap-bpa Without building anything, walk me through how you would create a blueprint
for a Windows Server VM on an ESXi host
```

```text
@dap-bpa Build me a blueprint framework for an nginx deployment
```

If the agent responds with structured blueprint knowledge — referencing node types, plugin versions, TOSCA patterns — the skills are working correctly.

---

## Step 6 — Connect to Your Orchestrator (optional)

Skip this step if you don't yet have DAP credentials. Come back when you do.

```bash
# Interactive setup wizard
# Prompts for: portal domain, orchestrator domain, org ID, client ID, client secret
dap-bpa setup

# Verify the connection
dap-bpa status

# List blueprints on the orchestrator
dap-bpa orchestrator blueprints list
```

**SSL issues with self-signed certificates in dev environments:**

```bash
dap-bpa orchestrator blueprints list --trust-all
```

**Upload the sample blueprint and see it appear on the orchestrator:**

```bash
dap-bpa orchestrator blueprints upload \
  --file path/to/your/blueprint.yaml \
  --id my-blueprint-qs \
  --revision 1.0.0

# Confirm upload was processed
dap-bpa orchestrator blueprints get my-blueprint-qs
```

> **Full authentication reference**: [Section 3 — Orchestration Service Authentication](../section-003-orchestration-service-auth/content.md)

---

## Step 7 — Run the Full Lifecycle with Monitor (optional, requires orchestrator)

`dap-bpa monitor` automates upload → deploy → install → validate → cleanup in one command. An LLM-powered diagnostician can auto-repair failures mid-run:

```bash
dap-bpa monitor \
  --file path/to/your/blueprint.yaml \
  --inputs '{"key": "value"}'
```

Configure the diagnostician adapter (choose one: AWS Bedrock, OpenAI, Claude Code, or Devin):

```bash
dap-bpa setup   # re-run — select the diagnostician option
```

Check the status of a running monitor session:

```bash
dap-bpa monitor --status
dap-bpa monitor --daemon-status
```

> **Full monitor reference**: [Section 8 — Blueprint Monitoring](../section-008-blueprint-monitoring/content.md)

---

## Mental Model

```text
Your IDE agent
     │  (reads dap-bpa skills installed by dap-bpa setup-ide)
     ▼
  dap-bpa CLI  ──── lint / validate ────▶ blueprint.yaml (local files)
     │
     └──── orchestrator commands ───▶ DAP (upload, deploy, execute, monitor)
```

The **skills** tell your agent what DAP can actually do — plugins, node types, TOSCA patterns — so it generates blueprints that are valid and deployable, not guesses. The **`dap-bpa` CLI** validates your work locally before anything touches the orchestrator, and then drives the full deployment lifecycle when you're ready. You describe requirements in plain English; dap-bpa turns them into compliant TOSCA blueprints.

---

## Where to Go Next

Pick the path that matches your immediate goal:

| I want to… | Go here |
| --- | --- |
| Understand the full concepts before building | [Section 1 — Introduction](../section-001-introduction/content.md) |
| See what blueprints and plugins are already available | [Section 6 — Supported Blueprints](../section-006-supported-blueprints/content.md) |
| Build a blueprint from scratch with AI assistance | [Section 7 — Building Blueprints](../section-007-building-blueprints/content.md) |
| Understand the skills-based architecture in depth | [Section 4](../section-004-skills-overview/content.md) → [Section 5](../section-005-skills-architecture/content.md) |
| Analyze an existing blueprint with AI (no orchestrator needed) | [Section 9 — Blueprint Reasoning](../section-009-blueprint-reasoning/content.md) |
| Run automated lifecycle tests | [Section 8 — Blueprint Monitoring](../section-008-blueprint-monitoring/content.md) |
| Connect via SSH tunnel to a remote orchestrator | [Section 16 — Tunnel Connections](../section-016-tunnel-connections/content.md) |
| Reference every CLI command in one place | [Section 13 — CLI Reference](../section-013-bpa-cli-commands/content.md) |
| Do a complete guided hands-on exercise | [Section 12 — Hands-On Workshop](../section-012-hands-on-workshop/content.md) |

---

## Quick Troubleshooting

| Symptom | Fix |
| --- | --- |
| `command not found: bpa` | Open a new terminal after install so PATH updates take effect |
| `dap-bpa status` shows no orchestrator | Run `dap-bpa setup` to configure credentials |
| Agent doesn't mention blueprints or plugins | Re-run `dap-bpa setup-ide <your-ide>` and restart the IDE |
| Lint returns findings on the sample | Expected — read them as a learning exercise; they won't block offline usage |
| `401` or `403` from orchestrator | Re-run `dap-bpa setup`; check org ID, client ID, and client secret |
| SSL certificate error | Add `--trust-all` flag (dev environments only) |

> **Full CLI troubleshooting**: [Section 13 — CLI Reference](../section-013-bpa-cli-commands/content.md#troubleshooting-the-cli)
