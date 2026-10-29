# Tasks: WindowsVM vSphere Blueprint

**Input**: Design documents from `/specs/001-spec-plan-blueprint/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md),
[data-model.md](data-model.md), [research.md](research.md)

**Tests are mandatory** (constitution §5.7). Every acceptance scenario in
spec.md maps to at least one test task in the Test Plan phase, and each test
task cites the requirement and scenario it proves. Results are recorded in
[test-results.md](test-results.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = deploy a configured VM, US2 = static networking
- Test tasks use `[FR-xxx] [AS-x]` in place of the story tag

---

## Phase 1: Setup

- [x] T001 Create the named blueprint folder
  `4.examples/target-build-folder/WindowsVM_Vsphere/` with
  `infrastructure/vsphere/` and `example_JSON_configs/` (constitution §5.1).
  Always build in this named folder, never directly in
  `target-build-folder/`; paths below are relative to
  `4.examples/target-build-folder/`
- [x] T002 Create `WindowsVM_Vsphere/blueprint.yaml` with
  `tosca_definitions_version: dell_1_1`, `description`, imports of
  `dell/types/types.yaml` and the vSphere plugin pinned to `>=3.0.0.0`
  (IM-003), `labels`, and `blueprint_labels`
- [x] T003 [P] Create `WindowsVM_Vsphere/CHANGELOG.md` with the 1.0.0 entry
- [x] T004 [P] Create `WindowsVM_Vsphere/README.md` with template
  prerequisites (VMware Tools, sysprep, no pre-configured NICs)

---

## Phase 2: Foundational

- [x] T005 Define `input_groups` Connection, vSphere, and Network in
  `blueprint.yaml` (IG-001)
- [x] T006 Define `vcenter_secret_name` (`vsphere` schema) and
  `vm_password_secret_name` (`password` schema) as `secret_key` inputs in
  `infrastructure/vsphere/inputs.yaml` (constitution §2.3)
- [x] T007 Define the `connection_config` from the `vsphere` secret keys
  `host`, `username`, `password`, `datacenter_name`, `port`, and
  `auto_placement`, with `allow_insecure` as a literal

**Checkpoint**: lint reports `errorsFound: 0`.

---

## Phase 3: User Story 1 - Deploy a configured VM (P1)

**Goal**: an operator deploys any supported Windows version, sized and
placed as requested, and gets the VM name and IP address back.

- [x] T008 [US1] Add `os_type`, `hostname`, `size`, `os_disk_size`, and
  `disk_provisioning` inputs with constraints and error messages to
  `infrastructure/vsphere/inputs.yaml` (FR-001, FR-004, FR-008)
- [x] T009 [US1] Add `os_template_map` and the size-to-CPU/memory flavors as
  `dsl_definitions` anchors in `infrastructure/vsphere/definitions.yaml`
  (DS-001)
- [x] T010 [US1] Add the `dell.nodes.vsphere.WindowsServer` node template with
  the auto name suffix to `infrastructure/vsphere/definitions.yaml`
  (FR-001, FR-002)
- [x] T011 [US1] Add placement inputs (`datastore_name`,
  `resource_pool_name`, `vm_folder`, `allowed_esxi_host`) and wire them into
  the node template (FR-006)
- [x] T012 [US1] Add the capabilities in `infrastructure/vsphere/outputs.yaml`
  (FR-007)
- [x] T013 [US1] Lint and `validate-all`; fix findings before US2

---

## Phase 4: User Story 2 - Static networking (P2)

**Goal**: an operator chooses DHCP or a static address.

- [x] T014 [US2] Add `dhcp`, `static_ip`, `gateway`, `dns`, and `cidr` inputs,
  with `exclusive_with: dhcp` on the static inputs (FR-003). The `cidr`
  description asks for the network address, not the VM address
- [x] T015 [US2] Lint and `validate-all`; fix findings before testing

---

## Phase 5: Test Plan (constitution §5.7)

**Environment**: non-production DAP orchestrator, lab vCenter with templates
for all four OS versions
**Record results in**: [test-results.md](test-results.md)

### Static checks (§5.2)

- [x] T100 `dap-bpa blueprint lint --file WindowsVM_Vsphere/blueprint.yaml
  --verify --schema --json` reports `errorsFound: 0`
- [x] T101 `dap-bpa blueprint validate-all --file
  WindowsVM_Vsphere/blueprint.yaml` reports `0 invalid` and
  `Total errors: 0`
- [x] T102 Risk Analysis panel from `dap-bpa blueprint visualize` shows no
  High findings
- [x] T103 [P] `yamllint WindowsVM_Vsphere/` with the project `.yamllint`

### Acceptance tests

- [x] T110 [FR-001, FR-007] [AS-1] Deploy Windows Server 2022, `medium`, DHCP;
  the VM is powered on and the `ip_address` capability matches the address
  shown in vCenter
- [x] T111 [FR-003] [AS-2] Deploy with static IP, gateway, DNS, and CIDR;
  `ipconfig /all` in the guest shows those values and DHCP disabled
- [x] T112 [FR-008] [AS-3] Create a deployment with hostname `-web01`; it is
  rejected, and no VM appears in vCenter
- [x] T113 [FR-005] [AS-4] Deploy with a nonexistent password secret; the
  deployment fails before the clone task, and no VM appears in vCenter
- [x] T114 [FR-001] [AS-5] Deploy once per `os_type` (four deployments); each
  guest reports the matching edition
- [x] T115 [FR-002] [AS-6] Deploy twice with hostname `web01`; vCenter shows
  two VMs with different names
- [x] T116 [FR-004] [AS-7] Deploy size `large`; vCenter shows 8 vCPUs and
  16384 MB
- [x] T117 [FR-006] [AS-8] Deploy with a named datastore, pool, and folder, a
  150 GB disk, and `thin`; vCenter shows that placement and disk
- [x] T118 [FR-005] [AS-9] Deploy with a `basic_auth_credentials` secret as
  `vcenter_secret_name`; the deployment is rejected before any vSphere
  resource is created
- [x] T119 [FR-003, FR-008] [edge] Set `dhcp: true` and `static_ip` together,
  and separately `os_disk_size: 80`; both are rejected at deployment creation

### Lifecycle tests (§5.6)

- [x] T120 [lifecycle] [AS-10] Re-run `install` on the T110 deployment;
  vCenter shows no new tasks against the VM
- [x] T121 [lifecycle] [AS-11] Deploy from a template without VMware Tools;
  `install` fails with `UncustomizableGuest`; `uninstall` removes the VM
- [x] T122 [lifecycle] [AS-12] `uninstall` the T110 deployment; the VM and
  its disks are gone, and the folder, datastore, and pool remain
- Custom workflows: none defined, so no test (spec.md coverage table)

### Coverage check

- [x] T130 `/speckit.analyze` reports every FR-001 to FR-008 covered by at
  least one test task

**Checkpoint**: every test task has a PASS entry in test-results.md.

---

## Phase 6: Write Back and Polish

- [x] T140 Update spec.md and spec-consolidated.md with what testing found:
  the `vsphere` and `password` secret schemas, `auto_placement: true` for
  clusters, and the template prerequisites
- [x] T141 Update `CHANGELOG.md` and `README.md`
- [x] T142 Last step: from `4.examples/target-build-folder/WindowsVM_Vsphere`, run
  `dap-bpa blueprint visualize --file ./blueprint.yaml --output
  ./WindowsVM_Vsphere-visualizer.html` and keep the HTML in the blueprint
  folder (spec.md SC-007)
- [ ] T143 Next revision: add `target_mode` with inventory and manual modes
  (spec.md Open Issues, constitution §2.2), with acceptance scenarios and
  test tasks for both

---

## Dependencies & Execution Order

- Phases 1 and 2 block all story work
- US1 (Phase 3) before US2 (Phase 4); each ends with lint and `validate-all`
- Test Plan (Phase 5): static checks, then acceptance tests, then lifecycle
  tests. T122 runs last because it removes the T110 deployment
- Write Back (Phase 6) after every test task has passed
