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

**Files** - `blueprint.yaml` + `infrastructure/grafana/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `dashboards/` (dashboard JSON/provisioning configs), `datasources/` (data source configs), `plugins/` (plugin list), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Configuration, Data Sources, Dashboards, Authentication, Alerts.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Observability & Monitoring](../../1.sections/section-020-dell-automation-studio-catalog/category-observability-monitoring.md)

**Target build folder** .\4.examples\target-build-folder\Grafana_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Grafana icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Grafana instance running; admin accessible; data sources connected; dashboards provisioned; plugins installed; authentication configured (if enabled); accessible via URL; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
