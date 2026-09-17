# Prometheus Monitoring Deployment - Consolidated Spec

**Feature**: Prometheus Monitoring Deployment | **Created**: 2026-09-09 | **Status**: Ready

Prometheus monitoring and metrics collection for Kubernetes and cloud-native environments. Deploys Prometheus for time-series metrics collection and alerting across Kubernetes clusters and cloud-native workloads running on Dell infrastructure.

**Inputs** - Prometheus version; instance sizing (CPU, RAM, storage); retention period; scrape interval; evaluation interval; alertmanager configuration; target discovery (Kubernetes service discovery, static configs); recording rules; alerting rules; storage class; external labels; remote write configuration (if using Thanos/Cortex).

## Technical Details

- **Inputs**:
- **Nodes**: `prometheus_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `alertmanager_secret` (if using external alertmanager) MUST contain webhook credentials or API keys
- `remote_write_secret` (if using remote write) MUST contain authentication for remote endpoint
- `basic_auth_secret` (if scraping protected endpoints) MUST be a **`basic_auth_credentials`-type** secret

**Connection - targets and storage** - Prometheus scrapes targets via service discovery or static configuration. Storage provisioned via platform-native storage classes for time-series data. For remote write to external systems, use appropriate authentication secrets.

**Template prerequisite** - Target infrastructure must support Prometheus resource requirements. Storage class must be available with sufficient capacity for metrics retention. Network must allow Prometheus to access scrape targets. For HA deployments, consider Thanos or Cortex for long-term storage.

**Outputs** - Prometheus URL, scrape target status, storage usage, alert status, query endpoint, configuration applied, remote write status (if configured).

**Files** - `blueprint.yaml` + `infrastructure/prometheus/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for scrape configs, rules), `alerts/` (alerting rules), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Configuration, Scrape Targets, Storage, Alerting, Remote Write.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Observability & Monitoring](../../1.sections/section-020-dell-automation-studio-catalog/category-observability-monitoring.md)

**Target build folder** .\4.examples\target-build-folder\Prometheus_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Prometheus icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Prometheus instance running; targets discovered and scraping; metrics being collected; alert rules evaluated; storage allocated; accessible via query UI; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
