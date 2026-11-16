import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

import { evaluateNutrigenomicProfile } from '../src/data/genomics/clinicalNutrigenomicEngine.js';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function buildMergedPdfForHossam(fusedProfile) {
  const reportsDir = path.join(process.cwd(), 'public/reports/24genetics');
  const nutritionPath = path.join(reportsDir, 'G000943554_Nutrition.pdf');
  const ancestryPath = path.join(reportsDir, 'G000943554_Ancestry.pdf');
  const mergedPath = path.join(reportsDir, 'G000943554_Complete_Nutrition_Ancestry.pdf');

  const mergedPdf = await PDFDocument.create();
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await mergedPdf.embedFont(StandardFonts.Helvetica);

  // Page 1: Atlas Genomic Fusion Executive Cover
  const cover = mergedPdf.addPage([595.28, 841.89]);
  const { width, height } = cover.getSize();
  cover.drawRectangle({ x: 0, y: height - 110, width, height: 110, color: rgb(0, 0.21, 0.4) });
  cover.drawText('ATLAS HEALTH SERVICES · 24GENETICS INTEGRATED DOSSIER', {
    x: 42,
    y: height - 45,
    size: 11,
    font: fontBold,
    color: rgb(0.58, 0.77, 0.99),
  });
  cover.drawText('Hossam Ahmed — Complete Nutrition & Ancestry Fusion Report', {
    x: 42,
    y: height - 72,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  cover.drawText(`Sample ID: G000943554  ·  Generated: ${new Date().toISOString().slice(0, 10)}`, {
    x: 42,
    y: height - 92,
    size: 10,
    font: fontReg,
    color: rgb(0.88, 0.94, 1),
  });

  const anc = fusedProfile.ancestralMetabolicProfile;
  const lines = [
    ['Macro Cluster', `${anc.macroCluster.toUpperCase()} (${anc.primaryRegion} · ${anc.primaryPercent}%)`],
    ['Maternal mtDNA Lineage', anc.maternalHaplogroup],
    ['Paternal Y-DNA Lineage', anc.paternalHaplogroup || 'N/A'],
    ['Neanderthal Introgression', `${anc.neanderthalPercent}% — ${anc.neanderthalRule?.status || ''}`],
    ['Dairy Adaptation', anc.dairyAdaptation?.status || ''],
    ['Carbohydrate Metabolism', anc.carbohydrateAdaptation?.status || ''],
    ['Botanical / Spice Shield', anc.spiceMatrix?.titleEn || ''],
  ];

  let y = height - 155;
  cover.drawText('Integrated Evolutionary + Nutrigenomic Summary', {
    x: 42,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  y -= 26;

  for (const [k, v] of lines) {
    cover.drawText(`${k}:`, { x: 42, y, size: 10, font: fontBold, color: rgb(0.28, 0.33, 0.41) });
    cover.drawText(String(v).slice(0, 78), { x: 195, y, size: 10, font: fontReg, color: rgb(0.06, 0.09, 0.16) });
    y -= 20;
  }

  y -= 16;
  cover.drawText('Clinical Synthesis:', { x: 42, y, size: 11, font: fontBold, color: rgb(0, 0.21, 0.4) });
  y -= 18;
  const words = String(anc.clinicalSynthesisEn || '').split(/\s+/);
  let curLine = '';
  for (const w of words) {
    if ((curLine + ' ' + w).length > 88) {
      cover.drawText(curLine.trim(), { x: 42, y, size: 10, font: fontReg, color: rgb(0.18, 0.23, 0.3) });
      y -= 15;
      curLine = w;
    } else {
      curLine += ' ' + w;
    }
  }
  if (curLine.trim()) {
    cover.drawText(curLine.trim(), { x: 42, y, size: 10, font: fontReg, color: rgb(0.18, 0.23, 0.3) });
  }

  // Append Nutrition PDF pages
  const nutritionDoc = await PDFDocument.load(fs.readFileSync(nutritionPath));
  const nutritionPages = await mergedPdf.copyPages(nutritionDoc, nutritionDoc.getPageIndices());
  nutritionPages.forEach((p) => mergedPdf.addPage(p));

  // Append Ancestry PDF pages
  const ancestryDoc = await PDFDocument.load(fs.readFileSync(ancestryPath));
  const ancestryPages = await mergedPdf.copyPages(ancestryDoc, ancestryDoc.getPageIndices());
  ancestryPages.forEach((p) => mergedPdf.addPage(p));

  const bytes = await mergedPdf.save();
  fs.writeFileSync(mergedPath, bytes);
  console.log(`✅ Merged PDF written: ${mergedPath} (${mergedPdf.getPageCount()} pages, ${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
  return mergedPdf.getPageCount();
}

async function main() {
  const hossamProfile = evaluateNutrigenomicProfile({ sampleCode: 'G000943554' });
  const wafaProfile = evaluateNutrigenomicProfile({ sampleCode: 'G000943568' });

  const mergedPages = await buildMergedPdfForHossam(hossamProfile);

  await db.collection('genomic_profiles').doc('G000943554').set(
    {
      sampleCode: 'G000943554',
      patientName: hossamProfile.patient.name,
      doctor: hossamProfile.patient.doctor,
      clinic: hossamProfile.patient.clinic,
      reports: {
        nutrition: { available: true, pdfUrl: '/reports/24genetics/G000943554_Nutrition.pdf' },
        ancestry: {
          available: true,
          pdfUrl: '/reports/24genetics/G000943554_Ancestry.pdf',
          data: hossamProfile.ancestralMetabolicProfile,
        },
        merged: {
          available: true,
          pdfUrl: '/reports/24genetics/G000943554_Complete_Nutrition_Ancestry.pdf',
          pageCount: mergedPages,
        },
      },
      genotypesEvaluated: hossamProfile.genotypesEvaluated,
      ancestralMetabolicProfile: hossamProfile.ancestralMetabolicProfile,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection('genomic_profiles').doc('G000943568').set(
    {
      sampleCode: 'G000943568',
      patientName: wafaProfile.patient.name,
      doctor: wafaProfile.patient.doctor,
      clinic: wafaProfile.patient.clinic,
      reports: {
        nutrition: { available: true },
        ancestry: { available: true, data: wafaProfile.ancestralMetabolicProfile },
      },
      genotypesEvaluated: wafaProfile.genotypesEvaluated,
      ancestralMetabolicProfile: wafaProfile.ancestralMetabolicProfile,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('✅ Saved Hossam (G000943554) and Wafa (G000943568) fused genomic profiles to Firestore.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
