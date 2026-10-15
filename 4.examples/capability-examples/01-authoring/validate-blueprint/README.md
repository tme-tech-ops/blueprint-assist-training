# Validate Blueprint

This example demonstrates the two-stage blueprint validation process: linting against blueprint-rules.md and schema validation against plugin schemas.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap`

## Learning Objectives

By the end of this example, you will be able to:

- Run comprehensive blueprint linting
- Interpret linting errors and warnings
- Fix common blueprint rule violations
- Validate blueprints against plugin schemas
- Ensure blueprints are production-ready

## Prerequisites

- A blueprint to validate (use the one from create-new-blueprint example)
- dap-bpa CLI installed and configured
- Understanding of blueprint-rules.md requirements

## Two-Stage Validation Process

Blueprint validation uses a two-stage process:

1. **Stage 1: Lint** - Validates against blueprint-rules.md (mandatory best practices)
2. **Stage 2: Schema Validate** - Validates node properties against plugin schemas

**Important**: Always run linting first. Do not run schema validation until linting passes.

## Stage 1: Blueprint Linting

### Run the Linter

```bash
dap-bpa blueprint lint --file blueprint.yaml --verify
```

The `--verify` flag enables comprehensive checking of all rules.

### Interpret Linter Output

**Success Output**:

```text
errorsFound: false
warningsFound: 0
```

**Error Output**:

```text
errorsFound: true
errors:
  - code: BS-009
    message: CHANGELOG.yaml is mandatory
    file: blueprint.yaml
    line: 1
  - code: IN-001
    message: Input 'vm_name' is missing description
    file: inputs.yaml
    line: 5
warningsFound: 2
warnings:
  - code: IN-007
    message: Input 'vm_size' not found in any input group
    file: inputs.yaml
    line: 10
  - code: ND-003
    message: Node 'vm' has 'create' but missing 'delete'
    file: blueprint.yaml
    line: 15
```

### Common Linting Errors and Fixes

#### BS-009: CHANGELOG.yaml is mandatory

**Error**: Missing CHANGELOG.yaml file

**Fix**:

```bash
# Create CHANGELOG.yaml
cat > CHANGELOG.yaml << 'EOF'
changelog:
  - version: 1.0.0
    date: 2026-06-02
    changes:
      - "Initial release"
EOF
```

#### BS-010: Always use multi-file structure

**Error**: Single-file blueprint detected

**Fix**: Split into multiple files:

```bash
# Create separate files
touch inputs.yaml capabilities.yaml CHANGELOG.yaml

# Move content from blueprint.yaml to appropriate files
# - inputs: → inputs.yaml
# - capabilities: → capabilities.yaml
# - Keep only tosca_definitions_version, imports, description, node_templates in blueprint.yaml
```

#### CP-001: Use capabilities, not outputs

**Error**: Using legacy `outputs:` section

**Fix**:

```yaml
# Wrong (legacy):
outputs:
  vm_ip:
    value: { get_attribute: [ vm, ip ] }

# Correct:
capabilities:
  vm_ip:
    description: IP address of the VM
    value: { get_attribute: [ vm, ip ] }
```

#### IN-001: Every input must have a description

**Error**: Input missing description field

**Fix**:

```yaml
# Wrong:
inputs:
  vm_name:
    type: string
    default: my-vm

# Correct:
inputs:
  vm_name:
    type: string
    description: Name for the virtual machine  # Required
    default: my-vm
```

#### IN-004: Every non-hidden input must have a display_label

**Error**: Input missing display_label

**Fix**:

```yaml
# Wrong:
inputs:
  vm_name:
    type: string
    description: Name for the virtual machine
    default: my-vm

# Correct:
inputs:
  vm_name:
    type: string
    display_label: VM Name  # Required for non-hidden inputs
    description: Name for the virtual machine
    default: my-vm
```

#### IN-007: Input groups must match input names exactly

**Error**: Input name mismatch in input_groups

**Fix**:

```yaml
# Wrong (typo in group):
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

#### TD-002: Use dell.* prefix

**Error**: Using legacy `cloudify.*` or `nativeedge.*` prefixes

**Fix**:

```yaml
# Wrong (legacy):
node_templates:
  vm:
    type: cloudify.nodes.vsphere.Server

# Correct:
node_templates:
  vm:
    type: dell.nodes.vsphere.Server
```

#### ND-003: Lifecycle completeness

**Error**: Incomplete lifecycle operations

**Fix**:

```yaml
# Wrong (missing delete):
node_templates:
  vm:
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: scripts/create.py

# Correct (complete lifecycle):
node_templates:
  vm:
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: scripts/create.py
        delete:
          implementation: scripts/delete.py
```

#### SC-001: Never pass literal strings to get_secret

**Error**: Hardcoded secret key

**Fix**:

```yaml
# Wrong (literal string):
credential: { get_secret: "hardcoded_secret_key" }

# Correct (resolve via input):
credential: { get_secret: { get_input: secret_name } }
```

#### SC-002: Use type: secret_key for secrets

**Error**: Using string type for secrets

**Fix**:

