import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebaseClient';

export const getChurnPredictions = async (managerId) => {
  try {
    let q = query(collection(db, 'users'), where('role', 'in', ['doctor', 'clinic']), limit(20));
    const snap = await getDocs(q);
    if (snap.empty) {
      return [];
    }

    const now = Date.now();
    const predictions = [];

    snap.docs.forEach((d) => {
      const u = d.data();
      const lastActive = u.lastActiveAt?.toDate 
        ? u.lastActiveAt.toDate().getTime() 
        : (u.updatedAt?.toDate ? u.updatedAt.toDate().getTime() : 0);
      const daysInactive = lastActive ? Math.floor((now - lastActive) / (1000 * 60 * 60 * 24)) : 0;

      if (daysInactive >= 30) {
        const isHigh = daysInactive >= 45;
        predictions.push({
          clientId: d.id,
          clientName: u.displayName || u.clinicName || u.name || 'Partner Clinic',
          churnRisk: isHigh ? 'High' : 'Medium',
          riskScore: Math.min(95, Math.max(50, Math.round(daysInactive * 1.5))),
          reason: `No re-order activity or platform login recorded in the last ${daysInactive} days.`,
          nextBestAction: isHigh
            ? 'Trigger personalized outreach offer with volume rebate structure.'
            : 'Schedule an account review to discuss updated catalog offerings.',
        });
      }
    });

    return predictions;
  } catch (err) {
    console.error('[accountManagerAiService] getChurnPredictions failed:', err);
    return [];
  }
};

export const generatePitch = async (clientId, clientName, context) => {
  return `**Personalized Outreach for ${clientName}**\n\nBased on account profile and clinical focus on ${context || 'regenerative therapies'}, we recommend presenting our latest peptide formulations and tiered volume discounts. Confirm availability of batch certificates (CoAs) for seamless clinic procurement.`;
};
