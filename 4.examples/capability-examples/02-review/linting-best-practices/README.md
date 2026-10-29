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
dap-bpa blueprint lint --file blueprint.yaml --verify --schema
```

The lint rules run with or without flags. `--verify` adds a check that sibling YAML files in a multi-file blueprint are not zero-byte or corrupt, and `--schema` (below) adds plugin schema validation. Use both for production blueprints.

### Schema Validation

```bash
dap-bpa blueprint lint --file blueprint.yaml --schema
```

The `--schema` flag validates node templates against the plugin schemas in the local knowledge base and aggregates every schema failure in a single run, so upload-time schema errors surface locally instead of one at a time from the orchestrator.

### Machine-Readable Output

By default `blueprint lint` prints grouped, human-readable diagnostics. Use `--json` (or `--output json`) to get the LSP-shaped JSON payload:

```bash
dap-bpa blueprint lint --file blueprint.yaml --json
dap-bpa blueprint lint --file blueprint.yaml --output json
```

### Interpret Output

The examples below are real `dap-bpa blueprint lint` v0.32.0 output.

**Success**:

```text
✓ Verify passed: 1 YAML file(s) checked, no corruption found.
✅ No issues found
```

**With findings** (an input without a description, an input outside every input group, a `create` without a `delete`, and no changelog):

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

How to read it:

- Each finding shows its line, a **check name** in brackets (for example `[changelog-missing]`), and a message. The check names are the linter's own identifiers; some messages also cite the `blueprint-rules.md` rule ID, such as `(BS-009)`. The rule sections below map common findings to their rule IDs.
- Severity is shown by the icon: ❌ error, ⚠️ warning, ℹ️ info/hint. Fix every error. Review warnings and info items; most correspond to Mandatory rules even when the linter reports them at a lower severity (a missing `delete` is reported as info, but ND-003 is Mandatory).

**JSON output** (`--json`) has a top-level `errorsFound` boolean and one LSP-style diagnostic per finding, with `severity` 1 (error), 2 (warning), or 3 (info) and the check name in `code`:

```json
{
  "errorsFound": true,
  "diagnostics": [
    {
      "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 1 } },
      "message": "Blueprint is missing a CHANGELOG.md file. Every blueprint must include one (BS-009).",
      "severity": 1,
      "code": "changelog-missing",
      "source": "ai-bp-linter-core"
    }
  ],
  "fileDiagnostics": [ ... ]
}
```

A clean run returns `{ "errorsFound": false, "diagnostics": [], "fileDiagnostics": [] }`.

> **Exit codes:** `dap-bpa blueprint lint` exits `0` even when it reports errors. It exits non-zero only when it cannot run (for example, the file does not exist). In scripts and CI, check `errorsFound` in the `--json` output rather than the exit code.

## Mandatory Rules (blueprint-rules.md)

The rule IDs below match `blueprint-rules.md` v1.4, which dap-bpa installs at `~/.blueprint-assist/rules/blueprint-rules.md`. That file is the full, authoritative list; this page covers the rules that trip up new blueprints most often.

### DSL and Prefix Rules

#### TD-002: Use dell.* Prefix

**Rule**: All type references, plugin names, and interface names use `dell.*` branding, not `cloudify.*` or `nativeedge.*`

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

**Note**: Plugin namespaces under `dell.*` are compliant even when they contain `nativeedge`, for example the edge plugin's `dell.nodes.nativeedge.template.NativeEdgeVM`.

### Blueprint Structure Rules

#### BS-009: CHANGELOG.md is Mandatory

**Rule**: Every blueprint must include a changelog. Name it `CHANGELOG.md`: `dap-bpa blueprint lint` checks for that file name, even though the rule text in `blueprint-rules.md` says `CHANGELOG.yaml`. The content uses a YAML layout.

**Wrong**: Missing CHANGELOG.md file

**Correct**:

```yaml
# CHANGELOG.md
1.0.0:
  - ticket: INITIAL
    developer: Your Name
    description: Initial release with VM provisioning on vSphere
```

#### BS-010: Use Multi-File Structure

**Rule**: Blueprints must be split into multiple YAML files when they have 2+ plugins or 5+ inputs. A single file is acceptable only with one plugin, at most two node templates, and fewer than five inputs. When in doubt, split.

**Wrong**: Single-file blueprint with everything in blueprint.yaml

**Correct**:

```text
my-blueprint/
├── blueprint.yaml      # Main file: imports, description, node_templates
├── inputs.yaml         # Input definitions
├── capabilities.yaml   # Output definitions (capabilities)
└── CHANGELOG.md      # Version tracking
```

### Input Rules

#### IN-004: Every Input Must Have a Description

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

#### IN-003: Every Input Must Have a display_label

**Rule**: Every input requires a human-readable `display_label` in Title Case with no underscores

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
    display_label: VM Name  # Required (Title Case, no underscores)
    description: Name for the virtual machine
    default: my-vm
```

