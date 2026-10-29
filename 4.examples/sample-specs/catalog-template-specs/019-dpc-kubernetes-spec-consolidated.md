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

**Files** - `blueprint.yaml` + `infrastructure/dpc-kubernetes/{inputs,definitions,outputs}.yaml`, `manifests/` (for k3s configuration), `scripts/` (for cluster initialization), `addons/` (for Helm charts), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Endpoint Configuration, Cluster Settings, Networking, Storage, Addons.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Platform Services](../../../1.sections/section-020-dell-automation-studio-catalog/category-platform-services.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\DPC_Kubernetes_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Kubernetes/DPC icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given the 3-server endpoint configuration, when I deploy, then VMs exist on each endpoint and `kubectl get nodes` with the generated kubeconfig shows them all `Ready`.
- **AS-2** Given HA settings, when one server VM is powered off, then the cluster API stays available and workloads reschedule.
- **AS-3** Given addons and an ingress controller, when I deploy, then each addon's pods are running and a test workload is reachable through the ingress.
- **AS-4** Given the 1-server and 5-server configurations, when I deploy each, then the cluster forms with the matching node count.
- **AS-5** Given an endpoint count other than 1, 3, or 5, or VM sizing above an endpoint's free capacity, when I submit, then the inputs are rejected before any VM is created.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given an endpoint that cannot reach the others, when I deploy, then `install` fails at k3s cluster formation with a clear error, and `uninstall` removes every VM it created.
- **AS-8** [lifecycle] Given a deployed cluster, when I run `uninstall`, then the VMs on every endpoint and the cluster resources are removed, and the endpoints themselves are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (endpoints chosen from onboarded Distributed Private Cloud environments) and manual mode (endpoint addresses entered as free text). Air-gapped (§1.1): cover the air-gapped path: k3s air-gap images and addon charts from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a node-replacement or k3s-upgrade Day-2 workflow, if defined, runs once against the test cluster. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - VMs provisioned on all endpoints; k3s cluster formed; all nodes joined; cluster healthy; addons installed; workload deployable; accessible via kubeconfig; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\DPC_Kubernetes_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/DPC_Kubernetes_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./DPC_Kubernetes_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
