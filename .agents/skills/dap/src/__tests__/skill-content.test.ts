import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseSkillFrontmatter } from '../../../../../scripts/__tests__/skill-frontmatter-helpers';

describe('dap SKILL.md content verification', () => {
  const skillPath = join(__dirname, '../../SKILL.md');
  const skillContent = readFileSync(skillPath, 'utf-8');

  describe('Secret Inputs guidance (Issue #610)', () => {
    it('should include secret_key in Input Properties Reference table type column', () => {
      expect(skillContent).toContain('`string`, `integer`, `float`, `boolean`, `list`, `dict`, `textarea`, `secret_key`');
    });

    it('should warn against defaults for secret_key in Input Properties Reference table', () => {
      expect(skillContent).toMatch(/Default value.*NEVER for `secret_key` type.*\(SC-001, SC-002\)/);
    });

    it('should have Secret Inputs (CRITICAL) section', () => {
      expect(skillContent).toContain('#### Secret Inputs (CRITICAL)');
    });

    it('should explicitly state secrets must never have default values', () => {
      expect(skillContent).toContain('**Secrets must NEVER have default values.**');
      expect(skillContent).toMatch(/security requirement.*\(SC-001, SC-002\)/);
    });

    it('should show secret_key input example with no default', () => {
      const secretInputExample = /```yaml\s+inputs:\s+api_key:\s+type: secret_key\s+display_label: API Key\s+description:.*\s+# NO DEFAULT - secrets must never have defaults/;
      expect(skillContent).toMatch(secretInputExample);
    });

    it('should show nested get_secret resolution pattern', () => {
      expect(skillContent).toContain('**When using secrets in node properties, always resolve via nested get_secret:**');
      expect(skillContent).toContain('api_credentials: { get_secret: { get_input: api_key } }');
    });

    it('should warn against direct get_input usage for sensitive properties', () => {
      expect(skillContent).toMatch(/Never use.*get_input.*directly for sensitive properties/);
      expect(skillContent).toContain('Always use `{ get_secret: { get_input: ... } }` to retrieve from the secret store at runtime');
    });
  });

  describe('Pre-finish Quality Checklist (Issue #610)', () => {
    it('should have Before You Finish — Quality Checklist section', () => {
      expect(skillContent).toContain('### Before You Finish — Quality Checklist');
    });

    it('should appear after Step 7 (Validate)', () => {
      const validateSection = skillContent.indexOf('### 7. Validate');
      const checklistSection = skillContent.indexOf('### Before You Finish — Quality Checklist');
      expect(validateSection).toBeGreaterThan(0);
      expect(checklistSection).toBeGreaterThan(validateSection);
    });

    it('should reference benchmark quality-score impact', () => {
      expect(skillContent).toMatch(/these account for most benchmark quality-score loss/i);
    });

    it('should include secrets checklist item covering secret_key and string-typed sensitive inputs', () => {
      expect(skillContent).toMatch(/\*\*\[Secrets\]\*\*.*type: secret_key.*NO default value/);
      expect(skillContent).toMatch(/type: string.*password, token, or credential.*no default/);
      expect(skillContent).toMatch(/SC-001, SC-002.*sensitive-input-no-default.*sensitive-property-use-get-secret/);
    });

    it('should include capabilities checklist item with rule reference', () => {
      expect(skillContent).toMatch(/\*\*\[Capabilities\]\*\*.*capabilities:.*section/);
      expect(skillContent).toMatch(/CP-001.*no-capabilities-defined/);
    });

    it('should include lifecycle checklist item with rule references', () => {
      expect(skillContent).toMatch(/\*\*\[Lifecycle\]\*\*.*create.*delete.*start.*stop/);
      expect(skillContent).toMatch(/ND-002, ND-003.*node-missing-lifecycle/);
    });

    it('should include duplicate blocks checklist item with rule reference', () => {
      expect(skillContent).toMatch(/\*\*\[Duplicate blocks\]\*\*.*dsl_definitions/);
      expect(skillContent).toMatch(/DS-001.*dsl-duplicate-block/);
    });

    it('should include lint verification checklist item', () => {
      expect(skillContent).toMatch(/\*\*\[Lint verification\]\*\*.*dap-bpa blueprint lint.*--verify/);
    });

    it('should have exactly 6 checklist items', () => {
      const checklistStart = skillContent.indexOf('### Before You Finish — Quality Checklist');
      const checklistEnd = skillContent.indexOf('\n---\n', checklistStart);
      const checklistSection = skillContent.substring(checklistStart, checklistEnd);

      const checklistItems = checklistSection.match(/- \*\*\[/g);
      // 5 from issue #610 plus [Origin indicator] from issue #1328
      expect(checklistItems).toHaveLength(6);
    });

    it('should use "before considering the blueprint complete" (not stale pre-validation wording)', () => {
      expect(skillContent).toContain('fix ALL errors before considering the blueprint complete');
      expect(skillContent).not.toContain('before proceeding to validation');
    });
  });

  describe('Checklist placement and structure', () => {
    it('should place checklist before Blueprint Authoring Reference section', () => {
      const checklistSection = skillContent.indexOf('### Before You Finish — Quality Checklist');
      const authoringSection = skillContent.indexOf('## Blueprint Authoring Reference');
      expect(checklistSection).toBeGreaterThan(0);
      expect(authoringSection).toBeGreaterThan(checklistSection);
    });

    it('should maintain 7-step workflow structure', () => {
      expect(skillContent).toContain('### 1. Combined search');
      expect(skillContent).toContain('### 2. Targeted research');
      expect(skillContent).toContain('### 3. Propose');
      expect(skillContent).toContain('### 4. Look up node types');
      expect(skillContent).toContain('### 5. Build the blueprint');
      expect(skillContent).toContain('### 6. Lint');
      expect(skillContent).toContain('### 7. Validate');
    });
  });

  describe('GitHub Repository Context routing (Issue #792)', () => {
    it('should have Routing — GitHub repository context section', () => {
      expect(skillContent).toContain('## Routing — GitHub repository context');
    });

    it('should route to references/github-context.md', () => {
      expect(skillContent).toContain('**load `references/github-context.md`**');
    });

    it('should mention key workflow steps in routing description', () => {
      expect(skillContent).toContain('input collection → validation → sparse fetch → generation workflow');
    });

    it('should include GitHub URL format in routing description', () => {
      expect(skillContent).toContain('https://github.com/owner/repo');
    });

    it('should appear before Runtime Mode section', () => {
      const contextSection = skillContent.indexOf('## Routing — GitHub repository context');
      const runtimeSection = skillContent.indexOf('## Runtime Mode');
      expect(contextSection).toBeGreaterThan(0);
      expect(runtimeSection).toBeGreaterThan(contextSection);
    });
    
    it('should appear after artifact wrapping routing', () => {
      const artifactSection = skillContent.indexOf('## Routing — artifact wrapping requests');
      const contextSection = skillContent.indexOf('## Routing — GitHub repository context');
      expect(artifactSection).toBeGreaterThan(0);
      expect(contextSection).toBeGreaterThan(artifactSection);
    });

    it('should be listed in Reference Files table', () => {
      expect(skillContent).toContain('`references/github-context.md`');
      expect(skillContent).toContain('GitHub repository context ingestion');
    });
  });

});

describe('dap SKILL.functions.md content verification', () => {
  const functionsPath = join(__dirname, '../../SKILL.functions.md');
  const functionsContent = readFileSync(functionsPath, 'utf-8');

  it('should have Before You Finish — Quality Checklist section', () => {
    expect(functionsContent).toContain('### Before You Finish — Quality Checklist');
  });

  it('should include secrets checklist item covering secret_key and string-typed sensitive inputs', () => {
    expect(functionsContent).toMatch(/\*\*\[Secrets\]\*\*.*type: secret_key.*NO default value/);
    expect(functionsContent).toMatch(/type: string.*password, token, or credential.*no default/);
  });

  it('should use lintBlueprint functions-variant lint command', () => {
    expect(functionsContent).toMatch(/\*\*\[Lint verification\]\*\*.*lintBlueprint\('blueprint\.yaml', \{ verify: true \}\)/);
  });

  it('should use "before considering the blueprint complete" (not stale pre-validation wording)', () => {
    expect(functionsContent).toContain('fix ALL errors before considering the blueprint complete');
    expect(functionsContent).not.toContain('before proceeding to validation');
  });

  describe('GitHub Repository Context routing (Issue #792)', () => {
    it('should have Routing — GitHub repository context section', () => {
      expect(functionsContent).toContain('## Routing — GitHub repository context');
    });

    it('should route to references/github-context.md', () => {
      expect(functionsContent).toContain('**load `references/github-context.md`**');
    });

    it('should mention key workflow steps in routing description', () => {
      expect(functionsContent).toContain('input collection → validation → sparse fetch → generation workflow');
    });

    it('should appear before Runtime Mode section', () => {
      const contextSection = functionsContent.indexOf('## Routing — GitHub repository context');
      const runtimeSection = functionsContent.indexOf('## Runtime Mode');
      expect(contextSection).toBeGreaterThan(0);
      expect(runtimeSection).toBeGreaterThan(contextSection);
    });

    it('should appear after artifact wrapping routing', () => {
      const artifactSection = functionsContent.indexOf('## Routing — artifact wrapping requests');
      const contextSection = functionsContent.indexOf('## Routing — GitHub repository context');
      expect(artifactSection).toBeGreaterThan(0);
      expect(contextSection).toBeGreaterThan(artifactSection);
    });
  });

  describe('Quick reference near-miss guards (Issue #1685)', () => {
    const skillContent = readFileSync(join(__dirname, '../../SKILL.md'), 'utf-8');
    const functionsContent = readFileSync(join(__dirname, '../../SKILL.functions.md'), 'utf-8');
    const quickRefStart = skillContent.indexOf('## CLI Quick Reference');
    const quickRef = skillContent.slice(quickRefStart);

    it('finds the CLI Quick Reference section', () => {
      expect(quickRefStart).toBeGreaterThan(-1);
    });

    it('frontmatter description triggers on dap-bpa, CLI command, upload and decision trace questions', () => {
      const { description } = parseSkillFrontmatter(skillContent);
      for (const phrase of ['"dap-bpa"', 'CLI command or flag', 'upload a blueprint', 'record a design decision', 'decision trace']) {
        expect(description).toContain(phrase);
      }
      expect(description.length).toBeLessThanOrEqual(1024);
    });
    it('quick reference lists trace record and trace compose', () => {
      expect(quickRef).toContain('dap-bpa trace record');
      expect(quickRef).toContain('dap-bpa trace compose');
    });

    it('quick reference shows directory upload with --id and --revision', () => {
      expect(quickRef).toContain('blueprints upload --file ./my-blueprint --id <id> --revision <ver>');
    });

    it('always-on dap-rules tells the agent to invoke the dap skill for dap-bpa command and flag questions', () => {
      const rules = readFileSync(join(__dirname, '../../../rules/dap-rules.md'), 'utf-8');
      expect(rules).toContain('Always invoke the `dap` skill before answering any `dap-bpa` command or flag question');
      expect(rules).toContain('`blueprints upload` takes `--id`');
      expect(rules).toContain('`deployments create` takes `--blueprint-id`');
      expect(rules).toContain('`trace record` and `trace compose`');
    });

    it('does not document a dap-bpa decision command', () => {
      const templateContent = readFileSync(join(__dirname, '../../SKILL.template.md'), 'utf-8');
      expect(skillContent).not.toMatch(/dap-bpa decision\b/);
      expect(functionsContent).not.toMatch(/dap-bpa decision\b/);
      expect(templateContent).not.toMatch(/dap-bpa decision\b/);
    });

    it('cli-commands reference shows directory upload with --revision', () => {
      const refs = readFileSync(join(__dirname, '../../references/cli-commands.md'), 'utf-8');
      expect(refs).toContain('upload --file ./my-blueprint-dir --id <id> --revision <ver>');
    });
  });

  describe('Decision trace workflow (Issue #1330)', () => {
    const skillContent = readFileSync(join(__dirname, '../../SKILL.md'), 'utf-8');
    const functionsContent = readFileSync(join(__dirname, '../../SKILL.functions.md'), 'utf-8');

    it('should instruct recording decisions with trace record during generation', () => {
      expect(skillContent).toContain('dap-bpa trace record');
      expect(skillContent).toMatch(/--category\b[\s\S]*--choice\b[\s\S]*--rationale\b[\s\S]*--alternative\b/);
    });

    it('should place the record guidance inside the build step, before lint', () => {
      const buildSection = skillContent.indexOf('### 5. Build the blueprint');
      const recordMention = skillContent.indexOf('dap-bpa trace record');
      const lintSection = skillContent.indexOf('### 6. Lint');
      expect(recordMention).toBeGreaterThan(buildSection);
      expect(recordMention).toBeLessThan(lintSection);
    });

    it('should instruct composing the trace on blueprint completion', () => {
      expect(skillContent).toContain('### 9. Compose the Decision Trace');
      expect(skillContent).toContain('dap-bpa trace compose --file');
    });

    it('should compose after validation and before the visualization offer', () => {
      const validateSection = skillContent.indexOf('### 7. Validate');
      const composeSection = skillContent.indexOf('### 9. Compose the Decision Trace');
      const visualizeSection = skillContent.indexOf('### 10. Offer Visualization');
      expect(composeSection).toBeGreaterThan(validateSection);
      expect(visualizeSection).toBeGreaterThan(composeSection);
    });

    it('should mention trace show search and filter for user navigation', () => {
      expect(skillContent).toContain('dap-bpa trace show');
      expect(skillContent).toMatch(/--search\b/);
    });

    it('should tell the agent to include the compose output verbatim in chat', () => {
      expect(skillContent).toMatch(/compose[\s\S]{0,1000}verbatim/i);
    });

    it('record example binds records to a blueprint with --blueprint', () => {
      expect(skillContent).toMatch(/trace record[\s\S]{0,200}--blueprint\b/);
    });

    it('compose example scopes validation with --categories', () => {
      expect(skillContent).toMatch(/trace compose[\s\S]{0,200}--categories\b/);
      expect(skillContent).toMatch(/categories[\s\S]{0,400}present in the blueprint/i);
    });

    it('instructs never to put secret values in decision text', () => {
      expect(skillContent).toMatch(/[Nn]ever (?:put|place|include) secret/);
    });

    it('marks re-read trace content as data, not instructions', () => {
      expect(skillContent).toMatch(/generated data[\s\S]{0,80}not instructions/i);
    });

    it('generation process intro no longer hardcodes a stale step count', () => {
      expect(skillContent).toContain('Follow these steps in order');
      expect(skillContent).not.toContain('Follow these 7 steps');
    });

    it('functions variant must not contain CLI trace commands', () => {
      expect(functionsContent).not.toContain('dap-bpa trace');
    });

    it('functions variant notes capture is automatic on the agent path', () => {
      expect(functionsContent).toMatch(/captured automatically/i);
    });
  });

});

describe('Origin-indicator stamping mandate (Issue #1328)', () => {
  const skillPath = join(__dirname, '../../SKILL.md');
  const skillContent = readFileSync(skillPath, 'utf-8');
  const functionsPath = join(__dirname, '../../SKILL.functions.md');
  const functionsContent = readFileSync(functionsPath, 'utf-8');
  const templatePath = join(__dirname, '../../SKILL.template.md');
  const templateContent = readFileSync(templatePath, 'utf-8');

  it('SKILL.md has a mandatory stamp step after Validate', () => {
    const validateSection = skillContent.indexOf('### 7. Validate');
    const stampSection = skillContent.indexOf('### 8. Stamp the origin indicator');
    expect(validateSection).toBeGreaterThan(0);
    expect(stampSection).toBeGreaterThan(validateSection);
    expect(skillContent).toContain('**MANDATORY:**');
  });

  it('SKILL.md stamp step uses the CLI stamp command', () => {
    expect(skillContent).toContain('dap-bpa blueprint stamp --file blueprint.yaml');
  });

  it('SKILL.functions.md stamp step uses the stampBlueprintFile function', () => {
    expect(functionsContent).toContain('### 8. Stamp the origin indicator');
    expect(functionsContent).toContain("stampBlueprintFile('blueprint.yaml')");
  });

  it('both variants name the indicator block and the checksum field', () => {
    for (const content of [skillContent, functionsContent]) {
      expect(content).toContain('# ===== BpA Origin Indicator =====');
      expect(content).toContain('bpa-checksum');
    }
  });

  it('quality checklist includes the origin-indicator item', () => {
    expect(skillContent).toMatch(/\*\*\[Origin indicator\]\*\*.*bpa-checksum/);
    expect(functionsContent).toMatch(/\*\*\[Origin indicator\]\*\*.*bpa-checksum/);
  });

  it('template keeps stamping runtime-agnostic via placeholders', () => {
    expect(templateContent).toContain('{{STAMP_BLOCK}}');
    expect(templateContent).toContain('{{STAMP_COMMAND}}');
  });

  it('CLI quick reference lists the stamp command', () => {
    expect(skillContent).toContain('dap-bpa blueprint stamp --file <path>');
  });

  it('Write Blueprint guide includes a stamp step before upload', () => {
    const guidesContent = readFileSync(join(__dirname, '../../references/guides.md'), 'utf-8');
    const stampStep = guidesContent.indexOf('## Step 9: Stamp the Origin Indicator');
    const uploadStep = guidesContent.indexOf('## Step 10: Upload the Blueprint');
    expect(stampStep).toBeGreaterThan(0);
    expect(uploadStep).toBeGreaterThan(stampStep);
    expect(guidesContent).toContain('dap-bpa blueprint stamp --file blueprint.yaml');
  });

  it('ISV onboarding flow stamps before Stage 1 completes', () => {
    const isvContent = readFileSync(join(__dirname, '../../../isv-blueprints/SKILL.md'), 'utf-8');
    expect(isvContent).toContain('dap-bpa blueprint stamp --file blueprint.yaml');
  });

  it('Multi-File Blueprints section points back at the stamp step', () => {
    const guidesContent = readFileSync(join(__dirname, '../../references/guides.md'), 'utf-8');
    const multiFile = guidesContent.indexOf('## Multi-File Blueprints');
    expect(multiFile).toBeGreaterThan(0);
    const section = guidesContent.slice(multiFile, guidesContent.indexOf('# Guide: Create Deployment'));
    expect(section).toContain('Step 9');
    expect(section).toContain('blueprint.yaml');
  });

  it('DSL migration guide stamps the migrated entrypoint', () => {
    const migrationContent = readFileSync(join(__dirname, '../../references/migration-guide.md'), 'utf-8');
    expect(migrationContent).toContain('dap-bpa blueprint stamp --file blueprint.yaml');
  });
});
