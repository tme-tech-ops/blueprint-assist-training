<!--
Sync Impact Report
- Version change: 2.4.0 -> 2.5.0
- Added: 5.7 Testing & Acceptance. Specs define a testable
  acceptance criterion for every functional requirement; tasks.md
  carries a mandatory test plan that maps each criterion to a test
  task; results are recorded per run; and the spec is updated to
  match the delivered blueprint
- Changed: 5.6 Definition of Done requires a passing, recorded test
  plan and an up-to-date spec (5.7)
- Templates affected: Spec Kit's tasks template marks tests optional;
  5.7 makes them mandatory, so projects SHOULD update their copy of
  the template or instruct /speckit.tasks accordingly
- Earlier amendments: see the project changelog
- Follow-up TODOs: confirm the only_with dictionary form in 2.2 in
  the DAP UI
-->

# Constitution: Dell Automation Platform (DAP) Blueprint Core Standards

## Adoption & Conventions

- **Adopting this template.** Copy this file to
  `.specify/memory/constitution.md` in your project. Spec Kit
  commands (`/speckit.plan`, `/speckit.analyze`) read that path for
  the Constitution Check; a file under any other name is not
  enforced. Set the Ratified and Last Amended dates on adoption.
- **Normative language.** MUST, MUST NOT, SHOULD, SHOULD NOT, and
  MAY are used as defined in RFC 2119. MUST rules are gates; SHOULD
  rules may be departed from only with a justification recorded in
  the implementation plan.
- **Citing principles.** Principles are cited by section number
  (for example, §4.2). Section numbers are stable and are not
  reused after removal. Specs, plans, and tasks SHOULD cite the
  sections they satisfy.
- **Rule references.** `lint:` IDs refer to the Blueprint Best
  Practice Rules (`blueprint-rules.md` v1.4, installed by dap-bpa
  under `~/.blueprint-assist/rules/`), which `dap-bpa blueprint lint`
  enforces. `risk:` IDs refer to Blueprint Visualizer risk findings.
  The two catalogs reuse some IDs with different meanings, so always
  keep the prefix.
- **Precedence of platform rules.** The Mandatory lint rules are the
  minimum standard. This constitution MAY tighten them but MUST NOT
  relax them. A project `blueprint_rules_override.md` that relaxes a
  Mandatory rule is an amendment to this constitution.
- **Tool versions.** Tool behaviour described in this document (lint
  and validation output, exit codes, file names, and features noted
  as unavailable) was verified against dap-bpa v0.32.0 and
  `blueprint-rules.md` v1.4. Re-verify those statements when either
  is upgraded, and amend this document if they change.

---

## 1. Core Principles

### 1.1 Platform Alignment
- All artifacts MUST target the Dell Automation Platform
  orchestrator.
- Blueprints MUST be written in the platform's TOSCA DSL and MUST
  declare `tosca_definitions_version: dell_1_1` (lint: TD-001,
  risk: TD-001).
- Type references, plugin names, and interface names MUST use
  `dell.*` branding, never `cloudify.*` or `nativeedge.*`
  (lint: TD-002). Plugin namespaces under `dell.*`, such as the
  edge plugin's `dell.nodes.nativeedge.template.NativeEdgeVM`, are
  compliant.
- The blueprint MUST leverage the platform's available
  orchestration plugins (e.g., Ansible, Terraform, OpenTofu,
  Helm, Kubernetes, bare-metal provisioning plugins, or any other
  plugins made available via the Blueprint Assist skill)
  appropriate to the target infrastructure.
- Every node type MUST exist in an imported plugin. Node types
  MUST NOT be invented; verify each one with
  `dap-bpa knowledge plugins get <plugin> <node_type>`.
- Every plugin import MUST pin a compatible version range, for
  example `plugin:ansible-plugin?version= >=4.1.8.0,<5.0.0.0`
  (lint: IM-003, risk: IM-003).
- A blueprint MUST be deployable from a single upload to the DAP
  catalog (or via the DAP API). Dependencies outside the blueprint
  package are allowed only when declared:
  - Pre-existing resources (`use_external_resource: true`) MUST be
    documented in the blueprint `description` and in the
    description of the input that names them (risk: ND-002).
  - Composed blueprints (`dell.nodes.ServiceComponent`) and shared
    deployments (`dell.nodes.SharedResource`) MUST be available in
    the target orchestrator and MUST NOT form a dependency cycle
    (risk: BS-005 "Unresolved Component Definition" and the
    "Recursive Component Reference" finding). See §3.3 for choosing
    between them.
