# AI Reference Workflows with NVIDIA - Consolidated Spec

**Feature**: AI Reference Workflows with NVIDIA | **Created**: 2026-09-09 | **Status**: Ready

Deploys NVIDIA-validated AI reference workflows on Dell infrastructure. Intended for teams standing up AI/ML pipelines using the Dell + NVIDIA validated stack.

**Inputs** - AI workflow selection (LLM training, computer vision, NLP, etc.); GPU configuration (model, count, memory); framework selection (PyTorch, TensorFlow, etc.); dataset location and size; model checkpoint configuration; distributed training settings; monitoring and logging; storage configuration; network configuration; resource quotas.

## Technical Details

- **Inputs**:
- **Nodes**: `ai_workflow` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `nvidia_licensing_secret` (if using licensed NVIDIA software) MUST contain license credentials
- `dataset_access_secret` (if accessing secured datasets) MUST match storage auth type
- `model_registry_secret` (if using external model registry) MUST contain registry credentials

**Connection - GPU and storage** - GPU resources provisioned via NVIDIA GPU operator or direct passthrough. High-performance storage provisioned for datasets and model checkpoints. Network must allow high-bandwidth data transfer for distributed training.

**Template prerequisite** - Target infrastructure must have NVIDIA GPUs available with appropriate drivers. GPU operator must be installed for Kubernetes deployments. Storage must meet performance requirements for AI workloads. Network must support GPU-to-GPU communication for multi-GPU training.

**Outputs** - Training job ID, GPU allocation status, dataset mount status, model checkpoint location, training metrics, resource utilization, completion status, model artifact location.

**Files** - `blueprint.yaml` + `infrastructure/ai-workflows/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for training initialization), `configs/` (for framework configs), `workflows/` (pipeline definitions), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Workflow Selection, GPU Configuration, Framework, Storage, Monitoring.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\AI_Workflows_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use AI/GPU icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a workflow selection and 2 GPUs, when I deploy, then the training job is scheduled on nodes with the requested GPUs and `nvidia-smi` in the job shows them allocated.
- **AS-2** Given a dataset location and access secret, when I deploy, then the dataset is mounted and readable inside the job.
- **AS-3** Given checkpoint configuration, when the job runs, then checkpoints appear at the configured location at the configured interval.
- **AS-4** Given distributed training settings, when I deploy, then all workers join and the job completes with its model artifact at the reported location.
- **AS-5** Given a GPU count above what the target can schedule, or an unsupported framework, when I submit, then the inputs are rejected before any job is created.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a dataset path that does not exist, when I deploy, then the job fails at mount with a clear error, and `uninstall` removes the job, its pods, and claims.
- **AS-8** [lifecycle] Given a deployed workflow, when I run `uninstall`, then the jobs, pods, and claims it created are removed, and the dataset and exported model artifacts are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (GPU cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: framework images and models from a local registry and model store with `environment_type: airgapped`. Custom workflows (§3.6): a resume-from-checkpoint Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - GPU resources allocated; training workflow started; dataset accessible; model checkpoints saving; metrics being collected; training completes successfully; model artifacts accessible; bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\AI_Workflows_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/AI_Workflows_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./AI_Workflows_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
