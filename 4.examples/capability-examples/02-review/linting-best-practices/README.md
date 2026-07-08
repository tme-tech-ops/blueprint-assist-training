# Linting & Best Practices

This example demonstrates comprehensive blueprint linting using blueprint-rules.md to ensure compliance with mandatory best practices.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap` (with blueprint-rules.md)

## Learning Objectives

By the end of this example, you will be able to:

- Run comprehensive blueprint linting
- Interpret linting errors and warnings
- Fix common blueprint rule violations
- Understand blueprint-rules.md mandatory requirements
- Ensure blueprints follow best practices before deployment

## Prerequisites

- Blueprint to lint
- dap-bpa CLI installed and configured
- Understanding of blueprint structure

## What is Blueprint Linting?

Blueprint linting validates blueprints against `blueprint-rules.md`, which contains mandatory best practices and standards for Blueprint Assist blueprints. Linting catches:

- DSL version compliance issues
- Structure violations (single-file vs multi-file)
- Input definition problems
- Secret handling violations
- Lifecycle operation incompleteness
- Documentation requirements

## Running the Linter

### Basic Linting

```bash
dap-bpa blueprint lint --file blueprint.yaml
```

### Comprehensive Linting (Recommended)

```bash
dap-bpa blueprint lint --file blueprint.yaml --verify
```

The `--verify` flag enables comprehensive checking of all rules. Always use this flag for production blueprints.

### Interpret Output

**Success**:

```text
errorsFound: false
warningsFound: 0
```

**With Errors**:

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

## Mandatory Rules (blueprint-rules.md)

### DSL and Prefix Rules

#### TD-002: Use dell.* Prefix

**Rule**: Use `dell.*` prefix, not `cloudify.*` or `nativeedge.*`

**Wrong**:

```yaml
node_templates:
  vm:
    type: cloudify.nodes.vsphere.Server
```

**Correct**:

```yaml
node_templates:
  vm:
    type: dell.nodes.vsphere.Server
```

**Exception**: NativeEdge plugin still uses `nativeedge.*` prefix

### Blueprint Structure Rules

#### BS-009: CHANGELOG.yaml is Mandatory

**Rule**: Every blueprint must include CHANGELOG.yaml

**Wrong**: Missing CHANGELOG.yaml file

**Correct**:

```yaml
# CHANGELOG.yaml
changelog:
  - version: 1.0.0
    date: 2026-06-02
    changes:
      - "Initial release"
      - "VM provisioning on vSphere"
```

#### BS-010: Always Use Multi-File Structure

**Rule**: Blueprints must use multi-file structure

**Wrong**: Single-file blueprint with everything in blueprint.yaml

**Correct**:

```text
my-blueprint/
├── blueprint.yaml      # Main file: imports, description, node_templates
├── inputs.yaml         # Input definitions
├── capabilities.yaml   # Output definitions (capabilities)
└── CHANGELOG.yaml      # Version tracking
```

### Input Rules

#### IN-001: Every Input Must Have a Description

**Rule**: All inputs require a description field

**Wrong**:

```yaml
inputs:
  vm_name:
    type: string
    default: my-vm
```

**Correct**:

```yaml
inputs:
  vm_name:
    type: string
    description: Name for the virtual machine  # Required
    default: my-vm
```

#### IN-004: Every Non-Hidden Input Must Have display_label

**Rule**: Non-hidden inputs require a display_label

**Wrong**:

```yaml
inputs:
  vm_name:
    type: string
    description: Name for the virtual machine
    default: my-vm
```

**Correct**:

```yaml
inputs:
  vm_name:
    type: string
    display_label: VM Name  # Required for non-hidden inputs
    description: Name for the virtual machine
    default: my-vm
```

#### IN-007: Input Groups Must Match Input Names Exactly

**Rule**: input_groups must reference exact input names

**Wrong**:

```yaml
input_groups:
  vm_settings:
    inputs:
      - vm_nam  # Typo - should be vm_name
```

**Correct**:

```yaml
input_groups:
  vm_settings:
    inputs:
      - vm_name  # Must match exact input name
```

### Capability Rules

#### CP-001: Use capabilities, Not outputs

**Rule**: Use `capabilities:` section, not legacy `outputs:`

**Wrong**:

```yaml
outputs:
  vm_ip:
    value: { get_attribute: [ vm, ip ] }
```

**Correct**:

```yaml
capabilities:
  vm_ip:
    description: IP address assigned to the VM
    value: { get_attribute: [ vm, ip ] }
```

### Node Rules

#### ND-003: Lifecycle Completeness

**Rule**: If you define `create`, you must define `delete`. If you define `start`, you must define `stop`.

**Wrong**:

```yaml
node_templates:
  vm:
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: scripts/create.py
        # Missing delete
```

**Correct**:

```yaml
node_templates:
  vm:
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: scripts/create.py
        delete:
          implementation: scripts/delete.py
```

#### ND-004: Update Operations Must Be Idempotent

**Rule**: Update operations must be safe to retry without causing duplicate changes

**Wrong**: Update operation that doesn't check current state before applying changes

**Correct**: Update operation that checks current state and only applies if needed

#### ND-005: No Inline Code

**Rule**: Don't inline Python code in YAML - use separate script files

**Wrong**:

```yaml
interfaces:
  dell.interfaces.lifecycle:
    create:
      implementation: python
      inputs:
        script: |
          print("inline code")  # Don't do this
```

**Correct**:

```yaml
interfaces:
  dell.interfaces.lifecycle:
    create:
      implementation: scripts/create.py  # Use separate file
