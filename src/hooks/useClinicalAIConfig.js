/* eslint-disable react-hooks/set-state-in-effect */
/**
 * useClinicalAIConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches the mutable ClinicalAI configuration from Firestore.
 *
 * Collection: clinicalai_config
 *   ├── behavioral_rules   → query types, safety, reconstitution, navigation,
 *   │                        language, behavioral_principles, user_mode_rules,
 *   │                        similar_compounds, contextual_next_actions_rules
 *   └── few_shot_examples  → FSE-001 → FSE-006
 *
 * - Reads once per browser session (sessionStorage cache).
 * - Falls back to null if Firestore is unavailable; the caller must handle
 *   graceful degradation (code-side defaults are always present in clinicalAIRules.js).
 *
 * HOW TO UPDATE BACKEND RULES WITHOUT A REDEPLOY:
 *   1. Edit /AI Prompts/clinicalAI_rules.js (single source of truth)
 *   2. Run: node scripts/sync-clinicalai-rules.mjs
 *   3. Done — the backend picks up the new rules on the next user session.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const SESSION_KEY = 'rp_cache_clinicalai_config_v2';   // bumped to bust old cache
const COLLECTION  = 'clinicalai_config';

/** Read from sessionStorage; returns null on miss or parse error. */
function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Write to sessionStorage; silently ignores quota / private-mode errors. */
function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

/**
 * Serialises the Firestore config into a plain-text block ready to be
 * appended to the system prompt.  Covers ALL sections stored in Firestore
 * so the backend Cloud Run service always has the full latest ruleset.
 *
 * @param {Object} rules    - behavioral_rules document
 * @param {Object} examples - few_shot_examples document
 * @returns {string}
 */
function buildPromptBlock(rules, examples) {
  const lines = [];

  // ── Query types ─────────────────────────────────────────────────────────────
  if (rules?.query_types) {
    lines.push('## QUERY TYPE RULES (live from Firestore)');
    Object.entries(rules.query_types).forEach(([key, qt]) => {
      lines.push(`\n### ${key.toUpperCase().replace(/_/g, ' ')} [${qt.id}]`);
      if (qt.description) lines.push(qt.description);
      if (qt.section_order?.length) {
        lines.push('Response section order: ' + qt.section_order.join(' → '));
      }
      (qt.critical_rules || []).forEach(r => lines.push(`- [${r.id}] ${r.rule}`));
    });
  }

  // ── Behavioral principles ────────────────────────────────────────────────────
  if (rules?.behavioral_principles?.length) {
    lines.push('\n## BEHAVIORAL PRINCIPLES (live from Firestore)');
    rules.behavioral_principles.forEach(bp => {
      lines.push(`- [${bp.id}] ${bp.name}: ${bp.rule}`);
    });
  }

  // ── User mode rules ──────────────────────────────────────────────────────────
  if (rules?.user_mode_rules?.rules?.length) {
    lines.push('\n## USER MODE RULES (live from Firestore)');
    rules.user_mode_rules.rules.forEach(r => lines.push(`- [${r.id}] ${r.rule}`));
    const modes = rules.user_mode_rules.modes || {};
    if (modes.beginner?.tone_rules?.length) {
      lines.push('BEGINNER mode tone: ' + modes.beginner.tone_rules.join(' | '));
    }
    if (modes.advanced?.tone_rules?.length) {
      lines.push('ADVANCED mode tone: ' + modes.advanced.tone_rules.join(' | '));
    }
  }

  // ── Safety rules ────────────────────────────────────────────────────────────
  if (rules?.safety_rules?.length) {
    lines.push('\n## SAFETY RULES (live from Firestore)');
    rules.safety_rules.forEach(r => {
      lines.push(`- [${r.id}] ${r.rule}`);
      if (r.closing_statement) lines.push(`  → Closing statement: "${r.closing_statement}"`);
    });
  }

  // ── Reconstitution rules ─────────────────────────────────────────────────────
  if (rules?.reconstitution_rules?.length) {
    lines.push('\n## RECONSTITUTION RULES (live from Firestore)');
    rules.reconstitution_rules.forEach(r => {
      lines.push(`- [${r.id}] ${r.rule}`);
      if (r.default_solvent) lines.push(`  → Default solvent: ${r.default_solvent}`);
      if (r.tag_format)      lines.push(`  → Tag format: ${r.tag_format}`);
    });
  }

  // ── Navigation rules + tags ──────────────────────────────────────────────────
  if (rules?.navigation_rules) {
    lines.push('\n## NAVIGATION RULES (live from Firestore)');
    (rules.navigation_rules.rules || []).forEach(r => lines.push(`- [${r.id}] ${r.rule}`));
    if (rules.navigation_rules.tags) {
      lines.push('Response tags:');
      Object.entries(rules.navigation_rules.tags).forEach(([name, tag]) => {
        lines.push(`  - ${name}: ${tag.format} — ${tag.placement}`);
      });
    }
  }

  // ── Similar compounds ────────────────────────────────────────────────────────
  if (rules?.similar_compounds?.length) {
    lines.push('\n## SIMILAR COMPOUNDS MAP (live from Firestore)');
    rules.similar_compounds.forEach(rel => {
      lines.push(`- ${rel.compound} → similar to: ${(rel.similar_to || []).join(', ')}`);
    });
  }

  // ── Contextual next actions ──────────────────────────────────────────────────
  if (rules?.contextual_next_actions_rules?.length) {
    lines.push('\n## CONTEXTUAL NEXT ACTIONS RULES (live from Firestore)');
    rules.contextual_next_actions_rules.forEach(r => lines.push(`- [${r.id}] ${r.rule}`));
  }

  // ── Language rules ───────────────────────────────────────────────────────────
  if (rules?.language_rules?.length) {
    lines.push('\n## LANGUAGE RULES (live from Firestore)');
    rules.language_rules.forEach(r => lines.push(`- [${r.id}] ${r.rule}`));
  }

  // ── Few-shot examples ────────────────────────────────────────────────────────
  if (examples?.examples?.length) {
    lines.push('\n## CALIBRATION EXAMPLES (live from Firestore)');
    examples.examples.forEach(ex => {
      lines.push(`\n**[${ex.id}] — ${ex.type}**`);
      lines.push(`User: "${ex.user_input}"`);
      lines.push(`Expected tone/format: ${ex.notes}`);
      if (ex.expected_response?.heading)          lines.push(`→ Lead with: "${ex.expected_response.heading}"`);
      if (ex.expected_response?.goal_restatement) lines.push(`→ Restate goal as: "${ex.expected_response.goal_restatement}"`);
      if (ex.expected_response?.refusal)          lines.push(`→ Refusal: "${ex.expected_response.refusal}"`);
    });
  }

  return lines.join('\n');
}

