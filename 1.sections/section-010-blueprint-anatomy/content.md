# Section 010: Blueprint Anatomy

## Overview

A blueprint is a TOSCA document that describes what to deploy and how to deploy it. Section 7 covered how to author one end to end. This section takes a blueprint apart and explains each structural piece: the directory layout, the top-level sections of `blueprint.yaml`, the inside of a node template, and the lifecycle the orchestrator runs over it.

The examples below are drawn from a real reference blueprint in the local library, `edge-vm-ansible`, which you can open yourself:

```bash
dap-bpa knowledge blueprints get edge-vm-ansible --include-files
```

Every blueprint begins by declaring its TOSCA dialect:

```yaml
tosca_definitions_version: dell_1_1
```

## Blueprint Directory Structure

A blueprint lives in a directory. A simple blueprint can be a single `blueprint.yaml`, but production blueprints are split across multiple files. The `edge-vm-ansible` reference blueprint is laid out like this:

```text
vm-ansible/
├── blueprint.yaml          # Main file: imports, input groups, labels
├── CHANGELOG.yaml          # Revision history
├── vm/                     # Infrastructure layer
│   ├── definitions.yaml    # node_templates
│   ├── inputs.yaml         # inputs
│   ├── outputs.yaml        # capabilities (note: file is named outputs.yaml)
│   └── scripts/
│       └── get_proxy.py
└── app/                    # Application layer
    ├── definitions.yaml
    ├── inputs.yaml
    └── ansible/
        └── playbook.yaml
```

Conventions worth knowing:

- The main file is always named `blueprint.yaml`. Only `blueprint.yaml` imports plugins and `dell/types/types.yaml`.
- The split files are conventionally named `inputs.yaml`, `definitions.yaml` (for node templates), and `outputs.yaml`. Note the naming quirk above: the file is called `outputs.yaml`, but the key inside it is `capabilities:`, not `outputs:`. The authoring guidance (rule BS-010) describes the canonical split as `blueprint.yaml` plus `inputs.yaml` plus `capabilities.yaml`; real library blueprints often use `outputs.yaml` as the filename for the capabilities block. The filename is a convention; the key name is what matters.
- A `CHANGELOG.yaml` is expected (rule BS-009). A `README.md` and an `icon.png` are common but not present in every blueprint.
- Node template IDs must be unique across all files, not just within one file.

## Anatomy of `blueprint.yaml`

In a multi-file blueprint, `blueprint.yaml` acts as the manifest. It does not necessarily contain the inputs and node templates itself; it imports the files that do. Here is the real `vm-ansible` manifest, lightly trimmed:

```yaml
tosca_definitions_version: dell_1_1

description: >-
  Deploy a Linux VM on a Dell Distributed Private Cloud Endpoint and configure it
  with an Ansible playbook.

imports:
  - dell/types/types.yaml
  - plugin:edge-plugin?version= >=3.3.17.0,<4.0.0.0
  - plugin:utilities-plugin?version= >=3.1.4.0,<4.0.0.0
  - plugin:ansible-plugin?version= >=4.1.8.0,<5.0.0.0
  - vm/definitions.yaml
  - vm/inputs.yaml
  - vm/outputs.yaml
  - app/definitions.yaml
  - app/inputs.yaml

input_groups:
  vm:
    display_label: Virtual Machine
    collapsible: true
    index: 1
    inputs:
      - vm_name
      - vm_hostname

labels:
  csys-obj-type:
    values:
      - environment

blueprint_labels:
  obj-type:
    values:
      - edge
      - hzp
```

The top-level sections you will encounter across a blueprint are:

| Section | Purpose |
| -------- | --------- |
| `tosca_definitions_version` | The TOSCA dialect. Always `dell_1_1`. |
| `description` | Human-readable summary of what the blueprint deploys. |
| `imports` | Plugins, the Dell type library, and split files. Only `blueprint.yaml` imports plugins. |
| `dsl_definitions` | YAML anchors for reusable values. Scoped to the file they are declared in. |
| `inputs` | Deployment-time parameters the user supplies. |
| `input_groups` | Groups inputs into collapsible sections in the orchestrator UI. |
| `node_templates` | The resources to deploy. The core of the blueprint. |
| `capabilities` | Values exposed to users and to other deployments. |
| `labels` / `blueprint_labels` | Classification metadata. Both are required. |
| `workflows` | Built-in and custom workflows. |

