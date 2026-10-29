# Bare-Metal Server Provisioning - Consolidated Spec

**Feature**: Bare-Metal Server Provisioning | **Created**: 2026-09-09 | **Status**: Ready

Automated bare metal server provisioning, configuration, and lifecycle management for Dell PowerEdge infrastructure. Covers OS deployment, network configuration, and post-install hardening for Dell PowerEdge bare-metal servers.

**Inputs** - Target server selection via dynamic inventory; OS selection (RHEL, Ubuntu, Windows Server); network configuration (DHCP/static, VLAN assignment); storage configuration (disk layout, RAID); post-installation scripts; hardening profile; SSH key injection; hostname pattern.

## Technical Details

- **Inputs**:
- **Nodes**: `baremetal_provisioning` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `bmc_secret_name` MUST be a **`basic_auth_credentials`-type** secret for BMC/iDRAC access (username/password)
- `ssh_secret_name` MUST be a **`basic_auth_credentials`-type** secret for post-provisioning access (username/SSH key or password)
- `os_admin_secret` MUST be a **`password`-type** secret for initial OS admin password (Windows) or SSH key (Linux)

**Connection - BMC / IPMI** - BMC connection for power control and boot configuration. For self-signed BMC certificates, set `allow_insecure: true` in connection config. Network must allow IPMI/Redfish access from DAP orchestrator.

**Template prerequisite** - Target servers must have BMC/iDRAC configured and accessible. PXE boot environment must be available or ISO mounting capability. Network boot must be enabled if using PXE. Server hardware must meet OS minimum requirements.

**Outputs** - Server hostname, IP address, OS version, installation status, network configuration, storage layout, post-install script results, hardening status.

**Files** - `blueprint.yaml` + `infrastructure/baremetal/{inputs,definitions,outputs}.yaml`, `os_profiles/`, `scripts/` (for post-install), `kickstart/` or `unattend/` (for OS configs), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Selection, OS Configuration, Network, Storage, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\BareMetal_Provisioning_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use server hardware icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a server from inventory with RHEL selected, when I deploy, then the server boots the installed OS and answers SSH on the returned IP address with the injected key.
- **AS-2** Given a static network configuration and VLAN, when I deploy, then the OS reports that address, gateway, and VLAN.
- **AS-3** Given a RAID and disk layout, when I deploy, then the iDRAC storage view and the OS partition table match the requested layout.
- **AS-4** Given a hardening profile and a post-install script, when I deploy, then the script's marker file exists on the server and a hardening check reports the profile applied.
- **AS-5** Given a hostname that does not match the hostname pattern, or a `password`-type secret where `basic_auth_credentials` is required, when I submit, then the inputs are rejected before the server is powered on.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a server whose BMC cannot mount the boot image, when I deploy, then `install` fails at the boot step with the BMC error, and `uninstall` returns the server to its pre-deployment power and boot settings.
- **AS-8** [lifecycle] Given a provisioned server, when I run `uninstall`, then the boot configuration and virtual media the blueprint set are cleared and the server is returned to the pool (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (server chosen from onboarded bare-metal inventory) and manual mode (BMC address entered as free text). Air-gapped (§1.1): cover the air-gapped path: OS images and packages served from a local mirror with `environment_type: airgapped`. Custom workflows (§3.6): a reprovision or power-cycle Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - OS installed successfully; network configured; storage layout applied; post-install scripts executed; hardening profile applied; server accessible via SSH; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\BareMetal_Provisioning_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/BareMetal_Provisioning_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./BareMetal_Provisioning_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
