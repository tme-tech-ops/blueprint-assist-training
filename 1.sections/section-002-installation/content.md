# Section 002: Installation and Setup

> **Note**: The `installation-prerequisites.md` reference in this section covers environment setup (CA certificates, WSL, DNS) for those starting from scratch. This section focuses on the dap-bpa installation process, configuration, and IDE integration steps that apply once your environment is ready.

## Prerequisites and Requirements

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: 10GB free disk space
- **Network**: Internet connection for initial setup and skill queries

### Account Requirements

- Access to the Blueprint Assist distribution package (dap-bpa itself runs locally; no service account is required for authoring and validation)
- Appropriate permissions for target deployment platforms (on-premise data center, etc.)
- Access to internal blueprint repositories (if applicable)
- For the Monitor Diagnostician feature (`dap-bpa monitor` auto-repair, optional): one of four adapters configured via `dap-bpa setup` - **AWS Bedrock**, **OpenAI**, **Claude Code** (uses the `claude` CLI on your machine), or **Devin** (uses the `devin` CLI). Bedrock and OpenAI require provider credentials; the CLI adapters use the agent already installed on your workstation.

### Software Dependencies

- Git client for repository operations
- PowerShell (Windows) or Bash/Linux shell
- Python 3.8+ (for certain skill operations)
- Docker (optional, for container-based deployments)

### IDE and Agent Support

dap-bpa is **agent-agnostic**: it ships the skills and the `bpa` command, and you bring whatever IDE/agent your team prefers. As of build v0.29.3+20260814145252, `dap-bpa setup-ide` installs the dap-bpa skills and rules into any of these targets: **Windsurf**, **Claude Code**, **Cursor**, **JetBrains IDEs** (Claude Code extension), **VS Code** (Claude Code extension), **Antigravity**, and **Cline** (added v0.28.1). Two of these targets cover more than one agent:

- **`antigravity`** also covers **Codex CLI**, **Gemini CLI**, and **Goose** - they load from the same directory.
- **Devin CLI** reads the Windsurf skills directory, so Devin users run `dap-bpa setup-ide windsurf`.

