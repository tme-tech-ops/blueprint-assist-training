# Risk Analysis Rules Reference

> **Complete reference for all risk rules evaluated by the Blueprint Visualizer.** For each rule: severity, category, what it detects, and how to fix it.

---

## Quick Summary by Severity

| Severity | Count | Category | Examples |
|----------|-------|----------|----------|
| **High** | 2 | Security, Reliability | Hardcoded credentials, resource naming collisions |
| **Medium** | 9 | Reliability, Operability, Lifecycle | Isolated nodes, missing delete operations, external dependencies |
| **Low** | 4 | Operability | Unpinned plugins, unbounded inputs, missing input groups |
| **Info** | 4 | Operability | Missing display labels, descriptions, metadata |

---

## Security Rules

### SC-001: Hardcoded Credentials

**Severity:** High | **Category:** Security | **Fixable:** Yes

**Detects:** Sensitive values (passwords, API keys, tokens) written directly in blueprint YAML instead of using secrets.

**Why it matters:** Hardcoded credentials leak in version control, PRs, logs, and outputs. They're the #1 security incident vector.

**Examples of violations:**

```yaml
# ✗ WRONG
node_templates:
  database:
    properties:
      admin_password: "MySecretP@ss"  # Exposed in YAML!
      api_key: "sk-12345abcde"        # Visible in history!
```

**How to fix:**

```yaml
# ✓ CORRECT - use get_secret with a secret input
inputs:
  db_password_secret:
    type: secret_key
    constraints:
      - type: password

node_templates:
  database:
    properties:
      admin_password: { get_secret: { get_input: db_password_secret } }
      api_key: { get_secret: api_key_secret }

# Deploy with: dap-bpa orchestrator secrets create --name api_key_secret --file secret.txt
```

