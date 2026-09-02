# Section 012: Hands-On Workshop

## Workshop Overview

### Objectives

The hands-on workshop provides practical experience with Blueprint Assist through guided exercises. Participants will:

- Deploy actual infrastructure using Blueprint Assist
- Create and modify blueprints
- Analyze existing blueprints
- Troubleshoot common issues
- Apply best practices

### Prerequisites

- Blueprint Assist installed and configured
- On-premise data center access with appropriate permissions
- Basic understanding of infrastructure concepts
- Terminal/command line access
- Text editor for configuration files

### Environment Setup

```bash
# Verify Blueprint Assist installation and configuration
dap-bpa status

# Verify orchestrator connection
dap-bpa orchestrator blueprints list -o your-orchestrator-profile

# Verify knowledge base is available
dap-bpa knowledge blueprints find "vm"
```

## Guided Exercises

### Exercise 1: Blueprint Discovery and Analysis

#### Exercise 1 Goal

Learn to discover and analyze existing blueprints in the knowledge base.

#### Exercise 1 Steps

- **Search for Relevant Blueprints**

```bash
# Search for vSphere-related blueprints
dap-bpa knowledge blueprints find "vsphere"

# Search for Kubernetes-related blueprints
dap-bpa knowledge blueprints find "kubernetes"

# Search with plugin filter
dap-bpa knowledge blueprints find "vm" --plugin vsphere
```

- **Retrieve and Analyze a Blueprint**

```bash
# Get a complete blueprint with all files
dap-bpa knowledge blueprints get vsphere-vm --include-files

# Get blueprint metadata only
dap-bpa knowledge blueprints get vsphere-vm
```

- **Study Plugin Documentation**

```bash
# List available node types for vsphere plugin
dap-bpa knowledge plugins list vsphere

# Get detailed information about a specific node type
dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server

# Get full plugin documentation
dap-bpa knowledge plugins docs vsphere
```

#### Exercise 1 Expected Outcome

- Understanding of available blueprints in the knowledge base
- Familiarity with plugin documentation structure
- Knowledge of how to retrieve and analyze blueprints

### Exercise 2: Blueprint Creation from Template

#### Exercise 2 Objective

Create a simple blueprint by modifying an existing template.

#### Exercise 2 Steps

- **Get a Starting Template**

```bash
# Retrieve a simple vSphere VM blueprint
dap-bpa knowledge blueprints get vsphere-vm --include-files
```

- **Create Your Blueprint Directory**

```bash
mkdir my-first-blueprint
cd my-first-blueprint

# Create standard structure
mkdir example_JSON_configs
```

- **Modify the Blueprint**

Edit the retrieved `blueprint.yaml` to customize:

- Update description
- Modify input parameters
- Adjust default values
- Change display labels

- **Create Example Configuration**

Create `example_JSON_configs/deployment-inputs.json`:

```json
{
  "vsphere_host": "your-vcenter.example.com",
  "vsphere_port": 443,
  "vsphere_username": "administrator@vsphere.local",
  "vsphere_secret": "your-vsphere-secret",
  "template_name": "Your-Template-Name",
  "management_network": "VM Network",
  "external_network": "VM Network"
}
```

- **Create Documentation**

Create `README.md` with:

- Blueprint description
- Prerequisites
- Usage instructions
- Parameter documentation

- **Create Changelog**

Create `CHANGELOG.yaml`:

```yaml
1.0.0:
  - ticket: INITIAL
    developer: Your Name
    description: Initial blueprint creation from vsphere-vm template
```

#### Exercise 2 Expected Outcome

- Working custom blueprint based on existing template
- Proper documentation and changelog
- Example configuration files

### Exercise 3: Blueprint Validation

#### Exercise 3 Goal

Learn to validate blueprints locally before deployment.

#### Exercise 3 Steps

- **Basic Linting**

```bash
# Lint your blueprint
dap-bpa blueprint lint --file blueprint.yaml

# Lint with zero-byte file check
dap-bpa blueprint lint --file blueprint.yaml --verify
```

- **Node Validation**

```bash
# Validate all node templates
dap-bpa blueprint validate-all --file blueprint.yaml

# Validate specific node
dap-bpa blueprint validate my_vm --file blueprint.yaml
```

- **Fix Validation Issues**
Address any linting or validation errors by:

- Checking syntax errors
- Verifying plugin imports
- Ensuring proper input definitions
- Validating node type references

#### Exercise 3 Expected Outcome

