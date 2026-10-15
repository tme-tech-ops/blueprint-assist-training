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

**Files** - `blueprint.yaml` + `infrastructure/vault/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for Vault configuration), `policies/` (ACL policies), `scripts/` (for initialization), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Configuration, Storage, Security, Authentication, Secrets Engines.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Security & Compliance](../../1.sections/section-020-dell-automation-studio-catalog/category-security-compliance.md)

**Target build folder** .\4.examples\target-build-folder\HashiCorp_Vault_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Vault icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Vault instance running; initialized and unsealed; storage backend connected; authentication methods configured; secrets engines enabled; audit logging active; accessible via API; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
