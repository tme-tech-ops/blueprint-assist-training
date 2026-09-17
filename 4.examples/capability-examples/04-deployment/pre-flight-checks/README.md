# Pre-flight Checks

This example demonstrates comprehensive pre-deployment validation to ensure blueprints and orchestrator are ready for deployment.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap`

## Learning Objectives

By the end of this example, you will be able to:

- Run comprehensive pre-flight validation pipeline
- Validate blueprint compliance and schema
- Verify orchestrator connectivity and authentication
- Check plugin availability and compatibility
- Validate input completeness
- Ensure deployment readiness

## Prerequisites

- Blueprint to deploy
- dap-bpa CLI installed and configured
- DAP orchestrator connection configured
- Understanding of validation stages

## Pre-flight Check Pipeline

The pre-flight check pipeline consists of 4 stages:

1. **Blueprint Validation** - Linting and schema validation
2. **Plugin Availability** - Verify required plugins are available
3. **Orchestrator Readiness** - Check connectivity and authentication
4. **Input Validation** - Verify input completeness and validity

## Stage 1: Blueprint Validation

### Step 1.1: Lint Blueprint

```bash
dap-bpa blueprint lint --file blueprint.yaml --verify
```

**Expected Result**: `errorsFound: false`

**If Errors Found**:

```bash
# Fix errors and re-lint
# (edit blueprint files)
dap-bpa blueprint lint --file blueprint.yaml --verify
# Repeat until errorsFound: false
```

### Step 1.2: Validate Schema

```bash
dap-bpa blueprint validate-all --file blueprint.yaml
```

**Expected Result**: `validationPassed: true`

**If Validation Fails**:

```bash
# Fix schema errors and re-validate
# (edit blueprint files)
dap-bpa blueprint validate-all --file blueprint.yaml
# Repeat until validationPassed: true
```

## Stage 2: Plugin Availability

### List Plugin Node Types

The knowledge base ships node-type documentation for these plugins:

```text
ansible    aws        azure      docker     edge       gcp
helm       kubernetes libvirt    openstack  redfish    serverless
storage    terraform  terragrunt utilities  vcloud     vsphere
```

Inspect the node types a given plugin provides:

```bash
dap-bpa knowledge plugins list vsphere
```

### Verify Required Plugins

Identify which plugins your blueprint uses:

```yaml
# blueprint.yaml
imports:
  - dell/types/types.yaml
  - plugin:vsphere?version= >=6.7
  - plugin:ansible?version= >=2.9
```

Check each required plugin is available:

```bash
# Check vsphere plugin
dap-bpa knowledge plugins list vsphere

# Check ansible plugin
dap-bpa knowledge plugins list ansible
```

**If Plugin Missing**:

- Contact orchestrator administrator
- Install missing plugin on orchestrator
- Use alternative plugin if available

### Verify Plugin Versions

```bash
# Get plugin documentation with version info
dap-bpa knowledge plugins docs vsphere
```

## Stage 3: Orchestrator Readiness

### Test Connectivity

```bash
# List blueprints to test connectivity
dap-bpa orchestrator blueprints list
```

**If Connection Fails**:

```text
Error: Failed to connect to orchestrator
```

**Troubleshooting**:

```bash
# Check config.json
cat ~/.blueprint-assist/config.json

# Verify orchestrator URL is correct
# Verify credentials are valid
# Check network connectivity
# Test SSL certificate if using HTTPS
```

### Verify Authentication

The connectivity test above also authenticates: every `orchestrator` call signs
in with the DAP credentials from your config, so a successful
`dap-bpa orchestrator blueprints list` confirms both reachability and valid
credentials.

**If Authentication Fails**:

```text
Error: Authentication failed
```

**Troubleshooting**:

- Verify client ID and client secret
- Check tenant ID
- Verify token hasn't expired
- Test credentials manually

### Check Resource Availability

Capacity and quota live on the target platform, not in the dap-bpa CLI. Confirm
available CPU, memory, storage, and IP ranges in the orchestrator UI or your
platform console before deploying.

## Stage 4: Input Validation

### Verify Input File Exists

```bash
# Check if input file exists
ls -la deployment-inputs.json
```

### Validate Input Structure

```bash
# Validate JSON syntax (deployments create requires JSON inputs)
python -c "import json; json.load(open('deployment-inputs.json'))"
```

### Verify Input Completeness

Compare inputs in your file with blueprint requirements:

```bash
# Get blueprint input requirements
dap-bpa knowledge blueprints get <blueprint-id> --include-files
# Review inputs section
```

**Checklist**:

- [ ] All required inputs have values
- [ ] Input values match constraint patterns
- [ ] Secret inputs reference valid secrets
- [ ] Numeric values are within allowed ranges
- [ ] Boolean values are true/false

### Check Inputs Against Blueprint Constraints

`deployments create` has no dry-run, so review your input values against the
blueprint's documented constraints first. The orchestrator enforces them at
create time and rejects out-of-range or missing values.

```bash
# Review the blueprint's input definitions and constraints
dap-bpa knowledge blueprints get <blueprint-id> --include-files
```

## Complete Pre-flight Script

```bash
#!/bin/bash
# pre-flight-check.sh

BLUEPRINT_FILE="blueprint.yaml"
INPUTS_FILE="deployment-inputs.json"
BLUEPRINT_ID="my-blueprint"

echo "=== Pre-flight Check Pipeline ==="
echo ""

# Stage 1: Blueprint Validation
echo "Stage 1: Blueprint Validation"
echo "--------------------------------"

