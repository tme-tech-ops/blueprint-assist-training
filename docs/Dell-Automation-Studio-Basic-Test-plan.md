<!-- markdownlint-disable MD033 -->
# Dell Automation Studio Basic Test Plan

## Test Plan Identifier

- **Document ID:** DAS-BASIC-TP-001
- **Version:** 1.1
- **Date:** July 29, 2026
- **Author:** Dell Blueprint Assist Team
- **Target Audience:** Dell partners evaluating Dell Automation Studio (Blueprint Assist) for infrastructure automation

> **Reference learning:** Each module and test case links to the matching section of the [Blueprint Assist Training](../index.md) repository so testers can read deeper background before, during, or after a step. See [Section 4: Training Section Alignment](#4-training-section-alignment) for the complete section-to-test-case map.

## 1. Introduction

### 1.1 Purpose

This test plan provides a structured 2.5-hour evaluation path for partners to validate Blueprint Assist capabilities, including installation, blueprint authoring with AI assistance, local validation, deployment, and lifecycle management.

> **Learn more:** [Section 001 - Introduction](../1.sections/section-001-introduction/content.md) (what Blueprint Assist is and why it exists) and [Section 000 - Quick Start](../1.sections/section-000-quick-start/content.md) (zero-to-hero in 15 minutes).

### 1.2 Scope

**In Scope:**

- dap-bpa CLI installation and configuration
- AI IDE integration (Windsurf/Claude Code)
- Knowledge base discovery and blueprint analysis
- Local blueprint validation (linting and schema validation)
- AI-assisted blueprint authoring
- Blueprint upload, deployment, and execution (with orchestrator access)
- Blueprint visualization and risk analysis
- Deployment updates and cleanup

**Out of Scope:**

- Advanced custom plugin development
- CI/CD pipeline integration
- Multi-orchestrator environment management
- Production deployment validation
- MCP server integration (see [Section 019 - MCP Server](../1.sections/section-019-mcp-server/content.md) for the advanced/alternative path)

### 1.3 Prerequisites

- **System:** Windows 10/11, macOS 10.15+, or Ubuntu 20.04+ with 8GB RAM minimum
- **Software:** Git installed
- **Access:** Dell Automation Studio catalog for dap-bpa installer (latest build supplied by Dell)
- **IDE:** Any supported IDE/agent - Windsurf (recommended), Claude Code, Cursor, JetBrains, VS Code, Antigravity, Cline, or Devin CLI; dap-bpa is agent-agnostic (see [Section 002 - Installation](../1.sections/section-002-installation/content.md))
- **Credentials:** DAP orchestrator credentials (optional - offline path available)

## 2. Test Strategy

### 2.1 Approach

The test plan is divided into four 30-minute test modules, each building on the previous, plus a 30-minute learner feedback module. Partners can complete the full path with orchestrator access or an alternative offline path for Module 3.

### 2.2 Test Environment

- **Local Workstation:** Partner's own machine with the latest dap-bpa CLI installed
- **AI IDE:** Any supported IDE/agent with dap-bpa skills loaded via `dap-bpa setup-ide`
- **Orchestrator:** DAP/Dell Distributed Private Cloud (optional)
- **Test Blueprint:** Simple nginx deployment on Kubernetes or vSphere VM

### 2.3 Entry Criteria

- Partner has access to Dell Automation Studio
- Partner has a supported AI IDE installed or can install one during the test
- Partner has orchestrator credentials (if testing deployment path)

### 2.4 Exit Criteria

- All test cases in the selected path pass
- Partner can independently perform core BPA workflows
- Partner completes self-assessment with positive feedback

## 3. Test Schedule

| Module | Duration | Description |
| -------- | ---------- | ------------- |
| Module 1 | 30 min | Installation, Setup, and Offline Discovery |
| Module 2 | 30 min | Blueprint Authoring with AI Assistance |
| Module 3A | 30 min | Deployment and Execution (with orchestrator) |
| Module 3B | 30 min | Offline Deep Dive (without orchestrator) |
| Module 4 | 30 min | Update, Cleanup, and Wrap-Up |
| Module 5 | 30 min | Learner Feedback and Assessment (post-test) |
| **Total** | **2.5 hours** | (Modules 3A and 3B are alternative paths - complete one) |

## 4. Training Section Alignment

Every module maps to one or more sections of the [Blueprint Assist Training](../index.md) repository. Use this map to pick the right deep-dive reading for each test case, and to confirm the plan exercises the full training curriculum.

| Section | Topic | Where used in this test plan |
| --------- | ------- | ------------------------------ |
| [000 - Quick Start](../1.sections/section-000-quick-start/content.md) | Zero-to-hero install and first blueprint | Pre-reading; Module 1 (TC-001, TC-002) |
| [001 - Introduction](../1.sections/section-001-introduction/content.md) | What Blueprint Assist is and why it exists | Pre-reading; Section 1.1 |
| [002 - Installation](../1.sections/section-002-installation/content.md) | Installing the CLI and configuring the environment | Module 1 (TC-001, TC-002, TC-004) |
| [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md) | Connecting to the DAP orchestrator | Module 3A (TC-009, TC-010); Module 4 (TC-017) |
| [004 - Skills Overview](../1.sections/section-004-skills-overview/content.md) | How AI skills work in your IDE | Module 1 (TC-002); Module 3B (TC-014) |
| [005 - Skills Architecture](../1.sections/section-005-skills-architecture/content.md) | Deep dive into skill architecture | Module 3B (TC-014) |
| [006 - Supported Blueprints](../1.sections/section-006-supported-blueprints/content.md) | Blueprint types and use cases | Module 1 (TC-003); Module 2 (TC-005) |
| [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md) | Authoring blueprints with BPA | Module 2 (TC-005, TC-006, TC-007); Module 3A (TC-011) |
| [008 - Blueprint Monitoring](../1.sections/section-008-blueprint-monitoring/content.md) | Monitoring deployment status | Module 3A (TC-012); Module 4 (TC-016) |
| [009 - Blueprint Reasoning](../1.sections/section-009-blueprint-reasoning/content.md) | LLM-powered diagnostics and analysis | Module 3B (TC-013, TC-015) |
| [010 - Blueprint Anatomy](../1.sections/section-010-blueprint-anatomy/content.md) | Structure of a DAP blueprint | Module 1 (TC-004); Module 2 (TC-005, TC-006); Module 3B (TC-013) |
| [011 - Skill Anatomy](../1.sections/section-011-skill-anatomy/content.md) | Structure of a BPA skill | Module 3B (TC-014) |
| [012 - Hands-On Workshop](../1.sections/section-012-hands-on-workshop/content.md) | Practical exercises | Extended practice; follow-up after this plan |
| [013 - BPA CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md) | Full CLI reference | All CLI-based cases (TC-003, TC-004, TC-007, TC-009-TC-018) |
| [014 - Diagrams](../1.sections/section-014-diagrams/content.md) | Architecture diagrams | Module 2 (TC-008) |
| [015 - Studio Offer Details](../1.sections/section-015-studio-offer-details/content.md) | Offer and packaging (free vs. paid) | Background reading; Appendix (sellers/account teams) |
| [016 - Tunnel Connections](../1.sections/section-016-tunnel-connections/content.md) | Tunnel and connectivity setup | Module 3A (TC-009) when tunneling is required |
| [017 - Model Architecture Decisions](../1.sections/section-017-model-architecture-decisions/content.md) | Design rationale; Devin vs. Windsurf | Module 1 (TC-002) IDE/agent choice |
| [018 - Spec Considerations](../1.sections/section-018-spec-considerations/content.md) | Blueprint specification guidance | Module 2 (TC-006) |
| [019 - MCP Server](../1.sections/section-019-mcp-server/content.md) | MCP server setup and usage | Advanced/alternative integration (out of scope; reference) |
| [020 - Studio Catalog](../1.sections/section-020-dell-automation-studio-catalog/content.md) | Dell Automation Studio catalog | Module 1 (TC-004); Appendix (browse blueprints) |
| [021 - Blueprint Visualizer](../1.sections/section-021-blueprint-visualizer/content.md) | Interactive HTML visualization and risk analysis | Module 2 (TC-008); Module 3B (TC-015) |
| [022 - Licensing Model](../1.sections/section-022-licensing-model/content.md) | MRUs, deployment credits, and scenarios | Background reading; Appendix (sellers/account teams) |

## 5. Test Cases

### Module 1: Installation, Setup, and Offline Discovery

| Test Case ID | TC-001 | TC-002 | TC-003 | TC-004 |
| -------------- | -------- | -------- | -------- | -------- |
| **Description** | Install dap-bpa CLI | Install AI IDE and Load Skills | Explore Knowledge Base | Download and Lint Blueprint |
| **Duration** | 8 min | 8 min | 7 min | 7 min |
| **Preconditions** | Installer downloaded from Dell Automation Studio | dap-bpa CLI installed | dap-bpa CLI installed | dap-bpa CLI installed |
| **Test Steps** | 1. Run `.\bpa-win-x64-*-setup.exe`<br>2. Run `dap-bpa --version`<br>3. Run `dap-bpa --help` | 1. Install a supported IDE (e.g. Windsurf from windsurf.com)<br>2. Enter SSO key: dell<br>3. Run `dap-bpa setup-ide <ide>`<br>4. Run `dap-bpa status` | 1. Run `dap-bpa knowledge blueprints find "vm"`<br>2. Run `dap-bpa knowledge plugins list vsphere`<br>3. Run `dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server` | 1. Download blueprint from catalog<br>2. Run `dap-bpa blueprint lint --file blueprint.yaml --verify`<br>3. Review diagnostics report |
| **Expected Result** | Version number returned<br>Help displays command groups | IDE launches with SSO<br>Skills installed in status<br>Agent recognizes `@dap-bpa` | Relevant blueprint results returned<br>Plugin node types listed<br>Node type details displayed | Lint completes without fatal errors<br>Diagnostics report displays findings<br>Partner understands linter checks |
| **Actual Result** | | | | |
| **Status** | | | | |
| **Notes** | Open new terminal if command not found | Re-run setup-ide if agent doesn't recognize skills | Works offline, no orchestrator needed | Findings are expected learning exercise |
| **Reference Learning** | [002 - Installation](../1.sections/section-002-installation/content.md), [000 - Quick Start](../1.sections/section-000-quick-start/content.md) | [002 - Installation](../1.sections/section-002-installation/content.md), [004 - Skills Overview](../1.sections/section-004-skills-overview/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [006 - Supported Blueprints](../1.sections/section-006-supported-blueprints/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [010 - Blueprint Anatomy](../1.sections/section-010-blueprint-anatomy/content.md) |

---

### Module 2: Blueprint Authoring with AI Assistance

| Test Case ID | TC-005 | TC-006 | TC-007 | TC-008 |
| -------------- | -------- | -------- | -------- | -------- |
| **Description** | Author Blueprint Framework | Add Inputs and Capabilities | Validate Locally | Generate Blueprint Visualizer |
| **Duration** | 10 min | 8 min | 7 min | 5 min |
| **Preconditions** | IDE with dap-bpa skills loaded | Blueprint framework created | Blueprint with inputs created | Blueprint validated |
| **Test Steps** | 1. Create folder `my-test-blueprint`<br>2. Create `blueprint.yaml`<br>3. Ask agent: "@dap-bpa Build me a blueprint framework for nginx deployment on Ubuntu using dell.nodes.kubernetes.resources.Deployment"<br>4. Review structure | 1. Ask agent: "@dap-bpa Add input groups for configuration and networking. Add constraint replica_count between 1 and 10. Add capability for service endpoint."<br>2. Review inputs/capabilities<br>3. Ensure CHANGELOG.yaml exists | 1. Run `dap-bpa blueprint lint --file blueprint.yaml --verify`<br>2. Run `dap-bpa blueprint validate-all --file blueprint.yaml`<br>3. Fix any errors | 1. Run `dap-bpa blueprint visualize --file blueprint.yaml`<br>2. Open generated HTML in browser |
| **Expected Result** | Valid blueprint framework generated<br>Proper node types, inputs, lifecycle<br>Partner can explain structure | Inputs have descriptions (IN-001)<br>Constraints properly defined<br>Capabilities use `capabilities:` (CP-001)<br>CHANGELOG.yaml exists (BS-009) | Passes all lint rules (TD-002: dell.* prefix)<br>Schema validation succeeds<br>No critical errors | HTML file generates<br>Browser displays topology diagram<br>Risk Analysis panel shows findings |
| **Actual Result** | | | | |
| **Status** | | | | |
| **Notes** | Use dell.nodes.kubernetes or dell.nodes.vsphere | Verify compliance with blueprint-rules.md | Fix node type references and plugin imports | Risk analysis runs ~25 rules across security/reliability |
| **Reference Learning** | [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md), [010 - Blueprint Anatomy](../1.sections/section-010-blueprint-anatomy/content.md) | [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md), [018 - Spec Considerations](../1.sections/section-018-spec-considerations/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md) | [021 - Blueprint Visualizer](../1.sections/section-021-blueprint-visualizer/content.md), [014 - Diagrams](../1.sections/section-014-diagrams/content.md) |

---

### Module 3A: Deployment and Execution (with Orchestrator)

| Test Case ID | TC-009 | TC-010 | TC-011 | TC-012 |
| -------------- | -------- | -------- | -------- | -------- |
| **Description** | Configure Orchestrator Connection | Upload Blueprint | Create Deployment | Execute and Monitor |
| **Duration** | 8 min | 5 min | 7 min | 10 min |
| **Preconditions** | DAP orchestrator credentials available | Blueprint validated locally | Blueprint uploaded | Deployment created |
| **Test Steps** | 1. Run `dap-bpa setup`<br>2. Enter portal/orchestrator domains, org ID, client ID/secret<br>3. Run `dap-bpa status`<br>4. Run `dap-bpa orchestrator blueprints list -o profile` | 1. Run `dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-test-blueprint --revision 1.0.0 -o profile`<br>2. Run `dap-bpa orchestrator blueprints get my-test-blueprint -o profile` | 1. Create inputs.json with test values<br>2. Run `dap-bpa orchestrator deployments create --blueprint-id my-test-blueprint --inputs inputs.json --display-name "my-test-deployment" -o profile`<br>3. Note deployment ID | 1. Run `dap-bpa orchestrator executions start --deployment-id <id> --workflow-id install -o profile`<br>2. Note execution ID<br>3. Run `dap-bpa orchestrator executions get <exec_id> -o profile`<br>4. Run `dap-bpa orchestrator events get <exec_id> -o profile` |
| **Expected Result** | Status shows orchestrator connected<br>Blueprint list succeeds | Upload completes successfully<br>Blueprint appears in list | Deployment created successfully<br>Deployment ID captured | Install workflow starts<br>Execution status monitorable<br>Events stream in real-time |
| **Actual Result** | | | | |
| **Status** | | | | |
| **Notes** | Use `--trust-all` for self-signed certs (dev only) | Revision follows semver | Inputs must match blueprint schema | Monitor for errors in event stream |
| **Reference Learning** | [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md), [016 - Tunnel Connections](../1.sections/section-016-tunnel-connections/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md) | [008 - Blueprint Monitoring](../1.sections/section-008-blueprint-monitoring/content.md), [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md) |

---

### Module 3B: Offline Deep Dive (without Orchestrator)

| Test Case ID | TC-013 | TC-014 | TC-015 |
| -------------- | -------- | -------- | -------- |
| **Description** | Blueprint Reasoning with AI | Explore Skills Capabilities | Risk Analysis and Remediation |
| **Duration** | 10 min | 10 min | 10 min |
| **Preconditions** | Complex blueprint downloaded from catalog | IDE with dap-bpa skills loaded | Blueprint visualizer generated |
| **Test Steps** | 1. Open blueprint in your IDE<br>2. Ask: "@dap-bpa What does this blueprint deploy and what inputs does it require?"<br>3. Ask: "@dap-bpa Walk me through the install workflow step by step."<br>4. Ask: "@dap-bpa What are the security considerations?"<br>5. Review analysis | 1. Ask: "@dap-bpa What skills do you have?"<br>2. Ask: "@dap-bpa How do I add drift detection?"<br>3. Ask: "@dap-bpa How do I compose services using ServiceComponent?"<br>4. Ask: "@dap-bpa How do I update a deployment without reinstalling?" | 1. Run `dap-bpa blueprint visualize --file blueprint.yaml`<br>2. Review Risk Analysis panel in HTML<br>3. Note severity, category, remediation<br>4. Ask agent: "@dap-bpa Fix the risks flagged in the visualizer" |
| **Expected Result** | Agent provides accurate analysis<br>Partner understands blueprint purpose<br>Partner understands requirements | Agent demonstrates 7 skills knowledge<br>Partner understands when to use each skill | Risk Analysis panel displays findings<br>Agent applies suggested fixes<br>Blueprint passes risk checks after remediation |
| **Actual Result** | | | |
| **Status** | | | |
| **Notes** | Works offline, no orchestrator needed | Skills: dap, dap-scripts, dap-deployment-update, dap-service-composition, visualize-blueprint, blueprint-risk-fix, isv-blueprints | Risk rules cover security, reliability, lifecycle, operability |
| **Reference Learning** | [009 - Blueprint Reasoning](../1.sections/section-009-blueprint-reasoning/content.md), [010 - Blueprint Anatomy](../1.sections/section-010-blueprint-anatomy/content.md) | [004 - Skills Overview](../1.sections/section-004-skills-overview/content.md), [005 - Skills Architecture](../1.sections/section-005-skills-architecture/content.md), [011 - Skill Anatomy](../1.sections/section-011-skill-anatomy/content.md) | [021 - Blueprint Visualizer](../1.sections/section-021-blueprint-visualizer/content.md), [009 - Blueprint Reasoning](../1.sections/section-009-blueprint-reasoning/content.md) |

---

### Module 4: Update, Cleanup, and Wrap-Up

| Test Case ID | TC-016 | TC-017 | TC-018 |
| -------------- | -------- | -------- | -------- |
| **Description** | Deployment Update | Secret Management | Cleanup |
| **Duration** | 10 min | 10 min | 10 min |
| **Preconditions** | Deployment running | Orchestrator connected | Deployment uninstalled |
| **Test Steps** | 1. Modify blueprint.yaml (change default inputs)<br>2. Run `dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-test-blueprint --revision 1.1.0 -o profile`<br>3. Create update-body.json with blueprint_version and skip_reinstall<br>4. Run `dap-bpa orchestrator deployment-updates initiate <id> --body update-body.json -o profile` | 1. Run `dap-bpa orchestrator secrets list -o profile`<br>2. Run `dap-bpa orchestrator secrets create --key test-secret --value "test-value" --display-name "Test Secret" -o profile`<br>3. Run `dap-bpa orchestrator secrets get test-secret -o profile` | 1. Run `dap-bpa orchestrator executions start --deployment-id <id> --workflow-id uninstall -o profile`<br>2. Run `dap-bpa orchestrator blueprints delete my-test-blueprint --force -o profile`<br>3. Run `dap-bpa orchestrator secrets delete test-secret -o profile` |
| **Expected Result** | New version uploads<br>Deployment update initiates<br>Partner understands update workflow | Secret created successfully<br>Secret metadata retrievable<br>Partner understands secret lifecycle | Deployment uninstalled<br>Blueprint deleted<br>Secrets cleaned up |
| **Actual Result** | | | |
| **Status** | | | |
| **Notes** | Update workflow supports version bumps, input changes, reinstall control | Secrets use type: secret_key (SC-002) | Deployment deletion via orchestrator UI only |
| **Reference Learning** | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [008 - Blueprint Monitoring](../1.sections/section-008-blueprint-monitoring/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md), [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md) | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md) |

---

### Module 5: Learner Feedback and Assessment (Post-Test)

| Test Case ID | TC-019 | TC-020 | TC-021 |
| -------------- | -------- | -------- | -------- |
| **Description** | Capability Confidence Self-Assessment | Section Progress Tracking | Learner Feedback Submission |
| **Duration** | 10 min | 10 min | 10 min |
| **Preconditions** | All test cases completed | All test cases completed | All test cases completed |
| **Test Steps** | 1. Open `docs/LEARNER-ASSESSMENT.md` from training repo<br>2. Rate confidence level (1-5) for each capability area:<br>   - Blueprint Authoring<br>   - Blueprint Review<br>   - Blueprint Testing<br>   - Blueprint Deployment<br>   - Blueprint Maintenance<br>3. Save assessment locally | 1. Mark completed sections in assessment document:<br>   - Section 0: Quick Start<br>   - Section 1: Introduction<br>   - Section 2: Installation<br>   - Section 3: Orchestration Service Auth<br>   - Section 4: Skills Overview<br>   - Section 7: Building Blueprints<br>2. Note sections requiring additional review | 1. Navigate to [github.com/tme-tech-ops/blueprint-assist-training](https://github.com/tme-tech-ops/blueprint-assist-training)<br>2. Click "Issues" -> "New Issue"<br>3. Select "Learner Feedback" template<br>4. Complete feedback form:<br>   - Most valuable capability<br>   - Most confusing/difficult area<br>   - Suggestions for improvement<br>   - Bugs or gaps encountered<br>5. Submit issue |
| **Expected Result** | Confidence ratings recorded for all 5 capability areas<br>Assessment saved locally | Completed sections marked<br>Gaps identified for follow-up learning | Learner feedback issue submitted<br>Feedback captured in public repository<br>Dell team notified for review |
| **Actual Result** | | | |
| **Status** | | | |
| **Notes** | Use 1-5 scale: 1=No confidence, 5=Fully confident | Refer to training repo `docs/LEARNER-ASSESSMENT.md` for template | Feedback template available at github.com/tme-tech-ops/blueprint-assist-training/issues/new?template=learner-feedback.yml |
| **Reference Learning** | [LEARNER-ASSESSMENT](LEARNER-ASSESSMENT.md) | [Training sections index](../index.md), [012 - Hands-On Workshop](../1.sections/section-012-hands-on-workshop/content.md) | [Training repo](https://github.com/tme-tech-ops/blueprint-assist-training) |

---

## 6. Test Data

### 6.1 Test Blueprint

- **Name:** nginx-kubernetes-deployment
- **Node Type:** dell.nodes.kubernetes.resources.Deployment
- **Inputs:** replica_count (1-10), image_tag (string)
- **Capabilities:** service_endpoint (output)

### 6.2 Test Inputs

```json
{
  "replica_count": 3,
  "image_tag": "latest"
}
```

### 6.3 Test Secret

- **Key:** test-secret
- **Value:** test-value
- **Display Name:** Test Secret
- **Description:** For testing purposes

---

## 7. Defect Tracking

| Defect ID | Description | Severity | Status | Assigned To |
| ----------- | ------------- | ---------- | -------- | ------------- |
| | | | | |

---

## 8. Success Criteria Summary

| Test Objective | Success Indicator | Test Case Reference | Reference Learning |
| ---------------- | ------------------- | --------------------- | -------------------- |
| Installation & Setup | dap-bpa CLI installed, IDE skills loaded, status verified | TC-001, TC-002 | [002](../1.sections/section-002-installation/content.md), [004](../1.sections/section-004-skills-overview/content.md) |
| Knowledge Base Discovery | Can search blueprints, list plugins, get node type details | TC-003 | [013](../1.sections/section-013-bpa-cli-commands/content.md), [006](../1.sections/section-006-supported-blueprints/content.md) |
| Local Validation | Blueprint passes lint and schema validation | TC-004, TC-007 | [013](../1.sections/section-013-bpa-cli-commands/content.md), [010](../1.sections/section-010-blueprint-anatomy/content.md) |
| AI-Assisted Authoring | Generated blueprint is valid and deployable | TC-005, TC-006 | [007](../1.sections/section-007-building-blueprints/content.md), [018](../1.sections/section-018-spec-considerations/content.md) |
| Deployment (if applicable) | Blueprint uploaded, deployment created, install executed | TC-009, TC-010, TC-011, TC-012 | [003](../1.sections/section-003-orchestration-service-auth/content.md), [008](../1.sections/section-008-blueprint-monitoring/content.md) |
| Visualization | HTML topology diagram generated with risk analysis | TC-008, TC-015 | [021](../1.sections/section-021-blueprint-visualizer/content.md), [009](../1.sections/section-009-blueprint-reasoning/content.md) |
| Update & Cleanup | Deployment update performed, resources cleaned up | TC-016, TC-017, TC-018 | [013](../1.sections/section-013-bpa-cli-commands/content.md) |
| Learner Assessment | Confidence ratings recorded, progress tracked, feedback submitted | TC-019, TC-020, TC-021 | [LEARNER-ASSESSMENT](LEARNER-ASSESSMENT.md) |

---

## 9. Troubleshooting Quick Reference

| Issue | Fix | Test Case Reference | Reference Learning |
| ------- | ----- | --------------------- | -------------------- |
| `command not found: dap-bpa` | Open new terminal after install | TC-001 | [002 - Installation](../1.sections/section-002-installation/content.md) |
| Agent doesn't mention blueprints | Re-run `dap-bpa setup-ide <ide>` and restart IDE | TC-002 | [002 - Installation](../1.sections/section-002-installation/content.md), [004 - Skills Overview](../1.sections/section-004-skills-overview/content.md) |
| `401` or `403` from orchestrator | Re-run `dap-bpa setup`, check credentials | TC-009 | [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md) |
| SSL certificate error | Add `--trust-all` flag (dev only) | TC-009 | [003 - Orchestration & Auth](../1.sections/section-003-orchestration-service-auth/content.md), [016 - Tunnel Connections](../1.sections/section-016-tunnel-connections/content.md) |
| Lint returns findings | Expected - read as learning exercise | TC-004, TC-007 | [013 - CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md) |
| Blueprint validation fails | Check node type references, plugin imports, input definitions | TC-007 | [007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md), [010 - Blueprint Anatomy](../1.sections/section-010-blueprint-anatomy/content.md) |

---

## 10. Sign-Off

| Role | Name | Signature | Date |
| ------ | ------ | ----------- | ------ |
| Partner Tester | | | |
| Dell Support | | | |
| Test Manager | | | |

---

## 11. Appendix

### 11.1 Resources

- **Blueprint Assist Training Repo:** [github.com/tme-tech-ops/blueprint-assist-training](https://github.com/tme-tech-ops/blueprint-assist-training)
- **Training sections index:** [index.md](../index.md)
- **Dell Automation Studio Catalog:** [automation.dell.com/catalog](https://automation.dell.com/catalog)
- **[Section 013 - BPA CLI Commands](../1.sections/section-013-bpa-cli-commands/content.md):** Complete CLI command reference
- **[Section 007 - Building Blueprints](../1.sections/section-007-building-blueprints/content.md):** Authoring blueprints with BPA
- **[Section 009 - Blueprint Reasoning](../1.sections/section-009-blueprint-reasoning/content.md):** Blueprint reasoning and analysis
- **[Section 020 - Studio Catalog](../1.sections/section-020-dell-automation-studio-catalog/content.md):** Browse the Dell Automation Studio catalog
- **For sellers/account teams:** [Section 015 - Studio Offer Details](../1.sections/section-015-studio-offer-details/content.md) and [Section 022 - Licensing Model](../1.sections/section-022-licensing-model/content.md)

### 11.2 Next Steps for Partners

1. Practice with real infrastructure - adapt test blueprint to customer requirements (see [Section 012 - Hands-On Workshop](../1.sections/section-012-hands-on-workshop/content.md))
2. Explore the Dell Automation Studio Catalog - browse production-ready blueprints (see [Section 020 - Studio Catalog](../1.sections/section-020-dell-automation-studio-catalog/content.md))
3. Review full training - complete the remaining sections in the [blueprint-assist-training](../index.md) repo
4. Integrate with CI/CD - use dap-bpa in pipelines for automated validation and deployment
5. Engage with Dell - provide feedback and request additional plugin documentation
