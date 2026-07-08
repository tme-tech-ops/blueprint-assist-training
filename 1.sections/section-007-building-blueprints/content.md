# Section 007: Building Blueprints with BPA

## Step-by-Step Blueprint Creation

### Phase 1: Planning and Design

#### 1. Define Blueprint Requirements

Before creating a blueprint, clearly define:

- **Purpose**: What infrastructure will this blueprint deploy?
- **Scope**: What components are included/excluded?
- **Target Environment**: On-premises data center, Kubernetes, cloud?
- **Constraints**: Budget, timeline, compliance requirements?
- **Dependencies**: External systems or services required?

#### 2. Research Existing Blueprints

Use the knowledge base to find similar blueprints as starting points:

```bash
# Search for relevant blueprints by keyword
dap-bpa knowledge blueprints find "storage"
dap-bpa knowledge blueprints find "network"
dap-bpa knowledge blueprints find "kubernetes"

# Search within a specific plugin
dap-bpa knowledge blueprints find "vm" --plugin vsphere

# Get a complete blueprint with all files
dap-bpa knowledge blueprints get vsphere-vm --include-files
```

#### 3. Study Plugin Documentation

Research the plugins you'll need:

```bash
# List available node types for a plugin
dap-bpa knowledge plugins list vsphere

# Get detailed information about a specific node type
dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server

# Get full plugin documentation
dap-bpa knowledge plugins docs vsphere

# Get documentation for a specific node type
dap-bpa knowledge plugins node-type-docs vsphere dell.nodes.vsphere.Server
```

### Phase 2: Blueprint Structure

#### 4. Create Blueprint Directory Structure

```bash
# Create your blueprint directory
mkdir my-blueprint
cd my-blueprint

# Create standard structure
mkdir -p infrastructure/vsphere
mkdir -p example_JSON_configs
```

#### 5. Blueprint File Structure

Based on complexity, choose your structure:

**Simple Blueprint (single file):**

```text
my-blueprint/
├── blueprint.yaml
├── example_JSON_configs/
│   └── deployment-inputs.json
├── CHANGELOG.yaml
├── README.md
└── icon.png
```

**Complex Blueprint (multi-file):**

```text
my-blueprint/
├── blueprint.yaml              # Main blueprint with imports
├── inputs.yaml                 # Input definitions
├── capabilities.yaml           # Output definitions
├── infrastructure/
│   └── vsphere/
│       ├── inputs.yaml
│       ├── definitions.yaml
│       └── outputs.yaml
├── example_JSON_configs/
│   ├── deployment-inputs.json
│   └── example-configs-*.json
├── CHANGELOG.yaml
├── README.md
└── icon.png
```

### Phase 3: Blueprint Authoring

#### 6. Write Main Blueprint File

Create your `blueprint.yaml` following TOSCA standards:

```yaml
tosca_definitions_version: dell_1_1

description: >
  Your blueprint description here

imports:
  - dell/types/types.yaml
  - plugin:vsphere-plugin?version= >=3.0.7.0,<4.0.0.0

dsl_definitions:
  connection_config: &connection_config
    username: { get_input: vsphere_username }
    password: { get_secret: { get_input: vsphere_secret } }
    host: { get_input: vsphere_host }
    port: { get_input: vsphere_port }

inputs:
  # Define your inputs here
  vsphere_host:
    type: string
    hidden: false
    allow_update: false
    display_label: vSphere Host
    description: The vSphere server hostname or IP address.
    display:
      group: connection
      index: 0

  # ... more inputs

input_groups:
  connection:
    display_label: vSphere Connection
    collapsible: true
    index: 0
    inputs:
      - vsphere_host
      # ... more inputs

node_templates:
  # Define your node templates here
  my_vm:
    type: dell.nodes.vsphere.Server
    properties:
      connection_config: *connection_config
      # ... more properties

capabilities:
  # Define your capabilities here
  vm_ip:
    description: The VM IP address
    value: { get_attribute: [my_vm, ip] }

labels:
  csys-obj-type:
    values:
      - environment

blueprint_labels:
  obj-type:
    values:
      - vsphere
```

#### 7. Create Input Definitions (if multi-file)

For complex blueprints, separate inputs:

**inputs.yaml:**

```yaml
inputs:
  vsphere_host:
    type: string
    hidden: false
    allow_update: false
    display_label: vSphere Host
    description: The vSphere server hostname or IP address.
    display:
      group: connection
      index: 0
```

#### 8. Create Capabilities (if multi-file)

**capabilities.yaml:**

```yaml
capabilities:
  vm_ip:
    description: The VM IP address
    value: { get_attribute: [my_vm, ip] }
```

### Phase 4: Validation and Testing

#### 9. Local Linting

Always lint your blueprint before uploading:

```bash
# Basic linting
dap-bpa blueprint lint --file blueprint.yaml

# Lint with zero-byte file check
dap-bpa blueprint lint --file blueprint.yaml --verify

# Lint and generate false-positive report
dap-bpa blueprint lint --file blueprint.yaml --report-fp
```

