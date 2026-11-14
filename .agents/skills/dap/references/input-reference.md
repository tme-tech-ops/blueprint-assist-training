# Input Reference — DAP Blueprint Inputs

Detailed reference for the `inputs:`, `input_groups:`, and `data_types:` sections of a DAP blueprint (`dell_1_1` DSL).

---

## Input Definition Keys

Every entry under `inputs:` is a map of `<input-name>: <definition>`.

| Key | Type | Required | DSL | Description |
|---|---|---|---|---|
| `type` | string | Yes | all | Data type — see [Input Types](#input-types) |
| `display_label` | string | Yes | all | Human-readable label shown in the DAP UI |
| `description` | string | Yes | all | Tooltip or help text for the input |
| `default` | varies | Recommended | all | Default value if not supplied at deploy time. Empty string is valid. Avoid `null`. |
| `required` | bool | No | all | Whether the input must be supplied. Default: `true` when no `default` is present |
| `hidden` | bool | No | all | Hides the input from the UI entirely. Default: `false` |
| `constraints` | list | No | all | Validation constraints applied at upload/deploy time — see [Constraints](#constraints) |
| `allow_update` | bool | No | `nativeedge_1_1`+ | Whether the value can be changed via a deployment update. Default: `true` |
| `display` | dict | Yes* | `dell_1_0`+ | `{ group: <group-name> }` — links the input to an `input_groups` entry. Required for all non-hidden inputs in Dell DSL. |
| `item_type` | string | No | all | Element type for `type: list` inputs — see [List Inputs and item_type](#list-inputs-and-item_type) |
| `only_with` | varies | No | all | Conditionally hides the input in the UI — see [only_with](#only_with) |

---

## Input Types

| Type | Description |
|---|---|
| `string` | Plain text |
| `integer` | Whole number |
| `float` | Decimal number |
| `boolean` | `true` / `false` |
| `list` | Ordered list of values |
| `dict` | Key-value map |
| `textarea` | Multi-line text (displayed as textarea in UI) |
| `regex` | Regular expression string |
| `secret_key` | Reference to a DAP secret — see [Secret Inputs](#secret-inputs) |
| `node_id` | Single node ID reference |
| `node_ids` | List of node ID references |
| `blueprint_id` | Blueprint ID reference |
| `blueprint_ids` | List of blueprint ID references |
| `deployment_id` | Deployment ID reference |
| `deployment_ids` | List of deployment ID references |
| `node_template` | Node template name reference |
| `operation_name` | Operation name reference |
| `capability_value` | Capability value reference |
| `node_instance_ids` | List of node instance ID references |
| `node` | Dell-specific: node reference (Dell DSL only) |
| `scaling_group` | Dell-specific: scaling group reference (Dell DSL only) |
| `node_type` | Dell-specific: node type reference (Dell DSL only) |
| `node_instance` | Dell-specific: node instance reference (Dell DSL only) |

---

## List Inputs and item_type

Use `item_type` to declare the element type of a `type: list` input. DAP does **not** support the TOSCA standard `entry_schema` keyword — using `entry_schema` will be silently ignored by the orchestrator.

```yaml
inputs:
  server_names:
    type: list
    item_type: string
    display_label: Server Names
    description: List of server hostnames to configure.
    default: []
    display:
      group: servers
```

Valid `item_type` values are any of the scalar types: `string`, `integer`, `float`, `boolean`.

### Typed Dict Values

DAP has no schema-level mechanism to type the *values* of a `type: dict` input. There is no equivalent of `entry_schema` for dicts. If the dict's value structure must be validated, validate it at runtime in a lifecycle operation (e.g. using `ctx.get_resource` or a dedicated validation step). Document the expected key/value structure in the `description` field.

---

## Constraints

Constraints are evaluated at upload time and at deploy time.

```yaml
constraints:
  - <operator>: <value>
    error_message: Human-readable error shown in the UI on violation.
```

| Operator | Applies to | Example |
|---|---|---|
| `valid_values` | All types | `valid_values: [a, b, c]` |
| `pattern` | `string` | `pattern: '^[a-z][a-z0-9-]*$'` |
| `min_length` | `string` | `min_length: 3` |
| `max_length` | `string` | `max_length: 63` |
| `in_range` | `integer`, `float` | `in_range: [1, 65535]` |
| `greater_than` | `integer`, `float` | `greater_than: 0` |
| `less_than` | `integer`, `float` | `less_than: 100` |
| `greater_or_equal` | `integer`, `float` | `greater_or_equal: 1` |
| `less_or_equal` | `integer`, `float` | `less_or_equal: 255` |

Multiple constraints can be listed; all must pass.

```yaml
vm_name:
  type: string
  display_label: VM Name
  description: Name for the virtual machine.
  constraints:
    - pattern: '^[a-zA-Z][a-zA-Z0-9-]{0,62}$'
      error_message: Must start with a letter, alphanumeric and hyphens only, max 63 chars.
    - max_length: 63
      error_message: Must not exceed 63 characters.
```

---

## Secret Inputs

Use `type: secret_key` for any input that references a DAP secret. The user supplies the *name* of a secret, and the value is retrieved at runtime via `get_secret`.

```yaml
inputs:
  db_password_secret:
    type: secret_key
    display_label: Database Password Secret
    description: Name of the DAP secret containing the database password.
    display:
      group: database
```

Consume in node properties:

```yaml
properties:
  password: { get_secret: { get_input: db_password_secret } }
```

**Never** use `get_secret` with a literal string — always resolve through a `secret_key` input (SC-001). See `blueprint-rules.md` for the full secret security rules.

---

## only_with

`only_with` controls UI visibility: the input is hidden in the DAP orchestrator UI when the condition is not met. The value is still accepted at deploy time even if hidden.

Three supported forms:

### 1. String (boolean input gate)

The input is shown only when the named boolean input is `true`.

```yaml
monitoring_endpoint:
  type: string
  display_label: Monitoring Endpoint
  description: Endpoint for the monitoring agent.
  only_with: install_monitoring
  display:
    group: monitoring
```

### 2. Object (input equals one of a list of values)

The input is shown only when the named input's value is in the provided list.

```yaml
boot_override_target:
  type: string
  display_label: Boot Override Target
  description: The target of the boot source override.
  only_with:
    boot_override_enabled: ["Continuous", "Once"]
  display:
    group: boot_config
```

### 3. List of conditions (comparison operators)

The input is shown when all listed conditions are satisfied.

```yaml
vm_2_name:
  type: string
  display_label: VM 2 Name
  description: Display name for the second VM.
  only_with:
    - input: number_of_vms
      operator: greater_or_equal
      value: 2
  display:
    group: additional_vms
```

Supported operators in list form: `greater_or_equal`, `greater_than`, `less_or_equal`, `less_than`, `equals`.

---

## input_groups

`input_groups` organises non-hidden inputs into collapsible sections in the DAP UI. Every non-hidden input must belong to exactly one group.

```yaml
input_groups:
  vm_settings:
    display_label: VM Settings
    index: 1
    collapsible: true
    inputs:
      - vm_name
      - vm_size

  network:
    display_label: Network
    index: 2
    collapsible: true
    inputs:
      - network_name
      - subnet_cidr
```

| Key | Required | Description |
|---|---|---|
| `display_label` | Yes | Human-readable section heading |
| `inputs` | Yes | Ordered list of input names belonging to this group |
| `index` | No | Display order (lower = first) |
| `collapsible` | No | Whether the section can be collapsed in the UI |

Rules:
- The `inputs` list must exactly match the names defined in `inputs:` — no extras, no typos.
- Every non-hidden input must appear in exactly one group.
- Hidden inputs (`hidden: true`) are excluded from `input_groups`.

---

## data_types

`data_types` defines custom reusable structured types that can be referenced in node type property definitions. They are **not** usable as input types in the `inputs:` section (DAP does not support `type: <custom_data_type>` for deployment inputs).

```yaml
data_types:
  app.types.ServerConfig:
    description: Configuration for a single server instance.
    properties:
      hostname:
        type: string
        required: true
      port:
        type: integer
        default: 8080
```

Use `data_types` to document the expected shape of a `dict` input or property in the blueprint's type definitions. For runtime validation of dict input values, validate inside a lifecycle operation.

---

## Complete Example

```yaml
inputs:
  vm_name:
    type: string
    display_label: VM Name
    description: Name for the virtual machine.
    default: my-vm
    allow_update: false
    constraints:
      - pattern: '^[a-zA-Z][a-zA-Z0-9-]{0,62}$'
        error_message: Must start with a letter, alphanumeric and hyphens only.
    display:
      group: vm_settings

  vm_count:
    type: integer
    display_label: VM Count
    description: Number of VMs to provision.
    default: 1
    constraints:
      - in_range: [1, 10]
        error_message: Must be between 1 and 10.
    display:
      group: vm_settings

  secondary_vm_name:
    type: string
    display_label: Secondary VM Name
    description: Name for the secondary VM (shown when vm_count >= 2).
    default: my-vm-2
    allow_update: false
    only_with:
      - input: vm_count
        operator: greater_or_equal
        value: 2
    display:
      group: vm_settings

  ssh_key_secret:
    type: secret_key
    display_label: SSH Key Secret
    description: Name of the DAP secret containing the SSH private key.
    display:
      group: auth

  tags:
    type: list
    item_type: string
    display_label: Tags
    description: Resource tags to apply to provisioned VMs.
    default: []
    display:
      group: vm_settings

input_groups:
  vm_settings:
    display_label: VM Settings
    index: 1
    collapsible: true
    inputs:
      - vm_name
      - vm_count
      - secondary_vm_name
      - tags

  auth:
    display_label: Authentication
    index: 2
    collapsible: true
    inputs:
      - ssh_key_secret
```
