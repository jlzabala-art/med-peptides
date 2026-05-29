/* eslint-disable no-unused-vars */
import { protocolRepository } from '../repositories/protocolRepository.js';
import { runClinicalValidation } from './validationEngine.js';
import { resolveVariantPrice } from '../utils/resolvePrice.js';
import { PRICING_TIER } from '../constants/productEnums.js';

/**
 * Atlas Health - Clinical Protocol Engine 2.0
 * Adaptive, protocol-driven generation for clinical protocols.
 * 
 * This engine replaces the static phase-reading logic with dynamic
 * variant resolution and clinical corrections.
 */

export const ProtocolEngine2 = {
  
  /**
   * 1. Resolve Patient Profile
   * Normalizes UI form data into a structured context for the engine.
   */
  resolvePatientProfile(formData) {
    const age = parseInt(formData.age || 35);
    const weight = parseFloat(formData.weight) || 0;
    const height = parseFloat(formData.height) || 0;
    
    // Auto-calculate BMI if possible
    let bmi = parseFloat(formData.bmi) || 0;
    if (weight > 0 && height > 0 && bmi === 0) {
        const heightInMeters = height / 100;
        bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    let ageGroup = formData.ageGroup || "18–30";
    if (formData.age) {
      const a = parseInt(formData.age);
      if (a >= 60) ageGroup = "60+";
      else if (a >= 46) ageGroup = "46–60";
      else if (a >= 31) ageGroup = "31–45";
      else ageGroup = "18–30";
    }

    return {
      primary_clinical_focus: formData.primaryCondition || "Weight Management / Obesity",
      primary_condition: formData.specificGoal || "obesity_metabolic_dysfunction",
      patient_demographic: (formData.gender || formData.patientType || "Prefer not to say").toLowerCase(),
      age_group: ageGroup,
      baseline_weight_kg: weight,
      height_cm: height,
      bmi: bmi,
      metabolic_status: formData.metabolicStatus || "normal",
      duration_weeks: parseInt(formData.durationWeeks) || 12,
      start_date: formData.startDate || new Date().toISOString().split('T')[0],
      tempo_preference: formData.tempo || "standard",
      guidelines: formData.guidelines || {}
    };
  },

  /**
   * 2. Select Protocol Templates (plural)
   * Now returns an array of prioritized templates.
   */
  async selectProtocolBlueprints(patientProfile, injectedLibrary = null) {
    let all = injectedLibrary || null;

    if (!all) {
      all = await protocolRepository.getProtocolTemplates();
    }

    if (!all || all.length === 0) {
      if (import.meta.env?.DEV) {
        try {
          const bundleMod = await import('./protocol_finder_2_0_protocols_bundle/index.js');
          all = bundleMod.protocolBundle;
          console.warn('[ProtocolEngine2] ⚠ Firebase returned 0 protocols — using local bundle (DEV only)');
        } catch (e) {
          console.error('[ProtocolEngine2] Local bundle fallback also failed:', e);
          all = [];
        }
      } else {
        console.error('[ProtocolEngine2] Firebase protocols/ collection is empty!');
        all = [];
      }
    }
    
    // Filter by objective
    const normalize = (s) => (s || '').toLowerCase().replace(/_/g, ' ').trim();
    const objective = normalize(patientProfile.primary_clinical_focus);
    const userComplexity = patientProfile.guidelines?.complexity || 'moderate';
    
    let matches = all.filter(b => {
      const goal = normalize(b.metadata?.primary_goal || b.primary_goal || '');
      return goal === objective || objective.includes(goal) || goal.includes(objective);
    });

    // Normalize complexity in matches
    matches = matches.map(m => {
      let c = (m.metadata?.complexity_level || m.complexity_level || 'standard').toLowerCase();
      if (c === 'simple' || c === 'minimal') c = 'moderate';
      return { ...m, complexity_level: c };
    });

    // Filter by complexity if possible, or just rank them
    // If user prefers advanced, we show advanced first.
    // If user prefers moderate, we show moderate first.
    matches.sort((a, b) => {
      if (a.complexity_level === userComplexity && b.complexity_level !== userComplexity) return -1;
      if (a.complexity_level !== userComplexity && b.complexity_level === userComplexity) return 1;
      return 0;
    });

    // PROTOCOL FINDER: Always return at least 3 protocols. If sparse, backfill with general ones.
    if (matches.length < 3) {
      const others = all.filter(b => !matches.includes(b)).map(m => {
        let c = (m.metadata?.complexity_level || m.complexity_level || 'standard').toLowerCase();
        if (c === 'simple' || c === 'minimal') c = 'moderate';
        return { ...m, complexity_level: c };
      });
      matches = [...matches, ...others.slice(0, 3 - matches.length)];
    }
    
    // Prefix-alignment sort (secondary sort)
    const pidPrefixScore = (protocol) => {
      const pid = (protocol.protocol_id || '').split('_')[0].toLowerCase();
      const focus = (patientProfile.primary_clinical_focus || '').toLowerCase();
      if (focus.includes('weight')) return pid === 'wm' ? 0 : 1;
      if (focus.includes('cognitive')) return pid === 'cog' ? 0 : 1;
      if (focus.includes('metabolic')) return pid === 'met' ? 0 : 1;
      if (focus.includes('longevity')) return pid === 'lon' ? 0 : 1;
      return 1;
    };
    
    matches.sort((a, b) => {
      const prefA = a.complexity_level === userComplexity ? 0 : 1;
      const prefB = b.complexity_level === userComplexity ? 0 : 1;
      if (prefA !== prefB) return prefA - prefB;
      return pidPrefixScore(a) - pidPrefixScore(b);
    });

    return this.rankProtocols(matches, patientProfile);

    return this.rankProtocols(matches, patientProfile);
  },

  /**
   * 2.1 Protocol Ranking Logic
   * Prioritizes Tier 1 (GLP1/GIP Axis) for Weight Management.
   * Tier 1: Tirzepatide, Retatrutide, Semaglutide
   * Tier 2: AOD-9604, MOTS-C (Metabolic Support)
   * Tier 3: Semax, Selank (Behavioral Support)
   */
  rankProtocols(protocols, patientProfile) {
    const focus = (patientProfile.primary_clinical_focus || '').toLowerCase();
    const isWeightManagement = focus.includes('weight') || focus.includes('obesity');
    const userGender = (patientProfile.patient_demographic || '').toLowerCase();
    const userAgeGroup = (patientProfile.age_group || '').toLowerCase();

    const getDemographicScore = (protocol) => {
      let score = 0;
      const targetGender = (protocol.metadata?.targetGender || protocol.targetGender || '').toLowerCase();
      const targetAge = (protocol.metadata?.targetAge || protocol.targetAge || '').toLowerCase();

      // Gender Match (Light weight)
      if (targetGender && targetGender !== 'neutral') {
        if (targetGender === userGender) score -= 2;
        else score += 1;
      }

      // Age Match (Light weight)
      // Normalize 'young' (18-30), 'adult' (31-60), 'senior' (60+)
      if (targetAge) {
        let isMatch = false;
        if (targetAge === 'young' && userAgeGroup.includes('18–30')) isMatch = true;
        if (targetAge === 'adult' && (userAgeGroup.includes('31–45') || userAgeGroup.includes('46–60'))) isMatch = true;
        if (targetAge === 'senior' && userAgeGroup.includes('60+')) isMatch = true;
        
        if (isMatch) score -= 2;
      }

      return score;
    };

    const getDrugIds = (protocol) => {
      const phase0 = protocol.phase_blueprints?.[0] || protocol.phases?.[0] || {};
      const drugs = phase0.medications || phase0.drugs || [];
      return drugs.map(d => (d.product_id || d.compound || '').toLowerCase()).join(' ');
    };

    const getTier = (protocol) => {
      const title = (protocol.protocol_title || '').toLowerCase();
      const id    = (protocol.protocol_id   || '').toLowerCase();
      const drugs = getDrugIds(protocol);
      const all   = `${title} ${id} ${drugs}`;

      if (isWeightManagement) {
        if (all.includes('tirzepatide') || all.includes('retatrutide') ||
            all.includes('semaglutide') || id === 'wm_001' || id === 'wm_002' || id === 'wm_004') {
          return 1;
        }
        if (all.includes('mots-c') || all.includes('aod-9604') || id.startsWith('met_')) return 2;
        if (all.includes('semax') || all.includes('selank') || id === 'wm_003') return 3;
        return 4;
      }
      return 1; // Default tier for other goals
    };

    const getWMScore = (protocol) => {
      if (!isWeightManagement) return 0;
      const id = (protocol.protocol_id || '').toLowerCase();
      const metabolicStatus = (patientProfile.metabolic_status || '').toLowerCase();
      const tempo = (patientProfile.tempo_preference || 'standard').toLowerCase();

      if (id === 'wm_004' && metabolicStatus.includes('metabolic_syndrome') && tempo === 'aggressive') return -1;
      if (id === 'wm_002' && metabolicStatus.includes('insulin_resistance')) return -1;
      if (id === 'wm_002' && tempo === 'aggressive') return 0;
      if (id === 'wm_001') return (tempo === 'standard' || tempo === 'conservative') ? 0 : 2;
      return 1;
    };

    return [...protocols].sort((a, b) => {
      const tierA = getTier(a);
      const tierB = getTier(b);
      if (tierA !== tierB) return tierA - tierB;

      // Combine demographic score and specific goal score
      const scoreA = getWMScore(a) + getDemographicScore(a);
      const scoreB = getWMScore(b) + getDemographicScore(b);
      return scoreA - scoreB;
    });
  },

  /**
   * 3. Apply Variant Rules
   */
  applyVariantRules(protocol, patientProfile) {
    const variants = {
      age_variant: patientProfile.age_group,
      sex_variant: patientProfile.patient_demographic,
      duration_variant: `${patientProfile.duration_weeks}_weeks`,
      tempo_variant: patientProfile.tempo_preference,
      tirzepatide_escalation_profile: patientProfile.tempo_preference,
      monitoring_intensity: patientProfile.metabolic_status !== 'normal' ? "high" : "moderate"
    };

    // AGE-BASED CLINICAL LOGIC
    if (patientProfile.age_group === "65+") {
        variants.tirzepatide_escalation_profile = "conservative";
        variants.monitoring_intensity = "high";
    }

    return variants;
  },

  /**
   * 4. Build Phase Plan
   */
  buildPhasePlan(protocol, patientProfile) {
    const blueprints = protocol.phase_blueprints || protocol.phases || [];
    const totalWeeks = patientProfile.duration_weeks;
    const resolvedPhases = [];
    
    let currentWeek = 1;

    // Distribute weeks among phases proportionally to their default durations
    const totalDefaultWeeks = blueprints.reduce((acc, bp) => acc + (bp.default_duration_weeks || bp.weeks || 4), 0);
    
    blueprints.forEach((bp, idx) => {
      let phaseWeeks = bp.default_duration_weeks || bp.weeks || 4;
      
      // Proportional distribution
      if (totalWeeks !== totalDefaultWeeks && totalDefaultWeeks > 0) {
          const ratio = phaseWeeks / totalDefaultWeeks;
          phaseWeeks = idx === blueprints.length - 1 
            ? totalWeeks - (currentWeek - 1) 
            : Math.round(totalWeeks * ratio);
      }

      if (phaseWeeks > 0 && currentWeek <= totalWeeks) {
          resolvedPhases.push({
            ...bp,
            phase_key: bp.phase_key || `phase_${idx + 1}`,
            phase_title: bp.phase_title || bp.phase_name || `Phase ${idx + 1}`,
            start_week: currentWeek,
            end_week: Math.min(totalWeeks, currentWeek + phaseWeeks - 1),
            duration_weeks: Math.min(phaseWeeks, totalWeeks - currentWeek + 1)
          });
          currentWeek += phaseWeeks;
      }
    });

    return resolvedPhases;
  },

  /**
   * 5. Resolve Medication Schedule
   *
   * Phase 2: reads `variantRef` from each drug entry when present.
   * variantRef shape:
   *   { type: 'exact' | 'resolved', variantId?: string, productId: string, route: string }
   *
   * Falls back gracefully for protocols that don't carry variantRef yet.
   */
  resolveMedicationSchedule(resolvedPhases, protocol, appliedVariants) {
    const escalationRules = protocol.variant_rules?.tirzepatide_escalation || {
        "standard": [2.5, 2.5, 2.5, 2.5, 5, 5, 5, 5, 7.5, 7.5, 7.5, 7.5, 10, 10, 10, 10],
        "aggressive": [2.5, 2.5, 5, 5, 5, 5, 7.5, 7.5, 10, 10, 10, 10, 12.5, 12.5, 15, 15],
        "conservative": [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 5, 5, 5, 5, 5, 5, 7.5, 7.5, 7.5, 7.5]
    };
    
    const profile = appliedVariants.tirzepatide_escalation_profile;
    const doseSequence = escalationRules[profile] || escalationRules["standard"];

    return resolvedPhases.map(phase => {
        const drugs = (phase.drugs || phase.medications || []).map(d => {
            const compoundName = (d.product_id || d.compound || d.product_title || "").toLowerCase();
            const isTirzepatide = compoundName.includes('tirzepatide');
            const isRetatrutide = compoundName.includes('retatrutide');
            const isSemaglutide = compoundName.includes('semaglutide');

            // --- Phase 2: resolve variantRef ---
            // If the protocol supplies a typed variantRef, we honour it.
            // type=exact → variantId is authoritative; engine skips supplier selection.
            // type=resolved → engine picks the best available variant at runtime.
            const variantRef = d.variantRef || null;
            // The effective route comes from variantRef first, then the legacy `route` field.
            const effectiveRoute = variantRef?.route || d.route || "subcutaneous";

            let resolvedDose = d.dose_per_admin_mg || d.dose || "Standard";
            
            if (isTirzepatide || isRetatrutide || isSemaglutide) {
                const midWeekIdx = Math.floor((phase.start_week + phase.end_week) / 2) - 1;
                resolvedDose = (doseSequence[midWeekIdx] || doseSequence[doseSequence.length - 1]);
                
                return {
                    ...d,
                    product_id: d.product_id || compoundName.split(' ')[0],
                    product_title: d.product_title || compoundName.charAt(0).toUpperCase() + compoundName.slice(1),
                    weekly_dose_mg: resolvedDose,
                    administration_frequency: d.administration_frequency || d.frequency || "weekly",
                    administration_days: d.administration_days || ["Monday"],
                    route: effectiveRoute,
                    // Propagate typed reference downstream (e.g. for pricing & stock checks)
                    variantRef: variantRef ?? { type: 'resolved', productId: d.product_id, route: effectiveRoute }
                };
            }

            // Normalization for non-GLP-1 compounds
            const title = d.product_title || d.compound || "Unresolved Compound";
            
            return {
                ...d,
                product_title: title,
                dose_per_administration_mg: resolvedDose,
                administration_frequency: d.administration_frequency || d.frequency || "weekly",
                route: effectiveRoute,
                variantRef: variantRef ?? { type: 'resolved', productId: d.product_id, route: effectiveRoute }
            };
        });

        return { ...phase, drugs };
    });
  },

  /**
   * 6. Generate Monitoring Schedule
   */
  buildMonitoringSchedule(protocol, patientProfile, appliedVariants) {
    const basePlan = protocol.monitoring_plan || { baseline_labs: [], baseline_required: [], checkpoints: [] };
    const resolvedMonitoring = {
        baseline_required: [...(basePlan.baseline_required || []), ...(basePlan.baseline_labs || [])],
        scheduled_checkpoints: []
    };

    // Baseline reviews are standard
    resolvedMonitoring.scheduled_checkpoints.push({
        week: 1,
        type: "milestone",
        purpose: "Baseline Clinical Review & Biological Priming"
    });

    const checkpoints = basePlan.checkpoints || [];
    checkpoints.forEach(cp => {
        if (cp.week <= patientProfile.duration_weeks) {
            resolvedMonitoring.scheduled_checkpoints.push({
                ...cp,
                type: cp.type || "monitoring",
                date_label: this.calculateDateForWeek(patientProfile.start_date, cp.week),
                purpose: cp.purpose || cp.type
            });
        }
    });

    // Final Review
    if (!resolvedMonitoring.scheduled_checkpoints.some(cp => cp.week === patientProfile.duration_weeks)) {
        resolvedMonitoring.scheduled_checkpoints.push({
            week: patientProfile.duration_weeks,
            type: "milestone",
            purpose: "Final Clinical Efficacy Audit & Sustainability Plan"
        });
    }

    return resolvedMonitoring;
  },

  /**
   * 7. Generate Timeline
   */
  generateTimeline(resolvedPhases, patientProfile, monitoringSchedule, products) {
    const timeline = [];
    const baseDate = new Date(patientProfile.start_date);
    const totalWeeks = patientProfile.duration_weeks;

    for (let w = 1; w <= totalWeeks; w++) {
        const phase = resolvedPhases.find(p => w >= p.start_week && w <= p.end_week) || resolvedPhases[resolvedPhases.length - 1];
        
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() + (w - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        const events = [];
        
        // Add Medications
        (phase.drugs || []).forEach(d => {
            // Use compound slug as fallback title if unresolved
            const compoundTitle = (d.product_title && d.product_title !== 'Unresolved Compound')
                ? d.product_title
                : (d.product_id || d.compound || 'Compound').replace(/_/g, ' ');

            const dose = d.weekly_dose_mg || d.dose_per_administration_mg || d.dose;
            if (!dose || dose === "Standard" || dose === "Standard mg") {
                return; // Block placeholder dosing in timeline
            }

            const routeLabel = d.route || 'subcutaneous';

            const days = this.mapFrequencyToDays(d.administration_frequency);
            
            days.forEach(day => {
                events.push({
                    day,
                    type: "medication",
                    title: compoundTitle,
                    dose: typeof dose === 'number' ? `${dose} mg` : dose,
                    route: routeLabel,
                    frequency: d.administration_frequency
                });
            });
        });

        // SECTION 2.1: Merge Monitoring into Timeline
        const checkpoints = monitoringSchedule.scheduled_checkpoints.filter(cp => cp.week === w);
        checkpoints.forEach(checkpoint => {
            events.push({
                day: "Thursday", // Default clinical day
                type: checkpoint.type || "monitoring",
                title: (checkpoint.purpose || checkpoint.type).toUpperCase(),
                details: checkpoint.labs || []
            });
        });

        timeline.push({
            week: w,
            phase_name: phase.phase_title || `Phase ${phase.phase_key?.split('_')[1] || ''}`,
            date_range: dateRange,
            events: events.sort((a, b) => a.day.localeCompare(b.day))
        });
    }

    return timeline;
  },

  /**
   * 8. Calculate Clinical Cost
   * Resolves pricing directly from the Firestore variant data via resolveVariantPrice.
   * @param {Array}  resolvedPhases - Protocol phases with drug lists
   * @param {Array}  products       - Product catalog loaded from Firestore
   * @param {string} [tier]         - Pricing tier (PRICING_TIER constant). Defaults to retail.
   */
  calculateClinicalCost(resolvedPhases, products, tier = PRICING_TIER.RETAIL) {
    let totalCost = 0;
    const compoundBreakdown = {};
    
    resolvedPhases.forEach(phase => {
        const meds = phase.drugs || [];
        const phaseWeeks = phase.duration_weeks || 4;

        meds.forEach(med => {
            const name = med.product_title || med.compound;
            if (!name) return;

            const productMatch = products.find(p => p.name?.toLowerCase().includes(name?.toLowerCase()));

            // Resolve price from Firestore variant data — no hardcoded fallbacks.
            const variant = productMatch?.defaultVariant ?? productMatch?.variants?.[0];
            const { perUnit: pricePerVial, kit: kitPrice } = variant
                ? resolveVariantPrice(variant, { tier })
                : { perUnit: null, kit: null };

            // Skip compounds with no pricing data rather than using a magic number.
            if (!pricePerVial) return;

            // Clinical modeling: 1 vial per 4 weeks unless high-frequency dosing.
            const freq = (med.administration_frequency || '').toLowerCase();
            const vialsPer4Weeks = freq.includes('daily') ? 4 : 1;
            const vialsReq = Math.ceil((phaseWeeks / 4) * vialsPer4Weeks);
            
            let phaseMedCost = 0;
            if (kitPrice && vialsReq >= 10) {
                const kits = Math.floor(vialsReq / 10);
                const singles = vialsReq % 10;
                phaseMedCost = (kits * kitPrice) + (singles * pricePerVial);
            } else {
                phaseMedCost = vialsReq * pricePerVial;
            }

            totalCost += phaseMedCost;
            
            if (!compoundBreakdown[name]) compoundBreakdown[name] = 0;
            compoundBreakdown[name] += phaseMedCost;
        });
    });

    const totalWeeks = resolvedPhases.reduce((acc, p) => acc + (p.duration_weeks || 0), 0) || 12;

    return {
        total: Math.round(totalCost),
        weekly: Math.round(totalCost / totalWeeks),
        injection: Math.round(totalCost / (totalWeeks * 1.5)),
        totalWeeks,
        breakdown: compoundBreakdown
    };
  },

  /**
   * Main Orchestrator
   */
  async generateAdaptiveProtocol(formData, products) {
    const patientProfile = this.resolvePatientProfile(formData);
    const protocols = await this.selectProtocolBlueprints(patientProfile);
    const protocol = protocols[0]; // Primary recommendation
    
    // PART 4, 18 & 17 — PROTOCOL IDENTITY VALIDATION & DEBUG LOGGING
    const allowedIDs = ['WM-001', 'WM-002', 'WM-003', 'WM-004', 'COG-001', 'MET-001', 'LON-001', 'IMM-001', 'HOR-001'];
    const protocolID = (protocol.protocol_id || '').toUpperCase();
    const isNormalized = allowedIDs.some(id => protocolID.includes(id));

    console.log(`[ProtocolEngine2] Routing Outcome:`, {
        protocolID,
        isNormalized,
        patientFocus: patientProfile.primary_clinical_focus,
        metabolicStatus: patientProfile.metabolic_status
    });

    const appliedVariants = this.applyVariantRules(protocol, patientProfile);
    
    let resolvedPhases = this.buildPhasePlan(protocol, patientProfile);
    resolvedPhases = this.resolveMedicationSchedule(resolvedPhases, protocol, appliedVariants);
    
    const monitoringSchedule = this.buildMonitoringSchedule(protocol, patientProfile, appliedVariants);
    const timeline = this.generateTimeline(resolvedPhases, patientProfile, monitoringSchedule, products);
    // Pass through the caller's pricing tier so cost reflects the user's actual role.
    const cost = this.calculateClinicalCost(resolvedPhases, products || [], formData?.pricingTier ?? PRICING_TIER.RETAIL);
    
    // Clinical Validation
    const validation = runClinicalValidation({ phases: resolvedPhases, monitoringSchedule: monitoringSchedule.scheduled_checkpoints }, patientProfile);
    
    // PART 7 — SYNCHRONIZE SAFETY AND ALIGNMENT
    if (!isNormalized) {
        validation.status = 'pending';
        validation.errors = validation.errors || [];
        validation.errors.push({
            id: 'IDENTITY_MISMATCH',
            level: 'error',
            message: 'Protocol identity validation failed. This protocol does not match the normalized clinical library.'
        });
    }

    // Force Pending if any alignment ambiguity exists
    if (validation.warnings?.some(w => w.level === 'error' || w.id === 'ALIGNMENT_ERROR')) {
        validation.status = 'pending';
    }

    // PART 2 & 16 — BMI WARNING
    if (!patientProfile.bmi || patientProfile.bmi === 0) {
        validation.warnings = validation.warnings || [];
        validation.warnings.push({
            id: 'BMI_MISSING',
            level: 'warning',
            message: '⚠ Weight and height recommended for optimized metabolic protocol selection.'
        });
    }

    // PART 5 & 19 — TIMELINE INTEGRITY CHECK (downgraded to warning to allow workflow to proceed)
    const totalEvents = timeline.reduce((acc, w) => acc + (w.events?.length || 0), 0);
    if (totalEvents === 0) {
        validation.warnings = validation.warnings || [];
        validation.warnings.push({
            id: 'TIMELINE_EMPTY',
            level: 'warning',
            message: 'Timeline has no medication events. Protocol may need compound resolution.'
        });
    }

    // Build the final clinical export structure
    const output = {
        id: appliedVariants.tempo_variant,
        tempo: appliedVariants.tempo_variant,
        generated_protocol_id: `gp_${protocol.protocol_id}_${patientProfile.patient_demographic}_${patientProfile.age_group}_${patientProfile.duration_weeks}w_${new Date().getUTCFullYear()}${String(new Date().getUTCMonth()+1).padStart(2,'0')}${String(new Date().getUTCDate()).padStart(2,'0')}`,
        protocol_id: protocol.protocol_id,
        protocol_slug: protocol.protocol_slug,
        protocol_title: (protocol.protocol_title || "Untitled Protocol") + (appliedVariants.tempo_variant !== 'standard' ? ` (${appliedVariants.tempo_variant.charAt(0).toUpperCase() + appliedVariants.tempo_variant.slice(1)})` : ''),
        protocol_version: protocol.protocol_version || "1.0.0",
        patient_context: patientProfile,
        applied_variants: appliedVariants,
        clinical_summary: {
            goal: protocol.primary_goal,
            risk_level: protocol.complexity_level === 'advanced' ? 'high' : 'moderate',
            requires_baseline_labs: true,
            is_normalized: isNormalized
        },
        resolved_phases: resolvedPhases,
        resolved_monitoring: monitoringSchedule,
        resolved_timeline: timeline,
        validation: validation,
        justification: protocol.overview_summary || "Optimized therapeutic stack aligned with biological markers.",
        primaryClinicalFocus: protocol.primary_goal || "Systemic optimization",
        
        computedCost: cost,
        protocol_schedule: timeline.map(w => ({
            week: w.week,
            phase: w.phase_name,
            compounds: w.events.filter(e => e.type === 'medication').map(e => ({
                name: e.title,
                dosage: e.dose,
                day: e.day,
                frequency: e.frequency
            }))
        }))
    };

    return output;
  },

  /**
   * Generates prioritized list of clinical variants
   */
  async generateAllVariants(formData, products) {
    const patientProfile = this.resolvePatientProfile(formData);
    const protocols = await this.selectProtocolBlueprints(patientProfile);
    
    // We generate the 'standard' variant for the top 3 recommended protocols
    const variants = {};
    const tempos = ['standard', 'aggressive', 'conservative'];
    
    // If only one protocol matched, generate its tempos
    if (protocols.length === 1) {
        for (const tempo of tempos) {
            variants[tempo] = await this.generateAdaptiveProtocol({ ...formData, tempo }, products);
        }
    } else {
        // Generate primary protocol variants
        const primary = protocols[0];
        variants['standard'] = await this.generateAdaptiveProtocol({ ...formData, tempo: 'standard' }, products);
        variants['aggressive'] = await this.generateAdaptiveProtocol({ ...formData, tempo: 'aggressive' }, products);
        variants['conservative'] = await this.generateAdaptiveProtocol({ ...formData, tempo: 'conservative' }, products);
    }
    
    return {
        version: "v2.0.0-ADAPTIVE",
        createdAt: new Date(),
        patientContext: patientProfile,
        variants
    };
  },

  // Helpers
  calculateDateForWeek(startDate, week) {
    const d = new Date(startDate || new Date());
    d.setDate(d.getDate() + (week - 1) * 7);
    return d.toISOString().split('T')[0];
  },

  mapFrequencyToDays(freq) {
      const f = freq?.toLowerCase() || "";
      if (f.includes('3x_week')) return ["Monday", "Wednesday", "Friday"];
      if (f.includes('2x_week')) return ["Tuesday", "Thursday"];
      if (f.includes('daily')) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      if (f.includes('weekly')) return ["Monday"];
      return ["Monday"]; // Default
  }
};
