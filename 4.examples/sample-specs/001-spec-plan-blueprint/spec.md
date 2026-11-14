# <Blueprint name> Specification

**Author**: <your name> | **Date**: <YYYY-MM-DD> | **Status**: Draft |
**Type**: <Infrastructure / Application / Service> Blueprint

> **How to read this template**
>
> - Sections marked **(required)** are the minimum for a first spec. Sections
>   marked **(optional)** add detail. Skip them on your first pass and come
>   back when you know more.
> - Replace everything in `< >` with your own text, then delete the
>   *Example* lines and these hints.
> - References such as **§2.3** point to sections of the
>   [DAP Blueprint constitution](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md),
>   the standards every blueprint must meet. You don't need to read all of
>   it before you start. Open the referenced section when you reach it.
> - Describe **what** the blueprint does and **why**. Leave out **how**
>   (plugins, node types, YAML layout). That goes in the plan.

---

## 1. Summary (required)

<Two or three sentences: what does this blueprint deploy, where, and for whom?>

*Example: Deploys a single Ubuntu 22.04 VM on vSphere from a prepared
template, so a developer can get a ready-to-use test server without opening
vCenter.*

## 2. User story (required)

As a <role>, I want to <do something>, so that <benefit>.

*Example: As a developer, I want to deploy a Linux VM by choosing a size and
a network, so that I can start testing within minutes.*

### Additional user stories (optional)

If the blueprint serves more than one need, list each story with a priority
so the most important one is built and tested first.

- **P1**: <the core story above>
- **P2**: <a secondary story, for example "As an operator, I want to resize
  the VM later without redeploying">

## 3. Requirements (required)

Requirements say what the blueprint MUST do. Number each one (FR-001,
FR-002, ...) so tests and tasks can refer to it. One requirement covers one
capability.

- **FR-001**: The blueprint MUST <capability>.
- **FR-002**: The blueprint MUST <capability>.
- **FR-003**: The blueprint MUST <capability>.

*Example: **FR-001**: The blueprint MUST let the user choose a VM size of
`small` (2 vCPU, 4 GB) or `large` (4 vCPU, 8 GB).*

If you are not sure about something, mark it rather than guessing:

*Example: **FR-004**: The blueprint MUST authenticate to vCenter using
[NEEDS CLARIFICATION: which secret schema, `vsphere` or
`basic_auth_credentials`?].*

### Non-functional requirements (optional)

Qualities rather than features: security, reliability, compatibility.

- **Security**: <for example "uses least-privilege vCenter credentials"
  (§4.1)>
- **Reliability**: <for example "re-running install changes nothing" (§5.3)>
- **Compatibility**: <for example "vSphere 7.0 or later">

## 4. Target environment (optional)

Where the blueprint deploys to. A top-level blueprint that deploys into an
environment MUST let the user choose the target (§2.2) in one of two ways:

- **Inventory**: pick an environment that is already set up in Dell
  Automation Platform. The connection details come from that environment.
- **Manual**: type the connection details, such as a vCenter address, plus
  a credential.

Supported modes: <inventory, manual, or both, and why>

*Example: Both. Most users pick a vCenter from inventory. Manual mode is
for lab vCenters that are not onboarded yet.*

## 5. Inputs (required)

What the user fills in when they deploy. Every input needs a clear label and
a description, and should be validated wherever it can be (§2.4).

| Input | Type | Required | Default | Allowed values / validation | Description |
| ----- | ---- | -------- | ------- | --------------------------- | ----------- |
| <name> | <string / integer / boolean / list> | <yes / no> | <value or none> | <range, list, or pattern> | <what it is for> |

*Example: `vm_size` | string | yes | `small` | `small`, `large` | Size of
the VM.*
*Example: `hostname` | string | yes | none | letters, numbers, hyphens; must
not start with a hyphen | Name of the VM.*

### Input groups (optional)

