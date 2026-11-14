/**
 * Content verification for the my-dap-patterns skill (BR23264-ER006-S01).
 *
 * The skill is markdown driving the S2 CLI; these tests pin the frontmatter,
 * intent routing, and the exact CLI surface it references so drift between
 * the skill and the real commands is caught here.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractFrontmatterBlock } from '../../../../../scripts/__tests__/skill-frontmatter-helpers';

describe('my-dap-patterns SKILL.md content verification', () => {
  const skillPath = join(__dirname, '../../SKILL.md');
  const skillContent = readFileSync(skillPath, 'utf-8');

  describe('frontmatter', () => {
    const frontmatter = extractFrontmatterBlock(skillContent);

    it('names the skill my-dap-patterns', () => {
      expect(frontmatter).toMatch(/^name: my-dap-patterns$/m);
    });

    it('carries invocation phrases in the description', () => {
      expect(frontmatter).toContain('"my patterns"');
      expect(frontmatter).toContain('"learn my conventions"');
      expect(frontmatter).toContain('"validate against my patterns"');
      expect(frontmatter).toContain('"pattern status"');
    });
  });

  describe('intent routing', () => {
    it('routes ingest, validate, and status intents', () => {
      expect(skillContent).toMatch(/## Ingest/);
      expect(skillContent).toMatch(/## Validate/);
      expect(skillContent).toMatch(/## Status/);
    });

    it('surfaces the learning-run offer instead of failing when no patterns exist', () => {
      expect(skillContent).toContain('No customer patterns found for this profile.');
      expect(skillContent).toMatch(/If declined, continue with\s+BPA defaults/);
    });
  });

  describe('CLI surface matches S2', () => {
    it('runs the learning run with --json', () => {
      expect(skillContent).toContain('dap-bpa knowledge patterns learn --blueprints-dir <dir> --json');
    });

    it('records decisions via review --decisions', () => {
      expect(skillContent).toContain('dap-bpa knowledge patterns review --decisions');
    });

    it('documents the accept/reject CSV alternative and that interfaces cannot be combined', () => {
      expect(skillContent).toContain('--accept <id,...> --reject <id,...>');
      expect(skillContent).toMatch(/cannot be combined/i);
    });

    it('validates with --output json and lists pattern sets', () => {
      expect(skillContent).toContain('dap-bpa knowledge patterns validate <blueprint-file> --output json');
      expect(skillContent).toContain('dap-bpa knowledge patterns list');
    });
  });

  describe('review semantics', () => {
    it('requires explicit decisions before anything is stored', () => {
      expect(skillContent).toContain('Never store candidates without the user\'s explicit decision');
      expect(skillContent).toMatch(/Candidates are pending — nothing is stored yet/);
    });

    it('records edit-then-accept as an override decision', () => {
      expect(skillContent).toMatch(/record as an\s+\*\*override\*\* with the edited value/);
      expect(skillContent).toContain('"kind": "override"');
    });

    it('documents that rejects persist and are not re-suggested', () => {
      expect(skillContent).toMatch(/rejected candidates go to the\s+`rejects\/` file and will not be re-suggested/);
    });
  });

  describe('scoping', () => {
    it('defaults the pattern set to the current DAP profile', () => {
      expect(skillContent).toMatch(/pattern set defaults to the current DAP profile/i);
    });

    it('leaves generation to the dap skill', () => {
      expect(skillContent).toMatch(/generation with these patterns is handled by the main `dap`\s+skill/i);
    });

    it('documents all six pattern types', () => {
      for (const type of ['naming', 'ip-range', 'vlan', 'policy-binding', 'module-structure', 'variable-mapping']) {
        expect(skillContent).toContain(type);
      }
    });
  });
});

// ─── T7: SKILL.md frontmatter ↔ skill-config.json consistency (Path A AC) ───
import * as path from 'path';
import * as fs from 'fs';

describe('skill-config.json consistency with SKILL.md frontmatter (T7)', () => {
  const skillDir = path.resolve(__dirname, '../../');
  const configPath = path.join(skillDir, 'skill-config.json');

  it('skill-config.json exists', () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('skill-config.json is valid JSON with required fields', () => {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw);
    expect(typeof cfg.skill_name).toBe('string');
    expect(typeof cfg.version).toBe('string');
    expect(Array.isArray(cfg.trigger_words)).toBe(true);
    expect(cfg.trigger_words.length).toBeGreaterThan(0);
    expect(Array.isArray(cfg.example_prompts)).toBe(true);
    expect(typeof cfg.requires_patterns).toBe('boolean');
  });

  it('skill-config.json trigger_words contains every word in SKILL.md frontmatter trigger_words', () => {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw) as { trigger_words: string[] };
    const skillMd = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    // Parse YAML frontmatter between --- delimiters
    const fmLines = extractFrontmatterBlock(skillMd).split(/\r?\n/);
    const twIdx = fmLines.findIndex((l) => l.startsWith('trigger_words:'));
    expect(twIdx).toBeGreaterThan(-1);
    const mdWords: string[] = [];
    for (let i = twIdx + 1; i < fmLines.length; i++) {
      const m = fmLines[i].match(/^\s+-\s+"?([^"]+)"?\s*$/);
      if (!m) break;
      mdWords.push(m[1].trim());
    }
    // Guard against the block parser silently matching nothing (e.g. a list
    // style change) — a vacuous pass here would hide frontmatter drift.
    expect(mdWords.length).toBeGreaterThan(0);
    for (const word of mdWords) {
      expect(cfg.trigger_words).toContain(word);
    }
  });

  it('skill-config.json requires_patterns matches SKILL.md frontmatter requires_patterns', () => {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw) as { requires_patterns: boolean };
    const skillMd = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    const fmText = extractFrontmatterBlock(skillMd);
    const rpMatch = fmText.match(/requires_patterns:\s*(true|false)/);
    expect(rpMatch).not.toBeNull();
    const mdValue = rpMatch![1] === 'true';
    expect(cfg.requires_patterns).toBe(mdValue);
  });
});
