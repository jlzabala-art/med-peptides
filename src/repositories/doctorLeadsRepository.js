/**
 * repositories/doctorLeadsRepository.js
 * Bounded repository for physician clinical inquiry leads (`doctor_leads`).
 */
import { collection, getDocs, query, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function getDoctorLeads(maxResults = 50) {
  if (!db) return [];
  const q = query(collection(db, 'doctor_leads'), orderBy('createdAt', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAtDisplay: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toLocaleDateString() : 'Recent',
  }));
}

export async function claimDoctorLead(leadId, doctorId = 'current_physician') {
  if (!db || !leadId) return;
  await updateDoc(doc(db, 'doctor_leads', leadId), {
    status: 'contacted',
    assignedDoctorId: doctorId,
  });
}
