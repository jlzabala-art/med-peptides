import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Use service account from the root
const serviceAccountPath = path.resolve('serviceAccount-target.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const NORMALIZED_GOALS = [
  'metabolic_weight',
  'recovery_repair',
  'cognitive_mood',
  'sleep_circadian',
  'longevity_anti_aging',
  'hormonal_optimization',
  'immune_support'
];

const MAPPING = {
  'Cognitive & Mood Optimization': 'cognitive_mood',
  'Cognitive & Mood': 'cognitive_mood',
  'Hormonal Health & Vitality': 'hormonal_optimization',
  'Hormonal Optimization': 'hormonal_optimization',
  'Sleep & Circadian Rhythm Support': 'sleep_circadian',
  'Sleep & Circadian': 'sleep_circadian',
  'Metabolic & Weight': 'metabolic_weight',
  'weight_management': 'metabolic_weight',
  'Recovery & Repair': 'recovery_repair',
  'Longevity & Anti-Aging': 'longevity_anti_aging',
  'Immune Support': 'immune_support',
  // Add more partial matches if needed
};

function getNormalizedGoal(rawGoal, title = '') {
  if (!rawGoal && !title) return 'metabolic_weight'; // Default fallback
  const normalized = (rawGoal || '').toLowerCase().trim();
  const titleLower = (title || '').toLowerCase();
  
  // Fuzzy match (Check title too) - Prioritize this to fix mis-categorized items
  if (normalized.includes('sleep') || normalized.includes('circadian') || titleLower.includes('sleep') || titleLower.includes('circadian')) return 'sleep_circadian';
  if (normalized.includes('weight') || normalized.includes('metabolic') || titleLower.includes('weight') || titleLower.includes('metabolic')) return 'metabolic_weight';
  if (normalized.includes('recover') || normalized.includes('repair') || titleLower.includes('recover') || titleLower.includes('repair')) return 'recovery_repair';
  if (normalized.includes('cognit') || normalized.includes('mood') || titleLower.includes('cognit') || titleLower.includes('mood')) return 'cognitive_mood';
  if (normalized.includes('long') || normalized.includes('anti-aging') || titleLower.includes('long') || titleLower.includes('anti-aging')) return 'longevity_anti_aging';
  if (normalized.includes('hormon') || titleLower.includes('hormon')) return 'hormonal_optimization';
  if (normalized.includes('immun') || titleLower.includes('immun')) return 'immune_support';

  if (NORMALIZED_GOALS.includes(normalized)) return normalized;
  
  // Try mapping
  if (MAPPING[rawGoal]) return MAPPING[rawGoal];

  return 'metabolic_weight'; // Default fallback
}

async function normalizeGoals() {
  console.log('--- Normalizing Protocol Goals in Firestore ---');
  const snap = await db.collection('protocols').get();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const title = data.protocol_title || data.title || '';
    const rawGoal = data.metadata?.primary_goal || data.primary_goal;
    const normalized = getNormalizedGoal(rawGoal, title);

    if (rawGoal !== normalized) {
      console.log(`Updating [${doc.id}]: "${rawGoal}" -> "${normalized}"`);
      
      const updates = {};
      if (data.metadata) {
        updates['metadata.primary_goal'] = normalized;
      }
      if (data.primary_goal !== undefined) {
        updates['primary_goal'] = normalized;
      }
      
      // If metadata doesn't exist but we want to ensure primary_goal is there
      if (!data.metadata && data.primary_goal === undefined) {
        updates['primary_goal'] = normalized;
      }

      await doc.ref.update(updates);
      count++;
    }
  }

  console.log(`\nSuccessfully normalized ${count} protocols.`);
}

normalizeGoals().catch(console.error);
