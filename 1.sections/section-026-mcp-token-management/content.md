# Section 026: MCP Token Management

> **Audience: DevOps engineers, platform architects, and infrastructure automation
> teams.** This section covers minting, managing, and validating tokens for secure
> MCP Gateway communication. New in v0.31.0+.

---

## Overview

MCP Token Management provides secure, short-lived token generation for Blueprint
Assist integrations. Tokens enable authenticated communication with the Blueprint
Assist MCP Gateway, MCP Endpoint, and orchestrator APIs while maintaining strict
scope and audience constraints.

### Key Capabilities

- **Token Minting** - Generate tokens with correct
  `scope=internal:exchangeable` and `--audience` values
- **Gateway Validation** - Test tokens against the MCP Gateway in real-time
- **Multiple Output Formats** - JSON, plaintext, file output, or clipboard export
- **Audit Logging** - Automatic token generation audit trail
- **Short TTL** - Tokens expire quickly (default 1 hour) to minimize exposure

---

## Quick Start: Mint Your First Token

### Generate a Token

```bash
# Basic token minting
dap-bpa mint-token --audience mcp-gateway

# Output: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The CLI automatically:

1. Sets `scope: internal:exchangeable`
2. Adds your `--audience` value
3. Signs with your configured credentials
4. Returns an exchangeable token

### Verify Token Validity

```bash
# Verify against the MCP Gateway
dap-bpa mint-token --audience mcp-gateway --verify

# Output:
# {
#   "status": "valid",
#   "audience": "mcp-gateway",
#   "scope": "internal:exchangeable",
#   "issued_at": "2026-09-14T10:30:00Z",
#   "expires_at": "2026-09-14T11:30:00Z",
#   "remaining_ttl_seconds": 3600
# }
```

### Export Token to Clipboard

```bash
# Copy token directly to clipboard
dap-bpa mint-token --audience mcp-gateway --copy

# Paste directly: Ctrl+V or Cmd+V
```

---

## Token Minting Workflow

### Step 1: Configure Credentials

Before minting tokens, ensure your MCP credentials are configured:

```bash
# Interactive setup
dap-bpa setup
```

`dap-bpa setup` stores the portal domain, org ID, client ID, and client secret in an orchestrator profile in `~/.blueprint-assist/config.json` (`portalDomain`, `orgId`, `clientId`, `clientSecret`).

In CI, or anywhere you don't want a config file on disk, set environment variables instead. They take precedence over `config.json`:

```bash
export DAP_PORTAL_DOMAIN="<portal-domain>"
export DAP_ORG_ID="<org-id>"
export DAP_CLIENT_ID="<client-id>"
export DAP_CLIENT_SECRET="<client-secret>"   # from your secrets manager
```

> **Credentials are never accepted on the command line** (v0.33.0+). Passing a secret as a flag (for example `--client-secret` or `--token`) fails with exit code 2 and the message "Credential values are not accepted as command-line arguments". This applies to `mint-token` too, even though its `--help` still lists `--client-secret`. Non-secret overrides such as `--portal-domain`, `--org-id`, `--client-id`, and `--orchestrator-domain` are still accepted.

### Step 2: Mint Token with Specific Audience

```bash
# For MCP Gateway
dap-bpa mint-token --audience mcp-gateway

# For Orchestrator API
dap-bpa mint-token --audience orchestrator-api

# For Custom Service
dap-bpa mint-token --audience custom-service-name
```

### Step 3: Validate Token

```bash
# Quick local validation
dap-bpa mint-token --audience mcp-gateway --verify
```

Output includes:

- Token validity status
- Expiration time
- Remaining TTL (time-to-live)
- Audience and scope

### Step 4: Export Token

Choose output format based on your use case:

```bash
# JSON output (for parsing)
dap-bpa mint-token --audience mcp-gateway --json

# Output:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expires_in": 3600,
#   "scope": "internal:exchangeable"
# }

# Plain text (for scripts)
dap-bpa mint-token --audience mcp-gateway

# Save to file (for CI/CD)
dap-bpa mint-token --audience mcp-gateway --out ~/.blueprint-assist/tokens/mcp-token.jwt

# Copy to clipboard (for manual use)
dap-bpa mint-token --audience mcp-gateway --copy
```

---

## Token Scope & Audience Reference

### Standard Scopes

| Scope | Purpose | Permissions |
| --- | --- | --- |
| `internal:exchangeable` | Token is issued by BlueprintAssist and can be exchanged at the MCP Gateway | Read/Write to orchestrator, create/update/delete blueprints |
| `api:readonly` | Read-only access to orchestrator | List blueprints, get deployments, read events |
| `api:admin` | Full administrative access | All orchestrator operations |

### Standard Audiences

| Audience | Service | Use Case |
| --- | --- | --- |
| `mcp-gateway` | Blueprint Assist MCP Gateway | IDE extensions, agents, MCP clients |
| `orchestrator-api` | DAP Orchestrator REST API | Direct API calls, custom integrations |
| `mcp-endpoint` | MCP Endpoint | Services behind the Dell Automation Platform MCP endpoint |
| Custom name | Your service | Integration with private services |

### Recommend Combinations

```bash
# MCP Gateway integration (most common)
dap-bpa mint-token --audience mcp-gateway

