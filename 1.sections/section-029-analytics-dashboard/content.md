# Section 029: Analytics Dashboard Deep Dive

> **Audience: platform engineers, operations teams, and enterprise administrators.** This section covers the Analytics Dashboard for deployment insights, usage metrics, KPI tracking, and team-wide automation governance. New in v0.30.1+ with v0.31.0+ enhancements.

---

## Overview

The Analytics Dashboard provides visibility into Blueprint Assist deployments, usage patterns, success rates, and team insights. It integrates Dell Identity OIDC authentication, frontend RBAC, and real-time KPI visualizations for strategic infrastructure decision-making.

### Key Capabilities

- **Real-Time KPIs** — Deployment success rate, execution time, resource utilization
- **Usage Metrics** — Who deployed what, when, and how often
- **Cost Analysis** — Estimated infrastructure costs by team, project, or blueprint
- **Cohort & Retention** — Team engagement metrics and skill adoption trends
- **Advanced Visualizations** — Filterable charts, trend analysis, forecasting
- **RBAC** — Role-based access control (viewer, analyst, admin)
- **Export API** — Download data for external analysis
- **Team Insights** — Per-team deployment patterns and performance

---

## Dashboard Access & Authentication

### Opening the Dashboard

```text
https://agent-mcp-server.sp.dell.com/dashboard
```

Or from CLI:

```bash
dap-bpa dashboard open
```

### Authentication Flow

The dashboard uses **Dell Identity OIDC (OpenID Connect)** with PKCE (Proof Key for Code Exchange) for secure authentication:

```text
1. You click "Sign In"
2. Redirected to Dell Identity portal (https://identity.dell.com)
3. You authenticate with your Dell credentials
4. PKCE exchange occurs (prevents token interception)
5. Dashboard loads with your access level
```

### Role-Based Access Control (RBAC)

| Role | Can View | Can Export | Can Share | Can Admin |
| ---- | -------- | ---------- | --------- | --------- |
| **Viewer** | Public dashboards, own deployments | Own data only | No | No |
| **Analyst** | All deployments, all teams | All data | Yes | No |
| **Admin** | All dashboards, all data | All data | Yes | Yes |

Roles are assigned via Dell Identity group membership.

---

## Dashboard Sections

### 1. Executive Overview

High-level KPIs visible on dashboard load:

```text
┌─────────────────────────────────────────────────────────┐
│ Blueprint Assist Analytics — Last 30 Days              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Total Deployments  │  Success Rate  │  Avg Exec Time  │
│        247          │     94.3%      │    23 minutes   │
│         ↑ 12%       │      ↑ 2.1%    │     ↓ 3 min     │
│                                                         │
│  Cost Saved         │  Teams Active  │  Blueprints     │
│    $1.2M            │      18        │      156        │
│     ↑ 8%            │      ↑ 2       │      ↑ 12       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Metrics:**

- **Total Deployments** — Count of all deployment executions
- **Success Rate** — Percentage of installations that completed without errors
- **Average Execution Time** — Mean time from start to finish (including uninstall)
- **Cost Saved** — Estimated OpEx reduction vs. manual deployment
- **Teams Active** — Distinct teams creating deployments
- **Blueprints in Use** — Count of unique blueprints deployed

### 2. Deployment Success Analysis

Track success/failure patterns:

```text
Deployment Status Distribution (Last 30 Days)

Success: 232 (94%)  ████████████████████
Failed:  11  (4%)   ██
Aborted: 4   (2%)   █

Failure Reasons:
├─ Network timeout: 5 (45%)
├─ Missing credential: 3 (27%)
├─ Resource conflict: 2 (18%)
└─ Other: 1 (10%)

Trend (7-day rolling):
Success Rate: ▁▂▃▄▅▆▇█ (trending up ↑)
```

**Insights:**

- Which blueprints fail most often?
- Are failures increasing or decreasing?
- What are the top failure reasons?

### 3. Usage by Team

Team-based deployment patterns:

```text
Team Deployments (Last 30 Days)

