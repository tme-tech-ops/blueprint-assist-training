# WindowsVM vSphere Blueprint - Consolidated Spec

**Feature**: 001-spec-plan-blueprint | **Created**: 2026-04-23 | **Status**: Ready

A one-page summary of [spec.md](spec.md). Hand this to the assistant for a quick
build, and refer to the full spec and data-model.md for detail.

## What it does

Deploys a customized Windows VM to VMware vSphere from a prepared template, driven
by the DAP TOSCA orchestrator. Supports Windows Server 2019/2022/2025 and Windows 11,
DHCP or static networking, named size flavors, and secrets-managed credentials.

## Requirements at a glance

- Multi-OS deployment selected by `os_type` and resolved to a vSphere template.
- DHCP or static networking (static IP, gateway, DNS, CIDR), mutually exclusive.
- Size flavors `small`, `medium`, `large`, `xlarge` map to fixed CPU and memory.
- Credentials read through `get_secret`; nothing stored in the blueprint or inputs.
- Configurable datastore, resource pool, VM folder, OS disk size, and provisioning.
- Outputs the VM name, IP address, administrator user, folder, datastore, and pool.

## Architecture

- Node type: `dell.nodes.vsphere.WindowsServer` (Windows guest, WinRM agent).
- Multi-file blueprint: `blueprint.yaml` plus `infrastructure/vsphere/{inputs,definitions,outputs}.yaml`, `example_JSON_configs/`, `CHANGELOG.yaml`, `README.md`, `icon.png`.
- Input groups: Connection, vSphere, Network.

## Success criteria

- A supported OS deploys and returns its IP within about ten minutes.
- Both DHCP and static networking paths succeed.
- Invalid inputs are rejected before provisioning with field-level messages.
- No plaintext credentials anywhere; blueprint passes lint and schema validation.

## See also

[spec.md](spec.md) · [plan.md](plan.md) · [research.md](research.md) · [data-model.md](data-model.md) · [quickstart.md](quickstart.md)