**Best practices:**
- All sensitive inputs use `type: secret_key`
- Reference via `get_secret` in node properties and operation inputs
- Never include `get_secret` in capabilities or outputs (they're logged)
- Store actual values in Dell Secrets Manager or orchestrator Vault

---

### SC-002: Weak Secret Key Naming

**Severity:** Medium | **Category:** Security | **Fixable:** Yes

**Detects:** Secret key inputs that don't follow naming conventions (e.g., `password` instead of `admin_password_secret`).

**How to fix:**

```yaml
# ✗ WEAK
inputs:
  password:
    type: secret_key

# ✓ CLEAR
inputs:
  postgres_admin_password_secret:
    type: secret_key
```

---

## Reliability Rules

### RC-001: Resource Naming Collisions

**Severity:** High | **Category:** Reliability | **Fixable:** No (design decision)

**Detects:** Multiple nodes managing the same external resource (e.g., two nodes both creating a VM with the same name).

**Why it matters:** Can cause deployment failures (resource already exists) or unintended resource overwrites.

**Example:**

```yaml
node_templates:
  vm_primary:
    type: dell.vsphere.nodes.Server
    properties:
      server:
        name: "production-vm"  # ← This name

  vm_secondary:
    type: dell.vsphere.nodes.Server
    properties:
      server:
        name: "production-vm"  # ← Same name — collision!
```

**How to fix:**

Choose one approach:

**Option A: Make names unique with inputs**

```yaml
inputs:
  vm_name_primary:
    type: string
    default: "production-vm-primary"

  vm_name_secondary:
    type: string
    default: "production-vm-secondary"

node_templates:
  vm_primary:
    properties:
      server:
        name: { get_input: vm_name_primary }

  vm_secondary:
    properties:
      server:
        name: { get_input: vm_name_secondary }
```

**Option B: Use dynamic naming**

```yaml
node_templates:
  vm_primary:
    properties:
      server:
        name: { concat: ["vm-", { get_sys: [deployment, id] }, "-primary"] }

  vm_secondary:
    properties:
      server:
        name: { concat: ["vm-", { get_sys: [deployment, id] }, "-secondary"] }
```

---

### ND-001: Isolated Node

**Severity:** Medium | **Category:** Reliability | **Fixable:** No (design decision)

**Detects:** A node with no incoming or outgoing relationships (no dependencies).

**Why it matters:** Nodes without relationships run in parallel with everything else. If that's unintended, it can cause ordering issues.

**Example:**

```yaml
node_templates:
  network:
    type: dell.vsphere.nodes.Network
    # No relationships ← runs in parallel with everything

  vm:
    type: dell.vsphere.nodes.Server
    # Should depend on network being created first
```

**How to fix:**

Add explicit relationships if a dependency exists:

```yaml
node_templates:
  vm:
    relationships:
      - target: network
        type: dell.relationships.depends_on
```

Or suppress if the node truly has no dependencies:

```
# .riskignore
ND-001:network
```

---

### ND-005: External Source Capacity Impact

**Severity:** Medium | **Category:** Reliability | **Fixable:** No

**Detects:** Using external resources (databases, queues, networks) that may have capacity constraints.

**How to fix:**
- Document capacity requirements in blueprint description
- Consider auto-scaling where available
- Set up monitoring alerts for capacity

---

### ND-006: Oversized Blast Radius

**Severity:** Medium | **Category:** Reliability | **Fixable:** No

**Detects:** A blueprint that manages many resources (>50), which increases complexity and failure risk.

**How to fix:**

Split large blueprints into smaller, focused modules:

```
Before: 1 blueprint managing 80 nodes
After:  4 blueprints managing 15-20 nodes each
```

---

## Operability Rules

### ND-002: External Resource Dependency

**Severity:** Medium | **Category:** Operability | **Fixable:** Yes

**Detects:** A node with `use_external_resource: true` that isn't documented.

**Why it matters:** The orchestrator won't create this resource; it must exist beforehand.

**Example:**

```yaml
node_templates:
  existing_network:
    type: dell.vsphere.nodes.Network
    properties:
      use_external_resource: true  # ← Must pre-exist!
      network:
        name: "production-net"
```

**How to fix:**

Document in description and add display label to inputs:

```yaml
inputs:
  existing_network_name:
    type: string
    display_label: Existing vSphere Network Name
    description: >-
      Name of a pre-existing vSphere distributed network.
      This network must be created manually in vCenter before deployment.
    default: "production-net"

node_templates:
  existing_network:
    properties:
      use_external_resource: true
      network:
        name: { get_input: existing_network_name }
```

Or add to blueprint description:

```yaml
description: >-
  Deploy a VM on vSphere.
  
  **Prerequisites:**
  - A pre-existing vSphere distributed network named 'production-net'
  - A pre-existing VM template named 'ubuntu-22.04'
```

---

### ND-003: Orphaned Attachment Risk

**Severity:** Medium | **Category:** Lifecycle | **Fixable:** No

**Detects:** An attachment or volume mapping that may leak on uninstall failure.

**How to fix:**
- Ensure corresponding delete operations exist
- Use contained_in relationships to force install order

---

### ND-004: Missing Delete Lifecycle

**Severity:** Medium | **Category:** Lifecycle | **Fixable:** Yes

**Detects:** A node with a `create` operation but no `delete` operation.

**Why it matters:** Without a delete operation, the node can't be cleanly removed during uninstall.

**Example:**

```yaml
node_templates:
  app:
    type: dell.nodes.ApplicationModule
    interfaces:
      dell.interfaces.lifecycle:
        create:                    # ← Create exists
          implementation: my.app.create
        # delete is missing ← Risk!
```

**How to fix:**

Implement a delete operation:

```yaml
node_templates:
  app:
    interfaces:
      dell.interfaces.lifecycle:
        create:
          implementation: my.app.create
        delete:                    # ← Add delete
          implementation: my.app.delete
```

---

### IM-003: Unpinned Plugin Version

**Severity:** Low | **Category:** Operability | **Fixable:** Yes

**Detects:** A plugin imported without a version constraint (e.g., `plugin:kubernetes-plugin` instead of `plugin:kubernetes-plugin?version= >=3.4.0.0,<4.0.0.0`).

**Why it matters:** Without pinning, the orchestrator uses whatever version is available, leading to non-deterministic behavior.

**Example:**

```yaml
# ✗ WRONG - unpinned
imports:
  - plugin:kubernetes-plugin

# ✓ CORRECT - pinned
imports:
  - plugin:kubernetes-plugin?version= >=3.4.0.0,<4.0.0.0
```

**How to fix:**

Use the blueprint rule reference table in [Section 010](../section-010-blueprint-anatomy/content.md) or run:

```bash
dap-bpa knowledge plugins list --pinned-versions

# Output shows recommended pins:
# kubernetes-plugin    >=3.4.0.0,<4.0.0.0
# ansible-plugin       >=4.1.8.0,<5.0.0.0
```

---

### IG-001: No Input Groups

**Severity:** Low | **Category:** Operability | **Fixable:** Yes

**Detects:** A blueprint with inputs but no `input_groups` section.

**Why it matters:** Input groups organize inputs into collapsible sections in the UI, improving usability.

**Example:**

```yaml
# ✗ WRONG
inputs:
  vm_cpu_count: { type: integer }
  vm_memory: { type: integer }
  database_password_secret: { type: secret_key }
  # No way to group these!

# ✓ CORRECT
input_groups:
  - display_label: VM Configuration
    inputs: [vm_cpu_count, vm_memory]
  - display_label: Database
    inputs: [database_password_secret]

inputs:
  vm_cpu_count:
    type: integer
    display: { group: vm, index: 1 }
  # ... etc
```

---

### IN-003: Missing Display Label

**Severity:** Info | **Category:** Operability | **Fixable:** Yes

**Detects:** An input without a human-readable `display_label`.

**How to fix:**

```yaml
# ✗ WRONG
inputs:
  pod_replicas:
    type: integer

# ✓ CORRECT
inputs:
  pod_replicas:
    type: integer
    display_label: Pod Replica Count
```

---

### IN-004: Missing Description

**Severity:** Info | **Category:** Operability | **Fixable:** Yes

**Detects:** An input without a `description`.

**How to fix:**

```yaml
inputs:
  pod_replicas:
    type: integer
    display_label: Pod Replica Count
    description: Number of pod replicas to deploy (1-10 for HA)
```

---

### IN-005: Missing Hidden Property

**Severity:** Info | **Category:** Operability | **Fixable:** Yes

**Detects:** An input without an explicit `hidden` property.

**How to fix:**

```yaml
inputs:
  # ✗ implicit (assuming false)
  region:
    type: string

  # ✓ explicit
  region:
    type: string
    hidden: false    # ← Be explicit

  # Secrets should always be hidden
  db_password_secret:
    type: secret_key
    hidden: true     # ← Never show to users
```

---

### IN-007: Unbounded Input

**Severity:** Low | **Category:** Operability | **Fixable:** Yes

**Detects:** An input without constraints (no `valid_values`, `pattern`, `in_range`, etc.).

**Why it matters:** Unbounded inputs can accept invalid values, causing deployment failures.

**Example:**

```yaml
# ✗ WRONG - no constraints
inputs:
  vm_memory:
    type: integer
    default: 1024

# ✓ CORRECT - bounded
inputs:
  vm_memory:
    type: integer
    default: 1024
    constraints:
      - valid_values: [512, 1024, 2048, 4096, 8192]
        error_message: "Must be a standard memory size"
```

---

### TD-001: Outdated TOSCA Version

**Severity:** Medium | **Category:** Lifecycle | **Fixable:** Yes

**Detects:** Using an outdated `tosca_definitions_version` (e.g., `dell_1_0` when current is `dell_1_1`).

**How to fix:**

```yaml
# ✗ OLD
tosca_definitions_version: dell_1_0

# ✓ CURRENT
tosca_definitions_version: dell_1_1
```

---

### TD-002: Legacy nativeedge References

**Severity:** Medium | **Category:** Operability | **Fixable:** Yes

**Detects:** Using old `nativeedge.*` prefixes instead of `dell.*`.

**How to fix:**

```yaml
# ✗ OLD
node_types:
  mytype:
    derived_from: nativeedge.nodes.Root

# ✓ CORRECT
node_types:
  mytype:
    derived_from: dell.nodes.Root
```

---

### CP-001: No Capabilities

**Severity:** Info | **Category:** Operability | **Fixable:** No

**Detects:** A blueprint with no capabilities or outputs defined.

**Why it matters:** Capabilities expose values to users and other deployments; without them, users can't easily discover what the deployment created.

**How to fix:**

```yaml
# ✓ ADD CAPABILITIES
capabilities:
  web_endpoint:
    description: URL to access the deployed web application
    value: { get_attribute: [web_server, url] }

  database_connection:
    description: Database connection string
    value: { concat: [
      "postgres://",
      { get_attribute: [database, host] },
      ":5432/mydb"
    ] }
```

---

## Composer-Specific Rules

For blueprints using `dell.nodes.ServiceComponent` sub-deployments:

### COMP-001: Unresolved Component

**Severity:** High | **Category:** Reliability | **Fixable:** No

**Detects:** A ServiceComponent that references a blueprint that doesn't exist or can't be resolved.

**How to fix:**
- Ensure referenced blueprint is uploaded
- Check blueprint ID matches exactly (case-sensitive)
- Verify orchestrator access

### COMP-002: Component Circular Dependency

**Severity:** High | **Category:** Reliability | **Fixable:** No

**Detects:** ServiceComponents that depend on each other in a cycle.

**How to fix:**
- Restructure components to remove cycle
- Add an intermediate orchestrator blueprint

---

## Using Risk Findings in CI/CD

### Fail on High-Severity Risks

```bash
dap-bpa blueprint visualize --file ./my-blueprint --fail-on-severity high
# Exit code 1 if any High-severity findings exist
```

### Suppress Known Issues

```
# .riskignore
# Suppress all input-metadata findings
IN-003
IN-004
IN-005

# Suppress only on specific node
ND-001:logging_service

# Suppress by exact title
No capabilities or outputs defined
```

### Export Risks for Analysis

```bash
dap-bpa blueprint visualize --file ./my-blueprint --export json

# risks.json contains all findings
jq '.risk' my-blueprint-data.json | grep 'High'
```

---

## Next Steps

1. **Generate a visualizer**: `dap-bpa blueprint visualize --file ./my-blueprint`
2. **Review the Risk Analysis panel** for your blueprint
3. **Click any finding** to see the rule reference and remediation steps
4. **Use `blueprint-risk-fix` skill** to auto-fix common issues
5. **Add `.riskignore`** if you need to suppress specific findings (with good reason!)
