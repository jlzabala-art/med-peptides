import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin
// We will rely on GOOGLE_APPLICATION_CREDENTIALS environment variable or default credentials.
// Let's try to load the local serviceAccountKey.json if it exists.
try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Initialized using local serviceAccountKey.json");
} catch (error) {
  console.warn("Could not load serviceAccountKey.json, relying on default credentials/env vars.");
  admin.initializeApp();
}

const db = admin.firestore();

const rawData = `Ingredient	Relative Cost Score (1-100)	Cost Tier	Compounding Cost Class
Acetylcysteine (N-Acetylcysteine)	15	C	Economic base
Arginine	33	C	Standard
Artichoke dry extract (Cynara scolymus)		Review	Manual review
Astaxanthin	86	A	Premium / cost driver
Bifidobacterium adolescentis	57	B	High value
Bifidobacterium infantis	57	B	High value
Bifidobacterium longum	57	B	High value
Biotin	40	B	High value
Black Raphanus dry extract (Raphanus sativus L. var. niger)		Review	Manual review
Brocophanus®	82	A	Premium / cost driver
CitrusiM®	80	A	Premium / cost driver
Coenzyme Q10	75	A	Premium / cost driver
Colecalciferol (Vit. D3)		Review	Manual review
Cooper (as gluconate or chelate)		Review	Manual review
Cureit®a	88	A	Premium / cost driver
D-Panthenol	25	C	Standard
Ginkgo biloba	46	B	High value
Ginseng	49	B	High value
Ginseng dry extract (Panax ginseng)	49	B	High value
Glucosamine sulfate	35	B	Standard
Glutamine (levoglutamine)	32	C	Standard
Glutathione (Reduced glutathione)	78	A	Premium / cost driver
Horsetail dry extract (Equisetum arvense)	20	C	Standard
L-Carnitine L-tartrate	44	B	High value
Lactobacillus lactis	54	B	High value
Lactobacillus plantarum	54	B	High value
Lactobacillus salivarius	54	B	High value
Magnesium	7	D	Economic base
Manganese	4	D	Economic base
Melatonin	52	B	High value
Methionine	34	C	Standard
Miodesin	84	A	Premium / cost driver
Mitocondrin®	95	A	Premium / cost driver
Niacin (nicotinic acid)	12	D	Economic base
Nicotinamide (niacinamide)	13	D	Economic base
Omega 3	47	B	High value
Oral Coenzyme Q10	75	A	Premium / cost driver
Oral Ginkgo Biloba	46	B	High value
Oral Green Tea (GreenSelect)	48	B	High value
Oral Pomage		Review	Manual review
Oral SiliciuMax TM	90	A	Premium / cost driver
Oral Vitamin C	14	D	Economic base
Oral Zinc sulfate	8	D	Economic base
Piperin		Review	Manual review
Pomage		Review	Manual review
Pycnogenol (Pinus pinaster)	92	A	Premium / cost driver
Pyridoxine HCl (Vit, B6)		Review	Manual review
Resveratrol	72	A	Premium / cost driver
Retinol (Vitamin A)	27	C	Standard
Saw Palmetto	45	B	High value
Selenium (Selenium yeast)	60	A	High value
Selenium yeast	60	A	High value
SiliciuMax TM	90	A	Premium / cost driver
SiliciuMax® powder	90	A	Premium / cost driver
Silimarin	23	C	Standard
Sulfate iron	6	D	Economic base
Taurine		Review	Manual review
Tocopherol (vit, E)		Review	Manual review
Turmeric dry extract	43	B	High value
Ubiquinol	100	A	Premium / cost driver
Valerian dry extract (Valeriana officinalis)	24	C	Standard
Vitamin A		Review	Manual review
Vitamin B1 (Thiamine hydrochloride)	11	D	Economic base
Vitamin B12	29	C	Standard
Vitamin B12 (Cianocobalamin)	29	C	Standard
Vitamin B2 (Riboflavine)	10	D	Economic base
Vitamin B5 (as calcium Pantothenate)		Review	Manual review
Vitamin B6 (Pyridoxine hydrochloride)	9	D	Economic base
Vitamin B9 (Methylfolate)	38	B	High value
Vitamin C (Ascorbic Acid)	14	D	Economic base
Vitamin D3 (Cholecalciferol)	28	C	Standard
Vitamin E	26	C	Standard
Vitamin E (Tocoferol)	26	C	Standard
Vitamin K2	70	A	Premium / cost driver
Zinc gluconate	8	D	Economic base`;

async function uploadIngredients() {
  const lines = rawData.split('\n');
  // skip header
  const dataLines = lines.slice(1).filter(line => line.trim().length > 0);
  
  const batch = db.batch();
  const collectionRef = db.collection('ingredients');
  
  let count = 0;
  for (const line of dataLines) {
    const parts = line.split('\t');
    if (parts.length < 4) continue;
    
    const name = parts[0].trim();
    const scoreStr = parts[1].trim();
    const tier = parts[2].trim();
    const compoundingClass = parts[3].trim();
    
    const needsReview = scoreStr === 'Review' || tier === 'Review' || scoreStr === '';
    const score = (!needsReview && !isNaN(parseInt(scoreStr, 10))) ? parseInt(scoreStr, 10) : null;
    
    const normalizedName = name.toLowerCase();
    
    const docData = {
      name,
      normalizedName,
      relativeCostScore: score,
      costTier: tier,
      compoundingCostClass: compoundingClass,
      provider: "NPLAB",
      needsReview,
      metadata: {
        source: "initial_import_v1",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };
    
    // Auto-generate ID instead of using slug
    const newDocRef = collectionRef.doc();
    batch.set(newDocRef, docData);
    count++;
  }
  
  try {
    await batch.commit();
    console.log(`Successfully uploaded ${count} ingredients using auto-generated IDs.`);
  } catch (err) {
    console.error("Error uploading batch:", err);
  }
}

uploadIngredients().then(() => process.exit(0));
