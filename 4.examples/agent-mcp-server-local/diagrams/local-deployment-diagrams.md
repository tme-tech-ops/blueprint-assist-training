# Local Agent MCP Server Diagrams

> ASCII diagrams for the local container kit. For the general MCP story
> (three-layer model, why MCP, lifecycle), see
> [`../../mcp-demo/diagrams/architecture-diagrams.md`](../../mcp-demo/diagrams/architecture-diagrams.md).

---

## Diagram 1: Local Topology

**Use in**: Explaining what runs where when Devin Desktop uses the local server

```text
┌──────────────────────────── YOUR MACHINE ────────────────────────────┐
│                                                                      │
│   ┌────────────────┐                                                 │
│   │ Devin Desktop  │                                                 │
│   │ (MCP client)   │                                                 │
│   └──┬──────────┬──┘                                                 │
│      │          │ http://localhost:3000/mcp                          │
│      │          ▼                                                    │
│      │   ┌───────────────────────────────┐                           │
│      │   │ Podman / Docker               │                           │
│      │   │  agent-mcp-server:0.32.0      │                           │
│      │   │  "bpa-agent-local"            │                           │
│      │   │  plan / edit / review /       │                           │
│      │   │  package / pattern_*          │                           │
│      │   └──┬────────────┬───────────┬───┘                           │
│      │      │            │           │                               │
└──────┼──────┼────────────┼───────────┼───────────────────────────────┘
       │      │            │           │
       │      │ token      │ DAP API   │ LLM calls
       │      │ exchange   │           │
       │      ▼            ▼           ▼
       │  ┌────────┐  ┌──────────────┐  ┌─────────────────────────┐
       │  │ DAP    │  │ DAP          │  │ AWS Bedrock             │
       │  │ Portal │  │ Orchestrator │  │ (or local LLM endpoint  │
       │  └────────┘  └──────────────┘  │  in air-gapped mode)    │
       │                    ▲           └─────────────────────────┘
       │ HTTPS              │
       ▼                    │
┌───────────────────────────┴───┐
│ Hosted gateway MCP server     │
│ "bpa-gateway"                 │
│ knowledge, lint_blueprint,    │
│ create_blueprint, deployments │
└───────────────────────────────┘
```

---

## Diagram 2: Which Server Does What

**Use in**: Explaining why Devin Desktop needs both entries

```text
                  DEVIN DESKTOP
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   bpa-agent-local               bpa-gateway
   (localhost:3000)              (hosted)
          │                           │
   AUTHOR / REASON               KNOW / VALIDATE / OPERATE
   plan_blueprint                list_node_types
   edit_blueprint                get_node_type_docs
   review_blueprint              find_blueprint_examples
   summarize_blueprint           lint_blueprint
   package_blueprint             create_blueprint
   complete_code                 deployments / executions
   pattern_*
   ask_bpa_agent
```

---

## Diagram 3: Authoring Loop Across Both Servers

**Use in**: Walking through a build in Devin Desktop

```text
   [agent]             [gateway]            [agent]
 plan_blueprint ──▶ list_node_types ──▶ edit_blueprint
                    find_..._examples          │
                                               ▼
                                         [gateway]
                                       lint_blueprint
                                         │       │
                               errors ◀──┘       └──▶ clean
                                 │                      │
                                 ▼                      ▼
                         [agent] edit_blueprint   [agent] review_blueprint
                                 │                      │
                                 └──▶ lint again        ▼
                                                  [agent] package_blueprint
                                                        │
                                                        ▼
                                                  [gateway] create_blueprint
```

---

## Diagram 4: Authentication and Session Flow

**Use in**: Debugging `401` / `400` / `AUTHENTICATION_FAILED`

