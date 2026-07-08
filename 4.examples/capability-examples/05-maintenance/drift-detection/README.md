# Drift Detection

This example demonstrates configuration drift detection and correction using the `check_drift`, `update`, and `postupdate` lifecycle operations.

## Capability Overview

**Status**: ✅ Fully Covered | **Skills**: `dap-deployment-update`

## Learning Objectives

By the end of this example, you will be able to:

- Implement `check_drift` operations for read-only state comparison
- Create idempotent `update` operations for drift correction
- Add `postupdate` operations for post-change verification
- Use the deployment update workflow to detect and fix drift
- Interpret drift detection results
- Handle drift in production deployments

## Prerequisites

- Running deployment with drift-prone resources
- Understanding of blueprint lifecycle operations (ND-003)
- dap-bpa CLI installed and configured
- DAP orchestrator connection configured

## What is Configuration Drift?

Configuration drift occurs when the actual state of infrastructure resources diverges from the desired state defined in the blueprint. Common causes:

- Manual changes made outside of BPA
- Automated processes modifying resources
- External systems updating configurations
- Partial updates or failed rollbacks
- Human error or unauthorized changes

## Drift Detection Workflow

The drift detection workflow uses three lifecycle operations (ND-009):

1. **`check_drift`** - Read-only comparison of live vs desired state
2. **`update`** - Idempotent drift correction
3. **`postupdate`** - Post-change verification

## Implementing Drift Detection

### Step 1: Add check_drift Operation

Create a read-only Python script that compares live state to desired state:

```python
# scripts/check_drift.py
from dell import ctx
from dell.state import ctx_parameters as inputs
from datetime import datetime
import difflib
import yaml

def _diff_lines(expected, actual):
    """Generate unified diff between expected and actual state"""
    exp = yaml.dump(expected, default_flow_style=False).splitlines()
    act = yaml.dump(actual, default_flow_style=False).splitlines()
    diff = list(difflib.unified_diff(exp, act, n=max(len(exp), len(act)), lineterm=''))
    return "\n".join(diff) if diff else None, sum(
        1 for tag, *_ in difflib.SequenceMatcher(None, exp, act).get_opcodes() if tag != 'equal'
    )

def fetch_live_vm_config():
    """
    Fetch live VM configuration from vSphere
    This function must be READ-ONLY - no mutations allowed
    """
    # Implementation depends on your target system
    # Example for vSphere:
    # - Connect to vCenter API
    # - Query VM by ID from ctx.instance.id
    # - Retrieve current CPU, memory, disk configuration
    # - Return as dictionary
    
    # Placeholder implementation
    return {
        'cpus': 4,
        'memory_mb': 8192,
        'disk_gb': 100
    }

def main():
    # Get expected state from blueprint inputs
    expected = {
        'cpus': inputs.get('expected_cpus'),
        'memory_mb': inputs.get('expected_memory_mb'),
        'disk_gb': inputs.get('expected_disk_gb')
    }
    
    # Fetch live state (READ-ONLY)
    actual = fetch_live_vm_config()
    
    # Compare states
    diff, diff_count = _diff_lines(expected, actual)
    
    if diff_count == 0:
        # No drift detected
        ctx.returns(None)
    else:
        # Drift detected - return detailed information
        ctx.returns({
            'resource_id': ctx.instance.id,
            'diff_count': diff_count,
            'diff': diff,
            'expected': expected,
            'actual': actual,
            'state_drift': None,  # Can add state-specific drift info
            'time': datetime.now().isoformat(timespec='microseconds'),
        })

if __name__ == "__main__":
    main()
```

**Critical Rules for check_drift**:

- ✅ Must be **read-only** - no mutations allowed
- ✅ Must use `ctx.returns()` to report results
- ❌ Never use plain `return` statement (ignored by orchestrator)
- ❌ Never mutate `runtime_properties` or `system_properties`

### Step 2: Add update Operation

Create an idempotent update script that corrects drift:

