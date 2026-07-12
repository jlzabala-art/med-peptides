const fs = require('fs');
console.log("Reading ClinicalAssistant.jsx...");
try {
  fs.readFileSync('src/components/shared/ClinicalAssistant/ClinicalAssistant.jsx');
  console.log("Success!");
} catch(e) {
  console.log("Error:", e);
}