#### 10. Node Validation

Validate specific node templates:

```bash
# Validate a specific node
dap-bpa blueprint validate my_vm --file blueprint.yaml

# Validate all nodes
dap-bpa blueprint validate-all --file blueprint.yaml
```

#### 11. Create Example Configurations

Create sample deployment inputs:

**example_JSON_configs/deployment-inputs.json:**

```json
{
  "vsphere_host": "vcenter.example.com",
  "vsphere_port": 443,
  "vsphere_username": "administrator@vsphere.local",
  "vsphere_secret": "vsphere_password_secret",
  "vm_name": "my-vm",
  "template_name": "Ubuntu-Template",
  "vm_cpus": 2,
  "vm_memory": 4096,
  "vm_disk_size": 60
}
```

#### 12. Create Documentation

**README.md:**

```markdown
# My Blueprint

## Overview
Description of what this blueprint deploys.

## Prerequisites
- vSphere 6.0+
- Appropriate templates
- Network configuration

## Usage
```bash
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-blueprint --revision 1.0.0
dap-bpa orchestrator deployments create --blueprint-id my-blueprint --inputs example_JSON_configs/deployment-inputs.json
```

## Parameters

Document all input parameters and their purposes.

```bash

#### 13. Create Changelog

**CHANGELOG.yaml:**

```yaml
1.0.0:
  - ticket: INITIAL
    developer: Your Name
    description: Initial blueprint creation
```

### Phase 5: Deployment

#### 14. Upload Blueprint

```bash
# Upload to orchestrator
dap-bpa orchestrator blueprints upload \
  --file blueprint.yaml \
  --id my-blueprint \
  --revision 1.0.0

# Check upload status
dap-bpa orchestrator blueprints get my-blueprint
```

#### 15. Create Deployment

```bash
# Create deployment with inputs
dap-bpa orchestrator deployments create \
  --blueprint-id my-blueprint \
  --deployment-id my-deployment \
  --display-name "My Deployment" \
  --inputs example_JSON_configs/deployment-inputs.json

# List deployments
dap-bpa orchestrator deployments list
```

#### 16. Execute Installation

```bash
# Start install workflow
dap-bpa orchestrator executions start --deployment-id <deployment_id> --workflow-id install

# Monitor execution
dap-bpa orchestrator executions get <execution_id>

# View events
dap-bpa orchestrator events get <execution_id>
```

### Phase 6: Monitoring and Troubleshooting

#### 17. Monitor Deployment

```bash
# Check deployment status
dap-bpa orchestrator deployments get <deployment_id>

# List executions
dap-bpa orchestrator executions list

# Stream events
dap-bpa orchestrator events get <execution_id>
```

#### 18. Troubleshoot Issues

```bash
# Re-lint blueprint if upload fails
dap-bpa blueprint lint --file blueprint.yaml --verify

# Check orchestrator connection
dap-bpa status

# Verify plugin availability
dap-bpa orchestrator plugins list
```

## Best Practices

### Blueprint Structure

- Use clear, descriptive names for node templates
- Group related inputs using input_groups
- Use dsl_definitions for reusable values
- Separate complex blueprints into multiple files

### Input Management

- Always provide default values where appropriate
- Use display groups for better UX
- Include helpful descriptions for all inputs
- Use proper constraints for validation

### Documentation

- Maintain comprehensive README files
- Keep CHANGELOG.yaml updated
- Document all parameters and their purposes
- Include troubleshooting guides

### Validation

- Always lint before uploading
- Validate node templates individually
- Test with example configurations
- Use monitor for end-to-end testing

## Advanced Features

### Multi-File Blueprints

For complex blueprints, use imports to organize:

**blueprint.yaml:**

```yaml
imports:
  - dell/types/types.yaml
  - plugin:vsphere-plugin?version= >=3.0.7.0,<4.0.0.0
  - inputs.yaml
  - capabilities.yaml
  - infrastructure/vsphere/definitions.yaml
```

### Intrinsic Functions

Use TOSCA intrinsic functions for dynamic values:

```yaml
# Get input values
{ get_input: parameter_name }

# Get secrets
{ get_secret: secret_name }

# Get attributes from nodes
{ get_attribute: [node_name, attribute] }

# Concatenate strings
{ concat: ["prefix-", { get_input: name }] }
```

### Relationships

Define relationships between nodes:

```yaml
node_templates:
  database:
    type: dell.nodes.Database
    properties:
      # ... database properties

  application:
    type: dell.nodes.ApplicationServer
    relationships:
      - target: database
        type: dell.relationships.depends_on
```

## Next Steps

After completing your blueprint:

1. Test thoroughly with monitor: `dap-bpa monitor --file blueprint.yaml`
2. Document usage and troubleshooting
3. Share with team for review
4. Add to knowledge base: `dap-bpa knowledge blueprints add my-blueprint`
5. Proceed to Section 8: Blueprint Monitoring
