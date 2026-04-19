import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Mock dependencies
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import real engine logic (using dynamic import or relative paths)
// Note: ProtocolEngine2 imports protocolRepository and validationEngine.
// We must be careful if those have browser-only code.
// Looking at our audit, ProtocolEngine2 and validationEngine are mostly pure logic.
// We'll mock the protocolRepository since it's only used inside selectProtocolBlueprints (which we'll override).

import { ProtocolEngine2 } from './protocolEngine2.js';
import { products } from '../data/products.js';

const BUNDLE_DIR = path.join(__dirname, 'protocol_builder_2_0_protocols_bundle');

/**
 * AUTOMATED CLINICAL PROTOCOL AUDIT (v6.1-STABLE)
 * Implementing "Testing 2: Automated Clinical Protocol Selection Test Suite"
 */
async function runAudit() {
    console.log("------------------------------------------------------------------");
    console.log("REGEN PEPT - Automated Protocol Audit Suite (Testing 2)");
    console.log("------------------------------------------------------------------");

    // 1. Load All Protocols from Bundle
    const protocolFiles = fs.readdirSync(BUNDLE_DIR).filter(f => f.endsWith('.json'));
    const allProtocols = protocolFiles.map(f => {
        return JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, f), 'utf8'));
    });

    console.log(`Loaded ${allProtocols.length} protocols from bundle.`);

    // 2. Define Test Scenarios for 각 protocol
    const results = [];
    const usageStats = {};

    for (const blueprint of allProtocols) {
        const pid = blueprint.protocol_id;
        usageStats[pid] = 0;

        // Determine a valid triggering context for this protocol
        const context = {
            primaryCondition: blueprint.metadata?.primary_goal || blueprint.primary_goal || 'Longevity',
            patientType: 'Male',
            ageGroup: '36-50',
            weight: 85,
            height: 180,
            tempo: 'standard',
            durationWeeks: blueprint.duration_weeks || 12,
            metabolicStatus: 'normal'
        };

        // Try a few variations for completeness
        const testInputs = [
            { ...context, name: 'Standard Case' },
            { ...context, ageGroup: '65+', name: 'Senior Conservative Case' },
            { ...context, tempo: 'aggressive', name: 'Aggressive Case' }
        ];

        for (const input of testInputs) {
            try {
                // RUN ENGINE - Injecting our full library
                // ProtocolEngine2.generateAdaptiveProtocol uses resolvePatientProfile internally
                const profile = ProtocolEngine2.resolvePatientProfile(input);
                
                // Manually invoke selection to use our library
                const selectedBlueprints = await ProtocolEngine2.selectProtocolBlueprints(profile, allProtocols);
                const bestMatch = selectedBlueprints.find(b => b.protocol_id === pid) || selectedBlueprints[0];
                
                // Build the full protocol
                const variants = ProtocolEngine2.applyVariantRules(bestMatch, profile);
                const plan = ProtocolEngine2.buildPhasePlan(bestMatch, profile);
                const schedule = ProtocolEngine2.resolveMedicationSchedule(plan, bestMatch, variants);
                const timeline = ProtocolEngine2.buildTimeline(schedule, bestMatch, profile);
                
                // Audit the result
                const report = validateProtocolResult(pid, input.name, { ...bestMatch, resolved_timeline: timeline }, input);
                results.push(report);
                
                if (report.status === 'PASS' && report.selectedId === pid) {
                    usageStats[pid]++;
                }
            } catch (err) {
                results.push({
                    protocolId: pid,
                    scenario: input.name,
                    status: 'CRITICAL_FAIL',
                    error: err.message
                });
            }
        }
    }

    // 3. Final Report Generation
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = total - passed;
    const passRate = Math.round((passed / total) * 100);

    const auditReport = {
        timestamp: new Date().toISOString(),
        summary: {
            total_scenarios: total,
            passed,
            failed,
            passRate: `${passRate}%`
        },
        usage_frequency: usageStats,
        orphans: Object.keys(usageStats).filter(id => usageStats[id] === 0),
        details: results
    };

    fs.writeFileSync('protocol_test_log.json', JSON.stringify(auditReport, null, 2));

    console.log("------------------------------------------------------------------");
    console.log(`Audit Complete: ${passRate}% Pass Rate (${passed}/${total})`);
    if (auditReport.orphans.length > 0) {
        console.warn(`ORPHAN PROTOCOLS DETECTED: ${auditReport.orphans.join(', ')}`);
    } else {
        console.log("No orphan protocols found. All pathways triggered.");
    }
    console.log(`Detailed log: protocol_test_log.json`);
    console.log("------------------------------------------------------------------");
}

function validateProtocolResult(expectedId, scenarioName, protocol, input) {
    const errors = [];
    
    // 1. ID Check
    if (protocol.protocol_id !== expectedId) {
        errors.push(`Routing mismatch: Expected ${expectedId}, Got ${protocol.protocol_id}`);
    }

    // 2. Timeline Check
    const timeline = protocol.resolved_timeline || [];
    if (timeline.length === 0) {
        errors.push("Empty timeline generated");
    } else {
        const hasUndefined = JSON.stringify(timeline).includes("undefined");
        if (hasUndefined) {
            errors.push("Timeline contains 'undefined' references");
        }
    }

    // 3. Compound Check
    const compounds = protocol.phase_blueprints?.flatMap(p => p.drugs || []) || [];
    if (compounds.length === 0) {
        errors.push("No compounds found in blueprint");
    } else {
        compounds.forEach(c => {
            if (!c.product_id || !c.product_title) {
                errors.push(`Invalid compound definition: ${JSON.stringify(c)}`);
            }
        });
    }

    return {
        protocolId: expectedId,
        scenario: scenarioName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        selectedId: protocol.protocol_id,
        errors: errors
    };
}

runAudit();
