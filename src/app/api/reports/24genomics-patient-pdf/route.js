import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientName = searchParams.get('patient') || 'Hossam Ahmed';
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const clinicName = searchParams.get('clinic') || 'Ryhanh Medical Wellness · Doha, Qatar';

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Color palette
    const navyPrimary = rgb(0 / 255, 54 / 255, 102 / 255);       // #003666
    const tealAccent = rgb(13 / 255, 148 / 255, 136 / 255);      // #0d9488
    const darkSlate = rgb(15 / 255, 23 / 255, 42 / 255);         // #0f172a
    const mutedSlate = rgb(100 / 255, 116 / 255, 139 / 255);    // #64748b
    const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);        // #f8fafc
    const cardBorder = rgb(226 / 255, 232 / 255, 240 / 255);    // #e2e8f0
    const alertRed = rgb(185 / 255, 28 / 255, 28 / 255);         // #b91c1c
    const badgeRedBg = rgb(254 / 255, 242 / 255, 242 / 255);     // #fef2f2
    const amberDark = rgb(180 / 255, 83 / 255, 9 / 255);         // #b45309
    const emeraldDark = rgb(22 / 255, 163 / 255, 74 / 255);      // #16a34a
    const emeraldBg = rgb(240 / 255, 253 / 255, 244 / 255);     // #f0fdf4
    const white = rgb(1, 1, 1);

    // ==========================================
    // PAGE 1: PATIENT-FRIENDLY DNA INSIGHTS
    // ==========================================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width: p1Width, height: p1Height } = page1.getSize();

    // Top Brand Bar
    page1.drawRectangle({
      x: 0,
      y: p1Height - 8,
      width: p1Width,
      height: 8,
      color: tealAccent
    });

    // Header Area
    let y = p1Height - 42;
    page1.drawText('ATLAS HEALTH SERVICES', {
      x: 36,
      y,
      size: 13,
      font: helveticaBold,
      color: navyPrimary
    });

    page1.drawText('PATIENT DNA NUTRITION GUIDE', {
      x: p1Width - 36 - helveticaBold.widthOfTextAtSize('PATIENT DNA NUTRITION GUIDE', 10),
      y,
      size: 10,
      font: helveticaBold,
      color: tealAccent
    });

    y -= 14;
    page1.drawText('Personalized Dietary & Supplement Recommendations Based on Your DNA', {
      x: 36,
      y,
      size: 9,
      font: helvetica,
      color: mutedSlate
    });

    y -= 12;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: p1Width - 36, y },
      thickness: 1,
      color: cardBorder
    });

    // Patient Dossier Box
    y -= 54;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 46,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    // Box contents
    page1.drawText('PATIENT NAME:', { x: 50, y: y + 28, size: 7.5, font: helveticaBold, color: mutedSlate });
    page1.drawText(patientName, { x: 50, y: y + 14, size: 10, font: helveticaBold, color: darkSlate });

    page1.drawText('SPECIMEN ID:', { x: 210, y: y + 28, size: 7.5, font: helveticaBold, color: mutedSlate });
    page1.drawText(sampleId, { x: 210, y: y + 14, size: 9.5, font: helvetica, color: darkSlate });

    page1.drawText('CLINICAL PARTNER:', { x: 340, y: y + 28, size: 7.5, font: helveticaBold, color: mutedSlate });
    page1.drawText(clinicName, { x: 340, y: y + 14, size: 8.5, font: helvetica, color: navyPrimary });

    // Section 1: Welcome message
    y -= 30;
    page1.drawText('Clinical Evaluation by Atlas Medical Geneticists & Pharmacists', {
      x: 36,
      y,
      size: 11,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 16;
    const introText = 'This clinical guidance has been synthesized by the Atlas Health multidisciplinary team of medical geneticists and compounding pharmacists. Your DNA profile has been translated into an individualized 60-day therapeutic protocol with exact posology, restoring biochemical balance without generic trial-and-error.';
    page1.drawText(introText, {
      x: 36,
      y,
      size: 8,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 72,
      lineHeight: 11.5
    });

    // 4 Visual Cards: What Your DNA Says & What To Do
    y -= 36;

    const cards = [
      {
        pillar: 'PILAR 1: METABOLISMO & GLUCEMIA (TCF7L2 / FTO)',
        gene: 'Metabolismo de Azúcares y Grasa Abdominal',
        status: 'Sensibilidad a Glucosa',
        statusColor: alertRed,
        bgColor: badgeRedBg,
        patientWhy: 'Los carbohidratos refinados causan picos bruscos de azúcar, fatiga a media tarde y acumulación de grasa visceral.',
        simpleFix: 'Prescripción: Berberina 250 mg + Cromo 200 mcg. Posología: 125 mg BID 15 min antes de comidas durante 60 días.'
      },
      {
        pillar: 'PILAR 2: METILACIÓN CELULAR & ENERGÍA (MTHFR)',
        gene: 'Reciclaje de Homocisteína & Folato Activo',
        status: 'Requiere Folato Activo',
        statusColor: alertRed,
        bgColor: badgeRedBg,
        patientWhy: 'Déficit del 70% en activar ácido fólico sintético. Afecta neurotransmisores, energía celular y salud vascular.',
        simpleFix: 'Prescripción: L-Metilfolato 1.000 mcg + Metilcobalamina 1.000 mcg. Posología: 500 mcg BID con comidas durante 60 días.'
      },
      {
        pillar: 'PILAR 3: MICROBIOTA & BARRERA INTESTINAL (MCM6 / FUT2)',
        gene: 'Eje Intestinal, Microbioma & Tolerancia Láctea',
        status: 'Microbiota & Sin Lactosa',
        statusColor: tealAccent,
        bgColor: rgb(240 / 255, 253 / 255, 250 / 255),
        patientWhy: 'Intolerancia primaria a la lactosa y mayor permeabilidad mucosa; los lácteos fermentan produciendo disbiosis e inflamación.',
        simpleFix: 'Prescripción: Probióticos 15B CFU + L-Glutamina 1g + Enzima Lactasa 9.000 ALU. Posología: 1 cap DRcaps® en ayunas por 60 días.'
      },
      {
        pillar: 'PILAR 4: INMUNIDAD & HUESO (VDR / VITAMINA D)',
        gene: 'Sensibilidad de Receptores Nucleares Celulares',
        status: 'Resistencia a Receptor',
        statusColor: amberDark,
        bgColor: rgb(254 / 255, 243 / 255, 199 / 255),
        patientWhy: 'Afinidad celular reducida; requiere niveles sanguíneos más altos (60-80 ng/mL) para mantener fuerza y defensas.',
        simpleFix: 'Prescripción: Vitamina D3 5.000 UI + Vitamina K2 100 mcg + Magnesio 200 mg. Posología: 1 dosis matutina por 60 días.'
      }
    ];

    cards.forEach((card) => {
      const cardHeight = 76;
      page1.drawRectangle({
        x: 36,
        y: y - cardHeight,
        width: p1Width - 72,
        height: cardHeight,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1
      });

      // Left Accent Strip
      page1.drawRectangle({
        x: 36,
        y: y - cardHeight,
        width: 4,
        height: cardHeight,
        color: card.statusColor
      });

      // Pillar Tag
      page1.drawText(card.pillar, {
        x: 48,
        y: y - 13,
        size: 7,
        font: helveticaBold,
        color: tealAccent
      });

      // Card Header
      page1.drawText(card.gene, {
        x: 48,
        y: y - 24,
        size: 9,
        font: helveticaBold,
        color: darkSlate
      });

      // Status pill on the right
      const pillWidth = helveticaBold.widthOfTextAtSize(card.status, 7) + 12;
      page1.drawRectangle({
        x: p1Width - 48 - pillWidth,
        y: y - 22,
        width: pillWidth,
        height: 13,
        color: card.bgColor
      });
      page1.drawText(card.status, {
        x: p1Width - 48 - pillWidth + 6,
        y: y - 18,
        size: 7,
        font: helveticaBold,
        color: card.statusColor
      });

      // Patient Explanation
      page1.drawText(`Hallazgo ADN: ${card.patientWhy}`, {
        x: 48,
        y: y - 37,
        size: 7.6,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 100,
        lineHeight: 10.5
      });

      // Simple Action Step
      page1.drawText(`Acción Terapéutica: ${card.simpleFix}`, {
        x: 48,
        y: y - 59,
        size: 7.6,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: p1Width - 100,
        lineHeight: 10.5
      });

      y -= cardHeight + 8;
    });

    // Practical Daily Rules Box (Dieta Concreta)
    y -= 4;
    page1.drawRectangle({
      x: 36,
      y: y - 94,
      width: p1Width - 72,
      height: 94,
      color: rgb(240 / 255, 253 / 255, 250 / 255), // light teal
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page1.drawText('PAUTAS DIETÉTICAS CONCRETAS PARA EL PACIENTE (DIETA DE ALTA ADHERENCIA)', {
      x: 48,
      y: y - 16,
      size: 8,
      font: helveticaBold,
      color: tealAccent
    });

    const tips = [
      '1. Regla de Secuencia en el Plato: Come primero la verdura/fibra, luego la proteína/grasas y al final los hidratos de carbono. Aplana la glucosa hasta un 45%.',
      '2. Límite de Carbohidratos Netos: Maximo 40g de hidratos netos por comida. Cero bebidas azucaradas o zumos comerciales.',
      '3. Protección de Microbiota: Incluye aceite de oliva virgen extra y alimentos fermentados sin lactosa (kéfir de coco, chucrut). Cero leche convencional.',
      '4. Ventana de Cafeína: Por metabolismo hepático gradual (CYP1A2), tomar café solo antes de las 14:00 hrs para evitar picos nocturnos de cortisol.'
    ];

    let tipY = y - 30;
    tips.forEach(t => {
      page1.drawText(t, { x: 48, y: tipY, size: 7.2, font: helvetica, color: darkSlate });
      tipY -= 14;
    });

    // Page 1 Footer
    page1.drawText('Page 1 of 2 · Confidential Medical Genomic Report · Turn to Page 2 for Pharmacy Prescription Order', {
      x: 36,
      y: 20,
      size: 7.5,
      font: helvetica,
      color: mutedSlate
    });

    // ==========================================
    // PAGE 2: PHARMACY COMPOUNDING PRESCRIPTION
    // ==========================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Brand Bar
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: navyPrimary
    });

    let y2 = p2Height - 42;
    page2.drawText('ATLAS HEALTH SERVICES · CLINICAL COMPOSITION', {
      x: 36,
      y: y2,
      size: 13,
      font: helveticaBold,
      color: navyPrimary
    });

    page2.drawText('PHARMACY DIRECT ORDER', {
      x: p2Width - 36 - helveticaBold.widthOfTextAtSize('PHARMACY DIRECT ORDER', 10),
      y: y2,
      size: 10,
      font: helveticaBold,
      color: alertRed
    });

    y2 -= 14;
    page2.drawText('Personalized Master Formulation · Prepared Exclusively For Licensed Compounding Pharmacies', {
      x: 36,
      y: y2,
      size: 9,
      font: helvetica,
      color: mutedSlate
    });

    y2 -= 12;
    page2.drawLine({
      start: { x: 36, y: y2 },
      end: { x: p2Width - 36, y: y2 },
      thickness: 1,
      color: cardBorder
    });

    // Prescription Summary Box
    y2 -= 60;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 52,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page2.drawText('PATIENT IDENTIFIER:', { x: 50, y: y2 + 34, size: 7.5, font: helveticaBold, color: mutedSlate });
    page2.drawText(patientName, { x: 50, y: y2 + 20, size: 9.5, font: helveticaBold, color: darkSlate });
    page2.drawText(`Ref DNA: ${sampleId}`, { x: 50, y: y2 + 8, size: 7.5, font: helvetica, color: mutedSlate });

    page2.drawText('PRESCRIPTION RX CODE:', { x: 210, y: y2 + 34, size: 7.5, font: helveticaBold, color: mutedSlate });
    page2.drawText('RX-DNA-COMP-8821', { x: 210, y: y2 + 20, size: 9.5, font: helveticaBold, color: navyPrimary });
    page2.drawText('Oral Vegetable DRcaps®', { x: 210, y: y2 + 8, size: 7.5, font: helvetica, color: mutedSlate });

    page2.drawText('TREATMENT DURATION:', { x: 350, y: y2 + 34, size: 7.5, font: helveticaBold, color: mutedSlate });
    page2.drawText('60-Day Supply (120 Caps)', { x: 350, y: y2 + 20, size: 9.5, font: helveticaBold, color: darkSlate });
    page2.drawText('Dosage: 1 cap bid (morning/night)', { x: 350, y: y2 + 8, size: 7.5, font: helvetica, color: tealAccent });

    // Pharmacy Notice Pill
    y2 -= 32;
    page2.drawRectangle({
      x: 36,
      y: y2 - 20,
      width: p2Width - 72,
      height: 24,
      color: emeraldBg,
      borderColor: rgb(187 / 255, 247 / 255, 208 / 255),
      borderWidth: 1
    });

    page2.drawText('PHARMACY INSTRUCTION: Dispense custom compounded capsules using USP/Ph. Eur. grade active ingredients.', {
      x: 48,
      y: y2 - 13,
      size: 7.8,
      font: helveticaBold,
      color: emeraldDark
    });

    // Formulation Table Header
    y2 -= 38;
    page2.drawRectangle({
      x: 36,
      y: y2 - 18,
      width: p2Width - 72,
      height: 22,
      color: navyPrimary
    });

    page2.drawText('ACTIVE PHARMACEUTICAL INGREDIENT (GENERIC)', { x: 44, y: y2 - 12, size: 7.5, font: helveticaBold, color: white });
    page2.drawText('CHEMICAL FORM / SPECIFICATION', { x: 215, y: y2 - 12, size: 7.5, font: helveticaBold, color: white });
    page2.drawText('DOSE / DAY', { x: 380, y: y2 - 12, size: 7.5, font: helveticaBold, color: white });
    page2.drawText('TARGET PATHWAY', { x: 450, y: y2 - 12, size: 7.5, font: helveticaBold, color: white });

    // Table rows
    const formulaRows = [
      {
        api: 'L-Metilfolato ([6S]-5-MTHF)',
        spec: 'Sal de Calcio Grado Farmacopea USP',
        dose: '1.000 mcg',
        target: 'Pilar 2: Metilación MTHFR (500 mcg BID)'
      },
      {
        api: 'Metilcobalamina (Vitamina B12)',
        spec: 'Coenzima Activa Pura (USP grade)',
        dose: '1.000 mcg',
        target: 'Pilar 2: Aclaramiento Homocisteína'
      },
      {
        api: 'Vitamina D3 (Colecalciferol)',
        spec: 'Polvo Cristalino Farmacéutico (USP)',
        dose: '5.000 UI',
        target: 'Pilar 4: Sensibilidad Receptor VDR'
      },
      {
        api: 'Vitamina K2 (Menaquinona-7)',
        spec: 'MK-7 all-trans de alta biodisponibilidad',
        dose: '100 mcg',
        target: 'Pilar 4: Protección Vascular & Hueso'
      },
      {
        api: 'Bisglicinato de Magnesio',
        spec: 'Magnesio Totalmente Quelado USP',
        dose: '200 mg',
        target: 'Pilar 4: Cofactor Enzimático VDR'
      },
      {
        api: 'Extracto Estandarizado de Berberina',
        spec: 'Complejo Fosfolipídico Estandarizado 97%',
        dose: '250 mg',
        target: 'Pilar 1: Glucemia TCF7L2 (125mg BID)'
      },
      {
        api: 'Picolinato de Cromo',
        spec: 'Grado Farmacéutico USP',
        dose: '200 mcg',
        target: 'Pilar 1: Sensibilización Receptor Insulina'
      },
      {
        api: 'Complejo Probiótico + L-Glutamina',
        spec: '15B CFU (Bifido/Lacto) + L-Glutamina 1g',
        dose: '1 dosis/día',
        target: 'Pilar 3: Microbiota & Barrera Mucosa'
      },
      {
        api: 'Enzima Lactasa Microbiana',
        spec: 'Lactasa Ácido-Estable (9.000 FCC ALU)',
        dose: '9.000 ALU',
        target: 'Pilar 3: Prevención Disbiosis MCM6'
      }
    ];

    y2 -= 18;
    formulaRows.forEach((row, idx) => {
      const rowHeight = 20;
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        page2.drawRectangle({
          x: 36,
          y: y2 - rowHeight,
          width: p2Width - 72,
          height: rowHeight,
          color: rgb(248 / 255, 250 / 255, 252 / 255)
        });
      }

      page2.drawLine({
        start: { x: 36, y: y2 - rowHeight },
        end: { x: p2Width - 36, y: y2 - rowHeight },
        thickness: 0.5,
        color: cardBorder
      });

      page2.drawText(row.api, { x: 44, y: y2 - 13, size: 7.5, font: helveticaBold, color: darkSlate });
      page2.drawText(row.spec, { x: 205, y: y2 - 13, size: 7, font: helvetica, color: mutedSlate });
      page2.drawText(row.dose, { x: 375, y: y2 - 13, size: 7.5, font: helveticaBold, color: tealAccent });
      page2.drawText(row.target, { x: 440, y: y2 - 13, size: 7, font: helvetica, color: darkSlate });

      y2 -= rowHeight;
    });

    // Galenic Vehicle & Compounding Standards
    y2 -= 16;
    page2.drawRectangle({
      x: 36,
      y: y2 - 80,
      width: p2Width - 72,
      height: 80,
      color: white,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page2.drawText('GALENIC VEHICLE & COMPOUNDING SPECIFICATIONS', {
      x: 50,
      y: y2 - 16,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const specs = [
      '• Delivery System: Acid-resistant, delayed-release hypromellose vegetable capsules (DRcaps®).',
      '• Excipient Standard: Microcrystalline cellulose NF / silica. 100% FREE of lactose monohydrate (MCM6 safety).',
      '• Packaging: Sealed amber glass or high-barrier HDPE bottle with desiccant canister (protect from moisture & light).',
      '• Storage: Store in a cool, dry place between 15°C - 25°C. No refrigeration required.'
    ];

    let specY = y2 - 32;
    specs.forEach(s => {
      page2.drawText(s, { x: 50, y: specY, size: 7.8, font: helvetica, color: darkSlate });
      specY -= 13;
    });

    // Prescribing Physician / Pharmacist Validation Area
    y2 -= 102;
    page2.drawRectangle({
      x: 36,
      y: y2 - 68,
      width: p2Width - 72,
      height: 68,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page2.drawText('CLINICAL & PHARMACEUTICAL AUTHORIZATION', {
      x: 50,
      y: y2 - 16,
      size: 8,
      font: helveticaBold,
      color: mutedSlate
    });

    page2.drawText('Prescribing Doctor:', { x: 50, y: y2 - 32, size: 7.5, font: helvetica, color: mutedSlate });
    page2.drawText('Medical Director, Genomic Wellness', { x: 50, y: y2 - 44, size: 8, font: helveticaBold, color: darkSlate });
    page2.drawText('Atlas Health Partner Network', { x: 50, y: y2 - 56, size: 7.5, font: helvetica, color: mutedSlate });

    page2.drawText('Dispensing Pharmacy Signature / Stamp:', { x: 300, y: y2 - 32, size: 7.5, font: helvetica, color: mutedSlate });
    page2.drawLine({
      start: { x: 300, y: y2 - 50 },
      end: { x: p2Width - 50, y: y2 - 50 },
      thickness: 1,
      color: rgb(150 / 255, 150 / 255, 150 / 255)
    });
    page2.drawText('Licensed Compounding Pharmacist & Date', { x: 300, y: y2 - 60, size: 7, font: helveticaOblique, color: mutedSlate });

    // Page 2 Footer
    page2.drawText('Page 2 of 2 · Official Compounding Prescription Document · Valid across accredited compounding pharmacies', {
      x: 36,
      y: 20,
      size: 7.5,
      font: helvetica,
      color: mutedSlate
    });

    const pdfBytes = await pdfDoc.save();

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