```python
# scripts/update_vm.py
from datetime import datetime
from dell import ctx
from dell.state import ctx_parameters as inputs
from dell.exceptions import NonRecoverableError, RecoverableError

def apply_vm_config(cpus, memory_mb, disk_gb):
    """
    Apply VM configuration changes
    This function must be IDEMPOTENT - safe to retry
    """
    # Implementation depends on your target system
    # Example for vSphere:
    # - Connect to vCenter API
    # - Update VM CPU, memory, disk configuration
    # - Handle partial updates gracefully
    # - Return success/failure
    
    # Placeholder implementation
    try:
        # Apply configuration
        # (actual implementation would call vSphere API)
        return True
    except Exception as e:
        ctx.logger.error(f"Failed to apply VM configuration: {e}")
        raise RecoverableError(f"Temporary failure: {e}")

def main():
    # Get desired state from inputs
    cpus = inputs.get('cpus')
    memory_mb = inputs.get('memory_mb')
    disk_gb = inputs.get('disk_gb')
    
    ctx.logger.info(f"Updating VM configuration: CPUs={cpus}, Memory={memory_mb}MB, Disk={disk_gb}GB")
    
    try:
        # Apply configuration (idempotent)
        success = apply_vm_config(cpus, memory_mb, disk_gb)
        
        if success:
            # Update runtime properties for downstream nodes
            ctx.instance.runtime_properties['updated_cpus'] = cpus
            ctx.instance.runtime_properties['updated_memory'] = memory_mb
            ctx.instance.runtime_properties['updated_disk'] = disk_gb
            ctx.instance.runtime_properties['update_time'] = datetime.now().isoformat()
            
            ctx.logger.info("VM configuration updated successfully")
        else:
            raise NonRecoverableError("Failed to apply VM configuration")
            
    except RecoverableError as e:
        # Temporary failure - orchestrator will retry
        ctx.logger.warning(f"Recoverable error during update: {e}")
        raise
    except Exception as e:
        # Permanent failure - no retry
        ctx.logger.error(f"Non-recoverable error during update: {e}")
        raise NonRecoverableError(f"Update failed: {e}")

if __name__ == "__main__":
    main()
```

**Critical Rules for update**:

- ✅ Must be **idempotent** - safe to retry (ND-004)
- ✅ Handle both initial application and re-application
- ✅ Use `RecoverableError` for temporary failures
- ✅ Use `NonRecoverableError` for permanent failures
- ✅ Update `runtime_properties` for downstream consumption

### Step 3: Add postupdate Operation

Create a verification script that runs after update:

```python
# scripts/verify_vm.py
from dell import ctx
from dell.state import ctx_parameters as inputs
from dell.exceptions import NonRecoverableError

def verify_vm_config(expected_cpus, expected_memory_mb, expected_disk_gb):
    """
    Verify VM configuration matches expected state
    This function should be READ-ONLY
    """
    # Fetch current state
    actual = fetch_live_vm_config()
    
    # Verify configuration
    if (actual['cpus'] == expected_cpus and
        actual['memory_mb'] == expected_memory_mb and
        actual['disk_gb'] == expected_disk_gb):
        return True
    else:
        return False

def main():
    # Get expected state
    expected_cpus = inputs.get('cpus')
    expected_memory_mb = inputs.get('memory_mb')
    expected_disk_gb = inputs.get('disk_gb')
    
    ctx.logger.info("Verifying VM configuration after update")
    
    # Verify configuration
    is_correct = verify_vm_config(expected_cpus, expected_memory_mb, expected_disk_gb)
    
    if is_correct:
        ctx.logger.info("VM configuration verified successfully")
    else:
        ctx.logger.error("VM configuration verification failed")
        raise NonRecoverableError("Configuration verification failed")

if __name__ == "__main__":
    main()
```

### Step 4: Update Blueprint YAML

Add the drift detection operations to your node template:

```yaml
# blueprint.yaml
node_templates:
  vm:
    type: dell.nodes.vsphere.Server
    properties:
      server: { get_input: vcenter_host }
      username: { get_input: vcenter_username }
      password: { get_secret: { get_input: vcenter_secret_name } }
      name: { get_input: vm_name }
      cpus: { get_input: vm_cpus }
      memory: { get_input: vm_memory_mb }
      disk: 
        - size: { get_input: vm_disk_gb }
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: scripts/create_vm.py
        delete:
          implementation: scripts/delete_vm.py
        
        # ND-009: Drift detection operations (required order)
        check_drift:
          implementation: scripts/check_drift.py
          inputs:
            expected_cpus: { get_input: vm_cpus }
            expected_memory_mb: { get_input: vm_memory_mb }
            expected_disk_gb: { get_input: vm_disk_gb }
        update:
          implementation: scripts/update_vm.py
          inputs:
            cpus: { get_input: vm_cpus }
            memory_mb: { get_input: vm_memory_mb }
            disk_gb: { get_input: vm_disk_gb }
        postupdate:
          implementation: scripts/verify_vm.py
          inputs:
            cpus: { get_input: vm_cpus }
            memory_mb: { get_input: vm_memory_mb }
            disk_gb: { get_input: vm_disk_gb }
```

**Important**: The order must be `check_drift` → `update` → `postupdate` (ND-009)

## Running Drift Detection

### Manual Drift Check

You can manually trigger drift detection:

