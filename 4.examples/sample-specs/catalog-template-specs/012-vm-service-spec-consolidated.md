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

**Files** - `blueprint.yaml` + `infrastructure/vsphere/{inputs,definitions,outputs}.yaml`, `templates/` (OS template mappings), `policies/` (approval and lease policies), `scripts/` (for post-provisioning), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: VM Configuration, Sizing, Network, Storage, Policy.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Platform Services](../../../1.sections/section-020-dell-automation-studio-catalog/category-platform-services.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\VMaaS_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use VM icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given an OS template, sizing flavor, and DHCP, when I deploy, then the VM is powered on in vCenter with the flavor's CPU and memory, and the returned IP address is the one the guest reports.
- **AS-2** Given a static IP and VLAN, when I deploy, then the guest comes up on that address and port group.
- **AS-3** Given a datastore, resource pool, and VM folder, when I deploy, then vCenter shows the VM in that placement.
- **AS-4** Given a lease duration and owner tags, when I deploy, then the lease expiration capability is set and the tags appear on the VM in vCenter.
- **AS-5** Given a `password`-type secret in place of the `vsphere` secret, or a hostname with a leading hyphen, when I submit, then the deployment is rejected before any vSphere resource is created.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a template without VMware Tools, when I deploy, then `install` fails at guest customization with `UncustomizableGuest`, and `uninstall` removes the partially created VM.
- **AS-8** [lifecycle] Given a deployed VM, when I run `uninstall`, then the VM and its disks are deleted, and the pre-existing folder, datastore, and resource pool are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (vCenter, datastore, and network chosen from onboarded inventory) and manual mode (vCenter connection from the `vsphere` secret). Air-gapped (§1.1): not applicable: nothing is downloaded at deploy time; templates are already in vCenter. Custom workflows (§3.6): each defined Day-2 workflow (lease extension, snapshot, resize) runs once against the test VM. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - VM provisioned and powered on; OS customization complete; network configured; IP assigned; policy compliance verified; admin accessible; lease tracking active; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\VMaaS_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/VMaaS_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./VMaaS_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
