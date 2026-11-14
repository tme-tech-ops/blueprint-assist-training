import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseSkillFrontmatter } from '../../../../../scripts/__tests__/skill-frontmatter-helpers';

describe('deployment-update SKILL.md frontmatter', () => {
  const skillContent = readFileSync(join(__dirname, '../../SKILL.md'), 'utf-8');
  const { description } = parseSkillFrontmatter(skillContent);

  it('triggers on update body and initiate questions so the skill is loaded instead of guessed commands', () => {
    for (const phrase of ['update body', 'body.json', 'initiate an update', 'deployment-updates initiate', 'bump blueprint version']) {
      expect(description).toContain(phrase);
    }
  });

  it('keeps the original triggers', () => {
    for (const phrase of ['deployment update', 'node reinstall', 'check_drift', 'day 2']) {
      expect(description).toContain(phrase);
    }
  });

  // 1024 characters is the maximum skill description length accepted by Claude Code skills (Agent Skills spec).
  it('stays within the 1024 character description limit', () => {
    expect(description.length).toBeLessThanOrEqual(1024);
  });

  it('documents the initiate command and warns against deployments update', () => {
    expect(skillContent).toContain('dap-bpa orchestrator deployment-updates initiate');
    expect(skillContent).toContain('is a simple PATCH of deployment metadata');
  });

  it('states that the update body field is blueprint_version, not revision_id', () => {
    expect(skillContent).toContain('never `revision_id`, `revision` or `version`');
    expect(skillContent).toContain('`revision_id` and `--revision` belong to `blueprints upload`, not to the update body');
  });
});
