# Blueprint Assist Training

Training materials and documentation for Blueprint Assist (BPA), an AI-powered infrastructure and dev-ops deployment tool.

>**New here? Start with the [Quick Start — Zero to Hero](1.sections/section-000-quick-start/content.md)** — install BPA, connect your AI IDE, and author your first blueprint in under 15 minutes.
> **Important**: Please review the [Disclaimer](DISCLAIMER.md) before using this training material or any blueprints.

Blueprint AI Assistant is designed to function within enterprise development toolchains rather than as a standalone authoring interface. Operating within an IDE of your choosing, it can integrate with version control systems, branching strategies, and platform pipelines already in use by DevOps teams. Blueprints that are authored with Blueprint AI Assistant remain portable, version‑controlled artifacts that can be promoted, tested, and deployed consistently across environments.

Critically, Blueprint AI Assistant does not generate opaque automation logic. All generated content is explicit and editable, enabling teams to inspect, refine, and extend blueprints as requirements evolve. This model ensures that AI assistance enhances velocity and consistency while preserving transparency, determinism, and governance, which are key requirements for enterprise infrastructure automation. Additional Blueprint AI Assistant user content will be available in a future release.

## Overview

This repository contains training materials and documentation for Blueprint Assist (BPA), an AI-powered infrastructure deployment tool.

## Who should use this training?

This training is designed for engineers, architects, and DevOps professionals who want to learn how to use Blueprint Assist to accelerate infrastructure deployment and management. Whether you're new to dap-bpa or looking to deepen your expertise, this training will help you get up to speed quickly.

## What is Blueprint Assist?

Blueprint Assist (BPA) is an AI-powered infrastructure deployment tool that simplifies the creation and management of blueprints for cloud and on-premises environments. It leverages advanced AI capabilities to help engineers design, deploy, and validate infrastructure configurations with greater efficiency and accuracy.

### Key Value Propositions

- **Accelerated Development**: Reduce blueprint creation time by leveraging AI-assisted design patterns
- **Consistency**: Ensure infrastructure deployments follow best practices and organizational standards
- **Knowledge Transfer**: Enable teams to learn from existing blueprints through reasoning and analysis
- **Flexibility**: Support both signed (validated) blueprints and custom organizational blueprints
- **Multi-Platform**: Deploy across various platforms including on-premise data center, bare-metal, and Kubernetes environments
- **DAP Orchestrator Integration**: Connect directly to the DAP orchestrator to upload and update blueprints, create and configure deployments, execute install/uninstall workflows, stream live events, and monitor real-time execution status
- **Automated Lifecycle Testing** (v0.24.0+): `dap-bpa monitor` runs the full upload ? deploy ? validate ? cleanup loop, with an LLM-powered diagnostician that auto-repairs failing blueprints
- **Enhanced Plugin Management** (v0.26.0+): `dap-bpa knowledge plugins fetch` and `add` commands for managing plugin documentation and custom plugins
- **Deployment Update Workflow** (v0.26.0+): `dap-bpa orchestrator deployment-updates` command group for full blueprint and topology updates
- **Orchestrator Profile Selection** (v0.26.0+): Use `--orchestrator <name>` or `-o <name>` to switch between multiple orchestrator profiles
- **SSL Certificate Handling** (v0.26.0+): `--trust-all` flag for self-signed certificates in development environments
- **Enhanced Orchestrator Features** (v0.26.0+): New capabilities for advanced orchestrator management and deployment workflows
- **Blueprint Summarization** (v0.27.0+): `describe_blueprint` MCP tool and `POST /api/v1/blueprints/summarize` REST endpoint generate AI descriptions from a blueprint ZIP — node types, relationships, inputs, plugins, and workflows extracted and summarized by an LLM agent
- **Local MCP Server** (v0.27.0+): `dap-bpa mcp-server` runs the Blueprint Assist MCP server locally from the CLI for development and local integrations
- **Docker Distribution** (v0.27.0+): BPA CLI available as a Docker image for containerized and CI/CD workflows
- **Self-Updating CLI** (v0.28.0+): `dap-bpa upgrade` auto-discovers a downloaded release zip and installs it, `dap-bpa upgrade --check` gates CI on new versions (exit `10` = update available), and `dap-bpa upgrade --rollback` atomically restores the previous binary from its `.bak` backup
- **Blueprint Visualizer Skill** (v0.28.0+): a new agent skill generates interactive HTML topology diagrams of a blueprint on demand ("visualize this blueprint")
- **Single-Binary Daemon** (v0.28.0+): the background monitor daemon runs as a mode of `dap-bpa` itself, eliminating CLI↔daemon version skew; manage it with `dap-bpa monitor --daemon-status` / `--daemon-stop`
- **Human-in-the-Loop Patch Approval** (v0.28.0+): AI-generated blueprint fixes now require explicit confirmation before they are applied to disk or the orchestrator, and remote-URL execution vectors are flagged during patch validation
- **Self-Documenting MCP Endpoint** (v0.28.0+): both MCP servers expose an unauthenticated `GET /docs` endpoint with connection instructions, and auth errors point to it via `hint`/`docs` fields
- **Visualizer Risk Analysis** (v0.28.2+): the blueprint visualizer now runs a static risk engine (~25 rules across security, reliability, lifecycle, and operability) and renders findings in a dedicated Risk Analysis panel with severity, category, rule reference, and remediation — plus `.riskignore` suppression, component-mode analysis for composer blueprints, and per-rule docs in `docs/RISK_RULES.md`
- **Self-Contained React Visualizer** (v0.28.2+): `dap-bpa blueprint visualize` now generates a React-based diagram (install-flow steps, platform detection, plugins panel, ServiceComponent sub-flow, parallel-step indicators) with React inlined and no CDN requests at runtime

