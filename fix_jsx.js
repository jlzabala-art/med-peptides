import fs from 'fs';
const file = './src/sections/EternaDiagnosticsShowcase.jsx';
let content = fs.readFileSync(file, 'utf8');

// The functions are:
// const renderAgingContent = () => (
// const renderWearablesContent = () => (
// const renderBiomarkersContent = () => (

content = content.replace(/const renderAgingContent = \(\) => \(/, 'const renderAgingContent = () => (<>');
content = content.replace(/const renderWearablesContent = \(\) => \(/, 'const renderWearablesContent = () => (<>');
content = content.replace(/const renderBiomarkersContent = \(\) => \(/, 'const renderBiomarkersContent = () => (<>');

// I need to find where they end. They end with:
//                     </div>
//   );
// Actually, let's just find "                    </div>\n  );" and replace with "                    </div>\n    </>\n  );"

content = content.replace(/ {20}<\/div>\n {2}\);/g, '                    </div>\n    </>\n  );');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed');
