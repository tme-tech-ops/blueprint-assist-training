# Deployment Execution

This example demonstrates the complete blueprint deployment workflow: uploading a blueprint to the orchestrator, creating a deployment, and monitoring execution.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap`, `dap-deployment-update`

## Learning Objectives

By the end of this example, you will be able to:

- Upload blueprints to the DAP orchestrator
- Create deployments with input validation
- Monitor deployment execution in real-time
- Stream and analyze deployment events
- Handle deployment errors and failures
- Verify successful deployment completion

## Prerequisites

- Validated blueprint (see validate-blueprint example)
- dap-bpa CLI installed and configured
- DAP orchestrator connection configured
- Blueprint lint and schema validation passed

## Deployment Workflow Overview

The deployment execution workflow consists of 4 main stages:

1. **Upload Blueprint** - Upload blueprint archive to orchestrator
2. **Wait for Upload Completion** - Monitor upload status
3. **Create Deployment** - Create deployment with inputs
4. **Monitor Execution** - Track deployment progress and events

## Stage 1: Upload Blueprint

### Prepare Blueprint Archive

Ensure your blueprint directory contains all required files:

```text
my-blueprint/
├── blueprint.yaml
├── inputs.yaml
├── capabilities.yaml
├── CHANGELOG.yaml
└── scripts/ (if using custom operations)
```

### Upload to Orchestrator

```bash
dap-bpa orchestrator blueprints upload \
  --file blueprint.yaml \
  --id my-blueprint \
  --revision v1.0.0
```

**Parameters**:

- `--file`: Path to main blueprint file (blueprint.yaml)
- `--id`: Blueprint identifier (must be unique)
- `--revision`: Semantic version (e.g., v1.0.0, v2.1.3)

**Expected Output**:

```text
Blueprint upload initiated successfully
Blueprint ID: my-blueprint
Revision: v1.0.0
Upload ID: upload-abc123
```

### Monitor Upload Status

```bash
dap-bpa orchestrator blueprints get my-blueprint --fields id state revisions
```

**States**:

- `uploading`: Upload in progress
- `uploaded`: Upload complete, ready for deployment
- `upload_failed`: Upload failed (check error message)
- `processing`: Being processed by orchestrator

**Wait until state is `uploaded` before proceeding**:

```bash
# Loop until uploaded (or use manual monitoring)
while true; do
  state=$(dap-bpa orchestrator blueprints get my-blueprint --fields state | grep -oP '(?<=state: )[^ ]+')
  if [ "$state" = "uploaded" ]; then
    echo "Blueprint uploaded successfully"
    break
  fi
  echo "Current state: $state, waiting..."
  sleep 5
done
```

### Upload Error Handling

**Common Upload Errors**:

1. **Invalid blueprint structure**:

   ```text
   Error: Blueprint validation failed
   Fix: Run `dap-bpa blueprint lint --file blueprint.yaml --verify`
   ```

2. **Missing files**:

   ```text
   Error: File not found: inputs.yaml
   Fix: Ensure all required files are present in blueprint directory
   ```

3. **Duplicate blueprint ID**:

   ```text
   Error: Blueprint ID already exists
   Fix: Use a different ID or upload a new revision
   ```

4. **Plugin not available**:

   ```text
   Error: Plugin 'vsphere' not found
   Fix: Ensure required plugin is installed on orchestrator
   ```

## Stage 2: Create Deployment

### Prepare Input File

Create a JSON inputs file with your deployment-specific values
(`deployments create` requires JSON, not YAML):

```json
{
  "vcenter_host": "vcenter-prod.example.com",
  "vcenter_username": "admin@vsphere.local",
  "vcenter_secret_name": "vcenter-prod-credentials",
  "vm_name": "production-web-01",
  "vm_cpus": 4,
  "vm_memory_mb": 8192,
  "vm_disk_gb": 100
}
```

### Create Deployment

```bash
dap-bpa orchestrator deployments create \
  --blueprint-id my-blueprint \
  --inputs deployment-inputs.json
