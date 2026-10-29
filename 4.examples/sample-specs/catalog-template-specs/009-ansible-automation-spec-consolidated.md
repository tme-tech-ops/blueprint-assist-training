# Ansible Configuration Management - Consolidated Spec

**Feature**: Ansible Configuration Management | **Created**: 2026-09-09 | **Status**: Ready

Ansible configuration management and automation playbook execution. Deploys Ansible for configuration management and playbook-driven automation, enabling teams to integrate Ansible with DAP blueprint workflows.

**Inputs** - Ansible version; playbook source (local/Git repository); inventory configuration; variable files; target host selection; credential references; playbook parameters; execution mode (check/diff/apply); verbosity level; callback plugins; role dependencies.

## Technical Details

- **Inputs**:
- **Nodes**: `ansible_execution` (dell.nodes.SoftwareComponent) — props: none
- **Capabilities**: `deployment_status` — Deployment status

**Secret requirements** (verified against DAP secret manager) -

- `ansible_ssh_secret` MUST be a **`basic_auth_credentials`-type** secret for SSH access to target hosts (username/SSH key or password)
- `ansible_vault_secret` (if using encrypted variables) MUST be a **`password`-type** secret for vault password
- `target_credential_secrets` (for different host groups) MUST match authentication type (SSH, Windows WinRM, etc.)

**Connection - target hosts** - Target host connections managed via Ansible inventory and credential secrets. For SSH connections, use SSH key or password authentication. For Windows targets, use WinRM credentials. Network must allow appropriate protocol access (SSH port 22, WinRM ports 5985/5986).

**Template prerequisite** - Ansible control node must be available in execution environment. Target hosts must be accessible from control node. Playbooks and roles must be valid Ansible syntax. For Windows targets, WinRM must be configured on target hosts.

**Outputs** - Playbook execution status, task results, changed hosts, failed tasks, unreachable hosts, execution time, variable values used, inventory applied.

**Files** - `blueprint.yaml` + `infrastructure/ansible/{inputs,definitions,outputs}.yaml`, `playbooks/` (Ansible playbooks), `roles/` (Ansible roles), `inventory/` (inventory files), `group_vars/` and `host_vars/` (variable files), `CHANGELOG.md`, `README.md`, `icon.png`. Input groups: Playbook Configuration, Inventory, Credentials, Variables, Execution Options.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** - Always build into a named folder under the target build folder: `.\4.examples\target-build-folder\Ansible_demo\`. Never write blueprint files directly into `.\4.examples\target-build-folder\`. The folder name matches the blueprint name, and all blueprint paths are relative to it.

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Ansible icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Testing (constitution §5.7)** - Each scenario is proved by an observable outcome on the deployed environment, not by the YAML. When the full spec is written, tag each scenario with its FR ID; `/speckit.tasks` maps every scenario to at least one test task, and each run is recorded in `test-results.md` with the result, deployment ID, date, and dap-bpa version.

- **AS-1** Given a playbook source, inventory, and SSH secret, when I deploy, then the playbook runs and the configuration it applies is present on every target host.
- **AS-2** Given execution mode `check`, when I deploy, then the run reports the changes it would make and no target host is modified.
- **AS-3** Given encrypted variables and a vault password secret, when I deploy, then the run decrypts them and the password appears in no log.
- **AS-4** Given a Windows target group with WinRM credentials, when I deploy, then the playbook completes on those hosts.
- **AS-5** Given a playbook with a syntax error, when I deploy, then the run fails at syntax check before any host is contacted.
- **AS-6** [lifecycle] Given a deployed environment, when `install` is re-run or `update` runs with unchanged inputs, then nothing on the target changes (§5.3).
- **AS-7** [lifecycle] Given one unreachable host in the inventory, when I deploy, then the run reports it as unreachable, the other hosts complete, and the deployment fails with that host named.
- **AS-8** [lifecycle] Given a deployed run, when I run `uninstall`, then the cleanup playbook, if provided, reverts its changes; without one, the README states that uninstall does not revert host configuration (§3.2).

**Acceptance coverage** - Target modes (§2.2): cover inventory mode (target hosts chosen from onboarded environments) and manual mode (host list entered as free text). Air-gapped (§1.1): cover the air-gapped path: collections and roles installed from a local Galaxy or Git mirror with `environment_type: airgapped`. Custom workflows (§3.6): a re-run or check-mode Day-2 workflow, if defined, runs once against the test deployment. Partial install failure: AS-7. Clean uninstall: AS-8. Re-run changes nothing: AS-6.

**Done when** - Playbook syntax validated; inventory applied; playbook executed successfully; all tasks completed (or expected failures handled); target hosts configured; idempotent execution verified; bad inputs rejected pre-execution; no plaintext creds; lint `errorsFound: 0` and `validate-all` `Total errors: 0`; every acceptance scenario has a passing test recorded in `test-results.md`; spec updated with anything testing changed; visualizer generated last and saved in the blueprint folder; everything built under `target-build-folder\Ansible_demo\`, nothing loose in `target-build-folder\`.

**Final step - visualizer** - When the blueprint is complete, run from the named blueprint folder (`--file` and `--output` must both be inside the current directory): `cd 4.examples/target-build-folder/Ansible_demo && dap-bpa blueprint visualize --file ./blueprint.yaml --output ./Ansible_demo-visualizer.html`. Keep the HTML next to `blueprint.yaml`; regenerate it whenever the blueprint changes.

[Research patterns](../../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../../1.sections/section-006-supported-blueprints/content.md)
