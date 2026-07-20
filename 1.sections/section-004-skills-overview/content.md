# Section 004: Blueprint Assist Skills Overview

## The Skill Catalog

Blueprint Assist ships seven skills as of v0.28.2. They are installed into your agent with `dap-bpa setup-ide <ide>` (Section 2) and activate automatically from natural-language prompts — there is no separate skill invocation step.

| Skill | Use it for |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dap` | The core skill — writing, reviewing, linting, and debugging blueprint YAML; node type lookup; deployments, secrets, and monitoring; step-by-step DAP guidance |
| `dap-scripts` | Writing or debugging Python scripts for DAP blueprints — `from dell import ctx`, runtime properties, error handling |
| `dap-deployment-update` | Updating a live deployment — blueprint version bumps, input changes, skip_install/uninstall/reinstall control |
| `dap-service-composition` | Composing services — ServiceComponent sub-deployments, SharedResource, chaining blueprints |
| `visualize-blueprint` | Generating an interactive HTML topology diagram of a blueprint — nodes, relationships, inputs, and plugins — on demand or proactively after authoring (v0.28.0+) |
| `blueprint-risk-fix` | Remediating findings from a blueprint risk analysis or the visualizer Risk Analysis panel — applying the suggested fixes for compliance and best-practice violations |
| `isv-blueprints` | Guided end-to-end ISV onboarding — walking an existing asset through conversion, authentication, upload, deployment, and verification |

Each skill is a markdown package (a `SKILL.md` plus reference files) that teaches the agent when and how to act. The deep per-plugin knowledge lives separately in the knowledge base, described below. You can inspect the skill files directly at `~/.blueprint-assist/skills/`.

Alongside the seven core skills, `dap-bpa setup-ide` also installs a few supporting reference packages whose details are documented in other sections:

- `dap-guides` — step-by-step how-to walkthroughs; see [Section 000 — Quick Start](../section-000-quick-start/content.md) and [Section 012 — Hands-On Workshop](../section-012-hands-on-workshop/content.md)
- `blueprint-agent-setup` and `mcp-dapo-setup` — connecting to and using the Blueprint Assist agent and MCP endpoints; see [Section 019 — MCP Server](../section-019-mcp-server/content.md)

### Skill Naming Convention (v0.24.0+)

As of v0.24.0 and continuing through v0.28.2, the original core dap-bpa skills use the `dap-*` prefix (previously `blueprint-assist-*`). Newer skills such as `visualize-blueprint`, `blueprint-risk-fix`, and `isv-blueprints` are named for their function rather than following the prefix. Examples:

| Legacy Name | Current Name |
| -------------- | ------------- |
| `blueprint-assist` | `dap` |
| `blueprint-assist-scripts` | `dap-scripts` |
| `blueprint-assist-deployment-update` | `dap-deployment-update` |

**Key points:**

- Skill **trigger phrases are unchanged** — natural-language activation still works exactly as before.
- Only **programmatic references** (scripts, imports, hardcoded skill names) need updating.
- Skill behavior and content are unchanged — this is a rename only.

### Listing and Filtering Skills

```bash
# List node types provided by a specific plugin
dap-bpa knowledge plugins list <plugin>

# Example: list all AWS node types
dap-bpa knowledge plugins list aws

# Search for example blueprints by keyword
dap-bpa knowledge blueprints find "<query>"

# Search plugin documentation
dap-bpa knowledge docs search "<query>"
```

### Skills and Plugin Knowledge

dap-bpa separates *how to work* from *what the platform offers*:

- **Skills** (the seven above) teach the agent workflows: authoring, scripting, deployment updates, service composition, blueprint visualization, risk remediation, and guided ISV onboarding. Monitoring and lifecycle-testing guidance is part of the core `dap` skill.
- **Plugin knowledge** is the per-plugin reference material — node types, properties, documentation, and examples — stored in the knowledge base and queried with `dap-bpa knowledge` commands. The agent consults it while authoring; you can query it directly too.

The Dell Automation Platform plugins covered by the knowledge base (the IDs in parentheses are what you pass to `dap-bpa knowledge plugins ...` commands):

| Category | Plugins |
| ------------------ | ------------------ |
| **NativeEdge (private)** | NativeEdge VM creation, image upload, and asset operations (`edge`) |
| **Cloud** | vSphere (`vsphere`), AWS (`aws`), Azure (`azure`), GCP (`gcp`), vCloud (`vcloud`), OpenStack (`openstack`), Serverless Framework (`serverless`) |
| **Container / Orchestration** | Helm (`helm`), Kubernetes (`kubernetes`), Docker (`docker`), Terraform (`terraform`), Terragrunt (`terragrunt`) |
| **Automation** | Ansible (`ansible`), Fabric SSH (covered through the `dap` skill and script library) |
| **Infrastructure / Other** | Libvirt (`libvirt`), Redfish (`redfish`), Storage (`storage`), Utilities (`utilities`) |

Node types use the `dell.*` prefix throughout — NativeEdge types appear under `dell.nodes.nativeedge.*`. Older blueprints may still show legacy `cloudify.*` or `nativeedge.*` prefixes; the linter flags these (rule TD-002).

## Blueprint Assist Capabilities Reference

This section provides a comprehensive reference for Blueprint Assist capabilities, mapping them to available skills and practical implementation guidance.

### Capability Coverage Overview

| Capability Area | Coverage Status | Primary Skills |
| ------------------ | ---------------- | -------------------- |
| **Blueprint Authoring** | ✅ Fully Covered | `dap`, `dap-scripts`, `dap-service-composition` |
| **Blueprint Review** | ⚠️ Partially Covered | `dap` (linting/best practices) |
| **Blueprint Testing** | ❌ Not Covered | N/A |
| **Blueprint Deployment** | ✅ Fully Covered | `dap`, `dap-deployment-update` |
| **Blueprint Maintenance** | ✅ Fully Covered | `dap`, `dap-deployment-update` |

### Blueprint Authoring Capabilities

#### Create New Blueprints

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-scripts`, `dap-service-composition`

