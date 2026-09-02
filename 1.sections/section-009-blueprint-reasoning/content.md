# Section 009: Blueprint Reasoning and Analysis

## Overview

Blueprint reasoning covers how you use dap-bpa to analyze, explain, and understand blueprints. Unlike blueprint monitoring (Section 8), reasoning does not require a DAP connection. It operates on your blueprint YAML files locally, using the dap-bpa skills and knowledge base in your IDE.

## How Reasoning Works in BPA

Reasoning is not a set of CLI verbs. It is delivered by the AI agent in your IDE working through the dap-bpa (`dap`) skill, which the agent uses to:

- Read your blueprint YAML and reason about its structure and behavior
- Look up node types, plugins, and concepts in the local knowledge base
- Run the local validation primitives to find concrete issues

So "analyzing a blueprint" means asking the agent in plain language and letting it combine those sources. The CLI primitives that back this reasoning, all local and requiring no orchestrator connection, are:

| Task | Real command |
| ------ | -------------- |
| Find structural and rule issues | `dap-bpa blueprint lint --file <path>` |
| Validate a node or every node against its plugin schema | `dap-bpa blueprint validate <node> --file <path>` / `dap-bpa blueprint validate-all --file <path>` |
| Understand a plugin's node types | `dap-bpa knowledge plugins list <plugin>` |
| Read a node type's properties and docs | `dap-bpa knowledge plugins node-type-docs <plugin> <type>` |
| Look up a concept | `dap-bpa knowledge docs find "<query>"` |
| Study a reference blueprint in full | `dap-bpa knowledge blueprints get <id> --include-files` |

The agent draws on these while reasoning. You can also run them yourself to check its conclusions.

## Analyzing an Existing Blueprint

To analyze a blueprint, open it in your IDE and ask the agent. For example:

- "Summarize what this blueprint deploys and the resources it creates."
- "Which plugins and node types does this blueprint use, and what is each one for?"
- "Walk me through the install order of these node templates."
- "Are any of these inputs unused, or referenced but never defined?"
- "Point out anything that looks risky or non-standard in this blueprint."

The agent reads the YAML, resolves the node types against the knowledge base, and runs `dap-bpa blueprint lint` and `validate-all` to back its findings with concrete diagnostics rather than guesses. To confirm what it reports, run the same commands directly:

```bash
dap-bpa blueprint lint --file blueprint.yaml
dap-bpa blueprint validate-all --file blueprint.yaml
```

## Understanding Blueprint Components and Their Purposes

When reading an unfamiliar blueprint, it helps to break it down by the kind of resource each node template provisions. Use the questions below as prompts to the agent, or as your own checklist while reading the YAML.

### Network Components

**Purpose**: Provide connectivity and isolation
**Key elements**: virtual networks, subnets, security groups, route tables, gateways

**Questions to ask**:

- What is the network topology?
- Are subnets properly segmented?
- Are any security rules too permissive?
- Is there redundancy?

### Compute Components

**Purpose**: Host applications and services
**Key elements**: virtual machines, scale sets, bare metal servers, Kubernetes clusters

**Questions to ask**:

- What compute resources are provisioned?
- Is the sizing appropriate?
- Are there high-availability configurations?
- Are autoscaling policies in place?

### Storage Components

**Purpose**: Persist data and provide file storage
**Key elements**: disks, file shares, PowerStore integration, CSI storage

**Questions to ask**:

- What storage types are used?
- Is storage appropriately tiered?
- Are backup policies configured?
- Is storage encrypted?

### Security Components

**Purpose**: Protect resources and data
**Key elements**: identity and access, secrets, encryption, network security

**Questions to ask**:

- What security controls are in place?
- Are permissions least-privilege?
- Are secrets handled through `get_secret` rather than hardcoded?
- Are compliance requirements met?

To ground these questions in the actual node types, look them up in the knowledge base:

```bash
dap-bpa knowledge plugins list vsphere
dap-bpa knowledge plugins node-type-docs vsphere dell.nodes.vsphere.Server
```

## Explaining What a Blueprint Does and Its Dependencies