## Blueprint Assist Docs

Markdown documentation is delivered as part of each build. Unzip the dap-bpa folder from the build artifacts to find the documentation in the `docs/` folder. Updated with every release.

Location: `/bpa/docs/`

- BENCHMARKING.md
- BINARY_DISTRIBUTION.md
- BUILD_TROUBLESHOOTING.md
- CUSTOMER_DISTRIBUTION.md
- DEMO_SCRIPT.md
- PLUGIN_CONTRIBUTION_GUIDE.md
- PLUGIN_DOCS_FORMAT.md
- PLUGIN_NODE_TYPE_FORMAT.md
- PLUGIN_SKILL_FORMAT.md
- QUICK_BINARY_BUILD.md
- RELEASE_VALIDATION_CHECKLIST.md
- SETUP_GUIDE.md
- WINDOWS_BUILD.md

## Repository Structure

```text
blueprint-assist-training/
+-- 1.sections/              # Training course sections (0-20)
¦   +-- section-000-quick-start/
¦   +-- section-001-introduction/
¦   +-- section-002-installation/
¦   +-- section-003-orchestration-service-auth/
¦   +-- section-004-skills-overview/
¦   +-- section-005-skills-architecture/
¦   +-- section-006-supported-blueprints/
¦   +-- section-007-building-blueprints/
¦   +-- section-008-blueprint-monitoring/
¦   +-- section-009-blueprint-reasoning/
¦   +-- section-010-blueprint-anatomy/
¦   +-- section-011-skill-anatomy/
¦   +-- section-012-hands-on-workshop/
¦   +-- section-013-bpa-cli-commands/
¦   +-- section-014-diagrams/
¦   +-- section-015-studio-offer-details/
¦   +-- section-016-tunnel-connections/
¦   +-- section-017-model-architecture-decisions/
¦   +-- section-018-spec-considerations/
¦   +-- section-019-mcp-server/
¦   +-- section-020-dell-automation-studio-catalog/
¦   +-- section-021-blueprint-visualizer/
+-- 2.presentations/         # Presentation decks for instructor-led training
¦   +-- 1.BPA-intro.pptx
¦   +-- 2.TOSCA_DAS_Fundementals.pptx
¦   +-- 3.BPA-EKT-Training-Session.pptx
¦   +-- 4.devin_spec_kit_dell.pptx
+-- 3.resources/             # Resources and reference materials
¦   +-- reference-docs/      # Reference documentation (PDFs)
¦   +-- spec-kit/            # Specification kit for blueprint development
¦   +-- helper-python/       # Helper scripts for development environment
¦   ¦   +-- wsl-file-system-helper.sh  # WSL file system caching workaround
¦   +-- generate_presentation.py  # Tool for generating presentations
+-- 4.examples/              # Example blueprints and specifications
¦   +-- capability-examples/  # Capability-focused blueprint examples organized by capability area
¦   ¦   +-- 01-authoring/     # Blueprint authoring examples
¦   ¦   +-- 02-review/        # Blueprint review examples
¦   ¦   +-- 03-testing/       # Blueprint testing examples
¦   ¦   +-- 04-deployment/    # Blueprint deployment examples
¦   ¦   +-- 05-maintenance/   # Blueprint maintenance examples
¦   +-- sample-demo-scripts/ # Step-by-step demo scripts for live walkthroughs
¦   +-- sample-specs/         # Sample specification documents and templates
¦   +-- sample-prompt-specs/ # Example prompt specifications for blueprint generation
¦   +-- sample-icons/        # Sample icons for blueprints
¦   +-- target-build-folder/ # Build output directory for generated blueprints
+-- docs/                    # Project documentation
¦   +-- docs-internal/       # Internal-only files (stripped from public release)
¦   ¦   +-- INFO-TO-REVIEW.md
¦   ¦   +-- REPO-BUILD-REFRESH.md
¦   ¦   +-- public-release-steps.md
¦   ¦   +-- repo-visibility-cutover.md
¦   +-- CHANGELOG.md         # Version history and release notes
¦   +-- FULL-DAY-TRAINING-AGENDA.md # Full-day instructor-led training agenda
¦   +-- LEARNER-ASSESSMENT.md # Learner self-assessment template (capability confidence + section progress)
¦   +-- project-metadata.yaml # Versioning and project metadata
¦   +-- validation-setup.md  # Linting and validation tool setup
+-- README.md                # This file
```

