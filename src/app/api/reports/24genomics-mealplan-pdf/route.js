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

    // =========================================================================
    // PAGE 1: MEAL PLAN SELECTION GUIDE & 24-HOUR ROUTINE
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
      size: 8.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const badge1 = 'PAGE 1 OF 2 · MEAL PLAN & KITCHEN ROUTINE';
    const badge1W = helveticaBold.widthOfTextAtSize(badge1, 6.8) + 14;
    page1.drawRectangle({
      x: p1Width - 36 - badge1W,
      y: y1 - 3,
      width: badge1W,
      height: 15,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1
    });
    page1.drawText(badge1, {
      x: p1Width - 36 - badge1W + 7,
      y: y1 + 2,
      size: 6.8,
      font: helveticaBold,
      color: tealAccent
    });

    y1 -= 16;
    page1.drawText('PERSONALIZED MEAL PLAN & DIET GUIDE', {
      x: 36,
      y: y1,
      size: 13,
      font: helveticaBold,
      color: darkSlate
    });

    y1 -= 11;
    page1.drawText('How to choose your daily catering meals and synchronize your nutrition based on your DNA', {
      x: 36,
      y: y1,
      size: 7.4,
      font: helvetica,
      color: mutedSlate
    });

    y1 -= 8;
    page1.drawLine({
      start: { x: 36, y: y1 },
      end: { x: p1Width - 36, y: y1 },
      thickness: 1,
      color: cardBorder
    });

    // Metadata Ribbon
    y1 -= 12;
    page1.drawText(`PATIENT: ${patientName}   |   SPECIMEN ID: ${sampleId}   |   MEAL SERVICE: ${mealPlanPartner}`, {
      x: 36,
      y: y1,
      size: 7.0,
      font: helveticaBold,
      color: tealAccent
    });

    y1 -= 8;
    page1.drawLine({
      start: { x: 36, y: y1 },
      end: { x: p1Width - 36, y: y1 },
      thickness: 0.8,
      color: cardBorder
    });

    // -------------------------------------------------------------------------
    // SECTION 1: YOUR DNA IN 4 PLAIN-ENGLISH FINDINGS
    // -------------------------------------------------------------------------
    y1 -= 16;
    page1.drawText('1. YOUR GENETIC PROFILE IN PLAIN ENGLISH (WHAT YOUR DNA SAYS)', {
      x: 36,
      y: y1,
      size: 9.5,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 8;
    const plainFindings = [
      {
        title: 'High Active Folate Need',
        desc: 'Your cells need pre-activated folate (5-MTHF) for sustained energy and brain clarity. Avoid cheap synthetic folic acid found in fortified industrial breads.'
      },
      {
        title: 'Lactose Sensitivity',
        desc: 'Your genetics show low lactase enzyme production. Choosing dairy-free dishes in your meal plan will prevent bloating, gas, and digestive sluggishness.'
      },
      {
        title: 'Fat-Assisted Vitamin D Uptake',
        desc: 'Your Vitamin D receptors require extra support. Always take your Vitamin D supplement alongside healthy fats (olive oil, eggs, avocado) for real absorption.'
      },
      {
        title: 'Slow Afternoon Caffeine Clearance',
        desc: 'Your liver takes longer to clear caffeine. Cut off coffee and energy stimulants before 2:00 PM to protect nighttime restorative sleep architecture.'
      }
    ];

    const boxW = (p1Width - 72 - 16) / 2;
    const boxH = 68;
    plainFindings.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bX = 36 + col * (boxW + 16);
      const bY = y1 - (row * (boxH + 12)) - boxH;

      page1.drawRectangle({
        x: bX,
        y: bY,
        width: boxW,
        height: boxH,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 0.8
      });

      page1.drawText(`• ${f.title}:`, {
        x: bX + 10,
        y: bY + boxH - 16,
        size: 7.8,
        font: helveticaBold,
        color: navyPrimary
      });

      page1.drawText(f.desc, {
        x: bX + 10,
        y: bY + boxH - 30,
        size: 6.8,
        font: helvetica,
        color: darkSlate,
        maxWidth: boxW - 20,
        lineHeight: 9.5
      });
    });

    y1 -= (2 * boxH + 12 + 14);

    // -------------------------------------------------------------------------
    // SECTION 2: MEAL PLAN TRAFFIC LIGHT (WHAT TO ORDER)
    // -------------------------------------------------------------------------
    y1 -= 14;
    page1.drawText('2. MEAL PLAN SELECTION GUIDE (TRAFFIC LIGHT FOR YOUR CATERING MENU)', {
      x: 36,
      y: y1,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 10;
    const trafficCols = [
      {
        header: '[GREEN] ALWAYS ORDER (DNA Favorites)',
        color: greenText,
        bgColor: greenBg,
        borderColor: greenBorder,
        items: [
          '• Wild salmon, sea bass, lean poultry, grass-fed beef',
          '• Dark leafy greens (spinach, arugula, kale), broccoli',
          '• Healthy fats: Extra virgin olive oil, avocado, seeds',
          '• Smart carbs: Quinoa, basmati rice, cooled boiled potatoes'
        ]
      },
      {
        header: '[AMBER] ENJOY IN MODERATION (Control)',
        color: amberText,
        bgColor: amberBg,
        borderColor: amberBorder,
        items: [
          '• Net Carbs: Keep under 40g per meal to prevent spikes',
          '• Soaked legumes: Lentils, chickpeas, edamame',
          '• Natural fruits: Berries, green apples, citrus fruits',
          '• Red meat: Limit to 2–3 times per week maximum'
        ]
      },
      {
        header: '[RED] EXCLUDE FROM YOUR CATERING',
        color: redText,
        bgColor: redBg,
        borderColor: redBorder,
        items: [
          '• Dairy creams, cow milk cheeses, bechamel sauces',
          '• Industrial seed oils (soybean, corn, refined palm)',
          '• White flour baguettes, sugary pastries & desserts',
          '• Commercial bottled fruit juices & sweetened sodas'
        ]
      }
    ];

    const colW = (p1Width - 72 - 16) / 3;
    const cH = 165;
    trafficCols.forEach((tc, cIdx) => {
      const cX = 36 + cIdx * (colW + 8);

      page1.drawRectangle({
        x: cX,
        y: y1 - cH,
        width: colW,
        height: cH,
        color: tc.bgColor,
        borderColor: tc.borderColor,
        borderWidth: 1
      });

      page1.drawRectangle({
        x: cX,
        y: y1 - 22,
        width: colW,
        height: 22,
        color: tc.bgColor
      });

      page1.drawText(tc.header, {
        x: cX + 8,
        y: y1 - 15,
        size: 7.0,
        font: helveticaBold,
        color: tc.color
      });

      let iY = y1 - 36;
      tc.items.forEach((it) => {
        page1.drawText(it, {
          x: cX + 8,
          y: iY,
          size: 6.6,
          font: helvetica,
          color: darkSlate,
          maxWidth: colW - 16,
          lineHeight: 8.8
        });
        iY -= 31;
      });
    });

    y1 -= (cH + 16);

    // -------------------------------------------------------------------------
    // SECTION 3: THE GOLDEN PLATE SEQUENCING RULE
    // -------------------------------------------------------------------------
    y1 -= 4;
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
      y: y1 - 18,
      size: 7.8,
      font: helveticaBold,
      color: tealAccent
    });

    const seqText = 'Inside each meal tray, eat your food in this exact sequence: (1) Vegetables & salad first  ->  (2) Protein & healthy fats second  ->  (3) Rice or potatoes LAST.\nClinical impact: This creates a protective fiber mesh in your stomach, reducing blood sugar spikes by up to 45% and eliminating post-meal energy slumps.';
    page1.drawText(seqText, {
      x: 48,
      y: y1 - 36,
      size: 7.0,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 96,
      lineHeight: 10.5
    });

    y1 -= (seqH + 16);

    // -------------------------------------------------------------------------
    // SECTION 4: 24-HOUR DAILY ROUTINE WITH YOUR MEALS
    // -------------------------------------------------------------------------
    y1 -= 4;
    page1.drawText('4. 24-HOUR DAILY ROUTINE: SYNCHRONIZED WITH YOUR MEALS & SUPPLEMENTS', {
      x: 36,
      y: y1,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y1 -= 10;
    const dailySteps = [
      {
        time: 'Upon Waking (Empty Stomach)',
        step: 'Probiotics & Gut Shield',
        action: 'Drink a full glass of water. Take Capsule A (Probiotic DRcaps®).',
        why: 'Protects delicate live cultures as they enter an empty stomach without food interference.'
      },
      {
        time: 'With Meal Plan Breakfast',
        step: 'Energy & Vitamin D3/K2',
        action: 'Take Capsule B (Active Folate + B-Complex + D3/K2).',
        why: 'Must be taken with breakfast containing healthy fats (eggs, olive oil, avocado) to absorb fat-soluble Vitamin D.'
      },
      {
        time: 'With Lunch or Main Dinner',
        step: 'Plate Sequencing & Soluble Fiber',
        action: 'Follow the 1-2-3 plate order. Optional: 1 glass of water with fiber sachet.',
        why: 'Slows carbohydrate absorption, maintains steady mental focus and prevents energy crashes.'
      },
      {
        time: '30-60 Min Before Sleep',
        step: 'Restorative Sleep & Muscle Relax',
        action: 'Take Capsule C (2 capsules of Magnesium Bisglycinate + Theanine).',
        why: 'Clears daily stress, calms the nervous system, prevents muscle tension, and promotes deep REM sleep.'
      }
    ];

    const stepW = (p1Width - 72 - 18) / 4;
    const sH = 155;
    dailySteps.forEach((st, sIdx) => {
      const sX = 36 + sIdx * (stepW + 6);

      page1.drawRectangle({
        x: sX,
        y: y1 - sH,
        width: stepW,
        height: sH,
        color: lightBg,
        borderColor: cardBorder,
        borderWidth: 0.8
      });

      // Header Banner
      page1.drawRectangle({
        x: sX,
        y: y1 - 24,
        width: stepW,
        height: 24,
        color: rgb(241 / 255, 245 / 255, 249 / 255)
      });

      page1.drawText(st.time, {
        x: sX + 6,
        y: y1 - 15,
        size: 6.2,
        font: helveticaBold,
        color: tealAccent,
        maxWidth: stepW - 12
      });

      page1.drawText(st.step, {
        x: sX + 6,
        y: y1 - 38,
        size: 7.2,
        font: helveticaBold,
        color: navyPrimary,
        maxWidth: stepW - 12
      });

      page1.drawText(st.action, {
        x: sX + 6,
        y: y1 - 60,
        size: 6.4,
        font: helveticaBold,
        color: darkSlate,
        maxWidth: stepW - 12,
        lineHeight: 8.5
      });

      page1.drawLine({
        start: { x: sX + 6, y: y1 - 100 },
        end: { x: sX + stepW - 6, y: y1 - 100 },
        thickness: 0.5,
        color: cardBorder
      });

      page1.drawText(st.why, {
        x: sX + 6,
        y: y1 - 114,
        size: 6.0,
        font: helvetica,
        color: mutedSlate,
        maxWidth: stepW - 12,
        lineHeight: 7.8
      });
    });

    y1 -= (sH + 16);

    // -------------------------------------------------------------------------
    // SECTION 5: KITCHEN FRIDGE REMINDER
    // -------------------------------------------------------------------------
    const kH = 54;
    page1.drawRectangle({
      x: 36,
      y: y1 - kH,
      width: p1Width - 72,
      height: kH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 1
    });

    page1.drawText('3 GOLDEN KITCHEN REMINDERS:', {
      x: 48,
      y: y1 - 16,
      size: 7.2,
      font: helveticaBold,
      color: navyPrimary
    });

    const kitchenReminders = '1. Hydration: Drink 2.5L of water daily between meals (not during)  ·  2. Caffeine Cutoff: Zero caffeine after 2:00 PM  ·  3. Overnight Rest: Maintain a 12-hour overnight fast between dinner and breakfast.';
    page1.drawText(kitchenReminders, {
      x: 48,
      y: y1 - 34,
      size: 6.5,
      font: helvetica,
      color: darkSlate,
      maxWidth: p1Width - 96,
      lineHeight: 9.5
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
    page1.drawText('Page 1 of 2 · Meal Plan & Daily Routine · Turn to Page 2 for Simplified Supplement Packs & Shopping Guide', {
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

    const badge2 = 'PAGE 2 OF 2 · SIMPLIFIED SUPPLEMENT GUIDE';
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
      size: 9.5,
      font: helveticaBold,
      color: navyPrimary
    });

    const humanSupplements = [
      {
        benefit: 'IMMUNITY & BONE STRENGTH',
        nutrient: 'Vitamin D3 + K2 (MK-7)',
        why: 'Your DNA shows slow Vitamin D activation. This pair directs calcium directly into your bones and strengthens defense cells.',
        timing: 'With breakfast containing fats (eggs, olive oil, avocado).',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: 'CELLULAR ENERGY & CLARITY',
        nutrient: 'Active Folate (L-5-MTHF)',
        why: 'Bypasses your MTHFR genetic block to keep you clear-headed. Provides clean cellular energy without synthetic buildup.',
        timing: 'Morning with your breakfast.',
        priority: 'PRIORITY 1 · ESSENTIAL',
        pColor: redText,
        pBg: redBg
      },
      {
        benefit: 'DEEP REST & STRESS RESET',
        nutrient: 'Magnesium Bisglycinate + Theanine',
        why: 'Calms nerve sensitivity, relaxes muscle tension after workouts, and quiets racing thoughts for restorative sleep.',
        timing: 'Evening: Take 2 capsules 30–60 min before bed with water.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: 'METABOLISM & LIVER BALANCE',
        nutrient: 'Methylated B-Complex (B12 + B6)',
        why: 'Essential cofactors that support homocysteine clearance, healthy nerve myelin, and daytime alertness.',
        timing: 'Morning with food.',
        priority: 'PRIORITY 2 · RECOMMENDED',
        pColor: blueBorder,
        pBg: blueBg
      },
      {
        benefit: 'GUT BARRIER & FLAT DIGESTION',
        nutrient: 'Targeted Enteric Probiotics',
        why: 'Protective cultures (LGG + BB-12) that re-seed healthy gut flora and defend against bloat, gas, and dairy sensitivities.',
        timing: 'First thing upon waking with room-temperature water.',
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
        borderWidth: 0.8
      });

      // Left Accent Strip
      page2.drawRectangle({
        x: 36,
        y: y2,
        width: 4,
        height: cardH,
        color: s.pColor
      });

      // Header strip inside card
      page2.drawRectangle({
        x: 40,
        y: y2 + cardH - 20,
        width: p2Width - 76,
        height: 20,
        color: rgb(248 / 255, 250 / 255, 252 / 255)
      });

      // Benefit Header & Nutrient Name
      page2.drawText(s.benefit, {
        x: 48,
        y: y2 + cardH - 14,
        size: 8.2,
        font: helveticaBold,
        color: navyPrimary
      });

      page2.drawText(`· ${s.nutrient}`, {
        x: 48 + helveticaBold.widthOfTextAtSize(s.benefit, 8.2) + 8,
        y: y2 + cardH - 14,
        size: 7.8,
        font: helveticaBold,
        color: tealAccent
      });

      // Priority Pill
      const pillW = helveticaBold.widthOfTextAtSize(s.priority, 6.0) + 12;
      page2.drawRectangle({
        x: p2Width - 44 - pillW,
        y: y2 + cardH - 16,
        width: pillW,
        height: 13,
        color: s.pBg
      });
      page2.drawText(s.priority, {
        x: p2Width - 44 - pillW + 6,
        y: y2 + cardH - 13,
        size: 6.0,
        font: helveticaBold,
        color: s.pColor
      });

      // Why Text
      page2.drawText(`Why your DNA needs this: ${s.why}`, {
        x: 48,
        y: y2 + 34,
        size: 7.0,
        font: helvetica,
        color: darkSlate,
        maxWidth: p2Width - 100,
        lineHeight: 9.8
      });

      // Timing Text
      page2.drawText(`How to take: ${s.timing}`, {
        x: 48,
        y: y2 + 14,
        size: 6.8,
        font: helveticaBold,
        color: mutedSlate
      });

      y2 -= 7;
    });

    // -------------------------------------------------------------------------
    // SECTION 2: CHOOSE YOUR LEVEL (3 SIMPLE BUDGET PACKS)
    // -------------------------------------------------------------------------
    y2 -= 8;
    page2.drawText('2. CHOOSE YOUR LEVEL: 3 SIMPLE DECISION PACKS (BUY ONLY WHAT YOU NEED)', {
      x: 36,
      y: y2,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 10;
    const packs = [
      {
        name: 'PACK 1 · ESSENTIAL CORE',
        items: '2 Supplements · Minimum Base',
        highlight: 'Covers 80% of Core DNA Needs',
        desc: '• Vitamin D3/K2 + Active Folate.\n• Resolves your primary cellular & bone health genetic blocks without excess spending.',
        color: tealAccent,
        bg: rgb(240 / 255, 253 / 255, 250 / 255)
      },
      {
        name: 'PACK 2 · PERFORMANCE & SLEEP',
        items: '4 Supplements · Most Popular',
        highlight: 'Daytime Energy + Restful Sleep',
        desc: '• Adds Magnesium Bisglycinate + B-Complex.\n• Highly recommended if you experience stressful workdays, fatigue or restless nights.',
        color: navyPrimary,
        bg: rgb(239 / 255, 246 / 255, 255 / 255)
      },
      {
        name: 'PACK 3 · TOTAL DIGESTION',
        items: '5 Supplements · Full Program',
        highlight: 'Complete Microbiome Defense',
        desc: '• Adds Targeted Enteric Probiotics.\n• Perfect if you suffer from bloating, gas, lactose sensitivity, or frequent gut discomfort.',
        color: greenText,
        bg: greenBg
      }
    ];

    const pkW = (p2Width - 72 - 16) / 3;
    const pkH = 96;
    packs.forEach((pk, pIdx) => {
      const pkX = 36 + pIdx * (pkW + 8);

      page2.drawRectangle({
        x: pkX,
        y: y2 - pkH,
        width: pkW,
        height: pkH,
        color: pk.bg,
        borderColor: pk.color,
        borderWidth: pIdx === 1 ? 1.4 : 0.8
      });

      // Header inside pack card
      page2.drawRectangle({
        x: pkX,
        y: y2 - 20,
        width: pkW,
        height: 20,
        color: pk.bg
      });

      page2.drawText(pk.name, {
        x: pkX + 8,
        y: y2 - 13,
        size: 7.0,
        font: helveticaBold,
        color: pk.color
      });

      page2.drawText(pk.items, {
        x: pkX + 8,
        y: y2 - 30,
        size: 6.4,
        font: helveticaBold,
        color: darkSlate
      });

      page2.drawText(pk.desc, {
        x: pkX + 8,
        y: y2 - 46,
        size: 6.0,
        font: helvetica,
        color: mutedSlate,
        maxWidth: pkW - 16,
        lineHeight: 8.5
      });
    });

    y2 -= (pkH + 16);

    // -------------------------------------------------------------------------
    // SECTION 3: HOW DO YOU PREFER TO TAKE IT? (PHARMACY VS COMPOUNDING)
    // -------------------------------------------------------------------------
    y2 -= 4;
    page2.drawText('3. HOW DO YOU PREFER TO TAKE IT? (TWO SIMPLE SHOPPING PATHWAYS)', {
      x: 36,
      y: y2,
      size: 9.8,
      font: helveticaBold,
      color: navyPrimary
    });

    y2 -= 10;
    const pathwayW = (p2Width - 72 - 12) / 2;
    const pathwayH = 86;

    // Pathway 1: Local Doha Pharmacy
    page2.drawRectangle({
      x: 36,
      y: y2 - pathwayH,
      width: pathwayW,
      height: pathwayH,
      color: lightBg,
      borderColor: cardBorder,
      borderWidth: 0.8
    });

    page2.drawText('OPTION A: LOCAL DOHA PHARMACIES (COMMERCIAL BOTTLES)', {
      x: 48,
      y: y2 - 16,
      size: 7.0,
      font: helveticaBold,
      color: darkSlate
    });
    const p1Desc = '• Buy 2 to 5 separate bottles at retail pharmacies in Qatar (Brands: Solgar, Thorne, Now Foods).\n• Pros: Immediate local purchase.\n• Cons: Taking 4–6 pills from multiple bottles with non-customized generic doses.';
    page2.drawText(p1Desc, {
      x: 48,
      y: y2 - 32,
      size: 6.2,
      font: helvetica,
      color: mutedSlate,
      maxWidth: pathwayW - 24,
      lineHeight: 9.0
    });

    // Pathway 2: Custom Compounding All-in-One
    page2.drawRectangle({
      x: 36 + pathwayW + 12,
      y: y2 - pathwayH,
      width: pathwayW,
      height: pathwayH,
      color: rgb(240 / 255, 253 / 255, 250 / 255),
      borderColor: tealAccent,
      borderWidth: 1.2
    });

    page2.drawText('OPTION B: CUSTOM ALL-IN-ONE COMPOUNDING (RECOMMENDED)', {
      x: 48 + pathwayW + 12,
      y: y2 - 16,
      size: 7.0,
      font: helveticaBold,
      color: tealAccent
    });
    const p2Desc = '• Prepared specifically for you in synchronized daily capsules (1 with breakfast, 2 at bedtime).\n• Pros: All your pure nutrients combined into just 3 capsules/day. 100% lactose-free.\n• Cons: Requires authorized prescription compounding by licensed partner pharmacy.';
    page2.drawText(p2Desc, {
      x: 48 + pathwayW + 12,
      y: y2 - 32,
      size: 6.2,
      font: helvetica,
      color: darkSlate,
      maxWidth: pathwayW - 24,
      lineHeight: 9.0
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

    // Page 2 Footer
    page2.drawText('Atlas Health Services · Personalized Supplement Guide · Designed for patient clarity & adherence · www.atlashealthservices.com', {
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
          y: boxTop + 16,
          width: dWidth - 152,
          height: 72,
          color: lightBg,
          borderColor: cardBorder,
          borderWidth: 0.8
        });

        dividerPage.drawText('DOCUMENT STRUCTURE & GENERAL OVERVIEW:', {
          x: 88,
          y: boxTop + 68,
          size: 8.0,
          font: helveticaBold,
          color: navyPrimary
        });
        dividerPage.drawText('Section I contains the personalized meal plan recommendations, daily routine schedule, and dietary choices designed for daily convenience.', {
          x: 88,
          y: boxTop + 52,
          size: 7.2,
          font: helvetica,
          color: darkSlate,
          maxWidth: dWidth - 176
        });
        dividerPage.drawText('Section II includes the full 55-page DNA Nutrition report issued by 24Genetics, containing the complete spectrum of nutritional predispositions, metabolic profiles, and genetic polymorphisms.', {
          x: 88,
          y: boxTop + 30,
          size: 7.2,
          font: helvetica,
          color: darkSlate,
          maxWidth: dWidth - 176
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
