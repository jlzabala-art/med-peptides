import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'atlas-indexnow-2026-8f9c2a1b';
const HOST = 'www.atlashealth-services.com';

const CORE_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/pricing/peptides`,
  `https://${HOST}/vials`,
  `https://${HOST}/pricing/pens`,
  `https://${HOST}/pricing/pellets`,
  `https://${HOST}/pricing/bhrt`,
  `https://${HOST}/pricing/hormones`,
  `https://${HOST}/pricing/bloodo`,
  `https://${HOST}/pricing/24genetics`,
  `https://${HOST}/pricing/fillers`,
  `https://${HOST}/guides/peptide-reconstitution-dosing`,
  `https://${HOST}/guides/hormone-pellets-implantation`,
  `https://${HOST}/proto`,
  `https://${HOST}/import-partner`,
  `https://${HOST}/llms.txt`,
];

export async function POST() {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: CORE_URLS,
      }),
    });
    return NextResponse.json({ submitted: CORE_URLS.length, indexNowStatus: res.status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
