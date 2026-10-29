# PostgreSQL Database Deployment - Consolidated Spec

**Feature**: PostgreSQL Database Deployment | **Created**: 2026-09-09 | **Status**: Ready

PostgreSQL database deployment and management for relational data workloads. Automates PostgreSQL deployment, configuration, and ongoing lifecycle management for teams running relational data workloads on Dell infrastructure.

**Inputs** - Database name and version; instance sizing (CPU, RAM, storage); storage class and size; admin credentials via secret; database user creation; backup configuration; replication settings (if HA); network access controls; extensions to install; performance tuning parameters.

## Technical Details

- **Inputs**:
- **Nodes**: `postgresql_database` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `postgres_admin_secret` MUST be a **`password`-type** secret for PostgreSQL admin password (plain string)
- `postgres_user_secret` (optional) MUST be a **`password`-type** secret for application user password
- `backup_secret` (if using external backup) MUST match backup system requirements

**Connection - storage and network** - Database storage provisioned via platform-native storage classes. Network access controlled via service definitions and network policies. For external storage arrays, use appropriate storage plugin secrets.

**Template prerequisite** - Target infrastructure must support PostgreSQL resource requirements. Storage class must be available with sufficient capacity. Network must allow database port access (default 5432). For HA deployments, sufficient nodes for replicas.

**Outputs** - Database endpoint URL, connection string, admin credentials reference, storage allocation, replication status, backup status, database version, performance metrics.

**Files** - `blueprint.yaml` + `infrastructure/postgresql/{inputs,definitions,outputs}.yaml`, `manifests/` (for K8s deployments), `scripts/` (for initialization), `configs/` (for tuning), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Database Configuration, Storage, Security, Backup, Performance.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - Databases](../../../1.sections/section-020-dell-automation-studio-catalog/category-databases.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\PostgreSQL_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use database icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a database name, version, and storage size, when I deploy, then `psql` with the returned connection string connects and `SELECT version()` reports the requested version.
- **AS-2** Given an application user and its password secret, when I deploy, then that user can connect to the database and the admin password appears in no input file or log.
- **AS-3** Given backup enabled, when I deploy, then a backup completes and a restore of it into a scratch database succeeds.
- **AS-4** Given replication enabled for HA, when I deploy, then the replica reports streaming replication from the primary.
- **AS-5** Given a storage size below the minimum or an unsupported version, when I submit, then the inputs are rejected before any volume is created.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given a storage class without enough capacity, when I deploy, then `install` fails while binding the volume, and `uninstall` removes the pods, services, and claims it created.
- **AS-8** [lifecycle] Given a deployed database, when I run `uninstall`, then the database pods, services, and claims are removed, and backups kept outside the deployment are untouched (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target cluster chosen from onboarded environments) and manual mode (cluster endpoint entered as free text). Air-gapped (§1.1): cover the air-gapped path: PostgreSQL images and extensions pulled from a local registry with `environment_type: airgapped`. Custom workflows (§3.6): a backup or restore Day-2 workflow, if defined, runs once against the test database. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - PostgreSQL instance running; database created; users configured; storage allocated; backup configured (if enabled); accessible via connection string; bad inputs rejected pre-provision; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\PostgreSQL_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/PostgreSQL_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./PostgreSQL_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
