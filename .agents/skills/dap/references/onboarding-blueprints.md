# DAP Onboarding — Blueprints

## Upload via UI

1. In the Orchestrator UI, go to **Inventory** → **Blueprints** → **Upload Blueprint**
2. Choose your YAML file, enter a Blueprint ID, optional description
3. Click **Upload** — status shows `uploaded` when complete

## Upload via CLI

```bash
# Lint first (required)
dap-bpa blueprint lint --file blueprint.yaml --verify

# Upload
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-blueprint --revision 1.0.0

# Confirm upload completed
dap-bpa orchestrator blueprints get my-blueprint
```

## Finding starter templates

Use the knowledge base — search for working examples rather than writing from scratch:

```bash
# General search
dap-bpa knowledge blueprints find "<what you want to deploy>"
dap-bpa knowledge blueprints get <id> --include-files

# Examples by technology
dap-bpa knowledge blueprints find "helm chart kubernetes"
dap-bpa knowledge blueprints find "ansible playbook"
dap-bpa knowledge blueprints find "terraform module"
dap-bpa knowledge blueprints find "docker container"
dap-bpa knowledge blueprints find "vsphere virtual machine"
```

Use the retrieved blueprint as a starting point — adapt inputs, node types, and properties to your use case. For authoring rules and structure, see the main skill and `references/blueprint-examples.md`.
