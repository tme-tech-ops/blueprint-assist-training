# Test Results: [FEATURE NAME]

**Feature**: `[###-feature-name]`
**Test plan**: `tasks.md`, Test Plan phase
**Blueprint version**: [version from CHANGELOG.md]

<!--
  Constitution §5.7: every test run is recorded here with the test task,
  result, deployment ID, date, and dap-bpa version. Append new runs; do not
  overwrite earlier ones. A FAIL stays in the log, followed by the re-run
  that passed.
-->

## Environment

| Item | Value |
| ---- | ----- |
| DAP orchestrator | [name or URL, non-production] |
| Target | [vCenter, cluster, or bare-metal pool] |
| dap-bpa version | [output of `dap-bpa --version`] |
| Plugin versions | [plugin and version for each import] |

## Static checks

| Date | Check | Result | Evidence |
| ---- | ----- | ------ | -------- |
| [YYYY-MM-DD] | lint `--verify --schema` | [PASS/FAIL] | `errorsFound: [n]` |
| [YYYY-MM-DD] | `validate-all` | [PASS/FAIL] | `Summary: [n] valid, [n] invalid` / `Total errors: [n]` |
| [YYYY-MM-DD] | Risk Analysis review | [PASS/FAIL] | [High findings, and the `.riskignore` entries in effect] |

## Test runs

| Date | Task | Requirement | Result | Deployment ID | Notes |
| ---- | ---- | ----------- | ------ | ------------- | ----- |
| [YYYY-MM-DD] | [T110] | [FR-001, AS-1] | [PASS/FAIL] | [deployment ID] | [what was observed on the target] |

## Failures and fixes

<!-- One entry per FAIL above. -->

### [Task ID] - [YYYY-MM-DD]

- **Observed**: [what happened, with the error text]
- **Cause**: [root cause]
- **Fix**: [change made, with commit or CHANGELOG entry]
- **Spec updated**: [yes - which section / no - behaviour unchanged]
- **Re-run**: [task IDs re-run and their result]

## Sign-off

- [ ] Every test task in tasks.md has a PASS entry
- [ ] spec.md, plan.md, and tasks.md match the delivered blueprint (§5.7)
- [ ] CHANGELOG.md and README.md updated (§5.6)

**Signed off by**: [name] | **Date**: [YYYY-MM-DD]
