# Section 028: Skill Benchmark Program

> **Audience: skill developers, platform engineers, and Blueprint Assist maintainers.** This section covers deterministic benchmarking of skills, result tracking, performance analysis, and continuous improvement workflows. New in v0.31.0+.

---

## Overview

The Skill Benchmark Program provides a structured way to measure, track, and improve the quality and performance of Blueprint Assist skills. It combines deterministic test cases with LLM-judged evaluation and produces a historical result store for trend analysis.

### Key Capabilities

- **Deterministic Test Cases** — Reproducible skill evaluation scenarios
- **LLM-Judged Results** — AI evaluates output quality beyond simple pass/fail
- **Result History Tracking** — `bpa-benchmark-data/history.json` for trend analysis
- **Weekly Analysis Tool** — Automated skill improvement recommendations
- **Comparative Benchmarking** — Track skill performance across versions
- **Failure Diagnosis** — Automatic root cause analysis for failing tests

---

## Benchmark Structure

### Test Case Format

Benchmark test cases are defined in YAML:

```yaml
# skills/my-skill/benchmarks/blueprint-generation.yaml
name: "Blueprint Generation Quality"
description: "Evaluate skill's ability to generate production-ready blueprints"
version: "1.0"

test_cases:
  - id: "gen-001"
    name: "Simple WordPress Deployment"
    intent: "Deploy WordPress on AWS EC2 with RDS database and CloudFront CDN"
    
    evaluation_criteria:
      - criterion: "imports_pinned"
        weight: 1.0
        pass_threshold: 100
        description: "All plugin imports have version pins (>=X.Y.Z,<NEXT_MAJOR)"
      
      - criterion: "node_types_valid"
        weight: 0.9
        pass_threshold: 100
        description: "All node types exist in imported plugins"
      
      - criterion: "relationships_valid"
        weight: 0.8
        pass_threshold: 100
        description: "All relationship targets exist and are correct type"
      
      - criterion: "inputs_complete"
        weight: 0.7
        pass_threshold: 100
        description: "All inputs have: type, display_label, description, default (if required)"
      
      - criterion: "secrets_usage"
        weight: 0.9
        pass_threshold: 100
        description: "Sensitive values use get_secret, not hardcoded"
      
      - criterion: "code_quality"
        weight: 0.6
        pass_threshold: 85
        description: "Blueprint is readable, well-organized, and follows conventions"
  
  - id: "gen-002"
    name: "Complex Multi-Tier Application"
    intent: "Deploy microservices architecture on Kubernetes with observability stack"
    evaluation_criteria:
      - criterion: "service_mesh_config"
        weight: 0.8
        pass_threshold: 90
      - criterion: "observability_complete"
        weight: 0.7
        pass_threshold: 85
      - criterion: "performance_optimized"
        weight: 0.5
        pass_threshold: 70

  - id: "fix-001"
    name: "Lint Error Repair"
    blueprint_file: "fixtures/blueprint-with-issues.yaml"
    expected_fixes:
      - rule: "IM-003"
        description: "Should pin plugin versions"
      - rule: "IN-004"
        description: "Should add descriptions to inputs"
    evaluation_criteria:
      - criterion: "fixes_correct_issues"
        weight: 1.0
        pass_threshold: 100
      - criterion: "no_regressions"
        weight: 0.9
        pass_threshold: 100
```

---

## Running Benchmarks

### Basic Benchmark Execution

```bash
# Run all benchmarks for a skill
dap-bpa skill benchmark run my-skill

# Output:
# Skill Benchmark: my-skill
# 
# Test Case: gen-001 (Simple WordPress Deployment)
# ├─ imports_pinned:    PASS (100/100)
# ├─ node_types_valid:  PASS (100/100)
# ├─ relationships_valid: PASS (100/100)
# ├─ inputs_complete:   PASS (100/100)
# ├─ secrets_usage:     PASS (100/100)
# └─ code_quality:      PASS (88/100)
# Result: PASS (Weighted: 97.3/100)
#
# Test Case: gen-002 (Complex Multi-Tier Application)
# ├─ service_mesh_config: PASS (92/100)
# ├─ observability_complete: PASS (87/100)
# └─ performance_optimized: PASS (71/100)
# Result: PASS (Weighted: 85.1/100)
#
# Test Case: fix-001 (Lint Error Repair)
# ├─ fixes_correct_issues: PASS (100/100)
# └─ no_regressions:      FAIL (72/100)
# Result: FAIL (Weighted: 87.5/100)
#
# Summary: 2 passed, 1 failed
# Overall Score: 89.5/100
```

### Run Specific Test Cases

```bash
# Run a single test case
dap-bpa skill benchmark run my-skill --test-id gen-001

# Run multiple specific tests
dap-bpa skill benchmark run my-skill --test-ids gen-001,gen-002

# Run only failing tests
dap-bpa skill benchmark run my-skill --failed-only
```

### Compare Across Versions

