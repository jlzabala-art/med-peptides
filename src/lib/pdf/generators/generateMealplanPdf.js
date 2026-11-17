import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import {
  evaluateNutrigenomicProfile,
  DEFAULT_HOSSAM_GENOTYPES
} from '@/data/genomics/clinicalNutrigenomicEngine';
import { getGenomicReport } from '@/services/genomicsRepository';
import {
  patchPdfDoc,
  getWrappedLines,
  drawWrappedBlock,
  pdfColors
} from '@/lib/pdf/clinicalPdfKit';

export async function generateMealplanPdf({
  sampleId,
  patientName,
  doctorName,
  clinicName,
  mealPlanPartner,
  includeOriginal = false,
  audience = 'patient',
  nutritionistToken = null
}) {
    const isNutritionist = audience === 'nutritionist';
    const effectiveIncludeOriginal = isNutritionist && includeOriginal;
    // Canonical repository lookup (Firestore & 4-tier cache cascade)
    const storedReport = await getGenomicReport(sampleId);
    const resolvedPatient = storedReport?.patientName || patientName;
    const resolvedDoctor = storedReport?.doctor || doctorName;
    const resolvedClinic = storedReport?.clinic || clinicName;
    const resolvedSnps = storedReport?.snps;
    const resolvedAncestry = storedReport?.ancestry;

    // Execute dynamic clinical nutrigenomics rules engine
    const plan = evaluateNutrigenomicProfile({
      patientName: resolvedPatient,
      sampleCode: sampleId,
      clinic: resolvedClinic,
      doctor: resolvedDoctor,
      genotypes: resolvedSnps,
      ancestry: resolvedAncestry
    });

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    patchPdfDoc(pdfDoc, { helvetica, helveticaBold, helveticaOblique });

    const {
      navyPrimary,
      tealAccent,
      darkSlate,
      mutedSlate,
      lightBg,
      cardBorder,
      greenBorder: _greenBorder,
      greenBg: _greenBg,
      greenText: _greenText,
      amberBorder: _amberBorder,
      amberBg,
      amberText,
      redBorder,
      redBg,
      redText,
      blueBorder,
      blueBg,
      white,
      gcpBorder,
      gcpPillBg,
      gcpPillText,
      googleBlue,
      googleBlueBg,
      googleBlueBorder,
      gcpGreen,
      gcpGreenBg,
      gcpGreenBorder,
      gcpAmber,
      gcpAmberBg,
      gcpAmberBorder,
      gcpRed,
      gcpRedBg,
      gcpRedBorder
    } = pdfColors;

    // =========================================================================
    // COVER PAGE: EXECUTIVE LUXURY ATLAS BRAND COVER & CREDENTIALS (GOOGLE CLOUD UX)
    // =========================================================================
    const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4 Standard
    const { width: cWidth, height: cHeight } = coverPage.getSize();

    // Top Accent Bar (GCP 4px Clean Status Line)
    coverPage.drawRectangle({ x: 0, y: cHeight - 4, width: cWidth, height: 4, color: googleBlue });

    let yCover = cHeight - 36;

    // 1. TOP BAR: Brand Logo + Clinical Intelligence Header (GCP Style)
    const logoPath = path.join(process.cwd(), 'public/atlas-health-logo.png');
    const logoSize = 44;
    if (fs.existsSync(logoPath)) {
      try {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImg = await pdfDoc.embedJpg(logoBytes);
        coverPage.drawImage(logoImg, {
          x: 44,
          y: yCover - logoSize + 8,
          width: logoSize,
          height: logoSize
        });
      } catch (err) {
        console.warn('Cover logo embedding skipped:', err.message);
      }
    }

    // Brand Name & Service Line beside logo (NO geographic text)
    const headerTextX = 44 + logoSize + 12;
    coverPage.drawText('ATLAS HEALTH SERVICES', {
      x: headerTextX,
      y: yCover - 2,
      size: 11,
      font: helveticaBold,
      color: navyPrimary
    });
    coverPage.drawText('Personalized Nutrition Platform · DNA & Heritage Wellness', {
      x: headerTextX,
      y: yCover - 16,
      size: 7.8,
      font: helvetica,
      color: mutedSlate
    });

    // Top-Right: GCP Semantic Status Badge
    const statusBadge = isNutritionist ? 'NUTRITIONIST EDITION' : 'PERSONALIZED GUIDE';
    const sW = helveticaBold.widthOfTextAtSize(statusBadge, 6.8) + 16;
    coverPage.drawRectangle({
      x: cWidth - 44 - sW,
      y: yCover - 14,
      width: sW,
      height: 18,
      color: gcpGreenBg,
      borderColor: gcpGreen,
      borderWidth: 0.8
    });
    coverPage.drawText(statusBadge, {
      x: cWidth - 44 - sW + 8,
      y: yCover - 9,
      size: 6.8,
      font: helveticaBold,
      color: gcpGreen
    });

    // Clean Separator
    yCover -= (logoSize + 6);
    coverPage.drawLine({
      start: { x: 44, y: yCover },
      end: { x: cWidth - 44, y: yCover },
      thickness: 0.8,
      color: cardBorder
    });

    // 2. HERO TITLE SECTION
    yCover -= 26;
    coverPage.drawText('PERSONALIZED DNA & HERITAGE GUIDE', {
      x: 44,
      y: yCover,
      size: 19,
      font: helveticaBold,
      color: darkSlate
    });

    yCover -= 15;
    coverPage.drawText('DNA-Guided Nutrition, Ancestral Origins & Daily Rhythm', {
      x: 44,
      y: yCover,
      size: 9.5,
      font: helvetica,
      color: googleBlue
    });

    // Metadata Chips Row (GCP Chips)
    yCover -= 18;
    const chips = [
      { label: 'Precision Nutrition + Ancestry', bg: gcpGreenBg, border: gcpGreen, text: gcpGreen },
      { label: 'Illumina NGS Sequencing', bg: rgb(241 / 255, 243 / 255, 244 / 255), border: cardBorder, text: darkSlate },
      { label: isNutritionist ? 'Complete Merged Dossier (24Genetics)' : 'Simple 6-Page Guide (No Annexes)', bg: rgb(232 / 255, 240 / 255, 254 / 255), border: rgb(210 / 255, 227 / 255, 252 / 255), text: googleBlue }
    ];
    let chipX = 44;
    chips.forEach(ch => {
      const chW = helveticaBold.widthOfTextAtSize(ch.label, 6.8) + 14;
      coverPage.drawRectangle({
        x: chipX,
        y: yCover - 2,
        width: chW,
        height: 15,
        color: ch.bg,
        borderColor: ch.border,
        borderWidth: 0.8
      });
      coverPage.drawText(ch.label, {
        x: chipX + 7,
        y: yCover + 2,
        size: 6.8,
        font: helveticaBold,
        color: ch.text
      });
      chipX += chW + 8;
    });

    // 3. RESOURCE DETAILS CARD (GCP Standard Property Grid - 4 Spacious Rows, Zero Collision)
    yCover -= 22;
    const cardH = 114;
    coverPage.drawRectangle({
      x: 44,
      y: yCover - cardH,
      width: cWidth - 88,
      height: cardH,
      color: white,
      borderColor: cardBorder,
      borderWidth: 1.0
    });

    // Card Header Strip
    coverPage.drawRectangle({
      x: 44,
      y: yCover - 22,
      width: cWidth - 88,
      height: 22,
      color: lightBg
    });
    coverPage.drawText('SPECIMEN & HERITAGE OVERVIEW', {
      x: 56,
      y: yCover - 15,
      size: 7.8,
      font: helveticaBold,
      color: darkSlate
    });

    const c1Label = 56;
    const c1Val = 138;
    const c2Label = 300;
    const c2Val = 380;
    let rowY = yCover - 38;

    // Row 1: Patient Name & Specimen ID
    coverPage.drawText('Patient Name:', { x: c1Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText(patientName, { x: c1Val, y: rowY, size: 8.5, font: helveticaBold, color: darkSlate });

    coverPage.drawText('Specimen ID:', { x: c2Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText(`G000943554 / ${sampleId}`, { x: c2Val, y: rowY, size: 8.5, font: helveticaBold, color: darkSlate });

    // Row 2: Clinical Scope (GCP Key-Value Pair)
    rowY -= 18;
    coverPage.drawText('Nutrition Scope:', { x: c1Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText('Precision DNA Nutrition · Chronobiology Optimization', {
      x: c1Val,
      y: rowY,
      size: 7.8,
      font: helveticaBold,
      color: gcpGreen
    });

    // Row 3: Sequencing Lab & Technology
    rowY -= 18;
    coverPage.drawText('Sequencing Lab:', { x: c1Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText('24Genetics SL · Madrid, Spain', { x: c1Val, y: rowY, size: 7.8, font: helvetica, color: darkSlate });

    coverPage.drawText('Technology:', { x: c2Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText('Illumina NGS Microarray Platform', { x: c2Val, y: rowY, size: 7.8, font: helvetica, color: darkSlate });

    // Row 4: Catering Service & Issue Date
    rowY -= 18;
    coverPage.drawText('Catering Service:', { x: c1Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText(mealPlanPartner, { x: c1Val, y: rowY, size: 7.8, font: helvetica, color: darkSlate });

    coverPage.drawText('Issue Date:', { x: c2Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
    coverPage.drawText('November 2026 · Wellness Edition', { x: c2Val, y: rowY, size: 7.8, font: helvetica, color: darkSlate });

    yCover -= (cardH + 18);

    // 4. HOW THIS REPORT IS ORGANIZED — STEP-BY-STEP READING & SHARING GUIDE
    coverPage.drawText('HOW THIS REPORT IS ORGANIZED · YOUR STEP-BY-STEP GUIDE', {
      x: 44,
      y: yCover,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });
    yCover -= 11;
    coverPage.drawText('Start here: each page of this guide has one clear purpose and tells you who to use or share it with.', {
      x: 44,
      y: yCover,
      size: 7.4,
      font: helvetica,
      color: mutedSlate
    });

    yCover -= 10;
    const coverRoadmap = [
      {
        badge: 'STEP 1 · PAGE 2',
        audience: 'FOR YOU & SPECIALIST',
        badgeColor: googleBlue,
        badgeBg: rgb(232 / 255, 240 / 255, 254 / 255),
        title: '2-Step Methodology & Ancestry × Nutrition Synthesis',
        desc: 'Explains why we map your Ancestral Origins first and Nutrition DNA second, with your heritage breakdown and combined decision matrix.'
      },
      {
        badge: 'STEP 2 · PAGE 3',
        audience: 'FOR YOU (DAILY HABITS)',
        badgeColor: tealAccent,
        badgeBg: rgb(240 / 255, 253 / 255, 250 / 255),
        title: 'Your DNA in Plain English, 1-2-3 Plate & 24h Rhythm',
        desc: 'Your 4 key DNA traits without jargon, the 1-2-3 Plate Order infographic (Veggies -> Protein -> Carbs last), and 24-hour rhythm.'
      },
      {
        badge: 'STEP 3 · PAGE 4',
        audience: 'FOR DAILY MEALS',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        title: 'Daily Food Traffic Light & 24-Hour Supplement Routine',
        desc: 'Quick Green / Amber / Red food summary paired with your 4 simple morning-to-bedtime nutrition and supplement moments.'
      },
      {
        badge: 'STEP 4 · PAGES 5-6',
        audience: 'FOR YOUR KITCHEN / CHEF',
        badgeColor: tealAccent,
        badgeBg: rgb(240 / 255, 253 / 255, 250 / 255),
        title: 'Your 7-Day Precision Meal Plan (Mon-Thu & Fri-Sun)',
        desc: 'Spacious 2-page breakfast, lunch, and dinner menu with heritage tags. Share directly with your home kitchen or catering service.'
      },
      {
        badge: 'STEP 5 · PAGES 7-8',
        audience: 'FOR SUPERMARKET SHOPPING',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        title: 'Complete Personalized Food List (17 Families + Kitchen Swaps)',
        desc: '115+ foods across all 17 food families classified as GREEN (Eat Freely), AMBER (Moderate), or RED (Avoid), plus 4 easy kitchen swaps.'
      },
      {
        badge: 'STEP 6 · PAGES 9-10',
        audience: 'FOR PHARMACY / SPECIALIST',
        badgeColor: gcpAmber,
        badgeBg: gcpAmberBg,
        title: '5 Targeted Nutrients, 3 Simple Packs & Pharmacy Options',
        desc: 'Plain-language guide to your 5 nutrients, 3 pack levels, and Option A (Local Pharmacy) vs. Option B (3-Capsule Compounding).'
      },
      {
        badge: 'BONUS · PAGE 11',
        audience: 'FOR YOUR FRIDGE / KITCHEN',
        badgeColor: googleBlue,
        badgeBg: rgb(232 / 255, 240 / 255, 254 / 255),
        title: 'One-Page Fridge Cheat Sheet (Daily Checklist & QR)',
        desc: 'Print and stick on your fridge: 1-2-3 Plate Rule, 3 supplement moments, 4 pantry swaps, and direct QR to your digital portal.'
      }
    ];

    coverRoadmap.forEach((sec) => {
      const sH = 33;
      coverPage.drawRectangle({
        x: 44,
        y: yCover - sH,
        width: cWidth - 88,
        height: sH,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Left accent strip
      coverPage.drawRectangle({
        x: 44,
        y: yCover - sH,
        width: 3.5,
        height: sH,
        color: sec.badgeColor
      });

      // Step Badge
      const bW = helveticaBold.widthOfTextAtSize(sec.badge, 6.0) + 10;
      coverPage.drawRectangle({
        x: 54,
        y: yCover - 14,
        width: bW,
        height: 11,
        color: sec.badgeBg,
        borderColor: cardBorder,
        borderWidth: 0.7
      });
      coverPage.drawText(sec.badge, {
        x: 59,
        y: yCover - 11,
        size: 6.0,
        font: helveticaBold,
        color: sec.badgeColor
      });

      // Title
      coverPage.drawText(sec.title, {
        x: 54 + bW + 6,
        y: yCover - 11,
        size: 7.4,
        font: helveticaBold,
        color: darkSlate
      });

      // Audience Pill on Right
      const audW = helveticaBold.widthOfTextAtSize(sec.audience, 5.4) + 10;
      coverPage.drawRectangle({
        x: cWidth - 52 - audW,
        y: yCover - 14,
        width: audW,
        height: 11,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 0.6
      });
      coverPage.drawText(sec.audience, {
        x: cWidth - 52 - audW + 5,
        y: yCover - 11,
        size: 5.4,
        font: helveticaBold,
        color: navyPrimary
      });

      drawWrappedBlock(coverPage, sec.desc, {
        x: 54,
        y: yCover - 23,
        size: 6.4,
        font: helvetica,
        color: mutedSlate,
        maxWidth: cWidth - 108,
        lineHeight: 8.2,
        maxLines: 2
      });

      yCover -= (sH + 4);
    });

    // 5. INTERACTIVE DIGITAL PORTAL ACTION BANNER (GCP Action Banner)
    yCover -= 4;
    const portalH = 56;
    coverPage.drawRectangle({
      x: 44,
      y: yCover - portalH,
      width: cWidth - 88,
      height: portalH,
      color: rgb(232 / 255, 240 / 255, 254 / 255), // #e8f0fe
      borderColor: rgb(210 / 255, 227 / 255, 252 / 255), // #d2e3fc
      borderWidth: 1.0
    });

    // Left accent vertical bar
    coverPage.drawRectangle({
      x: 44,
      y: yCover - portalH,
      width: 4,
      height: portalH,
      color: googleBlue
    });

    // Generate QR Code for Cover (Asymmetric: Nutritionist QR vs Patient QR)
    const baseCoverUrl = `https://www.atlashealth-services.com/patient/dna-report?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleId)}`;
    const coverPortalUrl = (isNutritionist && nutritionistToken)
      ? `${baseCoverUrl}&view=nutritionist&nt=${encodeURIComponent(nutritionistToken)}`
      : baseCoverUrl;
    try {
      const coverQrBuffer = await QRCode.toBuffer(coverPortalUrl, {
        type: 'png',
        margin: 1,
        width: 150,
        color: { dark: '#1a73e8', light: '#ffffff' }
      });
      const coverQrImg = await pdfDoc.embedPng(coverQrBuffer);
      coverPage.drawImage(coverQrImg, {
        x: 56,
        y: yCover - portalH + 4,
        width: 48,
        height: 48
      });
    } catch (e) {
      console.warn('Cover QR code skipped:', e.message);
    }

    coverPage.drawText('INTERACTIVE DIGITAL GENOMIC PORTAL', {
      x: 116,
      y: yCover - 17,
      size: 8.5,
      font: helveticaBold,
      color: googleBlue
    });
    coverPage.drawText('Scan the QR code with your smartphone camera to access your interactive digital dashboard,\nexplore dynamic food filters, review dosage schedules, and share with your healthcare team.', {
      x: 116,
      y: yCover - 31,
      size: 7.0,
      font: helvetica,
      color: darkSlate,
      maxWidth: cWidth - 88 - 82,
      lineHeight: 9.8
    });

    // 6. SYSTEM FOOTER
    coverPage.drawText(`CONFIDENTIAL MEDICAL & GENOMIC REPORT · PREPARED EXCLUSIVELY FOR ${patientName.toUpperCase()} · ATLAS HEALTH SERVICES`, {
      x: 44,
      y: 18,
      size: 6.2,
      font: helveticaBold,
      color: mutedSlate
    });

    // =========================================================================
    // =========================================================================
    // =========================================================================
    // PAGE 2: 2-STEP METHODOLOGY & ANCESTRY × NUTRITION SYNTHESIS
    // =========================================================================
    const anc = plan?.ancestralMetabolicProfile;
    if (anc) {
      const ancPage = pdfDoc.addPage([595.28, 841.89]);
      const { width: aW, height: aH } = ancPage.getSize();
      ancPage.drawRectangle({ x: 0, y: aH - 8, width: aW, height: 8, color: navyPrimary });
      ancPage.drawRectangle({ x: 0, y: aH - 12, width: aW, height: 4, color: tealAccent });

      const ancBadge = 'PAGE 2 OF 11 · METHODOLOGY & HERITAGE';
      const ancBadgeW = helveticaBold.widthOfTextAtSize(ancBadge, 7.2) + 16;
      ancPage.drawRectangle({
        x: aW - 36 - ancBadgeW,
        y: aH - 42,
        width: ancBadgeW,
        height: 18,
        color: rgb(240 / 255, 253 / 255, 250 / 255),
        borderColor: tealAccent,
        borderWidth: 1.0,
      });
      ancPage.drawText(ancBadge, {
        x: aW - 36 - ancBadgeW + 8,
        y: aH - 36,
        size: 7.2,
        font: helveticaBold,
        color: tealAccent,
      });

      ancPage.drawText(
        isNutritionist
          ? 'INTEGRATED GENOMICS · 2-STEP METHODOLOGY & ANCESTRY MATRIX'
          : 'YOUR HERITAGE × NUTRITION STORY · WHY WE TEST BOTH',
        { x: 36, y: aH - 36, size: 8.5, font: helveticaBold, color: tealAccent }
      );
      ancPage.drawText(
        `${resolvedPatient} — ${isNutritionist ? 'Combined 24Genetics Ancestry & Nutrition Synthesis' : 'How Your Origins Shape Your Daily Plate'}`,
        { x: 36, y: aH - 60, size: 15.0, font: helveticaBold, color: navyPrimary }
      );

      // 2-Step Visual Methodology Flow Diagram (3 connected cards)
      let ay = aH - 84;
      ancPage.drawText(
        isNutritionist
          ? '2-STEP METHODOLOGY: WHY ANCESTRY FIRST, THEN NUTRITION?'
          : 'WHY WE TEST YOUR ANCESTRY FIRST, THEN YOUR NUTRITION',
        { x: 36, y: ay, size: 10.0, font: helveticaBold, color: navyPrimary }
      );
      ay -= 14;

      const methSteps = [
        {
          num: '1',
          tag: 'STEP 1 · ANCESTRY',
          title: 'Evolutionary Baseline',
          desc: isNutritionist
            ? 'Haplogroups & regional heritage map lactose/A2 dairy tolerance, solar Vitamin D demand & oxidative baseline.'
            : 'Shows where your ancestors thrived and which traditional foods your body evolved to digest best.',
          bg: rgb(239 / 255, 246 / 255, 255 / 255),
          fg: navyPrimary,
        },
        {
          num: '2',
          tag: 'STEP 2 · NUTRITION DNA',
          title: 'Personal SNP Calibration',
          desc: isNutritionist
            ? 'Calibrates individual variants (MTHFR, VDR, MC4R, IRS1, ZPR1) on top of your ancestral metabolic baseline.'
            : 'Fine-tunes your exact daily vitamins, carbs, fats & caffeine cutoff based on your personal genes.',
          bg: rgb(240 / 255, 253 / 255, 250 / 255),
          fg: tealAccent,
        },
        {
          num: '3',
          tag: 'RESULT · YOUR PLAN',
          title: 'Culture + Biology Match',
          desc: isNutritionist
            ? 'Delivers a culturally aligned meal plan & targeted supplement protocol with higher adherence and precision.'
            : 'A practical daily menu & supplement plan that fits both your biology and your food culture.',
          bg: rgb(240 / 255, 253 / 255, 244 / 255),
          fg: gcpGreen,
        },
      ];

      const mCardW = (aW - 72 - 24) / 3;
      const mCardH = 104;
      methSteps.forEach((ms, idx) => {
        const mx = 36 + idx * (mCardW + 12);
        ancPage.drawRectangle({
          x: mx,
          y: ay - mCardH,
          width: mCardW,
          height: mCardH,
          color: ms.bg,
          borderColor: ms.fg,
          borderWidth: 1.0,
        });
        ancPage.drawCircle({ x: mx + 18, y: ay - 18, size: 10, color: ms.fg });
        ancPage.drawText(ms.num, { x: mx + 15.2, y: ay - 21.5, size: 9.5, font: helveticaBold, color: white });
        ancPage.drawText(ms.tag, { x: mx + 34, y: ay - 16, size: 6.8, font: helveticaBold, color: ms.fg });
        ancPage.drawText(ms.title, { x: mx + 34, y: ay - 27, size: 8.6, font: helveticaBold, color: darkSlate });
        drawWrappedBlock(ancPage, ms.desc, {
          x: mx + 12,
          y: ay - 44,
          size: 7.7,
          font: helvetica,
          color: darkSlate,
          maxWidth: mCardW - 24,
          lineHeight: 10.6,
          maxLines: 5,
        });
        if (idx < 2) {
          ancPage.drawText('->', { x: mx + mCardW + 2, y: ay - 52, size: 10, font: helveticaBold, color: navyPrimary });
        }
      });
      ay -= (mCardH + 22);

      // Heritage Composition Bar & Summary Box
      ancPage.drawText('YOUR ANCESTRAL COMPOSITION & METABOLIC SYNTHESIS', {
        x: 36,
        y: ay,
        size: 10.0,
        font: helveticaBold,
        color: navyPrimary,
      });
      ay -= 12;

      const herbBoxH = 92;
      ancPage.drawRectangle({
        x: 36,
        y: ay - herbBoxH,
        width: aW - 72,
        height: herbBoxH,
        color: rgb(248 / 255, 250 / 255, 252 / 255),
        borderColor: cardBorder,
        borderWidth: 1.0,
      });
      ancPage.drawText(
        `Primary Heritage: ${anc.primaryRegion || 'MENA / Nile Valley'} (${anc.primaryPercent ?? 80.6}%)   ·   Maternal: ${anc.maternalHaplogroup || 'H13a'}   ·   Paternal: ${anc.paternalHaplogroup || 'R-M479'}`,
        { x: 48, y: ay - 18, size: 8.8, font: helveticaBold, color: navyPrimary }
      );

      // Proportional Heritage Bar
      const pct = Math.min(100, Math.max(10, Number(anc.primaryPercent ?? 80.6)));
      const barTotalW = aW - 96;
      const barPrimaryW = (barTotalW * pct) / 100;
      ancPage.drawRectangle({ x: 48, y: ay - 44, width: barTotalW, height: 18, color: rgb(226 / 255, 232 / 255, 240 / 255) });
      ancPage.drawRectangle({ x: 48, y: ay - 44, width: barPrimaryW, height: 18, color: tealAccent });
      ancPage.drawText(`${anc.primaryRegion || 'MENA / Nile Valley'} (${pct.toFixed(1)}%)`, {
        x: 56,
        y: ay - 38,
        size: 8.0,
        font: helveticaBold,
        color: white,
      });

      drawWrappedBlock(ancPage, anc.clinicalSynthesisEn || 'Combines ancestral dietary heritage with nutrigenomic variants to tailor fats, fermented dairy, and whole grains.', {
        x: 48,
        y: ay - 56,
        size: 8.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: aW - 96,
        lineHeight: 11.2,
        maxLines: 3,
      });
      ay -= (herbBoxH + 24);

      // 4-Column Decision Matrix (Spacious 56pt rows, 8.0pt font)
      ancPage.drawText(
        isNutritionist ? 'ANCESTRY × NUTRITION CROSS-TEST MATRIX' : '4 HERITAGE-BASED NUTRITION RULES FOR DAILY LIFE',
        { x: 36, y: ay, size: 10.0, font: helveticaBold, color: navyPrimary }
      );
      ay -= 14;

      // Table Header
      ancPage.drawRectangle({ x: 36, y: ay - 22, width: aW - 72, height: 24, color: navyPrimary });
      ancPage.drawText('Ancestry Signal', { x: 44, y: ay - 13, size: 8.0, font: helveticaBold, color: white });
      ancPage.drawText(isNutritionist ? 'Nutrition Gene / Axis' : 'Body Priority', { x: 168, y: ay - 13, size: 8.0, font: helveticaBold, color: white });
      ancPage.drawText('Combined Effect', { x: 298, y: ay - 13, size: 8.0, font: helveticaBold, color: white });
      ancPage.drawText('Diet / Supplement Action', { x: 432, y: ay - 13, size: 8.0, font: helveticaBold, color: white });
      ay -= 26;

      const matrixRows = [
        [
          `${anc.primaryRegion || 'MENA'} (${anc.primaryPercent ?? 80.6}%)`,
          isNutritionist ? 'LCT / MCM6 + Inflammation' : 'Dairy & Gut Comfort',
          anc.dairyAdaptation?.status || 'Fermented A2 preference',
          'Prioritize A2 goat/sheep yogurt, labneh & aged cheese',
        ],
        [
          'Nile / Mediterranean Diet',
          isNutritionist ? 'TCF7L2 / FTO / MC4R' : 'Blood Sugar & Satiety',
          anc.carbohydrateAdaptation?.status || 'Refined carb sensitivity',
          '1-2-3 plate order; ancient grains (millet, buckwheat, lentils)',
        ],
        [
          `Maternal ${anc.maternalHaplogroup || 'H13a'} (mtDNA)`,
          isNutritionist ? 'SOD2 / COQ2 / MTHFR' : 'Cellular Energy & Vitality',
          'High antioxidant & folate demand',
          'Daily EVOO polyphenols, leafy greens & methylated folate',
        ],
        [
          'Solar Latitude Heritage',
          isNutritionist ? 'VDR / CYP2R1 / GC' : 'Vitamin D & Bone Immunity',
          'Higher indoor Vitamin D3 requirement',
          'Targeted D3 + K2 (MK-7) with olive-oil meal',
        ],
      ];

      matrixRows.forEach((cols, rIdx) => {
        const rowH = 54;
        ancPage.drawRectangle({
          x: 36,
          y: ay - rowH,
          width: aW - 72,
          height: rowH,
          color: rIdx % 2 === 0 ? lightBg : white,
          borderColor: cardBorder,
          borderWidth: 0.7,
        });
        drawWrappedBlock(ancPage, cols[0], { x: 44, y: ay - 14, size: 8.0, font: helveticaBold, color: navyPrimary, maxWidth: 116, lineHeight: 10.8, maxLines: 3 });
        drawWrappedBlock(ancPage, cols[1], { x: 168, y: ay - 14, size: 7.9, font: helvetica, color: darkSlate, maxWidth: 122, lineHeight: 10.8, maxLines: 3 });
        drawWrappedBlock(ancPage, cols[2], { x: 298, y: ay - 14, size: 7.9, font: helvetica, color: darkSlate, maxWidth: 126, lineHeight: 10.8, maxLines: 3 });
        drawWrappedBlock(ancPage, cols[3], { x: 432, y: ay - 14, size: 7.9, font: helveticaBold, color: tealAccent, maxWidth: 120, lineHeight: 10.8, maxLines: 3 });
        ay -= (rowH + 4);
      });

      // Bottom Key Takeaway Banner
      ay -= 10;
      ancPage.drawRectangle({
        x: 36,
        y: ay - 48,
        width: aW - 72,
        height: 48,
        color: rgb(232 / 255, 240 / 255, 254 / 255),
        borderColor: rgb(191 / 255, 219 / 255, 254 / 255),
        borderWidth: 1.0,
      });
      ancPage.drawText('KEY TAKEAWAY FOR YOUR NEXT STEPS:', { x: 48, y: ay - 16, size: 8.2, font: helveticaBold, color: navyPrimary });
      drawWrappedBlock(
        ancPage,
        isNutritionist
          ? 'Every meal recommendation on Pages 3–7 and every nutrient dose on Pages 8–9 respects both ancestral digestive adaptations (A2 dairy, Mediterranean polyphenols) and individual SNP targets.'
          : 'Your plan honors your traditional food roots while using your DNA to choose the exact fats, grains, and daily vitamins that keep your energy steady.',
        { x: 48, y: ay - 28, size: 7.9, font: helvetica, color: darkSlate, maxWidth: aW - 96, lineHeight: 10.5, maxLines: 2 }
      );

      ancPage.drawText(
        isNutritionist
          ? 'Page 2 of 11 · 2-Step Methodology & Ancestry × Nutrition Matrix · Atlas Health Services'
          : 'Page 2 of 11 · Your Heritage & Nutrition Blueprint · Atlas Health Services',
        { x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate }
      );
    }

    // =========================================================================
    // PAGE 3: YOUR DNA IN PLAIN ENGLISH + VISUAL PLATE & 24H RHYTHM BLUEPRINT
    // =========================================================================
    const dnaPage = pdfDoc.addPage([595.28, 841.89]); // A4 Standard
    const { width: dW, height: dH } = dnaPage.getSize();

    dnaPage.drawRectangle({ x: 0, y: dH - 8, width: dW, height: 8, color: tealAccent });
    let yd = dH - 28;

    dnaPage.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: yd, size: 9.0, font: helveticaBold, color: navyPrimary
    });
    const badgeDna = 'PAGE 3 OF 11 · DNA INSIGHTS & VISUAL BLUEPRINT';
    const badgeDnaW = helveticaBold.widthOfTextAtSize(badgeDna, 7.2) + 16;
    dnaPage.drawRectangle({
      x: dW - 36 - badgeDnaW, y: yd - 4, width: badgeDnaW, height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 1.0
    });
    dnaPage.drawText(badgeDna, {
      x: dW - 36 - badgeDnaW + 8, y: yd + 1, size: 7.2, font: helveticaBold, color: tealAccent
    });

    yd -= 20;
    dnaPage.drawText('YOUR DNA IN PLAIN ENGLISH & DAILY PLATE BLUEPRINT', {
      x: 36, y: yd, size: 14.5, font: helveticaBold, color: darkSlate
    });
    yd -= 14;
    dnaPage.drawText('4 clear genetic takeaways, your 1-2-3 plate sequencing visual, and 24-hour circadian rhythm', {
      x: 36, y: yd, size: 8.8, font: helvetica, color: mutedSlate
    });
    yd -= 12;
    dnaPage.drawLine({ start: { x: 36, y: yd }, end: { x: dW - 36, y: yd }, thickness: 1.0, color: cardBorder });

    yd -= 15;
    dnaPage.drawText(`PATIENT: ${patientName}   |   SPECIMEN ID: ${sampleId}   |   MEAL SERVICE: ${mealPlanPartner}`, {
      x: 36, y: yd, size: 8.0, font: helveticaBold, color: tealAccent
    });
    yd -= 10;
    dnaPage.drawLine({ start: { x: 36, y: yd }, end: { x: dW - 36, y: yd }, thickness: 0.8, color: cardBorder });

    // SECTION 1: 4 PLAIN-ENGLISH FINDINGS (2x2 Spacious Grid)
    yd -= 20;
    dnaPage.drawText('1. YOUR GENETIC PROFILE IN PLAIN ENGLISH (HUMAN-FIRST SUMMARY)', {
      x: 36, y: yd, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yd -= 12;

    const plainFindings = [
      {
        badge: isNutritionist ? 'SATIETY · GEN MC4R' : 'APPETITE & SATIETY',
        title: 'Appetite & Fullness Signal',
        accent: googleBlue,
        action: 'Your brain receives the "I am full" signal slower. Eat 1 palm-sized protein (30-35g) per meal and chew slowly to stay comfortably full for 5 hours.'
      },
      {
        badge: isNutritionist ? 'VITALITY · GEN MTHFR' : 'ACTIVE VITAMINS',
        title: 'Active Vitamins & Vitality',
        accent: tealAccent,
        action: 'Your body uses only 30% of common synthetic folic acid. Take Active Natural Folate (L-5-MTHF) and enjoy leafy greens & pasture eggs daily.'
      },
      {
        badge: isNutritionist ? 'ENERGY · GEN IRS1' : 'STEADY ENERGY',
        title: 'Steady Sugar & Energy',
        accent: gcpGreen,
        action: 'White bread and fast rice cause afternoon sleepiness. Eat salad first, protein second, and leave rice or potato for last (max 1 fist).'
      },
      {
        badge: isNutritionist ? 'SAFETY · GEN ZPR1' : 'SUPPLEMENT SAFETY',
        title: 'Skip Synthetic Vitamin E Pills',
        accent: gcpAmber,
        action: 'Your body accumulates synthetic Vitamin E from pills. Never take Vitamin E supplements; get it naturally from extra virgin olive oil & raw almonds.'
      }
    ];

    const boxW = (dW - 72 - 16) / 2;
    const boxH = 104;
    plainFindings.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bX = 36 + col * (boxW + 16);
      const bY = yd - (row * (boxH + 12)) - boxH;

      dnaPage.drawRectangle({
        x: bX, y: bY, width: boxW, height: boxH,
        color: white, borderColor: cardBorder, borderWidth: 1.0
      });
      dnaPage.drawRectangle({ x: bX, y: bY, width: 4, height: boxH, color: f.accent });

      const bW = helveticaBold.widthOfTextAtSize(f.badge, 6.4) + 12;
      dnaPage.drawRectangle({
        x: bX + 12, y: bY + boxH - 22, width: bW, height: 14,
        color: lightBg, borderColor: f.accent, borderWidth: 0.8
      });
      dnaPage.drawText(f.badge, {
        x: bX + 18, y: bY + boxH - 18, size: 6.4, font: helveticaBold, color: f.accent
      });

      dnaPage.drawText(f.title, {
        x: bX + 12, y: bY + boxH - 39, size: 9.4, font: helveticaBold, color: navyPrimary
      });

      drawWrappedBlock(dnaPage, f.action, {
        x: bX + 12, y: bY + boxH - 54, size: 8.2, font: helvetica, color: darkSlate,
        maxWidth: boxW - 24, lineHeight: 11.4, maxLines: 4
      });
    });

    yd -= (2 * boxH + 12 + 24);

    // SECTION 2: THE 1-2-3 PLATE SEQUENCING INFOGRAPHIC (SPACIOUS)
    dnaPage.drawText('2. THE 1-2-3 PLATE ORDER (EAT IN THIS EXACT SEQUENCE)', {
      x: 36, y: yd, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yd -= 12;

    const barTotalW = dW - 72;
    const plateSteps = [
      { num: '1', pct: '50%', label: 'Greens & Fiber First', sub: 'Coats stomach & slows glucose absorption by up to 45%.', bg: rgb(220 / 255, 252 / 255, 231 / 255), fg: rgb(22 / 255, 101 / 255, 52 / 255) },
      { num: '2', pct: '30%', label: 'Clean Protein & EVOO', sub: 'Triggers satiety hormones so you stay full for 5 hours.', bg: rgb(219 / 255, 234 / 255, 254 / 255), fg: navyPrimary },
      { num: '3', pct: '20%', label: 'Ancient Carbs Last', sub: 'Small fist of millet, quinoa, lentils or cooled basmati.', bg: rgb(254 / 255, 243 / 255, 199 / 255), fg: rgb(146 / 255, 64 / 255, 14 / 255) },
    ];
    const pStepW = (barTotalW - 24) / 3;
    const pStepH = 88;
    plateSteps.forEach((st, idx) => {
      const sx = 36 + idx * (pStepW + 12);
      dnaPage.drawRectangle({ x: sx, y: yd - pStepH, width: pStepW, height: pStepH, color: st.bg, borderColor: st.fg, borderWidth: 1.0 });
      dnaPage.drawCircle({ x: sx + 20, y: yd - 20, size: 11, color: st.fg });
      dnaPage.drawText(st.num, { x: sx + 17, y: yd - 23.5, size: 10.0, font: helveticaBold, color: white });
      dnaPage.drawText(`${st.pct} · ${st.label}`, { x: sx + 36, y: yd - 23, size: 8.2, font: helveticaBold, color: st.fg });
      drawWrappedBlock(dnaPage, st.sub, {
        x: sx + 12, y: yd - 44, size: 7.8, font: helvetica, color: darkSlate, maxWidth: pStepW - 24, lineHeight: 10.6, maxLines: 3
      });
      if (idx < 2) {
        dnaPage.drawText('->', { x: sx + pStepW + 2, y: yd - 44, size: 10, font: helveticaBold, color: navyPrimary });
      }
    });
    yd -= (pStepH + 26);

    // SECTION 3: 24-HOUR VISUAL ROUTINE TIMELINE & 3 GOLDEN KITCHEN RULES
    dnaPage.drawText('3. 24-HOUR DAILY RHYTHM TIMELINE', {
      x: 36, y: yd, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yd -= 28;
    dnaPage.drawLine({ start: { x: 56, y: yd }, end: { x: dW - 56, y: yd }, thickness: 2.4, color: cardBorder });
    const timelineNodes = [
      { time: '07:00', label: 'Water + Probiotic', color: tealAccent },
      { time: '08:30', label: 'Savory Breakfast', color: googleBlue },
      { time: '12:00', label: 'Caffeine Cutoff', color: rgb(217 / 255, 119 / 255, 6 / 255) },
      { time: '13:30', label: '1-2-3 Main Meal', color: navyPrimary },
      { time: '19:30', label: 'Light Dinner', color: rgb(22 / 255, 163 / 255, 74 / 255) },
      { time: '22:00', label: '12h Night Rest', color: rgb(100 / 255, 116 / 255, 139 / 255) },
    ];
    const nodeSpan = (dW - 112) / (timelineNodes.length - 1);
    timelineNodes.forEach((nd, idx) => {
      const nx = 56 + idx * nodeSpan;
      dnaPage.drawCircle({ x: nx, y: yd, size: 6.5, color: nd.color });
      dnaPage.drawText(nd.time, { x: nx - 14, y: yd + 12, size: 8.0, font: helveticaBold, color: nd.color });
      dnaPage.drawText(nd.label, { x: nx - 28, y: yd - 16, size: 7.3, font: helvetica, color: darkSlate });
    });

    yd -= 42;
    const kH = 66;
    dnaPage.drawRectangle({
      x: 36, y: yd - kH, width: dW - 72, height: kH,
      color: lightBg, borderColor: cardBorder, borderWidth: 1.0
    });
    dnaPage.drawText('3 GOLDEN KITCHEN RULES FOR DAILY MEAL SUCCESS:', {
      x: 48, y: yd - 18, size: 8.8, font: helveticaBold, color: navyPrimary
    });
    const kitchenReminders = '1. Hydration: Drink 2.5L water daily between meals  ·  2. Caffeine Cutoff: Strict zero caffeine past 12:00 PM\n3. Overnight Rest: Maintain a 12-hour metabolic rest between dinner (19:30) and breakfast (07:30-08:30).';
    drawWrappedBlock(dnaPage, kitchenReminders, {
      x: 48, y: yd - 33, size: 8.2, font: helvetica, color: darkSlate, maxWidth: dW - 96, lineHeight: 12.0, maxLines: 2
    });

    dnaPage.drawText('Page 3 of 11 · Your DNA in Plain English & Daily Blueprint · Atlas Health Services', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // =========================================================================
    // PAGE 4: DAILY FOOD TRAFFIC LIGHT & 24-HOUR SUPPLEMENT ROUTINE
    // =========================================================================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 Standard
    const { width: p1Width, height: p1Height } = page1.getSize();

    page1.drawRectangle({ x: 0, y: p1Height - 8, width: p1Width, height: 8, color: tealAccent });
    let y1 = p1Height - 28;

    page1.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: y1, size: 9.0, font: helveticaBold, color: navyPrimary
    });

    const badge1 = 'PAGE 4 OF 11 · FOOD TRAFFIC LIGHT & 24H ROUTINE';
    const badge1W = helveticaBold.widthOfTextAtSize(badge1, 7.2) + 16;
    page1.drawRectangle({
      x: p1Width - 36 - badge1W, y: y1 - 4, width: badge1W, height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 1.0
    });
    page1.drawText(badge1, {
      x: p1Width - 36 - badge1W + 8, y: y1 + 1, size: 7.2, font: helveticaBold, color: tealAccent
    });

    y1 -= 20;
    page1.drawText('DAILY FOOD TRAFFIC LIGHT & 24-HOUR ROUTINE', {
      x: 36, y: y1, size: 14.5, font: helveticaBold, color: darkSlate
    });
    y1 -= 14;
    page1.drawText('Quick food rules for everyday meals paired with your 4 simple morning-to-bedtime nutrient moments', {
      x: 36, y: y1, size: 8.8, font: helvetica, color: mutedSlate
    });
    y1 -= 12;
    page1.drawLine({ start: { x: 36, y: y1 }, end: { x: p1Width - 36, y: y1 }, thickness: 1.0, color: cardBorder });

    // SECTION 1: DAILY FOOD TRAFFIC LIGHT (SPACIOUS 3 COLUMNS)
    y1 -= 20;
    page1.drawText('1. DAILY FOOD TRAFFIC LIGHT (QUICK SUMMARY · ALL 17 FAMILIES ON PAGES 6-7)', {
      x: 36, y: y1, size: 10.5, font: helveticaBold, color: navyPrimary
    });

    y1 -= 12;
    const trafficCols = [
      {
        badge: 'GREEN · EAT FREELY',
        subtitle: 'Daily DNA Superfoods (Unlimited)',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        badgeBorder: gcpGreenBorder,
        accentColor: gcpGreen,
        items: [
          'Arugula, spinach, broccoli & asparagus',
          'Wild salmon, sardines, cod & shellfish',
          'Pasture eggs & organic chicken/turkey',
          'Blueberries, blackberries & avocado',
          'Extra virgin olive oil, walnuts & almonds',
          'Goat/sheep kefir & feta (A2 lactose-safe)'
        ]
      },
      {
        badge: 'AMBER · MODERATE / RULE',
        subtitle: '1-2x/Week or Portion Rule',
        badgeColor: gcpAmber,
        badgeBg: gcpAmberBg,
        badgeBorder: gcpAmberBorder,
        accentColor: gcpAmber,
        items: [
          'Quinoa, buckwheat & red lentils (1/2 cup)',
          'Cooled basmati rice or sweet potato (eat LAST)',
          'Rye sourdough bread (max 1 slice at lunch)',
          'Grass-fed beef or lamb (max 2x per week)',
          'Morning black coffee (strictly before 11 AM)',
          'Raw Sidr honey (max 1/2 tsp pre-workout)'
        ]
      },
      {
        badge: 'RED · AVOID STRICTLY',
        subtitle: 'Conflicts with Your Genes',
        badgeColor: gcpRed,
        badgeBg: gcpRedBg,
        badgeBorder: gcpRedBorder,
        accentColor: gcpRed,
        items: [
          'White flour & cereals with synthetic folic acid',
          'Synthetic Vitamin E supplement pills',
          'Cow milk, cream & unfermented soft cheese',
          'Seed oils (sunflower, corn, soy, canola)',
          'Sugary drinks, juices & artificial sweeteners',
          'Afternoon coffee (after 11 AM) & alcohol'
        ]
      }
    ];

    const colW = (p1Width - 72 - 16) / 3;
    let maxColContentH = 0;
    trafficCols.forEach((tc) => {
      let colH = 54;
      tc.items.forEach((it) => {
        const wrapped = getWrappedLines(it, helvetica, 7.9, colW - 24);
        colH += wrapped.length * 10.6 + 8.0;
      });
      if (colH > maxColContentH) maxColContentH = colH;
    });
    const cH = Math.max(250, maxColContentH + 16);

    trafficCols.forEach((tc, cIdx) => {
      const cX = 36 + cIdx * (colW + 8);

      page1.drawRectangle({
        x: cX, y: y1 - cH, width: colW, height: cH,
        color: white, borderColor: gcpBorder, borderWidth: 1.0
      });
      page1.drawRectangle({ x: cX, y: y1 - 4, width: colW, height: 4, color: tc.accentColor });
      page1.drawRectangle({ x: cX + 1, y: y1 - 42, width: colW - 2, height: 38, color: rgb(250 / 255, 251 / 255, 252 / 255) });

      const bW = helveticaBold.widthOfTextAtSize(tc.badge, 6.6) + 12;
      page1.drawRectangle({
        x: cX + 10, y: y1 - 21, width: bW, height: 14,
        color: tc.badgeBg, borderColor: tc.badgeBorder, borderWidth: 0.8
      });
      page1.drawText(tc.badge, {
        x: cX + 16, y: y1 - 17, size: 6.6, font: helveticaBold, color: tc.badgeColor
      });

      page1.drawText(tc.subtitle, {
        x: cX + 10, y: y1 - 35, size: 7.4, font: helveticaBold, color: darkSlate, maxWidth: colW - 20
      });

      page1.drawLine({ start: { x: cX, y: y1 - 42 }, end: { x: cX + colW, y: y1 - 42 }, thickness: 0.8, color: gcpBorder });

      let iY = y1 - 58;
      tc.items.forEach((it) => {
        page1.drawText('•', { x: cX + 10, y: iY, size: 8.2, font: helveticaBold, color: tc.accentColor });
        iY = drawWrappedBlock(page1, it, {
          x: cX + 20, y: iY, size: 7.9, font: helvetica, color: darkSlate,
          maxWidth: colW - 28, lineHeight: 10.6, maxLines: 2
        });
        iY -= 8.0;
      });
    });

    y1 -= (cH + 26);

    // SECTION 2: 24-HOUR DAILY ROUTINE WITH YOUR MEALS (4 SPACIOUS CARDS)
    page1.drawText('2. YOUR 24-HOUR DAILY ROUTINE (MEALS & 3 SIMPLE SUPPLEMENT MOMENTS)', {
      x: 36, y: y1, size: 10.5, font: helveticaBold, color: navyPrimary
    });

    y1 -= 12;
    const dailySteps = [
      {
        time: '1 · UPON WAKING (07:30)',
        meal: 'On an Empty Stomach',
        step: 'Morning Gut Probiotic',
        action: 'Drink 1 glass of water + take Nutrient [5] (Probiotic in vegetable capsule).',
        why: 'Reaches your gut alive before stomach acid rises.'
      },
      {
        time: '2 · BREAKFAST (08:30)',
        meal: 'With Savory Breakfast',
        step: 'Active Folate + Vit D3/K2',
        action: 'Take Nutrients [1]+[2] (+[4]) with eggs, avocado or olive oil.',
        why: 'Healthy fats unlock 100% absorption of Vitamin D3 & K2.'
      },
      {
        time: '3 · LUNCH & DINNER',
        meal: 'Main Meals (13:30 / 19:30)',
        step: '1-2-3 Plate Sequence',
        action: 'Eat Veggies first -> Protein second -> Small complex carb last.',
        why: 'Prevents post-lunch sleepiness and stops evening cravings.'
      },
      {
        time: '4 · BEDTIME (22:00)',
        meal: '45 Min Before Sleep',
        step: 'Nighttime Magnesium',
        action: 'Take Nutrient [3] (Chelated Magnesium) + warm chamomile tea.',
        why: 'Relaxes muscles and nervous system for deep sleep.'
      }
    ];

    const stepW = (p1Width - 72 - 24) / 4;
    const sH = 216;

    dailySteps.forEach((st, sIdx) => {
      const sX = 36 + sIdx * (stepW + 8);

      page1.drawRectangle({
        x: sX, y: y1 - sH, width: stepW, height: sH,
        color: lightBg, borderColor: cardBorder, borderWidth: 1.0
      });
      page1.drawRectangle({
        x: sX, y: y1 - 26, width: stepW, height: 26,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page1.drawText(st.time, {
        x: sX + 8, y: y1 - 16, size: 7.0, font: helveticaBold, color: tealAccent, maxWidth: stepW - 16
      });
      page1.drawText(st.meal, {
        x: sX + 8, y: y1 - 42, size: 7.4, font: helveticaOblique, color: mutedSlate, maxWidth: stepW - 16
      });
      drawWrappedBlock(page1, st.step, {
        x: sX + 8, y: y1 - 58, size: 8.6, font: helveticaBold, color: navyPrimary,
        maxWidth: stepW - 16, lineHeight: 11.0, maxLines: 2
      });
      drawWrappedBlock(page1, st.action, {
        x: sX + 8, y: y1 - 88, size: 7.8, font: helvetica, color: darkSlate,
        maxWidth: stepW - 16, lineHeight: 10.6, maxLines: 5
      });

      page1.drawLine({
        start: { x: sX + 8, y: y1 - 152 }, end: { x: sX + stepW - 8, y: y1 - 152 },
        thickness: 0.7, color: cardBorder
      });
      drawWrappedBlock(page1, `Why it helps: ${st.why}`, {
        x: sX + 8, y: y1 - 166, size: 7.4, font: helveticaOblique, color: mutedSlate,
        maxWidth: stepW - 16, lineHeight: 10.0, maxLines: 4
      });
    });

    // QR Code for Digital Interactive Portal
    const portalBaseUrl = 'https://www.atlashealth-services.com/patient/dna-report';
    const portalUrl = `${portalBaseUrl}?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleId)}`;
    let qrImage = null;
    try {
      const qrBuffer = await QRCode.toBuffer(portalUrl, {
        type: 'png',
        margin: 1,
        width: 130,
        color: { dark: '#003666', light: '#ffffff' }
      });
      qrImage = await pdfDoc.embedPng(qrBuffer);
    } catch (e) {
      console.warn('QR Code generation skipped:', e.message);
    }

    page1.drawText('Page 4 of 11 · Daily Food Traffic Light & 24-Hour Routine · Atlas Health Services · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    if (qrImage) {
      page1.drawImage(qrImage, { x: p1Width - 36 - 32, y: 8, width: 30, height: 30 });
      page1.drawText('Digital Portal', { x: p1Width - 36 - 88, y: 21, size: 5.8, font: helveticaBold, color: navyPrimary });
      page1.drawText('Scan to view online ->', { x: p1Width - 36 - 88, y: 13, size: 5.4, font: helvetica, color: mutedSlate });
    }

    // =========================================================================
    // PAGES 5 & 6: 7-DAY PRECISION MEAL PLAN (MON-THU & FRI-SUN)
    // Spacious 2-page split with 8.0pt typography & Ancestry × DNA tags
    // =========================================================================
    const dayAncestryTags = [
      'MENA Heritage · A2 Dairy',
      'Nile / Med · 1-2-3 Plate',
      'mtDNA H13a · Polyphenols',
      'Solar VDR · Healthy Fats',
      'IRS1 Glucose Control',
      'MC4R Satiety Protein',
      'Circadian Gut Reset'
    ];

    // PAGE 5: DAYS 1 TO 4 (MONDAY TO THURSDAY)
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();
    page2.drawRectangle({ x: 0, y: p2Height - 8, width: p2Width, height: 8, color: tealAccent });

    let y2 = p2Height - 28;
    page2.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: y2, size: 9.0, font: helveticaBold, color: navyPrimary
    });
    const badge2 = 'PAGE 5 OF 11 · 7-DAY MEAL PLAN (MON-THU)';
    const badge2W = helveticaBold.widthOfTextAtSize(badge2, 7.2) + 16;
    page2.drawRectangle({
      x: p2Width - 36 - badge2W, y: y2 - 4, width: badge2W, height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 1.0
    });
    page2.drawText(badge2, {
      x: p2Width - 36 - badge2W + 8, y: y2 + 1, size: 7.2, font: helveticaBold, color: tealAccent
    });

    y2 -= 20;
    page2.drawText('7-DAY NUTRIGENOMIC MEAL PLAN · PART 1 (MON TO THU)', {
      x: 36, y: y2, size: 14.0, font: helveticaBold, color: darkSlate
    });
    y2 -= 14;
    page2.drawText('Precision culinary formulation using green-light foods & ancestral heritage · Sourced for Qatar & GCC', {
      x: 36, y: y2, size: 8.5, font: helvetica, color: mutedSlate
    });
    y2 -= 10;
    page2.drawLine({ start: { x: 36, y: y2 }, end: { x: p2Width - 36, y: y2 }, thickness: 1.0, color: cardBorder });

    y2 -= 18;
    const planColW = (p2Width - 72 - 14) / 2;
    const dayBoxH = 304;

    const renderDayCard = (targetPage, d, dX, dY, cardW, cardH, ancTag) => {
      targetPage.drawRectangle({
        x: dX, y: dY, width: cardW, height: cardH,
        color: lightBg, borderColor: cardBorder, borderWidth: 1.0
      });
      targetPage.drawRectangle({
        x: dX, y: dY + cardH - 36, width: cardW, height: 36,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      targetPage.drawText(`DAY ${d.day} | ${d.dayName.toUpperCase()}`, {
        x: dX + 10, y: dY + cardH - 15, size: 8.6, font: helveticaBold, color: navyPrimary
      });

      // Ancestry × DNA tag pill on top right
      const tagW = helveticaBold.widthOfTextAtSize(ancTag, 6.2) + 12;
      targetPage.drawRectangle({
        x: dX + cardW - 10 - tagW, y: dY + cardH - 19, width: tagW, height: 13,
        color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 0.7
      });
      targetPage.drawText(ancTag, {
        x: dX + cardW - 10 - tagW + 6, y: dY + cardH - 15, size: 6.2, font: helveticaBold, color: tealAccent
      });

      targetPage.drawText(d.themeEn, {
        x: dX + 10, y: dY + cardH - 29, size: 7.2, font: helveticaBold, color: tealAccent, maxWidth: cardW - 20
      });

      let mealY = dY + cardH - 52;
      const mealBlocks = [
        { label: 'BREAKFAST', text: d.breakfast, maxLines: 4 },
        { label: 'LUNCH (1-2-3 PLATE SEQUENCING)', text: d.lunch, maxLines: 5 },
        { label: 'DINNER', text: d.dinner, maxLines: 4 }
      ];
      mealBlocks.forEach((mb) => {
        targetPage.drawText(mb.label, {
          x: dX + 10, y: mealY, size: 6.8, font: helveticaBold, color: mutedSlate
        });
        mealY -= 11;
        mealY = drawWrappedBlock(targetPage, mb.text, {
          x: dX + 10, y: mealY, size: 7.9, font: helvetica, color: darkSlate,
          maxWidth: cardW - 20, lineHeight: 10.6, maxLines: mb.maxLines
        });
        mealY -= 10;
      });
    };

    plan.sevenDayMealPlan.slice(0, 4).forEach((d, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const dX = 36 + col * (planColW + 14);
      const dY = y2 - (row * (dayBoxH + 14)) - dayBoxH;
      renderDayCard(page2, d, dX, dY, planColW, dayBoxH, dayAncestryTags[idx] || 'DNA + Heritage');
    });

    page2.drawText('Page 5 of 11 · Atlas Health Services · Precision 7-Day Meal Plan (Mon-Thu) · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // PAGE 6: DAYS 5 TO 7 (FRIDAY TO SUNDAY) + KITCHEN PREP NOTE
    const page2b = pdfDoc.addPage([595.28, 841.89]);
    page2b.drawRectangle({ x: 0, y: p2Height - 8, width: p2Width, height: 8, color: tealAccent });

    let y2b = p2Height - 28;
    page2b.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: y2b, size: 9.0, font: helveticaBold, color: navyPrimary
    });
    const badge2b = 'PAGE 6 OF 11 · 7-DAY MEAL PLAN (FRI-SUN)';
    const badge2bW = helveticaBold.widthOfTextAtSize(badge2b, 7.2) + 16;
    page2b.drawRectangle({
      x: p2Width - 36 - badge2bW, y: y2b - 4, width: badge2bW, height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 1.0
    });
    page2b.drawText(badge2b, {
      x: p2Width - 36 - badge2bW + 8, y: y2b + 1, size: 7.2, font: helveticaBold, color: tealAccent
    });

    y2b -= 20;
    page2b.drawText('7-DAY NUTRIGENOMIC MEAL PLAN · PART 2 (FRI TO SUN)', {
      x: 36, y: y2b, size: 14.0, font: helveticaBold, color: darkSlate
    });
    y2b -= 14;
    page2b.drawText('Weekend meals, A2 dairy comfort, and Sunday circadian gut reset', {
      x: 36, y: y2b, size: 8.5, font: helvetica, color: mutedSlate
    });
    y2b -= 10;
    page2b.drawLine({ start: { x: 36, y: y2b }, end: { x: p2Width - 36, y: y2b }, thickness: 1.0, color: cardBorder });

    y2b -= 18;
    plan.sevenDayMealPlan.slice(4, 6).forEach((d, idx) => {
      const dX = 36 + idx * (planColW + 14);
      const dY = y2b - dayBoxH;
      renderDayCard(page2b, d, dX, dY, planColW, dayBoxH, dayAncestryTags[4 + idx] || 'DNA + Heritage');
    });

    y2b -= (dayBoxH + 18);

    const d7 = plan.sevenDayMealPlan[6] || {
      day: 7,
      dayName: 'Sunday',
      themeEn: 'Circadian Fasting & Gastrointestinal Rest',
      breakfast: 'Fasting friendly morning: Filtered water with Celtic salt, then 2 soft-boiled eggs with arugula.',
      lunch: 'Plate Sequencing: Massaged kale salad -> 180g wild tuna steak -> 1/3 cup brown rice.',
      dinner: 'Mineral-rich vegetable broth with poached cod fillet and steamed zucchini.'
    };
    const d7H = 196;

    page2b.drawRectangle({
      x: 36, y: y2b - d7H, width: p2Width - 72, height: d7H,
      color: lightBg, borderColor: cardBorder, borderWidth: 1.0
    });
    page2b.drawRectangle({
      x: 36, y: y2b - 32, width: p2Width - 72, height: 32,
      color: rgb(241 / 255, 245 / 255, 249 / 255)
    });
    page2b.drawText('DAY 7 | SUNDAY: CIRCADIAN FASTING & DEEP GASTROINTESTINAL REST', {
      x: 48, y: y2b - 20, size: 9.0, font: helveticaBold, color: navyPrimary
    });
    const sunTag = dayAncestryTags[6];
    const sunTagW = helveticaBold.widthOfTextAtSize(sunTag, 6.6) + 12;
    page2b.drawRectangle({
      x: p2Width - 48 - sunTagW, y: y2b - 23, width: sunTagW, height: 15,
      color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 0.8
    });
    page2b.drawText(sunTag, {
      x: p2Width - 48 - sunTagW + 6, y: y2b - 18, size: 6.6, font: helveticaBold, color: tealAccent
    });

    const d7ColW = (p2Width - 72 - 40) / 3;
    const d7Meals = [
      { label: 'BREAKFAST (GENTLE AWAKENING)', desc: d7.breakfast },
      { label: 'LUNCH (METABOLIC NOURISHMENT)', desc: d7.lunch },
      { label: 'DINNER (CELLULAR REST)', desc: d7.dinner }
    ];

    d7Meals.forEach((m, mIdx) => {
      const colX = 48 + mIdx * (d7ColW + 14);
      const colTopY = y2b - 48;
      page2b.drawText(m.label, { x: colX, y: colTopY, size: 7.0, font: helveticaBold, color: mutedSlate });
      drawWrappedBlock(page2b, m.desc, {
        x: colX, y: colTopY - 14, size: 8.0, font: helvetica, color: darkSlate,
        maxWidth: d7ColW, lineHeight: 10.8, maxLines: 7
      });
    });

    y2b -= (d7H + 16);
    page2b.drawRectangle({
      x: 36, y: y2b - 58, width: p2Width - 72, height: 58,
      color: rgb(232 / 255, 240 / 255, 254 / 255), borderColor: rgb(191 / 255, 219 / 255, 254 / 255), borderWidth: 1.0
    });
    page2b.drawText('CHEF & CATERING PREP NOTE:', { x: 48, y: y2b - 18, size: 8.2, font: helveticaBold, color: navyPrimary });
    drawWrappedBlock(page2b, 'Cook exclusively with Extra Virgin Olive Oil (EVOO) or grass-fed ghee. Use A2 goat/sheep dairy only (never cow milk). Serve salad first, protein second, and grains last.', {
      x: 48, y: y2b - 32, size: 7.8, font: helvetica, color: darkSlate, maxWidth: p2Width - 96, lineHeight: 10.6, maxLines: 2
    });

    page2b.drawText('Page 6 of 11 · Atlas Health Services · Precision 7-Day Meal Plan (Fri-Sun) · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // =========================================================================
    // PAGES 6 & 7: COMPLETE 17-FAMILY FOOD MATRIX (SPACIOUS 2-PAGE SPLIT)
    // Covers 100% of the 4 Official Macro-Groups & 17 Sub-Families (116 Foods)
    // =========================================================================
    const allMatrixRows = plan.fagron17SubfamilyMatrix || [];
    const splitIdx = Math.ceil(allMatrixRows.length / 2); // 9 on Page 6, 8 on Page 7
    const matrixChunks = [
      {
        rows: allMatrixRows.slice(0, splitIdx),
        badge: 'PAGE 7 OF 11 · FOOD LIST (PART 1 OF 2)',
        title: 'COMPLETE PERSONALIZED FOOD LIST · CARBO+ & PROTEIN+',
        subtitle: `Families 1-${splitIdx} of ${allMatrixRows.length}: Whole grains, vegetables, fruits, fish, poultry & dairy tailored to your DNA`,
        rowH: 68,
        includeSwaps: false,
        footer: 'Page 7 of 11 · Complete 17-Family Personalized Food Matrix (Part 1 of 2) · Atlas Health Services'
      },
      {
        rows: allMatrixRows.slice(splitIdx),
        badge: 'PAGE 8 OF 11 · FOOD LIST (PART 2 OF 2)',
        title: 'COMPLETE PERSONALIZED FOOD LIST · LIPID+, EXTRAS & SWAPS',
        subtitle: `Families ${splitIdx + 1}-${allMatrixRows.length} of ${allMatrixRows.length}: Healthy fats, nuts, beverages, herbs & 4 essential kitchen swaps`,
        rowH: 60,
        includeSwaps: true,
        footer: 'Page 8 of 11 · Complete 17-Family Personalized Food Matrix (Part 2 of 2) · Atlas Health Services'
      }
    ];

    matrixChunks.forEach((chunk) => {
      const pageGrocery = pdfDoc.addPage([595.28, 841.89]);
      const { width: pgWidth, height: pgHeight } = pageGrocery.getSize();

      pageGrocery.drawRectangle({ x: 0, y: pgHeight - 8, width: pgWidth, height: 8, color: tealAccent });
      let yg = pgHeight - 28;

      pageGrocery.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
        x: 36, y: yg, size: 8.8, font: helveticaBold, color: navyPrimary
      });

      const badgeGW = helveticaBold.widthOfTextAtSize(chunk.badge, 7.0) + 14;
      pageGrocery.drawRectangle({
        x: pgWidth - 36 - badgeGW, y: yg - 3, width: badgeGW, height: 17,
        color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 1.0
      });
      pageGrocery.drawText(chunk.badge, {
        x: pgWidth - 36 - badgeGW + 7, y: yg + 2, size: 7.0, font: helveticaBold, color: tealAccent
      });

      yg -= 18;
      pageGrocery.drawText(chunk.title, {
        x: 36, y: yg, size: 13.5, font: helveticaBold, color: darkSlate
      });

      yg -= 13;
      pageGrocery.drawText(chunk.subtitle, {
        x: 36, y: yg, size: 8.2, font: helvetica, color: mutedSlate
      });

      yg -= 10;
      pageGrocery.drawLine({ start: { x: 36, y: yg }, end: { x: pgWidth - 36, y: yg }, thickness: 1.0, color: cardBorder });

      yg -= 10;
      const tableW = pgWidth - 72;
      const col1W = 112;
      const col2W = 148;
      const col3W = 136;
      const col4W = tableW - col1W - col2W - col3W;
      const col1X = 36;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;

      const thH = 22;
      const headers = [
        { x: col1X, w: col1W, color: navyPrimary, label: 'FOOD FAMILY' },
        { x: col2X, w: col2W, color: gcpGreen, label: 'GREEN · EAT FREELY' },
        { x: col3X, w: col3W, color: gcpAmber, label: 'AMBER · MODERATE / RULE' },
        { x: col4X, w: col4W, color: gcpRed, label: 'RED · AVOID STRICTLY' }
      ];
      headers.forEach((hd) => {
        pageGrocery.drawRectangle({ x: hd.x, y: yg - thH, width: hd.w, height: thH, color: hd.color });
        pageGrocery.drawText(hd.label, { x: hd.x + 6, y: yg - 14, size: 6.8, font: helveticaBold, color: white });
      });

      yg -= thH;
      const rowH = chunk.rowH;

      chunk.rows.forEach((sub, rIdx) => {
        const rY = yg - rowH;
        const isEven = rIdx % 2 === 0;

        pageGrocery.drawRectangle({ x: col1X, y: rY, width: col1W, height: rowH, color: isEven ? rgb(248 / 255, 250 / 255, 252 / 255) : white, borderColor: cardBorder, borderWidth: 0.6 });
        pageGrocery.drawRectangle({ x: col2X, y: rY, width: col2W, height: rowH, color: isEven ? rgb(244 / 255, 253 / 255, 247 / 255) : white, borderColor: cardBorder, borderWidth: 0.6 });
        pageGrocery.drawRectangle({ x: col3X, y: rY, width: col3W, height: rowH, color: isEven ? rgb(255 / 255, 252 / 255, 240 / 255) : white, borderColor: cardBorder, borderWidth: 0.6 });
        pageGrocery.drawRectangle({ x: col4X, y: rY, width: col4W, height: rowH, color: isEven ? rgb(254 / 255, 246 / 255, 246 / 255) : white, borderColor: cardBorder, borderWidth: 0.6 });

        const grpColor =
          sub.group === 'CARBO+' ? tealAccent :
          sub.group === 'PROTEIN+' ? googleBlue :
          sub.group === 'LIPID+' ? gcpAmber : navyPrimary;

        pageGrocery.drawText(`${sub.group} · ${sub.code}`, {
          x: col1X + 6, y: rY + rowH - 13, size: 6.4, font: helveticaBold, color: grpColor
        });

        const cleanSubName = sub.labelEn.replace(/^\d+\.\d+\.\d+\s*/, '');
        drawWrappedBlock(pageGrocery, cleanSubName, {
          x: col1X + 6, y: rY + rowH - 25, size: 7.4, font: helveticaBold, color: darkSlate,
          maxWidth: col1W - 12, lineHeight: 9.4, maxLines: 3
        });

        drawWrappedBlock(pageGrocery, sub.greenSummaryEn, {
          x: col2X + 6, y: rY + rowH - 13, size: 7.1, font: helvetica, color: darkSlate,
          maxWidth: col2W - 12, lineHeight: 9.2, maxLines: 5
        });

        drawWrappedBlock(pageGrocery, sub.yellowSummaryEn, {
          x: col3X + 6, y: rY + rowH - 13, size: 7.1, font: helvetica, color: darkSlate,
          maxWidth: col3W - 12, lineHeight: 9.2, maxLines: 5
        });

        drawWrappedBlock(pageGrocery, sub.redSummaryEn, {
          x: col4X + 6, y: rY + rowH - 13, size: 7.1, font: helvetica, color: redText,
          maxWidth: col4W - 12, lineHeight: 9.2, maxLines: 5
        });

        yg -= rowH;
      });

      if (chunk.includeSwaps) {
        yg -= 14;
        const swapBoxH = 110;
        pageGrocery.drawRectangle({
          x: 36, y: yg - swapBoxH, width: pgWidth - 72, height: swapBoxH,
          color: lightBg, borderColor: cardBorder, borderWidth: 1.0
        });
        pageGrocery.drawText('4 ESSENTIAL KITCHEN SWAPS FOR YOUR GENES (REMOVE -> REPLACE):', {
          x: 48, y: yg - 18, size: 8.6, font: helveticaBold, color: navyPrimary
        });

        const quickSwaps = [
          '1. Cooking Oils: Replace sunflower/corn/canola oil -> with Cold-Pressed Extra Virgin Olive Oil (EVOO) or Ghee.',
          '2. Bread & Grains: Replace white bread & fortified cereals -> with quinoa, buckwheat, lentils or 1 slice rye sourdough.',
          '3. Dairy (MCM6): Replace cow milk & soft cream cheese -> with fermented goat/sheep kefir, sheep feta or almond milk.',
          '4. Drinks (ADORA2A): Replace afternoon coffee & sodas -> with morning matcha (before 11 AM), sparkling water & chamomile.'
        ];

        const swColW = (pgWidth - 72 - 36) / 2;
        quickSwaps.forEach((sw, sIdx) => {
          const sCol = sIdx % 2;
          const sRow = Math.floor(sIdx / 2);
          drawWrappedBlock(pageGrocery, sw, {
            x: 48 + sCol * (swColW + 14),
            y: yg - 36 - sRow * 34,
            size: 7.6,
            font: helvetica,
            color: darkSlate,
            maxWidth: swColW,
            lineHeight: 10.2,
            maxLines: 3
          });
        });
      }

      pageGrocery.drawText(chunk.footer, {
        x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
      });
    });

    // =========================================================================
    // PAGE 8: YOUR 5 TARGETED NUTRIENTS EXPLAINED SIMPLY
    // =========================================================================
    const suppPage1 = pdfDoc.addPage([595.28, 841.89]);
    const { width: sp1Width, height: sp1Height } = suppPage1.getSize();

    suppPage1.drawRectangle({ x: 0, y: sp1Height - 8, width: sp1Width, height: 8, color: navyPrimary });
    let ys1 = sp1Height - 28;

    suppPage1.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: ys1, size: 8.8, font: helveticaBold, color: navyPrimary
    });

    const badge8 = 'PAGE 9 OF 11 · YOUR 5 TARGETED NUTRIENTS';
    const badge8W = helveticaBold.widthOfTextAtSize(badge8, 7.0) + 14;
    suppPage1.drawRectangle({
      x: sp1Width - 36 - badge8W, y: ys1 - 3, width: badge8W, height: 17,
      color: rgb(239 / 255, 246 / 255, 255 / 255), borderColor: navyPrimary, borderWidth: 1.0
    });
    suppPage1.drawText(badge8, {
      x: sp1Width - 36 - badge8W + 7, y: ys1 + 2, size: 7.0, font: helveticaBold, color: navyPrimary
    });

    ys1 -= 18;
    suppPage1.drawText('YOUR 5 TARGETED NUTRIENTS EXPLAINED SIMPLY', {
      x: 36, y: ys1, size: 14.0, font: helveticaBold, color: darkSlate
    });

    ys1 -= 13;
    suppPage1.drawText('Food comes first. These 5 targeted nutrients fill the exact gaps identified in your Ancestry + Nutrition DNA.', {
      x: 36, y: ys1, size: 8.4, font: helvetica, color: mutedSlate
    });

    ys1 -= 10;
    suppPage1.drawLine({ start: { x: 36, y: ys1 }, end: { x: sp1Width - 36, y: ys1 }, thickness: 1.0, color: cardBorder });

    // SECTION 1: THE 5 SUPPLEMENTS EXPLAINED BY BENEFIT (SPACIOUS 112pt CARDS)
    ys1 -= 20;
    suppPage1.drawText('1. WHAT EACH NUTRIENT DOES FOR YOUR BODY (PLAIN LANGUAGE)', {
      x: 36, y: ys1, size: 10.5, font: helveticaBold, color: navyPrimary
    });

    const humanSupplements = [
      {
        benefit: '[1] IMMUNITY & BONE STRENGTH',
        nutrient: 'Vitamin D3 + K2 (MK-7)',
        ancTag: 'Solar Latitude · VDR',
        why: 'Your Vitamin D receptors work slower (VDR gene) and your solar latitude heritage increases indoor demand. This pair directs calcium safely into bones and supports immunity.',
        timing: 'Dose 2 (Breakfast): Take with breakfast containing healthy fats (eggs, olive oil, or avocado).',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[2] ACTIVE VITAMINS & VITALITY',
        nutrient: 'Active Natural Folate (L-5-MTHF)',
        ancTag: 'mtDNA H13a · MTHFR',
        why: 'Your body uses only 30% of common synthetic folic acid (MTHFR gene). Active Folate gives clean cellular energy directly without synthetic buildup.',
        timing: 'Dose 2 (Breakfast): Take in the morning with your breakfast.',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[3] DEEP SLEEP & MUSCLE RECOVERY',
        nutrient: 'Magnesium Bisglycinate + L-Theanine',
        ancTag: 'Circadian Stress · COMT',
        why: 'Calms evening nerve tension, relaxes muscles after exercise, and helps you fall into deep restorative sleep.',
        timing: 'Dose 3 (Bedtime): Take 2 capsules 30-60 min before sleep with water.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[4] METABOLISM & MENTAL FOCUS',
        nutrient: 'Active B-Complex (Methyl-B12 + Active B6)',
        ancTag: 'Oxidative Heritage · SOD2',
        why: 'Works alongside Active Folate to clear homocysteine, protect nerves, and keep daytime energy steady.',
        timing: 'Dose 2 (Breakfast): Take in the morning with breakfast.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[5] GUT COMFORT & DAIRY SHIELD',
        nutrient: 'Probiotics in Acid-Resistant Vegetable Capsule',
        ancTag: 'MENA Heritage · LCT/MCM6',
        why: 'Live beneficial bacteria (LGG + BB-12) protected in a delayed-release vegetable capsule to prevent bloating and sensitivity.',
        timing: 'Dose 1 (Upon Waking): Take 15-30 min before breakfast on an empty stomach with water.',
        priority: 'PRIORITY 3 · OPTIONAL',
        pColor: amberText,
        pBg: amberBg
      }
    ];

    ys1 -= 12;
    humanSupplements.forEach((s) => {
      const cardH = 112;
      ys1 -= cardH;

      suppPage1.drawRectangle({
        x: 36, y: ys1, width: sp1Width - 72, height: cardH,
        color: white, borderColor: cardBorder, borderWidth: 1.0
      });
      suppPage1.drawRectangle({ x: 36, y: ys1, width: 5, height: cardH, color: s.pColor });
      suppPage1.drawRectangle({
        x: 41, y: ys1 + cardH - 28, width: sp1Width - 77, height: 28,
        color: rgb(248 / 255, 250 / 255, 252 / 255)
      });

      suppPage1.drawText(s.benefit, {
        x: 50, y: ys1 + cardH - 18, size: 8.8, font: helveticaBold, color: navyPrimary
      });
      suppPage1.drawText(`· ${s.nutrient}`, {
        x: 50 + helveticaBold.widthOfTextAtSize(s.benefit, 8.8) + 6,
        y: ys1 + cardH - 18, size: 8.4, font: helveticaBold, color: tealAccent
      });

      const pillW = helveticaBold.widthOfTextAtSize(s.priority, 6.4) + 12;
      suppPage1.drawRectangle({
        x: sp1Width - 46 - pillW, y: ys1 + cardH - 21, width: pillW, height: 14,
        color: s.pBg, borderColor: s.pColor, borderWidth: 0.8
      });
      suppPage1.drawText(s.priority, {
        x: sp1Width - 46 - pillW + 6, y: ys1 + cardH - 17, size: 6.4, font: helveticaBold, color: s.pColor
      });

      drawWrappedBlock(suppPage1, `Why it helps you: ${s.why}`, {
        x: 50, y: ys1 + cardH - 44, size: 8.1, font: helvetica, color: darkSlate,
        maxWidth: sp1Width - 102, lineHeight: 11.4, maxLines: 3
      });

      suppPage1.drawLine({
        start: { x: 50, y: ys1 + 28 }, end: { x: sp1Width - 48, y: ys1 + 28 },
        thickness: 0.6, color: cardBorder
      });
      suppPage1.drawText(`When to take: ${s.timing}`, {
        x: 50, y: ys1 + 12, size: 7.5, font: helveticaBold, color: tealAccent
      });
      if (s.ancTag) {
        const ancTagW = helveticaBold.widthOfTextAtSize(s.ancTag, 6.4) + 10;
        suppPage1.drawRectangle({
          x: sp1Width - 48 - ancTagW, y: ys1 + 8, width: ancTagW, height: 14,
          color: rgb(240 / 255, 253 / 255, 250 / 255), borderColor: tealAccent, borderWidth: 0.7
        });
        suppPage1.drawText(s.ancTag, {
          x: sp1Width - 48 - ancTagW + 5, y: ys1 + 12, size: 6.4, font: helveticaBold, color: tealAccent
        });
      }

      ys1 -= 12;
    });

    suppPage1.drawText('Page 9 of 11 · Your 5 Targeted Nutrients Explained Simply · Atlas Health Services · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // =========================================================================
    // PAGE 10: CHOOSE YOUR PACK & DISPENSING OPTIONS
    // =========================================================================
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p3Width, height: p3Height } = page3.getSize();

    page3.drawRectangle({ x: 0, y: p3Height - 8, width: p3Width, height: 8, color: navyPrimary });
    let y3 = p3Height - 28;

    page3.drawText('ATLAS HEALTH SERVICES · PRECISION NUTRITION PLATFORM', {
      x: 36, y: y3, size: 8.8, font: helveticaBold, color: navyPrimary
    });

    const badge3 = 'PAGE 10 OF 11 · PACKS & DISPENSING OPTIONS';
    const badge3W = helveticaBold.widthOfTextAtSize(badge3, 7.0) + 14;
    page3.drawRectangle({
      x: p3Width - 36 - badge3W, y: y3 - 3, width: badge3W, height: 17,
      color: rgb(239 / 255, 246 / 255, 255 / 255), borderColor: navyPrimary, borderWidth: 1.0
    });
    page3.drawText(badge3, {
      x: p3Width - 36 - badge3W + 7, y: y3 + 2, size: 7.0, font: helveticaBold, color: navyPrimary
    });

    y3 -= 18;
    page3.drawText('CHOOSE YOUR PACK & PHARMACY DISPENSING OPTIONS', {
      x: 36, y: y3, size: 14.0, font: helveticaBold, color: darkSlate
    });

    y3 -= 13;
    page3.drawText('Pick Pack 1, 2, or 3 based on your goals, then choose either Local Pharmacy (Option A) or 3 Daily Capsules (Option B)', {
      x: 36, y: y3, size: 8.2, font: helvetica, color: mutedSlate
    });

    y3 -= 10;
    page3.drawLine({ start: { x: 36, y: y3 }, end: { x: p3Width - 36, y: y3 }, thickness: 1.0, color: cardBorder });

    y3 -= 12;

    // -------------------------------------------------------------------------
    // SECTION 2: CHOOSE YOUR LEVEL (3 SIMPLE DECISION PACKS - ZERO OVERLAP)
    // -------------------------------------------------------------------------
    y3 -= 7;
    page3.drawText('2. CHOOSE YOUR LEVEL: 3 SIMPLE DECISION PACKS (BUY ONLY WHAT YOU NEED)', {
      x: 36,
      y: y3,
      size: 10.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y3 -= 14;
    const pkW = (p3Width - 72 - 16) / 3;
    const packs = [
      {
        badge: 'ESSENTIAL · BASELINE',
        badgeColor: mutedSlate,
        badgeBg: gcpPillBg,
        badgeBorder: gcpBorder,
        name: 'PACK 1 · ESSENTIAL CORE',
        subtitle: '2 Nutrients · Core DNA Support',
        items: [
          '• [1] Vitamin D3 + K2 (MK-7)',
          '• [2] Active Folate (L-5-MTHF)'
        ],
        note: 'Covers 80% of core DNA needs.',
        isFeatured: false
      },
      {
        badge: 'RECOMMENDED · POPULAR',
        badgeColor: googleBlue,
        badgeBg: googleBlueBg,
        badgeBorder: googleBlueBorder,
        name: 'PACK 2 · ENERGY & DEEP SLEEP',
        subtitle: '4 Nutrients · Day Focus + Night Rest',
        items: [
          '+ Includes All Pack 1 ([1] + [2])',
          '• [3] Magnesium Bisglycinate',
          '• [4] Active B-Complex (B12+B6)'
        ],
        note: 'Steady energy & deep REM sleep.',
        isFeatured: true
      },
      {
        badge: 'ADVANCED · FULL PROGRAM',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        badgeBorder: gcpGreenBorder,
        name: 'PACK 3 · COMPLETE + GUT SHIELD',
        subtitle: '5 Nutrients · Full Program',
        items: [
          '+ Includes All Pack 2 ([1]..[4])',
          '• [5] Probiotics (Veg Capsule)'
        ],
        note: 'Full gut & lactose protection.',
        isFeatured: false
      }
    ];

    const pkH = 192;

    packs.forEach((pk, pIdx) => {
      const pkX = 36 + pIdx * (pkW + 8);

      page3.drawRectangle({
        x: pkX, y: y3 - pkH, width: pkW, height: pkH,
        color: white, borderColor: pk.isFeatured ? googleBlue : gcpBorder, borderWidth: pk.isFeatured ? 1.6 : 1.0
      });

      page3.drawRectangle({
        x: pkX + (pk.isFeatured ? 1.5 : 1), y: y3 - 28, width: pkW - (pk.isFeatured ? 3 : 2), height: 27,
        color: pk.isFeatured ? rgb(248 / 255, 251 / 255, 255 / 255) : rgb(250 / 255, 251 / 255, 252 / 255)
      });

      const bW = helveticaBold.widthOfTextAtSize(pk.badge, 6.2) + 12;
      page3.drawRectangle({
        x: pkX + 10, y: y3 - 20, width: bW, height: 14,
        color: pk.badgeBg, borderColor: pk.badgeBorder, borderWidth: 0.8
      });
      page3.drawText(pk.badge, {
        x: pkX + 16, y: y3 - 16, size: 6.2, font: helveticaBold, color: pk.badgeColor
      });

      drawWrappedBlock(page3, pk.name, {
        x: pkX + 10, y: y3 - 42, size: 8.2, font: helveticaBold,
        color: pk.isFeatured ? googleBlue : darkSlate, maxWidth: pkW - 20, lineHeight: 10.2, maxLines: 2
      });

      page3.drawText(pk.subtitle, {
        x: pkX + 10, y: y3 - 66, size: 7.2, font: helveticaBold, color: mutedSlate, maxWidth: pkW - 20
      });

      page3.drawLine({
        start: { x: pkX + 10, y: y3 - 74 }, end: { x: pkX + pkW - 10, y: y3 - 74 },
        thickness: 0.7, color: gcpBorder
      });

      let itemY = y3 - 92;
      pk.items.forEach((it) => {
        const isIncludes = it.startsWith('+ Includes');
        drawWrappedBlock(page3, it, {
          x: pkX + 10, y: itemY, size: 7.7, font: isIncludes ? helveticaBold : helvetica,
          color: isIncludes ? (pk.isFeatured ? googleBlue : darkSlate) : darkSlate,
          maxWidth: pkW - 20, lineHeight: 10.4, maxLines: 2
        });
        itemY -= 22;
      });

      drawWrappedBlock(page3, `Why: ${pk.note}`, {
        x: pkX + 10, y: y3 - pkH + 28, size: 7.4, font: helveticaOblique,
        color: mutedSlate, maxWidth: pkW - 20, lineHeight: 10.0, maxLines: 2
      });
    });

    y3 -= (pkH + 28);

    // -------------------------------------------------------------------------
    // SECTION 2: HOW DO YOU PREFER TO TAKE IT? (PHARMACY VS COMPOUNDING)
    // -------------------------------------------------------------------------
    page3.drawText('2. HOW DO YOU PREFER TO TAKE IT? (TWO SIMPLE WAYS TO GET YOUR PACK)', {
      x: 36, y: y3, size: 10.5, font: helveticaBold, color: navyPrimary
    });

    y3 -= 12;
    const pathwayW = (p3Width - 72 - 14) / 2;

    const pathwayOptions = [
      {
        pill: 'OPTION A · LOCAL PHARMACY',
        title: 'OPTION A: BUY COMMERCIAL BOTTLES AT A PHARMACY',
        bullets: [
          'What it is: Buy 2 to 5 separate commercial bottles at any local pharmacy.',
          'Advantage: Immediate same-day purchase without waiting for lab preparation.',
          'How to buy: Show the 5 active nutrients on Page 9 to your local pharmacist.'
        ]
      },
      {
        pill: 'OPTION B · CUSTOM COMPOUNDED',
        title: 'OPTION B: ALL-IN-ONE 3 DAILY CAPSULES (PHARMACY LAB)',
        bullets: [
          'What it is: Your pack custom-made into 3 daily capsules (Waking, Breakfast, Bedtime).',
          'Advantage: Fewer pills, 100% lactose-free vegetable capsules, exact DNA doses.',
          'How to order: Share your digital portal order with your doctor or compounding pharmacy.'
        ]
      }
    ];

    const pathwayH = 166;

    pathwayOptions.forEach((opt, optIdx) => {
      const pX = 36 + optIdx * (pathwayW + 14);

      page3.drawRectangle({
        x: pX, y: y3 - pathwayH, width: pathwayW, height: pathwayH,
        color: white, borderColor: gcpBorder, borderWidth: 1.0
      });

      const pillW = helveticaBold.widthOfTextAtSize(opt.pill, 6.4) + 12;
      page3.drawRectangle({
        x: pX + 12, y: y3 - 22, width: pillW, height: 14,
        color: gcpPillBg, borderColor: gcpBorder, borderWidth: 0.8
      });
      page3.drawText(opt.pill, {
        x: pX + 18, y: y3 - 18, size: 6.4, font: helveticaBold, color: gcpPillText
      });

      drawWrappedBlock(page3, opt.title, {
        x: pX + 12, y: y3 - 40, size: 8.2, font: helveticaBold, color: navyPrimary,
        maxWidth: pathwayW - 24, lineHeight: 10.6, maxLines: 2
      });

      let bY = y3 - 68;
      opt.bullets.forEach((b) => {
        page3.drawText('•', { x: pX + 12, y: bY, size: 8.0, font: helveticaBold, color: tealAccent });
        bY = drawWrappedBlock(page3, b, {
          x: pX + 22, y: bY, size: 7.8, font: helvetica, color: darkSlate,
          maxWidth: pathwayW - 34, lineHeight: 10.8, maxLines: 3
        });
        bY -= 8.0;
      });
    });

    y3 -= (pathwayH + 22);

    // Safety Alert
    const safeH = 56;
    page3.drawRectangle({
      x: 36, y: y3 - safeH, width: p3Width - 72, height: safeH,
      color: redBg, borderColor: redBorder, borderWidth: 0.9
    });

    page3.drawText('IMPORTANT SAFETY RULE: CHOOSE EITHER OPTION A OR OPTION B (NEVER BOTH AT ONCE)', {
      x: 48, y: y3 - 18, size: 8.0, font: helveticaBold, color: redText
    });
    drawWrappedBlock(page3, 'Option A and Option B contain the exact same nutrients. Pick one track only to avoid taking a double dose of Vitamin D or minerals.', {
      x: 48, y: y3 - 33, size: 7.6, font: helvetica, color: darkSlate, maxWidth: p3Width - 96, lineHeight: 10.5, maxLines: 2
    });

    // Page 10 Footer
    page3.drawText('Page 10 of 11 · Atlas Health Services · Personalized Supplement Guide · Designed for clarity & adherence · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // =========================================================================
    // PAGE 11: ONE-PAGE FRIDGE CHEAT SHEET (PRINT & STICK ON YOUR FRIDGE)
    // =========================================================================
    const fridgePage = pdfDoc.addPage([595.28, 841.89]);
    const { width: fW, height: fH } = fridgePage.getSize();
    fridgePage.drawRectangle({ x: 0, y: fH - 8, width: fW, height: 8, color: gcpGreen });

    let yf = fH - 28;
    fridgePage.drawText('ATLAS HEALTH SERVICES · KITCHEN CHEAT SHEET', {
      x: 36, y: yf, size: 9.0, font: helveticaBold, color: navyPrimary
    });
    const badgeF = 'PAGE 11 OF 11 · PRINT FOR YOUR FRIDGE';
    const badgeFW = helveticaBold.widthOfTextAtSize(badgeF, 7.2) + 16;
    fridgePage.drawRectangle({
      x: fW - 36 - badgeFW, y: yf - 4, width: badgeFW, height: 18,
      color: gcpGreenBg, borderColor: gcpGreen, borderWidth: 1.0
    });
    fridgePage.drawText(badgeF, {
      x: fW - 36 - badgeFW + 8, y: yf + 1, size: 7.2, font: helveticaBold, color: gcpGreen
    });

    yf -= 20;
    fridgePage.drawText(`DAILY FRIDGE CHECKLIST FOR ${patientName.toUpperCase()}`, {
      x: 36, y: yf, size: 15.0, font: helveticaBold, color: darkSlate
    });
    yf -= 14;
    fridgePage.drawText('Everything you need at a glance: Plate Order + 3 Supplement Moments + 4 Kitchen Swaps', {
      x: 36, y: yf, size: 8.6, font: helvetica, color: mutedSlate
    });
    yf -= 12;
    fridgePage.drawLine({ start: { x: 36, y: yf }, end: { x: fW - 36, y: yf }, thickness: 1.0, color: cardBorder });

    // 1. 1-2-3 PLATE RULE BANNER
    yf -= 22;
    fridgePage.drawText('1. EAT EVERY PLATE IN THIS 1-2-3 ORDER', {
      x: 36, y: yf, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yf -= 12;
    const fPlateSteps = [
      { num: '1', pct: '50%', label: 'Greens First', sub: 'Salad, arugula, broccoli', bg: gcpGreenBg, fg: gcpGreen },
      { num: '2', pct: '30%', label: 'Protein + EVOO', sub: 'Fish, eggs, chicken, A2 yogurt', bg: rgb(219 / 255, 234 / 255, 254 / 255), fg: navyPrimary },
      { num: '3', pct: '20%', label: 'Ancient Carbs Last', sub: 'Max 1 fist quinoa / millet', bg: gcpAmberBg, fg: gcpAmber }
    ];
    const fpW = (fW - 72 - 24) / 3;
    const fpH = 82;
    fPlateSteps.forEach((st, idx) => {
      const sx = 36 + idx * (fpW + 12);
      fridgePage.drawRectangle({ x: sx, y: yf - fpH, width: fpW, height: fpH, color: st.bg, borderColor: st.fg, borderWidth: 1.1 });
      fridgePage.drawCircle({ x: sx + 18, y: yf - 20, size: 10, color: st.fg });
      fridgePage.drawText(st.num, { x: sx + 15.2, y: yf - 23.5, size: 9.5, font: helveticaBold, color: white });
      fridgePage.drawText(`${st.pct} · ${st.label}`, { x: sx + 34, y: yf - 22, size: 8.2, font: helveticaBold, color: st.fg });
      drawWrappedBlock(fridgePage, st.sub, {
        x: sx + 12, y: yf - 44, size: 7.9, font: helvetica, color: darkSlate, maxWidth: fpW - 24, lineHeight: 10.6, maxLines: 2
      });
      if (idx < 2) {
        fridgePage.drawText('->', { x: sx + fpW + 2, y: yf - 42, size: 10, font: helveticaBold, color: navyPrimary });
      }
    });
    yf -= (fpH + 26);

    // 2. 3 DAILY SUPPLEMENT MOMENTS
    fridgePage.drawText('2. YOUR 3 DAILY SUPPLEMENT MOMENTS', {
      x: 36, y: yf, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yf -= 12;
    const fMoments = [
      { badge: 'MORNING · 07:30', title: 'Upon Waking (Empty Stomach)', desc: '[ ] Water + Nutrient [5] Probiotic (15-30 min before food).', accent: tealAccent },
      { badge: 'BREAKFAST · 08:30', title: 'With Eggs, Avocado or EVOO', desc: '[ ] Nutrients [1] Vit D3/K2 + [2] Active Folate (+ [4] B-Complex).', accent: googleBlue },
      { badge: 'BEDTIME · 22:00', title: '45 Min Before Sleep', desc: '[ ] Nutrient [3] Magnesium Bisglycinate + chamomile tea.', accent: navyPrimary }
    ];
    const fmW = (fW - 72 - 20) / 3;
    const fmH = 112;
    fMoments.forEach((fm, idx) => {
      const fx = 36 + idx * (fmW + 10);
      fridgePage.drawRectangle({ x: fx, y: yf - fmH, width: fmW, height: fmH, color: white, borderColor: cardBorder, borderWidth: 1.0 });
      fridgePage.drawRectangle({ x: fx, y: yf - 4, width: fmW, height: 4, color: fm.accent });
      fridgePage.drawText(fm.badge, { x: fx + 10, y: yf - 20, size: 7.4, font: helveticaBold, color: fm.accent });
      drawWrappedBlock(fridgePage, fm.title, {
        x: fx + 10, y: yf - 36, size: 8.6, font: helveticaBold, color: darkSlate, maxWidth: fmW - 20, lineHeight: 11.0, maxLines: 2
      });
      drawWrappedBlock(fridgePage, fm.desc, {
        x: fx + 10, y: yf - 68, size: 7.8, font: helvetica, color: darkSlate, maxWidth: fmW - 20, lineHeight: 10.8, maxLines: 3
      });
    });
    yf -= (fmH + 26);

    // 3. 4 ESSENTIAL PANTRY SWAPS (CHECKLIST)
    fridgePage.drawText('3. YOUR 4 HERITAGE & DNA PANTRY SWAPS', {
      x: 36, y: yf, size: 10.5, font: helveticaBold, color: navyPrimary
    });
    yf -= 12;
    const fSwaps = [
      '[ ] Oils: Extra Virgin Olive Oil (EVOO) or Ghee  (Never sunflower, corn, soy or canola)',
      '[ ] Dairy: Goat/Sheep Kefir, Labneh & Aged Feta  (Never cow milk or soft cream cheese)',
      '[ ] Grains: Quinoa, Millet, Buckwheat & Lentils  (Never white bread or fortified cereals)',
      '[ ] Caffeine & Night Rest: Coffee strictly before 12:00 PM  ·  12h overnight kitchen rest'
    ];
    const fsH = 148;
    fridgePage.drawRectangle({ x: 36, y: yf - fsH, width: fW - 72, height: fsH, color: lightBg, borderColor: cardBorder, borderWidth: 1.0 });
    let fsy = yf - 22;
    fSwaps.forEach((sw) => {
      fridgePage.drawText(sw, { x: 50, y: fsy, size: 8.6, font: helveticaBold, color: darkSlate, maxWidth: fW - 100 });
      fsy -= 31;
    });
    yf -= (fsH + 22);

    // 4. QR PORTAL BANNER
    const qrBoxH = 88;
    fridgePage.drawRectangle({
      x: 36, y: yf - qrBoxH, width: fW - 72, height: qrBoxH,
      color: rgb(232 / 255, 240 / 255, 254 / 255), borderColor: rgb(191 / 255, 219 / 255, 254 / 255), borderWidth: 1.0
    });
    if (qrImage) {
      fridgePage.drawImage(qrImage, { x: 48, y: yf - qrBoxH + 12, width: 64, height: 64 });
    }
    fridgePage.drawText('SCAN FOR YOUR INTERACTIVE MENU & FOOD SEARCH', {
      x: 126, y: yf - 26, size: 10.0, font: helveticaBold, color: navyPrimary
    });
    drawWrappedBlock(fridgePage, 'Open your live digital guide anytime on your phone to search any food (Green / Amber / Red), view your 7-day meals, or share with your chef.', {
      x: 126, y: yf - 44, size: 8.2, font: helvetica, color: darkSlate, maxWidth: fW - 180, lineHeight: 11.4, maxLines: 2
    });

    fridgePage.drawText('Page 11 of 11 · One-Page Fridge Cheat Sheet · Atlas Health Services · www.atlashealthservices.com', {
      x: 36, y: 18, size: 7.0, font: helvetica, color: mutedSlate
    });

    // =========================================================================
    // SECTION II: MERGE ORIGINAL 24GENETICS LABORATORY REPORT (IF REQUESTED)
    // =========================================================================
    if (effectiveIncludeOriginal) {
      let originalBytes = null;
      const originalPdfPath = path.join(process.cwd(), 'public/reports/24genetics/G000943554_Nutrition.pdf');
      if (fs.existsSync(originalPdfPath)) {
        try { originalBytes = fs.readFileSync(originalPdfPath); } catch { /* fallback CDN */ }
      }
      if (!originalBytes) {
        for (const cdnUrl of [
          'https://www.atlashealth-services.com/reports/24genetics/G000943554_Nutrition.pdf',
          'https://med-peptides-app-27a3a.web.app/reports/24genetics/G000943554_Nutrition.pdf',
        ]) {
          try {
            const res = await fetch(cdnUrl, { cache: 'force-cache' });
            if (res.ok) {
              originalBytes = Buffer.from(await res.arrayBuffer());
              break;
            }
          } catch { /* ignore */ }
        }
      }
      if (originalBytes) {
        // Divider Page (Section II Cover)
        const dividerPage = pdfDoc.addPage([595.28, 841.89]);
        const { width: dWidth, height: dHeight } = dividerPage.getSize();

        // Top Brand Accent Strip
        dividerPage.drawRectangle({
          x: 0,
          y: dHeight - 8,
          width: dWidth,
          height: 8,
          color: navyPrimary
        });
        dividerPage.drawRectangle({
          x: 0,
          y: dHeight - 12,
          width: dWidth,
          height: 4,
          color: tealAccent
        });

        // Background Border Card
        dividerPage.drawRectangle({
          x: 36,
          y: 48,
          width: dWidth - 72,
          height: dHeight - 96,
          color: lightBg,
          borderColor: cardBorder,
          borderWidth: 1.2
        });

        // Center Content Box (Section Overview)
        const boxTop = dHeight - 340;
        dividerPage.drawRectangle({
          x: 56,
          y: boxTop,
          width: dWidth - 112,
          height: 270,
          color: white,
          borderColor: tealAccent,
          borderWidth: 1.4
        });

        // Badge
        dividerPage.drawRectangle({
          x: 76,
          y: boxTop + 232,
          width: 320,
          height: 22,
          color: blueBg,
          borderColor: blueBorder,
          borderWidth: 0.8
        });
        dividerPage.drawText('SECTION II · 24GENETICS LABORATORY REPORT', {
          x: 88,
          y: boxTop + 238,
          size: 8.5,
          font: helveticaBold,
          color: navyPrimary
        });

        dividerPage.drawText('24Genetics DNA Nutrition Analysis', {
          x: 76,
          y: boxTop + 200,
          size: 19,
          font: helveticaBold,
          color: navyPrimary
        });

        dividerPage.drawText('Complete 55-Page Laboratory Report', {
          x: 76,
          y: boxTop + 180,
          size: 11,
          font: helveticaOblique,
          color: tealAccent
        });

        // Thin Separator
        dividerPage.drawLine({
          start: { x: 76, y: boxTop + 168 },
          end: { x: dWidth - 76, y: boxTop + 168 },
          thickness: 1,
          color: cardBorder
        });

        // Metadata grid
        dividerPage.drawText(`Patient: ${patientName}`, { x: 76, y: boxTop + 148, size: 9.5, font: helveticaBold, color: darkSlate });
        dividerPage.drawText(`Specimen ID: G000943554 / ${sampleId}`, { x: 76, y: boxTop + 132, size: 9, font: helvetica, color: mutedSlate });
        dividerPage.drawText('Sequencing Technology: Illumina NGS Microarray Platform', { x: 76, y: boxTop + 116, size: 8.5, font: helvetica, color: mutedSlate });
        dividerPage.drawText('Laboratory Source: 24Genetics SL · Madrid, Spain', { x: 76, y: boxTop + 100, size: 8.5, font: helvetica, color: mutedSlate });

        // Generic Document Overview Box (without validation claims)
        dividerPage.drawRectangle({
          x: 76,
          y: boxTop + 12,
          width: dWidth - 152,
          height: 76,
          color: lightBg,
          borderColor: cardBorder,
          borderWidth: 0.8
        });

        dividerPage.drawText('DOCUMENT STRUCTURE & GENERAL OVERVIEW:', {
          x: 88,
          y: boxTop + 70,
          size: 8.0,
          font: helveticaBold,
          color: navyPrimary
        });
        dividerPage.drawText('• Section I: Personalized meal plan recommendations, daily routine & dietary selections.', {
          x: 88,
          y: boxTop + 54,
          size: 7.2,
          font: helvetica,
          color: darkSlate
        });
        dividerPage.drawText('• Section II: Full 55-page DNA Nutrition laboratory report issued by 24Genetics.', {
          x: 88,
          y: boxTop + 38,
          size: 7.2,
          font: helvetica,
          color: darkSlate
        });
        dividerPage.drawText('• Nutrition Scope: Complete nutritional predispositions, metabolic profiles & cofactors.', {
          x: 88,
          y: boxTop + 22,
          size: 7.2,
          font: helvetica,
          color: mutedSlate
        });

        // ---------------------------------------------------------------------
        // Quick Navigation Index Directory (Section II Key Pages)
        // ---------------------------------------------------------------------
        const dirTop = boxTop - 180;
        dividerPage.drawRectangle({
          x: 56,
          y: dirTop,
          width: dWidth - 112,
          height: 165,
          color: white,
          borderColor: cardBorder,
          borderWidth: 1.2
        });

        dividerPage.drawRectangle({
          x: 56,
          y: dirTop + 140,
          width: dWidth - 112,
          height: 25,
          color: rgb(241 / 255, 245 / 255, 249 / 255)
        });
        dividerPage.drawText('LABORATORY REPORT DIRECTORY · KEY FINDING SECTIONS', {
          x: 72,
          y: dirTop + 148,
          size: 8.0,
          font: helveticaBold,
          color: navyPrimary
        });

        const tocItems = [
          {
            title: '1. Dietary Effectiveness & Weight Control (Mediterranean vs Low-Carb)',
            sub: 'Low-carb responsiveness, fat/carb energy efficiency, satiety index and BMI predispositions',
            page: 'PDF P. 16-29',
            orig: '(Doc P. 11-24)'
          },
          {
            title: '2. Nutrigenomic Sensitivities & Food Intolerances (Lactose, Gluten, Salt, DAO)',
            sub: 'Lactose intolerance, salt-sensitive hypertension, DAO histamine metabolism & coeliac risk',
            page: 'PDF P. 30-38',
            orig: '(Doc P. 25-33)'
          },
          {
            title: '3. Micronutrient Metabolism & Co-Factors (Folate B9, D, B6, Iron, Calcium, Zn)',
            sub: 'MTHFR methylation, VDR vitamin D utilization, B-complex and essential cellular minerals',
            page: 'PDF P. 39-51',
            orig: '(Doc P. 34-46)'
          },
          {
            title: '4. Lipids, Cardiovascular & Caffeine Metabolism (Cholesterol, Triglycerides, Coffee)',
            sub: 'LDL cholesterol regulation, hepatic triglyceride clearance, omega-6 and caffeine half-life',
            page: 'PDF P. 52-59',
            orig: '(Doc P. 47-54)'
          }
        ];

        let tocY = dirTop + 115;
        tocItems.forEach((item) => {
          dividerPage.drawText(item.title, {
            x: 72,
            y: tocY,
            size: 7.6,
            font: helveticaBold,
            color: darkSlate
          });

          // Page Badge on Right (Showing Real PDF page + Original 24Genetics report page)
          const pBadgeW = 100;
          dividerPage.drawRectangle({
            x: dWidth - 56 - pBadgeW - 16,
            y: tocY - 3,
            width: pBadgeW,
            height: 14,
            color: rgb(240 / 255, 253 / 255, 250 / 255),
            borderColor: tealAccent,
            borderWidth: 0.8
          });
          dividerPage.drawText(`${item.page} ${item.orig}`, {
            x: dWidth - 56 - pBadgeW - 10,
            y: tocY + 1,
            size: 6.2,
            font: helveticaBold,
            color: tealAccent
          });

          dividerPage.drawText(item.sub, {
            x: 72,
            y: tocY - 11,
            size: 6.6,
            font: helvetica,
            color: mutedSlate
          });

          tocY -= 28;
        });

        // Bottom QR & Footer on Divider Page
        if (qrImage) {
          dividerPage.drawImage(qrImage, {
            x: dWidth - 56 - 42,
            y: 58,
            width: 38,
            height: 38
          });
          dividerPage.drawText('Scan to open online portal', {
            x: dWidth - 56 - 150,
            y: 72,
            size: 6.2,
            font: helveticaOblique,
            color: mutedSlate
          });
        }

        dividerPage.drawText('Personalized Genomic Dossier · 24Genetics Laboratory Report begins on next page', {
          x: 56,
          y: 65,
          size: 7.5,
          font: helveticaOblique,
          color: mutedSlate
        });

        // Append 55 Original Nutrition Pages
        const originalPdf = await PDFDocument.load(originalBytes);
        const copiedPages = await pdfDoc.copyPages(originalPdf, originalPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));

        // Append Original 24Genetics Ancestry PDF Pages when available (e.g. Hossam G000943554 / 24G-QA-90421)
        if (sampleId === 'G000943554' || sampleId === '24G-QA-90421') {
          let ancestryBytes = null;
          const ancestryPdfPath = path.join(process.cwd(), 'public/reports/24genetics/G000943554_Ancestry.pdf');
          if (fs.existsSync(ancestryPdfPath)) {
            try { ancestryBytes = fs.readFileSync(ancestryPdfPath); } catch { /* fallback CDN */ }
          }
          if (!ancestryBytes) {
            for (const cdnUrl of [
              'https://www.atlashealth-services.com/reports/24genetics/G000943554_Ancestry.pdf',
              'https://med-peptides-app-27a3a.web.app/reports/24genetics/G000943554_Ancestry.pdf',
            ]) {
              try {
                const ancRes = await fetch(cdnUrl, { cache: 'force-cache' });
                if (ancRes.ok) {
                  ancestryBytes = Buffer.from(await ancRes.arrayBuffer());
                  break;
                }
              } catch { /* ignore */ }
            }
          }
          if (ancestryBytes) {
            const ancPdf = await PDFDocument.load(ancestryBytes);
            const ancPages = await pdfDoc.copyPages(ancPdf, ancPdf.getPageIndices());
            ancPages.forEach((p) => pdfDoc.addPage(p));
          }
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
