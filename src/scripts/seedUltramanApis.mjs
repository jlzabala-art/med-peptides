/**
 * src/scripts/seedUltramanApis.mjs
 * 
 * Imports the 118 Pharmapolis API materials for Ultraman / UltraPerson supplements
 * into the Firestore collection 'ultraman_apis' (and synchronizes with 'supplement_apis').
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const USD_TO_EUR_RATE = 0.92; // Configurable standard currency conversion

export const RAW_CSV_DATA = [
  { id: 1, name: "Activated Charcoal", priority: "—", spec: "Medicinal charcoal powder (Carbo ligni pulv.)", price: 56.925, currency: "EUR", packSizeKg: 1, eurKg: 56.925, eurG: 0.056925 },
  { id: 2, name: "Algal Omega-3 (EPA/DHA)", priority: "A", spec: "Algal oil ~40% DHA (or 10% powder)", price: 71.5, currency: "EUR", packSizeKg: 1, eurKg: 71.5, eurG: 0.0715 },
  { id: 3, name: "Allyl ABG (Aged Black Garlic)", priority: "B", spec: "ABG+ / ABG10+ (Pharmactive)", price: 165, currency: "EUR", packSizeKg: 1, eurKg: 165, eurG: 0.165 },
  { id: 4, name: "Alpha-Lipoic Acid (ALA)", priority: "A", spec: "R/S-ALA 99%", price: 55, currency: "EUR", packSizeKg: 1, eurKg: 55, eurG: 0.055 },
  { id: 5, name: "Artichoke Extract (Cynara scolymus)", priority: "A", spec: "Dry extract 2.5–5% cynarin", price: 38.5, currency: "EUR", packSizeKg: 1, eurKg: 38.5, eurG: 0.0385 },
  { id: 6, name: "Astaxanthin", priority: "A", spec: "Natural Haematococcus 5% powder/beadlet", price: 1650, currency: "EUR", packSizeKg: 1, eurKg: 1650, eurG: 1.65 },
  { id: 7, name: "BCAA Complex", priority: "A", spec: "BCAA 2:1:1 instant", price: 19.8, currency: "EUR", packSizeKg: 1, eurKg: 19.8, eurG: 0.0198 },
  { id: 8, name: "Beta-Carotene", priority: "A", spec: "Beta-carotene 10% CWS", price: 77, currency: "EUR", packSizeKg: 1, eurKg: 77, eurG: 0.077 },
  { id: 9, name: "Betaine (Trimethylglycine / TMG)", priority: "A", spec: "Betaine anhydrous 98%", price: 8.8, currency: "EUR", packSizeKg: 1, eurKg: 8.8, eurG: 0.0088 },
  { id: 10, name: "Bifidobacterium adolescentis", priority: "—", spec: "100 bn CFU/g", price: 440, currency: "EUR", packSizeKg: 1, eurKg: 440, eurG: 0.44 },
  { id: 11, name: "Bifidobacterium infantis", priority: "—", spec: "100 bn CFU/g", price: 440, currency: "EUR", packSizeKg: 1, eurKg: 440, eurG: 0.44 },
  { id: 12, name: "Bifidobacterium longum", priority: "—", spec: "100 bn CFU/g", price: 275, currency: "EUR", packSizeKg: 1, eurKg: 275, eurG: 0.275 },
  { id: 13, name: "Bilberry Extract (Vaccinium myrtillus)", priority: "B", spec: "25% anthocyanidins (36% anthocyanosides)", price: 308, currency: "EUR", packSizeKg: 1, eurKg: 308, eurG: 0.308 },
  { id: 14, name: "Bioactive Hydrolyzed Collagen Peptides (Types I & III)", priority: "A", spec: "Bovine/fish collagen peptides", price: 9.9, currency: "EUR", packSizeKg: 1, eurKg: 9.9, eurG: 0.0099 },
  { id: 15, name: "Biointestil", priority: "C", spec: "Fagron Brazil specialty", price: 385, currency: "EUR", packSizeKg: 1, eurKg: 385, eurG: 0.385 },
  { id: 16, name: "Biotin", priority: "A", spec: "D-Biotin 98% USP, food grade", price: 152.57, currency: "USD", packSizeKg: 1, eurKg: 152.57 * USD_TO_EUR_RATE, eurG: (152.57 * USD_TO_EUR_RATE) / 1000 },
  { id: 17, name: "Bitter Melon Extract (Momordica charantia)", priority: "B", spec: "10:1 or 10% charantin", price: 22, currency: "EUR", packSizeKg: 1, eurKg: 22, eurG: 0.022 },
  { id: 18, name: "Black Radish Extract (Raphanus sativus)", priority: "C", spec: "Dry extract 10:1", price: 27.5, currency: "EUR", packSizeKg: 1, eurKg: 27.5, eurG: 0.0275 },
  { id: 19, name: "Brocophanus", priority: "C", spec: "Fagron Brazil specialty (broccoli/radish)", price: 440, currency: "EUR", packSizeKg: 1, eurKg: 440, eurG: 0.44 },
  { id: 20, name: "Bromelain", priority: "—", spec: "2400 GDU/g", price: 99, currency: "EUR", packSizeKg: 1, eurKg: 99, eurG: 0.099 },
  { id: 21, name: "CafeiSome (Caffeine Complex)", priority: "—", spec: "Encapsulated caffeine complex", price: 330, currency: "EUR", packSizeKg: 1, eurKg: 330, eurG: 0.33 },
  { id: 22, name: "Caffeine", priority: "—", spec: "Caffeine anhydrous Ph.Eur.", price: 126.5, currency: "EUR", packSizeKg: 1, eurKg: 126.5, eurG: 0.1265 },
  { id: 23, name: "Chlorella (Chlorella pyrenoidosa)", priority: "B", spec: "Broken cell wall powder", price: 16.5, currency: "EUR", packSizeKg: 1, eurKg: 16.5, eurG: 0.0165 },
  { id: 24, name: "Chrysin", priority: "C", spec: "Chrysin 98%", price: 132, currency: "EUR", packSizeKg: 1, eurKg: 132, eurG: 0.132 },
  { id: 25, name: "Citrimax (Garcinia cambogia)", priority: "C", spec: "HCA 60% Ca/K salt", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 26, name: "CitrusiM", priority: "C", spec: "Citrus flavonoid extract (branded)", price: 165, currency: "EUR", packSizeKg: 1, eurKg: 165, eurG: 0.165 },
  { id: 27, name: "Coenzyme Q10 (Ubiquinol)", priority: "A", spec: "Ubiquinol (Kaneka QH)", price: 1210, currency: "EUR", packSizeKg: 1, eurKg: 1210, eurG: 1.21 },
  { id: 28, name: "Coenzyme Q10 (Ubiquinone)", priority: "—", spec: "Ubiquinone 98% (fermentation)", price: 286, currency: "EUR", packSizeKg: 1, eurKg: 286, eurG: 0.286 },
  { id: 29, name: "Copper (Bisglycinate)", priority: "A", spec: "Copper bisglycinate powder", price: 7.7, currency: "EUR", packSizeKg: 0.1, eurKg: 77, eurG: 0.077 },
  { id: 30, name: "Copper (Gluconate or Chelate)", priority: "—", spec: "Copper gluconate", price: 27.5, currency: "EUR", packSizeKg: 1, eurKg: 27.5, eurG: 0.0275 },
  { id: 31, name: "Curcumin (Cureit)", priority: "A", spec: "Cureit® bioavailable curcumin", price: 275, currency: "EUR", packSizeKg: 1, eurKg: 275, eurG: 0.275 },
  { id: 32, name: "Cycloastragenol", priority: "—", spec: "Cycloastragenol 98%", price: 2750, currency: "EUR", packSizeKg: 1, eurKg: 2750, eurG: 2.75 },
  { id: 33, name: "D-Panthenol (Provitamin B5)", priority: "—", spec: "Dexpanthenol Ph.Eur.", price: 94.6, currency: "EUR", packSizeKg: 1, eurKg: 94.6, eurG: 0.0946 },
  { id: 34, name: "Eye Health Complex", priority: "—", spec: "Lutein/zeaxanthin blend", price: 330, currency: "EUR", packSizeKg: 1, eurKg: 330, eurG: 0.33 },
  { id: 35, name: "Ferrous Sulfate (Iron)", priority: "—", spec: "Ferrous sulfate dried Ph.Eur.", price: 16.5, currency: "EUR", packSizeKg: 1, eurKg: 16.5, eurG: 0.0165 },
  { id: 36, name: "FitNox", priority: "—", spec: "FitNox® (nitric oxide blend)", price: 165, currency: "EUR", packSizeKg: 1, eurKg: 165, eurG: 0.165 },
  { id: 37, name: "Ginger Extract", priority: "A", spec: "5% gingerols", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 38, name: "Ginkgo Biloba", priority: "A", spec: "24% flavone glycosides / 6% terpene lactones", price: 16.5, currency: "EUR", packSizeKg: 0.2, eurKg: 82.5, eurG: 0.0825 },
  { id: 39, name: "Ginseng", priority: "A", spec: "American ginseng extract", price: 132, currency: "USD", packSizeKg: 1, eurKg: 132 * USD_TO_EUR_RATE, eurG: (132 * USD_TO_EUR_RATE) / 1000 },
  { id: 40, name: "Glucosamine Sulfate", priority: "A", spec: "Glucosamine sulfate 2KCl", price: 13.2, currency: "EUR", packSizeKg: 1, eurKg: 13.2, eurG: 0.0132 },
  { id: 41, name: "Glycine", priority: "A", spec: "Glycine EP", price: 6.6, currency: "EUR", packSizeKg: 1, eurKg: 6.6, eurG: 0.0066 },
  { id: 42, name: "Gotu Kola Extract (Centella asiatica)", priority: "B", spec: "10% asiaticosides", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 43, name: "Grapefruit Extract (Citrus paradisi)", priority: "—", spec: "5% flavones (naringin)", price: 33, currency: "EUR", packSizeKg: 1, eurKg: 33, eurG: 0.033 },
  { id: 44, name: "Green Superfood Blend", priority: "B", spec: "Greens blend", price: 27.5, currency: "EUR", packSizeKg: 1, eurKg: 27.5, eurG: 0.0275 },
  { id: 45, name: "Green Tea Extract (EGCG)", priority: "A", spec: "98% polyphenols, 45% EGCG", price: 16.5, currency: "EUR", packSizeKg: 0.2, eurKg: 82.5, eurG: 0.0825 },
  { id: 46, name: "GreenSelect (Green Tea Phytosome)", priority: "—", spec: "GreenSelect® Phytosome (Indena)", price: 330, currency: "EUR", packSizeKg: 1, eurKg: 330, eurG: 0.33 },
  { id: 47, name: "Gum Acacia (Gum Arabic)", priority: "—", spec: "Gum acacia spray-dried", price: 8.8, currency: "EUR", packSizeKg: 1, eurKg: 8.8, eurG: 0.0088 },
  { id: 48, name: "Gutcare", priority: "B", spec: "Branded gut ingredient", price: 550, currency: "EUR", packSizeKg: 1, eurKg: 550, eurG: 0.55 },
  { id: 49, name: "Horsetail Extract (Equisetum arvense)", priority: "B", spec: "7% silica", price: 24.2, currency: "EUR", packSizeKg: 1, eurKg: 24.2, eurG: 0.0242 },
  { id: 50, name: "Hydrolyzed Keratin Peptides (Soluble Keratin)", priority: "A", spec: "Soluble keratin peptides", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 51, name: "Imuno TF (Transfer Factor)", priority: "—", spec: "Imuno TF® (Fagron)", price: 16500, currency: "EUR", packSizeKg: 1, eurKg: 16500, eurG: 16.5 },
  { id: 52, name: "Indole-3-Carbinol (I3C)", priority: "B", spec: "I3C 99%", price: 132, currency: "EUR", packSizeKg: 1, eurKg: 132, eurG: 0.132 },
  { id: 53, name: "Inulin (Prebiotic Fiber)", priority: "A", spec: "Chicory inulin", price: 6.6, currency: "EUR", packSizeKg: 1, eurKg: 6.6, eurG: 0.0066 },
  { id: 54, name: "L-Arginine", priority: "A", spec: "L-Arginine base EP", price: 19.8, currency: "EUR", packSizeKg: 1, eurKg: 19.8, eurG: 0.0198 },
  { id: 55, name: "L-Carnitine L-Tartrate", priority: "A", spec: "LCLT", price: 24.2, currency: "EUR", packSizeKg: 1, eurKg: 24.2, eurG: 0.0242 },
  { id: 56, name: "L-Cysteine", priority: "—", spec: "L-Cysteine HCl", price: 27.5, currency: "EUR", packSizeKg: 1, eurKg: 27.5, eurG: 0.0275 },
  { id: 57, name: "L-Cystine", priority: "—", spec: "L-Cystine", price: 33, currency: "EUR", packSizeKg: 1, eurKg: 33, eurG: 0.033 },
  { id: 58, name: "L-Glutamine", priority: "A", spec: "L-Glutamine", price: 15.4, currency: "EUR", packSizeKg: 1, eurKg: 15.4, eurG: 0.0154 },
  { id: 59, name: "L-Isoleucine", priority: "B", spec: "L-Isoleucine", price: 38.5, currency: "EUR", packSizeKg: 1, eurKg: 38.5, eurG: 0.0385 },
  { id: 60, name: "L-Leucine", priority: "A", spec: "L-Leucine EP", price: 27.5, currency: "EUR", packSizeKg: 1, eurKg: 27.5, eurG: 0.0275 },
  { id: 61, name: "L-Lysine", priority: "A", spec: "L-Lysine HCl EP", price: 6.6, currency: "EUR", packSizeKg: 1, eurKg: 6.6, eurG: 0.0066 },
  { id: 62, name: "L-Methionine", priority: "B", spec: "L-Methionine", price: 16.5, currency: "EUR", packSizeKg: 1, eurKg: 16.5, eurG: 0.0165 },
  { id: 63, name: "L-Valine", priority: "B", spec: "L-Valine EP", price: 33, currency: "EUR", packSizeKg: 1, eurKg: 33, eurG: 0.033 },
  { id: 64, name: "Lactobacillus acidophilus", priority: "—", spec: "100 bn CFU/g", price: 220, currency: "EUR", packSizeKg: 1, eurKg: 220, eurG: 0.22 },
  { id: 65, name: "Lactobacillus lactis", priority: "—", spec: "100 bn CFU/g", price: 220, currency: "EUR", packSizeKg: 1, eurKg: 220, eurG: 0.22 },
  { id: 66, name: "Lactobacillus plantarum", priority: "—", spec: "100 bn CFU/g", price: 198, currency: "EUR", packSizeKg: 1, eurKg: 198, eurG: 0.198 },
  { id: 67, name: "Lactobacillus salivarius", priority: "—", spec: "100 bn CFU/g", price: 275, currency: "EUR", packSizeKg: 1, eurKg: 275, eurG: 0.275 },
  { id: 68, name: "Lutein", priority: "A", spec: "Lutein 20% (marigold)", price: 275, currency: "EUR", packSizeKg: 1, eurKg: 275, eurG: 0.275 },
  { id: 69, name: "Lycopene", priority: "A", spec: "Lycopene 10%", price: 330, currency: "EUR", packSizeKg: 1, eurKg: 330, eurG: 0.33 },
  { id: 70, name: "Magnesium (Glycinate)", priority: "A", spec: "Magnesium bisglycinate >20%", price: 12.1, currency: "EUR", packSizeKg: 0.2, eurKg: 60.5, eurG: 0.0605 },
  { id: 71, name: "Manganese", priority: "A", spec: "Manganese gluconate/bisglycinate", price: 22, currency: "EUR", packSizeKg: 1, eurKg: 22, eurG: 0.022 },
  { id: 72, name: "Melatonin", priority: "—", spec: "Melatonin 99%", price: 198, currency: "EUR", packSizeKg: 1, eurKg: 198, eurG: 0.198 },
  { id: 73, name: "Miodesin", priority: "C", spec: "Miodesin™ (Fagron)", price: 660, currency: "EUR", packSizeKg: 1, eurKg: 660, eurG: 0.66 },
  { id: 74, name: "Mitocondrin", priority: "C", spec: "Mitocondrin® (ashitaba + red ginseng)", price: 990, currency: "EUR", packSizeKg: 1, eurKg: 990, eurG: 0.99 },
  { id: 75, name: "Multi-Strain Probiotic Blend", priority: "—", spec: "50 bn CFU/g blend", price: 165, currency: "EUR", packSizeKg: 1, eurKg: 165, eurG: 0.165 },
  { id: 76, name: "Myo-Inositol", priority: "A", spec: "Myo-inositol", price: 12.1, currency: "EUR", packSizeKg: 0.2, eurKg: 60.5, eurG: 0.0605 },
  { id: 77, name: "N-Acetylcysteine (NAC)", priority: "A", spec: "NAC", price: 66, currency: "EUR", packSizeKg: 1, eurKg: 66, eurG: 0.066 },
  { id: 78, name: "Niacin (Nicotinic Acid)", priority: "A", spec: "Nicotinic acid", price: 13.2, currency: "EUR", packSizeKg: 1, eurKg: 13.2, eurG: 0.0132 },
  { id: 79, name: "Nicotinamide (Niacinamide)", priority: "A", spec: "Nicotinamide Pharma grade EP", price: 16.148, currency: "USD", packSizeKg: 1, eurKg: 16.148 * USD_TO_EUR_RATE, eurG: (16.148 * USD_TO_EUR_RATE) / 1000 },
  { id: 80, name: "Omega-3 (EPA/DHA)", priority: "A", spec: "Fish oil concentrate (TG 50–70%)", price: 44, currency: "EUR", packSizeKg: 1, eurKg: 44, eurG: 0.044 },
  { id: 81, name: "Panax Ginseng Extract", priority: "—", spec: "Panax ginseng 10–20% ginsenosides", price: 99, currency: "EUR", packSizeKg: 1, eurKg: 99, eurG: 0.099 },
  { id: 82, name: "Papain", priority: "—", spec: "Papain 6000 USP U/mg", price: 66, currency: "EUR", packSizeKg: 1, eurKg: 66, eurG: 0.066 },
  { id: 83, name: "Piperine", priority: "A", spec: "Piperine 95%", price: 198, currency: "EUR", packSizeKg: 1, eurKg: 198, eurG: 0.198 },
  { id: 84, name: "Pomage", priority: "C", spec: "Pomage® (Fagron)", price: 550, currency: "EUR", packSizeKg: 1, eurKg: 550, eurG: 0.55 },
  { id: 85, name: "Psyllium Husk", priority: "—", spec: "Psyllium husk 98%", price: 8.8, currency: "EUR", packSizeKg: 1, eurKg: 8.8, eurG: 0.0088 },
  { id: 86, name: "Pycnogenol (Pinus pinaster)", priority: "A", spec: "Pycnogenol® (Horphag)", price: 770, currency: "EUR", packSizeKg: 1, eurKg: 770, eurG: 0.77 },
  { id: 87, name: "Reduced Glutathione", priority: "A", spec: "Reduced L-glutathione (fermentation)", price: 517, currency: "USD", packSizeKg: 1, eurKg: 517 * USD_TO_EUR_RATE, eurG: (517 * USD_TO_EUR_RATE) / 1000 },
  { id: 88, name: "Resveratrol", priority: "A", spec: "Trans-resveratrol 98%", price: 132, currency: "EUR", packSizeKg: 1, eurKg: 132, eurG: 0.132 },
  { id: 89, name: "SAM-e (S-Adenosyl-L-Methionine)", priority: "B", spec: "SAMe tosylate disulfate USP", price: 286, currency: "USD", packSizeKg: 1, eurKg: 286 * USD_TO_EUR_RATE, eurG: (286 * USD_TO_EUR_RATE) / 1000 },
  { id: 90, name: "Saw Palmetto", priority: "A", spec: "Extract 45% fatty acids (powder)", price: 77, currency: "EUR", packSizeKg: 1, eurKg: 77, eurG: 0.077 },
  { id: 91, name: "Selenium (Selenomethionine)", priority: "A", spec: "L-Selenomethionine 0.2% (2,000 µg/g)", price: 20.9, currency: "EUR", packSizeKg: 0.2, eurKg: 104.5, eurG: 0.1045 },
  { id: 92, name: "Selenium Yeast", priority: "—", spec: "Selenium yeast 2,000 ppm", price: 44, currency: "EUR", packSizeKg: 1, eurKg: 44, eurG: 0.044 },
  { id: 93, name: "Silibin (Milk Thistle)", priority: "A", spec: "Silibinin / silybin 80–98%", price: 385, currency: "EUR", packSizeKg: 1, eurKg: 385, eurG: 0.385 },
  { id: 94, name: "SiliciuMax", priority: "A", spec: "SiliciuMax® (Fagron, 1.55% Si)", price: 220, currency: "EUR", packSizeKg: 1, eurKg: 220, eurG: 0.22 },
  { id: 95, name: "Silymarin", priority: "—", spec: "Silymarin 80% UV", price: 60.5, currency: "EUR", packSizeKg: 1, eurKg: 60.5, eurG: 0.0605 },
  { id: 96, name: "Spirulina", priority: "A", spec: "Spirulina powder", price: 13.2, currency: "EUR", packSizeKg: 1, eurKg: 13.2, eurG: 0.0132 },
  { id: 97, name: "Taurine", priority: "A", spec: "Taurine", price: 8.8, currency: "EUR", packSizeKg: 1, eurKg: 8.8, eurG: 0.0088 },
  { id: 98, name: "Turmeric Extract", priority: "—", spec: "95% curcuminoids", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 99, name: "Ubiqsome (Liposomal CoQ10)", priority: "—", spec: "Liposomal CoQ10 50% (proxy)", price: 264, currency: "USD", packSizeKg: 1, eurKg: 264 * USD_TO_EUR_RATE, eurG: (264 * USD_TO_EUR_RATE) / 1000 },
  { id: 100, name: "Valerian Root Extract (Valeriana officinalis)", priority: "A", spec: "0.8% valerenic acids", price: 38.5, currency: "EUR", packSizeKg: 1, eurKg: 38.5, eurG: 0.0385 },
  { id: 101, name: "Vitamin A (Retinol)", priority: "A", spec: "Retinyl acetate powder 500 CWS", price: 24.2, currency: "EUR", packSizeKg: 0.2, eurKg: 121, eurG: 0.121 },
  { id: 102, name: "Vitamin B Complex Methylated", priority: "A", spec: "Methylated B-complex premix", price: 220, currency: "EUR", packSizeKg: 1, eurKg: 220, eurG: 0.22 },
  { id: 103, name: "Vitamin B1 (Thiamine HCl)", priority: "A", spec: "Thiamine HCl", price: 49.5, currency: "EUR", packSizeKg: 1, eurKg: 49.5, eurG: 0.0495 },
  { id: 104, name: "Vitamin B12 (Cyanocobalamin)", priority: "—", spec: "Cyanocobalamin 98% Pharma grade EP", price: 1436.6, currency: "USD", packSizeKg: 1, eurKg: 1436.6 * USD_TO_EUR_RATE, eurG: (1436.6 * USD_TO_EUR_RATE) / 1000 },
  { id: 105, name: "Vitamin B12 (Methylcobalamin)", priority: "A", spec: "Mecobalamin 98%", price: 1980, currency: "EUR", packSizeKg: 1, eurKg: 1980, eurG: 1.98 },
  { id: 106, name: "Vitamin B2 (Riboflavin)", priority: "A", spec: "Riboflavin 98%", price: 77, currency: "EUR", packSizeKg: 1, eurKg: 77, eurG: 0.077 },
  { id: 107, name: "Vitamin B5 (Calcium Pantothenate)", priority: "A", spec: "Calcium pantothenate Ph.Eur.", price: 228.8, currency: "EUR", packSizeKg: 1, eurKg: 228.8, eurG: 0.2288 },
  { id: 108, name: "Vitamin B6 (P-5-P)", priority: "A", spec: "Pyridoxal-5-phosphate", price: 44, currency: "EUR", packSizeKg: 0.1, eurKg: 440, eurG: 0.44 },
  { id: 109, name: "Vitamin B6 (Pyridoxine HCl)", priority: "—", spec: "Pyridoxine HCl EP pharma grade", price: 20.108, currency: "USD", packSizeKg: 1, eurKg: 20.108 * USD_TO_EUR_RATE, eurG: (20.108 * USD_TO_EUR_RATE) / 1000 },
  { id: 110, name: "Vitamin B9 (Folic Acid)", priority: "—", spec: "Folic acid 97%", price: 132, currency: "EUR", packSizeKg: 1, eurKg: 132, eurG: 0.132 },
  { id: 111, name: "Vitamin B9 (Methylfolate)", priority: "A", spec: "L-5-MTHF calcium (Quatrefolic/Magnafolate type)", price: 3080, currency: "EUR", packSizeKg: 1, eurKg: 3080, eurG: 3.08 },
  { id: 112, name: "Vitamin C (Ascorbic Acid)", priority: "A", spec: "Ascorbic acid Ph.Eur.", price: 61.325, currency: "EUR", packSizeKg: 1, eurKg: 61.325, eurG: 0.061325 },
  { id: 113, name: "Vitamin D3 (Cholecalciferol)", priority: "A", spec: "Vitamin D3 100,000 IU/g powder", price: 55, currency: "EUR", packSizeKg: 1, eurKg: 55, eurG: 0.055 },
  { id: 114, name: "Vitamin E (Mixed Tocopherols)", priority: "A", spec: "Mixed tocopherols powder >50%", price: 30.8, currency: "EUR", packSizeKg: 0.2, eurKg: 154, eurG: 0.154 },
  { id: 115, name: "Vitamin K2 (MK-7)", priority: "A", spec: "MK-7 powder 1.3%", price: 44, currency: "EUR", packSizeKg: 0.1, eurKg: 440, eurG: 0.44 },
  { id: 116, name: "Zeaxanthin", priority: "B", spec: "Zeaxanthin 5%", price: 660, currency: "EUR", packSizeKg: 1, eurKg: 660, eurG: 0.66 },
  { id: 117, name: "Zinc (Gluconate)", priority: "A", spec: "Zinc gluconate", price: 13.2, currency: "EUR", packSizeKg: 1, eurKg: 13.2, eurG: 0.0132 },
  { id: 118, name: "Zinc (Sulfate)", priority: "—", spec: "Zinc sulfate monohydrate", price: 6.6, currency: "EUR", packSizeKg: 1, eurKg: 6.6, eurG: 0.0066 }
];

function toSlug(name) {
  return 'pharmapolis-' + name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function run() {
  console.log(`🚀 Starting ingestion of ${RAW_CSV_DATA.length} Pharmapolis APIs into 'ultraman_apis' collection...`);

  const batch = db.batch();
  let count = 0;

  for (const item of RAW_CSV_DATA) {
    const docId = toSlug(item.name);
    const docRef = db.collection('ultraman_apis').doc(docId);

    const docPayload = {
      id: docId,
      rawIndex: item.id,
      name: item.name,
      priority: item.priority === "—" ? null : item.priority,
      spec: item.spec,
      purchasePriceOriginal: item.price,
      currencyOriginal: item.currency,
      packSizeKg: item.packSizeKg,
      priceEurKg: Number(item.eurKg.toFixed(4)),
      priceEurGram: Number(item.eurG.toFixed(6)),
      supplierId: 'supplier-pharmapolis',
      supplierName: 'Pharmapolis Compounding Pharmacy',
      supplierHub: 'pharmapolis',
      category: 'supplement_api',
      brandScope: ['ultraman', 'ultraperson'],
      active: true,
      lastUpdated: new Date().toISOString()
    };

    batch.set(docRef, docPayload, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully committed ${count} API documents to Firestore 'ultraman_apis' collection.`);
}

run().catch(console.error);
