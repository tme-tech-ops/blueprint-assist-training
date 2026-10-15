# Section 025: Docker Sandbox Images & Testing

> **Audience: DevOps engineers, CI/CD pipeline maintainers, and development teams.** This section covers containerized testing environments, release-specific testing, and CI/CD integration without touching your host installation. New in v0.31.0+.

---

## Overview

Docker Sandbox Images allow you to test Blueprint Assist at **any release version, commit hash, or custom build** within an isolated container without modifying your host installation or requiring a local binary build.

### Key Capabilities

- **Versioned Containers** — Test at any released version (e.g., v0.30.1, v0.31.0)
- **Commit-Specific Testing** — Test at exact Git commits for regression validation
- **Multiple Variants** — `dap-bpa-sandbox-claude` (Claude-powered) and `dap-bpa-sandbox-codex` (Codex-powered)
- **Host Isolation** — No impact to your host `~/.blueprint-assist` or installed binaries
- **CI/CD Ready** — Push to registries, pin in pipelines, automated release testing
- **Full Feature Set** — Every BPA feature available in containers (skills, knowledge base, MCP server)

---

## Quick Start: Run BPA in Docker

### Pull and Run a Specific Version

```bash
# Latest version
docker run --rm -it \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  blueprint lint --file /workspace/blueprint.yaml

# Specific version
docker run --rm -it \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:v0.31.0 \
  blueprint lint --file /workspace/blueprint.yaml

# Specific commit
docker run --rm -it \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:sha-a1b2c3d \
  blueprint validate-all --file /workspace/blueprint.yaml
```

### Available Image Tags

| Tag Pattern | Example | What It Tests |
|---|---|---|
| `latest` | `dap-bpa-sandbox-claude:latest` | Most recent release |
| Version | `dap-bpa-sandbox-claude:v0.31.0` | Specific released version |
| Major.Minor | `dap-bpa-sandbox-claude:v0.31` | Latest patch of that minor |
| Commit SHA | `dap-bpa-sandbox-claude:sha-abc123d` | Exact Git commit (7-char SHA) |
| Branch | `dap-bpa-sandbox-claude:main` | Current main branch tip |

---

## Docker Sandbox Image Variants

### Claude-Powered (Recommended)

```bash
docker pull ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest
```

- Uses Claude Opus by default
- Full reasoning and decision trace capabilities
- Recommended for complex blueprint generation

### Codex-Powered (Legacy)

```bash
docker pull ghcr.io/dell-emc/dap-bpa-sandbox-codex:latest
```

- Uses OpenAI Codex as fallback
- Lighter resource footprint
- Compatible with v0.28.0+ codebases

---

## Workflow: Testing Blueprints in Containers

### Single-Command Validation

Lint and validate a blueprint at a specific version:

```bash
#!/bin/bash
BLUEPRINT_PATH="./my-blueprint"
VERSION="v0.31.0"

docker run --rm -it \
  -v "$(pwd)/$BLUEPRINT_PATH":/workspace \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:${VERSION} \
  bash -c "
    cd /workspace && \
    dap-bpa blueprint lint --file blueprint.yaml --verify && \
    dap-bpa blueprint validate-all --file blueprint.yaml && \
    echo 'Blueprint valid at version ${VERSION}'
  "
```

### Multi-Version Regression Testing

Test a blueprint against multiple versions to catch regressions:

```bash
#!/bin/bash
BLUEPRINT_PATH="./my-blueprint"
VERSIONS=("v0.30.0" "v0.30.1" "v0.31.0" "latest")

echo "Testing blueprint across versions..."
for VERSION in "${VERSIONS[@]}"; do
  echo -e "\n=== Testing ${VERSION} ==="
  docker run --rm \
    -v "$(pwd)/$BLUEPRINT_PATH":/workspace \
    ghcr.io/dell-emc/dap-bpa-sandbox-claude:${VERSION} \
    blueprint lint --file /workspace/blueprint.yaml

  if [ $? -eq 0 ]; then
    echo "✓ $VERSION: PASS"
  else
    echo "✗ $VERSION: FAIL"
    exit 1
  fi
done
```