```bash
# Create deployment update body with drift check
cat > drift-check-body.json << 'EOF'
{
  "skip_drift_check": false
}
EOF

# Initiate deployment update (drift check only)
dap-bpa orchestrator deployment-updates initiate deployment-xyz789 --body drift-check-body.json
```

### Drift Detection in Deployment Update

When performing a deployment update, drift detection runs automatically:

```bash
# Update blueprint version (includes drift check)
cat > update-body.json << 'EOF'
{
  "blueprint_id": "my-blueprint",
  "blueprint_version": "v1.1.0",
  "skip_drift_check": false
}
EOF

dap-bpa orchestrator deployment-updates initiate deployment-xyz789 --body update-body.json
```

### Preview Mode with Drift

Use preview mode to see drift without making changes:

```bash
cat > preview-body.json << 'EOF'
{
  "blueprint_version": "v1.1.0",
  "preview": true
}
EOF

dap-bpa orchestrator deployment-updates initiate deployment-xyz789 --body preview-body.json
```

## Interpreting Drift Results

### Check Drift Return Payload

The `check_drift` script returns its result via `ctx.returns()`. The orchestrator stores this in `system_properties["configuration_drift"]`.

**Recommended Payload Shape**:

```python
ctx.returns({
    'resource_id': ctx.instance.id,
    'diff_count': 3,
    'diff': '--- expected\n+++ actual\n@@ -1,3 +1,3 @@\n-cpus: 2\n+cpus: 4\n memory_mb: 4096\n-disk_gb: 50\n+disk_gb: 100',
    'expected': {'cpus': 2, 'memory_mb': 4096, 'disk_gb': 50},
    'actual': {'cpus': 4, 'memory_mb': 8192, 'disk_gb': 100},
    'state_drift': None,
    'time': '2026-06-02T10:30:45.123456',
})
```

### Minimum Acceptable Payload

```python
ctx.returns({'drift': True})  # Boolean-only
```

### Viewing Drift Results

```bash
# Get the deployment's drift status at a glance
dap-bpa orchestrator deployments get deployment-xyz789 --fields drift_status

# Get the full system properties, including configuration_drift
dap-bpa orchestrator deployments get deployment-xyz789 --fields system_properties
```

Per-node-instance detail is available in the orchestrator UI.

## Common Drift Scenarios

### Scenario 1: Manual Configuration Change

**Problem**: Administrator manually increased VM CPU in vCenter

**Detection**: `check_drift` returns diff showing CPU mismatch

**Correction**: `update` operation re-applies blueprint configuration

### Scenario 2: Partial Update Failure

**Problem**: Previous update increased memory but failed to update disk

**Detection**: `check_drift` shows partial drift (memory correct, disk incorrect)

**Correction**: `update` operation applies both changes (idempotent)

### Scenario 3: External System Modification

**Problem**: Monitoring system adjusted VM settings

**Detection**: `check_drift` detects unexpected changes

**Correction**: `update` operation reverts to blueprint-defined state

## Best Practices

1. **Always implement check_drift before update** (ND-009)
2. **Keep check_drift read-only** - no mutations allowed
3. **Make update operations idempotent** - safe to retry (ND-004)
4. **Use ctx.returns() for check_drift results** - plain return is ignored
5. **Provide detailed drift information** - helps with debugging
6. **Use preview mode** - see drift impact before applying changes
7. **Test drift correction in non-production** - verify before production use
8. **Document drift scenarios** - help operators understand drift causes

## Troubleshooting

### check_drift Not Running

**Problem**: check_drift operation not executed during update

**Solution**:

- Verify operation is defined in blueprint YAML
- Check that operation order is correct (check_drift → update → postupdate)
- Ensure blueprint declares `update` workflow support

### Drift Not Detected

**Problem**: Manual changes not detected by check_drift

**Solution**:

- Verify fetch_live_vm_config() is accessing correct resource
- Check that comparison logic is correct
- Ensure ctx.returns() is being called with proper payload

### Update Not Idempotent

**Problem**: Re-running update causes duplicate changes

**Solution**:

- Ensure update operation checks current state before applying changes
- Implement conditional logic: only apply if current != desired
- Test update operation multiple times to verify idempotency

### postupdate Fails

**Problem**: Verification fails even though update succeeded

**Solution**:

- Add delay before verification (some changes take time to propagate)
- Check verification logic matches update logic
- Verify system has stabilized after update

## Related Capabilities

- **Update Support** - Full deployment update workflow
- **Version Management** - Track blueprint versions for updates
- **Rollback Procedures** - Revert failed updates

## Related Training Sections

- Section 004: Skills Overview - Comprehensive capabilities reference
- Section 008: Blueprint Monitoring - Deployment monitoring and diagnostics
- Section 013: dap-bpa CLI Commands - Complete CLI reference