```bash
# Search for existing blueprints as reference
dap-bpa knowledge blueprints find "<query>"

# Look up node types for required plugins
dap-bpa knowledge plugins list <plugin>
dap-bpa knowledge plugins get <plugin> <node_type>
```

**Key Features**:

- Multi-file blueprint structure (blueprint.yaml, inputs.yaml, capabilities.yaml)
- Automatic plugin import resolution
- Node type property validation
- Input/constraint generation
- Capability/output definition
- DSL version compliance (dell_1_1)

#### Edit Existing Blueprints

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-scripts`, `dap-deployment-update`

```bash
# Read existing blueprint
dap-bpa knowledge blueprints get <id> --include-files

# Lint before editing
dap-bpa blueprint lint --file blueprint.yaml --verify

# Make edits (AI-assisted or manual)
# Re-lint after changes
dap-bpa blueprint lint --file blueprint.yaml --verify
```

**Key Features**:

- Blueprint analysis and reasoning
- Node template modification
- Input/constraint updates
- Relationship editing
- Lifecycle operation additions
- DSL migration support (Cloudify/NativeEdge → DAP)

#### Validate Blueprints

**Status**: ✅ Fully Covered | **Skills**: `dap`

```bash
# Two-stage validation process
# Stage 1: Lint against blueprint-rules.md
dap-bpa blueprint lint --file blueprint.yaml --verify

# Stage 2: Validate against plugin schemas
dap-bpa blueprint validate-all --file blueprint.yaml
```

**Key Features**:

- Lint validation (DSL compliance, structure, inputs, secrets, lifecycle)
- Schema validation (node type properties, required fields, type constraints)
- Comprehensive error reporting

#### Generate Inputs/Outputs

**Status**: ✅ Fully Covered | **Skills**: `dap`

**Input Generation**:

- Type support: string, integer, float, boolean, list, dict, textarea
- Constraint types: valid_values, pattern, min_length, max_length, in_range
- Input grouping for UI organization
- Conditional visibility with `only_with`

**Output Generation**:

- Capability-based outputs (CP-001)
- Intrinsic function support (get_attribute, get_property, get_input)
- Secret handling capabilities

### Blueprint Review Capabilities

#### Linting & Best Practices

**Status**: ✅ Fully Covered | **Skills**: `dap` (with blueprint-rules.md)

```bash
# Comprehensive linting
dap-bpa blueprint lint --file blueprint.yaml --verify
```

**Mandatory Rules (blueprint-rules.md)**:

- TD-002: Use `dell.*` prefix, not `cloudify.*` or `nativeedge.*`
- BS-009: CHANGELOG.yaml is mandatory
- BS-010: Always use multi-file structure
- CP-001: Use `capabilities:`, not `outputs:`
- IN-001: Every input must have a description
- ND-003: Lifecycle completeness (create→delete, start→stop)
- ND-009: Update workflow requires check_drift
- SC-001: Never pass literal strings to get_secret
- SC-002: Use type: secret_key for secrets

#### Security Scanning

**Status**: ⚠️ Partially Covered | **Skills**: `dap` (security best practices only)

**Current Coverage**: Manual best practices enforced via linting (SC-001, SC-002)

- Secret handling standards
- No secrets in capabilities or outputs
- No secrets in runtime_properties

**Limitations**: No automated vulnerability scanning, dependency security analysis, or compliance framework mapping

#### Compliance Checks

**Status**: ⚠️ Partially Covered | **Skills**: `dap` (compliance rules only)

**Current Coverage**: Blueprint standards enforced via linting

- DSL version compliance
- Multi-file structure requirements
- Input completeness standards
- Lifecycle operation completeness

**Limitations**: No automated compliance framework mapping, policy-as-code validation, or regulatory compliance checking

#### Documentation Review

**Status**: ❌ Not Covered | **Skills**: N/A

**Limitations**: No automated documentation quality checks, description completeness validation, or README generation

### Blueprint Testing Capabilities

#### Unit/Integration Test Generation

**Status**: ❌ Not Covered | **Skills**: N/A

**Limitations**: No automated test generation frameworks for unit or integration testing

#### Mock Data Generation

**Status**: ❌ Not Covered | **Skills**: N/A

**Limitations**: No automated mock data generation or test data set creation

#### Test Execution

**Status**: ❌ Not Covered | **Skills**: N/A

**Limitations**: No automated test execution framework, test result reporting, or continuous testing integration

### Blueprint Deployment Capabilities

#### Deployment Planning

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-service-composition`