## Important Links

- [Dell Automation Platform Blueprint Quick Start Guide](https://www.dell.com/support/manuals/en-us/dell-automation-platform-components/dap_p_blueprint_qsg)
- [Dell Automation Platform Blueprint AI Assistant User Guide](https://www.dell.com/support/manuals/en-us/dell-automation-platform-components/dap_das_blueprint_ai_assistant_ug/Blueprint-AI-Assistant?guid=guid-b2d89ed1-0a83-4735-ba33-5450de9df02b&lang=en-us)
- [Dell Automation Studio Solution Guide](https://www.dell.com/support/manuals/en-us/dell-automation-platform-components/dap_das_solution_wp/Dell-Automation-Studio?guid=guid-53cce737-a4c4-4b29-9f85-37964af756e2&lang=en-us)
- [Blueprint Developer's Guide](https://dl.dell.com/content/manual39624970-dell-automation-platform-blueprint-developer-s-guide.pdf?language=en-us)
- [Dell Automation Platform Ordering and Licensing Guide](https://www.delltechnologies.com/asset/en-us/solutions/infrastructure-solutions/legal-pricing/dell-automation-platform-ordering-licensing-guide.pdf)
- **Blueprint Assist Installer**: Available via [Dell Automation Studio](https://automation.dell.com/catalog) (Dell Automation Studio subscription required)
- **Learner Self-Assessment**: [docs/LEARNER-ASSESSMENT.md](docs/LEARNER-ASSESSMENT.md) — track your capability confidence and section progress locally
- **Share Feedback**: [Open a Learner Feedback issue](https://github.com/tme-tech-ops/blueprint-assist-training/issues/new?template=learner-feedback.yml) — report bugs, gaps, or suggestions

**Internal References**: Internal Dell specific resources and links are available upon request from the training team.

- [Knowlege center - Dell Automation Studio](https://www.delltechnologies.com/resources/en-us/auth/solutions/infrastructure-solutions/dell-automation-platform/automation-platform.htm)

## Training Sections

This training is organized into 22 sections, starting with a Quick Start for new users:

0. [**Quick Start — Zero to Hero**](1.sections/section-000-quick-start/content.md) - Install BPA, connect your AI IDE, and author your first blueprint in under 15 minutes
1. [**Introduction to Blueprint Assist**](1.sections/section-001-introduction/content.md) - Overview, value propositions, and use cases
2. [**Installation**](1.sections/section-002-installation/content.md) - Setup and installation instructions
3. [**Orchestration Service Authentication**](1.sections/section-003-orchestration-service-auth/content.md) - Connecting to DAP orchestrators, configuration files, credential management, and SSL setup
4. [**Skills Overview**](1.sections/section-004-skills-overview/content.md) - Introduction to the skills-based architecture and comprehensive capabilities reference covering blueprint authoring, review, testing, deployment, and maintenance
5. [**Skills Architecture**](1.sections/section-005-skills-architecture/content.md) - Deep dive into the skills framework
6. [**Supported Blueprints**](1.sections/section-006-supported-blueprints/content.md) - Reference and custom blueprints; find what's already available in the Dell Automation Studio Catalog before building your own
7. [**Building Blueprints**](1.sections/section-007-building-blueprints/content.md) - Guide to creating new blueprints with AI assistance
8. [**Blueprint Monitoring**](1.sections/section-008-blueprint-monitoring/content.md) - Automated lifecycle testing with `dap-bpa monitor`, the Blueprint Diagnostician, and auto-repair (requires DAP connection)
9. [**Blueprint Reasoning**](1.sections/section-009-blueprint-reasoning/content.md) - AI-powered analysis, explanation, and understanding of blueprints (no DAP connection required)
10. [**Blueprint Anatomy**](1.sections/section-010-blueprint-anatomy/content.md) - Detailed breakdown of blueprint structure
11. [**Skill Anatomy**](1.sections/section-011-skill-anatomy/content.md) - Detailed breakdown of skill structure
12. [**Hands-on Workshop**](1.sections/section-012-hands-on-workshop/content.md) - Practical exercises and workshops
13. [**dap-bpa CLI Command Reference**](1.sections/section-013-bpa-cli-commands/content.md) - Complete CLI command reference organized by workflow
14. [**Architecture Diagrams**](1.sections/section-014-diagrams/content.md) - Visual reference for system architecture, workflows, and component relationships
15. [**Dell Automation Studio Offer Details**](1.sections/section-015-studio-offer-details/content.md) - Commercial offering details for the paid subscription tier
16. [**Tunnel Connections**](1.sections/section-016-tunnel-connections/content.md) - SSH tunnel setup for accessing remote orchestrators through Windows jump hosts
17. [**Model and Architecture Decisions**](1.sections/section-017-model-architecture-decisions/content.md) - Comparison of AI models and tools (Windsurf vs Devin), architecture patterns, and tool selection guidance
18. [**Specification Considerations**](1.sections/section-018-spec-considerations/content.md) - Spec-driven development methodology, specification workflow, constitution compliance, and AI-powered specification optimization including token analysis tools
19. [**Blueprint Assist MCP Server**](1.sections/section-019-mcp-server/content.md) - Model Context Protocol (MCP) server for programmatic blueprint operations in SaaS orchestrator environments
20. [**Dell Automation Studio Catalog**](1.sections/section-020-dell-automation-studio-catalog/content.md) - Curated catalog of 46 production-ready blueprints across 8 technology categories; browse at [automation.dell.com/catalog](https://automation.dell.com/catalog)
21. [**Blueprint Visualizer**](1.sections/section-021-blueprint-visualizer/content.md) - Self-contained React HTML artifact for exploring a blueprint's install-flow execution surface, risk analysis, inputs, plugins, and source — shareable with no server or DAP access required

## Use Cases

### Primary Use Cases

1. **Infrastructure Deployment**: Deploy complete infrastructure stacks for applications
2. **Blueprint Analysis**: Understand and audit existing blueprints
3. **Blueprint Creation**: Build new blueprints from scratch using AI assistance
4. **Template Reuse**: Leverage existing signed blueprints as starting points
5. **Custom Development**: Create organization-specific blueprints for unique requirements

### Target Scenarios

- **Greenfield Deployments**: New infrastructure projects starting from scratch
- **Brownfield Migrations**: Existing infrastructure being modernized or migrated
- **Standardization Projects**: Establishing consistent infrastructure patterns across teams
- **Learning and Onboarding**: New engineers learning infrastructure patterns
- **Audit and Compliance**: Reviewing existing deployments for best practices

## Architecture Overview

Blueprint Assist operates on a skills-based architecture where individual capabilities are encapsulated as modular skills that can be composed to create complex blueprints.

### Core Components

- **Skills Engine**: AI-powered engine that processes natural language and technical requirements
- **Blueprint Repository**: Storage for signed and custom blueprints
- **Validation Layer**: Ensures blueprints meet security and compliance requirements
- **Deployment Pipeline**: Executes blueprints across target environments

## Getting Started

1. Start with **Section 0: Quick Start** to get up and running in under 15 minutes
2. Continue to **Section 1: Introduction** to understand the fundamentals
3. Proceed to **Section 2: Installation** to set up your environment
4. Continue to **Section 3: Orchestration Service Authentication** to configure your orchestrator connections
5. Continue through the remaining sections sequentially to build comprehensive knowledge
6. Complete the **Hands-on Workshop** (Section 12) to apply your skills
7. Reference **Section 13: dap-bpa CLI Command Reference** for day-to-day command usage
8. Explore **Section 14: Architecture Diagrams** for visual reference
9. Review **Section 15: Dell Automation Studio Offer Details** for commercial offering information

## Sample Blueprints

All sample blueprints are available in the [Dell Automation Studio Catalog](https://automation.dell.com/catalog).

## Resources

- Reference documentation available in `3.resources/reference-docs/`
- Specification templates in `3.resources/spec-kit/`
- Helper scripts in `3.resources/helper-python/` (including WSL file system helper for development environment issues)
- Presentation materials in `2.presentations/`
- Sample blueprints at [automation.dell.com/catalog](https://automation.dell.com/catalog)
- Capability examples in `4.examples/capability-examples/` organized by Blueprint Assist capability area
- Sample specifications in `4.examples/sample-specs/` for blueprint development guidance
- Sample prompt specifications in `4.examples/sample-prompt-specs/` for blueprint generation guidance

## Contributing

Contributions to this training repository are welcome. Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on how to submit changes.

For contributions to the Blueprint Assist tool itself, please refer to the main Blueprint Assist project repository.

## License

Please refer to the main Blueprint Assist project for licensing information.

## Constitution Compliance

This project follows the Dell Automation Platform Blueprint Core Standards as defined in the constitution document:

- **Constitution Version**: 1.0.0
- **Compliance Status**: Full compliance achieved
- **Constitution Location**: `3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md`

### Compliance Summary

- **Platform Alignment**: All artifacts target Dell Automation Platform
- **Declarative IaC**: Infrastructure provisioned using declarative methodologies
- **Spec-Driven Development**: Spec is the single source of truth
- **File Structure**: Organized according to constitution standards
- **Security**: No hardcoded secrets, proper secret management
- **Documentation**: Comprehensive documentation in docs/ folder
- **Code Quality**: Linting configuration and validation tools documented
