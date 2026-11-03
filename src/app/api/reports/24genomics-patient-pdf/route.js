import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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

    // Patient Dossier Mini-Banner (Balanced 4-column layout with zero text collision)
    y -= 40;
    page1.drawRectangle({
      x: 36,
      y,
      width: p1Width - 72,
      height: 38,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    // Col 1: Patient
    page1.drawText('PATIENT NAME:', { x: 46, y: y + 23, size: 6.5, font: helveticaBold, color: mutedSlate });
    page1.drawText(patientName, { x: 46, y: y + 10, size: 8.5, font: helveticaBold, color: darkSlate, maxWidth: 120 });

    // Col 2: Specimen
    page1.drawText('SPECIMEN / LAB ID:', { x: 175, y: y + 23, size: 6.5, font: helveticaBold, color: mutedSlate });
    page1.drawText(sampleId, { x: 175, y: y + 10, size: 8.0, font: helveticaBold, color: darkSlate });
    page1.drawText('24Genetics CE-IVD Lab', { x: 175, y: y + 2, size: 6.0, font: helvetica, color: tealAccent });

    // Col 3: Protocol Duration
    page1.drawText('PROTOCOL DURATION:', { x: 300, y: y + 23, size: 6.5, font: helveticaBold, color: mutedSlate });
    page1.drawText('60-Day Initial Cycle', { x: 300, y: y + 10, size: 8.0, font: helveticaBold, color: tealAccent });
    page1.drawText('Size 0 Regimen', { x: 300, y: y + 2, size: 6.0, font: helvetica, color: mutedSlate });

    // Col 4: Dispensing Standard (Zero mention of any clinic)
    page1.drawText('DISPENSING STANDARD:', { x: 415, y: y + 23, size: 6.5, font: helveticaBold, color: mutedSlate });
    page1.drawText('Size 0 Magistral Caps', { x: 415, y: y + 10, size: 8.0, font: helveticaBold, color: navyPrimary });
    page1.drawText('100% Lactose-Free HPMC', { x: 415, y: y + 2, size: 6.0, font: helvetica, color: tealAccent });

    // Section 1: Notice to Patient
    y -= 22;
    page1.drawRectangle({
      x: 36,
      y: y - 18,
      width: p1Width - 72,
      height: 20,
      color: rgb(240 / 255, 249 / 255, 255 / 255),
      borderColor: rgb(186 / 255, 230 / 255, 253 / 255),
      borderWidth: 0.8
    });
    page1.drawText('PATIENT NOTICE: This guide translates findings from your 24Genetics Nutrition DNA test into clear daily actions. Turn to PAGE 2 for the Official Compounding Pharmacy Order.', {
      x: 44,
      y: y - 11,
      size: 6.7,
      font: helveticaBold,
      color: blueDark
    });

    // The 4 Functional DNA Pillars
    y -= 34;
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
        why: 'Nuclear receptor variation benefits from consistent physiological D3/K2, while evening chelated magnesium supports deep rest.',
        assignedFormulation: 'Capsule B (Breakfast D3 2,000 IU + K2 100µg) & Capsule C (Evening 150mg elemental Mg + Theanine 200mg)',
        clinicalGoal: 'Maintains optimal 25(OH)D safely within EU adult UL, paired with evening chelated magnesium and L-theanine.'
      }
    ];

    y -= 14;
    pillarCardDefs.forEach((p) => {
      const cardHeight = 54;
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
        y: y - 10,
        size: 6.5,
        font: helveticaBold,
        color: tealAccent
      });

      // Title
      page1.drawText(p.title, {
        x: 46,
        y: y - 19,
        size: 7.8,
        font: helveticaBold,
        color: darkSlate
      });

      // Status Pill
      const pillWidth = helveticaBold.widthOfTextAtSize(p.status, 6) + 10;
      page1.drawRectangle({
        x: p1Width - 46 - pillWidth,
        y: y - 17,
        width: pillWidth,
        height: 11,
        color: p.statusBg
      });
      page1.drawText(p.status, {
        x: p1Width - 46 - pillWidth + 5,
        y: y - 14,
        size: 6,
        font: helveticaBold,
        color: p.statusColor
      });

      // Why Text (DNA Finding in plain language)
      page1.drawText(`DNA Finding: ${p.why}`, {
        x: 46,
        y: y - 29,
        size: 6.7,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 96
      });

      // Galenic Support Cross-Reference
      page1.drawText(`Targeted Support: ${p.assignedFormulation}`, {
        x: 46,
        y: y - 41,
        size: 6.7,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: p1Width - 96
      });

      // Clinical Objective
      page1.drawText(`Clinical Goal: ${p.clinicalGoal}`, {
        x: 46,
        y: y - 50,
        size: 6.1,
        font: helveticaOblique,
        color: tealAccent,
        maxWidth: p1Width - 96
      });

      y -= cardHeight + 5;
    });

    // Section 2: Patient Daily Compounded Schedule (Revised Per Pharmacist Review)
    y -= 4;
    page1.drawText('2. How to Take Your Personalized Formulations (Revised Daily Schedule)', {
      x: 36,
      y,
      size: 9.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y -= 12;
    const scheduleBoxWidth = (p1Width - 72 - 16) / 3;

    const patientIntakeSchedule = [
      {
        capName: 'CAPSULE A (Morning)',
        targetPillars: 'Pillar 3 · Verified Probiotics (LGG + BB-12)',
        time: '15–30 min Before Breakfast (Empty Stomach)',
        rule: 'Take 1 capsule with room-temperature water. Acid-resistant DRcaps® protect delicate live cultures from gastric acidity.'
      },
      {
        capName: 'CAPSULE B (Breakfast)',
        targetPillars: 'Pillars 2 & 4 · 5-MTHF + Riboflavin + D3/K2',
        time: 'With Breakfast (Containing Dietary Fats)',
        rule: 'Take 1 capsule with eggs, avocado, or olive oil. Dietary fats maximize micellar absorption of Vitamin D3 and K2.'
      },
      {
        capName: 'CAPSULE C (Evening · 2 Caps)',
        targetPillars: 'Pillar 4 · 150mg Elemental Mg + Theanine 200mg',
        time: '30–60 min Before Bedtime (2 Capsules)',
        rule: 'Take 2 capsules with water before sleep. Calms COMT hyper-reactivity, supports restorative sleep & neuromuscular relaxation.'
      }
    ];

    patientIntakeSchedule.forEach((sch, sIdx) => {
      const boxX = 36 + sIdx * (scheduleBoxWidth + 8);
      const boxHeight = 56;

      page1.drawRectangle({
        x: boxX,
        y: y - boxHeight,
        width: scheduleBoxWidth,
        height: boxHeight,
        color: lightBg,
        borderColor: sIdx === 0 ? tealAccent : (sIdx === 1 ? navyPrimary : rgb(30 / 255, 58 / 255, 138 / 255)),
        borderWidth: 0.8
      });

      page1.drawText(sch.capName, {
        x: boxX + 6,
        y: y - 11,
        size: 6.8,
        font: helveticaBold,
        color: sIdx === 0 ? tealAccent : navyPrimary
      });

      page1.drawText(sch.targetPillars, {
        x: boxX + 6,
        y: y - 19,
        size: 5.8,
        font: helveticaBold,
        color: tealAccent
      });

      page1.drawText(sch.time, {
        x: boxX + 6,
        y: y - 27,
        size: 6.0,
        font: helveticaBold,
        color: darkSlate
      });

      page1.drawText(sch.rule, {
        x: boxX + 6,
        y: y - 36,
        size: 5.6,
        font: helvetica,
        color: mutedSlate,
        maxWidth: scheduleBoxWidth - 12,
        lineHeight: 7.2
      });
    });

    // Section 3: High-Adherence Patient Dietary Guidelines
    y -= 68;
    page1.drawRectangle({
      x: 36,
      y: y - 66,
      width: p1Width - 72,
      height: 66,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page1.drawText('3. CONCRETE PATIENT DIETARY RULES (HIGH-ADHERENCE GUIDELINES)', {
      x: 46,
      y: y - 13,
      size: 7.2,
      font: helveticaBold,
      color: tealAccent
    });

    const dietRules = [
      '1. Plate Sequencing: Eat vegetables and soluble fiber first, lean proteins/healthy fats second, and complex carbs last (reduces glucose spikes up to 45%).',
      '2. Carbohydrate Cap: Keep net carbohydrates under 40g per meal. Avoid sugary soft drinks, commercial juices, and refined white flour pastries.',
      '3. Microbiota Foods: Consume dairy-free fermented foods (coconut kefir, sauerkraut) and cooked/cooled potatoes to nourish beneficial Bifidobacteria.',
      '4. Circadian Caffeine Window: Due to your genetic CYP1A2 profile, stop caffeine and stimulants before 2:00 PM to protect nighttime sleep architecture.'
    ];

    let rY = y - 24;
    dietRules.forEach(r => {
      page1.drawText(r, {
        x: 46,
        y: rY,
        size: 6.5,
        font: helvetica,
        color: darkSlate,
        maxWidth: p1Width - 92
      });
      rY -= 10;
    });

    // Page 1 Footer
    page1.drawText('Page 1 of 3 · Patient Clinical Reference Guide · Turn to Page 2 for Pathway 1 (Local OTC) & Page 3 for Pathway 2 (Compounding Order)', {
      x: 36,
      y: 18,
      size: 7,
      font: helvetica,
      color: mutedSlate
    });

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

    // Clinical Directive to Patient: Mutual Exclusivity Safety Alert (Generous padding, zero collision)
    y2 -= 60;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 54,
      color: rgb(254 / 255, 242 / 255, 242 / 255), // light alert red
      borderColor: alertRed,
      borderWidth: 1.2
    });

    page2.drawText('CRITICAL CLINICAL SAFETY DIRECTIVE · MUTUALLY EXCLUSIVE THERAPEUTIC PATHWAYS:', {
      x: 44,
      y: y2 + 40,
      size: 6.8,
      font: helveticaBold,
      color: alertRed
    });
    const otcDirectiveText = 'Pathway 1 (Commercial OTC) and Pathway 2 (Master Compounding) are ALTERNATIVE clinical approaches to resolve your DNA profile.\nNEVER TAKE BOTH TRACKS CONCURRENTLY: If purchasing retail OTC supplements below, DO NOT take the compounded prescription.\nIf your physician prescribes Pathway 2 (Page 3), it fully replaces all standalone OTC vitamins to prevent micronutrient toxicity (hypervitaminosis).';
    page2.drawText(otcDirectiveText, {
      x: 44,
      y: y2 + 28,
      size: 5.7,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 88,
      lineHeight: 9.0
    });

    // Standardized Titles, Priorities & Gene Targets
    const STANDARDIZED_CARD_TITLES = [
      {
        title: 'ACTIVE FOLATE (VITAMIN B9)',
        priorityBadge: 'PRIORITY 1 · ESSENTIAL',
        priorityColor: alertRed,
        priorityBg: badgeRedBg,
        shortGene: 'MTHFR C677T (TT)',
        dose: '800 mcg'
      },
      {
        title: 'VITAMIN D3 + K2 (MK-7)',
        priorityBadge: 'PRIORITY 1 · ESSENTIAL',
        priorityColor: alertRed,
        priorityBg: badgeRedBg,
        shortGene: 'VDR FokI / CYP2R1',
        dose: '4,000 IU + 100 mcg'
      },
      {
        title: 'BIOAVAILABLE CHELATED MAGNESIUM',
        priorityBadge: 'PRIORITY 2 · RECOMMENDED',
        priorityColor: blueDark,
        priorityBg: blueBg,
        shortGene: 'COMT / TRPM6',
        dose: '300–400 mg'
      },
      {
        title: 'METHYLATED B-COMPLEX (B12 + B6)',
        priorityBadge: 'PRIORITY 2 · RECOMMENDED',
        priorityColor: blueDark,
        priorityBg: blueBg,
        shortGene: 'MTRR / TCN2',
        dose: 'B12 1,000mcg · B6 25mg'
      },
      {
        title: 'ENTERIC PROBIOTICS & GLUTAMINE',
        priorityBadge: 'PRIORITY 3 · OPTIONAL',
        priorityColor: amberDark,
        priorityBg: amberBg,
        shortGene: 'MCM6 / LCT (CC)',
        dose: '15B CFU + 350mg'
      }
    ];

    // Render the 5 Supplements from COMMERCIAL_LOCAL_SUPPLEMENTS
    y2 -= 10;
    COMMERCIAL_LOCAL_SUPPLEMENTS.forEach((supp, idx) => {
      const cardH = 74;
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
        y: y2 + cardH - 16,
        width: p2Width - 72,
        height: 16,
        color: lightBg
      });

      // Left: Standardized Short Title
      page2.drawText(`${idx + 1}. ${meta.title}`, {
        x: 44,
        y: y2 + cardH - 11,
        size: 6.7,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: 165
      });

      // Priority Badge Pill (Distinct visual category)
      const pBadgeW = helveticaBold.widthOfTextAtSize(meta.priorityBadge, 5.2) + 8;
      page2.drawRectangle({
        x: 214,
        y: y2 + cardH - 14,
        width: pBadgeW,
        height: 11,
        color: meta.priorityBg,
        borderColor: meta.priorityColor,
        borderWidth: 0.6
      });
      page2.drawText(meta.priorityBadge, {
        x: 218,
        y: y2 + cardH - 11,
        size: 5.2,
        font: helveticaBold,
        color: meta.priorityColor
      });

      // Center: Short Gene Tag
      page2.drawText(`Gene: ${meta.shortGene}`, {
        x: 338,
        y: y2 + cardH - 11,
        size: 5.8,
        font: helveticaBold,
        color: mutedSlate,
        maxWidth: 110
      });

      // Right: Target Daily Dose (Right-aligned with zero overlap)
      const doseLabel = `Target Dose: ${meta.dose}`;
      const doseW = helveticaBold.widthOfTextAtSize(doseLabel, 6.2);
      page2.drawText(doseLabel, {
        x: p2Width - 44 - doseW,
        y: y2 + cardH - 11,
        size: 6.2,
        font: helveticaBold,
        color: tealAccent
      });

      // Line 1: Active Form
      page2.drawText('• Recommended Chemical Form: ', {
        x: 44,
        y: y2 + 45,
        size: 6.0,
        font: helveticaBold,
        color: darkSlate
      });
      page2.drawText(supp.chemicalFormEn, {
        x: 162,
        y: y2 + 45,
        size: 6.0,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: p2Width - 210
      });

      // Line 2: Avoid
      page2.drawText('• Strictly Avoid: ', {
        x: 44,
        y: y2 + 33,
        size: 5.9,
        font: helveticaBold,
        color: alertRed
      });
      page2.drawText(supp.avoidEn, {
        x: 108,
        y: y2 + 33,
        size: 5.6,
        font: helvetica,
        color: darkSlate,
        maxWidth: p2Width - 156
      });

      // Line 3: Posology
      page2.drawText('• Timing & Posology: ', {
        x: 44,
        y: y2 + 21,
        size: 5.9,
        font: helveticaBold,
        color: mutedSlate
      });
      page2.drawText(supp.timingEn, {
        x: 128,
        y: y2 + 21,
        size: 5.6,
        font: helvetica,
        color: darkSlate,
        maxWidth: p2Width - 176
      });

      // Line 4: Retail Doha Brands
      page2.drawText('• Qatar Pharmacy Reference Brands: ', {
        x: 44,
        y: y2 + 9,
        size: 5.9,
        font: helveticaBold,
        color: navyPrimary
      });
      page2.drawText(supp.localBrandsEn, {
        x: 182,
        y: y2 + 9,
        size: 5.6,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: p2Width - 230
      });

      // Spacing between cards
      y2 -= 8;
    });

    // Bottom Patient Flexibility & Budget Decision Guide Banner
    y2 -= 48;
    page2.drawRectangle({
      x: 36,
      y: y2,
      width: p2Width - 72,
      height: 44,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: rgb(153 / 255, 246 / 255, 228 / 255),
      borderWidth: 1
    });

    page2.drawText('PATIENT FLEXIBILITY & BUDGET GUIDE · CHOOSE THE REGIMEN THAT FITS YOUR GOALS:', {
      x: 44,
      y: y2 + 31,
      size: 6.8,
      font: helveticaBold,
      color: tealAccent
    });
    const comparisonNotice = '• Minimum Essential Core (Priority 1 only · 2 bottles): Focuses on MTHFR & VDR genetic blocks. Covers 80% of critical health risk.\n• Metabolic & Sleep Reset (Priorities 1 & 2 · 4 bottles): Adds Chelated Magnesium & Methyl-B12 for stress, daytime energy & restorative sleep.\n• Complete Optimization (Priorities 1, 2 & 3 · 5 bottles): Adds Enteric Probiotics. Can be omitted if you maintain a strict 100% dairy-free diet.';
    page2.drawText(comparisonNotice, {
      x: 44,
      y: y2 + 20,
      size: 5.6,
      font: helvetica,
      color: darkSlate,
      maxWidth: p2Width - 88,
      lineHeight: 7.8
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
    y3 -= 46;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 42,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page3.drawText('PRESCRIPTION MODALITY SELECTION · LICENSED PHYSICIAN DIRECTIVE (CHECK ONE):', {
      x: 44,
      y: y3 + 29,
      size: 6.8,
      font: helveticaBold,
      color: navyPrimary
    });

    // Checkbox 1: Option A (Core 2-Capsule)
    page3.drawRectangle({ x: 44, y: y3 + 16, width: 8, height: 8, color: white, borderColor: darkSlate, borderWidth: 1 });
    page3.drawText('OPTION A · CORE 2-CAPSULE REGIMEN (CAPSULES B + C · 2 CAPS/DAY)', { x: 56, y: y3 + 17, size: 6.1, font: helveticaBold, color: navyPrimary });
    page3.drawText('Resolves MTHFR, VDR & Neuro-Sleep. Lowers compounding cost by ~30% for patients without active gut dysbiosis.', { x: 298, y: y3 + 17, size: 5.5, font: helvetica, color: mutedSlate, maxWidth: 220 });

    // Checkbox 2: Option B (Full 3-Capsule)
    page3.drawRectangle({ x: 44, y: y3 + 4, width: 8, height: 8, color: white, borderColor: darkSlate, borderWidth: 1 });
    page3.drawText('OPTION B · FULL 3-CAPSULE REGIMEN (CAPSULES A + B + C · 3 CAPS/DAY)', { x: 56, y: y3 + 5, size: 6.1, font: helveticaBold, color: tealAccent });
    page3.drawText('Includes Capsule A (Enteric Probiotics DRcaps®) for mucosal barrier repair, dairy intolerance & tight junction seal.', { x: 308, y: y3 + 5, size: 5.5, font: helvetica, color: mutedSlate, maxWidth: 210 });

    // Streamlined 3-Capsule Compounding Tables (Revised Per Nikolay / Pharmapolis Pharmacist Review)
    const PHARMACY_CAPSULES = [
      {
        id: 'cap_a',
        num: '1',
        title: 'FORMULATION 1: CAPSULE A · MORNING ACID-RESISTANT PROBIOTIC SHIELD  [PRIORITY 3 · GUT MICROBIOME]',
        qty: '60 Capsules (60-Day Supply)',
        dnaTarget: 'DNA Target: Pillar 3 (Mucosal Barrier & Gut Microbiome Integrity)',
        vehicle: 'Vehicle: Size 1–2 Acid-Resistant DRcaps® · Excipient: MCC PH-112 (low-moisture) + Desiccant Canister · Lactose-Free',
        timing: 'Posology: 1 capsule 15–30 min before breakfast on an empty stomach with room-temperature water.',
        headerColor: tealAccent,
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
      const rowH = rowCount > 3 ? 18 : 20;
      const cardHeight = 44 + (rowCount * rowH) + 4;

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
        y: y3 + cardHeight - 16,
        width: p3Width - 72,
        height: 16,
        color: cap.headerColor
      });

      page3.drawText(cap.title, {
        x: 44,
        y: y3 + cardHeight - 11,
        size: 6.8,
        font: helveticaBold,
        color: white
      });

      page3.drawText(cap.qty, {
        x: p3Width - 44 - helveticaBold.widthOfTextAtSize(cap.qty, 6.5),
        y: y3 + cardHeight - 11,
        size: 6.5,
        font: helveticaBold,
        color: white
      });

      // Vehicle & Posology subheader lines
      page3.drawText(cap.timing, {
        x: 44,
        y: y3 + cardHeight - 25,
        size: 5.9,
        font: helveticaBold,
        color: darkSlate
      });

      page3.drawText(cap.vehicle, {
        x: 44,
        y: y3 + cardHeight - 34,
        size: 5.5,
        font: helveticaOblique,
        color: mutedSlate
      });

      // DNA Target Reference Tag
      if (cap.dnaTarget) {
        const targetWidth = helveticaBold.widthOfTextAtSize(cap.dnaTarget, 5.7);
        page3.drawText(cap.dnaTarget, {
          x: p3Width - 44 - targetWidth,
          y: y3 + cardHeight - 34,
          size: 5.7,
          font: helveticaBold,
          color: tealAccent
        });
      }

      // Table Header Strip
      const thY = y3 + cardHeight - 46;
      page3.drawRectangle({
        x: 40,
        y: thY - 2,
        width: p3Width - 80,
        height: 10,
        color: lightBg
      });

      page3.drawText('ACTIVE INGREDIENT (API) & PHARMACOPEIA SPECIFICATION', { x: 44, y: thY + 1, size: 5.6, font: helveticaBold, color: mutedSlate });
      page3.drawText('TARGET DOSE', { x: 300, y: thY + 1, size: 5.6, font: helveticaBold, color: mutedSlate });
      page3.drawText('BATCH (60 CAPS)', { x: 380, y: thY + 1, size: 5.6, font: helveticaBold, color: mutedSlate });
      page3.drawText('THERAPEUTIC ROLE', { x: 460, y: thY + 1, size: 5.6, font: helveticaBold, color: mutedSlate });

      // 2-Line Table Rows
      let itemY = thY - 12;
      cap.ingredients.forEach((ing) => {
        page3.drawText(`• ${ing.name}`, { x: 44, y: itemY + 2, size: 6.4, font: helveticaBold, color: darkSlate, maxWidth: 245 });
        page3.drawText(ing.dose, { x: 300, y: itemY + 2, size: 6.2, font: helveticaBold, color: tealAccent });
        page3.drawText(ing.batch60, { x: 380, y: itemY + 2, size: 6.2, font: helveticaBold, color: navyPrimary });
        page3.drawText(ing.purpose, { x: 460, y: itemY + 2, size: 5.8, font: helveticaBold, color: darkSlate, maxWidth: 90 });

        page3.drawText(`Spec: ${ing.spec}`, { x: 50, y: itemY - 6, size: 5.1, font: helveticaOblique, color: mutedSlate, maxWidth: p3Width - 110 });

        page3.drawLine({
          start: { x: 44, y: itemY - 8 },
          end: { x: p3Width - 44, y: itemY - 8 },
          thickness: 0.5,
          color: rgb(241 / 255, 245 / 255, 249 / 255)
        });

        itemY -= rowH;
      });

      y3 -= 6;
    });

    // Optional Module D: Soluble Fiber Sachet Directive
    y3 -= 24;
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
      size: 5.9,
      font: helveticaBold,
      color: tealAccent
    });
    page3.drawText('Psyllium Husk Powder USP (5 g per sachet in water, before largest meal). Take 2 hours apart from capsules. Add only if HbA1c 5.7–6.4% or fasting glucose elevated.', {
      x: 44,
      y: y3 + 4,
      size: 5.3,
      font: helvetica,
      color: darkSlate,
      maxWidth: p3Width - 88
    });

    // Baseline Lab Decision Rules Matrix (Adjusting Formulations to Labs)
    y3 -= 32;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 30,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.8
    });
    page3.drawText('BASELINE LABS DECISION MATRIX (CLINICAL SAFETY ADJUSTMENT RULES):', {
      x: 44,
      y: y3 + 21,
      size: 5.8,
      font: helveticaBold,
      color: navyPrimary
    });
    const labRulesLine1 = '• 25(OH)D <20 ng/mL: Increase D3 to 4,000 IU; re-test at 8–12 wks   • Homocysteine >15 µmol/L: Increase 5-MTHF to 800 mcg   • Warfarin: Contraindicated with Vit K2';
    const labRulesLine2 = '• HbA1c 5.7–6.4%: Add Chromium Picolinate (200 mcg Cr) + Module D   • eGFR <60 mL/min: Reduce elemental Mg to 100 mg & monitor serum magnesium';
    page3.drawText(labRulesLine1, { x: 44, y: y3 + 12, size: 5.2, font: helvetica, color: darkSlate, maxWidth: p3Width - 88 });
    page3.drawText(labRulesLine2, { x: 44, y: y3 + 4, size: 5.2, font: helvetica, color: darkSlate, maxWidth: p3Width - 88 });

    // Co-Administration Restriction & Anti-Duplication Directive
    y3 -= 24;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 22,
      color: rgb(254 / 255, 242 / 255, 242 / 255), // alert light red
      borderColor: alertRed,
      borderWidth: 1
    });

    page3.drawText('DISPENSING DIRECTIVE & CO-ADMINISTRATION RESTRICTION (NO DUPLICATE SUPPLEMENTATION):', {
      x: 44,
      y: y3 + 13,
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
    y3 -= 66;
    page3.drawRectangle({
      x: 36,
      y: y3,
      width: p3Width - 72,
      height: 62,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page3.drawText('PRESCRIBING PHYSICIAN AUTHORIZATION & OFFICIAL MEDICAL VALIDATION', {
      x: 44,
      y: y3 + 49,
      size: 7.0,
      font: helveticaBold,
      color: navyPrimary
    });

    page3.drawLine({
      start: { x: 44, y: y3 + 44 },
      end: { x: p3Width - 44, y: y3 + 44 },
      thickness: 0.6,
      color: cardBorder
    });

    // Left Panel: Physician Information
    page3.drawText('Prescribing Physician (Full Name): _______________________________________________', {
      x: 44,
      y: y3 + 31,
      size: 5.8,
      font: helvetica,
      color: darkSlate
    });

    page3.drawText('Medical License / Registry Reg. No.: ____________________________________________', {
      x: 44,
      y: y3 + 19,
      size: 5.8,
      font: helvetica,
      color: darkSlate
    });

    page3.drawText('Territory Jurisdiction: State of Qatar   ·   Issue Date: ____ / ____ / 2026', {
      x: 44,
      y: y3 + 7,
      size: 5.8,
      font: helvetica,
      color: darkSlate
    });

    // Vertical Panel Divider
    page3.drawLine({
      start: { x: 345, y: y3 + 4 },
      end: { x: 345, y: y3 + 42 },
      thickness: 0.8,
      color: cardBorder
    });

    // Right Panel: Signature & Stamp Box
    page3.drawText('Physician\'s Professional Stamp & Signature:', {
      x: 355,
      y: y3 + 31,
      size: 6.0,
      font: helveticaBold,
      color: darkSlate
    });

    page3.drawLine({
      start: { x: 355, y: y3 + 12 },
      end: { x: p3Width - 46, y: y3 + 12 },
      thickness: 0.8,
      color: rgb(160 / 255, 160 / 255, 160 / 255)
    });

    page3.drawText('Authorized Prescribing Signature & Clinical Seal', {
      x: 355,
      y: y3 + 4,
      size: 5.3,
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
