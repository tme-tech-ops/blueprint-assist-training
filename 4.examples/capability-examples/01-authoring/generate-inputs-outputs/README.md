# Generate Inputs/Outputs

This example demonstrates how to create proper input definitions with constraints and capability-based outputs for blueprints.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap`

## Learning Objectives

By the end of this example, you will be able to:

- Define inputs with proper types, constraints, and validation
- Create input groups for UI organization
- Use conditional visibility with `only_with`
- Generate capability-based outputs instead of legacy outputs
- Use intrinsic functions for input/output resolution
- Handle secret inputs securely

## Prerequisites

- Basic understanding of blueprint structure
- Knowledge of TOSCA intrinsic functions
- Understanding of blueprint-rules.md input requirements

## Input Generation

### Input Types and Properties

Every input must include these required properties (IN-001, IN-004):

```yaml
inputs:
  example_input:
    type: string              # Required: data type
    display_label: Example   # Required: UI label
    description: Description # Required: tooltip text
    default: default_value   # Recommended: default value
    hidden: false            # Optional: hide from UI (default: false)
    allow_update: true       # Optional: allow changes via update (default: true)
    display:                 # Required for non-hidden inputs
      group: input_group     # Links to input_groups section
    constraints:             # Optional: validation rules
      - pattern: '^[a-zA-Z][a-zA-Z0-9-]*$'
```

### Supported Input Types

| Type | Description | Example Values |
| --- | --- | --- |
| `string` | Text string | `"my-vm"`, `"vcenter.example.com"` |
| `integer` | Whole number | `2`, `4`, `16` |
| `float` | Decimal number | `3.5`, `2.5` |
| `boolean` | True/false | `true`, `false` |
| `list` | Array of values | `["item1", "item2"]` |
| `dict` | Key-value pairs | `{"key": "value"}` |
| `textarea` | Multi-line text | Long descriptions, configs |

### Constraint Types

#### valid_values - Dropdown Selection

```yaml
inputs:
  vm_size:
    type: string
    display_label: VM Size
    description: Size tier for the VM
    default: medium
    constraints:
      - valid_values: [small, medium, large, xlarge]
        error_message: Must be one of: small, medium, large, xlarge
```

#### pattern - Regex Validation

```yaml
inputs:
  vm_name:
    type: string
    display_label: VM Name
    description: Name for the virtual machine
    constraints:
      - pattern: '^[a-zA-Z][a-zA-Z0-9-]*$'
        error_message: Must start with a letter, alphanumeric and hyphens only
```

#### min_length / max_length - String Length

```yaml
inputs:
  hostname:
    type: string
    display_label: Hostname
    description: Server hostname
    constraints:
      - min_length: 1
        error_message: Hostname cannot be empty
      - max_length: 63
        error_message: Hostname cannot exceed 63 characters
```

#### in_range - Numeric Range

```yaml
inputs:
  vm_cpus:
    type: integer
    display_label: vCPUs
    description: Number of virtual CPUs
    default: 2
    constraints:
      - in_range: [1, 16]
        error_message: Must be between 1 and 16 vCPUs
```

#### greater_than / less_than - Numeric Bounds

```yaml
inputs:
  min_memory:
    type: integer
    display_label: Minimum Memory (MB)
    description: Minimum memory allocation
    constraints:
      - greater_than: 0
        error_message: Must be greater than 0 MB
```

### Input Groups

Input groups organize inputs in the UI. Every non-hidden input must belong to exactly one group (IN-007):

```yaml
input_groups:
  vcenter_settings:
    display_label: vCenter Configuration
    index: 1
    collapsible: true
    inputs:
      - vcenter_host
      - vcenter_username
      - vcenter_secret_name

  vm_configuration:
    display_label: VM Configuration
    index: 2
    collapsible: true
    inputs:
      - vm_name
      - vm_cpus
      - vm_memory_mb
      - vm_disk_gb