- Blueprints SHOULD support both internet-connected and air-gapped
  (on-premises) targets where possible, distinguished by an
  `environment_type` input with `valid_values` of
  `internet_connected` and `airgapped` (lint: BS-008). Anything
  downloaded at deploy time (packages, images, collections) MUST
  have an air-gapped alternative or be documented as an
  internet-only requirement.

### 1.2 Declarative Infrastructure-as-Code (IaC)
- All infrastructure resources (bare-metal servers, virtual
  machines, containers, network objects, storage volumes) MUST be
  provisioned using declarative Infrastructure-as-Code
  methodologies via the appropriate DAP plugin.
- Imperative scripts or direct API/CLI calls MUST NOT be used
  where a declarative plugin node type exists for the target
  resource.
- Where no declarative plugin node type exists, a script MAY be
  used through a lifecycle operation, provided that:
  - the script lives in its own file (for example under
    `scripts/`), never inline in YAML (lint: ND-005);
  - every persistent change it makes is reversed by a paired
    teardown operation (§3.2);
  - its use and rationale are called out in the blueprint
    documentation and the implementation plan.

### 1.3 Spec-Driven Governance
- This project follows Spec-Driven Development (SDD).
- The Spec is the single, absolute source of truth for all
  implementation work.
- The AI agent MUST NOT generate or modify implementation code
  without first updating the Spec and producing a technical plan
  via `/speckit.plan`.
- Every code change MUST trace back to a Spec section or sub-task
  generated by `/speckit.tasks`.

---

## 2. User Experience & Workflow Constraints

### 2.1 Dynamic User Inputs
- The blueprint deployment workflow MUST expose clearly defined,
  user-facing inputs so the blueprint can be run seamlessly from
  the DAP GUI, or can integrate cleanly with ITSM and self-service
  workflows via standard DAP APIs.

### 2.2 Mandatory Target Environment Selection
- **Scope.** This section applies to top-level workload blueprints:
  blueprints labelled `environment` (§3.5) that deploy into an
  environment. It does not apply to `service` or `component`
  sub-blueprints, which receive their target from the parent
  blueprint through `deployment.inputs` or
  `get_environment_capability`, or to environment-provider
  blueprints, which are themselves the target.
- The blueprint MUST let the user choose a Target Environment in
  one of two modes, selected by a `target_mode` input with
  `valid_values: [inventory, manual]` and the display label
  "Target Environment Source".
- **Inventory mode.** The target is an environment deployment
  (labelled `csys-obj-type: environment`, §3.5) already onboarded
  in Dell Automation Platform:
  - The user MUST choose it from the environments they are
    authorized to deploy to (e.g., bare-metal nodes, vCenter
    clusters, OpenShift/Kubernetes endpoints, resource pools, or
    edge locations). The chosen environment is the deployment's
    parent.
  - Connection details MUST be read from the parent's capabilities
    with `get_environment_capability` (lint: CP-004). A
    `deployment_id` input MUST NOT be used to select the deploy
    target (lint: IN-011), except under the IN-011 exception below.
  - Inputs that depend on the target (clusters, networks,
    datastores, policies) SHOULD be drop-downs that query the Dell
    Automation Platform's live inventory via `get_inventory` at
    render time, with `jmespath` in `valid_values` shaping the
    result, following the plugin's documented pattern. At
    deployment creation the UI calls the inventory capability of
    the connected environment deployment and fills the drop-down
    from the structured data it returns.
- **IN-011 exception.** A `type: deployment_id` input is permitted,
  and the resulting IN-011 finding is a justified exception that
  the rule's own wording allows, only when all three conditions
  hold:
  1. **A peer deployment's runtime capability is needed.** The
     blueprint resolves a value from a specific, named running
     deployment with `get_capability: [{ get_input: <id> }, <cap>]`,
     for example a Dell Distributed Private Cloud NED's
     `ece_service_tag` or a PowerStore onboarding deployment's
     `external-id`.
  2. **`get_environment_capability` cannot substitute.** That
     intrinsic resolves capabilities only from the blueprint's own
     parent environment; it cannot target a peer or
     infrastructure-layer deployment by ID. If it would work,
     IN-011 is a real finding and MUST be fixed.
  3. **A node consumes the input at install time.** An input used
     only as a UI selector and never referenced in a node template
     is not covered; it is a separate `no-unused-inputs` finding
     that MUST be fixed.

  Each accepted IN-011 finding MUST be recorded in the spec's lint
  findings table, stating which input it applies to and how each
  condition is met.
