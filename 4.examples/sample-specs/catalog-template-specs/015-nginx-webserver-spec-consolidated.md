# NGINX Web Server Deployment - Consolidated Spec

**Feature**: NGINX Web Server Deployment | **Created**: 2026-09-09 | **Status**: Ready

NGINX web server and reverse proxy for application hosting and load balancing. Deploys NGINX as a web server and reverse proxy on Dell infrastructure for application hosting, SSL termination, and load balancing across backend services.

**Inputs** - NGINX version; instance sizing (CPU, RAM, storage); deployment mode (standalone, load balancer, reverse proxy); SSL/TLS certificate configuration; upstream server definitions; load balancing algorithm (round-robin, least_conn, ip_hash); caching configuration; rate limiting; security headers; access log configuration; custom nginx.conf parameters.

## Technical Details

- **Inputs**:
- **Nodes**: `nginx_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `ssl_certificate_secret` (if using HTTPS) MUST contain certificate and private key
- `basic_auth_secret` (if using basic authentication) MUST be a **`basic_auth_credentials`-type** secret
- `upstream_secret` (if backend requires authentication) MUST match backend auth type

**Connection - backend and network** - NGINX connects to backend upstream servers via HTTP/HTTPS. Network must allow traffic to backend services. For SSL termination, certificates must be provided. For load balancing, backend health checks must be reachable.

**Template prerequisite** - Target infrastructure must support NGINX resource requirements. Network must allow HTTP/HTTPS traffic to NGINX and backend services. SSL certificates must be valid if using HTTPS. Backend services must be accessible from NGINX instance.

**Outputs** - NGINX URL, SSL certificate status, upstream server health, load balancing status, access log location, error log location, configuration applied, performance metrics.

**Files** - `blueprint.yaml` + `infrastructure/nginx/{inputs,definitions,outputs}.yaml`, `configs/` (nginx.conf, site configs), `ssl/` (certificate files), `scripts/` (for configuration), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Server Configuration, SSL/TLS, Upstream Servers, Load Balancing, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Web & Search Services](../../../1.sections/section-020-dell-automation-studio-catalog/category-web-search-services.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\NGINX_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use NGINX icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given standalone mode, when I deploy, then the returned URL serves the default site with the configured security headers.
- **AS-2** Given reverse-proxy mode with two upstream servers and round-robin, when I send repeated requests, then both upstreams receive traffic.
- **AS-3** Given an SSL certificate secret, when I deploy, then HTTPS serves that certificate and HTTP redirects to HTTPS.
- **AS-4** Given rate limiting, when I exceed the limit, then NGINX returns 429.
- **AS-5** Given an invalid upstream address or a certificate secret without a private key, when I submit, then the inputs are rejected before NGINX is deployed.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a custom nginx.conf parameter that fails `nginx -t`, when I deploy, then `install` fails at configuration with the validation error, and `uninstall` removes the NGINX instance.
- **AS-8** [lifecycle] Given a deployed NGINX, when I run `uninstall`, then the instance, services, and configuration it created are removed, and the upstream services are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target environment chosen from onboarded environments) and manual mode (target endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: NGINX images or packages from a local registry or mirror with `environment_type: airgapped`. Custom workflows (§3.6): a configuration-reload or certificate-rotation Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - NGINX running and accessible; SSL configured (if enabled); upstream servers reachable; load balancing active; security headers applied; logging active; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\NGINX_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/NGINX_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./NGINX_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