Platform Team ████████████ 87 deployments
  ├─ AWS deployments: 52
  ├─ vSphere: 28
  └─ Kubernetes: 7

Infrastructure Team ██████████ 71 deployments
  ├─ vSphere: 45
  └─ AWS: 26

DataOps Team ███████ 52 deployments
  ├─ All Kubernetes

AppDev Team ███ 37 deployments
  └─ All AWS
```

**Breakdown by Team:**

- Deployment count
- Preferred platforms
- Most-used blueprints
- Adoption trend

### 4. Blueprint Performance

Individual blueprint metrics:

```text
Top Blueprints (by usage)

WordPress on AWS
├─ Used: 43 times (last 30 days)
├─ Success Rate: 97.7%
├─ Avg Time: 12 minutes
└─ Avg Cost: $340/deployment

Kubernetes Multi-Tier
├─ Used: 38 times
├─ Success Rate: 92.1%
├─ Avg Time: 28 minutes
└─ Avg Cost: $1,240/deployment

vSphere VM Baseline
├─ Used: 31 times
├─ Success Rate: 100%
├─ Avg Time: 8 minutes
└─ Avg Cost: $45/deployment
```

**Filter By:**

- Status (active, deprecated, experimental)
- Platform (AWS, GCP, vSphere, Kubernetes)
- Owner (team or individual)

### 5. Cost Analysis

Estimated infrastructure costs:

```text
Infrastructure Spending (Last 30 Days)

Total Estimated Cost: $127,500
vs. Manual Deployment Estimate: $312,000
Savings: $184,500 (59% reduction)

By Platform:
├─ AWS: $89,200 (70%)
├─ vSphere: $28,100 (22%)
├─ Kubernetes: $10,200 (8%)

By Team:
├─ Platform Team: $71,400 (56%)
├─ Infrastructure Team: $39,800 (31%)
├─ DataOps Team: $12,200 (10%)
├─ AppDev Team: $4,100 (3%)

Cost Trend (Daily):
Cost: ▁▂▄▃▅▆▆▇█ (avg $4,250/day)
```

---

## Analytics API

### REST Endpoints

All endpoints require Bearer token authentication:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://agent-mcp-server.sp.dell.com/api/v1/analytics/<endpoint>
```

#### List Deployments with Analytics

```bash
GET /api/v1/analytics/deployments

Query Parameters:
  - time_range: 7d|30d|90d|1y (default: 30d)
  - status: success|failed|all (default: all)
  - team: team-name (optional filter)
  - blueprint_id: blueprint-id (optional filter)

Response:
{
  "deployments": [
    {
      "id": "deploy-001",
      "blueprint_id": "wordpress-aws",
      "team": "Platform Team",
      "status": "success",
      "duration_minutes": 12,
      "estimated_cost": 340,
      "created_at": "2026-09-14T10:30:00Z",
      "nodes_deployed": 4,
      "resources_created": {
        "ec2_instances": 1,
        "rds_instances": 1,
        "security_groups": 2
      }
    }
  ],
  "summary": {
    "total_count": 247,
    "success_count": 232,
    "failed_count": 11,
    "aborted_count": 4,
    "avg_duration_minutes": 23,
    "total_estimated_cost": 127500
  }
}
```

#### Export Analytics Data

```bash
POST /api/v1/analytics/export

Request Body:
{
  "format": "json|csv|parquet",
  "metrics": ["deployments", "teams", "blueprints", "costs"],
  "time_range": "30d",
  "filters": {
    "status": "success",
    "team": "Platform Team"
  }
}

Response:
{
  "export_id": "export-xyz123",
  "download_url": "https://agent-mcp-server.sp.dell.com/api/v1/analytics/exports/export-xyz123/data.csv",
  "expires_in_hours": 24
}
```

#### Get Team Metrics