### `imports`

Imports pull in three kinds of thing: the Dell type library (`dell/types/types.yaml`), plugins (with a version range), and other files in the blueprint. The plugin version syntax pins a compatible range:

```yaml
imports:
  - dell/types/types.yaml
  - plugin:edge-plugin?version= >=3.3.17.0,<4.0.0.0
  - vm/definitions.yaml
```

### `dsl_definitions`

`dsl_definitions` holds YAML anchors for values you reuse within a file. In `vm/definitions.yaml`, a Fabric connection block is defined once and referenced by anchor:

```yaml
dsl_definitions:
  fabric_env: &fabric_env
    host_string: { get_attribute: [vm, vm_details, name] }
    user: { get_input: vm_user_name }
    key: { get_secret: { get_input: vm_password_secret } }
    port: 22
```

A structural gotcha: anchors are scoped to the file they are defined in. You cannot define an anchor in `blueprint.yaml` and reference it from `vm/definitions.yaml`. Each imported file that needs anchors must declare its own `dsl_definitions` block. To share values across files, use inputs.

### `inputs`

Inputs are the parameters a user fills in at deployment time. Each input declares its type, UI metadata, and validation:

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

Common input properties:

| Property | Description |
| ---------- | ------------- |
| `type` | `string`, `integer`, `float`, `boolean`, `list`, `dict`, or `textarea` |
| `display_label` | UI label (required for visible inputs) |
| `description` | Tooltip text (rule IN-001) |
| `default` | Default value. An empty string is fine; `null` is discouraged |
| `hidden` | Hide from the UI (default `false`) |
| `allow_update` | Whether the value can change during a deployment update (default `true`) |
| `display.group` | Links the input to an `input_groups` entry; required for visible inputs |
| `constraints` | Validation rules |

Constraints are how you validate input before deployment:

| Constraint | Applies to |
| ------------ | ------------ |
| `valid_values: [a, b, c]` | Any type (renders as a dropdown) |
| `pattern: '<regex>'` | `string` |
| `min_length` / `max_length` | `string` |
| `in_range: [min, max]` | `integer`, `float` |
| `greater_than` / `less_than` | `integer`, `float` |

### `input_groups`

Inputs are organised for the UI through a separate top-level `input_groups` section, not per input. Each group lists the inputs it contains and how it renders:

```yaml
input_groups:
  vm:
    display_label: Virtual Machine
    collapsible: true
    index: 1
    inputs:
      - vm_name
      - vm_hostname
```

### `capabilities`

Capabilities expose values from the deployment, both to the user in the orchestrator UI and to other deployments that consume this one. Use `capabilities`, not `outputs`: `outputs` is a legacy alias, and the current rule (CP-001) is that every capability must have a `value` and a `description`. This is the real `vm/outputs.yaml` (named `outputs.yaml`, keyed `capabilities:`):

```yaml
capabilities:
  vm_name:
    description: Name of the deployed VM on the Dell Distributed Private Cloud Endpoint.
    value: { get_attribute: [vm, vm_details, name] }
  vm_ip:
    description: Primary IP address of the deployed VM.
    value: { get_attribute: [vm, vm_details, ip] }
```

Do not place a `get_secret` value in a capability. Capabilities are visible in the orchestrator UI, so a secret exposed there leaks.

### `labels` and `blueprint_labels`

Both label sections are required. Each label key maps to an object with a single `values` key, which is a list containing exactly one string:

```yaml
labels:
  csys-obj-type:
    values:
      - environment

blueprint_labels:
  obj-type:
    values:
      - edge
```

## Anatomy of a Node Template

Node templates are the heart of a blueprint. Each one describes a resource to create: a VM, a network, a script execution, a REST call. A node template has up to four parts: a `type`, `properties`, `interfaces`, and `relationships`. Here are real node templates from `vm/definitions.yaml`, trimmed:

