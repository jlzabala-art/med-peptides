// Patch script: replace Case D in index.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.js');
let src = fs.readFileSync(file, 'utf8');

// Marker strings to locate the block
const START_MARKER = '      // Case D: General Goal Match (no specific compound found by name)';
const END_MARKER = '      }\n      // ── Phase F: Catalog Fallback';

const startIdx = src.indexOf(START_MARKER);
const endIdx = src.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const before = src.slice(0, startIdx);
const after = src.slice(endIdx);

const NEW_CASE_D = `      // Case D: General Goal Match — Protocol-First Rule (Training aligned)
      else if (matchedGoals.size > 0) {
        const goalLabel = Array.from(matchedGoals)[0].replace(/_/g, ' ');

        // Protocol-First: if a protocol scored for this goal, lead with it
        const goalProtocol = scoredProtocols.length > 0 ? scoredProtocols[0] : null;

        if (goalProtocol) {
          const protoName = goalProtocol.name || goalProtocol.metadata?.name || 'Research Protocol';
          const compounds = (goalProtocol.compounds || goalProtocol.peptides || []).slice(0, 4);
          const compoundLines = compounds.length
            ? compounds.map(c => {
                const dose = userLevel === 'professional' && c.dosage ? \` — \${c.dosage}\` : '';
                return \`- **\${c.name || c}**\${dose}\`;
              }).join('\\n')
            : '- Refer to the protocol detail page for compound list';

          const nextStep = userLevel === 'professional'
            ? 'Review full dosing schedule and cycle length in the protocol detail.'
            : 'Start by reviewing the protocol overview — it covers the full compound stack and timeline.';

          reply = [
            \`**🎯 GOAL:** \${goalLabel}\`,
            '',
            \`**📋 RECOMMENDED PROTOCOL:** \${protoName}\`,
            goalProtocol.description ? \`> \${goalProtocol.description.slice(0, 160)}…\` : '',
            '',
            '**🔬 KEY COMPOUNDS:**',
            compoundLines,
            '',
            \`**➡️ NEXT STEP:** \${nextStep}\`,
          ].filter(l => l !== undefined).join('\\n');

          suggestions = [
            { label: \`View Protocol: \${protoName}\`, action: 'NAVIGATE', payload: \`/protocol/\${goalProtocol.slug || goalProtocol.id}\` },
            { label: 'Compare protocols', action: 'MESSAGE', payload: \`Compare protocols for \${goalLabel}\` },
          ];

        } else {
          // No protocol — surface top goal-matched compounds
          const goalPeptides = allPeptides
            .filter(p =>
              p.goals?.some(g => matchedGoals.has(g)) ||
              p.secondaryFactors?.some(f => matchedGoals.has(f))
            )
            .slice(0, 3);

          if (goalPeptides.length > 0) {
            const compoundLines = goalPeptides.map(p => {
              const shortDesc = p.desc || (p.description ? p.description.slice(0, 90) + '…' : '');
              const dose = userLevel === 'professional' && p.dosage ? \` *(\${p.dosage})*\` : '';
              return \`- **\${p.name}**\${dose}\${shortDesc ? '\\n  ' + shortDesc : ''}\`;
            }).join('\\n');

            reply = [
              \`**🎯 GOAL:** \${goalLabel}\`,
              '',
              '**📋 RECOMMENDED PROTOCOL:** No curated protocol on file yet for this goal.',
              '',
              '**🔬 KEY COMPOUNDS:**',
              compoundLines,
              '',
              '**➡️ NEXT STEP:** Would you like a deeper profile on any of these, or help building a custom stack?',
            ].join('\\n');

            suggestions = goalPeptides.map(p => ({
              label: p.name,
              action: 'NAVIGATE',
              payload: \`/product/\${p.slug || p.name.toLowerCase().replace(/\\s+/g, '-')}\`,
            }));
          } else {
            suggestions = ['Shipping', 'Reconstitution', 'Catalog'];
            reply = \`**🎯 GOAL:** \${goalLabel}\\n\\nI found a relevant research area but no specific compounds or protocols matched yet.\\n\\nTry a compound name *(e.g. BPC-157, Semax)* or a more specific goal.\`;
          }
        }
      }
`;

const out = before + NEW_CASE_D + after;
fs.writeFileSync(file, out, 'utf8');
console.log('✅ Case D patched successfully. Total lines:', out.split('\n').length);
