# Agent MCP Server - Local Deployment Kit (v0.32.0)

> Companion to [Section 019 - Blueprint Assist MCP Server](../../1.sections/section-019-mcp-server/content.md#agent-running-locally-v0320).
> Runs the Agent MCP Server on `http://localhost:3000` from the `agent-mcp-server-0.32.0.tar.gz` container image.

## Files

| File | Purpose |
| --- | --- |
| `compose.yaml` | Docker/Podman Compose service definition (binds `127.0.0.1:3000`) |
| `env.example` | All required and optional environment variables - copy to `.env` |
| `smoke-test.sh` | Checks `/health`, `/docs`, and the `/mcp` auth path (bash: Linux, macOS, Git Bash, WSL) |
| `smoke-test.ps1` | Same checks for Windows PowerShell 5.1+ / PowerShell 7 |
| `devin-desktop-mcp-config.json` | Devin Desktop config: hosted gateway + this local agent server, with placeholders for your orchestrator |
| [`diagrams/`](diagrams/local-deployment-diagrams.md) | Topology, auth/session flow, container anatomy, persistence, and setup-step diagrams |

> **Presenting MCP rather than running it?** The demo kit (why MCP, live-demo runbook, slides, hosted-server configs) is in [`../mcp-demo/`](../mcp-demo/README.md). This folder is only about running the Agent MCP Server yourself.

## Installing Podman

### Check if Podman is installed

```bash
podman --version
```

If Podman is not installed, follow the instructions below for your platform.

### Install on Windows

**Option 1 - MSI installer** (no package manager required): Download the latest Windows installer from the Podman GitHub releases page: https://github.com/containers/podman/releases

**Note:** Right-click the installer and select "Run as administrator" to avoid installation errors (error code 1625 indicates system policy restrictions).

**Option 2 - Podman Desktop** (GUI, no package manager required): Install from https://podman-desktop.io, which bundles the Podman CLI.

Podman Desktop provides a graphical interface for managing containers and includes:
- Podman CLI bundled automatically
- Container image management
- Container lifecycle control (start/stop/logs)
- Kubernetes support
- Extension marketplace

After installation, Podman Desktop will prompt you to initialize the Podman machine on Windows/macOS, which handles the WSL2/VM setup automatically. You can also use the CLI commands below from a terminal.

**Option 3 - Chocolatey** (requires Chocolatey):

```powershell
choco install podman-cli
```

**Option 4 - Scoop** (requires Scoop):

```powershell
scoop install podman
```

**Option 5 - winget** (requires winget, built into Windows 10/11):

```powershell
winget install -e --id RedHat.Podman
```

### Install on Linux / WSL

**Ubuntu/Debian**:

```bash
sudo apt update
sudo apt install -y podman
```

**Fedora/RHEL/CentOS**:

```bash
sudo dnf install podman
```

**Arch Linux**:

```bash
sudo pacman -S podman
```

**Other distributions**: See the official Podman installation guide at https://podman.io/docs/installation

For WSL on Windows, use the Linux commands above within your WSL distribution. No VM initialization is needed when running Podman natively in WSL.

### Initialize the Podman machine

**Windows/macOS only**: On Windows, Podman runs containers inside a Linux VM, which requires WSL2 installed first. On macOS, Podman similarly uses a VM. Linux and WSL native do not need this step.

**Windows setup**:

```powershell
# Install WSL2 (run from an elevated PowerShell prompt)
wsl --install
# Reboot if prompted
```

After WSL2 is installed, initialize and start the Podman machine:

```bash
podman machine init
podman machine start
podman run --rm hello-world
```

If Podman isn't found after installing, open a new terminal so the updated PATH is picked up.

## Prerequisites

- **Podman** (recommended; tested with Podman 5.x). On Windows/macOS, create and start the VM once: `podman machine init`, then `podman machine start` after every reboot. Linux and WSL native do not need machine initialization.
  - `podman compose` needs a compose provider (`docker-compose` or `podman-compose`) on your `PATH`. Install with:
    - `winget install Docker.DockerCompose` (Windows)
    - `pip install podman-compose` (cross-platform)
    - Or use Podman Desktop, which can install a compose provider for you
  - Docker Desktop works too: replace `podman` with `docker` in every command below
- `agent-mcp-server-0.32.0.tar.gz` from [Dell Automation Studio](https://automation.dell.com/catalog)
- DAP service-account (predefined client) ID and secret
- AWS credentials with Bedrock access **or** a local LLM endpoint (air-gapped mode)

## Quick Start

```bash
# 1. Start the Podman VM (Windows/macOS only; run `podman machine init` once first)
# Linux and WSL native: skip this step
podman machine start                               # Docker: start Docker Desktop

# 2. Install compose provider (if not already installed)
# Windows: winget install Docker.DockerCompose
# Cross-platform: pip install podman-compose
# Or use Podman Desktop, which can install a compose provider for you

# 3. Load the image (≈125 MB compressed, 453 MB on disk)
podman load -i agent-mcp-server-0.32.0.tar.gz     # or: docker load -i ...

# 4. Configure
cp env.example .env                               # then edit .env

# 5. Run
podman compose up -d                               # or: docker compose up -d

# 6. Verify
./smoke-test.sh                                    # Windows: see below
```

**Running the smoke test on Windows:**

| Shell | Command |
| --- | --- |
| PowerShell | `powershell -ExecutionPolicy Bypass -File .\smoke-test.ps1` |
| Git Bash | `./smoke-test.sh` (or `bash smoke-test.sh`) |
| WSL | `bash smoke-test.sh`, but only with WSL2 mirrored networking (`networkingMode=mirrored` in `.wslconfig`). In the default NAT mode, `localhost` inside WSL isn't the Windows host, so use PowerShell or Git Bash instead |

`-ExecutionPolicy Bypass` applies only to that one run. It's needed because Windows blocks unsigned scripts by default. If your policy already allows local scripts, `.\smoke-test.ps1` is enough. The script calls `curl.exe`, which is built into Windows 10/11 (the PowerShell `curl` alias is a different command).

**After a reboot**, repeat steps 1 and 5 on Windows/macOS: `podman machine start`, then `podman compose up -d` from this folder. On Linux and WSL native, just run `podman compose up -d`. The container doesn't restart on its own: Podman has no background daemon, so `restart: unless-stopped` doesn't apply after the VM restarts. Your data is kept in the `bpa-data` volume.

Expected smoke-test output (no customer token set):

```text
== GET /health
{"status":"ok","version":"0.0.0-dev"}
== GET /docs
{"mcp_endpoint":"http://localhost:3000/mcp","required_headers":[...] ...
== POST /mcp initialize (no credentials - expect 401 with hint/docs)
{"error":"MISSING_CREDENTIALS","message":"Missing required credential headers","hint":"See /docs ...","docs":"http://localhost:3000/docs"}
```

To test an authenticated session, set `DAP_CUSTOMER_TOKEN`, `DAP_ORG_ID`, and
`DAP_ORCHESTRATOR_DOMAIN` before running the smoke test (`export` in bash,
`$env:NAME = "..."` in PowerShell; see Step 6 below). Mint the token with
`audience` set to your `DAP_PREDEFINED_CLIENT_ID` (see `GET /docs` for the exact recipe).

### Checking it in a browser

This is an API server, not a website. Opening `http://localhost:3000` shows **`Cannot GET /`**, which is normal (Express's reply for a path with no route) and doesn't mean anything is wrong. Use these URLs:

| URL | In a browser? | Returns |
| --- | --- | --- |
| `http://localhost:3000/health` | Yes | `{"status":"ok",...}`, the quickest "is it up?" check |
| `http://localhost:3000/docs` | Yes | Connection instructions and the token recipe (JSON) |
| `http://localhost:3000/mcp` | No, `POST` only | The MCP endpoint your IDE connects to. A browser shows `Cannot GET /mcp`, which is also normal |

## Without Compose

```bash
podman run -d --name agent-mcp-server --env-file .env -p 127.0.0.1:3000:3000 \
  -v bpa-data:/home/nodeapp agent-mcp-server:0.32.0   # or: docker run ...
```

This uses a volume named `bpa-data`. Compose names its volume `agent-mcp-server-local_bpa-data`, so data isn't shared between the two ways of running; pick one.

## Building Blueprints from Devin Desktop

### Why two MCP servers

The Agent MCP Server has authoring tools (plan, edit, review, package) but **no** knowledge or lint tools. Those live on the gateway MCP server, whose knowledge tools need no credentials. Connect both:

| Server | Use it for |
| --- | --- |
| `bpa-gateway` (hosted `ai-bp-mcp-server.sp.dell.com`) | `list_node_types`, `get_node_type_docs`, `search_docs`, `find_blueprint_examples`, `lint_blueprint`, `create_blueprint`, deployments |
| `bpa-agent-local` (this container, `localhost:3000`) | `plan_blueprint`, `edit_blueprint`, `review_blueprint`, `summarize_blueprint`, `package_blueprint`, `complete_code`, `pattern_*`, `ask_bpa_agent` |

### Authoring loop

1. **Plan** - `plan_blueprint` (agent) with a natural-language description
2. **Research** - `list_node_types`, `get_node_type_docs`, `find_blueprint_examples` (gateway)
3. **Edit** - `edit_blueprint` (agent) applies changes to the file set
4. **Lint** - `lint_blueprint` (gateway); pass any errors back into `edit_blueprint`, repeat until clean
5. **Review** - `review_blueprint` (agent) scores the result and lists issues
6. **Package** - `package_blueprint` (agent) builds the base64 ZIP and generates `metadata.yaml`
7. **Upload** - `create_blueprint` (gateway) with the packaged ZIP

Example prompt for Devin: _"Use bpa-agent-local to plan a vSphere 3-tier web app blueprint, look up the vSphere node types with bpa-gateway, then edit, lint until clean, review, and package it."_

### Setup for a lab environment (step by step)

A lab environment usually differs from production in three ways: its own portal, self-signed certificates, and hostnames that only resolve on the lab network. In the steps below, replace `<portal-domain>`, `<orchestrator-domain>`, and `<lab-domain>` with your lab's values.

#### Step 1 - Confirm you can reach the lab from your machine

Connect to the lab VPN, then:

```powershell
Resolve-DnsName <portal-domain>
Resolve-DnsName <orchestrator-domain>
```

If these fail, the container can't reach the lab either; fix the VPN/DNS first. If you resolve them through a `hosts`-file entry instead, note the IPs for Step 4.

#### Step 2 - Configure `.env` for the lab

```dotenv
DAP_PORTAL_DOMAIN=<portal-domain>
DAP_PREDEFINED_CLIENT_ID=<lab service-account client id>
DAP_PREDEFINED_CLIENT_SECRET=<lab service-account client secret>
DAP_ALLOWED_ORCHESTRATOR_DOMAINS=*.automation.dell.com,*.<lab-domain>
DAP_DOCS_URL=http://localhost:3000/docs
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<bedrock-capable key>
AWS_SECRET_ACCESS_KEY=<secret>
ENTITLEMENT_MODE=dry-run
```

- The service account must be issued by the **lab portal**. A production (`dsp-portal.automation.dell.com`) service account won't work against the lab.
- The lab orchestrator's domain (e.g. `*.<lab-domain>`) must be in the allowlist, or every request gets `INVALID_DOMAIN`.
- The LLM still runs on AWS Bedrock (or set the air-gapped `LLM_ENDPOINT_*` variables in `env.example`).

#### Step 3 - Trust the lab CA

The server always verifies TLS. Export the lab CA certificate to `certs/lab-ca.pem` in this folder (it's git-ignored), for example:

```bash
mkdir -p certs
openssl s_client -connect <portal-domain>:443 -showcerts </dev/null 2>/dev/null \
  | awk '/BEGIN CERT/,/END CERT/' > certs/lab-ca.pem
```

Make sure the file includes the issuing CA (the last certificate in the chain), not just the server certificate. Then:

- in `compose.yaml`, uncomment the `./certs:/certs:ro` line under `volumes:`
- in `.env`, set `NODE_EXTRA_CA_CERTS=/certs/lab-ca.pem`

Don't use `NODE_TLS_REJECT_UNAUTHORIZED=0`, which turns off certificate checks for every outbound call, including to AWS.

#### Step 4 - (Only if Step 1 used a hosts file) pin the hostnames

The container doesn't see your Windows `hosts` file. Uncomment `extra_hosts:` in `compose.yaml` and add one line per host:

```yaml
extra_hosts:
  - "<portal-domain>:<portal-ip>"
  - "<orchestrator-domain>:<orchestrator-ip>"
```

#### Step 5 - Restart and check connectivity from inside the container

```bash
podman compose up -d
podman exec agent-mcp-server wget -q -T 8 --spider https://<portal-domain>; echo $?
podman exec agent-mcp-server wget -q -T 8 --spider https://<orchestrator-domain>; echo $?
```

`bad address` means DNS (Steps 1/4); a certificate error means the CA file (Step 3). An HTTP error status (e.g. `400`/`404`) is fine, because it means the host is reachable over TLS.

#### Step 6 - Mint a customer token for the local server

The token's `audience` must be the **local server's** `DAP_PREDEFINED_CLIENT_ID`. A token for the hosted servers won't work here (`AUTHENTICATION_FAILED`). Use your own lab client credentials (from `~/.blueprint-assist/config.json`):

```bash
dap-bpa mint-token \
  --audience <DAP_PREDEFINED_CLIENT_ID from .env> \
  --portal-domain <portal-domain> \
  --orchestrator-domain <orchestrator-domain> \
  --trust-all \
  --copy
```

`--copy` puts the token on your clipboard; `--trust-all` is only for a self-signed lab portal. `GET http://localhost:3000/docs` shows the same recipe as a `curl` command.

> **Don't use `--verify` against this server.** `/docs` suggests `--verify --mcp-url http://localhost:3000/mcp`, but `--verify` sends `tools/list` without an MCP session. The Agent MCP Server rejects that with `400 No valid session ID provided` before checking the token, so verification always reports "inconclusive". (`--verify` does work against the gateway.)

Verify the token with a real `initialize` instead:

```bash
export DAP_CUSTOMER_TOKEN=<token from above>
export DAP_ORG_ID=<your org id>
export DAP_ORCHESTRATOR_DOMAIN=<orchestrator-domain>
./smoke-test.sh
```

```powershell
$env:DAP_CUSTOMER_TOKEN = "<token from above>"
$env:DAP_ORG_ID = "<your org id>"
$env:DAP_ORCHESTRATOR_DOMAIN = "<orchestrator-domain>"
powershell -ExecutionPolicy Bypass -File .\smoke-test.ps1
```

The last block should return `HTTP 200` with an `mcp-session-id` header. A `401`/`403` there means the token, audience, or service account is wrong.

For the **gateway** entry, use the token you already use for the hosted servers (see [`../mcp-demo/LAB-SETUP.md`](../mcp-demo/LAB-SETUP.md), step 1).

#### Step 7 - Add both servers to Devin Desktop

Copy [`devin-desktop-mcp-config.json`](devin-desktop-mcp-config.json) into your Devin Desktop MCP settings (the same place you added the hosted servers from `../mcp-demo/`). Replace:

| Placeholder | Value |
| --- | --- |
| `<GATEWAY_CUSTOMER_TOKEN>` | Your hosted-server token |
| `<LOCAL_SERVER_CUSTOMER_TOKEN>` | The token from Step 6 |
| `<YOUR_ORCHESTRATOR_DOMAIN>` | Your orchestrator hostname (no scheme) |
| `<YOUR_ORG_ID>` | Your org ID |

Reload the MCP servers in Devin Desktop and confirm `bpa-agent-local` lists 16 tools (`ask_bpa_agent`, `plan_blueprint`, … `pattern_get_trigger_words`).

#### Step 8 - Refresh tokens when they expire

Customer tokens are short-lived and Devin Desktop's headers are static. When calls start failing with `AUTHENTICATION_FAILED`, re-run Step 6 and paste the new token into the `bpa-agent-local` entry, then reload. The local server's own MCP session expires after 30 idle minutes (`BPA_MCP_SESSION_TTL_MIN`); the client re-initializes automatically.

### Destructive actions and elicitation

Deletes, `start_execution`, `cancel_execution`, and `create_secret` run through `ask_bpa_agent` require a human approve/deny via MCP **elicitation**. If the client doesn't support elicitation, the server refuses with `refused_no_elicitation`. It has not been verified whether Devin Desktop supports it. If you see that error, perform those operations with the gateway tools directly or with the `dap-bpa` CLI. Authoring tools (plan/edit/review/package) are not affected.

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `INVALID_DOMAIN` | Add the orchestrator (e.g. `*.<lab-domain>`) to `DAP_ALLOWED_ORCHESTRATOR_DOMAINS`, then `podman compose up -d` |
| `AUTHENTICATION_FAILED: Failed to acquire actor token` | Wrong portal/service account in `.env`, portal unreachable or untrusted from the container (Steps 3-5), or token minted with the wrong `audience` (Step 6) |
| `wget: bad address` inside the container | DNS - VPN not connected, or hosts entries not pinned (Step 4) |
| TLS / certificate errors in `podman logs agent-mcp-server` | CA file missing or incomplete (Step 3) |
| `bpa-agent-local` shows no tools in Devin | Container not running (`podman ps`), or token expired (Step 8) |
| `refused_no_elicitation` | See _Destructive actions and elicitation_ above |
| Browser shows `Cannot GET /` or `Cannot GET /mcp` | Normal, since there's no page at `/` and `/mcp` is POST-only. Open `/health` instead (see _Checking it in a browser_) |
| Browser can't connect to `localhost:3000` at all | Container not running (`podman ps`), or Podman VM stopped (`podman machine start`, then `podman compose up -d`) |

## Operations

```bash
podman compose logs -f        # follow logs (JSON lines)
podman compose down           # stop and remove (keeps the data volume)
podman machine start          # after a reboot (Windows/macOS only), then: podman compose up -d
# Linux and WSL native: skip podman machine start, just run podman compose up -d
```

The Node 20 AWS SDK deprecation warning at startup is expected and harmless.

### Persistent storage

`podman restart`/`docker restart` keeps the container's filesystem anyway. Data is lost only when the container is **recreated**, which happens on `compose down`, on `compose up -d` after a `.env` or `compose.yaml` change, and on image upgrades. `compose.yaml` mounts the named volume `bpa-data` at the app user's home (`/home/nodeapp`) so the server's on-disk state survives all of these.

What the server stores, and where:

| Data | Location in the container | Override | Persisted by |
| --- | --- | --- | --- |
| Pattern sets (candidates, approved, rejected) from `pattern_*` tools | `~/.blueprint-assist/knowledge/patterns/<set>/` | `BPA_PATTERNS_ROOT` | `bpa-data` volume |
| Analytics salt (keeps hashed user IDs stable) and unsent event buffer | `~/.blueprint-assist/analytics/` | `BPA_ANALYTICS_DATA_DIR` | `bpa-data` volume (only written when `BPA_ANALYTICS_ENABLED` isn't `false`) |
| Decision traces (`<name>.decision-trace.md`/`.json`) | Next to the blueprint file, at the path the tool was given | `BPA_TRACE_ALLOWED_ROOT` restricts where | Your workspace mount (see below) |
| Blueprints read by `blueprints_dir`/`blueprint_path` arguments | Wherever you mount them | - | Your workspace mount |

Held **in memory only** and lost on any restart, with no persistence option in this build: MCP sessions (clients re-initialize automatically), question sessions, `/api/v1/invoke` sessions and pending confirmations, and rate-limit counters. After a restart, clients just reconnect; your customer token is still valid until it expires.

**Workspace mount.** Tool path arguments are paths inside the container, not on your PC. To let the server read your blueprints and write traces next to them, uncomment `- ./workspace:/workspace` in `compose.yaml` (point it at your blueprint folder), pass paths like `/workspace/my-blueprint/blueprint.yaml`, and optionally set `BPA_TRACE_ALLOWED_ROOT=/workspace` in `.env`. The container runs as UID 1001, so the folder must be writable by that user. With Podman on Windows, bind mounts of `C:\...` folders are writable by default; on Linux, `chown 1001` the folder or add `:U` (Podman only).

Managing the volume:

```bash
podman volume ls                                   # agent-mcp-server-local_bpa-data
podman compose down -v                             # stop AND delete the volume (wipes patterns)
# Back up / restore
podman run --rm -v agent-mcp-server-local_bpa-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/bpa-data.tgz -C /data .
podman run --rm -v agent-mcp-server-local_bpa-data:/data -v "$PWD":/backup alpine \
  tar xzf /backup/bpa-data.tgz -C /data
```

The volume lives inside the Podman machine VM on Windows/macOS, so `podman machine rm` (or resetting Podman Desktop) deletes it too; back it up first. On Linux and WSL native, the volume is on the host filesystem.
