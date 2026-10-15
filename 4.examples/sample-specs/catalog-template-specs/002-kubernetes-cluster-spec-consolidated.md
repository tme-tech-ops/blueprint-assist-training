# Kubernetes Cluster Deployment - Consolidated Spec

**Feature**: Kubernetes Cluster Deployment | **Created**: 2026-09-09 | **Status**: Ready

Kubernetes cluster deployment, management, and orchestration on infrastructure platforms. Covers end-to-end Kubernetes cluster lifecycle: provisioning worker and control-plane nodes, configuring networking and storage, and ongoing cluster management.

**Inputs** - Cluster name and version; node count and sizing (control-plane vs worker); network plugin (Calico, Flannel, Cilium); storage class configuration; load balancer type; ingress controller selection; pod network CIDR; DNS configuration; dynamic target environment selection.

## Technical Details

- **Inputs**:
- **Nodes**: `kubernetes_cluster` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `kubeconfig_secret_name` MUST be a **`kubeconfig`-type** secret for cluster access after bootstrap
- `ssh_secret_name` MUST be a **`basic_auth_credentials`-type** secret for initial node provisioning (username/SSH key)
- `cloud_provider_secret` (if applicable) MUST match provider requirements (AWS/Azure/GCP service account keys)

**Connection - cloud provider / infrastructure** - Infrastructure connection details sourced from dynamic environment selection. For bare-metal deployments, use SSH credentials with proper key management. For cloud deployments, use provider-specific secret types.

**Template prerequisite** - Target infrastructure must meet Kubernetes minimum requirements (CPU, RAM, disk). Network must allow pod CIDR communication. For HA clusters, odd number of control-plane nodes recommended. Load balancer must be pre-provisioned or deployable via blueprint.

**Outputs** - Cluster endpoint URL, kubeconfig file path, node status, network configuration, storage class status, ingress controller endpoint, cluster health status.

**Files** - `blueprint.yaml` + `infrastructure/kubernetes/{inputs,definitions,outputs}.yaml`, `manifests/` (for additional K8s resources), `scripts/` (for bootstrap scripts), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Cluster Configuration, Node Sizing, Networking, Storage, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** .\4.examples\target-build-folder\Kubernetes_Cluster_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Kubernetes icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Cluster nodes provisioned and joined; control-plane healthy; network plugin operational; storage classes available; ingress controller running; cluster accessible via kubeconfig; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