```

**Critical Rule**: The `inputs` list must exactly match input names defined in the `inputs:` section. No typos, no extras, no missing names.

### Conditional Visibility with only_with

Hide inputs conditionally based on other boolean inputs:

```yaml
inputs:
  enable_monitoring:
    type: boolean
    display_label: Enable Monitoring
    description: Enable monitoring stack deployment
    default: false
    hidden: false

  monitoring_retention_days:
    type: integer
    display_label: Retention Days
    description: Monitoring data retention period
    default: 30
    only_with: enable_monitoring  # Only shown when enable_monitoring is true
```

### Secret Input Handling

For sensitive data like passwords, API keys, and credentials:

```yaml
inputs:
  api_key:
    type: secret_key  # Use secret_key type (SC-002)
    display_label: API Key
    description: Secret key containing API key
    constraints:
      - secret_type: api_key
    display:
      group: credentials
```

**Usage in node templates**:

```yaml
node_templates:
  my_node:
    properties:
      # CORRECT: Resolve secret via input (SC-001)
      credential: { get_secret: { get_input: api_key } }
      
      # INCORRECT: Literal secret
      # credential: { get_secret: "hardcoded_key" }
```

## Output Generation (Capabilities)

### Use Capabilities, Not Outputs

Blueprint Assist uses `capabilities:` instead of legacy `outputs:` (CP-001):

```yaml
# WRONG (legacy):
outputs:
  vm_ip:
    value: { get_attribute: [ vm, ip ] }

# CORRECT:
capabilities:
  vm_ip:
    description: IP address assigned to the VM
    value: { get_attribute: [ vm, ip ] }
```

### Capability Structure

Every capability must have:

- `description`: Human-readable description
- `value`: The actual value using intrinsic functions

```yaml
capabilities:
  vm_ip:
    description: IP address assigned to the VM
    value: { get_attribute: [ vm, ip ] }

  vm_hostname:
    description: Hostname of the provisioned VM
    value: { get_attribute: [ vm, hostname ] }

  cluster_endpoint:
    description: Kubernetes cluster API endpoint
    value: { get_attribute: [ cluster, endpoint ] }
```

### Intrinsic Functions for Capabilities

#### get_attribute - Runtime Properties

```yaml
capabilities:
  vm_ip:
    value: { get_attribute: [ vm, ip ] }
  vm_state:
    value: { get_attribute: [ vm, power_state ] }
```

#### get_property - Static Properties

```yaml
capabilities:
  vm_type:
    value: { get_property: [ vm, vm_type ] }
```

#### get_input - Input Values

```yaml
capabilities:
  deployment_environment:
    value: { get_input: environment }
```

#### concat - String Concatenation

```yaml
capabilities:
  fqdn:
    value:
      concat:
        - { get_attribute: [ vm, hostname ] }
        - "."
        - { get_input: domain }
```

## Complete Example

### inputs.yaml

```yaml
inputs:
  # vCenter Configuration
  vcenter_host:
    type: string
    display_label: vCenter Host
    description: vCenter server hostname or IP address
    default: vcenter.example.com
    hidden: false
    allow_update: false
    display:
      group: vcenter_settings
    constraints:
      - pattern: '^[a-zA-Z0-9.-]+$'
        error_message: Must be a valid hostname or IP address

  vcenter_username:
    type: string
    display_label: vCenter Username
    description: Username for vCenter authentication
    default: administrator@vsphere.local
    hidden: false
    allow_update: false
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

  # VM Configuration
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
        error_message: Must start with a letter, alphanumeric and hyphens only

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
        error_message: Must be between 1 and 16 vCPUs

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
        error_message: Must be between 1024 and 65536 MB

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
        error_message: Must be between 10 and 1024 GB

  # Optional Features
  enable_monitoring:
    type: boolean
    display_label: Enable Monitoring
    description: Enable monitoring agent installation
    default: false
    hidden: false
    allow_update: false
    display:
      group: optional_features

  monitoring_retention_days:
    type: integer
    display_label: Monitoring Retention (Days)
    description: Monitoring data retention period
    default: 30
    only_with: enable_monitoring
    display:
      group: optional_features
    constraints:
      - in_range: [1, 365]
        error_message: Must be between 1 and 365 days

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

  optional_features:
    display_label: Optional Features
    index: 3
    collapsible: true
    inputs:
      - enable_monitoring
      - monitoring_retention_days
