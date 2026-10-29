# Section 023: Customer Pattern Learning

> **Teach Blueprint Assist your organization's conventions and validate new
> blueprints against them.** Customer pattern learning lets you extract naming
> rules, IP ranges, VLAN schemes, policy bindings, module structure, and variable
> conventions from your existing blueprints, curate them into a versioned pattern
> set, and enforce them during authoring - locally, from an IDE skill, or through
> the MCP server.

---

## Why Pattern Learning?

Every organization develops its own blueprint conventions over time - naming
prefixes for nodes, standard VLAN ranges, required input groups, policy binding
structures, or module layout rules. These conventions live in tribal knowledge,
code reviews, and wikis, and they drift as teams grow.

Customer pattern learning formalizes this: point `dap-bpa` at a directory of your
existing blueprints and it extracts convention candidates automatically. You
review and accept the ones that matter, and from then on `dap-bpa` can validate
any new blueprint against your approved patterns - catching convention violations
before they reach code review or the orchestrator.

---

## Concepts

### Pattern Schema

Patterns follow a canonical JSON Schema (version `1.0.0`) with strict
schema-version enforcement. Each pattern has:

| Field | Description |
| --- | --- |
| **id** | Unique identifier (generated during extraction) |
| **type** | One of six pattern types (see below) |
| **confidence** | Deterministic score 0-100, computed by the extraction engine |
| **status** | `candidate`, `accepted`, `rejected`, or `overridden` |
| **description** | Human-readable explanation of what the pattern enforces |
| **match** | The rule expression (regex, value set, structural constraint, etc.) |

### Pattern Types

The extraction engine recognizes six pattern types. Use these exact identifiers
wherever a type is expected (for example the `pattern_type` MCP argument). Each
type is stored as its own `<type>.json` file in the pattern set.

| Type | What It Captures | Example |
| --- | --- | --- |
| **`naming`** | Node, input, and output naming conventions | All VM nodes must start with `vm_` |
| **`ip-range`** | IP address ranges and subnet schemes | Management IPs must be in `192.168.1.0/24` |
| **`vlan`** | VLAN ID conventions | VLANs must be in the `100-199` range |
| **`policy-binding`** | Policy binding structures and type prefixes | All policies must use `dell.policies.*` types |
| **`module-structure`** | Module layout and file organization | Inputs must be in a separate `inputs.yaml` |
| **`variable-mapping`** | How inputs/outputs map to node properties, including naming and typing | All credential inputs must be `hidden: true` |

### Pattern Sets

Patterns are grouped into **pattern sets** - isolated collections stored under
`~/.blueprint-assist/knowledge/patterns/<pattern-set>/`. Each set has its own
lifecycle:

- A **default** set is used when no `--pattern-set` flag is specified.
- Teams can maintain separate sets for different blueprint families
  (e.g. `networking`, `compute`, `security`).
- Sets can be exported to JSON and imported on another machine, enabling
  team-wide convention sharing.

### Confidence Scoring

The extraction engine uses a **two-pass pipeline** with deterministic confidence
scoring:

1. **Pass 1 - Statistical extraction**: scans all blueprints in the directory and
   identifies recurring patterns, computing a raw frequency score.
2. **Pass 2 - Confidence refinement**: applies a sliding-window feedback scoring
   algorithm (0-100) that factors in pattern consistency, exception rate, and
   blueprint coverage.

Patterns with higher confidence are more likely to be real conventions rather than
coincidences. The interactive review wizard displays confidence alongside each
candidate so you can make informed accept/reject decisions.

---

## End-to-End Workflow

### 1. Ingest: Extract Patterns from Existing Blueprints

Point the extraction engine at a directory of blueprints:

```bash
dap-bpa knowledge patterns learn --blueprints-dir ./our-blueprints
```

The engine scans every blueprint YAML in the directory (recursively), runs the
two-pass extraction pipeline, and presents candidates in an **interactive review
wizard**:

```text
Pattern candidates found: 12

[1/12] naming / confidence: 87
  All VM node names start with "vm_"
  Found in: 14/16 blueprints
  Accept (a), Reject (r), Skip (s)? _
```

For scripted or CI workflows, use `--json` to emit candidates as structured JSON:

```bash
dap-bpa knowledge patterns learn --blueprints-dir ./our-blueprints --json > candidates.json
```

To target a specific pattern set:

```bash
dap-bpa knowledge patterns learn --blueprints-dir ./our-blueprints --pattern-set networking
```

You can also specify exemplar blueprints to weight the extraction:

```bash
dap-bpa knowledge patterns learn \
  --blueprints-dir ./our-blueprints \
  --exemplar-ids bp-gold-standard,bp-reference-network \
  --pattern-set networking
```

### 2. Review: Curate Pattern Candidates

If you skipped candidates during the interactive wizard, or are working from a
`--json` export, review them with explicit accept/reject:

```bash
# Accept and reject individual candidates by ID
dap-bpa knowledge patterns review \
  --accept pat-001,pat-003,pat-007 \
  --reject pat-002,pat-005

# Or apply decisions in batch from a JSON file
dap-bpa knowledge patterns review --decisions decisions.json
```

The `--decisions` file format supports three actions per candidate:

```json
[
  { "id": "pat-001", "action": "accept" },
  { "id": "pat-002", "action": "reject" },
  { "id": "pat-003", "action": "override", "description": "VM names must start with vm_ or srv_", "match": "^(vm|srv)_" }
]
```

The `override` action lets you accept a candidate but modify its rule - useful
when the extracted pattern is close but not quite right.

### 3. Validate: Check Blueprints Against Learned Patterns

Once you have accepted patterns, validate any blueprint against them:

```bash
dap-bpa knowledge patterns validate ./new-blueprint/blueprint.yaml
```

The output starts with `PASS` or `FAIL`, followed by one line per violation giving
the rule, the offending field, and a suggested fix. This is real v0.32.0 output
for a node whose name breaks an accepted naming pattern:

```text
FAIL: ./new-blueprint/blueprint.yaml (pattern set: default)
  naming_convention at node_templates.vm: "vm" does not match ^proxy_resolver$ (suggested: proxy_resolver)
```

A blueprint that passes prints `PASS: <file> (pattern set: <name>)`. A `note:`
line reports any nodes that no pattern applied to and that were not checked.

For machine-readable output:

```bash
dap-bpa knowledge patterns validate ./new-blueprint/blueprint.yaml --output json
```

```json
{
  "blueprint": "./new-blueprint/blueprint.yaml",
  "pattern_set": "default",
  "result": "fail",
  "violations": [
    {
      "rule": "naming_convention",
      "field": "node_templates.vm",
      "actual_value": "vm",
      "expected_pattern": "^proxy_resolver$",
      "suggested_fix": "proxy_resolver",
      "confidence": 26.48
    }
  ],
  "coverage": { "naming": { "checked": 1, "skipped": 0 } }
}
```

**Attribution is checked too.** A node that matches an accepted pattern must also
carry `_bpa_attribution` metadata recording which pattern it follows, either as
a YAML comment above the node or in an attribution sidecar. Without it, validation
fails with a `pattern_attribution` violation even though the name is correct. The
violation's suggested fix contains the exact comment to add, for example:

```yaml
node_templates:
  # _bpa_attribution: {"field":"node_templates.proxy_resolver","pattern_id":"<pattern-id>","source_blueprints":["edge/vm-ansible/vm/definitions"],"confidence_score":26.48,"is_exemplar_driven":false}
  proxy_resolver:
    type: dell.nodes.ApplicationModule
```

Add it whenever a node is written or renamed to follow a pattern, and check
generated blueprints for it before running validation in CI.

### 4. Share: Export and Import Across Teams

Export a pattern set for sharing:

```bash
dap-bpa knowledge patterns export --output our-patterns.json --pattern-set default
```

