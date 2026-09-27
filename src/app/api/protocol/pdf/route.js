import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { adminDb } from '@/lib/firebaseAdmin';

// Helper to sanitize text for PDF WinAnsi standard font
function sanitize(text) {
  if (!text) return '';
  return String(text)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { protocol } = body;
    const { slug, lang = 'en' } = body;

    // If protocol not passed directly in body, fetch from Firestore
    if (!protocol && slug && adminDb) {
      const snap = await adminDb.collection('protocols').doc(slug).get();
      if (snap.exists) {
        protocol = { id: snap.id, ...snap.data() };
      } else {
        const querySnap = await adminDb.collection('protocols').where('slug', '==', slug).limit(1).get();
        if (!querySnap.empty) {
          protocol = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() };
        }
      }
    }

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol data or valid slug required' }, { status: 400 });
    }

    const isEs = lang === 'es';
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_WIDTH = 595.28; // A4
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 40;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

    const COLOR_PRIMARY = rgb(0, 0.21, 0.4);     // Deep Navy #003666
    const COLOR_ACCENT = rgb(0.01, 0.52, 0.78);    // Medical Blue #0284c7
    const COLOR_TEXT = rgb(0.12, 0.16, 0.22);      // #1e293b
    const COLOR_MUTED = rgb(0.4, 0.45, 0.52);      // #64748b
    const COLOR_LIGHT_BG = rgb(0.96, 0.98, 1);     // #f8fafc

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const checkPageBreak = (neededHeight) => {
      if (y - neededHeight < MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
        drawMiniHeader();
      }
    };

    const drawMiniHeader = () => {
      page.drawText(sanitize(protocol.name || protocol.title || 'Clinical Protocol Blueprint'), {
        x: MARGIN,
        y: y,
        size: 9,
        font: helveticaBold,
        color: COLOR_MUTED
      });
      page.drawLine({
        start: { x: MARGIN, y: y - 5 },
        end: { x: PAGE_WIDTH - MARGIN, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92)
      });
      y -= 25;
    };

    // ── TOP CLINICAL BANNER ──
    page.drawRectangle({
      x: MARGIN,
      y: y - 35,
      width: CONTENT_WIDTH,
      height: 35,
      color: COLOR_PRIMARY
    });

    page.drawText(isEs ? 'REGENPEPT / MED-PEPTIDES — BLUEPRINT CLÍNICO OFICIAL' : 'REGENPEPT / MED-PEPTIDES — OFFICIAL CLINICAL BLUEPRINT', {
      x: MARGIN + 12,
      y: y - 22,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });

    const dateStr = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    page.drawText(`REF: ${sanitize(slug || protocol.id || 'PROT').toUpperCase()} • ${dateStr}`, {
      x: PAGE_WIDTH - MARGIN - 180,
      y: y - 22,
      size: 8,
      font: helvetica,
      color: rgb(0.85, 0.92, 1)
    });

    y -= 55;

    // ── PROTOCOL TITLE & GOAL ──
    const titleText = sanitize(protocol.name || protocol.title || 'Clinical Peptide Protocol');
    page.drawText(titleText, {
      x: MARGIN,
      y,
      size: 16,
      font: helveticaBold,
      color: COLOR_PRIMARY
    });
    y -= 20;

    const subtitleText = sanitize(protocol.subtitle || protocol.short_description || protocol.goal || 'Advanced Precision Peptide Formulation');
    page.drawText(subtitleText, {
      x: MARGIN,
      y,
      size: 10,
      font: helvetica,
      color: COLOR_MUTED
    });
    y -= 25;

    // ── METADATA CHIPS BOX ──
    page.drawRectangle({
      x: MARGIN,
      y: y - 30,
      width: CONTENT_WIDTH,
      height: 30,
      color: COLOR_LIGHT_BG
    });

    const metaParts = [
      `${isEs ? 'Fase' : 'Phase'}: ${sanitize(protocol.phase || 'Clinical Grade')}`,
      `${isEs ? 'Duración' : 'Duration'}: ${sanitize(protocol.duration || protocol.cycle_duration || '8-12 Weeks')}`,
      `${isEs ? 'Dificultad' : 'Difficulty'}: ${sanitize(protocol.difficulty || 'Practitioner Guided')}`,
      `${isEs ? 'Cadena' : 'Cold-Chain'}: 2-8°C Required`
    ];

    let metaX = MARGIN + 10;
    metaParts.forEach(part => {
      page.drawText(part, {
        x: metaX,
        y: y - 18,
        size: 8.5,
        font: helveticaBold,
        color: COLOR_PRIMARY
      });
      metaX += 125;
    });

    y -= 45;

    // ── SECTION 1: INCLUDED COMPOUNDS (BOM) ──
    checkPageBreak(120);
    page.drawText(isEs ? '1. COMPONENTES Y PÉPTIDOS INCLUIDOS (BOM)' : '1. INCLUDED COMPOUNDS & ACTIVE PEPTIDES (BOM)', {
      x: MARGIN,
      y,
      size: 11,
      font: helveticaBold,
      color: COLOR_PRIMARY
    });
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: COLOR_ACCENT
    });
    y -= 18;

    const boms = protocol.bom || protocol.compounds || protocol.products || [];
    if (boms.length === 0) {
      page.drawText(isEs ? 'Formulación personalizada según indicación médica.' : 'Custom physician-directed compounded formula.', {
        x: MARGIN + 10,
        y,
        size: 9,
        font: helvetica,
        color: COLOR_TEXT
      });
      y -= 20;
    } else {
      boms.forEach((item, idx) => {
        checkPageBreak(35);
        const name = sanitize(item.product_name || item.name || item.productId || `Compound ${idx + 1}`);
        const dose = sanitize(item.target_dose || item.dose || item.dosage || 'Clinical dose as prescribed');
        const freq = sanitize(item.frequency || item.administration_route || 'Subcutaneous / Topical');
        const vials = item.vials_per_cycle ? `${item.vials_per_cycle} vials / cycle` : '';

        // Row background
        page.drawRectangle({
          x: MARGIN,
          y: y - 18,
          width: CONTENT_WIDTH,
          height: 22,
          color: idx % 2 === 0 ? rgb(0.98, 0.99, 1) : rgb(1, 1, 1)
        });

        page.drawText(`• ${name}`, {
          x: MARGIN + 8,
          y: y - 12,
          size: 9,
          font: helveticaBold,
          color: COLOR_TEXT
        });

        page.drawText(`${dose} — ${freq} ${vials ? `(${vials})` : ''}`, {
          x: MARGIN + 220,
          y: y - 12,
          size: 8.5,
          font: helvetica,
          color: COLOR_MUTED
        });

        y -= 24;
      });
    }

    y -= 15;

    // ── SECTION 2: CLINICAL PATHWAY & TIMELINE ──
    checkPageBreak(120);
    page.drawText(isEs ? '2. CRONOGRAMA Y FASES DEL PROTOCOLO' : '2. CLINICAL PATHWAY TIMELINE & PHASES', {
      x: MARGIN,
      y,
      size: 11,
      font: helveticaBold,
      color: COLOR_PRIMARY
    });
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: COLOR_ACCENT
    });
    y -= 18;

    const timeline = protocol.timeline_phases || protocol.phases || [
      { phase: isEs ? 'Fase 1 (Semanas 1-2)' : 'Phase 1 (Weeks 1-2)', desc: isEs ? 'Titulación inicial y evaluación de tolerancia biológica.' : 'Initial titration and biological tolerance assessment.' },
      { phase: isEs ? 'Fase 2 (Semanas 3-8)' : 'Phase 2 (Weeks 3-8)', desc: isEs ? 'Fase activa de respuesta terapéutica y optimización.' : 'Active therapeutic therapeutic response and optimization.' },
      { phase: isEs ? 'Fase 3 (Semanas 9-12)' : 'Phase 3 (Weeks 9-12)', desc: isEs ? 'Consolidación de receptores, mantenimiento o descanso de ciclo.' : 'Receptor consolidation, maintenance or wash-out interval.' }
    ];

    timeline.forEach(p => {
      checkPageBreak(30);
      page.drawText(sanitize(p.phase || p.title || 'Phase'), {
        x: MARGIN + 8,
        y: y - 10,
        size: 9,
        font: helveticaBold,
        color: COLOR_PRIMARY
      });
      page.drawText(sanitize(p.desc || p.description || p.instructions || ''), {
        x: MARGIN + 140,
        y: y - 10,
        size: 8.5,
        font: helvetica,
        color: COLOR_TEXT
      });
      y -= 22;
    });

    y -= 15;

    // ── SECTION 3: RECONSTITUTION & STORAGE CONSOLE ──
    checkPageBreak(100);
    page.drawText(isEs ? '3. CONSOLA DE RECONSTITUCIÓN Y CONSERVACIÓN' : '3. RECONSTITUTION & COLD-CHAIN GUIDANCE', {
      x: MARGIN,
      y,
      size: 11,
      font: helveticaBold,
      color: COLOR_PRIMARY
    });
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: COLOR_ACCENT
    });
    y -= 18;

    const reconNotes = [
      isEs ? 'Diluyente: Usar exclusivamente Agua Bacteriostática estéril (BAC 0.9% Alcohol Bencílico).' : 'Diluent: Use sterile Bacteriostatic Water (BAC 0.9% Benzyl Alcohol) exclusively.',
      isEs ? 'Inyección del diluyente: Deslizar el líquido lentamente por las paredes del vial para evitar desnaturalización.' : 'Fluid entry: Direct stream slowly down the glass vial wall to prevent shear stress.',
      isEs ? 'Temperatura de almacenamiento: Mantener en refrigeración a 2-8°C tras la reconstitución. Proteger de la luz.' : 'Storage temperature: Store refrigerated at 2-8°C once reconstituted. Protect from direct UV/light.',
      isEs ? 'Caducidad reconstituida: Utilizar dentro de los 28-30 días tras la primera dilución.' : 'Stability window: Consume within 28-30 days post-reconstitution.'
    ];

    reconNotes.forEach(note => {
      checkPageBreak(20);
      page.drawText(`✓  ${note}`, {
        x: MARGIN + 8,
        y: y - 8,
        size: 8.5,
        font: helvetica,
        color: COLOR_TEXT
      });
      y -= 18;
    });

    y -= 15;

    // ── SECTION 4: CLINICAL SAFETY & GOVERNANCE ──
    checkPageBreak(100);
    page.drawText(isEs ? '4. GOBERNANZA CLÍNICA Y SEGURIDAD' : '4. CLINICAL SAFETY GOVERNANCE', {
      x: MARGIN,
      y,
      size: 11,
      font: helveticaBold,
      color: COLOR_PRIMARY
    });
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: COLOR_ACCENT
    });
    y -= 18;

    const safetyNotes = [
      isEs ? 'Este documento es un blueprint técnico para soporte a la toma de decisión médica profesional.' : 'This document is a technical blueprint for professional clinical decision support.',
      isEs ? 'Requiere supervisión de un médico prescriptor colegiado antes de la administración.' : 'Administration requires supervision and prescription from a licensed healthcare practitioner.',
      isEs ? 'Se aconseja monitorización previa y posterior de biomarcadores hepáticos, renales y hormonales.' : 'Baseline and follow-up clinical biomarker surveillance (CMP, CBC, endocrine panel) recommended.'
    ];

    safetyNotes.forEach(note => {
      checkPageBreak(20);
      page.drawText(`•  ${note}`, {
        x: MARGIN + 8,
        y: y - 8,
        size: 8,
        font: helvetica,
        color: COLOR_MUTED
      });
      y -= 16;
    });

    // ── FOOTER ON ALL PAGES ──
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      p.drawLine({
        start: { x: MARGIN, y: MARGIN + 15 },
        end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 15 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92)
      });
      p.drawText(`RegenPept Clinical Intelligence • ${slug || 'Blueprint'} • Page ${i + 1} of ${totalPages}`, {
        x: MARGIN,
        y: MARGIN,
        size: 7.5,
        font: helvetica,
        color: COLOR_MUTED
      });
      p.drawText('STRICTLY FOR PROFESSIONAL CLINICAL PRACTICE', {
        x: PAGE_WIDTH - MARGIN - 195,
        y: MARGIN,
        size: 7,
        font: helveticaBold,
        color: COLOR_ACCENT
      });
    }

    const pdfBytes = await pdfDoc.save();
    const cleanFilename = `Protocol-Blueprint-${slug || 'protocol'}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[/api/protocol/pdf] Generation error:', error);
    return NextResponse.json({ error: error.message || 'PDF generation failed' }, { status: 500 });
  }
}
