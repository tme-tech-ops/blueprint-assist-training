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

**Files** - `blueprint.yaml` + `infrastructure/nginx/{inputs,definitions,outputs}.yaml`, `configs/` (nginx.conf, site configs), `ssl/` (certificate files), `scripts/` (for configuration), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Configuration, SSL/TLS, Upstream Servers, Load Balancing, Security.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Web & Search Services](../../1.sections/section-020-dell-automation-studio-catalog/category-web-search-services.md)

**Target build folder** .\4.examples\target-build-folder\NGINX_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use NGINX icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - NGINX running and accessible; SSL configured (if enabled); upstream servers reachable; load balancing active; security headers applied; logging active; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