Import on another machine:

```bash
dap-bpa knowledge patterns import --input our-patterns.json
```

This makes it straightforward to distribute organizational conventions via a shared
repository, artifact store, or team wiki.

### 5. Maintain: Check Status and Migrate

Check the health of your pattern sets:

```bash
dap-bpa knowledge patterns status
```

Output shows the schema version, pattern count by status, and a feedback-score summary:

```text
Pattern set: default
Schema version: 1.0.0
Patterns: 14 accepted, 3 rejected, 2 candidates
Average confidence: 78.4
Last updated: 2026-08-15
```

List all patterns in a set:

```bash
dap-bpa knowledge patterns list --pattern-set networking
```

If the pattern schema evolves in a future BPA release, migrate your sets:

```bash
dap-bpa knowledge patterns migrate --pattern-set default
```

---

## IDE Integration: The `my-dap-patterns` Skill

The `my-dap-patterns` skill (installed with `dap-bpa setup-ide`) lets you interact
with customer patterns from natural language in your IDE. It routes three intent
categories to the CLI:

| Intent | Example Prompt | Maps to |
| --- | --- | --- |
| **Ingest** | "learn my conventions from these blueprints" | `knowledge patterns learn` |
| **Validate** | "check this blueprint against my patterns" | `knowledge patterns validate` |
| **Status** | "what patterns do I have?" | `knowledge patterns status` / `list` |

The skill handles path resolution and pattern-set selection automatically. You
can also ask it questions like "validate against my networking patterns" and it
will pass `--pattern-set networking`.

---

## MCP Integration: Pattern Tools in the Agent MCP Server

The Agent MCP Server exposes five customer-pattern MCP tools - thin adapters over
the shared pattern library (no CLI exec). These tools let IDE agents and external
applications interact with patterns programmatically:

| MCP Tool | Purpose | Key arguments | CLI equivalent |
| --- | --- | --- | --- |
| `pattern_trigger_learning_run` | Extract candidate patterns from a directory of blueprint YAML files; returns a run summary and the candidates | `pattern_set`, `blueprints_dir` _(required)_; `exemplar_blueprint_ids` | `knowledge patterns learn` |
| `pattern_query_local` | Query stored patterns by type and confidence range | `pattern_set` _(required)_; `pattern_type` (or `all`), `min_confidence`, `max_confidence` (0-100) | `knowledge patterns list` |
| `pattern_record_decisions` | Apply accept/override/reject decisions to candidates | `pattern_set`, `decisions[]` of `{candidate_id, decision, edited_value}` (`edited_value` is a JSON object string, required for `override`) | `knowledge patterns review` |
| `pattern_run_validate` | Validate blueprint YAML content against a pattern set | `pattern_set`, `blueprint_yaml` _(required)_ | `knowledge patterns validate` |
| `pattern_get_trigger_words` | Return trigger words, example prompts, and the pattern-dependency flag for each skill | _(none)_ | - |

`pattern_set` is the pattern-set name (a DAP profile). Candidates only reach the
pattern store through explicit `pattern_record_decisions` calls -
`pattern_trigger_learning_run` never auto-accepts patterns.

