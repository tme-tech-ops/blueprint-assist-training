"""Local HTTP CONNECT proxy that sends lab hostnames into dap-bpa tunnel ports.

Use this when the DAP portal (sign-in) is only reachable through a jump host
and you cannot add a hosts-file entry (no admin rights). See Section 016,
"Reaching the Portal for Sign-In".

How it works: with HTTPS_PROXY pointing at this proxy, dap-bpa asks the proxy
to "CONNECT <host>:443" instead of resolving the hostname itself. The proxy
maps each known hostname to a local port that the dap-bpa tunnel forwards
(tunnel.localPort or an extraTunnels entry). TLS still runs end to end with
the real hostname, so SNI and the Host header are correct.

Only the hostnames you pass with --route are accepted; any other CONNECT gets
403, so this is not an open proxy. It listens on 127.0.0.1 only.

Usage:
    python portal-proxy.py \
        --route portal.lab.example.com=18445 \
        --route orchestrator.lab.example.com=18443

Then, in the shell where you run dap-bpa:
    PowerShell:  $env:HTTPS_PROXY = "http://127.0.0.1:18080"; $env:NO_PROXY = "127.0.0.1,localhost"
    bash/zsh:    export HTTPS_PROXY=http://127.0.0.1:18080 NO_PROXY=127.0.0.1,localhost

Requires Python 3.8+ and nothing else.
"""
import argparse
import socket
import sys
import threading


def pipe(src, dst):
    try:
        while True:
            data = src.recv(65536)
            if not data:
                break
            dst.sendall(data)
    except OSError:
        pass
    finally:
        for s in (src, dst):
            try:
                s.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass


def handle(client, routes):
    try:
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = client.recv(4096)
            if not chunk:
                client.close()
                return
            buf += chunk
            if len(buf) > 16384:
                raise ValueError("request header too large")
        head, rest = buf.split(b"\r\n\r\n", 1)
        parts = head.split(b"\r\n", 1)[0].decode("latin-1").split()
        if len(parts) < 2 or parts[0].upper() != "CONNECT":
            client.sendall(b"HTTP/1.1 405 Method Not Allowed\r\nContent-Length: 0\r\n\r\n")
            client.close()
            return
        host = parts[1].rsplit(":", 1)[0].strip("[]").lower()
        port = routes.get(host)
        if port is None:
            print(f"refused CONNECT {parts[1]} (no --route for this host)", flush=True)
            client.sendall(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n")
            client.close()
            return
        try:
            upstream = socket.create_connection(("127.0.0.1", port), timeout=10)
            upstream.settimeout(None)
        except OSError as e:
            print(f"CONNECT {host} -> 127.0.0.1:{port} failed: {e} (is the tunnel running?)", flush=True)
            client.sendall(b"HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\n\r\n")
            client.close()
            return
        print(f"CONNECT {host} -> 127.0.0.1:{port}", flush=True)
        client.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")
        if rest:
            upstream.sendall(rest)
        threading.Thread(target=pipe, args=(client, upstream), daemon=True).start()
        pipe(upstream, client)
    except Exception as e:  # keep serving other connections
        print(f"error: {e}", flush=True)
        try:
            client.close()
        except OSError:
            pass


def parse_route(value):
    host, sep, port = value.partition("=")
    if not sep or not host or not port.isdigit() or not 0 < int(port) < 65536:
        raise argparse.ArgumentTypeError(f"expected <hostname>=<local-port>, got {value!r}")
    return host.strip().lower(), int(port)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--route", action="append", type=parse_route, required=True,
                    metavar="HOST=PORT", help="hostname to accept and the local tunnel port to send it to (repeatable)")
    ap.add_argument("--listen-port", type=int, default=18080, help="local proxy port (default 18080)")
    args = ap.parse_args()
    routes = dict(args.route)

    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", args.listen_port))
    srv.listen(64)
    print(f"portal-proxy listening on http://127.0.0.1:{args.listen_port} (Ctrl+C to stop)", flush=True)
    for host, port in routes.items():
        print(f"  {host} -> 127.0.0.1:{port}", flush=True)
    try:
        while True:
            conn, _ = srv.accept()
            threading.Thread(target=handle, args=(conn, routes), daemon=True).start()
    except KeyboardInterrupt:
        print("stopped", flush=True)
        sys.exit(0)


if __name__ == "__main__":
    main()
