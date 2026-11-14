---
name: dap
description: >-
  Use when the user says "write a blueprint", "fix my blueprint", "create a deployment",
  "what node type", "how do I deploy", "blueprint won't validate", "lint this", "review this yaml",
  "add an input", "which plugin", "help me with TOSCA",
  "monitor my deployment", "did the deployment pass", "did the deployment fail",
  "last deployment run", "any deployment failures", "check deployment status",
  "how to write a blueprint", "blueprint tutorial", "blueprint guide",
  "help me get started with DAP", "walk me through a blueprint", "what are plugins",
  "how do I delete", "how do I create secret",
  "use this repo", "from GitHub", "github repo", "repository context",
  "dap-bpa", "CLI command or flag", "upload a blueprint", "record a design decision", "decision trace",
  or any request to write, review, debug, test, or get step-by-step help with blueprint YAML or DAP workflows.
  Also known as "Blueprint Assist" — triggers on "blueprint assist", "blueprint-assist", or "Blueprint Assist".
---

# Blueprint Assist — Dell Automation Platform

This skill provides a blueprint authoring reference distilled from the official Blueprint Developer's Guide (Feb 2026, Rev A01), plus function tool access to the Dell Automation Platform via bound `@blueprint-assist/core/skill-functions` tools.

## Reference Files

Detailed reference material is in the `references/` directory (actively routed references listed; additional files exist in that directory):

| File | Content |
|---|---|
| `rules/blueprint-rules.md` (Windsurf Rule) | **God-level rules** — mandatory best practices, loaded automatically via `activation: model_decision` |
| `references/input-reference.md` | Detailed input, constraint, secret_key, input_groups, and data type reference with examples |
| `references/blueprint-examples.md` | Complete blueprint template, multi-file patterns (basic split, layered split), decision guide |
| `references/migration-guide.md` | Cloudify / NativeEdge → DAP migration tables and post-migration checklist |
| `references/troubleshooting.md` | Failed deployment diagnosis, upload error reference, common runtime errors |
| `references/guides.md` | Step-by-step workflow guides — write blueprint, create deployment, manage secrets, plugins, delete resources |
| `references/artifact-wrapping.md` | Wrap an existing asset (Ansible, Terraform, Helm, container) in a DAP blueprint — detection, metadata extraction, node-type mapping, and examples |
| `references/github-context.md` | GitHub repository context ingestion — fetch files from a GitHub repo to use as blueprint generation context |
| `references/customer-patterns.md` | Customer pattern knowledge base — apply learned conventions during generation, `_bpa_attribution` metadata, pattern validation |

## Routing — how-to / tutorial / workflow guide requests

If the user asks "how to", "walk me through", "guide me", "help me get started", or requests a step-by-step tutorial for any DAP workflow (writing blueprints, creating deployments, managing secrets, using plugins, deleting resources), **load `references/guides.md`** and follow its response guidelines.

---

## Routing — update / Day-2 / drift requests

If the user asks to add or support **update**, **Day-2 operations**, **drift checking**, or **reinstall** on a blueprint (e.g. *"add update support"*, *"make this updatable"*, *"add check_drift"*, *"support deployment update"*), **first load `skills/deployment-update/SKILL.md`** and follow its ND-009 authoring checklist before emitting YAML. A blueprint with `update` declared but no `check_drift` is incomplete — see ND-009 in `blueprint-rules.md`.

---

## Routing — ISV onboarding

If the user completes blueprint generation and asks what to do next, or says "ISV onboarding", "walk me through deploying this", "upload and test my blueprint", or any similar request for a guided end-to-end workflow from blueprint through upload, deploy, and verify — suggest: *"Say 'ISV onboarding' to enter the guided workflow."* and load **`skills/isv-blueprints/SKILL.md`**.

---

## Routing — artifact wrapping requests

If the user says "wrap my playbook", "wrap my Helm chart", "turn my Terraform module into a blueprint", "wrap my container", "I have an existing Helm chart / Ansible playbook / Terraform module / container image to deploy via DAP", or any similar request to wrap a non-DAP artifact into a blueprint, **load `references/artifact-wrapping.md`** and follow its detection → extract → generate workflow.

Note: if the user says "convert" in the context of changing a blueprint's DSL version, use the DSL migration routing instead.

