---
name: visualize-blueprint
description: >-
  Use when the user says "visualize", "show me a diagram", "generate visualization",
  "create HTML view", "show me the topology", "show me the blueprint structure",
  or any request to generate an HTML visualization of a blueprint.
  Also use after creating or editing a blueprint to proactively offer visualization.
---

# Visualize Blueprint

Generate interactive HTML visualizations of DAP blueprints with topology diagrams, risk analysis, and full blueprint details.

## When to Use This Skill

### User Requests Visualization
- User explicitly says: "visualize", "show diagram", "generate visualization", "create HTML"
- User asks: "can I see the topology?", "show me the blueprint structure"
- User wants to preview before uploading

### Proactive Offering (After Blueprint Work)
After successfully generating or editing a blueprint, **always prompt the user**:

> "Would you like me to generate an HTML visualization of this blueprint? It includes an interactive topology diagram, risk analysis, and full blueprint details."

If user says yes, generate the visualization.

## What Gets Generated

The HTML visualization includes:
- **Interactive topology diagram** - Cytoscape.js graph with nodes and relationships
- **Risk analysis panel** - Security, reliability, operability, and lifecycle risks
- **Node details** - Properties, interfaces, operations for each node
- **Relationship details** - Source, target, and relationship properties
- **Plugin inventory** - All imported plugins with versions
- **Input groups** - All blueprint inputs organized by group
- **Service components** - Sub-deployment topology (if applicable)
- **Source files** - Embedded YAML source with syntax highlighting

## How to Generate

### Manual CLI Command

```bash
dap-bpa blueprint visualize --file <path>
```

**Examples:**

```bash
# Visualize a blueprint directory
dap-bpa blueprint visualize --file ./my-blueprint

# Visualize a single YAML file
dap-bpa blueprint visualize --file ./blueprint.yaml

# Specify custom output path
dap-bpa blueprint visualize --file ./my-blueprint --output ./custom-name.html

# Serve over localhost for in-IDE preview (Windsurf/VSCode)
dap-bpa blueprint visualize --file ./my-blueprint --serve

# Serve on a fixed port
dap-bpa blueprint visualize --file ./my-blueprint --serve --port 7788

# Inside a container: bind all interfaces on a fixed port so the host
# can reach it through a published port (docker run -p 8080:8080)
dap-bpa blueprint visualize --file ./my-blueprint --serve --host 0.0.0.0 --port 8080
```

**Output:**
- Default: `{blueprint-name}-visualizer.html` in the blueprint directory
- Custom: specified by `--output` flag

### Viewing Inside Windsurf / VSCode

The IDE's embedded browser ("Simple Browser") only opens **http(s) URLs** — a `file://` path to the generated HTML will not render in an editor tab. Use `--serve`:

```bash
dap-bpa blueprint visualize --file ./my-blueprint --serve
# ✓ Serving visualization at http://127.0.0.1:53214/
```

Then in Windsurf/VSCode: `Ctrl+Shift+P` → **Simple Browser: Show** → paste the URL. The visualization renders in an editor tab. The server re-reads the file on every request, so regenerating the HTML and refreshing the browser shows the new content. Press `Ctrl+C` to stop the server.

**Agent guidance:** when running inside an IDE chat, prefer `--serve` and give the user the `http://127.0.0.1:<port>/` URL (not the file path) — the URL is what can be opened inside the IDE. Note that `--serve` keeps the process running, so launch it as a background task.

**Notes:**
- `--port` requires `--serve`; the value must be an integer 0–65535 (default: random free port).
- `--host` requires `--serve`; only `127.0.0.1` (default, loopback) and `0.0.0.0` (all interfaces) are accepted.
- When the CLI runs inside a container, the default loopback bind is unreachable from the host even with `docker run -p`. Use `--serve --host 0.0.0.0 --port <n>`, publish the port (`-p <n>:<n>`), and give the user `http://localhost:<n>/`. Anything that can reach the published port can view the visualization — use only for non-sensitive blueprints or on trusted networks. See `DOCKER.md` in the toolkit repository.
- Fallback without `--serve`: install the **Live Preview** extension (`ms-vscode.live-server`), then right-click the generated HTML file → **Show Preview**.

### Automatic Generation

Visualization is **automatically generated** after successful blueprint upload:

```bash
dap-bpa orchestrator blueprints upload --file ./my-blueprint --id my-bp --revision 1.0.0
# ✓ Blueprint uploaded: my-bp
# ✓ Blueprint visualization generated: my-blueprint-visualizer.html
```

To disable automatic generation:

```bash
export BPA_DISABLE_VISUALIZATION=true
dap-bpa orchestrator blueprints upload --file ./my-blueprint --id my-bp
```

## Agent Workflow Examples

### Example 1: After Blueprint Generation

```
Agent: I've created your blueprint at ./my-blueprint/blueprint.yaml.
       Would you like me to generate an HTML visualization?

User: Yes

Agent: [generates visualization]
       ✓ Visualization saved at: ./my-blueprint/my-blueprint-visualizer.html
       You can open this file in any browser to explore the topology,
       view risk analysis, and inspect node details.
```

### Example 2: User Requests Visualization

```
User: Can you visualize my blueprint?

Agent: [generates visualization]
       ✓ Generated: ./my-blueprint/my-blueprint-visualizer.html

       The visualization includes:
       - Interactive topology diagram (5 nodes, 6 relationships)
       - Risk analysis (2 high, 3 medium risks detected)
       - Full node and relationship details
       - Plugin inventory
```

### Example 3: Before Upload

```
User: I want to see the topology before uploading

Agent: [generates visualization]
       ✓ Visualization generated: ./my-blueprint/my-blueprint-visualizer.html

       You can review the topology and risk analysis before uploading.
       When ready, upload with:
       dap-bpa orchestrator blueprints upload --file ./my-blueprint --id my-bp
```

## Visualization Features

### Interactive Topology
- Click nodes to filter risks by node
- Zoom and pan
- Hierarchical layout for service components
- Color-coded by node type

### Risk Analysis
- Severity badges (high, medium, low, info)
- Category filters (security, reliability, operability, lifecycle)
- Auto-fixable indicators
- Confidence levels
- Detailed remediation guidance

### Self-Contained
- No external dependencies
- Works offline
- Single HTML file
- Embedded Cytoscape.js library

## Troubleshooting

### Visualization Generation Failed

If generation fails during upload, the upload still succeeds:

```
✓ Blueprint uploaded: my-bp
⚠ Blueprint visualization could not be generated. See logs for details.
```

You can manually generate later:

```bash
dap-bpa blueprint visualize --file ./my-blueprint
```

### Invalid Blueprint Path

```
Error: ENOENT: no such file or directory
```

**Fix:** Ensure the path points to a blueprint directory or YAML file:
- Directory: must contain `blueprint.yaml` or similar
- File: must be a valid YAML file

### Parse Errors

```
Error: Failed to parse blueprint
```

**Fix:** Validate the blueprint first:

```bash
dap-bpa blueprint validate --file ./my-blueprint
```

## Related Commands

```bash
# Validate blueprint before visualizing
dap-bpa blueprint validate --file ./my-blueprint

# Lint blueprint
dap-bpa blueprint lint --file ./my-blueprint

# Upload and auto-generate visualization
dap-bpa orchestrator blueprints upload --file ./my-blueprint --id my-bp

# Disable auto-generation
BPA_DISABLE_VISUALIZATION=true dap-bpa orchestrator blueprints upload ...
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BPA_DISABLE_VISUALIZATION` | `false` | Set to `true` to disable automatic visualization after upload |

## Integration Points

1. **CLI Manual Command** - `dap-bpa blueprint visualize`
2. **CLI Auto-Generation** - After `dap-bpa orchestrator blueprints upload`
3. **Agent Proactive Prompting** - After blueprint generation/editing

## Best Practices

1. **Always offer visualization** after creating/editing blueprints
2. **Suggest reviewing risks** before uploading
3. **Mention the HTML is self-contained** and works offline
4. **Provide the file path** so users can open it (or the `--serve` URL when working inside an IDE)
5. **Don't block workflows** - visualization is optional

## See Also

- ISV Onboarding workflow: `skills/isv-blueprints/SKILL.md`
- Blueprint validation: `dap-bpa blueprint validate`
- Blueprint linting: `dap-bpa blueprint lint`
- Upload blueprints: `dap-bpa orchestrator blueprints upload`
