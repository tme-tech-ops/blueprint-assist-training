# GitLab DevOps Platform Deployment - Consolidated Spec

**Feature**: GitLab DevOps Platform Deployment | **Created**: 2026-09-09 | **Status**: Ready

GitLab source control, CI/CD pipelines, and DevOps collaboration platform. Deploys a self-hosted GitLab instance including source control, CI/CD pipeline runners, and DevOps collaboration tooling on Dell infrastructure.

**Inputs** - GitLab version; instance sizing (CPU, RAM, storage); admin credentials via secret; runner configuration; backup configuration; external database selection (if not using built-in); Redis configuration; SMTP settings for email; LDAP/AD integration; SSL/TLS certificate configuration; domain and URL settings.

## Technical Details

- **Inputs**:
- **Nodes**: `gitlab_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `gitlab_root_secret` MUST be a **`password`-type** secret for GitLab root password (plain string)
- `ldap_secret` (if using LDAP/AD) MUST be a **`basic_auth_credentials`-type** secret (bind DN/password)
- `smtp_secret` (if using email notifications) MUST contain SMTP credentials
- `runner_token_secret` (if registering external runners) MUST contain runner registration token

**Connection - storage and network** - GitLab storage provisioned via platform-native storage classes for repositories, database, and artifacts. Network access controlled via service definitions and ingress. For external database/Redis, use appropriate connection secrets.

**Template prerequisite** - Target infrastructure must support GitLab resource requirements (typically 4+ CPU, 8GB+ RAM for production). Storage class must be available with sufficient capacity for repositories and CI artifacts. Network must allow HTTP/HTTPS access to GitLab UI. For HA deployments, external PostgreSQL and Redis recommended.

**Outputs** - GitLab URL, admin credentials reference, runner status, backup status, system configuration, repository storage allocation, CI/CD pipeline status.

**Files** - `blueprint.yaml` + `infrastructure/gitlab/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments via Helm charts), `scripts/` (for configuration), `configs/` (for GitLab settings), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, Security, Runners, Integration, Backup.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\GitLab_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use GitLab icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a GitLab version and sizing, when I deploy, then the returned URL serves GitLab and the root account from the secret can sign in.
- **AS-2** Given runner configuration, when I deploy, then a runner shows as online and a test pipeline in a new project passes.
- **AS-3** Given SMTP settings and secret, when I deploy, then a test notification email is delivered.
- **AS-4** Given an external PostgreSQL and Redis, when I deploy, then GitLab's health check reports both connected.
- **AS-5** Given sizing below the documented minimum or an invalid domain, when I submit, then the inputs are rejected before GitLab is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given an external database that refuses the connection, when I deploy, then `install` fails at database migration with a clear error, and `uninstall` removes the GitLab workload and its claims.
- **AS-8** [lifecycle] Given a deployed GitLab, when I run `uninstall`, then the GitLab workload, runners, services, and claims it created are removed, and external databases are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: GitLab images and Helm charts served from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a backup or runner-registration Day-2 workflow, if defined, runs once against the test instance. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - GitLab instance running; admin accessible; runners registered; SMTP configured (if enabled); backup configured (if enabled); accessible via URL; repositories creatable; CI/CD pipelines executable; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\GitLab_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/GitLab_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./GitLab_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
