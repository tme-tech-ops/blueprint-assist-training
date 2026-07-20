# Linux Installer Guide

## Overview

Blueprint Assist is installed on Linux as a standalone binary via an install script from the distribution package. This applies equally to native Linux and to WSL (Windows Subsystem for Linux) — see [`installation-prerequisites.md`](installation-prerequisites.md) for WSL setup if you're running Linux under Windows.

> **Note**: Obtain the `dap-bpa` Linux distribution package from [Dell Automation Studio](https://automation.dell.com/catalog). The package is a zip archive named for the platform and version (e.g. `bpa-linux-x64-vX.X.X.zip`).

## Fresh Install

```bash
# 1. Download the package for your platform from the release
# 2. Extract the zip (use the actual package filename from the release)

unzip <bpa-linux-package>.zip
cd <bpa-linux-package>

# 3. Run the installer
./install.sh

# 4. Follow prompts - installer copies binary to:
#    - /usr/local/bin/dap-bpa (if sudo available)
#    - ~/.local/bin/dap-bpa (if sudo not available)

# 5. Run setup

dap-bpa setup
dap-bpa setup-ide windsurf
```

### What Gets Installed

- **Binary**: `/usr/local/bin/dap-bpa` (system-wide, if sudo available) or `~/.local/bin/dap-bpa` (user-specific, if not)
- **Knowledge base, skill sources, and script library**: staged under `~/.blueprint-assist/` (`knowledge/`, `skills/`, `library/`)
- **Configuration**: `~/.blueprint-assist/config.json` (created when you run `dap-bpa setup`)
- **Skills**: `dap-bpa setup-ide <ide>` installs these into the directory your IDE's agent loads skills from (see Section 2 for the per-IDE locations)

## Verification

```bash
cd /path/to/bpa-linux-x64-vX.X.X
./verify-install.sh
```

Expected output:

```text
Blueprint Assist — Package Verification
=======================================
Binary
------
PASS bin/dap-bpa exists
PASS bin/dap-bpa is executable
PASS Binary size OK (109513856 bytes)

Package structure
-----------------
PASS install.sh present
PASS VERSION.txt present (Version: v0.28.2-<build-timestamp>)
PASS knowledge/ directory present (17 plugin dirs)
PASS skills/ directory present (21 skill dirs)

Functional tests
----------------
PASS dap-bpa help works
PASS Helm plugin accessible (1 node types)
PASS AWS plugin accessible
PASS Kubernetes plugin accessible
PASS Node type detail lookup works (knowledge plugins get)

=======================================
Results: 12 passed, 0 failed, 0 warnings (12 checks)
All checks passed.
```

Confirm the binary is on your PATH:

```bash
whereis bpa
dap-bpa --version
```

## Configuration

```bash
# Grant permission and view JSON config

sudo chown $USER ~/.blueprint-assist/config.json
sudo cat ~/.blueprint-assist/config.json

# Test connection to orchestrator and get blueprints list

# (--trust-all, available from v0.26.0, accepts self-signed certificates
# in development environments; on older versions use
# NODE_TLS_REJECT_UNAUTHORIZED=0 instead)

dap-bpa orchestrator blueprints list --trust-all
```

## IDE Integration (Optional)

To integrate dap-bpa with your IDE (Windsurf, Claude Code, VS Code, etc.):

```bash
dap-bpa setup-ide windsurf
# or
dap-bpa setup-ide claude-code
# or
dap-bpa setup-ide vscode
```

This installs the dap-bpa skills and rules into the appropriate agent configuration directory:

- **Windsurf**: `~/.codeium/windsurf/`
- **Claude Code**: `~/.claude/`
- **Devin**: `~/.devin/`
- **VS Code**: `~/.vscode/`

## Linux-Specific Notes

- dap-bpa runs as a native Linux executable
- Uses Unix-style paths (forward slashes)
- Configuration files are stored in `~/.blueprint-assist/` and use JSON format
- No special Linux dependencies beyond the binary itself
- On WSL, dap-bpa operations should be run from the Linux side of the mount point for best performance and compatibility — see [`installation-prerequisites.md`](installation-prerequisites.md) for details on connecting your IDE to WSL

## Troubleshooting

### Permission Issues

If `./install.sh` fails with a permission error:

```bash
chmod +x install.sh
./install.sh
```

If sudo is unavailable, the installer falls back to `~/.local/bin/dap-bpa` — make sure `~/.local/bin` is on your PATH:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### PATH Issues

If `bpa` is not recognized after installation:

```bash
# Confirm where the binary was installed
whereis bpa

# Add the appropriate directory to your PATH if needed
echo 'export PATH="/usr/local/bin:$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Config File Permission Issues

If `dap-bpa setup` was run with sudo (or the config file is otherwise owned by root), reclaim ownership:

```bash
sudo chown $USER ~/.blueprint-assist/config.json
```

### CA Certificate Issues

If dap-bpa cannot reach your orchestrator due to certificate errors, ensure CA certificates are installed — see the [CA Certificates Setup](installation-prerequisites.md#1-ca-certificates-setup) section of `installation-prerequisites.md`.

## Uninstallation

```bash
# Remove the binary
sudo rm /usr/local/bin/dap-bpa
# or, if installed without sudo:
rm ~/.local/bin/dap-bpa

# Optionally remove the configuration and staged knowledge base
rm -rf ~/.blueprint-assist
```

## Next Steps

After successful installation:

1. Run `dap-bpa setup` to configure orchestrator credentials
2. Run `dap-bpa setup-ide <ide>` to install IDE skills
3. Run `dap-bpa status` to verify connection
4. See [Section 3: Orchestration Service Authentication](../section-003-orchestration-service-auth/content.md) for authentication details