- **Manual mode.** The target is entered as free text, so the
  blueprint can deploy to an environment not yet onboarded into or
  managed by Dell Automation Platform:
  - Free-text inputs MUST cover the endpoint (host or URL, port)
    and scope (namespace, tenant, or datacenter) the blueprint
    needs, each constrained with a `pattern` per §2.4.
  - Credentials MUST still come from a `secret_key` input (§2.3).
    Free text MUST NOT be used for credentials.
  - Manual-mode inputs MUST set `only_with: { target_mode: manual }`
    so they appear only when manual mode is selected.
- Target connection details SHOULD be resolved in one place, for
  example a `precreate` resolver node that reads the inventory or
  manual source according to `target_mode` and exposes the result
  as runtime properties. Other nodes then read the target with
  `get_attribute`. Manual mode MUST NOT depend on an onboarded
  environment existing.
- `get_inventory` drop-downs render only in the DAP UI. Every input
  they populate MUST also accept a value supplied directly through
  the CLI or API, so ITSM and self-service callers are supported
  (§2.1).
- The selected target determines the API endpoint, namespace or
  tenant scope, and the network/storage resources available to the
  blueprint execution graph.

### 2.3 Mandatory Dynamic Drop-Down: Credentials / Secrets
- A blueprint that needs credentials its environment does not
  supply (for example in §2.2 manual mode, or for an external
  service) MUST offer a dynamic drop-down labelled "Deployment
  Credentials" that queries the Dell Automation Platform's
  integrated secret manager. Credentials the parent environment
  publishes (§3.5) MUST be read from its capabilities instead of
  being asked for again.
- Inputs that select a secret MUST use `type: secret_key` with a
  `constraints: - type: <secret_schema>` entry naming the secret
  schema, for example `ssh_private_key` (lint: SC-002). This lets
  the drop-down list only secrets of that schema. Run
  `dap-bpa knowledge secret-type list` for the available schemas.
- Secret inputs SHOULD be named with a `_secret` suffix that
  states their purpose, for example
  `postgres_admin_password_secret` (risk: SC-002).
- The secret name passed to `get_secret` MUST be resolved, never a
  literal string (lint: SC-001). It comes from one of:
  - a `secret_key` input: `{ get_secret: { get_input: <name>_secret } }`;
  - an environment or peer capability, keyed when the secret holds
    several fields:
    `{ get_secret: [{ get_environment_capability: <cap> }, <key>] }`;
  - a runtime attribute, such as a sibling component capability or a
    key generated during install:
    `{ get_secret: { get_attribute: [<node>, capabilities, <cap>] } }`.
- Credentials, SSH keys, API tokens, certificates, and passwords
  MUST NEVER be hardcoded in blueprint YAML, provisioning scripts,
  cloud-init templates, Ansible variables, Terraform tfvars, or
  any other artifact in the repository.
- Only credential references (secret names or vault IDs) may
  appear in the code.

### 2.4 Input Validation
- All user inputs MUST let any authorized user unfamiliar with the
  project deploy it successfully. Specifically:
  - Every input MUST declare a `type` (lint: IN-001). List inputs
    MUST declare `item_type` (lint: IN-002).
  - Every input MUST have a `display_label` in Title Case with no
    underscores (lint: IN-003).
  - Every input MUST have a `description`, which renders as tooltip
    help text (lint: IN-004).
  - Every input MUST set `hidden` explicitly, even when `false`
    (lint: IN-005).
  - Every input MUST be validated with `constraints` wherever
    applicable (`valid_values`, `pattern`, `in_range`,
    `min_length`/`max_length`; booleans use
    `valid_values: [true, false]`), and every constraint MUST have
    an `error_message` (lint: IN-007, IN-008).
  - Every non-hidden input MUST set `display.group` and
    `display.index`, and belong to a group defined in the top-level
    `input_groups` (lint: IN-009, IG-002). Each group MUST have a
    `display_label`, `collapsible: true`, an `index`, and its
    `inputs` list (lint: IG-001).
  - `allow_update` MUST be set deliberately: `false` for values
    that cannot change after install, such as names and identifiers
    (lint: IN-006), and `true` for values that support Day-2
    updates.
  - Conditional inputs SHOULD be hidden with `only_with` or
    `exclusive_with` (lint: IN-010).
  - Defaults SHOULD be provided where sensible. Use an empty string
    rather than `null`.
  - Custom structures in inputs and node properties MUST use data
    types, and every data type attribute MUST have a `type` and a
    `description` (lint: DT-001, DT-003).

