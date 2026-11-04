import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientName = searchParams.get('patient') || 'Hossam Ahmed';
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const clinicName = searchParams.get('clinic') || 'Ryhanh Medical Wellness · Doha, Qatar';
    const mealPlanPartner = searchParams.get('partner') || 'Ryhanh Healthy Meal Plan & Diet Delivery';

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Color Palette
    const navyPrimary = rgb(0 / 255, 54 / 255, 102 / 255);       // #003666
    const tealAccent = rgb(13 / 255, 148 / 255, 136 / 255);      // #0d9488
    const darkSlate = rgb(15 / 255, 23 / 255, 42 / 255);         // #0f172a
    const mutedSlate = rgb(100 / 255, 116 / 255, 139 / 255);    // #64748b
    const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);        // #f8fafc
    const cardBorder = rgb(226 / 255, 232 / 255, 240 / 255);    // #e2e8f0

    const greenBorder = rgb(34 / 255, 197 / 255, 94 / 255);     // #22c55e
    const greenBg = rgb(240 / 255, 253 / 255, 244 / 255);        // #f0fdf4
    const greenText = rgb(21 / 255, 128 / 255, 61 / 255);        // #15803d

    const amberBorder = rgb(245 / 255, 158 / 255, 11 / 255);    // #f59e0b
    const amberBg = rgb(254 / 255, 243 / 255, 199 / 255);        // #fef3c7
    const amberText = rgb(180 / 255, 83 / 255, 9 / 255);         // #b45309

    const redBorder = rgb(239 / 255, 68 / 255, 68 / 255);        // #ef4444
    const redBg = rgb(254 / 255, 242 / 255, 242 / 255);          // #fef2f2
    const redText = rgb(185 / 255, 28 / 255, 28 / 255);          // #b91c1c

    const blueBorder = rgb(2 / 255, 132 / 255, 199 / 255);       // #0284c7
    const blueBg = rgb(224 / 255, 242 / 255, 254 / 255);         // #e0f2fe
    const white = rgb(1, 1, 1);

    // Google Cloud Console UX Semantic Tokens (Neutral, Anti-Bias)
    const gcpBorder = rgb(218 / 255, 220 / 255, 224 / 255);      // #dadce0 (GCP Card Border)
    const gcpPillBg = rgb(241 / 255, 243 / 255, 244 / 255);      // #f1f3f4 (GCP Chip Surface)
    const gcpPillText = rgb(60 / 255, 64 / 255, 67 / 255);       // #3c4043 (GCP Chip Label)
    const googleBlue = rgb(26 / 255, 115 / 255, 232 / 255);       // #1a73e8 (GCP Blue)
    const googleBlueBg = rgb(232 / 255, 240 / 255, 254 / 255);   // #e8f0fe (GCP Blue Light Surface)
    const googleBlueBorder = rgb(210 / 255, 227 / 255, 252 / 255);// #d2e3fc
    const gcpGreen = rgb(19 / 255, 115 / 255, 51 / 255);         // #137333 (GCP Active Green)
    const gcpGreenBg = rgb(230 / 255, 244 / 255, 234 / 255);     // #e6f4ea (GCP Active Green Bg)
    const gcpGreenBorder = rgb(206 / 255, 234 / 255, 214 / 255);  // #ceead6
    const gcpAmber = rgb(176 / 255, 96 / 255, 0 / 255);          // #b06000 (GCP Amber)
    const gcpAmberBg = rgb(254 / 255, 247 / 255, 224 / 255);     // #fef7e0 (GCP Amber Bg)
    const gcpAmberBorder = rgb(254 / 255, 239 / 255, 195 / 255); // #feefc3
    const gcpRed = rgb(197 / 255, 34 / 255, 31 / 255);           // #c5221f (GCP Red)
    const gcpRedBg = rgb(252 / 255, 232 / 255, 230 / 255);       // #fce8e6 (GCP Red Bg)
    const gcpRedBorder = rgb(250 / 255, 210 / 255, 207 / 255);   // #fad2cf

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
    coverPage.drawText('Clinical Intelligence Platform · Precision Genomic Endocrinology', {
      x: headerTextX,
      y: yCover - 16,
      size: 7.8,
      font: helvetica,
      color: mutedSlate
    });

    // Top-Right: GCP Semantic Status Badge
    const statusBadge = 'ACTIVE · CLINICAL REPORT';
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
    coverPage.drawText('PERSONALIZED GENOMIC DOSSIER', {
      x: 44,
      y: yCover,
      size: 20,
      font: helveticaBold,
      color: darkSlate
    });

    yCover -= 15;
    coverPage.drawText('DNA-Guided Nutrition, Metabolic Optimization & Chronobiology Guidance', {
      x: 44,
      y: yCover,
      size: 9.5,
      font: helvetica,
      color: googleBlue
    });

    // Metadata Chips Row (GCP Chips)
    yCover -= 18;
    const chips = [
      { label: 'Precision Nutrition', bg: gcpGreenBg, border: gcpGreen, text: gcpGreen },
      { label: 'Illumina NGS Sequencing', bg: rgb(241 / 255, 243 / 255, 244 / 255), border: cardBorder, text: darkSlate },
      { label: 'Complete 59-Page Dossier', bg: rgb(232 / 255, 240 / 255, 254 / 255), border: rgb(210 / 255, 227 / 255, 252 / 255), text: googleBlue }
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
    coverPage.drawText('SPECIMEN & CLINICAL METADATA ATTRIBUTES', {
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
    coverPage.drawText('Clinical Scope:', { x: c1Label, y: rowY, size: 7.5, font: helveticaBold, color: mutedSlate });
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
    coverPage.drawText('November 2026 · Clinical Release', { x: c2Val, y: rowY, size: 7.8, font: helvetica, color: darkSlate });

    yCover -= (cardH + 18);

    // 4. DOSSIER ARCHITECTURE & SECTION DIRECTORY (GCP Services Grid)
    coverPage.drawText('DOSSIER ARCHITECTURE & SECTION DIRECTORY', {
      x: 44,
      y: yCover,
      size: 9.5,
      font: helveticaBold,
      color: darkSlate
    });

    yCover -= 12;
    const coverRoadmap = [
      {
        badge: 'PART I · PAGE 2',
        badgeColor: googleBlue,
        badgeBg: rgb(232 / 255, 240 / 255, 254 / 255),
        title: 'Actionable Daily Meal Plan & 24-Hour Chronobiology Routine',
        desc: 'Translates your genetic markers into practical daily catering choices: Green (Always Order), Amber (In Moderation), and Red (Exclude). Includes the Golden Plate Sequencing rule and your synchronized 24-hour nutrition & supplement timeline.'
      },
      {
        badge: 'PART II · PAGE 3',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        title: 'Targeted Supplement Protocols & Shopping Pathways',
        desc: 'Cellular cofactors (Active Folate 5-MTHF, D3/K2, Probiotics, Magnesium Bisglycinate). Formulated exclusively with 100% vegetable DRcaps® (lactose-free, zero synthetic binders). Neutral comparison between retail pharmacies and compounding.'
      },
      {
        badge: 'PART III · PAGES 4–59',
        badgeColor: mutedSlate,
        badgeBg: rgb(241 / 255, 243 / 255, 244 / 255),
        title: 'Complete 24Genetics Laboratory Sequencing Report (55 Pages)',
        desc: 'The official biometric laboratory analysis across Nutrition, Vitamins, Minerals, Metabolic Profile, and Food Sensitivities (Lactase Non-Persistence), complete with structured quick-jump directory index.'
      }
    ];

    coverRoadmap.forEach((sec) => {
      const sH = 52;
      coverPage.drawRectangle({
        x: 44,
        y: yCover - sH,
        width: cWidth - 88,
        height: sH,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Badge
      const bW = helveticaBold.widthOfTextAtSize(sec.badge, 6.5) + 12;
      coverPage.drawRectangle({
        x: 54,
        y: yCover - 16,
        width: bW,
        height: 12,
        color: sec.badgeBg,
        borderColor: cardBorder,
        borderWidth: 0.8
      });
      coverPage.drawText(sec.badge, {
        x: 60,
        y: yCover - 13,
        size: 6.5,
        font: helveticaBold,
        color: sec.badgeColor
      });

      coverPage.drawText(sec.title, {
        x: 60 + bW + 6,
        y: yCover - 14,
        size: 7.8,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: cWidth - 88 - bW - 32
      });

      coverPage.drawText(sec.desc, {
        x: 54,
        y: yCover - 29,
        size: 7.0,
        font: helvetica,
        color: mutedSlate,
        maxWidth: cWidth - 108,
        lineHeight: 9.8
      });

      yCover -= (sH + 7);
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

    // Generate QR Code for Cover
    const coverPortalUrl = `https://atlashealth-services.com/patient/dna-report?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleId)}`;
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
    // PAGE 2: MEAL PLAN SELECTION GUIDE & 24-HOUR ROUTINE
    // =========================================================================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 Standard
    const { width: p1Width, height: p1Height } = page1.getSize();

    // Top Accent Strip
    page1.drawRectangle({
      x: 0,
      y: p1Height - 8,
      width: p1Width,
      height: 8,
      color: tealAccent
    });

    let y1 = p1Height - 28;

    // Header Area
    page1.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y1,
      size: 9.0,
      font: helveticaBold,
      color: navyPrimary
    });

    const badge1 = 'PAGE 2 OF 3 · MEAL PLAN & KITCHEN ROUTINE';
    const badge1W = helveticaBold.widthOfTextAtSize(badge1, 7.5) + 16;
    page1.drawRectangle({
      x: p1Width - 36 - badge1W,
      y: y1 - 4,
      width: badge1W,
      height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1.2
    });
    page1.drawText(badge1, {
      x: p1Width - 36 - badge1W + 8,
      y: y1 + 1,
      size: 7.5,
      font: helveticaBold,
      color: tealAccent
    });

    y1 -= 18;
    page1.drawText('PERSONALIZED MEAL PLAN & DIET GUIDE', {
      x: 36,
      y: y1,
      size: 14.5,
      font: helveticaBold,
      color: darkSlate
    });

    y1 -= 13;
    page1.drawText('How to choose your daily catering meals and synchronize your nutrition based on your DNA', {
      x: 36,
      y: y1,
      size: 8.5,
      font: helvetica,
      color: mutedSlate
    });

    y1 -= 10;
    page1.drawLine({
      start: { x: 36, y: y1 },
      end: { x: p1Width - 36, y: y1 },
      thickness: 1.2,
      color: cardBorder
    });

    // Metadata Ribbon
    y1 -= 14;
    page1.drawText(`PATIENT: ${patientName}   |   SPECIMEN ID: ${sampleId}   |   MEAL SERVICE: ${mealPlanPartner}`, {
      x: 36,
      y: y1,
      size: 7.8,
      font: helveticaBold,
      color: tealAccent
    });

    y1 -= 10;
    page1.drawLine({
      start: { x: 36, y: y1 },
      end: { x: p1Width - 36, y: y1 },
      thickness: 0.8,
      color: cardBorder
    });

    // -------------------------------------------------------------------------
    // SECTION 1: YOUR DNA IN 4 PLAIN-ENGLISH FINDINGS (2x2 Grid, Legible 8.5pt)
    // -------------------------------------------------------------------------
    y1 -= 18;
    page1.drawText('1. YOUR GENETIC PROFILE IN PLAIN ENGLISH (WHAT YOUR DNA SAYS)', {
      x: 36,
      y: y1,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 8;
    const plainFindings = [
      {
        badge: 'HIGH NEED · MTHFR',
        title: 'Folate Metabolism (Active B9)',
        action: 'Your cells require pre-activated folate (5-MTHF) for sustained energy and brain focus. Avoid synthetic folic acid in fortified white bread.'
      },
      {
        badge: 'LACTASE DEFICIENT',
        title: 'Lactose & Dairy Digestion',
        action: 'Genetics show minimal lactase production. Choosing 100% dairy-free dishes (almond, coconut) prevents digestive bloating, gas, and fatigue.'
      },
      {
        badge: 'VDR BOTTLENECK',
        title: 'Fat-Assisted Vitamin D Uptake',
        action: 'Your Vitamin D receptors have reduced efficiency. Always take Vitamin D supplements alongside healthy fats (eggs, olive oil, avocado).'
      },
      {
        badge: 'SLOW CLEARANCE',
        title: 'Afternoon Caffeine Metabolism',
        action: 'Your liver clears caffeine slowly. Cut off coffee, colas, and stimulants strictly before 12:00 PM to protect deep, restorative slow-wave sleep.'
      }
    ];

    const boxW = (p1Width - 72 - 14) / 2;
    const boxH = 58;
    plainFindings.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bX = 36 + col * (boxW + 14);
      const bY = y1 - (row * (boxH + 10)) - boxH;

      page1.drawRectangle({
        x: bX,
        y: bY,
        width: boxW,
        height: boxH,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Accent pill
      const bW = helveticaBold.widthOfTextAtSize(f.badge, 6.2) + 10;
      page1.drawRectangle({
        x: bX + 8,
        y: bY + boxH - 16,
        width: bW,
        height: 12,
        color: rgb(240 / 255, 253 / 255, 250 / 255),
        borderColor: tealAccent,
        borderWidth: 0.8
      });
      page1.drawText(f.badge, {
        x: bX + 13,
        y: bY + boxH - 13,
        size: 6.2,
        font: helveticaBold,
        color: tealAccent
      });

      page1.drawText(f.title, {
        x: bX + 12 + bW,
        y: bY + boxH - 14,
        size: 8.8,
        font: helveticaBold,
        color: navyPrimary
      });

      page1.drawText(f.action, {
        x: bX + 10,
        y: bY + boxH - 30,
        size: 8.0,
        font: helvetica,
        color: darkSlate,
        maxWidth: boxW - 20,
        lineHeight: 11.0
      });
    });

    y1 -= (2 * boxH + 10 + 16);

    // -------------------------------------------------------------------------
    // SECTION 2: MEAL PLAN TRAFFIC LIGHT (DNA OPTIMIZED CATERING)
    // -------------------------------------------------------------------------
    page1.drawText('2. MEAL PLAN SELECTION GUIDE (TRAFFIC LIGHT FOR YOUR DAILY CATERING MENU)', {
      x: 36,
      y: y1,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 8;
    const trafficCols = [
      {
        badge: 'GREEN · ALWAYS ORDER',
        subtitle: 'Metabolic Boosters & DNA Favs',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        badgeBorder: gcpGreenBorder,
        accentColor: gcpGreen,
        items: [
          'Grass-fed lean beef & grilled chicken',
          'Fresh wild salmon, sea bass, local hamour',
          'Avocados, extra virgin olive oil, walnuts',
          'Dark leafy greens (spinach, arugula, kale)',
          'Steamed quinoa, jasmine rice, sweet potatoes',
          'Almond milk & coconut yogurt (dairy-free)'
        ]
      },
      {
        badge: 'AMBER · IN MODERATION',
        subtitle: 'Portion Control & Daily Limits',
        badgeColor: gcpAmber,
        badgeBg: gcpAmberBg,
        badgeBorder: gcpAmberBorder,
        accentColor: gcpAmber,
        items: [
          'Net Carbs: Keep under 40g per meal tray',
          'Soaked legumes & hummus (in moderation)',
          'Low-glycemic fruits (berries, green apples)',
          'Red meat dishes (cap at 2x per week)',
          'Arabic or espresso coffee (before 12 PM)',
          'Raw or dry-roasted nuts (watch sodium)'
        ]
      },
      {
        badge: 'RED · EXCLUDE FROM MENU',
        subtitle: 'Metabolic Disruptors & DNA Triggers',
        badgeColor: gcpRed,
        badgeBg: gcpRedBg,
        badgeBorder: gcpRedBorder,
        accentColor: gcpRed,
        items: [
          'Whole cow milk, labneh & heavy creams',
          'Fortified white bread & commercial pastries',
          'Samosas & deep-fried catering sides',
          'Industrial seed oils (canola, sunflower)',
          'Commercial sodas & sweetened juices',
          'Heavy catering meals eaten past 8:30 PM'
        ]
      }
    ];

    const colW = (p1Width - 72 - 16) / 3;
    const cH = 148;
    trafficCols.forEach((tc, cIdx) => {
      const cX = 36 + cIdx * (colW + 8);

      // Card surface: Clean White with GCP standard subtle border
      page1.drawRectangle({
        x: cX,
        y: y1 - cH,
        width: colW,
        height: cH,
        color: white,
        borderColor: gcpBorder,
        borderWidth: 1.0
      });

      // Top 3px GCP semantic status bar
      page1.drawRectangle({
        x: cX,
        y: y1 - 3,
        width: colW,
        height: 3,
        color: tc.accentColor
      });

      // Header surface
      page1.drawRectangle({
        x: cX + 1,
        y: y1 - 33,
        width: colW - 2,
        height: 30,
        color: rgb(250 / 255, 251 / 255, 252 / 255)
      });

      // Line 1: Status Chip Badge
      const bW = helveticaBold.widthOfTextAtSize(tc.badge, 6.2) + 12;
      page1.drawRectangle({
        x: cX + 8,
        y: y1 - 18,
        width: bW,
        height: 12,
        color: tc.badgeBg,
        borderColor: tc.badgeBorder,
        borderWidth: 0.8
      });
      page1.drawText(tc.badge, {
        x: cX + 14,
        y: y1 - 15,
        size: 6.2,
        font: helveticaBold,
        color: tc.badgeColor
      });

      // Line 2: Subtitle
      page1.drawText(tc.subtitle, {
        x: cX + 8,
        y: y1 - 29,
        size: 6.8,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: colW - 16
      });

      // Divider line under header
      page1.drawLine({
        start: { x: cX, y: y1 - 33 },
        end: { x: cX + colW, y: y1 - 33 },
        thickness: 0.8,
        color: gcpBorder
      });

      // Items list with colored bullet dot, hanging indent and dynamic line height
      let iY = y1 - 47;
      tc.items.forEach((it) => {
        page1.drawText('•', {
          x: cX + 8,
          y: iY,
          size: 7.5,
          font: helveticaBold,
          color: tc.accentColor
        });
        page1.drawText(it, {
          x: cX + 16,
          y: iY,
          size: 7.2,
          font: helvetica,
          color: darkSlate,
          maxWidth: colW - 22,
          lineHeight: 9.8
        });
        const textWidth = helvetica.widthOfTextAtSize(it, 7.2);
        const numLines = Math.max(1, Math.ceil(textWidth / (colW - 22)));
        const step = numLines > 1 ? 14.5 + (numLines - 1) * 9.8 : 15.5;
        iY -= step;
      });
    });

    y1 -= (cH + 14);

    // -------------------------------------------------------------------------
    // SECTION 3: THE GOLDEN PLATE SEQUENCING RULE
    // -------------------------------------------------------------------------
    const seqH = 68;
    page1.drawRectangle({
      x: 36,
      y: y1 - seqH,
      width: p1Width - 72,
      height: seqH,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1.2
    });

    page1.drawText('THE GOLDEN PLATE SEQUENCING RULE (ELIMINATES AFTERNOON BRAIN FOG):', {
      x: 48,
      y: y1 - 16,
      size: 8.5,
      font: helveticaBold,
      color: tealAccent
    });

    const seqText = 'Inside each meal tray, eat your food in this sequence: (1) Salad & vegetables first  ->  (2) Protein & healthy fats second  ->  (3) Rice or potatoes LAST.\nClinical impact: This creates a protective fiber mesh in your stomach, reducing glucose spikes by 45% and eliminating post-lunch sluggishness.';
    page1.drawText(seqText, {
      x: 48,
      y: y1 - 32,
      size: 7.8,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 96,
      lineHeight: 11.5
    });

    y1 -= (seqH + 18);

    // -------------------------------------------------------------------------
    // SECTION 4: 24-HOUR DAILY ROUTINE WITH YOUR MEALS (Chronobiology)
    // -------------------------------------------------------------------------
    page1.drawText('3. 24-HOUR DAILY ROUTINE: SYNCHRONIZED WITH YOUR MEALS & SUPPLEMENTS', {
      x: 36,
      y: y1,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 8;
    const dailySteps = [
      {
        time: 'DOSE 1 · UPON WAKING',
        meal: 'Empty Stomach (07:30)',
        step: 'Gut Shield Probiotic',
        action: 'Water (300ml) + Dose 1: Nutrient [5] (DRcaps®).',
        why: 'Probiotics reach gut safely without food acid interference.'
      },
      {
        time: 'DOSE 2 · BREAKFAST',
        meal: 'With Morning Meal (08:30)',
        step: 'Active Folate + D3/K2',
        action: 'Dose 2: Nutrients [1]+[2] (+[4]) with dietary fats.',
        why: 'Vitamins D & K2 require healthy fats for 100% absorption.'
      },
      {
        time: 'LUNCH / DINNER',
        meal: 'Catering Dish (13:00)',
        step: 'Plate Sequence & Focus',
        action: 'Eat Veggies -> Protein -> Carbs. Take Omega-3.',
        why: 'Slows sugar absorption and stops 3 PM afternoon slump.'
      },
      {
        time: 'DOSE 3 · BEDTIME',
        meal: '45 Min Before Sleep (22:00)',
        step: 'Magnesium Bisglycinate',
        action: 'Dose 3: Nutrient [3] (2 capsules) + chamomile tea.',
        why: 'Relaxes muscle fibers and triggers deep REM restorative sleep.'
      }
    ];

    const stepW = (p1Width - 72 - 18) / 4;
    const sH = 145;
    dailySteps.forEach((st, sIdx) => {
      const sX = 36 + sIdx * (stepW + 6);

      page1.drawRectangle({
        x: sX,
        y: y1 - sH,
        width: stepW,
        height: sH,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      page1.drawRectangle({
        x: sX,
        y: y1 - 22,
        width: stepW,
        height: 22,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page1.drawText(st.time, {
        x: sX + 6,
        y: y1 - 15,
        size: 7.2,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: stepW - 12
      });

      page1.drawText(st.meal, {
        x: sX + 6,
        y: y1 - 34,
        size: 7.0,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: stepW - 12
      });

      page1.drawText(st.step, {
        x: sX + 6,
        y: y1 - 50,
        size: 8.5,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: stepW - 12
      });

      page1.drawText(st.action, {
        x: sX + 6,
        y: y1 - 70,
        size: 7.8,
        font: helvetica,
        color: darkSlate,
        maxWidth: stepW - 12,
        lineHeight: 10.2
      });

      page1.drawLine({
        start: { x: sX + 6, y: y1 - 104 },
        end: { x: sX + stepW - 6, y: y1 - 104 },
        thickness: 0.6,
        color: cardBorder
      });

      page1.drawText(st.why, {
        x: sX + 6,
        y: y1 - 118,
        size: 7.2,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: stepW - 12,
        lineHeight: 9.5
      });
    });

    y1 -= (sH + 12);

    // -------------------------------------------------------------------------
    // SECTION 5: KITCHEN FRIDGE REMINDER (High Legibility 8.0pt)
    // -------------------------------------------------------------------------
    const kH = 46;
    page1.drawRectangle({
      x: 36,
      y: y1 - kH,
      width: p1Width - 72,
      height: kH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1.0
    });

    page1.drawText('3 GOLDEN KITCHEN RULES FOR DAILY MEAL SUCCESS:', {
      x: 48,
      y: y1 - 15,
      size: 8.2,
      font: helveticaBold,
      color: navyPrimary
    });

    const kitchenReminders = '1. Hydration: Drink 2.5L water daily between meals  ·  2. Caffeine Cutoff: Strict zero caffeine past 12:00 PM  ·  3. Overnight Rest: Maintain a 12-hour metabolic rest between dinner and breakfast.';
    page1.drawText(kitchenReminders, {
      x: 48,
      y: y1 - 32,
      size: 7.8,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 96,
      lineHeight: 11.0
    });

    // QR Code for Digital Interactive Portal
    const portalBaseUrl = 'https://med-peptides-app-27a3a.web.app/patient/dna-report';
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

    // Page 2 Footer
    page1.drawText('Page 2 of 3 · Meal Plan & Daily Routine · Turn to Page 3 for Simplified Supplement Packs & Shopping Guide', {
      x: 36,
      y: 18,
      size: 6.8,
      font: helvetica,
      color: mutedSlate
    });

    if (qrImage) {
      page1.drawImage(qrImage, {
        x: p1Width - 36 - 32,
        y: 8,
        width: 30,
        height: 30
      });
      page1.drawText('Digital Portal', {
        x: p1Width - 36 - 88,
        y: 21,
        size: 5.8,
        font: helveticaBold,
        color: navyPrimary
      });
      page1.drawText('Scan to view online ->', {
        x: p1Width - 36 - 88,
        y: 13,
        size: 5.4,
        font: helvetica,
        color: mutedSlate
      });
    }

    // =========================================================================
    // PAGE 2: PERSONALIZED SUPPLEMENTS MADE SIMPLE (PATIENT EDITION)
    // =========================================================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Accent Strip
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: navyPrimary
    });

    let y2 = p2Height - 28;

    // Header Area
    page2.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y2,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const badge2 = 'PAGE 3 OF 3 · SIMPLIFIED SUPPLEMENT GUIDE';
    const badge2W = helveticaBold.widthOfTextAtSize(badge2, 6.8) + 14;
    page2.drawRectangle({
      x: p2Width - 36 - badge2W,
      y: y2 - 3,
      width: badge2W,
      height: 15,
      color: rgb(239 / 255, 246 / 255, 255 / 255),
      borderColor: navyPrimary,
      borderWidth: 1
    });
    page2.drawText(badge2, {
      x: p2Width - 36 - badge2W + 7,
      y: y2 + 2,
      size: 6.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 16;
    page2.drawText('PERSONALIZED SUPPLEMENTATION MADE SIMPLE', {
      x: 36,
      y: y2,
      size: 13,
      font: helveticaBold,
      color: darkSlate
    });

    y2 -= 11;
    page2.drawText('Understand what each nutrient does for you, choose your budget level, and pick how you prefer to take it', {
      x: 36,
      y: y2,
      size: 7.4,
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

    // -------------------------------------------------------------------------
    // SECTION 1: THE 5 SUPPLEMENTS EXPLAINED BY BENEFIT (PLAIN LANGUAGE)
    // -------------------------------------------------------------------------
    y2 -= 16;
    page2.drawText('1. YOUR 5 TARGETED NUTRIENTS (WHAT THEY DO FOR YOUR BODY)', {
      x: 36,
      y: y2,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    const humanSupplements = [
      {
        benefit: '[1] IMMUNITY & BONE STRENGTH',
        nutrient: 'Vitamin D3 + K2 (MK-7)',
        why: 'Your DNA shows slow Vitamin D activation. This synergistic pair directs calcium straight into bones and strengthens daily immune defense.',
        timing: 'Dose 2 (Breakfast): With morning meal containing healthy fats (eggs, olive oil, avocado).',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[2] CELLULAR ENERGY & CLARITY',
        nutrient: 'Active Folate (L-5-MTHF)',
        why: 'Bypasses your MTHFR genetic block to keep you clear-headed. Provides clean cellular energy without synthetic unmethylated buildup.',
        timing: 'Dose 2 (Breakfast): Morning with your breakfast.',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[3] DEEP REST & STRESS RESET',
        nutrient: 'Magnesium Bisglycinate + Theanine',
        why: 'Calms nerve excitability, relaxes muscle tension after exercise, and quiets racing thoughts for deep slow-wave restorative sleep.',
        timing: 'Dose 3 (Bedtime): Take 2 capsules 30–60 min before sleep with room-temp water.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[4] METABOLISM & LIVER BALANCE',
        nutrient: 'Methylated B-Complex (B12 + B6)',
        why: 'Essential cofactors that support homocysteine clearance, healthy nerve myelin, and daytime alertness without jitters.',
        timing: 'Dose 2 (Breakfast): Morning with food.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[5] GUT BARRIER & DIGESTION',
        nutrient: 'Targeted Enteric Probiotics',
        why: 'Protective cultures (LGG + BB-12) that re-seed healthy gut flora and defend against bloat, gas, and dairy sensitivities.',
        timing: 'Dose 1 (Upon Waking): First thing upon waking with room-temperature water.',
        priority: 'PRIORITY 3 · OPTIONAL',
        pColor: amberText,
        pBg: amberBg
      }
    ];

    y2 -= 6;
    humanSupplements.forEach((s) => {
      const cardH = 76;
      y2 -= cardH;

      page2.drawRectangle({
        x: 36,
        y: y2,
        width: p2Width - 72,
        height: cardH,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Left Accent Strip
      page2.drawRectangle({
        x: 36,
        y: y2,
        width: 4.5,
        height: cardH,
        color: s.pColor
      });

      // Header strip inside card
      page2.drawRectangle({
        x: 40.5,
        y: y2 + cardH - 22,
        width: p2Width - 76.5,
        height: 22,
        color: rgb(248 / 255, 250 / 255, 252 / 255)
      });

      // Benefit Header & Nutrient Name
      page2.drawText(s.benefit, {
        x: 48,
        y: y2 + cardH - 15,
        size: 8.8,
        font: helveticaBold,
        color: navyPrimary
      });

      page2.drawText(`· ${s.nutrient}`, {
        x: 48 + helveticaBold.widthOfTextAtSize(s.benefit, 8.8) + 8,
        y: y2 + cardH - 15,
        size: 8.4,
        font: helveticaBold,
        color: tealAccent
      });

      // Priority Pill
      const pillW = helveticaBold.widthOfTextAtSize(s.priority, 6.4) + 12;
      page2.drawRectangle({
        x: p2Width - 44 - pillW,
        y: y2 + cardH - 17,
        width: pillW,
        height: 14,
        color: s.pBg,
        borderColor: s.pColor,
        borderWidth: 0.8
      });
      page2.drawText(s.priority, {
        x: p2Width - 44 - pillW + 6,
        y: y2 + cardH - 13,
        size: 6.4,
        font: helveticaBold,
        color: s.pColor
      });

      // Why Text (High legibility 8.0pt)
      page2.drawText(`Why your DNA needs this: ${s.why}`, {
        x: 48,
        y: y2 + 34,
        size: 8.0,
        font: helvetica,
        color: darkSlate,
        maxWidth: p2Width - 100,
        lineHeight: 11.0
      });

      // Timing Text
      page2.drawText(`How to take: ${s.timing}`, {
        x: 48,
        y: y2 + 13,
        size: 7.6,
        font: helveticaBold,
        color: mutedSlate
      });

      y2 -= 7;
    });

    // -------------------------------------------------------------------------
    // SECTION 2: CHOOSE YOUR LEVEL (3 SIMPLE DECISION PACKS - GOOGLE CLOUD UX)
    // -------------------------------------------------------------------------
    y2 -= 8;
    page2.drawText('2. CHOOSE YOUR LEVEL: 3 SIMPLE DECISION PACKS (BUY ONLY WHAT YOU NEED)', {
      x: 36,
      y: y2,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 10;
    const pkW = (p2Width - 72 - 16) / 3;
    const pkH = 114;
    const packs = [
      {
        badge: 'ESSENTIAL · BASELINE',
        badgeColor: mutedSlate,
        badgeBg: gcpPillBg,
        badgeBorder: gcpBorder,
        name: 'PACK 1 · ESSENTIAL CORE',
        subtitle: '2 Supplements · Baseline DNA Coverage',
        items: [
          '• [1] Vitamin D3 + K2 (MK-7)',
          '• [2] Active Folate (L-5-MTHF)'
        ],
        note: 'Covers 80% of core DNA needs with minimal routine.',
        isFeatured: false
      },
      {
        badge: 'RECOMMENDED · POPULAR',
        badgeColor: googleBlue,
        badgeBg: googleBlueBg,
        badgeBorder: googleBlueBorder,
        name: 'PACK 2 · PERFORMANCE & SLEEP',
        subtitle: '4 Supplements · Daytime + Night Rest',
        items: [
          '+ Includes All Pack 1 ([1] + [2])',
          '• [3] Magnesium Bisglycinate',
          '• [4] Methylated B-Complex'
        ],
        note: 'Stops afternoon fatigue & restores deep REM sleep.',
        isFeatured: true
      },
      {
        badge: 'ADVANCED · FULL PROGRAM',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        badgeBorder: gcpGreenBorder,
        name: 'PACK 3 · TOTAL DIGESTION',
        subtitle: '5 Supplements · Full Program',
        items: [
          '+ Includes All Pack 2 ([1]..[4])',
          '• [5] Targeted Enteric Probiotics'
        ],
        note: 'Complete coverage for gut defense & lactose.',
        isFeatured: false
      }
    ];

    packs.forEach((pk, pIdx) => {
      const pkX = 36 + pIdx * (pkW + 8);

      // Card surface: Clean White surface with GCP subtle border
      // Featured card gets Google Blue 1.5px border
      page2.drawRectangle({
        x: pkX,
        y: y2 - pkH,
        width: pkW,
        height: pkH,
        color: white,
        borderColor: pk.isFeatured ? googleBlue : gcpBorder,
        borderWidth: pk.isFeatured ? 1.5 : 1.0
      });

      // Top subtle header strip
      page2.drawRectangle({
        x: pkX + (pk.isFeatured ? 1.5 : 1),
        y: y2 - 24,
        width: pkW - (pk.isFeatured ? 3 : 2),
        height: 23,
        color: pk.isFeatured ? rgb(248 / 255, 251 / 255, 255 / 255) : rgb(250 / 255, 251 / 255, 252 / 255)
      });

      // GCP Semantic Badge
      const bW = helveticaBold.widthOfTextAtSize(pk.badge, 5.8) + 10;
      page2.drawRectangle({
        x: pkX + 8,
        y: y2 - 16,
        width: bW,
        height: 12,
        color: pk.badgeBg,
        borderColor: pk.badgeBorder,
        borderWidth: 0.8
      });
      page2.drawText(pk.badge, {
        x: pkX + 13,
        y: y2 - 13,
        size: 5.8,
        font: helveticaBold,
        color: pk.badgeColor
      });

      // Title
      page2.drawText(pk.name, {
        x: pkX + 8,
        y: y2 - 34,
        size: 7.2,
        font: helveticaBold,
        color: pk.isFeatured ? googleBlue : darkSlate,
        maxWidth: pkW - 16
      });

      // Items subtitle
      page2.drawText(pk.subtitle, {
        x: pkX + 8,
        y: y2 - 44,
        size: 6.4,
        font: helveticaBold,
        color: mutedSlate,
        maxWidth: pkW - 16
      });

      // Divider line
      page2.drawLine({
        start: { x: pkX + 8, y: y2 - 48 },
        end: { x: pkX + pkW - 8, y: y2 - 48 },
        thickness: 0.6,
        color: gcpBorder
      });

      // Items list
      let itemY = y2 - 59;
      pk.items.forEach((it) => {
        const isIncludes = it.startsWith('+ Includes');
        page2.drawText(it, {
          x: pkX + 8,
          y: itemY,
          size: 6.7,
          font: isIncludes ? helveticaBold : helvetica,
          color: isIncludes ? (pk.isFeatured ? googleBlue : darkSlate) : darkSlate,
          maxWidth: pkW - 16
        });
        itemY -= 12.0;
      });

      // Note at bottom
      page2.drawText(`Why: ${pk.note}`, {
        x: pkX + 8,
        y: y2 - pkH + 9,
        size: 6.0,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: pkW - 16,
        lineHeight: 8.0
      });
    });

    y2 -= (pkH + 16);

    // -------------------------------------------------------------------------
    // SECTION 3: HOW DO YOU PREFER TO TAKE IT? (PHARMACY VS COMPOUNDING)
    // Conforms strictly to Google Cloud UX: 100% symmetric, neutral cards
    // -------------------------------------------------------------------------
    y2 -= 4;
    page2.drawText('3. HOW DO YOU PREFER TO TAKE IT? (TWO SIMPLE SHOPPING PATHWAYS)', {
      x: 36,
      y: y2,
      size: 11.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 10;
    const pathwayW = (p2Width - 72 - 12) / 2;
    const pathwayH = 88;

    // Pathway 1: Local Doha Pharmacy (Neutral Google Cloud UX Card)
    page2.drawRectangle({
      x: 36,
      y: y2 - pathwayH,
      width: pathwayW,
      height: pathwayH,
      color: white,
      borderColor: gcpBorder,
      borderWidth: 1.0
    });

    // Pill badge for Option A
    const p1Pill = 'RETAIL PHARMACY TRACK';
    const p1PillW = helveticaBold.widthOfTextAtSize(p1Pill, 6.2) + 12;
    page2.drawRectangle({
      x: 48,
      y: y2 - 18,
      width: p1PillW,
      height: 12,
      color: gcpPillBg,
      borderColor: gcpBorder,
      borderWidth: 0.8
    });
    page2.drawText(p1Pill, {
      x: 54,
      y: y2 - 15,
      size: 6.2,
      font: helveticaBold,
      color: gcpPillText
    });

    page2.drawText('OPTION A: LOCAL DOHA PHARMACIES (COMMERCIAL)', {
      x: 48,
      y: y2 - 32,
      size: 7.8,
      font: helveticaBold,
      color: navyPrimary
    });
    const p1Desc = '• Buy 2 to 5 separate bottles at retail pharmacies in Qatar (Commercial OTC Bottles).\n• Pros: Immediate local purchase at neighborhood pharmacy.\n• Cons: Taking 4–6 pills from multiple bottles with non-customized generic doses.';
    page2.drawText(p1Desc, {
      x: 48,
      y: y2 - 47,
      size: 7.2,
      font: helvetica,
      color: darkSlate,
      maxWidth: pathwayW - 24,
      lineHeight: 10.5
    });

    // Pathway 2: Custom Compounding All-in-One (Neutral Google Cloud UX Card)
    page2.drawRectangle({
      x: 36 + pathwayW + 12,
      y: y2 - pathwayH,
      width: pathwayW,
      height: pathwayH,
      color: white,
      borderColor: gcpBorder,
      borderWidth: 1.0
    });

    // Pill badge for Option B
    const p2Pill = 'CLINICAL COMPOUNDING TRACK';
    const p2PillW = helveticaBold.widthOfTextAtSize(p2Pill, 6.2) + 12;
    page2.drawRectangle({
      x: 48 + pathwayW + 12,
      y: y2 - 18,
      width: p2PillW,
      height: 12,
      color: gcpPillBg,
      borderColor: gcpBorder,
      borderWidth: 0.8
    });
    page2.drawText(p2Pill, {
      x: 54 + pathwayW + 12,
      y: y2 - 15,
      size: 6.2,
      font: helveticaBold,
      color: gcpPillText
    });

    page2.drawText('OPTION B: OFFICIAL 3-DOSE COMPOUNDED REGIMEN', {
      x: 48 + pathwayW + 12,
      y: y2 - 32,
      size: 7.8,
      font: helveticaBold,
      color: navyPrimary
    });
    const p2Desc = '• Have your selected pack ([1]-[2], [1]-[4], or [1]-[5]) custom-compounded into exactly 3 timed daily doses: Dose 1 (Upon Waking), Dose 2 (Breakfast), and Dose 3 (Bedtime).\n• Pros: Exactly 3 intake moments, 100% vegetable cellulose (DRcaps®), lactose-free, exact micro-dosages.\n• To order: Hand the prescription order on Page 3 to your clinic.';
    page2.drawText(p2Desc, {
      x: 48 + pathwayW + 12,
      y: y2 - 47,
      size: 7.2,
      font: helvetica,
      color: darkSlate,
      maxWidth: pathwayW - 24,
      lineHeight: 10.5
    });

    y2 -= (pathwayH + 12);

    // Safety Alert
    const safeH = 40;
    page2.drawRectangle({
      x: 36,
      y: y2 - safeH,
      width: p2Width - 72,
      height: safeH,
      color: redBg,
      borderColor: redBorder,
      borderWidth: 0.8
    });

    page2.drawText('CRITICAL SAFETY RULE: MUTUALLY EXCLUSIVE PATHWAYS', {
      x: 48,
      y: y2 - 14,
      size: 7.0,
      font: helveticaBold,
      color: redText
    });
    page2.drawText('Choose either Option A OR Option B. Never take both together to prevent accidental double-dosing of Vitamin D or minerals.', {
      x: 48,
      y: y2 - 28,
      size: 6.4,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 96
    });

    // Page 3 Footer
    page2.drawText('Page 3 of 3 · Atlas Health Services · Personalized Supplement Guide · Designed for patient clarity & adherence · www.atlashealthservices.com', {
      x: 36,
      y: 18,
      size: 6.8,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // SECTION II: MERGE ORIGINAL 24GENETICS LABORATORY REPORT (IF REQUESTED)
    // =========================================================================
    const includeOriginal = searchParams.get('full') !== 'false' && searchParams.get('includeOriginal') !== 'false';

    if (includeOriginal) {
      const originalPdfPath = path.join(process.cwd(), 'public/reports/24genetics/G000943554_Nutrition.pdf');
      if (fs.existsSync(originalPdfPath)) {
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
        dividerPage.drawText('• Clinical Scope: Complete nutritional predispositions, metabolic profiles & cofactors.', {
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
            title: '1. Nutrigenomic Sensitivities & Food Intolerances',
            sub: 'Lactose intolerance, salt sensitivity, caffeine metabolism, and gluten predisposition',
            page: 'Page 4'
          },
          {
            title: '2. Vitamin & Mineral Metabolic Needs',
            sub: 'Vitamins D, B9 (Folate), B12, C, Iron, Calcium, and antioxidant defenses',
            page: 'Page 12'
          },
          {
            title: '3. Macronutrients & Metabolic Profile',
            sub: 'Lipid metabolism, saturated fat response, carbohydrate absorption, and satiety index',
            page: 'Page 24'
          },
          {
            title: '4. Dietary Effectiveness & Energy Balance',
            sub: 'Low-carb vs Mediterranean diet effectiveness, caloric restriction, and exercise impact',
            page: 'Page 42'
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

          // Page Badge on Right
          const pBadgeW = 50;
          dividerPage.drawRectangle({
            x: dWidth - 56 - pBadgeW - 16,
            y: tocY - 3,
            width: pBadgeW,
            height: 14,
            color: rgb(240 / 255, 253 / 255, 250 / 255),
            borderColor: tealAccent,
            borderWidth: 0.8
          });
          dividerPage.drawText(item.page, {
            x: dWidth - 56 - pBadgeW - 10,
            y: tocY + 1,
            size: 6.8,
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

        // Append 55 Original Pages
        const originalBytes = fs.readFileSync(originalPdfPath);
        const originalPdf = await PDFDocument.load(originalBytes);
        const copiedPages = await pdfDoc.copyPages(originalPdf, originalPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Atlas-MealPlan-Guide-${sampleId}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('[API /api/reports/24genomics-mealplan-pdf] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan guide PDF', details: error.message },
      { status: 500 }
    );
  }
}
