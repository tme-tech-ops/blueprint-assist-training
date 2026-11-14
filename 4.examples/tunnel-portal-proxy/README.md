# Portal Proxy for dap-bpa Tunnels

A small local proxy that lets dap-bpa sign in to a DAP portal that is only
reachable through a jump host, without editing the hosts file. Use it with the
native dap-bpa tunnel described in
[Section 016 - Tunnel Connections](../../1.sections/section-016-tunnel-connections/content.md#reaching-the-portal-for-sign-in).

## Why It Is Needed

`dap-bpa orchestrator tunnel` forwards orchestrator traffic only. Sign-in calls
(token discovery and token requests) go straight to the profile's
`portalDomain`. If that name does not resolve from your machine, every command
fails with:

```text
Failed to discover token endpoint, using default: Unable to connect. Is the computer able to access the url?
Error: Failed to generate token: Failed to generate actor token. Please check your credentials.
```

Forwarding the portal port with `tunnel.extraTunnels` is not enough on its own:
the portal only answers when it is addressed by its real hostname (TLS SNI and
`Host` header), so `portalDomain` cannot simply point at `127.0.0.1`. With a
hosts-file entry you can map the name to `127.0.0.1`; this proxy does the same
job for users without admin rights.

## How It Works

With `HTTPS_PROXY` set, dap-bpa asks the proxy to `CONNECT <portal-host>:443`
instead of resolving the name itself. The proxy sends that connection to the
local port the tunnel forwards for the portal. TLS runs end to end with the
real hostname, so certificate names, SNI, and the `Host` header are all
correct.

- Listens on `127.0.0.1` only
- Accepts only the hostnames you pass with `--route`; anything else gets `403`
- Python 3.8 or later, no packages to install

## Usage

1. Forward the portal in the profile's tunnel block (see Section 016):

   ```json
   "tunnel": {
     "jumpHost": "jumphost",
     "targetHost": "orchestrator.lab.example.com",
     "targetPort": 443,
     "localPort": 18443,
     "extraTunnels": ["18445:portal.lab.example.com:443"]
   }
   ```

   Keep `portalDomain` as the plain hostname (`portal.lab.example.com`).

2. Start the proxy in its own window and leave it running:

   ```powershell
   python portal-proxy.py --route portal.lab.example.com=18445
   ```

3. In the window where you run dap-bpa, point `HTTPS_PROXY` at it. The setting
   lasts for that window only:

   ```powershell
   $env:HTTPS_PROXY = "http://127.0.0.1:18080"
   $env:NO_PROXY = "127.0.0.1,localhost"
   dap-bpa orchestrator tunnel start --profile lab
   dap-bpa orchestrator blueprints list --orchestrator lab
   ```

   bash or zsh:

   ```bash
   export HTTPS_PROXY=http://127.0.0.1:18080 NO_PROXY=127.0.0.1,localhost
   ```

The proxy window prints one `CONNECT portal.lab.example.com -> 127.0.0.1:18445`
line per sign-in connection.

For several labs, add one `--route` per portal, each with its own
`extraTunnels` port:

```powershell
python portal-proxy.py --route portal.lab1.example.com=18445 --route portal.lab2.example.com=18446
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `--route HOST=PORT` | (required, repeatable) | Accept `CONNECT` for `HOST` and send it to `127.0.0.1:PORT` |
| `--listen-port N` | `18080` | Local port the proxy listens on |

## Browser Access

The same proxy works for a browser that has its own proxy setting, for example
Firefox: Settings > Network Settings > Manual proxy configuration, HTTPS Proxy
`127.0.0.1`, port `18080`. Only the routed hostnames load, so use a separate
browser profile rather than changing the system-wide proxy.

## Notes

- dap-bpa's per-profile `proxy` block applies to orchestrator requests; sign-in
  requests follow the `HTTPS_PROXY` environment variable, so set that.
- Orchestrator requests go to the tunnel on `127.0.0.1` and always bypass the
  proxy, so you only need a `--route` for the portal.
