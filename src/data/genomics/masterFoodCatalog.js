/**
 * masterFoodCatalog.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Master Food Catalog inspired by Fagron NutriGen™ (67-page standard).
 * Structured across 4 Macro-Groups and 17 Sub-Families:
 * 
 * 1. CARBO+  (Vegetables, Fruits, Cereals, Legumes, Tubers)
 * 2. PROTEIN+ (Dairy & A2 Alternatives, Eggs, Meats, Fish, Shellfish)
 * 3. LIPID+   (Oils & Healthy Fats, Sauces & Condiments)
 * 4. EXTRAS   (Sugars, Nuts & Seeds, Snacks, Non-Alcoholic, Alcoholic)
 * 
 * Each food item defines its nutritional traits, micronutrient density (B9, B12,
 * Vit E, Vit D, Choline, Zinc, Magnesium), glycemic impact, satiety index, and
 * genetic rule triggers (MTHFR, MC4R, FTO, IRS1, TCF7L2, CYP4F2, MCM6, VDR, ADORA2A).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FOOD_TRAFFIC_LEVELS = {
  ALLOWED_ADJUSTING: {
    code: 'GREEN_ADJUSTING',
    labelEn: 'Allowed adjusting the amounts and/or frequency (Therapeutic Superfood)',
    labelEs: 'Permitido ajustando cantidades y/o frecuencia (Superalimento Terapéutico)',
    shortLabelEn: 'Allowed · Adjust Amounts',
    shortLabelEs: 'Permitido · Ajustar Cantidad',
    badgeColor: '#166534',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    trafficClass: 'green'
  },
  ALLOWED_CONTROLLED: {
    code: 'YELLOW_CONTROLLED',
    labelEn: 'Allowed without raising recommended quantities (Permitted Neutral)',
    labelEs: 'Permitido sin aumentar las cantidades recomendadas (Neutro Permitido)',
    shortLabelEn: 'Allowed · Normal Portion',
    shortLabelEs: 'Permitido · Porción Normal',
    badgeColor: '#854d0e',
    badgeBg: '#fefce8',
    badgeBorder: '#fef08a',
    trafficClass: 'yellow'
  },
  REDUCE_FREQUENCY: {
    code: 'ORANGE_REDUCE',
    labelEn: 'Reduce the amount and/or frequency (Strict Moderation)',
    labelEs: 'Reducir la cantidad y/o frecuencia (Moderación Estricta)',
    shortLabelEn: 'Reduce · Moderate',
    shortLabelEs: 'Reducir · Moderar',
    badgeColor: '#c2410c',
    badgeBg: '#fff7ed',
    badgeBorder: '#fed7aa',
    trafficClass: 'orange'
  },
  RESTRICT_EXCLUDE: {
    code: 'RED_RESTRICT',
    labelEn: 'Restrict, occasionally or strictly exclude (Genetic Conflict)',
    labelEs: 'Restringir, ocasional o exclusión estricta (Conflicto Genético)',
    shortLabelEn: 'Restrict · Exclude',
    shortLabelEs: 'Restringir · Excluir',
    badgeColor: '#991b1b',
    badgeBg: '#fef2f2',
    badgeBorder: '#fecaca',
    trafficClass: 'red'
  }
};

export const MASTER_FOOD_CATALOG = [
  // ===========================================================================
  // 1. CARBO+ : VEGETABLES (3.1.1)
  // ===========================================================================
  {
    id: 'veg_arugula',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Wild Rocket / Arugula',
    nameEs: 'Rúcula Salvaje',
    nutrients: ['B9 (Folate)', 'Vit C', 'Nitrates (eNOS)', 'Calcium'],
    tags: ['methylation', 'endothelium', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Abundant natural methylfolate and dietary nitrates stimulating endothelial nitric oxide synthase (eNOS).',
    rationaleEs: 'Abundante en metilfolato natural y nitratos que estimulan el óxido nítrico endotelial (eNOS).'
  },
  {
    id: 'veg_spinach',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Organic Baby Spinach',
    nameEs: 'Espinacas Tiernas Ecológicas',
    nutrients: ['B9 (Folate)', 'Vit A', 'Vit C', 'Iron', 'Magnesium'],
    tags: ['methylation', 'magnesium', 'antioxidant'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Prime therapeutic donor of natural [6S]-5-MTHF, directly bypassing MTHFR C677T enzymatic bottlenecks.',
    rationaleEs: 'Donante terapéutico primordial de [6S]-5-MTHF natural, superando el bloqueo de MTHFR C677T.'
  },
  {
    id: 'veg_asparagus',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Fresh Green Asparagus',
    nameEs: 'Espárragos Verdes Frescos',
    nutrients: ['B9 (Folate)', 'Inulin Fiber', 'Glutathione', 'Vit K'],
    tags: ['methylation', 'prebiotic', 'glutathione'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High prebiotic inulin fiber nourishes bifidobacteria, while bioactive folates support hepatic transsulfuration.',
    rationaleEs: 'La inulina prebiótica nutre las bifidobacterias y sus folatos bioactivos respaldan la transulfuración hepática.'
  },
  {
    id: 'veg_artichoke',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Globe Artichokes',
    nameEs: 'Alcachofas Frescas',
    nutrients: ['Inulin Fiber', 'Cynarin', 'Magnesium', 'B9'],
    tags: ['biliary_flow', 'liver_detox', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Cynarin promotes biliary acid secretion, critical for digesting lipid-rich D3/K2 co-factors without sluggishness.',
    rationaleEs: 'La cinarina estimula el flujo biliar, clave para la asimilación micelar de lípidos y D3/K2.'
  },
  {
    id: 'veg_broccoli',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Broccoli & Cauliflower',
    nameEs: 'Brócoli & Coliflor',
    nutrients: ['Sulforaphane', 'Glucosinolates', 'Vit C', 'B9'],
    tags: ['phase2_detox', 'antioxidant', 'estrogen_balance'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Induces Phase II liver detoxification enzymes (NRF2 pathway) and promotes healthy estradiol metabolite clearance.',
    rationaleEs: 'Activa enzimas de detoxificación hepática de fase II (vía NRF2) y facilita el aclaramiento de metabolitos de estrógeno.'
  },
  {
    id: 'veg_beetroot',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Raw Fresh Beetroot',
    nameEs: 'Remolacha Cruda Fresca',
    nutrients: ['Betaine (TMG)', 'Nitrates', 'Potassium', 'B9'],
    tags: ['betaine_tmg', 'homocysteine', 'vascular'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Provides dietary betaine (trimethylglycine) to fuel alternative BHMT homocysteine remethylation pathway.',
    rationaleEs: 'Aporta betaína dietética (trimetilglicina) para remetilar homocisteína vía BHMT alternativa.'
  },
  {
    id: 'veg_cucumber',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'English / Persian Cucumbers',
    nameEs: 'Pepino Holandés / Persa',
    nutrients: ['Water 96%', 'Silica', 'Potassium', 'Vit K'],
    tags: ['satiety_volume', 'hydration', 'low_glycemic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Zero glycemic impact with cellular hydration, perfect crunch snack to counteract MC4R hunger impulses.',
    rationaleEs: 'Impacto glucémico nulo con hidratación celular; snack crujiente ideal para calmar impulsos de MC4R.'
  },
  {
    id: 'veg_celery_fennel',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Celery & Florence Fennel',
    nameEs: 'Apio & Hinojo Fresco',
    nutrients: ['Apigenin', 'Anethole', 'Electrolytes', 'B9'],
    tags: ['gaba_calm', 'carminative', 'anti_bloat'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Apigenin gently binds benzodiazepine GABA-A receptors, while anethole relaxes smooth intestinal muscle.',
    rationaleEs: 'La apigenina modula los receptores GABA-A induciendo calma y el anetol relaja la musculatura intestinal.'
  },
  {
    id: 'veg_kale',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Curly Tuscan Kale',
    nameEs: 'Col Rizada / Kale Toscano',
    nutrients: ['Vit A', 'Vit C', 'Vit K1', 'Lutein', 'B9'],
    tags: ['cellular_shield', 'antioxidant', 'folate'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Dense antioxidant matrix protecting cell membranes from lipid peroxidation.',
    rationaleEs: 'Densa matriz antioxidante que protege membranas celulares contra peroxidación lipídica.'
  },
  {
    id: 'veg_zucchini_leek',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Zucchini & Leeks',
    nameEs: 'Calabacín & Puerros',
    nutrients: ['Soluble Fiber', 'Potassium', 'Allicin', 'B9'],
    tags: ['digestive_ease', 'soothing_soup', 'low_starch'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Gentle on sensitive digestive tracts, perfect base for evening restorative vegetable broths.',
    rationaleEs: 'Muy digestivo para mucosas sensibles; base idónea para cremas y caldos depurativos nocturnos.'
  },

  // ===========================================================================
  // 2. CARBO+ : FRUITS & DERIVATIVES (3.1.2)
  // ===========================================================================
  {
    id: 'fruit_wild_blueberries',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Wild Blueberries & Blackberries',
    nameEs: 'Arándanos Salvajes & Moras',
    nutrients: ['Anthocyanins', 'Vit C', 'Vit E', 'Low Fructose'],
    tags: ['insulin_sensitizer', 'cognitive_sharpness', 'low_sugar'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High anthocyanin load blunts postprandial glycemic excursions and crosses blood-brain barrier.',
    rationaleEs: 'Sus antocianinas reducen la absorción glucémica y protegen la microvasculatura cerebral.'
  },
  {
    id: 'fruit_lemon_lime',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Fresh Lemons & Limes',
    nameEs: 'Limones & Limas Frescas',
    nutrients: ['Citric Acid', 'Vit C', 'Bioflavonoids'],
    tags: ['stomach_acid', 'antioxidant', 'alkaline_ash'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Stimulates cephalic gastric acid secretion, maximizing protein proteolysis and mineral absorption.',
    rationaleEs: 'Estimula la secreción de ácido gástrico, optimizando la digestión proteica y absorción de minerales.'
  },
  {
    id: 'fruit_green_apple',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Crisp Green Apple (Granny Smith)',
    nameEs: 'Manzana Verde Ácida',
    nutrients: ['Malic Acid', 'Pectin Fiber', 'Quercetin'],
    tags: ['gut_microbiome', 'satiety', 'moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Pectin forms protective mucosal gel; consume with peel alongside raw nuts to flatten glycemic curve.',
    rationaleEs: 'La pectina forma un gel protector de mucosa; tomar entera y acompañada de frutos secos.'
  },
  {
    id: 'fruit_pomegranate',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Fresh Pomegranate Seeds',
    nameEs: 'Granada Fresca en Semillas',
    nutrients: ['Punicalagins', 'Urolithin A Precursors', 'Vit C'],
    tags: ['mitochondria_autophagy', 'endothelium', 'polyphenols'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Microbiota converts punicalagins into Urolithin A, stimulating mitophagy and endothelial elasticity.',
    rationaleEs: 'La microbiota convierte sus punicalaginas en Urolitina A, estimulando la mitofagia y salud vascular.'
  },
  {
    id: 'fruit_dates_syrup',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Commercial Dried Dates & Fruit Syrups',
    nameEs: 'Dátiles Secos Comerciales & Frutas en Almíbar',
    nutrients: ['High Fructose', 'High Glucose', 'Low Fiber'],
    tags: ['hyperglycemia', 'liver_fat', 'sugar_spike'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Induces rapid insulin hypersecretion and hepatic de novo lipogenesis; incompatible with IRS1/TCF7L2.',
    rationaleEs: 'Genera hiperinsulinemia rápida y lipogénesis de novo hepática; incompatible con IRS1/TCF7L2.'
  },

  // ===========================================================================
  // 3. CARBO+ : CEREALS & DERIVATIVES (3.1.3)
  // ===========================================================================
  {
    id: 'cereal_quinoa',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Quinoa (Pre-soaked, Boiled)',
    nameEs: 'Quinoa Ecológica (Hervida)',
    nutrients: ['Complete Amino Acids', 'Resistant Starch', 'Magnesium', 'B6'],
    tags: ['gluten_free', 'slow_carb', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Naturally gluten-free complete protein source with low glycemic index when cooled post-cooking.',
    rationaleEs: 'Proteína vegetal completa libre de gluten; índice glucémico bajo especialmente al enfriarse.'
  },
  {
    id: 'cereal_buckwheat',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Buckwheat Groats (Alforfón)',
    nameEs: 'Trigo Sarraceno / Alforfón',
    nutrients: ['Rutin', 'D-Chiro-Inositol', 'Magnesium', 'B9'],
    tags: ['insulin_sensitizer', 'vascular_rutin', 'gluten_free'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'D-Chiro-Inositol mimics second messenger insulin action, improving glucose disposal in peripheral tissues.',
    rationaleEs: 'El D-Chiro-Inositol actúa como segundo mensajero de la insulina, mejorando la captación periférica de glucosa.'
  },
  {
    id: 'cereal_brown_basmati_cooled',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Pre-cooled Brown Basmati Rice (Type 3 Resistant Starch)',
    nameEs: 'Arroz Integral Basmati Pre-enfriado (Almidón Resistente)',
    nutrients: ['Resistant Starch Type 3', 'Butyrate Precursors', 'B vitamins'],
    tags: ['gut_butyrate', 'glycemic_blunt', 'prebiotic'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Retrograded starch escapes small intestine digestion to produce anti-inflammatory butyrate in the colon.',
    rationaleEs: 'Almidón retrogradado que escapa a la absorción rápida y produce butirato antiinflamatorio en el colon.'
  },
  {
    id: 'cereal_white_wheat_flour',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Refined White Wheat Flour & Industrial Bread',
    nameEs: 'Harina Blanca de Trigo Refinada & Bollería Industrial',
    nutrients: ['Acrolein (if fried)', 'Synthetic Folic Acid (UMFA)', 'High Starch'],
    tags: ['mthfr_toxic', 'insulin_spike', 'pro_inflammatory'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Fortified with synthetic folic acid that clogs MTHFR active sites, causing unmetabolized folic acid (UMFA) accumulation.',
    rationaleEs: 'Fortificada con ácido fólico sintético que satura la enzima MTHFR, acumulando ácido fólico no metabolizado.'
  },

  // ===========================================================================
  // 4. CARBO+ : LEGUMES & TUBERS (3.1.4 & 3.1.5)
  // ===========================================================================
  {
    id: 'legume_green_lentils',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'French Green Lentils (Puy / Pardina)',
    nameEs: 'Lentejas Verdes (Puy / Pardina)',
    nutrients: ['B9 (Folate)', 'Soluble Fiber', 'Iron', 'Zinc', 'Protein'],
    tags: ['methylation_fuel', 'satiety_protein', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Powerhouse of plant folates and slow fermentable fiber, providing sustained 4-hour satiety.',
    rationaleEs: 'Fuente extraordinaria de folato vegetal y fibra de digestión lenta; aporta saciedad sostenida de 4 horas.'
  },
  {
    id: 'legume_chickpeas',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Chickpeas (Garbanzo, Boiled)',
    nameEs: 'Garbanzos Cocidos',
    nutrients: ['B6', 'B9', 'Resistant Starch', 'Magnesium'],
    tags: ['serotonin_cofactor', 'slow_starch', 'microbiome'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'B6 and magnesium facilitate aromatic L-amino acid decarboxylase synthesis of serotonin.',
    rationaleEs: 'Su vitamina B6 y magnesio facilitan la síntesis de serotonina para estabilidad anímica.'
  },
  {
    id: 'tuber_sweet_potato',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Steamed Sweet Potato (Batata / Camote)',
    nameEs: 'Batata / Boniato al Vapor',
    nutrients: ['Beta-Carotene (Vit A)', 'Vit C', 'Potassium', 'Soluble Fiber'],
    tags: ['cellular_repair', 'skin_antioxidant', 'moderate_starch'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Rich in provitamin A carotenoids, best consumed chilled or with olive oil to slow gastric emptying.',
    rationaleEs: 'Rico en provitamina A y carotenoides; consumir preferentemente frío o con AOVE para ralentizar vaciado gástrico.'
  },
  {
    id: 'tuber_french_fries_corn_oil',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Deep-Fried Potatoes in Corn / Sunflower Oil',
    nameEs: 'Patatas Fritas Industriales en Aceite de Maíz / Girasol',
    nutrients: ['Acrylamides', 'Oxidized Omega-6', 'High Starch'],
    tags: ['vascular_damage', 'systemic_inflammation', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Generates lipid peroxides and advanced glycation end-products (AGEs), triggering vascular endothelial inflammation.',
    rationaleEs: 'Genera peróxidos lipídicos y productos de glicación avanzada (AGEs), dañando el endotelio vascular.'
  },

  // ===========================================================================
  // 5. PROTEIN+ : EGGS, POULTRY & MEAT (3.2.2 & 3.2.3)
  // ===========================================================================
  {
    id: 'protein_pasture_eggs',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Eggs',
    nameEn: 'Pasture-Raised Organic Whole Eggs',
    nameEs: 'Huevos Ecológicos de Gallinas de Pasto',
    nutrients: ['Choline (Phosphatidylcholine)', 'Lutein', 'Vit B12', 'Vit D3', 'Selenium'],
    tags: ['liver_methylation', 'satiety_gold_standard', 'pyy_surge'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Choline supplies methyl groups for hepatic betaine-homocysteine methyltransferase (BHMT), bypassing MTHFR.',
    rationaleEs: 'La colina suministra grupos metilo a la enzima hepática BHMT, compensando el bloqueo de MTHFR.'
  },
  {
    id: 'protein_wild_salmon',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Alaskan Sockeye Salmon',
    nameEs: 'Salmón Salvaje de Alaska (Sockeye)',
    nutrients: ['EPA & DHA Omega-3', 'Astaxanthin', 'Vit D3', 'Vit B12', 'Protein'],
    tags: ['anti_inflammatory', 'vdr_synergy', 'leptin_sensitizer'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Marine EPA/DHA resolves inflammatory prostaglandins and sensitizes hypothalamic leptin signaling.',
    rationaleEs: 'El EPA/DHA marino reduce prostaglandinas inflamatorias y sensibiliza la señalización de leptina hipotalámica.'
  },
  {
    id: 'protein_local_white_fish',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Fresh Local Sea Bass / Hammour / Cod',
    nameEs: 'Lubina Fresca / Hammour / Bacalao Salvaje',
    nutrients: ['Lean High-BV Protein', 'Iodine', 'Selenium', 'Vit B12'],
    tags: ['lean_amino_acids', 'thyroid_support', 'easy_digestion'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Ultra-clean protein with near-zero inflammatory histamine when cooked fresh from Arabian Gulf or Atlantic.',
    rationaleEs: 'Proteína limpia de máxima absorción; baja en histamina y perfecta para cenas de digestión ligera.'
  },
  {
    id: 'protein_wild_sardines_evoo',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Sardines or Mackerel in Olive Oil',
    nameEs: 'Sardinas Salvajes o Caballa en AOVE',
    nutrients: ['Bioavailable Calcium', 'EPA/DHA', 'Phosphorus', 'CoQ10'],
    tags: ['calcium_without_dairy', 'cardiovascular', 'heavy_metal_safe'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Small pelagic fish at bottom of marine food chain (zero heavy metal accumulation); soft bones provide dairy-free calcium.',
    rationaleEs: 'Pescado azul pequeño sin bioacumulación de metales pesados; sus espinas tiernas aportan calcio sin lactosa.'
  },
  {
    id: 'protein_pasture_chicken_breast',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Free-Range Organic Chicken Breast',
    nameEs: 'Pechuga de Pollo Ecológico de Pasto',
    nutrients: ['Leucine', 'B3 (Niacin)', 'B6', 'Phosphorus'],
    tags: ['mTOR_recovery', 'low_saturated_fat', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Clean source of branched-chain amino acids (BCAAs) to prevent sarcopenia without elevating visceral fat.',
    rationaleEs: 'Fuente magra de aminoácidos ramificados para conservar masa muscular sin elevar grasa visceral.'
  },
  {
    id: 'protein_grassfed_tenderloin',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Grass-Fed Beef Tenderloin',
    nameEs: 'Solomillo de Ternera de Pasto',
    nutrients: ['Heme Iron', 'Active B12', 'Creatine', 'Carnosine', 'Zinc'],
    tags: ['mitochondrial_power', 'remethylation_b12', 'iron_bioavailable'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Essential natural co-factors for methionine synthase; limit to 2 servings weekly to maintain healthy colonic transit.',
    rationaleEs: 'Aporta hierro hemo y B12 natural para metionina sintasa; consumir 1–2 veces por semana para balance digestivo.'
  },
  {
    id: 'protein_processed_cold_cuts',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Commercial Sausages, Hot Dogs & Mortadella',
    nameEs: 'Salchichas Industriales, Mortadela & Embutidos con Nitritos',
    nutrients: ['Sodium Nitrite', 'Polyphosphates', 'Oxidized Lipids'],
    tags: ['carcinogen_nitrites', 'endothelial_damage', 'gut_dysbiosis'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Nitrosamines disrupt gut epithelial tight junctions and trigger systemic vascular inflammation.',
    rationaleEs: 'Las nitrosaminas dañan las uniones estrechas intestinales e inducen inflamación endotelial sistémica.'
  },

  // ===========================================================================
  // 6. PROTEIN+ : DAIRY & A2 FERMENTS (3.2.1)
  // ===========================================================================
  {
    id: 'dairy_a2_goat_kefir',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'A2 Goat Milk Kefir / Coconut Water Kefir',
    nameEs: 'Kéfir de Leche de Cabra A2 / Kéfir de Agua de Coco',
    nutrients: ['Live Probiotic Cultures', 'A2 Beta-Casein', 'Bioavailable Calcium', 'B12'],
    tags: ['mcm6_friendly', 'gut_colonization', 'zero_a1_beta_casomorphin'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Lactose is consumed by probiotic fermentation. A2 beta-casein avoids releasing inflammatory BCM-7 opioid peptide.',
    rationaleEs: 'La fermentación elimina la lactosa; la caseína A2 no libera beta-casomorfina 7 inflamatoria.'
  },
  {
    id: 'dairy_raw_sheep_feta',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Authentic Greek Sheep/Goat Feta in Brine',
    nameEs: 'Queso Feta Auténtico de Cabra/Oveja en Salmuera',
    nutrients: ['A2 Casein', 'Conjugated Linoleic Acid (CLA)', 'Bioavailable Calcium'],
    tags: ['low_lactose', 'a2_protein', 'flavor_satiety'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Naturally aged in brine with minimal residual lactose (<0.5%); gentle on hypolactasia genotypes.',
    rationaleEs: 'Curado natural en salmuera con lactosa casi nula (<0.5%); excelente tolerancia en genotipo MCM6 CC.'
  },
  {
    id: 'dairy_cow_milk_pasteurized',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Commercial Pasteurized A1 Cow Milk & Sweet Yogurts',
    nameEs: 'Leche de Vaca Pasteurizada A1 & Yogures Dulces',
    nutrients: ['Lactose (High)', 'A1 Beta-Casein', 'Added Sugars'],
    tags: ['mcm6_conflict', 'mucosal_irritation', 'gut_bloat'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Triggers abdominal distension and mucosal inflammation in adult hypolactasia (MCM6) carriers.',
    rationaleEs: 'Produce fermentación colónica, distensión e irritación de mucosa en portadores de hipolactasia MCM6.'
  },

  // ===========================================================================
  // 7. LIPID+ : OILS & HEALTHY FATS (3.3.1)
  // ===========================================================================
  {
    id: 'lipid_evoo',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Extra Virgin Olive Oil (Cold-pressed, Dark Glass)',
    nameEs: 'Aceite de Oliva Virgen Extra (Primera Extracción, Botella Oscura)',
    nutrients: ['Oleic Acid (MUFA)', 'Oleocanthal', 'Dietary Vit E (alpha-tocopherol)', 'Polyphenols'],
    tags: ['cyp4f2_safe', 'vdr_micellar_carrier', 'cox_inhibition'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Oleocanthal acts as natural COX-1/2 anti-inflammatory; natural food matrix Vit E protects without toxicity.',
    rationaleEs: 'El oleocantal actúa como antiinflamatorio natural; su Vitamina E dietética es segura para CYP4F2.'
  },
  {
    id: 'lipid_avocado_raw',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Fresh Hass Avocado',
    nameEs: 'Aguacate Hass Fresco',
    nutrients: ['Oleic Acid', 'Potassium', 'Soluble Fiber', 'Vit E', 'Glutathione'],
    tags: ['heart_healthy_mufa', 'satiety_lipid', 'anti_aging'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Monounsaturated fatty acid matrix blunts postprandial glucose spikes when eaten alongside carbohydrates.',
    rationaleEs: 'Su matriz de ácido oleico frena el vaciado gástrico y estabiliza curvas de glucosa e insulina.'
  },
  {
    id: 'lipid_virgin_coconut_oil',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Raw Cold-Pressed Extra Virgin Coconut Oil',
    nameEs: 'Aceite de Coco Virgen Prensado en Frío',
    nutrients: ['Lauric Acid (C12)', 'Caprylic Acid (C8)', 'MCTs'],
    tags: ['heat_stable_cooking', 'antimicrobial_lauric', 'ketone_precursor'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Thermally stable cooking fat that does not oxidize into toxic lipid peroxides at medium skillet heat.',
    rationaleEs: 'Grasa térmicamente estable para cocinar sin formar peróxidos tóxicos ni grasas trans.'
  },
  {
    id: 'lipid_industrial_seed_oils',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Refined Seed Oils (Canola, Corn, Soybean, Margarine)',
    nameEs: 'Aceites Vegetales Industriales (Colza, Maíz, Soja, Margarina)',
    nutrients: ['Hexane Residues', 'Oxidized Linoleic Acid', 'Trans Fatty Acids'],
    tags: ['vascular_endotoxin', 'peroxidation_hazard', 'cellular_aging'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Oxidized omega-6 linoleic acid embeds in mitochondrial membranes, impairing cellular electron transport.',
    rationaleEs: 'Sus ácidos grasos oxidados se incrustan en la membrana mitocondrial, dañando la respiración celular.'
  },

  // ===========================================================================
  // 8. EXTRAS : NUTS & SEEDS (3.4.2)
  // ===========================================================================
  {
    id: 'seed_pumpkin',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw Pumpkin Seeds (Pepitas)',
    nameEs: 'Semillas de Calabaza Crudas',
    nutrients: ['Bioavailable Magnesium', 'Zinc', 'Tryptophan', 'Plant Sterols'],
    tags: ['magnesium_rest', 'zinc_immunity', 'dopamine_serotonin'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Highest dietary seed source of magnesium and zinc, providing raw precursors for evening melatonin synthesis.',
    rationaleEs: 'Máxima concentración dietética de magnesio y zinc; aporta sustrato para la síntesis de melatonina.'
  },
  {
    id: 'seed_walnuts_almonds',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw Walnuts & Mediterranean Raw Almonds',
    nameEs: 'Nueces Crudas & Almendras del Mediterráneo',
    nutrients: ['Alpha-Linolenic Acid (ALA)', 'Dietary Vit E', 'Ellagitannins', 'Fiber'],
    tags: ['cyp4f2_vit_e', 'neuroprotection', 'satiety_crunch'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Provides whole-food alpha-tocopherol that normalizes CYP4F2/ZPR1 lipid balance without hypervitaminosis.',
    rationaleEs: 'Aporta alfa-tocoferol en matriz natural que protege a portadores de CYP4F2/ZPR1 sin sobrecarga sintética.'
  },
  {
    id: 'seed_chia_flax',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Whole Black Chia & Fresh Ground Flaxseeds',
    nameEs: 'Semillas de Chía Enteras & Lino Molido',
    nutrients: ['Mucilage Soluble Fiber', 'ALA Omega-3', 'Lignans'],
    tags: ['bowel_motility', 'estrogen_detox', 'hydrophilic_gel'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Soluble mucilage binds circulating deconjugated estrogens in the colon, ensuring excretion via bile.',
    rationaleEs: 'El mucílago soluble atrapa estrógenos libres en el colon, facilitando su expulsión biliar definitiva.'
  },
  {
    id: 'seed_raw_tahini',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw 100% Sesame Tahini Paste',
    nameEs: 'Pasta de Tahini Crudo 100% Sésamo',
    nutrients: ['Sesamin', 'Sesamolin', 'Calcium', 'Methionine', 'B9'],
    tags: ['sesamin_antioxidant', 'dairy_free_calcium', 'dressing_base'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Sesamin lignans inhibit delta-5-desaturase, dampening arachidonic acid inflammatory cascades.',
    rationaleEs: 'Los lignanos de sésamo modulan la delta-5-desaturasa, frenando la cascada inflamatoria del ácido araquidónico.'
  },

  // ===========================================================================
  // 9. EXTRAS : NON-ALCOHOLIC FUNCTIONAL BEVERAGES (3.4.4)
  // ===========================================================================
  {
    id: 'bev_ceremonial_matcha',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Ceremonial Grade Japanese Matcha Green Tea',
    nameEs: 'Té Verde Matcha Japonés Ceremonial',
    nutrients: ['L-Theanine (High)', 'EGCG Polyphenols', 'Gentle Caffeine', 'Chlorophyll'],
    tags: ['alpha_brain_waves', 'smooth_focus', 'metabolic_ampk'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High L-theanine ratio counters caffeine-induced sympathetic vasoconstriction in ADORA2A genotypes.',
    rationaleEs: 'La L-teanina amortigua el efecto adrenérgico de la cafeína, protegiendo a portadores de ADORA2A.'
  },
  {
    id: 'bev_chamomile_flowers',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Organic German Chamomile Whole Dried Flowers',
    nameEs: 'Manzanilla Dulce Ecológica en Flor Entera',
    nutrients: ['Apigenin', 'Bisabolol', 'Chamazulene'],
    tags: ['gaba_agonist', 'parasympathetic_rest', 'nocturnal_repair'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Apigenin promotes deep slow-wave sleep and lowers evening cortisol prior to circadian fasting.',
    rationaleEs: 'La apigenina induce sueño profundo de ondas lentas y reduce el cortisol vespertino antes del ayuno nocturno.'
  },
  {
    id: 'bev_rooibos_caffeine_free',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'South African Red Bush Rooibos Tea (100% Caffeine-Free)',
    nameEs: 'Té Rooibos Rojo Sudafricano (100% Sin Cafeína)',
    nutrients: ['Aspalathin', 'Nothofagin', 'Quercetin', 'Zero Caffeine'],
    tags: ['evening_safe', 'insulin_sensitizer', 'adora2a_safe'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Aspalathin displays unique anti-hyperglycemic properties while being 100% free of purine alkaloids.',
    rationaleEs: 'La aspalatina ayuda a regular la glucemia vespertina sin contener ninguna traza de alcaloides excitatorios.'
  },
  {
    id: 'bev_celtic_mineral_water',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Filtered Water with Grey Celtic Sea Salt & Lime',
    nameEs: 'Agua Filtrada con Sal Marina Celta Gris & Lima',
    nutrients: ['Magnesium Chloride', 'Sodium', 'Trace Minerals 82+'],
    tags: ['cellular_hydration', 'adrenal_support', 'morning_reset'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Unrefined trace elements activate sodium-glucose cotransporters (SGLT1) for rapid intracellular hydration.',
    rationaleEs: 'Los oligoelementos naturales activan los cotransportadores SGLT1 para una hidratación intracelular inmediata.'
  },
  {
    id: 'bev_afternoon_espresso_energy_drink',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Afternoon Espresso, Energy Drinks & Diet Colas',
    nameEs: 'Café Espresso de Tarde, Bebidas Energéticas & Colas',
    nutrients: ['Synthetic Caffeine', 'Phosphoric Acid', 'Artificial Sweeteners'],
    tags: ['adora2a_insomnia', 'adenosine_block', 'cortisol_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Binds adenosine A2A receptors past noon, fragmenting stage 3/4 non-REM sleep and spiking nocturnal cortisol.',
    rationaleEs: 'Bloquea receptores de adenosina pasadas las 12h, fragmentando el sueño profundo e inhibiendo la melatonina.'
  },

  // ===========================================================================
  // 10. EXTRAS : ALCOHOLIC BEVERAGES (3.4.5)
  // ===========================================================================
  {
    id: 'bev_commercial_spirits_beer',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Alcoholic beverages',
    nameEn: 'Commercial Distilled Spirits, Beer & Sweet Cocktails',
    nameEs: 'Bebidas Espirituosas, Cerveza & Cócteles Dulces',
    nutrients: ['Ethanol', 'Acetaldehyde', 'Maltose (Beer)'],
    tags: ['liver_fat', 'glutathione_depletion', 'mthfr_paralysis'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Ethanol oxidation consumes NAD+ and severely depletes hepatic S-adenosylmethionine (SAMe), paralyzing MTHFR.',
    rationaleEs: 'El metabolismo del etanol agota el glutatión y vacía las reservas de SAMe, paralizando el ciclo de metilación.'
  }
];

/**
 * Evaluates any food from the master catalog against an individual patient's
 * genetic profile (MTHFR, MC4R, FTO, IRS1, TCF7L2, CYP4F2, MCM6, VDR, ADORA2A).
 * Returns the adjusted traffic light classification, genetic rationale, and clinical tag.
 */
