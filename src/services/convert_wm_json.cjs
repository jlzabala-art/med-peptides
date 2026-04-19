const fs = require('fs');

function fromFirestore(fields) {
    const obj = {};
    for (const key in fields) {
        const field = fields[key];
        if (field.stringValue !== undefined) obj[key] = field.stringValue;
        else if (field.booleanValue !== undefined) obj[key] = field.booleanValue;
        else if (field.integerValue !== undefined) obj[key] = parseInt(field.integerValue);
        else if (field.doubleValue !== undefined) obj[key] = parseFloat(field.doubleValue);
        else if (field.arrayValue !== undefined) {
            obj[key] = (field.arrayValue.values || []).map(v => {
                if (v.mapValue) return fromFirestore(v.mapValue.fields);
                if (v.stringValue !== undefined) return v.stringValue;
                return v;
            });
        } else if (field.mapValue !== undefined) {
            obj[key] = fromFirestore(field.mapValue.fields);
        }
    }
    return obj;
}

const rawData = fs.readFileSync('/Users/joseluiszabala/.gemini/antigravity/brain/f4c9ab98-c676-4838-b645-37aff0ecb499/.system_generated/steps/812/output.txt', 'utf8');
const fullJson = JSON.parse(rawData);

const wmProtocols = fullJson.documents
    .filter(doc => doc.name.includes('/wm_00'))
    .map(doc => {
        const raw = fromFirestore(doc.fields);
        
        // TRANSFORM TO NEW STRUCTURED FORMAT
        return {
            protocol_id: raw.protocol_id,
            protocol_title: raw.protocol_title,
            protocol_slug: raw.protocol_slug,
            primary_goal: raw.primary_goal,
            complexity_level: raw.complexity_level || "standard",
            protocol_duration_weeks: raw.protocol_duration_weeks,
            status: "approved",
            active: true,
            visibility: "public",
            author: "system",
            economics: raw.economics || {},
            monitoring_plan: raw.monitoring_plan || {
                baseline_required: ["comprehensive_metabolic_panel", "body_composition"],
                checkpoints: [
                    { week: 4, type: "escalation_review" },
                    { week: 8, type: "progress_audit" },
                    { week: 12, type: "final_review" }
                ]
            },
            phases: (raw.phases || []).map(p => ({
                phase_key: p.phase_title?.toLowerCase().replace(/\s+/g, '_') || `phase_${p.phase_number}`,
                phase_title: p.phase_title,
                default_duration_weeks: (p.end_week - p.start_week + 1) || 4,
                drugs: (p.drugs_used || p.drugs || []).map(d => ({
                    product_id: d.product_id || `prd_${d.product_slug}`,
                    product_title: d.product_title || d.product_slug?.charAt(0).toUpperCase() + d.product_slug?.slice(1),
                    route: d.route || "subcutaneous",
                    dose_intensity: d.dose_intensity || d.weekly_dose || "standard",
                    administration_frequency: d.administration_frequency || d.dosing_frequency || "weekly"
                }))
            }))
        };
    });

fs.writeFileSync('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/weight_management_protocols_structured.json', JSON.stringify(wmProtocols, null, 2));
console.log("Structured JSON generated at: /Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/weight_management_protocols_structured.json");