---

## 3. Architecture & High-Availability Requirements

### 3.1 Networking & Storage Integration
- Blueprints MUST define consistent networking and storage
  connectivity using mechanisms native to the selected Target
  Environment (e.g., Multus NetworkAttachmentDefinitions for
  Kubernetes, VLAN tagging for bare-metal, vSwitch port groups
  for vCenter, or dynamic Load Balancer configurations).
- Workload ingress and access pathways MUST follow
  high-availability best practices and MUST use standardized
  exposure patterns (Routes, Ingress Controllers, Load Balancers,
  API gateways, or firewall rules) appropriate for the target
  platform.
- Storage volumes (persistent disks, block mappings, NFS mounts)
  MUST be provisioned declaratively via the target platform's
  native storage integration (e.g., StorageClasses, PowerStore
  block mappings, or Terraform-managed volumes).

### 3.2 Lifecycle Completeness
- Every node MUST implement, or inherit from its type, the
  operations the `install` and `uninstall` workflows need
  (lint: ND-002).
- Lifecycle operations under `dell.interfaces.lifecycle` MUST be
  paired: `create` with `delete`, and `start` with `stop`
  (risk: ND-004). The interface has no `unconfigure` operation, so
  changes made in `configure` MUST be reverted in `stop` or
  `delete`.
- Uninstall MUST revert every persistent change made during
  install, such as mounts, fstab entries, services, cron jobs,
  firewall rules, users, configuration edits, and packages. It MUST
  leave no orphaned resources, including attachments and volume
  mappings (lint: ND-003, risk: ND-003).
- A blueprint that supports the `update` workflow MUST implement
  `check_drift` and `postupdate` alongside `update`. This tightens
  the Optional rule lint: ND-009, which recommends the full set
  (`check_drift`, `preupdate`, `update`, `postupdate`,
  `update_config`, `update_apply`, `update_postapply`, `preheal`,
  `heal`, `postheal`).
- Node ordering MUST be explicit. Every non-starting node MUST be
  connected by a relationship (lint: ND-001, risk: ND-001). A node
  that reads another node's runtime state with `get_attribute` MUST
  also declare `dell.relationships.depends_on` on that node. Node
  definitions SHOULD appear in execution order (lint: ND-008).
- Script-based operations SHOULD set `max_retries`,
  `retry_interval`, and `timeout` deliberately rather than relying
  on defaults.
- Post-deployment health checks SHOULD run in `poststart`.

### 3.3 Capabilities & Composition
- Values exposed by a deployment MUST be declared under
  `capabilities:`, not the legacy `outputs:`, and each capability
  MUST have a `description` (lint: CP-002) and a `value`.
- Every blueprint MUST expose all relevant deployment information,
  such as endpoints, IP addresses, and resource identifiers, as
  capabilities (lint: CP-001, risk: CP-001).
- Capabilities MUST NOT contain `get_secret` values or any other
  secret material; they are visible in the orchestrator UI.
- Capabilities are the public contract of a blueprint. Removing or
  renaming one is a breaking change under §5.4.
- **Choosing a composition mechanism.** Use the mechanism that
  matches who owns the other deployment's lifecycle:

  | Need | Mechanism | Read values with |
  |---|---|---|
  | Create and own a sub-deployment that installs and uninstalls with this one | `dell.nodes.ServiceComponent` | `get_attribute: [node, capabilities, key]` |
  | Reference an existing, independently managed deployment without owning it | `dell.nodes.SharedResource` | `get_capability: [deployment_id, key]` (lint: CP-003) |
  | Run inside the deployment's parent environment | Parent environment (§3.5) | `get_environment_capability: key` (lint: CP-004) |

- Major reusable components MUST be defined as separate blueprints
  and referenced as `ServiceComponent` nodes (lint: ND-006). Each
  component MUST live in its own subdirectory (lint: BS-005).
- `ServiceComponent` nodes MUST pin the component with
  `blueprint.revision_id`, not `version` (lint: ND-007).
  `revision_id` is matched exactly; it cannot express a range. They
  SHOULD set `deployment.display_name` from
  `{ get_sys: [deployment, name] }` with `auto_inc_suffix: true` to
  avoid name collisions (§3.4). Blueprint IDs and revision pins
  SHOULD live in a hidden input rather than in node templates.
