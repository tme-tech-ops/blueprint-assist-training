# TGI LLM Inference Framework - Consolidated Spec

**Feature**: TGI LLM Inference Framework | **Created**: 2026-09-09 | **Status**: Ready

Configures an LLM inference framework using TGI on the Dell AI Platform with NVIDIA with the Dell pre-validated stack. Deploys Text Generation Inference (TGI) as an LLM serving framework on the Dell AI Platform with NVIDIA GPUs. Uses the Dell pre-validated hardware and software stack for inference optimization.

**Inputs** - Model selection (LLaMA, Mistral, Falcon, etc.); model size and quantization; GPU configuration (model, count, memory); TGI version; serving parameters (batch size, max tokens, temperature); scaling configuration (autoscaling, instance count); API authentication; monitoring and logging; storage for model weights; network configuration.

## Technical Details

- **Inputs**:
- **Nodes**: `tgi_inference` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `model_access_secret` (if using gated models) MUST contain Hugging Face or model registry credentials
- `nvidia_licensing_secret` (if using licensed NVIDIA software) MUST contain license credentials
- `api_auth_secret` (if securing inference API) MUST be a **`basic_auth_credentials`-type** secret

**Connection - GPU and storage** - GPU resources provisioned via NVIDIA GPU operator. High-performance storage provisioned for model weights. Network must allow API access to inference endpoint and model download from registry.

**Template prerequisite** - Target infrastructure must have NVIDIA GPUs with sufficient VRAM for selected model. GPU operator must be installed for Kubernetes deployments. Storage must meet performance requirements for model loading. Network must support high-throughput inference requests.

**Outputs** - Inference endpoint URL, model loaded status, GPU utilization, request metrics, latency metrics, scaling status, API authentication status, model version deployed.

**Files** - `blueprint.yaml` + `infrastructure/tgi/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for model download and loading), `configs/` (for TGI serving parameters), `models/` (model configuration), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Model Configuration, GPU Configuration, Serving Parameters, Scaling, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** .\4.examples\target-build-folder\TGI_Inference_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use AI/GPU icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - TGI service running; model loaded into GPU memory; inference endpoint accessible; API authentication configured (if enabled); monitoring active; autoscaling configured (if enabled); bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