echo "1.1: Linting blueprint..."
dap-bpa blueprint lint --file "$BLUEPRINT_FILE" --verify
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi
echo "✅ Linting passed"

echo "1.2: Validating schema..."
dap-bpa blueprint validate-all --file "$BLUEPRINT_FILE"
if [ $? -ne 0 ]; then
  echo "❌ Schema validation failed"
  exit 1
fi
echo "✅ Schema validation passed"
echo ""

# Stage 2: Plugin Availability
echo "Stage 2: Plugin Availability"
echo "--------------------------------"

echo "2.1: Listing available plugins..."
dap-bpa knowledge plugins list
echo "✅ Plugins listed"

# Extract plugins from blueprint imports
echo "2.2: Verifying required plugins..."
# (Add plugin-specific checks based on your blueprint)
echo "✅ Required plugins available"
echo ""

# Stage 3: Orchestrator Readiness
echo "Stage 3: Orchestrator Readiness"
echo "--------------------------------"

echo "3.1: Testing connectivity..."
dap-bpa orchestrator blueprints list > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Orchestrator connectivity failed"
  exit 1
fi
echo "✅ Connectivity verified"

# Authentication is covered by step 3.1: a successful
# 'orchestrator blueprints list' means the DAP credentials are valid.
echo ""

# Stage 4: Input Validation
echo "Stage 4: Input Validation"
echo "--------------------------------"

echo "4.1: Verifying input file exists..."
if [ ! -f "$INPUTS_FILE" ]; then
  echo "❌ Input file not found: $INPUTS_FILE"
  exit 1
fi
echo "✅ Input file exists"

echo "4.2: Validating input structure..."
python -c "import json; json.load(open('$INPUTS_FILE'))" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "❌ Input file JSON syntax invalid"
  exit 1
fi
echo "✅ Input structure valid"

echo "4.3: Verifying input completeness..."
# (Add input-specific checks based on your blueprint)
echo "✅ Input completeness verified"
echo ""

echo "=== Pre-flight Check Complete ==="
echo "✅ All checks passed - ready for deployment"
exit 0
```

## Pre-flight Checklist

### Blueprint Validation

- [ ] Linting passes: `errorsFound: false`
- [ ] Schema validation passes: `validationPassed: true`
- [ ] CHANGELOG.yaml present (BS-009)
- [ ] Multi-file structure (BS-010)
- [ ] Using `dell.*` prefix (TD-002)
- [ ] Using `capabilities:` not `outputs:` (CP-001)

### Plugin Availability

- [ ] All required plugins are available
- [ ] Plugin versions meet requirements
- [ ] Plugin documentation accessible

### Orchestrator Readiness

- [ ] Orchestrator connectivity verified
- [ ] Authentication successful
- [ ] Resource quotas available
- [ ] SSL certificates valid (if using HTTPS)

### Input Validation

- [ ] Input file exists and is valid JSON
- [ ] All required inputs have values
- [ ] Input values match constraints
- [ ] Secret inputs reference valid secrets
- [ ] Input groups are properly configured

## Common Pre-flight Issues

### Issue 1: Linting Errors

**Problem**: Blueprint fails linting

**Solution**:

```bash
# Fix linting errors iteratively
dap-bpa blueprint lint --file blueprint.yaml --verify
# Fix errors and re-lint until errorsFound: false
```

### Issue 2: Schema Validation Failures

**Problem**: Schema validation fails

**Solution**:

```bash
# Check node type properties
dap-bpa knowledge plugins get <plugin> <node_type>
# Fix property mismatches and re-validate
```

### Issue 3: Plugin Not Available

**Problem**: Required plugin not found

**Solution**:

- Contact orchestrator administrator
- Install missing plugin
- Use alternative plugin

### Issue 4: Authentication Failure

**Problem**: Cannot authenticate to orchestrator

**Solution**:

```bash
# Check config.json
cat ~/.blueprint-assist/config.json

# Verify credentials
# Update config.json with correct values
```

### Issue 5: Input Validation Errors

**Problem**: Input values don't meet constraints

**Solution**:

```bash
# Review blueprint input constraints
dap-bpa knowledge blueprints get <blueprint-id> --include-files
# Update input values to match constraints
```

## Best Practices

1. **Always run pre-flight checks**: Never skip validation
2. **Automate pre-flight checks**: Use scripts in CI/CD
3. **Fix issues iteratively**: Don't try to fix everything at once
4. **Document pre-flight procedures**: Maintain runbooks for common issues
5. **Test in non-production**: Run pre-flight checks in test environment first
6. **Keep pre-flight scripts updated**: Update as blueprint requirements change
7. **Monitor pre-flight failures**: Track and analyze common failure patterns
8. **Integrate with deployment pipeline**: Make pre-flight part of deployment process

## Integration with Deployment

Add pre-flight checks to your deployment workflow:

```bash
#!/bin/bash
# deploy-with-preflight.sh

# Run pre-flight checks
./pre-flight-check.sh
if [ $? -ne 0 ]; then
  echo "Pre-flight checks failed - aborting deployment"
  exit 1
fi

# Proceed with deployment
echo "Pre-flight checks passed - proceeding with deployment"
# ... deployment commands ...
```

## Related Capabilities

- **Deployment Planning** - Plan deployment architecture
- **Deployment Execution** - Execute deployment after pre-flight
- **Validate Blueprint** - Part of pre-flight validation

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 007: Building Blueprints - Blueprint validation
- Section 008: Blueprint Monitoring - Deployment monitoring
- Section 013: dap-bpa CLI Commands - Complete CLI reference
