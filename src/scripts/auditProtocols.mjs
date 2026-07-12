import fs from 'fs';

const protocols = JSON.parse(fs.readFileSync('../data/dumped_protocols.json', 'utf8'));

let md = '# Protocol Clinical Audit\n\n';

protocols.forEach(p => {
  md += `## ${p.protocol_name || p.id} (${p.primary_goal})\n`;
  md += `- **Description**: ${p.description || 'N/A'}\n`;
  md += `- **Outcomes/Evidence**: ${p.clinical_evidence?.efficacy_summary || 'N/A'}\n`;
  
  if (p.phase_blueprints && p.phase_blueprints.length > 0) {
    p.phase_blueprints.forEach((phase, i) => {
      md += `  - **Phase ${i+1}: ${phase.phase_name}**\n`;
      if (phase.drugs) {
        phase.drugs.forEach(d => {
          const dl = d.dose_logic || {};
          md += `    - ${d.compound_name || d.name || d.compound}: ${dl.starting_weekly_dose || dl.amount || 'Unknown'} ${dl.dose_unit || 'mg'}/week. Freq: ${dl.administration_frequency || dl.frequency || 'Unknown'}\n`;
        });
      }
    });
  }
  md += '\n';
});

fs.writeFileSync('../data/protocol_audit.md', md);
console.log('Saved protocol_audit.md');
