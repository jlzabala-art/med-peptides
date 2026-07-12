const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../templates/DoctorHome.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /import { collection, query, where, getDocs, doc, getDoc } from 'firebase\/firestore';\nimport \* as fb from '\.\.\/firebase';\nconst db = fb\?\.db;/g,
  `import userRepository from '../repositories/userRepository';
import configRepository from '../repositories/configRepository';
import { recommendationRepository } from '../repositories/recommendationRepository';`
);

content = content.replace(
  /const ptsSnap = await getDocs\(\s*query\(collection\(db, 'doctor_patient_relationships'\), where\('doctorId', '==', doctorId\), where\('status', '==', 'active'\)\)\s*\);\s*const recsSnap = await getDocs\(\s*query\(collection\(db, 'doctor_recommendations'\), where\('doctorId', '==', doctorId\)\)\s*\);/g,
  `const ptsCount = await userRepository.getDoctorPatientsCount(doctorId);
        const recsCount = await recommendationRepository.getDoctorRecommendationsCount(doctorId);`
);

content = content.replace(
  /setMetrics\(\{\s*activePatients: ptsSnap\.size,\s*recommendationsSent: recsSnap\.size,\s*\}\);/g,
  `setMetrics({\n          activePatients: ptsCount,\n          recommendationsSent: recsCount,\n        });`
);

content = content.replace(
  /const agentSnap = await getDoc\(doc\(db, 'ai_config', 'agents'\)\);\s*if \(agentSnap\.exists\(\)\) \{\s*const data = agentSnap\.data\(\);\s*if \(data\.list\) setAiAgents\(data\.list\);\s*\}/g,
  `const data = await configRepository.getAiAgents();\n        if (data && data.list) setAiAgents(data.list);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('DoctorHome.jsx refactored successfully.');
