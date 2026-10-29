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

**Files** - `blueprint.yaml` + `infrastructure/terraform/{inputs,definitions,outputs}.yaml`, `terraform/` (modules and configurations), `scripts/` (for wrapper scripts), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Module Configuration, Provider Settings, Variables, State Management.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Terraform_IaC_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Terraform icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a module source, version, and variables for a test resource, when I deploy, then the resource exists in the cloud provider console with the requested tags.
- **AS-2** Given a remote state backend, when I deploy, then the state file is written to the backend and lists the created resources.
- **AS-3** Given module outputs, when the deployment completes, then each Terraform output appears as a blueprint capability with the same value.
- **AS-4** Given a provider secret of the wrong type for the selected cloud, when I deploy, then the deployment fails at `terraform init` or `plan`, before any resource is created.
- **AS-5** Given a module source that is not a local path, Git URL, or registry address, when I submit, then the input is rejected before Terraform runs.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a module that creates two resources where the second fails quota checks, when I deploy, then `install` fails at `apply`, and `uninstall` destroys the first resource and leaves an empty state.
- **AS-8** [lifecycle] Given a deployed module with destroy-on-cleanup enabled, when I run `uninstall`, then `terraform destroy` removes every resource in the state, and resources outside the state are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (cloud account or environment chosen from onboarded environments) and manual mode (provider endpoint and account entered as free text). Air-gapped (§1.1): cover the air-gapped path: providers and modules served from a local mirror with `environment_type: airgapped`, or document the blueprint as internet-only. Custom workflows (§3.6): a plan-only or drift-check Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Terraform init successful; plan executed without errors; apply completed; resources provisioned; state stored; outputs captured; bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Terraform_IaC_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Terraform_IaC_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Terraform_IaC_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
