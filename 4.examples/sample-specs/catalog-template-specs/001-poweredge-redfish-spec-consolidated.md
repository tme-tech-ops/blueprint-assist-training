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

**Files** - `blueprint.yaml` + `infrastructure/poweredge/{inputs,definitions,outputs}.yaml`, `firmware_profiles/`, `bios_configs/`, `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Selection, Firmware Management, BIOS Configuration, Monitoring.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\PowerEdge_Redfish_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use server hardware icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given an onboarded PowerEdge server and a valid iDRAC secret, when I deploy with inventory collection enabled, then the `server_inventory` capability lists the server's model, service tag, and firmware versions as iDRAC reports them.
- **AS-2** Given a BIOS and iDRAC firmware target newer than the installed versions, when I deploy inside the maintenance window, then iDRAC reports the new versions after the update job completes.
- **AS-3** Given a BIOS configuration profile, when I deploy, then the BIOS attributes read back through Redfish match the profile.
- **AS-4** Given an iDRAC with a self-signed certificate and `allow_insecure: true`, and separately an iDRAC with a CA-signed certificate, when I deploy to each, then both connect and collect inventory.
- **AS-5** Given a `password`-type secret in place of the `basic_auth_credentials` iDRAC secret, when I deploy, then the deployment is rejected before any Redfish call is made.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a firmware package that does not apply to the server model, when I deploy, then `install` fails with the iDRAC job error, no further updates are attempted, and `uninstall` completes cleanly.
- **AS-8** [lifecycle] Given a deployed blueprint, when I run `uninstall`, then any pending iDRAC jobs it created are removed; installed firmware and the server itself are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (server chosen from onboarded PowerEdge inventory) and manual mode (iDRAC address entered as free text) with a scenario each. Air-gapped (§1.1): cover the air-gapped path: firmware served from a local repository with `environment_type: airgapped`. Custom workflows (§3.6): a firmware-update or inventory-refresh Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Server inventory collected successfully; firmware updates applied without errors; BIOS configuration validated; health monitoring active; both secure and insecure connection paths pass; bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\PowerEdge_Redfish_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/PowerEdge_Redfish_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./PowerEdge_Redfish_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
