#!/usr/bin/env python3
"""
FASE 2 — Patch: sa_001
Fixes:
  • metadata.duration_weeks  (missing)
  • protocol_duration_weeks  (missing)
  • phase_blueprints[*].phase_id       (None)
  • phase_blueprints[*].phase_name     (None)
  • phase_blueprints[*].duration_weeks (None)
  • All drugs: dose_per_administration, administration_days_default, timing_hint
  • BPC-157 (phase 2): dose_unit + starting_weekly_dose + dose_per_administration
"""

import json
import os
from datetime import datetime, timezone

PROTOCOLS_DIR = os.path.join(os.path.dirname(__file__), '..', 'export', 'protocols')
NOW = datetime.now(timezone.utc).isoformat()

# ─── Protocol: sa_001 ───────────────────────────────────────────────────────
# Structured Skin & Aesthetics Protocol
# 3-phase escalation, 12 weeks total
#
# Phase 1 (wk 1-4) — Foundation:   GHK-Cu daily 500 mcg
# Phase 2 (wk 5-8) — Escalation:   GHK-Cu daily 1 mg  +  BPC-157 3x/wk 500 mcg
# Phase 3 (wk 9-12) — Maintenance: GHK-Cu 5x/wk 200 mcg/admin
#
# Clinical rationale for doses:
#   GHK-Cu: Standard aesthetic dosing 0.5–1 mg/day SC; escalate then step down
#   BPC-157: 250–500 mcg/dose, used 3x/week for tissue remodelling support in skin protocols

def patch_sa_001():
    path = os.path.join(PROTOCOLS_DIR, 'sa_001.json')
    with open(path) as f:
        d = json.load(f)

    print('\n[sa_001] Applying patch...')

    # ── Top-level duration ──────────────────────────────────────────────────
    d['protocol_duration_weeks'] = 12
    d.setdefault('metadata', {})
    d['metadata']['duration_weeks'] = 12
    d['metadata']['primary_goal'] = 'Skin / Anti-Aging'

    # ── Rebuild phase_blueprints in-place (preserve product_id references) ──
    d['phase_blueprints'] = [
        # ── Phase 1: Foundation ────────────────────────────────────────────
        {
            "phase_id":       "sa_001_ph1",
            "phase_name":     "Foundation",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "prd_ghkcu",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         0.5,
                        "starting_weekly_dose":        3.5,
                        "dose_per_administration":     0.5,
                        "administration_days_default": [
                            "monday", "tuesday", "wednesday",
                            "thursday", "friday", "saturday", "sunday"
                        ],
                        "timing_hint": "Administer in the morning for collagen stimulation"
                    }
                }
            ]
        },

        # ── Phase 2: Escalation ────────────────────────────────────────────
        {
            "phase_id":       "sa_001_ph2",
            "phase_name":     "Escalation",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "prd_ghkcu",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         1,
                        "starting_weekly_dose":        7,
                        "dose_per_administration":     1,
                        "administration_days_default": [
                            "monday", "tuesday", "wednesday",
                            "thursday", "friday", "saturday", "sunday"
                        ],
                        "timing_hint": "Escalated dose for peak collagen and elastin stimulation"
                    }
                },
                {
                    "product_id":    "prd_bpc157",
                    "product_title": "BPC-157",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        1500,
                        "dose_per_administration":     500,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint": "Supports dermal tissue remodelling and angiogenesis alongside GHK-Cu"
                    }
                }
            ]
        },

        # ── Phase 3: Maintenance ───────────────────────────────────────────
        {
            "phase_id":       "sa_001_ph3",
            "phase_name":     "Maintenance",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "prd_ghkcu",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "5x_week",
                        "starting_weekly_dose":        1,
                        "dose_per_administration":     0.2,
                        "administration_days_default": [
                            "monday", "tuesday", "wednesday", "thursday", "friday"
                        ],
                        "timing_hint": "Step-down maintenance dose; continue indefinitely or cycle off for 4 weeks"
                    }
                }
            ]
        }
    ]

    # ── Patch tracking ──────────────────────────────────────────────────────
    d.setdefault('_patchedAt', {})
    d['_patchedAt']['phase2_fix'] = NOW

    with open(path, 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)

    print('  ✅ Saved sa_001.json')


if __name__ == '__main__':
    print('═' * 60)
    print('  FASE 2 — Patch: sa_001')
    print('═' * 60)
    patch_sa_001()
    print('\n' + '═' * 60)
    print('  ✅ Fase 2 completada')
    print('═' * 60)
