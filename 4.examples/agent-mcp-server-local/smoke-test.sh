#!/usr/bin/env bash
# Smoke test for a locally running Agent MCP Server.
# Usage: ./smoke-test.sh [base-url]
# Set DAP_CUSTOMER_TOKEN, DAP_ORG_ID, DAP_ORCHESTRATOR_DOMAIN to also test an authenticated MCP initialize.
set -u
BASE="${1:-http://localhost:3000}"

echo "== GET /health"
curl -s "$BASE/health"; echo

echo "== GET /docs"
curl -s "$BASE/docs" | head -c 600; echo

echo "== POST /mcp initialize (no credentials - expect 401 with hint/docs)"
curl -s -X POST "$BASE/mcp" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0"}}}'
echo

if [ -n "${DAP_CUSTOMER_TOKEN:-}" ]; then
  echo "== POST /mcp initialize (with credentials)"
  curl -s -D - -X POST "$BASE/mcp" \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' \
    -H "x-dap-customer-token: $DAP_CUSTOMER_TOKEN" \
    -H "x-dap-org-id: ${DAP_ORG_ID:?set DAP_ORG_ID}" \
    -H "x-dap-orchestrator-domain: ${DAP_ORCHESTRATOR_DOMAIN:?set DAP_ORCHESTRATOR_DOMAIN}" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0"}}}'
  echo
fi