```bash
GET /api/v1/analytics/teams/{team_name}

Response:
{
  "team": "Platform Team",
  "deployments": {
    "total": 87,
    "success_rate": 0.944,
    "avg_duration_minutes": 21
  },
  "usage_by_platform": {
    "aws": 52,
    "vsphere": 28,
    "kubernetes": 7
  },
  "cost_summary": {
    "total_estimated": 71400,
    "avg_per_deployment": 820
  }
}
```

#### Get Blueprint Analytics

```bash
GET /api/v1/analytics/blueprints/{blueprint_id}

Response:
{
  "blueprint_id": "wordpress-aws",
  "usage_count": 43,
  "success_rate": 0.977,
  "avg_duration_minutes": 12,
  "estimated_cost_per_deployment": 340,
  "teams_using": ["Platform Team", "AppDev Team"],
  "trend": {
    "usage_7d": 12,
    "usage_30d": 43,
    "success_rate_trend": "stable"
  }
}
```

---

## Dashboard Workflows

### Workflow 1: Identify Slow Deployments

**Goal**: Find blueprints that consistently run long

```text
1. Open Analytics Dashboard
2. Go to "Blueprint Performance" section
3. Sort by "Avg Execution Time" (descending)
4. Click on slow blueprint (e.g., "Kubernetes Multi-Tier" - 28 min)
5. View detail pane:
   - See all recent runs
   - Identify bottlenecks (e.g., "app_deployment" node takes 15 min)
   - Check if slow nodes can be parallelized
   - Click "View Blueprint" to inspect the YAML
6. Action: Optimize blueprint or adjust expectations
```

### Workflow 2: Compare Team Productivity

**Goal**: Benchmark how different teams use Blueprint Assist

```text
1. Open Analytics Dashboard
2. Go to "Usage by Team" section
3. Compare metrics side-by-side:
   - Platform Team: 87 deployments, 94.4% success
   - Infrastructure Team: 71 deployments, 89.2% success
4. Click on Infrastructure Team to drill down
5. Identify failures and gaps
6. Share insights with team to improve practices
```

### Workflow 3: Cost Savings Report

**Goal**: Calculate and report infrastructure cost savings

```text
1. Open Analytics Dashboard
2. Go to "Cost Analysis" section
3. Set time range (e.g., "Last Quarter")
4. Review summary:
   - Total infrastructure cost: $380,000
   - Estimated manual cost: $950,000
   - Savings: $570,000 (60%)
5. Export data: Click "Export CSV"
6. Use in executive presentations
```

### Workflow 4: Debug High Failure Rate

**Goal**: Investigate why a blueprint suddenly has failures

```text
1. Open Analytics Dashboard
2. Go to "Deployment Success Analysis"
3. Notice: "Kubernetes Multi-Tier" failure rate jumped from 2% to 15%
4. Click on blueprint to see recent failures
5. Review error details:
   - Most failures: "Missing secret: postgres_password"
   - Root cause: Secret not created in new orchestrator environment
6. Action: Document prerequisite, update blueprint docs
7. Monitor: Watch failure rate return to normal
```

---

## Setting Up Analytics for Your Team

### Step 1: Enable Analytics Collection

```bash
# Analytics enabled by default in v0.30.1+
# Verify it's on:
dap-bpa config show analytics

# Output:
# analytics:
#   enabled: true
#   endpoint: https://agent-mcp-server.sp.dell.com/api/v1/analytics
#   team: "Platform Team"
```

### Step 2: Verify OIDC Credentials

```bash
# Check Dell Identity credentials
dap-bpa setup --oidc-test

# Output:
# Testing Dell Identity connection...
# ✓ OIDC endpoint reachable
# ✓ Client credentials valid
# Ready for dashboard authentication
```

### Step 3: Access Dashboard with Your Team

```bash
# Get dashboard URL
dap-bpa dashboard url

# Output:
# Analytics Dashboard: https://agent-mcp-server.sp.dell.com/dashboard
# Your Role: Analyst
# Team: Platform Team

# Open in browser (automatic sign-in with Dell Identity)
dap-bpa dashboard open
```

### Step 4: Share Reports with Leadership