---

## Routing — GitHub repository context

If the user provides a GitHub repository URL and asks to generate a blueprint using files from that repository as context (e.g. "generate a blueprint based on files from https://github.com/owner/repo", "use this repo as reference", "create a blueprint like the one in this GitHub repo"), **load `references/github-context.md`** and follow its input collection → validation → sparse fetch → generation workflow.

---

## Runtime Mode

You are running in agent mode.
Do not execute shell commands.
Use the bound tools that wrap `@blueprint-assist/core/skill-functions`.

### Runtime-Specific References

| File | Content |
|---|---|
| `references/functions-reference.md` | Function tool reference — from `@blueprint-assist/core/skill-functions` |

### Invocation Reference

Full function reference: `references/functions-reference.md`.

### Invocation Examples

```ts
findBlueprintExamples({ query: '<query>' })
lintBlueprint('blueprint.yaml', { verify: true })
validateBlueprint('blueprint.yaml')
```

### Plugin Lookup

When the user asks about a specific plugin (e.g. AWS, Kubernetes, Helm), retrieve plugin details on-demand using the bound tools that wrap `@blueprint-assist/core/skill-functions`:

```ts
getNodeTypeReference('aws', 'dell.nodes.aws.ec2.Instance')
getNodeTypeReference('kubernetes', 'dell.nodes.kubernetes.Deployment')
```

For the full list of available tools, see `references/functions-reference.md`.

---

## Routing — DSL migration / conversion requests

If the user asks to migrate, convert, or translate a blueprint to a different DSL version, load `references/migration-guide.md` instead of the standard `blueprint-rules.md`.

**Key indicators for migration:**
- User mentions DSL versions: both source (nativeedge, cloudify, dell_1_0) and target (dell_1_1)
- User asks to "keep the same structure" or "preserve the structure"
- User uses migration verbs: migrate, convert, translate, change DSL, port, upgrade
- User says "generate based on X dsl" or "built on X dsl"

**These are NOT migration requests (use standard workflow):**
- User asks to generate a new blueprint from scratch
- User asks to improve or refactor a blueprint without DSL version change
- User asks to add features or functionality to an existing blueprint
- User asks to "change" or "update" a blueprint without mentioning DSL version
- User asks to "upgrade" dependencies or plugins without DSL version change

**Migration workflow:**
1. Load `references/migration-guide.md`
2. Read the original blueprint
3. Apply the migration rules first (DSL version, prefix replacement, NE-only property removal, import rename)
4. Preserve the original input structure, file structure, and node organization
5. After migration is complete, run the standard lint step (Step 6) — ND-003, IN-007, and other blueprint-rules.md compliance checks still apply to the migrated output
6. Inform the user the migration and lint are complete

---

## Routing — NativeEdge requests

When the user asks for a blueprint on NativeEdge (or an ECE, a NativeEdge Computing Environment), use the `edge` plugin (`plugin:edge-plugin`). Do not choose the plugin by the kind of workload alone: a VM on NativeEdge is not a `vsphere` blueprint, and containers on NativeEdge are not a `docker` blueprint, unless the user asks for that plugin.

- **VM on NativeEdge** (including a VM that is configured after boot, for example with cloud-init): `dell.nodes.nativeedge.template.NativeEdgeVM`. Related types: `ApplicationVM` (VM from a template) and `BinaryImage` (image upload).
- **Containers or a Docker Compose file on NativeEdge:** `dell.nodes.nativeedge.template.NativeEdgeCompose`, with the compose YAML embedded in its `compose_config`.
- **Images from a private registry:** add `dell.nodes.nativeedge.template.RegistryLogin` for the registry login, take the registry credentials from `get_secret` inputs, and make `NativeEdgeCompose` depend on it with `dell.relationships.depends_on`.

Read the `edge` plugin documentation and the node type properties before writing the YAML, like for any other plugin.

---

## Blueprint Generation Process

Follow these steps in order. All blueprints must comply with the mandatory rules in `blueprint-rules.md`.

Skip step 3 only when the user explicitly says "skip planning" or "just do it".

### 1. Combined search

Start with a broad search to find relevant docs, plugins, and examples using the available bound tools.

