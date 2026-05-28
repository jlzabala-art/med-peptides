import { db } from './lib/firebase-admin.mjs';

async function patchClinicalDoses() {
  console.log('🚀 Starting Comprehensive Clinical Dose Patching Script...');

  const updates = [
    // --- 1. PLACEHOLDER REPLACEMENTS (TODO: specify) ---
    {
      id: 'wm_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && (drug.weekly_dose || '').includes('TODO')) {
              drug.weekly_dose = phase.phase_number === 3 ? '10mg' : '15mg';
              updated = true;
            }
            if (drug.product_slug === 'aod-9604' && (drug.weekly_dose || '').includes('TODO')) {
              drug.weekly_dose = '1.75mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'wm_004',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'tirzepatide' && (drug.weekly_dose || '').includes('TODO')) {
              if (phase.phase_number === 1) drug.weekly_dose = '2.5mg';
              else if (phase.phase_number === 2) drug.weekly_dose = '7.5mg';
              else if (phase.phase_number === 3) drug.weekly_dose = '10mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'sa_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'prd_ghkcu' && (drug.weekly_dose || '').includes('TODO')) {
              drug.weekly_dose = '1.5mg';
              updated = true;
            }
            if (drug.product_slug === 'prd_bpc157' && (drug.weekly_dose || '').includes('TODO')) {
              drug.weekly_dose = '1.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },

    // --- 2. BACKPORTING MISSING DRUG DOSES ---
    {
      id: 'skin_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'ghk-cu' && !drug.weekly_dose) {
              drug.weekly_dose = '1.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'skin_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'ghk-cu' && !drug.weekly_dose) {
              drug.weekly_dose = '1.5mg';
              updated = true;
            }
            if (drug.product_slug === 'epithalon' && !drug.weekly_dose) {
              drug.weekly_dose = '35mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'sleep_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'dsip' && !drug.weekly_dose) {
              drug.weekly_dose = '2.1mg';
              updated = true;
            }
            if (drug.product_slug === 'selank' && !drug.weekly_dose) {
              drug.weekly_dose = '1750 mcg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'sleep_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'dsip' && !drug.weekly_dose) {
              drug.weekly_dose = '2.1mg';
              updated = true;
            }
            if (drug.product_slug === 'epithalon' && !drug.weekly_dose) {
              drug.weekly_dose = '35mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'rec_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 1 ? '3.5mg' : '1.5mg';
              updated = true;
            }
            if (drug.product_slug === 'tb-500' && !drug.weekly_dose) {
              drug.weekly_dose = '5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'rec_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 1 ? '3.5mg' : '1.5mg';
              updated = true;
            }
            if (drug.product_slug === 'tb-500' && !drug.weekly_dose) {
              drug.weekly_dose = '5mg';
              updated = true;
            }
            if (drug.product_slug === 'ara-290' && !drug.weekly_dose) {
              drug.weekly_dose = '6mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'weight-management-structured-12w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 3 ? '10mg' : '15mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'cog_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'selank' && !drug.weekly_dose) {
              drug.weekly_dose = '1750 mcg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'cognitive-support-6w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'selank' && !drug.weekly_dose) {
              drug.weekly_dose = '1750 mcg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'sleep-restoration-8w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'selank' && !drug.weekly_dose) {
              drug.weekly_dose = '1750 mcg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'injury-recovery-8w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 1 ? '3.5mg' : '1.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'neuro-musculoskeletal-repair-8w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 1 ? '3.5mg' : '1.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'lxv-neuro-restoration-12w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = '3.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'neuro_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'bpc-157' && !drug.weekly_dose) {
              drug.weekly_dose = '3.5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'immune_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'tb-500' && !drug.weekly_dose) {
              drug.weekly_dose = '5mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'wm_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'aod-9604' && !drug.weekly_dose) {
              drug.weekly_dose = '1.75mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    }
  ];

  for (const item of updates) {
    const docRef = db.collection('protocols').doc(item.id);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      const phases = data.phases || [];
      const isUpdated = item.updates(phases);
      if (isUpdated) {
        await docRef.update({ phases });
        console.log(`✅ Patched doses for protocol: "${item.id}"`);
      } else {
        console.log(`ℹ️ Protocol "${item.id}" was already up to date.`);
      }
    } else {
      console.log(`⚠️ Document "${item.id}" not found.`);
    }
  }

  console.log('🎉 Clinical dose patching completed successfully!');
}

patchClinicalDoses().catch(console.error);
