import { NextResponse } from 'next/server';
import { generateMealplanPdf } from '@/lib/pdf/generators/generateMealplanPdf';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const isWafa = sampleId === 'G000943568';
    const patientName = searchParams.get('patient') || (isWafa ? 'Ms. Wafa Burud' : 'Hossam Ahmed');
    const doctorName = searchParams.get('doctor') || (isWafa ? 'Dr. Sajid Burud' : 'Dr. Ryhanh Medical');
    const clinicName = searchParams.get('clinic') || (isWafa ? 'Dr. Sajid Burud Medical Practice' : 'Ryhanh Medical Wellness · Doha, Qatar');
    const mealPlanPartner = searchParams.get('partner') || (isWafa ? 'Dr. Sajid Burud Clinical Nutrition' : 'Ryhanh Healthy Meal Plan & Diet Delivery');
    const includeOriginal = searchParams.get('full') !== 'false' && searchParams.get('includeOriginal') !== 'false';

    const pdfBytes = await generateMealplanPdf({
      sampleId,
      patientName,
      doctorName,
      clinicName,
      mealPlanPartner,
      includeOriginal
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Atlas-MealPlan-Guide-${sampleId}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('[API /api/reports/24genomics-mealplan-pdf] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan guide PDF', details: error.message },
      { status: 500 }
    );
  }
}
