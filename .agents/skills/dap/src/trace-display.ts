import type { DecisionTrace, ComposedDecision, TraceSection } from '@blueprint-assist/core';
import type { TraceValidationResult } from '@blueprint-assist/core';

/**
 * Represents a single navigable section in the IDE panel.
 */
export interface DisplaySection {
  category: string;
  /** Non-technical heading shown at top level. */
  heading: string;
  /** Number of decisions in this section. */
  decision_count: number;
  /** Expandable decision entries. */
  decisions: DisplayDecision[];
  /** True when this category is in the validator's missing_sections. */
  has_warning: boolean;
}

/**
 * A single expandable decision entry.
 */
export interface DisplayDecision {
  decision_id: string;
  choice: string;
  rationale: string;
  alternatives: string[];
  constraints: string[];
  assumptions: string[];
  impact: string;
  has_high_impact_assumptions: boolean;
}

/**
 * The full IDE display model for a decision trace.
 */
export interface TraceDisplayModel {
  blueprint_name: string;
  blueprint_version: string;
  generated_at: string;
  sections: DisplaySection[];
  /** Populated from Validator warn result. */
  warning: TraceWarning | null;
  /**
   * True when the current view has zero decisions due to an active filter.
   * Distinct from a genuinely empty trace — shown as "no matches" not "no decisions".
   */
  is_filtered_empty: boolean;
  /** True when the trace is unavailable (failed/timed out). */
  unavailable: boolean;
  /**
   * Internal: preserves the original unfiltered sections for filter-clear restore.
   * Populated on first filter; used when clearing filters.
   */
  _originalSections?: DisplaySection[];
}

export interface TraceWarning {
  message: string;
  missing_sections: string[];
  recommendations: string[];
}

/**
 * Display model returned when the trace is unavailable.
 */
export interface UnavailableTraceModel {
  unavailable: true;
  message: string;
  retry_guidance: string;
}

const CATEGORY_HEADINGS: Record<string, string> = {
  compute: 'Compute Resources',
  storage: 'Storage Configuration',
  network: 'Network Architecture',
  security: 'Security & Access Controls',
};

function toDisplayDecision(d: ComposedDecision): DisplayDecision {
  return {
    decision_id: d.decision_id,
    choice: d.choice,
    rationale: d.rationale,
    alternatives: d.alternatives,
    constraints: d.constraints,
    assumptions: d.assumptions,
    impact: d.impact,
    has_high_impact_assumptions: d.has_high_impact_assumptions,
  };
}

function toDisplaySection(section: TraceSection, missingCategories: string[]): DisplaySection {
  return {
    category: section.category,
    heading: CATEGORY_HEADINGS[section.category] ?? section.category,
    decision_count: section.decisions.length,
    decisions: section.decisions.map(toDisplayDecision),
    has_warning: missingCategories.includes(section.category),
  };
}

/**
 * Builds the IDE display model from a composed trace and optional validation result.
 * Never throws — display failures must not block blueprint delivery.
 */
export function buildTraceDisplayModel(
  trace: DecisionTrace,
  validation?: TraceValidationResult,
): TraceDisplayModel {
  const missingSections = validation?.missing_sections ?? [];

  const sections = trace.sections.map((s) => toDisplaySection(s, missingSections));

  const warning: TraceWarning | null =
    validation && validation.result === 'warn'
      ? {
          message:
            'This decision trace is incomplete. Some design areas have no recorded decisions.',
          missing_sections: validation.missing_sections,
          recommendations: validation.recommendations,
        }
      : null;

  return {
    blueprint_name: trace.blueprint_name,
    blueprint_version: trace.blueprint_version,
    generated_at: trace.generated_at,
    sections,
    warning,
    unavailable: false,
    is_filtered_empty: false,
  };
}

/**
 * Returns the unavailable-trace model when trace generation failed or timed out.
 */
export function buildUnavailableTraceModel(): UnavailableTraceModel {
  return {
    unavailable: true,
    message: 'The decision trace for this blueprint could not be generated.',
    retry_guidance:
      'Try regenerating the blueprint with more specific requirements, ' +
      'or run the trace again from the Blueprint Assist panel.',
  };
}

/**
 * Filters a display model's sections and decisions by keyword.
 *
 * - Matches keyword (case-insensitive) against choice, rationale, alternatives,
 *   constraints, assumptions, and impact.
 * - Sections with no matching decisions are kept but show decision_count = 0.
 * - Returns a new model; never mutates the input.
 */
export function filterByKeyword(model: TraceDisplayModel, keyword: string): TraceDisplayModel {
  if (!keyword.trim()) {
    // Restore original sections when clearing filter
    const restored = model._originalSections ?? model.sections;
    return { ...model, sections: restored, is_filtered_empty: false, _originalSections: undefined };
  }

  // Preserve original sections on first filter
  const original = model._originalSections ?? model.sections;

  const kw = keyword.toLowerCase();

  function matchesDecision(d: DisplayDecision): boolean {
    return (
      d.choice.toLowerCase().includes(kw) ||
      d.rationale.toLowerCase().includes(kw) ||
      d.impact.toLowerCase().includes(kw) ||
      d.alternatives.some((a) => a.toLowerCase().includes(kw)) ||
      d.constraints.some((c) => c.toLowerCase().includes(kw)) ||
      d.assumptions.some((a) => a.toLowerCase().includes(kw))
    );
  }

  const sections = original.map((s) => {
    const filtered = s.decisions.filter(matchesDecision);
    return { ...s, decisions: filtered, decision_count: filtered.length };
  });

  const allEmpty = sections.every((s) => s.decision_count === 0);
  return { ...model, sections, is_filtered_empty: allEmpty, _originalSections: original };
}

