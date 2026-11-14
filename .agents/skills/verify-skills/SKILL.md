---
name: verify-skills
description: >-
  Verify the signature integrity of installed IDE skills. Use when the user asks to
  "verify skills", "check skill signatures", "validate skill integrity", "are my skills authentic",
  "check for tampered skills", or any request to verify the authenticity of installed skills.
---

# Verify Skills — Signature Integrity Verification

This skill verifies the cryptographic signature integrity of all installed IDE skills across your development environment.

## What It Does

Scans all skill directories (`.agents/skills/`, `.claude/skills/`, `.devin/skills/`, `.cline/skills/`, `.windsurf/skills/`, `~/.codeium/windsurf/skills/`, `~/.claude/skills/`, `~/.config/devin/skills/`, `~/.blueprint-assist/skills/`) and classifies each skill's integrity status.

## Classification States

Each skill is classified into one of four states:

| Status | Meaning | Security Implication |
|--------|---------|---------------------|
| **dell-provided** | Valid signature, unmodified files | ✅ Authentic Dell-provided skill |
| **customer-modified** | Valid signature, but files have been modified | ⚠️ Skill was authentic but has been customized |
| **unsigned** | No signature present | ℹ️ Skill has no signature (may be custom/third-party) |
| **invalid-signature** | Signature verification failed | 🚨 Potential tampering or corruption |

## Usage

### Command Line

```bash
# Verify all installed skills
dap-bpa verify-skills

# Get JSON output for programmatic use
dap-bpa verify-skills --json
```

### IDE Skill

Simply invoke this skill when you want to check the integrity of your installed skills. The agent will run `dap-bpa verify-skills` and interpret the results for you.

## Output

The command outputs a table showing:
- **Skill Name**: The name of the skill directory
- **Status**: One of the four classification states
- **Modified Files**: For `customer-modified` skills, lists which files have been changed
- **Location**: The directory this copy was found in

A skill installed in more than one location (e.g. the canonical
`~/.blueprint-assist/skills` copy plus an IDE-synced copy under
`~/.codeium/windsurf/skills`) prints one row per copy — rows are never merged,
since two copies of the same skill can have different integrity states. The
**Location** column is what tells otherwise-identical rows apart; without it,
two synced copies with the same name and status look like a duplicate-output
glitch instead of "this skill is installed in 2 places."

Example output:
```
Skill Name              Status             Modified Files  Location
─────────────────────────────────────────────────────────────────────────────────────
dap                     dell-provided      —               /home/user/.blueprint-assist/skills
dap                     customer-modified  SKILL.md        /home/user/.codeium/windsurf/skills
my-custom-skill         unsigned           —               /home/user/.agents/skills
```

The same `location` field is included in `--json` output per skill, and in
`--report`'s `skills[]` entries (additive to the ER-005 `ComplianceReport`
wire format).

## Exit Codes

- **0**: All skills are either `dell-provided` or `unsigned` (safe)
- **1**: At least one skill has `invalid-signature` (potential security issue)

## When to Use

- **After installing new skills**: Verify they haven't been tampered with
- **Security audits**: Check that all Dell-provided skills are authentic
- **Troubleshooting**: Diagnose unexpected skill behavior that might be due to modification
- **Compliance**: Ensure skills meet organizational security policies

## Security Notes

- **invalid-signature** status indicates either:
  - The skill's signature file was tampered with
  - The skill's manifest was modified after signing
  - The skill files were corrupted
  
  This is a serious security concern and should be investigated immediately.

- **customer-modified** status is not necessarily a problem if you intentionally customized the skill, but it means the skill is no longer in its original Dell-provided state.

- **unsigned** skills are not verified and could be from any source. Review their contents before use.

## Related Commands

- `dap-bpa setup-ide` — Install skills (also shows verification status during installation)
- `dap-bpa status` — Check overall Blueprint Assist setup status

## Technical Details

Verification uses Ed25519 cryptographic signatures:
1. Each Dell-provided skill includes a `.content-manifest.json` file listing all files and their SHA-256 hashes
2. The manifest is signed with Dell's private key, producing `.content-manifest.sig`
3. Verification checks:
   - Signature authenticity using Dell's public key
   - File hash integrity against the manifest
   - No extra files have been added
   - Skill identity matches directory name

For more details, see the skill signing implementation in `packages/core/src/skill-signing.ts`.
