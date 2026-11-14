/**
 * Content verification for the customer-patterns generation integration
 * (BR23264-ER001-S01, ER-004): the dap skill must read the local pattern
 * knowledge base during generation, attach attribution metadata, and fall
 * back to defaults with a learning-run prompt when no patterns exist.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const skillContent = readFileSync(join(__dirname, '../../SKILL.md'), 'utf-8');
const patternsRef = readFileSync(
  join(__dirname, '../../references/customer-patterns.md'),
  'utf-8',
);
const cliRef = readFileSync(
  join(__dirname, '../../references/cli-commands.md'),
  'utf-8',
);

describe('dap SKILL.md customer patterns integration (ER-004)', () => {
  it('lists the customer-patterns reference in the reference table', () => {
    expect(skillContent).toContain('`references/customer-patterns.md`');
  });

  it('instructs loading patterns in the Build step of the generation process', () => {
    const buildStep = skillContent.indexOf('### 5. Build the blueprint');
    expect(buildStep).toBeGreaterThan(0);
    const stepBody = skillContent.slice(buildStep, skillContent.indexOf('### 6. Lint'));
    expect(stepBody).toContain('references/customer-patterns.md');
    expect(stepBody).toContain('dap-bpa knowledge patterns list');
    expect(stepBody).toContain('_bpa_attribution');
  });

  it('surfaces the exact fallback learning-run prompt', () => {
    expect(skillContent).toContain(
      "No customer patterns found. Run 'dap-bpa knowledge patterns learn' first?",
    );
  });
});

describe('references/customer-patterns.md (ER-004)', () => {
  it('documents where the pattern knowledge base lives', () => {
    expect(patternsRef).toContain('~/.blueprint-assist/knowledge/patterns/');
  });

  it('covers every pattern type in the application table', () => {
    for (const type of [
      '`naming`',
      '`ip-range`',
      '`vlan`',
      '`policy-binding`',
      '`module-structure`',
      '`variable-mapping`',
    ]) {
      expect(patternsRef).toContain(type);
    }
  });

  it('specifies the attribution metadata format with all required fields', () => {
    expect(patternsRef).toContain('_bpa_attribution');
    
    // Check for all required attribution fields
    expect(patternsRef).toContain('"field"');
    expect(patternsRef).toContain('"pattern_id"');
    expect(patternsRef).toContain('"source_blueprints"');
    expect(patternsRef).toContain('"confidence_score"');
    expect(patternsRef).toContain('"is_exemplar_driven"');
    
    // Check for field descriptions
    expect(patternsRef).toMatch(/field.*blueprint field path/i);
    expect(patternsRef).toMatch(/confidence_score.*0-100.*copied from the selected stored pattern/i);
    expect(patternsRef).toMatch(/is_exemplar_driven.*true.*exemplar blueprint.*false.*inventory-wide/i);
    
    // Check for default source fallback
    expect(patternsRef).toContain('{ "source": "default" }');
  });

  it('documents exemplar pattern priority', () => {
    expect(patternsRef).toMatch(/exemplar.*take priority|exemplar-sourced pattern.*prefer/i);
    expect(patternsRef).toContain('is_exemplar: true');
    expect(patternsRef).toContain('1.5');
  });

  it('documents the fallback prompt and non-blocking behavior', () => {
    expect(patternsRef).toContain(
      "No customer patterns found. Run 'dap-bpa knowledge patterns learn' first?",
    );
    expect(patternsRef).toMatch(/if the user declines, continue with defaults/i);
  });

  it('tells the agent to validate the generated blueprint against patterns', () => {
    expect(patternsRef).toContain('dap-bpa knowledge patterns validate <blueprint-file>');
  });

  it('documents deterministic attribution enforcement (#1333)', () => {
    expect(patternsRef).toContain('Attribution is enforced, not best-effort');
    expect(patternsRef).toContain('pattern_attribution');
    expect(patternsRef).toMatch(/lint.*non-fatal\s+warnings/is);
    expect(patternsRef).toMatch(/comment-style attribution must include the `field` path/i);
  });

  it('tells the agent to respect confidence and needs_review flags', () => {
    expect(patternsRef).toContain('confidence_score');
    expect(patternsRef).toContain('needs_review');
  });
});

describe('references/cli-commands.md customer patterns section', () => {
  it('documents the patterns command family', () => {
    expect(cliRef).toContain('### Customer Patterns');
    for (const cmd of [
      'dap-bpa knowledge patterns learn',
      'dap-bpa knowledge patterns review',
      'dap-bpa knowledge patterns validate',
      'dap-bpa knowledge patterns list',
      'dap-bpa knowledge patterns export',
      'dap-bpa knowledge patterns import',
      'dap-bpa knowledge patterns migrate',
    ]) {
      expect(cliRef).toContain(cmd);
    }
  });
});
