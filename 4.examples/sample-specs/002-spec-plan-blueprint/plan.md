# Implementation Plan: WindowsVM vSphere Blueprint Enhancement

**Branch**: 002-spec-plan-blueprint | **Date**: 2026-04-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-spec-plan-blueprint/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The WindowsVM vSphere Blueprint is a production-ready infrastructure-as-code solution that automates Windows virtual machine deployment on VMware vSphere. The blueprint supports multiple Windows OS versions (Server 2019/2022/2025, Windows 11), provides flexible network configuration (DHCP/static IP), implements security best practices through secrets management, and offers scalable resource provisioning with multiple VM size flavors. The implementation leverages TOSCA-based orchestration with native vSphere integration for Windows customization.

## Technical Context

**Language/Version**: TOSCA YAML 1.0 with extensions  
**Primary Dependencies**: TOSCA Orchestrator, vSphere Plugin (>=3.0.0.0), TOSCA Types  
**Storage**: vSphere Datastores (thin/thick provisioning)  
**Testing**: Integration testing with vSphere environments, validation testing  
**Target Platform**: VMware vSphere 6.0+ environments  
**Project Type**: Infrastructure-as-Code Blueprint  
**Performance Goals**: VM deployment in <10 minutes, support for 100+ concurrent deployments  
**Constraints**: vSphere API rate limits, template availability, network configuration requirements  
**Scale/Scope**: Enterprise-scale VM deployments, multiple datacenter support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Architecture Compliance**: Blueprint follows TOSCA standards and orchestration patterns  
✅ **Security Standards**: Implements secrets management and secure credential handling  
✅ **Modularity**: Clear separation of concerns with modular infrastructure components  
✅ **Documentation**: Comprehensive documentation and example configurations  

## Project Structure

### Documentation (this feature)

```text
specs/002-spec-plan-blueprint/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan); includes the test plan
└── test-results.md      # Recorded test runs (constitution §5.7)
```

### Source Code (repository root)

```text
WindowsVM_Vsphere/
├── blueprint.yaml                    # Main blueprint definition
├── infrastructure/
│   └── vsphere/
│       ├── inputs.yaml               # Input parameters and validation
│       ├── definitions.yaml          # node_types + node_templates (vSphere
│       │                             #   VM, and the ConfigResolver custom
│       │                             #   node_type - see data-model.md)
│       ├── outputs.yaml              # Deployment capabilities
│       └── scripts/
│           └── resolve_config.py     # os_type/size -> template/cpus/memory
├── example_JSON_configs/             # Sample deployment configurations
│   ├── dhcp-medium.json
│   └── static-large.json
├── README.md                         # Comprehensive documentation
├── CHANGELOG.md                       # Version history (human-readable)
├── CHANGELOG.yaml                     # Version history (dap-bpa lint v0.31.0
│                                      #   requires this filename; see
│                                      #   constitution §5.4)
├── icon.png                          # Blueprint icon
└── WindowsVM_Vsphere-visualizer.html # Generated last; regenerate on change
```

**Structure Decision**: The blueprint uses a modular TOSCA-based structure with clear separation between the main blueprint definition, infrastructure components, example configurations, and documentation. This structure enables easy maintenance, testing, and extension of the blueprint functionality.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
| `allow_insecure: true` default + CLI `--trust-all` / `NODE_TLS_REJECT_UNAUTHORIZED=0` for lab uploads (§4.3) | The lab orchestrator and lab vCenter use self-signed certificates; `--trust-all` alone did not bypass TLS verification for the dap-bpa CLI's auth/token-exchange step during blueprint upload testing on 2026-11-04 (see test-results.md) | A verified-TLS default is not rejected - `allow_insecure` still defaults to the input's declared value and is only a literal, never sourced from the secret (see spec-consolidated.md "Connection - self-signed / insecure vCenter"); the CLI workaround is scoped to local lab testing, not the blueprint's production default, and does not change `allow_insecure`'s behavior |
