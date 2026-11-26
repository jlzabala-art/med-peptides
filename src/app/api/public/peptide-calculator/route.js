import { NextResponse } from 'next/server';

function computeDosing({ vialMg, diluentMl, targetDoseMcg, penVolumeMl = 3 }) {
  const safeVialMg = Number(vialMg);
  const safeDiluentMl = Number(diluentMl);
  const safeTargetMcg = Number(targetDoseMcg);

  if (!Number.isFinite(safeVialMg) || safeVialMg <= 0) {
    return { error: 'vialMg must be a positive number' };
  }
  if (!Number.isFinite(safeDiluentMl) || safeDiluentMl <= 0) {
    return { error: 'diluentMl must be a positive number' };
  }
  if (!Number.isFinite(safeTargetMcg) || safeTargetMcg <= 0) {
    return { error: 'targetDoseMcg must be a positive number' };
  }

  const totalMcg = safeVialMg * 1000;
  const concentrationMcgPerMl = totalMcg / safeDiluentMl;
  const drawVolumeMl = safeTargetMcg / concentrationMcgPerMl;
  const u100Units = drawVolumeMl * 100;
  const dosesPerContainer = totalMcg / safeTargetMcg;
  const clicksPerPen3ml = safeDiluentMl === penVolumeMl ? u100Units : null;

  return {
    inputs: {
      vialMg: safeVialMg,
      diluentMl: safeDiluentMl,
      targetDoseMcg: safeTargetMcg,
    },
    results: {
      totalMcg,
      concentrationMcgPerMl: Number(concentrationMcgPerMl.toFixed(2)),
      drawVolumeMl: Number(drawVolumeMl.toFixed(4)),
      u100Units: Number(u100Units.toFixed(1)),
      dosesPerContainer: Number(dosesPerContainer.toFixed(1)),
      ...(clicksPerPen3ml !== null ? { clicksOn3MlPen: Number(clicksPerPen3ml.toFixed(1)) } : {}),
    },
    referenceUrl: 'https://www.atlashealth-services.com/tools/peptide-calculator',
    guideUrl: 'https://www.atlashealth-services.com/guides/peptide-reconstitution-dosing',
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const vialMg = searchParams.get('vialMg') || 10;
  const diluentMl = searchParams.get('diluentMl') || 2;
  const targetDoseMcg = searchParams.get('targetDoseMcg') || 250;

  const out = computeDosing({ vialMg, diluentMl, targetDoseMcg });
  if (out.error) {
    return NextResponse.json(out, { status: 400 });
  }
  return NextResponse.json(out, {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const out = computeDosing({
      vialMg: body?.vialMg ?? 10,
      diluentMl: body?.diluentMl ?? 2,
      targetDoseMcg: body?.targetDoseMcg ?? 250,
    });
    if (out.error) return NextResponse.json(out, { status: 400 });
    return NextResponse.json(out, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
