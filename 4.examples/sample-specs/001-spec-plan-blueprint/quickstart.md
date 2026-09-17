# WindowsVM vSphere Blueprint Quickstart Guide

## Overview

This quickstart guide provides step-by-step instructions for deploying Windows virtual machines using the WindowsVM vSphere Blueprint. The blueprint automates VM deployment with support for multiple Windows OS versions, flexible network configurations, and enterprise-grade security practices.

## Prerequisites

### System Requirements

- **VMware vSphere**: 6.0 or higher
- **TOSCA Orchestrator**: 7.0 or higher
- **vSphere Plugin**: 3.0.0.0 or higher
- **Network Connectivity**: Access to vCenter Server
- **Permissions**: vSphere administrator or equivalent privileges

### Template Requirements

Windows VM templates must be prepared with:

1. **VMware Tools**: Installed and updated
2. **Sysprep**: Generalized for cloning
3. **Administrator Account**: Enabled and configured
4. **Windows Updates**: Applied (recommended)
5. **Network Configuration**: Ready for customization

### Secrets Manager

Configure secrets with the following names:

```bash
# vSphere credentials
vcenter_credentials:
  username: "vcenter_admin"
  password: "vcenter_password"
  host: "vcenter.example.com"
  port: 443
  datacenter_name: "Datacenter"
  auto_placement: true
  allow_insecure: false

# VM administrator password
windows_administrator_secret:
  username: "Administrator"
  password: "SecurePassword123!"
```

## Quick Deployment

### 1. Basic Windows Server 2022 Deployment

```yaml
deployment_name: "win-server-2022-basic"
blueprint_name: "WindowsVM_Vsphere"

inputs:
  # Connection
  environment_id: "vsphere-environment"
  vm_user_name: "Administrator"
  vm_password_secret_name: "windows_administrator_secret"
  
  # vSphere Configuration
  os_type: "WINDOWS_SERVER_2022"
  vm_template: "windows-server-2022-template"
  hostname: "webserver"
  size: "medium"
  resource_pool_name: "Production"
  datastore_name: "vsphere-datastore-01"
  vm_folder: "/Production/VMs"
  os_disk_size: 120
  disk_provisioning: "thin"
  
  # Network Configuration
  network:
    name: "VM Network"
    switch_distributed: false
    management: true
    external: true
  dhcp: true
```

### 2. Static IP Deployment

```yaml
deployment_name: "win-server-2019-static"
blueprint_name: "WindowsVM_Vsphere"

inputs:
  # Connection
  environment_id: "vsphere-environment"
  vm_user_name: "Administrator"
  vm_password_secret_name: "windows_administrator_secret"
  
  # vSphere Configuration
  os_type: "WINDOWS_SERVER_2019"
  vm_template: "windows-server-2019-template"
  hostname: "app-server"
  size: "large"
  resource_pool_name: "Applications"
  datastore_name: "vsphere-datastore-02"
  vm_folder: "/Production/AppServers"
  os_disk_size: 200
  disk_provisioning: "thickLazyZeroed"
  allowed_esxi_host:
    - "esxi-prod-01.example.com"
  
  # Network Configuration
  network:
    name: "Production_Network"
    switch_distributed: true
    management: true
    external: true
  dhcp: false
  static_ip: "192.168.1.100"
  gateway: "192.168.1.1"
  dns:
    - "8.8.8.8"
    - "8.8.4.4"
  cidr: "192.168.1.0/24"
```

### 3. Windows 11 Desktop Deployment

```yaml
deployment_name: "win-11-desktop"
blueprint_name: "WindowsVM_Vsphere"

inputs:
  # Connection
  environment_id: "vsphere-environment"
  vm_user_name: "Administrator"
  vm_password_secret_name: "windows_administrator_secret"
  
  # vSphere Configuration
  os_type: "WINDOWS_11"
  vm_template: "windows-11-template"
  hostname: "desktop"
  size: "medium"
  resource_pool_name: "Desktops"
  datastore_name: "vsphere-datastore-01"
  vm_folder: "/Desktops"
  os_disk_size: 150
  disk_provisioning: "thin"
  
  # Network Configuration
  network:
    name: "Desktop_Network"
    switch_distributed: false
    management: true
    external: true
  dhcp: true
```

## Configuration Options

### VM Size Flavors

| Size | CPU | Memory (GB) | Use Case |
|------|-----|-------------|----------|
| small | 2 | 4 | Development, testing |
| medium | 4 | 8 | Standard applications |
| large | 8 | 16 | Database, enterprise apps |
| xlarge | 16 | 32 | High-performance workloads |

### Disk Provisioning Types

| Type | Description | Use Case |
|------|-------------|----------|
| thin | Thin provisioning | General use, space efficiency |
| thickLazyZeroed | Thick lazy zeroed | Performance critical |
| thickEagerZeroed | Thick eager zeroed | Maximum performance |

### Network Configuration

#### DHCP Configuration
```yaml
network:
  name: "VM Network"
  switch_distributed: false
dhcp: true
```

#### Static IP Configuration
```yaml
network:
  name: "VM Network"
  switch_distributed: false
dhcp: false
static_ip: "192.168.1.100"
gateway: "192.168.1.1"
dns:
  - "8.8.8.8"
  - "8.8.4.4"
cidr: "192.168.1.0/24"
```

## Deployment Steps

### Step 1: Prepare Environment

