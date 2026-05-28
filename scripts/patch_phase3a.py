#!/usr/bin/env python3
"""
FASE 3a — Patch: cog_002
Protocol: Semax & Pinealon Neuro-Executive Protocol (8 wk, 3 phases)

Fixes:
  • metadata.duration_weeks          → 8
  • phase_id / phase_name / duration_weeks  (all None in all phases)
  • Semax: starting_weekly_dose, dose_per_administration, timing_hint
  • Selank phase 2+3: dose_per_administration, timing_hint
  • All phases: administration_days_default already present — preserved

Clinical dose references:
  Selank: 250–750 mcg/day intranasal or SC; standard 500 mcg/day
  Semax: 200–600 mcg/dose, 2–3x/week; typical 300 mcg/dose
"""

import json, os
from datetime import datetime, timezone

PROTOCOLS_DIR = os.path.join(os.path.dirname(__file__), '..', 'export', 'protocols')
NOW = datetime.now(timezone.utc).isoformat()

# Semax dose_per_administration per phase:
#   Phase 1 (2x_week): weekly=0.5 mg → 500 mcg/wk ÷ 2 = 250 mcg/admin
#   Phase 2 (3x_week): weekly not set → 900 mcg/wk → 300 mcg/admin
#   (Semax dropped in Phase 3)
#
# Selank dose_per_administration per phase:
#   Phase 1 (daily):   weekly=500 mcg → 500 mcg ÷ 7 ≈ 71 mcg/admin
#   Phase 2 (5x_week): weekly=1000 mcg → 1000 mcg ÷ 5 = 200 mcg/admin
#   Phase 3 (3x_week): weekly=1000 mcg → 1000 mcg ÷ 3 ≈ 333 mcg/admin

WEEKLY_UNIT = 1000  # 1 mg = 1000 mcg

def patch():
    path = os.path.join(PROTOCOLS_DIR, 'cog_002.json')
    with open(path) as f:
        d = json.load(f)

    print('[cog_002] Applying patch...')

    # Top-level duration
    d['metadata']['duration_weeks'] = 8

    bps = d['phase_blueprints']

    # ── Phase 1 ──────────────────────────────────────────────────────────────
    bps[0]['phase_id']       = 'cog_002_ph1'
    bps[0]['phase_name']     = 'Neurological Priming'
    bps[0]['duration_weeks'] = 3

    for drug in bps[0]['drugs']:
        dl = drug['dose_logic']
        if drug['product_title'] == 'Selank':
            # weekly=500 mcg (0.5 mg), daily → 500/7 ≈ 71 mcg/admin
            dl['starting_weekly_dose']    = 500        # mcg
            dl['dose_per_administration'] = 71
            dl['timing_hint']             = 'Administer in the morning or split AM/PM to sustain anxiolytic effect'
        elif drug['product_title'] == 'Semax':
            # 2x_week: 500 mcg total / 2 = 250 mcg/admin
            dl['starting_weekly_dose']    = 500
            dl['dose_per_administration'] = 250
            dl['timing_hint']             = 'Administer in the morning for BDNF and cognitive activation'

    # ── Phase 2 ──────────────────────────────────────────────────────────────
    bps[1]['phase_id']       = 'cog_002_ph2'
    bps[1]['phase_name']     = 'Active Cognitive Enhancement'
    bps[1]['duration_weeks'] = 3

    for drug in bps[1]['drugs']:
        dl = drug['dose_logic']
        if drug['product_title'] == 'Selank':
            # 5x_week, weekly=1000 mcg → 200 mcg/admin
            dl['dose_per_administration'] = 200
            dl['timing_hint']             = 'Administer on weekdays; supports sustained cognitive load and anxiolysis'
        elif drug['product_title'] == 'Semax':
            # 3x_week: set weekly + per_admin
            dl['starting_weekly_dose']    = 900
            dl['dose_per_administration'] = 300
            dl['timing_hint']             = 'Administer in the morning on training/work days for peak BDNF effect'

    # ── Phase 3 ──────────────────────────────────────────────────────────────
    bps[2]['phase_id']       = 'cog_002_ph3'
    bps[2]['phase_name']     = 'Maintenance'
    bps[2]['duration_weeks'] = 2

    for drug in bps[2]['drugs']:
        dl = drug['dose_logic']
        if drug['product_title'] == 'Selank':
            # 3x_week, weekly=1000 mcg → 333 mcg/admin
            dl['dose_per_administration'] = 333
            dl['timing_hint']             = 'Step-down maintenance; continue 3x/week indefinitely or cycle 4 weeks off'

    d.setdefault('_patchedAt', {})
    d['_patchedAt']['phase3a_fix'] = NOW

    with open(path, 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print('  ✅ Saved cog_002.json')


if __name__ == '__main__':
    print('═' * 60)
    print('  FASE 3a — Patch: cog_002')
    print('═' * 60)
    patch()
    print('\n' + '═' * 60)
    print('  ✅ Fase 3a completada')
    print('═' * 60)