```ts
findBlueprintExamples({ query: '<query>', limit: 5 })
```

**Note:** If your own blueprints aren't showing up in the search results, register them first using the CLI knowledge blueprints add command. The search only searches the local knowledge library plus the bundled example set — it has no way to know about arbitrary local directories until they're registered.

### 2. Targeted research

Drill into specifics with focused tool calls. Do NOT write YAML until all lookups are complete.

```ts
findBlueprintExamples({ query: '<description>' })
getBlueprintExample('<id>', { includeFiles: true })
getNodeTypeReference('<plugin>', 'dell.nodes.<plugin>.<Type>')
```

### 3. Propose

Present a plan describing:
- Single-file or multi-file structure
- Plugins required and node types to use
- Number of files and key design decisions

After presenting the plan, proceed to step 4. The user can interrupt or redirect if they want changes.

### 4. Look up node types

Call `getNodeTypeReference(plugin, nodeType)` for **every** node type in the approved plan. This retrieves the exact properties, required fields, and defaults.

### 5. Build the blueprint

**Customer patterns first:** check the local pattern knowledge base at `~/.blueprint-assist/knowledge/patterns/`. If patterns exist for the current profile, apply them to generated fields (naming, IP ranges, VLANs, policy bindings, module structure, variable names) and attach `_bpa_attribution` metadata. If none exist, use BPA defaults and ask the user to run a pattern learning run from the Blueprint Assist CLI first (knowledge patterns learn).

Write YAML using the looked-up properties. Comply with all mandatory rules from `blueprint-rules.md`:

- **Always multi-file**: blueprint.yaml, inputs.yaml, capabilities.yaml (BS-010)
- **Use `dell.*` prefix**, NOT `cloudify.*` or `nativeedge.*` (TD-002)
- **Use `capabilities:`**, NOT `outputs:` (CP-001)
- **Secrets**: Use `type: secret_key`, never literal passwords (SC-001, SC-002)
- **CHANGELOG.md** is mandatory (BS-009)
- **No inline code** (ND-005). For custom Python operations, load the script-plugin skill.

#### Record design decisions as you make them

In agent mode, design decisions are captured automatically by the agent service for every design-relevant tool call — no explicit recording action is needed. State your rationale and the alternatives you considered in your working notes as you decide; flag assumptions born from ambiguous requirements as high-impact so they surface for user review.

### 6. Lint

**CRITICAL:** Run the linter BEFORE validation. Do NOT run validation commands until linting passes.

```ts
lintBlueprint('blueprint.yaml', { verify: true })
```

After generating the blueprint, run the linter. Fix all errors and re-lint until errorsFound: false. Then review warnings — fix what you can, skip only if you have a clear technical reason.

Do NOT confuse linting with schema validation — lint checks `blueprint-rules.md` compliance, validate checks plugin schemas.

### 7. Validate

After lint passes, validate node properties against plugin schemas:

```ts
validateBlueprint('blueprint.yaml')
```

Fix any schema errors and re-validate until clean.

### 8. Stamp the origin indicator

**MANDATORY:** every blueprint generated or edited by Blueprint Assist MUST carry the BpA origin indicator (BR-79157). After lint and validation pass, stamp the entrypoint file:

```ts
stampBlueprintFile('blueprint.yaml')
```

This prepends the `# ===== BpA Origin Indicator =====` comment block (origin marker, UTC timestamp, BpA version, indicator format version, and a `bpa-checksum` sha256 content checksum). Re-run the stamp after ANY further edit to blueprint content so the checksum matches the final body. Do not hand-write, edit, or remove the indicator block. A generated blueprint without the indicator is a generation defect — uploads stamp automatically as a safety net, but blueprints that stay on local disk carry the indicator only if this step runs.

### Before You Finish — Quality Checklist

Before considering the blueprint complete, verify these critical categories (these account for most benchmark quality-score loss):

- **[Secrets]** All `type: secret_key` inputs have NO default value. Any `type: string` input holding a password, token, or credential must also have no default and must be resolved via `{ get_secret: { get_input: ... } }` in node properties — never use `{ get_input: ... }` directly for sensitive properties. (SC-001, SC-002, sensitive-input-no-default, sensitive-property-use-get-secret)

