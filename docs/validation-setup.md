# Validation Tools Setup

Per Constitution Section 5.2, this project requires industry-standard validation tools for code quality.

## Required Tools

### YAML Validation

- **yamllint**: Required for TOSCA/DSL YAML validation
- **Installation**: `pip install yamllint`

### Ansible Validation

- **ansible-lint**: Required for Ansible playbook validation
- **Installation**: `pip install ansible-lint`

### Terraform Validation

- **terraform**: Required for Terraform/OpenTofu validation
- **Installation**: Follow official Terraform/OpenTofu installation guide

### Helm Validation

- **helm**: Required for Helm chart validation
- **Installation**: Follow official Helm installation guide

### Kubernetes Validation

- **kubectl**: Required for Kubernetes manifest validation
- **Installation**: Follow official kubectl installation guide

## Installation Script

Run the following command to install all required validation tools:

```bash
# Install Python tools
pip install yamllint ansible-lint

# Install other tools (platform-specific)
# Follow official installation guides for terraform, helm, kubectl
```

## Validation Commands

### YAML Validation Command

```bash
yamllint -c .yamllint .
```

### Ansible Validation Command

```bash
ansible-lint path/to/your/blueprint/configuration/ansible/
```

### Terraform Validation Command

```bash
cd path/to/your/blueprint/terraform/
terraform validate
```

### Helm Validation Command

```bash
helm lint path/to/your/blueprint/helm/
```

### Kubernetes Validation Command

```bash
kubectl apply --dry-run=client -f path/to/your/blueprint/manifests/
```

> **Note**: Sample blueprints for use with these commands are available at [automation.dell.com/catalog](https://automation.dell.com/catalog).

## CI/CD Integration

These validation tools should be integrated into CI/CD pipelines to ensure constitution compliance (Section 5 - Governance).

## Current Status

- ✅ .yamllint configuration added to project root
- ⚠️ Validation tools require manual installation in development environment
- ⚠️ Automated validation pending CI/CD pipeline setup
