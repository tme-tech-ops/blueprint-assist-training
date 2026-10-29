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

**Files** - `blueprint.yaml` + `infrastructure/prometheus/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for scrape configs, rules), `alerts/` (alerting rules), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, Scrape Targets, Storage, Alerting, Remote Write.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Observability & Monitoring](../../../1.sections/section-020-dell-automation-studio-catalog/category-observability-monitoring.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Prometheus_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Prometheus icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a retention period and scrape interval, when I deploy, then the Prometheus UI shows those settings and the `up` metric is collected for every configured target.
- **AS-2** Given Kubernetes service discovery, when I deploy a labelled test service, then it appears as a scrape target within one scrape interval.
- **AS-3** Given an alerting rule and an Alertmanager configuration, when the rule's condition is triggered, then the alert reaches the configured receiver.
- **AS-4** Given remote write configured, when I deploy, then samples arrive at the remote endpoint.
- **AS-5** Given a scrape interval longer than the evaluation interval allows, or a retention below the minimum, when I submit, then the inputs are rejected before Prometheus is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a storage class without enough capacity, when I deploy, then `install` fails while binding the volume, and `uninstall` removes the Prometheus workload and its claims.
- **AS-8** [lifecycle] Given a deployed Prometheus, when I run `uninstall`, then the Prometheus and Alertmanager workloads, services, and claims it created are removed, and scraped workloads are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: images and charts pulled from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a rule-reload or retention-change Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Prometheus instance running; targets discovered and scraping; metrics being collected; alert rules evaluated; storage allocated; accessible via query UI; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Prometheus_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Prometheus_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Prometheus_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
