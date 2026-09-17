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

**Files** - `blueprint.yaml` + `infrastructure/elasticsearch/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `configs/` (for elasticsearch.yml), `scripts/` (for cluster initialization), `plugins/` (plugin list), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Cluster Configuration, Node Sizing, Storage, Security, Snapshots.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Web & Search Services](../../1.sections/section-020-dell-automation-studio-catalog/category-web-search-services.md)

**Target build folder** .\4.examples\target-build-folder\Elasticsearch_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Elasticsearch icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Elasticsearch cluster formed; all nodes joined; cluster health green; indices creatable; security configured (if enabled); snapshot repository configured (if enabled); accessible via API; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