### Interactive Shell in Container

For debugging or exploration:

```bash
docker run --rm -it \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  -v "$(pwd)":/workspace \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  /bin/bash

# Inside container:
dap-bpa --version
dap-bpa blueprint lint --file /workspace/my-blueprint/blueprint.yaml
```

---

## CI/CD Integration Examples

### GitHub Actions: Matrix Testing

Test a blueprint against multiple BPA versions:

```yaml
name: Blueprint Testing Matrix

on: [push, pull_request]

jobs:
  test-blueprint:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        bpa-version: ['v0.30.1', 'v0.31.0', 'latest']
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Lint blueprint with ${{ matrix.bpa-version }}
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            ghcr.io/dell-emc/dap-bpa-sandbox-claude:${{ matrix.bpa-version }} \
            blueprint lint --file /workspace/my-blueprint/blueprint.yaml --verify
      
      - name: Validate nodes with ${{ matrix.bpa-version }}
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            ghcr.io/dell-emc/dap-bpa-sandbox-claude:${{ matrix.bpa-version }} \
            blueprint validate-all --file /workspace/my-blueprint/blueprint.yaml
```

### GitLab CI: Pre-Deployment Validation

```yaml
stages:
  - validate
  - test
  - deploy

validate-blueprint:
  stage: validate
  image: ghcr.io/dell-emc/dap-bpa-sandbox-claude:v0.31.0
  script:
    - dap-bpa blueprint lint --file ./my-blueprint/blueprint.yaml --verify
    - dap-bpa blueprint validate-all --file ./my-blueprint/blueprint.yaml
  artifacts:
    paths:
      - ./my-blueprint/
```

### Jenkins: Declarative Pipeline

```groovy
pipeline {
  agent any

  stages {
    stage('Validate Blueprint') {
      steps {
        script {
          def bpaVersion = 'v0.31.0'
          sh """
            docker run --rm \
              -v \$(pwd):/workspace \
              ghcr.io/dell-emc/dap-bpa-sandbox-claude:${bpaVersion} \
              blueprint lint --file /workspace/my-blueprint/blueprint.yaml --verify
          """
        }
      }
    }
    
    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        echo 'Blueprint validated. Ready for deployment.'
      }
    }
  }
}
```

---

## Advanced Usage

### Mount Configuration & Knowledge Base

Preserve configuration across container runs:

```bash
docker run --rm -it \
  -v ~/.blueprint-assist/config.json:/home/bpa/.blueprint-assist/config.json \
  -v ~/.blueprint-assist/knowledge:/home/bpa/.blueprint-assist/knowledge \
  -v "$(pwd)":/workspace \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  blueprint generate --intent "Create a simple Kubernetes deployment"
```

This allows:
- Reusing orchestrator profiles across runs
- Persisting downloaded plugin documentation
- Maintaining pattern learning sets

### Custom Environment Variables

Pass DAP configuration via environment:

```bash
docker run --rm -it \
  -e DAP_ORCHESTRATOR_DOMAIN="mcp-poc.dell.com" \
  -e DAP_TOKEN="eyJhbGci..." \
  -v "$(pwd)":/workspace \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  orchestrator blueprints list
```

### Volume Mounts for Knowledge Base

Pre-populate plugin documentation:

```bash
# Build custom image with your knowledge base
cat > Dockerfile << 'EOF'
FROM ghcr.io/dell-emc/dap-bpa-sandbox-claude:v0.31.0

# Copy your local knowledge base
COPY ./knowledge /home/bpa/.blueprint-assist/knowledge
COPY ./config.json /home/bpa/.blueprint-assist/config.json

ENTRYPOINT ["dap-bpa"]
EOF

docker build -t my-bpa:custom .

# Use custom image
docker run --rm -it my-bpa:custom blueprint lint --file /workspace/blueprint.yaml
```