# Orchestrator direct API access
dap-bpa mint-token --audience orchestrator-api

# Read-only token for monitoring
dap-bpa mint-token --audience orchestrator-api --scope api:readonly
```

---

## Integration Examples

### Using Token in REST API Calls

```bash
# Mint token
TOKEN=$(dap-bpa mint-token --audience orchestrator-api)

# Use in API call
curl -H "Authorization: Bearer $TOKEN" \
  https://orchestrator-api.dell.com/api/v1/blueprints \
  --json
```

### Using Token in Python Script

```python
import subprocess
import requests

def get_mcp_token(audience="mcp-gateway"):
    """Mint a fresh token using dap-bpa"""
    result = subprocess.run(
        ["dap-bpa", "mint-token", "--audience", audience],
        capture_output=True,
        text=True
    )
    return result.stdout.strip()

def list_blueprints():
    """List blueprints using minted token"""
    token = get_mcp_token("orchestrator-api")
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        "https://orchestrator-api.dell.com/api/v1/blueprints",
        headers=headers
    )
    return response.json()

# Usage
blueprints = list_blueprints()
print(f"Found {len(blueprints)} blueprints")
```

### Using Token in Node.js

```javascript
const { execSync } = require('child_process');
const fetch = require('node-fetch');

async function getMcpToken(audience = 'mcp-gateway') {
  const token = execSync(`dap-bpa mint-token --audience ${audience}`)
    .toString()
    .trim();
  return token;
}

