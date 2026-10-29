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

**Files** - `blueprint.yaml` + `infrastructure/kubernetes/{inputs,definitions,outputs}.yaml`, `manifests/` (for additional K8s resources), `scripts/` (for bootstrap scripts), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Cluster Configuration, Node Sizing, Networking, Storage, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Kubernetes_Cluster_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Kubernetes icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a target environment and node counts of 3 control-plane and 2 worker nodes, when I deploy, then `kubectl get nodes` with the generated kubeconfig shows all 5 nodes `Ready`.
- **AS-2** Given network plugin Calico and a pod CIDR, when I deploy, then pods on different nodes can reach each other and receive addresses from that CIDR.
- **AS-3** Given a storage class configuration, when I deploy, then a test PersistentVolumeClaim binds and a pod can write to it.
- **AS-4** Given an ingress controller selection, when I deploy, then a test service exposed through the ingress endpoint answers HTTP requests.
- **AS-5** Given zero control-plane nodes or a pod CIDR that overlaps the node network, when I submit the inputs, then they are rejected before any node is provisioned.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a worker node that cannot reach the control plane, when I deploy, then `install` fails at node join with a clear error, and `uninstall` removes every node it created.
- **AS-8** [lifecycle] Given a deployed cluster, when I run `uninstall`, then every node, load balancer, and volume the blueprint created is removed and the target infrastructure is otherwise untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (an onboarded environment chosen in the dynamic target selection) and manual mode (infrastructure endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: Kubernetes images, CNI manifests, and charts pulled from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a node-scaling or version-upgrade Day-2 workflow, if defined, runs once against the test cluster. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Cluster nodes provisioned and joined; control-plane healthy; network plugin operational; storage classes available; ingress controller running; cluster accessible via kubeconfig; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Kubernetes_Cluster_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Kubernetes_Cluster_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Kubernetes_Cluster_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