```yaml
node_templates:

  cloudinit:
    type: dell.nodes.CloudInit.CloudConfig
    properties:
      resource_config:
        hostname: { get_input: vm_hostname }
        users:
          - name: { get_input: vm_user_name }
            passwd: { get_secret: { get_input: vm_password_secret } }

  proxy_resolver:
    type: dell.nodes.ApplicationModule
    interfaces:
      dell.interfaces.lifecycle:
        precreate:
          implementation: vm/scripts/get_proxy.py
          executor: central_deployment_agent
          inputs:
            service_tag: { get_input: service_tag }

  vm:
    type: dell.nodes.nativeedge.template.NativeEdgeVM
    properties:
      vm_config:
        name: { get_input: vm_name }
        cloudinit: { get_attribute: [cloudinit, cloud_config] }
    relationships:
      - type: dell.relationships.depends_on
        target: cloudinit
```

### `type`

The node type determines what the node does and which properties it accepts. Types are namespaced as `dell.nodes.<plugin>.<Type>`. Never invent a node type. Look up what a plugin actually offers:

```bash
dap-bpa knowledge plugins list edge
dap-bpa knowledge plugins get edge dell.nodes.nativeedge.template.NativeEdgeVM
```

If a type is not in the plugin's list, it does not exist.

### `properties`

Properties configure the resource. Their shape is defined by the node type, so the same `plugins get` lookup tells you which properties are valid and required. Property values are frequently intrinsic functions rather than literals (see below).

### `interfaces`

Interfaces attach lifecycle operations to a node. Most plugin node types handle their own create and delete, so you only write an `interfaces` block when you need custom behaviour, such as running a script. Operations live under `dell.interfaces.lifecycle`:

```yaml
interfaces:
  dell.interfaces.lifecycle:
    create:
      implementation: fabric.fabric_plugin.tasks.run_script
      inputs:
        script_path: scripts/setup.sh
    delete:
      implementation: fabric.fabric_plugin.tasks.run_script
      inputs:
        script_path: scripts/teardown.sh
```

Each operation accepts:

| Field | Description |
| ------- | ------------- |
| `implementation` | Plugin function or script path (required) |
| `inputs` | Arguments passed to the implementation |
| `executor` | Where it runs, for example `central_deployment_agent` |
| `max_retries` | Retries on failure (`-1` is infinite) |
| `retry_interval` | Seconds between retries |
| `timeout` | Seconds before termination (`0` is no timeout) |

A defining rule of a well-formed node (ND-003): every persistent change made by `create` must be reversed by `delete`, and every `start` must have a matching `stop`. The orchestrator does not track what `create` did, so the blueprint is responsible for undoing it. Forgetting leaves orphaned resources or breaks the next reinstall.

### `relationships`

Relationships connect nodes and, importantly, order them. A node with `depends_on` is created after its target:

```yaml
relationships:
  - type: dell.relationships.depends_on
    target: cloudinit
```

| Relationship | Purpose |
| -------------- | --------- |
| `dell.relationships.depends_on` | Ordering dependency; the target is created first |
| `dell.relationships.connected_to` | Network or logical connection |
| `dell.relationships.contained_in` | Parent-child containment |

Ordering matters more than it looks. Nodes with no relationships run their lifecycle operations in parallel. A node that reads `get_attribute` from another node will fail if that node has not finished `create` yet, so dependencies that exist only implicitly through `get_attribute` must still be declared with `depends_on`.

### Intrinsic functions

Property and capability values are usually computed by intrinsic functions rather than hardcoded. The ones you will see most:

| Function | Resolves | Description |
| ---------- | ---------- | ------------- |
| `get_input: name` | Deploy-time | The value of an input |
| `get_secret: key` | Runtime | A value from the secret store |
| `get_attribute: [node, attr]` | Runtime | A runtime property of another node |
| `get_property: [node, prop]` | Deploy-time | A static property of another node |
| `concat: [a, b, ...]` | Varies | String concatenation |
| `get_capability: [dep, cap]` | Runtime | A capability from another deployment |

Secrets always go through the nested form. Never pass a literal string to `get_secret` (rule SC-001):

```yaml
key: { get_secret: { get_input: vm_password_secret } }
```

## Lifecycle and Execution Flow

When the orchestrator deploys a blueprint, it runs a workflow. A workflow walks every node, in dependency order, and runs that node's lifecycle operations in a fixed sequence.

