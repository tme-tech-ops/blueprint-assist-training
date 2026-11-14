# Blueprint Assist Agent — End-User Guide

The Blueprint Assist agent is an AI assistant embedded in your IDE (via the `dap` skill) that helps you author, validate, deploy, and manage DAP blueprints using natural language. You describe what you want; the agent researches plugins, writes YAML, lints it, and guides you through deployment.

**How it differs from MCP access:** The MCP endpoint (`/mcp`) lets external tools call DAP operations programmatically. The agent skill runs inside your IDE session, reads and writes files on disk, runs the `dap-bpa` CLI, and has a back-and-forth authoring loop with you. For MCP connectivity — endpoints, required headers, and minting a gateway-ready customer token (`dap-bpa mint-token`) — see the `mcp-dapo-setup` skill ([`references/mcp-guide.md`](../../mcp-dapo-setup/references/mcp-guide.md)).

Training material, including the *orchestration-service-auth* section covering the DAP auth model, lives at <https://tme-tech-ops.github.io/blueprint-assist-training/>.

---

## Configuration

The agent uses the `dap-bpa` CLI for all DAP operations. Set it up once:

```bash
dap-bpa setup
# Prompts for: portal domain, orchestrator domain, org ID, client ID, client secret
```

For how to create a DAP client and obtain credentials, see [`packages/skills/dap/references/onboarding-setup.md`](../../dap/references/onboarding-setup.md).

### Containerized and non-interactive setups

**Agents must never ask the user to paste a client secret or token into the chat.** Chat content ends up in transcripts and logs; a secret shared that way has to be rotated. When `dap-bpa` runs inside a container (an agent sandbox, `docker run`, CI) and credentials are missing, the agent should instead ask the user to provide them out-of-band, either by:

- **Mounting the host config** into the container: `-v ~/.blueprint-assist:/root/.blueprint-assist` (created by running `dap-bpa setup` on the host), or
- **Setting `DAP_*` environment variables** at container/sandbox creation: `DAP_ORCHESTRATOR_DOMAIN`, `DAP_PORTAL_DOMAIN`, `DAP_ORG_ID`, `DAP_CLIENT_ID`, `DAP_CLIENT_SECRET` (or `DAP_TOKEN`). These take precedence over `config.json`, and `dap-bpa setup` skips the secret prompt when a complete set is present.

See `DOCKER.md` in the toolkit repository for full `docker run` recipes.

Verify the CLI is configured:

```bash
dap-bpa orchestrator blueprints list
```

A list of blueprints (even an empty one) confirms credentials are working. An auth error means credentials need rechecking.

---

## Main Workflows

### Blueprint Authoring

Describe the infrastructure you want to deploy. The agent researches the relevant plugins, proposes a plan, waits for your approval, then writes multi-file blueprint YAML, lints it, and validates it.

**Example prompts:**
- `"Write a blueprint that deploys a VM on vSphere and installs Nginx using Ansible."`
- `"Review my blueprint.yaml and fix any lint errors."`
- `"Add an input for the VM name with a regex constraint."`

**What happens:** The agent searches the knowledge base (`dap-bpa knowledge docs search`, `dap-bpa knowledge blueprints find`), looks up node types, generates `blueprint.yaml` / `inputs.yaml` / `capabilities.yaml`, lints with `dap-bpa blueprint lint --verify`, then validates with `dap-bpa blueprint validate-all`.

---

### Update / Day-2 / Drift

Ask the agent to make an existing blueprint support update, drift checking, or reinstall.

**Example prompts:**
- `"Add update support to this blueprint."`
- `"Make this blueprint support drift checking."`
- `"Add check_drift and reinstall workflows."`

**What happens:** The agent loads the deployment-update rules (ND-009) and adds the required `update`, `check_drift`, and `reinstall` workflow hooks. A blueprint with `update` declared but no `check_drift` is flagged as incomplete.

---

### ISV Onboarding

After a blueprint passes lint, the agent offers to guide you through uploading it to DAP and running a test deployment end to end.

**Example prompts:**
- `"Walk me through uploading and deploying this blueprint."`
- `"Help me get this blueprint into DAP and test it."`

**What happens:** The agent follows the ISV onboarding workflow — upload → create deployment → execute install → monitor → execute uninstall — prompting you at each step and handling errors.

---

### Artifact Wrapping

Give the agent an existing Ansible playbook, Terraform module, Helm chart, or container image. It detects the artifact type, extracts metadata, and generates a DAP blueprint that wraps it.

**Example prompts:**
- `"Wrap my Ansible playbook deploy.yml in a DAP blueprint."`
- `"Turn my Terraform module into a blueprint."`
- `"I have a Helm chart. Create a blueprint that deploys it via DAP."`

**What happens:** The agent loads the artifact-wrapping rules, maps the artifact to the appropriate plugin and node type, and generates the wrapping blueprint.

---

### Plugin Lookup

Ask about any supported plugin's node types, properties, or usage patterns.

**Example prompts:**
- `"What node types does the Kubernetes plugin have?"`
- `"Show me the properties for dell.nodes.helm.Release."`
- `"How does authentication work for the AWS plugin?"`

**What happens:** The agent runs `dap-bpa knowledge plugins list <plugin>`, `dap-bpa knowledge plugins get <plugin> <type>`, or `dap-bpa knowledge plugins docs <plugin>` and summarises the result for you.

Available plugins: ansible, aws, azure, docker, fabric, helm, hzp-edge, kubernetes, libvirt, openstack, redfish, storage, terraform, terragrunt, utilities, vcloud, vsphere.

---

### Deployment and Execution Management

Create deployments, run workflows, and check execution status.

**Example prompts:**
- `"Deploy blueprint my-blueprint with the inputs from inputs.yaml."`
- `"Check the status of my last execution."`
- `"Show me the events for execution abc-123."`

**What happens:** The agent runs the appropriate `dap-bpa orchestrator` commands and surfaces results or errors inline.

---

### DSL Migration

Convert an existing blueprint from an older DSL version (NativeEdge, Cloudify, `dell_1_0`) to `dell_1_1`.

**Example prompts:**
- `"Convert this blueprint from nativeedge_1_0 to dell_1_1."`
- `"Migrate this Cloudify blueprint to the Dell DSL."`

**What happens:** The agent applies the migration rules (prefix replacement, import rename, NE-only property removal), preserves your input structure, then lints the migrated output.

---

## Verifying It Works

```bash
# 1. Check CLI auth
dap-bpa orchestrator blueprints list

# 2. Search the docs knowledge base
dap-bpa knowledge docs search "kubernetes deployment"

# 3. Lint a blueprint
dap-bpa blueprint lint --file blueprint.yaml --verify
```

All three passing confirms the agent has everything it needs to operate.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `AUTHENTICATION_FAILED` on any CLI command | Credentials missing or expired | Re-run `dap-bpa setup` or update `~/.blueprint-assist/config.json` |
| `errorsFound: true` after lint | Blueprint rule violations | Read the lint output; the agent will fix and re-lint automatically |
| Agent proposes a node type that doesn't exist | Hallucinated type | Ask the agent to verify: `"Run dap-bpa knowledge types get <type>"` |
| `ENTITLEMENT_CHECK_FAILED` | BPA license not active | Verify BPA license in the DAP portal |
| Agent loops without finishing | Hit the 25-iteration limit | Break the task into smaller steps |
