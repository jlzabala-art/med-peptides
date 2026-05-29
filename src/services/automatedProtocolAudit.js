/* eslint-disable no-undef, no-unused-vars */
/**
 * Atlas Health — Automated Clinical Protocol Selection Test Suite (Testing 2)
 * Runs the full ProtocolEngine2 internal pipeline with local bundle, bypassing Firebase.
 */
import { ProtocolEngine2 } from './protocolEngine2.js';
import { protocolBundle } from './protocol_finder_2_0_protocols_bundle/index.js';
import { createWriteStream } from 'fs';
import { writeFileSync } from 'fs';

// ─────────────────────────────────────────────
// TEST CASE DEFINITIONS
// ─────────────────────────────────────────────
const TEST_CASES = [
  // ── WEIGHT MANAGEMENT ──
  {
    id: "TC-WM-001",
    name: "WM-001 — GLP1 Foundation, Standard/Impaired",
    input: {
      patientType: "female", age: 42, ageGroup: "36-50",
      weight: 92, height: 168,
      metabolicStatus: "impaired",
      primaryCondition: "Weight Management / Obesity",
      tempo: "standard", durationWeeks: 12
    },
    expectedProtocolId: "wm_001",
    expectedCompound: "tirzepatide"
  },
  {
    id: "TC-WM-002",
    name: "WM-002 — GLP1 + Metabolic Synergy, Insulin Resistance",
    input: {
      patientType: "male", age: 48, ageGroup: "36-50",
      weight: 105, height: 175,
      metabolicStatus: "insulin_resistance",
      primaryCondition: "Weight Management / Obesity",
      tempo: "aggressive", durationWeeks: 16
    },
    expectedProtocolId: "wm_002"
  },
  {
    id: "TC-WM-004",
    name: "WM-004 — Intensive Metabolic Reset, Metabolic Syndrome",
    input: {
      patientType: "male", age: 52, ageGroup: "51-65",
      weight: 118, height: 172,
      metabolicStatus: "metabolic_syndrome",
      primaryCondition: "Weight Management / Obesity",
      tempo: "aggressive", durationWeeks: 16
    },
    expectedProtocolId: "wm_004"
  },
  // ── COGNITIVE SUPPORT (goal: cognitive_support) ──
  {
    id: "TC-COG-001",
    name: "COG-001 — Cognitive Support Standard",
    input: {
      patientType: "female", age: 28, ageGroup: "18-35",
      primaryCondition: "Cognitive Support",
      tempo: "standard", durationWeeks: 8
    },
    expectedProtocolId: "cog_001"
  },
  // ── METABOLIC (goal: metabolic_optimization) ──
  {
    id: "TC-MET-001",
    name: "MET-001 — Metabolic Optimization",
    input: {
      patientType: "male", age: 44, ageGroup: "36-50",
      weight: 88, height: 176,
      metabolicStatus: "impaired",
      primaryCondition: "Metabolic Optimization",
      tempo: "standard", durationWeeks: 12
    },
    expectedProtocolId: "met_001"
  },
  // ── ENERGY (goal: mitochondrial_energy) ──
  {
    id: "TC-ENERGY-001",
    name: "ENERGY-001 — Mitochondrial Energy",
    input: {
      patientType: "male", age: 40, ageGroup: "36-50",
      weight: 76, height: 178,
      primaryCondition: "Mitochondrial Energy",
      tempo: "standard", durationWeeks: 12
    },
    expectedProtocolId: "energy_001"
  },
  // ── HORMONAL (goal: hormonal_support) ──
  {
    id: "TC-HORM-001",
    name: "HORM-001 — Hormonal Optimization",
    input: {
      patientType: "female", age: 48, ageGroup: "36-50",
      primaryCondition: "Hormonal Support",
      tempo: "standard", durationWeeks: 12
    },
    expectedProtocolId: "horm_001"
  },
  // ── LONGEVITY (goal: longevity_foundation) ──
  {
    id: "TC-LON-001",
    name: "LON-001 — Longevity Foundation",
    input: {
      patientType: "male", age: 58, ageGroup: "51-65",
      weight: 74, height: 172,
      primaryCondition: "Longevity Foundation",
      tempo: "conservative", durationWeeks: 12
    },
    expectedProtocolId: "lon_001"
  },
  // ── IMMUNE (goal: immune_modulation) ──
  {
    id: "TC-IMM-001",
    name: "IMMUNE-001 — Immune Support",
    input: {
      patientType: "female", age: 35, ageGroup: "18-35",
      primaryCondition: "Immune Modulation",
      tempo: "standard", durationWeeks: 8
    },
    expectedProtocolId: "immune_001"
  },
  // ── NEGATIVE: Cognitive objective must NOT select WM-001 ──
  {
    id: "TC-NEG-001",
    name: "NEGATIVE — Cognitive objective must NOT return wm_001",
    input: {
      patientType: "female", age: 25, ageGroup: "18-35",
      weight: 55, height: 170,
      primaryCondition: "Cognitive Support",
      tempo: "standard", durationWeeks: 8
    },
    expectedProtocolId: null,
    negativeCheck: true,
    forbiddenProtocolId: "wm_001"
  }
];