```bash
# Run benchmarks and compare with previous version
dap-bpa skill benchmark run my-skill \
  --compare-with v0.30.1 \
  --output-format comparison

# Output shows:
# Benchmark Comparison: my-skill
# 
# Test: gen-001
#   v0.30.1 Score: 96.8/100
#   v0.31.0 Score: 97.3/100
#   Change: +0.5 (improved)
# 
# Test: fix-001
#   v0.30.1 Score: 85.2/100
#   v0.31.0 Score: 87.5/100
#   Change: +2.3 (improved)
```

---

## Result Storage & History

### History.json Structure

Benchmark results are stored in `bpa-benchmark-data/history.json`:

```json
{
  "skill": "my-skill",
  "version": "1.0.0",
  "schema_version": "1.0",
  "runs": [
    {
      "timestamp": "2026-09-14T10:30:00Z",
      "bpa_version": "v0.31.0",
      "environment": {
        "node_version": "18.12.0",
        "platform": "linux",
        "llm_model": "claude-opus-5"
      },
      "test_results": {
        "gen-001": {
          "name": "Simple WordPress Deployment",
          "status": "PASS",
          "weighted_score": 97.3,
          "criteria": {
            "imports_pinned": {
              "score": 100,
              "status": "PASS",
              "details": "All 5 imports properly pinned"
            },
            "node_types_valid": {
              "score": 100,
              "status": "PASS"
            },
            "relationships_valid": {
              "score": 100,
              "status": "PASS"
            },
            "inputs_complete": {
              "score": 100,
              "status": "PASS"
            },
            "secrets_usage": {
              "score": 100,
              "status": "PASS"
            },
            "code_quality": {
              "score": 88,
              "status": "PASS",
              "details": "Good structure but output formatting could be improved"
            }
          }
        },
        "gen-002": {
          "name": "Complex Multi-Tier Application",
          "status": "PASS",
          "weighted_score": 85.1
        },
        "fix-001": {
          "name": "Lint Error Repair",
          "status": "FAIL",
          "weighted_score": 87.5,
          "failure_reason": "no_regressions criterion failed",
          "details": "Repair introduced a new lint warning (IN-007)"
        }
      },
      "summary": {
        "total_tests": 3,
        "passed": 2,
        "failed": 1,
        "overall_score": 89.5
      }
    },
    {
      "timestamp": "2026-09-07T10:30:00Z",
      "bpa_version": "v0.30.1",
      "summary": {
        "total_tests": 3,
        "passed": 2,
        "failed": 1,
        "overall_score": 88.7
      }
    }
  ]
}
```

### Query Benchmark History

```bash
# View historical scores for a skill
dap-bpa skill benchmark history my-skill

# Output:
# Benchmark History: my-skill
# 
# Date         Version    Overall  Passed  Failed  Trend
# 2026-09-14   v0.31.0    89.5     2/3     1       ↑
# 2026-09-07   v0.30.1    88.7     2/3     1       ↑
# 2026-08-31   v0.30.0    87.2     1/3     2       ↓
# 2026-08-24   v0.29.3    89.1     2/3     1       ↑

# Show trend for specific test
dap-bpa skill benchmark history my-skill --test-id gen-001

# Output:
# Test: gen-001 (Simple WordPress Deployment)
# 
# Date         Score   Trend
# 2026-09-14   97.3    ↑
# 2026-09-07   96.8    ↑
# 2026-08-31   95.5    ↓
# 2026-08-24   97.2    ↑
```

---

## Weekly Analysis Tool

### Automatic Skill Analysis

The `skill-analysis-tool` runs weekly and generates improvement recommendations:

```bash
# Run analysis manually
dap-bpa skill analyze all --output-format report

# Output: skill-analysis-report-2026-09-14.md
```

### Analysis Report Structure

```markdown
# Skill Analysis Report
Generated: 2026-09-14

## Summary
- **Skills Analyzed**: 12
- **Overall Health**: Green (avg 89.2/100)
- **Regressions**: 1 skill (dap-gcp: -2.1 points)
- **Improvements**: 3 skills (dap-vsphere: +3.4, dap-helm: +1.8, dap-k8s: +0.9)

---

## Recommendations

### High Priority (Do First)
**Skill: dap-gcp (Current: 82.3/100, Target: 95/100)**

Issue: GCP resource extraction accuracy declining
- Latest test: gen-001 (GCP Extract) → 71/100 (down from 88 two weeks ago)
- Cause: Recent changes to intrinsic function handling broke GCP property validation
- Action: Review recent commits to the properties validation module

Test: fix-001 (GCP Lint Repair) → FAILING for 2 weeks
- Missing: Ability to auto-fix missing region specifications
- Recommended: Add region-inference logic for GCP resources

### Medium Priority (Schedule Next Sprint)
**Skill: dap-vsphere (Current: 91.8/100, Target: 95/100)**

Opportunity: Performance improvement test case
- gen-003 (vSphere performance optimization) → 76/100
- Users ask about optimizing CPU/memory allocation; skill could better guide choices
- Recommended: Enhance guidance on right-sizing VM templates

### Low Priority (Monitor)
**Skill: dap-k8s (Current: 94.1/100)**

Status: Stable and improving
- Trend: +0.9 points over last two weeks
- No immediate action needed; continue monitoring

---

## Trend Analysis

### Regressions This Week
- dap-gcp: -2.1 (investigate GCP property validation)
- dap-ansible: -0.3 (minor, watch)

### Improvements This Week
- dap-vsphere: +3.4 (good progress on relationship handling)
- dap-helm: +1.8 (improved Chart.yaml generation)

---

## Action Items

| Priority | Skill | Action | Owner | Target |
|----------|-------|--------|-------|--------|
| P0 | dap-gcp | Debug property validation regression | @engineering | EOW |
| P0 | dap-gcp | Implement region-inference logic | @engineering | 2 weeks |
| P1 | dap-vsphere | Enhance VM right-sizing guidance | @product | 1 month |
| P2 | dap-ansible | Review playbook generation logic | @engineering | Monitor |

---

## Next Review
2026-09-21 (weekly automated run)
```

