# Create New Blueprint

This example demonstrates the complete workflow for creating a new blueprint from scratch using Blueprint Assist capabilities.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-scripts`, `dap-service-composition`

## Learning Objectives

By the end of this example, you will be able to:

- Use dap-bpa knowledge commands to research existing blueprints and node types
- Generate a multi-file blueprint structure (blueprint.yaml, inputs.yaml, capabilities.yaml)
- Define proper inputs with constraints and input groups
- Create node templates with correct plugin types and properties
- Implement lifecycle operations (create, start, stop, delete)
- Validate the blueprint against blueprint-rules.md and plugin schemas

## Prerequisites

- dap-bpa CLI installed and configured (see Section 002)
- DAP orchestrator connection configured (see Section 003)
- Basic understanding of TOSCA and blueprint structure (see Section 010)

## Step-by-Step Workflow

### Step 1: Research Existing Patterns

Before creating a new blueprint, research existing patterns to understand best practices:

```bash
# Search for similar blueprints
dap-bpa knowledge blueprints find "simple vm"
dap-bpa knowledge blueprints find "ubuntu server"

# Get detailed blueprint structure
dap-bpa knowledge blueprints get <blueprint-id> --include-files
```

### Step 2: Choose Target Plugin and Node Type

Identify which plugin and node type you need:

```bash
# List node types for a specific plugin
dap-bpa knowledge plugins list vsphere
dap-bpa knowledge plugins list kubernetes

# Get detailed node type properties
dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server
dap-bpa knowledge plugins get kubernetes dell.nodes.kubernetes.resources.Deployment
```

### Step 3: Plan Your Blueprint Structure

Decide on:

- **Single-file vs multi-file**: Always use multi-file (BS-010)
- **Required inputs**: What parameters users need to provide
- **Node types**: Which plugins and node types to use
- **Relationships**: How nodes depend on each other
- **Capabilities**: What values to expose to users and other deployments

### Step 4: Generate Blueprint Structure

Create the multi-file structure:

```bash
# Create blueprint directory
mkdir my-blueprint
cd my-blueprint

# Create required files
touch blueprint.yaml inputs.yaml capabilities.yaml CHANGELOG.yaml
```

### Step 5: Create blueprint.yaml

```yaml
# blueprint.yaml
tosca_definitions_version: dell_1_1

imports:
  - dell/types/types.yaml
  - plugin:vsphere?version= >=6.7

description: >
  Simple VM blueprint for deploying a virtual machine on vSphere
  with configurable CPU, memory, and disk settings.

node_templates:
  vm:
    type: dell.nodes.vsphere.Server
    properties:
      connection_config:
        host: { get_input: vcenter_host }
        username: { get_input: vcenter_username }
        password: { get_secret: { get_input: vcenter_secret_name } }
      agent_config:
        install_method: none
      server:
        name: { get_input: vm_name }
        cpus: { get_input: vm_cpus }
        memory: { get_input: vm_memory_mb }
        disk_size: { get_input: vm_disk_gb }
```

### Step 6: Create inputs.yaml

```yaml
# inputs.yaml
inputs:
  vcenter_host:
    type: string
    display_label: vCenter Host
    description: vCenter server hostname or IP address
    default: vcenter.example.com
    hidden: false
    allow_update: true
    display:
      group: vcenter_settings

  vcenter_username:
    type: string
    display_label: vCenter Username
    description: Username for vCenter authentication
    default: administrator@vsphere.local
    hidden: false
    allow_update: true
    display:
      group: vcenter_settings

  vcenter_secret_name:
    type: secret_key
    display_label: vCenter Password Secret
    description: Secret key containing vCenter password
    constraints:
      - secret_type: credentials
    display:
      group: vcenter_settings

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

  vm_cpus:
    type: integer
    display_label: vCPUs
    description: Number of virtual CPUs
    default: 2
    hidden: false
    allow_update: true
    display:
      group: vm_settings
    constraints:
      - in_range: [1, 16]
        error_message: Must be between 1 and 16 vCPUs.

  vm_memory_mb:
    type: integer
    display_label: Memory (MB)
    description: Memory in megabytes
    default: 4096
    hidden: false
    allow_update: true
    display:
      group: vm_settings
    constraints:
      - in_range: [1024, 65536]
        error_message: Must be between 1024 and 65536 MB.

  vm_disk_gb:
    type: integer
    display_label: Disk Size (GB)
    description: Primary disk size in gigabytes
    default: 50
    hidden: false
    allow_update: true
    display:
      group: vm_settings
    constraints:
      - in_range: [10, 1024]
        error_message: Must be between 10 and 1024 GB.

input_groups:
  vcenter_settings:
    display_label: vCenter Configuration
    index: 1
    collapsible: true
    inputs:
      - vcenter_host
      - vcenter_username
      - vcenter_secret_name

  vm_settings:
    display_label: VM Configuration
    index: 2
    collapsible: true
    inputs:
      - vm_name
      - vm_cpus
      - vm_memory_mb
      - vm_disk_gb
