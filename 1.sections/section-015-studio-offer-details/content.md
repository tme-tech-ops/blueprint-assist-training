# Section 015: Dell Automation Studio Offer Details

> **Audience: sellers and account teams.** This is a commercial reference covering Dell Automation Studio licensing and packaging, not a hands-on engineering section. No dap-bpa tooling is required to read it.

## Overview

This section explains the commercial offering for Dell Automation Studio, the paid subscription tier of the Dell Automation Platform that enables customers to build their own automation blueprints and integrations.

---

## Dell Automation Platform vs. Dell Automation Studio

### Dell Automation Platform (Free)

Dell Automation Platform is the **no-cost orchestration layer** you get when you buy outcomes like Dell Private Cloud or Dell Distributed Private Cloud. It provides:

- Orchestration engine
- Validated Dell blueprints (DPC, AI, DDPC)
- Basic blueprint deployment and management
- Integration with Dell hardware infrastructure

### Dell Automation Studio (Paid Subscription)

Dell Automation Studio is a **paid subscription on that platform** for DevOps teams that want to build their own blueprints and integrations. It enables:

- Build-your-own automation capabilities
- Custom blueprint development using Blueprint Assist (BPA)
- Blueprint Assist CLI and skills
- Integration with third-party tools and platforms
- Advanced monitoring and diagnostician features
- Deploy customized Blueprints

---

## Licensing Model

### Custom Blueprint Deployment License Requirement

**Important**: Deployment of custom (customer-defined) blueprints is **only enabled with a Dell Automation Studio license**. The free Dell Automation Platform tier does not support deployment of custom blueprints.

- **Dell Automation Platform (Free)**: Can only deploy validated Dell blueprints (DPC, AI, DDPC)
- **Dell Automation Studio (Paid)**: Can deploy both validated Dell blueprints AND custom customer-defined blueprints

This means that while you can use Blueprint Assist tools to author and validate custom blueprints on the free tier, you cannot deploy them to a DAP orchestrator without a Studio license.

### Managed Resource Units (MRUs)

Dell Automation Studio is licensed using **Managed Resource Units (MRUs)**:

- **1 MRU = 1 physical managed asset**
  - Server
  - Storage cluster
  - Switch
  - GPU node

### Deployment Credits

Every MRU includes **30 deployment credits** for customer-defined blueprints:

- Credits are consumed only when deploying **customer-defined blueprints**
- Credits are consumed only on a successful deployment. Failed deployments do not consume deployment credits.
- Validated Dell outcomes (DPC, AI, DDPC) **do not consume these credits**

---

## Customer Communication

### How to Explain the Offering

**For customers or sellers, use this clean messaging:**

> **"Dell Automation Platform is the no-cost orchestration layer you get when you buy outcomes like Dell Private Cloud."**
>
> **"Dell Automation Studio is a paid subscription on that platform for DevOps teams that want to build their own blueprints and integrations."**

### Key Differentiators

| Feature | Dell Automation Platform | Dell Automation Studio |
| ------- | ------------------------ | ---------------------- |
| **Cost** | Free (included with outcomes) | Paid subscription (MRU-based) |
| **Blueprints** | Validated Dell blueprints only | Custom customer-defined blueprints |
| **Custom Blueprint Deployment** | ❌ Not supported | ✅ Supported (requires Studio license) |
| **Blueprint Assist** | Limited or not available | Full dap-bpa CLI, skills, and tools |
| **Custom Integrations** | Limited | Full integration capabilities |
| **Deployment Credits** | N/A (Dell blueprints don't consume credits) | 30 credits per MRU |

---

## Use Cases

### Platform Tier Use Cases

- Deploy Dell-validated blueprints for:
  - Dell Private Cloud (DPC)
  - AI workloads
  - Dell Distributed Private Cloud (DDPC) solutions
- Standard infrastructure deployment using Dell-provided outcomes
- Basic orchestration and management

### Studio Tier Use Cases

- Build custom blueprints for:
  - Application-specific infrastructure
  - Multi-vendor environments
  - Custom workflows and integrations
- Use Blueprint Assist CLI and skills for AI-powered blueprint development
- Integrate with third-party tools (CI/CD, monitoring, etc.)
- Advanced monitoring with `dap-bpa monitor` and LLM diagnostician
- Custom automation beyond Dell-validated outcomes

---

## Licensing Scenarios

### Example 1: Small Environment

- **Assets**: 10 servers, 2 storage clusters
- **MRUs**: 12 MRUs (10 + 2)
- **Deployment Credits**: 360 credits (12 × 30)
- **Use**: Deploy custom blueprints up to 360 times

### Example 2: Large Enterprise

- **Assets**: 100 servers, 10 storage clusters, 20 switches
- **MRUs**: 130 MRUs (100 + 10 + 20)
- **Deployment Credits**: 3,900 credits (130 × 30)
- **Use**: Deploy custom blueprints up to 3,900 times

---

## Next Steps

For customers interested in Dell Automation Studio:

1. Assess current infrastructure to calculate MRU requirements
2. Estimate deployment credit needs based on custom blueprint usage
3. Contact Dell sales representative for subscription pricing
4. Set up Dell Automation Platform account
5. Install Blueprint Assist CLI (see [Section 2: Installation](../section-002-installation/))
6. Begin building custom blueprints using Blueprint Assist (see [Section 7: Building Blueprints](../section-007-building-blueprints/))

---

## Reference

- **Dell Automation Platform Overview**: See internal Dell resources
- **Blueprint Assist Training**: This training repository
- **Licensing and Pricing**: Contact Dell sales representative
