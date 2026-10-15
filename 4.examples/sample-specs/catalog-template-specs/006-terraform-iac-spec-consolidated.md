# Terraform IaC Integration - Consolidated Spec

**Feature**: Terraform Infrastructure-as-Code Integration | **Created**: 2026-09-09 | **Status**: Ready

Terraform infrastructure-as-code integration for multi-cloud provisioning workflows. Integrates Terraform into Dell Automation Platform workflows for IaC-driven multi-cloud provisioning, enabling teams to manage infrastructure declaratively alongside DAP blueprints.

**Inputs** - Terraform module source (local/Git/registry); module version; variable values for Terraform configuration; target cloud provider (AWS/Azure/GCP); state backend configuration; workspace/environment; resource tagging; destroy on cleanup flag.

## Technical Details

- **Inputs**:
- **Nodes**: `terraform_execution` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `cloud_provider_secret` MUST match provider type: `aws_credentials` (access key/secret), `azure_credentials` (service principal), or `gcp_credentials` (service account key)
- `terraform_state_secret` (if using remote state) MUST contain backend authentication details
- `variable_secrets` (if Terraform variables require sensitive data) MUST be `password`-type secrets

**Connection - cloud provider** - Cloud provider API credentials sourced from appropriate secret type. For self-signed cloud endpoints, set `allow_insecure: true` in provider configuration. Network must allow API access to cloud provider endpoints.

**Template prerequisite** - Terraform CLI must be available in execution environment. Terraform module must be accessible (local path or Git repository). Cloud provider account must have required IAM permissions for resources being provisioned.

**Outputs** - Terraform state file location, provisioned resource IDs, output values from Terraform, plan/apply status, resource health status, cost estimation (if available).

**Files** - `blueprint.yaml` + `infrastructure/terraform/{inputs,definitions,outputs}.yaml`, `terraform/` (modules and configurations), `scripts/` (for wrapper scripts), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Module Configuration, Provider Settings, Variables, State Management.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** .\4.examples\target-build-folder\Terraform_IaC_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Terraform icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Terraform init successful; plan executed without errors; apply completed; resources provisioned; state stored; outputs captured; bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
