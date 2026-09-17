# Section 024: GCP Agent Generation

> **Audience: cloud architects and DevOps engineers deploying to Google Cloud Platform.** This section covers natural-language GCP resource extraction, deterministic blueprint generation, and multi-turn refinement workflows. New in v0.31.0+.

---

## Overview

GCP Agent Generation enables you to describe Google Cloud infrastructure in plain English and have Blueprint Assist automatically extract resources, validate them against GCP schemas, generate deterministic YAML, and iteratively refine the blueprint until it's deployment-ready.

### Key Capabilities

- **Natural-Language Resource Extraction** (`gcp_extract_resources`) — Parse free-form infrastructure descriptions and map them to GCP resource types
- **Deterministic Blueprint YAML Generation** — Convert extracted resources into valid DAP blueprint YAML with proper plugin imports, node types, and relationships
- **Multi-Turn Refinement** (`gcp_refine_blueprint`) — Iteratively improve the blueprint based on feedback
- **Bounded Lint-and-Repair Loop** — Auto-fix structural issues (max 5 cycles) before presenting to the user
- **GCP Credential Validation** — Local schema validation for GCP service account JSON and PEM credentials
- **Secret Masking** — Automatic redaction of PEM/service-account JSON in output and logs
- **Offline Fallback** — Degraded accuracy mode when GCP schemas unavailable locally

---

## Workflow: End-to-End GCP Blueprint Authoring

### Step 1: Extract Resources from Natural Language

Describe your GCP infrastructure in plain English:

```bash
dap-bpa gcp extract-resources \
  --description "Deploy a GCP project with a Cloud Run service, Cloud SQL PostgreSQL database, and Cloud Storage bucket. The service needs identity-based authentication and should auto-scale based on CPU."
```

The extractor parses your description and returns:

```json
{
  "resources": [
    {
      "type": "google_cloud_run_service",
      "name": "api_service",
      "properties": {
        "location": "us-central1",
        "image": "gcr.io/PROJECT_ID/api:latest",
        "autoscaling": {
          "min_instances": 1,
          "max_instances": 10,
          "cpu_threshold": 80
        },
        "service_account": "api-sa@PROJECT_ID.iam.gserviceaccount.com"
      }
    },
    {
      "type": "google_sql_instance",
      "name": "postgres_db",
      "properties": {
        "database_version": "POSTGRES_15",
        "region": "us-central1",
        "tier": "db-f1-micro"
      }
    },
    {
      "type": "google_storage_bucket",
      "name": "app_data",
      "properties": {
        "location": "US",
        "storage_class": "STANDARD"
      }
    }
  ],
  "relationships": [
    {
      "source": "api_service",
      "target": "postgres_db",
      "type": "depends_on"
    },
    {
      "source": "api_service",
      "target": "app_data",
      "type": "uses"
    }
  ],
  "validation_status": "ready_for_generation"
}
```

### Step 2: Generate Blueprint YAML

Convert extracted resources to a DAP blueprint:

```bash
dap-bpa gcp generate-blueprint \
  --resources resources.json \
  --output my-gcp-blueprint/
```

This produces:

```yaml
tosca_definitions_version: dell_1_1

description: >-
  GCP Cloud Run + Cloud SQL + Cloud Storage deployment
  Auto-scaling API service with PostgreSQL database and cloud storage

imports:
  - dell/types/types.yaml
  - plugin:gcp-plugin?version= >=1.0.0.0,<2.0.0.0

inputs:
  gcp_project_id:
    type: string
    display_label: GCP Project ID
    description: Your GCP project ID
    hidden: false
    allow_update: false
    constraints:
      - pattern: '^[a-z0-9-]{6,30}$'
        error_message: Invalid GCP project ID format
    display:
      group: gcp
      index: 1

  gcp_region:
    type: string
    display_label: GCP Region
    description: Deployment region
    default: us-central1
    hidden: false
    constraints:
      - valid_values: [us-central1, us-west1, europe-west1, asia-southeast1]
        error_message: Select a valid GCP region
    display:
      group: gcp
      index: 2

  service_image:
    type: string
    display_label: Cloud Run Image URI
    description: Docker image for Cloud Run service
    default: "gcr.io/PROJECT_ID/api:latest"
    hidden: false
    display:
      group: service
      index: 1

  db_password_secret:
    type: secret_key
    display_label: Cloud SQL Admin Password Secret
    description: Name of secret containing Cloud SQL admin password
    hidden: false
    constraints:
      - type: password
    display:
      group: database
      index: 1

input_groups:
  - display_label: GCP Configuration
    collapsible: true
    index: 1
    inputs: [gcp_project_id, gcp_region]
  - display_label: Service Configuration
    collapsible: true
    index: 2
    inputs: [service_image]
  - display_label: Database Configuration
    collapsible: true
    index: 3
    inputs: [db_password_secret]

dsl_definitions:
  gcp_credentials: &gcp_credentials
    project_id: { get_input: gcp_project_id }
    region: { get_input: gcp_region }
    service_account_json: { get_secret: gcp_service_account }

node_templates:
  cloud_run_service:
    type: dell.gcp.nodes.CloudRunService
    properties:
      gcp_config: *gcp_credentials
      service_config:
        name: api-service
        image: { get_input: service_image }
        region: { get_input: gcp_region }
        autoscaling:
          min_instances: 1
          max_instances: 10
          cpu_threshold: 80
        service_account: api-sa@{ get_input: gcp_project_id }.iam.gserviceaccount.com

  cloud_sql_instance:
    type: dell.gcp.nodes.CloudSQLInstance
    properties:
      gcp_config: *gcp_credentials
      instance_config:
        name: postgres-db
        database_version: POSTGRES_15
        region: { get_input: gcp_region }
        tier: db-f1-micro
        admin_password: { get_secret: { get_input: db_password_secret } }
    relationships:
      - target: cloud_run_service
        type: dell.relationships.depends_on

  cloud_storage_bucket:
    type: dell.gcp.nodes.StorageBucket
    properties:
      gcp_config: *gcp_credentials
      bucket_config:
        name: "app-data-{ get_sys: [deployment, id] }"
        location: US
        storage_class: STANDARD
    relationships:
      - target: cloud_run_service
        type: dell.relationships.depends_on

capabilities:
  cloud_run_endpoint:
    description: Cloud Run service endpoint URL
    value: { get_attribute: [cloud_run_service, service_url] }

  cloud_sql_connection:
    description: Cloud SQL instance connection string
    value: { get_attribute: [cloud_sql_instance, connection_name] }

  storage_bucket_name:
    description: Cloud Storage bucket name
    value: { get_attribute: [cloud_storage_bucket, bucket_name] }
```

### Step 3: Validate & Auto-Repair

Run linting with auto-repair (max 5 cycles):

```bash
dap-bpa blueprint lint --file my-gcp-blueprint/blueprint.yaml --repair --max-cycles 5
```

The CLI will:

1. Lint the blueprint against DAP and GCP schemas
2. Automatically fix structural issues (unpinned plugins, missing descriptions, etc.)
3. Validate each node template against the GCP plugin
4. Stop after 5 repair cycles or when no issues remain

Example output:

```json
{
  "lint": {
    "status": "pass",
    "cycles": 2,
    "issues_fixed": [
      {
        "rule": "IM-003",
        "message": "Plugin version unpinned",
        "fix": "Pinned gcp-plugin to >=1.0.0.0,<2.0.0.0"
      },
      {
        "rule": "IN-004",
        "message": "Input missing description",
        "fix": "Added description to service_image input"
      }
    ]
  },
  "validate": {
    "status": "pass",
    "node_count": 3,
    "nodes_valid": 3
  }
}
```

### Step 4: Multi-Turn Refinement

If the generated blueprint needs adjustments, use the refine endpoint:

```bash
dap-bpa gcp refine-blueprint \
  --blueprint-dir my-gcp-blueprint/ \
  --feedback "Add a Cloud Firestore database node and connect it to the Cloud Run service. Also add environment variables to the Cloud Run service for database credentials."
```

The refiner will:

1. Parse your feedback
2. Extract new resources (Cloud Firestore)
3. Update relationships and environment variables
4. Re-lint and repair
5. Return the improved blueprint

---

## GCP Resource Types Reference

| Resource Type | Node Type | Description |
| --- | --- | --- |
| Compute Engine VM | `dell.gcp.nodes.Compute` | GCE instance with custom machine type, image, boot disk config |
| Cloud Run Service | `dell.gcp.nodes.CloudRunService` | Serverless container execution with autoscaling, environment vars |
| Cloud SQL Instance | `dell.gcp.nodes.CloudSQLInstance` | Managed relational database (MySQL, PostgreSQL, SQL Server) |
| Cloud Storage Bucket | `dell.gcp.nodes.StorageBucket` | Object storage with lifecycle policies, versioning, encryption |
| Cloud Firestore Database | `dell.gcp.nodes.Firestore` | NoSQL document database with real-time sync |
| Pub/Sub Topic & Subscription | `dell.gcp.nodes.PubSubTopic` / `dell.gcp.nodes.PubSubSubscription` | Event streaming and message queue |
| Cloud Load Balancer | `dell.gcp.nodes.LoadBalancer` | Global/regional load balancing with health checks |
| Cloud VPC Network | `dell.gcp.nodes.Network` | Virtual Private Cloud with subnets, routes, firewall rules |
| Service Account | `dell.gcp.nodes.ServiceAccount` | IAM service account with roles and key bindings |
| Cloud KMS Key | `dell.gcp.nodes.KMSKey` | Encryption key for at-rest data protection |

