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

## User Scenarios & Testing

### Primary user story

As an infrastructure engineer, I provide an OS version, a template, a size, and
network settings, and the blueprint clones the template, customizes the guest,
powers it on, and reports back the VM name and IP address.

### Acceptance scenarios

Each scenario is numbered and tagged with the requirement it proves. Every one
maps to a test task in [tasks.md](tasks.md) (constitution §5.7).

1. **AS-1** [FR-001, FR-007] Given a prepared Windows Server 2022 template and a
   valid vCenter secret, when I deploy with size `medium` and DHCP enabled, then
   the VM is cloned, customized, powered on, and the IP address returned as an
   output is the address the guest reports.
2. **AS-2** [FR-003] Given static network inputs (static IP, gateway, DNS, CIDR),
   when I deploy, then the guest comes up on the specified address, gateway, and
   DNS servers with no DHCP lease.
3. **AS-3** [FR-008] Given a hostname with a leading hyphen, when I submit the
   inputs, then validation rejects them before any vSphere resource is created.
4. **AS-4** [FR-005] Given a password secret name that does not exist, when I
   deploy, then the deployment fails before the clone starts with a
   secret-not-found message, and no VM appears in vCenter.
5. **AS-5** [FR-001] Given templates for all four supported OS versions, when I
   deploy once with each `os_type`, then each guest reports the matching Windows
   edition.
6. **AS-6** [FR-002] Given an existing deployment, when I deploy again with the
   same hostname, then both VMs exist in vCenter with different names.
7. **AS-7** [FR-004] Given size `large`, when I deploy, then vCenter shows the VM
   with 8 vCPUs and 16 GB of memory.
8. **AS-8** [FR-006] Given a datastore, resource pool, VM folder, a 150 GB OS disk,
   and thin provisioning, when I deploy, then vCenter shows the VM in that pool
   and folder with a 150 GB thin-provisioned disk on that datastore.
9. **AS-9** [FR-005] Given a vCenter secret that is not of the `vsphere` schema,
   when I deploy, then the deployment is rejected before any vSphere resource is
   created.

### Lifecycle and failure scenarios

10. **AS-10** [lifecycle] Given a deployed VM, when `install` is re-run or
    `update` runs with unchanged inputs, then nothing in vCenter changes
    (constitution §5.3).
11. **AS-11** [lifecycle] Given a template without VMware Tools, when I deploy,
    then `install` fails at guest customization with `UncustomizableGuest`, and
    `uninstall` removes the partially created VM.
12. **AS-12** [lifecycle] Given a deployed VM, when I run `uninstall`, then the VM
    and its disks are deleted, and the pre-existing folder, datastore, and
    resource pool are untouched (constitution §3.2).

### Edge cases

- DHCP and static IP supplied together are mutually exclusive and rejected.
- A template that is absent from the target datacenter fails with a
  template-not-found error rather than a generic failure.
- An OS disk size outside the supported 90 to 1000 GB range is rejected by the
  input constraint.
- `cidr` takes the network address (`192.168.1.0/24`), not the VM's address
  with a prefix (`192.168.1.100/24`). The input pattern accepts both forms, so
  the input description MUST say which one is expected.

### Acceptance coverage (constitution §5.7)

| Area | Status | Scenarios / reason |
| ---- | ------ | ------------------ |
| Each `target_mode` (§2.2) | Open issue | This revision connects through a `vsphere` secret only; see Open Issues |
| Air-gapped path (§1.1) | Not applicable | Nothing is downloaded at deploy time; templates are already in vCenter |
| Custom workflows (§3.6) | Not applicable | The blueprint defines no custom workflows |
| `install` that fails partway | Covered | AS-11 |
| `uninstall` leaves no orphans (§3.2) | Covered | AS-11, AS-12 |
| Re-run changes nothing (§5.3) | Covered | AS-10 |

### Testing

- **Test plan**: the Test Plan phase of [tasks.md](tasks.md) maps every
  scenario above to at least one test task, plus the static checks and
  lifecycle tests in constitution §5.6.
- **Environment**: a non-production DAP orchestrator and a lab vCenter with
  templates for all four OS versions.
- **Results**: each run is recorded in [test-results.md](test-results.md) with
  the result, deployment ID, date, and dap-bpa version.
- **Final step - visualizer**: once every test has passed and the spec is
  updated, generate the Blueprint Visualizer from the completed blueprint and
  save it in the blueprint folder, next to `blueprint.yaml`. Run it from that
  folder, because both `--file` and `--output` must be inside the current
  directory:

  ```bash
  cd 4.examples/target-build-folder/WindowsVM_Vsphere
  dap-bpa blueprint visualize --file ./blueprint.yaml \
    --output ./WindowsVM_Vsphere-visualizer.html
  ```

  Generate it last, so it shows the delivered blueprint, and regenerate it
  whenever the blueprint changes.

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

### Build location

The blueprint MUST always be built in its own named folder under the target
build folder, never directly in the target build folder itself:
`4.examples/target-build-folder/WindowsVM_Vsphere/`. The folder name matches the
blueprint name, so several blueprints, or revisions of one, can sit side by
side without overwriting each other. Every path in this spec, the plan, and
the tasks is relative to that folder.

The blueprint uses a multi-file layout:

```
4.examples/target-build-folder/
└── WindowsVM_Vsphere/                  # Named blueprint folder (always)
    ├── blueprint.yaml                  # Main definition and input groups
    ├── infrastructure/vsphere/
    │   ├── inputs.yaml                 # Input parameters and validation
    │   ├── definitions.yaml            # vSphere WindowsServer node template
    │   └── outputs.yaml                # Deployment outputs
    ├── example_JSON_configs/           # Sample deployment input files
    ├── CHANGELOG.md                    # Version history
    ├── README.md                       # Documentation
    ├── icon.png                        # Blueprint icon
    └── WindowsVM_Vsphere-visualizer.html  # Generated last (SC-007)
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
- **SC-005**: the blueprint passes `dap-bpa blueprint lint --verify --schema`
  with `errorsFound: 0` and `dap-bpa blueprint validate-all` with
  `Total errors: 0`.
- **SC-006**: every test task in the [tasks.md](tasks.md) test plan has a PASS
  entry in [test-results.md](test-results.md).
- **SC-007**: `WindowsVM_Vsphere-visualizer.html`, generated from the completed
  blueprint, is in the blueprint folder.
- **SC-008**: the blueprint is built in
  `4.examples/target-build-folder/WindowsVM_Vsphere/`, and nothing it produces
  sits directly in `4.examples/target-build-folder/`.

## Open Issues

- **Target environment selection (constitution §2.2).** This is a top-level
  workload blueprint, so §2.2 requires a `target_mode` input with inventory and
  manual modes. This revision reads the vCenter connection from a `vsphere`
  secret, which matches manual mode only. Adding inventory mode (connection
  details from the parent environment through `get_environment_capability`,
  datastore and network drop-downs through `get_inventory`) is planned for the
  next revision, with acceptance scenarios for both modes.

## Related Artifacts

- [plan.md](plan.md) - implementation plan and technical context
- [tasks.md](tasks.md) - implementation tasks and the test plan
- [test-results.md](test-results.md) - recorded test runs
- [research.md](research.md) - background research and design decisions
- [data-model.md](data-model.md) - input, output, and validation schemas
- [quickstart.md](quickstart.md) - step-by-step deployment guide
- [spec-consolidated.md](spec-consolidated.md) - one-page summary of this spec
- [Constitution](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md) - DAP Blueprint Core Standards