```bash
# Export quarterly report
dap-bpa dashboard export \
  --time-range 90d \
  --metrics deployments,costs,teams \
  --format pdf \
  --output quarterly-report.pdf

# Send to stakeholders
```

---

## Best Practices

### 1. Monitor Success Rates Weekly

```bash
# Set up weekly review
* * * * 0 dap-bpa dashboard export --time-range 7d --format json

# Alert on threshold
if [ $(jq '.summary.success_rate' dashboard-data.json) -lt 0.9 ]; then
  echo "⚠️ Success rate below 90%" | mail -s "BPA Alert" team@company.com
fi
```

### 2. Tag Deployments for Better Insights

```bash
# Include labels when deploying
dap-bpa orchestrator deployments create \
  --blueprint-id my-blueprint \
  --labels '{
    "team": "Platform",
    "project": "Q3-Migration",
    "environment": "staging"
  }'

# Later, filter analytics by labels
# Dashboard → Filter → Labels → project:Q3-Migration
```

### 3. Regular Blueprint Performance Reviews

**Monthly cadence:**

- Top 5 used blueprints — are they performing well?
- Bottom 5 blueprints — should they be deprecated?
- Failure trends — are error rates increasing?

### 4. Cost Accountability

```bash
# Use cost data for chargeback
dap-bpa dashboard export \
  --filter team:DataOps \
  --format json

# Provision: $X cost → DataOps team
# Track: Cost per deployment ↓ = better efficiency
```

### 5. Compare Before & After Optimization

```bash
# Benchmark before changes
dap-bpa dashboard snapshot --name "pre-optimization"

# Make blueprint improvements
# (optimize node operations, parallelize steps, etc.)

# Benchmark after changes
dap-bpa dashboard snapshot --name "post-optimization"

# Compare: avg execution time reduced from 28 min → 18 min
```

---

## Troubleshooting

### Dashboard Sign-In Fails

**Symptom**: "Unable to authenticate with Dell Identity"

**Cause**: OIDC credentials not configured

**Solution**:

```bash
dap-bpa setup --reset-oidc
# Re-enter Dell Identity client ID and secret
```

### Missing Analytics Data

**Symptom**: Dashboard shows "No data available"

**Cause**:

- Analytics collection disabled
- Deployments ran before analytics enabled
- Wrong time range selected

**Solution**:

```bash
# Verify analytics enabled
dap-bpa config show analytics

# Check if deployments are recent
dap-bpa orchestrator deployments list --time-range 30d

# Try wider time range in dashboard
```

### Export Request Fails

**Symptom**: "Export request timed out"

**Cause**: Large dataset or network issue

**Solution**:

```bash
# Use smaller time range
dap-bpa dashboard export --time-range 7d

# Or use API with pagination
curl -H "Authorization: Bearer $TOKEN" \
  "https://agent-mcp-server.sp.dell.com/api/v1/analytics/deployments?limit=1000&offset=0"
```

### Wrong Team Displayed

**Symptom**: Dashboard shows wrong team's data

**Cause**: Team configuration mismatch

**Solution**:

```bash
# Update team in config
dap-bpa config set analytics.team "Correct Team Name"

# Or use --team flag with CLI exports
dap-bpa dashboard export --team "Correct Team Name"
```

---

## Next Steps

1. **Access the dashboard**: `dap-bpa dashboard open`
2. **Review your team's metrics**: Click "Usage by Team"
3. **Export a report**: Use the dashboard or `dap-bpa dashboard export`
4. **Set up weekly monitoring**: Create a cron job for regular exports
5. **Share insights**: Present metrics to stakeholders
6. **Optimize based on data**: Use insights to improve blueprint performance

---

## Additional Resources

- **API Documentation**: [Section 019: MCP Server](../section-019-mcp-server/content.md) — REST API details
- **Blueprint Performance Tuning**: [Section 007: Building Blueprints](../section-007-building-blueprints/content.md)
- **Deployment Monitoring**: [Section 008: Blueprint Monitoring](../section-008-blueprint-monitoring/content.md)
