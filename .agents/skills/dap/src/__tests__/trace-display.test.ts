import { describe, it, expect } from 'vitest';
import {
  buildTraceDisplayModel,
  buildUnavailableTraceModel,
  filterByKeyword,
  filterByCategory,
  isEmptyResult,
  renderTraceForIde,
  renderUnavailableTraceForIde,
} from '../trace-display.js';
import { composeDecisionTrace, validateDecisionTrace } from '@blueprint-assist/core';
import type { DecisionRecord, TraceValidationResult } from '@blueprint-assist/core';

const meta = { blueprint_name: 'my-bp.yaml', blueprint_version: 'v1.0.0' };

function makeRecord(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    decision_id: 'dec_1',
    category: 'compute',
    choice: 'Linux VM with 4 vCPUs',
    rationale: 'Best price/performance',
    alternatives: ['Windows VM', 'Container'],
    constraints: ['Azure only'],
    assumptions: ['Workload is CPU-bound'],
    impact: 'Moderate cost',
    blueprint_version: 'v1.0.0',
    ...overrides,
  };
}

describe('buildTraceDisplayModel', () => {
  it('builds sections in canonical order with non-technical headings', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const model = buildTraceDisplayModel(trace);

    expect(model.sections.map((s) => s.category)).toEqual([
      'compute', 'storage', 'network', 'security',
    ]);
    expect(model.sections[0]?.heading).toBe('Compute Resources');
    expect(model.sections[1]?.heading).toBe('Storage Configuration');
  });

  it('maps decisions to display entries with correct fields', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const model = buildTraceDisplayModel(trace);
    const compute = model.sections.find((s) => s.category === 'compute');

    expect(compute?.decision_count).toBe(1);
    expect(compute?.decisions[0]?.choice).toBe('Linux VM with 4 vCPUs');
    expect(compute?.decisions[0]?.rationale).toBe('Best price/performance');
    expect(compute?.decisions[0]?.alternatives).toContain('Windows VM');
  });

  it('SKIP — duplicate, see above', () => { /* merged into previous describe block */ });

  it('validates warn sets warning', () => {
    const records = [
      makeRecord({ decision_id: 'dec_c', category: 'compute' }),
      makeRecord({ decision_id: 'dec_s', category: 'storage', rationale: 'Fast', alternatives: ['Alt'] }),
      makeRecord({ decision_id: 'dec_n', category: 'network', rationale: 'Req', alternatives: ['Alt'] }),
      makeRecord({ decision_id: 'dec_sec', category: 'security', rationale: 'Req', alternatives: ['Alt'] }),
    ];
    const trace = composeDecisionTrace(records, { ...meta, component_categories: ['compute', 'storage', 'network', 'security'] });
    const validation = validateDecisionTrace(trace, ['compute', 'storage', 'network', 'security']);
    const model = buildTraceDisplayModel(trace, validation);

    expect(model.warning).toBeNull();
  });

  it('populates warning when validation warns', () => {
    const trace = composeDecisionTrace([], meta);
    const validation = validateDecisionTrace(trace, ['compute', 'storage']);
    const model = buildTraceDisplayModel(trace, validation);

    expect(model.warning).not.toBeNull();
    expect(model.warning?.missing_sections).toContain('compute');
    expect(model.warning?.missing_sections).toContain('storage');
    expect(model.warning?.recommendations.length).toBeGreaterThan(0);
  });

  it('marks sections with has_warning when they appear in missing_sections', () => {
    const trace = composeDecisionTrace([], meta);
    const validation = validateDecisionTrace(trace, ['compute', 'storage']);
    const model = buildTraceDisplayModel(trace, validation);

    const compute = model.sections.find((s) => s.category === 'compute');
    const network = model.sections.find((s) => s.category === 'network');
    expect(compute?.has_warning).toBe(true);
    expect(network?.has_warning).toBe(false);
  });

  it('sets unavailable: false and is_filtered_empty: false on normal models', () => {
    const trace = composeDecisionTrace([], meta);
    const model = buildTraceDisplayModel(trace);
    expect(model.unavailable).toBe(false);
    expect(model.is_filtered_empty).toBe(false);
  });

  it('sets warning to null when validation passes', () => {
    const records = [
      makeRecord({ decision_id: 'dec_c', category: 'compute' }),
      makeRecord({ decision_id: 'dec_s', category: 'storage', rationale: 'Fast', alternatives: ['Alt'] }),
      makeRecord({ decision_id: 'dec_n', category: 'network', rationale: 'Req', alternatives: ['Alt'] }),
      makeRecord({ decision_id: 'dec_sec', category: 'security', rationale: 'Req', alternatives: ['Alt'] }),
    ];
    const trace = composeDecisionTrace(records, { ...meta, component_categories: ['compute', 'storage', 'network', 'security'] });
    const validation = validateDecisionTrace(trace, ['compute', 'storage', 'network', 'security']) as TraceValidationResult;
    const model = buildTraceDisplayModel(trace, validation);
    expect(model.warning).toBeNull();
  });
});