#### IG-002: Every Visible Input Must Belong to a Defined Input Group

**Rule**: Every non-hidden input must belong to a group in `input_groups`, referenced by its exact input name, and the group in its `display.group` must exist. IN-009 also requires `display.group` and `display.index` on every non-hidden input.

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

#### CP-001 and CP-002: Expose Capabilities, Each With a Description

**Rule**: Output all relevant deployment information as capabilities (CP-001), using the `capabilities:` section rather than legacy `outputs:`. Every capability must have a `description` (CP-002).

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

#### ND-003: Uninstall Reverts Install

**Rule**: The `uninstall` lifecycle must revert every relevant install action. In practice, if you define `create`, you must define `delete`, and if you define `start`, you must define `stop`.

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

#### ND-004: Lifecycle Operations Must Be Idempotent

**Rule**: Every lifecycle operation, including updates, must be safe to retry without causing a state change. Track state in runtime properties or by querying the external system.

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

#### ND-009: Implement Update Workflow Operations (Optional)

**Rule**: Nodes should implement lifecycle operations for the `update` workflow. This is an Optional rule; for full update support it recommends `check_drift`, `preupdate`, `update`, `postupdate`, `update_config`, `update_apply`, `update_postapply`, `preheal`, `heal`, and `postheal`. At minimum, pair `update` with `check_drift` and `postupdate`.

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

#### SC-001: Pass Secret Names, Resolve With get_secret

**Rule**: Never pass sensitive values directly as inputs, and never pass a literal string to `get_secret`. Pass the secret name as an input and resolve it with `{ get_secret: { get_input: input_name } }`.

**Wrong**:

```yaml
credential: { get_secret: "hardcoded_secret_key" }
```

**Correct**:

```yaml
credential: { get_secret: { get_input: secret_name } }
```

#### SC-002: Use type: secret_key With a Secret Schema

**Rule**: Secret inputs must use `type: secret_key` and include a `constraints: - type: <secret_schema>` entry naming the secret schema (run `dap-bpa knowledge secret-type list` for the options)

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
    description: Name of the secret containing the API key
    constraints:
      - type: <secret_schema>  # a schema from `dap-bpa knowledge secret-type list`
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

# 4. Repeat until the summary shows 0 error(s)
```

### Scenario 2: Legacy Blueprint Migration

**Problem**: Migrating from Cloudify/Dell Distributed Private Cloud shows many prefix errors

**Solution**: Systematically replace prefixes:

- `cloudify.nodes.*` → `dell.nodes.*`
- `cloudify.relationships.*` → `dell.relationships.*`
- `nativeedge.nodes.*` → `dell.nodes.*`

### Scenario 3: Input Validation Errors

**Problem**: Linting shows multiple input rule violations

**Solution**: Use input checklist:

- [ ] All inputs have a type (IN-001)
- [ ] All inputs have Title Case display_labels (IN-003)
- [ ] All inputs have descriptions (IN-004)
- [ ] All inputs set `hidden` explicitly (IN-005)
- [ ] Inputs have constraints, each with an error_message (IN-007, IN-008)
- [ ] All visible inputs have display.group and display.index, in a defined input group (IN-009, IG-002)
- [ ] Secret inputs use type: secret_key with a secret schema constraint (SC-002)

### Scenario 4: Lifecycle Completeness

**Problem**: Nodes have incomplete lifecycle operations

**Solution**: Ensure completeness:

- `create` ↔ `delete` (both required)
- `start` ↔ `stop` (both required if one is defined)
- `configure` has no matching `unconfigure` operation, so revert its changes in `stop` or `delete`

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

# Show human-readable findings in the log
dap-bpa blueprint lint --file "$BLUEPRINT_FILE" --verify --schema

# lint exits 0 even when it finds errors, so gate on errorsFound instead.
# A run that fails outright (e.g. missing file) prints no errorsFound and also fails.
ERRORS_FOUND=$(dap-bpa blueprint lint --file "$BLUEPRINT_FILE" --verify --schema --json | jq -r '.errorsFound')

if [ "$ERRORS_FOUND" != "false" ]; then
  echo "❌ Blueprint linting failed"
  exit 1
fi

echo "✅ Blueprint linting passed"
exit 0
```

The script uses [`jq`](https://jqlang.org/) to read `errorsFound`.

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
          status=0
          for blueprint in $(find . -name "blueprint.yaml"); do
            echo "Linting $blueprint"
            dap-bpa blueprint lint --file "$blueprint" --verify --schema
            # lint exits 0 even with errors; fail the job on errorsFound instead
            found=$(dap-bpa blueprint lint --file "$blueprint" --verify --schema --json | jq -r '.errorsFound')
            [ "$found" = "false" ] || status=1
          done
          exit $status
```

## Best Practices

1. **Always lint before deployment**: Never skip linting
2. **Use --verify and --schema**: Adds file-corruption and plugin schema checks to the lint rules
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
