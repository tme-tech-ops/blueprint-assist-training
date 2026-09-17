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

**Files** - `blueprint.yaml` + `infrastructure/powerstore/{inputs,definitions,outputs}.yaml`, `scripts/` (for API interactions), `profiles/` (storage profiles), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Volume Configuration, Host Mapping, Snapshot, Replication, Performance.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Storage](../../1.sections/section-020-dell-automation-studio-catalog/category-storage.md)

**Target build folder** .\4.examples\target-build-folder\PowerStore_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use storage icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Volume created and allocated; host mapping configured; LUN visible to host; snapshot policy applied; replication configured (if enabled); accessible to host; bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
