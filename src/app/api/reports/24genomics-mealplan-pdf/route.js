import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import {
  evaluateNutrigenomicProfile,
  DEFAULT_HOSSAM_GENOTYPES
} from '@/data/genomics/clinicalNutrigenomicEngine';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientName = searchParams.get('patient') || 'Hossam Ahmed';
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const clinicName = searchParams.get('clinic') || 'Ryhanh Medical Wellness · Doha, Qatar';
    const mealPlanPartner = searchParams.get('partner') || 'Ryhanh Healthy Meal Plan & Diet Delivery';

    // Execute dynamic clinical nutrigenomics rules engine
    const plan = evaluateNutrigenomicProfile({
      patientName,
      sampleCode: sampleId,
      clinic: clinicName
    });

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Universal WinAnsi font and text sanitizer (prevents WinAnsi encoding crashes)
    const sanitizePdfText = (str = '') => {
      if (!str || typeof str !== 'string') return '';
      const map = {
        '🥬': '[Veg]', '🐟': '[Fish]', '🫒': '[Oil]', '🍵': '[Tea]', '🥗': '[Diet]',
        '🌍': '[Global]', '✨': '[*]', '⚡': '[!]', '🧠': '[Brain]',
        '≥': '>=', '≤': '<=', '•': '-', '·': '|', '—': '-', '–': '-', '≈': '~',
        'µ': 'u', '²': '2', 'º': 'o', '®': '(R)', '™': '(TM)', '€': 'EUR',
        'é': 'e', 'á': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
      };
      let res = str;
      for (const [k, v] of Object.entries(map)) {
        res = res.replaceAll(k, v);
      }
      return res.replace(/[^\x20-\x7E\t\n\r]/g, '');
    };

    const origWidthOfTextAtSize = helvetica.widthOfTextAtSize.bind(helvetica);
    helvetica.widthOfTextAtSize = (t, s) => origWidthOfTextAtSize(sanitizePdfText(t), s);

    const origBoldWidthOfTextAtSize = helveticaBold.widthOfTextAtSize.bind(helveticaBold);
    helveticaBold.widthOfTextAtSize = (t, s) => origBoldWidthOfTextAtSize(sanitizePdfText(t), s);

    const origObliqueWidthOfTextAtSize = helveticaOblique.widthOfTextAtSize.bind(helveticaOblique);
    helveticaOblique.widthOfTextAtSize = (t, s) => origObliqueWidthOfTextAtSize(sanitizePdfText(t), s);

    const origAddPage = pdfDoc.addPage.bind(pdfDoc);
    pdfDoc.addPage = (dims) => {
      const pg = origAddPage(dims);
      const origDrawText = pg.drawText.bind(pg);
      pg.drawText = (text, options) => origDrawText(sanitizePdfText(text), options);
      return pg;
    };

    // Robust, dynamic word-wrapping & text block renderer (Prevents text overlap on PDFs)
    const getWrappedLines = (text, font, size, maxWidth) => {
      if (!text) return [];
      const clean = sanitizePdfText(text);
      const words = clean.trim().split(/\s+/);
      const lines = [];
      let curLine = '';

      for (const word of words) {
        const testLine = curLine ? `${curLine} ${word}` : word;
        const testW = font.widthOfTextAtSize(testLine, size);
        if (testW <= maxWidth) {
          curLine = testLine;
        } else {
          if (curLine) lines.push(curLine);
          curLine = word;
        }
      }
      if (curLine) lines.push(curLine);
      return lines;
    };

    const drawWrappedBlock = (targetPage, text, { x, y, size, font, color, maxWidth, lineHeight, maxLines = 10 }) => {
      const lines = getWrappedLines(text, font, size, maxWidth).slice(0, maxLines);
      let curY = y;
      for (const line of lines) {
        targetPage.drawText(line, { x, y: curY, size, font, color });
        curY -= lineHeight;
      }
      return curY;
    };

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
        audience: 'FOR YOU (DAILY HABITS)',
        badgeColor: googleBlue,
        badgeBg: rgb(232 / 255, 240 / 255, 254 / 255),
        title: 'Your DNA in Plain English, Plate Rule & 24-Hour Routine',
        desc: 'Explains your 4 key DNA traits without medical jargon, the 1-2-3 Plate Rule (Veggies -> Protein -> Carbs last), and your morning-to-bedtime routine.'
      },
      {
        badge: 'STEP 2 · PAGE 3',
        audience: 'FOR YOUR KITCHEN / CATERING CHEF',
        badgeColor: tealAccent,
        badgeBg: rgb(240 / 255, 253 / 255, 250 / 255),
        title: 'Your 7-Day Precision Meal Plan (Monday to Sunday)',
        desc: 'Ready-to-use breakfast, lunch, and dinner menu for all 7 days of the week. Share this page directly with your home kitchen or meal delivery service.'
      },
      {
        badge: 'STEP 3 · PAGE 4',
        audience: 'FOR SUPERMARKET SHOPPING',
        badgeColor: gcpGreen,
        badgeBg: gcpGreenBg,
        title: 'Complete Personalized Food List (All 4 Groups & 17 Food Families)',
        desc: '115+ foods across all 17 food families classified by traffic light: GREEN (Eat Freely), AMBER (1-3x/week or timing rule), and RED (Avoid).'
      },
      {
        badge: 'STEP 4 · PAGE 5',
        audience: 'FOR YOUR DOCTOR / PHARMACY',
        badgeColor: gcpAmber,
        badgeBg: gcpAmberBg,
        title: 'Your 5 Targeted Nutrients, 3 Simple Packs & Pharmacy Options',
        desc: 'Explains what each vitamin/mineral does, lets you pick Pack 1, 2, or 3, and compares buying at a local pharmacy (Option A) vs. 3-Capsule Compounding (Option B).'
      },
      {
        badge: 'ANNEX · PAGES 6+',
        audience: 'FOR CLINICAL ARCHIVE',
        badgeColor: mutedSlate,
        badgeBg: rgb(241 / 255, 243 / 255, 244 / 255),
        title: 'Full 24Genetics Laboratory Sequencing Report (55 Pages)',
        desc: 'Official raw laboratory report across Vitamins, Minerals, Metabolism, and Food Intolerances with a quick-jump page directory.'
      }
    ];

    coverRoadmap.forEach((sec) => {
      const sH = 44;
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
      const bW = helveticaBold.widthOfTextAtSize(sec.badge, 6.2) + 10;
      coverPage.drawRectangle({
        x: 54,
        y: yCover - 15,
        width: bW,
        height: 11,
        color: sec.badgeBg,
        borderColor: cardBorder,
        borderWidth: 0.7
      });
      coverPage.drawText(sec.badge, {
        x: 59,
        y: yCover - 12,
        size: 6.2,
        font: helveticaBold,
        color: sec.badgeColor
      });

      // Title
      coverPage.drawText(sec.title, {
        x: 54 + bW + 6,
        y: yCover - 12,
        size: 7.6,
        font: helveticaBold,
        color: darkSlate
      });

      // Audience Pill on Right
      const audW = helveticaBold.widthOfTextAtSize(sec.audience, 5.6) + 10;
      coverPage.drawRectangle({
        x: cWidth - 52 - audW,
        y: yCover - 15,
        width: audW,
        height: 11,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 0.6
      });
      coverPage.drawText(sec.audience, {
        x: cWidth - 52 - audW + 5,
        y: yCover - 12,
        size: 5.6,
        font: helveticaBold,
        color: navyPrimary
      });

      drawWrappedBlock(coverPage, sec.desc, {
        x: 54,
        y: yCover - 25,
        size: 6.7,
        font: helvetica,
        color: mutedSlate,
        maxWidth: cWidth - 108,
        lineHeight: 8.8,
        maxLines: 2
      });

      yCover -= (sH + 5);
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

    const badge1 = 'PAGE 2 OF 5 · FOOD-FIRST CLINICAL GUIDE & FOOD LIST';
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
    page1.drawText('PERSONALIZED GENOMIC NUTRITION & FOOD STRATEGY', {
      x: 36,
      y: y1,
      size: 14.0,
      font: helveticaBold,
      color: darkSlate
    });

    y1 -= 13;
    page1.drawText('DNA-guided plate sequencing, satiety thresholds, and circadian chronobiology', {
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
    // SECTION 1: YOUR DNA IN 4 PLAIN-ENGLISH FINDINGS (2x2 Grid, Zero Overlap)
    // -------------------------------------------------------------------------
    y1 -= 15;
    page1.drawText('1. YOUR GENETIC PROFILE IN PLAIN ENGLISH (HUMAN-FIRST SUMMARY)', {
      x: 36,
      y: y1,
      size: 10.2,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 7;
    const plainFindings = [
      {
        badge: 'SATIETY · GEN MC4R',
        title: 'Appetite & Fullness Signal',
        action: 'Your brain receives the "I am full" signal slower. Eat 1 palm-sized protein (30-35g) per meal and chew slowly to stay full for 5 hours.'
      },
      {
        badge: 'VITALITY · GEN MTHFR',
        title: 'Active Vitamins & Vitality',
        action: 'Your body uses only 30% of common synthetic folic acid. Take Active Natural Folate (L-5-MTHF) and eat leafy greens & eggs daily.'
      },
      {
        badge: 'ENERGY · GEN IRS1',
        title: 'Steady Sugar & Energy',
        action: 'White bread and fast rice cause afternoon sleepiness. Eat salad first, protein second, and leave rice/potato for last (max 1 fist).'
      },
      {
        badge: 'SAFETY · GEN ZPR1',
        title: 'Skip Vitamin E Pills',
        action: 'Your body accumulates synthetic Vitamin E from pills. Never take Vitamin E supplements; get it naturally from olive oil & raw almonds.'
      }
    ];

    const boxW = (p1Width - 72 - 14) / 2;
    let maxFindingTextH = 0;
    plainFindings.forEach((f) => {
      const lines = getWrappedLines(f.action, helvetica, 7.2, boxW - 20);
      const h = 26 + lines.length * 9.5 + 12;
      if (h > maxFindingTextH) maxFindingTextH = h;
    });
    const boxH = Math.max(66, maxFindingTextH);

    plainFindings.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bX = 36 + col * (boxW + 14);
      const bY = y1 - (row * (boxH + 7)) - boxH;

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
      const bW = helveticaBold.widthOfTextAtSize(f.badge, 5.8) + 10;
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
        size: 5.8,
        font: helveticaBold,
        color: tealAccent
      });

      page1.drawText(f.title, {
        x: bX + 12 + bW,
        y: bY + boxH - 13.5,
        size: 8.0,
        font: helveticaBold,
        color: navyPrimary
      });

      drawWrappedBlock(page1, f.action, {
        x: bX + 10,
        y: bY + boxH - 27,
        size: 7.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: boxW - 20,
        lineHeight: 9.5,
        maxLines: 3
      });
    });

    y1 -= (2 * boxH + 7 + 13);

    // -------------------------------------------------------------------------
    // SECTION 2: MEAL PLAN TRAFFIC LIGHT (DNA OPTIMIZED CATERING - ZERO OVERLAP)
    // -------------------------------------------------------------------------
    page1.drawText('2. DAILY FOOD TRAFFIC LIGHT (QUICK SUMMARY · SEE ALL 17 FAMILIES ON PAGE 4)', {
      x: 36,
      y: y1,
      size: 10.2,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 7;
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
    // Dynamically compute required column height with 16pt bottom breathing room
    let maxColContentH = 0;
    trafficCols.forEach((tc) => {
      let colH = 44; // header + top spacing
      tc.items.forEach((it) => {
        const wrapped = getWrappedLines(it, helvetica, 6.8, colW - 22);
        colH += wrapped.length * 8.8 + 4.0;
      });
      if (colH > maxColContentH) maxColContentH = colH;
    });
    const cH = Math.max(138, maxColContentH + 14);

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
      const bW = helveticaBold.widthOfTextAtSize(tc.badge, 6.0) + 12;
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
        size: 6.0,
        font: helveticaBold,
        color: tc.badgeColor
      });

      // Line 2: Subtitle
      page1.drawText(tc.subtitle, {
        x: cX + 8,
        y: y1 - 29,
        size: 6.5,
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

      // Items list with colored bullet dot and exact wrapped line stepping
      let iY = y1 - 44;
      tc.items.forEach((it) => {
        page1.drawText('•', {
          x: cX + 8,
          y: iY,
          size: 7.0,
          font: helveticaBold,
          color: tc.accentColor
        });
        iY = drawWrappedBlock(page1, it, {
          x: cX + 16,
          y: iY,
          size: 6.8,
          font: helvetica,
          color: darkSlate,
          maxWidth: colW - 22,
          lineHeight: 8.8,
          maxLines: 2
        });
        iY -= 4.0;
      });
    });

    y1 -= (cH + 11);

    // -------------------------------------------------------------------------
    // SECTION 3: THE GOLDEN PLATE SEQUENCING RULE
    // -------------------------------------------------------------------------
    const seqH = 54;
    page1.drawRectangle({
      x: 36,
      y: y1 - seqH,
      width: p1Width - 72,
      height: seqH,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1.2
    });

    page1.drawText('THE 1-2-3 PLATE ORDER RULE (STOPS AFTERNOON SUGAR CRASHES):', {
      x: 48,
      y: y1 - 14,
      size: 8.0,
      font: helveticaBold,
      color: tealAccent
    });

    const seqText = 'Eat every meal in this order:  (1) Salad & veggies FIRST  ->  (2) Fish, meat or eggs SECOND  ->  (3) Rice, potato or bread LAST.\nWhy it works: Fiber and protein coat your stomach first, cutting blood sugar spikes by 45% and keeping your energy steady all afternoon.';
    drawWrappedBlock(page1, seqText, {
      x: 48,
      y: y1 - 27,
      size: 7.2,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 96,
      lineHeight: 10.0,
      maxLines: 3
    });

    y1 -= (seqH + 12);

    // -------------------------------------------------------------------------
    // SECTION 4: 24-HOUR DAILY ROUTINE WITH YOUR MEALS (Chronobiology)
    // -------------------------------------------------------------------------
    page1.drawText('3. YOUR 24-HOUR DAILY ROUTINE (MEALS & 3 SIMPLE SUPPLEMENT MOMENTS)', {
      x: 36,
      y: y1,
      size: 10.2,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 7;
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

    const stepW = (p1Width - 72 - 18) / 4;
    let maxStepH = 0;
    dailySteps.forEach((st) => {
      const actLines = getWrappedLines(st.action, helvetica, 6.8, stepW - 12);
      const whyLines = getWrappedLines(`Why help: ${st.why}`, helveticaOblique, 6.4, stepW - 12);
      const neededH = 56 + actLines.length * 8.8 + 12 + whyLines.length * 8.2 + 14;
      if (neededH > maxStepH) maxStepH = neededH;
    });
    const sH = Math.max(134, maxStepH);

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
        y: y1 - 20,
        width: stepW,
        height: 20,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page1.drawText(st.time, {
        x: sX + 6,
        y: y1 - 13,
        size: 6.5,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: stepW - 12
      });

      page1.drawText(st.meal, {
        x: sX + 6,
        y: y1 - 31,
        size: 6.5,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: stepW - 12
      });

      page1.drawText(st.step, {
        x: sX + 6,
        y: y1 - 44,
        size: 7.6,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: stepW - 12
      });

      drawWrappedBlock(page1, st.action, {
        x: sX + 6,
        y: y1 - 57,
        size: 6.8,
        font: helvetica,
        color: darkSlate,
        maxWidth: stepW - 12,
        lineHeight: 8.8,
        maxLines: 3
      });

      page1.drawLine({
        start: { x: sX + 6, y: y1 - 88 },
        end: { x: sX + stepW - 6, y: y1 - 88 },
        thickness: 0.6,
        color: cardBorder
      });

      drawWrappedBlock(page1, `Why it helps: ${st.why}`, {
        x: sX + 6,
        y: y1 - 98,
        size: 6.4,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: stepW - 12,
        lineHeight: 8.2,
        maxLines: 3
      });
    });

    y1 -= (sH + 10);

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
    page1.drawText('Page 2 of 5 · Genetic Foundations & Food Traffic Light · Atlas Health Services · www.atlashealthservices.com', {
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
    // PAGE 3: 7-DAY NUTRIGENOMIC MEAL PLAN (MON TO SUN) (PAGE 3 OF 5)
    // Conforms strictly to Google Cloud UX: Dedicated page, generous height,
    // zero text overlap, full-width Day 7 card with independent columns.
    // =========================================================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Accent Strip
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: tealAccent
    });

    let y2 = p2Height - 28;

    // Header Area
    page2.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y2,
      size: 9.0,
      font: helveticaBold,
      color: navyPrimary
    });

    const badge2 = 'PAGE 3 OF 5 · 7-DAY PRECISION MEAL PLAN';
    const badge2W = helveticaBold.widthOfTextAtSize(badge2, 7.5) + 16;
    page2.drawRectangle({
      x: p2Width - 36 - badge2W,
      y: y2 - 4,
      width: badge2W,
      height: 18,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1.2
    });
    page2.drawText(badge2, {
      x: p2Width - 36 - badge2W + 8,
      y: y2 + 1,
      size: 7.5,
      font: helveticaBold,
      color: tealAccent
    });

    y2 -= 18;
    page2.drawText('7-DAY NUTRIGENOMIC MEAL PLAN (MONDAY TO SUNDAY)', {
      x: 36,
      y: y2,
      size: 14.0,
      font: helveticaBold,
      color: darkSlate
    });

    y2 -= 13;
    page2.drawText('Precision culinary formulation using strictly allowed green-light foods · Sourced for Qatar & GCC', {
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
      thickness: 1.0,
      color: cardBorder
    });

    // -------------------------------------------------------------------------
    // DAYS 1 TO 6: 2-COLUMN GRID (Height: 182pt each, ample breathing room)
    // -------------------------------------------------------------------------
    y2 -= 16;
    page2.drawText('1. WEEKDAY PRECISION NUTRITION (MON TO SAT)', {
      x: 36,
      y: y2,
      size: 10.0,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 8;
    const planColW = (p2Width - 72 - 12) / 2;
    const dayBoxH = 175;

    plan.sevenDayMealPlan.slice(0, 6).forEach((d, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const dX = 36 + col * (planColW + 12);
      const dY = y2 - (row * (dayBoxH + 8)) - dayBoxH;

      page2.drawRectangle({
        x: dX,
        y: dY,
        width: planColW,
        height: dayBoxH,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Top Header Strip
      page2.drawRectangle({
        x: dX,
        y: dY + dayBoxH - 22,
        width: planColW,
        height: 22,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page2.drawText(`DAY ${d.day} | ${d.dayName.toUpperCase()}`, {
        x: dX + 8,
        y: dY + dayBoxH - 11,
        size: 7.2,
        font: helveticaBold,
        color: navyPrimary
      });

      page2.drawText(d.themeEn, {
        x: dX + 8,
        y: dY + dayBoxH - 19,
        size: 5.8,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: planColW - 16
      });

      // Meals text with generous line wrapping & separation
      let mealY = dY + dayBoxH - 32;

      // Breakfast block
      page2.drawText('BREAKFAST', {
        x: dX + 8,
        y: mealY,
        size: 5.6,
        font: helveticaBold,
        color: mutedSlate
      });
      mealY -= 8;
      mealY = drawWrappedBlock(page2, d.breakfast, {
        x: dX + 8,
        y: mealY,
        size: 6.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: planColW - 16,
        lineHeight: 8.0,
        maxLines: 3
      });
      mealY -= 5;

      // Lunch block
      page2.drawText('LUNCH (PLATE SEQUENCING)', {
        x: dX + 8,
        y: mealY,
        size: 5.6,
        font: helveticaBold,
        color: mutedSlate
      });
      mealY -= 8;
      mealY = drawWrappedBlock(page2, d.lunch, {
        x: dX + 8,
        y: mealY,
        size: 6.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: planColW - 16,
        lineHeight: 8.0,
        maxLines: 4
      });
      mealY -= 5;

      // Dinner block
      page2.drawText('DINNER', {
        x: dX + 8,
        y: mealY,
        size: 5.6,
        font: helveticaBold,
        color: mutedSlate
      });
      mealY -= 8;
      drawWrappedBlock(page2, d.dinner, {
        x: dX + 8,
        y: mealY,
        size: 6.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: planColW - 16,
        lineHeight: 8.0,
        maxLines: 3
      });
    });

    y2 -= (3 * (dayBoxH + 8) + 6);

    // -------------------------------------------------------------------------
    // DAY 7: SUNDAY CIRCADIAN RESET FULL-WIDTH CARD (Height: 90pt)
    // 3 Dedicated Sub-Columns for Breakfast, Lunch, Dinner - Zero collision!
    // -------------------------------------------------------------------------
    const d7 = plan.sevenDayMealPlan[6] || {
      day: 7,
      dayName: 'Sunday',
      themeEn: 'Circadian Fasting & Gastrointestinal Rest',
      breakfast: 'Fasting friendly morning: Filtered water with Celtic salt, then 2 soft-boiled eggs with arugula.',
      lunch: 'Plate Sequencing: Massaged kale salad -> 180g wild tuna steak -> 1/3 cup brown rice.',
      dinner: 'Mineral-rich vegetable broth with poached cod fillet and steamed zucchini.'
    };
    const d7H = 92;

    page2.drawRectangle({
      x: 36,
      y: y2 - d7H,
      width: p2Width - 72,
      height: d7H,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1.0
    });

    // Sunday Header Strip
    page2.drawRectangle({
      x: 36,
      y: y2 - 20,
      width: p2Width - 72,
      height: 20,
      color: rgb(241 / 255, 245 / 255, 249 / 255)
    });

    page2.drawText('DAY 7 | SUNDAY: CIRCADIAN FASTING & DEEP GASTROINTESTINAL REST', {
      x: 46,
      y: y2 - 13,
      size: 7.2,
      font: helveticaBold,
      color: navyPrimary
    });
    page2.drawText('REST & WEEKLY RESET PROTOCOL', {
      x: p2Width - 36 - 150,
      y: y2 - 13,
      size: 6.2,
      font: helveticaBold,
      color: tealAccent
    });

    // 3 Sub-columns for Sunday meals
    const d7ColW = (p2Width - 72 - 32) / 3;
    const d7Meals = [
      { label: 'BREAKFAST (GENTLE AWAKENING)', desc: d7.breakfast },
      { label: 'LUNCH (METABOLIC NOURISHMENT)', desc: d7.lunch },
      { label: 'DINNER (CELLULAR REST)', desc: d7.dinner }
    ];

    d7Meals.forEach((m, mIdx) => {
      const colX = 46 + mIdx * (d7ColW + 12);
      const colTopY = y2 - 30;

      page2.drawText(m.label, {
        x: colX,
        y: colTopY,
        size: 5.6,
        font: helveticaBold,
        color: mutedSlate
      });

      drawWrappedBlock(page2, m.desc, {
        x: colX,
        y: colTopY - 9,
        size: 6.2,
        font: helvetica,
        color: darkSlate,
        maxWidth: d7ColW,
        lineHeight: 8.0,
        maxLines: 5
      });
    });

    // Page 3 Footer
    page2.drawText('Page 3 of 5 · Atlas Health Services · Precision 7-Day Meal Plan · Sourced for Qatar & GCC · www.atlashealthservices.com', {
      x: 36,
      y: 18,
      size: 6.8,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // PAGE 4: COMPLETE FAGRON NUTRIGEN™ 17-FAMILY FOOD MATRIX (PAGE 4 OF 5)
    // Covers 100% of the 4 Official Macro-Groups & 17 Sub-Families (116 Foods)
    // =========================================================================
    const pageGrocery = pdfDoc.addPage([595.28, 841.89]);
    const { width: pgWidth, height: pgHeight } = pageGrocery.getSize();

    // Top Accent Strip
    pageGrocery.drawRectangle({
      x: 0,
      y: pgHeight - 8,
      width: pgWidth,
      height: 8,
      color: tealAccent
    });

    let yg = pgHeight - 26;

    // Header Area
    pageGrocery.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: yg,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const badgeG = 'PAGE 4 OF 5 · COMPLETE 17-FAMILY FOOD LIST';
    const badgeGW = helveticaBold.widthOfTextAtSize(badgeG, 7.0) + 14;
    pageGrocery.drawRectangle({
      x: pgWidth - 36 - badgeGW,
      y: yg - 3,
      width: badgeGW,
      height: 16,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1.0
    });
    pageGrocery.drawText(badgeG, {
      x: pgWidth - 36 - badgeGW + 7,
      y: yg + 1.5,
      size: 7.0,
      font: helveticaBold,
      color: tealAccent
    });

    yg -= 16;
    pageGrocery.drawText('COMPLETE PERSONALIZED FOOD LIST (ALL 17 FAMILIES)', {
      x: 36,
      y: yg,
      size: 13.0,
      font: helveticaBold,
      color: darkSlate
    });

    yg -= 11;
    pageGrocery.drawText('115+ foods across all 4 Macro-Groups (CARBO+, PROTEIN+, LIPID+, EXTRAS) & 17 Sub-Families classified for your DNA', {
      x: 36,
      y: yg,
      size: 7.6,
      font: helvetica,
      color: mutedSlate
    });

    yg -= 8;
    pageGrocery.drawLine({
      start: { x: 36, y: yg },
      end: { x: pgWidth - 36, y: yg },
      thickness: 0.9,
      color: cardBorder
    });

    // -------------------------------------------------------------------------
    // SECTION 1: 17-SUBFAMILY TRAFFIC-LIGHT MATRIX TABLE
    // -------------------------------------------------------------------------
    yg -= 6;
    const tableW = pgWidth - 72; // 523.28pt
    const col1W = 108; // Sub-Family & Group
    const col2W = 148; // GREEN: Eat Freely
    const col3W = 136; // AMBER: Moderate / Rule
    const col4W = tableW - col1W - col2W - col3W; // RED: Avoid (~131.28pt)

    const col1X = 36;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;

    // Table Header Bar
    const thH = 18;
    pageGrocery.drawRectangle({
      x: col1X,
      y: yg - thH,
      width: col1W,
      height: thH,
      color: navyPrimary
    });
    pageGrocery.drawText('FOOD FAMILY (17)', {
      x: col1X + 5,
      y: yg - 12,
      size: 6.2,
      font: helveticaBold,
      color: white
    });

    pageGrocery.drawRectangle({
      x: col2X,
      y: yg - thH,
      width: col2W,
      height: thH,
      color: gcpGreen
    });
    pageGrocery.drawText('GREEN · EAT FREELY (SUPERFOODS)', {
      x: col2X + 5,
      y: yg - 12,
      size: 6.2,
      font: helveticaBold,
      color: white
    });

    pageGrocery.drawRectangle({
      x: col3X,
      y: yg - thH,
      width: col3W,
      height: thH,
      color: gcpAmber
    });
    pageGrocery.drawText('AMBER · 1-2x/WK OR RULE', {
      x: col3X + 5,
      y: yg - 12,
      size: 6.2,
      font: helveticaBold,
      color: white
    });

    pageGrocery.drawRectangle({
      x: col4X,
      y: yg - thH,
      width: col4W,
      height: thH,
      color: gcpRed
    });
    pageGrocery.drawText('RED · AVOID (DNA CONFLICT)', {
      x: col4X + 5,
      y: yg - 12,
      size: 6.2,
      font: helveticaBold,
      color: white
    });

    yg -= thH;

    const matrixRows = plan.fagron17SubfamilyMatrix || [];
    const rowH = 36.2;

    matrixRows.forEach((sub, rIdx) => {
      const rY = yg - rowH;
      const isEven = rIdx % 2 === 0;

      // Row Background & Cell Tints
      pageGrocery.drawRectangle({
        x: col1X,
        y: rY,
        width: col1W,
        height: rowH,
        color: isEven ? rgb(248 / 255, 250 / 255, 252 / 255) : white,
        borderColor: cardBorder,
        borderWidth: 0.5
      });
      pageGrocery.drawRectangle({
        x: col2X,
        y: rY,
        width: col2W,
        height: rowH,
        color: isEven ? rgb(244 / 255, 253 / 255, 247 / 255) : white,
        borderColor: cardBorder,
        borderWidth: 0.5
      });
      pageGrocery.drawRectangle({
        x: col3X,
        y: rY,
        width: col3W,
        height: rowH,
        color: isEven ? rgb(255 / 255, 252 / 255, 240 / 255) : white,
        borderColor: cardBorder,
        borderWidth: 0.5
      });
      pageGrocery.drawRectangle({
        x: col4X,
        y: rY,
        width: col4W,
        height: rowH,
        color: isEven ? rgb(254 / 255, 246 / 255, 246 / 255) : white,
        borderColor: cardBorder,
        borderWidth: 0.5
      });

      // Col 1: Macro-Group Pill + Sub-family Name
      const grpColor =
        sub.group === 'CARBO+' ? tealAccent :
        sub.group === 'PROTEIN+' ? googleBlue :
        sub.group === 'LIPID+' ? gcpAmber : navyPrimary;

      pageGrocery.drawText(`${sub.group} · ${sub.code}`, {
        x: col1X + 5,
        y: rY + rowH - 10,
        size: 5.5,
        font: helveticaBold,
        color: grpColor
      });

      const cleanSubName = sub.labelEn.replace(/^\d+\.\d+\.\d+\s*/, '');
      drawWrappedBlock(pageGrocery, cleanSubName, {
        x: col1X + 5,
        y: rY + rowH - 19,
        size: 6.2,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: col1W - 10,
        lineHeight: 7.4,
        maxLines: 2
      });

      // Col 2: Green Foods
      drawWrappedBlock(pageGrocery, sub.greenSummaryEn, {
        x: col2X + 5,
        y: rY + rowH - 10,
        size: 5.6,
        font: helvetica,
        color: darkSlate,
        maxWidth: col2W - 10,
        lineHeight: 7.2,
        maxLines: 4
      });

      // Col 3: Amber Foods
      drawWrappedBlock(pageGrocery, sub.yellowSummaryEn, {
        x: col3X + 5,
        y: rY + rowH - 10,
        size: 5.6,
        font: helvetica,
        color: darkSlate,
        maxWidth: col3W - 10,
        lineHeight: 7.2,
        maxLines: 4
      });

      // Col 4: Red Foods
      drawWrappedBlock(pageGrocery, sub.redSummaryEn, {
        x: col4X + 5,
        y: rY + rowH - 10,
        size: 5.6,
        font: helvetica,
        color: redText,
        maxWidth: col4W - 10,
        lineHeight: 7.2,
        maxLines: 4
      });

      yg -= rowH;
    });

    // -------------------------------------------------------------------------
    // SECTION 2: 4 QUICK KITCHEN SWAPS (BOTTOM SUMMARY STRIP)
    // -------------------------------------------------------------------------
    yg -= 8;
    const swapBoxH = 54;
    pageGrocery.drawRectangle({
      x: 36,
      y: yg - swapBoxH,
      width: pgWidth - 72,
      height: swapBoxH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.9
    });

    pageGrocery.drawText('4 ESSENTIAL KITCHEN SWAPS FOR YOUR GENES (REMOVE -> REPLACE):', {
      x: 46,
      y: yg - 12,
      size: 7.2,
      font: helveticaBold,
      color: navyPrimary
    });

    const quickSwaps = [
      '1. Cooking Oils: Replace sunflower/corn/canola oil -> with Cold-Pressed Extra Virgin Olive Oil (EVOO) or Ghee.',
      '2. Bread & Grains: Replace white bread & fortified cereals -> with quinoa, buckwheat, lentils or 1 slice rye sourdough.',
      '3. Dairy (MCM6): Replace cow milk & soft cream cheese -> with fermented goat/sheep kefir, sheep feta or almond milk.',
      '4. Drinks (ADORA2A): Replace afternoon coffee & sodas -> with morning matcha (before 11 AM), sparkling water & chamomile.'
    ];

    const swColW = (pgWidth - 72 - 28) / 2;
    quickSwaps.forEach((sw, sIdx) => {
      const sCol = sIdx % 2;
      const sRow = Math.floor(sIdx / 2);
      drawWrappedBlock(pageGrocery, sw, {
        x: 46 + sCol * (swColW + 10),
        y: yg - 24 - sRow * 15,
        size: 5.9,
        font: helvetica,
        color: darkSlate,
        maxWidth: swColW,
        lineHeight: 7.0,
        maxLines: 2
      });
    });

    // Page 4 Footer
    pageGrocery.drawText('Page 4 of 5 · Complete 17-Family Personalized Food Matrix (115+ Foods) · Atlas Health Services · www.atlashealthservices.com', {
      x: 36,
      y: 18,
      size: 6.8,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // PAGE 5: PERSONALIZED SUPPLEMENTS MADE SIMPLE (PATIENT EDITION) (PAGE 5 OF 5)
    // Conforms strictly to Clinical Golden Rule: Targeted Supplements placed at
    // the end as supporting co-factors, never before food-first nutrition.
    // =========================================================================
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p3Width, height: p3Height } = page3.getSize();

    // Top Accent Strip
    page3.drawRectangle({
      x: 0,
      y: p3Height - 8,
      width: p3Width,
      height: 8,
      color: navyPrimary
    });

    let y3 = p3Height - 28;

    // Header Area
    page3.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y3,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const badge3 = 'PAGE 5 OF 5 · TARGETED SUPPLEMENTS & CLINICAL DISPENSING';
    const badge3W = helveticaBold.widthOfTextAtSize(badge3, 6.8) + 14;
    page3.drawRectangle({
      x: p3Width - 36 - badge3W,
      y: y3 - 3,
      width: badge3W,
      height: 15,
      color: rgb(239 / 255, 246 / 255, 255 / 255),
      borderColor: navyPrimary,
      borderWidth: 1
    });
    page3.drawText(badge3, {
      x: p3Width - 36 - badge3W + 7,
      y: y3 + 2,
      size: 6.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y3 -= 16;
    page3.drawText('TARGETED SUPPLEMENTS & CLINICAL DISPENSING OPTIONS', {
      x: 36,
      y: y3,
      size: 13,
      font: helveticaBold,
      color: darkSlate
    });

    y3 -= 11;
    page3.drawText('Understand what each nutrient does in plain language, choose your pack, and pick how you prefer to take it', {
      x: 36,
      y: y3,
      size: 7.4,
      font: helvetica,
      color: mutedSlate
    });

    y3 -= 8;
    page3.drawLine({
      start: { x: 36, y: y3 },
      end: { x: p3Width - 36, y: y3 },
      thickness: 1,
      color: cardBorder
    });

    // -------------------------------------------------------------------------
    // SECTION 1: THE 5 SUPPLEMENTS EXPLAINED BY BENEFIT (PLAIN LANGUAGE)
    // -------------------------------------------------------------------------
    y3 -= 15;
    page3.drawText('1. YOUR 5 TARGETED NUTRIENTS (WHAT THEY DO FOR YOUR BODY)', {
      x: 36,
      y: y3,
      size: 10.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const humanSupplements = [
      {
        benefit: '[1] IMMUNITY & BONE STRENGTH',
        nutrient: 'Vitamin D3 + K2 (MK-7)',
        why: 'Your Vitamin D receptors work slower (VDR gene). This pair directs calcium safely into bones and supports immunity.',
        timing: 'Dose 2 (Breakfast): Take with breakfast containing healthy fats (eggs, olive oil, or avocado).',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[2] ACTIVE VITAMINS & VITALITY',
        nutrient: 'Active Natural Folate (L-5-MTHF)',
        why: 'Your body uses only 30% of common synthetic folic acid (MTHFR gene). Active Folate gives clean cellular energy directly.',
        timing: 'Dose 2 (Breakfast): Take in the morning with your breakfast.',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: '[3] DEEP SLEEP & MUSCLE RECOVERY',
        nutrient: 'Magnesium Bisglycinate + L-Theanine',
        why: 'Calms evening nerve tension, relaxes muscles after exercise, and helps you fall into deep restorative sleep.',
        timing: 'Dose 3 (Bedtime): Take 2 capsules 30-60 min before sleep with water.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[4] METABOLISM & MENTAL FOCUS',
        nutrient: 'Active B-Complex (Methyl-B12 + Active B6)',
        why: 'Works alongside Active Folate to clear homocysteine, protect nerves, and keep daytime energy steady.',
        timing: 'Dose 2 (Breakfast): Take in the morning with breakfast.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: '[5] GUT COMFORT & DAIRY SHIELD',
        nutrient: 'Probiotics in Acid-Resistant Vegetable Capsule',
        why: 'Live beneficial bacteria (LGG + BB-12) protected in a delayed-release vegetable capsule to prevent bloating and sensitivity.',
        timing: 'Dose 1 (Upon Waking): Take 15-30 min before breakfast on an empty stomach with water.',
        priority: 'PRIORITY 3 · OPTIONAL',
        pColor: amberText,
        pBg: amberBg
      }
    ];

    y3 -= 6;
    humanSupplements.forEach((s) => {
      const cardH = 66;
      y3 -= cardH;

      page3.drawRectangle({
        x: 36,
        y: y3,
        width: p3Width - 72,
        height: cardH,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1.0
      });

      // Left Accent Strip
      page3.drawRectangle({
        x: 36,
        y: y3,
        width: 4.5,
        height: cardH,
        color: s.pColor
      });

      // Header strip inside card
      page3.drawRectangle({
        x: 40.5,
        y: y3 + cardH - 20,
        width: p3Width - 76.5,
        height: 20,
        color: rgb(248 / 255, 250 / 255, 252 / 255)
      });

      // Benefit Header & Nutrient Name
      page3.drawText(s.benefit, {
        x: 48,
        y: y3 + cardH - 14,
        size: 8.2,
        font: helveticaBold,
        color: navyPrimary
      });

      page3.drawText(`· ${s.nutrient}`, {
        x: 48 + helveticaBold.widthOfTextAtSize(s.benefit, 8.2) + 6,
        y: y3 + cardH - 14,
        size: 7.8,
        font: helveticaBold,
        color: tealAccent
      });

      // Priority Pill
      const pillW = helveticaBold.widthOfTextAtSize(s.priority, 6.0) + 12;
      page3.drawRectangle({
        x: p3Width - 44 - pillW,
        y: y3 + cardH - 16,
        width: pillW,
        height: 13,
        color: s.pBg,
        borderColor: s.pColor,
        borderWidth: 0.8
      });
      page3.drawText(s.priority, {
        x: p3Width - 44 - pillW + 6,
        y: y3 + cardH - 12,
        size: 6.0,
        font: helveticaBold,
        color: s.pColor
      });

      // Why Text
      drawWrappedBlock(page3, `Why it helps you: ${s.why}`, {
        x: 48,
        y: y3 + 33,
        size: 7.3,
        font: helvetica,
        color: darkSlate,
        maxWidth: p3Width - 96,
        lineHeight: 9.2,
        maxLines: 2
      });

      // Timing Text
      page3.drawText(`When to take: ${s.timing}`, {
        x: 48,
        y: y3 + 8,
        size: 7.0,
        font: helveticaBold,
        color: mutedSlate
      });

      y3 -= 5.5;
    });

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

    y3 -= 8;
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

    let maxPkH = 0;
    packs.forEach((pk) => {
      const noteLines = getWrappedLines(`Why: ${pk.note}`, helveticaOblique, 6.2, pkW - 16);
      const h = 58 + pk.items.length * 11.5 + 8 + noteLines.length * 8.0 + 12;
      if (h > maxPkH) maxPkH = h;
    });
    const pkH = Math.max(118, maxPkH);

    packs.forEach((pk, pIdx) => {
      const pkX = 36 + pIdx * (pkW + 8);

      page3.drawRectangle({
        x: pkX,
        y: y3 - pkH,
        width: pkW,
        height: pkH,
        color: white,
        borderColor: pk.isFeatured ? googleBlue : gcpBorder,
        borderWidth: pk.isFeatured ? 1.5 : 1.0
      });

      // Top subtle header strip
      page3.drawRectangle({
        x: pkX + (pk.isFeatured ? 1.5 : 1),
        y: y3 - 23,
        width: pkW - (pk.isFeatured ? 3 : 2),
        height: 22,
        color: pk.isFeatured ? rgb(248 / 255, 251 / 255, 255 / 255) : rgb(250 / 255, 251 / 255, 252 / 255)
      });

      // GCP Semantic Badge
      const bW = helveticaBold.widthOfTextAtSize(pk.badge, 5.8) + 10;
      page3.drawRectangle({
        x: pkX + 8,
        y: y3 - 16,
        width: bW,
        height: 12,
        color: pk.badgeBg,
        borderColor: pk.badgeBorder,
        borderWidth: 0.8
      });
      page3.drawText(pk.badge, {
        x: pkX + 13,
        y: y3 - 13,
        size: 5.8,
        font: helveticaBold,
        color: pk.badgeColor
      });

      // Title
      page3.drawText(pk.name, {
        x: pkX + 8,
        y: y3 - 33,
        size: 7.0,
        font: helveticaBold,
        color: pk.isFeatured ? googleBlue : darkSlate,
        maxWidth: pkW - 16
      });

      // Items subtitle
      page3.drawText(pk.subtitle, {
        x: pkX + 8,
        y: y3 - 43,
        size: 6.2,
        font: helveticaBold,
        color: mutedSlate,
        maxWidth: pkW - 16
      });

      // Divider line
      page3.drawLine({
        start: { x: pkX + 8, y: y3 - 47 },
        end: { x: pkX + pkW - 8, y: y3 - 47 },
        thickness: 0.6,
        color: gcpBorder
      });

      // Items list
      let itemY = y3 - 58;
      pk.items.forEach((it) => {
        const isIncludes = it.startsWith('+ Includes');
        page3.drawText(it, {
          x: pkX + 8,
          y: itemY,
          size: 6.6,
          font: isIncludes ? helveticaBold : helvetica,
          color: isIncludes ? (pk.isFeatured ? googleBlue : darkSlate) : darkSlate,
          maxWidth: pkW - 16
        });
        itemY -= 11.5;
      });

      // Note at bottom with guaranteed 12pt bottom padding
      drawWrappedBlock(page3, `Why: ${pk.note}`, {
        x: pkX + 8,
        y: y3 - pkH + 20,
        size: 6.2,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: pkW - 16,
        lineHeight: 8.0,
        maxLines: 2
      });
    });

    y3 -= (pkH + 13);

    // -------------------------------------------------------------------------
    // SECTION 3: HOW DO YOU PREFER TO TAKE IT? (PHARMACY VS COMPOUNDING - ZERO OVERLAP)
    // -------------------------------------------------------------------------
    page3.drawText('3. HOW DO YOU PREFER TO TAKE IT? (TWO SIMPLE WAYS TO GET YOUR PACK)', {
      x: 36,
      y: y3,
      size: 10.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y3 -= 8;
    const pathwayW = (p3Width - 72 - 12) / 2;

    const pathwayOptions = [
      {
        pill: 'OPTION A · LOCAL PHARMACY',
        title: 'OPTION A: BUY COMMERCIAL BOTTLES AT A PHARMACY',
        bullets: [
          'What it is: Buy 2 to 5 separate commercial bottles at any local pharmacy.',
          'Advantage: Immediate same-day purchase without waiting for lab preparation.',
          'How to buy: Show the active nutrient list above to your local pharmacist.'
        ]
      },
      {
        pill: 'OPTION B · CUSTOM COMPOUNDED',
        title: 'OPTION B: ALL-IN-ONE 3 DAILY CAPSULES (PHARMACY LAB)',
        bullets: [
          'What it is: Your pack custom-made into 3 daily capsules (Waking, Breakfast, Bedtime).',
          'Advantage: Fewer pills, 100% lactose-free vegetable capsules, exact DNA doses.',
          'How to order: Share the prescription order with your doctor or compounding pharmacy.'
        ]
      }
    ];

    let maxPathwayContentH = 0;
    pathwayOptions.forEach((opt) => {
      let h = 42;
      opt.bullets.forEach((b) => {
        const lines = getWrappedLines(b, helvetica, 6.8, pathwayW - 26);
        h += lines.length * 8.8 + 4.0;
      });
      if (h > maxPathwayContentH) maxPathwayContentH = h;
    });
    const pathwayH = Math.max(98, maxPathwayContentH + 12);

    pathwayOptions.forEach((opt, optIdx) => {
      const pX = 36 + optIdx * (pathwayW + 12);

      page3.drawRectangle({
        x: pX,
        y: y3 - pathwayH,
        width: pathwayW,
        height: pathwayH,
        color: white,
        borderColor: gcpBorder,
        borderWidth: 1.0
      });

      const pillW = helveticaBold.widthOfTextAtSize(opt.pill, 6.0) + 12;
      page3.drawRectangle({
        x: pX + 10,
        y: y3 - 17,
        width: pillW,
        height: 12,
        color: gcpPillBg,
        borderColor: gcpBorder,
        borderWidth: 0.8
      });
      page3.drawText(opt.pill, {
        x: pX + 16,
        y: y3 - 14,
        size: 6.0,
        font: helveticaBold,
        color: gcpPillText
      });

      page3.drawText(opt.title, {
        x: pX + 10,
        y: y3 - 30,
        size: 7.3,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: pathwayW - 20
      });

      let bY = y3 - 43;
      opt.bullets.forEach((b) => {
        page3.drawText('•', {
          x: pX + 10,
          y: bY,
          size: 7.0,
          font: helveticaBold,
          color: tealAccent
        });
        bY = drawWrappedBlock(page3, b, {
          x: pX + 18,
          y: bY,
          size: 6.8,
          font: helvetica,
          color: darkSlate,
          maxWidth: pathwayW - 26,
          lineHeight: 8.8,
          maxLines: 2
        });
        bY -= 4.0;
      });
    });

    y3 -= (pathwayH + 10);

    // Safety Alert
    const safeH = 38;
    page3.drawRectangle({
      x: 36,
      y: y3 - safeH,
      width: p3Width - 72,
      height: safeH,
      color: redBg,
      borderColor: redBorder,
      borderWidth: 0.8
    });

    page3.drawText('CRITICAL SAFETY RULE: CHOOSE EITHER OPTION A OR OPTION B (NEVER BOTH AT ONCE)', {
      x: 48,
      y: y3 - 13,
      size: 6.9,
      font: helveticaBold,
      color: redText
    });
    page3.drawText('Option A and Option B contain the exact same nutrients. Pick one track only to avoid taking a double dose of Vitamin D or minerals.', {
      x: 48,
      y: y3 - 26,
      size: 6.4,
      font: helvetica,
      color: darkSlate,
      maxWidth: p3Width - 96
    });

    // Page 5 Footer
    page3.drawText('Page 5 of 5 · Atlas Health Services · Personalized Supplement Guide · Designed for patient clarity & adherence · www.atlashealthservices.com', {
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
