# GitLab DevOps Platform Deployment - Consolidated Spec

**Feature**: GitLab DevOps Platform Deployment | **Created**: 2026-09-09 | **Status**: Ready

GitLab source control, CI/CD pipelines, and DevOps collaboration platform. Deploys a self-hosted GitLab instance including source control, CI/CD pipeline runners, and DevOps collaboration tooling on Dell infrastructure.

**Inputs** - GitLab version; instance sizing (CPU, RAM, storage); admin credentials via secret; runner configuration; backup configuration; external database selection (if not using built-in); Redis configuration; SMTP settings for email; LDAP/AD integration; SSL/TLS certificate configuration; domain and URL settings.

## Technical Details

- **Inputs**:
- **Nodes**: `gitlab_server` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `gitlab_root_secret` MUST be a **`password`-type** secret for GitLab root password (plain string)
- `ldap_secret` (if using LDAP/AD) MUST be a **`basic_auth_credentials`-type** secret (bind DN/password)
- `smtp_secret` (if using email notifications) MUST contain SMTP credentials
- `runner_token_secret` (if registering external runners) MUST contain runner registration token

**Connection - storage and network** - GitLab storage provisioned via platform-native storage classes for repositories, database, and artifacts. Network access controlled via service definitions and ingress. For external database/Redis, use appropriate connection secrets.

**Template prerequisite** - Target infrastructure must support GitLab resource requirements (typically 4+ CPU, 8GB+ RAM for production). Storage class must be available with sufficient capacity for repositories and CI artifacts. Network must allow HTTP/HTTPS access to GitLab UI. For HA deployments, external PostgreSQL and Redis recommended.

**Outputs** - GitLab URL, admin credentials reference, runner status, backup status, system configuration, repository storage allocation, CI/CD pipeline status.

**Files** - `blueprint.yaml` + `infrastructure/gitlab/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments via Helm charts), `scripts/` (for configuration), `configs/` (for GitLab settings), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Server Configuration, Security, Runners, Integration, Backup.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** .\4.examples\target-build-folder\GitLab_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use GitLab icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - GitLab instance running; admin accessible; runners registered; SMTP configured (if enabled); backup configured (if enabled); accessible via URL; repositories creatable; CI/CD pipelines executable; bad inputs rejected pre-provision; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
