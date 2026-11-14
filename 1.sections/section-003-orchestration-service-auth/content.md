# Section 003: Orchestration Service Authentication

## Overview

This section covers the essential authentication processes required to connect to Dell Automation Platform (DAP) orchestrators using Blueprint Assist. Proper authentication is the foundation for all blueprint operations, including deployment, monitoring, and management.

> **Terminology note**: Throughout this training you may see references to both **DAP** (Dell Automation Platform) and **Dell Distributed Private Cloud**. DAP is the umbrella platform name; Dell Distributed Private Cloud is the underlying orchestration engine it is built on. For all practical purposes when configuring BPA, you are connecting to a **DAP orchestrator** - the terms can be treated as interchangeable in this context.

## Prerequisites

### Account Requirements

- Valid Dell Automation Platform account with appropriate permissions
- DAP credentials obtained from the DAP portal - **organization ID**, **client ID**, and **client secret**
- Your portal and orchestrator domain names
- Network access to orchestrator endpoints

### Software Requirements

- Blueprint Assist installed (see Section 2) - this includes the full dap-bpa tool with skills, knowledge base, and CLI
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
- **Diagnostician (auto-fix) adapter** - Bedrock (AWS), OpenAI, Claude Code, or Devin; optional, can be skipped (see Section 2)

The wizard validates the credentials against the orchestrator before saving, then writes the configuration file described below. The Client Secret prompt does not echo what you type, and pasting the secret completes the prompt (v0.33.0+).

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

The setup wizard also configures the Monitor Diagnostician - the auto-repair capability behind `dap-bpa monitor` - through one of four adapters: **Bedrock (AWS)**, **OpenAI**, **Claude Code** (uses the `claude` CLI on your machine), or **Devin** (uses the `devin` CLI). The choice is stored in the `diagnostician` block of `config.json`. This is separate from your IDE agent's model, which is configured within the IDE itself. See Section 2 for adapter details and model guidance.

#### Credentials

Orchestrator authentication uses Dell client credentials: an **Organization ID**, **Client ID**, and **Client Secret**, all obtained from the DAP portal. These are the values the setup wizard prompts for, and the only credential set you need for dap-bpa orchestrator operations.

#### Environment Variables Take Precedence (v0.33.0+)

Credentials can also come from environment variables, which take precedence over `config.json`:

| Variable | Replaces |
| -------- | -------- |
| `DAP_CLIENT_ID` | `clientId` |
| `DAP_CLIENT_SECRET` | `clientSecret` |
| `DAP_ORG_ID` | `orgId` |
| `DAP_TOKEN` | A pre-minted access token, used instead of client credentials |
| `DAP_PORTAL_DOMAIN` / `DAP_ORCHESTRATOR_DOMAIN` | `portalDomain` / `orchestratorDomain` |

