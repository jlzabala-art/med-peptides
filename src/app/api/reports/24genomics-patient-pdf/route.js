import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import {
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  THREE_CAPSULE_PROTOCOL,
  CONCRETE_DIET_GUIDELINES,
  TREATMENT_CYCLE,
  COMMERCIAL_LOCAL_SUPPLEMENTS,
  PRESCRIPTION_COMPARISON
} from '@/data/genomics/clinicalNutrigenomicEngine';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientName = searchParams.get('patient') || 'Hossam Ahmed';
    const sampleId = searchParams.get('sample') || '24G-QA-90421';
    const clinicName = searchParams.get('clinic') || 'Ryhanh Medical Wellness · Doha, Qatar';
    const modalityParam = searchParams.get('modality') || 'modalityB';
    const isOptionA = modalityParam === 'optionA' || modalityParam === 'modalityA';

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
    const gcpBorder = rgb(218 / 255, 220 / 255, 224 / 255);     // #dadce0 (GCP Card Border)
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
    // PAGE 1: PATIENT CLINICAL & NUTRIGENOMIC GUIDE (COPIA PARA EL PACIENTE)
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

    // Header Area: Left Title & Right Role Badge
    let y = p1Height - 34;

    page1.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y,
      size: 11,
      font: helveticaBold,
      color: navyPrimary
    });

    // Page 1 Role Badge (PATIENT COPY)
    const p1Badge = 'PAGE 1 OF 3 · PATIENT CLINICAL GUIDE';
    const p1BadgeWidth = helveticaBold.widthOfTextAtSize(p1Badge, 7) + 14;
    page1.drawRectangle({
      x: p1Width - 36 - p1BadgeWidth,
      y: y - 3,
      width: p1BadgeWidth,
      height: 16,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1
    });
    page1.drawText(p1Badge, {
      x: p1Width - 36 - p1BadgeWidth + 7,
      y: y + 2,
      size: 7,
      font: helveticaBold,
      color: tealAccent
    });

    y -= 14;
    page1.drawText('PERSONALIZED GENOMIC HEALTH PLAN · 60-DAY CLINICAL PROTOCOL', {
      x: 36,
      y,
      size: 9.5,
      font: helveticaBold,
      color: darkSlate
    });

    y -= 11;
    page1.drawText('Individualized Translation Based on Your 24Genetics Nutrition Report · 3-Capsule Patient Schedule', {
      x: 36,
      y,
      size: 7.5,
      font: helveticaBold,
      color: tealAccent
    });

    y -= 8;
    page1.drawLine({
      start: { x: 36, y },
      end: { x: p1Width - 36, y },
      thickness: 1,
      color: cardBorder
    });

    // Patient Dossier Mini-Banner (Google Cloud Console Metadata Summary Pattern)
    y -= 42;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 38,
      color: lightBg,
      borderColor: gcpBorder,
      borderWidth: 0.8
    });

    // Top subtle strip for labels
    page1.drawRectangle({
      x: 36,
      y: y + 25,
      width: p1Width - 72,
      height: 13,
      color: rgb(241 / 255, 245 / 255, 249 / 255)
    });

    // Vertical column dividers
    [165, 290, 410].forEach(divX => {
      page1.drawLine({
        start: { x: divX, y },
        end: { x: divX, y: y + 38 },
        thickness: 0.6,
        color: gcpBorder
      });
    });

    // Col 1: Patient
    page1.drawText('PATIENT NAME', { x: 44, y: y + 28, size: 5.8, font: helveticaBold, color: mutedSlate });
    page1.drawText(patientName, { x: 44, y: y + 11, size: 8.5, font: helveticaBold, color: darkSlate, maxWidth: 115 });
    page1.drawText('Verified DNA Specimen', { x: 44, y: y + 3, size: 5.6, font: helvetica, color: tealAccent });

    // Col 2: Specimen
    page1.drawText('SPECIMEN / LAB ID', { x: 173, y: y + 28, size: 5.8, font: helveticaBold, color: mutedSlate });
    page1.drawText(sampleId, { x: 173, y: y + 11, size: 8.0, font: helveticaBold, color: darkSlate });
    page1.drawText('24Genetics CE-IVD Lab', { x: 173, y: y + 3, size: 5.6, font: helvetica, color: mutedSlate });

    // Col 3: Protocol Duration
    page1.drawText('PROTOCOL DURATION', { x: 298, y: y + 28, size: 5.8, font: helveticaBold, color: mutedSlate });
    page1.drawText('60-Day Initial Cycle', { x: 298, y: y + 11, size: 8.0, font: helveticaBold, color: tealAccent });
    page1.drawText('Size 0 Regimen (Re-test 60d)', { x: 298, y: y + 3, size: 5.6, font: helvetica, color: mutedSlate });

    // Col 4: Dispensing Standard
    page1.drawText('DISPENSING STANDARD', { x: 418, y: y + 28, size: 5.8, font: helveticaBold, color: mutedSlate });
    page1.drawText('Size 0 Magistral Caps', { x: 418, y: y + 11, size: 8.0, font: helveticaBold, color: navyPrimary });
    page1.drawText('100% Lactose-Free HPMC', { x: 418, y: y + 3, size: 5.6, font: helvetica, color: tealAccent });

    // Section 1: Notice to Patient (Google Cloud Console Callout Pattern)
    y -= 30;
    const noticeH = 28;
    page1.drawRectangle({
      x: 36,
      y: y - noticeH,
      width: p1Width - 72,
      height: noticeH,
      color: rgb(232 / 255, 240 / 255, 254 / 255), // GCP Blue Tint #e8f0fe
      borderColor: gcpBorder,
      borderWidth: 0.8
    });
    // Left Accent Bar (Google Cloud Console Callout Style)
    page1.drawRectangle({
      x: 36,
      y: y - noticeH,
      width: 3.5,
      height: noticeH,
      color: rgb(26 / 255, 115 / 255, 232 / 255) // #1a73e8
    });
    page1.drawText('PATIENT NOTICE & CLINICAL ACTION TRANSLATION', {
      x: 46,
      y: y - 11,
      size: 6.8,
      font: helveticaBold,
      color: rgb(26 / 255, 115 / 255, 232 / 255)
    });
    page1.drawText('This guide translates findings from your 24Genetics Nutrition DNA test into clear daily actions. Turn to PAGE 2 for the Official Compounding Pharmacy Order.', {
      x: 46,
      y: y - 22,
      size: 5.9,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 92
    });

    // The 4 Functional DNA Pillars
    y -= (noticeH + 12);
    page1.drawText('1. The 4 DNA Pillars: What Your Genetics Mean in Plain Language', {
      x: 36,
      y,
      size: 9.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const pillarCardDefs = [
      {
        pillarTag: 'PILLAR 1: GLYCEMIC METABOLISM (TCF7L2 / FTO)',
        title: 'Carbohydrate Sensitivity & Postprandial Glucose',
        status: 'GLUCOSE SENSITIVE',
        statusColor: alertRed,
        statusBg: badgeRedBg,
        why: 'Refined carbs trigger rapid insulin surges, promoting mid-afternoon energy crashes and abdominal fat storage.',
        assignedFormulation: 'Dietary Plate Sequencing + Optional Module D (Psyllium 5g sachet if HbA1c is elevated)',
        clinicalGoal: 'Blunts postprandial glucose excursions up to 45% via food order; avoids systemic pharmacologic berberine.'
      },
      {
        pillarTag: 'PILLAR 2: CELLULAR METHYLATION & ENERGY (MTHFR C677T)',
        title: 'Active Folate & Homocysteine Recycling Pathway',
        status: 'MTHFR PRIORITY',
        statusColor: alertRed,
        statusBg: badgeRedBg,
        why: 'Your liver is slower at activating synthetic folic acid, requiring active methylfolate and its FAD enzyme cofactor.',
        assignedFormulation: 'Formulation 2 (Capsule B · Breakfast with fat) — Active 5-MTHF + Riboflavin + B12 + P5P',
        clinicalGoal: 'Supports cellular methylation with active 5-MTHF, Riboflavin (MTHFR FAD cofactor), Methyl-B12, and P5P.'
      },
      {
        pillarTag: 'PILLAR 3: GUT MICROBIOME & BARRIER (MCM6 / LCT)',
        title: 'Lactose Intolerance & Microbiota Diversity',
        status: 'LACTOSE-FREE SHIELD',
        statusColor: blueDark,
        statusBg: blueBg,
        why: 'Adult lactase non-persistence requires dietary lactose avoidance or exogenous lactase; supports beneficial flora.',
        assignedFormulation: 'Formulation 1 (Capsule A · Morning Acid-Resistant DRcaps® with LGG 10B + BB-12 5B CFU)',
        clinicalGoal: 'Delivers verified probiotic strains in acid-resistant DRcaps®; dietary lactose-free advice recommended.'
      },
      {
        pillarTag: 'PILLAR 4: IMMUNITY & BONE HEALTH (VDR FokI / CYP1A2)',
        title: 'Vitamin D Receptor Signaling & Restorative Sleep',
        status: 'VDR RESISTANCE',
        statusColor: amberDark,
        statusBg: amberBg,
        why: 'Nuclear receptor variation benefits from physiological D3/K2; evening chelated magnesium supports restorative sleep.',
        assignedFormulation: 'Capsule B (Breakfast D3 2,000 IU + K2 100µg) & Capsule C (Evening 150mg elemental Mg + Theanine 200mg)',
        clinicalGoal: 'Maintains optimal 25(OH)D safely within EU adult UL, paired with evening chelated magnesium and L-theanine.'
      }
    ];

    y -= 14;
    pillarCardDefs.forEach((p) => {
      const cardHeight = 72;
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
        color: p.statusColor
      });

      // Top Pillar Label
      page1.drawText(p.pillarTag, {
        x: 48,
        y: y - 13,
        size: 7.6,
        font: helveticaBold,
        color: tealAccent
      });

      // Title
      page1.drawText(p.title, {
        x: 48,
        y: y - 24,
        size: 9.2,
        font: helveticaBold,
        color: darkSlate
      });

      // Status Pill
      const pillWidth = helveticaBold.widthOfTextAtSize(p.status, 6.5) + 12;
      page1.drawRectangle({
        x: p1Width - 46 - pillWidth,
        y: y - 22,
        width: pillWidth,
        height: 14,
        color: p.statusBg
      });
      page1.drawText(p.status, {
        x: p1Width - 46 - pillWidth + 6,
        y: y - 18,
        size: 6.5,
        font: helveticaBold,
        color: p.statusColor
      });

      // Safe font-fitting helper to guarantee zero wrap & zero collision on any screen/platform
      const fitTextSize = (txt, font, baseSize, maxW) => {
        let s = baseSize;
        while (s > 6.4 && font.widthOfTextAtSize(txt, s) > maxW) {
          s -= 0.1;
        }
        return s;
      };

      const maxCardTextWidth = p1Width - 96;

      // Why Text (DNA Finding in plain language)
      const whyStr = `DNA Finding: ${p.why}`;
      const whySize = fitTextSize(whyStr, helvetica, 7.8, maxCardTextWidth);
      page1.drawText(whyStr, {
        x: 48,
        y: y - 36,
        size: whySize,
        font: helvetica,
        color: darkSlate,
        maxWidth: maxCardTextWidth
      });

      // Galenic Support Cross-Reference
      const supportStr = `Targeted Support: ${p.assignedFormulation}`;
      const supportSize = fitTextSize(supportStr, helveticaBold, 7.6, maxCardTextWidth);
      page1.drawText(supportStr, {
        x: 48,
        y: y - 48,
        size: supportSize,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: maxCardTextWidth
      });

      // Clinical Objective
      const goalStr = `Clinical Goal: ${p.clinicalGoal}`;
      const goalSize = fitTextSize(goalStr, helveticaOblique, 7.2, maxCardTextWidth);
      page1.drawText(goalStr, {
        x: 48,
        y: y - 60,
        size: goalSize,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: maxCardTextWidth
      });

      y -= cardHeight + 8;
    });

    // Section 2: Patient Daily Compounded Schedule (Revised Per Pharmacist Review)
    y -= 6;
    page1.drawText('2. How to Take Your Personalized Formulations (Revised Daily Schedule)', {
      x: 36,
      y,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 14;
    const scheduleBoxWidth = (p1Width - 72 - 16) / 3;

    const patientIntakeSchedule = [
      {
        capName: 'DOSE 1: UPON WAKING',
        targetPillars: 'Nutrient [5] · Probiotics (LGG + BB-12)',
        time: '15–30 min Before Breakfast (Empty Stomach)',
        rule: 'Take 1 capsule (Dose 1) with water. Acid-resistant DRcaps® protect delicate live cultures from gastric acidity.'
      },
      {
        capName: 'DOSE 2: BREAKFAST',
        targetPillars: 'Nutrients [1]+[2] · Folate + D3/K2 (+[4])',
        time: 'With Breakfast (Containing Dietary Fats)',
        rule: 'Take 1 capsule (Dose 2) with eggs, avocado, or olive oil. Dietary fats maximize micellar absorption of D3 and K2.'
      },
      {
        capName: 'DOSE 3: BEDTIME (2 Caps)',
        targetPillars: 'Nutrient [3] · 150mg Mg + Theanine 200mg',
        time: '30–60 min Before Bedtime (2 Capsules)',
        rule: 'Take 2 capsules (Dose 3) with water before sleep. Calms COMT hyper-reactivity, supports restorative sleep & relaxation.'
      }
    ];

    const boxHeight = 84;
    patientIntakeSchedule.forEach((sch, sIdx) => {
      const boxX = 36 + sIdx * (scheduleBoxWidth + 8);

      page1.drawRectangle({
        x: boxX,
        y: y - boxHeight,
        width: scheduleBoxWidth,
        height: boxHeight,
        color: lightBg,
        borderColor: sIdx === 0 ? tealAccent : (sIdx === 1 ? navyPrimary : rgb(30 / 255, 58 / 255, 138 / 255)),
        borderWidth: 0.8
      });

      // Header strip
      page1.drawRectangle({
        x: boxX,
        y: y - 20,
        width: scheduleBoxWidth,
        height: 20,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page1.drawText(sch.capName, {
        x: boxX + 8,
        y: y - 14,
        size: 7.2,
        font: helveticaBold,
        color: sIdx === 0 ? tealAccent : navyPrimary
      });

      page1.drawText(sch.targetPillars, {
        x: boxX + 8,
        y: y - 32,
        size: 6.2,
        font: helveticaBold,
        color: tealAccent
      });

      page1.drawText(sch.time, {
        x: boxX + 8,
        y: y - 44,
        size: 6.5,
        font: helveticaBold,
        color: darkSlate
      });

      page1.drawText(sch.rule, {
        x: boxX + 8,
        y: y - 56,
        size: 5.8,
        font: helvetica,
        color: mutedSlate,
        maxWidth: scheduleBoxWidth - 16,
        lineHeight: 7.6
      });
    });

    y -= (boxHeight + 14);

    // Section 3: High-Adherence Patient Dietary Guidelines (Clean GCP Card, Zero Overlap)
    const dietH = 106;
    page1.drawRectangle({
      x: 36,
      y: y - dietH,
      width: p1Width - 72,
      height: dietH,
      color: white,
      borderColor: gcpBorder,
      borderWidth: 1
    });

    // Top Header Strip
    page1.drawRectangle({
      x: 36,
      y: y - 20,
      width: p1Width - 72,
      height: 20,
      color: rgb(248 / 255, 250 / 255, 252 / 255)
    });

    page1.drawText('3. FOUR CORE PATIENT DIETARY RULES (PLAIN-ENGLISH ACTION GUIDE)', {
      x: 48,
      y: y - 14,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const dietRules = [
      {
        num: '1',
        title: 'Plate Order (Vegetables First):',
        text: 'Eat greens/fiber first -> protein second -> carbs last. Smooths insulin and prevents energy crashes.'
      },
      {
        num: '2',
        title: 'Carb Limit (Under 40g Net):',
        text: 'Keep carbs under 40g per meal. Avoid sugary soft drinks, bottled juices, and white flour pastries.'
      },
      {
        num: '3',
        title: 'Gut Microbiota (Dairy-Free):',
        text: 'Choose coconut kefir, fermented vegetables, and cooled potatoes to nourish your Bifidobacteria.'
      },
      {
        num: '4',
        title: 'Caffeine Cut-Off (Before 12 PM):',
        text: 'Slow CYP1A2 gene: Stop coffee, tea, and stimulants by 12:00 noon to safeguard deep sleep.'
      }
    ];

    let rY = y - 36;
    dietRules.forEach(r => {
      // Number badge pill
      page1.drawRectangle({
        x: 48,
        y: rY - 2,
        width: 14,
        height: 12,
        color: rgb(240 / 255, 253 / 255, 250 / 255),
        borderColor: tealAccent,
        borderWidth: 0.8
      });
      page1.drawText(r.num, {
        x: 53,
        y: rY + 1,
        size: 7.2,
        font: helveticaBold,
        color: tealAccent
      });

      // Title
      page1.drawText(r.title, {
        x: 68,
        y: rY + 1,
        size: 7.4,
        font: helveticaBold,
        color: darkSlate
      });

      const tWidth = helveticaBold.widthOfTextAtSize(r.title, 7.4);

      // Body text starting cleanly after title with strict maxWidth
      page1.drawText(r.text, {
        x: 68 + tWidth + 6,
        y: rY + 1,
        size: 7.0,
        font: helvetica,
        color: mutedSlate,
        maxWidth: p1Width - (68 + tWidth + 6) - 46
      });

      rY -= 19;
    });

    y -= (dietH + 12);

    // Section 4: Clinical Quality & Laboratory Accreditation Banner
    const accredH = 34;
    page1.drawRectangle({
      x: 36,
      y: y - accredH,
      width: p1Width - 72,
      height: accredH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.8
    });

    page1.drawText('ACCREDITED EUROPEAN CLINICAL GENETICS · ILLUMINA INFINIUM GSA-24 PLATFORM', {
      x: 48,
      y: y - 13,
      size: 6.8,
      font: helveticaBold,
      color: navyPrimary
    });

    page1.drawText('Genomic DNA analyzed with clinical-grade Illumina Infinium Global Screening Array (Madrid, Spain). Verified ISO 15189 and CE-IVD bioinformatic workflow.', {
      x: 48,
      y: y - 25,
      size: 6.0,
      font: helvetica,
      color: mutedSlate,
      maxWidth: p1Width - 96
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

    // Page 1 Footer
    page1.drawText('Page 1 of 3 · Patient Clinical Reference Guide · Turn to Page 2 for Pathway 1 (Local OTC) & Page 3 for Pathway 2 (Compounding Order)', {
      x: 36,
      y: 18,
      size: 7,
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
    // PAGE 2: PATHWAY 1 · PERSONALIZED COMMERCIAL SUPPLEMENT RECOMMENDATION (OTC)
    // =========================================================================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2Width, height: p2Height } = page2.getSize();

    // Top Brand Accent Strip (Teal for nutrition & commercial wellness guidance)
    page2.drawRectangle({
      x: 0,
      y: p2Height - 8,
      width: p2Width,
      height: 8,
      color: tealAccent
    });

    let y2 = p2Height - 26;

    // Page 2 Header
    page2.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y2,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const p2Badge = 'PAGE 2 OF 3 · PATHWAY 1: COMMERCIAL OTC SUPPLEMENTS';
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
    page2.drawText('PERSONALIZED MULTIVITAMIN & SUPPLEMENT RECOMMENDATION', {
      x: 36,
      y: y2,
      size: 11.5,
      font: helveticaBold,
      color: darkSlate
    });

    y2 -= 11;
    page2.drawText('Genetically Matched Over-the-Counter Supplements Available for Local Purchase in Qatar & GCC Pharmacies', {
      x: 36,
      y: y2,
      size: 7.2,
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

    // Metadata Ribbon
    y2 -= 12;
    page2.drawText(`PATIENT: ${patientName} (Specimen: ${sampleId})   |   TERRITORY: State of Qatar (Doha OTC)   |   PROTOCOL: 60-Day Commercial OTC Regimen`, {
      x: 36,
      y: y2,
      size: 7.2,
      font: helveticaBold,
      color: tealAccent
    });

    y2 -= 8;
    page2.drawLine({
      start: { x: 36, y: y2 },
      end: { x: p2Width - 36, y: y2 },
      thickness: 0.8,
      color: cardBorder
    });

    // Clinical Directive to Patient: Mutual Exclusivity Safety Alert (GCP Callout Pattern)
    y2 -= 66;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 58,
      color: rgb(253 / 255, 248 / 255, 248 / 255), // GCP Soft Neutral Rose
      borderColor: rgb(254 / 255, 202 / 255, 202 / 255), // Hairline Border
      borderWidth: 0.8
    });

    // Left Accent Strip (GCP Alert Callout)
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: 3.5,
      height: 58,
      color: alertRed
    });

    page2.drawText('CRITICAL CLINICAL SAFETY DIRECTIVE · MUTUALLY EXCLUSIVE THERAPEUTIC PATHWAYS', {
      x: 48,
      y: y2 + 42,
      size: 7.2,
      font: helveticaBold,
      color: alertRed
    });
    const otcDirectiveText = 'Pathway 1 (Commercial OTC) and Pathway 2 (Master Compounding) are ALTERNATIVE clinical approaches to resolve your DNA profile.\nNEVER TAKE BOTH TRACKS CONCURRENTLY: If purchasing retail OTC supplements below, DO NOT take the compounded prescription.\nIf your physician prescribes Pathway 2 (Page 3), it fully replaces all standalone OTC vitamins to prevent micronutrient toxicity (hypervitaminosis).';
    page2.drawText(otcDirectiveText, {
      x: 48,
      y: y2 + 28,
      size: 6.2,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 96,
      lineHeight: 9.5
    });

    // Standardized Titles, Priorities & Gene Targets (Human-Friendly Benefit First)
    const STANDARDIZED_CARD_TITLES = [
      {
        title: '[1] IMMUNITY · VITAMIN D3 + K2',
        priorityBadge: 'PRIORITY 1 · ESSENTIAL',
        priorityColor: alertRed,
        priorityBg: badgeRedBg,
        shortGene: 'VDR FokI / CYP2R1',
        dose: '4,000 IU + 100 mcg'
      },
      {
        title: '[2] ENERGY · ACTIVE FOLATE (B9)',
        priorityBadge: 'PRIORITY 1 · ESSENTIAL',
        priorityColor: alertRed,
        priorityBg: badgeRedBg,
        shortGene: 'MTHFR C677T (TT)',
        dose: '800 mcg'
      },
      {
        title: '[3] SLEEP · CHELATED MAGNESIUM',
        priorityBadge: 'PRIORITY 2 · RECOMMENDED',
        priorityColor: blueDark,
        priorityBg: blueBg,
        shortGene: 'COMT / TRPM6',
        dose: '300–400 mg'
      },
      {
        title: '[4] VITALITY · B-COMPLEX (B12+B6)',
        priorityBadge: 'PRIORITY 2 · RECOMMENDED',
        priorityColor: blueDark,
        priorityBg: blueBg,
        shortGene: 'MTRR / TCN2',
        dose: 'B12 1,000mcg · B6 25mg'
      },
      {
        title: '[5] GUT SHIELD · PROBIOTICS',
        priorityBadge: 'PRIORITY 3 · OPTIONAL',
        priorityColor: amberDark,
        priorityBg: amberBg,
        shortGene: 'MCM6 / LCT (CC)',
        dose: '15 Billion CFU'
      }
    ];

    // Render the 5 Supplements from COMMERCIAL_LOCAL_SUPPLEMENTS
    y2 -= 10;
    COMMERCIAL_LOCAL_SUPPLEMENTS.forEach((supp, idx) => {
      const cardH = 88;
      y2 -= cardH;
      const meta = STANDARDIZED_CARD_TITLES[idx] || {
        title: supp.nutrientEn,
        priorityBadge: 'RECOMMENDED',
        priorityColor: tealAccent,
        priorityBg: rgb(240 / 255, 253 / 255, 250 / 255),
        shortGene: supp.targetedGenes,
        dose: supp.doseDaily
      };

      // Card Container
      page2.drawRectangle({
        x: 36,
        y: y2,
        width: p2Width - 72,
        height: cardH,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1
      });

      // Card Header Strip
      page2.drawRectangle({
        x: 36,
        y: y2 + cardH - 18,
        width: p2Width - 72,
        height: 18,
        color: lightBg
      });

      // Left: Standardized Short Title
      page2.drawText(meta.title, {
        x: 46,
        y: y2 + cardH - 14,
        size: 8.2,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: 160
      });

      // Priority Badge Pill (Distinct visual category)
      const pBadgeW = helveticaBold.widthOfTextAtSize(meta.priorityBadge, 6.2) + 10;
      page2.drawRectangle({
        x: 212,
        y: y2 + cardH - 16,
        width: pBadgeW,
        height: 13,
        color: meta.priorityBg,
        borderColor: meta.priorityColor,
        borderWidth: 0.8
      });
      page2.drawText(meta.priorityBadge, {
        x: 217,
        y: y2 + cardH - 13,
        size: 6.2,
        font: helveticaBold,
        color: meta.priorityColor
      });

      // Right: Target Daily Dose Pill (Clean boxed pill, zero overlap with gene)
      const doseLabel = `Target Dose: ${meta.dose}`;
      const doseBoxW = helveticaBold.widthOfTextAtSize(doseLabel, 7.2) + 14;
      const doseX = p2Width - 46 - doseBoxW;
      page2.drawRectangle({
        x: doseX,
        y: y2 + cardH - 16,
        width: doseBoxW,
        height: 13,
        color: rgb(240 / 255, 253 / 255, 250 / 255),
        borderColor: tealAccent,
        borderWidth: 0.8
      });
      page2.drawText(doseLabel, {
        x: doseX + 7,
        y: y2 + cardH - 13,
        size: 7.2,
        font: helveticaBold,
        color: tealAccent
      });

      // Center: Short Gene Tag (Constrained between Priority Badge and Dose Box with zero collision)
      const geneMaxW = doseX - (212 + pBadgeW + 16);
      page2.drawText(`DNA: ${meta.shortGene}`, {
        x: 212 + pBadgeW + 8,
        y: y2 + cardH - 13,
        size: 6.8,
        font: helvetica,
        color: mutedSlate,
        maxWidth: Math.max(geneMaxW, 40)
      });

      // Unified 2-Column Key-Value Rows (Values strictly aligned at x: 168)
      const labelColX = 46;
      const valueColX = 168;
      const valMaxW = p2Width - valueColX - 46;

      // Line 1: Best Form
      page2.drawText('• Best Active Form:', {
        x: labelColX,
        y: y2 + 55,
        size: 7.2,
        font: helveticaBold,
        color: darkSlate
      });
      page2.drawText(supp.chemicalFormEn, {
        x: valueColX,
        y: y2 + 55,
        size: 7.2,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: valMaxW
      });

      // Line 2: What to Avoid
      page2.drawText('• Strictly Avoid:', {
        x: labelColX,
        y: y2 + 40,
        size: 7.2,
        font: helveticaBold,
        color: alertRed
      });
      page2.drawText(supp.avoidEn, {
        x: valueColX,
        y: y2 + 40,
        size: 7.0,
        font: helvetica,
        color: darkSlate,
        maxWidth: valMaxW
      });

      // Line 3: Posology / Timing
      page2.drawText('• When & How to Take:', {
        x: labelColX,
        y: y2 + 25,
        size: 7.2,
        font: helveticaBold,
        color: mutedSlate
      });
      page2.drawText(supp.timingEn, {
        x: valueColX,
        y: y2 + 25,
        size: 7.0,
        font: helvetica,
        color: darkSlate,
        maxWidth: valMaxW
      });

      // Line 4: Suggested Retail Brands
      page2.drawText('• Suggested Brands:', {
        x: labelColX,
        y: y2 + 10,
        size: 7.2,
        font: helveticaBold,
        color: navyPrimary
      });
      page2.drawText(supp.localBrandsEn, {
        x: valueColX,
        y: y2 + 10,
        size: 7.0,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: valMaxW
      });

      // Spacing between cards
      y2 -= 8;
    });

    // Bottom Patient Flexibility & Budget Decision Guide Banner
    y2 -= 66;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 60,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1.2
    });

    page2.drawText('PATIENT FLEXIBILITY & BUDGET GUIDE · CHOOSE THE REGIMEN THAT FITS YOUR GOALS:', {
      x: 46,
      y: y2 + 44,
      size: 7.2,
      font: helveticaBold,
      color: tealAccent
    });
    const comparisonNotice = '• Minimum Essential Core (Priority 1 only · 2 bottles): Focuses on MTHFR & VDR genetic blocks. Covers 80% of critical health risk.\n• Metabolic & Sleep Reset (Priorities 1 & 2 · 4 bottles): Adds Chelated Magnesium & Methyl-B12 for stress, daytime energy & restorative sleep.\n• Complete Optimization (Priorities 1, 2 & 3 · 5 bottles): Adds Enteric Probiotics. Can be omitted if you maintain a strict 100% dairy-free diet.';
    page2.drawText(comparisonNotice, {
      x: 46,
      y: y2 + 30,
      size: 6.1,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 92,
      lineHeight: 8.8
    });

    // Additional Bottom Pharmacy Dispensing Quality Strip
    y2 -= 40;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 32,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.8
    });

    page2.drawText('PHARMACY DISPENSING DIRECTIVE · GENUINE GMP CERTIFIED PRODUCTS ONLY', {
      x: 46,
      y: y2 + 19,
      size: 6.6,
      font: helveticaBold,
      color: navyPrimary
    });
    page2.drawText('Ensure all OTC purchases in Qatar pharmacies are verified brands (Thorne, Solgar, Now Foods). Do not substitute active L-5-MTHF with synthetic folic acid.', {
      x: 46,
      y: y2 + 8,
      size: 5.8,
      font: helvetica,
      color: mutedSlate,
      maxWidth: p2Width - 92
    });

    // Page 2 Footer
    page2.drawText('Page 2 of 3 · Pathway 1: Commercial OTC Supplements Guide · Turn to Page 3 for Official Compounding Pharmacy Order', {
      x: 36,
      y: 18,
      size: 7,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // PAGE 3: PATHWAY 2 · OFFICIAL PHARMACY COMPOUNDING PRESCRIPTION ORDER
    // =========================================================================
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p3Width, height: p3Height } = page3.getSize();

    // Top Brand Accent Strip (Navy for medical compounding authority)
    page3.drawRectangle({
      x: 0,
      y: p3Height - 8,
      width: p3Width,
      height: 8,
      color: navyPrimary
    });

    let y3 = p3Height - 26;

    // Page 3 Header (Hierarchical Google Cloud UX layout: Zero horizontal collisions)
    page3.drawText('ATLAS HEALTH SERVICES · CLINICAL INTELLIGENCE PLATFORM', {
      x: 36,
      y: y3,
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    // Page 3 Role Badge (PHARMACY COPY)
    const p3Badge = 'PAGE 3 OF 3 · PATHWAY 2: COMPOUNDING ORDER';
    const p3BadgeWidth = helveticaBold.widthOfTextAtSize(p3Badge, 6.8) + 14;
    page3.drawRectangle({
      x: p3Width - 36 - p3BadgeWidth,
      y: y3 - 3,
      width: p3BadgeWidth,
      height: 15,
      color: badgeRedBg,
      borderColor: alertRed,
      borderWidth: 1
    });
    page3.drawText(p3Badge, {
      x: p3Width - 36 - p3BadgeWidth + 7,
      y: y3 + 2,
      size: 6.8,
      font: helveticaBold,
      color: alertRed
    });

    // Row 2: Main Document Title (Full Page Width - Unconstrained)
    y3 -= 16;
    page3.drawText('MASTER COMPOUNDING PRESCRIPTION ORDER', {
      x: 36,
      y: y3,
      size: 12,
      font: helveticaBold,
      color: darkSlate
    });

    // Row 3: Subtitle / Authority Scope
    y3 -= 11;
    page3.drawText('Personalized Tailor-Made Compounded Formulation · 3-Capsule Synchronized Regimen (60 Days)', {
      x: 36,
      y: y3,
      size: 7.2,
      font: helvetica,
      color: mutedSlate
    });

    // Row 4: Separator Line
    y3 -= 8;
    page3.drawLine({
      start: { x: 36, y: y3 },
      end: { x: p3Width - 36, y: y3 },
      thickness: 1,
      color: cardBorder
    });

    // Row 5: Metadata Ribbon
    y3 -= 12;
    page3.drawText(`PRESCRIPTION REF: RX-DNA-COMP-8821   |   PATIENT: ${patientName} (Specimen: ${sampleId})   |   TERRITORY: State of Qatar`, {
      x: 36,
      y: y3,
      size: 7.2,
      font: helveticaBold,
      color: tealAccent
    });

    y3 -= 8;
    page3.drawLine({
      start: { x: 36, y: y3 },
      end: { x: p3Width - 36, y: y3 },
      thickness: 0.8,
      color: cardBorder
    });

    // Technical Compounding Directive to Pharmacist & Modality Selection Checkboxes
    y3 -= 44;
    const modalityH = 40;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: modalityH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page3.drawText('PRESCRIPTION MODALITY SELECTION · LICENSED PHYSICIAN DIRECTIVE (CHECK ONE):', {
      x: 44,
      y: y3 + 28,
      size: 6.8,
      font: helveticaBold,
      color: navyPrimary
    });

    // Checkbox 1: Option A (Core 2-Capsule)
    page3.drawRectangle({
      x: 44,
      y: y3 + 15,
      width: 8,
      height: 8,
      color: isOptionA ? navyPrimary : white,
      borderColor: isOptionA ? navyPrimary : darkSlate,
      borderWidth: 1
    });
    if (isOptionA) {
      page3.drawText('X', { x: 45.8, y: y3 + 16.2, size: 6.0, font: helveticaBold, color: white });
    }
    page3.drawText('OPTION A · CORE 2-CAPSULE REGIMEN (CAPSULES B + C · 2 CAPS/DAY)', { x: 56, y: y3 + 16, size: 6.0, font: helveticaBold, color: navyPrimary });
    page3.drawText('Resolves MTHFR, VDR & Neuro-Sleep. Lowers cost ~30% for patients without active gut dysbiosis.', { x: 305, y: y3 + 16, size: 5.4, font: helvetica, color: mutedSlate, maxWidth: 215 });

    // Checkbox 2: Option B (Full 3-Capsule)
    const isOptionB = !isOptionA;
    page3.drawRectangle({
      x: 44,
      y: y3 + 3,
      width: 8,
      height: 8,
      color: isOptionB ? navyPrimary : white,
      borderColor: isOptionB ? navyPrimary : darkSlate,
      borderWidth: 1
    });
    if (isOptionB) {
      page3.drawText('X', { x: 45.8, y: y3 + 4.2, size: 6.0, font: helveticaBold, color: white });
    }
    page3.drawText('OPTION B · FULL 3-CAPSULE REGIMEN (CAPSULES A + B + C · 3 CAPS/DAY)', { x: 56, y: y3 + 4, size: 6.0, font: helveticaBold, color: navyPrimary });
    page3.drawText('Includes Capsule A (Enteric DRcaps®) for mucosal barrier repair, dairy intolerance & tight junction seal.', { x: 305, y: y3 + 4, size: 5.4, font: helvetica, color: mutedSlate, maxWidth: 215 });

    // Streamlined 3-Capsule Compounding Tables (Revised Per Nikolay / Pharmapolis Pharmacist Review)
    const PHARMACY_CAPSULES = [
      {
        id: 'cap_a',
        num: '1',
        title: isOptionA
          ? 'FORMULATION 1: CAPSULE A · MORNING PROBIOTIC SHIELD  [OPTION B ONLY · MUTED IN OPTION A]'
          : 'FORMULATION 1: CAPSULE A · MORNING ACID-RESISTANT PROBIOTIC SHIELD  [PRIORITY 3 · GUT MICROBIOME]',
        qty: isOptionA ? '60 Capsules (Optional Modality)' : '60 Capsules (60-Day Supply)',
        dnaTarget: 'DNA Target: Pillar 3 (Mucosal Barrier & Gut Microbiome Integrity)',
        vehicle: 'Vehicle: Size 1–2 Acid-Resistant DRcaps® · Excipient: MCC PH-112 (low-moisture) + Desiccant Canister · Lactose-Free',
        timing: 'Posology: 1 capsule 15–30 min before breakfast on an empty stomach with room-temperature water.',
        headerColor: isOptionA ? mutedSlate : tealAccent,
        ingredients: [
          {
            name: 'Lactobacillus rhamnosus GG (ATCC 53103)',
            spec: 'Lyophilized viable culture guaranteed at expiry (Ph. Eur. grade) · Low-moisture vehicle',
            dose: '10 Billion CFU',
            batch60: '600 B. CFU',
            purpose: 'Microbiome Barrier'
          },
          {
            name: 'Bifidobacterium animalis subsp. lactis BB-12',
            spec: 'Lyophilized viable culture guaranteed at expiry · Documented acid/bile resistant strain',
            dose: '5 Billion CFU',
            batch60: '300 B. CFU',
            purpose: 'Colonic Integrity'
          }
        ]
      },
      {
        id: 'cap_b',
        num: '2',
        title: 'FORMULATION 2: CAPSULE B · BREAKFAST METHYLATION & VITAMIN D3/K2  [PRIORITY 1 · ESSENTIAL CORE]',
        qty: '60 Capsules (60-Day Supply)',
        dnaTarget: 'DNA Targets: Pillars 2 & 4 (Cellular Methylation & Vitamin D Receptor Activation)',
        vehicle: 'Vehicle: Size 1–3 Vegetable HPMC Capsule · Excipient: MCC PH-102 · Certified Triturations per Ph. Eur. 2.9.40',
        timing: 'Posology: 1 capsule with breakfast (meal containing dietary fats: avocado, olive oil, eggs for D3/K2 micellar uptake).',
        headerColor: navyPrimary,
        ingredients: [
          {
            name: 'Active L-Methylfolate ([6S]-5-MTHF)',
            spec: 'Active Calcium or Glucosamine Salt (Ph. Eur.) · 400 mcg base (800 mcg if Homocysteine >15)',
            dose: '400–800 mcg',
            batch60: '24–48 mg',
            purpose: 'MTHFR C677T Support'
          },
          {
            name: 'Riboflavin (Vitamin B2)',
            spec: 'Pharmaceutical Grade Ph. Eur. · Essential FAD enzymatic cofactor for MTHFR activation',
            dose: '2.5 mg',
            batch60: '150.00 mg',
            purpose: 'MTHFR FAD Cofactor'
          },
          {
            name: 'Methylcobalamin (Active Coenzyme B12)',
            spec: 'Active Enzymatic Coenzyme B12 (USP/Ph. Eur.) · Essential methionine synthase cofactor',
            dose: '1,000 mcg',
            batch60: '60.00 mg',
            purpose: 'Homocysteine Clear'
          },
          {
            name: 'Pyridoxal-5-Phosphate (Active B6 / P-5-P)',
            spec: 'Active Enzymatic B6 (Ph. Eur.) · Daytime transsulfuration & CBS cofactor (Safe below EFSA 12mg UL)',
            dose: '5.0 mg',
            batch60: '300.00 mg',
            purpose: 'Transsulfuration'
          },
          {
            name: 'Vitamin D3 (Cholecalciferol)',
            spec: 'Dry Beadlet USP/Ph. Eur. · 2,000 IU default (4,000 IU if 25(OH)D <20 ng/mL; re-test at 8-12 wks)',
            dose: '2,000 IU',
            batch60: '120,000 IU',
            purpose: 'VDR Receptor Support'
          },
          {
            name: 'Vitamin K2 (all-trans Menaquinone-7)',
            spec: 'Microencapsulated all-trans MK-7 (Ph. Eur.) · Synergistic calcium matrix directing (Screen Warfarin)',
            dose: '100 mcg',
            batch60: '6.00 mg',
            purpose: 'Calcium Directing'
          },
          {
            name: '(Conditional) Chromium Picolinate',
            spec: 'Pharmaceutical Chelate (200 mcg elemental Cr) · Include ONLY if HbA1c 5.7–6.4% or HOMA-IR elevated',
            dose: '1.6 mg (200mcg Cr)',
            batch60: '96.00 mg',
            purpose: 'Glycemic Support'
          }
        ]
      },
      {
        id: 'cap_c',
        num: '3',
        title: 'FORMULATION 3: CAPSULE C · EVENING REST & NEUROMUSCULAR ARCHITECTURE  [PRIORITY 2 · REST & COMT]',
        qty: '120 Capsules (60-Day Supply · 2 Caps/Day)',
        dnaTarget: 'DNA Target: Pillar 4 (Cellular Immunity, COMT Moderation & Sleep Architecture)',
        vehicle: 'Vehicle: 2 × Size 00 Vegetable HPMC Capsules · Excipient: MCC PH-102 · Non-buffered pure chelate',
        timing: 'Posology: Take 2 capsules with water 30–60 minutes before bedtime (delivers true 150 mg elemental magnesium).',
        headerColor: rgb(30 / 255, 58 / 255, 138 / 255),
        ingredients: [
          {
            name: 'Magnesium Bisglycinate Chelate',
            spec: 'Pure Non-Buffered TRAACS® Glycinate · 150 mg elemental Mg across 2 caps (reduce to 100mg if eGFR <60)',
            dose: '150 mg elemental Mg',
            batch60: '18.00 g (9.0g elem)',
            purpose: 'COMT / GABA Support'
          },
          {
            name: 'L-Theanine (Suntheanine® Grade)',
            spec: 'Pure Enzymatic Fermentation (99% L-Isomer) · Promotes alpha brainwave relaxation & sleep architecture',
            dose: '200 mg',
            batch60: '12.00 g',
            purpose: 'Alpha Sleep Wave'
          }
        ]
      }
    ];

    y3 -= 10;

    PHARMACY_CAPSULES.forEach((cap) => {
      const rowCount = cap.ingredients.length;
      const rowH = rowCount > 3 ? 20 : 22;
      const cardHeight = 62 + (rowCount * rowH) + 6;

      y3 -= cardHeight;

      // Card Outline
      page3.drawRectangle({
        x: 36,
        y: y3,
        width: p3Width - 72,
        height: cardHeight,
        color: white,
        borderColor: cardBorder,
        borderWidth: 1
      });

      // Capsule Header Strip
      page3.drawRectangle({
        x: 36,
        y: y3 + cardHeight - 18,
        width: p3Width - 72,
        height: 18,
        color: cap.headerColor
      });

      page3.drawText(cap.title, {
        x: 44,
        y: y3 + cardHeight - 13,
        size: 7.0,
        font: helveticaBold,
        color: white,
        maxWidth: p3Width - 190
      });

      page3.drawText(cap.qty, {
        x: p3Width - 44 - helveticaBold.widthOfTextAtSize(cap.qty, 6.8),
        y: y3 + cardHeight - 13,
        size: 6.8,
        font: helveticaBold,
        color: white
      });

      // 3 Dedicated Metadata Subheader Lines (Strict Golden Rule #32: Zero Overlap)
      // Line 1: Posology & Administration Schedule
      page3.drawText(cap.timing, {
        x: 44,
        y: y3 + cardHeight - 27,
        size: 6.2,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: p3Width - 88
      });

      // Line 2: Vehicle, Size & Excipients Specification
      page3.drawText(cap.vehicle, {
        x: 44,
        y: y3 + cardHeight - 37,
        size: 5.7,
        font: helveticaOblique,
        color: mutedSlate,
        maxWidth: p3Width - 88
      });

      // Line 3: Genomic Indication & DNA Target Rationale (Prominent, dedicated line)
      if (cap.dnaTarget) {
        page3.drawText(`DNA Targets: ${cap.dnaTarget.replace(/^DNA Targets?:\s*/i, '')}`, {
          x: 44,
          y: y3 + cardHeight - 47,
          size: 5.9,
          font: helveticaBold,
          color: tealAccent,
          maxWidth: p3Width - 88
        });
      }

      // Table Header Strip
      const thY = y3 + cardHeight - 60;
      page3.drawRectangle({
        x: 40,
        y: thY - 2,
        width: p3Width - 80,
        height: 11,
        color: lightBg
      });

      page3.drawText('ACTIVE INGREDIENT (API) & PHARMACOPEIA SPECIFICATION', { x: 44, y: thY + 2, size: 5.8, font: helveticaBold, color: mutedSlate });
      page3.drawText('TARGET DOSE', { x: 300, y: thY + 2, size: 5.8, font: helveticaBold, color: mutedSlate });
      page3.drawText('BATCH (60 CAPS)', { x: 380, y: thY + 2, size: 5.8, font: helveticaBold, color: mutedSlate });
      page3.drawText('THERAPEUTIC ROLE', { x: 460, y: thY + 2, size: 5.8, font: helveticaBold, color: mutedSlate });

      // 2-Line Table Rows
      let itemY = thY - 14;
      cap.ingredients.forEach((ing) => {
        page3.drawText(`• ${ing.name}`, { x: 44, y: itemY + 2, size: 6.6, font: helveticaBold, color: darkSlate, maxWidth: 245 });
        page3.drawText(ing.dose, { x: 300, y: itemY + 2, size: 6.4, font: helveticaBold, color: tealAccent });
        page3.drawText(ing.batch60, { x: 380, y: itemY + 2, size: 6.4, font: helveticaBold, color: navyPrimary });
        page3.drawText(ing.purpose, { x: 460, y: itemY + 2, size: 6.0, font: helveticaBold, color: darkSlate, maxWidth: 90 });

        page3.drawText(`Spec: ${ing.spec}`, { x: 50, y: itemY - 7, size: 5.3, font: helveticaOblique, color: mutedSlate, maxWidth: p3Width - 110 });

        page3.drawLine({
          start: { x: 44, y: itemY - 9 },
          end: { x: p3Width - 44, y: itemY - 9 },
          thickness: 0.5,
          color: rgb(241 / 255, 245 / 255, 249 / 255)
        });

        itemY -= rowH;
      });

      y3 -= 6;
    });

    // Optional Module D: Soluble Fiber Sachet Directive
    y3 -= 26;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 22,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 0.8
    });
    page3.drawText('OPTIONAL MODULE D · SOLUBLE FIBER SACHET (FOR GLYCEMIC REGULATION):', {
      x: 44,
      y: y3 + 13,
      size: 6.0,
      font: helveticaBold,
      color: tealAccent
    });
    page3.drawText('Psyllium Husk Powder USP (5 g per sachet in water, before largest meal). Take 2 hours apart from capsules. Add only if HbA1c 5.7–6.4% or fasting glucose elevated.', {
      x: 44,
      y: y3 + 4,
      size: 5.4,
      font: helvetica,
      color: darkSlate,
      maxWidth: p3Width - 88
    });

    // Baseline Lab Decision Rules Matrix (Adjusting Formulations to Labs)
    y3 -= 36;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 32,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.8
    });
    page3.drawText('BASELINE LABS DECISION MATRIX (CLINICAL SAFETY ADJUSTMENT RULES):', {
      x: 44,
      y: y3 + 21,
      size: 6.0,
      font: helveticaBold,
      color: navyPrimary
    });
    const labRulesLine1 = '• 25(OH)D <20 ng/mL: Increase D3 to 4,000 IU; re-test at 8–12 wks   • Homocysteine >15 µmol/L: Increase 5-MTHF to 800 mcg   • Warfarin: Contraindicated with Vit K2';
    const labRulesLine2 = '• HbA1c 5.7–6.4%: Add Chromium Picolinate (200 mcg Cr) + Module D   • eGFR <60 mL/min: Reduce elemental Mg to 100 mg & monitor serum magnesium';
    page3.drawText(labRulesLine1, { x: 44, y: y3 + 12, size: 5.4, font: helvetica, color: darkSlate, maxWidth: p3Width - 88 });
    page3.drawText(labRulesLine2, { x: 44, y: y3 + 4, size: 5.4, font: helvetica, color: darkSlate, maxWidth: p3Width - 88 });

    // Co-Administration Restriction & Anti-Duplication Directive
    y3 -= 28;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 24,
      color: rgb(254 / 255, 242 / 255, 242 / 255), // alert light red
      borderColor: alertRed,
      borderWidth: 1
    });

    page3.drawText('DISPENSING DIRECTIVE & CO-ADMINISTRATION RESTRICTION (NO DUPLICATE SUPPLEMENTATION):', {
      x: 44,
      y: y3 + 14,
      size: 6.0,
      font: helveticaBold,
      color: alertRed
    });
    page3.drawText('This master compounded protocol provides 100% of required therapeutic micronutrients. Discontinue all separate OTC multivitamins/minerals to prevent duplicate dosing.', {
      x: 44,
      y: y3 + 4,
      size: 5.4,
      font: helveticaBold,
      color: darkSlate,
      maxWidth: p3Width - 88
    });

    // Prescribing Physician Authorization & Medical Signature
    y3 -= 72;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 66,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page3.drawText('PRESCRIBING PHYSICIAN AUTHORIZATION & OFFICIAL MEDICAL VALIDATION', {
      x: 44,
      y: y3 + 59,
      size: 7.2,
      font: helveticaBold,
      color: navyPrimary
    });

    page3.drawLine({
      start: { x: 44, y: y3 + 53 },
      end: { x: p3Width - 44, y: y3 + 53 },
      thickness: 0.6,
      color: cardBorder
    });

    // Left Panel: Physician Information
    page3.drawText('Prescribing Physician (Full Name): _______________________________________________', {
      x: 44,
      y: y3 + 38,
      size: 6.2,
      font: helvetica,
      color: darkSlate
    });

    page3.drawText('Medical License / Registry Reg. No.: ____________________________________________', {
      x: 44,
      y: y3 + 24,
      size: 6.2,
      font: helvetica,
      color: darkSlate
    });

    page3.drawText('Territory Jurisdiction: State of Qatar   ·   Issue Date: ____ / ____ / 2026', {
      x: 44,
      y: y3 + 10,
      size: 6.2,
      font: helvetica,
      color: darkSlate
    });

    // Vertical Panel Divider
    page3.drawLine({
      start: { x: 345, y: y3 + 6 },
      end: { x: 345, y: y3 + 51 },
      thickness: 0.8,
      color: cardBorder
    });

    // Right Panel: Signature & Stamp Box
    page3.drawText('Physician\'s Professional Stamp & Signature:', {
      x: 355,
      y: y3 + 38,
      size: 6.4,
      font: helveticaBold,
      color: darkSlate
    });

    page3.drawLine({
      start: { x: 355, y: y3 + 16 },
      end: { x: p3Width - 46, y: y3 + 16 },
      thickness: 0.8,
      color: rgb(160 / 255, 160 / 255, 160 / 255)
    });

    page3.drawText('Authorized Prescribing Signature & Clinical Seal', {
      x: 355,
      y: y3 + 6,
      size: 5.6,
      font: helveticaOblique,
      color: mutedSlate
    });

    // Page 3 Footer
    page3.drawText('Page 3 of 3 · Official Magistral Compounding Prescription · Dispensing subject to authorized medical prescription', {
      x: 36,
      y: 18,
      size: 7,
      font: helvetica,
      color: mutedSlate
    });

    // =========================================================================
    // SECTION II: MERGE ORIGINAL 24GENETICS LABORATORY REPORT (IF REQUESTED)
    // =========================================================================
    const includeOriginal = searchParams.get('full') !== 'false' && searchParams.get('includeOriginal') !== 'false';

    if (includeOriginal) {
      let originalBytes = null;
      const originalPdfPath = path.join(process.cwd(), 'public/reports/24genetics/G000943554_Nutrition.pdf');
      if (fs.existsSync(originalPdfPath)) {
        try {
          originalBytes = fs.readFileSync(originalPdfPath);
        } catch (e) {
          console.warn('[24Genomics PDF] Local read failed, falling back to CDN fetch:', e.message);
        }
      }

      // In production Cloud Functions / Serverless, public/ files live on the CDN
      if (!originalBytes) {
        const candidateCdnUrls = [
          'https://www.atlashealth-services.com/reports/24genetics/G000943554_Nutrition.pdf',
          'https://med-peptides-app-27a3a.web.app/reports/24genetics/G000943554_Nutrition.pdf'
        ];
        for (const cdnUrl of candidateCdnUrls) {
          try {
            const cdnRes = await fetch(cdnUrl, { cache: 'force-cache' });
            if (cdnRes.ok) {
              const arrayBuffer = await cdnRes.arrayBuffer();
              originalBytes = Buffer.from(arrayBuffer);
              break;
            }
          } catch (fetchErr) {
            console.warn(`[24Genomics PDF] CDN fetch failed for ${cdnUrl}:`, fetchErr.message);
          }
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
          borderColor: blueDark,
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
        dividerPage.drawText('• Section I: Official clinical prescription, magistral compounding formulation & posology.', {
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
