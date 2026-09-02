# WindowsVM vSphere Blueprint Specification

**Feature**: 001-spec-plan-blueprint | **Created**: 2026-07-26 | **Status**: Ready | **Type**: Infrastructure Blueprint

## Overview

The WindowsVM vSphere Blueprint deploys a customized Windows virtual machine to a
VMware vSphere environment from a prepared template. It targets the DAP TOSCA
orchestrator and is driven by a small set of validated inputs, so an operator can
stand up a consistent, network-configured VM without manual vCenter steps.

The blueprint supports Windows Server 2019, 2022, and 2025 and Windows 11, offers
DHCP or static networking, sizes the VM from named flavors, and sources all
credentials from the secrets manager.

## User Scenarios

### Primary user story

As an infrastructure engineer, I provide an OS version, a template, a size, and
network settings, and the blueprint clones the template, customizes the guest,
powers it on, and reports back the VM name and IP address.

### Acceptance scenarios

1. Given a prepared Windows Server 2022 template and a valid vCenter secret, when I
   deploy with size `medium` and DHCP enabled, then the VM is cloned, customized,
   powered on, and its assigned IP is returned as an output.
2. Given static network inputs (static IP, gateway, DNS, CIDR), when I deploy, then
   the VM comes up on the specified address with no DHCP lease.
3. Given a hostname with a leading hyphen, when I submit the inputs, then validation
   rejects them before any vSphere resource is created.
4. Given a password secret name that does not exist, when I deploy, then the
   deployment fails early with a clear secret-not-found message.

### Edge cases

- DHCP and static IP supplied together are mutually exclusive and rejected.
- A template that is absent from the target datacenter fails with a
  template-not-found error rather than a generic failure.
- An OS disk size outside the supported 90 to 1000 GB range is rejected by the
  input constraint.

## Functional Requirements

- **FR-001 Multi-OS support**: deploy Windows Server 2019/2022/2025 and Windows 11,
  selected by the `os_type` input and resolved to a vSphere template.
- **FR-002 Template-driven clone**: clone from a pre-configured template, applying an
  automatic name suffix so repeated deployments stay unique.
- **FR-003 Flexible networking**: support DHCP or static addressing (static IP,
  gateway, DNS, CIDR), with the two modes mutually exclusive.
- **FR-004 Size flavors**: map `small`, `medium`, `large`, and `xlarge` to fixed CPU
  and memory allocations (see data-model.md).
- **FR-005 Secrets-managed credentials**: read vCenter and guest administrator
  credentials through `get_secret`; never store credentials in the blueprint or
  inputs.
- **FR-006 Configurable placement and storage**: accept datastore, resource pool, VM
  folder, OS disk size, and disk provisioning type.
- **FR-007 Deployment outputs**: expose the generated VM name, IP address,
  administrator user, VM folder, datastore, and resource pool.
- **FR-008 Input validation**: validate hostname, IP addresses, and disk size with
  actionable error messages before provisioning.

## Non-Functional Requirements

- **Security**: credentials held in the secrets manager, least-privilege vSphere
  access, and support for network isolation.
- **Reliability**: validation ahead of provisioning and lifecycle operations that
  are safe to re-run.
- **Maintainability**: a modular multi-file blueprint with clear input groups.
- **Compatibility**: vSphere 6.0 or higher with VMware Tools, and sysprep-prepared
  templates.

## Architecture

The VM is modeled with the `dell.nodes.vsphere.WindowsServer` node type, which sets
the guest OS family to Windows and configures the agent for WinRM. The blueprint
maps its inputs onto the node template: `os_type` resolves the template, the size
flavor sets `cpus` and `memory`, and the network and connection settings flow from
the input groups and the vCenter secret.

The blueprint uses a multi-file layout:

```
WindowsVM_Vsphere/
├── blueprint.yaml                  # Main definition and input groups
├── infrastructure/vsphere/
│   ├── inputs.yaml                 # Input parameters and validation
│   ├── definitions.yaml            # vSphere WindowsServer node template
│   └── outputs.yaml                # Deployment outputs
├── example_JSON_configs/           # Sample deployment input files
├── CHANGELOG.yaml                  # Version history
├── README.md                       # Documentation
└── icon.png                        # Blueprint icon
```

Inputs are grouped as **Connection** (credentials), **vSphere** (VM and resource
configuration), and **Network** (addressing).

For the full input, output, and validation schemas see [data-model.md](data-model.md);
for a deployment walkthrough see [quickstart.md](quickstart.md).

## Key Entities

The blueprint works with the following entities, detailed in data-model.md:

- **VM Configuration**: OS type, hostname, template, size, disk size, and
  provisioning.
- **Network Configuration**: network name, DHCP flag, and the static IP set.
- **vSphere Resources**: resource pool, datastore, VM folder, and allowed hosts.
- **Authentication**: deployment user and the password secret reference.
- **Resource Flavors**: the size-to-CPU/memory mapping.
- **Deployment Outputs**: the values returned once the VM is running.

## Dependencies

- **External**: a VMware vSphere environment, the DAP TOSCA orchestrator, a secrets
  manager, and network services (DHCP/DNS) as needed.
- **Internal**: the Dell TOSCA types, the vSphere plugin (3.0.0.0 or higher), and
  prepared Windows templates.

## Constraints and Assumptions

- The target vSphere is 6.0 or higher with appropriate permissions and licensing.
- Templates have VMware Tools installed and are sysprep-generalized for cloning.
- Network settings are applied during guest customization.
- All passwords are stored in the secrets manager rather than in inputs.

## Success Criteria

- **SC-001**: a supported OS version deploys and returns its IP address within about
  ten minutes.
- **SC-002**: both the DHCP and static networking paths complete successfully.
- **SC-003**: invalid inputs are rejected before provisioning with messages that
  identify the field and the problem.
- **SC-004**: no plaintext credentials appear in the blueprint or its input files.
- **SC-005**: the blueprint passes `dap-bpa blueprint lint` and schema validation.

## Related Artifacts

- [plan.md](plan.md) - implementation plan and technical context
- [research.md](research.md) - background research and design decisions
- [data-model.md](data-model.md) - input, output, and validation schemas
- [quickstart.md](quickstart.md) - step-by-step deployment guide
- [spec-consolidated.md](spec-consolidated.md) - one-page summary of this spec
