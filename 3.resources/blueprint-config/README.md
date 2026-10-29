# Blueprint Project Configuration Files

Starter configuration files for a DAP blueprint project. Both are dot-files,
so they may be hidden in your file browser.

| File | Copy to | Purpose |
| ---- | ------- | ------- |
| [`.yamllint`](.yamllint) | Blueprint project root | `yamllint` settings that suit TOSCA blueprints: 2-space indentation, `true`/`false` booleans, split files without `---`, and Helm templates excluded. Constitution §5.2 says all YAML SHOULD pass `yamllint` with the project configuration |
| [`.riskignore`](.riskignore) | Next to the blueprint's root YAML | Suppresses Blueprint Visualizer risk findings. Every entry is a waiver that MUST be recorded in plan.md's Complexity Tracking table (constitution Governance). All examples ship commented out |

## Usage

```bash
cp 3.resources/blueprint-config/.yamllint   my-blueprint/
cp 3.resources/blueprint-config/.riskignore my-blueprint/   # only if needed

yamllint my-blueprint/
dap-bpa blueprint visualize --file my-blueprint/blueprint.yaml
```

`yamllint` checks YAML syntax and style only. It does not replace
`dap-bpa blueprint lint --verify --schema` or `validate-all`, which check
the blueprint against the DAP rules (constitution §5.2).

## Related

- [Constitution template](../spec-kit/.specify/memory/constitution-template-blueprint.md),
  §5.2 Linting & Validation and Governance (waivers)
- [Section 021: Blueprint Visualizer](../../1.sections/section-021-blueprint-visualizer/content.md),
  `.riskignore` format and behaviour
