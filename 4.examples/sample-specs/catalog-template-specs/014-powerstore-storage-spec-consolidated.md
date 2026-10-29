# PowerStore Storage Automation - Consolidated Spec

**Feature**: PowerStore Storage Automation | **Created**: 2026-09-09 | **Status**: Ready

Dell PowerStore storage array automation for volume, host, and storage resource lifecycle management. Automates Dell PowerStore storage array operations - volume provisioning, host attachment, snapshot management, and full storage resource lifecycle - through DAP blueprints.

**Inputs** - PowerStore array selection; volume name and size; volume type (thin/thick); performance tier; host selection; host group configuration; LUN mapping; snapshot policy; replication configuration; QoS settings; storage efficiency settings; volume access mode.

## Technical Details

- **Inputs**:
- **Nodes**: `powerstore_onboarding` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `powerstore_secret_name` MUST be a **`basic_auth_credentials`-type** secret for PowerStore API access (username/password)
- `array_certificate_secret` (optional) for SSL certificate validation if using custom certificates

**Connection - PowerStore array** - PowerStore API connection details sourced from basic_auth_credentials secret. For self-signed certificates, set `allow_insecure: true` in connection config. Network must allow PowerStore REST API access from DAP orchestrator.

**Template prerequisite** - PowerStore array must be accessible and have available capacity. Host initiators must be configured on the array or discoverable. Network must allow iSCSI/FC traffic between hosts and array. Appropriate storage pools must exist on the array.

**Outputs** - Volume ID, LUN number, size allocated, host mapping status, snapshot status, replication status, performance metrics, access status.

**Files** - `blueprint.yaml` + `infrastructure/powerstore/{inputs,definitions,outputs}.yaml`, `scripts/` (for API interactions), `profiles/` (storage profiles), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Volume Configuration, Host Mapping, Snapshot, Replication, Performance.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Storage](../../../1.sections/section-020-dell-automation-studio-catalog/category-storage.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\PowerStore_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use storage icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a PowerStore array, a volume name, and size, when I deploy, then PowerStore Manager shows the volume with that size and type.
- **AS-2** Given a host and host group, when I deploy, then the volume is mapped to the host and the host sees the LUN.
- **AS-3** Given a snapshot policy, when I deploy, then the policy is attached to the volume and a snapshot is created on schedule.
- **AS-4** Given QoS settings, when I deploy, then the volume's performance policy shows those limits.
- **AS-5** Given a volume size above the pool's free capacity or a `password`-type secret where `basic_auth_credentials` is required, when I submit, then the deployment is rejected before any array object is created.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a host with no registered initiators, when I deploy, then `install` fails at host mapping with the array error, and `uninstall` deletes the volume it created.
- **AS-8** [lifecycle] Given a deployed volume, when I run `uninstall`, then the mappings, snapshot rules, and volume the blueprint created are removed, and pre-existing hosts and pools are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (array chosen from onboarded PowerStore environments) and manual mode (array address entered as free text). Air-gapped (§1.1): not applicable: the blueprint only calls the PowerStore REST API and downloads nothing. Custom workflows (§3.6): each defined Day-2 workflow (expand volume, take snapshot) runs once against the test volume. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Volume created and allocated; host mapping configured; LUN visible to host; snapshot policy applied; replication configured (if enabled); accessible to host; bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\PowerStore_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/PowerStore_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./PowerStore_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