```text
 Your client credentials              .env on the server
 (~/.blueprint-assist/config.json)    DAP_PREDEFINED_CLIENT_ID / SECRET
            │                         DAP_PORTAL_DOMAIN
            ▼                                   │
   dap-bpa mint-token                           │
   --audience <DAP_PREDEFINED_CLIENT_ID>        │
            │                                   │
            ▼                                   │
     customer token                             │
            │                                   │
            ▼                                   ▼
 ┌──────────────────────┐   ┌─────────────────────────────────────┐
 │ POST /mcp initialize │──▶│ agent-mcp-server                    │
 │ x-dap-customer-token │   │ 1. headers present?   no ─▶ 401     │
 │ x-dap-org-id         │   │    MISSING_CREDENTIALS              │
 │ x-dap-orchestrator-  │   │ 2. domain allowlisted? no ─▶        │
 │   domain             │   │    INVALID_DOMAIN                   │
 └──────────────────────┘   │ 3. exchange token at portal using   │
                            │    service account  fail ─▶         │
                            │    AUTHENTICATION_FAILED            │
                            │ 4. ok ─▶ 200 + Mcp-Session-Id       │
                            └──────────────────┬──────────────────┘
                                               │
                                               ▼
                            tools/list, tools/call ... with
                            Mcp-Session-Id (missing ─▶ 400
                            "No valid session ID provided")
```

---

## Diagram 5: Container Anatomy

**Use in**: Explaining `compose.yaml`

```text
┌───────────────────── agent-mcp-server container ─────────────────────┐
│  user: nodeapp (UID 1001)        listens on :3000                     │
│                                                                       │
│  env_file: .env ──────▶ credentials, portal, allowlist, LLM backend   │
│                                                                       │
│  /home/nodeapp ◀─────── bpa-data (named volume, persistent)           │
│     └─ .blueprint-assist/                                             │
│          ├─ knowledge/patterns/   pattern sets                        │
│          └─ analytics/            salt + event buffer                 │
│                                                                       │
│  /certs ◀────────────── ./certs (optional, read-only lab CA)          │
│  /workspace ◀────────── ./workspace (optional, blueprints + traces)   │
│                                                                       │
│  IN MEMORY ONLY (lost on restart):                                    │
│    MCP sessions, question sessions, invoke sessions,                  │
│    pending confirmations, rate-limit counters                         │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                     127.0.0.1:3000 on the host
                     (extra_hosts: optional hostname pins)
```

---

## Diagram 6: What Survives What

**Use in**: Explaining persistence

```text
                         container   bpa-data   in-memory
 Action                  filesystem  volume     state
 ──────────────────────  ──────────  ─────────  ─────────
 podman restart          kept        kept       lost
 compose up -d (no chg)  kept        kept       kept
 compose up -d (.env     lost        kept       lost
   or compose changed)
 compose down + up       lost        kept       lost
 new image version       lost        kept       lost
 compose down -v         lost        DELETED    lost
 podman machine rm       lost        DELETED    lost
```

---

## Diagram 7: Lab Setup Steps and Where They Fail

**Use in**: Following README Steps 1-8

```text
 Step 1  DNS / VPN reachable? ───────── no ─▶ connect VPN or hosts file
    │
 Step 2  .env: lab portal, service ──── wrong ─▶ AUTHENTICATION_FAILED /
    │    account, allowlist                      INVALID_DOMAIN
 Step 3  lab CA in ./certs ──────────── missing ─▶ TLS errors in logs
    │
 Step 4  extra_hosts (only if hosts file) ─ missing ─▶ "bad address"
    │
 Step 5  restart + wget from container ─ checks Steps 1-4
    │
 Step 6  mint token (audience = server) ─ wrong ─▶ AUTHENTICATION_FAILED
    │    verify with ./smoke-test.sh
 Step 7  add both servers to Devin ───── no tools ─▶ container down /
    │                                                token expired
 Step 8  re-mint when token expires
```

---

## Usage Notes

- Monospace font required (Consolas, Courier New, or similar).
- Diagrams 4 and 7 map directly to the README Troubleshooting table.
- Diagram 6 summarizes README → *Persistent storage*.
