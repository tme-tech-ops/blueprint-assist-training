# Smoke test for a locally running Agent MCP Server (Windows PowerShell 5.1+ / PowerShell 7).
# Usage: .\smoke-test.ps1 [-Base http://localhost:3000]
# Set $env:DAP_CUSTOMER_TOKEN, $env:DAP_ORG_ID, $env:DAP_ORCHESTRATOR_DOMAIN to also test an
# authenticated MCP initialize. Uses curl.exe (built into Windows 10/11), not the PowerShell
# `curl` alias.
param([string]$Base = "http://localhost:3000")

$body = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0"}}}'
# Pass the JSON body via a file: PowerShell 5.1 strips the quotes from inline JSON arguments.
$bodyFile = New-TemporaryFile
[System.IO.File]::WriteAllText($bodyFile.FullName, $body)

try {
    Write-Output "== GET /health"
    curl.exe -s "$Base/health"; Write-Output ""

    Write-Output "== GET /docs"
    $docs = curl.exe -s "$Base/docs" | Out-String
    Write-Output $docs.Substring(0, [Math]::Min(600, $docs.Length))

    Write-Output "== POST /mcp initialize (no credentials - expect 401 with hint/docs)"
    curl.exe -s -X POST "$Base/mcp" `
        -H "Content-Type: application/json" `
        -H "Accept: application/json, text/event-stream" `
        --data-binary "@$($bodyFile.FullName)"
    Write-Output ""

    if ($env:DAP_CUSTOMER_TOKEN) {
        if (-not $env:DAP_ORG_ID) { throw "set DAP_ORG_ID" }
        if (-not $env:DAP_ORCHESTRATOR_DOMAIN) { throw "set DAP_ORCHESTRATOR_DOMAIN" }
        Write-Output "== POST /mcp initialize (with credentials)"
        curl.exe -s -D - -X POST "$Base/mcp" `
            -H "Content-Type: application/json" `
            -H "Accept: application/json, text/event-stream" `
            -H "x-dap-customer-token: $env:DAP_CUSTOMER_TOKEN" `
            -H "x-dap-org-id: $env:DAP_ORG_ID" `
            -H "x-dap-orchestrator-domain: $env:DAP_ORCHESTRATOR_DOMAIN" `
            --data-binary "@$($bodyFile.FullName)"
        Write-Output ""
    }
}
finally {
    Remove-Item $bodyFile.FullName -ErrorAction SilentlyContinue
}
