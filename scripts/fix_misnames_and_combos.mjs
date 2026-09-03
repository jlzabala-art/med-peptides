import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function fixMisnamesAndCombos() {
  console.log('=== FIXING MISNAMED PRODUCTS AND BLEND TITLES ===\n');

  const fixes = [
    {
      id: 'gonadorelin-acetate-2mg',
      updates: {
        name: 'Gonadorelin Acetate',
        canonicalName: 'Gonadorelin Acetate',
        slug: 'gonadorelin-acetate-2mg',
        category: 'Hormone Optimization'
      }
    },
    {
      id: 'nadolol',
      updates: {
        name: 'Nadolol',
        canonicalName: 'Nadolol',
        slug: 'nadolol',
        category: 'Cardiovascular & Metabolic'
      }
    },
    {
      id: 'bpc-157-semaglutide',
      updates: {
        name: 'BPC-157 + Semaglutide',
        canonicalName: 'BPC-157 + Semaglutide',
        slug: 'bpc-157-semaglutide'
      }
    },
    {
      id: 'bpc-157-tb-500-blend',
      updates: {
        name: 'BPC-157 + TB-500 Blend',
        canonicalName: 'BPC-157 + TB-500 Blend',
        slug: 'bpc-157-tb-500-blend'
      }
    },
    {
      id: 'bpc-157-tb-500-ghk-cu',
      updates: {
        name: 'BPC-157 + TB-500 + GHK-Cu',
        canonicalName: 'BPC-157 + TB-500 + GHK-Cu',
        slug: 'bpc-157-tb-500-ghk-cu'
      }
    },
    {
      id: 'bpc-157-tb-500-ghk-cu-kpv',
      updates: {
        name: 'BPC-157 + TB-500 + GHK-Cu + KPV',
        canonicalName: 'BPC-157 + TB-500 + GHK-Cu + KPV',
        slug: 'bpc-157-tb-500-ghk-cu-kpv'
      }
    },
    {
      id: 'cjc-1295-no-dac-ipamorelin-bpc-157',
      updates: {
        name: 'CJC-1295 (No DAC) + Ipamorelin + BPC-157',
        canonicalName: 'CJC-1295 + Ipamorelin + BPC-157',
        slug: 'cjc-1295-no-dac-ipamorelin-bpc-157'
      }
    },
    {
      id: 'glow-bpc-157-tb-500-ghk',
      updates: {
        name: 'Glow (BPC-157 + TB-500 + GHK)',
        canonicalName: 'Glow (BPC-157 + TB-500 + GHK)',
        slug: 'glow-bpc-157-tb-500-ghk'
      }
    },
    {
      id: 'glow-ghk-cu-bpc-157-tb-500',
      updates: {
        name: 'Glow (GHK-Cu + BPC-157 + TB-500)',
        canonicalName: 'Glow (GHK-Cu + BPC-157 + TB-500)',
        slug: 'glow-ghk-cu-bpc-157-tb-500'
      }
    },
    {
      id: 'klow-bpc-157-tb-500-ghkcu-kpv',
      updates: {
        name: 'Klow (BPC-157 + TB-500 + GHK-Cu + KPV)',
        canonicalName: 'Klow (BPC-157 + TB-500 + GHK-Cu + KPV)',
        slug: 'klow-bpc-157-tb-500-ghkcu-kpv'
      }
    },
    {
      id: 'cagrilintide-semaglutide',
      updates: {
        name: 'Cagrilintide + Semaglutide (CagriSema)',
        canonicalName: 'Cagrilintide + Semaglutide (CagriSema)',
        slug: 'cagrilintide-semaglutide'
      }
    },
    {
      id: 'bioniq_bpc_157_kpv_capsule',
      updates: {
        name: 'BPC-157 + KPV Capsules (Bioniq)',
        canonicalName: 'BPC-157 + KPV Capsules',
        slug: 'bpc-157-kpv'
      }
    }
  ];

  for (const item of fixes) {
    const docRef = db.collection('products').doc(item.id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      await docRef.update({
        ...item.updates,
        status: 'active',
        isActive: true,
        updatedAt: new Date().toISOString()
      });
      console.log(`  ✅ Fixed [${item.id}] -> "${item.updates.name}"`);
    } else {
      console.log(`  ℹ️ [${item.id}] does not exist, skipping.`);
    }
  }

  // Delete draft copy duplicates
  const draftDuplicates = ['Pom63lsg1UcYKeaJpvF2', 'g4Ax8meYh2vpF0sZOOh1'];
  for (const dupId of draftDuplicates) {
    const dupRef = db.collection('products').doc(dupId);
    const dupSnap = await dupRef.get();
    if (dupSnap.exists && dupSnap.data().name?.includes('(Copy)')) {
      await dupRef.delete();
      console.log(`  🗑️ Deleted duplicate test copy: [${dupId}]`);
    }
  }

  console.log('\n=== MISNAMES AND COMBOS CORRECTION COMPLETE ===');
}

fixMisnamesAndCombos().catch(console.error);
