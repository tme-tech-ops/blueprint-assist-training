# Grafana Visualization Deployment - Consolidated Spec

**Feature**: Grafana Visualization Deployment | **Created**: 2026-09-09 | **Status**: Ready

Grafana visualization and dashboarding for observability and monitoring workflows. Deploys Grafana for visualization and dashboarding, typically paired with Prometheus or other data sources to provide a complete observability stack on Dell infrastructure.

**Inputs** - Grafana version; instance sizing (CPU, RAM, storage); admin credentials via secret; data source configurations (Prometheus, Elasticsearch, InfluxDB, etc.); dashboard provisioning; plugin installation; user authentication (LDAP/AD, OAuth); anonymous access settings; session configuration; SMTP settings for alerts.

## Technical Details

- **Inputs**:
- **Nodes**: `grafana_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `grafana_admin_secret` MUST be a **`password`-type** secret for Grafana admin password (plain string)
- `datasource_secrets` (for data sources requiring authentication) MUST match data source type (API keys, tokens, basic auth)
- `ldap_secret` (if using LDAP/AD) MUST be a **`basic_auth_credentials`-type** secret (bind DN/password)
- `smtp_secret` (if using alert email) MUST contain SMTP credentials

**Connection - data sources and auth** - Grafana connects to data sources via configured endpoints. Authentication credentials sourced from appropriate secret types. For LDAP/AD integration, use directory service credentials. Network must allow access to data source endpoints.

**Template prerequisite** - Target infrastructure must support Grafana resource requirements. Storage class must be available for dashboard and plugin storage. Network must allow HTTP/HTTPS access to Grafana UI. Data sources must be accessible from Grafana instance.

**Outputs** - Grafana URL, admin credentials reference, data source status, dashboard provisioning status, plugin status, user authentication status, alert notification channel status.

**Files** - `blueprint.yaml` + `infrastructure/grafana/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `dashboards/` (dashboard JSON/provisioning configs), `datasources/` (data source configs), `plugins/` (plugin list), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, Data Sources, Dashboards, Authentication, Alerts.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Observability & Monitoring](../../../1.sections/section-020-dell-automation-studio-catalog/category-observability-monitoring.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Grafana_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Grafana icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a Grafana version and admin secret, when I deploy, then the returned URL serves Grafana and the admin account can sign in.
- **AS-2** Given a Prometheus data source, when I deploy, then Grafana's data source test reports success.
- **AS-3** Given dashboard provisioning, when I deploy, then each provisioned dashboard loads and shows data from its data source.
- **AS-4** Given LDAP authentication and its bind secret, when I deploy, then a directory user can sign in; with anonymous access disabled, an unauthenticated request is refused.
- **AS-5** Given an admin secret of the wrong type or an invalid data source URL, when I submit, then the inputs are rejected before Grafana is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a plugin that cannot be downloaded, when I deploy, then `install` fails during plugin installation with a clear error, and `uninstall` removes the Grafana workload and its claims.
- **AS-8** [lifecycle] Given a deployed Grafana, when I run `uninstall`, then the Grafana workload, services, ingress, and claims it created are removed, and its data sources are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: images and plugins served from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a dashboard-sync Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Grafana instance running; admin accessible; data sources connected; dashboards provisioned; plugins installed; authentication configured (if enabled); accessible via URL; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Grafana_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Grafana_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Grafana_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
