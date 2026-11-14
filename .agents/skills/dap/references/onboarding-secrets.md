# DAP Onboarding — Secrets

## Create via UI

1. **Secrets** → **Create Secret**
2. Enter a Key (referenced in blueprints), a Value, optional description → **Create**

To update or delete: find the secret in the list → three-dot menu.

## Create via CLI

```bash
dap-bpa orchestrator secrets create my_secret --value-from-file ./my_secret.txt
dap-bpa orchestrator secrets list
dap-bpa orchestrator secrets get my_secret
dap-bpa orchestrator secrets update my_secret --value-from-file ./my_secret.txt
dap-bpa orchestrator secrets delete my_secret   # asks [y/N]; add --yes in scripts
```

`--value-from-stdin` reads the value from a pipe instead (`pass show db/password | dap-bpa orchestrator secrets create my_secret --value-from-stdin`). Avoid an inline `--value`: it ends up in shell history.

## Use in blueprints

Declare a `secret_key` input and reference it via `get_secret`:

```yaml
inputs:
  db_password:
    type: secret_key
    display_label: DB Password
    description: Database password secret key name

node_templates:
  my_db:
    type: dell.nodes.some.Type
    properties:
      password: { get_secret: { get_input: db_password } }
```

Never pass a literal string to `get_secret`. Always resolve through an input.
