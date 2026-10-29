# HashiCorp Vault Secrets Management - Consolidated Spec

**Feature**: HashiCorp Vault Secrets Management | **Created**: 2026-09-09 | **Status**: Ready

HashiCorp Vault secrets management and credential storage for secure infrastructure automation. Deploys HashiCorp Vault for centralized secrets management and credential storage on Dell infrastructure. Integrates with DAP blueprints for secure, automated credential injection at deployment time.

**Inputs** - Vault version; instance sizing (CPU, RAM, storage); storage backend (consul, file, integrated storage); HA configuration; auto-unseal configuration (AWS KMS, Azure Key Vault, etc.); authentication methods (LDAP, AppRole, Kubernetes, etc.); secrets engines (KV, database, certificate, etc.); audit logging; TLS configuration; replication settings.

## Technical Details

- **Inputs**:
- **Nodes**: `vault_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `vault_root_token_secret` MUST be a **`password`-type** secret for Vault root token (plain string)
- `unseal_keys_secret` (if not using auto-unseal) MUST contain unseal keys
- `auto_unseal_secret` (if using cloud KMS) MUST match provider type (AWS credentials, Azure service principal, etc.)
- `auth_method_secrets` (for LDAP, etc.) MUST be **`basic_auth_credentials`-type** secrets

**Connection - storage and auth** - Vault storage backend connection configured based on selected backend. For cloud auto-unseal, use appropriate cloud provider credentials. Network must allow access to storage backend and authentication providers.

**Template prerequisite** - Target infrastructure must support Vault resource requirements. Storage backend must be available and accessible. For HA deployments, odd number of nodes recommended. Network must allow client access to Vault API. TLS certificates required for production.

**Outputs** - Vault URL, root token reference, unseal status, HA status, storage backend status, authentication methods configured, secrets engines enabled, audit logging status.

**Files** - `blueprint.yaml` + `infrastructure/vault/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for Vault configuration), `policies/` (ACL policies), `scripts/` (for initialization), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, Storage, Security, Authentication, Secrets Engines.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Security & Compliance](../../../1.sections/section-020-dell-automation-studio-catalog/category-security-compliance.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\HashiCorp_Vault_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Vault icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a Vault version and integrated storage, when I deploy, then `vault status` against the returned URL reports initialized and unsealed.
- **AS-2** Given HA with 3 nodes, when I deploy, then `vault operator raft list-peers` shows 3 voters and one leader.
- **AS-3** Given LDAP and AppRole auth methods, when I deploy, then a directory user and a test AppRole can each log in and read a KV secret their policy allows.
- **AS-4** Given audit logging enabled, when a secret is read, then the read appears in the audit log.
- **AS-5** Given HA enabled with fewer than 3 nodes, or a missing TLS certificate for production mode, when I submit, then the inputs are rejected before Vault is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given an auto-unseal KMS key the credentials cannot use, when I deploy, then `install` fails at unseal with the KMS error, and `uninstall` removes the Vault workload and its storage.
- **AS-8** [lifecycle] Given a deployed Vault, when I run `uninstall`, then the Vault workload, services, and storage it created are removed, and the external KMS key is untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: Vault images pulled from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): an unseal or key-rotation Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Vault instance running; initialized and unsealed; storage backend connected; authentication methods configured; secrets engines enabled; audit logging active; accessible via API; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\HashiCorp_Vault_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/HashiCorp_Vault_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./HashiCorp_Vault_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