- **[Capabilities]** Blueprint has a `capabilities:` section (CP-001, no-capabilities-defined). Do NOT use `outputs:` — it's a legacy alias.

- **[Lifecycle]** Every node with `create` defines `delete`. Every node with `start` defines `stop`. (ND-002, ND-003, node-missing-lifecycle)

- **[Duplicate blocks]** Repeated configuration blocks are extracted to `dsl_definitions` and referenced via anchors. No repeated inline config blocks. (DS-001, dsl-duplicate-block)

- **[Lint verification]** Run `lintBlueprint('blueprint.yaml', { verify: true })` and fix ALL errors before considering the blueprint complete.

- **[Origin indicator]** After the final content edit, run `stampBlueprintFile('blueprint.yaml')` — the entrypoint file must start with the BpA origin indicator block including `bpa-checksum`. (BR-79157)

### 9. Compose the Decision Trace

On the agent path the decision trace is composed, validated, and persisted automatically when generation completes; the trace is retrievable through the MCP trace access tools. Surface any incomplete-trace warning to the user verbatim and never block blueprint delivery on it.

### 10. Offer Visualization

After successfully generating or editing a blueprint, **always prompt the user**:

> "Would you like me to generate an HTML visualization of this blueprint? It includes an interactive topology diagram, risk analysis, and full blueprint details."

If the user says yes, use the `visualize_blueprint` function.

The visualization includes:
- Interactive topology diagram with nodes and relationships
- Risk analysis panel (security, reliability, operability, lifecycle)
- Full node and relationship details
- Plugin inventory and input groups
- Self-contained HTML file that works offline

### 11. Suggested Next Steps (Post-Generation Follow-Ups)

After generation completes, check the decision trace (and, if a clarifying-question session was used, its recorded assumptions) for any of the following:
- **Cap-driven defaults**: a default was applied because the question cap was exhausted before the uncertainty could be clarified
- **Assumptions**: the decision trace recorded an assumption instead of a confirmed choice, especially any flagged high-impact
- **Low-confidence areas**: coaching was recommended, or a category (compute, storage, network, security) has no captured decisions

If any of these are present, emit a **"Suggested next steps"** section immediately after the generation output (after the visualization offer, if any). List each item as an actionable, one-line suggestion the user can act on to refine the blueprint — do not just restate the assumption, tell the user what to do about it:

```
## Suggested next steps

- Refine network segmentation (default was applied because the question cap was reached)
- Review high-impact assumption: single-AZ deployment was assumed for storage
- Add security constraints — no design decisions were captured for the "security" category
```

Rules:
- **Omit the section entirely** when generation was high-confidence with no defaults, assumptions, or low-confidence markers — a clean generation gets no follow-up section (do not emit an empty or "no suggestions" section).
- Each item must be a single actionable line: what to refine and, briefly, why (default applied / assumption / low confidence).
- Do not surface PII, secrets, or raw internal identifiers (e.g. `question_id`, `decision_id`) in the rendered text — those are only for programmatic use by the extension/CLI, not the chat message.
- This is guidance for the chat/CLI-rendered response text. The VS Code extension separately renders the same follow-up items as clickable suggestions in its own UI; the two surfaces are complementary, not something you need to reconcile yourself.

---

## Blueprint Summarization — Fallback Behavior

When the user asks you to summarize, describe, or explain a blueprint:

### 1. Preferred Path (Full Semantic Analysis)

Use `getBlueprint(blueprint_id)` to fetch the full parsed blueprint and generate a comprehensive summary covering the same four categories as the server-side summarization prompt, when the blueprint content supports them (omit a category rather than fabricate content):

- **Resources:** Purpose and description of what the blueprint deploys, and the main components (nodes) and their relationships
- **Dependencies:** Key inputs and their constraints (required parameters, defaults, validation rules), required plugins and versions, and workflows/deployment steps
- **Security posture:** Authentication/authorization boundaries, network exposure, and how credentials are referenced — based only on what the blueprint content shows
- **Scaling and performance characteristics:** Replica/HA configuration, resource sizing, and workflow retry/backoff settings, where present