```bash
# Research existing deployment patterns
dap-bpa knowledge blueprints find "<deployment pattern>"

# Get detailed blueprint structure
dap-bpa knowledge blueprints get <id> --include-files
```

**Key Features**:

- Service composition patterns
- Sub-deployment hierarchy
- Resource dependency mapping
- Capability flow design

#### Pre-flight Checks

**Status**: ✅ Fully Covered | **Skills**: `dap`

```bash
# Complete pre-flight validation pipeline
dap-bpa blueprint lint --file blueprint.yaml --verify
dap-bpa blueprint validate-all --file blueprint.yaml
dap-bpa knowledge plugins list <plugin>
dap-bpa orchestrator blueprints list
```

**Key Features**:

- Blueprint validation (DSL compliance, schema validation)
- Orchestrator readiness (connectivity, authentication, resource availability)

#### Deployment Execution

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-deployment-update`

```bash
# Upload blueprint
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id <blueprint_id> --revision <version>

# Create deployment
dap-bpa orchestrator deployments create --blueprint-id <blueprint_id> --inputs inputs.json

# Monitor execution
dap-bpa orchestrator executions get <execution_id> --fields id status error
dap-bpa orchestrator events get <execution_id>
```

**Key Features**:

- Multi-file archive upload
- Revision management
- Deployment creation with input validation
- Real-time execution monitoring and event streaming

#### Post-deployment Verification

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-deployment-update`

```bash
# Check deployment status
dap-bpa orchestrator deployments get <deployment_id> --fields id status capabilities

# Verify execution completion
dap-bpa orchestrator executions get <execution_id> --fields id status error

# Review deployment events
dap-bpa orchestrator events get <execution_id>
```

**Key Features**:

- Deployment status verification
- Execution completion verification
- Capability validation
- Resource state verification

### Blueprint Maintenance Capabilities

#### Drift Detection

**Status**: ✅ Fully Covered | **Skills**: `dap-deployment-update`

```yaml
# Node template with drift detection
node_templates:
  vm:
    type: dell.nodes.vsphere.Server
    interfaces:
      dell.interfaces.lifecycle:
        check_drift:
          implementation: scripts/check_drift.py
          inputs:
            expected_cpus: { get_input: vm_cpus }
        update:
          implementation: scripts/update_vm.py
        postupdate:
          implementation: scripts/verify_vm.py
```

**Key Features**:

- `check_drift` - Read-only comparison of live vs desired state
- `update` - Idempotent drift correction
- `postupdate` - Post-change verification
- Drift information stored in `system_properties["configuration_drift"]`

#### Update Support

**Status**: ✅ Fully Covered | **Skills**: `dap-deployment-update`

```bash
# Deployment update workflow
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-bp --revision v2.1.0

cat > update-body.json << 'EOF'
{
  "blueprint_id": "my-bp",
  "blueprint_version": "v2.1.0",
  "skip_reinstall": true
}
EOF

dap-bpa orchestrator deployment-updates initiate my-deployment --body update-body.json
```

**Key Features**:

- Blueprint version bumps
- Input changes
- Node additions/removals
- Relationship modifications
- Preview/dry-run mode
- Selective reinstall control

#### Version Management

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-deployment-update`

```yaml
# CHANGELOG.yaml (BS-009 - mandatory)
changelog:
  - version: 1.0.0
    date: 2026-01-15
    changes:
      - "Initial release"
      - "VM provisioning with vSphere"
