 
import { protocolRepository } from '../repositories/protocolRepository.js';
import { ProtocolEngine2 } from './protocolEngine2.js';
import { productRepository } from '../repositories/productRepository.js';
import { ROUTE, VARIANT_REF_TYPE } from '../constants/productEnums';


/**
 * MASTER CLINICAL TEST RUNNER 
 * Implements "Testing 2: Automated Clinical Protocol Selection Test Suite"
 */
export const ProtocolTestRunner = {
  // Manual high-priority scenarios
  scenarios: [
    {
      id: 'TC-WM-001',
      name: 'Tirzepatide Primary (Tirzepatide Priority)',
      input: {
        primaryCondition: 'Weight Management / Obesity',
        patientType: 'Male',
        ageGroup: '36-50',
        metabolicStatus: 'normal',
        weight: 95,
        height: 180,
        tempo: 'standard',
        durationWeeks: 12
      },
      expect: {
          protocolId: 'WM-001',
          containsCompound: 'Tirzepatide'
      }
    }
  ],

  /**
   * Automatically generate valid scenarios for all available templates
   */
  async generateDynamicScenarios() {
    let allTemplates = await protocolRepository.getProtocolTemplates();
    const dynamicScenarios = [];

    allTemplates.forEach(tpl => {
        const id = tpl.protocol_id;
        // Don't duplicate manual ones
        if (this.scenarios.some(s => s.expect.protocolId === id)) return;

        dynamicScenarios.push({
            id: `TC-AUTO-${id}`,
            name: `Auto-Validation: ${tpl.protocol_title}`,
            input: {
                primaryCondition: tpl.metadata?.primary_goal || tpl.primary_goal || 'Longevity',
                patientType: 'Female',
                ageGroup: '36-50',
                metabolicStatus: 'normal',
                weight: 70,
                height: 170,
                tempo: 'standard',
                durationWeeks: tpl.duration_weeks || 12
            },
            expect: {
                protocolId: id,
                containsCompound: tpl.phases?.[0]?.drugs?.[0]?.product_title || ''
            }
        });
    });

    return [...this.scenarios, ...dynamicScenarios];
  },

  async runSuite() {
    const startTime = Date.now();
    const results = [];
    const [fullSuite, products] = await Promise.all([
      this.generateDynamicScenarios(),
      productRepository.getAllProducts()
    ]);
    
    console.log(`[ClinicalSuite] Starting execution of ${fullSuite.length} scenarios...`);

    for (const scenario of fullSuite) {
      try {
        const output = await ProtocolEngine2.generateAdaptiveProtocol(scenario.input, products);
        const report = this.validate(output, scenario);
        results.push(report);
        
        console.log(`[ClinicalSuite] Result ${scenario.id}: ${report.status} (${report.durationMs}ms)`);
      } catch (err) {
        results.push({
          id: scenario.id,
          name: scenario.name,
          status: 'FAIL',
          error: `Engine Exception: ${err.message}`,
          details: 'Fatal execution logic error'
        });
      }
    }
    
    const duration = Date.now() - startTime;
    const passed = results.filter(r => r.status === 'PASS').length;
    
    const finalReport = {
      version: "3.2.0-PHASE2",

      timestamp: new Date().toISOString(),
      durationMs: duration,
      summary: {
        total: fullSuite.length,
        passed,
        failed: fullSuite.length - passed,
        passRate: Math.round((passed / fullSuite.length) * 100)
      },
      results
    };

    return finalReport;
  },

  validate(output, scenario) {
    const errors  = [];
    const warnings = [];
    const start = Date.now();

    // 1. Identity Validation
    const actualId   = (output.protocol_id || '').toUpperCase();
    const expectedId = (scenario.expect.protocolId || '').toUpperCase();
    if (!actualId.includes(expectedId)) {
        errors.push(`Identity Mismatch: Expected ${expectedId}, Got ${actualId}`);
    }

    // 2. Compound Quality
    const allDrugs = output.resolved_phases?.flatMap(p => p.drugs || []) || [];
    const drugTitles = allDrugs.map(d => (d.product_title || '').toLowerCase());
    const expectedCompound = (scenario.expect.containsCompound || '').toLowerCase();
    if (expectedCompound && !drugTitles.some(t => t.includes(expectedCompound))) {
        errors.push(`Missing Required Compound: ${scenario.expect.containsCompound}`);
    }

    // 3. Timeline Integrity
    const weeksInTimeline = output.resolved_timeline?.length || 0;
    if (weeksInTimeline === 0) {
        errors.push('Timeline Logic Failure: 0 weeks generated');
    } else if (weeksInTimeline !== output.patient_context?.duration_weeks) {
        errors.push(`Timeline Drift: Context expected ${output.patient_context?.duration_weeks}w, Timeline has ${weeksInTimeline}w`);
    }

    // 4. Cost Integrity
    if ((output.computedCost?.total || 0) <= 0) {
        errors.push('Economic Validation Failed: Zero total cost');
    }

    // 5. Safety Validation
    if (output.validation?.status === 'error') {
        errors.push(`Clinical Safety Error: ${output.validation.errors?.[0]?.message || 'Internal check failed'}`);
    }

    // ── Phase 2 Validations ─────────────────────────────────────────────────
    const VALID_ROUTES = new Set(Object.values(ROUTE));
    const VALID_TYPES  = new Set(Object.values(VARIANT_REF_TYPE));

    allDrugs.forEach(d => {
      const ref = d.variantRef;
      const label = d.product_title || d.product_id || 'unknown';

      // 6. variantRef presence (WARN — non-blocking during rollout)
      if (!ref) {
        warnings.push(`[Phase2-WARN] Drug '${label}' missing variantRef — engine fallback used`);
        return;
      }

      // 7. variantRef.type integrity (ERROR)
      if (!VALID_TYPES.has(ref.type)) {
        errors.push(`[Phase2] Drug '${label}': invalid variantRef.type '${ref.type}' (must be ${Object.values(VARIANT_REF_TYPE).join('|')})`);
      }

      // 8. variantRef.route is a canonical enum value (ERROR)
      if (!VALID_ROUTES.has(ref.route)) {
        errors.push(`[Phase2] Drug '${label}': non-canonical route '${ref.route}' in variantRef (must be ${Object.values(ROUTE).join('|')})`);
      }

      // 9. exact ref must carry a variantId (ERROR)
      if (ref.type === VARIANT_REF_TYPE.EXACT && !ref.variantId) {
        errors.push(`[Phase2] Drug '${label}': variantRef.type='exact' but variantId is missing`);
      }
    });
    // ─────────────────────────────────────────────────────────────────────────

    return {
      id: scenario.id,
      name: scenario.name,
      status: errors.length === 0 ? 'PASS' : 'FAIL',
      warnings,
      errors,
      durationMs: Date.now() - start,
      details: errors.length === 0
        ? `Clinical selection & math verified. Warnings: ${warnings.length}`
        : errors.join(' | '),
      protocolId: output.protocol_id,
      compounds: [...new Set(drugTitles)]
    };
  }
};