```yaml
# Wrong:
inputs:
  api_key:
    type: string
    description: API key

# Correct:
inputs:
  api_key:
    type: secret_key  # Use secret_key type
    description: Secret key containing API key
    constraints:
      - secret_type: api_key
```

### Fixing Errors Iteratively

When you have multiple errors, fix them iteratively:

```bash
# 1. Run lint
dap-bpa blueprint lint --file blueprint.yaml --verify

# 2. Fix first error
# (edit file)

# 3. Re-run lint
dap-bpa blueprint lint --file blueprint.yaml --verify

# 4. Repeat until errorsFound: false
```

### Handling Warnings

Warnings don't prevent deployment but should be reviewed:

```bash
# Lint with warnings
dap-bpa blueprint lint --file blueprint.yaml --verify
# Output: errorsFound: false, warningsFound: 2

# Review warnings and decide:
# - Fix if it's a real issue
# - Ignore if you have a clear technical reason
# - Document why you're ignoring
```

## Stage 2: Schema Validation

After linting passes, validate against plugin schemas:

### Run Schema Validation

```bash
dap-bpa blueprint validate-all --file blueprint.yaml
```

### Interpret Schema Validation Output

**Success Output**:

```text
validationPassed: true
validationErrors: []
```

**Error Output**:

```text
validationPassed: false
validationErrors:
  - node: vm
    type: dell.nodes.vsphere.Server
    property: num_cpus
    error: Property 'num_cpus' does not exist on node type 'dell.nodes.vsphere.Server'
    expectedProperties: [cpus, memory, disk]
  - node: vm
    type: dell.nodes.vsphere.Server
    property: server
    error: Required property 'server' is missing
```

### Common Schema Errors and Fixes

#### Property Does Not Exist

**Error**: Using incorrect property name

**Fix**: Look up the correct property name:

```bash
dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server
```

Then update your blueprint:

```yaml
# Wrong:
properties:
  num_cpus: 2  # Incorrect property name

# Correct:
properties:
  cpus: 2  # Correct property name from schema
```

#### Required Property Missing

**Error**: Missing required property

**Fix**: Add the required property:

```yaml
# Wrong:
properties:
  cpus: 2
  # Missing 'server' property

# Correct:
properties:
  server: { get_input: vcenter_host }  # Add required property
  cpus: 2
```

#### Type Mismatch

**Error**: Property value has wrong type

**Fix**: Use correct type:

```yaml
# Wrong:
properties:
  cpus: "2"  # String instead of integer

# Correct:
properties:
  cpus: 2  # Integer
```

## Complete Validation Workflow

```bash
# 1. Stage 1: Lint
dap-bpa blueprint lint --file blueprint.yaml --verify

# If errorsFound: true, fix errors and re-lint
# Repeat until errorsFound: false

# 2. Review warnings (if any)
# Decide whether to fix or ignore

# 3. Stage 2: Schema validate
dap-bpa blueprint validate-all --file blueprint.yaml

# If validationPassed: false, fix schema errors and re-validate
# Repeat until validationPassed: true

# 4. Blueprint is ready for upload
```

## Pre-Upload Validation Checklist

Before uploading to orchestrator, ensure:

- [ ] Lint passes: `errorsFound: false`
- [ ] Schema validation passes: `validationPassed: true`
- [ ] CHANGELOG.yaml present (BS-009)
- [ ] Multi-file structure (BS-010)
- [ ] Using `dell.*` prefix (TD-002)
- [ ] Using `capabilities:` not `outputs:` (CP-001)
- [ ] All inputs have descriptions (IN-001)
- [ ] All non-hidden inputs have display_labels (IN-004)
- [ ] Input groups match input names (IN-007)
- [ ] Secrets use `type: secret_key` (SC-002)
- [ ] No literal secrets in `get_secret` (SC-001)
- [ ] Lifecycle operations complete (ND-003)

## Integration with CI/CD

Add validation to your CI/CD pipeline:

```bash
#!/bin/bash
# validate-blueprint.sh

echo "Validating blueprint..."

# Stage 1: Lint
echo "Stage 1: Linting..."
dap-bpa blueprint lint --file blueprint.yaml --verify
if [ $? -ne 0 ]; then
  echo "Linting failed"
  exit 1
fi

# Stage 2: Schema validate
echo "Stage 2: Schema validation..."
dap-bpa blueprint validate-all --file blueprint.yaml
if [ $? -ne 0 ]; then
  echo "Schema validation failed"
  exit 1
fi

echo "Blueprint validation passed"
exit 0
```

## Common Validation Pitfalls

1. **Skipping linting**: Always lint before schema validation
2. **Ignoring warnings**: Review warnings even if deployment would succeed
3. **Fixing multiple errors at once**: Fix iteratively to avoid confusion
4. **Not checking schema after node type changes**: Always re-validate after changing node types
5. **Assuming linting is enough**: Schema validation catches different issues

## Related Capabilities

- **Create New Blueprint** - Generate blueprints that pass validation
- **Edit Existing Blueprint** - Modify blueprints while maintaining validity
- **Generate Inputs/Outputs** - Create proper input/output structures

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 007: Building Blueprints - Blueprint creation and validation
- Section 013: dap-bpa CLI Commands - Complete CLI reference
