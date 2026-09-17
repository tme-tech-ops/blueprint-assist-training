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

**Files** - `blueprint.yaml` + `infrastructure/baremetal/{inputs,definitions,outputs}.yaml`, `os_profiles/`, `scripts/` (for post-install), `kickstart/` or `unattend/` (for OS configs), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Selection, OS Configuration, Network, Storage, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** .\4.examples\target-build-folder\BareMetal_Provisioning_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use server hardware icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - OS installed successfully; network configured; storage layout applied; post-install scripts executed; hardening profile applied; server accessible via SSH; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
