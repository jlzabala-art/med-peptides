import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import GenomicsPriceListClient from './GenomicsPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = '24Genetics Clinical DNA Panels • Official B2B & Clinic Price Schedule';
  const description = 'Official wholesale and clinical price schedule for 24Genetics CE-IVD saliva genomic panels: All-in-One, Pharmacogenetics, Nutrigenetics, Health, Skin, Sport, Microbiome, and AI Connect.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/24genetics`,
      images: [
        {
          url: `${appUrl}/og-genomics.png`,
          width: 1200,
          height: 630,
          alt: '24Genetics DNA Panels Price Schedule'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

const FALLBACK_24GENETICS_PRODUCTS = [
  {
    id: 'all-in-one',
    sku: '24G-ALL-IN-ONE',
    name: 'All-in-One DNA Test (Full 7 Genomic Reports)',
    subtitle: 'Comprehensive 7-in-1 Report: Health, Pharmacogenetics, Nutrigenetics, Sport, Skin & Hair, Personality, Ancestry',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Complete Genomic Profile',
    snpsCount: '+700,000 SNPs',
    keyGenes: 'CYP450, MTHFR, COMT, APOE, FTO, VDR, ACTN3, COL1A1, BDNF, SULT1A1',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Precision Longevity Micronutrient Infusion & Nutrigenomic Calibration'
  },
  {
    id: 'all-in-one-plus',
    sku: '24G-ALL-IN-ONE-PLUS',
    name: 'All-in-One Plus DNA Test (7 Reports + Raw Data)',
    subtitle: 'Full 7 clinical reports plus complete uninterpreted Illumina GSA Raw Data file for bioinformatics analysis',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Complete Genomic Profile',
    snpsCount: '+700,000 SNPs + Raw Data',
    keyGenes: 'Complete Genome-Wide Single Nucleotide Polymorphism Callset',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Full Epigenetic & Longevity Protocol Calibration'
  },
  {
    id: 'nutrigenetics',
    sku: '24G-NUTRIGENETICS',
    name: 'Nutrigenetics DNA Panel',
    subtitle: 'Macro & micronutrient metabolic predisposition, food intolerances, glycemic sensitivity & vitamin pathways',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Nutrigenomics',
    snpsCount: '+50,000 SNPs',
    keyGenes: 'MTHFR, FTO, PPARG, TCF7L2, VDR, BCMO1, SLC23A1, MCM6 (Lactase)',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Custom Compounded Nutrigenomic Multi-Nutrient Capsules'
  },
  {
    id: 'pharmacogenetics',
    sku: '24G-PHARMACOGENETICS',
    name: 'Pharmacogenetics Plus DNA Panel',
    subtitle: 'CYP450 enzyme metabolism profile for +400 prescription drugs across cardiology, psychiatry, oncology & pain management',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Pharmacogenomics',
    snpsCount: '+80,000 SNPs',
    keyGenes: 'CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, VKORC1, SLCO1B1, TPMT, DPYD',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Targeted Dosing & Adverse Drug Reaction Shield'
  },
  {
    id: 'health',
    sku: '24G-HEALTH',
    name: 'Health Predisposition DNA Panel',
    subtitle: 'Complex cardiometabolic, oncologic, autoimmune, and neurodegenerative disease risk stratification',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Clinical Health',
    snpsCount: '+120,000 SNPs',
    keyGenes: 'APOE (e4/e3/e2), LDLR, PCSK9, BRCA1/2, CDKN2A, TCF7L2, NOS3',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Cardiometabolic & Mitochondrial Protection Formulas'
  },
  {
    id: 'skin',
    sku: '24G-SKIN-HAIR',
    name: 'Skin & Hair Genetic DNA Panel',
    subtitle: 'Dermal collagen degradation, glycation susceptibility, UV photoaging, alopecia sensitivity & hair thinning predisposition',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Trichology & Derma',
    snpsCount: '+35,000 SNPs',
    keyGenes: 'COL1A1, MMP1, AGER, SOD2, GPX1, AR (Androgen Receptor), SRD5A2',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Custom TrichoFoam™ / TrichoSol™ Compounding + Colway Hair Ritual'
  },
  {
    id: 'sport',
    sku: '24G-SPORT-FITNESS',
    name: 'Sport & Athletic Performance DNA Panel',
    subtitle: 'Musculoskeletal fiber composition (Power vs. Endurance), injury risk, VO2 max trainability & systemic recovery rate',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Athletic Performance',
    snpsCount: '+45,000 SNPs',
    keyGenes: 'ACTN3 (R577X), ACE (I/D), PPARGC1A, COL5A1, IL6, CRP',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Tissue Repair Peptide Formulations (BPC-157 / TB-500) & Electrolytes'
  },
  {
    id: 'personality',
    sku: '24G-PERSONALITY-TALENT',
    name: 'Personality & Talent DNA Panel',
    subtitle: 'Neurotransmitter dopamine/serotonin tone, stress resilience, circadian chronotype & cognitive performance',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Neurogenomics',
    snpsCount: '+30,000 SNPs',
    keyGenes: 'COMT (Val158Met), BDNF, DRD2, SLC6A4 (5-HTTLPR), CLOCK',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Nootropic & Circadian Modulating Formulas'
  },
  {
    id: 'ancestry',
    sku: '24G-ANCESTRY-ORIGINS',
    name: 'Ancestry & Geographical Origins DNA Panel',
    subtitle: 'Detailed geographic ancestry breakdown across +1,500 worldwide regions, plus mitochondrial and Y-chromosome haplogroups',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    category: 'Ancestry & Lineage',
    snpsCount: '+700,000 SNPs',
    keyGenes: 'Global Population Informative Markers, mtDNA, Y-DNA',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Geographic Evolutionary Trait Correlation'
  },
  {
    id: 'test-microbiome',
    sku: '24G-MICROBIOME-16S',
    name: 'Intestinal Microbiome 16S rRNA Test',
    subtitle: 'Next-generation sequencing of gut microbiota: Firmicutes/Bacteroidetes ratio, dysbiosis index & short-chain fatty acids',
    sampleType: 'Stool Collection Swab Kit',
    turnaroundTime: '3-4 Weeks',
    category: 'Microbiome Sequencing',
    snpsCount: '16S rRNA Metagenomics',
    keyGenes: 'Bacterial 16S Hypervariable Regions (V3-V4)',
    costPriceEur: 149.00,
    costPack10Eur: 104.30,
    wholesalePriceEur: 178.80,
    clinicPriceEur: 201.15,
    retailPriceEur: 223.50,
    compoundingSynergy: 'Personalized Synbiotic & Postbiotic Compounding Formulas'
  },
  {
    id: '24G-AI-ANNUAL',
    sku: '24G-AI-CONNECT-ANNUAL',
    name: '24Genetics AI Connect Subscription (Annual)',
    subtitle: '12 Months of continuous genomic AI report re-interpretation, clinical updates & literature cross-referencing',
    sampleType: 'Digital Cloud License',
    turnaroundTime: 'Instant Activation',
    category: 'AI Clinical Software',
    snpsCount: 'Dynamic AI Re-Annotation',
    keyGenes: 'Continuous PubMed & ClinVar Evidence Synchronization',
    costPriceEur: 99.99,
    costPack10Eur: 99.99,
    wholesalePriceEur: 119.99,
    clinicPriceEur: 139.99,
    retailPriceEur: 149.99,
    compoundingSynergy: 'Automated Real-Time Prescription Recalibration'
  },
  {
    id: '24G-AI-MONTHLY',
    sku: '24G-AI-CONNECT-MONTHLY',
    name: '24Genetics AI Connect Subscription (Monthly)',
    subtitle: 'Monthly flexible digital license for AI genomic updates and automated clinician clinical decision support',
    sampleType: 'Digital Cloud License',
    turnaroundTime: 'Instant Activation',
    category: 'AI Clinical Software',
    snpsCount: 'Dynamic AI Re-Annotation',
    keyGenes: 'Continuous PubMed & ClinVar Evidence Synchronization',
    costPriceEur: 9.99,
    costPack10Eur: 9.99,
    wholesalePriceEur: 11.99,
    clinicPriceEur: 13.99,
    retailPriceEur: 14.99,
    compoundingSynergy: 'Monthly Automated Re-calibration'
  }
];

export default async function GenomicsPricingPage() {
  let products = [...FALLBACK_24GENETICS_PRODUCTS];

  if (adminDb) {
    try {
      const snap = await adminDb.collection('products')
        .where('supplierId', '==', 'supplier-24genetics')
        .limit(50)
        .get();

      if (!snap.empty) {
        const firestoreMap = {};
        snap.forEach(doc => {
          const d = doc.data();
          firestoreMap[doc.id] = d;
          if (Array.isArray(d.variants)) {
            d.variants.forEach(v => {
              if (v.id || v.docId) firestoreMap[v.id || v.docId] = v;
            });
          }
        });

        products = products.map(p => {
          const remote = firestoreMap[p.id] || firestoreMap[p.sku];
          if (!remote) return p;

          return {
            ...p,
            name: remote.label || remote.name || p.name,
            costPriceEur: Number(remote.cost || remote.cost_tiers?.cost_1 || remote.price || p.costPriceEur),
            costPack10Eur: Number(remote.cost_tiers?.cost_10 || p.costPack10Eur),
            wholesalePriceEur: Number(remote.wholesalePrice || remote.pricing?.wholesale?.perUnit || p.wholesalePriceEur),
            clinicPriceEur: Number(remote.clinicPrice || remote.pricing?.clinic?.perUnit || p.clinicPriceEur),
            retailPriceEur: Number(remote.retailPrice || remote.pricing?.retail?.perUnit || p.retailPriceEur)
          };
        });
      }
    } catch (e) {
      console.warn('24Genetics pricing page: Firestore read error, using fallback seed:', e.message);
    }
  }

  return <GenomicsPriceListClient initialProducts={products} />;
}

