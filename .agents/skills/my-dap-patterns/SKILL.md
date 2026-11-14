---
name: my-dap-patterns
# requires_patterns: false — this skill is the entry point that creates patterns
# (ingest flow) as well as the validate/status surface, so it must fire even
# when the knowledge base is empty. Dispatch is model-driven from the quoted
# phrases in `description`; requires_patterns, trigger_words, and
# example_prompts are consumed by headless callers via the
# pattern_get_trigger_words MCP tool (ER-006 / #1114).
#
# `description` is the AUTHORITATIVE trigger list. trigger_words and
# example_prompts intentionally duplicate phrases from it for the headless
# path — when editing triggers, update `description` first and keep the other
# two fields in sync, or IDE dispatch and headless dispatch silently diverge.
requires_patterns: false
trigger_words:
  - "my patterns"
  - "learn my conventions"
  - "validate against my patterns"
  - "pattern status"
example_prompts:
  - "Learn my naming conventions from my existing blueprints"
  - "Validate this blueprint against my patterns"
  - "What patterns do I have for my current profile?"
  - "Show me a blueprint that follows my VLAN conventions"
description: >-
  Use when the user says "my patterns", "my dap patterns", "learn my conventions",
  "ingest my conventions", "import my inventory patterns", "use my naming style",
  "validate against my patterns", "check against my conventions", "pattern status",
  "what patterns do I have", or any request to learn, review, validate against, or
  inspect their own blueprint conventions (naming, IP ranges, VLANs, policy
  bindings, module structure, variable names).
---

# My DAP Patterns

Learn the user's blueprint conventions from their existing blueprints, review
what was found together, and keep generated/validated blueprints true to their
style. Everything is local: patterns live at
`~/.blueprint-assist/knowledge/patterns/{pattern-set}/` and are driven through
the `dap-bpa` CLI.

The pattern set defaults to the current DAP profile. Pass
`--pattern-set <name>` to any command to target another set.

## Route by intent

| User intent | Flow |
|---|---|
| Learn / ingest / import conventions | [Ingest](#ingest-learn-my-conventions) |
| Validate a blueprint against their conventions | [Validate](#validate) |
| What patterns exist / status / show my patterns | [Status](#status) |

If patterns are needed but none exist for the current pattern set, do not
fail — offer the ingest flow: "No customer patterns found for this profile.
Want me to learn them from your blueprints now?" If declined, continue with
BPA defaults.

## Ingest — "learn my conventions"

An interactive review: extraction proposes candidates, the user decides.
Never store candidates without the user's explicit decision.

1. **Run the learning run.** Ask for the blueprints directory if not obvious:

   ```bash
   dap-bpa knowledge patterns learn --blueprints-dir <dir> --json
   ```

   The JSON output contains `candidates[]` (schema: `pattern.schema.json`)
   and a run summary. Candidates are pending — nothing is stored yet.
   Fewer than 5 blueprints ⇒ warn that confidence will be low.

2. **Review each candidate conversationally.** For every candidate show:
   - pattern type (`naming`, `ip-range`, `vlan`, `policy-binding`,
     `module-structure`, `variable-mapping`)
   - the proposed value
   - `confidence_score` (0–100) and `source_blueprints`

   Collect one decision per candidate:
   - **accept** — store as-is
   - **edit then accept** — the user tweaks the value; record as an
     **override** with the edited value
   - **reject** — never suggest again

3. **Record the decisions.** Write them to a temp JSON file mapping
   candidate id → decision, then:

   ```bash
   dap-bpa knowledge patterns review --decisions /tmp/decisions.json
   ```

   Decisions file format:

   ```json
   {
     "<candidate-id>": { "kind": "accept" },
     "<candidate-id>": { "kind": "override", "value": { "vlan_id": 240 } },
     "<candidate-id>": { "kind": "reject" }
   }
   ```

   (For plain accept/reject only, `--accept <id,...> --reject <id,...>` works
   too. The two interfaces cannot be combined.)

4. **Report the result.** The command prints accepted / overridden / rejected
   counts and how many candidates remain pending. Accepted and overridden
   patterns land in the pattern files; rejected candidates go to the
   `rejects/` file and will not be re-suggested by future learning runs.

The user may stop mid-review: undecided candidates stay pending and the next
`review` invocation can pick them up.

## Validate

```bash
dap-bpa knowledge patterns validate <blueprint-file> --output json
```

Present the report: which fields match the user's conventions, which deviate,
and which pattern (with confidence) each finding came from. If the pattern
set is empty, surface the ingest offer instead of a hollow "all good".

## Status

```bash
dap-bpa knowledge patterns list                       # all pattern sets
dap-bpa knowledge patterns list --pattern-set <name>  # one set, full dump
```

Show: pattern sets, pattern counts by type, confidence summary, and the
knowledge-base path (`~/.blueprint-assist/knowledge/patterns/`). Mention
patterns flagged `needs_review: true` or `needs_re_extraction: true`.

## Feedback

Record feedback on already-stored patterns to refine confidence scores:

```bash
dap-bpa knowledge patterns feedback <pattern-id> --event <accept|override|reject>
```

- **accept**: Increase confidence (+1 in sliding window)
- **override**: Decrease confidence (-1), flag for re-extraction after ≥3 consecutive
- **reject**: Strong decrease (-2), flag for re-extraction after ≥3 consecutive

Get pattern IDs from `patterns list --pattern-set <name>`. Feedback events are
recorded in the pattern's sliding window (last 10 events), recalculating
confidence and updating `needs_review` / `needs_re_extraction` flags.

## Notes

- Blueprint generation with these patterns is handled by the main `dap`
  skill (see its customer-patterns guidance); this skill owns learning,
  review, validation, and status.
- All data is local to the workstation. Exporting/importing a pattern set:
  `dap-bpa knowledge patterns export --output <file>` / `import`.