```

### Step 7: Create capabilities.yaml

```yaml
# capabilities.yaml
capabilities:
  vm_ip:
    description: IP address assigned to the VM
    value: { get_attribute: [ vm, ip ] }

  vm_power_state:
    description: Current power state of the VM
    value: { get_attribute: [ vm, power_state ] }

  vm_moid:
    description: Managed object ID of the VM in vCenter
    value: { get_attribute: [ vm, moid ] }
```

### Step 8: Create CHANGELOG.yaml

```yaml
# CHANGELOG.yaml (BS-009 - mandatory)
changelog:
  - version: 1.0.0
    date: 2026-06-02
    changes:
      - "Initial release"
      - "Basic VM provisioning on vSphere"
      - "Configurable CPU, memory, and disk settings"
```

### Step 9: Lint the Blueprint

Run the linter to check compliance with blueprint-rules.md:

```bash
dap-bpa blueprint lint --file blueprint.yaml --verify
```

Expected output should show:

```text
errorsFound: false
warningsFound: 0
```

If there are errors, fix them before proceeding. Common errors:

- Missing CHANGELOG.yaml (BS-009)
- Single-file structure instead of multi-file (BS-010)
- Using `outputs:` instead of `capabilities:` (CP-001)
- Missing input descriptions (IN-001)
- Missing input display_labels (IN-004)
- Using `cloudify.*` or `nativeedge.*` prefixes (TD-002)
- Missing lifecycle operations (ND-003)

### Step 10: Validate Against Plugin Schemas

After linting passes, validate against plugin schemas:

```bash
dap-bpa blueprint validate-all --file blueprint.yaml
```

This checks that all node properties match the expected schema for their types.

### Step 11: Review and Refine

Review your blueprint:

- Are all inputs properly described and constrained?
- Are input groups logical and organized?
- Do capabilities provide useful information?
- Is the CHANGELOG.yaml complete?
- Does the lint pass without errors or warnings?

## AI-Assisted Creation

You can also use AI assistance to accelerate blueprint creation:

```bash
# Ask dap-bpa to create a blueprint
# (natural language prompt in your IDE)
"Create a vSphere VM blueprint with configurable CPU, memory, and disk.
Use multi-file structure with proper inputs, constraints, and capabilities.
Follow all blueprint-rules.md requirements."
```

The AI will:

- Research existing patterns
- Look up node types and properties
- Generate the multi-file structure
- Apply blueprint-rules.md compliance
- Create proper inputs with constraints
- Define appropriate capabilities
- Include CHANGELOG.yaml

## Common Mistakes to Avoid

1. **Single-file structure**: Always use multi-file (BS-010)
2. **Missing CHANGELOG.yaml**: This is mandatory (BS-009)
3. **Hardcoded secrets**: Use `type: secret_key` and `get_secret` (SC-001, SC-002)
4. **Legacy prefixes**: Use `dell.*` not `cloudify.*` or `nativeedge.*` (TD-002)
5. **Missing input descriptions**: Every input needs a description (IN-001)
6. **Using outputs instead of capabilities**: Use `capabilities:` (CP-001)
7. **Incomplete lifecycle**: If you define `create`, you must define `delete` (ND-003)

## Verification Checklist

- [ ] Multi-file structure (blueprint.yaml, inputs.yaml, capabilities.yaml, CHANGELOG.yaml)
- [ ] CHANGELOG.yaml present and populated (BS-009)
- [ ] Using `dell.*` prefix for node types (TD-002)
- [ ] Using `capabilities:` instead of `outputs:` (CP-001)
- [ ] All inputs have descriptions (IN-001)
- [ ] All non-hidden inputs have display_labels (IN-004)
- [ ] Input groups match input names exactly (IN-007)
- [ ] Secrets use `type: secret_key` (SC-002)
- [ ] No literal secrets in `get_secret` calls (SC-001)
- [ ] Lifecycle operations are complete (ND-003)
- [ ] Lint passes with `errorsFound: false`
- [ ] Schema validation passes

## Next Steps

After creating your blueprint:

1. Upload it to the orchestrator: `dap-bpa orchestrator blueprints upload --file blueprint.yaml --id <id> --revision <version>`
2. Create a deployment: `dap-bpa orchestrator deployments create --blueprint-id <id> --inputs deployment-inputs.json`
3. Monitor execution: `dap-bpa orchestrator executions get <execution-id>`

## Related Capabilities

- **Edit Existing Blueprint** - Modify blueprints after creation
- **Validate Blueprint** - Ensure compliance and correctness
- **Generate Inputs/Outputs** - Create proper input/output structures

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 007: Building Blueprints - Detailed blueprint creation guide
- Section 010: Blueprint Anatomy - Blueprint structure deep dive
- Section 013: dap-bpa CLI Commands - Complete CLI reference
