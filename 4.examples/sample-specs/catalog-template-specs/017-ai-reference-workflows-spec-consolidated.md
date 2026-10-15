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

**Files** - `blueprint.yaml` + `infrastructure/ai-workflows/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for training initialization), `configs/` (for framework configs), `workflows/` (pipeline definitions), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Workflow Selection, GPU Configuration, Framework, Storage, Monitoring.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** .\4.examples\target-build-folder\AI_Workflows_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use AI/GPU icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - GPU resources allocated; training workflow started; dataset accessible; model checkpoints saving; metrics being collected; training completes successfully; model artifacts accessible; bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
