import { NextResponse } from 'next/server';
import { saveGenomicReport } from '@/services/genomicsRepository';
import { parseRawGenomicPayload } from '@/services/genomics/adapters/GenomicAdapterRegistry';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/genomics/ingest
 *
 * Programmatic Ingestion Endpoint for Multi-Lab Genomic Microarray Reports.
 * Runs adapter normalization (24Genetics, TellmeGen), persists canonical
 * payload to Firestore /genomic_reports and updates all 4 cache layers.
 */
export async function POST(request) {
  try {
    const rawBody = await request.json();
    const normalized = parseRawGenomicPayload(rawBody);

    const targetSampleId = rawBody.sampleId || rawBody.sampleCode || normalized.sampleId;
    if (!targetSampleId) {
      return NextResponse.json(
        { error: 'Missing required field: sampleId or sampleCode' },
        { status: 400 }
      );
    }

    const payload = {
      ...normalized,
      sampleId: String(targetSampleId).trim(),
      sampleCode: String(targetSampleId).trim(),
      patientName: rawBody.patientName || normalized.patientName || 'Patient',
      doctor: rawBody.doctor || normalized.doctor || '',
      doctorId: rawBody.doctorId || '',
      doctorZohoId: rawBody.doctorZohoId || '',
      clinic: rawBody.clinic || normalized.clinic || 'Transcend Healthcare',
      gender: rawBody.gender || normalized.gender || 'Female',
      age: Number(rawBody.age || normalized.age) || 38,
      analysisDate: rawBody.analysisDate || normalized.analysisDate || new Date().toISOString().slice(0, 10),
      specimen: rawBody.specimen || normalized.specimen || 'Saliva CE-IVD (2.0 mL)',
      status: 'ready',
      snps: {
        ...normalized.snps,
        ...(rawBody.snps || {})
      },
      ancestry: {
        ...normalized.ancestry,
        ...(rawBody.ancestry || {})
      },
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
