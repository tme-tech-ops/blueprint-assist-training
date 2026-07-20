# Security Policy

## Supported Versions

This is a training repository containing documentation and example blueprints. Security patches are applied on an as-needed basis.

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it privately to us before disclosing it publicly.

### How to Report

1. **Do not** open a public issue on GitHub
2. Send an email to the security contact at: <blueprint.assist.training@dell.com>
3. Include the following information in your report:
   - Description of the vulnerability
   - Steps to reproduce the vulnerability
   - Potential impact of the vulnerability
   - Any suggested mitigation or fix (if known)

### What Happens Next

- We will acknowledge receipt of your report within 48 hours
- We will work with you to understand and validate the vulnerability
- We will determine a timeline for remediation based on severity
- We will notify you when the issue is resolved

### Security Contact

If you need to reach the security team for any reason, contact us at:

- **Email**: <blueprint.assist.training@dell.com>

## Security Best Practices

### For Blueprint Examples

When using or modifying the example blueprints in this repository:

- **Never commit secrets** — do not include API keys, passwords, or other sensitive credentials in blueprints or documentation
- **Use environment variables** — configure sensitive values via orchestrator secrets or environment variables
- **Review before deployment** — always review and test blueprints in a non-production environment first
- **Follow least privilege** — ensure orchestrator credentials have only the permissions they need

### For Training Materials

- **Verify orchestrator URLs** — ensure you are connecting to the correct DAP orchestrator
- **Use SSL/TLS** — always use HTTPS connections to orchestrators when possible
- **Keep software updated** — maintain updated versions of dap-bpa and related tools
- **Report issues** — if you discover a security issue in the training materials, report it per the process above

## Common Security Considerations

### Credential Management

- Store orchestrator credentials securely (e.g., in credential managers or encrypted files)
- Use service accounts with limited permissions for automated operations
- Rotate credentials regularly
- Never log credentials in plain text

### SSL/TLS Configuration

- Use valid SSL certificates for orchestrator connections
- Configure `ssl_verify: true` in production environments
- Only use `--skip-ssl-verify` in development/testing with proper authorization
- Keep CA certificates up to date

### Blueprint Security

- Validate all blueprint inputs before deployment
- Review blueprint dependencies and external references
- Use signed blueprints from trusted sources when possible
- Audit blueprint permissions and access controls

## Security Announcements

Security announcements will be published in the [CHANGELOG](docs/CHANGELOG.md) and communicated through official Dell channels.

## Related Resources

- [Dell Security](https://www.dell.com/support/security)
- [Dell Automation Platform Security](https://www.dell.com/support/kbdoc/en-us/000123456/) (replace with actual link)
- [Blueprint Developer's Guide - Security Section](https://dl.dell.com/content/manual39624970-dell-automation-platform-blueprint-developer-s-guide.pdf?language=en-us)

## Acknowledgments

We thank all researchers and community members who help keep this training repository and the broader Blueprint Assist ecosystem secure.
