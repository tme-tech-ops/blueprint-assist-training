# Section 017: Model and Architecture Decisions

> **Reference appendix: tooling and model decisions.** The detailed comparison below reflects the agents Dell field teams use day to day. Blueprint Assist itself is agent- and model-agnostic; the "Supported Tools and Models" section applies to everyone. This is a decisions reference, not a hands-on section.

This section covers decisions and comparisons between the AI agents, models, and architectural approaches used with Blueprint Assist.

> **Naming note (2026):** Following Cognition's rebrand, the IDE previously called Windsurf Cascade is now **Devin** (the editor), and the autonomous agent previously called Devin is now **Devin CLI**. This section uses the current names: "Devin (IDE)" for the editor and "Devin CLI" for the autonomous agent.

## Devin (IDE) vs Devin CLI

| Feature | Devin CLI (autonomous, cloud) | Devin IDE (real-time, in-editor) |
| --------- | ------------------------------- | ---------------------------------- |
| Primary Use | Autonomous agent (asynchronous) | Agentic IDE (real-time collaboration) |
| Operating Location | Cloud VM | Local editor (VS Code-based) |
| Best For | Complex / long-running tasks | Rapid development and file editing |
| Control Level | High delegation (passive) | Active pair-programming |
| Key Strength | Independent problem-solving | Deep local context awareness |
| Ecosystem | Cognition | Cognition |

### Which One Should You Use?

- **Choose the Devin IDE if:** you want to code faster, need intelligent autocomplete and multi-file refactoring, and want to keep your hands on the keyboard while the agent assists you.
- **Choose Devin CLI if:** you have a large task (for example, migrating a legacy repository or building a new feature from scratch), you want to delegate it, and you only want to review the final pull request.

The two work well together: the Devin IDE for daily coding, with Devin CLI invoked for long-running, autonomous tasks.

## Devin IDE: Architecture and Account Model

A Devin (IDE) account is the identity, billing, policy, and model-access layer for the editor and its in-editor agent (Cascade).

### Basic Flow

```text
Your repo / editor context
        ↓
Devin IDE agent (Cascade)
        ↓
Account + plan + model router
        ↓
Public hosted models
OpenAI / Anthropic / Devin SWE models / BYOK where supported
        ↓
Response, code edits, terminal actions
```

The IDE exposes models such as its SWE models plus GPT and Claude options, with usage tied to plan access and credits.

### What the Account Controls

#### Who you are

- Login, org membership, enterprise policy, workspace access

#### Which models you can use

- Hosted models, GPT models, Claude models, or approved BYOK / provider options depending on plan and configuration

#### How much you can use

- Usage is metered through credits or plan limits

#### What context can be sent

- Open files, selected code, terminal context, repo index, and conversation context may be used to ground the model

#### Enterprise controls

- Admins may restrict model choice, data handling, repo access, or integrations

## Devin CLI: Architecture and Integration

Devin CLI is closer to an autonomous software engineer that works across external systems. It integrates through native connectors like GitHub, Slack, Jira, and Linear; a secrets manager for credentials; and MCP for external tools and data sources.

### Typical Flow

```text
Issue / Slack request / GitHub task
        ↓
Devin CLI workspace
        ↓
Connected repo + secrets + tools
        ↓
Model reasoning + shell / browser / code execution
        ↓
Branch / PR / comment / status update
```

## Supported Tools and Models

Blueprint Assist is agent- and model-agnostic. It provides the skills and the `dap-bpa` CLI; you bring the agent and the model. The Devin comparison above reflects the common Dell-internal setup, but dap-bpa is not tied to it.

**Agents.** `dap-bpa setup-ide <ide>` installs the dap-bpa skills into any of these targets: `claude-code`, `cursor`, `windsurf` (the Devin IDE), `jetbrains`, `vscode`, `antigravity` (which also covers Codex CLI, Gemini CLI, and Goose), and `cline` (added v0.28.1). The skills are plain markdown the agent reads, so any agent that can load them can drive BPA.

**Diagnostician models.** The Blueprint Monitor's auto-repair (see Section 8) runs through a configurable LLM adapter chosen during `dap-bpa setup`: Amazon Bedrock, OpenAI, Claude Code, or Devin.

**Bring your own model.** Within a given agent, model choice follows that agent's plan and policy: hosted models, GPT, Claude, or BYOK where supported.

## Tool Selection Guide

| Tool | Best Use |
| ------ | ---------- |
| Devin IDE | You are actively coding in the editor and want AI help in-flow |
| Devin CLI | You want to delegate an engineering task and let the agent work semi-autonomously |
| Other supported agents | Claude Code, Cursor, JetBrains, VS Code, or Antigravity, installed with `dap-bpa setup-ide` |
| MCP / tools | Give any agent controlled access to APIs, docs, databases, tickets, or internal systems |
