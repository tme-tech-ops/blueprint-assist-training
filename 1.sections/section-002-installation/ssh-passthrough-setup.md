# SSH Passthrough Setup

## 1. Purpose and Scope

This page documents how to enable secure, passwordless SSH access into Windows Subsystem for Linux (WSL) from a Windows host using SSH keys and the Windows SSH agent.

This setup is required for:

- Remote development tools (e.g., Windsurf, VS Code)
- Git and automation workflows
- Scripted or repeatable access into WSL

The scope of this document is limited to:

- Local Windows host → local WSL instance
- Key‑based authentication only (no passwords)
- Single‑user developer setup

This document does not cover:

- Jump hosts or ProxyJump scenarios
- External network access into WSL
- AI or application runtimes

---

## 2. Architecture Overview

The SSH authentication flow uses the following components:

### Windows 11 host

- OpenSSH client
- Windows ssh-agent service
- SSH private keys stored under `%USERPROFILE%\.ssh`

### WSL (Ubuntu)

- OpenSSH server (sshd)
- `authorized_keys` under the Linux user home directory

All SSH connections are made via localhost. The WSL private IP address (172.x.x.x) is intentionally not used.

---

## 3. Preconditions

Before starting, ensure:

- WSL is installed and Ubuntu is running
- OpenSSH server is installed inside WSL
- You can log into WSL interactively
- You have an SSH key on the Windows host (Ed25519 recommended)

---

## 4. Verify Existing SSH Keys on Windows

From Windows PowerShell:

```powershell
ls $env:USERPROFILE\.ssh
```

Expected files include:

- `id_ed25519`
- `id_ed25519.pub`

Display the public key (safe operation):

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

---

## 5. Enable and Load Windows SSH Agent

Check if the SSH agent is running:

```powershell
ssh-add -l
```

If the agent is not running, start it (Administrator PowerShell):

```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
```

Load the existing key:

```powershell
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

Verify:

```powershell
ssh-add -l
```

The key should now be listed.

---

## 6. Prepare WSL for Key‑Based Authentication

Inside WSL, inspect the SSH directory:

```bash
ls ~/.ssh
```

If `authorized_keys` does not exist, create it safely by appending the Windows public key:

```bash
cat /mnt/c/Users/<windows-username>/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

Set required permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

These steps are additive and do not modify existing keys or host records.

---

## 7. First SSH Connection and Host Key Acceptance

From Windows PowerShell:

```powershell
ssh developer@localhost
```

On first connection, SSH will prompt:

```text
The authenticity of host 'localhost (::1)' can't be established.
Are you sure you want to continue connecting?
```

Type `yes` and press Enter. This step writes the host fingerprint to `known_hosts` and must be done exactly once.

---

## 8. Verifying Successful Key Authentication

A successful connection will:

- Not prompt for a password
- Immediately log into the WSL shell
- Show Linux kernel and Ubuntu version banners

Example indicators:

- `microsoft-standard-WSL2` kernel
- `172.x.x.x` address on eth0

---

## 9. Common Pitfalls and Clarifications

- `ssh-copy-id` is not available on Windows PowerShell (Linux-only tool)
- `authorized_keys` presence alone is not sufficient until host key is accepted
- Repeated host authenticity prompts indicate the host key was not accepted
- Windows may not run its own sshd service; this is expected and valid

---

## 10. Optional Hardening (Recommended)

After confirming key-based access works, password authentication can be disabled.

Inside WSL:

```bash
sudo nano /etc/ssh/sshd_config
```

Ensure the following lines exist:

```text
PubkeyAuthentication yes
PasswordAuthentication no
ChallengeResponseAuthentication no
```

Restart SSH:

```bash
sudo service ssh restart
```

---

## 11. SSH Config Convenience (Windows Host)

To simplify access, add a host alias to `%USERPROFILE%\.ssh\config`:

```text
Host wsl
    HostName localhost
    User developer
    IdentityFile C:\Users\<windows-username>\.ssh\id_ed25519
    IdentitiesOnly yes
```

Usage:

```powershell
ssh wsl
```

This alias is recommended for development tools and automation.

---

## 12. Final Validation Checklist

- [ ] Windows ssh-agent running
- [ ] Ed25519 key loaded into agent
- [ ] `authorized_keys` populated in WSL
- [ ] Host key accepted for localhost
- [ ] `ssh developer@localhost` works without password
- [ ] Optional: password authentication disabled

Completion of this checklist confirms secure, passwordless SSH passthrough into WSL.
