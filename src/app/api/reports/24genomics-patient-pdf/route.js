import { NextResponse } from 'next/server';
import { generatePatientGenomicsPdf } from '@/lib/pdf/generators/generatePatientGenomicsPdf';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const isWafa = sampleId === 'G000943568';
    const patientName = searchParams.get('patient') || (isWafa ? 'Ms. Wafa Burud' : 'Hossam Ahmed');
    const doctorNameParam = searchParams.get('doctor') || (isWafa ? 'Dr. Sajid Burud' : 'Dr. Ryhanh Medical');
    const clinicName = searchParams.get('clinic') || (isWafa ? 'Dr. Sajid Burud Medical Practice' : 'Ryhanh Medical Wellness · Doha, Qatar');
    const modalityParam = searchParams.get('modality') || 'modalityB';
    const isOptionA = modalityParam === 'optionA' || modalityParam === 'modalityA';
    const includeOriginal = searchParams.get('full') !== 'false' && searchParams.get('includeOriginal') !== 'false';

    const pdfBytes = await generatePatientGenomicsPdf({
      sampleId,
      patientName,
      doctorNameParam,
      clinicName,
      isOptionA,
      includeOriginal
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Atlas-Genomic-Prescription-${sampleId}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('[API /api/reports/24genomics-patient-pdf] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate genomic patient prescription PDF', details: error.message },
      { status: 500 }
    );
  }
}
