# Spec Kit Resources for DAP Blueprints

A DAP-specific constitution and Spec Kit templates. Copy them into a project
created with `specify init` so that `/speckit.*` commands follow the DAP
Blueprint Core Standards.

| File | Copy to | Purpose |
| ---- | ------- | ------- |
| [`.specify/memory/constitution-template-blueprint.md`](.specify/memory/constitution-template-blueprint.md) | `.specify/memory/constitution.md` | The DAP Blueprint Core Standards. Spec Kit only enforces a constitution at this path |
| [`.specify/templates/spec-template.md`](.specify/templates/spec-template.md) | `.specify/templates/spec-template.md` | Spec template with numbered acceptance scenarios tagged by requirement, mandatory lifecycle scenarios, and the §5.7 acceptance coverage table |
| [`.specify/templates/tasks-template.md`](.specify/templates/tasks-template.md) | `.specify/templates/tasks-template.md` | Tasks template with a mandatory Test Plan phase. The stock template treats tests as optional, which contradicts constitution §5.7 |
| [`.specify/templates/test-results-template.md`](.specify/templates/test-results-template.md) | `.specify/templates/test-results-template.md` | Record of each test run (§5.7). Not part of stock Spec Kit; the tasks template points to it |

## Setup

```bash
specify init my-blueprint --ai claude
cd my-blueprint

SRC=<path-to-this-repo>/3.resources/spec-kit/.specify
cp "$SRC/memory/constitution-template-blueprint.md" .specify/memory/constitution.md
cp "$SRC/templates/spec-template.md"         .specify/templates/
cp "$SRC/templates/tasks-template.md"        .specify/templates/
cp "$SRC/templates/test-results-template.md" .specify/templates/
```

The copies overwrite the stock `spec-template.md` and `tasks-template.md`.
Set the Ratified and Last Amended dates in `constitution.md`.

Starter `.yamllint` and `.riskignore` files for the blueprint itself are in
[`../blueprint-config/`](../blueprint-config/README.md).

## Worked example

[`4.examples/sample-specs/001-spec-plan-blueprint/`](../../4.examples/sample-specs/001-spec-plan-blueprint/)
shows the full set for a Windows VM on vSphere: spec, plan, research, data
model, tasks with a test plan, and a test results log.

## Related

- [Section 018: Specification Considerations](../../1.sections/section-018-spec-considerations/content.md)
- `2.presentations/4.spec-kit-for-dap-blueprints.pptx`, slides 12, 14, and 18
