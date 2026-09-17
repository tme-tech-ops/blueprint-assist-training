# PowerEdge Redfish Lifecycle Management - Consolidated Spec

**Feature**: PowerEdge Redfish Lifecycle Management | **Created**: 2026-09-09 | **Status**: Ready

Automates PowerEdge server lifecycle management using Dell OEM Redfish extension for fine-grained hardware control beyond standard Redfish capabilities.

**Inputs** - Server selection via dynamic inventory; firmware update targets (BIOS, iDRAC, NIC, HBA); BIOS configuration profiles; hardware inventory collection scope; health monitoring intervals; maintenance windows for non-disruptive updates.

## Technical Details

- **Inputs**:
- **Nodes**: `poweredge_management` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status
- `server_inventory` — Hardware inventory of managed PowerEdge servers

**Secret requirements** (verified against DAP secret manager) -

- `idrac_secret_name` MUST be a **`basic_auth_credentials`-type** secret (username/password). The blueprint sources these keys from it: `username`, `password`. A flat `password`-type secret is invalid here - the Redfish client requires structured credentials.
- `redfish_ca_certificate` (optional) for SSL certificate validation. If using self-signed certificates, set `allow_insecure: true` in connection config.

**Connection - self-signed / insecure iDRAC** - In `connection_config`, set `allow_insecure: true` as a **literal** when connecting to iDRAC with self-signed certificates. Do NOT source `certificate_data` from the secret unless it contains valid PEM data.

**Template prerequisite** - Target PowerEdge servers MUST have iDRAC firmware at minimum supported version for Dell OEM Redfish extensions. iDRAC network connectivity must be established and accessible from the DAP orchestrator. Redfish interface must be enabled on target servers.

**Outputs** - Server inventory details, firmware version status, BIOS configuration applied, health monitoring status, update operation results.

**Files** - `blueprint.yaml` + `infrastructure/poweredge/{inputs,definitions,outputs}.yaml`, `firmware_profiles/`, `bios_configs/`, `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Selection, Firmware Management, BIOS Configuration, Monitoring.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** .\4.examples\target-build-folder\PowerEdge_Redfish_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use server hardware icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Server inventory collected successfully; firmware updates applied without errors; BIOS configuration validated; health monitoring active; both secure and insecure connection paths pass; bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
