# WindowsVM vSphere Blueprint - Consolidated Spec
**Feature**: 001-spec-plan-blueprint | **Created**: 2026-07-26 | **Status**: Ready

Deploys a Windows VM (2019/2022/2025, Win11) to vSphere via DAP TOSCA. Node type: `dell.nodes.vsphere.WindowsServer`.

**Inputs** — `os_type` → template lookup; size flavor (`small/medium/large/xlarge` → CPU/RAM); DHCP or static network (mutually exclusive); datastore, resource pool, VM folder, OS disk size; credentials via `get_secret` only.

**Secret requirements** (verified against stamp3) —
- `vcenter_secret_name` MUST be a **`vsphere`-type** secret (structured). The blueprint sources these keys from it: `host`, `username`, `password`, `datacenter_name`, `port`, `auto_placement`. A flat `basic_auth_credentials` secret is invalid here — `host`/`port` won't resolve and the plugin fails (`int() ... not 'dict'`).
- `auto_placement` MUST be `true` for clustered vSphere. With a cluster, `Resources` is the cluster root pool; `auto_placement: false` forces per-host placement that no host can satisfy (`No healthy hosts could be found with resource pool Resources`).
- `vm_password_secret_name` MUST be a **flat `password`-type** secret (plain string). `windows_password` is `type: string`; a structured secret (`basic_auth_credentials`) resolves to a dict and fails (`'dict' object has no attribute 'startswith'`).

**Connection — self-signed / insecure vCenter** — In `connection_config`, set `allow_insecure: true` as a **literal** and do NOT source `certificate_data` (or `allow_insecure`) from the secret. A self-signed vCenter secret has no valid PEM `certificate_data` string, so sourcing it resolves to a dict and crashes `server.create` (`'dict' object has no attribute 'startswith'`). Deploy with the CLI `--trust-all` flag.

**Template prerequisite** — The source VM template referenced by `os_template_map` MUST have **VMware Tools / open-vm-tools installed** and **no pre-configured NICs**. Guest customization (hostname, `windows_password`, static IP) requires Tools; a bare template fails with `vim.fault.UncustomizableGuest` / `ToolsNotInstalled`. Template names must exist in the target vCenter (default map = `windows_server_<ver>_template`, `windows_11_template`).

**Outputs** — VM name, IP, admin user, folder, datastore, pool.

**Files** — `blueprint.yaml` + `infrastructure/vsphere/{inputs,definitions,outputs}.yaml`, `example_JSON_configs/`, `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Connection, vSphere, Network.

**Catalog template reference** Reference the catalog template at C:\temp\VMaaS_for_vSphere-1.0.0.0-all.zip

**Target build folder** .\4.examples\target-build-folder

**Icon** — `icon.png` in the blueprint root. From 4.examples\sample-icons\windows-vsphere-icon.png

**Done when** — VM up + IP returned in ~10 min; both network paths pass; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[spec.md](spec.md) · [plan.md](plan.md) · [research.md](research.md) · [data-model.md](data-model.md) · [quickstart.md](quickstart.md)
