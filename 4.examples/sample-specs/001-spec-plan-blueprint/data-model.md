# WindowsVM vSphere Blueprint Data Model

## Overview

This document defines the data structures, relationships, and constraints for the WindowsVM vSphere Blueprint. The data model encompasses input parameters, configuration schemas, and output structures used throughout the blueprint deployment lifecycle.

## Core Data Types

### VM Configuration

```yaml
VMConfiguration:
  type: object
  properties:
    os_type:
      type: string
      enum: [WINDOWS_SERVER_2019, WINDOWS_SERVER_2022, WINDOWS_SERVER_2025, WINDOWS_11]
      description: Windows operating system version
      default: WINDOWS_SERVER_2022
    
    hostname:
      type: string
      pattern: ^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)$
      maxLength: 64
      description: VM hostname (auto-suffix applied)
      default: Windows-VM
    
    vm_template:
      type: string
      description: vSphere template name
      required: true
    
    size:
      type: string
      enum: [small, medium, large, xlarge]
      description: VM resource flavor
      default: medium
    
    os_disk_size:
      type: integer
      minimum: 90
      maximum: 1000
      description: OS disk size in GB
      default: 120
    
    disk_provisioning:
      type: string
      enum: [thin, thickLazyZeroed, thickEagerZeroed]
      description: Disk provisioning type
      default: thin
```

### Network Configuration

```yaml
NetworkConfiguration:
  type: object
  properties:
    network:
      type: object
      properties:
        name:
          type: string
          description: Network name
          required: true
        switch_distributed:
          type: boolean
          description: Distributed switch flag
          default: false
        management:
          type: boolean
          description: Management network flag
          default: true
        external:
          type: boolean
          description: External network flag
          default: true
    
    dhcp:
      type: boolean
      description: Enable DHCP
      default: false
    
    static_ip:
      type: string
      pattern: ^(?:((25[0-5]|2[0-4]\d|1\d\d|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})){3}))$
      description: Static IP address
      exclusive_with: dhcp
    
    gateway:
      type: string
      pattern: ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$|^$
      description: Default gateway
      exclusive_with: dhcp
    
    dns:
      type: array
      items:
        type: string
        pattern: ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
      description: DNS servers
      exclusive_with: dhcp
    
    cidr:
      type: string
      pattern: ^(?:((25[0-5]|2[0-4]\d|1\d\d|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d\d|\d{1,2})){3})\/(3[0-2]|[12]?\d)|)$
      description: Network CIDR
      exclusive_with: dhcp
```

### vSphere Resources

```yaml
VSphereResources:
  type: object
  properties:
    resource_pool_name:
      type: string
      pattern: ^(?!\s)(?!.*\s$).*$
      description: vSphere resource pool
      default: Resources
    
    datastore_name:
      type: string
      pattern: ^(?!\s)(?!.*\s$).*$
      description: vSphere datastore
      required: true
    
    vm_folder:
      type: string
      pattern: ^(?!\s)(?!.*\s$).*$
      description: VM folder path
      default: DEMO
    
    allowed_esxi_host:
      type: array
      items:
        type: string
      description: Allowed ESXi hosts
      default: []
```

### Authentication

```yaml
Authentication:
  type: object
  properties:
    vm_user_name:
      type: string
      pattern: ^(?!\s)(?!.*\s$).*$
      description: Deployment username
      default: Administrator
    
    vm_password_secret_name:
      type: string
      description: Password secret name
      default: windows_administrator_secret
      constraints:
        - type: basic_auth_credentials
```

## Resource Flavors

```yaml
VMResources:
  small:
    cpu: 2
    memory: 4096
  medium:
    cpu: 4
    memory: 8192
  large:
    cpu: 8
    memory: 16384
  xlarge:
    cpu: 16
    memory: 32768
```

## Output Schema

```yaml
DeploymentOutputs:
  type: object
  properties:
    deployment_id:
      type: string
      description: Unique deployment identifier
    
    vm_name:
      type: string
      description: Generated VM name
    
    ip_address:
      type: string
      description: Assigned IP address
    
    user_name:
      type: string
      description: Administrator username
    
    vm_folder:
      type: string
      description: VM folder path
    
    datastore:
      type: string
      description: Datastore name
    
    resource_pool:
      type: string
      description: Resource pool name
```

## Data Relationships

### Entity Relationship Diagram