/**
 * Hook — fetches ClinicalAI config from Firestore once per session.
 *
 * @returns {{
 *   clinicalConfig: string | null,   — ready-to-inject prompt block
 *   configLoading:  boolean,
 *   configError:    string | null
 * }}
 */
export function useClinicalAIConfig() {
  const [clinicalConfig, setClinicalConfig] = useState(null);
  const [configLoading,  setConfigLoading]  = useState(true);
  const [configError,    setConfigError]    = useState(null);

  useEffect(() => {
    // ── Session cache hit ──────────────────────────────────────────────────────
    const cached = readCache(SESSION_KEY);
    if (cached) {
      setClinicalConfig(cached);
      setConfigLoading(false);
      return;
    }

    // ── Firestore fetch ────────────────────────────────────────────────────────
    let cancelled = false;

    Promise.all([
      getDoc(doc(db, COLLECTION, 'behavioral_rules')),
      getDoc(doc(db, COLLECTION, 'few_shot_examples'))
    ])
      .then(([rulesSnap, examplesSnap]) => {
        if (cancelled) return;

        const rules    = rulesSnap.exists()    ? rulesSnap.data()    : null;
        const examples = examplesSnap.exists() ? examplesSnap.data() : null;

        if (!rules && !examples) {
          console.warn('[useClinicalAIConfig] No documents found in clinicalai_config. Using code-side defaults.');
          setConfigLoading(false);
          return;
        }

        const block = buildPromptBlock(rules, examples);
        writeCache(SESSION_KEY, block);
        setClinicalConfig(block);
        setConfigLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[useClinicalAIConfig] Firestore fetch failed, falling back to code defaults:', err.code);
        setConfigError(err.message);
        setConfigLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { clinicalConfig, configLoading, configError };
}
