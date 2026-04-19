const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'weight_management_resolved_examples copy');

function validateResolvedProtocol(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const errors = [];
    const warnings = [];

    const id = data.protocol_id || data.generated_protocol_id;

    // 1. Schema validity & Resolved protocol format
    if (!data.protocol_id) errors.push("Missing protocol_id");
    if (!data.patient_context) errors.push("Missing patient_context");
    if (!data.resolved_phases || !Array.isArray(data.resolved_phases)) errors.push("Missing or invalid resolved_phases");
    if (!data.resolved_timeline || !Array.isArray(data.resolved_timeline)) errors.push("Missing or invalid resolved_timeline");

    // 2. Adaptive logic integrity
    if (!data.applied_variants) errors.push("Missing applied_variants");
    else {
        // Checking if variants match context
        if (data.patient_context?.duration_weeks && data.applied_variants?.duration_variant) {
            if (!data.applied_variants.duration_variant.includes(String(data.patient_context.duration_weeks))) {
                warnings.push(`Duration variant "${data.applied_variants.duration_variant}" may not match context duration ${data.patient_context.duration_weeks}`);
            }
        }
    }

    // 3. Timeline correctness
    let hasMeds = false;
    let validEvents = true;
    data.resolved_timeline?.forEach(week => {
        if (!week.week) validEvents = false;
        if (!week.events || !Array.isArray(week.events)) validEvents = false;
        else {
            week.events.forEach(ev => {
                if (ev.type === 'medication') hasMeds = true;
                if (!ev.type) validEvents = false;
            });
        }
    });

    if (!validEvents) errors.push("Timeline events missing required fields (week, type)");
    if (!hasMeds) errors.push("No medication events found in timeline");

    // 4. Monitoring integration
    if (!data.resolved_monitoring) errors.push("Missing resolved_monitoring");
    else {
        if (!data.resolved_monitoring.baseline_required && !data.resolved_monitoring.scheduled_checkpoints) {
            warnings.push("resolved_monitoring exists but might be empty");
        }
    }

    // 5. Cost structure presence
    if (!data.resolved_costs) errors.push("Missing resolved_costs");
    else {
        if (typeof data.resolved_costs.estimated_weekly_cost !== 'number') errors.push("Missing or invalid estimated_weekly_cost");
        if (typeof data.resolved_costs.estimated_total_cost !== 'number') errors.push("Missing or invalid estimated_total_cost");
        if (!data.resolved_costs.currency) errors.push("Missing currency");
    }

    // 6. UI compatibility (state)
    if (!data.validation || !data.validation.state) {
        warnings.push("Missing validation state, might cause UI fallback");
    }

    return { id, errors, warnings, valid: errors.length === 0 };
}

const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
const results = files.map(f => {
    const res = validateResolvedProtocol(path.join(TARGET_DIR, f));
    return { file: f, ...res };
});

console.log(JSON.stringify(results, null, 2));
