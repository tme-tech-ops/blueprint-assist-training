# Dell Private Cloud Kubernetes Deployment - Consolidated Spec

**Feature**: Dell Private Cloud Kubernetes Deployment | **Created**: 2026-09-09 | **Status**: Ready

Creates Virtual Machines on three Dell Distributed Private Cloud Endpoints (1, 3, and 5 servers with workload) and runs the k3s HA installation on top. Provisions VMs across Distributed Private Cloud endpoint configurations (1, 3, or 5 servers) and deploys a k3s high-availability Kubernetes cluster on top. Purpose-built for lightweight Kubernetes at the edge.

**Inputs** - Endpoint configuration (1, 3, or 5 servers); k3s version; cluster name; network configuration; storage configuration; VM sizing per endpoint; high-availability settings; load balancer configuration; ingress controller selection; addon selection (Helm, storage classes, etc.); workload deployment options.

## Technical Details
- **Inputs**:
- **Nodes**: `dpc_cluster` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `cluster_status` — Status of the DPC Kubernetes cluster


**Secret requirements** (verified against DAP secret manager) -
- `dpc_endpoint_secret` MUST be a **`basic_auth_credentials`-type** secret for Distributed Private Cloud endpoint access
- `k3s_cluster_secret` MUST contain cluster token for node joining
- `load_balancer_secret` (if using external LB) MUST contain LB credentials

**Connection - DPC endpoints** - Distributed Private Cloud endpoint connections sourced from endpoint secrets. Network must allow communication between endpoints for cluster formation. For self-signed certificates, set `allow_insecure: true` in connection config.

**Template prerequisite** - Distributed Private Cloud endpoints must be accessible and have sufficient resources for VM provisioning. Network must allow inter-endpoint communication for k3s cluster formation. Storage must be available on endpoints for VM disks.

**Outputs** - Cluster endpoint URL, kubeconfig file path, node status per endpoint, cluster health, VM allocation per endpoint, network configuration, storage status, addon status.

**Files** - `blueprint.yaml` + `infrastructure/dpc-kubernetes/{inputs,definitions,outputs}.yaml`, `manifests/` (for k3s configuration), `scripts/` (for cluster initialization), `addons/` (for Helm charts), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Endpoint Configuration, Cluster Settings, Networking, Storage, Addons.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Platform Services](../../1.sections/section-020-dell-automation-studio-catalog/category-platform-services.md)

**Target build folder** .\4.examples\target-build-folder\DPC_Kubernetes_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Kubernetes/DPC icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - VMs provisioned on all endpoints; k3s cluster formed; all nodes joined; cluster healthy; addons installed; workload deployable; accessible via kubeconfig; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
