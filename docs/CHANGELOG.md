# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026-07-08] - Training Content Refresh for dap-bpa v0.27.0

### Added

- Section-013: `dap-bpa mcp-server` command (v0.27.0+ — run the MCP server locally from the CLI)
- Section-019: Completely rewritten to cover both MCP servers (gateway + agent), `ask_bpa_agent` MCP tool, `/api/v1/blueprints/summarize` endpoint, VS Code and Windsurf connection configs, session lifecycle, and architecture diagram
- Section-004: `dell-sdd` skill added as the fifth bundled skill (v0.27.0+)
- README: `(v0.27.0+)` KVP bullets for Blueprint Summarization, Local MCP Server, and Docker Distribution

### Changed

- Bumped tracked BPA version to `v0.27.0` across all section metadata in `docs/project-metadata.yaml`
- Updated `last_updated` and `last_bpa_upgrade` dates to 2026-07-08
- Bumped section versions to reflect v0.27.0 review (sections 001–014, 017–019)
- Section-013: Updated troubleshooting row for `bpa` — deprecated in favor of `dap-bpa` as of v0.27.0
- Section-013: Noted that `dap-bpa blueprint lint --file` now also verifies imported files exist (v0.27.0+)
- Section-013: Noted that blueprint upload prints the DAP console inventory URL on success (v0.27.0+)
- Section-013: Added `bpa` command deprecation note to reference footer
- Section-004: Updated skill count from four to five (five skills ship as of v0.27.0)
- Updated NSIS installer filename example and "As of" prose in `windows-installer.md` to v0.27.0
- Updated `VERSION.txt` expected output in `installation-prerequisites.md` and `linux-installer.md` to v0.27.0
- Updated current-skills-catalog prose in section-004 and skill versioning example in section-005 to v0.27.0
- Updated CLI version label in section-014 architecture Mermaid diagram to v0.27.0
- Updated `REPO-BUILD-REFRESH.md` tracked version header to v0.27.0
- Updated all installer acquisition references from "Contact the Dell Automation Platform TME team" to [Dell Automation Studio](https://automation.dell.com/catalog) (now publicly available): `README.md`, `section-000-quick-start`, `section-002-installation/content.md`, `windows-installer.md`, `linux-installer.md`, `mac-installer.md`, `installation-prerequisites.md`, `linting-best-practices/README.md`, `REPO-BUILD-REFRESH.md`

---

## [2026-06-21] - Sample Blueprints dap-bpa v0.26 Compliance Update

### Changed

- Updated all sample blueprints to use `tosca_definitions_version: dell_1_1` (from `dell_1_0`):
  - `4.examples/sample-blueprints/bare-metal/idrac_infrastructure/IDRAC_Configuration.yaml`
  - `4.examples/sample-blueprints/kubernetes-on-bare-metal/K8S/K8S_for_Bare_Metal.yaml`
  - All 13 K8S component blueprints (worker, control_plane, nvidia_gpu_operator, longhorn, linkerd, istio, ingress, cert_manager, packages_repo, nginx_ingress_controller, kube_vip, flannel, container_registry, calico)
- Updated all plugin version imports to use version-range pinning with minimum and maximum versions per dap-bpa v0.26 best practices (IM-003):
  - IDRAC: `ansible-plugin` >=4.1.8.0,<5.0.0.0 and `utilities-plugin` >=3.1.4.0,<4.0.0.0
  - Simple OS Ubuntu: `ansible-plugin` >=4.1.8.0,<5.0.0.0
  - Bare-Metal OS Deployment: `ansible-plugin` >=4.1.8.0,<5.0.0.0, `utilities-plugin` >=3.1.4.0,<4.0.0.0, `redfish-plugin` >=1.0.1.0,<2.0.0.0
- All changes verified with `dap-bpa blueprint lint` for compliance with blueprint-rules.md (TD-001, IM-003)

## [2026-06-14] - Section 018 Specification Considerations Refresh

### Changed

- Added the general-purpose spec-kit deck (2.presentations/5.spec-kit-for-dap-blueprints.pptx) alongside the Dell-internal Devin deck in the presentation references, so public readers have a deck that is not tied to the internal tooling.
- Marked the section as a specification methodology reference appendix.
- Dropped the dated GPT-4 model name from the tokenizer example, leaving a generic GPT reference.

## [2026-06-14] - Section 017 Model and Architecture Decisions Refresh

### Changed

- Updated the tool names for the 2026 Cognition rebrand: the IDE formerly called Windsurf Cascade is now Devin, and the autonomous agent formerly called Devin is now Devin CLI. Added a naming note so readers who know the old names can follow the comparison.
- Added a Supported Tools and Models section. Blueprint Assist is agent- and model-agnostic, so the section lists the agents dap-bpa setup-ide installs into (claude-code, cursor, windsurf, jetbrains, vscode, antigravity) and the diagnostician adapters (Bedrock, OpenAI, Claude Code, Devin), framing the Devin comparison as the common Dell-internal setup rather than the only option.
- Marked the section as a tooling and model decisions reference appendix.

## [2026-06-14] - Section 015 Dell Automation Studio Offer Details Refresh

### Changed

- Replaced the NativeEdge references with Dell Distributed Private Cloud (DDPC) across the platform description, the validated-blueprint list, and the use cases, and added DDPC alongside Dell Private Cloud as an example outcome.
- Clarified how deployment credits are consumed: only on a successful deployment of a customer-defined blueprint, with failed deployments not consuming credits.
- Removed the annual framing from deployment credits in the licensing model, the differentiators table, and the worked examples, since credits are not a per-year budget.
- Marked the section as a commercial reference for sellers and account teams rather than a hands-on engineering section.

## [2026-06-14] - Section 014 Architecture Diagrams Refresh

### Changed

- Relabeled the MCP Server (Block 2) and the AWS EKS cloud deployment (Block 3) as roadmap in the system architecture and component diagrams, and noted in the overview that only the local IDE model (Block 1) is current today. These are the same forward-looking pieces marked as roadmap in section 5.
- Corrected the skill names in the architecture and authoring diagrams. They referenced dap-plugin-* skills, which do not exist; the real skills are dap, dap-scripts, dap-deployment-update, and dap-service-composition, and vsphere authoring runs through the core dap skill.
- Renamed the Synapse external system to AIOps, matching the rename in section 5.
- Reduced the SSL options diagram to the supported --trust-all flag. The other methods shown (--skip-ssl-verify, --insecure, the NODE_TLS_REJECT_UNAUTHORIZED environment variable, and ssl_verify in config.json) are not recognized by the CLI or the config file.
- Removed the dated GPT-4o model name from the LLM nodes, leaving a generic Claude / GPT label.

## [2026-06-14] - Section 013 dap-bpa CLI Command Reference Refresh

### Changed

- Corrected the executions start example in the quick start to use the --deployment-id flag, which is the form the command accepts. The positional deployment id shown before is ignored by the CLI.
- Removed the ./bpa-docker.sh runner references and the runners block. The product ships a standalone dap-bpa binary that is installed natively, and the distribution provides no Docker runner.
- Replaced the --filter glob examples with a note that the orchestrator expects a filter expression with an operator and rejects shell globs, and changed the --filter placeholder in the tables from pattern to expr.
- Removed the per-command version annotations such as v0.22.0+, v0.24.0+, and v0.25.0+. They could not be verified against the release notes and contradicted each other in a couple of places, so the reference now states once that it covers v0.25.0.
- Removed the "formerly dap-bpa babysit" note from the monitor section and the babysit to monitor rename line in the troubleshooting table. The CLI has no babysit command.
- Removed the --batch-size option from the events get row, which the command does not accept, and added --force to the blueprints delete row, which it does.
- Added the --display-name flag to the deployments create row and corrected the output-format examples to read the real deployment_status field and use space-separated --fields values.
- Replaced the knowledge blueprints list row, which requires a query and duplicates find, and switched the find plugin-filter example to the positional query form.
- Corrected the global flags list so --filter is not shown as global and --dry-run is scoped to the commands that support it, and changed the orchestrator profile examples to generic production and staging names.

## [2026-06-14] - Section 012 Hands-on Workshop Refresh

### Changed

- Replaced dap-bpa knowledge blueprints list, which errors with a usage message, with dap-bpa knowledge blueprints find in the environment check.
- Removed the --filter examples from the secrets and plugins list exercises; the orchestrator rejects the glob syntax that was shown.
- Replaced the blueprint cleanup note with the real command dap-bpa orchestrator blueprints delete, and kept deployment deletion as a UI action since there is no CLI command to delete a deployment.
- Corrected the Additional Resources cross-references to the right sections: 13 for the CLI command reference, 7 for building blueprints, and 9 for blueprint reasoning.

## [2026-06-14] - Section 011 Skill Anatomy Refresh

### Changed

- Rewrote the section against the real skill model. The previous version described a fabricated skill.md schema (Metadata, Parameters, Dependencies, Outputs, Implementation tables), a phantom dap-bpa skills add command, skill patterns with sub-skills, and a publish-to-registry process, none of which exist.
- Documented the real anatomy: a skill is a directory installed by dap-bpa setup-ide, with a SKILL.md whose frontmatter is just name and description, plus a references directory for on-demand depth. Examples are taken from the installed dap and dap-deployment-update skills.
- Explained that the description field is the trigger mechanism the agent matches to decide when to invoke a skill, and that the body routes to reference files rather than inlining everything.
- Described the rules the agent applies automatically (ND-003, IN-001, CP-001, BS-009) and how skills compose through routing from the core dap skill to the specialised ones.
- Reframed the design and testing guidance: skills are markdown the agent reads, tested by use, with no unit tests, build step, or registry. Documented installation via setup-ide and that skills version with the dap-bpa release.

## [2026-06-14] - Section 010 Blueprint Anatomy Refresh

### Changed

- Rewrote the section against the real TOSCA blueprint model, replacing a fabricated schema (name, version, author and license fields, a skills list inside the blueprint, dollar-brace interpolation, and a planning/cost/dry-run lifecycle) that did not match how blueprints work.
- Documented the real top-level sections (tosca_definitions_version, imports, description, dsl_definitions, inputs, input_groups, node_templates, capabilities, labels, blueprint_labels, workflows), using the edge-vm-ansible reference blueprint from the local library for every example.
- Described node template anatomy (type, properties, interfaces, relationships) and the intrinsic functions, with the real lifecycle operation sequence (precreate, create, configure, start, poststart and the uninstall inverse) and the rule that delete must reverse create.
- Reframed day-2 and drift onto the real update workflow and check_drift rather than invented drift-detect, rollback, and history commands, and removed the cost-estimation material since dap-bpa has no cost feature.
- Added a Next Steps section pointing to Section 11, the authoring walkthrough in Section 7, and the CLI reference in Section 13.

## [2026-06-14] - Section 009 Blueprint Reasoning Refresh

### Changed

- Rewrote the section around how reasoning actually works. Reasoning is delivered by the AI agent in the IDE working through the dap-bpa skill and knowledge base, not by CLI analysis verbs. Every analysis example now uses either an agent prompt or a real local command.
- Removed the invented commands the section was built on (analyze, explain, compare, dependencies, trace, estimate-cost, config summary/validate/diff, params analyze, resources list, external-deps, check-circular, skills dependencies), none of which exist in the CLI.
- Added a table of the real local primitives that back reasoning: dap-bpa blueprint lint and validate/validate-all, and dap-bpa knowledge plugins, docs, and blueprints lookups.
- Cut the cost-estimation material entirely. dap-bpa has no cost feature.
- Kept the network, compute, storage, and security component breakdowns, recast as questions to ask the agent or check against the knowledge base.
- Restructured Next Steps to lead forward to Section 10, then the CLI reference and monitoring, and corrected the earlier reference to signed blueprints to reference blueprints, consistent with Section 6.

## [2026-06-14] - Section 008 Blueprint Monitoring Refresh

### Changed

- Corrected the monitor command examples to start a session with --file pointing at a blueprint YAML file, replacing the positional-directory form that the command does not accept.
- Removed the --max-retries flag from the examples and flag reference. Auto-repair is not opt-in and has no retry-count flag: it runs automatically when an LLM adapter is configured and retries up to a built-in ceiling of three attempts.
- Replaced the invented failure classification with the four categories the monitor actually reports (blueprint_error, resource_unavailable, network_timeout, unknown) and documented that only blueprint_error is auto-fixed while the rest are escalated immediately.
- Listed all four diagnostician LLM adapters (Bedrock, OpenAI, Claude Code, Devin) in place of the partial Bedrock-or-OpenAI description.
- Replaced the --report output description with the real result surfaces: the RunReport from dap-bpa monitor --status and the persisted ~/.blueprint-assist/last-result.json.
- Completed the flag reference against the CLI: added --file, --deployment-id, --execution-id, --callback, and --status --session-id, and tightened --keep to its on-failure semantics.
- Removed the unverifiable "formerly dap-bpa babysit" rename note and the "v0.24.0+" version annotation.

## [2026-06-14] - Section 007 Building Blueprints Refresh

### Changed

- Showed both --deployment-id and --display-name on the deployment creation command; dap-bpa orchestrator deployments create accepts both.
- Corrected the install workflow command to pass the deployment through --deployment-id rather than as a positional argument, matching dap-bpa orchestrator executions start.
- Fixed the closing cross-reference to point to Section 8: Blueprint Monitoring.

## [2026-06-14] - Section 006 Supported Blueprints Refresh

### Changed

- Reframed the section around where blueprints come from: reference blueprints (the Dell-provided library and curated internal repos) that you start from, and your own blueprints that you author and upload. This replaces the signed-versus-custom framing, which described a digital-signature and certificate model that is not how the product works.
- Built the finding and using guidance on the real commands: dap-bpa knowledge blueprints find and get for reference blueprints, dap-bpa blueprint lint and validate-all while authoring, and dap-bpa orchestrator blueprints upload to publish.
- Documented blueprint visibility (tenant, global, private) as the access control applied on upload, with tenant as the default.
- Added a clearly marked forward-looking note that signed blueprints and the deployment-credit model are coming with Dell Automation Studio: Dell-curated signed blueprints will not draw credits while self-authored blueprints will, with the mechanics still being finalised, cross-referenced to section 15.
- Rebuilt the comparison table around real distinctions (source, what each is best for, validation, access control, and the forthcoming cost model) and kept the curated internal repository list, accessed by cloning the repo and linting the blueprint rather than through invented commands.
- Removed commands that do not exist (create, clone, deploy, verify, security-scan, compliance-check, use, skills add/modify, docs generate) and the digital-signature, certificate, and self-validation flag material built around them.

## [2026-06-13] - Section 005 Skills Architecture Refresh

### Changed

- Focused the section 5 system architecture on the shipping authoring flow: IDE/agent with skills, the LLM, the dap-bpa CLI refinement loop, and the DAP orchestrator over REST. The diagram now shows just that flow.
- Described the architecture components as they are: skills as markdown knowledge packages (SKILL.md, reference files, rules), the local knowledge base queried through dap-bpa knowledge commands, and the refinement loop between the LLM and the dap-bpa CLI as the engine of the system.
- Replaced the skill composition material with a pointer to where composition actually lives: blueprint node relationships and ServiceComponents, taught by the dap-service-composition skill and covered in sections 7 and 10.
- Reframed the engineering best practices around the blueprints the skills produce, tied to the lint rules trainees encounter (ND-009 for drift, IN-001 for input descriptions, BS-009 for changelogs, CP-001 for capability outputs).
- Condensed skill development to the contributor workflow (purpose, SKILL.md and references, verify the guidance) and stated the versioning model: skills version with the dap-bpa release, with blueprint versioning handled separately.
- Pointed the integration narrative at the shipping path (dap-bpa to orchestrator over REST, blueprints to external tooling through DAP plugins).

### Added

- 1.sections/section-005-skills-architecture/future-architecture.md — the planned service-integration architecture (MCP Server, cloud EKS deployment, AIOps integration), kept separate from the training content and clearly marked forward-looking. content.md links to it from its references.

## [2026-06-13] - Section 004 Skills Overview Refresh

### Changed

- Opened the section with the skill catalog itself: dap, dap-scripts, dap-deployment-update and dap-service-composition, each with what it is for, and explained the split between skills (workflow guidance the agent follows) and plugin knowledge (per-plugin reference material queried with dap-bpa knowledge commands).
- Added a categorised table of the platform plugins covered by the knowledge base, using the IDs the CLI accepts (edge for the NativeEdge plugin, gcp, serverless, storage and so on), with a note on the dell.* node type prefix and the linter rule that catches legacy prefixes.
- Rebuilt the when-to-use guidance around the four skills and their trigger phrasing, noting that skills are reference knowledge rather than workflow steps that execute in order.
- Trimmed best practices to the ones that apply to bundled skills (keep dap-bpa updated and re-run setup-ide, test in non-production, inspect skill files locally, extend the knowledge base with dap-bpa knowledge plugins add) and moved the section upkeep notes into REPO-BUILD-REFRESH.md.
- Updated the capability example commands to their v0.25.0 forms: knowledge plugins list takes a plugin argument, deployment inputs are JSON, and docs search uses the storage plugin ID.

## [2026-06-12] - Section 003 Authentication Refresh

### Changed

- Updated the setup wizard walkthrough to list each prompt as of v0.25.0: portal domain, orchestrator domain, org ID, client ID and client secret, plus the optional diagnostician auto-fix adapter (Bedrock, OpenAI, Claude Code, or Devin). The wizard validates credentials before saving.
- Updated the manual config.json example to the structure the setup wizard writes: a top-level default orchestrator (portalDomain, orchestratorDomain, orgId, clientId, clientSecret), the diagnostician block, and named profiles under an orchestrators map selected per command with --orchestrator.
- Consolidated credential guidance on the Dell client credential set obtained from the DAP portal.
- Simplified SSL guidance to --trust-all (v0.25.0 and later) and NODE_TLS_REJECT_UNAUTHORIZED, with advice to install the CA certificate rather than bypass verification, and never to bypass in production.
- Reworked the CI/CD guidance around provisioning config.json on the runner and selecting profiles per command with --orchestrator.
- Replaced lab-specific hostnames and profile names with generic examples as part of preparing the material for external publication, pointed model guidance at the section 2 tables, and tightened the description of what setup-ide installs.

## [2026-06-12] - Section 002 Installation Refresh

### Changed

- Documented the two configuration locations: ~/.blueprint-assist/ for dap-bpa itself (config.json plus the staged knowledge base, skill sources and script library) and the chosen agent's own directory for agent config and installed skills (~/.claude/ for Claude Code, ~/.codeium/windsurf/ for Windsurf, ~/.devin/ for Devin, and so on). The .cognition to .devin migration note is scoped to Devin users.
- Documented the Windows NSIS install behaviour as of v0.25.0: binary at %USERPROFILE%\bin\bpa.exe, knowledge, skills and library staged under .blueprint-assist, and PATH handled by the installer. PATH examples throughout point at the binary directory.
- Updated the verification steps to offline knowledge base queries (dap-bpa knowledge blueprints find, dap-bpa knowledge secret-type list), dap-bpa status for environment checks, and a lint of the simple-os-ubuntu-bare-metal example from this repo using blueprint lint --file.
- Standardised the setup-ide examples on the positional form (dap-bpa setup-ide windsurf) in line with the section 13 CLI reference, and described what it installs: skills and rules into the directory each IDE's agent loads from.
- Described the Monitor Diagnostician's four adapters (Bedrock, OpenAI, Claude Code, Devin) configured through dap-bpa setup, with the choice stored in the diagnostician block of config.json. The model tables apply to the Bedrock and OpenAI adapters; the CLI adapters use the agent already on the machine.
- Added the agent and model agnosticism design point: users choose their own IDE/TUI and LLM, dap-bpa supplies the skills and the CLI. Devin is the typical choice within Dell.
- Updated the Devin links to cli.devin.ai, refreshed version references in the prerequisites guide, added a --trust-all note for self-signed certificates, merged the WSL IDE connection steps into one numbered section, pointed internal reference notes at the training team, and fixed a few typos.

## [2026-06-12] - Section 001 Introduction Refresh

### Changed

- Updated the section 1 introduction (now v1.1.0). It opens with a fuller description of BPA, the dap-bpa CLI plus the AI skills and plugin docs that work alongside your coding agent, and includes a short terminology note covering Dell Automation Platform, Automation Studio, and the older NativeEdge name.
- Stated the agent and model agnosticism design point up front: you choose the IDE, GUI or TUI and the LLM behind it; dap-bpa supplies the skills and the command line.
- Brought the architecture overview in line with the component model used in sections 5 and 14 (agent/IDE, dap-bpa CLI, skills and knowledge base, DAP orchestrator), with a walkthrough of the typical author, lint, deploy, monitor flow.
- Expanded the "What This Training Covers" list to reflect the full 18-section structure, organised as a core path plus reference and role-specific material, and noted early on which parts need a live orchestrator and which work offline.
- Bumped section-001 to 1.1.0 in docs/project-metadata.yaml.

## [2026-06-12] — Path Flexibility and Disclaimer Added

### Added

- **DISCLAIMER.md** — Added Dell disclaimer covering Third-Party Products and Blueprint AI Assistant usage, with prominent reference in README.md

### Changed

- **4.examples/sample-demo-scripts/1.sample-demo.md** — Replaced hardcoded username paths with relative paths for portability across users
- **4.examples/README.md** — Updated blueprint paths to use relative paths instead of absolute paths with username
- **2.presentations/add_slides_to_ppt.py** — Changed PowerPoint file paths from absolute Windows paths to relative paths
- **1.sections/section-002-installation/installation-prerequisites.md** — Updated sample plan path to use `~` home directory instead of specific username
- **README.md** — Added prominent disclaimer reference at the top of the file

### Security & Compliance

- Added legal disclaimer covering Third-Party Products warranty exclusions and AI system usage terms
- Disclaimer addresses both blueprint deployments and AI-generated content accuracy

## [2026-06-02] — Capability Examples Content Added

### Added

- **4.examples/capability-examples/** — Comprehensive practical examples for 7 key capabilities:
  - **01-authoring/create-new-blueprint** - Complete blueprint creation workflow with AI assistance, dap-bpa knowledge commands, multi-file structure generation, and best practices
  - **01-authoring/validate-blueprint** - Two-stage validation process (lint + schema), error interpretation, common fixes, and CI/CD integration
  - **01-authoring/generate-inputs-outputs** - Input types/constraints, input groups, conditional visibility, secret handling, and capability-based outputs
  - **02-review/linting-best-practices** - Comprehensive blueprint-rules.md compliance, all mandatory rules (TD-002, BS-009, BS-010, CP-001, IN-001, IN-004, IN-007, ND-003, ND-004, ND-005, ND-009, SC-001, SC-002)
  - **04-deployment/deployment-execution** - End-to-end deployment workflow (upload, create, monitor), event streaming, error handling, and verification
  - **04-deployment/pre-flight-checks** - Pre-deployment validation pipeline (blueprint validation, plugin availability, orchestrator readiness, input validation)
  - **05-maintenance/drift-detection** - Configuration drift detection with check_drift/update/postupdate pattern, idempotent updates, and drift correction

### Changed

- **4.examples/capability-examples/README.md** - Updated coverage status from 0/20 to 7/20 examples (35% coverage)
- **4.examples/capability-examples/README.md** - Added detailed breakdown of completed examples by capability area

### Content Quality

Each example includes:
- Learning objectives and prerequisites
- Step-by-step workflows with dap-bpa CLI commands
- Code samples and YAML examples
- Common mistakes and troubleshooting guidance
- Best practices and verification checklists
- Integration with related capabilities and training sections

### Coverage Summary

| Capability Area | Examples Available | Status |
|-----------------|-------------------|--------|
| Blueprint Authoring | 3/4 | ✅ Partially Complete |
| Blueprint Review | 1/4 | 🚧 In Progress |
| Blueprint Testing | 0/4 | 🚧 To be created |
| Blueprint Deployment | 2/4 | ✅ Partially Complete |
| Blueprint Maintenance | 1/4 | 🚧 In Progress |

### Focus Areas

Examples prioritized high-value capabilities:
- **Authoring** - Core blueprint creation and validation workflows
- **Deployment** - Essential deployment execution and pre-flight validation
- **Maintenance** - Critical drift detection for Day-2 operations

---

## [2026-06-02] — Capability Examples Directory Structure

### Added

- **4.examples/capability-examples/** — New directory structure for capability-focused blueprint examples:
  - Organized by 5 Blueprint Assist capability areas (authoring, review, testing, deployment, maintenance)
  - 20 subdirectories for individual capabilities (4 per capability area)
  - Comprehensive README.md explaining structure, purpose, and usage
  - Coverage status matrix tracking example availability
  - Designed to complement infrastructure-focused sample-blueprints
  - Each capability area will contain step-by-step examples with sample code and best practices

### Changed

- **README.md** — Updated repository structure to include capability-examples directory
- **README.md** — Added capability-examples to Resources section
- **README.md** — Updated line count from 273 to 279 lines

### Structure

The new capability-examples directory includes:
- `01-authoring/` (create-new-blueprint, edit-existing-blueprint, validate-blueprint, generate-inputs-outputs)
- `02-review/` (linting-best-practices, security-scanning, compliance-checks, documentation-review)
- `03-testing/` (unit-testing, integration-testing, mock-data-generation, test-execution)
- `04-deployment/` (deployment-planning, pre-flight-checks, deployment-execution, post-deployment-verification)
- `05-maintenance/` (drift-detection, update-support, version-management, rollback-procedures)

---

## [2026-06-01] — Capabilities Reference Integration

### Added

- **Section 004 (Skills Overview)** — Comprehensive capabilities reference integrated:
  - Detailed coverage of 5 capability areas: Blueprint Authoring, Blueprint Review, Blueprint Testing, Blueprint Deployment, and Blueprint Maintenance
  - Capability coverage status matrix showing fully covered, partially covered, and not covered areas
  - Implementation guidance with dap-bpa CLI command examples for each capability
  - Key features and best practices for each capability sub-area
  - Gap analysis with recommendations for capability enhancement
  - Mapping of capabilities to primary skills (`dap`, `dap-scripts`, `dap-deployment-update`, `dap-service-composition`)
  - Practical examples for blueprint authoring, validation, deployment, and maintenance workflows
  - Security and compliance limitations documentation
  - Testing capabilities gap analysis with manual workarounds

### Changed

- **Section 004 structure** — Replaced placeholder "Skill Descriptions and Capabilities" section with detailed capabilities mapping
- **Section 004 Next Steps** — Updated to reference new capabilities content and guide users to relevant sections
- **Section 004 Input Required** — Updated to reflect current content status and maintenance guidelines
- **README.md** — Updated Section 004 description to mention comprehensive capabilities reference

### Removed

- **Standalone section-019-capibilities** — Content integrated into section-004-skills-overview for better organization and reduced fragmentation

---

## [2026-05-25] — dap-bpa v0.25.0 Documentation Updates

### Added

- **Section 013 (dap-bpa CLI Commands)** — Updated to reflect dap-bpa v0.25.0 changes:
  - Added `knowledge plugins fetch <plugin>|--all` command for downloading plugin documentation
  - Added `knowledge plugins add <name-or-path>` command for importing custom plugins
  - Added `knowledge blueprints add` with new flags: `--name`, `--library`, `--yes|-y`, `--scan-depth`, `--copy-depth`, `--main-file-names`, `--allow-file-types`
  - Deprecated commands noted: `knowledge blueprints scan` and `knowledge blueprints registry`
  - Added `orchestrator deployment-updates` command group for full deployment update workflow
  - Added `orchestrator plugins download <id> [--output <path>]` command
  - Added `monitor --daemon-status` and `monitor --daemon-stop` commands for daemon management
  - Added `--application-file-name <name>` option to `orchestrator blueprints upload`
  - Updated global flags documentation: `--orchestrator <name>` and `-o` for orchestrator profile selection
  - Added `--trust-all` flag for SSL certificate verification bypass
  - Clarified `orchestrator deployments update` as PATCH metadata operation (not deployment update workflow)

- **v0.25.0 Migration Guide** — new document covering:
  - Upgrade path from v0.24 to v0.25
  - New plugin management workflow (fetch, add, list)
  - Deployment update workflow (initiate, list, get)
  - Daemon management for monitor sessions
  - Orchestrator profile selection via CLI
  - SSL certificate handling improvements
  - Backward compatibility notes

- **IDE Support Expansion** — documented support for additional IDEs in `setup-ide`:
  - jetbrains (Claude Code extension)
  - vscode (Claude Code extension)
  - antigravity
  - Updated skill installation paths for each IDE

### Changed

- **Section 013 (dap-bpa CLI Commands)** — reorganized command reference to match v0.25 help output structure
- **README.md** — updated version reference from v0.24.0 to v0.25.0
- **Installation documentation** — updated Windows zip file pattern to accommodate v0.25.0 builds
- **All CLI examples** — verified against actual v0.25.0 command output

### Fixed

- **Command documentation accuracy** — all commands now match actual `dap-bpa --help` output for v0.25.0
- **Global flags documentation** — corrected to reflect v0.25.0 implementation
- **IDE support list** — expanded to include all supported IDEs with correct installation paths

---

## [0.22.0] "Doubtfire" — 2026-04-13

### Added

- **Blueprint Babysitter Agent** — new `dap-bpa babysit` command that automates the full blueprint lifecycle testing loop: upload blueprint → create deployment → install → run workflows → uninstall → cleanup. Provides structured JSON output for AI agents and human-readable reports for developers. Includes failure diagnostics, assertion validation, and configurable cleanup behavior via `--keep` flag.
- **Blueprint Diagnostician** — LLM-powered blueprint repair system integrated into babysitter. When a blueprint fails, the diagnostician analyzes execution events, identifies root causes, generates fixes, and retries automatically. Supports AWS Bedrock (Claude) and OpenAI models with configurable retry limits.
- **Deterministic Failure Classifier** — categorizes blueprint failures into actionable types (syntax errors, missing secrets, auth failures, resource conflicts, timeouts, infrastructure issues) to guide repair strategies and provide structured feedback.
- **MCP Server Write Operations** — full CRUD support for blueprints, deployments, and secrets via MCP tools. Includes blueprint archive validation/repair, base64 encoding, and structured error responses.
- **MCP Input Validation** — comprehensive Zod-based validation for all MCP tool inputs with detailed error messages for missing/invalid parameters.
- **Structured Help Subsystem** — CLI help rewritten into data-driven hierarchy with group-aware routing. Every command supports `--help` and contextual sub-section help.
- **Daemon Structured Logging** — file-based logger with thread-safe writes for babysitter execution tracking and debugging.
- **MCP Server Authentication** — auth middleware for MCP gateway with HTTP branch support, credential validation, and secure operation handling. Includes 291 lines of authentication logic with comprehensive test coverage.
- **MCP Redaction Utility** — redaction utility to sanitize sensitive data in MCP server logs and responses, preventing credential leakage.
- **List Tool Filtering** — optional filter string parameter for list operations (blueprints, deployments, secrets) in CLI, core client, and MCP server. Enables targeted queries with string matching.
- **Setup Validation Tests** — 318 lines of comprehensive test coverage for setup-ide command, validating skill installation, configuration, and cleanup.

### Changed

- **BREAKING: Skill Rename** — all 22 skills renamed from `blueprint-assist-*` to `dap-*` prefix (e.g., `blueprint-assist-plugin-helm` → `dap-plugin-helm`). Affects skill loading in CLI, web app, MCP server, and VSCode extension. Skill trigger phrases unchanged; only programmatic references need updates.
- **BREAKING: Configuration Directory** — `.cognition/` renamed to `.devin/` to align with Devin CLI conventions. Existing `.cognition/config.json` files must be migrated.
- **BREAKING: Babysitter → Monitor** — renamed `dap-bpa babysit` command to `dap-bpa monitor` for clarity and consistency across the codebase. Code directories moved from `babysitter/` to `monitor/`. Trigger phrases and skill documentation updated accordingly.
- **Monitor CLI Experience** — added real-time progress reporting, terminal output formatting, and summary displays for better user feedback during blueprint lifecycle operations.
- **Monitor Documentation** — comprehensive testing documentation (STAGE5-TESTING.md) with 164 lines of testing guidance and updated skill documentation.
- **Setup IDE Simplified** — removed support for untested IDE targets (cursor, copilot, vscode-copilot, codex, gemini). Only windsurf and claude-code remain supported.
- **AWS Bedrock Integration** — fixed SigV4 canonical URI double-encoding, added credential persistence to config, improved setup wizard prompts.
- **Lifecycle Robustness** — daemon now attaches to auto-started executions when DAP returns "already running" 400 errors instead of failing.

### Fixed

- **MCP Write Operations Regression** — restored ~800 lines of production code deleted in bad merge (archive-utils.ts, errors.ts, all write tool handlers).
- **TypeScript Compilation Errors** — fixed CreateDeploymentRequest and CreateSecretRequest type mismatches in main.ts.
- **Test Suite** — fixed 132 test failures from merge regressions and removed 33 tests for unsupported IDE targets. All 1592 tests now pass.
- **Create-Secret Flags** — added missing `visibility` and `update_if_exists` flags to CLI implementation.
- **Bedrock Credential Handling** — setup wizard now prompts for AWS credentials during Bedrock configuration; credentials persisted to config for daemon access.
- **Setup-ide Backup Cleanup** — exclude backup directories (.bak-*) from skill installation to prevent pollution of IDE skills directories with outdated copies.
- **Build Cleanup** — automatic cleanup of dist-binary/.tmp directory after build completes, removing temporary build artifacts (esbuild output, SEA blob, Node.js archives).
- **API Restoration** — restored v0.22.0-build run(mode) API that was lost in merge, ensuring backward compatibility.
- **Duplicate Mocks** — fixed duplicate mock definitions in test files that were causing test failures.

### Removed

- **Unsupported IDE Targets** — removed cursor, copilot, vscode-copilot, codex, gemini from setup-ide command. Use windsurf or claude-code, or manually copy skills to your IDE's configuration directory.

## [2026-05-08] — Security: Internal References Consolidation

### Added
- **`.9-prerequisites/internal-references.md`** — new consolidated file containing all internal Dell/EMC references (Git repositories, Artifactory servers, Confluence wikis, artifacts servers, training portals, DNS servers, SharePoint, and SDD resources) for internal use only

### Changed
- **`README.md`** — removed internal Git repository links (eos2git), internal training portal link (edutube), internal SDD reference, and SharePoint link; added reference to `internal-references.md`
- **`.9-prerequisites/installation-prerequisites.md`** — removed internal Confluence links, internal Git repository links, internal CA certificate download URL, and internal Artifactory verification endpoint; replaced with placeholder values and references to `internal-references.md`
- **`1.sections/section-002-installation/content.md`** — removed internal Confluence and SharePoint links; added reference to `internal-references.md`
- **Test configuration files** — replaced all internal Artifactory URLs with placeholder values:
  - `4.examples/sample-blueprints/kubernetes-on-bare-metal/K8S/tests/integration/inputs/STDZ_K8S_Cluster_medium.yaml` (29 occurrences)
  - `4.examples/sample-blueprints/kubernetes-on-bare-metal/K8S/tests/integration/inputs/STDZ_K8S_Cluster_minimal.yaml` (2 occurrences)
  - `4.examples/sample-blueprints/bare-metal/os_deployment/os/inputs/windows_os.yaml` (1 occurrence)
  - `4.examples/sample-blueprints/bare-metal/os_deployment/os/inputs/os.yaml` (1 occurrence)
- **Test credentials** — replaced internal test username "marcindell" with placeholder `<your-docker-username>` in test configuration files

### Security
- All internal Dell/EMC URLs, endpoints, and references now consolidated in single file for easy exclusion from public distribution
- Repository is now safe for public distribution without exposing internal infrastructure
- Internal users can still access all internal resources from the consolidated `internal-references.md` file

## [2026-05-08] — Model Recommendations and OSPO Documentation

### Added
- **`#### Recommended Models` in Section 002 (Installation)** — two-part reference covering Monitor Diagnostician models (AWS Bedrock Claude 3.7/3.5 Sonnet, Opus, Haiku; OpenAI GPT-4o, GPT-4-turbo, GPT-4) and IDE AI Agent models (Windsurf Cascade/SWE-1, Claude Code, Devin/swe-1); clearly distinguishes which model context each table applies to
- **`#### Recommended Models` in Section 003 (Orchestration Service Auth)** — same two-part reference placed directly after the `config.json` example to provide immediate context for the `model_id` field; includes note that IDE agent model is configured independently of `config.json`
- **`CONTRIBUTING.md`** — OSPO-required contribution guidelines for external developers; covers contribution workflow, content standards, review process, and prerequisites
- **`CODE_OF_CONDUCT.md`** — OSPO-required standard community code of conduct based on Contributor Covenant 2.1; includes enforcement guidelines and community impact ladder
- **`SECURITY.md`** — OSPO-required security policy for vulnerability reporting; covers supported versions, private reporting process, security best practices for blueprints and training materials

### Changed
- **`README.md`** — updated Contributing section to reference the new `CONTRIBUTING.md` file; clarified distinction between training repository contributions and main Blueprint Assist project contributions

## [2026-05-06] — Section Restructuring

### Added
- **Section 007: Blueprint Monitoring** — new dedicated section for `dap-bpa monitor`, Blueprint Diagnostician, auto-repair flags, session lifecycle diagram, and prerequisites (requires DAP connection)

### Changed
- **Section reorder (006–009)** — Supported Blueprints moved to Section 6 (before Building Blueprints) per content-flow requirement; Building Blueprints → 7, Blueprint Monitoring → 8, Blueprint Reasoning → 9
- **Section 008 (Blueprint Reasoning)** — split from former combined section 007; monitoring content extracted; overview note added clarifying no DAP connection required
- **Next Steps added** to sections 006 (Supported Blueprints) and 007 (Blueprint Monitoring)
- **All cross-references updated** across sections 002, 004, 005, 008, and README to reflect new section numbering
- **README** — `## Important links ##` fixed to `## Important Links`; `## Blueprint Assist docs` capitalized; trailing whitespace removed; `bpa-toolkit` links renamed to `bpa-toolkit (GitHub)` and `bpa-toolkit (SharePoint)` per naming alignment; Getting Started section numbers corrected (11→12, 12→13)

### Fixed
- Removed remaining `<!-- Rob ... -->` developer comment from README Important Links section
- Removed Rob reorder comment from Section 009 (now 006) heading

## [2026-05-05] — Training Content Updates

### Added
- **`.9-prerequisites/installation-prerequisites.md`** — new reference guide covering CA certificate setup, Windows native install, WSL setup (Ubuntu 24.04), dap-bpa installation, profiles configuration, IDE connection, and verification steps
- **DAP Orchestrator Integration** key value proposition added to `README.md` and `section-001-introduction`
- **Next Steps sections** added to sections 002, 004, and 005 for consistent navigation
- **Changelog reference** added to `README.md` linking to `docs/CHANGELOG.md`

### Changed
- **`README.md`** — repository structure updated to reflect actual filesystem: added `.9-prerequisites/`, expanded `docs/` contents, `2.presentations/` files listed, `sample-demo-scripts/` and `target-build-folder/` added; section 3 description updated to use DAP terminology
- **`section-002-installation`** — added blockquote note clarifying scope vs `.9-prerequisites`; added LLM provider requirement to Account Requirements; fixed `dap-bpa setup-ide` command; removed dead PDF reference link; corrected network troubleshooting to target DAP orchestrator (not a remote dap-bpa service)
- **`section-003-orchestration-service-auth`** — replaced "NativeEdge" references with "DAP orchestrator" throughout; added terminology clarification blockquote; updated credential bullet to specify client ID, client secret, and tenant ID; updated `setup-ide` install list to include the `bpa` CLI
- **`section-004-skills-overview`** — rewrote Skill Categories to reflect actual plugin/workflow skills (`dap-plugin-*`, workflow, authoring); replaced non-existent `dap-bpa skills list/describe/search` commands with correct `dap-bpa knowledge` commands; updated Skill Versioning section to reflect bundle-based update model
- **`section-005-skills-architecture`** — updated "Synapse" to "System (e.g. Synapse, SNOW, Datadog, CI/CD)" in ASCII diagram and legend; clarified MCP Server role as bridge between agents/systems and DAP REST API; reordered and expanded Key Integration Points; added note on custom skill development being an advanced/contributor topic; replaced dead PDF reference with accurate links

### Fixed
- Removed all inline `<!-- Rob ... -->` developer comments from sections 001–005 and `.9-prerequisites`
- Corrected duplicate `### 2.` section numbering in `installation-prerequisites.md`
- Removed duplicate `NODE_TLS_REJECT_UNAUTHORIZED=0 dap-bpa setup` command

## [2026-05-11] — Folder Restructuring

### Changed
- **`.9-prerequisites/` folder removed** — environment setup files consolidated into `section-002-installation/` for better organization
- **`installation-prerequisites.md`** — moved from `.9-prerequisites/` to `1.sections/section-002-installation/`
- **`ssh-passthrough-setup.md`** — moved from `.9-prerequisites/` to `1.sections/section-002-installation/`
- **`README.md`** — updated repository structure to reflect removal of `.9-prerequisites/` folder; internal references link updated to note that internal resources are available upon request
- **`section-002-installation/content.md`** — updated references to point to `installation-prerequisites.md` and `ssh-passthrough-setup.md` within the same section instead of `.9-prerequisites/` folder
- **YAML example files** — updated references from `.9-prerequisites/internal-references.md` to note that internal resources are available upon request

### Removed
- **`.9-prerequisites/` folder** — removed as a separate folder; contents integrated into section-002-installation

---

## [2026-05-11] — dap-bpa v0.24.0 Documentation Updates

### Changed
- **Section 013 (dap-bpa CLI Commands)** — Updated to reflect dap-bpa v0.24.0 changes:
  - Added `dap-bpa orchestrator blueprints delete <id>` command (v0.24.0+)
  - Added `--blueprint-labels <labels>` option to `orchestrator blueprints upload` (v0.24.0+)
  - Updated release notes reference from v0.23.0 to v0.24.0
- **Section 002 (Installation)** — Added Windows installer documentation page (`windows-installer.md`)
  - Documented NSIS installer (recommended) with features: standards-compliant PE, signable, EDR/WDAC compliant
  - Documented PowerShell script installation method
  - Included uninstallation procedures for both methods
  - Added troubleshooting guide for Windows-specific issues
- **Section 002 (Installation)** — Updated main content.md to reference new Windows installer page

### Added
- **windows-installer.md** — Comprehensive Windows installation guide with NSIS installer and PowerShell script methods

---

## [2026-05-11] — dap-bpa v0.23.0 Documentation Reconciliation

### Changed
- **Section 013 (dap-bpa CLI Commands)** — Updated to reflect dap-bpa v0.23.0 changes:
  - Added `dap-bpa upgrade --file <zip>` command for binary replacement
  - Updated `setup-ide` to reflect expanded IDE support (windsurf, claude-code, cursor, jetbrains, vscode, antigravity)
  - Added new `knowledge secret-type list` and `knowledge secret-type get <type>` commands
  - Added `knowledge blueprints list [<query>]` command
  - Added `--environment <env-id>` option to `orchestrator deployments create`
  - Added new monitor options: `--deployment-id`, `--execution-id`, `--callback <url>`
  - Added monitor status options: `--status --execution-id <id>`, `--status --session-id <id>`
  - Updated global flags: `--output json|text` → `--json`, added `--fields`, `--dry-run`, `--trust-all`
  - Removed deprecated `knowledge types list` and `knowledge types get` commands (no longer in v0.23.0)
  - Updated release notes reference from v0.22.0 to v0.23.0
- **Section 002 (Installation)** — Updated Windows zip file pattern from `bpa-win-x64-v0.22.0-*.zip` to `bpa-win-x64-v0.*-*.zip` for version-agnostic matching

### Fixed
- Corrected global flag documentation to match actual dap-bpa v0.23.0 CLI behavior
- Ensured all documented commands match actual `dap-bpa --help` output for v0.23.0

---

## [2026-05-14] — Section 016: Tunnel Connections

### Added
- **Section 016: Tunnel Connections** — new section for SSH tunnel setup to access remote orchestrators through Windows jump hosts
  - SOCKS proxy tunnel configuration for browser access to any FQDN on remote networks
  - dap-bpa CLI integration via environment variables or direct port forwarding
  - Windows jump host OpenSSH Server setup instructions
  - Browser configuration for Chrome, Edge, and Firefox
  - Verification and troubleshooting guides
  - Keepalive settings to prevent tunnel drops

### Changed
- **README.md** — updated Training Sections count from 15 to 16; added Section 016 to list and repository structure

---

## [2026-05-15] — Section 017: Model and Architecture Decisions

### Added
- **Section 017: Model and Architecture Decisions** — new section covering AI model and tool comparisons, architecture patterns, and tool selection guidance
  - Devin vs Windsurf Cascade comparison table with feature breakdown
  - Windsurf architecture and account model (identity, billing, policy, model-access layer)
  - Basic Windsurf flow diagram showing how context moves from repo to hosted models
  - What Windsurf accounts control (identity, model access, usage limits, context, enterprise controls)
  - Devin architecture and integration (autonomous software engineer with external system connectors)
  - Typical Devin flow diagram showing GitHub, Slack, Jira, Linear integration
  - Tool selection guide table for Windsurf, Devin, and MCP/tools

### Changed
- **Section 002 (Installation)** — moved Devin vs Windsurf Cascade comparison content to Section 017; replaced with reference note pointing to new section
- **README.md** — updated Training Sections count from 16 to 17; added Section 017 to training sections list and repository structure

---

## [Unreleased]

> Upcoming changes not yet documented in a dated entry.

---

## [Initial] — Repository Initialization

### Added
- Initial project setup and README
- Training sections structure (section-001 through section-010)
- Important links section with bpa-toolkit repository references
- Repository structure documentation
- WSL File System Helper Script (`resources/helper-python/wsl-file-system-helper.sh`)
  - Addresses WSL file system caching issues that cause directory naming conflicts
  - Provides safe file operation functions (`safe_mkdir`, `safe_rename`, `safe_rmdir`, `safe_exists`)
  - Automatic WSL environment detection and PowerShell fallback for file operations
  - Environment diagnostic tools for development troubleshooting
- WindowsVM vSphere Blueprint example in `target-build-folder`
  - Windows Server 2019, 2022, 2025, and Windows 11 support
  - Uploaded to stamp1 orchestrator for testing

### Structure
- `2.presentations/` — presentation templates and materials
- `3.resources/` — reference docs, spec-kit, helper-python scripts, presentation generation tools
- `4.examples/sample-blueprints/` — example blueprints
- `4.examples/sample-specs/` — sample specification documents and templates
- `4.examples/target-build-folder/` — build output directory
- `1.sections/` — 12 comprehensive training sections covering Blueprint Assist fundamentals
