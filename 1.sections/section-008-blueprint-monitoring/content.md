# Section 008: Blueprint Monitoring

## Overview

Blueprint Monitoring covers the automated lifecycle testing capabilities of BPA. Unlike blueprint reasoning (Section 9), monitoring **requires an active DAP orchestrator connection** — it uploads, deploys, and executes your blueprint against real infrastructure.

> **Prerequisites**: Ensure `dap-bpa status` passes and your orchestrator profile is configured before running `dap-bpa monitor`. See Section 3: Orchestration Service Authentication.

## Automated Lifecycle Testing with `dap-bpa monitor`

The `dap-bpa monitor` command automates the full blueprint lifecycle for testing and validation:

1. Upload blueprint to DAP (idempotent)
2. Create deployment from provided inputs
3. Run `install` workflow and poll to completion
4. Execute any additional workflows
5. Validate assertions against outputs
6. Run `uninstall` workflow (unless `--keep` is set)
7. Clean up deployment and blueprint

### Example

```bash
dap-bpa monitor --file my-blueprint/blueprint.yaml \
  --inputs '{"vm_name": "test-vm", "network": "default"}' \
  --workflow install \
  --assert 'vm_ip=192.168.*' \
  --keep
```

### Output

- **Structured JSON** — the `RunReport`, retrievable with `dap-bpa monitor --status` and persisted to `~/.blueprint-assist/last-result.json`
- **Real-time progress** — live terminal updates during execution in attached mode
- **Desktop notification** — fires when the session finishes

## Blueprint Diagnostician

When a blueprint fails, the built-in diagnostician can automatically repair it. This runs automatically when an LLM adapter is configured — there is no flag to enable it and no retry count to set; the monitor retries up to a built-in ceiling of 3 attempts:

1. **Analyzes** execution events to identify the root cause
2. **Classifies** the failure into one of four categories (see the table below)
3. **Generates** a fix via the configured LLM adapter (Bedrock, OpenAI, Claude Code, or Devin)
4. **Applies** the fix and retries execution, up to 3 attempts
5. **Reports** repair attempts and outcomes in the `RunReport`

> **Human-in-the-loop patch approval (v0.28.0+):** AI-generated fixes are no longer applied to disk or the orchestrator without your approval. Each proposed patch enters a `pendingFix` state and must be explicitly confirmed (via the daemon's `POST /sessions/:id/confirm-fix` endpoint, surfaced by your IDE agent as a confirmation prompt) before it is applied; unconfirmed patches are discarded after 5 minutes. Patch validation also flags remote-URL execution vectors (`implementation:` or `script_path:` pointing at `https://`). Do not attempt another automated fix without the user's explicit confirmation.

Only `blueprint_error` failures are auto-fixed. The other categories are escalated immediately without a repair attempt:

| Category | Meaning | Monitor action |
| ---------- | --------- | ---------------- |
| `blueprint_error` | Wrong node type, missing property, bad secret name, script error | LLM invoked, fix attempted (up to 3x) |
| `resource_unavailable` | Permission denied, quota exceeded, resource already exists | Escalated immediately, no auto-fix |
| `network_timeout` | Connection refused, SSH timeout, DNS failure | Escalated immediately, no auto-fix |
| `unknown` | Upload validation failure, uncategorised error | Escalated immediately, no auto-fix |

Configure an adapter once with the setup wizard, then run the monitor normally:

```bash
dap-bpa setup                                   # configure a diagnostician LLM adapter (Step 3b)
dap-bpa monitor --file my-blueprint/blueprint.yaml
```

## `dap-bpa monitor` Flag Reference

| Flag | Purpose |
| ------ | --------- |
| `--file <blueprint.yaml>` | Start a session from a blueprint file |
| `--deployment-id <id>` | Start the install workflow against an existing deployment and monitor it |
| `--execution-id <id>` | Monitor an already-running execution |
| `--inputs <json or file>` | Supply deployment inputs (JSON string or file path) |
| `--workflow <name>` | Specify which workflow to run (default: install) |
| `--assert '<expr>'` | Validate outputs against assertions on completion |
| `--keep` | Keep the deployment on failure (skip uninstall) for debugging |
| `--detach` | Return immediately (default: attached mode) |
| `--timeout <duration>` | Set timeout for the operation (e.g. 30m, 1h, 90s; default: 30m) |
| `--poll-interval <seconds>` | How often to poll status (default: 10s) |
| `--callback <url>` | POST the result to this URL when done (CI oriented) |
| `--status` | Show status of most recent session |
| `--status --session-id <id>` | Show status of a specific session by ID |
| `--daemon-status` | Show whether the background daemon is running |
| `--daemon-stop` | Stop the background daemon |

### Handy flags recap

- `--poll-interval <sec>` — how often to check (default 10s)
- `--timeout <dur>` — give up after e.g. 90s, 30m, 1h (default 30m)
- `--assert <expr>` — validate condition(s) on completion (good for CI gates)
- `--callback <url>` — POST result when done
- `--detach` — run in background instead of blocking
- `--keep` — don't auto-uninstall the deployment if it fails
- `--status` — check the result of the last run (handy after `--detach`)
- `--deployment-id <id>` / `--execution-id <id>` — attach to an existing deployment or running execution instead of starting fresh

## Monitor Session Lifecycle

```text
dap-bpa monitor --file <blueprint.yaml>
    │
    ├── 1. Upload blueprint (idempotent)
    ├── 2. Create deployment
    ├── 3. Execute install workflow ──► poll until complete
    ├── 4. Run additional workflows (if specified)
    ├── 5. Validate assertions
    ├── 6. Execute uninstall workflow (kept on failure if --keep)
    └── 7. Clean up deployment and blueprint
              │
              ▼  (on a blueprint_error failure, if an LLM adapter is configured)
         Diagnostician
              ├── Analyze events
              ├── Classify failure
              ├── Generate fix (LLM)
              └── Retry from step 1 (up to 3 attempts)
```

## Prerequisites for Using `dap-bpa monitor`

- DAP orchestrator configured and reachable — verify with `dap-bpa status`
- LLM adapter configured via `dap-bpa setup` (Step 3b) — optional; needed only for the auto-repair diagnostician, not for the monitor itself
- Blueprint linted and validated locally before running:

```bash
dap-bpa blueprint lint --file my-blueprint/blueprint.yaml --verify
dap-bpa blueprint validate-all --file my-blueprint/blueprint.yaml
```

## Next Steps

1. **Section 9: Blueprint Reasoning** — analyze and understand blueprints without a DAP connection
2. **Section 13: dap-bpa CLI Command Reference** — full `dap-bpa monitor` and orchestrator command reference