### Built-in workflows

| Workflow | Purpose |
| ---------- | --------- |
| `install` | Provision the deployment |
| `uninstall` | Tear it down |
| `update` | Apply a deployment update (Day-2 changes) |
| `execute_operation` | Run a single operation on demand |

`install` and `uninstall` are the lifecycle pair. `update` drives Day-2 changes. `execute_operation` is a general escape hatch, not a lifecycle stage.

### The lifecycle operation sequence

The `install` workflow runs each node through this sequence (operations without an implementation are skipped):

| Operation | When it runs | Typical use |
| ----------- | -------------- | ------------- |
| `precreate` | Before any resource exists | Validation, assembling dynamic inputs |
| `create` | Main provisioning step | Create the VM, volume, container |
| `configure` | After the resource exists | Tune settings, apply configuration |
| `start` | After configuration | Activate the service, run a playbook |
| `poststart` | After the service is running | Health checks, post-deployment patching |

The `uninstall` workflow runs the inverse, in reverse dependency order:

| Operation | When it runs | Typical use |
| ----------- | -------------- | ------------- |
| `prestop` | Before shutdown | Pre-shutdown cleanup |
| `stop` | Graceful shutdown | Stop the service, drain connections |
| `delete` | Remove the resource | Delete it and reverse `create` |
| `postdelete` | After deletion | Final cleanup |

Most node types only implement `create` and `delete`. Some add `start` and `stop`, or `precreate` and `poststart`, as the resource requires.

### Deployment flow

At the deployment level, the path a blueprint follows is:

```text
Author blueprint  ──►  Upload to orchestrator  ──►  Create deployment
                                                          │
                                                          ▼
                                                   Run install workflow
                                                          │
                          ┌───────────────────────────────┤
                          ▼                                ▼
                  Day-2: run update             Eventually: run
                  workflow (drift, input         uninstall workflow
                  changes, reinstall)
```

The orchestrator, not the CLI, holds deployment state. To inspect it, query the orchestrator:

```bash
dap-bpa orchestrator deployments get <deployment-id>
dap-bpa orchestrator executions list
```

## Day-2 Operations, Updates, and Drift

A deployment is not static. After it is installed, you can change its inputs, reconcile it against reality, or reinstall parts of it. This is the `update` workflow, run through the orchestrator:

```bash
dap-bpa orchestrator executions start --deployment-id <id> --workflow-id update
```

Two structural pieces in the blueprint enable this:

- **`allow_update` on inputs.** An input with `allow_update: true` can be changed during an update. One with `allow_update: false` is fixed at install time.
- **`check_drift` lifecycle operations.** Drift checking compares the deployment against the real infrastructure. A blueprint that declares an `update` workflow but no `check_drift` is considered incomplete (rule ND-009). Drift support is a distinct authoring topic covered by the deployment-update guidance; the key point for anatomy is that drift is a lifecycle operation in the blueprint, not a separate CLI command.

There is no `dap-bpa drift-detect`, `dap-bpa rollback`, or `dap-bpa history` command. Day-2 behaviour is expressed in the blueprint and driven through the `update` workflow.

## `CHANGELOG.yaml`

Every blueprint carries a changelog (rule BS-009). It maps each revision to the changes it introduced:

```yaml
1.0.0:
  - ticket: INITIAL
    developer: Your Name
    description: Initial blueprint creation
```

## Composing Blueprints

A blueprint does not have to be self-contained. One blueprint can consume another as a building block through a `dell.nodes.ServiceComponent` node, and read the parent deployment's exposed values with `get_environment_capability`. This is how larger services are assembled from smaller, independently deployable blueprints. Service composition is its own topic; for anatomy, the point is that the `capabilities` a blueprint exposes are exactly what a composing blueprint consumes.

## Next Steps

1. **Section 11: Skill Anatomy** moves from the blueprint to the dap-bpa skills that help you author one.
2. **Section 7: Building Blueprints with BPA** is the end-to-end authoring walkthrough that puts these pieces together.
3. **Section 13: dap-bpa CLI Command Reference** documents the `knowledge`, `blueprint`, and `orchestrator` commands referenced here in full.
