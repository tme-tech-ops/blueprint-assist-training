# Customer Patterns — Apply Learned Conventions During Generation

The `dap-bpa` CLI can learn customer conventions (naming templates, IP ranges,
VLAN IDs, policy bindings, module structures, variable names) from existing
blueprints and store them as a local pattern knowledge base at
`~/.blueprint-assist/knowledge/patterns/<pattern-set>/`. When generating a
blueprint, apply these patterns so the output matches the customer's
environment instead of generic BPA defaults.

## 1. Load patterns before writing YAML

The pattern set name defaults to the current DAP orchestrator profile. Check
what is available:

```bash
dap-bpa knowledge patterns list                          # list pattern sets
dap-bpa knowledge patterns list --pattern-set <name>     # dump one set's patterns
```

**Note:** If your own blueprints aren't showing up in search results during the combined search step, register them first with `dap-bpa knowledge blueprints add <directory> --yes`. The search only searches the local knowledge library (`~/.blueprint-assist/library`) plus the bundled example set — it has no way to know about arbitrary local directories until they're registered.

The dump is JSON keyed by pattern type (`naming`, `ip-range`, `vlan`,
`policy-binding`, `module-structure`, `variable-mapping`). Each pattern has a
`confidence_score` (0-100), `source_blueprints`, and a `needs_review` flag.

## 2. Fallback when no patterns exist

If `pattern_sets` is empty, or the current profile's set has no patterns, use
BPA defaults and surface this prompt to the user before generating:

> No customer patterns found. Run 'dap-bpa knowledge patterns learn' first?

Do not block on the answer — if the user declines, continue with defaults.

## 3. Apply patterns to generated fields

Apply each stored pattern to the matching blueprint field:

| Pattern type | Application |
|---|---|
| `naming` | Replace default node/resource names with the customer template (e.g. `vm-\d+` → `vm-prod-001`). Apply a template only to nodes whose `type` is listed in the pattern's `node_types`; patterns without `node_types` (legacy) apply to any node |
| `ip-range` | Use the customer CIDR blocks for network properties |
| `vlan` | Use the customer VLAN IDs |
| `policy-binding` | Attach the customer's policy names/bindings |
| `module-structure` | Mirror the customer's containment (contained_in) layout |
| `variable-mapping` | Use the customer's input variable names |

Prefer higher `confidence_score` patterns. If a pattern is flagged
`needs_review: true`, mention that to the user instead of applying it
silently.

**Exemplar patterns take priority:** When both an exemplar-sourced pattern and 
an inventory-wide pattern match the same field, prefer the exemplar pattern. 
Exemplar patterns are marked with `is_exemplar: true` in the pattern data and 
receive a 1.5x confidence multiplier applied during pattern extraction.

## 4. Attach attribution metadata

Every generated field that came from a pattern must carry `_bpa_attribution`
metadata so the customer can trace where a value came from:

```json
{
  "field": "<field-path>",
  "pattern_id": "<uuid>",
  "source_blueprints": ["<id1>", "<id2>"],
  "confidence_score": 85.3,
  "is_exemplar_driven": true
}
```

**Field descriptions:**
- `field` - The blueprint field path this attribution applies to (e.g., `node_templates.vm-prod-004`)
- `pattern_id` - UUID of the pattern from the knowledge base
- `source_blueprints` - Array of blueprint IDs that contributed this pattern
- `confidence_score` - Deterministic confidence score (0-100) copied from the selected stored pattern
- `is_exemplar_driven` - `true` if the applied pattern was influenced by a pinned exemplar blueprint, `false` if it came from inventory-wide conventions

Include the metadata as YAML comments next to the field, or as a separate
attribution file next to the blueprint (`blueprint.yaml` →
`blueprint.attribution.json`, mapping field paths to attribution objects).
Comment-style attribution must include the `field` path — that is how the
deterministic validator matches it to the field. Fields generated from BPA
defaults get `{ "source": "default" }`.

Example (comment style):

```yaml
node_templates:
  vm-prod-004:  # _bpa_attribution: {"field": "node_templates.vm-prod-004", "pattern_id": "3f2b...", "source_blueprints": ["bp-app-01", "bp-app-02"], "confidence_score": 92.5, "is_exemplar_driven": true}
    type: dell.nodes.vsphere.Server
```

## 5. Validate the result

After generation (and after the normal lint/validate steps), check the
blueprint against the learned patterns:

```bash
dap-bpa knowledge patterns validate <blueprint-file> [--pattern-set <name>] [--output json|text] [--strict-naming]
```

The report is deterministic pass/fail with per-field violations and suggested
fixes; exit code 1 means violations were found. Fix violations (or confirm
deviations with the user) before finishing.

A node whose `type` has no learned naming convention is skipped, not flagged
(fail-open by design, so an unrecognized type can't be wrongly penalized);
`coverage.naming.{checked,skipped}` on the report makes this visible, and
text output adds a note when any nodes were skipped. CI/pre-publish gates
that want to catch this — an unknown `type` string being used to dodge the
naming rule — should add `--strict-naming`, which turns a nonzero
`coverage.naming.skipped` into a `naming_coverage_strict` failure.

Attribution is enforced, not best-effort: when the pattern set has patterns,
the validator also checks that every field whose value matches a stored
pattern carries `_bpa_attribution` metadata (comment or sidecar), and reports
missing coverage as `pattern_attribution` violations with the exact comment
to add. Attribution content is checked too: a `pattern_id` that does not
exist in the pattern set is reported as `pattern_attribution_invalid` — copy
the real id from the pattern data, never invent one. `dap-bpa blueprint
lint` surfaces the same gaps as non-fatal warnings for the pattern set named
by `--pattern-set` or `--orchestrator` (falling back to `default`), so
skipping the pattern steps above still gets caught for that set.
