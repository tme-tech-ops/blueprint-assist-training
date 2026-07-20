# Section 003: Orchestration Service Authentication

## Overview

This section covers the essential authentication processes required to connect to Dell Automation Platform (DAP) orchestrators using Blueprint Assist. Proper authentication is the foundation for all blueprint operations, including deployment, monitoring, and management.

> **Terminology note**: Throughout this training you may see references to both **DAP** (Dell Automation Platform) and **NativeEdge**. DAP is the umbrella platform name; NativeEdge is the underlying orchestration engine it is built on. For all practical purposes when configuring BPA, you are connecting to a **DAP orchestrator** — the terms can be treated as interchangeable in this context.

## Prerequisites

### Account Requirements

- Valid Dell Automation Platform account with appropriate permissions
- DAP credentials obtained from the DAP portal — **organization ID**, **client ID**, and **client secret**
- Your portal and orchestrator domain names
- Network access to orchestrator endpoints

### Software Requirements

- Blueprint Assist installed (see Section 2) — this includes the full dap-bpa tool with skills, knowledge base, and CLI
- Valid SSL certificates for custom orchestrator deployments (or use SSL bypass for development)

## Authentication Methods

### 1. Blueprint Assist Setup Wizard

The primary method for configuring Blueprint Assist is the interactive setup wizard, which handles both orchestrator authentication and LLM configuration for AI-powered features.

#### Initial Setup

```bash
# Run the interactive setup wizard
dap-bpa setup
```

The setup wizard runs diagnostics (linter, knowledge base, blueprint examples), then prompts you for your Dell Automation Platform credentials:

- **Portal Domain** (e.g. `portal.example.com`)
- **Orchestrator Domain** (e.g. `orchestrator.example.com`)
- **Organization ID**
- **Client ID** and **Client Secret** (obtained from the DAP portal)
- **Diagnostician (auto-fix) adapter** — Bedrock (AWS), OpenAI, Claude Code, or Devin; optional, can be skipped (see Section 2)

The wizard validates the credentials against the orchestrator before saving, then writes the configuration file described below.

#### Verifying Setup

```bash
# Check current setup status
dap-bpa status
```

This command displays:

- Configured orchestrator profiles
- Credential validation status
- Available capabilities (blueprint linting, plugin docs, DAP API access)

#### Multiple Orchestrator Profiles

The top-level credentials in the config file act as your default orchestrator. For additional environments, add named profiles under the `orchestrators` map (structure below) and select them per command:

```bash
# Select a named orchestrator profile
dap-bpa orchestrator blueprints list -o lab
dap-bpa orchestrator blueprints list --orchestrator production
```

An unknown profile name returns an error listing the profiles available in your config.

### 2. Manual Configuration (Advanced)

For advanced users who need manual configuration, the setup wizard creates a configuration file at:

**Location**: `~/.blueprint-assist/config.json`

#### Configuration Structure

The top-level fields are the default orchestrator and map directly to the setup wizard prompts. Named profiles for additional environments live under the `orchestrators` map, and the `diagnostician` block records your auto-fix adapter choice:

```json
{
  "portalDomain": "portal.example.com",
  "orchestratorDomain": "orchestrator.example.com",
  "orgId": "your-org-id",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "diagnostician": {
    "adapter": "claude-code"
  },
  "orchestrators": {
    "lab": {
      "portalDomain": "portal.lab.example.com",
      "orchestratorDomain": "orchestrator.lab.example.com",
      "orgId": "your-org-id",
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret"
    }
  }
}
```

The wizard writes this file for you; manual editing is mainly useful for adding profiles or rotating secrets. Profile names (`lab` above) are your choice and are what you pass to `--orchestrator` / `-o`. Commands without a profile flag use the top-level default.

#### Diagnostician Configuration

The setup wizard also configures the Monitor Diagnostician — the auto-repair capability behind `dap-bpa monitor` — through one of four adapters: **Bedrock (AWS)**, **OpenAI**, **Claude Code** (uses the `claude` CLI on your machine), or **Devin** (uses the `devin` CLI). The choice is stored in the `diagnostician` block of `config.json`. This is separate from your IDE agent's model, which is configured within the IDE itself. See Section 2 for adapter details and model guidance.

#### Credentials