async function listBlueprints() {
  const token = await getMcpToken('orchestrator-api');

  const response = await fetch(
    'https://orchestrator-api.dell.com/api/v1/blueprints',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.json();
}

// Usage
listBlueprints().then(blueprints => {
  console.log(`Found ${blueprints.length} blueprints`);
});
```

### GitHub Actions: Automated Token Refresh

```yaml
name: Deploy Blueprint

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      # dap-bpa is distributed through Dell Automation Studio, not a public
      # package registry. Make the Linux package available to the runner
      # (for example from an internal artifact store), then run install.sh.
      - name: Install Blueprint Assist
        run: |
          unzip -q bpa-linux-x64-<version>.zip -d bpa
          cd bpa/<bpa-linux-package> && ./install.sh

      # Credentials come from repository secrets as DAP_* environment
      # variables. No config file is written, and nothing is passed on argv.
      - name: Mint deployment token
        id: token
        env:
          DAP_PORTAL_DOMAIN: ${{ secrets.DAP_PORTAL_DOMAIN }}
          DAP_ORG_ID: ${{ secrets.DAP_ORG_ID }}
          DAP_CLIENT_ID: ${{ secrets.DAP_CLIENT_ID }}
          DAP_CLIENT_SECRET: ${{ secrets.DAP_CLIENT_SECRET }}
        run: |
          TOKEN=$(dap-bpa mint-token --audience orchestrator-api)
          echo "::add-mask::$TOKEN"
          echo "token=$TOKEN" >> $GITHUB_OUTPUT

      - name: Deploy blueprint
        env:
          DEPLOYMENT_TOKEN: ${{ steps.token.outputs.token }}
        run: |
          curl -X POST https://orchestrator-api.dell.com/api/v1/deployments \
            -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
            -d @deployment-body.json
```

### GitLab CI: Token in Secrets

```yaml
stages:
  - deploy

deploy_blueprint:
  stage: deploy
  image: ubuntu:24.04
  # Set DAP_PORTAL_DOMAIN, DAP_ORG_ID, DAP_CLIENT_ID, and DAP_CLIENT_SECRET
  # as masked CI/CD variables. dap-bpa reads them from the environment, so
  # no setup step or config file is needed.
  before_script:
    # dap-bpa comes from Dell Automation Studio; make the Linux package
    # available to the job, then install it
    - apt-get update && apt-get install -y unzip curl
    - unzip -q bpa-linux-x64-<version>.zip -d bpa
    - cd bpa/<bpa-linux-package> && ./install.sh && cd -
  script:
    # Mint token for this deployment
    - export DEPLOY_TOKEN=$(dap-bpa mint-token --audience orchestrator-api)
    - echo "Token expires in 1 hour"

    # Use token in deployment
    - |
      curl -X POST https://orchestrator-api.dell.com/api/v1/deployments \
        -H "Authorization: Bearer $DEPLOY_TOKEN" \
        -H "Content-Type: application/json" \
        -d @deployment-body.json
  only:
    - main
```

---

## Token Validation & Security

### Gateway Validation (Real-Time)

```bash
# Validate against actual MCP Gateway
dap-bpa mint-token --audience mcp-gateway --verify

# Example output with all fields:
# {
#   "valid": true,
#   "token_summary": {
#     "algorithm": "HS256",
#     "type": "JWT",
#     "issued_at": "2026-09-14T10:30:00Z",
#     "expires_at": "2026-09-14T11:30:00Z"
#   },
#   "gateway_response": {
#     "status": "authorized",
#     "audience": "mcp-gateway",
#     "scope": "internal:exchangeable",
#     "ttl_remaining": 3600
#   }
# }
```

### Token Details

`mint-token` has no offline validation or inspect mode (`--offline` and `--inspect` are not options). Use `--json` to print the token with its metadata, or `--verify` to test it against the gateway.

```bash
dap-bpa mint-token --audience mcp-gateway --json
```

---

## Best Practices

### 1. Always Set Explicit Audience

```bash
# ✓ CORRECT - explicit audience
dap-bpa mint-token --audience orchestrator-api

# ✗ WRONG - unclear which service
dap-bpa mint-token
```

### 2. Validate Tokens Before Using

```bash
# Mint and verify in one command
dap-bpa mint-token --audience mcp-gateway --verify || exit 1

# Use the token
TOKEN=$(dap-bpa mint-token --audience mcp-gateway)
```

### 3. Store Tokens Securely

Never commit tokens to version control:

```bash
# ✓ CORRECT - use secrets manager
export MCP_TOKEN=$(dap-bpa mint-token --audience mcp-gateway)
curl -H "Authorization: Bearer $MCP_TOKEN" ...

# ✗ WRONG - hardcoded
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Rotate Tokens Regularly

Tokens have short TTL (default 1 hour). Mint fresh tokens as needed:

```bash
# For long-running processes, periodically refresh
while true; do
  TOKEN=$(dap-bpa mint-token --audience orchestrator-api)
  # Use token for operations
  sleep 50m  # Refresh before expiry
done
```

### 5. Use `--copy` for Interactive Use

```bash
# Copy to clipboard for manual API testing
dap-bpa mint-token --audience orchestrator-api --copy

# Paste into Authorization header in Postman/curl
```

---

## Troubleshooting

### Token Validation Fails

**Symptom**: `--verify` returns `valid: false` or gateway returns 401

**Cause**:

- Credentials not configured correctly
- Audience doesn't match gateway expectations
- Client secret is incorrect

**Solution**:

```bash
# Reconfigure credentials
dap-bpa setup

# Check which profile and credentials are in use
dap-bpa status

# Try with correct audience
dap-bpa mint-token --audience mcp-gateway --verify
```

### Gateway Unreachable

**Symptom**: `--verify` times out or connection refused

**Cause**: Wrong gateway URL or a network issue. By default `--verify` derives the gateway URL from the portal domain.

**Solution**:

```bash
# Verify network connectivity
curl https://ai-bp-mcp-server.sp.dell.com/health

# Point --verify at a specific gateway
dap-bpa mint-token --audience mcp-gateway --verify --mcp-url https://ai-bp-mcp-server.sp.dell.com/mcp
```

### Token Expires Too Quickly

**Symptom**: Token valid for only a few minutes

**Cause**: Gateway issued shorter TTL than expected

**Solution**:

- Mint a fresh token as needed (TTL is configurable in gateway)
- For long-running operations, implement token refresh logic

### Audience Not Recognized

**Symptom**: `"audience not recognized"` error

**Cause**: Invalid audience value. The audience must be the target MCP server's predefined client ID.

**Solution**: Read `token_audience` from the server's `GET /docs` response (on servers that serve `/docs`), then mint with that value:

```bash
dap-bpa mint-token --audience <token_audience from GET /docs>
```

---

## Token Lifecycle Reference

```text
┌─────────────────────────────────────────────────────────────┐
│ Token Lifecycle (Default: 1 Hour TTL)                       │
├─────────────────────────────────────────────────────────────┤
│ T+00:00  Token minted (scope=internal:exchangeable)        │
│ T+30:00  Token valid, ~30 min remaining                     │
│ T+55:00  ⚠️ Token approaching expiry - refresh recommended  │
│ T+59:59  Token valid for <1 minute                          │
│ T+60:00  ❌ Token expired - must mint new token             │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Mint your first token**: `dap-bpa mint-token --audience mcp-gateway`
2. **Test validation**: `dap-bpa mint-token --audience mcp-gateway --verify`
3. **Integrate with your tool**: Use token in REST API calls or scripts
4. **Set up automation**: Add token minting to your CI/CD pipeline
5. **Review MCP Server section**: See
   [Section 019: MCP Server](../section-019-mcp-server/content.md) for
   additional context
