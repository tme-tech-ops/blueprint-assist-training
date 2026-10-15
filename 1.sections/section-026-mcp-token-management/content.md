# Section 026: MCP Token Management

> **Audience: DevOps engineers, platform architects, and infrastructure automation teams.** This section covers minting, managing, and validating tokens for secure MCP Gateway communication. New in v0.31.0+.

---

## Overview

MCP Token Management provides secure, short-lived token generation for Blueprint Assist integrations. Tokens enable authenticated communication with the Blueprint Assist MCP Gateway, MCP Endpoint, and orchestrator APIs while maintaining strict scope and audience constraints.

### Key Capabilities

- **Token Minting** — Generate tokens with correct `scope=internal:exchangeable` and `--audience` values
- **Offline Validation** — Verify tokens locally before deploying
- **Gateway Validation** — Test tokens against the MCP Gateway in real-time
- **Multiple Output Formats** — JSON, plaintext, file output, or clipboard export
- **Audit Logging** — Automatic token generation audit trail
- **Short TTL** — Tokens expire quickly (default 1 hour) to minimize exposure

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

Or create `~/.blueprint-assist/config.json`:

```json
{
  "mcp_client_id": "your-client-id",
  "mcp_client_secret": "your-client-secret",
  "mcp_gateway_url": "https://mcp-gateway.sp.dell.com",
  "mcp_audience": "mcp-gateway"
}
```

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
| `mcp-endpoint` | MCP Endpoint | Internal Dell Automation Platform services |
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
      
      - name: Install Blueprint Assist
        run: |
          npm install -g @dell/blueprint-assist
          dap-bpa setup --non-interactive \
            --mcp-client-id ${{ secrets.MCP_CLIENT_ID }} \
            --mcp-client-secret ${{ secrets.MCP_CLIENT_SECRET }}
      
      - name: Mint deployment token
        id: token
        run: |
          TOKEN=$(dap-bpa mint-token --audience orchestrator-api --json)
          echo "token=$TOKEN" >> $GITHUB_OUTPUT
      
      - name: Validate token
        run: |
          dap-bpa mint-token --audience orchestrator-api --verify
      
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
  image: node:18
  before_script:
    - npm install -g @dell/blueprint-assist
    - dap-bpa setup --non-interactive
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

### Local Validation (Offline)

```bash
# Validate without contacting gateway (checks signature only)
dap-bpa mint-token --audience mcp-gateway --verify --offline

# Useful for:
# - Checking token format
# - Verifying expiration
# - Confirming scope and audience
# - Does NOT check revocation status
```

### Token Introspection

```bash
# Get token details without validation
dap-bpa mint-token --audience mcp-gateway --inspect

# Output:
# {
#   "header": { "alg": "HS256", "typ": "JWT" },
#   "payload": {
#     "iat": 1694710200,
#     "exp": 1694713800,
#     "aud": "mcp-gateway",
#     "scope": "internal:exchangeable"
#   }
# }
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

# Verify configuration
dap-bpa orchestrator profile list

# Try with correct audience
dap-bpa mint-token --audience mcp-gateway --verify
```

### Gateway Unreachable

**Symptom**: `--verify` times out or connection refused

**Cause**: MCP Gateway URL not configured or network issue

**Solution**:

```bash
# Check configuration
cat ~/.blueprint-assist/config.json | grep mcp_gateway_url

# Verify network connectivity
curl https://mcp-gateway.sp.dell.com/health

# Manually set gateway URL
dap-bpa setup --mcp-gateway-url https://mcp-gateway.sp.dell.com
```

### Token Expires Too Quickly

**Symptom**: Token valid for only a few minutes

**Cause**: Gateway issued shorter TTL than expected

**Solution**:

- Mint a fresh token as needed (TTL is configurable in gateway)
- For long-running operations, implement token refresh logic

### Audience Not Recognized

**Symptom**: `"audience not recognized"` error

**Cause**: Invalid audience value

**Solution**:

```bash
# List valid audiences for your setup
dap-bpa orchestrator profile show --audience-list

# Use valid audience
dap-bpa mint-token --audience mcp-gateway
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
5. **Review MCP Server section**: See [Section 019: MCP Server](../section-019-mcp-server/content.md) for additional context
