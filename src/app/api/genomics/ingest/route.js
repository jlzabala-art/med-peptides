import { NextResponse } from 'next/server';
import { saveGenomicReport } from '@/services/genomicsRepository';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/genomics/ingest
 *
 * Programmatic Ingestion Endpoint for 24Genetics / Genomic Microarray Reports.
 * Persists canonical report payload to Firestore /genomic_reports and updates all 4 cache layers.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sampleId,
      sampleCode,
      patientName,
      gender,
      age,
      doctor,
      doctorId,
      doctorZohoId,
      clinic,
      analysisDate,
      testType,
      platform,
      specimen,
      snps,
      ancestry
    } = body;

    const targetSampleId = sampleId || sampleCode;
    if (!targetSampleId) {
      return NextResponse.json(
        { error: 'Missing required field: sampleId or sampleCode' },
        { status: 400 }
      );
    }
    if (!patientName) {
      return NextResponse.json(
        { error: 'Missing required field: patientName' },
        { status: 400 }
      );
    }

    const payload = {
      sampleId: String(targetSampleId).trim(),
      sampleCode: String(targetSampleId).trim(),
      patientName: String(patientName).trim(),
      gender: gender || 'Unspecified',
      age: Number(age) || 35,
      doctor: doctor || '',
      doctorId: doctorId || '',
      doctorZohoId: doctorZohoId || '',
      clinic: clinic || 'Atlas Health Services',
      analysisDate: analysisDate || new Date().toISOString().slice(0, 10),
      testType: testType || '24Genetics Nutrition 2.0 & Ancestry CE-IVD',
      platform: platform || 'Illumina Infinium GSA-24 BeadChip',
      specimen: specimen || 'Saliva CE-IVD (2.0 mL)',
      status: 'ready',
      snps: snps || {},
      ancestry: ancestry || {},
      ingestedAt: new Date().toISOString()
    };

    const saved = await saveGenomicReport(targetSampleId, payload);
    logger.info(`[api/genomics/ingest] Successfully ingested genomic report for ${targetSampleId}`);

    return NextResponse.json({
      success: true,
      sampleId: targetSampleId,
      patientName: payload.patientName,
      report: saved
    });
  } catch (err) {
    logger.error('[api/genomics/ingest] Error during ingestion:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during genomic report ingestion' },
      { status: 500 }
    );
  }
}