```

### capabilities.yaml

```yaml
capabilities:
  vm_ip:
    description: IP address assigned to the VM
    value: { get_attribute: [ vm, ip ] }

  vm_hostname:
    description: Hostname of the provisioned VM
    value: { get_attribute: [ vm, hostname ] }

  vm_power_state:
    description: Current power state of the VM
    value: { get_attribute: [ vm, power_state ] }

  vm_moid:
    description: Managed object ID of the VM in vCenter
    value: { get_attribute: [ vm, moid ] }

  vcenter_datacenter:
    description: vCenter datacenter where VM is deployed
    value: { get_attribute: [ vm, datacenter ] }

  deployment_timestamp:
    description: Timestamp when VM was deployed
    value:
      concat:
        - { get_sys: [deployment, created_at] }
```

## Common Mistakes to Avoid

1. **Missing input description** (IN-001):

   ```yaml
   # Wrong:
   vm_name:
     type: string
     default: my-vm
   
   # Correct:
   vm_name:
     type: string
     description: Name for the virtual machine  # Required
     default: my-vm
   ```

2. **Missing display_label** (IN-004):

   ```yaml
   # Wrong:
   vm_name:
     type: string
     description: Name for the virtual machine
   
   # Correct:
   vm_name:
     type: string
     display_label: VM Name  # Required for non-hidden inputs
     description: Name for the virtual machine
   ```

3. **Input group mismatch** (IN-007):

   ```yaml
   # Wrong:
   input_groups:
     vm_settings:
       inputs:
         - vm_nam  # Typo - should be vm_name
   
   # Correct:
   input_groups:
     vm_settings:
       inputs:
         - vm_name  # Must match exact input name
   ```

4. **Using outputs instead of capabilities** (CP-001):

   ```yaml
   # Wrong:
   outputs:
     vm_ip:
       value: { get_attribute: [ vm, ip ] }
   
   # Correct:
   capabilities:
     vm_ip:
       description: IP address assigned to the VM
       value: { get_attribute: [ vm, ip ] }
   ```

5. **Literal secrets** (SC-001):

   ```yaml
   # Wrong:
   credential: { get_secret: "hardcoded_key" }
   
   # Correct:
   credential: { get_secret: { get_input: secret_name } }
   ```

6. **Wrong secret type** (SC-002):

   ```yaml
   # Wrong:
   api_key:
     type: string
     description: API key
   
   # Correct:
   api_key:
     type: secret_key  # Use secret_key type
     description: Secret key containing API key
     constraints:
       - secret_type: api_key
   ```

## Best Practices

1. **Always provide descriptions** - Required for all inputs (IN-001)
2. **Use meaningful default values** - Help users get started quickly
3. **Organize inputs logically** - Group related inputs together
4. **Use appropriate constraints** - Validate user input effectively
5. **Provide helpful error messages** - Guide users to correct input
6. **Use capabilities instead of outputs** - Required (CP-001)
7. **Describe capabilities clearly** - Help users understand what values mean
8. **Use secret_key for sensitive data** - Required for secrets (SC-002)

## Related Capabilities

- **Create New Blueprint** - Generate complete blueprint structure
- **Validate Blueprint** - Ensure inputs/capabilities comply with rules

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 007: Building Blueprints - Blueprint creation guide
- Section 010: Blueprint Anatomy - Blueprint structure deep dive