```

#### ND-009: Update Workflow Requires check_drift

**Rule**: Blueprints with `update` support must include `check_drift` before `update` and `postupdate`

**Wrong**:

```yaml
interfaces:
  dell.interfaces.lifecycle:
    update:
      implementation: scripts/update.py
    # Missing check_drift and postupdate
```

**Correct**:

```yaml
interfaces:
  dell.interfaces.lifecycle:
    check_drift:
      implementation: scripts/check_drift.py
    update:
      implementation: scripts/update.py
    postupdate:
      implementation: scripts/verify_vm.py
```

### Secret Rules

#### SC-001: Never Pass Literal Strings to get_secret

**Rule**: Never pass literal strings to get_secret - always resolve via input

**Wrong**:

```yaml
credential: { get_secret: "hardcoded_secret_key" }
```

**Correct**:

```yaml
credential: { get_secret: { get_input: secret_name } }
```

#### SC-002: Use type: secret_key for Secrets

**Rule**: Use `type: secret_key` for secret inputs

**Wrong**:

```yaml
inputs:
  api_key:
    type: string
    description: API key
```

**Correct**:

```yaml
inputs:
  api_key:
    type: secret_key  # Use secret_key type
    description: Secret key containing API key
    constraints:
      - secret_type: api_key
```

## Common Linting Scenarios

### Scenario 1: New Blueprint First Lint

**Problem**: First-time linting of a new blueprint shows multiple errors

**Solution**: Fix errors iteratively:

```bash
# 1. Run lint
dap-bpa blueprint lint --file blueprint.yaml --verify

# 2. Fix first error
# (edit file)

# 3. Re-run lint
dap-bpa blueprint lint --file blueprint.yaml --verify

# 4. Repeat until errorsFound: false
```

### Scenario 2: Legacy Blueprint Migration

**Problem**: Migrating from Cloudify/NativeEdge shows many prefix errors

**Solution**: Systematically replace prefixes:

- `cloudify.nodes.*` → `dell.nodes.*`
- `cloudify.relationships.*` → `dell.relationships.*`
- `nativeedge.nodes.*` → `dell.nodes.*` (except NativeEdge plugin)

### Scenario 3: Input Validation Errors

**Problem**: Linting shows multiple input rule violations

**Solution**: Use input checklist:

- [ ] All inputs have descriptions (IN-001)
- [ ] All non-hidden inputs have display_labels (IN-004)
- [ ] All inputs are in input_groups (IN-007)
- [ ] Secret inputs use type: secret_key (SC-002)

### Scenario 4: Lifecycle Completeness

**Problem**: Nodes have incomplete lifecycle operations

**Solution**: Ensure completeness:

- `create` ↔ `delete` (both required)
- `start` ↔ `stop` (both required if one is defined)
- `configure` ↔ `unconfigure` (both required if one is defined)

## Linting in CI/CD

### Automated Linting Script

```bash
#!/bin/bash
# lint-blueprint.sh

BLUEPRINT_FILE=$1

if [ -z "$BLUEPRINT_FILE" ]; then
  echo "Usage: $0 <blueprint.yaml>"
  exit 1
fi

echo "Linting blueprint: $BLUEPRINT_FILE"

# Run comprehensive lint
dap-bpa blueprint lint --file "$BLUEPRINT_FILE" --verify

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Blueprint linting failed"
  exit 1
fi

echo "✅ Blueprint linting passed"
exit 0
```

### GitHub Actions Example

```yaml
name: Blueprint Linting

on:
  push:
    paths:
      - '**/blueprint.yaml'
  pull_request:
    paths:
      - '**/blueprint.yaml'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install BPA
        # Obtain the dap-bpa Linux binary from Dell Automation Studio: https://automation.dell.com/catalog
        # and place it at /usr/local/bin/dap-bpa before running this workflow.
        run: |
          chmod +x bpa-linux-amd64
          sudo mv bpa-linux-amd64 /usr/local/bin/bpa
      
      - name: Lint Blueprint
        run: |
          for blueprint in $(find . -name "blueprint.yaml"); do
            echo "Linting $blueprint"
            dap-bpa blueprint lint --file "$blueprint" --verify
          done
```

## Best Practices

1. **Always lint before deployment**: Never skip linting
2. **Use --verify flag**: Enables comprehensive checking
3. **Fix errors iteratively**: Don't try to fix everything at once
4. **Review warnings**: Even if deployment would succeed
5. **Lint in CI/CD**: Automate linting in your pipeline
6. **Keep blueprint-rules.md updated**: Ensure it reflects current standards
7. **Document rule waivers**: If you must ignore a rule, document why
8. **Educate team members**: Share linting knowledge across team

## Troubleshooting

### Linter Won't Run

**Problem**: `dap-bpa blueprint lint` command not found

**Solution**: Ensure dap-bpa CLI is installed and in PATH

### Linter Hangs

**Problem**: Linter appears to hang or take very long

**Solution**:

- Check blueprint file size (very large files may take time)
- Verify file permissions
- Check for circular references in imports

### False Positives

**Problem**: Linter reports errors that don't seem valid

**Solution**:

- Verify you're using the latest dap-bpa version
- Check if blueprint-rules.md is up to date
- Report potential rule issues to maintainers

## Related Capabilities

- **Validate Blueprint** - Schema validation after linting
- **Edit Existing Blueprint** - Fix linting errors

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 007: Building Blueprints - Blueprint creation and validation
- Section 013: dap-bpa CLI Commands - Complete CLI reference