---

## GCP Credential Configuration

### Service Account Authentication

GCP blueprints require a **service account JSON key**. Store it as a DAP secret:

```bash
# Create secret from service account JSON
dap-bpa orchestrator secrets create \
  --name gcp_service_account \
  --secret-schema service_account_json \
  --file ~/Downloads/sa-key.json
```

Then reference it in the blueprint:

```yaml
dsl_definitions:
  gcp_credentials: &gcp_credentials
    project_id: { get_input: gcp_project_id }
    service_account_json: { get_secret: gcp_service_account }
```

### Local Credential Validation

Validate credentials before deployment:

```bash
dap-bpa gcp validate-credentials \
  --service-account-json ~/sa-key.json \
  --project-id my-gcp-project
```

Returns validation status and available APIs/permissions.

---

## Best Practices

### 1. Always Pin Resource Versions

Use deterministic version pins for GCP resources:

```yaml
imports:
  - plugin:gcp-plugin?version= >=1.0.0.0,<2.0.0.0
```

### 2. Use Secrets for Sensitive Data

Never hardcode credentials, API keys, or passwords:

```yaml
# ✗ WRONG
admin_password: "MyS3cretP@ssw0rd"

# ✓ CORRECT
admin_password: { get_secret: cloud_sql_admin_password }
```

### 3. Design for Multi-Region Deployments

Use inputs to make region configurable:

```yaml
inputs:
  gcp_region:
    type: string
    default: us-central1
    constraints:
      - valid_values: [us-central1, us-west1, europe-west1, asia-southeast1]

node_templates:
  vm:
    properties:
      zone: { concat: [{ get_input: gcp_region }, "-a"] }
```

### 4. Implement Proper Relationship Dependencies

Always express dependencies explicitly:

```yaml
relationships:
  - target: cloud_sql_instance
    type: dell.relationships.depends_on  # Create DB first
  - target: cloud_storage_bucket
    type: dell.relationships.depends_on  # Then buckets
```

### 5. Monitor Cost with Labels

Add cost-tracking labels to all resources:

```yaml
labels:
  cost-center:
    values:
      - { get_input: cost_center }
      - engineering
```

---

## Troubleshooting

### Resource Extraction Fails with "Offline Fallback"

**Symptom**: `"degraded_accuracy": true` in extraction output

**Cause**: GCP schemas not downloaded locally

**Solution**:

```bash
dap-bpa knowledge plugins fetch gcp
```

Then re-run extraction. Offline fallback still works but with reduced accuracy.

### Cloud Run Service Won't Start

**Symptom**: Execution fails with `"unable to pull image"` error

**Cause**: Incorrect image URI or missing IAM permissions

**Solution**:

1. Verify image URI format: `gcr.io/PROJECT_ID/image:tag`
2. Ensure service account has `roles/container.developer`
3. Check image exists in Container Registry: `gcloud container images list --repository=gcr.io/PROJECT_ID`

### Cloud SQL Connection Timeouts

**Symptom**: Cloud Run service cannot reach Cloud SQL

**Cause**: Missing Cloud SQL Client IP or firewall rules

**Solution**:

1. Add Cloud SQL Client library to Cloud Run service environment
2. Ensure service account has `roles/cloudsql.client`
3. Configure authorized networks in Cloud SQL instance properties

### Secret Masking Not Working

**Symptom**: Service account JSON visible in logs

**Cause**: Direct reference to secret instead of `get_secret` function

**Solution**: Always use intrinsic functions:

```yaml
# ✗ WRONG - will be logged in plaintext
service_account_json: { get_input: sa_json_input }

# ✓ CORRECT - will be masked
service_account_json: { get_secret: gcp_service_account }
```

---

## Next Steps

1. **Try the interactive GCP extraction**: `dap-bpa gcp extract-resources --interactive`
2. **Review GCP plugin docs**: `dap-bpa knowledge plugins get gcp`
3. **Deploy your first GCP blueprint**: Use the generated blueprint with `dap-bpa monitor`
4. **Learn multi-region patterns**: See [Section 017: Model Architecture Decisions](../section-017-model-architecture-decisions/content.md)