describe('buildUnavailableTraceModel', () => {
  it('returns unavailable: true with message and retry_guidance', () => {
    const m = buildUnavailableTraceModel();
    expect(m.unavailable).toBe(true);
    expect(m.message).toBeTruthy();
    expect(m.retry_guidance).toBeTruthy();
  });
});

describe('filterByKeyword', () => {
  it('returns only decisions matching the keyword', () => {
    const records = [
      makeRecord({ decision_id: 'dec_1', choice: 'failover cluster', rationale: 'HA requirement' }),
      makeRecord({ decision_id: 'dec_2', category: 'storage', choice: 'SSD storage', rationale: 'Throughput' }),
    ];
    const trace = composeDecisionTrace(records, meta);
    const model = buildTraceDisplayModel(trace);

    const filtered = filterByKeyword(model, 'failover');
    const compute = filtered.sections.find((s) => s.category === 'compute');
    const storage = filtered.sections.find((s) => s.category === 'storage');
    expect(compute?.decision_count).toBe(1);
    expect(storage?.decision_count).toBe(0);
  });

  it('is case-insensitive', () => {
    const trace = composeDecisionTrace([makeRecord({ choice: 'Failover Cluster' })], meta);
    const model = buildTraceDisplayModel(trace);
    const filtered = filterByKeyword(model, 'FAILOVER');
    expect(filtered.sections.find((s) => s.category === 'compute')?.decision_count).toBe(1);
  });

  it('returns all decisions when keyword is empty, is_filtered_empty false', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const model = buildTraceDisplayModel(trace);
    const filtered = filterByKeyword(model, '');
    expect(filtered.sections.find((s) => s.category === 'compute')?.decision_count).toBe(1);
    expect(filtered.is_filtered_empty).toBe(false);
  });

  it('sets is_filtered_empty true when keyword matches nothing', () => {
    const trace = composeDecisionTrace([makeRecord({ choice: 'Linux VM' })], meta);
    const model = buildTraceDisplayModel(trace);
    const filtered = filterByKeyword(model, 'ZZZNOMATCH');
    expect(filtered.is_filtered_empty).toBe(true);
  });

  it('matches inside alternatives, constraints, and assumptions', () => {
    const trace = composeDecisionTrace([
      makeRecord({ alternatives: ['use snapshots for DR'], constraints: [], assumptions: [] }),
    ], meta);
    const model = buildTraceDisplayModel(trace);
    const filtered = filterByKeyword(model, 'snapshots');
    expect(filtered.sections.find((s) => s.category === 'compute')?.decision_count).toBe(1);
  });
});

describe('filterByCategory', () => {
  it('shows only decisions for the selected category', () => {
    const records = [
      makeRecord({ decision_id: 'dec_c', category: 'compute' }),
      makeRecord({ decision_id: 'dec_s', category: 'storage' }),
    ];
    const trace = composeDecisionTrace(records, meta);
    const model = buildTraceDisplayModel(trace);

    const filtered = filterByCategory(model, 'compute');
    expect(filtered.sections.find((s) => s.category === 'compute')?.decision_count).toBe(1);
    expect(filtered.sections.find((s) => s.category === 'storage')?.decision_count).toBe(0);
  });

  it('restores full trace when category is cleared, is_filtered_empty false', () => {
    const records = [
      makeRecord({ decision_id: 'dec_c', category: 'compute' }),
      makeRecord({ decision_id: 'dec_s', category: 'storage' }),
    ];
    const trace = composeDecisionTrace(records, meta);
    const model = buildTraceDisplayModel(trace);
    const restored = filterByCategory(model, '');
    expect(restored.sections.find((s) => s.category === 'compute')?.decision_count).toBe(1);
    expect(restored.sections.find((s) => s.category === 'storage')?.decision_count).toBe(1);
    expect(restored.is_filtered_empty).toBe(false);
  });

  it('sets is_filtered_empty true when category matches no decisions', () => {
    const trace = composeDecisionTrace([], meta);
    const model = buildTraceDisplayModel(trace);
    const filtered = filterByCategory(model, 'compute');
    expect(filtered.is_filtered_empty).toBe(true);
  });
});

describe('isEmptyResult', () => {
  it('returns true when all sections have 0 decisions', () => {
    const trace = composeDecisionTrace([], meta);
    const model = buildTraceDisplayModel(trace);
    expect(isEmptyResult(model)).toBe(true);
  });

  it('returns false when any section has decisions', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const model = buildTraceDisplayModel(trace);
    expect(isEmptyResult(model)).toBe(false);
  });
});

