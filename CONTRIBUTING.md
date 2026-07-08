# Contributing to Blueprint Assist Training

Thank you for your interest in contributing to the Blueprint Assist Training repository. This document outlines how to submit contributions.

## Overview

This repository contains training materials, documentation, and example blueprints for Blueprint Assist (BPA), an AI-powered infrastructure deployment tool for the Dell Automation Platform.

## Types of Contributions

We welcome the following types of contributions:

- **Documentation improvements** — corrections, clarifications, or expansions to training sections
- **Example blueprints** — new or improved example blueprints for learning and reference
- **Demo scripts** — step-by-step walkthrough scripts for live demonstrations
- **Bug fixes** — corrections to errors in documentation, scripts, or configuration files
- **Translations** — translations of training materials into other languages (if applicable)

## Getting Started

### Prerequisites

- Familiarity with Blueprint Assist and the Dell Automation Platform
- Understanding of infrastructure-as-code concepts (TOSCA, blueprints, workflows)
- Access to a DAP orchestrator for testing blueprint examples (optional but recommended)

### Setting Up Your Development Environment

1. Clone the repository:

```bash
git clone https://github.com/your-org/blueprint-assist-training.git
cd blueprint-assist-training
```

1. Review the training materials in `1.sections/` to understand the content structure

2. Install dap-bpa following the instructions in `1.sections/section-002-installation/`

3. (Optional) Set up a DAP orchestrator connection following `1.sections/section-003-orchestration-service-auth/`

## Contribution Workflow

### 1. Check for Existing Issues

Before creating new content, check the [Issues](https://github.com/your-org/blueprint-assist-training/issues) to see if someone is already working on similar changes.

### 2. Create a Branch

Create a new branch for your contribution:

```bash
git checkout -b feature/your-contribution-name
```

### 3. Make Your Changes

- For documentation: edit the relevant `.md` file in `1.sections/`
- For examples: add or modify files in `4.examples/`
- For demo scripts: update files in `4.examples/sample-demo-scripts/`

### 4. Follow Content Guidelines

- **Markdown formatting**: Use standard Markdown syntax
- **Section numbering**: Maintain the existing section structure (001, 002, etc.)
- **Code blocks**: Use fenced code blocks with language identifiers (\`\`\`bash, \`\`\`yaml, etc.)
- **Links**: Use relative links for internal references
- **Clarity**: Write clear, concise explanations suitable for technical audiences

### 5. Test Your Changes

- Verify all links work correctly
- Ensure code examples are accurate and runnable
- Test any example blueprints against a DAP orchestrator (if applicable)
- Check for spelling and grammatical errors

### 6. Submit a Pull Request

1. Commit your changes with a descriptive message:

```bash
git add .
git commit -m "Add: new section on advanced blueprint patterns"
```

1. Push your branch:

```bash
git push origin feature/your-contribution-name
```

1. Open a Pull Request on GitHub with:
   - A clear title describing your changes
   - A detailed description of what you changed and why
   - Links to related issues (if any)
   - Screenshots for documentation changes (if applicable)

### 7. Review Process

Your pull request will be reviewed by maintainers. Be prepared to:

- Respond to feedback and make requested changes
- Answer questions about your contribution
- Update documentation based on review comments

## Content Standards

### Documentation

- Use inclusive language
- Provide step-by-step instructions for complex procedures
- Include code examples where helpful
- Add "Next Steps" sections to guide learners to related content

### Example Blueprints

- Follow TOSCA blueprint structure
- Include clear comments explaining each component
- Document all required inputs and outputs
- Test against a real DAP orchestrator before submission

### Demo Scripts

- Number steps sequentially
- Include expected outputs for verification
- Note any prerequisites or environment requirements
- Keep scripts focused and concise

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

## Security

If you discover a security vulnerability, please do not open a public issue. Instead, follow the reporting guidelines in [SECURITY.md](SECURITY.md).

## Questions?

For questions about contributions that are not covered here, please:

- Open an issue on GitHub with the `question` label
- Contact the maintainers via the repository's communication channel

## License

By contributing to this repository, you agree that your contributions will be licensed under the same license as the project. Please refer to the main Blueprint Assist project for licensing information.

---

Thank you for contributing to Blueprint Assist Training!
