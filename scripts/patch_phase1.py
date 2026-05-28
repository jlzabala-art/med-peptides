#!/usr/bin/env python3
"""
FASE 1 — Patch: rec_001, rec_002, wm_003
Construye phase_blueprints canónicos a partir de los datos de legacy 'phases'.
"""

import json
import os
from datetime import datetime, timezone

PROTOCOLS_DIR = os.path.join(os.path.dirname(__file__), '..', 'export', 'protocols')
NOW = datetime.now(timezone.utc).isoformat()


def load(protocol_id):
    path = os.path.join(PROTOCOLS_DIR, f'{protocol_id}.json')
    with open(path) as f:
        return json.load(f)


def save(protocol_id, data):
    path = os.path.join(PROTOCOLS_DIR, f'{protocol_id}.json')
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'  ✅ Saved {protocol_id}.json')


# ─── REC_001 ────────────────────────────────────────────────────────────────
# BPC-157 & TB-500 Tissue Repair Protocol
# Legacy phases:
#   Phase 1 (wk 1-4): BPC-157 daily + TB-500 weekly
#   Phase 2 (wk 5-8): BPC-157 3x/week only
def patch_rec_001():
    print('\n[rec_001] Building phase_blueprints...')
    d = load('rec_001')

    d['phase_blueprints'] = [
        {
            "phase_id":       "rec_001_ph1",
            "phase_name":     "Acute Recovery",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "BPC-157-5mg-vial",
                    "product_title": "BPC-157",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         500,
                        "dose_per_administration":     500,
                        "administration_days_default": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                        "timing_hint":                 "Administer near rehabilitation work or recovery period"
                    }
                },
                {
                    "product_id":    "TB-500-5mg-vial",
                    "product_title": "TB-500",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "weekly",
                        "starting_weekly_dose":        5,
                        "dose_per_administration":     5,
                        "administration_days_default": ["monday"],
                        "timing_hint":                 "Administer consistently on the same day each week"
                    }
                }
            ]
        },
        {
            "phase_id":       "rec_001_ph2",
            "phase_name":     "Regeneration",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "BPC-157-5mg-vial",
                    "product_title": "BPC-157",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        1500,
                        "dose_per_administration":     500,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint":                 "Reduce frequency once pain and range of motion improve"
                    }
                }
            ]
        }
    ]

    # Fix missing metadata fields
    d.setdefault('metadata', {})
    d['metadata']['duration_weeks'] = 8
    d['metadata']['primary_goal'] = 'Recovery / Injury'
    d.setdefault('title', d.get('protocol_title', 'BPC-157 & TB-500 Tissue Repair Protocol'))

    d['_patchedAt']['phase1_fix'] = NOW
    save('rec_001', d)


# ─── REC_002 ────────────────────────────────────────────────────────────────
# BPC-157, TB-500 & ARA-290 Neuro-Musculoskeletal Protocol
# Legacy phases:
#   Phase 1 (wk 1-4): BPC-157 daily + TB-500 weekly + ARA-290 3x/week
#   Phase 2 (wk 5-8): BPC-157 3x/week + ARA-290 2x/week
def patch_rec_002():
    print('\n[rec_002] Building phase_blueprints...')
    d = load('rec_002')

    d['phase_blueprints'] = [
        {
            "phase_id":       "rec_002_ph1",
            "phase_name":     "Acute Repair",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "BPC-157-5mg-vial",
                    "product_title": "BPC-157",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         500,
                        "dose_per_administration":     500,
                        "administration_days_default": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                        "timing_hint":                 "Administer daily in early repair phase"
                    }
                },
                {
                    "product_id":    "TB-500-5mg-vial",
                    "product_title": "TB-500",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "weekly",
                        "starting_weekly_dose":        5,
                        "dose_per_administration":     5,
                        "administration_days_default": ["monday"],
                        "timing_hint":                 "Remain weekly during acute repair phase"
                    }
                },
                {
                    "product_id":    "ARA-290-16mg-vial",
                    "product_title": "ARA-290",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        4.8,
                        "dose_per_administration":     1.6,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint":                 "Administer on non-consecutive days for neural support"
                    }
                }
            ]
        },
        {
            "phase_id":       "rec_002_ph2",
            "phase_name":     "Consolidation",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "BPC-157-5mg-vial",
                    "product_title": "BPC-157",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        1500,
                        "dose_per_administration":     500,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint":                 "Continue if nerve or functional deficits persist"
                    }
                },
                {
                    "product_id":    "ARA-290-16mg-vial",
                    "product_title": "ARA-290",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "2x_week",
                        "starting_weekly_dose":        3.2,
                        "dose_per_administration":     1.6,
                        "administration_days_default": ["tuesday", "friday"],
                        "timing_hint":                 "Reduce if neuropathic symptoms improve"
                    }
                }
            ]
        }
    ]

    d.setdefault('metadata', {})
    d['metadata']['duration_weeks'] = 8
    d['metadata']['primary_goal'] = 'Recovery / Injury'
    d.setdefault('title', d.get('protocol_title', 'BPC-157, TB-500 & ARA-290 Neuro-Musculoskeletal Protocol'))

    d['_patchedAt']['phase1_fix'] = NOW
    save('rec_002', d)


