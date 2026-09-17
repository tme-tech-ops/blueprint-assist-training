# VM-as-a-Service Provisioning - Consolidated Spec

**Feature**: VM-as-a-Service Provisioning | **Created**: 2026-09-09 | **Status**: Ready

Virtual machine provisioning as a service with policy-driven automation. Delivers VM provisioning as a self-service capability with policy-driven automation on Dell infrastructure. A foundational IaaS pattern for organizations standardizing VM lifecycle management through DAP.

**Inputs** - VM name and description; OS template selection; sizing flavor (CPU, RAM, disk); network configuration (DHCP/static, VLAN); storage selection; resource pool; datastore; VM folder; approval policy; lease duration; owner/department tags; backup policy; snapshot policy.

## Technical Details

- **Inputs**:
- **Nodes**: `vm_provisioning` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `vmware_secret_name` MUST be a **`vsphere`-type** secret (structured). The blueprint sources these keys from it: `host`, `username`, `password`, `datacenter_name`, `port`, `auto_placement`
- `vm_admin_secret` MUST be a **`password`-type** secret for VM admin password (plain string)
- `auto_placement` MUST be `true` for clustered vSphere environments

**Connection - vCenter** - vCenter connection details sourced from vsphere-type secret. For self-signed vCenter certificates, set `allow_insecure: true` in connection config. Network must allow vCenter API access from DAP orchestrator.

**Template prerequisite** - vCenter must be accessible and have appropriate resource pools, datastores, and network port groups configured. OS templates must exist in vCenter with VMware Tools installed. Network must allow VM traffic on selected VLANs.

**Outputs** - VM name, IP address, power status, resource allocation, network configuration, storage location, admin credentials reference, lease expiration, approval status.

**Files** - `blueprint.yaml` + `infrastructure/vsphere/{inputs,definitions,outputs}.yaml`, `templates/` (OS template mappings), `policies/` (approval and lease policies), `scripts/` (for post-provisioning), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: VM Configuration, Sizing, Network, Storage, Policy.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Platform Services](../../1.sections/section-020-dell-automation-studio-catalog/category-platform-services.md)

**Target build folder** .\4.examples\target-build-folder\VMaaS_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use VM icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - VM provisioned and powered on; OS customization complete; network configured; IP assigned; policy compliance verified; admin accessible; lease tracking active; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