```

```bash
# Blueprint version management
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-bp --revision v1.0.0
dap-bpa orchestrator blueprints get my-bp --fields id state revisions
```

**Key Features**:

- Semantic versioning (semver)
- Revision tracking
- CHANGELOG.yaml documentation
- Blueprint state management

#### Rollback Procedures

**Status**: ⚠️ Partially Covered | **Skills**: `dap-deployment-update`

```bash
# Rollback via deployment update to previous version
cat > rollback-body.json << 'EOF'
{
  "blueprint_id": "my-bp",
  "blueprint_version": "v1.1.0"
}
EOF

dap-bpa orchestrator deployment-updates initiate my-deployment --body rollback-body.json
```

**Key Features**:

- Version rollback (deployment update to previous revision)
- Input rollback (revert to previous input values)
- Manual rollback (delete and redeploy)

**Limitations**: No automated rollback triggers, point-in-time recovery, or rollback testing framework

### Capability Gap Summary

**Fully Covered (3/5)**: Blueprint Authoring, Deployment, Maintenance
**Partially Covered (2/5)**: Blueprint Review (linting strong, security/compliance limited)
**Not Covered (0/5)**: Blueprint Testing

**Recommendations for Enhancement**:

- Short-term: Add security scanning integration, documentation quality checks
- Medium-term: Develop automated testing capabilities, compliance frameworks
- Long-term: Comprehensive security scanning, full compliance automation

## When to Use Each Skill

In practice you rarely choose a skill explicitly — they activate from what you ask. Typical phrasing that triggers each:

- **`dap`**: "write a blueprint for...", "lint this", "which node type do I use for...", "how do I deploy this", "create a secret", "walk me through..."
- **`dap-scripts`**: "write the install script", "my ctx script fails", "how do I read runtime properties"
- **`dap-deployment-update`**: "bump the blueprint version", "change inputs without reinstalling", "add drift detection", "make this updatable"
- **`dap-service-composition`**: "split this into services", "share this resource between deployments", "chain these blueprints"
- **`visualize-blueprint`**: "visualize this blueprint", "show me a topology diagram", "generate an HTML view"
- **`blueprint-risk-fix`**: "fix the risks", "remediate these findings", "apply the suggested fixes from the risk analysis"
- **`isv-blueprints`**: "ISV onboarding", "walk me through onboarding my asset end to end"

Skills are reference knowledge for the agent, not workflow steps — they don't execute in sequence. Several can inform a single task: authoring a blueprint with custom lifecycle scripts draws on `dap` and `dap-scripts` together. Execution ordering lives in the blueprint and its workflows, not in the skills.

## Querying the Knowledge Base

### List Node Types for a Plugin

```bash
dap-bpa knowledge plugins list kubernetes
dap-bpa knowledge plugins list aws
```

### Get Details on a Specific Node Type

```bash
dap-bpa knowledge plugins get kubernetes dell.nodes.kubernetes.resources.Deployment
dap-bpa knowledge plugins get aws dell.nodes.aws.ec2.Instances
```

### Search Plugin Documentation

```bash
dap-bpa knowledge docs search "helm chart deployment"
dap-bpa knowledge docs search "powerstore volume" --plugin storage
```

### Find Example Blueprints

```bash
dap-bpa knowledge blueprints find "kubernetes helm"
dap-bpa knowledge blueprints find "bare metal ubuntu"
```

## Skill Versioning and Updates

Skills are bundled with the dap-bpa release — they update when you update the dap-bpa binary. There is no separate per-skill update command. To get the latest skills:

```bash
# Download and install the latest dap-bpa release (see Section 2)
# After installing, re-run IDE integration to push updated skills
dap-bpa setup-ide windsurf
dap-bpa setup-ide claude-code
```

Skill files are stored locally at `~/.blueprint-assist/skills/` and can be inspected directly.

## Best Practices for Skill Usage

1. **Keep skills current**: Update dap-bpa when a new release ships, then re-run `dap-bpa setup-ide <ide>` to push the updated skills into your agent
2. **Test in non-production first**: Validate AI-generated blueprints against a test orchestrator before production use
3. **Inspect the skill files**: Reading `~/.blueprint-assist/skills/` shows exactly what guidance the agent is working from
4. **Extend the knowledge base**: Import organization-specific plugin documentation with `dap-bpa knowledge plugins add` (v0.26.0+)

## Next Steps

With an understanding of dap-bpa skills and their comprehensive capabilities:

1. **Section 5: Skills Architecture** — deep dive into how skills are structured and loaded
2. **Section 7: Building Blueprints** — start using plugin skills to author blueprints with the capabilities outlined above
3. **Section 8: Blueprint Monitoring** — learn about deployment monitoring and verification capabilities
4. **Section 13: dap-bpa CLI Command Reference** — full reference for `dap-bpa knowledge` and all other command groups used in the capabilities above
