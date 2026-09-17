# Section 027: Question Engine & Prompt Coaching

> **Audience: blueprint authors, DevOps teams, and infrastructure engineers.** This section covers interactive prompt refinement, multi-turn Q&A coaching, and guided blueprint authoring workflows. New in v0.30.1+.

---

## Overview

The Question Engine provides an interactive workflow for refining vague or incomplete blueprint requirements. Instead of writing perfect prompts upfront, you can iteratively ask questions, answer them, and receive coached follow-up guidance that progressively shapes your blueprint specification.

### Key Capabilities

- **Intent-Based Questions** — AI asks clarifying questions based on your initial intent
- **Multi-Turn Refinement** — Iterative Q&A that narrows down ambiguous requirements
- **Coached Responses** — Suggestions and examples help you formulate better answers
- **Refined Prompt** — At the end, you get a production-ready blueprint generation prompt
- **Assumption Tracking** — AI notes assumptions it's making and lets you correct them
- **Low-Confidence Flagging** — AI highlights areas needing more information

---

## Quick Start: Interactive Prompt Coaching

### Start with a Basic Intent

```bash
# Begin coaching session with a rough idea
dap-bpa questions ask --intent "Deploy Kubernetes on AWS"
```

The AI responds with clarifying questions:

```text
Coaching Session: Deploy Kubernetes on AWS

I found some areas that need clarification. Let me ask you a few questions:

Q1. Which Kubernetes distribution do you prefer?
    a) Amazon EKS (managed)
    b) Self-managed on EC2 instances
    c) No preference

Q2. How many worker nodes do you need?
    a) Single node (dev/test)
    b) 2-5 nodes (small production)
    c) 5+ nodes (large production)
    d) Auto-scaling cluster

Q3. Do you need persistent storage?
    a) No, stateless workloads only
    b) Yes, EBS volumes
    c) Yes, managed database (RDS)

Q4. What's your networking model?
    a) Default VPC
    b) Custom VPC with specific CIDR ranges
    c) Multi-region with cross-VPC peering

Please answer (1-4, or skip with 'next'):
```

### Answer Questions Interactively

```bash
# Submit answers in JSON
dap-bpa questions update --answers '{
  "Q1": "a",
  "Q2": "b",
  "Q3": "c",
  "Q4": "b"
}'
```

The AI responds with follow-up questions based on your answers:

```text
Great! Based on your answers:
- Using Amazon EKS (managed)
- 2-5 worker nodes
- RDS database for persistence
- Custom VPC setup

Now I have follow-up questions:

Q5. Which database engine for RDS?
    a) PostgreSQL
    b) MySQL
    c) Aurora (PostgreSQL compatible)
    d) Undecided

Q6. What's your custom VPC CIDR range? (e.g., <custom-vpc-cidr>)

Q7. Do you need an Application Load Balancer?
    a) Yes, for web traffic
    b) No, internal services only

Please answer Q5-Q7:
```

### Complete the Coaching Session

```bash
# Answer remaining questions
dap-bpa questions update --answers '{
  "Q5": "a",
  "Q6": "<custom-vpc-cidr>",
  "Q7": "a"
}'
```

Result: Refined prompt ready for blueprint generation

```text
Coaching Complete! Here's your refined blueprint prompt:

"Deploy an Amazon EKS cluster with:
- 3 worker nodes (t3.medium instances)
- PostgreSQL RDS database (allocated storage: 20GB)
- Custom VPC with CIDR <custom-vpc-cidr> and public/private subnets
- Application Load Balancer for ingress traffic
- Auto-scaling policies based on CPU and memory metrics
- VPC Endpoint for S3 access
- CloudWatch monitoring and logging to CloudWatch Logs
- IAM roles for node and pod service accounts
- Secrets Manager integration for database credentials"

Ready to generate? (run below or modify the prompt first)

dap-bpa blueprint generate --prompt "Deploy an Amazon EKS cluster..."
```

---

## Question Engine Workflows

### Workflow 1: Minimal Intent → Full Specification

