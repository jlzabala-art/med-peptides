import { adminDb } from '../../../../lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import ProtocolPageClient from '../../../../components/admin/protocols/ProtocolPageClient';

function normalizePhaseBlueprint(bp, index) {
  return {
    index,
    label: bp.phase_title || bp.label || `Phase ${index + 1}`,
    durationWeeks: bp.default_duration_weeks || bp.durationWeeks || 4,
    objective: Array.isArray(bp.clinical_purpose)
      ? bp.clinical_purpose.join(', ')
      : (bp.objective || ''),
    items: (bp.drugs || bp.drugs_used || bp.items || []).map(d => ({
      productId: d.product_id || d.productId || '',
      productName: d.product_title || d.productName || d.name || '',
      dosage: d.dose_logic?.dose_per_administration
        ? `${d.dose_logic.dose_per_administration} ${d.dose_logic.dose_unit || 'mcg'}`
        : (d.dosage || d.dosage_mg ? `${d.dosage || d.dosage_mg} mcg` : ''),
      route: d.route || 'subcutaneous',
      frequency: d.dose_logic?.administration_frequency || d.frequency || '',
    })),
  };
}

const serialize = (v) => {
  if (v === null || v === undefined) return v;
  if (typeof v?.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(serialize);
  if (typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, serialize(val)]));
  }
  return v;
};

async function getProtocol(id) {
  if (!adminDb) return null;
  try {
    const docRef = adminDb.collection('protocols').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;
    const data = snap.data();

    if (!data.phases || data.phases.length === 0) {
      const phasesSnap = await docRef.collection('phases').get();
      if (!phasesSnap.empty) {
        data.phases = phasesSnap.docs
          .map(d => d.data())
          .sort((a, b) => (a.index || 0) - (b.index || 0));
      }
    }
    if ((!data.phases || data.phases.length === 0) && data.phase_blueprints?.length > 0) {
      data.phases = data.phase_blueprints.map(normalizePhaseBlueprint);
    }

    return serialize({ id: snap.id, ...data });
  } catch (err) {
    console.error('[ProtocolPage] fetch error:', err);
    return null;
  }
}

export default async function ProtocolDetailPage({ params }) {
  const { id } = await params;
  const protocol = await getProtocol(id);
  if (!protocol) notFound();
  return <ProtocolPageClient protocol={protocol} />;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const protocol = await getProtocol(id);
  return {
    title: protocol
      ? `${protocol.protocol_name || protocol.title || 'Protocol'} — Atlas Health`
      : 'Protocol — Atlas Health',
    description: protocol?.overview_summary || '',
  };
}
