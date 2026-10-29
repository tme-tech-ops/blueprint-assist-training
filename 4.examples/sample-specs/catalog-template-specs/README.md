# Template Blueprint Specifications

This directory contains consolidated specification documents for blueprint templates based on the Dell Automation Studio catalog offers. Each spec-consolidated.md file provides a complete, ready-to-build specification for deploying specific infrastructure and application workloads using Dell Automation Platform (DAP) blueprints.

## Available Template Specifications

### Compute Templates
- **001-poweredge-redfish-spec-consolidated.md** - PowerEdge server lifecycle management using Dell OEM Redfish extension
- **002-kubernetes-cluster-spec-consolidated.md** - Kubernetes cluster deployment and orchestration
- **003-bare-metal-provisioning-spec-consolidated.md** - Bare-metal server provisioning for Dell PowerEdge infrastructure
- **017-ai-reference-workflows-spec-consolidated.md** - NVIDIA-validated AI reference workflows on Dell infrastructure
- **018-tgi-inference-spec-consolidated.md** - TGI LLM inference framework on Dell AI Platform with NVIDIA

### Database Templates
- **004-postgresql-deployment-spec-consolidated.md** - PostgreSQL database deployment and management
- **005-mysql-deployment-spec-consolidated.md** - MySQL database deployment and management

### DevOps & CI/CD Templates
- **006-terraform-iac-spec-consolidated.md** - Terraform infrastructure-as-code integration
- **007-jenkins-cicd-spec-consolidated.md** - Jenkins CI/CD server deployment
- **008-gitlab-deployment-spec-consolidated.md** - GitLab DevOps platform deployment
- **009-ansible-automation-spec-consolidated.md** - Ansible configuration management

### Observability & Monitoring Templates
- **010-prometheus-monitoring-spec-consolidated.md** - Prometheus monitoring and metrics collection
- **011-grafana-visualization-spec-consolidated.md** - Grafana visualization and dashboarding

### Platform Services Templates
- **012-vm-service-spec-consolidated.md** - VM-as-a-Service provisioning with policy-driven automation
- **019-dpc-kubernetes-spec-consolidated.md** - Dell Private Cloud Kubernetes deployment (k3s HA)

### Security & Compliance Templates
- **013-hashicorp-vault-spec-consolidated.md** - HashiCorp Vault secrets management

### Storage Templates
- **014-powerstore-storage-spec-consolidated.md** - Dell PowerStore storage array automation

### Web & Search Services Templates
- **015-nginx-webserver-spec-consolidated.md** - NGINX web server and reverse proxy
- **016-elasticsearch-search-spec-consolidated.md** - Elasticsearch search and analytics platform

## Specification Format

Each spec-consolidated.md file follows a standardized format:

1. **Header** - Feature name, creation date, and status
2. **Description** - Brief overview of what the blueprint deploys
3. **Inputs** - User-facing inputs and configuration options
4. **Secret Requirements** - Required secrets and their types (verified against DAP secret manager)
5. **Connection Details** - Network and API connection requirements
6. **Template Prerequisites** - Infrastructure and software prerequisites
7. **Outputs** - Expected outputs and deployment results
8. **Files** - Blueprint file structure and organization
9. **Catalog Template Reference** - Link to corresponding Dell Automation Studio catalog entry
10. **Target Build Folder** - The named folder the blueprint is always built in (`4.examples/target-build-folder/<Name>/`); nothing is written directly into `target-build-folder/`
11. **Icon** - Icon reference for the blueprint
12. **Constitution Reference** - Link to DAP Blueprint Core Standards
13. **Testing** - Numbered acceptance scenarios (AS-1, AS-2, ...), including re-run, partial install failure, and uninstall, with each Then clause observable on the deployed environment (constitution §5.7)
14. **Acceptance Coverage** - How the spec covers target modes, the air-gapped path, custom workflows, partial failure, uninstall, and re-run
15. **Done When** - Completion criteria: lint `errorsFound: 0`, `validate-all` `Total errors: 0`, every scenario passing in `test-results.md`, the visualizer generated, and the named build folder used
16. **Final Step - Visualizer** - The `dap-bpa blueprint visualize` command, run from the named folder, that saves `<Name>-visualizer.html` next to `blueprint.yaml`
17. **Reference Links** - Links to relevant documentation sections

## Usage

These specifications are designed to be used with Blueprint Assist (BPA) to generate production-ready DAP blueprints. Each spec provides:

- Complete input/output definitions
- Secret management requirements
- Network and security considerations
- File structure recommendations
- Validation criteria

To use a specification:

1. Review the spec-consolidated.md file for your desired template
2. Follow the patterns and requirements outlined in the specification
3. Use Blueprint Assist to generate the blueprint into its named folder under `4.examples/target-build-folder/`
4. Turn each acceptance scenario into a test task, run the tests against a non-production DAP environment, and record the results in `test-results.md`
5. Run `dap-bpa blueprint visualize` as the final step and keep the HTML in the blueprint folder
6. Deploy to your target environment using DAP orchestrator

For a fully worked example of the testing artifacts (`tasks.md` with a test plan and `test-results.md`), see [`../001-spec-plan-blueprint/`](../001-spec-plan-blueprint/spec.md).

## References

- [DAP Blueprint Core Standards](../../../3.resources/spec-kit/.specify/memory/constitution-template-blueprint.md)
- [Dell Automation Studio Catalog](../../../1.sections/section-020-dell-automation-studio-catalog/content.md)
- [Spec Considerations](../../../1.sections/section-018-spec-considerations/content.md)
- [Blueprint Anatomy](../../../1.sections/section-010-blueprint-anatomy/content.md)
- [Supported Blueprints](../../../1.sections/section-006-supported-blueprints/content.md)

## Notes

- All specifications follow the DAP Blueprint Core Standards constitution
- Secret requirements are verified against DAP secret manager types
- Network and security considerations are included for production deployments
- File structures follow DAP blueprint best practices
- Each spec includes completion criteria for validation
- Each spec includes acceptance scenarios and a coverage statement, as constitution §5.7 requires