---

## Benchmark Best Practices

### 1. Write Clear Test Intents

```yaml
# ✓ GOOD - Specific and actionable
- id: "gen-001"
  intent: "Deploy WordPress 6.2 on AWS EC2 (t3.medium) with RDS PostgreSQL 15, behind CloudFront"

# ✗ WEAK - Too vague
- id: "gen-001"
  intent: "Deploy WordPress"
```

### 2. Define Measurable Evaluation Criteria

```yaml
# ✓ GOOD - Specific pass threshold
- criterion: "imports_pinned"
  description: "All plugin imports have version pins"
  pass_threshold: 100

# ✗ VAGUE - No clear metric
- criterion: "good_quality"
  description: "Blueprint is well-written"
  pass_threshold: 80
```

### 3. Weight Criteria by Importance

```yaml
evaluation_criteria:
  - criterion: "security_best_practices"
    weight: 1.0      # Critical
    pass_threshold: 100
  
  - criterion: "performance_optimization"
    weight: 0.5      # Nice-to-have
    pass_threshold: 80
```

### 4. Track Trends, Not Just Raw Scores

```bash
# Use history analysis
dap-bpa skill benchmark history my-skill \
  --show-trends \
  --time-range 30d

# Identify patterns:
# - Is skill consistently improving?
# - Are specific test cases regressing?
# - What changed in last commit?
```

### 5. Run Benchmarks in CI/CD

```yaml
# GitHub Actions example
- name: Run Skill Benchmarks
  run: |
    dap-bpa skill benchmark run my-skill \
      --fail-on-regression 2.0  # Fail if score drops >2.0
      --save-results benchmark-results.json

- name: Compare with baseline
  run: |
    dap-bpa skill benchmark compare \
      baseline.json \
      benchmark-results.json
```

---

## Troubleshooting

### Benchmark Test Fails with "LLM Judgment Error"

**Symptom**: Evaluation returns error instead of score

**Cause**: LLM couldn't evaluate criterion clearly

**Solution**:

- Clarify criterion description
- Provide examples of passing/failing output
- Simplify the criterion if possible

### History.json Not Recording Results

**Symptom**: New benchmark runs don't appear in history

**Cause**: Missing `bpa-benchmark-data` directory

**Solution**:

```bash
# Create benchmark data directory
mkdir -p bpa-benchmark-data

# Run benchmarks again
dap-bpa skill benchmark run my-skill
```

### Benchmark Scores Inconsistent Between Runs

**Symptom**: Same test case gets different scores

**Cause**: LLM evaluation is probabilistic; use higher iterations for stability

**Solution**:

```bash
# Run with multiple evaluation passes
dap-bpa skill benchmark run my-skill \
  --iterations 3 \
  --aggregate-method mean
```

---

## Integration with Development Workflow

### Pre-Commit: Quick Sanity Check

```bash
# Fast subset of benchmarks (< 1 minute)
dap-bpa skill benchmark run my-skill \
  --test-ids gen-001 \
  --timeout 30s
```

### Pre-Merge: Full Benchmark Suite

```bash
# Run all benchmarks before merging to main
dap-bpa skill benchmark run my-skill \
  --fail-on-regression 1.0 \
  --timeout 300s
```

### Weekly: Trend Analysis

Automated weekly analysis (set up via cron or GitHub Actions):

```bash
# Runs every Monday at 9am
dap-bpa skill analyze all --output-format report --save-report true
```

---

## Next Steps

1. **Create benchmark file**: `skills/my-skill/benchmarks/test-cases.yaml`
2. **Define test cases**: Write 2-3 representative scenarios
3. **Run first benchmark**: `dap-bpa skill benchmark run my-skill`
4. **Review history**: `dap-bpa skill benchmark history my-skill`
5. **Set up weekly analysis**: Schedule `dap-bpa skill analyze all`
