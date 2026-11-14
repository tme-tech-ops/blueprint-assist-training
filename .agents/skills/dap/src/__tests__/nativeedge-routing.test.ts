import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('dap skill NativeEdge plugin routing', () => {
  const variants: Array<[string, string]> = [
    ['SKILL.md', readFileSync(join(__dirname, '../../SKILL.md'), 'utf-8')],
    ['SKILL.functions.md', readFileSync(join(__dirname, '../../SKILL.functions.md'), 'utf-8')],
    ['SKILL.template.md', readFileSync(join(__dirname, '../../SKILL.template.md'), 'utf-8')],
  ];

  for (const [name, content] of variants) {
    describe(name, () => {
      it('routes NativeEdge requests to the edge plugin', () => {
        expect(content).toContain('## Routing — NativeEdge requests');
        expect(content).toContain('use the `edge` plugin (`plugin:edge-plugin`)');
      });

      it('names the node type for VMs, compose and registry login', () => {
        expect(content).toContain('dell.nodes.nativeedge.template.NativeEdgeVM');
        expect(content).toContain('dell.nodes.nativeedge.template.NativeEdgeCompose');
        expect(content).toContain('dell.nodes.nativeedge.template.RegistryLogin');
      });

      it('tells the agent not to pick vsphere or docker only because of the workload', () => {
        expect(content).toMatch(/not a `vsphere` blueprint[\s\S]{0,80}not a `docker` blueprint/);
      });

      it('describes registry login with get_secret and depends_on', () => {
        expect(content).toContain('`get_secret`');
        expect(content).toContain('dell.relationships.depends_on');
      });

      it('places the routing before the generation process', () => {
        expect(content.indexOf('## Routing — NativeEdge requests')).toBeLessThan(
          content.indexOf('## Blueprint Generation Process'),
        );
      });

      it('does not claim that the NativeEdge plugin uses nativeedge.* prefixes', () => {
        expect(content).not.toContain('still uses `nativeedge.*` node type prefixes');
        expect(content).toContain('All plugins use the `dell.*` prefix. The `edge` plugin uses the `dell.nodes.nativeedge.template.*` sub-namespace.');
      });
    });
  }
});