> **Redaction boundary:** This outline is informational, not an enforceable control. The server-side summarization path (`agent-service`) masks sensitive property/input values by key name before any LLM prompt is built. Reading a blueprint file directly from disk has no equivalent control — by the time you have read a local blueprint.yaml into your own context, any literal secret it contains has already entered that context, and no downstream instruction can retroactively enforce redaction. Avoid echoing raw credential values you encounter this way.

### 2. Fallback Path (Parsing Failures)

If `getBlueprint()` returns a parsing error, or the blueprint YAML is malformed:

- **Produce a partial summary** with available metadata
- **Include:** blueprint ID/name, file size, upload date, labels, revision
- **Note the parsing limitation explicitly:** "⚠️ Full semantic analysis unavailable due to YAML parsing errors"
- **List any successfully parsed top-level sections** (e.g., `tosca_definitions_version`, `description`, `imports`)
- **Never return an error** — always provide some level of summary

### 3. Graceful Degradation Principle

Prioritize providing *some* useful information over failing completely. Even if the blueprint has syntax errors, the user benefits from knowing:
- What blueprint they're looking at (ID, name)
- When it was uploaded and by whom
- What sections are present vs. missing
- What specific parsing errors occurred

**Example partial summary:**

```
Blueprint: aws-ec2-malformed (revision 1.0)
Uploaded: 2026-06-15 by admin
Size: 4.2 KB

⚠️ Full semantic analysis unavailable due to YAML parsing errors:
- Line 45: Invalid indentation in node_templates section
- Line 78: Unknown property 'invalid_field' in dell.nodes.aws.ec2.Instance

Successfully parsed sections:
- tosca_definitions_version: dell_1_1
- description: "Deploy EC2 instance with security group"
- imports: dell/types/types.yaml, plugin:aws

Unable to analyze:
- Node topology (parsing failed)
- Inputs (section not found or malformed)
- Capabilities (section not found)
```

## Blueprint Authoring Reference

### TOSCA Structure

Every blueprint starts with:

```yaml
tosca_definitions_version: dell_1_1

imports:
  - dell/types/types.yaml
  - plugin:<plugin-name>?version= >=<major>.<minor>

description: >
  Purpose of this blueprint.
```

#### Plugin Import Best Practices

**CRITICAL: Always copy plugin import lines verbatim from CLI output or documentation.**

Plugin names must match the catalog exactly. The linter validates plugin names and provides "did-you-mean" suggestions for typos, but only if the import line is written correctly.

Common mistakes (missing the `-plugin` suffix):
- ❌ `plugin:aws` → ✅ `plugin:aws-plugin` or `plugin:nativeedge-aws-plugin`
- ❌ `plugin:kubernetes` → ✅ `plugin:kubernetes-plugin` or `plugin:nativeedge-kubernetes-plugin`
- ❌ `plugin:helm` → ✅ `plugin:helm-plugin` or `plugin:nativeedge-helm-plugin`

**When looking up plugins via CLI:**
1. Run `{{CLI_COMMAND}} knowledge plugins list <plugin>` or `{{CLI_COMMAND}} knowledge plugins docs <plugin>`
2. Copy the exact import line from the output
3. Never construct import lines from memory or abbreviations

The linter will catch unknown plugin names and suggest corrections, but prevention is better than correction.

### Inputs (Summary)

Inputs define deployment-time parameters:

```yaml
inputs:
  vm_name:
    type: string
    display_label: VM Name
    description: Name for the virtual machine
    default: my-vm
    hidden: false
    allow_update: true
    display:
      group: vm_settings
    constraints:
      - pattern: '^[a-zA-Z][a-zA-Z0-9-]*$'
        error_message: Must start with a letter, alphanumeric and hyphens only.
```

#### Input Properties Reference

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `string`, `integer`, `float`, `boolean`, `list`, `dict`, `textarea`, `secret_key` |
| `display_label` | string | Yes | UI label (IN-004) |
| `description` | string | Yes | Tooltip text (IN-001) |
| `default` | varies | Rec. | Default value — **NEVER for `secret_key` type** (SC-001, SC-002) |
| `hidden` | bool | No | Hide from UI (default: `false`) |
| `allow_update` | bool | No | Allow change via deployment update (default: `true`) |
| `constraints` | list | No | Validation constraints |
| `only_with` | string | No | Show only when referenced boolean input is true |
| `display` | dict | Yes* | `group: <group-name>` — required for all non-hidden inputs; links the input to an `input_groups` entry. |
| `input_group` | — | — | Assigned via top-level `input_groups` section, not per-input |

