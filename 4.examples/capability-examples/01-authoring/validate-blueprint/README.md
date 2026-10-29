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

The lint rules always run. `--verify` adds a check that sibling YAML files are not zero-byte or corrupt.

### Interpret Linter Output

The examples below are real `dap-bpa blueprint lint` v0.32.0 output.

**Success Output**:

```text
✓ Verify passed: 1 YAML file(s) checked, no corruption found.
✅ No issues found
```

**Output With Findings**:

```text
✓ Verify passed: 1 YAML file(s) checked, no corruption found.
/path/to/my-blueprint/blueprint.yaml:
  ⚠️  Line 10: [input-missing-description] Input "vm_name" is missing a description.
  ⚠️  Line 23: [input-missing-display-group] Input "vm_size" is missing "display.group". Add a display object with group for proper UI placement.
  ℹ️  Line 23: [input-missing-display-group] Input "vm_size" is missing "display.index". Add a display object with index for proper UI ordering.
  ⚠️  Line 23: [input-group-all-inputs-covered] Input "vm_size" is not included in any input group. Add it to an input_groups entry for better UI organisation.
  ℹ️  Line 46: [node-missing-lifecycle] Node "vm" has create but no delete operation. Add a delete operation for proper cleanup.
  ❌ Line 1: [changelog-missing] Blueprint is missing a CHANGELOG.md file. Every blueprint must include one (BS-009).

Severity legend: ❌ error   ⚠️  warning   ℹ️  info/hint
1 error(s), 3 warning(s), 2 info/hint(s)
```

Each finding shows its line, the linter's check name in brackets, and a message; some messages also cite the `blueprint-rules.md` rule ID. Severity is shown by the icon. Use `--json` for a machine-readable report with a top-level `errorsFound` boolean. The linter exits `0` even when it reports errors, so scripts must check `errorsFound` rather than the exit code (see [Integration with CI/CD](#integration-with-cicd)).

The sections below map common findings to their `blueprint-rules.md` rule IDs:

| Check name in lint output | Rule |
| --- | --- |
| `changelog-missing` | BS-009 |
| `input-missing-description` | IN-004 |
| `input-missing-display-group` | IN-009 |
| `input-group-all-inputs-covered` | IG-002 |
| `input-missing-allow-update` | IN-006 |
| `input-missing-constraints` | IN-007 |
| `node-missing-lifecycle` | ND-003 |
| `node-orphan-no-relationships` | ND-001 |
| `no-capabilities-defined` | CP-001 |

### Common Linting Errors and Fixes

#### BS-009: CHANGELOG.md is mandatory

**Error**: Missing CHANGELOG.md file

**Fix**:

```bash
# Create CHANGELOG.md
cat > CHANGELOG.md << 'EOF'
1.0.0:
  - ticket: INITIAL
    developer: Your Name
    description: Initial release
EOF
```

#### BS-010: Use multi-file structure

**Error**: Single-file blueprint with 2+ plugins or 5+ inputs (a single file is only acceptable with one plugin, at most two node templates, and fewer than five inputs)

**Fix**: Split into multiple files:

```bash
# Create separate files
touch inputs.yaml capabilities.yaml CHANGELOG.md

# Move content from blueprint.yaml to appropriate files
# - inputs: → inputs.yaml
# - capabilities: → capabilities.yaml
# - Keep only tosca_definitions_version, imports, description, node_templates in blueprint.yaml
```

#### CP-001 and CP-002: Use capabilities, each with a description

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

#### IN-004: Every input must have a description

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

#### IN-003: Every input must have a display_label

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
    display_label: VM Name  # Required (Title Case, no underscores)
    description: Name for the virtual machine
    default: my-vm
```

#### IG-002: Visible inputs must belong to a defined input group

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

#### ND-003: Uninstall must revert install

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

#### SC-002: Use type: secret_key with a secret schema

**Error**: Using string type for secrets, or a `secret_key` input without a secret schema constraint

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
    description: Name of the secret containing the API key
    constraints:
      - type: <secret_schema>  # a schema from `dap-bpa knowledge secret-type list`
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

# 4. Repeat until the summary shows 0 error(s)
```

### Handling Warnings

Warnings don't prevent deployment but should be reviewed:

```bash
# Lint with warnings
dap-bpa blueprint lint --file blueprint.yaml --verify
# Summary line: 0 error(s), 2 warning(s), 0 info/hint(s)

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

To check a single node template, use `dap-bpa blueprint validate <node-template-name> --file blueprint.yaml`. `validate` requires the node name; `validate-all` checks every node.

### Interpret Schema Validation Output

`validate-all` prints a result per node template (`✓` valid, with any warnings beneath it), then a summary. This is real v0.32.0 output for a node with an unknown property, which is reported as a warning:

```text
✓ vm:
  ⚠️  Property 'bogus_property' is not defined in node type
     Path: vm.properties.bogus_property

============================================================
Summary: 1 valid, 0 invalid
Total errors: 0, Total warnings: 1
```

Validation passes when the summary shows `0 invalid` and `Total errors: 0`. Invalid nodes are counted in `invalid`, with their errors listed under the node. Type and required-property checks need the plugin source: pass `--search-path <plugins-path>` if `validate-all` reports that it could not determine the plugin. `--json` adds a per-node result object (`valid`, `errors`, `warnings`) after the text summary.

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

# If the summary shows any error(s), fix them and re-lint
# Repeat until it shows 0 error(s)

# 2. Review warnings (if any)
# Decide whether to fix or ignore

# 3. Stage 2: Schema validate
dap-bpa blueprint validate-all --file blueprint.yaml

# If the summary shows any invalid nodes or errors, fix them and re-validate
# Repeat until it shows 0 invalid and Total errors: 0

# 4. Blueprint is ready for upload
```

## Pre-Upload Validation Checklist

Before uploading to orchestrator, ensure:

- [ ] Lint passes: `0 error(s)` (or `"errorsFound": false` with `--json`)
- [ ] Schema validation passes: `0 invalid`, `Total errors: 0`
- [ ] CHANGELOG.md present (BS-009)
- [ ] Multi-file structure (BS-010)
- [ ] Using `dell.*` prefix (TD-002)
- [ ] Using `capabilities:` not `outputs:` (CP-001)
- [ ] All inputs have descriptions (IN-004)
- [ ] All inputs have Title Case display_labels (IN-003)
- [ ] Visible inputs belong to defined input groups (IN-009, IG-002)
- [ ] Secrets use `type: secret_key` with a secret schema constraint (SC-002)
- [ ] No literal secrets in `get_secret` (SC-001)
- [ ] Lifecycle operations complete (ND-003)

## Integration with CI/CD

Add validation to your CI/CD pipeline:

```bash
#!/bin/bash
# validate-blueprint.sh

echo "Validating blueprint..."

# Stage 1: Lint
# lint exits 0 even when it finds errors, so gate on errorsFound from --json
echo "Stage 1: Linting..."
dap-bpa blueprint lint --file blueprint.yaml --verify
ERRORS_FOUND=$(dap-bpa blueprint lint --file blueprint.yaml --verify --json | jq -r '.errorsFound')
if [ "$ERRORS_FOUND" != "false" ]; then
  echo "Linting failed"
  exit 1
fi

# Stage 2: Schema validate
# Gate on the summary line rather than the exit code
echo "Stage 2: Schema validation..."
VALIDATE_OUTPUT=$(dap-bpa blueprint validate-all --file blueprint.yaml)
echo "$VALIDATE_OUTPUT"
if ! echo "$VALIDATE_OUTPUT" | grep -q "Total errors: 0,"; then
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
