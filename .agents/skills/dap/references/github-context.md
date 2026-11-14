# GitHub Repository Context Ingestion

Use this when the user provides a GitHub repository URL and asks to generate a blueprint using files from that repository as context (e.g. "generate a blueprint based on files from https://github.com/owner/repo", "use this repo as reference", "create a blueprint like the one in this GitHub repo").

---

## Input Collection

Collect the following from the user before proceeding:

1. **Repository URL** (required): A valid GitHub repository URL in the format `https://github.com/owner/repo`
2. **Branch** (optional, default: `main`): The branch to fetch from
3. **File paths** (required): One or more explicit file paths within the repository to fetch as context

If the user provides a URL but no file paths, ask: *"Which files from this repository should I use as context? Please provide one or more file paths (e.g., `blueprint.yaml`, `inputs.yaml`)."*

---

## Input Validation

Before attempting any fetch:
- **URL**: Must match `https://github.com/<owner>/<repo>` format (with optional `.git` suffix and trailing slash). If invalid, return: *"Invalid GitHub repository URL. Expected format: `https://github.com/owner/repo`"*
- **File paths**: At least one file path is required. If missing, return: *"File paths are required. Please specify at least one file path within the repository."*
- **Branch**: Use as-is if provided. Default to `main` if not specified. No automatic `master` fallback.

---

## Sparse Fetch

Use git sparse-checkout to fetch only the specified files:

```bash
# Create temporary directory
TMPDIR=$(mktemp -d /tmp/bpa-github-XXXXXX)

# Sparse clone — no blobs yet
git clone --filter=blob:none --sparse --depth=1 --branch <branch> <repo_url> "$TMPDIR"

# Set sparse-checkout to only the user-specified files
cd "$TMPDIR" && git sparse-checkout set --no-cone <file_path_1> <file_path_2> ...
```

If the clone fails, report: *"Failed to fetch from repository: <error>. Check network connectivity and repository accessibility."*

After sparse-checkout, verify each requested file exists. For any missing files, report: *"File '<path>' not found in repository."*

---

## Context Budget

Enforce a **200 KB total context budget** across all fetched files. Read files in the order provided by the user. If adding a file would exceed the budget:
- Include files up to the budget limit
- Inform the user: *"Context budget (200 KB) exceeded. Included N of M requested files."*

---

## Generation with Context

After successful fetch, read the fetched file contents and proceed with the standard **Blueprint Generation Process** (8 steps in SKILL.md), treating the fetched file contents as additional context. When building the blueprint (Step 6), reference patterns, conventions, and structures from the fetched files.

---

## Output and Cleanup

After generation completes:
1. Ask the user: *"Where should I save the generated blueprint?"*
2. Write the generated blueprint to the user-specified path
3. Delete the temporary directory: `rm -rf "$TMPDIR"`
4. Confirm: *"Blueprint saved to <path>. Temporary files cleaned up."*

**CRITICAL**: Always delete the temporary directory, even if an error occurs during generation. Use cleanup as the final step regardless of success or failure.
