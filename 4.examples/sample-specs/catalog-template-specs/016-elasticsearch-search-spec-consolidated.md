# Elasticsearch Search Platform Deployment - Consolidated Spec

**Feature**: Elasticsearch Search Platform Deployment | **Created**: 2026-09-09 | **Status**: Ready

Elasticsearch search and analytics platform for log aggregation and data indexing. Deploys Elasticsearch for full-text search, log aggregation, and data indexing on Dell infrastructure. Commonly paired with Kibana and Logstash (ELK stack) for a complete observability and search solution.

**Inputs** - Elasticsearch version; cluster configuration (node count, master-eligible nodes, data nodes); instance sizing (CPU, RAM, storage per node); storage class and size; index settings (shards, replicas); heap size configuration; security settings (authentication, TLS); snapshot repository configuration; index lifecycle management; plugin installation.

## Technical Details

- **Inputs**:
- **Nodes**: `elasticsearch_cluster` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `elastic_admin_secret` MUST be a **`password`-type** secret for Elasticsearch admin password (plain string)
- `certificate_secret` (if using TLS) MUST contain CA certificate, node certificate, and private key
- `snapshot_secret` (if using snapshot repository) MUST match repository type (S3 credentials, etc.)

**Connection - storage and network** - Elasticsearch storage provisioned via platform-native storage classes for indices. Network must allow inter-node communication (transport port 9300) and client access (HTTP port 9200). For snapshot repositories, network must allow access to repository endpoint.

**Template prerequisite** - Target infrastructure must support Elasticsearch resource requirements (typically 4GB+ RAM per data node). Storage class must be available with sufficient capacity and performance. For HA clusters, minimum 3 master-eligible nodes recommended. Network must allow cluster formation.

**Outputs** - Cluster endpoint URL, cluster health status, node status, index count, storage allocation, security status, snapshot repository status, heap usage.

**Files** - `blueprint.yaml` + `infrastructure/elasticsearch/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for elasticsearch.yml), `scripts/` (for cluster initialization), `plugins/` (plugin list), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Cluster Configuration, Node Sizing, Storage, Security, Snapshots.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Web & Search Services](../../../1.sections/section-020-dell-automation-studio-catalog/category-web-search-services.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Elasticsearch_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Elasticsearch icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given 3 master-eligible and 2 data nodes, when I deploy, then `_cluster/health` reports `green` with 5 nodes.
- **AS-2** Given index settings for shards and replicas, when I create a test index, then it is allocated with those settings.
- **AS-3** Given security enabled with the admin secret and TLS certificate, when I deploy, then an unauthenticated request is refused and an authenticated HTTPS request succeeds.
- **AS-4** Given a snapshot repository, when I deploy, then a test snapshot completes and restores.
- **AS-5** Given fewer than 3 master-eligible nodes for HA, or a heap size above half the node memory, when I submit, then the inputs are rejected before the cluster is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a data node that cannot reach the transport port, when I deploy, then `install` fails at cluster formation with a clear error, and `uninstall` removes every node and claim it created.
- **AS-8** [lifecycle] Given a deployed cluster, when I run `uninstall`, then the cluster nodes, services, and claims it created are removed, and snapshots in the external repository are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: Elasticsearch images and plugins from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a snapshot or rolling-restart Day-2 workflow, if defined, runs once against the test cluster. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Elasticsearch cluster formed; all nodes joined; cluster health green; indices creatable; security configured (if enabled); snapshot repository configured (if enabled); accessible via API; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Elasticsearch_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Elasticsearch_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Elasticsearch_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