describe('renderTraceForIde', () => {
  it('includes blueprint name and version', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const md = renderTraceForIde(buildTraceDisplayModel(trace));
    expect(md).toContain('my-bp.yaml');
    expect(md).toContain('v1.0.0');
  });

  it('renders all four category headings', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const md = renderTraceForIde(buildTraceDisplayModel(trace));
    expect(md).toContain('Compute Resources');
    expect(md).toContain('Storage Configuration');
    expect(md).toContain('Network Architecture');
    expect(md).toContain('Security & Access Controls');
  });

  it('uses collapsible <details> sections with open attribute for non-empty', () => {
    const trace = composeDecisionTrace([makeRecord({ category: 'compute' })], meta);
    const md = renderTraceForIde(buildTraceDisplayModel(trace));
    // Compute section should be open (has decisions)
    expect(md).toContain('<details open>');
    expect(md).toContain('<summary><strong>Compute Resources (1)</strong></summary>');
    // Other sections should be closed (no decisions)
    expect(md).toMatch(/<details>\s*<summary><strong>Storage Configuration<\/strong><\/summary>/);
  });

  it('renders incomplete-trace warning banner', () => {
    const trace = composeDecisionTrace([], meta);
    const validation = validateDecisionTrace(trace, ['compute', 'storage']);
    const md = renderTraceForIde(buildTraceDisplayModel(trace, validation));
    expect(md).toContain('⚠️ **Incomplete Decision Trace**');
    expect(md).toContain('compute');
  });

  it('renders high-impact assumption with text', () => {
    const trace = composeDecisionTrace([
      makeRecord({ assumptions: ['[HIGH-IMPACT] risky assumption'] }),
    ], meta);
    const md = renderTraceForIde(buildTraceDisplayModel(trace));
    expect(md).toContain('⚠️');
    expect(md).toContain('Assumptions:');
    expect(md).toContain('risky assumption');
  });

  it('renders impact field for each decision', () => {
    const trace = composeDecisionTrace([
      makeRecord({ impact: 'Significant cost reduction' }),
    ], meta);
    const md = renderTraceForIde(buildTraceDisplayModel(trace));
    expect(md).toContain('Impact:');
    expect(md).toContain('Significant cost reduction');
  });

  it('renders distinct no-match message for filtered-empty state', () => {
    const trace = composeDecisionTrace([makeRecord()], meta);
    const model = filterByKeyword(buildTraceDisplayModel(trace), 'ZZZNOMATCH');
    const md = renderTraceForIde(model);
    expect(md).toContain('No decisions match the current filter');
    expect(md).toContain('Clear the filter');
    expect(md).not.toContain('No decisions recorded.');
  });

  it('restores original decisions when clearing keyword filter', () => {
    const trace = composeDecisionTrace([
      makeRecord({ choice: 'compute-choice', category: 'compute' }),
      makeRecord({ choice: 'storage-choice', category: 'storage' }),
    ], meta);
    const original = buildTraceDisplayModel(trace);
    const totalOriginal = original.sections.reduce((sum, s) => sum + s.decision_count, 0);
    expect(totalOriginal).toBe(2);

    // Apply filter that matches only one
    const filtered = filterByKeyword(original, 'compute');
    const totalFiltered = filtered.sections.reduce((sum, s) => sum + s.decision_count, 0);
    expect(totalFiltered).toBe(1);

    // Clear filter — should restore both
    const restored = filterByKeyword(filtered, '');
    const totalRestored = restored.sections.reduce((sum, s) => sum + s.decision_count, 0);
    expect(totalRestored).toBe(2);
    expect(restored.is_filtered_empty).toBe(false);
  });

  it('restores original decisions when clearing category filter', () => {
    const trace = composeDecisionTrace([
      makeRecord({ choice: 'compute-choice', category: 'compute' }),
      makeRecord({ choice: 'storage-choice', category: 'storage' }),
    ], meta);
    const original = buildTraceDisplayModel(trace);

    // Apply category filter
    const filtered = filterByCategory(original, 'compute');
    const computeSection = filtered.sections.find((s) => s.category === 'compute');
    const storageSection = filtered.sections.find((s) => s.category === 'storage');
    expect(computeSection?.decision_count).toBe(1);
    expect(storageSection?.decision_count).toBe(0);

    // Clear filter — should restore storage decisions
    const restored = filterByCategory(filtered, '');
    const restoredStorage = restored.sections.find((s) => s.category === 'storage');
    expect(restoredStorage?.decision_count).toBe(1);
  });
});

describe('renderUnavailableTraceForIde', () => {
  it('includes unavailable message and retry guidance', () => {
    const m = buildUnavailableTraceModel();
    const md = renderUnavailableTraceForIde(m);
    expect(md).toContain('Decision Trace Unavailable');
    expect(md).toContain('What to do');
  });
});
