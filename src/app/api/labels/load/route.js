import { NextResponse } from 'next/server';
import { getPrescriptionData } from '@/lib/prescriptionFetcher';
import { getPharmapolisLabelsForPrescription, PHARMAPOLIS_LABELS_REGISTRY } from '@/data/pharmapolisLabelsMap';

export const dynamic = 'force-dynamic';

/**
 * GET /api/labels/load?code=51812
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches prescription details and derives EU GMP compounding labels for the
 * public standalone Compounding Label Studio.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || searchParams.get('rx') || '').trim();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Missing code parameter' }, { status: 400 });
    }

    // 1. Fetch prescription from Firestore / cache
    let rx = await getPrescriptionData(code);

    // 2. Fallback to static registry if not in Firestore
    if (!rx) {
      const codeLower = code.toLowerCase();
      const registryMatch = PHARMAPOLIS_LABELS_REGISTRY.find(item => {
        const fileNo = (item.fileNumber || '').toLowerCase();
        const pMatches = (item.prescriptionMatches || []).map(m => String(m).toLowerCase());
        const patMatches = (item.patientMatches || []).map(m => String(m).toLowerCase());
        return fileNo === codeLower || pMatches.includes(codeLower) || patMatches.includes(codeLower);
      });

      if (registryMatch) {
        rx = {
          id: registryMatch.fileNumber || registryMatch.id || code,
          fileNumber: registryMatch.fileNumber || code,
          code: registryMatch.fileNumber || code,
          patientName: registryMatch.patientName || 'Patient',
          patient: { name: registryMatch.patientName || 'Patient' },
          doctorName: registryMatch.doctorName || 'Treating Physician',
          clinicName: registryMatch.clinicName || 'Atlas Partner Clinic',
          treatmentTitle: registryMatch.productTitle || registryMatch.productName || 'Compounded Pharmaceutical Protocol',
          status: 'approved',
          source: 'registry'
        };
      }
    }

    if (!rx) {
      return NextResponse.json({ success: false, error: `Prescription #${code} not found` }, { status: 404 });
    }

    // 3. Derive labels
    const labels = getPharmapolisLabelsForPrescription(rx);

    return NextResponse.json({
      success: true,
      rx,
      labels: labels || []
    });
  } catch (error) {
    console.error('[api/labels/load] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
