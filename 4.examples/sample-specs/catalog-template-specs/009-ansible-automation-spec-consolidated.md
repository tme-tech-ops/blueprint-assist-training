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

**Files** - `blueprint.yaml` + `infrastructure/ansible/{inputs,definitions,outputs}.yaml`, `playbooks/` (Ansible playbooks), `roles/` (Ansible roles), `inventory/` (inventory files), `group_vars/` and `host_vars/` (variable files), `CHANGELOG.yaml`, `README.md`, `icon.png`. Input groups: Playbook Configuration, Inventory, Credentials, Variables, Execution Options.

**Catalog template reference** Reference the catalog at [Dell Automation Studio Catalog - DevOps & CI/CD](../../1.sections/section-020-dell-automation-studio-catalog/category-devops-cicd.md)

**Target build folder** .\4.examples\target-build-folder\Ansible_demo

**Icon** - `icon.png` in the blueprint root. From 4.examples\sample-icons\ (use Ansible icon)

**Constitution reference** - Follows [DAP Blueprint Core Standards](../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)

**Done when** - Playbook syntax validated; inventory applied; playbook executed successfully; all tasks completed (or expected failures handled); target hosts configured; idempotent execution verified; bad inputs rejected pre-execution; no plaintext creds; lint + schema clean.

[Research patterns](../../1.sections/section-018-spec-considerations/content.md) · [Blueprint anatomy](../../1.sections/section-010-blueprint-anatomy/content.md) · [Supported blueprints](../../1.sections/section-006-supported-blueprints/content.md)
