const fs = require('fs');

let content = fs.readFileSync('src/templates/ProtocolTemplate.jsx', 'utf8');
const lines = content.split('\n');

// We want to delete specific blocks of lines:
// CategoryProtocolNavigator: 103 to 400
// OptionalAccessoriesCard (including OPTIONAL_ACCESSORIES): 432 to 497
// PhaseAccordion: 500 to 649
// EligibilityBlock: 651 to 686
// SectionAccordion: 691 to 774

const toDelete = [];
for (let i = 103; i <= 400; i++) toDelete.push(i);
for (let i = 431; i <= 497; i++) toDelete.push(i); // 431 has the comment for OptionalAccessoriesCard
for (let i = 500; i <= 649; i++) toDelete.push(i);
for (let i = 651; i <= 689; i++) toDelete.push(i); // Let's check 689 just in case
for (let i = 691; i <= 774; i++) toDelete.push(i);

// Also need to add imports at the top
const newLines = [];
let importsAdded = false;

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  
  if (lineNum === 103) { // Let's add imports around here where CategoryProtocolNavigator started
    newLines.push("import CategoryProtocolNavigator from '../components/protocol/CategoryProtocolNavigator';");
    newLines.push("import OptionalAccessoriesCard from '../components/protocol/OptionalAccessoriesCard';");
    newLines.push("import PhaseAccordion from '../components/protocol/PhaseAccordion';");
    newLines.push("import EligibilityBlock from '../components/protocol/EligibilityBlock';");
    newLines.push("import SectionAccordion from '../components/protocol/SectionAccordion';");
  }

  // If line is in toDelete, we skip it
  if (!toDelete.includes(lineNum)) {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/templates/ProtocolTemplate.jsx', newLines.join('\n'), 'utf8');
console.log("Done");
