const fs = require('fs');
const path = require('path');
const https = require('https');

const bundleDir = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/protocol_builder_2_0_protocols_bundle';
const files = fs.readdirSync(bundleDir).filter(f => f.endsWith('.json'));

// ⚠️  CANONICAL PROJECT: med-peptides-app — never change this to regenpept-web-app
const PROJECT_ID = "med-peptides-app";
const DATABASE_ID = "(default)";
const COLLECTION = "protocol_templates";

/**
 * Transforms simple JS object to Firestore REST payload nested fields
 */
function toFirestore(val) {
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
        if (Number.isInteger(val)) return { integerValue: val.toString() };
        return { doubleValue: val };
    }
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(toFirestore) } };
    }
    if (val && typeof val === 'object') {
        const fields = {};
        for (const key in val) {
            fields[key] = toFirestore(val[key]);
        }
        return { mapValue: { fields } };
    }
    return { nullValue: null };
}

async function uploadProtocol(protocol) {
    const payload = {
        fields: {}
    };
    for (const key in protocol) {
        payload.fields[key] = toFirestore(protocol[key]);
    }

    const docId = protocol.protocol_id;
    const pathUrl = `/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/${COLLECTION}/${docId}?updateMask.fieldPaths=active&updateMask.fieldPaths=status&updateMask.fieldPaths=protocol_title&updateMask.fieldPaths=protocol_slug&updateMask.fieldPaths=protocol_id&updateMask.fieldPaths=protocol_version&updateMask.fieldPaths=metadata&updateMask.fieldPaths=eligibility_rules&updateMask.fieldPaths=variant_rules&updateMask.fieldPaths=phase_blueprints&updateMask.fieldPaths=monitoring_plan&updateMask.fieldPaths=phases&updateMask.fieldPaths=expected_outcomes&updateMask.fieldPaths=generator_rules&updateMask.fieldPaths=generated_protocol_template&updateMask.fieldPaths=legacy_compatibility`;
    // Wait, simpler: just use PATCH without specifying every field in mask or if I want to overwrite whole doc, I should just use the REST API correctly.
    // Actually, for full overwrite, use PATCH with mask matching ALL fields I send.
    
    // I'll use a simpler script using the mcp tool if it helps, but mcp tool only has 'firestore_update_document' which might be easier.
    // However, I want to do it for ALL 16.
    
    return payload;
}

// I'll generate the payloads and save them to a file for later processing or use them directly if I can.
const payloads = [];
files.forEach(f => {
    const p = JSON.parse(fs.readFileSync(path.join(bundleDir, f), 'utf8'));
    const payload = {
        docId: p.protocol_id,
        fields: {}
    };
    for (const key in p) {
        payload.fields[key] = toFirestore(p[key]);
    }
    payloads.push(payload);
});

fs.writeFileSync('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/bundle_payloads.json', JSON.stringify(payloads, null, 2));
console.log(`Generated ${payloads.length} payloads for Firestore.`);