// ─────────────────────────────────────────────
// PIPELINE RUNNER — Uses internal steps, no Firebase
// ─────────────────────────────────────────────
async function runProtocolPipeline(formData) {
  const profile = ProtocolEngine2.resolvePatientProfile(formData);
  
  // Inject local bundle directly — bypasses Firebase
  const blueprints = await ProtocolEngine2.selectProtocolBlueprints(profile, protocolBundle);
  const blueprint = blueprints[0];
  
  if (!blueprint) throw new Error("No blueprint matched for this profile");
  
  const variants = ProtocolEngine2.applyVariantRules(blueprint, profile);
  let resolvedPhases = ProtocolEngine2.buildPhasePlan(blueprint, profile);
  resolvedPhases = ProtocolEngine2.resolveMedicationSchedule(resolvedPhases, blueprint, variants);
  const monitoringSchedule = ProtocolEngine2.buildMonitoringSchedule(blueprint, profile, variants);
  const timeline = ProtocolEngine2.generateTimeline(resolvedPhases, profile, monitoringSchedule, []);
  
  return { blueprint, profile, resolvedPhases, timeline, monitoringSchedule };
}

// ─────────────────────────────────────────────
// VALIDATION CHECKS
// ─────────────────────────────────────────────
function validateCompounds(resolvedPhases) {
  const errors = [];
  resolvedPhases.forEach((phase, pIdx) => {
    const drugs = phase.drugs || phase.medications || [];
    drugs.forEach((d, dIdx) => {
      if (!d.product_id && !d.product_title && !d.compound) {
        errors.push(`Phase ${pIdx + 1}, compound ${dIdx + 1}: missing product_id`);
      }
      if (!d.route) errors.push(`Phase ${pIdx + 1}, compound ${dIdx + 1}: missing route`);
    });
  });
  return errors;
}

function validateTimeline(timeline) {
  const errors = [];
  const raw = JSON.stringify(timeline);
  if (raw.includes('"undefined"') || raw.includes(': undefined')) {
    errors.push("timeline_resolution_error: undefined values detected in timeline");
  }
  const hasEvents = timeline.some(w => w.events && w.events.length > 0);
  if (!hasEvents) errors.push("timeline_resolution_error: no events generated");
  return errors;
}

