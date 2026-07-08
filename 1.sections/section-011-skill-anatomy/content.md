# Section 011: Skill Anatomy and Design

## Overview

A dap-bpa skill is a markdown knowledge package that an AI agent loads to learn how to do a job. Section 4 covered the catalog of skills and when each applies, and Section 5 covered where skills sit in the overall architecture. This section takes a skill apart and explains its structure: the files on disk, the `SKILL.md` entry point, the reference material it draws on, and how the agent decides to use it.

A skill is not a program with parameters and outputs. It is guidance the agent reads. There is no `dap-bpa skills` command, no skill registry, and no per-skill parameter schema. Skills are installed into your IDE with `dap-bpa setup-ide` and the agent invokes them by matching what you ask against the skill's description.

## What a Skill Is and Where It Lives

Each skill is a directory installed under your IDE's skills location. For Claude Code that is `.claude/skills/<skill-name>/`. The four dap-bpa skills install as four directories: `dap`, `dap-scripts`, `dap-deployment-update`, and `dap-service-composition`.

A skill directory contains:

```text
dap/
├── SKILL.md            # The entry point the agent loads
└── references/         # Detailed docs loaded on demand
    ├── blueprint-examples.md
    ├── guides.md
    ├── troubleshooting.md
    ├── cli-commands.md
    ├── monitor.md
    └── ...
```

`SKILL.md` is the file the agent reads first. The `references/` directory holds the depth, which the agent pulls in only when a task needs it.

## Anatomy of `SKILL.md`

### Frontmatter

Every `SKILL.md` opens with YAML frontmatter that has exactly two fields, `name` and `description`:

```yaml
---
name: dap-deployment-update
description: Use when updating a deployment — blueprint version bumps, input changes, skip_install/uninstall/reinstall, reinstall_list, force_reinstall, preview mode, drift check. Triggers — deployment update, node reinstall.
---
```

There is no version, category, author, or license field. The `name` is the skill's identifier. The `description` is the most important line in the whole file.

### The description is how the agent finds the skill

The agent does not run a skill on command. It reads the `description` of every installed skill and invokes the one whose description matches what you are asking. So the description is written as a list of trigger phrases and situations. The core `dap` skill's description is a long list of exactly this kind:

```yaml
description: >-
  Use when the user says "write a blueprint", "fix my blueprint",
  "create a deployment", "what node type", "how do I deploy",
  "blueprint won't validate", "lint this", "review this yaml",
  "add an input", "which plugin", "help me with TOSCA", ...
  or any request to write, review, debug, test, or get step-by-step
  help with blueprint YAML or DAP workflows.
```

A vague description means the agent misses the skill when it should use it. A precise, phrase-rich description is what makes the skill reliably discoverable. This is the single most important thing to get right when writing or editing a skill.

### The body

After the frontmatter, the body is markdown that guides the agent. A few conventions recur across the dap-bpa skills:

- **Runtime mode.** Each skill states how it runs. The dap-bpa skills run in IDE mode with shell access and tell the agent to use the `bpa` CLI for operations.
- **Routing sections.** Rather than inline every detail, the body routes the agent to a reference file for the task at hand, for example "if the user asks how to write a blueprint, load `references/guides.md` and follow it." This keeps the always-loaded part of the skill small.
- **An authoring or domain reference.** A condensed reference for the most common work, so the agent can act without loading everything.
- **A CLI quick reference.** The handful of commands the skill leans on, with a pointer to the full command reference.

The pattern is the same throughout: keep `SKILL.md` lean and route to `references/` for depth.

## Reference Material

The `references/` directory is where the detail lives. The agent loads a reference file only when the task calls for it, which keeps the skill's baseline footprint small while still giving the agent access to deep material. In the `dap` skill these include:

| Reference | Content |
| ----------- | --------- |
| `blueprint-examples.md` | Complete blueprint templates and multi-file patterns |
| `guides.md` | Step-by-step workflow guides (write a blueprint, create a deployment, manage secrets) |
| `troubleshooting.md` | Failed deployment diagnosis and error reference |
| `cli-commands.md` | The full CLI reference with all flags and fields |
| `monitor.md` | How the monitor and diagnostician work |
| `onboarding-*.md` | Guided onboarding for blueprints, deployments, plugins, secrets, and setup |

## Rules

Alongside the skill, dap-bpa ships a set of authoring rules, the best practices the agent applies while writing blueprints. These are the rules that carry codes such as ND-003 (delete must reverse create), IN-001 (every input needs a description), CP-001 (use capabilities, not legacy outputs), and BS-009 (keep a changelog). They are written so the agent applies them automatically rather than waiting to be asked. When you run `dap-bpa setup-ide`, the rules install into your IDE's rules directory next to the skills, so the agent both knows how to do the work and knows the standards the work must meet.

## How the Four Skills Fit Together

The dap-bpa skills follow a single-responsibility design. Each one owns a focused job:

- **`dap`** is the core authoring, linting, deployment, and monitoring skill, and the entry point for most work.
- **`dap-scripts`** covers writing Python lifecycle scripts (`from dell import ctx`).
- **`dap-deployment-update`** covers Day-2 updates, reinstall, and drift.
- **`dap-service-composition`** covers composing blueprints with ServiceComponents and SharedResource.

They compose through routing. The `dap` skill recognises when a task belongs to a specialised skill and hands off to it, for example loading the deployment-update skill when you ask to add update support. You do not chain them manually; the core skill routes to the right one based on what you are doing.

## Designing a Skill

If you write or extend a skill, a few principles match how the dap-bpa skills are actually built:

- **Single responsibility.** One focused job per skill, the way `dap-scripts` and `dap-service-composition` are scoped. A skill that tries to do everything is harder for the agent to match and to maintain.
- **Discoverability through the description.** Put the real phrases users say into the `description`. This is what gets the skill invoked at the right moment.
- **Keep `SKILL.md` lean, push depth to `references/`.** The agent loads the body every time, so the body should route rather than contain. Detail belongs in reference files loaded on demand.
- **Encode the standards as rules.** Recurring best practices belong in the rules the agent applies automatically, not buried in prose a reader has to remember.

A skill is documentation the agent reads, so it is tested by use: you exercise the agent against real tasks and confirm it loads the right skill, follows the guidance, and produces blueprints that lint clean. There are no unit tests, build steps, or a publish-to-registry stage, because there is nothing compiled or deployed. The skill is the markdown.

## Installation and Versioning

Skills are installed into your IDE with `dap-bpa setup-ide <ide>`, which writes the skill directories and the rules into the locations that IDE expects:

```bash
dap-bpa setup-ide claude-code        # .claude/skills/ + .claude/rules/
dap-bpa setup-ide windsurf           # ~/.codeium/windsurf/skills/ + ~/.windsurf/rules/
dap-bpa setup-ide cursor             # .agents/skills/ + .agents/rules/
```

Use `--dry-run` to preview what would be written, and `--scope` (for Claude Code) to choose a personal or project install.

Skills version with the dap-bpa release. They are bundled with the CLI rather than versioned individually, so the way to update them is to upgrade dap-bpa and re-run `dap-bpa setup-ide`. There is no per-skill version number to track and no separate skill package to publish.

## Next Steps

1. **Section 12: Hands-on Workshop** puts the skills to work on a real blueprint task end to end.
2. **Section 4: Skills Overview** is the catalog of the four skills and when to reach for each.
3. **Section 5: Skills Architecture** shows where skills sit in the overall dap-bpa system.
