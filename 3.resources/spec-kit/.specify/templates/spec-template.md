# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

<!--
  DAP blueprint spec template, adapted from the stock Spec Kit template for
  the DAP Blueprint Core Standards (constitution 2.5.0).

  Testing starts here (constitution §5.7). Every functional requirement needs
  at least one acceptance scenario that a test can prove on the deployed
  environment. /speckit.tasks turns each scenario into a test task, so a
  requirement without a scenario has no test.

  Describe WHAT and WHY only. Plugin choices, node types, and YAML layout
  belong in plan.md.
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language: who deploys or operates the
blueprint, what they provide, and what they get.]

**Why this priority**: [The value it delivers and why it comes first]

**Independent Test**: [How this story can be tested on its own against a
non-production DAP environment, for example "deploy with the default inputs
and confirm the VM answers on its returned IP address"]

**Acceptance Scenarios**:

<!--
  Number scenarios AS-1, AS-2, ... across the whole spec and tag each with
  the requirement it proves. Each Then clause MUST describe an outcome you
  can observe on the deployed environment, not a property of the YAML.
-->

1. **AS-1** [FR-001] **Given** [initial state], **When** [action],
   **Then** [observable outcome]
2. **AS-2** [FR-002] **Given** [initial state], **When** [action],
   **Then** [observable outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority]

**Independent Test**: [How this story can be tested on its own]

**Acceptance Scenarios**:

1. **AS-3** [FR-00X] **Given** [initial state], **When** [action],
   **Then** [observable outcome]

---

### Lifecycle and failure scenarios *(mandatory)*

<!--
  Constitution §5.6 and §5.7 require these for every blueprint. Keep the ones
  that apply and fill in the specifics.
-->

- **AS-[N]** [lifecycle] **Given** a deployed environment, **When** `install`
  is re-run or `update` runs with unchanged inputs, **Then** nothing on the
  target changes (§5.3)
- **AS-[N]** [lifecycle] **Given** [a precondition that makes install fail
  partway, for example a missing template or an unreachable endpoint],
  **When** I deploy, **Then** the deployment fails with [a specific error]
  and `uninstall` removes everything that was created
- **AS-[N]** [lifecycle] **Given** a deployed environment, **When** I run
  `uninstall`, **Then** every resource the blueprint created is removed and
  pre-existing resources are untouched (§3.2)

### Edge Cases

- What happens when [boundary condition, for example an input at the edge of
  its allowed range]?
- How does the blueprint handle [error scenario, for example a secret of the
  wrong schema]?

### Acceptance coverage (constitution §5.7) *(mandatory)*

<!--
  Mark each row Covered (list the scenarios) or Not applicable (say why).
  "Not applicable" without a reason fails review.
-->

| Area | Status | Scenarios / reason |
| ---- | ------ | ------------------ |
| Each `target_mode` the blueprint supports (§2.2) | | |
| Air-gapped path (§1.1) | | |
| Each custom workflow (§3.6) | | |
| `install` that fails partway | | |
| `uninstall` leaves no orphaned resources (§3.2) | | |
| Re-run changes nothing (§5.3) | | |

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The blueprint MUST [specific capability, for example "deploy a
  VM from a named template"]
- **FR-002**: The blueprint MUST [specific capability]
- **FR-003**: Operators MUST be able to [key interaction]
- **FR-004**: The blueprint MUST [input validation requirement]
- **FR-005**: The blueprint MUST [output or capability it exposes]

*Example of marking unclear requirements:*

- **FR-006**: The blueprint MUST authenticate to [NEEDS CLARIFICATION: which
  secret schema - `vsphere`, `basic_auth_credentials`, or another?]

### Target Environment and Credentials

<!-- Constitution §2.2 and §2.3. Delete for service/component sub-blueprints. -->

- **Target modes**: [inventory, manual, or both, and why]
- **Connection details**: [read from the parent environment's capabilities,
  or entered as free text in manual mode]
- **Credentials**: [the secret schema each `secret_key` input requires]

### Key Entities *(include if the blueprint manages structured data)*

- **[Entity 1]**: [What it represents and its key attributes]
- **[Entity 2]**: [What it represents and its relationships]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable outcome, for example "a deployment completes and
  returns its IP address within ten minutes"]
- **SC-002**: [Measurable outcome]
- **SC-003**: The blueprint passes `dap-bpa blueprint lint --verify --schema`
  with `errorsFound: 0` and `dap-bpa blueprint validate-all` with
  `Total errors: 0` (§5.2)

## Lint Findings Accepted *(include only if any)*

<!--
  Record any finding a rule's own wording allows, such as the IN-011
  exception in constitution §2.2. Waivers of SHOULD rules go in plan.md's
  Complexity Tracking table instead.
-->

| Rule | Input or node | Why it is allowed |
| ---- | ------------- | ----------------- |

## Assumptions

- [Assumption about the target environment, for example "templates have
  VMware Tools installed"]
- [Assumption about scope boundaries]