Best for: Rough ideas, exploratory requirements

```bash
# Start minimal
dap-bpa questions ask --intent "Kubernetes on AWS"

# Answer questions iteratively
dap-bpa questions update --answers '{
  "Q1": "a",
  "Q2": "b"
}'

# Keep answering follow-ups until complete
dap-bpa questions update --answers '{
  "Q3": "c",
  "Q4": "b",
  "Q5": "a"
}'

# Get refined prompt
dap-bpa questions show --refined-prompt
```

### Workflow 2: Detailed Intent with Corrections

Best for: Complex requirements with assumptions to fix

```bash
# Start with detailed intent
dap-bpa questions ask --intent "
  Deploy a HA PostgreSQL cluster on vSphere with:
  - 3 master nodes (8vCPU, 16GB RAM)
  - 5 replica nodes
  - 500GB shared storage
  - Automatic failover
  - Backup to S3 daily
"

# Review AI assumptions
dap-bpa questions show --assumptions

# Correct any wrong assumptions
dap-bpa questions update --corrections '{
  "assumption_5": {
    "original": "Using Ubuntu 20.04 for OS",
    "correction": "We need Ubuntu 22.04 with specific kernel patches"
  }
}'
```

### Workflow 3: Iterative Refinement with Examples

Best for: Learning what's possible while defining requirements

```bash
# Ask about options
dap-bpa questions ask --intent "Deploy a web application" --show-examples

# Review examples to inform your decisions
# Output shows:
# Example 1: Simple monolithic app
# Example 2: Microservices with service mesh
# Example 3: Serverless (containers + managed services)

# Answer with inspiration from examples
dap-bpa questions update --answers '{
  "architecture": "microservices",
  "service_mesh": true,
  "container_platform": "kubernetes"
}'
```

---

## Question Engine API Reference

### `questions ask`

Start an interactive coaching session.

```bash
dap-bpa questions ask \
  --intent "Your rough blueprint idea" \
  [--show-examples] \
  [--domain gcp|aws|vsphere|kubernetes] \
  [--session-id <id>]
```

**Options:**

- `--intent` (required) — Your initial infrastructure goal
- `--show-examples` — Display reference architectures
- `--domain` — Focus questions on specific platform (improves relevance)
- `--session-id` — Resume a previous coaching session

**Output:**

- Clarifying questions
- Assumption log
- Low-confidence flags

### `questions update`

Answer questions and get follow-ups.

```bash
dap-bpa questions update \
  --answers '{json}'  \
  [--corrections '{json}'] \
  [--context 'additional context']
```

**Options:**

- `--answers` — JSON map of question IDs to answers (e.g., `{"Q1": "a", "Q2": "b"}`)
- `--corrections` — Fix AI assumptions that don't match your intent
- `--context` — Add clarification without answering a specific question

**Output:**

- Follow-up questions (if more clarification needed)
- Updated assumption log
- Progress indicator

### `questions show`

Display session state without advancing.

```bash
dap-bpa questions show \
  --refined-prompt \
  [--assumptions] \
  [--low-confidence] \
  [--context]
```

**Output:**

- `--refined-prompt` — Generated prompt for blueprint generation
- `--assumptions` — List of AI assumptions about your intent
- `--low-confidence` — Requirements flagged as unclear
- `--context` — Full conversation history

### `questions export`

Save session for later use or sharing.

```bash
dap-bpa questions export \
  --format yaml|json \
  --output <filename>
```

Useful for:

- Documenting requirement gathering
- Sharing coaching session with team
- Archiving decision rationale

---

## Real-World Examples

### Example 1: E-Commerce Backend Refinement

**Initial Intent (too vague):**

```text
Deploy a backend for an e-commerce site
```

**Coaching Questions & Answers:**

```text
Q1. Traffic volume?
A: "1000 requests/second expected, scaling to 10k/sec during peak"

Q2. Technology preferences?
A: "Node.js with PostgreSQL, prefer serverless if scalable enough"

Q3. Multi-region?
A: "Primary region (us-east-1), read replicas in eu-west-1 and ap-southeast-1"

Q4. CI/CD integration?
A: "GitHub Actions for automation"

Q5. Compliance requirements?
A: "PCI-DSS for payment processing, GDPR for user data"
```

