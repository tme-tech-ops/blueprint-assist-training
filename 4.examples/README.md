# Examples

This directory collects Blueprint Assist examples in several forms.

- **`capability-examples/`** - Focused examples organized by Blueprint Assist
  capability area (authoring, review, deployment, maintenance).
- **`sample-specs/`** - Worked specifications a blueprint can be generated from,
  such as a Windows Server VM on vSphere.
- **`sample-prompt-specs/`** - Example prompts for getting started and for
  walking through a blueprint design.

## Building a blueprint from a spec

The `sample-specs/` directory shows the spec-first workflow: start from a written
specification (for example `sample-specs/001-spec-plan-blueprint/spec.md`) and ask
Blueprint Assist to generate the blueprint into the location the spec describes,
then lint, validate, and upload it.
