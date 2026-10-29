---
description: "Task list template for DAP blueprint implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories
and acceptance scenarios), research.md, data-model.md

**Tests are MANDATORY**: constitution §5.7 requires a test plan in this
file. Every acceptance scenario in spec.md MUST map to at least one test
task, and every test task MUST cite the requirement and scenario it proves.
(The stock Spec Kit template treats tests as optional; this template does
not.)

**Organization**: Implementation tasks are grouped by user story so each
story can be built and reviewed as one slice. Test tasks are collected in the
Test Plan phase so they can be run, re-run, and recorded as a set.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1, US2, ...)
- Test tasks use `[FR-xxx] [AS-x]` in place of the story tag
- Include exact file paths in descriptions

## Path Conventions

- Main blueprint: `<blueprint>/blueprint.yaml`
- Infrastructure part: `<blueprint>/infrastructure/<platform>/`
- Application part: `<blueprint>/application/<component>/`
- Paths follow the layout in constitution §5.1 and plan.md

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLES for illustration only.

  /speckit.tasks MUST replace them with tasks generated from:
  - user stories and acceptance scenarios in spec.md
  - the node templates, inputs, and capabilities in plan.md and data-model.md

  Keep the Test Plan phase. Generate one or more test tasks for every
  acceptance scenario, plus the lifecycle tests in constitution §5.6.
  ============================================================================
-->

## Phase 1: Setup

- [ ] T001 Create the blueprint directory layout per plan.md (§5.1)
- [ ] T002 Create `blueprint.yaml` with `tosca_definitions_version: dell_1_1`,
  `description`, `imports` (pinned plugin versions, IM-003), `labels`, and
  `blueprint_labels`
- [ ] T003 [P] Create `CHANGELOG.md` with the initial version entry (§5.4)
- [ ] T004 [P] Create `README.md` with prerequisites and Day-2 support
  statement (§5.3)

---

## Phase 2: Foundational (blocks all user stories)

- [ ] T005 Define `input_groups` and the inputs shared by all stories, each
  with type, display label, description, `hidden`, constraints, and error
  messages (§2.4)
- [ ] T006 Define secret inputs as `type: secret_key` with a schema
  constraint (§2.3)
- [ ] T007 Add the target environment resolver if the blueprint is a
  top-level workload (§2.2)

**Checkpoint**: `dap-bpa blueprint lint --file <blueprint>/blueprint.yaml
--verify --schema` reports `errorsFound: 0` before story work starts.

---

## Phase 3: User Story 1 - [Title] (Priority: P1)

**Goal**: [What this story delivers]

- [ ] T008 [US1] [Node template or input change] in
  `<blueprint>/infrastructure/<platform>/definitions.yaml`
- [ ] T009 [US1] [Capability or output] in
  `<blueprint>/infrastructure/<platform>/capabilities.yaml`
- [ ] T010 [US1] Run lint and `validate-all`; fix findings before the next
  slice (§5.2)

**Checkpoint**: User Story 1 lints clean and is ready for its test tasks.

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [What this story delivers]

- [ ] T011 [US2] [Implementation task with file path]
- [ ] T012 [US2] Run lint and `validate-all`; fix findings before the next
  slice (§5.2)

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Test Plan *(mandatory, constitution §5.7)*

**Environment**: non-production DAP orchestrator [name], target [vCenter,
cluster, or bare-metal pool]
**Record results in**: `specs/[###-feature-name]/test-results.md` (from
`.specify/templates/test-results-template.md`)

### Static checks (§5.2)

- [ ] T100 Lint: `dap-bpa blueprint lint --file <blueprint>/blueprint.yaml
  --verify --schema --json` reports `errorsFound: 0`
- [ ] T101 Validate: `dap-bpa blueprint validate-all --file
  <blueprint>/blueprint.yaml` reports `0 invalid` and `Total errors: 0`
- [ ] T102 Review the Risk Analysis panel from `dap-bpa blueprint visualize`;
  no High findings outside `.riskignore` entries recorded in plan.md
- [ ] T103 [P] Run the IaC linters for the artifacts present
  (`ansible-lint`, `terraform validate`, `helm lint`, `yamllint`)

### Acceptance tests (one or more per scenario in spec.md)

- [ ] T110 [FR-001] [AS-1] [What to deploy and what to check on the target]
- [ ] T111 [FR-002] [AS-2] [What to deploy and what to check on the target]

### Lifecycle tests (§5.6)

- [ ] T120 [lifecycle] `install` with the default inputs completes
- [ ] T121 [lifecycle] Re-run `install`, or `update` with unchanged inputs;
  nothing on the target changes (§5.3)
- [ ] T122 [lifecycle] Run each custom workflow once (§3.6)
- [ ] T123 [lifecycle] `uninstall` removes every created resource; check the
  target directly for leftovers (§3.2)
- [ ] T124 [lifecycle] Force a partial `install` failure, then `uninstall`;
  nothing is left behind

### Coverage check

- [ ] T130 Run `/speckit.analyze`; every FR-xxx has at least one test task

**Checkpoint**: every test task above has a PASS entry in test-results.md.
A FAIL means fix, re-run the affected tests, and record the new run. If the
fix changes behaviour the spec describes, update spec.md first.

---

## Phase N+1: Write Back and Polish

- [ ] T140 Update spec.md, plan.md, and this test plan to match the delivered
  blueprint (§5.7)
- [ ] T141 Update `CHANGELOG.md` and `README.md` (§5.6)
- [ ] T142 Record any waiver in plan.md's Complexity Tracking table
  (Governance)

---

## Dependencies & Execution Order

- **Setup (Phase 1)** and **Foundational (Phase 2)** come first and block
  all story work
- **User stories (Phase 3+)** proceed in priority order, or in parallel if
  staffed; each ends with its lint and validate task
- **Test Plan (Phase N)** runs once the stories in scope are built; static
  checks first, then acceptance tests, then lifecycle tests
- **Write Back (Phase N+1)** runs after every test task has passed

## Notes

- [P] tasks touch different files and have no dependencies
- Commit after each task or logical group
- Stop at any checkpoint to review the slice
- A test task that cannot cite a requirement is either testing something
  out of scope or exposing a missing requirement; fix the spec