```

**Parameters**:

- `--blueprint-id`: ID of uploaded blueprint
- `--inputs`: Path to input file (optional if blueprint has defaults)
- `--deployment-id`: Custom deployment ID (optional, auto-generated if not provided)
- `--display-name`: Human-readable name (optional)

**Expected Output**:

```text
Deployment created successfully
Deployment ID: deployment-xyz789
Blueprint: my-blueprint (v1.0.0)
State: creating
```

### Input Validation

The orchestrator validates inputs against blueprint constraints:

```yaml
# Invalid input example
vm_cpus: 20  # Exceeds constraint range [1, 16]
```

**Error**:

```text
Error: Input validation failed
- vm_cpus: Must be between 1 and 16
```

## Stage 3: Monitor Execution

### Get Execution ID

After deployment creation, get the execution ID:

```bash
dap-bpa orchestrator deployments get deployment-xyz789 --fields id executions
```

**Output**:

```text
id: deployment-xyz789
executions:
  - id: exec-123456
    status: executing
    workflow: install
```

### Monitor Execution Status

```bash
dap-bpa orchestrator executions get exec-123456 \
  --fields id status error finished_operations total_operations
```

**Status Values**:

- `pending`: Waiting to start
- `executing`: Currently running
- `completed`: Finished successfully
- `failed`: Failed with error
- `cancelled`: Cancelled by user
- `force_failed`: Force-failed

**Progress Tracking**:

```text
id: exec-123456
status: executing
error: null
finished_operations: 5
total_operations: 10
```

### Stream Live Events

For real-time monitoring, stream deployment events:

```bash
dap-bpa orchestrator events get exec-123456
```

**Event Types**:

- `workflow_started`: Workflow execution started
- `operation_started`: Node operation started
- `operation_succeeded`: Node operation completed successfully
- `operation_failed`: Node operation failed
- `workflow_failed`: Workflow failed
- `workflow_succeeded`: Workflow completed successfully

**Sample Event Stream**:

```text
2026-06-02T10:15:30Z [INFO] Workflow 'install' started
2026-06-02T10:15:31Z [INFO] Operation 'create' started on node 'vm'
2026-06-02T10:15:45Z [INFO] Operation 'create' succeeded on node 'vm'
2026-06-02T10:15:46Z [INFO] Workflow 'install' succeeded
```

### Continuous Monitoring Script

```bash
#!/bin/bash
# monitor-deployment.sh

DEPLOYMENT_ID=$1
EXECUTION_ID=$2

echo "Monitoring deployment: $DEPLOYMENT_ID"
echo "Execution ID: $EXECUTION_ID"

while true; do
  # Get execution status
  status=$(dap-bpa orchestrator executions get $EXECUTION_ID --fields status | grep -oP '(?<=status: )[^ ]+')
  
  echo "Current status: $status"
  
  # Stream latest events
  dap-bpa orchestrator events get $EXECUTION_ID
  
  # Check if completed
  if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
    echo "Deployment $status"
    
    # Get error details if failed
    if [ "$status" = "failed" ]; then
      dap-bpa orchestrator executions get $EXECUTION_ID --fields error
    fi
    
    break
  fi
  
  sleep 10
done
```

## Stage 4: Post-Deployment Verification

### Check Deployment State

```bash
dap-bpa orchestrator deployments get deployment-xyz789 --fields id deployment_status capabilities
```

**Expected Output (Success)**:

```text
id: deployment-xyz789
deployment_status: deployed
capabilities:
  vm_ip: 192.168.1.100
  vm_power_state: poweredOn
  vm_moid: vm-42
```

### Verify Capabilities

Ensure expected capabilities are present and have valid values:

```bash
# Get specific capability
dap-bpa orchestrator deployments get deployment-xyz789 --fields capabilities.vm_ip
```

### Manual Resource Verification

Perform platform-specific verification:

```bash
# For vSphere: check VM exists in vCenter
# For Kubernetes: check pods are running
# For AWS: check instances in EC2 console
```

## Error Handling and Troubleshooting

### Common Execution Errors

#### 1. Authentication Failure

**Error**:

```text
Error: Authentication failed for vCenter
```

**Troubleshooting**:

```bash
# Verify secret exists
dap-bpa orchestrator secrets list | grep vcenter-prod-credentials

# Verify secret has correct values
dap-bpa orchestrator secrets get vcenter-prod-credentials

