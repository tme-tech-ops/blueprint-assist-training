# Changelog

Notable changes to the Blueprint Assist training content, by release.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions such as `dap-bpa v0.32.0` refer to the Blueprint Assist CLI release
the training content was checked against.

## v1.0.62 - 2026-11-11

### Changed

- Section 016 (Tunnel Connections): the browser flow is now Flow 1, first in
  the chart and the list; the dap-bpa CLI flows follow as Flows 2 to 7

## v1.0.61 - 2026-11-10

### Changed

- Section 016 (Tunnel Connections): reaching the portal through the hosts
  file now forwards local port 443, which the portal sign-in redirect needs,
  with the PowerShell command to add the entry and a setup for two or more
  labs at once

## v1.0.60 - 2026-11-10

### Added

- Section 016 (Tunnel Connections): architecture diagrams for every tunnel
  flow, with a chart for choosing the right one

### Changed

- Mermaid diagrams on the site no longer cut off label text
- Sample demo script: the non-consolidated spec is offered as an option for
  building the blueprint

## v1.0.59 - 2026-11-09

### Changed

- Section 016 (Tunnel Connections): browser access through the jump host now
  uses the SSH key and a separate Edge or Chrome profile, with a check that
  the tunnel is listening and a fix for lab names that do not resolve

## v1.0.58 - 2026-11-09

### Changed

- Section 016 (Tunnel Connections): key-based sign-in for Windows jump hosts,
  how to reach a portal that is only available through the jump host, a
  two-lab walkthrough, and more troubleshooting
- Corrected the `insecure` profile setting in Section 016 and `SECURITY.md`:
  dap-bpa treats it the same as `--trust-all`
- Replaced lab-specific names in the WindowsVM sample spec with placeholders

### Added

- `4.examples/tunnel-portal-proxy/`: a small local proxy for portal sign-in
  through a jump host when you cannot edit the hosts file

## v1.0.57 - 2026-11-09

### Changed

- Content refreshed for dap-bpa v0.33.0 and v0.33.1: native SSH tunnels to
  lab orchestrators, corporate proxy support, environment-variable credentials,
  safer bulk operations, new deployment, execution, plugin, and secret options,
  new exit codes, renamed MCP tools, batch Day-2 scans, the blueprint
  operations REST API and SDKs, CI/CD lifecycle automation, `--strict-naming`
  for pattern validation, skill lineage in `verify-skills`, and the TLS fixes
  for self-signed portals
- Section 016 (Tunnel Connections) now leads with the built-in
  `dap-bpa orchestrator tunnel` commands
- Section 020 (Dell Automation Studio Catalog) matches the current catalog:
  43 offers, including 19 Studio offers, with new AI, private cloud, and edge
  offers added and retired ones removed

### Fixed

- Removed commands and flags that do not exist in dap-bpa from Sections 004,
  005, 013, 016, and 026
- Corrected binary paths and IDE targets in the installation guides

## v1.0.56 - 2026-11-06

### Added

- Spec 101 starter (`4.examples/sample-specs/001-spec-plan-blueprint/`): a
  README and a `spec.md` template for first-time spec authors

### Changed

- The WindowsVM vSphere worked example moved to
  `4.examples/sample-specs/002-spec-plan-blueprint/`
- The WindowsVM example spec now records two issues found when uploading to an
  orchestrator: script-backed helper nodes need a custom node type, and input
  constraints must use the nested list form

## v1.0.53 to v1.0.55 - 2026-10-29

### Added

- Spec Kit templates for DAP blueprints (`3.resources/spec-kit/`): spec, tasks,
  and test-results templates with acceptance scenarios and a test plan
- Starter `.yamllint` and `.riskignore` files (`3.resources/blueprint-config/`)
- Test plans and acceptance scenarios for the sample spec and all catalog
  template specs

### Changed

- Constitution template 2.5.0: new Testing & Acceptance section; every
  requirement maps to an acceptance criterion and a recorded test
- Spec Kit deck: new testing slides
- Specs build each blueprint in a named folder under `target-build-folder` and
  finish by generating the Blueprint Visualizer

## v1.0.50 to v1.0.52 - 2026-10-26 to 2026-10-27

### Changed

- Constitution template 2.0.0 through 2.4.0: aligned with dap-bpa lint rules
  and visualizer risk findings; added target environment selection,
  composition, object types, custom workflows, and transport security guidance
- Training content aligned with `blueprint-rules.md` v1.4: corrected rule IDs
  and descriptions

### Fixed

- Lint and `validate-all` examples now show real dap-bpa output
- CI examples check reported findings instead of exit codes
- Blueprint changelog file name corrected to `CHANGELOG.md`
- Secret examples use `{ get_secret: { get_input: ... } }`

## v1.0.49 - 2026-10-22

### Added

- Podman installation steps (Windows, Linux, and WSL) and a PowerShell smoke
  test for the local agent MCP server

### Changed

- Training content licensed under CC BY 4.0 (see [`LICENSE`](LICENSE))

### Fixed

- Broken links in the published site

## v1.0.48 - 2026-10-14

### Added

- MCP demo configuration, presentation, and example

### Changed

- Content refreshed for dap-bpa v0.32.0: CLI parity commands, destructive
  operation confirmation, secret handling, and the standalone agent MCP server

## v1.0.43 to v1.0.47 - 2026-09-03 to 2026-09-17

### Added

- Sections 024-029: GCP agent generation, Docker sandbox images, MCP token
  management, Question Engine, Skill Benchmark Program, and Analytics Dashboard

### Changed

- Content refreshed for dap-bpa v0.30.1 and v0.31.0
- Learner feedback form improvements

## v1.0.34 to v1.0.42 - 2026-08-15 to 2026-08-25

### Added

- Section 023: Customer Pattern Learning

### Changed

- Content refreshed for dap-bpa v0.29.3
- Learner feedback form improvements
- Sample demo and spec file names zero-padded to three digits

## v1.0.26 to v1.0.33 - 2026-07-25 to 2026-08-12

### Added

- Section 022: Licensing Model
- Dell Automation Studio Basic Test Plan
- Catalog links and Blueprint Visualizer environment variables

### Changed

- NativeEdge references renamed to Dell Distributed Private Cloud
- CLI security flag and IDE support details updated

## v1.0.19 to v1.0.25 - 2026-07-15 to 2026-07-20

### Changed

- Content refreshed for dap-bpa v0.28.0, v0.28.1, and v0.28.2, including the
  React-based Blueprint Visualizer and its Risk Analysis panel
- Sample demo scripts updated

### Fixed

- Skill catalog and MCP server documentation corrections

## v1.0.1 to v1.0.18 - 2026-07-08 to 2026-07-14

### Added

- GitHub Pages site with sidebar navigation
- Section 021: Blueprint Visualizer
- Sample demo scripts

### Changed

- README, disclaimer, and learner assessment updates

## v1.0.0 - 2026-07-08

- First public release of the Blueprint Assist training content
