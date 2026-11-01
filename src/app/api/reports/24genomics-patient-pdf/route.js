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
        gene: 'MTHFR Gene (Methylation & Energy)',
        status: 'Requires Active Folate',
        statusColor: alertRed,
        bgColor: badgeRedBg,
        patientWhy: 'Your liver has a natural variation that makes it 70% slower at activating regular synthetic folic acid found in cheap multivitamins.',
        simpleFix: 'Prescription: L-Methylfolate 1,000 mcg + Methylcobalamin 1,000 mcg. Posology: 500 mcg BID with meals for 60 days.'
      },
      {
        gene: 'VDR Gene (Vitamin D Receptors)',
        status: 'Reduced Sensitivity',
        statusColor: amberDark,
        bgColor: rgb(254 / 255, 243 / 255, 199 / 255),
        patientWhy: 'Your cell receptors absorb vitamin D more slowly than average, requiring higher circulating levels to protect bones and cellular immunity.',
        simpleFix: 'Prescription: Vitamin D3 5,000 IU + Vitamin K2 100 mcg + Magnesium 200 mg. Posology: 1 dose each morning with breakfast for 60 days.'
      },
      {
        gene: 'TCF7L2 Gene (Blood Sugar & Carbs)',
        status: 'Sensitive to Simple Sugars',
        statusColor: amberDark,
        bgColor: rgb(254 / 255, 243 / 255, 199 / 255),
        patientWhy: 'Rapid-digesting carbs and sweets trigger an exaggerated insulin surge, causing fatigue, sugar cravings, and abdominal fat storage.',
        simpleFix: 'Prescription: Standardized Berberine 250 mg + Chromium 200 mcg. Posology: 125 mg BID 15 min prior to meals for 60 days.'
      },
      {
        gene: 'LCT / MCM6 Gene (Dairy & Digestion)',
        status: 'Lactose Sensitivity',
        statusColor: alertRed,
        bgColor: badgeRedBg,
        patientWhy: 'Your intestines produce negligible lactase enzyme; conventional milk or lactose capsule fillers cause gut dysbiosis and micro-inflammation.',
        simpleFix: 'Protocol: Strict dairy lactose exclusion. Compounding Rule: 100% lactose-free vehicle in acid-resistant vegetable DRcaps®.'
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

      // Card Header
      page1.drawText(card.gene, {
        x: 48,
        y: y - 16,
        size: 9.5,
        font: helveticaBold,
        color: darkSlate
      });

      // Status pill on the right
      const pillWidth = helveticaBold.widthOfTextAtSize(card.status, 7.5) + 12;
      page1.drawRectangle({
        x: p1Width - 48 - pillWidth,
        y: y - 20,
        width: pillWidth,
        height: 14,
        color: card.bgColor
      });
      page1.drawText(card.status, {
        x: p1Width - 48 - pillWidth + 6,
        y: y - 16,
        size: 7.5,
        font: helveticaBold,
        color: card.statusColor
      });

      // Patient Explanation
      page1.drawText(`What this means: ${card.patientWhy}`, {
        x: 48,
        y: y - 32,
        size: 8,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 100,
        lineHeight: 11
      });

      // Simple Action Step
      page1.drawText(`Action step: ${card.simpleFix}`, {
        x: 48,
        y: y - 58,
        size: 8,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: p1Width - 100,
        lineHeight: 11
      });

      y -= cardHeight + 10;
    });

    // Practical Daily Rules Box
    y -= 10;
    page1.drawRectangle({
      x: 36,
      y: y - 82,
      width: p1Width - 72,
      height: 82,
      color: rgb(240 / 255, 253 / 255, 250 / 255), // light teal
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page1.drawText('3 SIMPLE LIFESTYLE RULES TO REMEMBER', {
      x: 50,
      y: y - 18,
      size: 8.5,
      font: helveticaBold,
      color: tealAccent
    });

    const tips = [
      '1. Plate Balance: Eat your proteins and vegetables before carbohydrates to flatten blood sugar curves.',
      '2. Caffeine Window: Since your caffeine metabolism is standard/gradual, enjoy coffee only before 2:00 PM.',
      '3. Whole Nutrition: Prioritize olive oil, leafy greens, wild fish, and nuts which naturally support cell methylation.'
    ];

    let tipY = y - 34;
    tips.forEach(t => {
      page1.drawText(t, { x: 50, y: tipY, size: 8, font: helvetica, color: darkSlate });
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
        api: 'L-Methylfolate',
        spec: '[6S]-5-Methyltetrahydrofolate Calcium Salt',
        dose: '1,000 mcg',
        target: 'MTHFR Methylation'
      },
      {
        api: 'Methylcobalamin (B12)',
        spec: 'Active Coenzyme B12 (USP grade)',
        dose: '1,000 mcg',
        target: 'Homocysteine Clearance'
      },
      {
        api: 'Vitamin D3',
        spec: 'Cholecalciferol Powder (USP grade)',
        dose: '5,000 IU',
        target: 'VDR Receptor Sensitivity'
      },
      {
        api: 'Vitamin K2',
        spec: 'Menaquinone-7 (all-trans MK-7)',
        dose: '100 mcg',
        target: 'Vascular Safety & Calcium Routing'
      },
      {
        api: 'Magnesium Bisglycinate',
        spec: 'Chelated Magnesium Glycinate Powder',
        dose: '200 mg',
        target: 'Enzymatic VDR Cofactor'
      },
      {
        api: 'Berberine Extract',
        spec: 'Phospholipid / Phytosome Standardized (97%)',
        dose: '250 mg',
        target: 'TCF7L2 Glycemic Response'
      },
      {
        api: 'Chromium Picolinate',
        spec: 'Pharmaceutical Grade Chromium (USP)',
        dose: '200 mcg',
        target: 'Insulin Receptor Affinity'
      },
      {
        api: '5-Hydroxytryptophan (5-HTP)',
        spec: 'Natural Botanical Extract (Griffonia)',
        dose: '100 mg',
        target: 'Satiety & Evening Cravings'
      }
    ];

    y2 -= 18;
    formulaRows.forEach((row, idx) => {
      const rowHeight = 22;
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

      page2.drawText(row.api, { x: 44, y: y2 - 14, size: 8, font: helveticaBold, color: darkSlate });
      page2.drawText(row.spec, { x: 215, y: y2 - 14, size: 7.5, font: helvetica, color: mutedSlate });
      page2.drawText(row.dose, { x: 380, y: y2 - 14, size: 8, font: helveticaBold, color: tealAccent });
      page2.drawText(row.target, { x: 450, y: y2 - 14, size: 7.5, font: helvetica, color: darkSlate });

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