If you have more than five or six inputs, group them so the deployment form
is easier to read.

*Example: **Connection** (target and credentials), **VM** (size, template,
disk), **Network** (network name, DHCP or static IP).*

## 6. Credentials (required if the blueprint needs any)

Which secrets the blueprint needs. Never put passwords, keys, or tokens in
the spec, the inputs, or the blueprint. The user picks a secret from the
platform's secret manager (§2.3, §4.2).

| Secret input | Secret schema | Used for |
| ------------ | ------------- | -------- |
| <name>_secret | <schema> | <what it is for> |

*Example: `vcenter_credentials_secret` | `vsphere` | Logging in to vCenter
to clone the VM.*

To see the available schemas, run `dap-bpa knowledge secret-type list`.

## 7. Outputs (required)

What the blueprint reports back when the deployment finishes.

| Output | Description |
| ------ | ----------- |
| <name> | <what it is> |

*Example: `ip_address` | The IP address of the new VM, such as
`192.168.1.100`.*

## 8. Acceptance tests (required)

How you will prove the blueprint works. Testing starts in the spec (§5.7).
Every requirement needs at least one test.

Write each test as **Given / When / Then**, number it (AS-1, AS-2, ...),
and tag it with the requirement it proves. The **Then** part must be
something you can see on the deployed system, not something in the YAML.

1. **AS-1** [FR-001] Given <starting state>, when <action>, then
   <result you can observe>.
2. **AS-2** [FR-002] Given <starting state>, when <action>, then
   <result you can observe>.

*Example: **AS-1** [FR-001] Given size `large`, when I deploy, then vCenter
shows the VM with 4 vCPUs and 8 GB of memory.*

### Lifecycle tests (required)

Every blueprint needs these three. Fill in the specifics.

- **AS-N** [lifecycle] Given a deployed blueprint, when I run `install`
  again or run `update` with unchanged inputs, then nothing changes (§5.3).
- **AS-N** [lifecycle] Given <something that makes the install fail partway,
  for example a template that does not exist>, when I deploy, then it fails
  with <a clear error>, and `uninstall` removes whatever was created.
- **AS-N** [lifecycle] Given a deployed blueprint, when I run `uninstall`,
  then everything the blueprint created is removed, and anything that
  existed before is left alone (§3.2).

### Edge cases (optional)

Unusual inputs or conditions worth testing.

- <What happens when an input is at the edge of its allowed range?>
- <What happens when a secret of the wrong type is chosen?>

## 9. Success criteria (optional)

Measurable signs that the blueprint is done.

- **SC-001**: <for example "a deployment finishes and returns the IP address
  within 10 minutes">
- **SC-002**: The blueprint passes `dap-bpa blueprint lint --verify --schema`
  and `dap-bpa blueprint validate-all` with no errors (§5.2).
- **SC-003**: The blueprint uploads to the orchestrator without errors.

## 10. Build location (optional)

Where Blueprint Assist should create the blueprint. Always use a folder
named after the blueprint.

*Example: `4.examples/target-build-folder/Ubuntu_VM_Vsphere/`*

## 11. Dependencies and assumptions (optional)

What must already exist, and what you are taking for granted.

- **Dependencies**: <for example "a vSphere template with VMware Tools
  installed">
- **Assumptions**: <for example "the network has DHCP enabled">

## 12. Out of scope (required)

What this blueprint will NOT do. This keeps the blueprint focused.

- <item>

*Example: Installing applications inside the VM.*

## 13. Open questions (required)

Anything you are unsure about. It is fine to leave these for review.

- <question>

---

## Before you hand it off

- [ ] Every requirement (FR) has at least one acceptance test (AS).
- [ ] Every input has a type, a description, and validation where possible.
- [ ] No passwords, keys, or tokens appear anywhere in the spec.
- [ ] The three lifecycle tests are filled in.
- [ ] Out of scope and open questions are written down, even if short.
