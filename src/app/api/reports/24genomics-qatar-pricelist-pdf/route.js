import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerName = searchParams.get('partner') || 'Dr. Hossam Ahmed / Ryhanh Medical Company';
    const partnerId = searchParams.get('partnerId') || 'QA-RYH-88219';
    const issueDate = searchParams.get('date') || 'November 2026';

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Color palette (Matching Google Cloud Console / Atlas Clinical Theme)
    const navyPrimary = rgb(0 / 255, 54 / 255, 102 / 255);       // #003666
    const tealAccent = rgb(13 / 255, 148 / 255, 136 / 255);      // #0d9488
    const darkSlate = rgb(15 / 255, 23 / 255, 42 / 255);         // #0f172a
    const mutedSlate = rgb(100 / 255, 116 / 255, 139 / 255);    // #64748b
    const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);        // #f8fafc
    const cardBorder = rgb(226 / 255, 232 / 255, 240 / 255);    // #e2e8f0
    const alertRed = rgb(185 / 255, 28 / 255, 28 / 255);         // #b91c1c
    const amberDark = rgb(180 / 255, 83 / 255, 9 / 255);         // #b45309
    const white = rgb(1, 1, 1);

    // =========================================================================
    // PAGE 1: B2B COMMERCIAL WHOLESALE PRICE SCHEDULE (QAR)
    // =========================================================================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width: p1Width, height: p1Height } = page1.getSize();

    // Top Brand Accent Strip
    page1.drawRectangle({
      x: 0,
      y: p1Height - 8,
      width: p1Width,
      height: 8,
      color: navyPrimary
    });

    let y = p1Height - 28;

    // Header Category & Role Badge
    page1.drawText('24GENETICS® CLINICAL LABORATORY (MADRID, SPAIN) · CE-IVD ACCREDITED', {
      x: 36,
      y,
      size: 8.5,
      font: helveticaBold,
      color: tealAccent
    });

    const p1Badge = 'PAGE 1 OF 2 · OFFICIAL B2B SCHEDULE (QAR)';
    const p1BadgeWidth = helveticaBold.widthOfTextAtSize(p1Badge, 6.8) + 14;
    page1.drawRectangle({
      x: p1Width - 36 - p1BadgeWidth,
      y: y - 3,
      width: p1BadgeWidth,
      height: 15,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1
    });
    page1.drawText(p1Badge, {
      x: p1Width - 36 - p1BadgeWidth + 7,
      y: y + 2,
      size: 6.8,
      font: helveticaBold,
      color: tealAccent
    });

    y -= 16;
    page1.drawText('24GENOMICS NUTRITION · WHOLESALE PRICE SCHEDULE', {
      x: 36,
      y,
      size: 13,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 11;
    page1.drawText('State of Qatar Authorized Healthcare Partner Pricing · Denominated in Qatari Riyals (QAR)', {
      x: 36,
      y,
      size: 7.5,
      font: helvetica,
      color: mutedSlate
    });

    y -= 8;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: p1Width - 36, y },
      thickness: 1,
      color: cardBorder
    });

    // Partner & Schedule Dossier Ribbon
    y -= 38;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 34,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page1.drawText('AUTHORIZED PARTNER:', { x: 44, y: y + 21, size: 6.0, font: helveticaBold, color: mutedSlate });
    page1.drawText(partnerName, { x: 44, y: y + 9, size: 7.8, font: helveticaBold, color: darkSlate, maxWidth: 220 });

    page1.drawText('PARTNER ID / TERRITORY:', { x: 260, y: y + 21, size: 6.0, font: helveticaBold, color: mutedSlate });
    page1.drawText(`${partnerId} · State of Qatar`, { x: 260, y: y + 9, size: 7.5, font: helveticaBold, color: tealAccent });

    page1.drawText('CURRENCY STANDARD:', { x: 410, y: y + 21, size: 6.0, font: helveticaBold, color: mutedSlate });
    page1.drawText('QAR (Qatari Riyal) · Parity Pegged', { x: 410, y: y + 9, size: 7.5, font: helveticaBold, color: navyPrimary });

    // Section 1: Executive Volume Tiers Table
    y -= 24;
    page1.drawText('1. AUTHORIZED WHOLESALE VOLUME TIERS (STATE OF QATAR)', {
      x: 36,
      y,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const TIERS_DATA = [
      {
        tier: 'Tier 1 · Single Evaluation / Clinical Pilot',
        kits: '1 Kit',
        unitQar: '1,048.44 QAR',
        totalQar: '1,048.44 QAR',
        status: 'Pilot Baseline (Single Evaluation)',
        badgeColor: mutedSlate
      },
      {
        tier: 'Tier 2 · Wholesale Tier 1 (Unlocked Partner)',
        kits: '50 Kits',
        unitQar: '799.56 QAR',
        totalQar: '39,977.78 QAR',
        status: '23.7% Wholesale Discount Unlocked',
        badgeColor: tealAccent
      },
      {
        tier: 'Tier 3 · National Clinical Distribution',
        kits: '100 Kits',
        unitQar: '750.67 QAR',
        totalQar: '75,066.67 QAR',
        status: '28.4% Maximum Wholesale Margin',
        badgeColor: navyPrimary
      }
    ];

    y -= 14;
    // Table Header
    page1.drawRectangle({
      x: 36,
      y: y - 16,
      width: p1Width - 72,
      height: 16,
      color: navyPrimary
    });

    page1.drawText('VOLUME TIER & CLINICAL SCOPE', { x: 44, y: y - 11, size: 6.2, font: helveticaBold, color: white });
    page1.drawText('KITS', { x: 230, y: y - 11, size: 6.2, font: helveticaBold, color: white });
    page1.drawText('UNIT PRICE (QAR)', { x: 285, y: y - 11, size: 6.2, font: helveticaBold, color: white });
    page1.drawText('TOTAL PRICE (QAR)', { x: 380, y: y - 11, size: 6.2, font: helveticaBold, color: white });
    page1.drawText('COMMERCIAL STATUS', { x: 475, y: y - 11, size: 6.2, font: helveticaBold, color: white });

    y -= 16;
    TIERS_DATA.forEach((t, i) => {
      const rowH = 26;
      y -= rowH;

      page1.drawRectangle({
        x: 36,
        y,
        width: p1Width - 72,
        height: rowH,
        color: i % 2 === 1 ? rgb(248 / 255, 250 / 255, 252 / 255) : white,
        borderColor: cardBorder,
        borderWidth: 0.6
      });

      page1.drawText(t.tier, { x: 44, y: y + 9, size: 7.2, font: helveticaBold, color: darkSlate, maxWidth: 180 });
      page1.drawText(t.kits, { x: 230, y: y + 9, size: 7.2, font: helveticaBold, color: darkSlate });
      page1.drawText(t.unitQar, { x: 285, y: y + 9, size: 7.5, font: helveticaBold, color: tealAccent });
      page1.drawText(t.totalQar, { x: 380, y: y + 9, size: 7.5, font: helveticaBold, color: navyPrimary });
      page1.drawText(t.status, { x: 475, y: y + 9, size: 6.0, font: helveticaBold, color: t.badgeColor, maxWidth: 80 });
    });

    // Section 2: Underlying Cost Structure & Logistics Transparency
    y -= 26;
    page1.drawText('2. UNDERLYING BENCHMARK COSTS & LOGISTICS ARCHITECTURE', {
      x: 36,
      y,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 62;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 56,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page1.drawText('European Core Lab Molecular Sequencing (Madrid, Spain):', { x: 44, y: y + 40, size: 6.8, font: helveticaBold, color: darkSlate });
    page1.drawText('€150.00 / kit (~660.00 QAR) · Fixed European cost for Illumina GSA (+50,000 SNPs) CE-IVD processing.', { x: 44, y: y + 30, size: 6.0, font: helvetica, color: mutedSlate });

    page1.drawText('International Express Courier & Cold-Chain Return Shipping:', { x: 44, y: y + 17, size: 6.8, font: helveticaBold, color: darkSlate });
    page1.drawText('80.00 QAR / kit · Express door-to-lab courier transport from Doha to Madrid with biological integrity guarantee.', { x: 44, y: y + 7, size: 6.0, font: helvetica, color: mutedSlate });

    page1.drawText('Continuous Clinical AI Care Subscription (WhatsApp & Julia AI):', { x: 340, y: y + 40, size: 6.8, font: helveticaBold, color: tealAccent });
    page1.drawText('51.09 QAR / month per active patient · Flexible monthly care with daily photo meal logging and nutritionist chat.', { x: 340, y: y + 25, size: 6.0, font: helvetica, color: darkSlate, maxWidth: 210, lineHeight: 8.0 });

    // Section 3: Dual-Track Clinical Model Summary
    y -= 24;
    page1.drawText('3. DUAL-TRACK CLINICAL PRESCRIPTION ARCHITECTURE', {
      x: 36,
      y,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 70;
    // Left Box: Pathway 1 OTC
    page1.drawRectangle({
      x: 36,
      y,
      width: (p1Width - 82) / 2,
      height: 64,
      color: white,
      borderColor: tealAccent,
      borderWidth: 1
    });

    page1.drawText('PATHWAY 1 · LOCAL COMMERCIAL OTC SUPPLEMENTS', { x: 44, y: y + 48, size: 6.5, font: helveticaBold, color: tealAccent });
    const p1Desc = '• Patients purchase active forms in local Doha pharmacies (Boots, Wellcare, Kulud, Aster).\n• Includes brands like Thorne 5-MTHF, Solgar Metafolin, Now Foods D3/K2, Pure Encapsulations.\n• Advantage: Immediate purchase with zero compounding delay.\n• Limitation: Requires taking 6 to 9 pills daily from 5 separate commercial bottles.';
    page1.drawText(p1Desc, { x: 44, y: y + 36, size: 5.6, font: helvetica, color: darkSlate, maxWidth: (p1Width - 110) / 2, lineHeight: 7.8 });

    // Right Box: Pathway 2 Compounding
    const rightBoxX = 36 + (p1Width - 82) / 2 + 10;
    page1.drawRectangle({
      x: rightBoxX,
      y,
      width: (p1Width - 82) / 2,
      height: 64,
      color: white,
      borderColor: navyPrimary,
      borderWidth: 1
    });

    page1.drawText('PATHWAY 2 · MASTER COMPOUNDED FORMULATION', { x: rightBoxX + 8, y: y + 48, size: 6.5, font: helveticaBold, color: navyPrimary });
    const p2Desc = '• Advanced tailor-made 3-capsule chronobiological regimen prepared by compounding pharmacy.\n• Formulated 100% lactose-free in acid-resistant DRcaps® and vegetable HPMC.\n• Isolates live probiotics from botanical berberine; pairs D3/K2 with breakfast fats; evening magnesium.\n• Resolves pill fatigue: Combines all therapeutic actives into 3 synchronized daily capsules.';
    page1.drawText(p2Desc, { x: rightBoxX + 8, y: y + 36, size: 5.6, font: helvetica, color: darkSlate, maxWidth: (p1Width - 110) / 2, lineHeight: 7.8 });

    // Section 4: Mutual Exclusivity Safety Banner
    y -= 38;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 32,
      color: rgb(254 / 255, 242 / 255, 242 / 255),
      borderColor: alertRed,
      borderWidth: 1.2
    });

    page1.drawText('CRITICAL CLINICAL SAFETY RULE · MUTUALLY EXCLUSIVE PATHWAYS:', { x: 44, y: y + 20, size: 6.5, font: helveticaBold, color: alertRed });
    page1.drawText('Pathway 1 and Pathway 2 are ALTERNATIVE clinical tracks. Patients must NEVER take both concurrently to prevent dangerous micronutrient hypervitaminosis (excess Vitamin D, folate, or mineral toxicity). Compounding supersedes OTC.', {
      x: 44,
      y: y + 9,
      size: 5.7,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 88
    });

    // Signatures & Official Validation Box
    y -= 66;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 60,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page1.drawText('OFFICIAL INSTITUTIONAL RATIFICATION & ACCREDITATION SEALS', { x: 44, y: y + 48, size: 6.8, font: helveticaBold, color: navyPrimary });
    page1.drawLine({ start: { x: 44, y: y + 43 }, end: { x: p1Width - 44, y: y + 43 }, thickness: 0.6, color: cardBorder });

    // Left Signature: Core Lab Madrid
    page1.drawText('Authorized Core Laboratory Director', { x: 44, y: y + 30, size: 6.0, font: helveticaBold, color: darkSlate });
    page1.drawText('24Genetics® Clinical Laboratory (Madrid, Spain)', { x: 44, y: y + 20, size: 5.6, font: helvetica, color: mutedSlate });
    page1.drawText('Accreditation: CE-IVD · ISO 9001 / ISO 15189 Standards', { x: 44, y: y + 10, size: 5.6, font: helveticaOblique, color: tealAccent });

    // Right Signature: Qatar Regional Partner
    page1.drawText('Authorized Regional B2B Representative', { x: 330, y: y + 30, size: 6.0, font: helveticaBold, color: darkSlate });
    page1.drawText('Ryhanh Medical Company · Doha, State of Qatar', { x: 330, y: y + 20, size: 5.6, font: helvetica, color: mutedSlate });
    page1.drawText(`Partner Account: Dr. Hossam Ahmed (${partnerId})`, { x: 330, y: y + 10, size: 5.6, font: helveticaBold, color: navyPrimary });

    // Page 1 Footer
    page1.drawText('Page 1 of 2 · Official B2B Wholesale Schedule (QAR) · Turn to Page 2 for Detailed Scope of Deliverables Included', {
      x: 36,
      y: 18,
      size: 7,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // PAGE 2: COMPREHENSIVE DELIVERABLES MATRIX ("LO QUE INCLUYE")
    // =========================================================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Brand Accent Strip
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: tealAccent
    });

    let y2 = p2Height - 28;

    // Header Category & Role Badge
    page2.drawText('24GENETICS® CLINICAL NUTRITION SUITE · COMPREHENSIVE SCOPE', {
      x: 36,
      y: y2,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const p2Badge = 'PAGE 2 OF 2 · DELIVERABLES MATRIX';
    const p2BadgeWidth = helveticaBold.widthOfTextAtSize(p2Badge, 6.8) + 14;
    page2.drawRectangle({
      x: p2Width - 36 - p2BadgeWidth,
      y: y2 - 3,
      width: p2BadgeWidth,
      height: 15,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1
    });
    page2.drawText(p2Badge, {
      x: p2Width - 36 - p2BadgeWidth + 7,
      y: y2 + 2,
      size: 6.8,
      font: helveticaBold,
      color: tealAccent
    });

    y2 -= 16;
    page2.drawText('EXACT DELIVERABLES INCLUDED IN EACH TEST & PACK', {
      x: 36,
      y: y2,
      size: 13,
      font: helveticaBold,
      color: darkSlate
    });

    y2 -= 11;
    page2.drawText('Detailed Specification of Collection Hardware, Laboratory Sequencing, Monographs & Clinical Protocols', {
      x: 36,
      y: y2,
      size: 7.5,
      font: helvetica,
      color: mutedSlate
    });

    y2 -= 8;
    page2.drawLine({
      start: { x: 36, y: y2 },
      end: { x: p2Width - 36, y: y2 },
      thickness: 1,
      color: cardBorder
    });

    // 6 Structured Deliverable Cards in a 2-Column Grid
    const DELIVERABLES = [
      {
        num: '1',
        title: 'PHYSICAL CE-IVD SALIVA COLLECTION KIT',
        accent: tealAccent,
        points: [
          'Non-invasive buccal saliva swab (in-clinic or at-home, 2 minutes).',
          'Patented cellular DNA lysis & stabilization buffer: room temperature stability (15°C–30°C) for up to 12 months with zero degradation.',
          'No dry ice, centrifugation, or immediate refrigeration required.',
          'Individually barcoded specimen tube, tamper-evident security seal, and prepaid international courier return mailer.'
        ]
      },
      {
        num: '2',
        title: 'EUROPEAN CORE LAB GENOMIC SEQUENCING',
        accent: navyPrimary,
        points: [
          'High-density Illumina Global Screening Array (GSA) with +50,000 informative single nucleotide polymorphisms (SNPs).',
          'European CE-IVD accredited molecular genetics laboratory in Madrid, Spain.',
          'Analytical repeatability and genotyping accuracy >99.9%.',
          'Turnaround time: 3 to 4 weeks from Madrid laboratory arrival, with full bioinformatic quality control and raw data curation.'
        ]
      },
      {
        num: '3',
        title: 'DUAL HARDBOUND LUXURY & DIGITAL MONOGRAPHS',
        accent: tealAccent,
        points: [
          'Deluxe hardbound printed monograph delivered physically to clinic or patient, bound in luxury archival-quality paper.',
          'Full High-Resolution Biogeographical Ancestry Monograph included in the pack fee (maternal/paternal haplogroups & migrations).',
          'Atlas Health Platform 24/7 digital portal access with 1-click verified login and exportable 3-page clinical PDF dossier.',
          'Complete coverage of metabolic pathways, food sensitivities, vitamin receptors, and cardiovascular predispositions.'
        ]
      },
      {
        num: '4',
        title: 'ALGORITHMIC CLINICAL DIET ASSIGNMENT',
        accent: navyPrimary,
        points: [
          'Personalized selection of the optimal dietary pattern from 24Genetics catalog: Low-Carb, Mediterranean, Low-Fat, or Balanced.',
          'Correlates TCF7L2, PPARG, FTO, and FABP2 genotypes to assign exact daily macronutrient targets (<40g net carbs/meal).',
          'High-Adherence Plate Sequencing protocol: fiber and vegetables first, proteins/fats second, complex carbs last.',
          'Clinically validated to blunt postprandial glucose excursions by up to 45%.'
        ]
      },
      {
        num: '5',
        title: 'DUAL-TRACK MICRONUTRIENT PRESCRIPTION',
        accent: tealAccent,
        points: [
          'Pathway 1 (Local Commercial OTC Guide): Recommends exact active forms (L-5-MTHF, D3+K2 MK-7, TRAACS® Magnesium, P-5-P B6) and local Doha pharmacy brands (Boots, Wellcare, Kulud).',
          'Pathway 2 (Master Compounded Formulation): 3-capsule chronobiological regimen in 100% lactose-free DRcaps®.',
          'Galenically partitioned: isolates live probiotics from berberine; lipophilic D3/K2 with breakfast fats; evening magnesium.',
          'Strict mutual exclusivity directive preventing accidental micronutrient duplication.'
        ]
      },
      {
        num: '6',
        title: 'CONTINUOUS CLINICAL CARE & JULIA AI (OPTIONAL)',
        accent: navyPrimary,
        points: [
          'Integrated with 24Genetics AI Ecosystem (Julia AI for Clinical Nutrition) supporting 22 languages.',
          'WhatsApp-based daily meal photo logging, nutrient tolerance checks, and dietary adjustments.',
          'Direct asynchronous communication with clinical nutritionists and compounding pharmacists.',
          'Flexible monthly subscription at 51.09 QAR / month per active patient with zero long-term lock-in.'
        ]
      }
    ];

    y2 -= 18;
    const colWidth = (p2Width - 84) / 2;
    const cardHeight = 104;

    for (let i = 0; i < DELIVERABLES.length; i += 2) {
      const leftItem = DELIVERABLES[i];
      const rightItem = DELIVERABLES[i + 1];

      y2 -= cardHeight;

      // Left Box
      page2.drawRectangle({
        x: 36,
        y: y2,
        width: colWidth,
        height: cardHeight,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1
      });

      page2.drawRectangle({
        x: 36,
        y: y2 + cardHeight - 16,
        width: colWidth,
        height: 16,
        color: lightBg
      });

      page2.drawText(`${leftItem.num}. ${leftItem.title}`, {
        x: 44,
        y: y2 + cardHeight - 11,
        size: 6.8,
        font: helveticaBold,
        color: leftItem.accent,
        maxWidth: colWidth - 16
      });

      let pY = y2 + cardHeight - 27;
      leftItem.points.forEach((pt) => {
        page2.drawText(`• ${pt}`, {
          x: 44,
          y: pY,
          size: 5.7,
          font: helvetica,
          color: darkSlate,
          maxWidth: colWidth - 18,
          lineHeight: 7.8
        });
        pY -= 18;
      });

      // Right Box
      if (rightItem) {
        const rightX = 36 + colWidth + 12;

        page2.drawRectangle({
          x: rightX,
          y: y2,
          width: colWidth,
          height: cardHeight,
          color: white,
          borderColor: cardBorder,
          borderWidth: 1
        });

        page2.drawRectangle({
          x: rightX,
          y: y2 + cardHeight - 16,
          width: colWidth,
          height: 16,
          color: lightBg
        });

        page2.drawText(`${rightItem.num}. ${rightItem.title}`, {
          x: rightX + 8,
          y: y2 + cardHeight - 11,
          size: 6.8,
          font: helveticaBold,
          color: rightItem.accent,
          maxWidth: colWidth - 16
        });

        let rpY = y2 + cardHeight - 27;
        rightItem.points.forEach((pt) => {
          page2.drawText(`• ${pt}`, {
            x: rightX + 8,
            y: rpY,
            size: 5.7,
            font: helvetica,
            color: darkSlate,
            maxWidth: colWidth - 18,
            lineHeight: 7.8
          });
          rpY -= 18;
        });
      }

      y2 -= 10;
    }

    // Summary Box at Bottom of Page 2
    y2 -= 48;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 48,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page2.drawText('TURNKEY VALUE PROPOSITION FOR CLINICS & MEDICAL CENTERS IN QATAR:', {
      x: 44,
      y: y2 + 34,
      size: 6.8,
      font: helveticaBold,
      color: tealAccent
    });
    const turnkeyText = 'Each 24Genomics Nutrition Test Kit represents a complete clinical service: from non-invasive saliva sampling in Doha to high-density European CE-IVD molecular sequencing in Madrid, luxury hardbound reporting, customized nutritional translation, and doctor-signed compounding prescriptions. Available under tiered B2B wholesale pricing exclusively for Ryhanh Medical Company authorized accounts.';
    page2.drawText(turnkeyText, {
      x: 44,
      y: y2 + 22,
      size: 5.8,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 88,
      lineHeight: 8.2
    });

    // Page 2 Footer
    page2.drawText('Page 2 of 2 · Comprehensive Deliverables Specification · Authorized for Ryhanh Medical Company (State of Qatar)', {
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
        'Content-Disposition': 'inline; filename="24Genomics-Qatar-B2B-PriceSchedule-QAR.pdf"',
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('[API /api/reports/24genomics-qatar-pricelist-pdf] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate Qatar B2B Price List PDF', details: error.message },
      { status: 500 }
    );
  }
}

