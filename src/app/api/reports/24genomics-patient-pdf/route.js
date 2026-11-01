import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  THREE_CAPSULE_PROTOCOL,
  CONCRETE_DIET_GUIDELINES,
  TREATMENT_CYCLE
} from '@/data/genomics/clinicalNutrigenomicEngine';

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
    const amberBg = rgb(254 / 255, 243 / 255, 199 / 255);        // #fef3c7
    const blueDark = rgb(2 / 255, 132 / 255, 199 / 255);         // #0284c7
    const blueBg = rgb(224 / 255, 242 / 255, 254 / 255);         // #e0f2fe
    const emeraldDark = rgb(22 / 255, 163 / 255, 74 / 255);      // #16a34a
    const emeraldBg = rgb(240 / 255, 253 / 255, 244 / 255);     // #f0fdf4
    const white = rgb(1, 1, 1);

    // =========================================================================
    // PAGE 1: PATIENT DNA GUIDE (PLAIN ENGLISH, 4 PILLARS & CONCRETE DIET)
    // =========================================================================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 standard
    const { width: p1Width, height: p1Height } = page1.getSize();

    // Top Brand Accent Strip
    page1.drawRectangle({
      x: 0,
      y: p1Height - 8,
      width: p1Width,
      height: 8,
      color: tealAccent
    });

    // Header Area
    let y = p1Height - 40;
    page1.drawText('ATLAS HEALTH SERVICES · CLINICAL GENOMICS', {
      x: 36,
      y,
      size: 13,
      font: helveticaBold,
      color: navyPrimary
    });

    const docTypeLabel = 'PATIENT GENOMIC PROTOCOL (EN)';
    page1.drawText(docTypeLabel, {
      x: p1Width - 36 - helveticaBold.widthOfTextAtSize(docTypeLabel, 9.5),
      y,
      size: 9.5,
      font: helveticaBold,
      color: tealAccent
    });

    y -= 14;
    page1.drawText('Personalized Dietary & Compounded Protocol Based on Your 24Genetics Clinical Panel', {
      x: 36,
      y,
      size: 8.5,
      font: helvetica,
      color: mutedSlate
    });

    y -= 10;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: p1Width - 36, y },
      thickness: 1,
      color: cardBorder
    });

    // Patient Dossier Mini-Banner
    y -= 48;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 42,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page1.drawText('PATIENT NAME:', { x: 48, y: y + 25, size: 7, font: helveticaBold, color: mutedSlate });
    page1.drawText(patientName, { x: 48, y: y + 12, size: 9.5, font: helveticaBold, color: darkSlate });

    page1.drawText('SPECIMEN ID:', { x: 200, y: y + 25, size: 7, font: helveticaBold, color: mutedSlate });
    page1.drawText(sampleId, { x: 200, y: y + 12, size: 9, font: helvetica, color: darkSlate });

    page1.drawText('TREATMENT DURATION:', { x: 315, y: y + 25, size: 7, font: helveticaBold, color: mutedSlate });
    page1.drawText('60-Day Initial Protocol', { x: 315, y: y + 12, size: 9, font: helveticaBold, color: tealAccent });

    page1.drawText('SUPERVISING CLINIC:', { x: 435, y: y + 25, size: 7, font: helveticaBold, color: mutedSlate });
    page1.drawText(clinicName.split('·')[0].trim(), { x: 435, y: y + 12, size: 8, font: helvetica, color: navyPrimary });

    // Section 1 Header: The 4 Functional Pillars
    y -= 26;
    page1.drawText('The 4 DNA Pillars: What Your Genetics Mean in Plain Language', {
      x: 36,
      y,
      size: 10.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 14;
    const introText = 'Evaluated by the Atlas Health multidisciplinary team of medical geneticists and compounding pharmacists. Your genetic variations do not mean illness; they reveal how your body handles sugar, vitamins, and digestion. To avoid biological conflicts, your therapy is separated into 3 dedicated daily capsules.';
    page1.drawText(introText, {
      x: 36,
      y,
      size: 7.6,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 72,
      lineHeight: 10.8
    });

    // 4 Pillar Cards
    y -= 28;
    const pillarCardDefs = [
      {
        pillarTag: 'PILLAR 1: GLYCEMIC METABOLISM & INSULIN (TCF7L2 / FTO)',
        title: 'Carbohydrate Sensitivity & Abdominal Fat Storage',
        status: 'GLUCOSE SPIKES',
        statusColor: alertRed,
        statusBg: badgeRedBg,
        why: 'Refined carbs cause quick insulin surges, causing mid-day energy crashes, sweet cravings, and abdominal fat accumulation.',
        action: 'Prescribed: Standardized Berberine (250 mg) + Chromium (200 mcg). Posology: Split in Capsule B (breakfast) and Capsule C (dinner).'
      },
      {
        pillarTag: 'PILLAR 2: CELLULAR METHYLATION & ENERGY (MTHFR C677T)',
        title: 'Active Folate & Homocysteine Recycling',
        status: 'MTHFR PRIORITY',
        statusColor: alertRed,
        statusBg: badgeRedBg,
        why: 'Your liver is 70% slower at activating synthetic supermarket folic acid, which impairs cellular detox and neurotransmitters.',
        action: 'Prescribed: L-Methylfolate 1,000 mcg ([6S]-5-MTHF) + Methylcobalamin B12 1,000 mcg. Split between Capsule B and Capsule C.'
      },
      {
        pillarTag: 'PILLAR 3: GUT MICROBIOME & MUCOSAL BARRIER (MCM6 / FUT2)',
        title: 'Lactose Intolerance & Gut Bacterial Diversity',
        status: 'LACTOSE-FREE SHIELD',
        statusColor: blueDark,
        statusBg: blueBg,
        why: 'Adult lactase deficiency causes dairy fermentation, intestinal permeability, and low-grade systemic inflammation.',
        action: 'Prescribed: Multi-Strain Probiotics 15B CFU + L-Glutamine 500 mg + Lactase. Posology: Capsule A in fasting with water (DRcaps®).'
      },
      {
        pillarTag: 'PILLAR 4: CELLULAR IMMUNITY & BONE HEALTH (VDR FokI)',
        title: 'Vitamin D Receptor Resistance',
        status: 'VDR RESISTANCE',
        statusColor: amberDark,
        statusBg: amberBg,
        why: 'Receptor gene variation requires higher circulating levels (60-80 ng/mL) to activate cellular defenses and maintain bone density.',
        action: 'Prescribed: Vitamin D3 5,000 IU + Vitamin K2 (MK-7) 100 mcg in Capsule B (with fat-containing breakfast) + Magnesium in Capsule C.'
      }
    ];

    pillarCardDefs.forEach((p) => {
      const cardHeight = 62;
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
        width: 3.5,
        height: cardHeight,
        color: p.statusColor
      });

      // Top Pillar Label
      page1.drawText(p.pillarTag, {
        x: 46,
        y: y - 12,
        size: 6.8,
        font: helveticaBold,
        color: tealAccent
      });

      // Title
      page1.drawText(p.title, {
        x: 46,
        y: y - 22,
        size: 8.5,
        font: helveticaBold,
        color: darkSlate
      });

      // Status Pill
      const pillWidth = helveticaBold.widthOfTextAtSize(p.status, 6.5) + 10;
      page1.drawRectangle({
        x: p1Width - 46 - pillWidth,
        y: y - 20,
        width: pillWidth,
        height: 12,
        color: p.statusBg
      });
      page1.drawText(p.status, {
        x: p1Width - 46 - pillWidth + 5,
        y: y - 16,
        size: 6.5,
        font: helveticaBold,
        color: p.statusColor
      });

      // Why Text
      page1.drawText(`DNA Finding: ${p.why}`, {
        x: 46,
        y: y - 34,
        size: 7.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 96,
        lineHeight: 9.5
      });

      // Action Step
      page1.drawText(`Clinical Action: ${p.action}`, {
        x: 46,
        y: y - 52,
        size: 7.2,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: p1Width - 96,
        lineHeight: 9.5
      });

      y -= cardHeight + 6;
    });

    // Concrete Lifestyle & Diet Guidelines Box
    y -= 4;
    page1.drawRectangle({
      x: 36,
      y: y - 96,
      width: p1Width - 72,
      height: 96,
      color: rgb(240 / 255, 253 / 255, 250 / 255), // light teal
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page1.drawText('CONCRETE PATIENT DIETARY RULES (HIGH-ADHERENCE GUIDELINES)', {
      x: 46,
      y: y - 15,
      size: 7.8,
      font: helveticaBold,
      color: tealAccent
    });

    const dietRules = [
      '1. Plate Sequencing: Always eat vegetables and soluble fiber first, lean proteins/healthy fats second, and complex carbs last. Blunts glucose spikes by up to 45%.',
      '2. Carbohydrate Limit: Cap net carbohydrates at <40g per meal. Strictly avoid sugary soft drinks, commercial fruit juices, and white flour pastries.',
      '3. Microbiota Foods: Consume dairy-free fermented foods (coconut kefir, raw sauerkraut) and cold-resistant starch (cooked and cooled potatoes/rice) to produce gut butyrate.',
      '4. Circadian Caffeine Window: Due to your gradual CYP1A2 caffeine clearance, stop all coffee and stimulants before 2:00 PM to protect nighttime sleep architecture.'
    ];

    let rY = y - 28;
    dietRules.forEach(r => {
      page1.drawText(r, {
        x: 46,
        y: rY,
        size: 7,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 92,
        lineHeight: 9.5
      });
      rY -= 16;
    });

    // Page 1 Footer
    page1.drawText('Page 1 of 2 · Confidential Patient Genomic Guide · Turn to Page 2 for Licensed Compounding Pharmacy Prescription Order', {
      x: 36,
      y: 18,
      size: 7,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // PAGE 2: PHARMACY COMPOUNDING PRESCRIPTION (3 CAPSULES, COMPATIBILITY RATIONALE)
    // =========================================================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Brand Accent Strip
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: navyPrimary
    });

    let y2 = p2Height - 40;
    page2.drawText('ATLAS HEALTH SERVICES · MASTER COMPOUNDING PRESCRIPTION', {
      x: 36,
      y: y2,
      size: 13,
      font: helveticaBold,
      color: navyPrimary
    });

    const rxBadgeText = 'OFFICIAL RX: RX-DNA-COMP-8821';
    page2.drawText(rxBadgeText, {
      x: p2Width - 36 - helveticaBold.widthOfTextAtSize(rxBadgeText, 9.5),
      y: y2,
      size: 9.5,
      font: helveticaBold,
      color: alertRed
    });

    y2 -= 14;
    page2.drawText('3-Capsule Individualized Protocol · Galenically Optimized for Pharmacokinetic Compatibility', {
      x: 36,
      y: y2,
      size: 8.5,
      font: helvetica,
      color: mutedSlate
    });

    y2 -= 10;
    page2.drawLine({
      start: { x: 36, y: y2 },
      end: { x: p2Width - 36, y: y2 },
      thickness: 1,
      color: cardBorder
    });

    // Compatibility Notice Box
    y2 -= 46;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 40,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page2.drawText('GALENIC COMPATIBILITY & DISPENSING RATIONALE:', { x: 46, y: y2 + 26, size: 7.2, font: helveticaBold, color: navyPrimary });
    const compatText = 'Active ingredients are compartmentalized into 3 distinct daily capsules to prevent botanical antimicrobial degradation of live probiotics by berberine, satisfy lipophilic vs fasting absorption kinetics, and ensure maximum patient compliance with swallowable capsule sizes.';
    page2.drawText(compatText, {
      x: 46,
      y: y2 + 14,
      size: 6.8,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 92,
      lineHeight: 9
    });

    // 3 Capsule Formulation Cards
    y2 -= 14;

    THREE_CAPSULE_PROTOCOL.forEach((cap, idx) => {
      const isDRcaps = cap.capsuleId === 'capsule_a';
      const headerBg = isDRcaps ? tealAccent : (idx === 1 ? navyPrimary : rgb(30 / 255, 58 / 255, 138 / 255));
      const cardHeight = 120;

      y2 -= cardHeight;
      page2.drawRectangle({
        x: 36,
        y: y2,
        width: p2Width - 72,
        height: cardHeight,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1
      });

      // Capsule Header Strip
      page2.drawRectangle({
        x: 36,
        y: y2 + cardHeight - 20,
        width: p2Width - 72,
        height: 20,
        color: headerBg
      });

      page2.drawText(cap.nameEn.toUpperCase(), {
        x: 44,
        y: y2 + cardHeight - 14,
        size: 7.8,
        font: helveticaBold,
        color: white
      });

      const countPill = '60 Caps (60-Day Supply)';
      page2.drawText(countPill, {
        x: p2Width - 44 - helveticaBold.widthOfTextAtSize(countPill, 7),
        y: y2 + cardHeight - 14,
        size: 7,
        font: helveticaBold,
        color: white
      });

      // Timing and Vehicle Subheader
      let subY = y2 + cardHeight - 32;
      page2.drawText(`Timing & Administration: ${cap.timingEn}`, {
        x: 44,
        y: subY,
        size: 7,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: p2Width - 92
      });

      subY -= 11;
      page2.drawText(`Vehicle & Excipient Standard: ${cap.galenicVehicleEn}`, {
        x: 44,
        y: subY,
        size: 6.8,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: p2Width - 92
      });

      // Ingredient Mini-Table
      subY -= 14;
      page2.drawRectangle({
        x: 42,
        y: subY - 4,
        width: p2Width - 84,
        height: 12,
        color: lightBg
      });

      page2.drawText('INGREDIENT (GENERIC)', { x: 46, y: subY, size: 6.2, font: helveticaBold, color: mutedSlate });
      page2.drawText('SPECIFICATION / CHEMICAL FORM', { x: 190, y: subY, size: 6.2, font: helveticaBold, color: mutedSlate });
      page2.drawText('DOSE', { x: 380, y: subY, size: 6.2, font: helveticaBold, color: mutedSlate });
      page2.drawText('CLINICAL PURPOSE', { x: 430, y: subY, size: 6.2, font: helveticaBold, color: mutedSlate });

      subY -= 12;
      cap.ingredients.forEach((ing) => {
        page2.drawText(ing.apiEn, { x: 46, y: subY, size: 6.8, font: helveticaBold, color: darkSlate });
        page2.drawText(ing.chemicalSpec, { x: 190, y: subY, size: 6.2, font: helvetica, color: mutedSlate, maxWidth: 180 });
        page2.drawText(ing.dose, { x: 380, y: subY, size: 6.8, font: helveticaBold, color: tealAccent });
        page2.drawText(ing.purposeEn, { x: 430, y: subY, size: 6.2, font: helvetica, color: darkSlate, maxWidth: 120 });
        subY -= 11;
      });

      y2 -= 8;
    });

    // Prescribing Physician & Pharmacist Validation Block
    y2 -= 52;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 52,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page2.drawText('CLINICAL & PHARMACEUTICAL AUTHORIZATION:', { x: 46, y: y2 + 38, size: 7.2, font: helveticaBold, color: mutedSlate });

    page2.drawText('Prescribing Medical Team:', { x: 46, y: y2 + 25, size: 6.8, font: helvetica, color: mutedSlate });
    page2.drawText('Atlas Health Clinical Genetics & Compounding Pharmacy Council', { x: 46, y: y2 + 14, size: 7.5, font: helveticaBold, color: darkSlate });
    page2.drawText('Accredited Partner: Ryhanh Medical Wellness (Doha, Qatar)', { x: 46, y: y2 + 4, size: 6.8, font: helvetica, color: tealAccent });

    page2.drawText('Licensed Compounding Pharmacist Signature & Seal:', { x: 330, y: y2 + 25, size: 6.8, font: helvetica, color: mutedSlate });
    page2.drawLine({
      start: { x: 330, y: y2 + 12 },
      end: { x: p2Width - 46, y: y2 + 12 },
      thickness: 0.8,
      color: rgb(160 / 255, 160 / 255, 160 / 255)
    });
    page2.drawText('Authorized Pharmacist Verification · Date & Batch Lot Number', { x: 330, y: y2 + 3, size: 6.2, font: helveticaOblique, color: mutedSlate });

    // Page 2 Footer
    page2.drawText('Page 2 of 2 · Official Pharmacy Compounding Order · Valid across licensed compounding pharmacies worldwide', {
      x: 36,
      y: 18,
      size: 7,
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