/**
 * Filters a display model's sections by component type (category).
 *
 * - Only the matching section is returned (others have empty decisions).
 * - Returns a new model; never mutates the input.
 */
export function filterByCategory(
  model: TraceDisplayModel,
  category: string,
): TraceDisplayModel {
  if (!category.trim()) {
    // Restore original sections when clearing filter
    const restored = model._originalSections ?? model.sections;
    return { ...model, sections: restored, is_filtered_empty: false, _originalSections: undefined };
  }

  // Preserve original sections on first filter
  const original = model._originalSections ?? model.sections;

  const cat = category.toLowerCase();
  const sections = original.map((s) =>
    s.category === cat ? s : { ...s, decisions: [], decision_count: 0 },
  );

  const allEmpty = sections.every((s) => s.decision_count === 0);
  return { ...model, sections, is_filtered_empty: allEmpty, _originalSections: original };
}

/**
 * Returns true when a filtered display model has no decisions across all sections.
 */
export function isEmptyResult(model: TraceDisplayModel): boolean {
  return model.sections.every((s) => s.decision_count === 0);
}

/**
 * Renders the display model to a markdown string for the IDE chat panel.
 *
 * Format:
 * - Warning banner (if incomplete trace)
 * - One section per category (always rendered; empty sections show placeholder)
 * - Decisions with expandable rationale / alternatives / constraints
 *
 * Never throws — catch errors at call site per degrade-don't-fail contract.
 */
export function renderTraceForIde(model: TraceDisplayModel): string {
  const parts: string[] = [];

  parts.push(`## Decision Trace — ${model.blueprint_name}`);
  parts.push(`_Blueprint version: ${model.blueprint_version} | Generated: ${model.generated_at}_\n`);

  if (model.warning) {
    parts.push(`> ⚠️ **Incomplete Decision Trace**`);
    parts.push(`> ${model.warning.message}`);
    if (model.warning.missing_sections.length > 0) {
      parts.push(
        `> Missing sections: **${model.warning.missing_sections.join(', ')}**`,
      );
    }
    for (const rec of model.warning.recommendations) {
      parts.push(`> - ${rec}`);
    }
    parts.push('');
  }

  for (const section of model.sections) {
    // Use <details> for collapsible sections; open by default if has decisions
    const hasDecisions = section.decision_count > 0;
    const openAttr = hasDecisions ? ' open' : '';
    const warningIcon = section.has_warning ? ' ⚠️' : '';
    const countLabel = hasDecisions ? ` (${section.decision_count})` : '';

    parts.push(`<details${openAttr}>`);
    parts.push(`<summary><strong>${section.heading}${countLabel}${warningIcon}</strong></summary>\n`);

    if (model.is_filtered_empty) {
      parts.push(`_No decisions match the current filter. Clear the filter to see all decisions._\n`);
      parts.push(`</details>\n`);
      continue;
    }
    if (section.has_warning && section.decision_count === 0) {
      parts.push(`_⚠️ No decisions recorded for this area._\n`);
      parts.push(`</details>\n`);
      continue;
    }
    if (section.decision_count === 0) {
      parts.push(`_No decisions recorded._\n`);
      parts.push(`</details>\n`);
      continue;
    }

    for (const d of section.decisions) {
      parts.push(`**${d.choice}**`);
      parts.push(`- **Why:** ${d.rationale || '_Not provided_'}`);

      if (d.alternatives.length > 0) {
        parts.push(`- **Alternatives considered:** ${d.alternatives.join('; ')}`);
      }
      if (d.constraints.length > 0) {
        parts.push(`- **Constraints:** ${d.constraints.join('; ')}`);
      }
      if (d.assumptions.length > 0) {
        const assumptionPrefix = d.has_high_impact_assumptions ? '⚠️ ' : '';
        parts.push(`- **${assumptionPrefix}Assumptions:** ${d.assumptions.join('; ')}`);
      } else if (d.has_high_impact_assumptions) {
        parts.push(`- ⚠️ **High-impact assumptions present** — review before proceeding`);
      }
      if (d.impact) {
        parts.push(`- **Impact:** ${d.impact}`);
      }
      parts.push('');
    }
    parts.push(`</details>\n`);
  }

  return parts.join('\n');
}

/**
 * Renders the unavailable-trace model for the IDE.
 * Always includes a retry guidance message.
 */
export function renderUnavailableTraceForIde(model: UnavailableTraceModel): string {
  return [
    `> ⚠️ **Decision Trace Unavailable**`,
    `>`,
    `> ${model.message}`,
    `>`,
    `> **What to do:** ${model.retry_guidance}`,
  ].join('\n');
}