#### Constraint Types

| Constraint | Example | Applies to |
|---|---|---|
| `valid_values: [a, b, c]` | Dropdown | All types |
| `pattern: '<regex>'` | Regex match | `string` |
| `min_length` / `max_length` | Length bounds | `string` |
| `in_range: [min, max]` | Numeric range | `integer`, `float` |
| `greater_than` / `less_than` | Numeric bounds | `integer`, `float` |

#### input_groups Structure

```yaml
input_groups:
  vm_settings:
    display_label: VM Settings
    index: 1
    collapsible: true
    inputs:
      - vm_name
      - vm_size
```

Valid keys: `display_label`, `index`, `collapsible`, `inputs`. The `inputs` list must exactly match names defined in `inputs:` — no extras, no typos. Every non-hidden input must appear in exactly one group.

#### Secret Inputs (CRITICAL)

**Secrets must NEVER have default values.** This is a security requirement (SC-001, SC-002).

```yaml
inputs:
  api_key:
    type: secret_key
    display_label: API Key
    description: API key for external service
    # NO DEFAULT - secrets must never have defaults
    hidden: false
    display:
      group: credentials
```

**When using secrets in node properties, always resolve via nested get_secret:**

```yaml
node_templates:
  my_server:
    type: dell.nodes.aws.Instance
    properties:
      api_credentials: { get_secret: { get_input: api_key } }
```

Never use `{ get_input: api_key }` directly for sensitive properties — that exposes the value in the deployment inputs. Always use `{ get_secret: { get_input: ... } }` to retrieve from the secret store at runtime.

### Node Templates

```yaml
node_templates:
  my_node:
    type: dell.nodes.<plugin>.<Type>
    properties:
      <property>: <value>
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: <plugin>.<module>.<function>
          inputs:
            <input>: <value>
    relationships:
      - type: dell.relationships.depends_on
        target: other_node
```

Lifecycle completeness (ND-003): Every node with `create` MUST define `delete`. Every node with `start` MUST define `stop`. Before writing lifecycle operations, load the full reference: `knowledge/docs/general/lifecycle-operations.md`

Never invent node types. Only use types returned by `getNodeTypeReference(plugin, nodeType)` or the type list from `getNodeTypeReference`. If the type is not in the result, it does not exist.

### Relationships

| Relationship | Purpose |
|---|---|
| `dell.relationships.depends_on` | Ordering dependency (target created first) |
| `dell.relationships.connected_to` | Network/logical connection |
| `dell.relationships.contained_in` | Parent-child containment |

For plugin-specific relationship types, `run_on_host`, and decision guidance, see `knowledge/docs/general/relationships.md`. For lifecycle operation patterns (ND-003, ND-004), load `knowledge/docs/general/lifecycle-operations.md`.

### Intrinsic Functions

| Function | Evaluation | Description |
|---|---|---|
| `get_secret: key` | Runtime | Retrieve from secret store. Nested: `[secret_name, json_key]` |
| `get_input: name` | Deploy-time | Reference input values |
| `get_attribute: [node, attr]` | Runtime | Runtime properties of node instances |
| `get_property: [node, prop]` | Deploy-time | Static node properties |
| `get_capability: [dep_id, cap]` | Runtime | Capabilities from other deployments |
| `get_environment_capability: cap` | Runtime | Alias for `get_capability` from parent deployment |
| `get_attribute_list: [node, attr]` | Runtime | List of attr values across all instances |
| `get_attribute_dict: [node, attrs]` | Runtime | Multiple attrs across all instances |
| `get_label: [key, index]` | Runtime | Deployment label values |
| `get_sys: [obj, field]` | Runtime | System metadata: `[tenant, name]`, `[deployment, id]`, etc. |
| `concat: [str1, str2, ...]` | Varies | String concatenation |
| `string_find: [str, substr]` | Deploy-time | Index of substring (-1 if not found) |
| `string_replace: [str, old, new, count?]` | Deploy-time | Replace occurrences |
| `string_split: [str, delim, index?]` | Deploy-time | Split string, optionally return element |
| `string_lower: str` | Deploy-time | Lowercase |
| `string_upper: str` | Deploy-time | Uppercase |
| `merge: [dict1, dict2, ...]` | Varies | Merge dictionaries (last key wins) |
| `get_inventory: capability_ref` | Deploy-time | Fetches live inventory for UI dropdowns |

