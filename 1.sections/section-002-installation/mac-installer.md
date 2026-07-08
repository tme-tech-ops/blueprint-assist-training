# Mac Installer Guide

## Overview

Blueprint Assist is installed on macOS as a standalone binary in your local bin directory (Intel or Apple Silicon).

> **Note**: Obtain the `dap-bpa` macOS distribution package from [Dell Automation Studio](https://automation.dell.com/catalog). Choose the appropriate binary for your Mac architecture:
>
> - **Intel (x86_64)**: `bpa-macos-amd64`
> - **Apple Silicon (M1/M2/M3)**: `bpa-macos-arm64`

## Fresh Install

```bash
# 1. Download the package for your platform from the release
#    Choose the appropriate binary for your Mac architecture:
#    - Intel (x86_64): bpa-macos-amd64
#    - Apple Silicon (M1/M2/M3): bpa-macos-arm64

# 2. Extract the zip (use the actual package filename from the release)

unzip <bpa-macos-package>.zip
cd <bpa-macos-package>

# 3. Make the binary executable

chmod +x bpa

# 4. Install to a directory in your PATH

#    Option A: Install to /usr/local/bin (system-wide, may require sudo)

sudo mv dap-bpa /usr/local/bin/bpa

#    Option B: Install to ~/.local/bin (user-specific, no sudo needed)

mkdir -p ~/.local/bin
mv dap-bpa ~/.local/bin/bpa

#    Option C: Install to a custom location and add to PATH

mkdir -p ~/bin
mv dap-bpa ~/bin/bpa
export PATH="$HOME/bin:$PATH"
# Add to ~/.zshrc or ~/.bash_profile to make permanent:

echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
```

### What Gets Installed

- **Binary**: `/usr/local/bin/bpa`, `~/.local/bin/bpa`, or a custom location on your PATH, depending on the install option chosen above
- **Knowledge base, skill sources, and script library**: staged under `~/.blueprint-assist/` (`knowledge/`, `skills/`, `library/`)
- **Configuration**: `~/.blueprint-assist/config.json` (created when you run `dap-bpa setup`)
- **Skills**: `dap-bpa setup-ide <ide>` installs these into the directory your IDE's agent loads skills from (see Section 2 for the per-IDE locations)

## Verification

```bash
# Verify the binary is in your PATH
which bpa

# Check the version
dap-bpa --version
```

## Setup Requirements

To complete the setup for full functionality:

```bash
dap-bpa setup
```

This interactive wizard will configure:

- DAP orchestrator credentials
- Diagnostician adapter
- IDE skill integration (optional)

## Configuration

```bash
# View JSON config

cat ~/.blueprint-assist/config.json

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

## macOS-Specific Notes

- dap-bpa runs as a native macOS executable (Intel or Apple Silicon)
- Uses Unix-style paths (forward slashes)
- Configuration files are stored in `~/.blueprint-assist/` and use JSON format
- No special macOS dependencies beyond the binary itself
- Uses macOS-style notifications for monitor sessions

### Unsigned Binary Security Warning

If you get a security warning about the binary not being signed, allow it via one of these options:

```bash
# Option 1: Allow via System Preferences
# Go to System Preferences > Security & Privacy > General
# Click "Allow Anyway" next to the dap-bpa binary

# Option 2: Remove quarantine attribute (if needed)
xattr -d com.apple.quarantine ~/.local/bin/bpa
```

## Troubleshooting

### Permission Issues

If you encounter permission errors during installation:

- Use `sudo` for system-wide installs to `/usr/local/bin`
- Or install to a user directory such as `~/.local/bin` or `~/bin` (no sudo required)

### PATH Issues

If `bpa` is not recognized after installation:

```bash
# Confirm where the binary was installed
which bpa

# Add the appropriate directory to your PATH if needed
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Gatekeeper / Unsigned Binary Blocking

See [Unsigned Binary Security Warning](#unsigned-binary-security-warning) above.

### CA Certificate Issues

If dap-bpa cannot reach your orchestrator due to certificate errors, see the [CA Certificates Setup](installation-prerequisites.md#1-ca-certificates-setup) section of `installation-prerequisites.md`.

## Uninstallation

```bash
# Remove the binary (adjust path to match your install option)
sudo rm /usr/local/bin/bpa
# or
rm ~/.local/bin/bpa

# Optionally remove the configuration and staged knowledge base
rm -rf ~/.blueprint-assist
```

## Next Steps

After successful installation:

1. Run `dap-bpa setup` to configure orchestrator credentials
2. Run `dap-bpa setup-ide <ide>` to install IDE skills
3. Run `dap-bpa status` to verify connection
4. See [Section 3: Orchestration Service Authentication](../section-003-orchestration-service-auth/content.md) for authentication details
