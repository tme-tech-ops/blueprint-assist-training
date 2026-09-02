# Two-Day Blueprint Assist Training Agenda

## Pre-Read & Preparation (Recommended)

### Before the Training

To get the most out of this two-day training, we recommend completing the following pre-reading and preparation activities. This will ensure you have the foundational knowledge and environment ready for hands-on exercises.

### Essential Pre-Read (40-60 minutes)

#### 1. Quick Start Overview

- **[Section 000: Quick Start](../1.sections/section-000-quick-start/content.md)** (15 minutes)
  - Read the "How dap-bpa Works" section for the mental model
  - Review the "Mental Model" diagram at the end
  - Understand the two-part architecture: CLI + AI Skills
  - This provides the foundation for the entire training

#### 2. Introduction & Value Proposition

- **[Section 001: Introduction](../1.sections/section-001-introduction/content.md)** (15 minutes)
  - Read "What is Blueprint Assist?" and "Why Blueprint Assist Matters"
  - Review the "Architecture Overview" section
  - Understand the business case and key value propositions
  - This gives you the business context and technical grounding

#### 3. Installation Prerequisites

- **[Section 002: Installation](../1.sections/section-002-installation/content.md)** (10-15 minutes)
  - Review the prerequisites section
  - Choose your installation method (Windows installer, PowerShell script, or Linux/macOS)
  - Complete the installation before the training if possible
  - This ensures your environment is ready for hands-on exercises

#### 4. Spec-Design-First: Specification Considerations

- **[Section 018: Specification Considerations](../1.sections/section-018-spec-considerations/content.md)** (10-15 minutes)
  - Review "Why Specifications Matter" and the Spec-Driven Development (SDD) approach
  - Understand why specifications should precede blueprint implementation
  - This grounds the spec-first mindset used throughout the hands-on modules

### Optional Pre-Read (Additional 30 minutes)

#### 5. Skills Architecture Preview

- **[Section 004: Skills Overview](../1.sections/section-004-skills-overview/content.md)** (15 minutes)
  - Review "The Skill Catalog" section
  - Understand the four core skills: `dap`, `dap-scripts`, `dap-deployment-update`, `dap-service-composition`
  - This preview will help you follow Module 3 more easily

#### 6. CLI Commands Preview

- **[Section 013: CLI Command Reference](../1.sections/section-013-bpa-cli-commands/content.md)** (15 minutes)
  - Read "How to Use This Reference" and "Quick Start: End-to-End Blueprint Workflow"
  - Review the command groups overview
  - This gives you a mental map of the CLI before Module 4

### Pre-Training Setup Checklist

Complete these items before the training session:

- [ ] **Review Essential Pre-Read**: Sections 000, 001, 002, and 018 (minimum requirement)
- [ ] **Prepare Natural Language Use Case**: Bring a natural language description of a use case you'd like to automate with Blueprint Assist (ideally aligned with a catalog offer from **[Section 020](../1.sections/section-020-dell-automation-studio-catalog/content.md)**)

### What to Expect

**Training Format:**

- **Interactive**: Mix of conceptual learning and hands-on exercises
- **Tool-Focused**: Learn when and how to use each tool in the ecosystem
- **Practical**: Real examples from the sample blueprints and catalog
- **Progressive**: Builds from fundamentals to advanced workflows

**Key Learning Outcomes:**

- Tool selection: Know which tool to use for which task
- Spec-design-first: Understand why specifications precede blueprint implementation ([Section 018](../1.sections/section-018-spec-considerations/content.md))
- Specification-driven development: Understand the spec-to-blueprint workflow
- Skills architecture: Leverage AI skills effectively
- CLI proficiency: Master essential commands for blueprint lifecycle
- Catalog awareness: Navigate production-ready offerings

**Bring to Training:**

- Laptop with administrative access
- Power charger and any necessary adapters
- Natural language use case description (ideally aligned with a Section 020 catalog offer)
- Questions about your specific use cases
- Any existing blueprints or specifications you'd like to discuss

### Questions Before Training?

If you have questions about the pre-read material or setup issues, contact the training team or review the troubleshooting sections in:

- **[Section 000: Quick Troubleshooting](../1.sections/section-000-quick-start/content.md#quick-troubleshooting)**
- **[Section 013: Troubleshooting the CLI](../1.sections/section-013-bpa-cli-commands/content.md#troubleshooting-the-cli)**

---

## Training Overview

**Duration**: Two Days (approximately 6 hours of content per day, plus breaks)
**Target Audience**: IT Operators, Architects, DevOps Engineers, and sellers/account teams (Day 2 licensing module)
**Prerequisites**:

- Complete the **[Pre-Read & Preparation](#pre-read--preparation-recommended)** section above (40-60 minutes essential, 70-90 minutes with optional)
- Basic understanding of infrastructure concepts
- Terminal/command line access
- Administrative access to install software
- (Optional) DAP orchestrator credentials for live exercises

**Training Goals**:

- Understand the Dell Automation Platform (DAP) value story and where Dell Private Cloud (DPC) and Dell Distributed Private Cloud (DDPC) fit
- Master the fundamentals of Blueprint Assist tools and when to use them
- Understand specification-driven development for blueprints
- Learn skills architecture and blueprint fundamentals
- Gain proficiency with BPA CLI commands
- Practice with sample blueprints from the examples directory
- Explore Dell Automation Studio catalog for production-ready offerings
- Understand the commercial model: DAP (free) vs. Studio (paid), MRUs, and deployment credits

### Two-Day Schedule at a Glance

**Day 1 - Foundations & Concepts (9:00 AM - 3:30 PM)**

| Time | Activity |
| ---- | -------- |
| 9:00 - 9:30 | Day 1 Opening: environment setup & training overview |
| 9:30 - 10:30 | Module 0: Dell Automation Platform Value Level-Set |
| 10:30 - 10:45 | Mid-Morning Break (15 min) |
| 10:45 - 12:15 | Module 1: Tool Fundamentals & Mental Model |
| 12:15 - 1:15 | Lunch Break (1 hour) |
| 1:15 - 2:45 | Module 2: Specification Fundamentals |
| 2:45 - 3:00 | Mid-Afternoon Break (15 min) |
| 3:00 - 3:30 | Day 1 Wrap-Up & Day 2 Preview |

**Day 2 - Skills, CLI, Hands-On & Commercials (9:00 AM - 4:15 PM)**

| Time | Activity |
| ---- | -------- |
| 9:00 - 9:15 | Day 2 Kickoff & Recap |
| 9:15 - 10:45 | Module 3: Skills & Blueprint Fundamentals |
| 10:45 - 11:00 | Mid-Morning Break (15 min) |
| 11:00 - 12:00 | Module 4: BPA CLI Commands Mastery |
| 12:00 - 1:00 | Lunch Break (1 hour) |
| 1:00 - 2:30 | Module 5: Sample Blueprints Hands-On |
| 2:30 - 2:45 | Mid-Afternoon Break (15 min) |
| 2:45 - 3:45 | Module 6: Licensing & Packaging |
| 3:45 - 4:15 | Training Wrap-Up, Evaluation & Next Steps |

---

## Day 1 - Foundations & Concepts (9:00 AM - 3:30 PM)

### Day 1 Opening (9:00 AM - 9:30 AM)

**9:00 - 9:15: Environment Setup & Configuration**

- **Bring your own environment**: trainees may use their own laptop and any supported IDE/agent - dap-bpa is agent-agnostic. Dell supplies the latest dap-bpa build; there is no need to pre-install a specific IDE.
- **Installation & Setup**:
  - Install AI IDE: Windsurf (recommended), Claude Code, Cursor, JetBrains, VS Code, Antigravity, Cline, or Devin CLI - whichever you prefer
  - Install dap-bpa (if not completed) from the latest build Dell provides: Follow **[Section 002](../1.sections/section-002-installation/content.md)**
  - Load dap-bpa Skills: Run `dap-bpa setup-ide <your-ide>`
  - Verify Installation: Run `dap-bpa status` to confirm setup
- **Repository Access**:
  - Clone/access training repository
  - Browse `1.sections/` and `4.examples/` directories
- **Orchestrator Setup** (optional):
  - If you have DAP credentials: Run `dap-bpa setup`
  - Verify orchestrator connectivity
- **Internet Connectivity**: Ensure access for AI IDE, catalog browsing, and orchestrator (if applicable)

**9:15 - 9:30: Introduction & Training Overview**

- Training goals and two-day structure
- Participant backgrounds and use cases
- Review pre-read key takeaways
- Quick setup verification

---

### Module 0: Dell Automation Platform Value Level-Set (9:30 AM - 10:30 AM)

> **New for the two-day format.** A concept-only level-set that grounds everyone in the "why" before the hands-on tooling. No dap-bpa commands required.

#### Module 0 Learning Objectives

- Articulate the Dell Automation Platform (DAP) value proposition in business terms
- Explain where Dell Private Cloud (DPC) and Dell Distributed Private Cloud (DDPC) fit in the story
- Connect the platform, curated outcomes, and the Studio catalog into a single narrative

#### Module 0 Agenda

**9:30 - 9:50: The Dell Automation Platform Value Story**

- **[Section 001](../1.sections/section-001-introduction/content.md)**: Introduction & value proposition
  - The problem: manual provisioning is slow, inconsistent, and risky
  - The DAP answer: declarative, reusable blueprints with lifecycle automation
  - The business case: speed, consistency, governance, and self-service
- **Terminology grounding**: Dell Automation Platform (the orchestrator), Dell Automation Studio (the paid offer), and how they relate

**9:50 - 10:15: How DPC and DDPC Fit the Story**

- **[Section 020](../1.sections/section-020-dell-automation-studio-catalog/content.md)**: Curated outcomes overview
  - **Dell Private Cloud (DPC)**: cloud-like agility on-premises - compute, storage, networking, and management pre-configured
  - **Dell Distributed Private Cloud (DDPC)**: deploy, automate, and manage edge devices and applications securely at scale
  - **Dell AI Solutions**: validated AI infrastructure and application blueprints
- **The outcome-first narrative**: customers buy an outcome (DPC / DDPC / AI); DAP is the no-cost orchestration layer that delivers it
- **Where Blueprint Assist enters**: extending beyond validated outcomes into custom, customer-defined blueprints

**10:15 - 10:30: From Outcomes to Custom Automation**

- The bridge from validated Dell outcomes to build-your-own automation (previews the Day 2 licensing module)
- Group discussion: which outcome (DPC, DDPC, AI, or custom) maps to each participant's use case

#### Hands-On Exercise 0: Value Framing

- In pairs, each participant frames their brought-along use case as a business outcome and identifies whether it aligns with DPC, DDPC, AI, or a custom blueprint
- Quick share-out to surface the range of use cases in the room

---

**10:30 - 10:45: Mid-Morning Break (15 minutes)**

---

### Module 1: Tool Fundamentals & Mental Model (10:45 AM - 12:15 PM)

#### Module Learning Objectives

- Understand the Blueprint Assist ecosystem and tool landscape
- Learn when to use CLI vs. IDE skills vs. manual approaches
- Establish the mental model for spec-driven development

#### Module Agenda

**10:45 - 11:15: The Blueprint Assist Ecosystem**

- **[Section 001](../1.sections/section-001-introduction/content.md)**: Introduction to Blueprint Assist
  - What is Blueprint Assist? (CLI + AI skills)
  - The business case for automation
  - Architecture overview
- **Tool Landscape Overview**:
  - `dap-bpa` CLI: Local validation, orchestrator operations, lifecycle testing
  - AI Skills (IDE integration): Blueprint authoring, reasoning, debugging
  - Knowledge Base: Plugin documentation, example blueprints
  - DAP Orchestrator: Deployment execution and management

**11:15 - 11:45: When to Use Which Tool**

- **Decision Framework**:
  - Use CLI for: Validation, deployment, monitoring, bulk operations
  - Use AI Skills for: Blueprint authoring, analysis, troubleshooting
  - Use Knowledge Base for: Research, pattern discovery, documentation lookup
  - Use Orchestrator UI for: Manual operations, visual monitoring
- **Tool Selection Matrix**:

| Task | Primary Tool | Secondary Tool |
| ---- | ------------ | -------------- |
| Create new blueprint | AI Skills (@dap) | Knowledge Base |
| Validate blueprint | CLI (lint) | AI Skills (review) |
| Deploy to orchestrator | CLI (orchestrator) | AI Skills (guidance) |
| Monitor execution | CLI (monitor/events) | Orchestrator UI |
| Troubleshoot issues | AI Skills (reasoning) | CLI (events) |
| Research patterns | Knowledge Base | AI Skills |
| Enforce conventions | CLI (knowledge patterns) | `my-dap-patterns` skill |

**11:45 - 12:00: Mental Model & Workflow**

- The spec-driven development mental model
- How tools fit together in the workflow
- Q&A and setup verification

**12:00 - 12:15: Hands-On Exercise 1 - Tool Selection**

- Given 5 scenario cards, participants identify the right tool(s) for each
- Group discussion on tool selection rationale

---

## Lunch Break (12:15 PM - 1:15 PM)

---

### Module 2: Specification Fundamentals (1:15 PM - 2:45 PM)

#### Module 2 Learning Objectives

- Understand the importance of specifications in blueprint development
- Learn the spec-driven development (SDD) methodology
- Practice creating and reviewing specifications

#### Module 2 Agenda

**1:15 - 1:35: Why Specifications Matter**

- **[Section 018](../1.sections/section-018-spec-considerations/content.md)**: Specification Considerations
  - The Spec-Driven Development (SDD) approach
  - Benefits of proper specification
  - Specification as single source of truth
  - Traceability from spec to implementation

**1:35 - 2:05: Specification Structure & Components**

- **Specification Components**:
  - `spec.md`: Business requirements, functional/non-functional requirements
  - `plan.md`: Implementation plan, technical context, architecture decisions
  - `research.md`: Engineering research, technology analysis
  - `data-model.md`: Data model specifications, schema definitions
  - `quickstart.md`: Quick start guide for rapid implementation
- **Constitution Compliance**:
  - Platform alignment principles
  - Declarative infrastructure-as-code standards
  - Security requirements
  - Code quality standards

**2:05 - 2:25: Specification Workflow**

- **Phase 1: Business Requirements**
  - Define business objectives and success criteria
  - Document functional and non-functional requirements
  - Establish constraints and dependencies
- **Phase 2: Engineering Requirements**
  - Technical feasibility analysis
  - Technology selection and plugin choices
  - Architecture and data model design
- **Phase 3: Implementation Planning**
  - Task breakdown and estimation
  - Testing strategy definition
  - Deployment approach planning

**2:25 - 2:45: Specification Best Practices & Feedback Loop**

- Clear and concise requirements (SMART criteria)
- Comprehensive technical context
- Modular design principles
- Risk assessment strategies
- Validation strategy definition
- **Feedback Loop Overview**: Introduction to the SDD cycle
  - Specification → Build with BPA → Deploy → Test → Learn → Update Spec
  - **[Section 014](../1.sections/section-014-diagrams/content.md)**: Feedback loop diagram
  - **[Demo 20](../4.examples/recorded-demos/recorded-demos.md#demo-20-reverse-engineering-deployed-blueprints-closing-the-feedback-loop)**: Complete workflow demonstration

#### Hands-On Exercise 2: Specification Review

- Review the sample specification: **[4.examples/sample-specs/001-spec-plan-blueprint/](../4.examples/sample-specs/001-spec-plan-blueprint/)**
- Identify key components and their purposes
- Group discussion on specification quality

---

**2:45 - 3:00: Mid-Afternoon Break (15 minutes)**

---

### Day 1 Wrap-Up & Day 2 Preview (3:00 PM - 3:30 PM)

- Recap of the value story (Module 0), the tool landscape (Module 1), and spec-driven development (Module 2)
- Open Q&A on Day 1 concepts
- Preview of Day 2: skills, CLI mastery, hands-on blueprints, and the licensing/packaging module
- Reminder to have the natural-language use case ready for Day 2 hands-on exercises

---

## Day 2 - Skills, CLI, Hands-On & Commercials (9:00 AM - 4:15 PM)

### Day 2 Kickoff & Recap (9:00 AM - 9:15 AM)

- Welcome back and quick recap of Day 1 takeaways
- Re-verify environment (`dap-bpa status`) and resolve any lingering setup issues
- Roadmap for Day 2 modules

---

### Module 3: Skills & Blueprint Fundamentals (9:15 AM - 10:45 AM)

#### Module 3 Learning Objectives

- Understand the skills-based architecture
- Learn blueprint fundamentals and TOSCA concepts
- Master the four core dap-bpa skills

#### Module 3 Agenda

**9:15 - 9:35: Skills Architecture Overview**

- **[Section 004](../1.sections/section-004-skills-overview/content.md)**: Blueprint Assist Skills Overview
  - The four core skills: `dap`, `dap-scripts`, `dap-deployment-update`, `dap-service-composition`
  - Skill naming convention (dap-* prefix)
  - How skills activate from natural language
  - Skills vs. plugin knowledge distinction

**9:35 - 9:55: Core Skills Deep Dive**

- **`dap` Skill**:
  - Blueprint authoring, linting, debugging
  - Node type lookup and plugin knowledge
  - Deployment, secrets, and monitoring guidance
- **`dap-scripts` Skill**:
  - Python script writing for DAP blueprints
  - Context objects and runtime properties
  - Error handling patterns
- **`dap-deployment-update` Skill**:
  - Blueprint version bumps and input changes
  - skip_install/uninstall/reinstall control
  - Drift detection and update workflows
- **`dap-service-composition` Skill**:
  - ServiceComponent sub-deployments
  - SharedResource patterns
  - Blueprint chaining

**9:55 - 10:15: Blueprint Fundamentals**

- **[Section 010](../1.sections/section-010-blueprint-anatomy/content.md)**: Blueprint Anatomy
  - TOSCA basics and DSL version compliance
  - Multi-file structure requirements
  - Node templates and relationships
  - Inputs, constraints, and capabilities
  - Lifecycle operations (create, configure, start, stop, delete)

**10:15 - 10:35: Knowledge Base & Plugin System**

- **Plugin Categories**:
  - Cloud: vSphere, AWS, Azure, GCP, OpenStack
  - Container/Orchestration: Helm, Kubernetes, Docker, Terraform
  - Automation: Ansible, Fabric SSH
  - Infrastructure: Libvirt, Redfish, Storage, Utilities
- **Knowledge Base Commands**:
  - `dap-bpa knowledge plugins list <plugin>`
  - `dap-bpa knowledge plugins get <plugin> <node_type>`
  - `dap-bpa knowledge blueprints find "<query>"`

**10:35 - 10:45: Skill Activation & Usage**

- Natural language triggers for each skill
- When multiple skills inform a single task
- Best practices for skill usage

#### Hands-On Exercise 3: Skill Exploration

- Query for the list in natural language: `show me all the dap-bpa plugins you have available`
- Use `dap-bpa knowledge plugins list <plugin>` to explore available plugins
- Practice natural language prompts to trigger different skills
- Group exercise: Identify which skills would activate for given scenarios

---

**10:45 - 11:00: Mid-Morning Break (15 minutes)**

---

### Module 4: BPA CLI Commands Mastery (11:00 AM - 12:00 PM)

#### Module 4 Learning Objectives

- Master essential BPA CLI commands
- Understand command groups and workflows
- Learn troubleshooting techniques

#### Module 4 Agenda

**11:00 - 11:15: CLI Overview & Quick Start**

- **[Section 013](../1.sections/section-013-bpa-cli-commands/content.md)**: CLI Command Reference
  - Command structure and global flags
  - Help system (`--help` discovery)
  - Output formats and filtering
- **End-to-End Workflow**:

  ```bash
  # Find example → Lint → Upload → Deploy → Execute
  dap-bpa knowledge blueprints find "kubernetes"
  dap-bpa blueprint lint --file blueprint.yaml --verify
  dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-bp --revision 1.0.0
  dap-bpa orchestrator deployments create --blueprint-id my-bp --inputs inputs.json
  dap-bpa orchestrator executions start --deployment-id &lt;id&gt; --workflow-id install
  ```

**11:15 - 11:30: Authentication & Setup Commands**

- `dap-bpa setup`: Interactive configuration wizard
- `dap-bpa setup-ide &lt;ide&gt;`: Install skills into IDE
- `dap-bpa status`: Verify setup and connection
- `dap-bpa upgrade`: Update CLI binary

**11:30 - 11:40: Blueprint Authoring Commands**

- `dap-bpa blueprint lint --file &lt;path&gt;`: Lint blueprint YAML
- `dap-bpa blueprint validate-all --file &lt;path&gt;`: Validate node templates

**11:40 - 11:50: Knowledge Base Commands**

- Blueprint discovery: `find`, `get`, `add`
- Plugin documentation: `list`, `get`, `docs`
- Documentation search: `docs search`, `docs find`
- Secret types: `secret-type list`, `secret-type get`
- Wiki knowledge base: `wiki search`, `wiki read`, `wiki categories` (v0.29.3)
- Customer patterns: `knowledge patterns learn`, `validate`, `status`, `export/import` (v0.29.3) - see **[Section 023](../1.sections/section-023-customer-patterns/content.md)**

**11:50 - 12:00: Orchestrator Commands**

- Blueprint management: `upload`, `get`, `list`, `delete`
- Deployment management: `create`, `get`, `list`, `update`
- Execution management: `start`, `get`, `list`
- Event streaming: `events list`, `events get`

#### Hands-On Exercise 4: CLI Command Practice

- Practice essential CLI commands in a safe environment
- Use `--help` to explore command options
- Troubleshooting exercise: Fix common CLI issues

---

## Lunch Break (12:00 PM - 1:00 PM)

---

### Module 5: Sample Blueprints Hands-On (1:00 PM - 2:30 PM)

#### Module 5 Learning Objectives

- Work with real sample blueprints from the examples directory
- Practice blueprint analysis and modification
- End-to-end workflow execution

#### Module 5 Agenda

**1:00 - 1:15: Sample Blueprints Overview**

- **[Section 4 Examples](../4.examples/README.md)**: Sample Blueprints Directory
  - `bare-metal/`: iDRAC infrastructure and OS deployment
  - `data-center/`: PowerStore storage and Redfish provisioning
  - `kubernetes-on-bare-metal/`: K8s on bare-metal hosts
  - `simple-os-ubuntu-bare-metal/`: Minimal Ubuntu deployment
- **[Capability Examples](../4.examples/capability-examples/README.md)**:
  - Authoring examples (create, validate, generate inputs)
  - Review examples (linting, best practices)
  - Deployment examples (pre-flight checks, execution)
  - Maintenance examples (drift detection)

**1:15 - 1:30: Dell Automation Studio Catalog Review**

- **[Section 020](../1.sections/section-020-dell-automation-studio-catalog/content.md)**: Dell Automation Studio Catalog
  - **Catalog Overview**: 46 total offers across 8 technology categories
  - **Offer Types**: Studio (customer-built), Dell Validated, ISV Validated, Staging/Test
  - **Curated Offers**:
    - Dell Private Cloud (private cloud infrastructure)
    - Dell Distributed Private Cloud (edge device management)
    - Dell AI Solutions (AI/ML workloads)
  - **Technology Categories**:
    - Compute (10 offers): bare metal, Kubernetes, AI workloads
    - Platform Services (15 offers): IaaS, container orchestration, edge ISV
    - DevOps & CI/CD (7 offers): pipelines, IaC, DevOps tooling
    - Security & Compliance (4 offers): secrets, cybersecurity, compliance
    - Observability & Monitoring (4 offers): metrics, visualization, monitoring
    - Databases (2 offers), Storage (2 offers), Web & Search (2 offers)
  - **Industry Blueprints**: Manufacturing, Retail, Energy, Smart Cities, Federal, Healthcare, Computer Vision, Financial Services
  - **Catalog Access**: <https://automation.dell.com/catalog>
  - **Usage Workflow**: Download → Customize with BPA → Deploy

**1:30 - 1:50: Exercise 1: Blueprint Discovery & Analysis**

- **[Section 012 Exercise 1](../1.sections/section-012-hands-on-workshop/content.md#exercise-1-blueprint-discovery-and-analysis)**: Blueprint Discovery

  ```bash
  # Search for relevant blueprints
  dap-bpa knowledge blueprints find "ubuntu bare-metal"
  dap-bpa knowledge blueprints find "kubernetes"

  # Retrieve and analyze
  dap-bpa knowledge blueprints get simple-os-ubuntu-bare-metal --include-files

  # Study plugin documentation
  dap-bpa knowledge plugins list vsphere
  dap-bpa knowledge plugins get vsphere dell.nodes.vsphere.Server
  ```

**1:50 - 2:10: Exercise 2: Blueprint Validation & Linting**

- **[Section 012 Exercise 3](../1.sections/section-012-hands-on-workshop/content.md#exercise-3-blueprint-validation)**: Blueprint Validation

  ```bash
  # Lint a blueprint downloaded from https://automation.dell.com/catalog
  dap-bpa blueprint lint --file path/to/your/blueprint.yaml --verify

  # Schema validation (v0.29.3)
  dap-bpa blueprint lint --file path/to/your/blueprint.yaml --schema

  # Validate node templates (offline, uses local plugin registry)
  dap-bpa blueprint validate-all --file path/to/your/blueprint.yaml

  # Pattern validation (if patterns have been learned) - see Section 023
  dap-bpa knowledge patterns validate path/to/your/blueprint.yaml

  # Review and fix any findings
  ```

**2:10 - 2:30: Exercise 3: Catalog Blueprint Exploration (Time Permitting)**

- Explore Dell Automation Studio catalog offers relevant to participant industries
- Compare catalog blueprints vs. local sample blueprints
- Discuss customization workflow for catalog offers
- Group exercise: Select a catalog offer and outline customization approach

#### Hands-On Exercise 5: End-to-End Workflow

- Select a sample blueprint from the examples directory
- Complete the full workflow: analyze → lint → validate → modify → re-validate
- Explore relevant catalog offers and compare with local samples
- Group presentation of findings and catalog exploration results

---

**2:30 - 2:45: Mid-Afternoon Break (15 minutes)**

---

### Module 6: Licensing & Packaging (2:45 PM - 3:45 PM)

> **Audience: everyone, especially sellers and account teams.** A commercial reference that closes the loop from the Day 1 value story to how the platform is actually licensed and packaged. Primary source is **[Section 022: Licensing Model](../1.sections/section-022-licensing-model/content.md)**, with offer/packaging context in **[Section 015](../1.sections/section-015-studio-offer-details/content.md)**. No dap-bpa tooling required.

#### Module 6 Learning Objectives

- Distinguish Dell Automation Platform (free) from Dell Automation Studio (paid)
- Explain the Managed Resource Unit (MRU) model and deployment credits
- Map customer scenarios to a licensing estimate

#### Module 6 Agenda

**2:45 - 3:05: Platform (Free) vs. Studio (Paid)**

- **[Section 022](../1.sections/section-022-licensing-model/content.md)**: Licensing Model (primary reference)
- **[Section 015](../1.sections/section-015-studio-offer-details/content.md)**: Dell Automation Studio Offer Details (offer/packaging context)
  - **Dell Automation Platform (Free)**: the no-cost orchestration layer you get with outcomes like DPC/DDPC; deploys validated Dell blueprints (DPC, AI, DDPC)
  - **Dell Automation Studio (Paid)**: build-your-own automation - full Blueprint Assist CLI, skills, custom integrations, and deployment of custom blueprints
  - **Key rule**: Blueprint Assist tooling is gated behind the DAP catalog (requires a DAP customer account to download); *deploying* custom blueprints additionally requires a Studio license
- Clean customer messaging (from Section 022) to reuse in the field

**3:05 - 3:25: MRUs & Deployment Credits**

- **[Section 022](../1.sections/section-022-licensing-model/content.md)**: the commercial mechanics
  - **Managed Resource Units (MRUs)**: 1 MRU = 1 physical managed asset (server, storage cluster, switch, GPU node)
  - **Deployment Credits**: every MRU includes 30 credits for customer-defined blueprints
    - Credits are consumed only on a **successful** deployment of a **customer-defined** blueprint
    - Validated Dell outcomes (DPC, AI, DDPC) do **not** consume credits
  - Key differentiators table (Platform vs. Studio): cost, blueprint types, custom deployment, BPA access, credits

**3:25 - 3:45: Licensing Scenarios & Discussion**

- Worked examples from Section 022:
  - Small environment: 10 servers + 2 storage clusters = 12 MRUs → 360 credits
  - Large enterprise: 100 servers + 10 storage clusters + 20 switches = 130 MRUs → 3,900 credits
- Connect back to the outcomes framed in Module 0 (DPC / DDPC / AI / custom)

#### Hands-On Exercise 6: Licensing Estimate

- In pairs, participants sketch the MRU count and deployment-credit budget for their own (or a sample) environment
- Discuss which workloads would run as validated outcomes vs. custom blueprints, and the licensing implications

---

### Training Wrap-Up, Evaluation & Next Steps (3:45 PM - 4:15 PM)

- Recap of the full two-day arc: value story → tooling → specs → skills → CLI → hands-on → commercials
- Knowledge checks and practical assessment (see **[Training Evaluation](#training-evaluation)**)
- Post-training next steps and resources (see **[Post-Training Next Steps](#post-training-next-steps)**)
- Feedback collection and open Q&A

---

## Training Materials & Resources

### Required Materials

- Training repository: `blueprint-assist-training`
- Your own laptop with administrative access - bring your preferred supported IDE/agent (Windsurf, Claude Code, Cursor, JetBrains, VS Code, Antigravity, Cline, or Devin CLI); dap-bpa is agent-agnostic
- dap-bpa CLI - the latest build is supplied by Dell (install per **[Section 002](../1.sections/section-002-installation/content.md)**)
- Internet connection (for AI IDE, orchestrator access, and catalog browsing)
- Dell Automation Studio catalog access: <https://automation.dell.com/catalog>

### Reference Documentation

- **[Section 000](../1.sections/section-000-quick-start/content.md)**: Quick Start Guide
- **[Section 001](../1.sections/section-001-introduction/content.md)**: Introduction to Blueprint Assist
- **[Section 004](../1.sections/section-004-skills-overview/content.md)**: Skills Overview
- **[Section 010](../1.sections/section-010-blueprint-anatomy/content.md)**: Blueprint Anatomy
- **[Section 012](../1.sections/section-012-hands-on-workshop/content.md)**: Hands-On Workshop
- **[Section 013](../1.sections/section-013-bpa-cli-commands/content.md)**: CLI Command Reference
- **[Section 015](../1.sections/section-015-studio-offer-details/content.md)**: Dell Automation Studio Offer Details (offer & packaging)
- **[Section 018](../1.sections/section-018-spec-considerations/content.md)**: Specification Considerations
- **[Section 020](../1.sections/section-020-dell-automation-studio-catalog/content.md)**: Dell Automation Studio Catalog
- **[Section 022](../1.sections/section-022-licensing-model/content.md)**: Licensing Model (MRUs, deployment credits, scenarios)
- **[Section 023](../1.sections/section-023-customer-patterns/content.md)**: Customer Pattern Learning (convention extraction, review, validation, team sharing)

### Sample Blueprints

All sample blueprints are available at the [Dell Automation Studio Catalog](https://automation.dell.com/catalog).

### Sample Specifications

- **[001-spec-plan-blueprint](../4.examples/sample-specs/001-spec-plan-blueprint/)**

### Dell Automation Studio Catalog

- **[Catalog Portal](https://automation.dell.com/catalog)**: 46 production-ready offers
- **[Catalog Documentation](../1.sections/section-020-dell-automation-studio-catalog/content.md)**: Full catalog reference

---

## Post-Training Next Steps

### Immediate Actions

1. **Practice with Sample Blueprints**: Work through additional examples in the **[4.examples/](../4.examples/)** directory
2. **Explore Dell Automation Studio Catalog**: Browse production-ready offers at <https://automation.dell.com/catalog>
3. **Create Your Own Specification**: Use the spec-kit framework to specify a real blueprint
4. **Explore Advanced Skills**: Deep dive into `dap-scripts` and `dap-service-composition`

### Intermediate Goals

1. **Build a Custom Blueprint**: Use AI skills to create a blueprint for your infrastructure
2. **Customize Catalog Offers**: Adapt Dell Automation Studio catalog blueprints to your requirements
3. **Integrate with CI/CD**: Incorporate dap-bpa commands into deployment pipelines
4. **Contribute to Knowledge Base**: Add organization-specific examples

### Advanced Topics

1. **Monitor Agent Integration**: Set up automated lifecycle testing
2. **Service Composition**: Design complex multi-service deployments
3. **Custom Skill Development**: Create organization-specific skills
4. **Customer Pattern Learning**: Extract team conventions, enforce in CI - see **[Section 023](../1.sections/section-023-customer-patterns/content.md)** and **[Demo 21](../4.examples/recorded-demos/recorded-demos.md#demo-21-customer-pattern-learning)**
5. **MCP Server Integration**: Programmatic blueprint operations via the Agent MCP Server - see **[Demo 19](../4.examples/recorded-demos/recorded-demos.md#demo-19-blueprint-assist-mcp-server-integration)**

---

## Training Evaluation

### Knowledge Checks

- **Module 0**: Value framing - mapping a use case to DPC, DDPC, AI, or custom
- **Module 1**: Tool selection scenarios
- **Module 2**: Specification quality review
- **Module 3**: Skill identification exercise
- **Module 4**: CLI command matching
- **Module 5**: Blueprint analysis and modification
- **Module 6**: Licensing estimate - MRU count and deployment credits

### Practical Assessment

- End-to-end workflow execution
- Blueprint validation and troubleshooting
- Specification creation exercise

### Feedback Collection

- Training effectiveness survey
- Tool usefulness rating
- Suggested improvements for future sessions

---

## Trainer Notes

### Setup Checklist

- [ ] Provide participants the latest dap-bpa build ahead of Day 1 (dap-bpa is agent-agnostic - trainees bring their own laptop and preferred supported IDE/agent)
- [ ] Verify all participants have dap-bpa installed (ideally before Day 1; re-check at Day 2 kickoff)
- [ ] Confirm IDE skills are loaded (`dap-bpa setup-ide <ide>`)
- [ ] Test orchestrator connectivity (if applicable)
- [ ] Prepare sample blueprint files for exercises
- [ ] Set up breakout groups for collaborative exercises
- [ ] Confirm room booking and catering for two days, including breaks and lunch
- [ ] (Day 2) Invite sellers/account teams for the Module 6 licensing session if relevant

### Time Management Tips

- **Two-day pacing**: Day 1 is concept-heavy (value, tools, specs); Day 2 is hands-on plus commercials. Protect the breaks - two 15-minute breaks and a 1-hour lunch each day keep energy up.
- Module 0: Keep the value level-set conversational; it sets up both the hands-on work and the Day 2 licensing module
- Module 1: Keep tool selection exercise brief (15 min)
- Module 2: Focus on specification structure over deep dives
- Module 3: Emphasize skill activation over technical details
- Module 4: Prioritize essential commands over comprehensive coverage
- Module 5: Balance catalog review (15 min) with hands-on practice; if time is tight, catalog can be assigned as post-training work
- Module 6: Licensing is a commercial reference - keep it discussion-led; sellers/account teams may join for just this module

### Common Issues & Solutions

- **Installation problems**: Have alternative installation methods ready
- **IDE skill loading**: Restart IDE and re-run `dap-bpa setup-ide`
- **Orchestrator connectivity**: Use offline examples if connection fails
- **CLI command errors**: Emphasize `--help` usage and troubleshooting
- **Catalog access issues**: Ensure internet connectivity; catalog can be explored post-training if portal access is problematic

### Customization Options

- **For Cloud-Focused Teams**: Emphasize AWS/Azure/GCP examples
- **For Bare-Metal Teams**: Focus on iDRAC and Redfish examples
- **For Kubernetes Teams**: Prioritize Helm and K8s examples
- **For DevOps Teams**: Highlight CI/CD integration patterns
- **For Catalog-Focused Teams**: Extend catalog review time and emphasize production-ready offer customization

---

## Appendix: Quick Reference Cards

### Tool Selection Quick Reference

```text
Authoring blueprints?       → AI Skills (@dap) + Knowledge Base
Validating blueprints?      → CLI (lint) + AI Skills (review)
Deploying to orchestrator?  → CLI (orchestrator commands)
Monitoring executions?      → CLI (events) + Orchestrator UI
Troubleshooting issues?     → AI Skills (reasoning) + CLI (events)
Researching patterns?       → Knowledge Base + AI Skills
Finding production offers?   → Dell Automation Studio Catalog
```

### CLI Command Quick Reference

```bash
# Setup
dap-bpa setup
dap-bpa setup-ide windsurf
dap-bpa status

# Authoring
dap-bpa blueprint lint --file blueprint.yaml --verify
dap-bpa blueprint validate-all --file blueprint.yaml

# Knowledge
dap-bpa knowledge blueprints find "query"
dap-bpa knowledge plugins list <plugin>

# Orchestrator
dap-bpa orchestrator blueprints upload --file blueprint.yaml --id my-bp --revision 1.0.0
dap-bpa orchestrator deployments create --blueprint-id my-bp --inputs inputs.json
dap-bpa orchestrator executions start --deployment-id <id> --workflow-id install

# Monitor
dap-bpa monitor --file blueprint.yaml --inputs '{"key":"value"}'
```

### Specification Structure Quick Reference

```text
spec.md          → Business requirements, acceptance criteria
plan.md          → Implementation plan, architecture decisions
research.md      → Engineering research, technology analysis
data-model.md    → Data models, schema definitions
quickstart.md    → Quick start guide, rapid implementation
```

### Dell Automation Studio Catalog Quick Reference

```text
Catalog Portal:  https://automation.dell.com/catalog
Total Offers:    46 across 8 technology categories
Offer Types:     Studio, Dell Validated, ISV Validated, Staging/Test
Top Categories:  Platform Services (15), Compute (10), DevOps & CI/CD (7)
Key Industries:  Manufacturing, Retail, Energy, Smart Cities, Federal
Usage Workflow:  Download → Customize with BPA → Deploy
```

---

## Contact & Support

### Training Support

- **Documentation**: Training repository and official DAP documentation
- **Community**: Internal Dell automation community channels
- **Issues**: Report training material issues via repository issues

### Blueprint Assist Support

- **CLI Issues**: `dap-bpa --help` and troubleshooting section
- **Skill Issues**: Re-run `dap-bpa setup-ide <ide>`
- **Orchestrator Issues**: Check connectivity and authentication

---

**Training Version**: 2.0 (two-day format)
**Last Updated**: 2026-08-15
**Based on dap-bpa Version**: v0.29.3
