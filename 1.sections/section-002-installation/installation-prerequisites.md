# Blueprint Assist Installation Prerequisites

## Mission Statement

Blueprint Assist allows you to create custom blueprints with AI, using models and skills that will understand and be compliant with the capabilities of Dell Automation Platform.

## Reference Links

- **Blueprint Assist Installer**: Available via [Dell Automation Studio](https://automation.dell.com/catalog) (Dell Automation Studio subscription required)

### Internal References

Internal Dell/EMC-specific resources (Confluence wikis, internal repositories, and engineering quick start guides) are available on request from the training team.

## Prerequisites

### 1. CA Certificates Setup

Before installing Blueprint Assist, ensure CA certificates are properly configured:

```bash
sudo su
cd /usr/local/share/ca-certificates

# Download and install CA certificates using your organization's standard
# CA certificate installation process (internal Dell sources are available

# from the training team on request)

update-ca-certificates

# Verify certificate installation against an internal HTTPS endpoint, e.g.:
# curl -sI <> | head -1

```

### 2. Windows Native Install

#### Installation Method

dap-bpa is installed as a standalone binary in your local bin directory. On Windows, this involves:

1. **Download**: The dap-bpa executable binary for Windows
2. **Placement**: Copy to a directory in your PATH (e.g. `C:\Users\<username>\bin\`, where the NSIS installer also places it)
3. **Staging**: The installer stages the knowledge base, skill sources, and script library under `~\.blueprint-assist\`; running `dap-bpa setup` afterwards adds your orchestrator configuration

#### Setup Requirements

To complete the setup for full functionality:

```powershell
dap-bpa setup
```

This interactive wizard will configure:

- DAP orchestrator credentials
- Diagnostician adapter
- IDE skill integration (optional)

#### Windows-Specific Notes

- dap-bpa runs as a native Windows executable
- Uses Windows-style paths (backslashes)
- Integrates with Windows desktop notifications for monitor sessions
- Configuration files use JSON format
- No special Windows dependencies beyond the binary itself

### 3. Windows Subsystem for Linux (WSL) Setup

If you're on Windows, install WSL for Linux as an option:

#### Install WSL

```powershell

# Make sure WSL is installed

wsl --install

# Set WSL2 as default (uses real Linux kernel, better performance)

wsl --set-default-version 2
```

**Ubuntu 24.04 (Noble) Installation Options:**

#### Option 1: Microsoft Store (Recommended)

```powershell

# Search for "Ubuntu 24.04 LTS" in the Microsoft Store
# Or run:

wsl --install Ubuntu-24.04
```

#### Option 2

Download Ubuntu 24.04 (Noble) WSL images:

- **AMD64**: <>
- **AMD64 (LTS version)**: <>
- **ARM64**: <>

Import the downloaded image:

```powershell

# Download the appropriate image for your architecture

Invoke-WebRequest -Uri "https://cloud-images.ubuntu.com/wsl/releases/24.04/current/ubuntu-noble-wsl-amd64-wsl.rootfs.tar.gz" -OutFile "ubuntu-noble-wsl-amd64-wsl.rootfs.tar.gz"

# Import into WSL

wsl --import Ubuntu-24.04 C:\Path\To\InstallLocation ubuntu-noble-wsl-amd64-wsl.rootfs.tar.gz
```

**Post-Installation Steps:**

```powershell

# Update WSL to latest stable version

wsl --update
wsl --version

# Launch Ubuntu 24.04

wsl -d Ubuntu-24.04
```

#### Configure WSL Networking
Note: These steps, for networking and DNS configuration, are optional and may not be necessary for all users.

```bash

# Mount Windows files from Linux

cd /mnt/c

# Install helpful networking utilities

sudo apt install bind9-dnsutils

# Configure DNS tunneling (not NAT)

sudo vi /etc/wsl.conf

# Add this:

[network]
generateResolvConf = true
dnsTunneling = true
```

#### DNS Configuration Fix

```bash

# Create WSL DNS sync script

sudo vi /usr/local/bin/wsl-sync-dns.sh

# Add DNS synchronization logic

sudo chmod +x /usr/local/bin/wsl-sync-dns.sh
sudo /usr/local/bin/wsl-sync-dns.sh

# Tell WSL to stop overwriting resolv.conf

sudo tee /etc/wsl.conf >/dev/null <EOF
[network]
generateResolvConf = false
EOF

# Manually create /etc/resolv.conf with your working DNS

sudo tee /etc/resolv.conf >/dev/null <EOF
nameserver <Your-DNS-Server-IP>
EOF

# Set permissions

sudo chmod 644 /etc/resolv.conf

# Restart WSL and confirm

cat /etc/resolv.conf
```

### 4. Linux Blueprint Assist Installation

#### Fresh Install

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

#### Configuration

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

### 5. Mac Blueprint Assist Installation

#### Mac Installation Method

dap-bpa is installed as a standalone binary in your local bin directory. On macOS, this involves:

1. **Download**: The dap-bpa executable binary for macOS (Intel or Apple Silicon)
2. **Placement**: Copy to a directory in your PATH (e.g. `~/.local/bin/` or `/usr/local/bin/`)
3. **Staging**: The installer stages the knowledge base, skill sources, and script library under `~/.blueprint-assist/`; running `dap-bpa setup` afterwards adds your orchestrator configuration

#### Mac Fresh Install

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

echo 'export PATH="$HOME/bin:$PATH"' > ~/.zshrc
```

#### Verify Installation

```bash

# Verify the binary is in your PATH

which bpa

# Check the version

dap-bpa --version
```

#### Mac Setup Requirements

To complete the setup for full functionality:

```bash
dap-bpa setup
```

This interactive wizard will configure:

- DAP orchestrator credentials
- Diagnostician adapter
- IDE skill integration (optional)

#### macOS-Specific Notes

- dap-bpa runs as a native macOS executable (Intel or Apple Silicon)
- Uses Unix-style paths (forward slashes)
- Configuration files are stored in `~/.blueprint-assist/`
- If you get a security warning about the binary not being signed, you can allow it:

  ```bash
  # Option 1: Allow via System Preferences
  # Go to System Preferences > Security & Privacy > General
  # Click "Allow Anyway" next to the dap-bpa binary
  
  # Option 2: Remove quarantine attribute (if needed)
  xattr -d com.apple.quarantine ~/.local/bin/bpa
  ```

- Uses macOS-style notifications for monitor sessions
- Configuration files use JSON format
- No special macOS dependencies beyond the binary itself

#### Mac Configuration

```bash

# Grant permission and view JSON config

cat ~/.blueprint-assist/config.json

# Test connection to orchestrator and get blueprints list

# (--trust-all, available from v0.26.0, accepts self-signed certificates
# in development environments; on older versions use

# NODE_TLS_REJECT_UNAUTHORIZED=0 instead)

dap-bpa orchestrator blueprints list --trust-all
```

#### Mac IDE Integration (Optional)

To integrate dap-bpa with your IDE (Windsurf, Claude Code, VS Code, etc.):

```bash

# Install skills into your IDE's agent directory

dap-bpa setup-ide windsurf

# or

dap-bpa setup-ide claude

# or

dap-bpa setup-ide vscode
```

This installs the dap-bpa skills and rules into the appropriate agent configuration directory:

- **Windsurf**: `~/.codeium/windsurf/`
- **Claude Code**: `~/.claude/`
- **Devin**: `~/.devin/`
- **VS Code**: `~/.vscode/`

### 6. dap-bpa Profiles Configuration

For multiple environments (Dev/Test/Stage/Prod), configure orchestrator profiles:

```bash

# Edit config

vi ~/.blueprint-assist/config.json
```

The top-level fields written by `dap-bpa setup` are your default orchestrator. Add named profiles for additional environments under an `orchestrators` map:

```json
{
  "portalDomain": "...",
  "orchestratorDomain": "...",
  "orgId": "...",
  "clientId": "...",
  "clientSecret": "...",
  "orchestrators": {
    "dev": {
      "portalDomain": "...",
      "orchestratorDomain": "...",
      "orgId": "...",
      "clientId": "...",
      "clientSecret": "..."
    }
  }
}
```

List blueprints from a specific orchestrator profile:

```bash
dap-bpa orchestrator blueprints list --orchestrator dev
```

### 7. Connect your IDE to WSL (Windsurf/Cascade example)

Connect Windsurf to WSL: Ubuntu. At the bottom left of the IDE, locate `<` and select the Ubuntu distribution (or just WSL).

To mount a repository cloned on the Windows side, give a mount point path like (example) `/mnt/c/Users/<your-windows-username>/Documents/Github/tme-tech-ops`

Storing the project on the Linux side of the mount point is recommended for better performance and compatibility. Note that dap-bpa operations are executed from the Linux side of the mount point.

### 8. Sample Chat Prompts for Getting Started

Once connected, start a new chat and ask warmup questions to confirm connectivity and familiarize yourself with the tooling.

#### Blueprint Assist Warmup Questions

- `@dap-bpa what skills do you have`
- `@dap-bpa build me a blueprint framework for nginx`
- `@dap-bpa Without building the blueprint, walk me through an example of how to build a Windows server VM running on an esxi host`
- `@dap-bpa Provide network-layer readiness checklist before blueprinting Windows Server VM on ESXi`
- `@dap-bpa Tell me about the switch port connectivity between these two storage environments PowerStore1 and PowerStore2`

#### Devin Workflow

```bash

# From a Devin terminal session, invoke dap-bpa skills
@bpa

# Create a plan file for instructions/repeatable plans

vi rob-sampleplan1.md

# Sample plan content:
# "Use blueprint assist to build a plan to modify the existing blueprint located in

# ~/github/CloudPlatformsTME/DAPPO/Blueprints/custom/OpenShift-KubeVirt-VM_SSHservice-access/OpenShift-KubeVirt-VM_SSH-service-access
# Tell me what this blueprint will do.
# Additionally, put a plan together to make a similar blueprint to deploy a windows VM on OpenShift"

# Optional: enter plan mode
/mode plan

# Open another devin terminal to read the plan

# "Please read rob-sampleplan1.md and respond"
# (you may need to allow access - this is fine)

# Recall a previous devin session

devin -r 45d38c37F

# Shift + Tab to change modes

```

### 9. Verification

Verify installation from IDE connected to WSL bash session:

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

Next steps:

1. Run `./install.sh` to install dap-bpa to your PATH
2. Run: `dap-bpa setup`
3. Run: `dap-bpa setup-ide windsurf` (or cursor / claude-code / copilot)

Confirm CLI installation:

```bash
whereis bpa
```

## Standard Configuration

The recommended configuration has been standardized for optimal performance. The main script containing all setup utilities is available in the installation package.

## Additional Resources

- [Installing Windsurf on Ubuntu](https://windsurf.com/)
- [Devin CLI](https://cli.devin.ai/docs)