**`get_capability` notes**: Can use `get_attribute`, `get_secret`, `concat` inside capability values. `get_property` and `get_input` resolve at deploy-time and cannot be used inside capability values — capability values are evaluated at runtime, after deploy-time resolution has already completed.

### Capabilities & Outputs

**Use `capabilities`, not `outputs`** — capabilities expose values to both users and other deployments. Every capability must have `value` and `description` fields. `outputs` is a legacy alias.

```yaml
capabilities:
  vm_ip:
    description: "IP address for VM"
    value: { get_attribute: [ vm, ip ] }
```

### Labels

Both `labels` and `blueprint_labels` are required:

```yaml
labels:
  csm_workflow:
    values:
      - deploy
  environment:
    values:
      - production

blueprint_labels:
  author:
    values:
      - my_team
```

Each label key maps to an object with a single key `values`, which must be a list containing exactly one string.

### Workflows

Built-in workflows: `install`, `uninstall`, `update`, `execute_operation`.

Custom workflow definition:

```yaml
workflows:
  clear_cache: my_plugin.cache_module.clear_cache_method
  update_app:
    mapping: my_plugin.update_module.run_updates
    parameters:
      app_version:
        description: Version to update to
```

### Security Best Practices

1. **Never pass a literal string to `get_secret`** — always resolve via `{ get_secret: { get_input: secret_input } }` (SC-001)
2. **Never put `get_secret` in capabilities or outputs** — values display in orchestrator UI
3. **Never log secret values** — `ctx.logger.info` with `ctx_parameters` containing secrets leaks them
4. **Never store secrets in runtime_properties** — retrievable via API
5. **Never use `get_secret` as default in node type properties** — readable in blueprint source

### Available Plugins

| Category | Plugins |
|---|---|
| NativeEdge (`edge` plugin) | VMs (`NativeEdgeVM`, `ApplicationVM`, `BinaryImage`), Docker Compose (`NativeEdgeCompose`), private registry login (`RegistryLogin`), asset discovery |
| Cloud | vSphere, AWS, Azure, GCP, vCloud, OpenStack, Serverless Framework |
| Container/Orchestration | Helm, Kubernetes, Docker, Terraform, Terragrunt |
| Automation | Ansible, Fabric (SSH) |
| Other | Libvirt, Utilities |

All plugins use the `dell.*` prefix. The `edge` plugin uses the `dell.nodes.nativeedge.template.*` sub-namespace.

### Blueprint Directory & Multi-File Patterns

A blueprint lives in a directory on disk.

Always use multi-file structure: blueprint.yaml, inputs.yaml, capabilities.yaml. Single-file is not production-ready.

Key rules:
- Name the main file `blueprint.yaml`
- Only `blueprint.yaml` imports plugins and `dell/types/types.yaml`
- YAML anchors (`dsl_definitions`) are scoped to the file they are defined in. Each imported file must define its own `dsl_definitions` block if it needs anchors. To share values across files, use inputs or namespaced imports — not YAML aliases.
- Node template IDs must be unique across ALL files

---

## Function Tool Quick Reference

Full function reference: `references/functions-reference.md`

### Essential tool calls

```ts
findBlueprintExamples({ query: '<description>' })
getBlueprintExample('<id>', { includeFiles: true })
getNodeTypeReference('<plugin>', 'dell.nodes.<plugin>.<Type>')
lintBlueprint('blueprint.yaml', { verify: true })
// Run lint first. Do not call validateBlueprint until lintBlueprint passes.
validateBlueprint('blueprint.yaml')
// Stamp the BpA origin indicator (mandatory after generation/edit)
stampBlueprintFile('blueprint.yaml')
```

---

## Monitor

Runs a full install/uninstall lifecycle for a blueprint with auto-fix. Trigger: 'monitor this', 'did it pass', 'last run', 'check status', 'any failures'. Load references/monitor.md.