- `SharedResource` nodes MUST take the target deployment ID from an
  input, never a literal. They connect to the existing deployment
  rather than creating one; on uninstall the type runs
  `disconnect_deployment`, not a delete of the shared deployment.
- Reading a capability from a sibling component MUST use the
  three-part path `[node, capabilities, key]`.
- **Optional components.** A node or component MAY be made optional
  with `capabilities.scalable.properties.default_instances` driven
  by a `jmespath` expression that returns an integer (`0` or `1`).
  A set of nodes that must be present or absent together SHOULD use
  `groups` with `dell.policies.scaling` policies instead.
  `resource_config.control_installation` MUST NOT be used; it is not
  implemented in the current release.
- Inputs that apply only to an optional component SHOULD use
  `only_with` so they are hidden when the component is disabled.
  The controlling input SHOULD set `allow_update: false`, and the
  blueprint documentation MUST state that changing it later requires
  a deployment update.

### 3.4 Reliability & Scale
- Names of externally visible resources MUST NOT collide between
  nodes or between deployments of the same blueprint. Derive names
  from inputs or from `{ get_sys: [deployment, id] }`
  (risk: RC-001).
- A blueprint SHOULD NOT manage more than 50 nodes. Larger
  topologies SHOULD be split into composed blueprints (§3.3)
  (risk: ND-006).
- Capacity assumptions about external resources SHOULD be
  documented in the blueprint description (risk: ND-005).

### 3.5 Object Types, Environment Providers & Workloads
- `csys-obj-type` is a system label that tells the DAP portal and
  orchestrator what kind of object a deployment or blueprint is. It
  drives categorization, filtering, and icons, and builds the
  portal's tree view: an `environment` is the top-level container,
  and `service` and `component` deployments appear beneath it.
  - In `labels`, it applies to each **deployment** at runtime.
  - In `blueprint_labels`, it applies to the **blueprint** in the
    catalog.

  | Value | Set in | Use for |
  |---|---|---|
  | `environment` | `labels` | A top-level deployment: a full environment of infrastructure and application together, such as a master orchestrator blueprint. Standalone blueprints deployed on their own are also top-level. |
  | `service` | `labels` | A service or application layer, typically a `ServiceComponent` sub-deployment. Shown nested under its environment. |
  | `component` | `labels` | A reusable infrastructure component, such as a VM sub-blueprint used by several services. |
  | `resource` | `labels` | A shared infrastructure resource, such as storage or a network. |
  | `blueprint` | `blueprint_labels` | Marks the blueprint as a blueprint artifact in the catalog view. |

- Every blueprint MUST set `labels.csys-obj-type` to the one value
  from the table that matches how its deployments are used:
  - a blueprint deployed on its own, or one that orchestrates
    sub-deployments, MUST use `environment`;
  - a blueprint deployed only as a `ServiceComponent` MUST use
    `service` for an application layer or `component` for reusable
    infrastructure;
  - a blueprint for shared infrastructure that other deployments
    reference (for example through `SharedResource`) SHOULD use
    `resource`.
- `blueprint_labels` SHOULD include `csys-obj-type: blueprint`.
  Other classification keys MAY be added alongside it (§5.5).
- Every blueprint MUST also state its role in its `description` and
  `README.md`:
  - **Environment provider**: other deployments run inside it or
    reference it (for example vCenter, a NativeEdge endpoint, or a
    PowerStore array).
  - **Workload**: it runs inside an environment.
  - **Both**: for example a VM blueprint that applications are
    later deployed onto.
- **Environment providers:**
  - MUST publish what consumers need to connect as capabilities.
    Credentials are published as secret *names*, which consumers
    resolve with the keyed form
    `{ get_secret: [{ get_environment_capability: <cap> }, <key>] }`;
    secret values are never published (§3.3).
  - Providers whose inventory feeds `get_inventory` drop-downs MUST
    expose that inventory as a capability whose value is a list or
    dict that `jmespath` can query.
  - MUST document every capability consumers rely on. Removing or
    renaming one is a MAJOR change (§5.4).
