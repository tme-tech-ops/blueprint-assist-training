# WindowsVM vSphere Blueprint - Consolidated Spec
**Feature**: 001-spec-plan-blueprint | **Created**: 2026-07-26 | **Status**: Ready

Deploys a Windows VM (2019/2022/2025, Win11) to vSphere via DAP TOSCA. Node type: `dell.nodes.vsphere.WindowsServer`.

**Inputs** - `os_type` → template lookup; size flavor (`small/medium/large/xlarge` → CPU/RAM); DHCP or static network (mutually exclusive); datastore, resource pool, VM folder, OS disk size; credentials via `get_secret` only.

**Secret requirements** (verified against a lab orchestrator) -
- `vcenter_secret_name` MUST be a **`vsphere`-type** secret (structured). The blueprint sources these keys from it: `host`, `username`, `password`, `datacenter_name`, `port`, `auto_placement`. A flat `basic_auth_credentials` secret is invalid here - `host`/`port` won't resolve and the plugin fails (`int() ... not 'dict'`).
- `auto_placement` MUST be `true` for clustered vSphere. With a cluster, `Resources` is the cluster root pool; `auto_placement: false` forces per-host placement that no host can satisfy (`No healthy hosts could be found with resource pool Resources`).
- `vm_password_secret_name` MUST be a **flat `password`-type** secret (plain string). `windows_password` is `type: string`; a structured secret (`basic_auth_credentials`) resolves to a dict and fails (`'dict' object has no attribute 'startswith'`).

**Connection - self-signed / insecure vCenter** - In `connection_config`, set `allow_insecure: true` as a **literal** and do NOT source `certificate_data` (or `allow_insecure`) from the secret. A self-signed vCenter secret has no valid PEM `certificate_data` string, so sourcing it resolves to a dict and crashes `server.create` (`'dict' object has no attribute 'startswith'`). Deploy with the CLI `--trust-all` flag.

**Template prerequisite** - The source VM template referenced by `os_template_map` MUST have **VMware Tools / open-vm-tools installed** and **no pre-configured NICs**. Guest customization (hostname, `windows_password`, static IP) requires Tools; a bare template fails with `vim.fault.UncustomizableGuest` / `ToolsNotInstalled`. Template names must exist in the target vCenter (default map = `windows_server_<ver>_template`, `windows_11_template`).

**Network** - `cidr` is the network address (`192.168.1.0/24`), not the VM's IP with a prefix (`192.168.1.100/24`). The input pattern accepts both, so say so in the input description.

**Outputs** - VM name, IP, admin user, folder, datastore, pool.

**Files** - `blueprint.yaml` + `infrastructure/vsphere/{inputs,definitions,outputs}.yaml`, `example_JSON_configs/`, `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Connection, vSphere, Network.

**Catalog template reference** Reference the catalog template at C:\temp\VMaaS_for_vSphere-1.0.0.0-all.zip

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\WindowsVM_Vsphere\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\windows-vsphere-icon.png

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Acceptance scenarios AS-1 to AS-12 in [spec.md](spec.md), each tagged with its FR. Every scenario maps to a test task in the [tasks.md](tasks.md) test plan; runs are recorded in [test-results.md](test-results.md) with result, deployment ID, date, and dap-bpa version. Coverage: partial install failure (AS-11), clean uninstall (AS-12), re-run changes nothing (AS-10). Air-gapped and custom workflows not applicable. **Open:** `target_mode` (§2.2) - this revision is manual-style only (vCenter from the `vsphere` secret); inventory mode is planned for the next revision.

**Done when** - VM up + IP returned in ~10 min; both network paths pass; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every test task in tasks.md has a PASS in test-results.md; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\WindowsVM_Vsphere\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/WindowsVM_Vsphere && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./WindowsVM_Vsphere-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[spec.md](spec.md) · [plan.md](plan.md) · [research.md](research.md) · [data-model.md](data-model.md) · [quickstart.md](quickstart.md) · [tasks.md](tasks.md) · [test-results.md](test-results.md)
