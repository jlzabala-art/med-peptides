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

const sa001Raw = fullJson.documents.find(doc => doc.name.endsWith('/sa_001'));
if (sa001Raw) {
    const sa001 = fromFirestore(sa001Raw.fields);
    // Standardize to blueprint format 2.0
    const blueprint = {
        protocol_id: sa001.protocol_id,
        protocol_slug: sa001.protocol_slug,
        protocol_title: sa001.protocol_title,
        protocol_version: "v6.1",
        status: "approved",
        active: true,
        metadata: {
            primary_goal: sa001.primary_goal,
            complexity_level: sa001.complexity_level,
            visibility: "public"
        },
        phase_blueprints: (sa001.phases || []).map(p => ({
            phase_key: p.phase_key,
            phase_title: p.phase_title,
            default_duration_weeks: p.default_duration_weeks,
            drugs: p.drugs.map(d => ({
                product_id: d.product_id,
                product_title: d.product_title,
                route: d.route,
                dose_logic: {
                    administration_frequency: d.administration_frequency,
                    intensity: d.dose_intensity
                }
            }))
        })),
        monitoring_plan: sa001.monitoring_plan || {}
    };
    fs.writeFileSync('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/protocol_builder_2_0_protocols_bundle/sa_001.json', JSON.stringify(blueprint, null, 2));
    console.log("Added sa_001 to bundle.");
}