export function evaluateFoodForGeneticProfile(foodItem, snpMap = {}) {
  const mthfrRisk = snpMap.mthfrRisk || 'HIGH'; // Default to typical clinical risk profile
  const mcm6LactoseIntolerant = snpMap.mcm6Intolerant ?? true;
  const mc4rLowSatiety = snpMap.mc4rLowSatiety ?? true;
  const irs1InsulinResistant = snpMap.irs1Resistant ?? true;
  const cyp4f2VitERisk = snpMap.cyp4f2Risk ?? true;
  const adora2aCaffeineSensitive = snpMap.caffeineSensitive ?? true;

  // Clone base item
  let finalLevel = foodItem.defaultLevel;
  const geneticDrivers = [];

  // Rule 1: MCM6 Adult Hypolactasia
  if (mcm6LactoseIntolerant) {
    if (foodItem.categoryFamily === 'Milk and derivatives') {
      if (foodItem.tags.includes('mcm6_conflict')) {
        finalLevel = 'RED_RESTRICT';
        geneticDrivers.push('MCM6 (-13910 C/T): Hypolactasia intolerance triggers gut dysbiosis and mucosal inflammation.');
      } else if (foodItem.tags.includes('mcm6_friendly')) {
        finalLevel = 'GREEN_ADJUSTING';
        geneticDrivers.push('MCM6 Compatible: A2 beta-casein and complete fermentation bypass lactase enzyme deficiency.');
      }
    }
  }

  // Rule 2: MTHFR C677T & Methylation
  if (mthfrRisk === 'HIGH') {
    if (foodItem.tags.includes('methylation') || foodItem.tags.includes('methylation_fuel')) {
      finalLevel = 'GREEN_ADJUSTING';
      geneticDrivers.push('MTHFR C677T TT: Therapeutic source of natural active [6S]-5-MTHF folates.');
    }
    if (foodItem.tags.includes('mthfr_toxic')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('MTHFR Impairment: Synthetic folic acid fortification creates toxic UMFA accumulation.');
    }
  }

  // Rule 3: MC4R / FTO Hypothalamic Satiety Deficit
  if (mc4rLowSatiety) {
    if (foodItem.tags.includes('pyy_surge') || foodItem.tags.includes('satiety_gold_standard')) {
      finalLevel = 'GREEN_ADJUSTING';
      geneticDrivers.push('MC4R rs17782313: Maximizes gut PYY / GLP-1 satiety peptide signaling.');
    }
    if (foodItem.tags.includes('sugar_spike') || foodItem.tags.includes('hyperglycemia')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('MC4R Sensitivity: High-sugar fast-absorbing carbs override fullness threshold.');
    }
  }

  // Rule 4: IRS1 / TCF7L2 Insulin Resistance
  if (irs1InsulinResistant) {
    if (foodItem.tags.includes('insulin_friendly') || foodItem.tags.includes('insulin_sensitizer')) {
      finalLevel = 'GREEN_ADJUSTING';
      geneticDrivers.push('IRS1 / TCF7L2: Low glycemic impact blunts insulin spikes and prevents reactive hypoglycemia.');
    }
    if (foodItem.tags.includes('insulin_surge') || foodItem.tags.includes('pro_inflammatory')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('IRS1 Vulnerability: Rapid starch conversion triggers excessive insulin hypersecretion.');
    }
  }

  // Rule 5: CYP4F2 / ZPR1 Dietary Vit E vs Synthetic Toxicity
  if (cyp4f2VitERisk) {
    if (foodItem.tags.includes('cyp4f2_vit_e') || foodItem.tags.includes('cyp4f2_safe')) {
      finalLevel = 'GREEN_ADJUSTING';
      geneticDrivers.push('CYP4F2 / ZPR1: Safe whole-food dietary Vitamin E matrix without synthetic toxicity.');
    }
    if (foodItem.tags.includes('peroxidation_hazard')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('ZPR1 / Lipid Axis: Industrial seed oils oxidize and elevate atherogenic particles.');
    }
  }

  // Rule 6: ADORA2A Adenosine Receptor Caffeine Sensitivity
  if (adora2aCaffeineSensitive) {
    if (foodItem.tags.includes('adora2a_insomnia')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('ADORA2A 1083 T/C: Adenosine blockade past 12:00 PM disrupts restorative REM sleep.');
    }
    if (foodItem.tags.includes('adora2a_safe') || foodItem.tags.includes('gaba_calm')) {
      finalLevel = 'GREEN_ADJUSTING';
      geneticDrivers.push('ADORA2A Sleep Protection: Non-excitatory botanicals nourish parasympathetic tone.');
    }
  }

  const levelMeta = FOOD_TRAFFIC_LEVELS[finalLevel] || FOOD_TRAFFIC_LEVELS.ALLOWED_CONTROLLED;

  return {
    ...foodItem,
    trafficLevel: finalLevel,
    levelMeta,
    geneticDrivers
  };
}

