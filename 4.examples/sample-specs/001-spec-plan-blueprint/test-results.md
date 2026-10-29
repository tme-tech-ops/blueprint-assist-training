# Test Results: WindowsVM vSphere Blueprint

**Feature**: `001-spec-plan-blueprint`
**Test plan**: [tasks.md](tasks.md), Phase 5
**Blueprint version**: 1.0.0

> **Example log.** This file shows the format constitution §5.7 asks for.
> Dates and deployment IDs are illustrative. The two failures are the ones
> found in lab testing and recorded in
> [spec-consolidated.md](spec-consolidated.md).

## Environment

| Item | Value |
| ---- | ----- |
| DAP orchestrator | Lab orchestrator (non-production) |
| Target | Lab vCenter, clustered, templates for all four OS versions |
| dap-bpa version | v0.32.0 |
| Plugin versions | vSphere plugin `>=3.0.0.0` |

## Static checks

| Date | Check | Result | Evidence |
| ---- | ----- | ------ | -------- |
| 2026-10-20 | lint `--verify --schema` | PASS | `errorsFound: 0` |
| 2026-10-20 | `validate-all` | PASS | `Summary: 1 valid, 0 invalid` / `Total errors: 0` |
| 2026-10-20 | Risk Analysis review | PASS | No High findings; no `.riskignore` |
| 2026-10-20 | `yamllint` | PASS | No errors |

## Test runs

| Date | Task | Requirement | Result | Deployment ID | Notes |
| ---- | ---- | ----------- | ------ | ------------- | ----- |
| 2026-10-20 | T110 | FR-001, FR-007, AS-1 | FAIL | winvm-t110-01 | `No healthy hosts could be found with resource pool Resources` |
| 2026-10-20 | T110 | FR-001, FR-007, AS-1 | FAIL | winvm-t110-02 | Clone succeeded; customization failed: `'dict' object has no attribute 'startswith'` |
| 2026-10-21 | T110 | FR-001, FR-007, AS-1 | PASS | winvm-t110-03 | Powered on; `ip_address` matches vCenter |
| 2026-10-21 | T111 | FR-003, AS-2 | PASS | winvm-t111-01 | Static IP, gateway, and DNS set; DHCP disabled |
| 2026-10-21 | T112 | FR-008, AS-3 | PASS | - | Rejected at creation; no VM created |
| 2026-10-21 | T113 | FR-005, AS-4 | PASS | winvm-t113-01 | Failed before clone: secret not found |
| 2026-10-21 | T114 | FR-001, AS-5 | PASS | winvm-t114-01 to -04 | Four editions confirmed |
| 2026-10-21 | T115 | FR-002, AS-6 | PASS | winvm-t115-01, -02 | Two VMs, distinct suffixes |
| 2026-10-21 | T116 | FR-004, AS-7 | PASS | winvm-t116-01 | 8 vCPUs, 16384 MB |
| 2026-10-21 | T117 | FR-006, AS-8 | PASS | winvm-t117-01 | Placement and 150 GB thin disk as requested |
| 2026-10-21 | T118 | FR-005, AS-9 | PASS | winvm-t118-01 | Rejected before any vSphere task |
| 2026-10-21 | T119 | FR-003, FR-008 | PASS | - | Both input sets rejected at creation |
| 2026-10-21 | T120 | AS-10 | PASS | winvm-t110-03 | Re-run made no vCenter changes |
| 2026-10-21 | T121 | AS-11 | PASS | winvm-t121-01 | `UncustomizableGuest`; uninstall removed the VM |
| 2026-10-21 | T122 | AS-12 | PASS | winvm-t110-03 | VM and disks deleted; folder, datastore, pool intact |
| 2026-10-21 | T130 | coverage | PASS | - | `/speckit.analyze`: FR-001 to FR-008 all have test tasks |

## Failures and fixes

### T110 - 2026-10-20 (run 1)

- **Observed**: `No healthy hosts could be found with resource pool Resources`
- **Cause**: the `vsphere` secret had `auto_placement: false`. On a clustered
  vCenter, `Resources` is the cluster root pool, and per-host placement
  cannot satisfy it
- **Fix**: set `auto_placement: true` in the lab `vsphere` secret
- **Spec updated**: yes - spec-consolidated.md, Secret requirements
- **Re-run**: T110 run 2

### T110 - 2026-10-20 (run 2)

- **Observed**: customization failed with
  `'dict' object has no attribute 'startswith'`
- **Cause**: `vm_password_secret_name` pointed at a structured
  `basic_auth_credentials` secret, which resolves to a dict;
  `windows_password` needs a string
- **Fix**: use a flat `password` secret; constrain the input to the
  `password` schema
- **Spec updated**: yes - spec-consolidated.md, Secret requirements, and
  data-model.md
- **Re-run**: T110 run 3 (PASS), then the remaining tasks

## Sign-off

- [x] Every test task in tasks.md has a PASS entry
- [x] spec.md, plan.md, and tasks.md match the delivered blueprint (§5.7)
- [x] CHANGELOG.md and README.md updated (§5.6)
- [x] `WindowsVM_Vsphere-visualizer.html` generated from the completed blueprint and saved in the blueprint folder (spec.md SC-007)

**Signed off by**: [name] | **Date**: 2026-10-21