**Refined Prompt Generated:**

```text
"Deploy a multi-region e-commerce backend:
- Node.js API on AWS Lambda with API Gateway
- PostgreSQL RDS primary (us-east-1) with read replicas (eu-west-1, ap-southeast-1)
- DynamoDB for session/cache (pay-per-request model for variable scaling)
- RDS automatic failover with 5-minute RTO
- VPC with private subnets for databases, public for API Gateway
- Secrets Manager for API keys and database credentials
- CloudWatch metrics, alarms, and X-Ray tracing
- WAF rules for OWASP Top 10 (PCI-DSS compliance)
- GitHub Actions pipeline: lint → test → deploy
- CodeDeploy for blue-green deployments"
```

### Example 2: On-Premises Kubernetes Cluster

**Initial Intent:**

```text
Set up Kubernetes on our Dell PowerEdge servers
```

**Coaching Path:**

```text
AI Assumption: You want EKS on EC2? 
Correction: "No, we have on-prem hardware already. Self-managed K8s."

Q1. Kubernetes version preference?
A: "1.28 with recent CVE patches"

Q2. Container runtime?
A: "containerd, not Docker"

Q3. Storage backend?
A: "Dell PowerVault SAN - 10TB shared storage"

Q4. Networking?
A: "Calico CNI with network policies for security"

Q5. Load balancing?
A: "MetalLB for LoadBalancer services (we don't have cloud LBs)"

Q6. Backup strategy?
A: "Velero for cluster backup to NFS"

Q7. Monitoring?
A: "Prometheus + Grafana (prefer Helm charts)"
```

**Refined Prompt:**

```text
"Deploy Kubernetes 1.28 on on-premises Dell PowerEdge infrastructure:
- 1 control plane node (8vCPU, 16GB RAM)
- 3 worker nodes (16vCPU, 32GB RAM each)
- containerd 1.7+ runtime
- Calico CNI with NetworkPolicy enforcement
- MetalLB for LoadBalancer services (IP range <metallb-ip-range>)
- Dell PowerVault SAN integration via iSCSI
- Persistent Volume Provisioner for block storage
- Velero for disaster recovery and backup (target: NFS share)
- Prometheus operator with Grafana via Helm
- RBAC with separate service accounts per namespace
- CoreDNS for service discovery
- 6-month certificate rotation for all TLS certificates"
```

---

## Best Practices

### 1. Start Specific, Not Minimal

```bash
# Better: Includes context
dap-bpa questions ask --intent "
  Deploy a machine learning training pipeline on AWS:
  - TensorFlow model training on GPU
  - 500GB dataset on S3
  - Training runs 4 hours, 2-3 times per week
  - Output model to S3 for inference service
"

# Less helpful: Too vague
dap-bpa questions ask --intent "ML on AWS"
```

### 2. Answer Honestly, Flag Uncertainties

When you don't know the answer:

```bash
dap-bpa questions update --answers '{
  "Q1": "a",
  "Q2": "UNCERTAIN",
  "context": "For Q2, we need to consult with the security team about data residency requirements"
}'
```

### 3. Use `--show-examples` for Learning

```bash
# See reference architectures before deciding
dap-bpa questions ask --intent "Data warehouse on cloud" --show-examples

# Review examples, then:
dap-bpa questions update --answers '{
  "architecture": "data_lake_medallion_pattern"
}'
```

### 4. Review Assumptions Mid-Session

```bash
# Check what AI is assuming about your requirements
dap-bpa questions show --assumptions

# Correct wrong assumptions early
dap-bpa questions update --corrections '{
  "assumption_3": {
    "original": "Single-region deployment",
    "correction": "Multi-region with active-active replication"
  }
}'
```

### 5. Export Session for Team Review