// ─────────────────────────────────────────────
// MAIN AUDIT RUNNER
// ─────────────────────────────────────────────
async function runAudit() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Atlas Health — Clinical Protocol Audit Suite v2.0    ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const log = {
    timestamp: new Date().toISOString(),
    total_protocols_in_library: protocolBundle.length,
    summary: { total: TEST_CASES.length, passed: 0, failed: 0, warnings: 0 },
    protocol_usage: {},
    details: [],
    unused_protocols: []
  };

  // Track usage
  protocolBundle.forEach(p => { log.protocol_usage[p.protocol_id] = 0; });

  for (const tc of TEST_CASES) {
    process.stdout.write(`  → Testing [${tc.id}] ${tc.name}... `);
    
    try {
      const { blueprint, resolvedPhases, timeline } = await runProtocolPipeline(tc.input);
      
      const selectedId = blueprint.protocol_id;
      if (log.protocol_usage[selectedId] !== undefined) log.protocol_usage[selectedId]++;

      const compoundErrors = validateCompounds(resolvedPhases);
      const timelineErrors = validateTimeline(timeline);
      
      let pass;
      let failReason = null;

      if (tc.negativeCheck) {
        // Negative test: must NOT select forbidden protocol
        pass = selectedId !== tc.forbiddenProtocolId;
        if (!pass) failReason = `priority_violation_error: selected forbidden protocol ${selectedId}`;
      } else {
        pass = (selectedId === tc.expectedProtocolId) && compoundErrors.length === 0 && timelineErrors.length === 0;
        if (selectedId !== tc.expectedProtocolId) failReason = `protocol_mismatch: expected ${tc.expectedProtocolId}, got ${selectedId}`;
        if (compoundErrors.length > 0) failReason = (failReason || '') + ' | compound_missing_error: ' + compoundErrors.join('; ');
        if (timelineErrors.length > 0) failReason = (failReason || '') + ' | ' + timelineErrors.join('; ');
      }

      const status = pass ? "PASS" : "FAIL";
      if (pass) log.summary.passed++; else log.summary.failed++;

      const firstPhase = resolvedPhases[0];
      const compounds = (firstPhase?.drugs || firstPhase?.medications || [])
        .map(d => d.product_title || d.product_id || d.compound || "?");

      log.details.push({
        test_id: tc.id,
        name: tc.name,
        status,
        expected: tc.negativeCheck ? `NOT ${tc.forbiddenProtocolId}` : tc.expectedProtocolId,
        got: selectedId,
        compound_stack: compounds,
        phases_generated: resolvedPhases.length,
        timeline_weeks: timeline.length,
        compound_errors: compoundErrors,
        timeline_errors: timelineErrors,
        failure_reason: failReason || null,
        input_parameters: tc.input
      });

      const icon = pass ? "✅" : "❌";
      console.log(`${icon} ${status} (selected: ${selectedId})`);
      if (failReason) console.log(`     ⚠  ${failReason}`);

    } catch (e) {
      log.summary.failed++;
      console.log(`💥 ERROR: ${e.message}`);
      log.details.push({
        test_id: tc.id,
        name: tc.name,
        status: "ERROR",
        failure_reason: e.message,
        input_parameters: tc.input
      });
    }
  }

  // Detect unused protocols
  Object.entries(log.protocol_usage).forEach(([id, count]) => {
    if (count === 0) log.unused_protocols.push({ protocol_id: id, flag: "unused_protocol_detected" });
  });

  // GLP1 Priority validation for WM cases
  log.priority_validation = { glp1_first_in_wm: null };
  const wmTests = log.details.filter(d => ['TC-WM-001','TC-WM-002','TC-WM-004'].includes(d.test_id));
  const glp1Passed = wmTests.every(t => ['wm_001','wm_002','wm_004'].includes(t.got));
  log.priority_validation.glp1_first_in_wm = glp1Passed ? "PASS" : "FAIL";
  if (!glp1Passed) log.priority_validation.error = "priority_violation_error";

  // Final summary
  const passRate = ((log.summary.passed / log.summary.total) * 100).toFixed(1);
  log.summary.pass_rate = `${passRate}%`;
  log.summary.unused_protocol_count = log.unused_protocols.length;

  // Write report
  const reportPath = './protocol_selection_validation_report.json';
  writeFileSync(reportPath, JSON.stringify(log, null, 2));

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║  📊 AUDIT COMPLETE                                   ║`);
  console.log(`║  Passed: ${String(log.summary.passed).padEnd(4)} | Failed: ${String(log.summary.failed).padEnd(4)} | Total: ${String(log.summary.total).padEnd(4)}    ║`);
  console.log(`║  Pass Rate: ${passRate}%                                ║`);
  console.log(`║  Unused Protocols: ${log.unused_protocols.map(u => u.protocol_id).join(', ') || 'None'}          `);
  console.log(`║  GLP1 Priority: ${log.priority_validation.glp1_first_in_wm}                              ║`);
  console.log(`╚══════════════════════════════════════════════════════╝`);
  console.log(`\n  📄 Report → ${reportPath}\n`);

  // Block if any critical failure
  const criticalFailures = log.details.filter(d =>
    d.failure_reason && (
      d.failure_reason.includes('compound_missing') ||
      d.failure_reason.includes('timeline_resolution_error') ||
      d.failure_reason.includes('protocol_mismatch') ||
      d.failure_reason.includes('priority_violation')
    )
  );

  if (criticalFailures.length > 0) {
    console.error(`  🚫 DEPLOYMENT BLOCKED — ${criticalFailures.length} critical failure(s) detected.\n`);
    process.exit(1);
  }

  return log;
}

runAudit();