1. **Verify vSphere Connectivity**
   ```bash
   # Test vCenter connection
   curl -k https://vcenter.example.com/sdk
   ```

2. **Check Template Availability**
   ```bash
   # Verify templates exist in vSphere
   # Use vSphere Client to confirm templates are present
   ```

3. **Configure Secrets**
   ```bash
   # Add secrets to your secrets manager
   # Ensure names match blueprint expectations
   ```

### Step 2: Deploy Blueprint

1. **Upload Blueprint**
   ```bash
   # Upload blueprint files to orchestrator
   # Use your orchestrator's CLI commands to upload the blueprint
   ```

2. **Create Deployment**
   ```bash
   # Create deployment with configuration
   # Use your orchestrator's CLI commands to create the deployment
   ```

3. **Execute Workflow**
   ```bash
   # Start installation workflow
   # Use your orchestrator's CLI commands to start the workflow
   ```

### Step 3: Monitor Deployment

1. **Check Execution Status**
   ```bash
   # Monitor deployment progress
   # Use your orchestrator's CLI commands to check status
   ```

2. **View Logs**
   ```bash
   # Check deployment logs
   # Use your orchestrator's CLI commands to view logs
   ```

3. **Verify VM Status**
   ```bash
   # Check VM in vSphere Client
   # Verify IP address and connectivity
   ```

## Post-Deployment Tasks

### 1. Verify VM Connectivity

```powershell
# Test network connectivity
ping google.com

# Verify Windows activation
slmgr.vbs /dli

# Check Windows Updates
wuauclt /detectnow
```

### 2. Configure Additional Settings

```powershell
# Set timezone
Set-TimeZone -Id "Eastern Standard Time"

# Join domain (if required)
Add-Computer -DomainName "example.com" -Credential (Get-Credential)

# Install additional software
# Use PowerShell or software deployment tools
```

### 3. Backup Configuration

```yaml
# Save deployment configuration for future use
deployment_config:
  inputs: # your inputs here
  outputs: # captured from deployment
```

## Troubleshooting

### Common Issues

#### Template Not Found
**Error**: `Template not found in vSphere`

**Solution**:
1. Verify template name spelling
2. Check template exists in specified datacenter
3. Confirm user has read permissions

#### Network Configuration Failed
**Error**: `VM deployed but no network connectivity`

**Solution**:
1. Verify network name and distributed switch settings
2. Check DHCP server availability
3. Validate static IP settings don't conflict

#### Password Authentication Failed
**Error**: `Cannot authenticate to VM`

**Solution**:
1. Verify secret exists in secrets manager
2. Check Administrator account is enabled
3. Confirm password complexity requirements

#### VM Customization Timeout
**Error**: `Deployment hangs during customization`

**Solution**:
1. Ensure VMware Tools are installed on template
2. Verify template is properly sysprep'd
3. Check vSphere customization logs

### Debug Commands

```bash
# Check deployment status
# Use your orchestrator's CLI commands to check deployment status

# View execution events
# Use your orchestrator's CLI commands to view events

# Get VM details
# Use your orchestrator's CLI commands to get VM details
```

## Best Practices

### 1. Template Management

- **Regular Updates**: Keep templates patched and updated
- **Version Control**: Maintain template versions for rollback
- **Testing**: Test template deployments before production use
- **Documentation**: Document template configurations and changes

### 2. Security

- **Password Management**: Use strong passwords and regular rotation
- **Network Isolation**: Use VLANs or NSX for network segmentation
- **Access Control**: Implement role-based access control
- **Audit Logging**: Enable logging and monitoring

### 3. Performance

- **Resource Planning**: Right-size VMs for workloads
- **Storage Optimization**: Use appropriate disk provisioning
- **Network Planning**: Optimize network configuration
- **Monitoring**: Implement performance monitoring

### 4. Operations

- **Automation**: Automate routine tasks
- **Documentation**: Maintain up-to-date documentation
- **Testing**: Regular testing of deployment processes
- **Backup**: Regular backup of critical configurations

## Advanced Configuration

### Custom VM Parameters

```yaml
vm_advanced_parameters:
  - name: "disk.enableUUID"
    value: "TRUE"
  - name: "sched.cpu.latencySensitivity"
    value: "high"
```

### Multiple Network Interfaces

```yaml
networking:
  connect_networks:
    - name: "Management_Network"
      switch_distributed: false
      management: true
      external: false
      use_dhcp: true
    - name: "Production_Network"
      switch_distributed: true
      management: false
      external: true
      use_dhcp: false
      ip: "192.168.1.100"
      gateway: "192.168.1.1"
      network: "192.168.1.0/24"
```

### Resource Pool Constraints

```yaml
resource_pool_name: "Production"
allowed_esxi_host:
  - "esxi-prod-01.example.com"
  - "esxi-prod-02.example.com"
datastore_name: "high-performance-storage"
```

## Support and Resources

### Documentation

- **Main Documentation**: README.md in blueprint root
- **API Reference**: TOSCA orchestrator documentation
- **vSphere Integration**: VMware vSphere documentation

### Community

- **GitHub Issues**: Report bugs and feature requests
- **Forums**: Community support and discussions
- **Knowledge Base**: Troubleshooting articles and guides

### Contact Support

For enterprise support, contact your orchestrator vendor or use the standard support channels provided with your TOSCA orchestrator deployment.

---

**Next Steps**: After completing your first deployment, explore the example configurations in the `example_JSON_configs/` directory for more advanced use cases and deployment patterns.