# ─── WM_003 ─────────────────────────────────────────────────────────────────
# Advanced Metabolic & Longevity Protocol
# Legacy phases:
#   Phase 1 (wk 1-4):  Retatrutide 2mg/wk + MOTS-c 15mg/wk(3x) + Tesamorelin 5mg/wk(5x) + SS-31 10mg/wk(2x) + GHK-Cu 7mg/wk(daily)
#   Phase 2 (wk 5-12): Retatrutide 6mg/wk + AOD-9604 2.1mg/wk(daily) + MOTS-c 15mg/wk(3x) + GHK-Cu 3.5mg/wk(3x) + NAD+ 2x/wk
#   Phase 3 (wk 13-16):Retatrutide 4mg/wk + MOTS-c 10mg/wk(2x) + GHK-Cu 2mg/wk(2x)
def patch_wm_003():
    print('\n[wm_003] Building phase_blueprints from legacy phases...')
    d = load('wm_003')

    d['phase_blueprints'] = [
        {
            "phase_id":       "wm_003_ph1",
            "phase_name":     "Metabolic Priming",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "Retatrutide-10mg-vial",
                    "product_title": "Retatrutide",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "weekly",
                        "starting_weekly_dose":        2,
                        "dose_per_administration":     2,
                        "administration_days_default": ["monday"],
                        "timing_hint":                 "Administer once weekly on a consistent day"
                    }
                },
                {
                    "product_id":    "MOTS-C-10mg-vial",
                    "product_title": "MOTS-c",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        15,
                        "dose_per_administration":     5,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint":                 "Administer on training days for metabolic priming"
                    }
                },
                {
                    "product_id":    "Tesamorelin-2mg-vial",
                    "product_title": "Tesamorelin",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "5x_week",
                        "starting_weekly_dose":        5,
                        "dose_per_administration":     1,
                        "administration_days_default": ["monday", "tuesday", "wednesday", "thursday", "friday"],
                        "timing_hint":                 "Administer before bed to align with GH pulse"
                    }
                },
                {
                    "product_id":    "SS-31-10mg-vial",
                    "product_title": "SS-31 (Elamipretide)",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "2x_week",
                        "starting_weekly_dose":        10,
                        "dose_per_administration":     5,
                        "administration_days_default": ["tuesday", "friday"],
                        "timing_hint":                 "Administer on non-training days for mitochondrial support"
                    }
                },
                {
                    "product_id":    "GHK-Cu_(Copper_Peptide)-5mg-vial",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         1,
                        "dose_per_administration":     1,
                        "administration_days_default": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                        "timing_hint":                 "Administer in the morning for anti-aging support"
                    }
                }
            ]
        },
        {
            "phase_id":       "wm_003_ph2",
            "phase_name":     "Active Fat Loss",
            "duration_weeks": 8,
            "drugs": [
                {
                    "product_id":    "Retatrutide-10mg-vial",
                    "product_title": "Retatrutide",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "weekly",
                        "starting_weekly_dose":        6,
                        "dose_per_administration":     6,
                        "administration_days_default": ["monday"],
                        "timing_hint":                 "Escalated dose for active fat loss phase"
                    }
                },
                {
                    "product_id":    "AOD-9604-5mg-vial",
                    "product_title": "AOD-9604",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mcg",
                        "administration_frequency":    "daily",
                        "starting_daily_dose":         300,
                        "dose_per_administration":     300,
                        "administration_days_default": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                        "timing_hint":                 "Administer in the morning, fasted for best lipolytic effect"
                    }
                },
                {
                    "product_id":    "MOTS-C-10mg-vial",
                    "product_title": "MOTS-c",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        15,
                        "dose_per_administration":     5,
                        "administration_days_default": ["monday", "wednesday", "friday"],
                        "timing_hint":                 "Maintain metabolic signaling alongside GLP-1 agonist"
                    }
                },
                {
                    "product_id":    "GHK-Cu_(Copper_Peptide)-5mg-vial",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "3x_week",
                        "starting_weekly_dose":        3.5,
                        "dose_per_administration":     1.17,
                        "administration_days_default": ["tuesday", "thursday", "saturday"],
                        "timing_hint":                 "Skin and anti-aging support during fat loss phase"
                    }
                },
                {
                    "product_id":    "NAD-Plus-vial",
                    "product_title": "NAD+",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "2x_week",
                        "starting_weekly_dose":        100,
                        "dose_per_administration":     50,
                        "administration_days_default": ["wednesday", "saturday"],
                        "timing_hint":                 "Supports cellular energy and mitochondrial function"
                    }
                }
            ]
        },
        {
            "phase_id":       "wm_003_ph3",
            "phase_name":     "Metabolic Stabilization",
            "duration_weeks": 4,
            "drugs": [
                {
                    "product_id":    "Retatrutide-10mg-vial",
                    "product_title": "Retatrutide",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "weekly",
                        "starting_weekly_dose":        4,
                        "dose_per_administration":     4,
                        "administration_days_default": ["monday"],
                        "timing_hint":                 "Maintenance dose for weight stabilization"
                    }
                },
                {
                    "product_id":    "MOTS-C-10mg-vial",
                    "product_title": "MOTS-c",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "2x_week",
                        "starting_weekly_dose":        10,
                        "dose_per_administration":     5,
                        "administration_days_default": ["monday", "thursday"],
                        "timing_hint":                 "Reduced frequency for metabolic maintenance"
                    }
                },
                {
                    "product_id":    "GHK-Cu_(Copper_Peptide)-5mg-vial",
                    "product_title": "GHK-Cu",
                    "route":         "subcutaneous",
                    "dose_logic": {
                        "dose_unit":                   "mg",
                        "administration_frequency":    "2x_week",
                        "starting_weekly_dose":        2,
                        "dose_per_administration":     1,
                        "administration_days_default": ["tuesday", "friday"],
                        "timing_hint":                 "Continue skin and longevity support during stabilization"
                    }
                }
            ]
        }
    ]

    d.setdefault('metadata', {})
    d['metadata']['duration_weeks'] = 16
    d['metadata']['primary_goal'] = 'Weight Management / Obesity'
    d.setdefault('title', d.get('protocol_title', 'Advanced Metabolic & Longevity Protocol'))

    d['_patchedAt']['phase1_fix'] = NOW
    save('wm_003', d)


# ─── MAIN ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('═' * 60)
    print('  FASE 1 — Patch: rec_001 | rec_002 | wm_003')
    print('═' * 60)
    patch_rec_001()
    patch_rec_002()
    patch_wm_003()
    print('\n═' * 60)
    print('  ✅ Fase 1 completada — 3 protocolos parcheados')
    print('═' * 60)
