# Windows Installer Guide

## Overview

Blueprint Assist provides two installation methods for Windows:

1. **NSIS Installer** (Recommended) - `bpa-win-x64-v0.*-*-setup.exe` - A packed executable installer
2. **PowerShell Script** - `install.ps1` - Manual installation from the zip archive

> **Note**: The NSIS installer is provided as a single packed executable file (`bpa-win-x64-v0.27.0-*-setup.exe`) that includes all necessary components (binary, knowledge base, skills, and rules) for a complete installation.

## NSIS Installer (Recommended)

The NSIS installer is available starting with dap-bpa v0.24.0 and provides the most reliable installation experience on Windows.

### Features

- **Standards-compliant PE** - Signable with `signtool.exe` and accepted by EDR/WDAC policies
- **Complete installation** - Installs binary, knowledge base, skills, and rules
- **Add/Remove Programs** - Registers in Windows Programs and Features
- **PATH management** - Updates user PATH without duplicates
- **Uninstaller** - Includes proper uninstallation via Add/Remove Programs

### Installation Steps

1. Obtain `bpa-win-x64-v0.*-*-setup.exe` from [Dell Automation Studio](https://automation.dell.com/catalog)
2. Right-click the installer and select "Run as administrator" (recommended)
3. Follow the installation wizard prompts
4. Complete the installation

As of v0.27.0, the NSIS installer places the binary at `%USERPROFILE%\bin\bpa.exe`, stages the knowledge base, skill sources, and script library under `%USERPROFILE%\.blueprint-assist\`, and adds the binary directory to your PATH (open a new terminal for the PATH change to take effect).

### Verification

```powershell
# Verify installation
dap-bpa --version

# Check PATH
whereis bpa
```

### Uninstallation

To uninstall BPA:

1. Open "Control Panel" → "Programs and Features"
2. Find "Blueprint Assist" in the list
3. Right-click and select "Uninstall"
4. Follow the uninstallation wizard

The uninstaller will:

- Remove the dap-bpa binary
- Clean up PATH entries
- Optionally remove `~/.blueprint-assist` configuration directory

## PowerShell Script Installation

If you prefer manual installation or need more control over the installation process, use the PowerShell script from the zip archive.

### Prerequisites

- Windows PowerShell 5.1 or later
- Administrator privileges (recommended for PATH modification)

### PowerShell Script Installation Steps

```powershell
# 1. Download the zip for your platform from GitHub releases
# Example: bpa-win-x64-v0.27.0-*.zip

# 2. Extract the zip
$zip = Get-ChildItem bpa-win-x64-v0.*-*.zip | Select-Object -First 1
Expand-Archive $zip.Name -DestinationPath bpa

# 3. Add to your path if needed - point at the directory containing bpa.exe
#    (the installer output in step 5 shows the exact install path,
#    e.g. C:\Users\<username>\bin\)
[System.Environment]::SetEnvironmentVariable(
    "Path",
    [System.Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Users\<username>\bin\",
    "User"
)

# 4. Navigate to the extracted directory
cd bpa

# 5. Run the installer
.\install.ps1
```

### What Gets Installed

The installer places files in the following locations:

- **Binary**: a user bin directory such as `C:\Users\<username>\bin\bpa.exe` - the installer output shows the exact path
- **Knowledge base, skill sources, and script library**: `C:\Users\<username>\.blueprint-assist\` (`knowledge\`, `skills\`, `library\`)
- **Configuration**: `C:\Users\<username>\.blueprint-assist\config.json` (created when you run `dap-bpa setup`)
- **Skills**: `dap-bpa setup-ide <ide>` installs these into the directory your IDE's agent loads skills from (see Section 2 for the per-IDE locations)

### Installation Verification

```powershell
# Check dap-bpa version
dap-bpa --version

# Verify installation
dap-bpa --help
```

## Manual Uninstallation (PowerShell Method)

If you installed using the PowerShell script, use the provided uninstaller:

```powershell
# From the dap-bpa installation directory
.\uninstall.ps1
```

The uninstall script will:

- Remove the dap-bpa binary
- Clean up PATH entries
- Prompt to optionally remove `~/.blueprint-assist` configuration directory

## Configuration

After installation, configure dap-bpa with your orchestrator credentials:

```powershell
# Interactive setup wizard
dap-bpa setup

# Install IDE skills (optional)
dap-bpa setup-ide windsurf
# or
dap-bpa setup-ide claude-code
```

## Troubleshooting

### PATH Issues

If `bpa` is not recognized after installation:

```powershell
# Add to your path if needed - point this at the directory containing
# bpa.exe (e.g. C:\Users\<username>\bin\)
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$newPath = $currentPath + ";C:\Users\<username>\bin\"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")

# Or restart your terminal/session
```

### Permission Issues

If you encounter permission errors during installation:

- Right-click PowerShell and select "Run as administrator"
- Or install to a user directory such as `C:\Users\<username>\bin\`

### Antivirus/EDR Blocking

The NSIS installer produces a standards-compliant PE that should be accepted by most EDR/WDAC policies. If blocked:

- Add the installer to your antivirus exclusions
- Use the PowerShell script method as an alternative
- Contact your security team to whitelist the dap-bpa binary

## Next Steps

After successful installation:

1. Run `dap-bpa setup` to configure orchestrator credentials (optional but recommended for integration with orchestration services)
2. Run `dap-bpa setup-ide <ide>` to install IDE skills
3. Run `dap-bpa status` to verify connection
4. See [Section 3: Orchestration Service Authentication](../section-003-orchestration-service-auth/content.md) for authentication details

## Extensibility Options

For enhanced agentic AI code assistance, you can integrate Devin with Windsurf.

### Devin with Windsurf Setup

Devin provides advanced AI-powered code assistance and can be configured to work with dap-bpa for automated error fixing and code generation.

1. Download Devin for Windows from [https://cli.devin.ai/docs#windows](https://cli.devin.ai/docs#windows)
2. Run the Devin installer you downloaded in step 1
3. Configure Devin to work with your IDE for error fixing assistance:

   ```powershell
   dap-bpa setup
   ```

   When prompted during the Diagnostician step, select Devin as your diagnostician option
   - Skip existing configuration updates unless needed
   - Follow the prompts to complete the setup
