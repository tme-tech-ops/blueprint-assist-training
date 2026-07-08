# Tunnel Setup: Local Laptop → Windows Jump Host → Remote Network

## Overview

Create a SOCKS proxy tunnel from your local machine through a remote Windows jump host to browse any FQDN on the remote network and connect CLI tools like BPA.

---

## Prerequisites

### Local Machine

- SSH client (OpenSSH built into Windows 10/11, or PuTTY)
- Network connectivity to the jump host (VPN or direct network access)

### Jump Host (Windows Server)

- OpenSSH Server installed and running (see [Jump Host Setup](#jump-host-setup-one-time))
- Network connectivity to the target network (orchestrator, etc.)

---

## Quick Start

### Step 1: Create the tunnel

Open PowerShell and run:

```powershell
ssh -v -D 1080 -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3 <domain>\<username>@<jump-host-ip>
```

Enter your password when prompted. The terminal will show connection details then appear to "hang" - **this is normal**. Keep this window open.

### Step 2: Launch browser with proxy

Close **all** Chrome/Edge windows first, then open a new PowerShell window:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --proxy-server="socks5://localhost:1080"
```

### Step 3: Browse to your remote site

Navigate to any FQDN on the remote network:

```text
https://your-orchestrator.internal
```

Accept any certificate warnings for internal/lab servers.

---

## Command Reference

### SSH Parameters

| Parameter | Description |
| ----------- | ------------- |
| `-D 1080` | Create SOCKS proxy on local port 1080 |
| `-N` | No remote command (tunnel only) |
| `-v` | Verbose mode (shows connection status) |
| `-f` | Background mode (not recommended on Windows) |
| `-o ServerAliveInterval=60` | Send keepalive every 60 seconds |
| `-o ServerAliveCountMax=3` | Disconnect after 3 missed keepalives |

### Username Formats

If authentication fails, try different formats:

| Shell | Format |
| ------- | -------- |
| PowerShell | `domain\username@host` or `"domain\username@host"` |
| Bash/Git Bash | `'domain\username'@host` or `domain\\username@host` |
| Any | `username@host` (if domain is automatic) |

---

## Browser Configuration

### Chrome

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --proxy-server="socks5://localhost:1080"
```

### Microsoft Edge

```powershell
& "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --proxy-server="socks5://localhost:1080"
```

### Firefox (Built-in Settings)

1. Settings → Network Settings → Settings button
2. Select "Manual proxy configuration"
3. SOCKS Host: `localhost` | Port: `1080`
4. Select **SOCKS v5**
5. Check **"Proxy DNS when using SOCKS v5"** (important!)

> **Important:** Do NOT add `:1080` to your destination URLs. The proxy port is configured separately from the URL.

---

## Using with dap-bpa CLI

### Option 1: Environment Variables (Try First)

```powershell
$env:HTTP_PROXY = "socks5://127.0.0.1:1080"
$env:HTTPS_PROXY = "socks5://127.0.0.1:1080"

dap-bpa orchestrator login --url https://your-orchestrator.internal --tenant <tenant-id>
dap-bpa orchestrator status
```

To make permanent, add to your PowerShell profile:

```powershell
notepad $PROFILE
# Add the two $env lines above
```

### Option 2: Direct Port Forward (If SOCKS Doesn't Work)

Create a direct tunnel to the orchestrator instead:

```powershell
ssh -L 8443:your-orchestrator.internal:443 -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3 <domain>\<username>@<jump-host-ip>
```

Then connect dap-bpa to localhost:

```powershell
dap-bpa orchestrator login --url https://localhost:8443 --tenant <tenant-id>
```

> **Note:** You may need `--insecure` or `--skip-tls-verify` for certificate issues.

---

## Verification

### Check if tunnel is listening

```powershell
netstat -an | Select-String "1080"
```

You should see:

```text
TCP    127.0.0.1:1080    0.0.0.0:0    LISTENING
```

### Test with curl

```powershell
curl.exe -k --socks5-hostname 127.0.0.1:1080 https://your-orchestrator.internal
```

> **curl tips:**
>
> - Use `--socks5-hostname` (not `--socks5`) to resolve DNS through the proxy
> - Use `127.0.0.1` instead of `localhost` (Windows curl quirk)
> - Use `-k` to skip certificate verification for self-signed certs

### Detect a dead tunnel

If `netstat` shows only `SYN_SENT` connections (no `LISTENING`), the tunnel died. Restart it.

---

## Alternative Methods

### SSH Config (Persistent Setup)

Add to `~/.ssh/config`:

```text
Host jump-host
    HostName <jump-host-ip>
    User <domain>\<username>
    DynamicForward 1080
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then connect with:

```powershell
ssh -N jump-host
```

### PuTTY GUI

1. Session → Host Name: `<jump-host-ip>`
2. Connection → SSH → Tunnels:
   - Source port: `1080`
   - Select **Dynamic**
   - Click "Add"
3. Session → Save as "JumpHostSOCKS" → Open

### PLink Command Line

```cmd
plink -D 1080 -N <domain>\<username>@<jump-host-ip>
```

---

## Troubleshooting

### Certificate Errors (HTTPS)

Internal servers often use self-signed certificates.

**Browser:** Click "Advanced" → "Proceed to site (unsafe)"

**curl:** Add `-k` flag to skip verification

### Empty Reply from Server

The tunnel is working, but wrong protocol. Try `https://` instead of `http://`.

### curl: (97) Could not resolve proxy: localhost

Use `127.0.0.1` instead of `localhost`:

```powershell
curl.exe --socks5-hostname 127.0.0.1:1080 https://your-server.internal
```

### Connection Refused

- Verify jump host has OpenSSH Server running (see [Jump Host Setup](#jump-host-setup-one-time))
- Check firewall allows port 22
- Verify network connectivity to jump host

### Tunnel Drops Frequently

Ensure you're using keepalive settings:

```powershell
ssh -D 1080 -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3 <domain>\<username>@<jump-host-ip>
```

### Port 1080 Already in Use

Use a different port:

```powershell
ssh -D 1081 -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3 <domain>\<username>@<jump-host-ip>
```

Update browser proxy to `socks5://localhost:1081`.

### Stop the Tunnel

```powershell
Get-Process ssh | Stop-Process
```

---

## Jump Host Setup (One-Time)

Run these commands **on the jump host** as Administrator:

```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start and enable SSH service
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Verify SSH is running
Get-Service sshd
```

### Firewall Configuration

```powershell
# Check if firewall rule exists
Get-NetFirewallRule -Name *ssh*

# If not, create it
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

---

## Security Notes

- Use SSH keys instead of passwords when possible
- SOCKS proxy bypasses local network security - use only for trusted networks
- Close tunnel when not needed
- All browser traffic goes through the tunnel when proxy is enabled
- Consider VPN as alternative for persistent access
