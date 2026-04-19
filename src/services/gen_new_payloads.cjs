const fs = require('fs');
const path = require('path');

const sourceDir = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/weight_management_protocols_new_schema';
const files = ['wm_001.json', 'wm_002.json', 'wm_003.json', 'wm_004.json'];

function toFirestore(val) {
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
        if (Number.isInteger(val)) return { integerValue: val.toString() };
        return { doubleValue: val };
    }
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(v => toFirestore(v)) } };
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

const allPayloads = {};
files.forEach(f => {
    const p = JSON.parse(fs.readFileSync(path.join(sourceDir, f), 'utf8'));
    const fields = {};
    for (const key in p) {
        fields[key] = toFirestore(p[key]);
    }
    allPayloads[p.protocol_id] = fields;
});

fs.writeFileSync('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/new_wm_payloads.json', JSON.stringify(allPayloads, null, 2));
console.log('Payloads generated.');
