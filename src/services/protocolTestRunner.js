import { protocolRepository } from '../repositories/protocolRepository';
import { ProtocolEngine2 } from './protocolEngine2';
import { products } from '../data/products';

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
    const fullSuite = await this.generateDynamicScenarios();
    
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
      version: "3.1.0-STABLE",
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
    const errors = [];
    const start = Date.now();
    
    // 1. Identity Validation (Part 4)
    const actualId = (output.protocol_id || '').toUpperCase();
    const expectedId = (scenario.expect.protocolId || '').toUpperCase();
    
    if (!actualId.includes(expectedId)) {
        errors.push(`Identity Mismatch: Expected ${expectedId}, Got ${actualId}`);
    }

    // 2. Compound Quality (Part 19)
    const drugTitles = output.resolved_phases?.flatMap(p => (p.drugs || []).map(d => (d.product_title || '').toLowerCase())) || [];
    const expectedCompound = (scenario.expect.containsCompound || '').toLowerCase();
    
    if (expectedCompound && !drugTitles.some(t => t.includes(expectedCompound))) {
        errors.push(`Missing Required Compound: ${scenario.expect.containsCompound}`);
    }

    // 3. Timeline Integrity (Part 19)
    const weeksInTimeline = output.resolved_timeline?.length || 0;
    if (weeksInTimeline === 0) {
        errors.push('Timeline Logic Failure: 0 weeks generated');
    } else if (weeksInTimeline !== output.patient_context?.duration_weeks) {
        errors.push(`Timeline Drift: Context expected ${output.patient_context?.duration_weeks}w, Timeline has ${weeksInTimeline}w`);
    }

    // 4. Cost Integrity (Part 11)
    if ((output.computedCost?.total || 0) <= 0) {
        errors.push('Economic Validation Failed: Zero total cost');
    }

    // 5. Safety Validation (Part 7)
    if (output.validation?.status === 'error') {
        errors.push(`Clinical Safety Error: ${output.validation.errors?.[0]?.message || 'Internal check failed'}`);
    }

    return {
      id: scenario.id,
      name: scenario.name,
      status: errors.length === 0 ? 'PASS' : 'FAIL',
      errors: errors,
      durationMs: Date.now() - start,
      details: errors.length === 0 ? 'Clinical selection & math verified.' : errors.join(' | '),
      protocolId: output.protocol_id,
      compounds: [...new Set(drugTitles)]
    };
  }
};