See [IDE Integration (`dap-bpa setup-ide`)](#ide-integration-dap-bpa-setup-ide) below for the full support matrix, config paths, and flags.

Windsurf can be obtained from <https://windsurf.com/> or the company portal.
Devin can be obtained from <https://cli.devin.ai/docs>

**General steps:**

- When installing either Windsurf or Devin, it will prompt for an SSO key on first launch
- Install Windsurf before Devin
- SSO key: `dell`

> **Note:** For a detailed comparison between Devin and Windsurf Cascade, see [Section 17: Model and Architecture Decisions](../section-017-model-architecture-decisions/content.md).

### Installing Devin

#### Windows

#### Option 1: One-liner (quickest)

```powershell
irm https://static.devin.ai/cli/setup.ps1 | iex
```

#### Option 2: Two-step process

```powershell
# Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy unrestricted

# Download the setup file
irm https://static.devin.ai/cli/setup.ps1 -outfile setup.ps1

# Run the setup file
.\setup.ps1
```

**Post-installation steps (both options):**

```powershell
# Confirm devin is installed
C:\Users\<YourUsername>\AppData\Local\devin\

# Set the path
setx PATH "%PATH%;%LOCALAPPDATA%\devin\cli\bin"

# Open a new PowerShell session and start using Devin

# Drop the dap-bpa skills into
# Or follow Step 2 below
C:\Users\<YourUsername>\.windsurf\skills
```

#### macOS/Linux/WSL-linux

```bash
# Install Devin
curl -fsSL https://cli.devin.ai/install.sh | bash

# Steps
# 1. Choose: Log in with Windsurf for Enterprise
# 2. Choose: Paste a Windsurf token manually
# 3. Copy the entire URL that appears and paste it into your browser
# 4. Copy the token below to your clipboard and paste into the WSL Devin window prompt
# 5. Restart your shell or run: source /home/<your-username>/.bashrc. Then run devin to get started.

# Confirm devin is installed
~/.local/bin/devin --version
```

## Installation Process

### Step 1: Obtain Blueprint Assist

1. Obtain the Blueprint Assist installer from [Dell Automation Studio](https://automation.dell.com/catalog)
2. Verify the checksum for security
3. Extract the installation package to a local directory

### Step 2: Install Blueprint Assist

#### Windows (Install)

> For detailed Windows installation instructions including the NSIS installer (recommended), see [`windows-installer.md`](windows-installer.md).

#### Option 1: NSIS Installer (Recommended)

```powershell
# Download bpa-win-x64-*-setup.exe from GitHub releases
# Run the installer
.\bpa-win-x64-*-setup.exe
```

#### Option 2: PowerShell Script

```powershell
# Run the installer
$zip = Get-ChildItem bpa-win-x64-v0.*-*.zip | Select-Object -First 1
Expand-Archive $zip.Name -DestinationPath bpa
cd bpa; .\install.ps1
```

#### macOS/Linux

> For detailed Linux installation instructions, see [`linux-installer.md`](linux-installer.md). For detailed macOS installation instructions, see [`mac-installer.md`](mac-installer.md).

```bash
# Make installer executable
chmod +x install.sh

# Run installer
./install.sh
```

### Step 3: Verify Installation

```bash
# Check Blueprint Assist version
dap-bpa --version

# Verify installation
dap-bpa --help
```

## Configuration and Authentication

### Initial Configuration

1. Launch Blueprint Assist configuration wizard
2. Select your deployment environment (on-premises data center, hybrid)
3. Configure default storage locations for blueprints
4. Set up logging and telemetry preferences

### Configuration Directories

dap-bpa uses two separate configuration locations:

- **`~/.blueprint-assist/`** - BPA's own home: `config.json` (orchestrator profiles and credentials, written by `dap-bpa setup`) plus the staged knowledge base, skill sources, and script library laid down by the installer. See Section 3 for the config file format and profile examples.
- **Your agent's own directory** - whichever IDE or agent you use keeps its configuration, and the dap-bpa skills installed by `dap-bpa setup-ide`, in its own location: `~/.claude/` for Claude Code, `~/.codeium/windsurf/` for Windsurf, `~/.devin/` for Devin, `.agents/` for Cursor and Antigravity, and so on.

This split reflects a key design point: **dap-bpa is agent-agnostic**. It provides the skills and the `bpa` command; you bring whatever IDE/TUI and LLM your team prefers. Within Dell, training is typically delivered with Devin, but nothing mandates it - the same skills work in any supported agent.

```bash
# dap-bpa config (orchestrator profiles)
~/.blueprint-assist/config.json

# Agent config - examples, depending on your chosen agent
~/.claude/      # Claude Code
~/.devin/       # Devin
```

**Devin users migrating from versions before v0.22.0** (the Devin CLI renamed its config directory from `.cognition/` to `.devin/`):

```bash
mv ~/.cognition ~/.devin
mv .cognition .devin   # in project directories (if present)
```

### IDE Integration (`dap-bpa setup-ide`)

Install dap-bpa skills into a supported IDE so agents can call them natively:

```bash
# Install skills for Windsurf
dap-bpa setup-ide windsurf

# Install skills for Claude Code
dap-bpa setup-ide claude-code
```

**Supported targets (as of build v0.29.3+20260814145252):**

`setup-ide` writes the dap-bpa skills and rules into the directory each agent loads from - it does not modify the agent itself. The agent then discovers the skills automatically.

| `setup-ide <target>` | Agent(s) it serves | Skills path | Rules path | Notes |
| -------------------- | ------------------ | ----------- | ---------- | ----- |
| `windsurf` | Windsurf, Devin CLI | `~/.codeium/windsurf/skills/<name>/` | `~/.windsurf/rules/` | Devin CLI reads this same directory - run `setup-ide windsurf` for Devin |
| `claude-code` | Claude Code | `.claude/skills/` | `.claude/rules/` | Supports `--scope project\|personal\|both` |
| `cursor` | Cursor | `.agents/skills/` | `.agents/rules/` | Project scope |
| `jetbrains` | JetBrains IDEs | `.claude/skills/` | `.claude/rules/` | Via the Claude Code extension; project scope |
| `vscode` | VS Code | `.claude/skills/` | `.claude/rules/` | Via the Claude Code extension; project scope |
| `antigravity` | Antigravity, Codex CLI, Gemini CLI, Goose | `.agents/skills/` | `.agents/rules/` | One target, four agents; project scope |
| `cline` | Cline | `.cline/skills/` | `.cline/rules/` | Project scope; added v0.28.1 |

**Useful flags:**

- `--scope project|personal|both` - for `claude-code`, choose whether skills install into the project (`.claude/`), your personal home (`~/.claude/`), or both. Defaults to project.
- `--dry-run` - preview exactly what `setup-ide` would write, without changing anything.

> **Keep skills current:** skills are bundled with the dap-bpa binary and update when it does. After a `dap-bpa upgrade`, re-run `dap-bpa setup-ide <target>` to push the refreshed skills into your agent (see [Section 4: Skills Overview](../section-004-skills-overview/content.md)).

For the authoritative, per-release target list and every `setup-ide` flag, see [Section 13: dap-bpa CLI Command Reference](../section-013-bpa-cli-commands/content.md).

### LLM Setup (Optional, for Monitor Diagnostician)

The `dap-bpa monitor` command can auto-repair failing blueprints using an LLM. Configure the adapter once:

```bash
# Interactive wizard - choose Bedrock (AWS), OpenAI, Claude Code, or Devin
dap-bpa setup
```

The adapter choice (and any provider credentials) is stored in the `diagnostician` block of `~/.blueprint-assist/config.json`, where the monitor daemon reads it during monitor runs. The Claude Code and Devin adapters need no credentials of their own - they drive the respective CLI already installed on your machine.

#### Recommended Models

dap-bpa interacts with AI models in two distinct ways. Choose the right model for each context:

**1. Monitor Diagnostician** - configured via `dap-bpa setup`, used only for `dap-bpa monitor` auto-repair. The tables below apply to the **Bedrock** and **OpenAI** adapters; the **Claude Code** and **Devin** adapters use whatever model the respective CLI is configured with:

> **Note**: Model availability evolves with each dap-bpa release and with your LLM provider. The `dap-bpa setup` wizard shows the options supported by your installed version.

| Provider | Model ID | Notes |
| -------- | -------- | ----- |
| **AWS Bedrock** | `anthropic.claude-3-7-sonnet-20250219-v1:0` | Highest quality blueprint repair |
| **AWS Bedrock** | `anthropic.claude-3-5-sonnet-20240620-v1:0` | **Recommended default** - best balance of speed and quality |
| **AWS Bedrock** | `anthropic.claude-3-opus-20240229-v1:0` | Strong alternative; slower and higher cost |
| **AWS Bedrock** | `anthropic.claude-3-haiku-20240307-v1:0` | Fast and low-cost; best for simple repairs |
| **OpenAI** | `gpt-4o` | Best OpenAI option; comparable to Claude 3.5 Sonnet |
| **OpenAI** | `gpt-4-turbo` | Good for complex multi-step reasoning |
| **OpenAI** | `gpt-4` | Solid baseline; lower cost than turbo/4o |

**2. IDE AI Agent** - configured within your IDE, drives blueprint authoring, reasoning, and analysis:

| IDE | Model | Notes |
| --- | ----- | ----- |
| **Windsurf** | Cascade (SWE-1) | **Recommended** - native dap-bpa skill support; strong code reasoning |
| **Claude Code** | Claude 3.5 / 3.7 Sonnet | **Recommended** - native dap-bpa skill support; excellent YAML generation |
| **Devin** | swe-1 (Cognition) | Advanced autonomous SWE agent; requires manual skill setup |

### Authentication Setup

**Orchestrator Authentication:**

```bash
# Configure the on-premises DAP / Dell Distributed Private Cloud orchestrator connection
# (interactive wizard: orchestrator URL, tenant, credentials)
dap-bpa setup

# Verify the connection
dap-bpa status
```

See Section 3: Orchestration Service Authentication for configuration-file details, multiple orchestrator profiles, and CI/CD options.

### Repository Access Configuration

- Configure Git credentials for blueprint repositories
- Set up SSH keys or personal access tokens
- Add repository URLs to Blueprint Assist configuration

## Verification Steps

### Test Basic Functionality

```bash
# Check Blueprint Assist version
dap-bpa --version

# Review the help options
dap-bpa --help

# Query the local knowledge base (works offline, no orchestrator needed)
dap-bpa knowledge blueprints find vm

# List supported secret types from the knowledge base
dap-bpa knowledge secret-type list
```

### Validate Environment

```bash
# Check setup status and orchestrator connectivity (if configured)
dap-bpa status
```

### Sample Blueprint Test

Lint a blueprint to verify the validation toolchain end to end. Download any blueprint from [automation.dell.com/catalog](https://automation.dell.com/catalog), then run:

```bash
dap-bpa blueprint lint --file path/to/your/blueprint.yaml
```

A structured JSON diagnostics report confirms the binary, knowledge base, and lint rules are all installed and working. The report may include findings against the blueprint; reading them is a useful first look at what the linter checks.

## Troubleshooting Common Issues

### Installation Failures

- **Issue**: Permission denied during installation
  - **Solution**: Run installer with elevated/admin privileges
- **Issue**: Dependency conflicts
  - **Solution**: Check system requirements and update conflicting packages

### Authentication Issues

- **Issue**: Invalid orchestrator credentials
  - **Solution**: Re-run `dap-bpa setup` to update credentials, then verify with `dap-bpa status`
- **Issue**: Token expiration
  - **Solution**: Re-run `dap-bpa setup`; tokens are refreshed when credentials are reconfigured

### Network Issues

- **Issue**: Cannot reach DAP orchestrator
  - **Solution**: Verify orchestrator URL and credentials via `dap-bpa setup`, then confirm connectivity with `dap-bpa status`. Note: dap-bpa skills run locally - no remote dap-bpa service connection is required for authoring and validation
- **Issue**: Repository access denied
  - **Solution**: Verify repository permissions and authentication tokens

## Reference

- Training repo prerequisite guide: `installation-prerequisites.md` (in this section)
- Windows installer guide: `windows-installer.md` (in this section)
- Linux installer guide: `linux-installer.md` (in this section)
- macOS installer guide: `mac-installer.md` (in this section)
- SSH passthrough setup: `ssh-passthrough-setup.md` (in this section)

## Next Steps

With dap-bpa installed and configured, proceed to the following sections to get productive:

1. **Section 3: Orchestration Service Authentication** - configure DAP/Dell Distributed Private Cloud profiles for your environments
2. **Section 4: Skills Overview** - understand the skills-based architecture
3. **Section 7: Building Blueprints** - start creating blueprints with AI assistance
4. **Section 13: dap-bpa CLI Command Reference** - bookmark for day-to-day command usage
