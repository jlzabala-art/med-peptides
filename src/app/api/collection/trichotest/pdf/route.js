import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const isEn = lang.toLowerCase() === 'en';

    const fileName = isEn
      ? 'Atlas-TrichoTest-Hair-Treatments-Dossier-EN.pdf'
      : 'Atlas-TrichoTest-Hair-Treatments-Dossier-ES.pdf';

    const filePath = path.resolve(process.cwd(), 'public/docs/trichotest', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Dossier PDF not found on server' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const downloadName = isEn
      ? 'Atlas-TrichoTest-Hair-Treatments-Clinical-Dossier.pdf'
      : 'Atlas-TrichoTest-Tratamientos-Capilares-Dossier-Clinico.pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      }
    });
  } catch (error) {
    console.error('[API collection/trichotest/pdf] Error delivering PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate or deliver TrichoTest PDF dossier' },
      { status: 500 }
    );
  }
}