- Blueprint passes all validation checks
- Understanding of common validation issues
- Knowledge of troubleshooting techniques

### Exercise 4: Blueprint Upload and Deployment

#### Exercise 4 Goal

Upload your blueprint to the orchestrator and create a deployment.

#### Exercise 4 Steps

- **Upload Blueprint**

```bash
# Upload to orchestrator
dap-bpa orchestrator blueprints upload \
  --file blueprint.yaml \
  --id my-first-blueprint \
  --revision 1.0.0 \
  -o your-orchestrator-profile

# Check upload status
dap-bpa orchestrator blueprints get my-first-blueprint -o your-orchestrator-profile
```

- **Create Deployment**

```bash
# Create deployment with inputs
dap-bpa orchestrator deployments create \
  --blueprint-id my-first-blueprint \
  --inputs example_JSON_configs/deployment-inputs.json \
  --display-name "my-first-deployment" \
  -o your-orchestrator-profile

# Note the deployment ID from the output
```

- **List Deployments**

```bash
# List all deployments
dap-bpa orchestrator deployments list -o your-orchestrator-profile

# Get specific deployment details
dap-bpa orchestrator deployments get <deployment_id> -o your-orchestrator-profile
```

#### Exercise 4 Expected Outcome

- Blueprint successfully uploaded to orchestrator
- Deployment created with your configuration
- Understanding of deployment lifecycle

### Exercise 5: Execution Management

#### Exercise 5 Goal

Learn to execute and monitor blueprint workflows.

#### Exercise 5 Steps

- **Start Installation Workflow**

```bash
# Start install workflow
dap-bpa orchestrator executions start \
  --deployment-id <deployment_id> \
  --workflow-id install \
  -o your-orchestrator-profile

# Note the execution ID from the output
```

- **Monitor Execution**

```bash
# Get execution status
dap-bpa orchestrator executions get <execution_id> -o your-orchestrator-profile

# Stream events for the execution
dap-bpa orchestrator events get <execution_id> -o your-orchestrator-profile
```

- **List Executions**

```bash
# List all executions
dap-bpa orchestrator executions list -o your-orchestrator-profile

# List executions for a specific deployment
dap-bpa orchestrator executions list -o your-orchestrator-profile | grep <deployment_id>
```

#### Exercise 5 Expected Outcome

- Understanding of execution workflow
- Knowledge of monitoring techniques
- Ability to troubleshoot execution issues

### Exercise 6: Blueprint Monitoring with Monitor Agent

#### Exercise 6 Goal

Use the monitor agent for automated lifecycle testing.

#### Exercise 6 Steps

- **Run Monitor on Blueprint**

```bash
# Automated upload, deploy, install, test, uninstall, cleanup
dap-bpa monitor --file blueprint.yaml \
  --inputs example_JSON_configs/deployment-inputs.json \
  -o your-orchestrator-profile

# Monitor in detached mode
dap-bpa monitor --file blueprint.yaml \
  --inputs example_JSON_configs/deployment-inputs.json \
  --detach \
  -o your-orchestrator-profile
```

- **Check Monitor Status**

```bash
# Check status of most recent monitor session
dap-bpa monitor --status

# Check daemon status
dap-bpa monitor --daemon-status
```

- **Monitor with Custom Workflow**

```bash
# Run specific workflow
dap-bpa monitor --file blueprint.yaml \
  --workflow install \
  --inputs example_JSON_configs/deployment-inputs.json \
  -o your-orchestrator-profile
```

#### Exercise 6 Expected Outcome

- Understanding of monitor agent capabilities
- Knowledge of automated testing workflows
- Ability to use monitor for development

### Exercise 7: Secret Management

#### Exercise 7 Goal

Learn to create and manage secrets in the orchestrator.

#### Exercise 7 Steps

- **List Existing Secrets**

```bash
# List all secrets
dap-bpa orchestrator secrets list -o your-orchestrator-profile
```

- **Create a Secret**

```bash
# Create a new secret
dap-bpa orchestrator secrets create \
  --key my-vsphere-password \
  --value "your-secure-password" \
  --display-name "vSphere Password" \
  --description "Password for vCenter access" \
  -o your-orchestrator-profile
```

- **Get Secret Metadata**

```bash
# Get secret information
dap-bpa orchestrator secrets get my-vsphere-password -o your-orchestrator-profile
```

#### Exercise 7 Expected Outcome

- Understanding of secret management
- Knowledge of secret lifecycle
- Ability to use secrets in blueprints