With these set, dap-bpa runs with no config file on disk at all, which is the recommended setup for CI runners (see [CI/CD and Automated Environments](#4-cicd-and-automated-environments)).

Credentials are never accepted as command-line arguments. Flags such as `--token`, `--client-secret`, `--password`, `--secret`, and `--api-token` are rejected with exit code 2, and the value is not echoed, because arguments end up in shell history and the process list:

```text
Credential values are not accepted as command-line arguments (--client-secret).
For security, pass credentials via environment variables (DAP_TOKEN, DAP_CLIENT_ID, DAP_CLIENT_SECRET, DAP_ORG_ID) instead.
```

On Linux and macOS, dap-bpa prints a non-blocking warning when `config.json` is readable by other users and may contain credentials; fix it with `chmod 600 ~/.blueprint-assist/config.json`.

### 3. SSL Certificate Configuration

#### Trust a Private CA (Recommended)

If the orchestrator uses a certificate from a private or lab CA, tell dap-bpa to trust that CA. Verification still runs, against the real certificate:

```bash
# Save the CA (PEM) on the default profile, or on a named profile
dap-bpa setup --ca-cert ./lab-ca.pem
dap-bpa setup --ca-cert ./lab-ca.pem --orchestrator lab
```

The CA is stored as `caCert` on the profile. Mutual TLS uses `clientCert` / `clientKey`. Each can also be set with an environment variable, which applies even when you pick a profile explicitly with `-o` (v0.33.0+):

| Variable | Purpose |
| -------- | ------- |
| `DAP_CA_CERT` | Extra CA (PEM) to trust |
| `DAP_CLIENT_CERT` / `DAP_CLIENT_KEY` | Client certificate and key for mutual TLS |
| `DAP_TRUST_ALL` | Same as `--trust-all` |

#### Bypassing Verification (Development Only)

When a CA certificate is not available, you can turn certificate verification off:

| Method | Usage | Scope |
| ------ | ------------------------------------------------------------------- | ----------------------- |
| `--trust-all` | `dap-bpa orchestrator blueprints list -o lab --trust-all` | Single command |
| `trustAll: true` | Saved on the profile; the setup wizard's trust-all prompt (or `dap-bpa setup --trust-all`) persists it (v0.33.0+) | Every command for that profile |
| `DAP_TRUST_ALL` | Environment variable | Command/session |

```bash
# Bypass for one command
dap-bpa orchestrator blueprints list -o lab --trust-all
```

Notes on `trustAll` / `--trust-all`:

- **It now applies to sign-in as well (v0.33.1+)**. On earlier builds the compiled binary still verified certificates on the portal and token calls, so self-signed portals failed with `unable to verify the first certificate` even with `trustAll: true`. Upgrade if you see this.
- **It overrides certificates**. With `trustAll` set, verification never runs, so a `caCert`, `clientCert`, or `clientKey` on the same profile is ignored. dap-bpa warns about this combination at setup time and on every command (v0.33.1+). Remove `trustAll` from the profile to use the CA.
- Use it only for self-signed certificates in development environments. Prefer `setup --ca-cert` (see the prerequisites guide in Section 2 for obtaining the CA certificate).

#### For Production

Do not use SSL bypass flags in production. Ensure the orchestrator presents a certificate that your workstation trusts, and keep certificates current.

### 4. CI/CD and Automated Environments

For pipelines and automation, don't run the interactive wizard. Pass credentials as environment variables from your pipeline's secret store (v0.33.0+); dap-bpa then needs no config file on the runner, so no secrets are written to disk:

```bash
export DAP_PORTAL_DOMAIN="portal.example.com"
export DAP_ORCHESTRATOR_DOMAIN="orchestrator.example.com"
export DAP_ORG_ID="$PIPELINE_DAP_ORG_ID"
export DAP_CLIENT_ID="$PIPELINE_DAP_CLIENT_ID"
export DAP_CLIENT_SECRET="$PIPELINE_DAP_CLIENT_SECRET"
export DAP_CA_CERT="/path/to/ca.pem"        # if the orchestrator uses a private CA

dap-bpa orchestrator blueprints list
```

If you need several named profiles on one runner, you can still provision a `config.json` (structure above) at `~/.blueprint-assist/config.json`, keeping secrets out of it and supplying them through the environment. Then select the target environment per command:

```bash
# Pick the profile explicitly in automation - don't rely on a default
dap-bpa orchestrator blueprints list --orchestrator production
dap-bpa monitor --file blueprint.yaml --orchestrator lab --detach
```

Scripts can tell failures apart by exit code: `1` for runtime errors (including TLS and connection failures), `2` for usage errors (including a credential passed as a flag), and `3` for authentication or authorization failures (HTTP 401 or 403).

## Testing Authentication

### Verify Connection

```bash
# Check setup status
dap-bpa status

# Test orchestrator connection
dap-bpa orchestrator blueprints list -o your-orchestrator-profile
```

### Troubleshooting Authentication Issues

From v0.33.0, connection problems are reported as what they are, rather than as bad credentials, and exit with code 1. Add `--debug` to see the raw server response.

| Issue | Solution |
| ------- | ------------------------------------------------------------------ |
| 401 Unauthorized (exit 3) | Verify credentials in config.json or the `DAP_*` environment variables (which win over the file); run `dap-bpa setup` again |
| 403 Forbidden (exit 3) | The message starts with the server's own reason; check user permissions in the orchestrator |
| `TLS error connecting to <host>: <CODE>` | The certificate is not trusted: set `DAP_CA_CERT` or run `dap-bpa setup --ca-cert <path>`; `--trust-all` only for development |
| `unable to verify the first certificate` with `trustAll: true` | Upgrade to v0.33.1 or later, where `trustAll` applies to sign-in calls too |
| `Cannot connect to <host>:<port>: ECONNREFUSED` | Nothing is listening: check the domain and port, or start the tunnel for the profile (Section 16) |
| `Cannot resolve host <host>: ENOTFOUND` | Check the domain name and DNS; lab hosts may only resolve through a tunnel or VPN |
| `Connection to <host>:<port> timed out` | Verify network connectivity and firewall rules |
| Invalid Organization ID | Confirm the organization ID with your orchestrator administrator |

## Security Best Practices

### Credential Management

- Never commit credentials to version control
- Use environment variables for CI/CD pipelines; never pass credentials as command-line flags (dap-bpa rejects them)
- Keep `config.json` private (`chmod 600` on Linux and macOS)
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
# Install dap-bpa skills for Devin (replaces the old windsurf target)
dap-bpa setup-ide devin

# Install dap-bpa skills into Claude Code
dap-bpa setup-ide claude-code
```

This installs the Blueprint Assist skills and rules into the location your IDE's agent reads from (for example `.claude/skills/` in the project for Claude Code, or `.agents/skills/` for Devin). Run `dap-bpa setup-ide --help` for the full list of IDE targets. The agent picks them up automatically - no further registration is needed. Note that `setup-ide` installs skills only; the `dap-bpa` CLI itself is already on your PATH from the Section 2 installation and is available in any terminal, including your IDE's.

## Next Steps

After completing authentication:

1. Verify connection with `dap-bpa status`
2. Explore available blueprints with `dap-bpa knowledge blueprints find <query>` (e.g. `dap-bpa knowledge blueprints find vm`)
3. Review plugin documentation with `dap-bpa knowledge plugins docs <plugin>`
4. Proceed to Section 4: Skills Overview
