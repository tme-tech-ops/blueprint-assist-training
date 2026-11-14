# Capability Examples

This directory contains focused blueprint examples organized by Blueprint Assist
capability area. Each example demonstrates a specific capability with a README,
sample blueprint files, and step-by-step guidance. They complement the
infrastructure-focused examples in `../sample-blueprints/`.

## Available Examples

### 01-authoring/

Creating, validating, and generating inputs and outputs for blueprints.

- `create-new-blueprint/` - End-to-end blueprint creation workflow
- `validate-blueprint/` - Two-stage validation (lint, then schema)
- `generate-inputs-outputs/` - Input constraints and capability-based outputs

### 02-review/

Linting and rule compliance.

- `linting-best-practices/` - Walkthrough of blueprint-rules compliance

### 04-deployment/

Pre-flight validation and deployment execution.

- `pre-flight-checks/` - Pre-deployment validation pipeline
- `deployment-execution/` - Blueprint upload and deployment with monitoring

### 05-maintenance/

Day-2 operations.

- `drift-detection/` - Configuration drift detection and correction

## Usage

Each example directory contains a `README.md` with an overview and step-by-step
instructions, along with the blueprint files and supporting scripts it
references.
