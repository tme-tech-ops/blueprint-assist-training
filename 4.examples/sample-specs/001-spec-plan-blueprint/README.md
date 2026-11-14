# Spec 101: Writing Your First Specification

New to writing specifications? Start here. This folder holds a template,
[spec.md](spec.md), that you copy and fill in. It marks each section
**required** or **optional**, so a first spec can be short and you can add
detail as you learn more.

## What a spec is

A spec describes **what** your blueprint must do and **how you will know it
works**. It does not describe how to build it. Blueprint Assist uses the spec
to generate the blueprint, so the clearer the spec, the better the result.

A good spec answers five questions:

1. What does it deploy, and for whom? (Summary, user story)
2. What must it do? (Requirements)
3. What does the user provide, and what do they get back? (Inputs, outputs,
   credentials)
4. How will we prove it works? (Acceptance tests)
5. What is it not going to do? (Out of scope)

## How to use the template

1. Copy this folder and give it a number and a short name, for example
   `003-ubuntu-vm-vsphere`.
2. Open `spec.md` and fill in the **required** sections first, replacing the
   text in `< >`.
3. Add any **optional** sections that help.
4. Delete the *Example* lines and the hints.
5. Work through the **Before you hand it off** checklist at the bottom of
   the template.
6. Ask Blueprint Assist to build the blueprint from your spec, for example:

   ```text
   Build the blueprint from this spec and place it in the build location
   the spec describes: 4.examples/sample-specs/003-ubuntu-vm-vsphere/spec.md
   ```

## Reference material

You don't need to read all of this before you start. Use it when the
template points you to it.

| Resource | What it gives you |
| -------- | ----------------- |
| [DAP Blueprint constitution](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md) | The rules every blueprint must follow. The template's **§** references (for example §2.3 for credentials) point here |
| [Spec Kit resources](../../../3.resources/spec-kit/README.md) | The full DAP spec, tasks, and test-results templates for use with Spec Kit (`/speckit.*` commands) |
| [Section 018: Specification Considerations](../../../1.sections/section-018-spec-considerations/content.md) | The training section on writing specs for blueprints |
| [002-spec-plan-blueprint](../002-spec-plan-blueprint/spec.md) | A complete worked example: a Windows VM on vSphere, with plan, tasks, and test results |
| [Catalog template specs](../catalog-template-specs/README.md) | Ready-made specs for common workloads, such as PostgreSQL, Kubernetes, and Jenkins |

### Constitution sections worth knowing first

| § | Topic | Why it matters for your spec |
| - | ----- | ---------------------------- |
| 2.2 | Target environment | How the user picks where the blueprint deploys |
| 2.3 | Credentials and secrets | Secrets come from the secret manager, never typed in |
| 2.4 | Input validation | Every input needs a label, a description, and validation |
| 3.2 | Lifecycle | `uninstall` must clean up everything the blueprint created |
| 5.3 | Idempotency | Running `install` twice must not change anything |
| 5.7 | Testing and acceptance | Every requirement needs a test, written in the spec |

## Where the spec goes next

The spec is the first step. The full spec-driven flow is:

1. **Spec**: what and why (this template).
2. **Plan**: how it will be built: plugins, node types, file layout.
3. **Tasks**: the build steps, including a test plan that maps each
   acceptance test to a task.
4. **Build and test**: the blueprint is generated, linted, validated,
   uploaded, and tested in a non-production environment, and the results
   are recorded.
5. **Write back**: the spec is updated to match what was delivered.

For your first spec you can hand step 1 to Blueprint Assist and let it
handle the rest. The [002 example](../002-spec-plan-blueprint/) shows every
step's output.

## Words you will see

- **MUST / SHOULD**: MUST is a hard rule. SHOULD is strongly recommended,
  and skipping it needs a reason.
- **FR-001**: a numbered functional requirement.
- **AS-1**: a numbered acceptance scenario (a test).
- **SC-001**: a numbered success criterion.
- **§2.3**: a section of the constitution.
- **[NEEDS CLARIFICATION]**: a marker for something you haven't decided
  yet.

## Tips for first-timers

- **Write for someone else.** Assume the reader has never seen your
  environment.
- **Be specific.** "Deploys a VM with 4 vCPUs" is better than "deploys a VM".
- **Make every requirement testable.** If you can't check it, rewrite it.
- **Say what is out of scope.** It keeps the blueprint from doing too much.
- **Leave questions in.** If you are unsure, write it under *Open questions*
  instead of guessing.
- **Start small.** A short spec with clear tests beats a long spec with
  vague ones. You can add the optional sections later.
