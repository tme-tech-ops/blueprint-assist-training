# Section 006: Supported Blueprints

Before you build a blueprint of your own, it helps to know what is already available to start from. Blueprints fall into two groups by where they come from:

- **Reference blueprints** — Dell-provided and team-curated blueprints you start *from*. These live in the dap-bpa knowledge base and the [Dell Automation Studio Catalog](../section-020-dell-automation-studio-catalog/content.md).
- **Your own blueprints** — blueprints you author for your own requirements and upload to the DAP orchestrator.

This section covers both: how to find and use reference blueprints, and how access is controlled when you publish your own.

## Reference Blueprints

Reference blueprints are proven starting points. Rather than writing a blueprint from a blank file, you find one close to what you need and adapt it.

### Why start from a reference blueprint

- **Proven patterns**: they encode working structure (inputs, node types, relationships, lifecycle) so you inherit good practice by default
- **Faster**: adapting a known-good blueprint is quicker than starting from scratch
- **Consistent**: starting from the same references keeps blueprints across your team looking and behaving alike
- **A learning aid**: reading a reference blueprint is one of the best ways to understand how a real blueprint fits together

### Finding reference blueprints

The dap-bpa knowledge base ships with a library of example blueprints you can search and read offline:

```bash
# Search the library by keyword
dap-bpa knowledge blueprints find "vm"
dap-bpa knowledge blueprints find "kubernetes helm"

# Read a blueprint, including its files
dap-bpa knowledge blueprints get <id> --include-files
```

You can also ask your agent in natural language — for example, "find me a reference blueprint for a vSphere VM and walk me through it" — and it will use these same knowledge commands.

## Your Own Blueprints

When no reference blueprint fits, you author your own. Section 7 covers the authoring workflow with AI assistance end to end; the short version is that you describe what you need, the agent drafts the blueprint against the skills and knowledge base, and you lint and validate it before uploading:

```bash
# Validate while authoring
dap-bpa blueprint lint --file blueprint.yaml --verify
dap-bpa blueprint validate-all --file blueprint.yaml

# Upload to the orchestrator
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-blueprint --revision v1.0.0
```

### Visibility: who can see a blueprint

When you upload a blueprint, its **visibility** controls who can use it on the orchestrator:

| Visibility | Who can see it |
| ------------ | ---------------- |
| `tenant` *(default)* | Everyone in your tenant |
| `global` | All tenants on the orchestrator |
| `private` | Only you |

```bash
# Upload a blueprint visible to your whole tenant (the default)
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-blueprint --visibility tenant
```

> **Coming with Dell Automation Studio — signed blueprints and deployment credits.** Dell is introducing *signed* blueprints. Dell-curated blueprints will be signed and will run without drawing down deployment credits, while blueprints you author yourself will be treated differently and will draw down credits when deployed. The exact mechanics are still being finalized, so treat this as forward-looking. The licensing and deployment-credit model is covered in **Section 15: Dell Automation Studio Offer Details**.

## Reference vs. Your Own: a quick comparison

| Aspect | Reference blueprints | Your own blueprints |
| -------- | ---------------------- | --------------------- |
| **Source** | Dell-provided dap-bpa library and the [Dell Automation Studio Catalog](../section-020-dell-automation-studio-catalog/content.md) | Authored by you or your team |
| **Best for** | Standard patterns, a fast start, learning | Requirements no reference blueprint covers |
| **Validation** | Already tested as working starting points | You lint, validate, and test them |
| **Access control** | As published in the library/repo | You set visibility on upload (tenant/global/private) |
| **Cost (with Dell Automation Studio)** | Signed Dell-curated blueprints will not draw credits *(forthcoming)* | Will draw down deployment credits *(forthcoming)* |

A common pattern is the hybrid: start from a reference blueprint, adapt the parts that differ, validate, and upload as your own.

## Dell Automation Studio Catalog

Dell Automation Studio provides a curated, production-ready catalog of blueprints organized by technology category and industry use case. The catalog includes:

- **8 Technology Categories**: Compute, Databases, DevOps & CI/CD, Observability & Monitoring, Platform Services, Security and Compliance, Storage, Web & Search Services
- **9 Industry Solutions**: Manufacturing, Retail, Energy, Smart Cities, Federal, Healthcare (coming soon), Computer Vision, Financial Services (coming soon), and more
- **3 Curated Offers**: Dell Private Cloud, Dell Distributed Private Cloud, and Dell AI Solutions

See [**Section 20: Dell Automation Studio Catalog**](../section-020-dell-automation-studio-catalog/content.md) for a complete overview of available blueprints and how to discover and adapt them for your needs.

## Next Steps

With an understanding of reference and your own blueprints:

1. **Section 7: Building Blueprints** — author your own blueprint, starting from a reference as a foundation
2. **Section 10: Blueprint Anatomy** — a deep dive into the YAML structure of a blueprint
3. **Section 13: dap-bpa CLI Command Reference** — full reference for `dap-bpa knowledge blueprints` and `dap-bpa orchestrator blueprints`
4. **Section 15: Dell Automation Studio Offer Details** — the licensing, signing, and deployment-credit model
5. **Section 20: Dell Automation Studio Catalog** — explore the full catalog of available blueprints