- **Workloads:**
  - MUST read environment details with `get_environment_capability`
    (lint: CP-004), not by asking the user to re-enter values the
    environment already provides or by selecting the target with a
    `deployment_id` input (lint: IN-011). The manual mode and the
    IN-011 exception in §2.2 are the only exceptions.
  - MUST list in `README.md` the capabilities they require from
    their environment, so operators can confirm a provider is
    compatible before deploying.

### 3.6 Custom Workflows & Day-2 Operations
- Custom `workflows:` MAY be used for on-demand or scheduled Day-2
  actions on deployed resources, such as backups, health checks,
  license application, or upgrades. They MUST NOT be used for
  one-time install logic (use lifecycle operations, §3.2) or to
  change a deployment's structure (use a deployment update).
- Workflows SHOULD use the utilities plugin custom workflow mapping
  (`plugins_custom_workflow.plugins_custom_workflow.tasks.customwf`)
  with `nodes_to_runon` and `operations_to_execute`. Python workflow
  code MUST be justified in the implementation plan.
- Every operation a workflow runs MUST be implemented on each node
  it targets.
- Workflows SHOULD declare `availability_rules`, such as
  `node_instances_active` and `operations_required`, so they cannot
  run against a partially installed deployment or one missing an
  operation.
- Every user-facing workflow MUST have a `display_label` and a
  `description`. The description MUST state expected duration and
  any disruptive effect, such as a reboot or service outage.
  Destructive workflows MUST say so explicitly.
- Workflow parameters MUST have a `description` and SHOULD have a
  `default`. Parameters meant to be overridden at run time MUST set
  `allow_kwargs_override: true`; without it, overrides fail
  silently.
- Secrets MUST NOT appear in workflow parameters or `run_data`;
  resolve them through §2.3.
- Scheduled workflows (`deployment_settings.default_schedules`) MUST
  be idempotent (§5.3), and their schedule MUST be documented in
  `README.md`.

---

## 4. Security Requirements

### 4.1 Zero Trust & Least Privilege
- Any roles, IAM policies, RBAC bindings, or service accounts
  provisioned or utilized by the blueprint MUST adhere to least
  privilege, requesting only the minimum permissions required for
  execution.

### 4.2 Secret Hygiene
- Secret material MUST NOT exist in plain text anywhere in the
  repository, manifests, execution payloads, capabilities, or DAP
  orchestrator logs (risk: SC-001).
- Secrets required for Day-0 / Day-1 provisioning (e.g., bootstrap
  passwords, TLS certificates, cloud-init credentials) MUST be
  injected securely at runtime via DAP's native secret management
  capabilities (vault references, Kubernetes Secret resources, or
  equivalent mechanisms for the target platform), using the
  patterns in §2.3.
- Scripts MUST NOT echo, log, or write resolved secret values.

### 4.3 Transport Security
- Connections to target platforms and external services MUST verify
  TLS certificates by default.
- Where a plugin offers a switch that disables verification (for
  example vSphere `allow_insecure`, or Kubernetes `verify_ssl` and
  `insecure_skip_tls_verify`), the blueprint MUST either set it to
  the verified mode or expose it as an input that defaults to the
  verified mode, with a description stating the risk of disabling
  it.
- Private certificate authorities SHOULD be supported by supplying
  the CA bundle (for example through a `secret_key` input or a
  `cafile` property), not by disabling verification.

---

## 5. Code Quality & Repository Standards

### 5.1 File Structure
- Blueprints MUST use the multi-file structure. This tightens
  lint: BS-010, which allows a single file only for one plugin, at
  most two node templates, and fewer than five inputs.
- A blueprint with both infrastructure and application parts MUST
  use the layered layout:

  ```text
  <blueprint>/
  ├── blueprint.yaml        # imports, description, input_groups, labels
  ├── CHANGELOG.md          # revision history (lint: BS-009)
  ├── README.md             # deployment documentation
  ├── infrastructure/       # for example vm/
  │   ├── inputs.yaml
  │   ├── definitions.yaml  # node_templates
  │   ├── capabilities.yaml
  │   └── scripts/
  └── application/          # for example app/
      ├── inputs.yaml
      ├── definitions.yaml
      └── ansible/
  ```

- A blueprint with only one part (for example pure infrastructure)
  MAY use the basic split instead: `inputs.yaml`,
  `definitions.yaml` (or `node_templates` in `blueprint.yaml`), and
  `capabilities.yaml` alongside `blueprint.yaml`, `CHANGELOG.md`, and
  `README.md`.

