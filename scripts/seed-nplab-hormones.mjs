import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

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

const EUR_TO_AED = 3.98;

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePrice(val) {
  if (val == null) return null;
  if (typeof val === 'number') return Number.isFinite(val) && val > 0 ? val : null;
  const str = String(val).trim();
  if (!str || str === '—' || str === '-') return null;
  const num = Number(str.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null;
}

function parseActiveIngredients(name) {
  return String(name || '')
    .split(/\s*[+\-—]\s*(?=[A-Z0-9])/i)
    .map((part) => part.trim())
    .filter((p) => p && !/^\d+(ml|g|caps|tabs|troches|pessaries|supp)/i.test(p));
}

// ── 1. MEN'S TRT CATALOGUE (NP_LABS_PRICE.pdf) ───────────────────────────────
const MENS_TRT_SECTIONS = [
  {
    category: 'Testosterone Topical',
    dosageForm: 'Topical Cream / Gel',
    items: [
      ['Testosterone 5% — 35ml Liposomal base', '35 mL', 'Liposomal Base', 32.0],
      ['Testosterone 5% — 35ml HRT base', '35 mL', 'HRT Base', 40.0],
      ['Testosterone 10% — 35ml Liposomal base', '35 mL', 'Liposomal Base', 38.5],
      ['Testosterone 10% — 35ml HRT base', '35 mL', 'HRT Base', 48.0],
      ['Testosterone 10% — 50ml Liposomal base', '50 mL', 'Liposomal Base', 55.0],
      ['Testosterone 10% — 50ml HRT base', '50 mL', 'HRT Base', 65.0],
      ['Testosterone 20% — 35ml Liposomal base', '35 mL', 'Liposomal Base', 70.0],
      ['Testosterone 20% — 35ml HRT base', '35 mL', 'HRT Base', 80.0],
      ['Testosterone 20% — 50ml Liposomal base', '50 mL', 'Liposomal Base', 100.0],
      ['Testosterone 20% — 50ml HRT base', '50 mL', 'HRT Base', 110.0],
      ['Testosterone 20% — 100ml Liposomal base', '100 mL', 'Liposomal Base', 200.0],
      ['Testosterone 20% — 100ml HRT base', '100 mL', 'HRT Base', 210.0],
    ],
  },
  {
    category: 'DHT Cream',
    dosageForm: 'Topical Cream',
    items: [
      ['DHT 2.5% — 50ml cream', '50 mL', 'Cream', 30.0],
      ['DHT 5% — 50ml cream', '50 mL', 'Cream', 44.0],
      ['DHT 10% — 35ml cream', '35 mL', 'Cream', 50.0],
      ['DHT 10% — 50ml cream', '50 mL', 'Cream', 70.0],
      ['DHT 15% — 50ml cream', '50 mL', 'Cream', 85.0],
      ['DHT 20% — 30ml cream', '30 mL', 'Cream', 80.0],
      ['DHT 20% — 50ml cream', '50 mL', 'Cream', 120.0],
    ],
  },
  {
    category: 'Hormone Injectables',
    dosageForm: 'Injectable',
    items: [
      ['Testosterone Enanthate 250mg vial (Norma)', '1 Vial (250 mg)', 'Injectable Vial', 20.0],
      ['Testosterone Enanthate 250mg vial x10 (Nouveaux)', '10 Vials (250 mg)', 'Injectable Multi-Pack', 130.0],
      ['HCG 5000IU vial', '5000 IU Vial', 'Lyophilized Vial', 40.0],
      ['Nandrolone Decanoate 250mg amp', '1 Ampoule (250 mg)', 'Injectable Ampoule', 13.0],
      ['Methenolone Enanthate 100mg amp', '1 Ampoule (100 mg)', 'Injectable Ampoule', 15.0],
    ],
  },
  {
    category: 'Oral — Testosterone & Androgens',
    dosageForm: 'Oral Capsules / Troches',
    items: [
      ['Mesterolone 20mg — 60 caps', '60 Caps', 'Oral Capsules', 49.5],
      ['Mesterolone 25mg — 60 caps', '60 Caps', 'Oral Capsules', 55.0],
      ['Mesterolone 25mg — 120 caps', '120 Caps', 'Oral Capsules', 110.0],
      ['Mesterolone 50mg — 60 caps', '60 Caps', 'Oral Capsules', 65.0],
      ['Oxandrolone 10mg — 30 caps', '30 Caps', 'Oral Capsules', 33.0],
      ['Oxandrolone 10mg — 60 caps', '60 Caps', 'Oral Capsules', 60.0],
      ['Oxandrolone 20mg — 30 caps', '30 Caps', 'Oral Capsules', 60.0],
      ['Oxandrolone 20mg — 60 caps', '60 Caps', 'Oral Capsules', 120.0],
      ['DHEA 10mg — 60 caps', '60 Caps', 'Oral Capsules', 25.0],
      ['DHEA 25mg — 60 caps', '60 Caps', 'Oral Capsules', 33.0],
      ['DHEA 50mg — 60 caps', '60 Caps', 'Oral Capsules', 44.0],
      ['DHEA 50mg — 60 troches', '60 Troches', 'Sublingual Troches', 60.0],
      ['DHEA 7-Keto 50mg — 60 caps', '60 Caps', 'Oral Capsules', 33.0],
      ['DHEA 7-Keto 100mg — 60 caps', '60 Caps', 'Oral Capsules', 45.0],
    ],
  },
  {
    category: 'Oral — SERM / Fertility',
    dosageForm: 'Oral Capsules / Tabs',
    items: [
      ['Clomiphene Citrate 50mg — 30 tabs', '30 Tabs', 'Oral Tablets', 5.0],
      ['Enclomiphene 6.25mg — 30 caps', '30 Caps', 'Oral Capsules', 15.0],
      ['Enclomiphene 12.5mg — 30 caps', '30 Caps', 'Oral Capsules', 25.0],
      ['Enclomiphene 25mg — 30 caps', '30 Caps', 'Oral Capsules', 35.0],
      ['Enclomiphene 50mg — 30 caps', '30 Caps', 'Oral Capsules', 50.0],
    ],
  },
  {
    category: 'Oral — Thyroid',
    dosageForm: 'Oral Capsules',
    items: [
      ['Natural Desiccated Thyroid 1/2 grain — 60 caps', '60 Caps', 'Oral Capsules', 22.0],
      ['Natural Desiccated Thyroid 1 grain — 60 caps', '60 Caps', 'Oral Capsules', 30.0],
      ['Natural Desiccated Thyroid 2 grain — 60 caps', '60 Caps', 'Oral Capsules', 50.0],
    ],
  },
  {
    category: 'Erectile Function',
    dosageForm: 'Oral / Topical',
    items: [
      ['Tadalafil 5mg — 30 caps', '30 Caps', 'Oral Capsules', 30.0],
      ['Tadalafil 10mg — 30 caps', '30 Caps', 'Oral Capsules', 40.0],
      ['Tadalafil 20mg — 30 caps', '30 Caps', 'Oral Capsules', 50.0],
      ['Tadalafil 5% — 35ml cream', '35 mL', 'Topical Cream', 30.0],
      ['Tadalafil 2.5mg + Epimedum + MACA + Tribulus + Ashwaganda + B6 — 60 caps', '60 Caps', 'Oral Capsules', 100.0],
    ],
  },
  {
    category: 'Longevity & Endocrine Support',
    dosageForm: 'Oral Capsules / Drops',
    items: [
      ['LDN 0.5mg — 30 caps', '30 Caps', 'Oral Capsules', 12.0],
      ['LDN 1.5mg — 30 caps', '30 Caps', 'Oral Capsules', 16.0],
      ['LDN 3mg — 30 caps', '30 Caps', 'Oral Capsules', 19.0],
      ['LDN 4.5mg — 30 caps', '30 Caps', 'Oral Capsules', 22.0],
      ['LDN 1.5mg/ml — 100ml oral drops', '100 mL', 'Oral Drops', 60.0],
      ['Pregnenolone 50mg — 60 caps', '60 Caps', 'Oral Capsules', 30.0],
      ['Pregnenolone 100mg — 60 caps', '60 Caps', 'Oral Capsules', 45.0],
      ['Pregnenolone 200mg — 60 caps', '60 Caps', 'Oral Capsules', 70.0],
      ['Boron 3mg — 60 caps', '60 Caps', 'Oral Capsules', 17.0],
      ['Boron 6mg — 30 caps', '30 Caps', 'Oral Capsules', 18.0],
      ['Aldosterone 125mcg caps', '60 Caps', 'Oral Capsules', 30.0],
      ['NMN 500mg — 60 caps', '60 Caps', 'Oral Capsules', 40.0],
      ['NMN 1000mg — 100 caps', '100 Caps', 'Oral Capsules', 110.0],
    ],
  },
];

// ── 2. BHRT CATALOGUE (NP_LABS_BHRT.pdf) ─────────────────────────────────────
// Columns per section: [name, [pack1Price, pack2Price, pack3Price?]]
const BHRT_SECTIONS = [
  {
    category: 'BHRT Cream / Gel',
    dosageForm: 'Transdermal Cream / Gel',
    packs: ['50g / 50ml', '100g / 100ml', '30g / 30ml'],
    rows: [
      ['7-KETO DHEA 20MG', [31.90, 62.80, 19.14]],
      ['BIEST 0,05% - PROGESTERONE 2% - TESTOSTERONE 0,5%', [38.00, 75.00, 22.80]],
      ['BIEST 0,10%', [18.00, 35.00, 10.56]],
      ['BIEST 0,15%', [19.00, 37.00, 12.00]],
      ['BIEST 0,2% + TESTOSTERONE 0,1%', [23.00, 45.00, 14.00]],
      ['BIEST 0,2% - DHEA 4%', [39.60, 78.20, 23.76]],
      ['BIEST 0,2% - PROGESTERONE 10%', [38.50, 76.00, 23.10]],
      ['BIEST 0,2% - PROGESTERONE 5%', [28.60, 56.00, 17.16]],
      ['BIEST 0,20%', [21.00, 40.80, 12.54]],
      ['BIEST 0,3% - PROGESTERONE 7,5%', [36.30, 71.00, 21.78]],
      ['BIEST 0,30%', [24.00, 48.00, 15.00]],
      ['BIEST 0,4 + PROGESTERONE 5%', [38.50, 76.00, 23.10]],
      ['BIEST 0,4 + PROGESTERONE 5% + TESTOSTERONE 0,05%', [41.80, 83.00, 25.08]],
      ['BIEST 0,4%-PROGESTERONE 10%', [47.30, 93.00, 28.38]],
      ['BIEST 0,40%', [25.30, 48.50, 15.18]],
      ['BIEST 0,50%', [28.00, 55.00, 17.00]],
      ['BIEST 0,60%', [28.60, 56.20, 17.16]],
      ['BIEST 0,80%', [33.00, 65.00, 19.80]],
      ['BIEST 1%', [39.60, 78.20, 23.76]],
      ['DHEA 1%', [14.30, 27.60, 8.58]],
      ['DHEA 10%', [44.00, 87.00, 26.40]],
      ['DHEA 2%', [19.80, 37.50, 11.88]],
      ['DHEA 2% - PREGNENOLONE 10%', [71.50, 143.00, 42.90]],
      ['DHEA 2,5%', [26.40, 52.00, 15.84]],
      ['DHEA 4%', [30.00, 59.00, 17.00]],
      ['DHEA 4% + PREGNENOLONE 6%', [70.00, 140.00, 50.00]],
      ['DHEA 5%', [33.00, 65.00, 20.00]],
      ['DHEA 5% + PREGNENOLONE 10%', [88.00, 175.00, 52.80]],
      ['DHT 10%', [55.00, 109.00, 33.00]],
      ['DHT 5%', [33.00, 65.00, 20.00]],
      ['ESTRADIOL 0,01%', [13.20, 25.00, 7.92]],
      ['ESTRADIOL 0,05%', [15.00, 29.00, 9.00]],
      ['ESTRADIOL 0,05% - PROGESTERONE 2%', [16.50, 32.00, 9.90]],
      ['ESTRADIOL 0,06%', [15.40, 30.00, 9.24]],
      ['ESTRADIOL 0,06% - PROGESTERONE 5%', [22.00, 43.00, 13.20]],
      ['ESTRADIOL 0,1%', [17.60, 34.20, 10.56]],
      ['ESTRADIOL 0,2%', [19.80, 38.60, 11.88]],
      ['ESTRADIOL 0,2% - PROGESTERONE 10%', [27.50, 55.00, 16.50]],
      ['ESTRADIOL 0,8% - PROGESTERONE 5%', [50.00, 100.00, 30.00]],
      ['ESTRIOL 0,1%', [22.00, 43.00, 13.20]],
      ['ESTRIOL 0,5%', [40.70, 81.00, 24.42]],
      ['PREGNENOLONE 10%', [48.40, 95.80, 29.04]],
      ['PREGNENOLONE 5%', [38.50, 76.00, 23.10]],
      ['PROGESTERONE 0,5% + TESTOSTERONE 1%', [40.00, 79.00, 24.00]],
      ['PROGESTERONE 0.5% + TESTOSTERONE 10%', [43.00, 85.00, 26.00]],
      ['PROGESTERONE 1%', [13.00, 26.00, null]],
      ['PROGESTERONE 1% + TESTOSTERONE 10%', [44.00, 87.00, 27.00]],
      ['PROGESTERONE 10%', [25.30, 49.60, 15.18]],
      ['PROGESTERONE 15%', [31.90, 62.80, 19.14]],
      ['PROGESTERONE 2% + TESTOSTERONE 10%', [55.00, 109.00, 33.00]],
      ['PROGESTERONE 20%', [40.70, 80.40, 24.42]],
      ['PROGESTERONE 40%', [66.00, 131.00, 39.60]],
      ['PROGESTERONE 5%', [20.90, 40.80, 12.54]],
      ['TESTOSTERONE 0,1%', [17.60, 34.20, 10.56]],
      ['TESTOSTERONE 0,2%', [18.70, 36.40, 12.00]],
      ['TESTOSTERONE 0,5%', [22.00, 43.00, 13.20]],
      ['TESTOSTERONE 1%', [23.10, 45.20, 13.86]],
      ['TESTOSTERONE 10%', [60.00, 115.00, 36.00]],
      ['TESTOSTERONE 15%', [66.00, 131.00, 40.00]],
      ['TESTOSTERONE 20%', [99.00, 199.00, 70.00]],
      ['TESTOSTERONE 20% + PROGESTERONE 0,5% + CHRYSIN 5%', [120.00, 220.00, 72.00]],
      ['TESTOSTERONE 5%', [27.50, 54.00, 16.50]],
      ['TESTOSTERONE 5% + CHRYSIN 5%', [30.80, 60.60, 18.48]],
      ['TRI-EST 0,125%', [19.80, 65.00, 11.88]],
      ['TRI-EST 0,25%', [27.50, 55.00, 16.50]],
      ['TRI-EST 0,5%', [34.10, 67.20, 20.90]],
      ['TRI-EST 1,25%', [57.20, 113.00, 34.32]],
    ],
  },
  {
    category: 'BHRT Vaginal Cream',
    dosageForm: 'Vaginal Cream',
    packs: ['50g', '100g', '30g'],
    rows: [
      ['BIEST 0,25MG', [23.00, 46.00, 14.00]],
      ['BIEST 0,5MG', [27.50, 55.00, 16.50]],
      ['BIEST 0,5MG + DHEA 20MG + TESTOSTERONE 0,8', [36.00, 72.00, 22.00]],
      ['BIEST 1MG', [33.00, 66.00, 20.00]],
      ['BIEST 1MG + DHEA 20MG', [40.70, 81.40, 24.42]],
      ['BIEST 1MG + PROGESTERONE 100MG', [47.30, 94.00, 28.38]],
      ['BIEST 1MG + PROGESTERONE 100MG + DHEA 20MG', [55.00, 110.00, 33.00]],
      ['BIEST 1MG + PROGESTERONE 100MG + DHEA 25MG', [65.00, 130.00, 39.00]],
      ['BIEST 1MG + PROGESTERONE 100MG + TESTOSTERONE 2MG', [51.00, 102.00, 30.50]],
      ['BIEST 1MG + PROGESTERONE 50MG + DHEA 20MG', [52.00, 104.00, null]],
      ['BIEST 1MG + PROGESTERONE 50MG + DHEA 20MG + TESTOSTERONE 1MG', [55.00, 110.00, null]],
      ['BIEST 1MG + PROGESTERONE 50MG + DHEA 25MG + TESTOSTERONE 5MG', [70.40, 140.80, 42.24]],
      ['BIEST 1MG + PROGESTERONE 50MG + TESTOSTERONE 1MG', [42.35, 84.70, 25.41]],
      ['BIEST 1MG + PROGESTERONE 50MG + TESTOSTERONE 5MG', [47.85, 95.70, 28.71]],
      ['BIEST 2MG', [39.60, 79.20, 23.76]],
      ['BIEST 2MG + PROGESTERONE 100MG', [53.00, 106.00, 32.00]],
      ['BIEST 2MG + PROGESTERONE 100MG + DHEA 20MG', [81.95, 163.90, 49.17]],
      ['BIEST 2MG + PROGESTERONE 100MG + TESTOSTERONE 1MG', [55.00, 110.00, 33.00]],
      ['BIEST 2MG + PROGESTERONE 50MG', [49.50, 99.00, 29.70]],
      ['BIEST 3MG + PROGESTERONE 100MG + TESTOSTERONE 2MG', [66.00, 132.00, 39.60]],
      ['BIEST 8MG', [77.00, 154.00, 46.20]],
      ['DHEA 10MG', [15.40, 30.80, 9.24]],
      ['DHEA 10MG + TESTOSTERONE 2MG', [16.50, 33.00, 9.90]],
      ['DHEA 20MG', [25.85, 51.70, 15.51]],
      ['DHEA 25MG + TESTOSTERONE 1MG', [36.30, 72.60, 21.78]],
      ['DHEA 50MG + PREGNENOLONE 75MG + PROGESTERONE 50', [154.00, 308.00, 92.40]],
      ['DHEA 5MG', [12.00, 24.00, 7.00]],
      ['ESTRIOL 0,1MG + TESTOSTERONE 0,1MG', [16.50, 33.00, 9.90]],
      ['ESTRIOL 1MG', [19.80, 39.60, 11.88]],
      ['ESTRIOL 1MG + DHEA 10MG', [33.00, 66.00, 19.80]],
      ['ESTRIOL 1MG + TESTOSTERONE 0,1MG', [19.80, 39.60, 11.88]],
      ['ESTRIOL 2MG', [24.20, 48.40, 14.52]],
      ['PREGNENOLONE 25MG', [39.60, 79.20, 23.76]],
      ['PREGNENOLONE 50MG', [49.50, 99.00, 29.70]],
      ['PROGESTERONE 100MG', [42.90, 85.80, 25.74]],
      ['PROGESTERONE 150MG', [49.50, 99.00, 29.70]],
      ['PROGESTERONE 25MG', [22.00, 44.00, 13.20]],
      ['PROGESTERONE 50MG', [29.15, 58.30, 17.49]],
      ['PROGESTERONE 50MG + DHEA 25MG + TESTOSTERONE 1MG', [45.00, 90.00, 27.00]],
      ['TESTOSTERONE 10MG', [33.00, 66.00, 20.00]],
      ['TESTOSTERONE 1MG', [22.00, 44.00, 13.20]],
      ['TESTOSTERONE 5MG', [28.05, 56.10, 16.83]],
    ],
  },
  {
    category: 'BHRT Oral Capsules',
    dosageForm: 'Oral Hormone Capsules',
    packs: ['60 Caps', '100 Caps', '120 Caps'],
    rows: [
      ['ALDOSTERONE 125MCG CAPS', [27.50, 49.50, 55.00]],
      ['BIEST 1MG', [11.00, 18.33, 22.00]],
      ['DHEA 100MG', [55.00, 88.00, 110.00]],
      ['DHEA 10MG', [21.00, 34.00, 41.00]],
      ['DHEA 10MG -MELATONIN 3MG', [38.50, 66.00, 77.00]],
      ['DHEA 15MG', [24.20, 38.50, 48.40]],
      ['DHEA 2.5MG', [13.20, 21.67, 26.40]],
      ['DHEA 20MG', [25.30, 44.00, 50.60]],
      ['DHEA 20MG + PREGNENOLONE 50', [49.50, 82.50, 99.00]],
      ['DHEA 25MG', [28.00, 40.70, 52.80]],
      ['DHEA 25MG + PREGNENOLONE 50MG', [59.40, 99.00, 118.80]],
      ['DHEA 50MG', [38.50, 66.00, 77.00]],
      ['DHEA 5MG', [16.20, 27.00, 32.00]],
      ['DHEA 7 KETO 100MG', [39.60, 66.00, 79.20]],
      ['DHEA 7 KETO 10MG', [13.20, 22.00, 26.40]],
      ['DHEA 7 KETO 25MG', [26.40, 44.00, 52.80]],
      ['DHEA 7 KETO 50MG', [33.00, 55.00, 66.00]],
      ['DHEA 7 KETO 5MG', [10.56, 17.60, 21.12]],
      ['ESTRADIOL 1MG', [18.70, 41.80, 37.40]],
      ['HYDROCORTISONE 10MG', [39.60, 66.00, 79.20]],
      ['HYDROCORTISONE 2,5MG', [16.50, 27.50, 33.00]],
      ['HYDROCORTISONE 5MG', [29.70, 49.50, 59.40]],
      ['LDN 0,5MG', [13.00, 22.00, 26.00]],
      ['LDN 0,75MG', [14.00, 24.00, 28.00]],
      ['LDN 1,5MG', [16.00, 27.00, 32.00]],
      ['LDN 3MG', [23.10, 38.50, 46.20]],
      ['LDN 4,5MG', [29.70, 49.50, 59.40]],
      ['MELATONIN 0.5MG', [10.00, 17.00, 20.00]],
      ['MELATONIN 10MG', [46.00, 76.67, 92.00]],
      ['MELATONIN 1MG', [12.10, 20.00, 24.20]],
      ['MELATONIN 20MG', [54.00, 90.00, 108.00]],
      ['MELATONIN 2MG', [19.80, 33.00, 39.60]],
      ['MELATONIN 2MG SLOW RELEASE', [23.00, 38.00, 45.00]],
      ['MELATONIN 3MG', [22.00, 37.40, 44.00]],
      ['MELATONIN 5MG', [33.00, 44.00, 66.00]],
      ['MELATONIN 60MG', [76.00, 126.67, 152.00]],
      ['NATURAL DESICCATED THYROID 1 1/2 GRAIN (90MG)', [38.50, 52.80, 77.00]],
      ['NATURAL DESICCATED THYROID 1 GRAIN (60MG)', [30.00, 44.00, 54.00]],
      ['NATURAL DESICCATED THYROID 1/2 GRAIN (30MG)', [22.00, 38.50, 46.00]],
      ['NATURAL DESICCATED THYROID 1/4 GRAIN (15MG)', [15.40, 24.20, 30.80]],
      ['NATURAL DESICCATED THYROID 2 GRAIN (120MG)', [44.00, 60.50, 88.00]],
      ['NATURAL DESICCATED THYROID 3/4 GRAIN (75MG)', [25.00, 42.00, 50.00]],
      ['PREGNENOLONE 100MG', [44.00, 73.33, 88.00]],
      ['PREGNENOLONE 10MG', [19.00, 31.00, 37.00]],
      ['PREGNENOLONE 25MG', [22.00, 33.00, 44.00]],
      ['PREGNENOLONE 300MG', [87.00, 145.00, 160.00]],
      ['PREGNENOLONE 50MG', [27.50, 44.00, 55.00]],
      ['PROGESTERONE 100MG', [19.80, 33.00, 39.60]],
      ['PROGESTERONE 10MG', [9.90, 16.50, 19.80]],
      ['PROGESTERONE 150MG', [24.00, 39.60, 46.20]],
      ['PROGESTERONE 200MG', [27.50, 46.20, 55.00]],
      ['PROGESTERONE 20MG', [12.10, 19.80, 24.20]],
      ['PROGESTERONE 250MG', [33.00, 55.00, 66.00]],
      ['PROGESTERONE 25MG', [13.20, 22.00, 26.40]],
      ['PROGESTERONE 300MG', [36.30, 60.50, 72.60]],
      ['PROGESTERONE 400MG', [49.50, 82.50, 100.00]],
      ['PROGESTERONE 50MG', [16.50, 26.40, 33.00]],
    ],
  },
  {
    category: 'BHRT Vaginal Pessaries',
    dosageForm: 'Vaginal Pessaries',
    packs: ['30 Pessaries', '100 Pessaries', '60 Pessaries'],
    rows: [
      ['BIEST 1MG', [11.22, 37.40, 22.44]],
      ['BIEST 1MG + PROGESTERONE 50MG + TESTOSTERONE 50MG', [17.98, 59.95, 35.97]],
      ['BIEST 1MG + TESTOSTERONE 5MG', [10.89, 36.30, 21.78]],
      ['BIEST 2MG', [12.54, 41.80, 25.08]],
      ['BIEST 2MG + PROGESTERONE 50MG', [19.47, 64.90, 38.94]],
      ['BIEST 3MG', [13.70, 45.65, 27.39]],
      ['BIEST 2MG + DHEA 25MG + PROGESTERONE 50MG', [30.86, 102.85, 61.71]],
      ['ESTRIOL 0,1MG', [9.90, 33.00, 19.80]],
      ['ESTRIOL 1MG', [16.83, 56.10, 33.66]],
      ['ESTRIOL 1MG + DHEA 10MG', [16.50, 55.00, 33.00]],
      ['PREGNENOLONE 100MG', [54.12, 180.40, 108.24]],
      ['PREGNENOLONE 50MG', [33.00, 110.00, 66.00]],
      ['PROGESTERONE 100MG', [19.80, 66.00, 39.60]],
      ['PROGESTERONE 25MG', [10.00, 33.00, 20.00]],
      ['PROGESTERONE 50MG', [12.41, 41.36, 24.82]],
    ],
  },
  {
    category: 'BHRT Suppositories',
    dosageForm: 'Hormone Suppositories',
    packs: ['60 Supp', '100 Supp', '120 Supp'],
    rows: [
      ['DHEA 25MG', [26.07, 43.45, 52.14]],
      ['DHEA 25MG + PROGESTERONE 20MG + TESTOSTERONE 50MG', [66.00, 110.00, 132.00]],
      ['DHEA 50MG', [39.60, 66.00, 79.20]],
      ['DHEA 50MG + TESTOSTERONE 100MG + PROGESTERONE 10MG', [132.00, 220.00, 264.00]],
      ['DHEA 50MG + TESTOSTERONE 50MG', [84.81, 141.35, 169.62]],
      ['TESTOSTERONE 100MG', [66.00, 110.00, 132.00]],
      ['TESTOSTERONE 50MG', [52.80, 88.00, 105.60]],
      ['TESTOSTERONE 50MG + PROGESTERONE 10MG', [47.85, 79.75, 95.70]],
    ],
  },
  {
    category: 'BHRT Sublingual Troches',
    dosageForm: 'Sublingual Bioidentical Troches',
    packs: ['30 Troches', '60 Troches'],
    rows: [
      ['BERBERINE 200MG', [11.00, 22.00]],
      ['BIEST 0,5MG + DHEA 40MG + TESTOSTERONE 1MG', [14.96, 29.92]],
      ['BIEST 1,5MG + DHEA 20MG + PREGNENOLONE 100MG', [32.00, 64.00]],
      ['BIEST 10MG', [28.60, 57.20]],
      ['BIEST 10MG + DHEA 100MG + PREGNENOLONE 50MG', [44.00, 88.00]],
      ['BIEST 10MG + DHEA 20MG + TESTOSTERONE 2MG', [25.96, 51.92]],
      ['BIEST 16MG + PREGNENOLONE 100MG + TESTOSTERONE 10MG', [44.00, 88.00]],
      ['BIEST 1MG', [11.44, 22.88]],
      ['BIEST 1MG + DHEA 20MG + PREGNENOLONE 50MG', [19.80, 39.60]],
      ['BIEST 1MG + DHEA 30MG + TESTOSTERONE 1MG', [14.74, 29.48]],
      ['BIEST 1MG + DHEA 60MG + PREGNENOLONE 100MG', [40.80, 81.60]],
      ['BIEST 1MG + PROGESTERONE 100MG', [16.72, 33.44]],
      ['BIEST 1MG + TESTOSTERONE 1MG', [12.32, 24.80]],
      ['BIEST 2,4MG + DHEA 30MG + TESTOSTERONE 1MG', [18.48, 36.96]],
      ['BIEST 2,5MG + DHEA 30MG + TESTOSTERONE 1.2MG', [19.80, 39.60]],
      ['BIEST 2,5MG + DHEA 40MG + TESTOSTERONE 0.4MG', [20.80, 41.60]],
      ['BIEST 2,5MG + PROGESTERONE 100MG + DHEA 50MG + TESTOSTERONE 2MG', [27.60, 55.20]],
      ['BIEST 2MG', [13.20, 26.40]],
      ['BIEST 2MG + DHEA 20MG + PREGNENOLONE 100MG', [28.00, 56.00]],
      ['BIEST 2MG + DHEA 20MG + PREGNENOLONE 50MG', [22.00, 44.00]],
      ['BIEST 2MG + DHEA 20MG + PROGESTERONE 100MG', [16.72, 33.44]],
      ['BIEST 2MG + DHEA 20MG + TESTOSTERONE 2MG', [15.40, 30.80]],
      ['BIEST 2MG + DHEA 50MG', [19.80, 39.60]],
      ['BIEST 2MG + DHEA 50MG + PREGNENOLONE 100MG + TESTOSTERONE 2MG', [43.12, 86.24]],
      ['BIEST 2MG + DHEA 50MG + PREGNENOLONE 50MG + TESTOSTERONE 1MG', [35.20, 70.40]],
      ['BIEST 2MG + DHEA 50MG + TESTOSTERONE 1MG', [21.12, 42.24]],
      ['BIEST 2MG + DHEA 60MG + PREGNENOLONE 50MG + TESTOSTERONE 1MG', [33.00, 66.00]],
      ['BIEST 2MG + DHEA 60MG + TESTOSTERONE 1.5MG', [22.40, 44.80]],
      ['BIEST 2MG + TESTOSTERONE 1MG', [14.08, 28.16]],
      ['BIEST 3MG', [16.28, 32.56]],
      ['BIEST 3MG + DHEA 30MG + TESTOSTERONE 2MG', [19.36, 38.72]],
      ['BIEST 3MG + DHEA 50MG', [22.00, 44.00]],
      ['BIEST 3MG + DHEA 50MG + PROGESTERONE 100MG', [24.20, 48.40]],
      ['BIEST 3MG + DHEA 60MG + TESTOSTERONE 1MG', [22.00, 44.00]],
      ['BIEST 4MG + DHEA 30MG + PREGNENOLONE 50MG', [30.00, 60.00]],
      ['BIEST 4MG + DHEA 30MG + TESTOSTERONE 1MG', [18.92, 37.84]],
      ['BIEST 4MG + DHEA 50MG + PREGNENOLONE 100MG', [30.80, 61.60]],
      ['BIEST 5MG', [22.88, 45.76]],
      ['BIEST 5MG + DHEA 30MG + TESTOSTERONE 1MG', [27.28, 54.56]],
      ['BIEST 6MG', [24.64, 49.28]],
      ['BIEST 6MG + DHEA 40MG + TESTOSTERONE 1.5MG', [25.52, 51.04]],
      ['BIEST 6MG + DHEA 40MG + TESTOSTERONE 2MG', [26.40, 52.80]],
      ['BIEST 6MG + DHEA 50MG + TESTOSTERONE 4MG', [24.20, 48.40]],
      ['BIEST 6MG + DHEA 60MG + TESTOSTERONE 0.5MG', [26.40, 52.80]],
      ['BIEST 8MG', [26.40, 52.80]],
      ['BIEST 8MG + DHEA 40MG + TESTOSTERONE 1MG', [29.04, 58.08]],
      ['BIEST 8MG + DHEA 80MG + TESTOSTERONE 2MG', [33.00, 66.00]],
      ['BIEST 9MG + DHEA 20MG + TESTOSTERONE 0,2MG', [30.36, 60.72]],
      ['DHEA 100MG', [22.00, 44.00]],
      ['DHEA 100MG + PROGESTERONE 10MG + TESTOSTERONE 100MG', [40.48, 80.80]],
      ['DHEA 100MG + PROGESTERONE 5MG + CHRYSIN 50MG', [27.20, 54.40]],
      ['DHEA 100MG + TESTOSTERONE 200MG + CHRYSIN 50MG', [55.00, 110.00]],
      ['DHEA 10MG', [11.88, 23.76]],
      ['DHEA 120MG + PROGESTERONE 10MG + TESTOSTERONE 80MG', [39.60, 79.20]],
      ['DHEA 120MG + PROGESTERONE 8MG + TESTOSTERONE 80MG', [37.40, 74.80]],
      ['DHEA 20MG', [12.76, 25.52]],
      ['DHEA 25MG + BIEST 1MG + PROGESTERONE 100MG + PREGNENOLONE 50MG', [26.40, 52.80]],
      ['DHEA 25MG + PREGNENOLONE 25MG', [15.40, 30.80]],
      ['DHEA 30MG', [14.08, 28.16]],
      ['DHEA 30MG + TESTOSTERONE 0,5MG', [13.64, 27.28]],
      ['DHEA 50MG', [16.28, 32.56]],
      ['DHEA 50MG + PREGNENOLONE 100MG', [35.60, 70.40]],
      ['DHEA 50MG + PREGNENOLONE 100MG + PROGESTERONE 20MG', [37.40, 74.80]],
      ['DHEA 50MG + PREGNENOLONE 50MG + PROGESTERONE 10MG', [28.60, 57.20]],
      ['DHEA 50MG + TESTOSTERONE 100MG + CHRYSIN 50MG', [39.60, 79.20]],
      ['DHEA 50MG + TESTOSTERONE 100MG + PROGESTERONE 4MG', [34.32, 68.64]],
      ['DHEA 50MG + TESTOSTERONE 1MG', [17.16, 34.32]],
      ['DHEA 60MG + PREGNENOLONE 100MG + TESTOSTERONE 140MG + PROGESTERONE 10MG', [70.40, 140.80]],
      ['DHEA 7-KETO 50MG', [15.40, 30.80]],
      ['DHEA 80MG + PROGESTERONE 4MG + TESTOSTERONE 100MG + CHRYSIN', [41.80, 83.60]],
      ['ESTRADIOL 0.5MG', [10.00, 20.00]],
      ['ESTRADIOL 1MG', [11.00, 22.00]],
      ['ESTRIOL 1MG', [13.20, 26.40]],
      ['ESTRIOL 1MG + DHEA 40MG + TESTOSTERONE 0,5MG', [22.00, 44.00]],
      ['MAGNESIUM CITRATE 300MG + MELATONIN 10MG', [26.40, 52.80]],
      ['MAGNESIUM CITRATE 300MG + MELATONIN 2MG', [15.84, 31.68]],
      ['MELATONIN 10MG', [17.60, 35.20]],
      ['MELATONIN 1MG', [8.80, 17.60]],
      ['MELATONIN 20MG', [19.80, 39.60]],
      ['MELATONIN 2MG', [9.68, 19.36]],
      ['MELATONIN 3MG', [10.12, 20.24]],
      ['MELATONIN 40MG', [26.40, 52.80]],
      ['MELATONIN 4MG', [11.00, 22.00]],
      ['MELATONIN 5MG', [13.20, 26.40]],
      ['MELATONIN 60MG', [30.80, 61.60]],
      ['MELATONIN 80MG', [33.00, 66.00]],
      ['MELATONIN 8MG', [16.80, 33.60]],
      ['PREGNENOLONE 100MG', [28.60, 57.20]],
      ['PREGNENOLONE 25MG', [16.72, 33.60]],
      ['PREGNENOLONE 50MG', [22.00, 44.00]],
      ['PROGESTERONE 100MG', [16.72, 33.44]],
      ['PROGESTERONE 150MG', [18.92, 37.84]],
      ['PROGESTERONE 200MG', [22.00, 44.00]],
      ['PROGESTERONE 20MG + DHEA 100MG + TESTOSTERONE 200MG', [52.80, 105.60]],
      ['PROGESTERONE 300MG', [28.60, 57.20]],
      ['PROGESTERONE 40MG + DHEA 140MG + PREGNENOLONE 120MG', [44.00, 88.00]],
      ['PROGESTERONE 50MG', [11.00, 22.00]],
      ['SCELENIUM TORTOSUM 50MG', [13.20, 26.40]],
      ['SCELENIUM TORTOSUM 50MG + MAGNESIUM CITRATE 300MG', [17.60, 35.20]],
      ['TESTOSTERONE 0.1MG', [6.00, 12.00]],
      ['TESTOSTERONE 100MG', [28.60, 57.20]],
      ['TESTOSTERONE 100MG + CHRYSIN 50MG', [30.80, 61.60]],
      ['TESTOSTERONE 100MG + PROGESTERONE 10MG + CHRYSIN 50MG', [35.20, 70.40]],
      ['TESTOSTERONE 100MG + PROGESTERONE 10MG + DHEA 100MG', [39.60, 79.20]],
      ['TESTOSTERONE 100MG + PROGESTERONE 10MG + DHEA 50MG', [28.16, 56.32]],
      ['TESTOSTERONE 100MG + PROGESTERONE 30MG', [35.20, 70.40]],
      ['TESTOSTERONE 100MG + PROGESTERONE 5MG + CHRYSIN 50MG', [33.00, 66.00]],
      ['TESTOSTERONE 10MG', [13.20, 26.40]],
      ['TESTOSTERONE 150MG + PROGESTERONE 10MG + DHEA 50MG', [39.60, 79.20]],
      ['TESTOSTERONE 150MG + PROGESTERONE 20MG', [39.60, 79.20]],
      ['TESTOSTERONE 150MG + PROGESTERONE 20MG + DHEA 50MG', [41.80, 83.60]],
      ['TESTOSTERONE 1MG', [9.68, 19.36]],
      ['TESTOSTERONE 200MG', [37.40, 74.80]],
      ['TESTOSTERONE 200MG + PROGESTERONE 10MG + DHEA 50MG + CHRYSIN', [50.60, 101.20]],
      ['TESTOSTERONE 200MG + PROGESTERONE 20MG + DHEA 100MG', [52.80, 105.60]],
      ['TESTOSTERONE 200MG + PROGESTERONE 2MG', [38.80, 77.60]],
      ['TESTOSTERONE 250MG + PROGESTERONE 10MG + DHEA 30MG', [55.00, 110.00]],
      ['TESTOSTERONE 300MG + PROGESTERONE 10MG + CHRYSIN 50MG', [66.00, 132.00]],
      ['TESTOSTERONE 50MG + DHEA 25MG + PROGESTERONE 1MG + CHRYSIN 50MG', [30.80, 61.60]],
      ['TESTOSTERONE 5MG', [14.52, 29.04]],
    ],
  },
];

function buildAllDocs() {
  const docs = [];

  for (const sec of MENS_TRT_SECTIONS) {
    for (const [name, volume, presentation, costEur] of sec.items) {
      const slug = `nplab-trt-${slugify(name)}`;
      const sku = `SKU-NPLAB-${slugify(name).toUpperCase().slice(0, 24)}`;
      const landedCostAed = Number((costEur * EUR_TO_AED).toFixed(4));
      docs.push({
        id: slug,
        slug,
        sku,
        name,
        canonicalName: name,
        subtitle: `NP LABS Men's TRT · ${sec.dosageForm}`,
        brand: 'nplab',
        supplierId: 'supplier-nplab',
        supplierName: 'NP LABS International Compounding Pharmacy',
        track: 'hormones',
        subTrack: 'mens_trt',
        category: sec.category,
        dosageForm: sec.dosageForm,
        volume,
        presentation,
        keyActives: parseActiveIngredients(name).join(' + '),
        clinicalFocus: `Compounded ${sec.category} (${presentation}) for licensed physician TRT & endocrine protocols.`,
        costCurrency: 'EUR',
        costPriceEur: costEur,
        landedCostAed,
        wholesalePriceAed: Number((landedCostAed * 1.15).toFixed(2)),
        clinicPriceAed: Number((landedCostAed * 1.3225).toFixed(2)),
        retailPriceAed: Number((landedCostAed * 1.55).toFixed(2)),
        variants: [
          {
            id: `${slug}-std`,
            sku,
            packSize: volume,
            presentation,
            costCurrency: 'EUR',
            costPriceEur: costEur,
          },
        ],
        requiresPrescription: true,
        isProfessional: true,
        status: 'published',
        isActive: true,
        stockStatus: 'Compounded to Order (EU)',
      });
    }
  }

  for (const sec of BHRT_SECTIONS) {
    for (const [formulaName, prices] of sec.rows) {
      const slug = `nplab-bhrt-${slugify(sec.dosageForm)}-${slugify(formulaName)}`.slice(0, 90);
      const variants = [];
      sec.packs.forEach((packLabel, idx) => {
        const pEur = parsePrice(prices[idx]);
        if (pEur != null) {
          variants.push({
            id: `${slug}-${slugify(packLabel)}`,
            sku: `SKU-NPLAB-${slugify(formulaName).toUpperCase().slice(0, 16)}-${slugify(packLabel).toUpperCase()}`,
            packSize: packLabel,
            presentation: sec.dosageForm,
            costCurrency: 'EUR',
            costPriceEur: pEur,
          });
        }
      });
      if (variants.length === 0) continue;

      const baseEur = variants[0].costPriceEur;
      const landedCostAed = Number((baseEur * EUR_TO_AED).toFixed(4));
      const fullName = `${formulaName} (${sec.dosageForm})`;
      docs.push({
        id: slug,
        slug,
        sku: variants[0].sku,
        name: fullName,
        canonicalName: fullName,
        subtitle: `NP LABS BHRT · ${variants.map((v) => `${v.packSize}: €${v.costPriceEur.toFixed(2)}`).join(' · ')}`,
        brand: 'nplab',
        supplierId: 'supplier-nplab',
        supplierName: 'NP LABS International Compounding Pharmacy',
        track: 'hormones',
        subTrack: 'bhrt',
        category: sec.category,
        dosageForm: sec.dosageForm,
        volume: variants.map((v) => v.packSize).join(' / '),
        presentation: sec.dosageForm,
        keyActives: parseActiveIngredients(formulaName).join(' + '),
        clinicalFocus: `Bioidentical Hormone Replacement Therapy (${sec.dosageForm}) compounded per physician prescription.`,
        costCurrency: 'EUR',
        costPriceEur: baseEur,
        landedCostAed,
        wholesalePriceAed: Number((landedCostAed * 1.15).toFixed(2)),
        clinicPriceAed: Number((landedCostAed * 1.3225).toFixed(2)),
        retailPriceAed: Number((landedCostAed * 1.55).toFixed(2)),
        variants,
        requiresPrescription: true,
        isProfessional: true,
        status: 'published',
        isActive: true,
        stockStatus: 'Compounded to Order (EU)',
      });
    }
  }

  return docs;
}

async function syncAlgolia(docs) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  if (!adminKey) {
    console.warn('⚠️ ALGOLIA_ADMIN_KEY missing; skipping Algolia sync.');
    return;
  }

  const records = docs.map((d) => ({
    objectID: d.id,
    id: d.id,
    slug: d.slug,
    sku: d.sku,
    name: d.name,
    canonicalName: d.canonicalName,
    subtitle: d.subtitle,
    brand: d.brand,
    supplierName: d.supplierName,
    category: d.category,
    track: d.track,
    subTrack: d.subTrack,
    dosageForm: d.dosageForm,
    keyActives: d.keyActives,
    status: 'published',
    isActive: true,
  }));

  const chunkSize = 200;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const res = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/products/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': adminKey,
      },
      body: JSON.stringify({
        requests: chunk.map((body) => ({ action: 'updateObject', body })),
      }),
    });
    if (!res.ok) {
      console.warn(`⚠️ Algolia batch ${i} failed:`, res.status, await res.text());
    }
  }
  console.log(`🔍 Synced ${records.length} NP LABS hormone records to Algolia products index.`);
}

async function main() {
  const docs = buildAllDocs();
  console.log(`📦 Prepared ${docs.length} NP LABS hormone formulations.`);

  // Seed supplier record
  await db.collection('suppliers').doc('supplier-nplab').set(
    {
      id: 'supplier-nplab',
      name: 'NP LABS International Compounding Pharmacy',
      shortName: 'NP LABS',
      track: 'hormones',
      currency: 'EUR',
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Batch write products to Firestore (max 400 per batch)
  const batchSize = 400;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const slice = docs.slice(i, i + batchSize);
    for (const doc of slice) {
      batch.set(
        db.collection('products').doc(doc.id),
        { ...doc, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }
    await batch.commit();
    console.log(`✅ Committed Firestore batch ${i + 1}-${i + slice.length}`);
  }

  await syncAlgolia(docs);
  console.log('🎉 NP LABS Hormones seeding & Algolia indexing complete.');
}

main().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