Orchestrator authentication uses Dell client credentials: an **Organization ID**, **Client ID**, and **Client Secret**, all obtained from the DAP portal. These are the values the setup wizard prompts for, and the only credential set you need for dap-bpa orchestrator operations.

### 3. SSL Certificate Configuration

#### Connection Options for SSL/TLS Issues

When encountering SSL certificate errors (self-signed certificates, development environments, or corporate proxies), you have two options to bypass verification:

| Method | Usage | Scope |
| ------ | ------------------------------------------------------------------- | ----------------------- |
| `--trust-all` | `dap-bpa orchestrator blueprints list -o lab --trust-all` | Single command (recommended) |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | `NODE_TLS_REJECT_UNAUTHORIZED=0 dap-bpa orchestrator blueprints list` | Command/session |

**Examples:**

```bash
# Option 1: Use the --trust-all global flag (recommended, v0.26.0+)
dap-bpa orchestrator blueprints list -o lab --trust-all

# Option 2: Environment variable (works on older versions too)
NODE_TLS_REJECT_UNAUTHORIZED=0 dap-bpa orchestrator blueprints list
```

#### For Development/Testing

Use `--trust-all` only for self-signed certificates in development environments. It bypasses certificate verification for that command, so prefer fixing the certificate chain (install the orchestrator's CA certificate — see the prerequisites guide in Section 2) over bypassing it routinely.

#### For Production

Do not use SSL bypass flags in production. Ensure the orchestrator presents a certificate that your workstation trusts, and keep certificates current.

### 4. CI/CD and Automated Environments

For pipelines and automation, provision the configuration file rather than running the interactive wizard: place a `config.json` (structure above) at `~/.blueprint-assist/config.json` on the runner, injecting the client secret from your pipeline's secret store at deploy time. Then select the target environment per command:

```bash
# Pick the profile explicitly in automation - don't rely on a default
dap-bpa orchestrator blueprints list --orchestrator production
dap-bpa monitor --file blueprint.yaml --orchestrator lab --detach
```

## Testing Authentication

### Verify Connection

```bash
# Check setup status
dap-bpa status

# Test orchestrator connection
dap-bpa orchestrator blueprints list -o your-orchestrator-profile
```

### Troubleshooting Authentication Issues

| Issue | Solution |
| ------- | ------------------------------------------------------------------ |
| 401 Unauthorized | Verify credentials in config.json, run `dap-bpa setup` again |
| 403 Forbidden | Check user permissions in orchestrator |
| SSL Certificate Error | Use `--trust-all` flag or configure valid certificates |
| Connection Timeout | Verify network connectivity and firewall rules |
| Invalid Organization ID | Confirm the organization ID with your orchestrator administrator |

## Security Best Practices

### Credential Management

- Never commit credentials to version control
- Use environment variables for CI/CD pipelines
- Rotate credentials regularly
- Use separate credentials for different environments
- Implement proper access controls

### SSL/TLS Configuration

- Always use SSL verification in production
- Keep SSL certificates up to date
- Use certificate pinning for high-security environments
- Monitor certificate expiration dates

### Access Control

- Use principle of least privilege
- Create separate service accounts for automation
- Regularly audit access logs
- Implement IP whitelisting where possible

## IDE Integration

### Installing Skills for IDEs

```bash
# Install dap-bpa skills into Windsurf
dap-bpa setup-ide windsurf

# Install dap-bpa skills into Claude Code
dap-bpa setup-ide claude-code
```

This installs the Blueprint Assist skills and rules into the location your IDE's agent reads from (for example `~/.claude/skills/` for Claude Code with `--scope personal`, or `~/.codeium/windsurf/skills/` for Windsurf). The agent picks them up automatically — no further registration is needed. Note that `setup-ide` installs skills only; the `dap-bpa` CLI itself is already on your PATH from the Section 2 installation and is available in any terminal, including your IDE's.

## Next Steps

After completing authentication:

1. Verify connection with `dap-bpa status`
2. Explore available blueprints with `dap-bpa knowledge blueprints find <query>` (e.g. `dap-bpa knowledge blueprints find vm`)
3. Review plugin documentation with `dap-bpa knowledge plugins docs <plugin>`
4. Proceed to Section 4: Skills Overview