- All blueprint files MUST live in one top-level directory and its
  subdirectories, with one main blueprint YAML file per top-level
  blueprint (lint: BS-001, BS-002, BS-003).
- The main `blueprint.yaml` MUST contain
  `tosca_definitions_version`, `description`, `imports`,
  `input_groups`, `labels`, and `blueprint_labels`. `input_groups`
  MUST appear only in the top-level YAML (lint: BS-004).
- Where both exist, infrastructure and application parts MUST be in
  separate subdirectories, as in the layered layout above, so
  application logic stays portable across infrastructure
  (lint: BS-006). The capabilities file MAY be named
  `outputs.yaml`, but its key MUST be `capabilities:`.
- Only the main `blueprint.yaml` imports `dell/types/types.yaml`
  and plugins (lint: IM-001, IM-002). Split files and
  sub-blueprints are listed in its `imports` (lint: IM-004).
- Node template IDs MUST be unique across all files.
- Reusable blocks MUST be defined once as YAML anchors in
  `dsl_definitions` and reused through aliases (lint: DS-001).
  Anchors are scoped to the file that declares them, so values
  shared across files MUST be passed as inputs.
- Internal artifacts MUST reside in appropriately named
  subdirectories (lint: BS-007):
  - `terraform/` - Terraform / OpenTofu modules
  - `ansible/` - Ansible roles and playbooks
  - `helm/` - Helm charts
  - `manifests/` - Kubernetes/platform manifests (one
    sub-directory per component)
  - `templates/` - Configuration templates
  - `scripts/` - Lifecycle and utility scripts
- Only directories relevant to the blueprint's target
  infrastructure need to be present.

### 5.2 Linting & Validation
- Every blueprint MUST pass, with zero errors:
  1. `dap-bpa blueprint lint --file blueprint.yaml --verify --schema`
  2. `dap-bpa blueprint validate-all --file blueprint.yaml`
- Pass or fail MUST be judged from the tool's reported results, not
  its exit code. `blueprint lint` exits `0` even when it reports
  errors; scripts MUST check `errorsFound` in its `--json` output.
  `validate-all` passes when its summary shows `0 invalid` and
  `Total errors: 0`.
- The Risk Analysis panel produced by
  `dap-bpa blueprint visualize --file blueprint.yaml` MUST be
  reviewed, and MUST show no High-severity findings other than those
  suppressed in `.riskignore` and recorded under Governance
  (waivers). The visualizer has no fail-on-severity option, so this
  is a review step rather than an automated gate.
- Lint warnings SHOULD be resolved. Any warning or risk finding
  left in place MUST be justified under Governance (waivers).
- All YAML SHOULD pass `yamllint` with the project `.yamllint`
  configuration.
- All supporting IaC code MUST pass its respective
  industry-standard validation tool:
  - Terraform / OpenTofu → `terraform validate`
  - Ansible → `ansible-lint`
  - Helm → `helm lint`
  - Kubernetes manifests → `kubectl apply --dry-run=client`
    or equivalent CI validation
- These checks SHOULD run in CI on every pull request that touches
  a blueprint.

### 5.3 Idempotency & Drift Remediation
- Every lifecycle operation, playbook, and manifest MUST be
  idempotent: a retry MUST NOT change state, and re-running the
  blueprint against an already-deployed environment MUST converge
  without errors or data loss. Track state in runtime properties or
  by querying the external system (lint: ND-004).
- A blueprint that supports the `update` workflow MUST express drift
  detection and remediation through its `check_drift` and `update`
  lifecycle operations (§3.2). A blueprint without Day-2 support
  MUST say so in its `README.md`, so operators know drift is not
  detected.

### 5.4 Versioning
- Every blueprint, and every component subdirectory, MUST include a
  `CHANGELOG.md` that records each revision, keyed by a Semantic
  Versioning 2.0 version, with a ticket, developer, and description
  for each change (lint: BS-009):

  ```yaml
  # Changelog for <blueprint_name>
  1.0.0:
    - ticket: INITIAL
      developer: Your Name
      description: Initial blueprint creation
  ```

- The file MUST be named `CHANGELOG.md`; its content uses the YAML
  layout above. `blueprint-rules.md` v1.4 names the file
  `CHANGELOG.yaml`, but `dap-bpa blueprint lint` v0.32.0, the `dap`
  skill, and the library blueprints all use `CHANGELOG.md`, and the
  linter reports `CHANGELOG.yaml` as missing.