# Test connection manually
# (platform-specific connection test)
```

#### 2. Resource Unavailable

**Error**:

```text
Error: Unable to allocate requested resources
```

**Troubleshooting**:

```bash
# Check resource availability
# Verify input values are within platform limits
# Check for resource conflicts
```

#### 3. Timeout

**Error**:

```text
Error: Operation timed out after 3600 seconds
```

**Troubleshooting**:

```bash
# Check network connectivity
# Verify target system is responsive
# Increase timeout if operation is legitimately long-running
```

#### 4. Plugin Error

**Error**:

```text
Error: Plugin operation failed: Invalid parameter
```

**Troubleshooting**:

```bash
# Verify node type properties match schema
# Check plugin logs
# Validate input values
```

### Retry Failed Deployments

The dap-bpa CLI has no cancel or delete verb. To cancel a running execution, use the
orchestrator UI. To clear a failed deployment's resources before retrying, run
its `uninstall` workflow, then re-create:

```bash
# Uninstall the failed deployment's resources
dap-bpa orchestrator executions start \
  --deployment-id deployment-xyz789 \
  --workflow-id uninstall

# Re-create the deployment with corrected inputs
dap-bpa orchestrator deployments create \
  --blueprint-id my-blueprint \
  --inputs deployment-inputs.json
```

## Complete Deployment Example

```bash
#!/bin/bash
# complete-deployment.sh

BLUEPRINT_ID="my-blueprint"
BLUEPRINT_REVISION="v1.0.0"
INPUTS_FILE="deployment-inputs.json"

echo "=== Stage 1: Upload Blueprint ==="
dap-bpa orchestrator blueprints upload \
  --file blueprint.yaml \
  --id $BLUEPRINT_ID \
  --revision $BLUEPRINT_REVISION

echo "Waiting for upload to complete..."
while true; do
  state=$(dap-bpa orchestrator blueprints get $BLUEPRINT_ID --fields state | grep -oP '(?<=state: )[^ ]+')
  if [ "$state" = "uploaded" ]; then
    echo "Blueprint uploaded successfully"
    break
  fi
  echo "Current state: $state"
  sleep 5
done

echo "=== Stage 2: Create Deployment ==="
DEPLOYMENT_OUTPUT=$(dap-bpa orchestrator deployments create \
  --blueprint-id $BLUEPRINT_ID \
  --inputs $INPUTS_FILE)

DEPLOYMENT_ID=$(echo $DEPLOYMENT_OUTPUT | grep -oP '(?<=id: )[^ ]+')
echo "Deployment created: $DEPLOYMENT_ID"

echo "=== Stage 3: Monitor Execution ==="
# Get execution ID
sleep 2
EXECUTION_ID=$(dap-bpa orchestrator deployments get $DEPLOYMENT_ID --fields executions | grep -oP '(?<=id: exec-)[^ ]+' | head -1)
echo "Execution ID: $EXECUTION_ID"

# Monitor execution
while true; do
  status=$(dap-bpa orchestrator executions get $EXECUTION_ID --fields status | grep -oP '(?<=status: )[^ ]+')
  echo "Status: $status"
  
  if [ "$status" = "completed" ]; then
    echo "Deployment completed successfully"
    break
  elif [ "$status" = "failed" ]; then
    echo "Deployment failed"
    dap-bpa orchestrator executions get $EXECUTION_ID --fields error
    exit 1
  fi
  
  sleep 10
done

echo "=== Stage 4: Verify Deployment ==="
dap-bpa orchestrator deployments get $DEPLOYMENT_ID --fields id deployment_status capabilities

echo "Deployment complete!"
```

## Best Practices

1. **Always validate before uploading**: Run lint and schema validation
2. **Use semantic versioning**: Follow semver for blueprint revisions (v1.0.0, v1.1.0, v2.0.0)
3. **Monitor in real-time**: Stream events during execution for early problem detection
4. **Keep input files separate**: Don't hardcode values in blueprints
5. **Document deployment parameters**: Maintain deployment-specific input files
6. **Use descriptive IDs**: Make blueprint and deployment IDs meaningful
7. **Handle errors gracefully**: Implement proper error handling in scripts
8. **Clean up failed deployments**: Uninstall failed deployments before retrying

## Related Capabilities

- **Deployment Planning** - Plan deployment architecture before execution
- **Pre-flight Checks** - Validate readiness before deployment
- **Post-deployment Verification** - Verify deployment success

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 008: Blueprint Monitoring - Deployment monitoring and diagnostics
- Section 013: dap-bpa CLI Commands - Complete CLI reference
