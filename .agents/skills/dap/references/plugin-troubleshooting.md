# Plugin-Specific Troubleshooting

For plugin-specific errors, always retrieve the actual plugin documentation before diagnosing. The knowledge base has the authoritative reference for each plugin's auth config, node type properties, and known patterns.

## Diagnostic steps

```bash
# 1. Get the full plugin reference (auth config, node types, known patterns)
dap-bpa knowledge plugins docs <plugin>

# 2. Get the execution error and event trail
dap-bpa orchestrator executions get <execution_id> --fields id status error error_structured
dap-bpa orchestrator events get <execution_id>

# 3. Look up the exact node type properties used in the blueprint
dap-bpa knowledge plugins get <plugin> <node_type>
```

## Plugin → docs mapping

| Plugin | Docs command |
|---|---|
| vSphere | `dap-bpa knowledge plugins docs vsphere` |
| Helm | `dap-bpa knowledge plugins docs helm` |
| Kubernetes | `dap-bpa knowledge plugins docs kubernetes` |
| Ansible | `dap-bpa knowledge plugins docs ansible` |
| Terraform | `dap-bpa knowledge plugins docs terraform` |
| AWS | `dap-bpa knowledge plugins docs aws` |
| Azure | `dap-bpa knowledge plugins docs azure` |
| Docker | `dap-bpa knowledge plugins docs docker` |

If plugin docs are not available locally, fetch them first:

```bash
dap-bpa knowledge plugins fetch <plugin>
```

Use the retrieved docs to understand the plugin's auth configuration, required properties, and environment-specific requirements. Do not guess at error causes — diagnose from the event trail and cross-reference with the actual plugin docs.