- MAJOR versions mark breaking changes: removed or renamed inputs
  or capabilities, or changes that force redeployment. MINOR
  versions mark backward-compatible additions. PATCH versions mark
  fixes.

### 5.5 Labels & Classification
- Every blueprint MUST define both `labels` and
  `blueprint_labels` (lint: BS-004). Each label key maps to an
  object with a single `values` list containing exactly one string.
- `csys-obj-type` values MUST follow §3.5.
- The blueprint `description` MUST summarize what is deployed and
  list any prerequisites (§1.1).

### 5.6 Definition of Done
A blueprint change is complete only when:
- All checks in §5.2 pass.
- In a non-production environment, the blueprint has completed
  `install`, a second `install` or `update` run that changes
  nothing (§5.3), and `uninstall` that leaves no orphaned resources
  (§3.2).
- Every custom workflow (§3.6) has been run at least once against
  that non-production deployment.
- Every test in the test plan has passed, its results are recorded,
  and the spec matches the delivered blueprint (§5.7).
- `CHANGELOG.md` and `README.md` reflect the change.
- Every waiver is recorded in the implementation plan.

### 5.7 Testing & Acceptance
Testing starts in the spec, not after the code is written.

- **Acceptance criteria in the spec.** Every functional requirement
  in the spec MUST have at least one acceptance criterion that a
  test can prove. Each criterion MUST describe an observable outcome
  on the deployed environment (for example a Given/When/Then
  acceptance scenario), not a property of the YAML. Spec Kit's spec
  template holds these under "User Scenarios & Testing" and
  "Success Criteria".
- **Coverage.** Where they apply, acceptance criteria MUST cover:
  - each `target_mode` the blueprint supports (§2.2);
  - the air-gapped path (§1.1);
  - each custom workflow (§3.6);
  - an `install` that fails partway, and the state it leaves behind;
  - `uninstall` leaving no orphaned resources (§3.2).
- **Test plan in the tasks.** `tasks.md` MUST include a test plan.
  Every acceptance criterion MUST map to at least one test task that
  cites the requirement it proves (for example `FR-003`). Spec Kit's
  tasks template treats tests as optional; under this constitution
  they are mandatory, so `/speckit.tasks` MUST generate them. The
  test plan MUST also include the lifecycle tests in §5.6.
- **Coverage check.** `/speckit.analyze` SHOULD be run before
  `/speckit.implement` to confirm that every requirement has a test
  task.
- **Static checks per slice.** The §5.2 checks SHOULD run after each
  implementation slice, not only at the end, so a failure is traced
  to the slice that caused it.
- **Running the tests.** Tests MUST run against a non-production DAP
  environment. Each run MUST be recorded in the feature directory
  (for example `specs/<feature>/test-results.md`) with the test task,
  result, deployment ID, date, and dap-bpa version.
- **Failures.** A failed test MUST be fixed and the affected tests
  re-run. If the fix changes behaviour that the spec describes, the
  spec MUST be updated before the fix is merged.
- **Write back.** Before the change is marked done, the spec, plan,
  and test plan MUST be updated to match the delivered blueprint, so
  that fixes, edge cases, and decisions made during testing are not
  lost.

---

## Governance

- This constitution supersedes all other project practices and
  guidelines, subject to the precedence of platform rules stated
  under Adoption & Conventions.
- Amendments MUST be documented with a version bump, rationale,
  and migration plan for any affected blueprints or
  configurations. Each amendment MUST update the Sync Impact Report
  at the top of this file.
- All pull requests and code reviews MUST verify compliance with
  these principles. Non-compliance MUST be flagged and resolved
  before merge.
- Complexity beyond what these principles require MUST be
  explicitly justified in the implementation plan.
- **Waivers.** Any departure from a SHOULD rule, any lint warning
  left in place, and any `.riskignore` entry MUST be recorded in
  the plan's Complexity Tracking table with the rule ID, the
  affected file or node, and the reason. MUST rules cannot be
  waived; they can only change by amendment. Exceptions that a
  rule's own wording allows, such as the IN-011 exception in §2.2,
  are not waivers, but MUST still be recorded as that section
  requires.
- Versioning follows semantic versioning: MAJOR for principle
  removals or redefinitions, MINOR for new principles or material
  expansions, PATCH for clarifications and wording fixes.

**Template Version**: 2.5.0 |
**Ratified**: [YYYY-MM-DD, set on adoption] |
**Last Amended**: [YYYY-MM-DD, set on each amendment]