/**
 * Returns filtered supermarket grocery checklist items grouped into 4 GCC
 * shopping aisles, extracting strictly GREEN and YELLOW foods tailored to the patient.
 */
export function getPersonalizedGroceryAisles(snpMap = {}) {
  const evaluatedCatalog = MASTER_FOOD_CATALOG.map(f => evaluateFoodForGeneticProfile(f, snpMap));

  // Only foods that are allowed (Green Adjusting or Yellow Controlled)
  const allowedFoods = evaluatedCatalog.filter(f => f.trafficLevel === 'GREEN_ADJUSTING' || f.trafficLevel === 'ALLOWED_CONTROLLED');

  return [
    {
      id: 'aisle_produce',
      category: '[Veg] Fresh Produce & Greens',
      categoryEs: '[Verdulería] Hojas Verdes & Vegetales Frescos',
      icon: '🥬',
      subtitle: 'MTHFR Methylation & Satiety Volume',
      items: allowedFoods
        .filter(f => f.categoryFamily === 'Vegetables' || (f.categoryFamily === 'Fruits' && f.id !== 'fruit_dates_syrup'))
        .map(f => `${f.nameEn} (${f.nutrients.slice(0, 2).join(' · ')})`)
    },
    {
      id: 'aisle_protein',
      category: '[Fish] Clean Wild Proteins',
      categoryEs: '[Pescadería & Carnes] Proteína Limpia Salvaje',
      icon: '🐟',
      subtitle: 'MC4R Satiety & PYY Peptide Surge',
      items: allowedFoods
        .filter(f => f.categoryGroup === 'PROTEIN+' && f.categoryFamily !== 'Milk and derivatives')
        .map(f => `${f.nameEn} (${f.nutrients.slice(0, 2).join(' · ')})`)
    },
    {
      id: 'aisle_fats',
      category: '[Oil] Healthy Fats, Seeds & Cereals',
      categoryEs: '[Grasas & Semillas] AOVE & Semillas Buenas',
      icon: '🫒',
      subtitle: 'CYP4F2 Vit E & VDR D3/K2 Micellar Uptake',
      items: allowedFoods
        .filter(f => f.categoryFamily === 'Oils and fats' || f.categoryFamily === 'Nuts and seeds' || f.categoryFamily === 'Cereals' || f.categoryFamily === 'Legumes' || f.categoryFamily === 'Tubers')
        .slice(0, 10)
        .map(f => `${f.nameEn} (${f.nutrients.slice(0, 2).join(' · ')})`)
    },
    {
      id: 'aisle_beverages',
      category: '[Tea] Functional Beverages & A2 Ferments',
      categoryEs: '[Bebidas] Infusiones Funcionales & A2',
      icon: '🍵',
      subtitle: 'ADORA2A Sleep Axis & MCM6 Hypolactasia',
      items: allowedFoods
        .filter(f => f.categoryFamily === 'Non-alcoholic beverages' || (f.categoryFamily === 'Milk and derivatives' && f.tags.includes('mcm6_friendly')))
        .map(f => `${f.nameEn} (${f.nutrients.slice(0, 2).join(' · ')})`)
    }
  ];
}