---

## Container Image Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│  dap-bpa binary (v0.31.0)           │ ← Release-specific
├─────────────────────────────────────┤
│  Node.js runtime                    │
├─────────────────────────────────────┤
│  Python 3.11 + dependencies         │
├─────────────────────────────────────┤
│  Base OS (Ubuntu 22.04)             │
└─────────────────────────────────────┘
```

### Image Sizes

- **Base image**: ~800MB
- **With documentation**: ~900MB
- **With full knowledge base**: ~1.2GB

### Registry Locations

| Registry | URL | Access |
|---|---|---|
| GitHub Container Registry (GHCR) | `ghcr.io/dell-emc/dap-bpa-sandbox-*` | Public |
| Dell Automation Container Registry | (internal) | Dell employees only |

---

## Troubleshooting

### Image Pull Failures

**Symptom**: `Error response from daemon: manifest not found`

**Cause**: Version tag doesn't exist

**Solution**: Check available tags:

```bash
# List all tags for Claude variant
curl -s https://ghcr.io/v2/dell-emc/dap-bpa-sandbox-claude/tags/list | jq .tags

# Or use docker search
docker search ghcr.io/dell-emc/dap-bpa-sandbox-claude
```

### Permission Denied in Container

**Symptom**: `docker: permission denied while trying to connect to the Docker daemon`

**Cause**: User not in `docker` group

**Solution**:

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker service if needed
sudo systemctl restart docker
```

### Knowledge Base Not Persisted

**Symptom**: Plugin docs missing on second run

**Cause**: Container volume not mounted

**Solution**: Mount `~/.blueprint-assist` directory:

```bash
docker run --rm -it \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  knowledge plugins list
```

### Out of Memory in Container

**Symptom**: `Killed` or OOM error during blueprint generation

**Cause**: Default memory limit too low

**Solution**: Increase Docker memory:

```bash
# Increase memory limit to 4GB
docker run --rm -it \
  --memory 4g \
  -v ~/.blueprint-assist:/home/bpa/.blueprint-assist \
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  blueprint generate --intent "large blueprint"
```

---

## Best Practices

### 1. Pin Versions in CI/CD

Never use `latest` in production pipelines:

```bash
# ✗ WRONG - unpredictable
docker run ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest ...

# ✓ CORRECT - reproducible
docker run ghcr.io/dell-emc/dap-bpa-sandbox-claude:v0.31.0 ...
```

### 2. Use Read-Only Volumes

Prevent accidental modifications to blueprints:

```bash
docker run --rm -it \
  -v "$(pwd)":/workspace:ro \  # Read-only
  -v /tmp/output:/output \      # Writable output
  ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest \
  blueprint lint --file /workspace/blueprint.yaml
```

### 3. Combine with Script Validation

Wrap container commands in validation logic:

```bash
#!/bin/bash
set -e

echo "Testing blueprint at multiple versions..."

for version in v0.30.1 v0.31.0; do
  echo "Testing $version..."
  
  if ! docker run --rm \
    -v "$(pwd)":/workspace \
    ghcr.io/dell-emc/dap-bpa-sandbox-claude:$version \
    blueprint lint --file /workspace/blueprint.yaml; then
    
    echo "✗ Failed at $version"
    exit 1
  fi
done

echo "✓ Blueprint valid across all versions"
```

### 4. Clean Up After Testing

Remove temporary containers and images:

```bash
# Remove dangling images
docker image prune -f

# Remove stopped containers
docker container prune -f
```

---

## Next Steps

1. **Try a simple container run**: `docker run --rm ghcr.io/dell-emc/dap-bpa-sandbox-claude:latest --version`
2. **Set up multi-version testing**: Create a shell script for regression testing
3. **Integrate with your CI/CD**: Add sandbox image validation to your pipeline
4. **Monitor image updates**: Watch the GitHub Container Registry for new releases
