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

**Files** - `blueprint.yaml` + `infrastructure/tgi/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for model download and loading), `configs/` (for TGI serving parameters), `models/` (model configuration), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Model Configuration, GPU Configuration, Serving Parameters, Scaling, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Compute](../../../1.sections/section-020-dell-automation-studio-catalog/category-compute.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\TGI_Inference_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use AI/GPU icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a model, quantization, and GPU configuration, when I deploy, then the inference endpoint answers a generation request and the model-loaded capability is true.
- **AS-2** Given serving parameters for max tokens and batch size, when I send a request above the token limit, then TGI rejects it with a clear error.
- **AS-3** Given API authentication and its secret, when I call the endpoint without credentials, then the request is refused; with credentials, it succeeds.
- **AS-4** Given autoscaling with a minimum of 1 and a maximum of 3, when load exceeds the threshold, then replicas scale out and back in.
- **AS-5** Given a model whose weights exceed the selected GPU memory, when I submit, then the inputs are rejected before any pod is scheduled.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a gated model without valid access credentials, when I deploy, then `install` fails at model download with the registry error, and `uninstall` removes the TGI workload and its claims.
- **AS-8** [lifecycle] Given a deployed inference service, when I run `uninstall`, then the TGI workload, services, and claims it created are removed, and the GPU operator and cached models outside the deployment are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (GPU cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: TGI images and model weights from a local registry and model store with `environment_type: airgapped`. Custom workflows (§3.6): a model-swap or scale Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - TGI service running; model loaded into GPU memory; inference endpoint accessible; API authentication configured (if enabled); monitoring active; autoscaling configured (if enabled); bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\TGI_Inference_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/TGI_Inference_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./TGI_Inference_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