```bash
# Save coaching session for team discussion
dap-bpa questions export --format yaml --output kubernetes-req-coaching.yaml

# Share with team, gather feedback, then generate blueprint
cat kubernetes-req-coaching.yaml  # Review
dap-bpa blueprint generate --prompt "$(dap-bpa questions show --refined-prompt)"
```

---

## Troubleshooting

### Question Engine Returns Vague Follow-Ups

**Symptom**: Follow-up questions don't help narrow down requirements

**Cause**: Initial intent was too vague

**Solution**: Provide more context:

```bash
dap-bpa questions update --context "
  We have:
  - 50 employees accessing the system concurrently
  - Peak load during 9am-5pm EST
  - Data retention requirement: 7 years
  - Budget constraint: $50k/month
  - Team has Kubernetes expertise but not AWS ECS"
```

### Questions Assume Wrong Domain

**Symptom**: All questions are about AWS but we use vSphere

**Cause**: `--domain` flag not set correctly

**Solution**: Specify domain when starting:

```bash
dap-bpa questions ask --intent "Deploy database cluster" --domain vsphere
```

### Refined Prompt Seems Incomplete

**Symptom**: Missing important details like backup strategy, monitoring

**Cause**: Those topics weren't covered in Q&A

**Solution**: Ask more questions or use `--corrections` to add details:

```bash
dap-bpa questions update --corrections '{
  "new_requirement": "Add daily automated backups to S3 with 30-day retention"
}'
```

### Can't Resume Previous Session

**Symptom**: Starting a new session loses previous answers

**Cause**: Session ID not saved

**Solution**: Always export and save:

```bash
# During session, save session ID
SESSION_ID=$(dap-bpa questions show --session-id)

# Later, resume:
dap-bpa questions ask --intent "same intent" --session-id $SESSION_ID
```

---

## Integration with Blueprint Generation

### Full Pipeline: Questions → Blueprint

```bash
#!/bin/bash
set -e

echo "Step 1: Coaching session"
dap-bpa questions ask --intent "Deploy web application on Kubernetes"

echo "Step 2: Answer questions (interactive)"
# User answers questions...

echo "Step 3: Get refined prompt"
REFINED_PROMPT=$(dap-bpa questions show --refined-prompt)

echo "Step 4: Generate blueprint"
dap-bpa blueprint generate --prompt "$REFINED_PROMPT" --output ./my-blueprint

echo "Step 5: Validate"
dap-bpa blueprint lint --file ./my-blueprint/blueprint.yaml --verify

echo "Blueprint ready for deployment!"
```

### Automated: Use Refined Prompt in CI/CD

```yaml
# GitHub Actions example
name: Generate Blueprint from Questions

on:
  workflow_dispatch:
    inputs:
      intent:
        description: 'Infrastructure intent'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install BPA
        run: npm install -g @dell/blueprint-assist
      
      - name: Run coaching session
        run: |
          dap-bpa questions ask --intent "${{ github.event.inputs.intent }}" \
            --domain aws \
            --show-examples
      
      - name: Generate blueprint (after manual Q&A)
        run: |
          PROMPT=$(dap-bpa questions show --refined-prompt)
          dap-bpa blueprint generate --prompt "$PROMPT" --output ./generated-blueprint
      
      - name: Validate generated blueprint
        run: |
          dap-bpa blueprint lint --file ./generated-blueprint/blueprint.yaml --verify
      
      - name: Create PR with generated blueprint
        uses: actions/create-pull-request@v4
        with:
          commit-message: 'Auto-generated blueprint from coaching'
          title: 'Generated: ${{ github.event.inputs.intent }}'
          body: 'Blueprint auto-generated from interactive coaching session'
          branch: auto-generated-blueprint
```

---

## Next Steps

1. **Try a coaching session**: `dap-bpa questions ask --intent "Your infrastructure goal"`
2. **Answer questions interactively**: `dap-bpa questions update --answers '{"Q1": "a"}'`
3. **Generate blueprint from refined prompt**: Use the output with `dap-bpa blueprint generate`
4. **Integrate with your workflow**: Export coaching sessions for team review before generation