### Plain-language explanation

Ask the agent to explain a blueprint in prose:

> "Explain in plain language what this blueprint deploys."

A typical explanation reads like:

```text
This blueprint deploys a 3-tier web application consisting of:
1. A virtual network with 3 subnets (web, app, database)
2. 2 web servers in the web subnet
3. 2 application servers in the app subnet
4. A database server in the database subnet
5. A load balancer distributing traffic to the web servers
6. A storage account for application data
```

### Dependencies and execution order

Dependencies between node templates are expressed in the YAML through `relationships` and through intrinsic functions such as `get_attribute`, which make one node depend on another's runtime output. To understand them:

- Ask the agent: "What does each node template depend on, and what is the resulting install order?"
- Read the `relationships` blocks in `node_templates` directly.
- Run `dap-bpa blueprint validate-all --file blueprint.yaml`, which validates every node against its plugin schema and surfaces problems with the references between them.

The agent uses these together to describe the dependency chain and the order in which nodes are created.

## Interpreting Blueprint Outputs and Configurations

### Resources and configuration

To understand what a blueprint will create and how it is configured, ask the agent or read the YAML:

- "List every resource this blueprint creates, by node type and count."
- "Show me all inputs, their defaults, and which ones are required."
- "Which inputs feed which node templates?"

Inputs, their defaults, and their constraints live in the `inputs` section of the blueprint; capabilities and outputs live in `capabilities`. The agent enumerates these from the YAML, and `dap-bpa blueprint lint` flags inputs that are missing required metadata such as constraint error messages.

### Comparing versions

To compare two revisions of a blueprint, ask the agent to diff them, or use your normal source-control diff:

> "Compare these two blueprint files and tell me what changed in inputs, node templates, and outputs."

## Use Cases for Blueprint Analysis

### Use Case 1: Auditing

**Scenario**: Security review of a blueprint before deployment

1. Ask the agent to summarize the security-relevant components
2. Confirm secrets are handled through `get_secret`, not hardcoded
3. Check input constraints and least-privilege settings
4. Run `dap-bpa blueprint lint --file blueprint.yaml` for rule violations
5. Record the findings

### Use Case 2: Documentation

**Scenario**: Document an inherited blueprint for the team

1. Ask the agent for a plain-language explanation
2. Ask it to list resources, inputs, and outputs
3. Capture the explanation into your README
4. Add the blueprint to the local library with `dap-bpa knowledge blueprints add <dir>`

### Use Case 3: Learning

**Scenario**: A new engineer learning blueprint patterns

1. Pull a reference blueprint with `dap-bpa knowledge blueprints get <id> --include-files`
2. Ask the agent to walk through how it is composed
3. Look up the node types it uses in the knowledge base
4. Adapt the pattern to a new blueprint

### Use Case 4: Troubleshooting

**Scenario**: A blueprint fails to validate or deploy

1. Run `dap-bpa blueprint lint --file blueprint.yaml` and `dap-bpa blueprint validate-all --file blueprint.yaml`
2. Ask the agent to interpret the diagnostics and propose fixes
3. Apply the fixes and re-lint
4. For deployment-time failures, see the diagnostician in Section 8

## Best Practices for Blueprint Analysis

1. **Analyze before deploying**: lint and validate, and read through the blueprint, before any deployment
2. **Back reasoning with the primitives**: confirm the agent's conclusions with `lint` and `validate-all`
3. **Document findings**: keep explanations and review notes with the blueprint
4. **Compare versions**: track input, node, and output changes between revisions
5. **Automate the checks**: run `dap-bpa blueprint lint` and `validate-all` in CI so structural issues are caught early
6. **Share insights**: use the agent's explanations to onboard team members

## Next Steps

1. **Section 10: Blueprint Anatomy** goes deeper into the structure you have been reasoning about here.
2. **Section 13: dap-bpa CLI Command Reference** documents the lint, validate, and knowledge commands used in this section in full.
3. **Section 8: Blueprint Monitoring** is the next step when you are ready to test a blueprint end to end against a real orchestrator.