### Exercise 8: Plugin Management

#### Exercise 8 Goal

Learn to manage plugins on the orchestrator.

#### Exercise 8 Steps

- **List Available Plugins**

```bash
# List all plugins
dap-bpa orchestrator plugins list -o your-orchestrator-profile
```

- **Get Plugin Details**

```bash
# Get specific plugin information
dap-bpa orchestrator plugins get <plugin_id> -o your-orchestrator-profile
```

- **Upload a Plugin** (if applicable)

```bash
# Upload a plugin file
dap-bpa orchestrator plugins upload \
  --file /path/to/plugin.wgn \
  --name my-plugin \
  --visibility tenant \
  -o your-orchestrator-profile
```

#### Exercise 8 Expected Outcome

- Understanding of plugin management
- Knowledge of plugin lifecycle
- Ability to troubleshoot plugin issues

### Exercise 9: Deployment Update

#### Exercise 9 Goal

Learn to update existing deployments.

#### Exercise 9 Steps

- **Update Deployment Inputs**

```bash
# Update deployment inputs (metadata only)
dap-bpa orchestrator deployments update \
  <deployment_id> \
  --body updated-inputs.json \
  -o your-orchestrator-profile
```

- **Initiate Full Update Workflow**

```bash
# Create update body file
cat > update-body.json <<EOF
{
  "blueprint_id": "updated-blueprint-id",
  "inputs": {
    "parameter": "new-value"
  },
  "skip_install": false,
  "skip_reinstall": false
}
EOF

# Initiate full update
dap-bpa orchestrator deployment-updates initiate \
  <deployment_id> \
  --body update-body.json \
  -o your-orchestrator-profile
```

- **Monitor Update Progress**

```bash
# List updates
dap-bpa orchestrator deployment-updates list <deployment_id> -o your-orchestrator-profile

# Get update details
dap-bpa orchestrator deployment-updates get <update_id> -o your-orchestrator-profile
```

#### Exercise 9 Expected Outcome

- Understanding of deployment update mechanisms
- Knowledge of update workflows
- Ability to manage deployment changes

### Exercise 10: Cleanup and Troubleshooting

#### Exercise 10 Goal

Learn to clean up resources and troubleshoot issues.

#### Exercise 10 Steps

- **Uninstall Deployment**

```bash
# Start uninstall workflow
dap-bpa orchestrator executions start \
  --deployment-id <deployment_id> \
  --workflow-id uninstall \
  -o your-orchestrator-profile
```

- **Delete Deployment** (after uninstall)

```bash
# There is no dap-bpa CLI command to delete a deployment;
# deployment deletion is done through the orchestrator UI.
```

- **Delete Blueprint** (if needed)

```bash
# Delete the blueprint from the orchestrator
dap-bpa orchestrator blueprints delete my-first-blueprint --force -o your-orchestrator-profile
```

- **Troubleshooting Common Issues**

```bash
# Check orchestrator connection
dap-bpa status

# Re-lint blueprint if issues occur
dap-bpa blueprint lint --file blueprint.yaml --verify

# Check plugin availability
dap-bpa orchestrator plugins list -o your-orchestrator-profile

# Review execution events
dap-bpa orchestrator events get <execution_id> -o your-orchestrator-profile
```

#### Exercise 10 Expected Outcome

- Understanding of cleanup procedures
- Knowledge of troubleshooting techniques
- Ability to resolve common issues

## Workshop Summary

### Key Takeaways

- Blueprint Assist uses a knowledge-based approach for blueprint discovery
- The `dap-bpa setup` wizard handles all authentication configuration
- Local validation with `dap-bpa blueprint lint` is essential before deployment
- The monitor agent provides automated end-to-end testing
- Secrets management is integrated with the orchestrator
- Multiple orchestrator profiles can be configured and selected

### Common Patterns

- Always lint blueprints before uploading
- Use example configurations for testing
- Monitor executions for troubleshooting
- Use input groups for better UX
- Maintain comprehensive documentation

### Next Steps

1. Practice with your own infrastructure requirements
2. Explore advanced blueprint features
3. Integrate with CI/CD pipelines
4. Contribute blueprints to knowledge base
5. Explore IDE integration with `dap-bpa setup-ide`

## Additional Resources

- **Section 13**: Complete CLI command reference
- **Section 7**: Building blueprints with BPA
- **Section 9**: Blueprint reasoning and analysis
- **CHANGELOG.md**: Version history and new features