```
Environment (1) -> (1) Deployment
Deployment (1) -> (1) VMConfiguration
VMConfiguration (1) -> (1) NetworkConfiguration
VMConfiguration (1) -> (1) VSphereResources
VMConfiguration (1) -> (1) Authentication
VMConfiguration (1) -> (1) VMResources (flavor)

Deployment (1) -> (1) DeploymentOutputs
```

### Data Flow

1. **Input Validation**: All inputs validated against schemas
2. **Template Resolution**: OS type mapped to template name
3. **Resource Allocation**: Size flavor mapped to CPU/memory
4. **Network Configuration**: DHCP/static IP settings applied
5. **VM Provisioning**: vSphere VM created with configuration
6. **Output Generation**: Deployment results captured

## Constraints and Validation Rules

### Input Validation

- **Hostname**: No leading/trailing hyphens, alphanumeric and hyphens only
- **IP Addresses**: Valid IPv4 format with CIDR notation for networks
- **Secret Names**: Must exist in secrets manager
- **Template Names**: Must exist in vSphere environment
- **Resource Names**: No leading/trailing whitespace

### Business Rules

1. **Mutual Exclusion**: DHCP and static IP settings are mutually exclusive
2. **Resource Limits**: Disk size between 90GB-1000GB
3. **Template Compatibility**: OS type must match template
4. **Network Availability**: Network must exist in vSphere
5. **Permission Requirements**: User must have vSphere permissions

## State Management

### Deployment States

```yaml
DeploymentState:
  type: string
  enum: [initialized, creating, starting, configured, running, failed, deleted]
  description: Current deployment state
```

### VM States

```yaml
VMState:
  type: string
  enum: [powered_off, powering_on, powered_on, powering_off, suspended, unknown]
  description: VM power state
```

## Error Handling

### Error Types

```yaml
ValidationError:
  type: object
  properties:
    code:
      type: string
      description: Error code
    message:
      type: string
      description: Error message
    field:
      type: string
      description: Field with validation error
    value:
      description: Invalid value provided
```

### Common Validation Errors

- `INVALID_HOSTNAME`: Hostname format invalid
- `INVALID_IP`: IP address format invalid
- `TEMPLATE_NOT_FOUND`: vSphere template not found
- `NETWORK_NOT_FOUND`: Network not found
- `SECRET_NOT_FOUND`: Secret not found in secrets manager
- `INSUFFICIENT_RESOURCES`: Not enough resources available

## Performance Considerations

### Resource Allocation

- **CPU Hot Add**: Enabled for all VMs
- **Memory Hot Add**: Enabled for all VMs
- **Disk Provisioning**: Thin provisioning by default
- **Network**: VMXNET3 adapter recommended

### Scaling Factors

- **Concurrent Deployments**: Support for 100+ simultaneous deployments
- **Template Size**: Templates should be <50GB for faster cloning
- **Network Latency**: vCenter connectivity <100ms recommended

## Security Considerations

### Data Protection

- **Passwords**: Stored in secrets manager, never in plain text
- **Network Isolation**: Support for VLAN and distributed switches
- **Access Control**: Role-based permissions in vSphere
- **Audit Logging**: All deployment actions logged

### Compliance

- **Password Complexity**: Enforced through secrets manager policies
- **Network Security**: Support for NSX integration
- **Data Sovereignty**: Datastore location control
- **Change Management**: Version control for blueprint updates

## Integration Points

### External Systems

1. **vSphere API**: VM provisioning and management
2. **Secrets Manager**: Credential storage and retrieval
3. **DNS Services**: Name resolution for deployed VMs
4. **Monitoring Systems**: VM health and performance monitoring

### API Contracts

```yaml
VSphereAPI:
  clone_template:
    input: VMConfiguration
    output: VMReference
  customize_vm:
    input: NetworkConfiguration + Authentication
    output: CustomizationResult
  get_vm_state:
    input: VMReference
    output: VMState

SecretsManagerAPI:
  get_secret:
    input: secret_name
    output: secret_value
  validate_secret:
    input: secret_name + secret_type
    output: validation_result
```

## Migration and Versioning

### Schema Versioning

- **Current Version**: 1.0
- **Backward Compatibility**: Maintained for minor versions
- **Migration Path**: Automated migration scripts provided

### Data Migration

```yaml
Migration:
  from_version: string
  to_version: string
  transformations:
    - field: string
      transformation: string
      default_value: any
```
