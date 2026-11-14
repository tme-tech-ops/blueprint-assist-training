---
name: blueprint-agent-setup
description: >-
  Use when the user asks what the DAP Agent skill is, how to get started with Blueprint Assist,
  what workflows the agent handles, how to write a prompt to author a blueprint, how the agent
  differs from the MCP endpoint, "what can the agent do", "how do I use blueprint assist",
  "agent skill overview", "how do I configure it", "example prompts", or any request for an
  introduction or orientation to the DAP Agent skill.
---

# Blueprint Assist Agent — Overview

This skill provides orientation for release consumers who want to understand what the Blueprint Assist agent does and how to use it effectively.

## Reference Files

| File | Content |
|---|---|
| `references/agent-guide.md` | What the agent is, main workflows, prompt patterns, configuration, examples, and verification |

## Routing

All requests covered by this skill should load `references/agent-guide.md`. For hands-on blueprint authoring help (writing YAML, lint, validate, plugins), route to the `dap` skill instead.
