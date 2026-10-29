# Jenkins CI/CD Server Deployment - Consolidated Spec

**Feature**: Jenkins CI/CD Server Deployment | **Created**: 2026-09-09 | **Status**: Ready

Jenkins continuous integration and deployment automation server. Deploys and configures a Jenkins CI/CD server on Dell infrastructure for automated build, test, and deployment pipelines.

**Inputs** - Jenkins version; instance sizing (CPU, RAM, storage); admin credentials via secret; plugin selection; agent configuration; backup configuration; security settings (LDAP/AD integration); tool installations (Java, Maven, Node.js, etc.); job initialization; URL and domain configuration.

## Technical Details

- **Inputs**:
- **Nodes**: `jenkins_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `jenkins_admin_secret` MUST be a **`password`-type** secret for Jenkins admin password (plain string)
- `ldap_secret` (if using LDAP/AD) MUST be a **`basic_auth_credentials`-type** secret (bind DN/password)
- `agent_ssh_secret` (if using SSH agents) MUST be a **`basic_auth_credentials`-type** secret for agent communication

**Connection - storage and network** - Jenkins storage provisioned via platform-native storage classes for job data and artifacts. Network access controlled via service definitions and ingress. For external SCM systems, use appropriate credential secrets.

**Template prerequisite** - Target infrastructure must support Jenkins resource requirements. Storage class must be available with sufficient capacity for job workspace and artifacts. Network must allow HTTP/HTTPS access to Jenkins UI. For distributed builds, agent nodes must be accessible.

**Outputs** - Jenkins URL, admin credentials reference, plugin status, agent connection status, backup status, system configuration, job initialization status.

**Files** - `blueprint.yaml` + `infrastructure/jenkins/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for configuration), `configs/` (for Jenkins as code), `plugins/` (plugin list), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, Security, Agents, Tools, Backup.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Jenkins_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Jenkins icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a Jenkins version and sizing, when I deploy, then the returned Jenkins URL serves the login page and the admin account from the secret can sign in.
- **AS-2** Given a plugin list, when I deploy, then the Jenkins plugin manager shows each listed plugin installed and enabled.
- **AS-3** Given SSH agent configuration, when I deploy, then each agent shows as connected and a test job runs on it.
- **AS-4** Given LDAP integration and its bind secret, when I deploy, then a directory user can sign in.
- **AS-5** Given an admin secret of the wrong type or an invalid URL, when I submit, then the inputs are rejected before Jenkins is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given an unreachable plugin source, when I deploy, then `install` fails during plugin installation with a clear error, and `uninstall` removes the Jenkins workload and its storage claims.
- **AS-8** [lifecycle] Given a deployed Jenkins, when I run `uninstall`, then the Jenkins workload, services, ingress, and claims it created are removed, and external agents and SCM are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: Jenkins images and plugins served from a local registry and update center with `environment_type: airgapped`. Custom workflows (§3.6): a backup or plugin-update Day-2 workflow, if defined, runs once against the test instance. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Jenkins instance running; admin accessible; plugins installed; agents connected (if configured); tools configured; backup configured (if enabled); accessible via URL; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Jenkins_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Jenkins_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Jenkins_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