> **`blueprints_dir` is a path on the MCP server's filesystem**, not on the
> caller's machine. On the hosted Agent MCP Server, use the
> `dap-bpa knowledge patterns learn` CLI to learn from local files. With a
> [local Agent MCP Server container](../section-019-mcp-server/content.md#agent-running-locally-v0320),
> mount the blueprint directory into the container first
> (e.g. `-v ./blueprints:/data/blueprints:ro`) and pass the container path.

---

## Storage and Internals

### Local Pattern Store

Pattern sets are stored under `~/.blueprint-assist/knowledge/patterns/`:

```text
~/.blueprint-assist/knowledge/patterns/
+-- default/
|   +-- patterns.json          # Accepted/rejected/candidate patterns
|   +-- schema-version.json    # Schema version lock
|   +-- feedback.json          # Sliding-window feedback scores
+-- networking/
|   +-- patterns.json
|   +-- schema-version.json
|   +-- feedback.json
```

All writes are **atomic** - a crash during extraction or review never corrupts the
store. Pattern-set isolation means operations on one set never affect another.

### Schema Versioning

The `schema-version.json` file locks the set to a specific schema version. If you
upgrade `dap-bpa` and the schema evolves, `knowledge patterns migrate` updates the
set in place. The CLI refuses to operate on a set whose schema version is newer
than it understands, preventing silent data loss.

---

## Common Workflows

### CI/CD: Validate Blueprints in a Pipeline

```bash
# A pattern set that does not exist validates as PASS (exit 0), so confirm it is present first
if ! dap-bpa knowledge patterns list | grep -q '"default"'; then
  echo "Pattern set 'default' not found - import it before validating"
  exit 1
fi

# Fail the build if the blueprint violates organizational patterns (validate exits 1 on any violation)
dap-bpa knowledge patterns validate ./blueprint.yaml --pattern-set default --output json
if [ $? -ne 0 ]; then
  echo "Blueprint violates organizational patterns"
  exit 1
fi
```

`knowledge patterns validate` exits `1` when it finds a violation (`FAIL`, or
`"result": "fail"` in JSON) or cannot run (for example, the blueprint file is
missing), and `0` on a pass. It does not report a missing pattern set: validating
against a set that has not been learned or imported on this machine returns `PASS`
with no patterns checked. That is why the CI example checks that the set exists
first. In CI, import the shared set (`knowledge patterns import --input <file>`)
before validating.

### Onboarding: Bootstrap a New Team Member

```bash
# 1. Download the team's pattern set from the shared repo
curl -o team-patterns.json https://artifacts.example.com/bpa/team-patterns.json

# 2. Import it
dap-bpa knowledge patterns import --input team-patterns.json

# 3. Validate your first blueprint
dap-bpa knowledge patterns validate ./my-first-blueprint/blueprint.yaml
```

### Multi-Team: Separate Pattern Sets by Domain

```bash
# Network team patterns
dap-bpa knowledge patterns learn --blueprints-dir ./network-blueprints --pattern-set networking

# Compute team patterns
dap-bpa knowledge patterns learn --blueprints-dir ./compute-blueprints --pattern-set compute

# Validate a blueprint that spans both domains
dap-bpa knowledge patterns validate ./full-stack-blueprint.yaml --pattern-set networking
dap-bpa knowledge patterns validate ./full-stack-blueprint.yaml --pattern-set compute
```

---

## Technical Notes

- **No orchestrator connection required** - pattern learning, review, validation,
  and export/import are entirely local operations.
- **No LLM required for extraction** - the two-pass extraction pipeline is
  deterministic and runs without an LLM. The `wiki synthesize patterns`
  maintainer command (Section 013) uses an LLM to synthesize cross-plugin pattern
  documentation, but that is a separate workflow.
- **Deterministic validation** - `knowledge patterns validate` produces identical
  output for the same blueprint and pattern set, making it safe for CI gating.
- **Feedback loop** - the sliding-window feedback scoring algorithm adjusts
  confidence scores as you accept, reject, or override patterns over time, so the
  engine improves its suggestions for future extractions.

---

## Reference

- **CLI commands**: [Section 013 - BPA CLI Commands](../section-013-bpa-cli-commands/content.md)
  (Knowledge: Customer Patterns)
- **Skill catalog**: [Section 004 - Skills Overview](../section-004-skills-overview/content.md)
  (`my-dap-patterns` skill)
- **MCP tools**: [Section 019 - MCP Server](../section-019-mcp-server/content.md)
  (Agent Authoring & Pattern Tools)
- **Pattern schema**: `~/.blueprint-assist/knowledge/patterns/<set>/schema-version.json`
- **Skill source**: `~/.blueprint-assist/skills/my-dap-patterns/SKILL.md`
