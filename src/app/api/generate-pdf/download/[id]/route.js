import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id || !globalThis.__pdfDownloadCache || !globalThis.__pdfDownloadCache.has(id)) {
    return new NextResponse('PDF document not found or expired. Please generate a new one.', { status: 404 });
  }

  const { bytes, filename } = globalThis.__pdfDownloadCache.get(id);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
