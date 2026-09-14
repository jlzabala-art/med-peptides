import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL('/login', request.url);
  return NextResponse.redirect(url, { status: 307 });
}
