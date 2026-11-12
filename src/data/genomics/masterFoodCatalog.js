/**
 * masterFoodCatalog.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Master Food Catalog — Complete Fagron NutriGen™ 17-Subfamily Standard.
 * Structured across 4 Macro-Groups and 17 Official Sub-Families (116 foods):
 *
 * 1. CARBO+   (3.1.1 Vegetables · 3.1.2 Fruits · 3.1.3 Cereals · 3.1.4 Legumes · 3.1.5 Tubers)
 * 2. PROTEIN+ (3.2.1 Milk & Dairy · 3.2.2 Eggs · 3.2.3 Meats & Poultry · 3.2.4 Fish · 3.2.5 Shellfish & Molluscs)
 * 3. LIPID+   (3.3.1 Oils & Fats · 3.3.2 Sauces, Spices & Condiments)
 * 4. EXTRAS   (3.4.1 Sugars & Sweeteners · 3.4.2 Nuts & Seeds · 3.4.3 Cacao & Snacks · 3.4.4 Non-Alcoholic Drinks · 3.4.5 Alcoholic Drinks)
 *
 * Each food item defines its nutritional traits, micronutrient density (B9, B12,
 * Vit E, Vit D, Choline, Zinc, Magnesium), glycemic impact, satiety index, and
 * genetic rule triggers (MTHFR, MC4R, FTO, IRS1, TCF7L2, CYP4F2, MCM6, VDR, ADORA2A).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GREEN_META = {
  code: 'GREEN_ADJUSTING',
  labelEn: 'Eat Freely · Superfood for Your DNA',
  labelEs: 'Comer Libremente · Superalimento para tu ADN',
  shortLabelEn: '🟢 Eat Freely (Superfood)',
  shortLabelEs: '🟢 Comer Libremente',
  badgeColor: '#166534',
  badgeBg: '#f0fdf4',
  badgeBorder: '#86efac',
  trafficClass: 'green'
};

const YELLOW_META = {
  code: 'YELLOW_CONTROLLED',
  labelEn: 'Normal Portion · 1-3x/Week or Timing Rule',
  labelEs: 'Ración Normal · 1-3x/Semana o Regla de Horario',
  shortLabelEn: '🟡 Normal Portion (Rule)',
  shortLabelEs: '🟡 Ración Moderada',
  badgeColor: '#854d0e',
  badgeBg: '#fefce8',
  badgeBorder: '#fde047',
  trafficClass: 'yellow'
};

const ORANGE_META = {
  code: 'ORANGE_REDUCE',
  labelEn: 'Reduce Frequency · Occasional Small Portion',
  labelEs: 'Reducir Frecuencia · Ocasional en Poca Cantidad',
  shortLabelEn: '🟠 Reduce Frequency',
  shortLabelEs: '🟠 Reducir Frecuencia',
  badgeColor: '#c2410c',
  badgeBg: '#fff7ed',
  badgeBorder: '#fdba74',
  trafficClass: 'orange'
};

const RED_META = {
  code: 'RED_RESTRICT',
  labelEn: 'Avoid · Conflicts With Your DNA',
  labelEs: 'Evitar · Conflicto con tu ADN',
  shortLabelEn: '🔴 Avoid (DNA Conflict)',
  shortLabelEs: '🔴 Evitar',
  badgeColor: '#991b1b',
  badgeBg: '#fef2f2',
  badgeBorder: '#fca5a5',
  trafficClass: 'red'
};

export const FOOD_TRAFFIC_LEVELS = {
  ALLOWED_ADJUSTING: GREEN_META,
  GREEN_ADJUSTING: GREEN_META,
  ALLOWED_CONTROLLED: YELLOW_META,
  YELLOW_CONTROLLED: YELLOW_META,
  REDUCE_FREQUENCY: ORANGE_META,
  ORANGE_REDUCE: ORANGE_META,
  RESTRICT_EXCLUDE: RED_META,
  RED_RESTRICT: RED_META
};

export const FAGRON_17_SUBFAMILIES = [
  // 1. CARBO+ (5 Sub-families)
  { code: '3.1.1', group: 'CARBO+', family: 'Vegetables', labelEn: '3.1.1 Vegetables & Leafy Greens', labelEs: '3.1.1 Verduras y Hortalizas' },
  { code: '3.1.2', group: 'CARBO+', family: 'Fruits', labelEn: '3.1.2 Fruits & Citrus', labelEs: '3.1.2 Frutas y Cítricos' },
  { code: '3.1.3', group: 'CARBO+', family: 'Cereals', labelEn: '3.1.3 Cereals, Grains & Breads', labelEs: '3.1.3 Cereales, Granos y Panes' },
  { code: '3.1.4', group: 'CARBO+', family: 'Legumes', labelEn: '3.1.4 Legumes & Pulses', labelEs: '3.1.4 Legumbres' },
  { code: '3.1.5', group: 'CARBO+', family: 'Tubers', labelEn: '3.1.5 Tubers & Roots', labelEs: '3.1.5 Tubérculos y Raíces' },
  // 2. PROTEIN+ (5 Sub-families)
  { code: '3.2.1', group: 'PROTEIN+', family: 'Milk and derivatives', labelEn: '3.2.1 Milk, Dairy & A2 Ferments', labelEs: '3.2.1 Leche, Lácteos y Fermentados A2' },
  { code: '3.2.2', group: 'PROTEIN+', family: 'Eggs', labelEn: '3.2.2 Eggs', labelEs: '3.2.2 Huevos' },
  { code: '3.2.3', group: 'PROTEIN+', family: 'Meats', labelEn: '3.2.3 Meats & Poultry', labelEs: '3.2.3 Carnes y Aves' },
  { code: '3.2.4', group: 'PROTEIN+', family: 'Fish', labelEn: '3.2.4 White & Oily Fish', labelEs: '3.2.4 Pescados Blancos y Azules' },
  { code: '3.2.5', group: 'PROTEIN+', family: 'Shellfish', labelEn: '3.2.5 Shellfish, Molluscs & Crustaceans', labelEs: '3.2.5 Mariscos, Moluscos y Crustáceos' },
  // 3. LIPID+ (2 Sub-families)
  { code: '3.3.1', group: 'LIPID+', family: 'Oils and fats', labelEn: '3.3.1 Oils & Culinary Fats', labelEs: '3.3.1 Aceites y Grasas Culinarias' },
  { code: '3.3.2', group: 'LIPID+', family: 'Sauces and spices', labelEn: '3.3.2 Sauces, Spices & Condiments', labelEs: '3.3.2 Salsas, Especias y Condimentos' },
  // 4. EXTRAS (5 Sub-families)
  { code: '3.4.1', group: 'EXTRAS', family: 'Sugars and sweeteners', labelEn: '3.4.1 Sugars, Honey & Sweeteners', labelEs: '3.4.1 Azúcares, Miel y Endulzantes' },
  { code: '3.4.2', group: 'EXTRAS', family: 'Nuts and seeds', labelEn: '3.4.2 Nuts & Seeds', labelEs: '3.4.2 Frutos Secos y Semillas' },
  { code: '3.4.3', group: 'EXTRAS', family: 'Cacao and snacks', labelEn: '3.4.3 Cacao, Dark Chocolate & Snacks', labelEs: '3.4.3 Cacao, Chocolate Negro y Snacks' },
  { code: '3.4.4', group: 'EXTRAS', family: 'Non-alcoholic beverages', labelEn: '3.4.4 Teas, Coffee & Hydration', labelEs: '3.4.4 Infusiones, Café e Hidratación' },
  { code: '3.4.5', group: 'EXTRAS', family: 'Alcoholic beverages', labelEn: '3.4.5 Alcoholic Beverages', labelEs: '3.4.5 Bebidas Alcohólicas' }
];

export const MASTER_FOOD_CATALOG = [
  // ===========================================================================
  // 1. CARBO+ : 3.1.1 VEGETABLES (13 Items)
  // ===========================================================================
  {
    id: 'veg_arugula',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Wild Rocket / Arugula',
    nameEs: 'Rúcula Salvaje',
    nutrients: ['Natural Folate (B9)', 'Vit C', 'Nitrates', 'Calcium'],
    tags: ['methylation', 'endothelium', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Rich in natural active folate (B9) for energy and blood vessel health. Eat first on your plate.',
    rationaleEs: 'Rica en folato natural activo (B9) para tu energía y circulación. Tómala al empezar la comida.'
  },
  {
    id: 'veg_spinach',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Organic Baby Spinach & Swiss Chard',
    nameEs: 'Espinacas Tiernas y Acelgas',
    nutrients: ['Natural Folate (B9)', 'Magnesium', 'Iron', 'Vit K'],
    tags: ['methylation', 'magnesium', 'antioxidant'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Direct natural source of active folate that bypasses your slow MTHFR gene.',
    rationaleEs: 'Fuente directa de folato natural que compensa directamente tu gen MTHFR.'
  },
  {
    id: 'veg_asparagus',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Fresh Green Asparagus',
    nameEs: 'Espárragos Verdes Frescos',
    nutrients: ['Natural Folate (B9)', 'Inulin Prebiotic', 'Glutathione'],
    tags: ['methylation', 'prebiotic', 'glutathione'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Prebiotic fiber feeds healthy gut flora while natural folates support liver cleansing.',
    rationaleEs: 'Fibra prebiótica que nutre tu flora intestinal y folatos naturales para el hígado.'
  },
  {
    id: 'veg_artichoke',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Globe Artichokes',
    nameEs: 'Alcachofas Frescas',
    nutrients: ['Cynarin', 'Inulin Fiber', 'Magnesium', 'B9'],
    tags: ['biliary_flow', 'liver_detox', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Stimulates natural bile flow so you digest healthy fats and Vitamin D3 effortlessly.',
    rationaleEs: 'Activa la bilis natural para digerir grasas buenas y absorber tu Vitamina D3.'
  },
  {
    id: 'veg_broccoli',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Broccoli, Cauliflower & Brussels Sprouts',
    nameEs: 'Brócoli, Coliflor y Coles de Bruselas',
    nutrients: ['Sulforaphane', 'Vit C', 'Folate (B9)', 'Fiber'],
    tags: ['phase2_detox', 'antioxidant', 'estrogen_balance'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Activates liver detox pathways and slows down sugar absorption during meals.',
    rationaleEs: 'Activa la limpieza hepática y frena los picos de azúcar durante las comidas.'
  },
  {
    id: 'veg_beetroot',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Raw Grated Beetroot',
    nameEs: 'Remolacha Cruda Rallada',
    nutrients: ['Betaine (TMG)', 'Nitrates', 'Potassium', 'B9'],
    tags: ['betaine_tmg', 'homocysteine', 'vascular'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Natural betaine supports your backup methylation pathway (BHMT) to keep homocysteine low.',
    rationaleEs: 'La betaína natural activa tu vía de respaldo (BHMT) para reciclar homocisteína.'
  },
  {
    id: 'veg_cucumber',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Persian / English Cucumbers & Radishes',
    nameEs: 'Pepino Persa y Rabanitos',
    nutrients: ['96% Hydration', 'Silica', 'Potassium'],
    tags: ['satiety_volume', 'hydration', 'low_glycemic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Zero-sugar crunchy volume that calms evening snacking impulses (MC4R gene).',
    rationaleEs: 'Volumen crujiente sin azúcar que calma el impulso de picotear entre horas.'
  },
  {
    id: 'veg_celery_fennel',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Celery & Fresh Fennel Bulb',
    nameEs: 'Apio e Hinojo Fresco',
    nutrients: ['Apigenin', 'Anethole', 'Electrolytes'],
    tags: ['gaba_calm', 'carminative', 'anti_bloat'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Relaxes intestinal muscles and prevents post-meal abdominal bloating.',
    rationaleEs: 'Relaja la musculatura digestiva y evita la hinchazón después de comer.'
  },
  {
    id: 'veg_kale',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Curly Kale, Watercress & Endive',
    nameEs: 'Col Kale, Berros y Endivias',
    nutrients: ['Lutein', 'Vit K1', 'Folate (B9)', 'Vit C'],
    tags: ['cellular_shield', 'antioxidant', 'folate', 'methylation'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Bitter greens prime stomach digestion and deliver concentrated natural folates.',
    rationaleEs: 'Las hojas amargas preparan el estómago y aportan folato natural concentrado.'
  },
  {
    id: 'veg_zucchini_leek',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Zucchini, Leeks & Okra',
    nameEs: 'Calabacín, Puerros y Okra',
    nutrients: ['Soluble Mucilage', 'Potassium', 'Prebiotic Fiber'],
    tags: ['digestive_ease', 'soothing_soup', 'low_starch'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Ultra-gentle soluble fiber ideal for light dinners and gut mucosal protection.',
    rationaleEs: 'Fibra soluble muy suave, ideal para cenas ligeras que cuidan la mucosa intestinal.'
  },
  {
    id: 'veg_mushrooms',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Shiitake, Portobello & Button Mushrooms',
    nameEs: 'Setas Shiitake, Portobello y Champiñones',
    nutrients: ['Beta-Glucans', 'Ergothioneine', 'Selenium', 'B-Vitamins'],
    tags: ['satiety_volume', 'low_glycemic', 'antioxidant'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High umami satiety with near-zero net carbs and immune-supporting beta-glucans.',
    rationaleEs: 'Alto poder saciante (umami) casi sin carbohidratos y rico en beta-glucanos.'
  },
  {
    id: 'veg_tomato_peppers',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Tomatoes, Bell Peppers & Eggplant',
    nameEs: 'Tomate, Pimientos y Berenjena',
    nutrients: ['Lycopene', 'Vit C', 'Nasunin', 'Potassium'],
    tags: ['moderate_carb', 'antioxidant'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Healthy Mediterranean vegetables; peel or cook with olive oil if you have sensitive digestion.',
    rationaleEs: 'Saludables dentro del plato mediterráneo; cocinar con AOVE para mejor digestión.'
  },
  {
    id: 'veg_cooked_carrots_pumpkin',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Boiled Carrots & Roasted Pumpkin (High Portion)',
    nameEs: 'Zanahoria Cocida y Calabaza Asada (Ración Alta)',
    nutrients: ['Beta-Carotene', 'Fast Simple Sugars when boiled'],
    tags: ['moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Eat raw carrots freely, but keep cooked carrot/pumpkin to 1 small side portion due to faster sugar release.',
    rationaleEs: 'Cruda es libre; cocida o en puré modera la ración porque libera azúcar más rápido.'
  },

  // ===========================================================================
  // 2. CARBO+ : 3.1.2 FRUITS & DERIVATIVES (9 Items)
  // ===========================================================================
  {
    id: 'fruit_wild_blueberries',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Blueberries, Blackberries, Raspberries & Strawberries',
    nameEs: 'Arándanos, Moras, Frambuesas y Fresas',
    nutrients: ['Anthocyanins', 'Vit C', 'Fiber', 'Very Low Sugar'],
    tags: ['insulin_sensitizer', 'cognitive_sharpness', 'low_sugar'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Your best daily fruits: high antioxidants that improve insulin sensitivity without spiking blood sugar.',
    rationaleEs: 'Tus mejores frutas diarias: antioxidantes que mejoran tu insulina sin subir el azúcar.'
  },
  {
    id: 'fruit_lemon_lime',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Fresh Lemon, Lime & Grapefruit',
    nameEs: 'Limón, Lima y Pomelo Fresco',
    nutrients: ['Citric Acid', 'Vit C', 'Naringenin'],
    tags: ['stomach_acid', 'antioxidant', 'insulin_sensitizer'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Squeezing lemon on meals lowers the glycemic impact of carbs by up to 20%.',
    rationaleEs: 'Añadir limón a tus platos reduce hasta un 20% el impacto glucémico de la comida.'
  },
  {
    id: 'fruit_kiwi',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Green Kiwi Fruit',
    nameEs: 'Kiwi Verde Fresco',
    nutrients: ['Actinidin Enzyme', 'Vit C', 'Folate (B9)', 'Soluble Fiber'],
    tags: ['methylation', 'prebiotic', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Contains natural folate and actinidin enzyme that accelerates protein digestion and bowel transit.',
    rationaleEs: 'Rico en folato natural y enzima actinidina que mejora la digestión de proteínas.'
  },
  {
    id: 'fruit_green_apple',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Green Apple & Pear (Whole with Skin)',
    nameEs: 'Manzana Verde y Pera (Entera con Piel)',
    nutrients: ['Pectin Fiber', 'Quercetin', 'Malic Acid'],
    tags: ['gut_microbiome', 'satiety', 'moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: '1 piece/day max. Always pair with 6-8 raw almonds or walnuts to slow sugar absorption.',
    rationaleEs: 'Máximo 1 pieza al día, siempre acompañada de un puñado de nueces o almendras.'
  },
  {
    id: 'fruit_pomegranate',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Fresh Pomegranate Seeds (Arils)',
    nameEs: 'Granada Fresca en Grano',
    nutrients: ['Punicalagins', 'Urolithin A Precursors', 'Vit C'],
    tags: ['mitochondria_autophagy', 'endothelium', 'polyphenols'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Use 2-3 tablespoons sprinkled over salads for cellular longevity without excess fructose.',
    rationaleEs: 'Usa 2-3 cucharadas sobre tus ensaladas como antioxidante sin exceso de fructosa.'
  },
  {
    id: 'fruit_peach_plum_apricot',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Peach, Apricot, Plum & Orange (Whole)',
    nameEs: 'Melocotón, Albaricoque, Ciruela y Naranja Entera',
    nutrients: ['Vit C', 'Beta-Carotene', 'Fiber'],
    tags: ['moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Eat whole (never juiced) as dessert after a protein-rich lunch, 2-3 times per week.',
    rationaleEs: 'Tomar siempre la pieza entera (nunca en zumo) tras una comida con proteína, 2-3x/sem.'
  },
  {
    id: 'fruit_banana_mango_melon',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Ripe Banana, Mango, Pineapple, Watermelon & Grapes',
    nameEs: 'Plátano Maduro, Mango, Piña, Sandía y Uvas',
    nutrients: ['High Fast Glucose/Fructose', 'Potassium'],
    tags: ['sugar_spike', 'insulin_surge'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'High glycemic load triggers a sharp insulin spike and afternoon fatigue in IRS1/TCF7L2 carriers.',
    rationaleEs: 'Carga glucémica alta que dispara la insulina y provoca sueño por la tarde (genes IRS1/TCF7L2).'
  },
  {
    id: 'fruit_dates_syrup',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Dried Dates, Raisins, Figs & Canned Fruit in Syrup',
    nameEs: 'Dátiles, Pasas, Higos Secos y Fruta en Almíbar',
    nutrients: ['Concentrated Sugar (65-75%)', 'Low Water'],
    tags: ['hyperglycemia', 'liver_fat', 'sugar_spike'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Concentrated sugar bomb that overrides your fullness signal (MC4R) and spikes triglycerides.',
    rationaleEs: 'Concentración extrema de azúcar que bloquea tu saciedad (MC4R) y dispara la glucosa.'
  },
  {
    id: 'fruit_juices_smoothies',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Orange Juice & Blended Fruit Smoothies',
    nameEs: 'Zumos de Fruta (incluso naturales) y Batidos',
    nutrients: ['Liquid Fructose', 'Zero Intact Fiber Mesh'],
    tags: ['hyperglycemia', 'sugar_spike', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Juicing destroys the fiber mesh, sending liquid fructose straight to your liver.',
    rationaleEs: 'Al exprimir la fruta se rompe la fibra y el azúcar líquido entra de golpe al hígado.'
  },

  // ===========================================================================
  // 3. CARBO+ : 3.1.3 CEREALS, GRAINS & BREADS (8 Items)
  // ===========================================================================
  {
    id: 'cereal_quinoa',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Quinoa (Red, Black or White, Boiled)',
    nameEs: 'Quinoa (Roja, Negra o Blanca, Cocida)',
    nutrients: ['Complete Plant Protein', 'Magnesium', 'Fiber', 'B-Vitamins'],
    tags: ['gluten_free', 'slow_carb', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High-protein seed grain that keeps blood sugar stable. Eat last on your plate (max 3-4 tbsp cooked).',
    rationaleEs: 'Seudocereal rico en proteína y magnesio que mantiene estable tu glucosa. Tómalo al final del plato.'
  },
  {
    id: 'cereal_buckwheat',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Buckwheat Groats & 100% Buckwheat Crepes',
    nameEs: 'Trigo Sarraceno (Alforfón) en Grano o Crepe 100%',
    nutrients: ['D-Chiro-Inositol', 'Rutin', 'Magnesium', 'Folate'],
    tags: ['insulin_sensitizer', 'vascular_rutin', 'gluten_free'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Contains natural D-Chiro-Inositol which helps your cells absorb glucose smoothly.',
    rationaleEs: 'Contiene D-Chiro-Inositol natural que ayuda a tus células a gestionar mejor el azúcar.'
  },
  {
    id: 'cereal_steel_cut_oats',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Whole Rolled / Steel-Cut Oats (Savory or with Eggs/Seeds)',
    nameEs: 'Copos de Avena Integral Enteros (con Semillas o Huevo)',
    nutrients: ['Beta-Glucan Fiber', 'Magnesium', 'Zinc'],
    tags: ['moderate_carb', 'satiety'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Max 40g dry, only in the morning and always paired with protein (eggs/nuts), never with sugar or honey.',
    rationaleEs: 'Máximo 40g en el desayuno y siempre acompañada de proteína (huevos/nueces), nunca dulce.'
  },
  {
    id: 'cereal_brown_basmati_cooled',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Basmati or Wild Rice (Cooked & Cooled 24h in Fridge)',
    nameEs: 'Arroz Basmati o Salvaje (Cocido y Enfriado 24h en Nevera)',
    nutrients: ['Type-3 Resistant Starch', 'Prebiotic Butyrate'],
    tags: ['gut_butyrate', 'glycemic_blunt', 'prebiotic'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Cooling cooked rice for 24h turns half its starch into prebiotic fiber, cutting the sugar spike by 40%.',
    rationaleEs: 'Enfriar el arroz 24h transforma su almidón en fibra prebiótica y reduce un 40% el pico de glucosa.'
  },
  {
    id: 'cereal_sourdough_rye',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Long-Fermented Rye or Spelt Sourdough Bread',
    nameEs: 'Pan de Masa Madre de Centeno o Espelta (Fermentación 24h)',
    nutrients: ['Organic Acids', 'Pre-digested Gluten', 'Fiber'],
    tags: ['moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Max 1 toasted slice at breakfast or lunch with olive oil and protein (never eat bread basket first!).',
    rationaleEs: 'Máximo 1 rebanada tostada con AOVE y proteína (nunca empieces la comida con pan).'
  },
  {
    id: 'cereal_white_rice_pasta_couscous',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Freshly Cooked White Rice, White Pasta & Couscous',
    nameEs: 'Arroz Blanco Recién Hecho, Pasta Blanca y Cuscús',
    nutrients: ['Fast Amylopectin Starch', 'Low Fiber'],
    tags: ['insulin_surge', 'sugar_spike'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Converts rapidly into blood glucose, triggering afternoon brain fog and visceral fat storage (IRS1/FTO).',
    rationaleEs: 'Se convierte rápidamente en azúcar en sangre, causando sueño tras comer y grasa abdominal.'
  },
  {
    id: 'cereal_white_wheat_flour',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'White Bread, Arabic Pita, Bagels & Fortified Flours',
    nameEs: 'Pan Blanco, Pan Pita Refinado y Harinas Enriquecidas',
    nutrients: ['Synthetic Folic Acid (UMFA)', 'Refined Starch'],
    tags: ['mthfr_toxic', 'insulin_spike', 'pro_inflammatory'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Contains synthetic folic acid that blocks your MTHFR receptors plus fast starch that spikes insulin.',
    rationaleEs: 'Contiene ácido fólico sintético que bloquea tu gen MTHFR y almidón rápido que dispara la insulina.'
  },
  {
    id: 'cereal_breakfast_cereals_granola',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Commercial Breakfast Cereals, Cornflakes & Sweet Granola',
    nameEs: 'Cereales de Desayuno Comerciales, Cornflakes y Granola Dulce',
    nutrients: ['Synthetic Folic Acid', 'Added Sugars', 'Extruded Starch'],
    tags: ['mthfr_toxic', 'hyperglycemia', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Double genetic conflict: fortified with synthetic folic acid (MTHFR) and high glycemic index (IRS1).',
    rationaleEs: 'Doble conflicto genético: enriquecidos con ácido fólico sintético (MTHFR) y alto azúcar (IRS1).'
  },

  // ===========================================================================
  // 4. CARBO+ : 3.1.4 LEGUMES & PULSES (6 Items)
  // ===========================================================================
  {
    id: 'legume_green_lentils',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Puy Green, Brown & Red Lentils',
    nameEs: 'Lentejas Verdes (Puy), Pardinas y Rojas',
    nutrients: ['High Natural Folate (B9)', 'Soluble Fiber', 'Iron', 'Zinc'],
    tags: ['methylation_fuel', 'satiety_protein', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: '#1 plant source of natural folate (B9) for your MTHFR gene plus 4-hour fullness.',
    rationaleEs: 'Fuente vegetal nº 1 de folato natural (B9) para tu gen MTHFR con 4 horas de saciedad.'
  },
  {
    id: 'legume_edamame_lupini',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Steamed Edamame & Lupini Beans (Altramuces)',
    nameEs: 'Edamame al Vapor y Altramuces',
    nutrients: ['High Plant Protein', 'Folate (B9)', 'Very Low Starch'],
    tags: ['methylation', 'satiety_protein', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High-protein, low-starch legumes that curb appetite without raising blood glucose.',
    rationaleEs: 'Legumbres ricas en proteína y muy bajas en almidón que sacian sin subir la glucosa.'
  },
  {
    id: 'legume_chickpeas',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Chickpeas & Homemade Hummus (with Tahini & EVOO)',
    nameEs: 'Garbanzos Cocidos y Hummus Casero (con Tahini y AOVE)',
    nutrients: ['Vit B6', 'Folate (B9)', 'Resistant Starch', 'Magnesium'],
    tags: ['serotonin_cofactor', 'slow_starch', 'microbiome'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Great slow-release energy 2-3x/week; eat hummus with cucumber/celery sticks instead of pita bread.',
    rationaleEs: 'Excelente energía lenta 2-3x/sem; toma el hummus con bastones de pepino o apio en vez de pan pita.'
  },
  {
    id: 'legume_black_white_beans',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Black Beans, White Navy Beans & Fava Beans',
    nameEs: 'Alubias Negras, Judías Blancas y Habas',
    nutrients: ['Folate (B9)', 'Potassium', 'Magnesium', 'Resistant Starch'],
    tags: ['slow_starch', 'methylation'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Soak 12h and pressure-cook with cumin or fennel seeds to eliminate lectins and gas.',
    rationaleEs: 'Remojar 12h y cocinar con comino o hinojo para eliminar lectinas y gases.'
  },
  {
    id: 'legume_green_peas',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Fresh Green Peas',
    nameEs: 'Guisantes Verdes Tiernos',
    nutrients: ['Folate (B9)', 'Vit C', 'Plant Protein'],
    tags: ['methylation', 'moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Good source of natural folate; keep to a moderate side portion (80-100g) mixed with greens.',
    rationaleEs: 'Buena fuente de folato natural; usar como guarnición moderada (80-100g) junto a verduras.'
  },
  {
    id: 'legume_sweet_baked_beans_soy',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Canned Baked Beans in Sweet Sauce & Ultra-Processed Soy Burgers',
    nameEs: 'Alubias en Salsa Dulce Comercial y Hamburguesas de Soja Procesada',
    nutrients: ['Added Sugar', 'Refined Seed Oils', 'Soy Isolates'],
    tags: ['sugar_spike', 'pro_inflammatory'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Loaded with hidden sugars and industrial seed oils that trigger metabolic inflammation.',
    rationaleEs: 'Contienen azúcares ocultos y aceites de semillas refinados inflamatorios.'
  },

  // ===========================================================================
  // 5. CARBO+ : 3.1.5 TUBERS & ROOTS (5 Items)
  // ===========================================================================
  {
    id: 'tuber_konjac_jerusalem_artichoke',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Konjac Root (Shirataki Noodles) & Jerusalem Artichoke (Topinambur)',
    nameEs: 'Raíz de Konjac (Pasta Shirataki) y Tupinambo',
    nutrients: ['Glucomannan Fiber', 'Inulin Prebiotic', 'Zero Net Sugar'],
    tags: ['insulin_friendly', 'satiety_volume', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Glucomannan expands in the stomach for maximum fullness with zero insulin spike.',
    rationaleEs: 'El glucomanano se expande en el estómago dando saciedad total con cero subida de insulina.'
  },
  {
    id: 'tuber_sweet_potato',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Baked or Steamed Sweet Potato (Boniato)',
    nameEs: 'Boniato / Batata al Horno o Vapor',
    nutrients: ['Beta-Carotene (Vit A)', 'Potassium', 'Soluble Fiber'],
    tags: ['cellular_repair', 'skin_antioxidant', 'moderate_starch'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Eat as the last item on your plate (max 100g) drizzled with olive oil and cinnamon.',
    rationaleEs: 'Tómalo al final del plato (máx. 100g) con un hilo de AOVE y canela.'
  },
  {
    id: 'tuber_cooled_potato',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Boiled Potato Cooled 24h in Fridge (Potato Salad with EVOO)',
    nameEs: 'Patata Cocida con Piel y Enfriada 24h en Nevera',
    nutrients: ['Type-3 Resistant Starch', 'Potassium', 'Vit C'],
    tags: ['gut_butyrate', 'glycemic_blunt'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Cooling 24h turns fast potato starch into prebiotic resistant starch. Never eat hot mashed potatoes.',
    rationaleEs: 'Enfriar la patata 24h convierte su almidón en fibra prebiótica. Evita el puré de patata caliente.'
  },
  {
    id: 'tuber_cassava_hot_mashed',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Hot Mashed Potatoes & Cassava (Yuca)',
    nameEs: 'Puré de Patata Caliente y Yuca',
    nutrients: ['High Glycemic Index (GI > 85)', 'Fast Glucose'],
    tags: ['insulin_surge', 'sugar_spike'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Hot gelatinized starch enters the bloodstream almost as fast as pure glucose.',
    rationaleEs: 'El almidón caliente gelatinizado sube el azúcar en sangre casi tan rápido como la glucosa pura.'
  },
  {
    id: 'tuber_french_fries_corn_oil',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'French Fries & Bagged Potato Chips',
    nameEs: 'Patatas Fritas y Patatas de Bolsa',
    nutrients: ['Acrylamide', 'Oxidized Seed Oils', 'Refined Starch'],
    tags: ['vascular_damage', 'systemic_inflammation', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Combines high-glycemic starch with oxidized seed oils, damaging blood vessels and spiking insulin.',
    rationaleEs: 'Combina almidón rápido con aceites oxidados que inflaman las arterias y disparan la insulina.'
  },

  // ===========================================================================
  // 6. PROTEIN+ : 3.2.1 MILK, DAIRY & A2 ALTERNATIVES (6 Items)
  // ===========================================================================
  {
    id: 'dairy_a2_goat_kefir',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Fermented Goat or Sheep Kefir (A2 Casein) & Unsweetened Coconut Yogurt',
    nameEs: 'Kéfir de Cabra u Oveja (Caseína A2) y Yogur de Coco Natural',
    nutrients: ['Live Probiotics', 'A2 Protein', 'Calcium', 'Vit B12'],
    tags: ['mcm6_friendly', 'gut_colonization', 'zero_a1_beta_casomorphin'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: '24h fermentation removes lactose, and A2 goat/sheep protein does not irritate your gut (MCM6 safe).',
    rationaleEs: 'La fermentación elimina la lactosa y la proteína A2 de cabra/oveja no inflama tu intestino (MCM6).'
  },
  {
    id: 'dairy_almond_coconut_milk',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Unsweetened Almond, Coconut or Hazelnut Milk (Zero Oil/Sugar)',
    nameEs: 'Bebida de Almendra, Coco o Avellana Sin Azúcar',
    nutrients: ['Zero Lactose', 'Low Glycemic', 'Vit E'],
    tags: ['mcm6_friendly', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Ideal dairy-free base for morning coffee or matcha without lactose or sugar spikes (avoid oat milk).',
    rationaleEs: 'Base perfecta sin lactosa para tu café o matcha matutino (evita la leche de avena por su pico de azúcar).'
  },
  {
    id: 'dairy_raw_sheep_feta',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Authentic Sheep/Goat Feta, Halloumi & Manchego Curado',
    nameEs: 'Queso Feta de Oveja/Cabra, Halloumi de Cabra y Manchego Curado',
    nutrients: ['A2 Casein', 'Calcium', 'Zinc', '<0.5% Lactose'],
    tags: ['low_lactose', 'a2_protein', 'flavor_satiety'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Well tolerated in 30-40g portions (2-3x/week) because aged sheep/goat cheese has near-zero lactose.',
    rationaleEs: 'Bien tolerado en porciones de 30-40g (2-3x/sem) al ser leche A2 curada casi sin lactosa.'
  },
  {
    id: 'dairy_parmigiano_24m',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: '24-Month Aged Parmigiano Reggiano',
    nameEs: 'Parmigiano Reggiano Curado +24 Meses',
    nutrients: ['Zero Lactose (0.0g)', 'High Calcium', 'Tyrosine', 'Vit K2'],
    tags: ['low_lactose', 'flavor_satiety'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: '24-month aging completely consumes all lactose; use 1-2 grated tablespoons over vegetables.',
    rationaleEs: 'Sus 24 meses de curación eliminan el 100% de la lactosa; usa 1-2 cucharadas ralladas.'
  },
  {
    id: 'dairy_cow_milk_pasteurized',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Cow Milk, Fresh Ricotta, Mascarpone & Cream',
    nameEs: 'Leche de Vaca, Nata, Queso Fresco de Vaca y Ricotta',
    nutrients: ['High Lactose', 'Inflammatory A1 Beta-Casein'],
    tags: ['mcm6_conflict', 'mucosal_irritation', 'gut_bloat'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Your MCM6 gene means adult lactase deficiency: unfermented cow dairy causes gas, bloating, and gut inflammation.',
    rationaleEs: 'Por tu gen MCM6 no digieres bien la lactosa: la leche de vaca causa hinchazón, gases e inflamación.'
  },
  {
    id: 'dairy_sweet_yogurts_ice_cream',
    subfamilyCode: '3.2.1',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Milk and derivatives',
    nameEn: 'Flavored Sweet Yogurts, Condensed Milk & Ice Cream',
    nameEs: 'Yogures de Sabores Azucarados, Leche Condensada y Helados',
    nutrients: ['High Lactose', 'High Added Sugar'],
    tags: ['mcm6_conflict', 'sugar_spike', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Combines lactose intolerance (MCM6) with a high insulin spike (IRS1).',
    rationaleEs: 'Combina intolerancia a la lactosa (MCM6) con un fuerte pico de azúcar e insulina (IRS1).'
  },

  // ===========================================================================
  // 7. PROTEIN+ : 3.2.2 EGGS (4 Items)
  // ===========================================================================
  {
    id: 'protein_pasture_eggs',
    subfamilyCode: '3.2.2',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Eggs',
    nameEn: 'Pasture-Raised Organic Eggs (Poached, Soft-Boiled or Scrambled in EVOO)',
    nameEs: 'Huevos Camperos Ecológicos (Poché, Pasados por Agua o Revueltos en AOVE)',
    nutrients: ['Choline (Methyl Donor)', 'Vit B12', 'Vit D3', 'Lutein', 'Complete Protein'],
    tags: ['liver_methylation', 'satiety_gold_standard', 'pyy_surge'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Superfood for your DNA: egg yolk choline provides backup methylation fuel for your MTHFR gene and keeps you full all morning.',
    rationaleEs: 'Superalimento para tu ADN: la colina de la yema apoya tu gen MTHFR y te quita el hambre toda la mañana.'
  },
  {
    id: 'protein_quail_duck_eggs',
    subfamilyCode: '3.2.2',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Eggs',
    nameEn: 'Quail Eggs & Egg Whites',
    nameEs: 'Huevos de Codorniz y Claras de Huevo',
    nutrients: ['High B12', 'Choline', 'Pure Albumin Protein'],
    tags: ['liver_methylation', 'satiety_gold_standard'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High nutrient density and clean protein for breakfast or salad toppings.',
    rationaleEs: 'Alta densidad de B12 y proteína limpia para desayunos o ensaladas.'
  },
  {
    id: 'protein_hard_fried_eggs_seed_oil',
    subfamilyCode: '3.2.2',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Eggs',
    nameEn: 'Eggs Deep-Fried in Sunflower / Corn Oil',
    nameEs: 'Huevos Fritos a Alta Temperatura en Aceite de Girasol o Maíz',
    nutrients: ['Oxidized Cholesterol', 'Oxidized Linoleic Acid'],
    tags: ['peroxidation_hazard'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Cooking eggs in seed oils oxidizes the yolk lipids; always cook eggs gently in Extra Virgin Olive Oil or ghee.',
    rationaleEs: 'Freír en aceite de semillas oxida los lípidos de la yema; cocínalos siempre en AOVE o ghee a fuego medio.'
  },

  // ===========================================================================
  // 8. PROTEIN+ : 3.2.3 MEATS & POULTRY (7 Items)
  // ===========================================================================
  {
    id: 'protein_pasture_chicken_breast',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Organic Free-Range Chicken Breast & Thighs',
    nameEs: 'Pollo Ecológico de Corral (Pechuga y Contramuslo)',
    nutrients: ['Leucine', 'Vit B3 (Niacin)', 'Vit B6', 'Selenium'],
    tags: ['mTOR_recovery', 'low_saturated_fat', 'pyy_stimulator', 'satiety_gold_standard'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Stimulates your gut PYY fullness hormone (MC4R support) and preserves lean muscle mass.',
    rationaleEs: 'Estimula la hormona de saciedad PYY (apoyo MC4R) y protege tu masa muscular.'
  },
  {
    id: 'protein_turkey_breast',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Fresh Organic Turkey Breast',
    nameEs: 'Pavo Fresco Ecológico (Pechuga o Solomillo)',
    nutrients: ['Tryptophan', 'Vit B6', 'Vit B12', 'Zinc'],
    tags: ['pyy_stimulator', 'satiety_gold_standard', 'gaba_calm'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Rich in natural L-tryptophan, helping your body produce evening serotonin and melatonin for deep sleep.',
    rationaleEs: 'Rico en triptófano natural que ayuda a fabricar serotonina y melatonina para dormir mejor.'
  },
  {
    id: 'protein_rabbit_quail_lean',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Lean Rabbit & Farm Quail',
    nameEs: 'Conejo y Codorniz Asada',
    nutrients: ['Active Vit B12', 'Low Saturated Fat', 'Iron'],
    tags: ['pyy_stimulator', 'low_saturated_fat'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Exceptionally lean, easily digested white meats rich in bioavailable Vitamin B12.',
    rationaleEs: 'Carnes blancas muy magras, fáciles de digerir y ricas en Vitamina B12 activa.'
  },
  {
    id: 'protein_grassfed_tenderloin',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Grass-Fed Beef Tenderloin / Sirloin (1-2x/week)',
    nameEs: 'Solomillo o Lomo de Ternera de Pasto (1-2x/semana)',
    nutrients: ['Heme Iron', 'Methyl-B12', 'Zinc', 'Creatine', 'Carnosine'],
    tags: ['mitochondrial_power', 'remethylation_b12', 'iron_bioavailable'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Great source of Zinc and B12; enjoy 1-2 times per week at lunch paired with plenty of leafy greens.',
    rationaleEs: 'Excelente fuente de Zinc y B12; tómalo 1-2 veces por semana al mediodía con abundante hoja verde.'
  },
  {
    id: 'protein_grassfed_lamb',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Lean Grass-Fed Lamb Chops / Skewers (1x/week)',
    nameEs: 'Cordero de Pasto Magro a la Brasa (1x/semana)',
    nutrients: ['L-Carnitine', 'CLA', 'Vit B12', 'Zinc'],
    tags: ['mitochondrial_power', 'remethylation_b12'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Rich in L-carnitine for fat metabolism; trim visible fat and pair with arugula and lemon.',
    rationaleEs: 'Rico en L-carnitina; retirar grasa visible y acompañar de rúcula y limón.'
  },
  {
    id: 'protein_fatty_ribeye_pork_ribs',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Fatty Grain-Fed Ribeye, Pork Ribs & Bacon',
    nameEs: 'Cortes Muy Grasos de Cebadero, Costillas y Bacon',
    nutrients: ['High Palmitic Saturated Fat', 'Arachidonic Acid'],
    tags: ['pro_inflammatory'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Excess saturated fat from grain-fed meats reduces insulin sensitivity in FTO and IRS1 genotypes.',
    rationaleEs: 'El exceso de grasa saturada de animales de cebadero reduce la sensibilidad a la insulina (FTO/IRS1).'
  },
  {
    id: 'protein_processed_cold_cuts',
    subfamilyCode: '3.2.3',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Meats',
    nameEn: 'Processed Sausages, Hot Dogs, Salami & Deli Cold Cuts with Nitrites',
    nameEs: 'Salchichas, Mortadela, Salami y Fiambres con Nitritos/Féculas',
    nutrients: ['Sodium Nitrite (E250)', 'Hidden Dextrose', 'Oxidized Fats'],
    tags: ['carcinogen_nitrites', 'endothelial_damage', 'gut_dysbiosis', 'pro_inflammatory'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Nitrites and hidden sugars damage your gut lining and increase oxidative stress on blood vessels.',
    rationaleEs: 'Los nitritos y azúcares ocultos dañan tu flora intestinal e inflaman el endotelio vascular.'
  },

  // ===========================================================================
  // 9. PROTEIN+ : 3.2.4 WHITE & OILY FISH (7 Items)
  // ===========================================================================
  {
    id: 'protein_wild_salmon',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Alaskan Salmon & Trout',
    nameEs: 'Salmón Salvaje de Alaska y Trucha',
    nutrients: ['EPA & DHA Omega-3', 'Astaxanthin', 'Vit D3', 'Vit B12'],
    tags: ['anti_inflammatory', 'vdr_synergy', 'leptin_sensitizer', 'satiety_gold_standard'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Top anti-inflammatory protein: rich in natural Vitamin D3 (supports VDR gene) and Omega-3s.',
    rationaleEs: 'Proteína antiinflamatoria nº 1: aporta Vitamina D3 natural (gen VDR) y Omega-3 EPA/DHA.'
  },
  {
    id: 'protein_wild_sardines_evoo',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Sardines, Anchovies & Mackerel (Fresh or in EVOO)',
    nameEs: 'Sardinas, Boquerones y Caballa Salvaje (Frescos o en AOVE)',
    nutrients: ['High EPA/DHA', 'Dairy-Free Calcium', 'CoQ10', 'Vit D3'],
    tags: ['calcium_without_dairy', 'cardiovascular', 'heavy_metal_safe', 'vdr_synergy'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Small fish have zero mercury and provide natural calcium without lactose (ideal for MCM6 + VDR).',
    rationaleEs: 'Pescado azul pequeño sin mercurio que aporta calcio natural sin lactosa (ideal MCM6 y VDR).'
  },
  {
    id: 'protein_local_white_fish',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Sea Bass, Sea Bream (Dorada), Hammour, Cod & Hake',
    nameEs: 'Lubina, Dorada, Mero (Hammour), Bacalao y Merluza Salvaje',
    nutrients: ['Ultra-Lean Protein', 'Iodine', 'Selenium', 'Vit B12'],
    tags: ['lean_amino_acids', 'thyroid_support', 'easy_digestion', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Light, fast-digesting dinner protein that keeps nighttime insulin low and improves sleep quality.',
    rationaleEs: 'Proteína ligera perfecta para la cena: se digiere rápido, mantiene baja la insulina y mejora el sueño.'
  },
  {
    id: 'protein_sole_turbot',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Dover Sole, Turbot & Halibut',
    nameEs: 'Lenguado, Rodaballo y Fletán',
    nutrients: ['High Digestibility Protein', 'Vit B12', 'Magnesium'],
    tags: ['easy_digestion', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Gentle white fish ideal for baked or steamed evening meals.',
    rationaleEs: 'Pescado blanco muy digestivo, ideal al horno o al vapor por la noche.'
  },
  {
    id: 'protein_tuna_swordfish',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Large Bluefin Tuna & Swordfish (Max 1x every 2 weeks)',
    nameEs: 'Atún Rojo Grande y Pez Espada (Máx. 1x cada 2 semanas)',
    nutrients: ['High Protein', 'Bioaccumulated Methylmercury'],
    tags: ['moderate_carb'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Large predator fish accumulate mercury, which burdens glutathione detox in MTHFR carriers. Prefer skipjack/bonito or salmon.',
    rationaleEs: 'Los grandes túnidos acumulan mercurio, exigiendo más glutatión (MTHFR). Prioriza bonito del norte o salmón.'
  },
  {
    id: 'protein_battered_fried_fish',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Breaded / Battered Fried Fish & Canned Fish in Sunflower Oil',
    nameEs: 'Pescado Rebozado/Frito y Conservas en Aceite de Girasol',
    nutrients: ['Refined Wheat Flour', 'Oxidized Seed Oils'],
    tags: ['peroxidation_hazard', 'insulin_surge', 'mthfr_toxic'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Battering adds refined flour and oxidized seed oils; always choose grilled/baked fish or cans in Extra Virgin Olive Oil.',
    rationaleEs: 'El rebozado añade harina refinada y aceite de semillas oxidado; elige siempre plancha/horno o en AOVE.'
  },

  // ===========================================================================
  // 10. PROTEIN+ : 3.2.5 SHELLFISH, MOLLUSCS & CRUSTACEANS (6 Items)
  // ===========================================================================
  {
    id: 'shellfish_oysters_mussels_clams',
    subfamilyCode: '3.2.5',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Shellfish',
    nameEn: 'Mussels, Clams, Cockles & Oysters (Steamed with Lemon)',
    nameEs: 'Mejillones, Almejas, Berberechos y Ostras al Vapor',
    nutrients: ['Highest Natural Zinc & B12', 'Heme Iron', 'Iodine', 'Omega-3'],
    tags: ['remethylation_b12', 'methylation', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Richest natural food source of Vitamin B12 and Zinc—essential cofactors for your MTHFR methylation cycle.',
    rationaleEs: 'La mayor fuente natural de Vitamina B12 y Zinc para activar tu ciclo de metilación (MTHFR).'
  },
  {
    id: 'shellfish_octopus_calamari_grilled',
    subfamilyCode: '3.2.5',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Shellfish',
    nameEn: 'Grilled Octopus, Cuttlefish (Sepia) & Squid (Unbattered)',
    nameEs: 'Pulpo a la Brasa, Sepia y Calamar a la Plancha (Sin Rebozar)',
    nutrients: ['Taurine', 'Vit B12', 'Selenium', 'Ultra-Lean Protein'],
    tags: ['easy_digestion', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High in taurine and clean protein with zero carbs; supports bile acid conjugation and liver health.',
    rationaleEs: 'Ricos en taurina y proteína limpia sin carbohidratos; mejoran la función biliar y hepática.'
  },
  {
    id: 'shellfish_wild_shrimp_prawns',
    subfamilyCode: '3.2.5',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Shellfish',
    nameEn: 'Wild Prawns, Shrimp & Scallops (Sautéed in EVOO & Garlic)',
    nameEs: 'Gambas, Langostinos Salvajes y Vieiras a la Plancha',
    nutrients: ['Astaxanthin', 'Iodine', 'Selenium', 'Vit B12'],
    tags: ['pyy_stimulator', 'antioxidant'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Excellent lean protein 1-2x/week; choose wild-caught without sodium metabisulfite preservatives.',
    rationaleEs: 'Excelente proteína magra 1-2x/sem; elegir captura salvaje sin sulfitos añadidos.'
  },
  {
    id: 'shellfish_fried_calamari_surimi',
    subfamilyCode: '3.2.5',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Shellfish',
    nameEn: 'Battered Fried Calamari & Imitation Crab Sticks (Surimi)',
    nameEs: 'Calamares a la Romana (Fritos) y Palitos de Cangrejo (Surimi)',
    nutrients: ['Modified Starch', 'Sugar', 'Seed Oils', 'Monosodium Glutamate'],
    tags: ['insulin_surge', 'peroxidation_hazard'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Surimi is mostly refined starch and sugar, and fried batter causes an immediate glucose and lipid spike.',
    rationaleEs: 'El surimi es almidón y azúcar, y el rebozado frito dispara la glucosa y la inflamación lipídica.'
  },

  // ===========================================================================
  // 11. LIPID+ : 3.3.1 OILS & CULINARY FATS (7 Items)
  // ===========================================================================
  {
    id: 'lipid_evoo',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Cold-Pressed Extra Virgin Olive Oil (EVOO)',
    nameEs: 'Aceite de Oliva Virgen Extra (AOVE Primera Presión en Frío)',
    nutrients: ['Oleic Acid', 'Oleocanthal', 'Safe Natural Vit E', 'Polyphenols'],
    tags: ['cyp4f2_safe', 'vdr_micellar_carrier', 'cox_inhibition'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Your #1 daily fat (2-3 tbsp/day): provides safe food-matrix Vitamin E (for CYP4F2/ZPR1) and absorbs your Vitamin D3.',
    rationaleEs: 'Tu grasa nº 1 diaria (2-3 cdas/día): aporta Vitamina E natural segura (gen ZPR1) y absorbe tu Vitamina D3.'
  },
  {
    id: 'lipid_avocado_raw',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Fresh Hass Avocado & Cold-Pressed Avocado Oil',
    nameEs: 'Aguacate Hass Fresco y Aceite de Aguacate Virgen',
    nutrients: ['Monounsaturated Fat', 'Potassium', 'Folate (B9)', 'Natural Vit E'],
    tags: ['heart_healthy_mufa', 'satiety_lipid', 'cyp4f2_safe', 'methylation'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Slows stomach emptying to keep you full for hours and provides natural folate + safe Vitamin E.',
    rationaleEs: 'Ralentiza el vaciado gástrico dándote saciedad duradera, con folato y Vitamina E natural.'
  },
  {
    id: 'lipid_ghee_grassfed',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Grass-Fed Clarified Butter (Ghee — 100% Lactose & Casein Free)',
    nameEs: 'Ghee Ecológico de Pasto (Mantequilla Clarificada Sin Lactosa)',
    nutrients: ['Butyric Acid (Butyrate)', 'Vit K2', 'Vit A', 'Zero Lactose'],
    tags: ['mcm6_friendly', 'vdr_micellar_carrier'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'All lactose and milk solids are removed; rich in gut-healing butyrate and heat-stable for pan cooking.',
    rationaleEs: 'Libre 100% de lactosa y caseína; aporta ácido butírico reparador intestinal y resiste el calor al cocinar.'
  },
  {
    id: 'lipid_virgin_coconut_oil',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Extra Virgin Coconut Oil & Pure C8 MCT Oil',
    nameEs: 'Aceite de Coco Virgen Extra y Aceite MCT C8',
    nutrients: ['MCTs (Caprylic & Lauric Acid)', 'Fast Cellular Energy'],
    tags: ['heat_stable_cooking', 'antimicrobial_lauric', 'ketone_precursor'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Use up to 1 tsp for high-heat cooking or morning mental clarity; keep main daily fat as Olive Oil.',
    rationaleEs: 'Usa máx. 1 cucharadita para cocinar a fuego alto o energía mental; tu grasa base debe ser siempre AOVE.'
  },
  {
    id: 'lipid_industrial_seed_oils',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Sunflower, Corn, Soybean, Canola & Rapeseed Oils',
    nameEs: 'Aceites de Girasol, Maíz, Soja y Colza (Canola)',
    nutrients: ['Oxidized Omega-6 Linoleic Acid', 'Aldehydes'],
    tags: ['vascular_endotoxin', 'peroxidation_hazard', 'cellular_aging'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'High inflammatory Omega-6 load that oxidizes cholesterol particles (high risk with your ZPR1/CYP4F2 genes).',
    rationaleEs: 'Exceso de Omega-6 inflamatorio que oxida los lípidos sanguíneos (conflicto directo con ZPR1/CYP4F2).'
  },
  {
    id: 'lipid_margarine_palm_shortening',
    subfamilyCode: '3.3.1',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Oils and fats',
    nameEn: 'Margarine, Vegetable Shortening & Hydrogenated Palm Oil',
    nameEs: 'Margarinas, Grasas Hidrogenadas y Aceite de Palma Refinado',
    nutrients: ['Trans Fats', 'Palmitic Esters'],
    tags: ['peroxidation_hazard', 'pro_inflammatory', 'endothelial_damage'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Strictly exclude: stiffens cell membranes and blocks insulin receptors.',
    rationaleEs: 'Exclusión estricta: endurece las membranas celulares y bloquea los receptores de insulina.'
  },

  // ===========================================================================
  // 12. LIPID+ : 3.3.2 SAUCES, SPICES & CONDIMENTS (8 Items)
  // ===========================================================================
  {
    id: 'condiment_turmeric_ginger',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Turmeric + Black Pepper, Fresh Ginger & Rosemary',
    nameEs: 'Cúrcuma con Pimienta Negra, Jengibre Fresco y Romero',
    nutrients: ['Curcuminoids', 'Gingerols', 'Rosmarinic Acid'],
    tags: ['anti_inflammatory', 'phase2_detox', 'antioxidant'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Powerful anti-inflammatory spices that calm gut mucosa and support liver detoxification.',
    rationaleEs: 'Especias antiinflamatorias que calman la mucosa digestiva y apoyan la limpieza hepática.'
  },
  {
    id: 'condiment_ceylon_cinnamon',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'True Ceylon Cinnamon, Cardamom, Cumin & Zaatar',
    nameEs: 'Canela de Ceilán, Cardamomo, Comino y Zaatar Tradicional',
    nutrients: ['Cinnamaldehyde', 'Carvacrol', 'Digestive Essential Oils'],
    tags: ['insulin_sensitizer', 'anti_bloat'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Ceylon cinnamon mimics insulin at cellular receptors, lowering post-meal blood glucose peaks.',
    rationaleEs: 'La canela de Ceilán mejora la sensibilidad de tus receptores de insulina tras las comidas.'
  },
  {
    id: 'condiment_acv_lemon_dressing',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Raw Unfiltered Apple Cider Vinegar (ACV) & Fresh Herbs (Parsley, Mint, Coriander)',
    nameEs: 'Vinagre de Manzana Sin Filtrar y Hierbas Frescas (Perejil, Menta, Cilantro)',
    nutrients: ['Acetic Acid', 'Natural Folate', 'Apigenin'],
    tags: ['insulin_sensitizer', 'stomach_acid', 'methylation'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: '1 tbsp of Apple Cider Vinegar on your starter salad cuts the glucose spike of the entire meal by up to 30%.',
    rationaleEs: '1 cucharada de vinagre de manzana en tu primera ensalada reduce hasta un 30% el pico de azúcar.'
  },
  {
    id: 'condiment_garlic_onion',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Fresh Garlic, Shallots & Chives',
    nameEs: 'Ajo Fresco, Chalota y Cebollino',
    nutrients: ['Allicin', 'Organic Sulfur', 'Inulin Prebiotic'],
    tags: ['phase2_detox', 'prebiotic', 'vascular'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Organic sulfur compounds support glutathione production and vascular health.',
    rationaleEs: 'Sus compuestos de azufre apoyan la síntesis de glutatión y la salud vascular.'
  },
  {
    id: 'condiment_mustard_tamari_pesto',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Dijon Mustard, Gluten-Free Tamari & Homemade EVOO Pesto',
    nameEs: 'Mostaza de Dijon, Tamari Sin Gluten y Pesto Casero con AOVE',
    nutrients: ['Isothiocyanates', 'Polyphenols', 'Zero Sugar'],
    tags: ['insulin_friendly'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Flavorful zero-sugar condiments; use in moderation to watch sodium intake.',
    rationaleEs: 'Condimentos sabrosos sin azúcar; usar en cantidad moderada por su contenido en sal.'
  },
  {
    id: 'condiment_commercial_mayo_ketchup_bbq',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Commercial Mayonnaise (Seed Oil Base), Ketchup, BBQ & Sweet Teriyaki Sauces',
    nameEs: 'Mayonesa Industrial (Aceite de Soja/Girasol), Kétchup, Salsa Barbacoa y Teriyaki',
    nutrients: ['70% Refined Seed Oil', 'High-Fructose Syrup'],
    tags: ['peroxidation_hazard', 'sugar_spike', 'pro_inflammatory'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Commercial sauces hide large amounts of soybean/sunflower oil and liquid sugar.',
    rationaleEs: 'Las salsas comerciales esconden grandes cantidades de aceite de girasol/soja y jarabe de azúcar.'
  },

  // ===========================================================================
  // 13. EXTRAS : 3.4.1 SUGARS, HONEY & SWEETENERS (6 Items)
  // ===========================================================================
  {
    id: 'sweet_pure_stevia_monkfruit',
    subfamilyCode: '3.4.1',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Sugars and sweeteners',
    nameEn: '100% Pure Stevia Leaf Drops & Pure Monk Fruit Extract',
    nameEs: 'Estevia 100% Pura en Gotas y Extracto de Fruta del Monje (Monk Fruit)',
    nutrients: ['Steviosides', 'Mogrosides', 'Zero Glycemic Index (GI = 0)'],
    tags: ['insulin_friendly', 'low_sugar'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Zero effect on blood glucose or insulin, and does not harm gut bacteria like artificial sweeteners.',
    rationaleEs: 'Cero impacto en glucosa e insulina y no daña tu microbiota como los edulcorantes sintéticos.'
  },
  {
    id: 'sweet_raw_sidr_manuka_honey',
    subfamilyCode: '3.4.1',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Sugars and sweeteners',
    nameEn: 'Raw Yemeni Sidr or Manuka Honey (Max 1/2 tsp pre-workout)',
    nameEs: 'Miel Cruda de Sidr o Manuka (Máx. 1/2 cucharadita ocasional)',
    nutrients: ['Methylglyoxal', 'Enzymes', 'Simple Sugars'],
    tags: ['sugar_spike'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Medicinal antimicrobial properties, but still raises insulin rapidly—limit to 1/2 tsp only before active exercise.',
    rationaleEs: 'Tiene propiedades antimicrobianas, pero sube rápido la insulina; limitar a 1/2 cdta antes de entrenar.'
  },
  {
    id: 'sweet_white_brown_sugar_agave',
    subfamilyCode: '3.4.1',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Sugars and sweeteners',
    nameEn: 'White Sugar, Brown Sugar, Cane Syrup, Agave & Maple Syrup',
    nameEs: 'Azúcar Blanco, Azúcar Moreno, Panelas, Sirope de Agave y Arce',
    nutrients: ['Sucrose', 'High Free Fructose'],
    tags: ['hyperglycemia', 'insulin_surge', 'sugar_spike', 'liver_fat'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Directly triggers insulin resistance (IRS1/TCF7L2) and overrides hypothalamic satiety (MC4R).',
    rationaleEs: 'Dispara directamente tu resistencia a la insulina (IRS1) y anula tu señal de saciedad (MC4R).'
  },
  {
    id: 'sweet_artificial_sucralose_aspartame',
    subfamilyCode: '3.4.1',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Sugars and sweeteners',
    nameEn: 'Artificial Sweeteners: Sucralose, Aspartame, Acesulfame-K & Saccharin',
    nameEs: 'Edulcorantes Artificiales: Sucralosa, Aspartamo, Acesulfamo-K y Sacarina',
    nutrients: ['Chlorinated Sucrose', 'Synthetic Dipeptides'],
    tags: ['gut_dysbiosis', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Disrupts protective gut flora and triggers cephalic-phase insulin release even with zero calories.',
    rationaleEs: 'Daña las bacterias buenas de tu intestino y engaña al páncreas liberando insulina.'
  },

  // ===========================================================================
  // 14. EXTRAS : 3.4.2 NUTS & SEEDS (6 Items)
  // ===========================================================================
  {
    id: 'seed_walnuts_almonds',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw Walnuts, Raw Mediterranean Almonds & Brazil Nuts (2/day)',
    nameEs: 'Nueces Crudas, Almendras Crudas y Nueces de Brasil (2 al día)',
    nutrients: ['Safe Dietary Vit E', 'ALA Omega-3', 'Selenium', 'Magnesium'],
    tags: ['cyp4f2_vit_e', 'neuroprotection', 'satiety_crunch'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Best safe food source of natural Vitamin E for your ZPR1/CYP4F2 genes plus crunchy afternoon satiety.',
    rationaleEs: 'Tu fuente ideal y segura de Vitamina E natural (genes ZPR1/CYP4F2) y saciedad de media tarde.'
  },
  {
    id: 'seed_pumpkin',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw Pumpkin Seeds (Pepitas) & Sunflower Seeds (Raw)',
    nameEs: 'Semillas de Calabaza Crudas y Pipas de Girasol Crudas',
    nutrients: ['High Magnesium', 'Zinc', 'Natural Vit E', 'Tryptophan'],
    tags: ['magnesium_rest', 'zinc_immunity', 'cyp4f2_vit_e'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Loaded with magnesium and zinc to support afternoon focus and nighttime sleep.',
    rationaleEs: 'Riquísimas en magnesio y zinc para evitar el cansancio de tarde y mejorar el sueño.'
  },
  {
    id: 'seed_chia_flax',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Black Chia Seeds, Ground Flaxseeds & Hemp Hearts',
    nameEs: 'Semillas de Chía, Lino Molido y Semillas de Cáñamo',
    nutrients: ['Soluble Mucilage Fiber', 'ALA Omega-3', 'Magnesium'],
    tags: ['bowel_motility', 'estrogen_detox', 'hydrophilic_gel', 'satiety_volume'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Forms a gentle fiber gel in the stomach that slows sugar absorption and feeds gut flora.',
    rationaleEs: 'Forma un gel de fibra que frena la absorción de azúcares y regula el tránsito intestinal.'
  },
  {
    id: 'seed_raw_tahini',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw 100% Sesame Tahini, Macadamias & Hazelnuts',
    nameEs: 'Tahini Crudo 100% Sésamo, Nueces de Macadamia y Avellanas',
    nutrients: ['Dairy-Free Calcium', 'Sesamin', 'Monounsaturated Fats'],
    tags: ['sesamin_antioxidant', 'dairy_free_calcium', 'satiety_lipid'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Tahini is packed with bioavailable calcium without lactose (perfect for your MCM6 gene).',
    rationaleEs: 'El tahini aporta muchísimo calcio biodisponible sin nada de lactosa (ideal gen MCM6).'
  },
  {
    id: 'seed_pistachios_cashews',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Raw Pistachios & Cashews (Max 1 small handful / 25g)',
    nameEs: 'Pistachos Naturales y Anacardos Crudos (Máx. 1 puñado pequeño / 25g)',
    nutrients: ['Melatonin (Pistachios)', 'Magnesium', 'Moderate Starch (Cashews)'],
    tags: ['moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Pistachios are rich in natural melatonin; keep cashews to small portions as they have more starch.',
    rationaleEs: 'Los pistachos aportan melatonina natural; modera los anacardos por tener más almidón.'
  },
  {
    id: 'seed_fried_salted_honey_nuts',
    subfamilyCode: '3.4.2',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Nuts and seeds',
    nameEn: 'Nuts Fried in Seed Oils, Honey-Roasted Nuts & Commercial Peanut Butter',
    nameEs: 'Frutos Secos Fritos en Aceite Vegetal, Garrapiñados o Crema de Cacahuete con Azúcar',
    nutrients: ['Oxidized Seed Oils', 'Added Sugar', 'Aflatoxins'],
    tags: ['peroxidation_hazard', 'sugar_spike'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Commercial roasted nuts are fried in sunflower/canola oil; always buy raw or dry-roasted nuts.',
    rationaleEs: 'Los frutos secos fritos comerciales llevan aceite de girasol oxidado; cómpralos siempre crudos o tostados sin aceite.'
  },

  // ===========================================================================
  // 15. EXTRAS : 3.4.3 CACAO, DARK CHOCOLATE & SNACKS (5 Items)
  // ===========================================================================
  {
    id: 'snack_dark_chocolate_85',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: '85%–100% Pure Dark Chocolate (1-2 squares after lunch) & Raw Cacao Powder',
    nameEs: 'Chocolate Negro 85%–100% (1-2 onzas tras comer) y Cacao Puro en Polvo',
    nutrients: ['Flavanols', 'Magnesium', 'Theobromine', 'Very Low Sugar'],
    tags: ['endothelium', 'magnesium_rest', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Satisfies sweet cravings with <2g sugar while boosting nitric oxide and magnesium. Take before 2:00 PM (contains mild theobromine).',
    rationaleEs: 'Calma el deseo de dulce con <2g de azúcar y aporta magnesio. Tomar antes de las 14:00h.'
  },
  {
    id: 'snack_olives_pickles',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: 'Kalamata & Green Olives in Brine, Capers & Fermented Pickles',
    nameEs: 'Aceitunas Verdes y Kalamata en Salmuera, Alcaparras y Encurtidos',
    nutrients: ['Hydroxytyrosol', 'Oleic Acid', 'Live Ferments', 'Zero Sugar'],
    tags: ['satiety_lipid', 'cyp4f2_safe', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Perfect savory evening snack: zero sugar, rich in olive polyphenols, and stops fridge raiding (MC4R).',
    rationaleEs: 'Snack salado perfecto: cero azúcar, rico en polifenoles del olivo y frena el hambre de tarde.'
  },
  {
    id: 'snack_seaweed_nori_kale_chips',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: 'Roasted Nori Seaweed Sheets (in EVOO) & Dehydrated Veggie Crisps',
    nameEs: 'Láminas de Alga Nori Tostadas en AOVE y Chips de Kale Deshidratado',
    nutrients: ['Iodine', 'Folate', 'Minerals', 'Crunchy Texture'],
    tags: ['satiety_volume', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Satisfies the desire for something crunchy with zero starch or seed oils.',
    rationaleEs: 'Satisface la necesidad de algo crujiente sin almidones ni aceites industriales.'
  },
  {
    id: 'snack_popcorn_rice_cakes',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: 'Puffed Rice Cakes, Corn Cakes & Cinema Popcorn',
    nameEs: 'Tortitas de Arroz/Maíz Inflado y Palomitas Comerciales',
    nutrients: ['High Glycemic Index (GI = 85)', 'Seed Oils'],
    tags: ['insulin_surge', 'sugar_spike'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Puffed rice/corn cakes look "diet" but have a higher glycemic index than white bread, spiking insulin and hunger 1 hour later.',
    rationaleEs: 'Las tortitas de arroz/maíz parecen "light" pero suben el azúcar más rápido que el pan blanco, dándote hambre a la hora.'
  },
  {
    id: 'snack_milk_choc_pastries_cookies',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: 'Milk Chocolate, Cookies, Croissants, Baklava & Protein Bars with Sucralose',
    nameEs: 'Chocolate con Leche, Galletas, Croissants, Baklava y Barritas con Sucralosa',
    nutrients: ['Sugar', 'Lactose', 'Fortified Flour', 'Trans/Seed Fats'],
    tags: ['hyperglycemia', 'mthfr_toxic', 'mcm6_conflict', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Hits all 4 genetic weak spots at once: sugar (IRS1), lactose (MCM6), fortified flour (MTHFR), and cravings (MC4R).',
    rationaleEs: 'Choca con tus 4 ejes genéticos a la vez: azúcar (IRS1), lactosa (MCM6), harina (MTHFR) y apetito (MC4R).'
  },

  // ===========================================================================
  // 16. EXTRAS : 3.4.4 NON-ALCOHOLIC BEVERAGES (7 Items)
  // ===========================================================================
  {
    id: 'bev_celtic_mineral_water',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Mineral Water, Sparkling Water with Lemon/Mint & Electrolytes',
    nameEs: 'Agua Mineral, Agua con Gas con Limón/Menta y Electrolitos Sin Azúcar',
    nutrients: ['Magnesium', 'Bicarbonates', 'Trace Minerals'],
    tags: ['cellular_hydration', 'adrenal_support', 'morning_reset'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Drink 300 mL upon waking and 2.5L across the day; mild dehydration is often mistaken by the brain for hunger.',
    rationaleEs: 'Bebe 300 mL al despertar y 2.5L al día; el cerebro suele confundir la sed leve con hambre.'
  },
  {
    id: 'bev_ceremonial_matcha',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Japanese Matcha & Sencha Green Tea ( strictly before 12:00 PM)',
    nameEs: 'Té Verde Matcha o Sencha Japonés (siempre antes de las 12:00h)',
    nutrients: ['L-Theanine', 'EGCG Antioxidants', 'Gentle Focus'],
    tags: ['alpha_brain_waves', 'smooth_focus', 'metabolic_ampk'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'L-Theanine gives calm mental focus without the jitteriness of strong coffee (ideal for your ADORA2A gene).',
    rationaleEs: 'La L-teanina te da concentración tranquila sin el nerviosismo del café fuerte (gen ADORA2A).'
  },
  {
    id: 'bev_chamomile_flowers',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Chamomile, Lemon Balm (Melisa), Passionflower & Peppermint Infusions',
    nameEs: 'Infusiones de Manzanilla, Melisa, Pasiflora y Menta Poleo (Sin Cafeína)',
    nutrients: ['Apigenin', 'Rosmarinic Acid', 'Menthol', '0% Caffeine'],
    tags: ['gaba_agonist', 'parasympathetic_rest', 'nocturnal_repair', 'adora2a_safe'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Take warm 45 min before sleep alongside your nighttime Magnesium to unlock deep REM recovery.',
    rationaleEs: 'Tómala caliente 45 min antes de dormir junto con tu Magnesio nocturno para un sueño profundo.'
  },
  {
    id: 'bev_rooibos_caffeine_free',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Red Rooibos, Hibiscus (Karkadeh) & Ginger-Turmeric Herbal Teas',
    nameEs: 'Té Rooibos Rojo, Hibisco (Karkadeh) e Infusión de Jengibre y Limón',
    nutrients: ['Aspalathin', 'Anthocyanins', 'Zero Caffeine'],
    tags: ['evening_safe', 'insulin_sensitizer', 'adora2a_safe'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: '100% caffeine-free antioxidant drinks you can enjoy hot or iced all afternoon and evening.',
    rationaleEs: 'Bebidas antioxidantes 100% sin cafeína perfectas para tomar frías o calientes toda la tarde.'
  },
  {
    id: 'bev_morning_black_coffee',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Morning Organic Espresso / Arabic Coffee (Strictly 1 cup before 11:00 AM)',
    nameEs: 'Café Espresso o Café Árabe Matutino (Máx. 1 taza antes de las 11:00 AM)',
    nutrients: ['Chlorogenic Acids', 'Caffeine'],
    tags: ['moderate_carb'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Enjoy 1 morning coffee after breakfast (never on an empty stomach, and strictly zero caffeine after 11:00 AM for your ADORA2A sleep gene).',
    rationaleEs: 'Disfruta de 1 café tras desayunar (nunca en ayunas y prohibido después de las 11:00 AM por tu gen del sueño ADORA2A).'
  },
  {
    id: 'bev_afternoon_espresso_energy_drink',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Afternoon Coffee (after 11 AM), Black Tea at Night & Energy Drinks',
    nameEs: 'Café después de las 11:00 AM, Té Negro de Tarde y Bebidas Energéticas',
    nutrients: ['Persistent Caffeine', 'Taurine/Sugar'],
    tags: ['adora2a_insomnia', 'adenosine_block', 'cortisol_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Your ADORA2A gene keeps caffeine active on brain receptors for 8–10 hours, blocking deep restorative sleep even if you fall asleep.',
    rationaleEs: 'Por tu gen ADORA2A la cafeína sigue bloqueando tu sueño profundo durante 8–10 horas aunque logres dormirte.'
  },
  {
    id: 'bev_sodas_diet_colas_oat_milk',
    subfamilyCode: '3.4.4',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Non-alcoholic beverages',
    nameEn: 'Soft Drinks, Diet Colas (Aspartame) & Commercial Oat Milk Lattes',
    nameEs: 'Refrescos Azucarados, Colas Zero/Light y Cafés con Leche de Avena',
    nutrients: ['Liquid Sugar / Maltose', 'Phosphoric Acid', 'Artificial Sweeteners'],
    tags: ['hyperglycemia', 'insulin_surge', 'gut_dysbiosis'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Oat milk contains enzymatic maltose that spikes blood sugar like soda; diet colas damage gut flora.',
    rationaleEs: 'La leche de avena contiene maltosa que sube el azúcar como un refresco, y las colas light dañan tu microbiota.'
  },

  // ===========================================================================
  // 17. EXTRAS : 3.4.5 ALCOHOLIC BEVERAGES (3 Items)
  // ===========================================================================
  {
    id: 'bev_dry_red_wine_occasional',
    subfamilyCode: '3.4.5',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Alcoholic beverages',
    nameEn: 'Dry Red Wine (Pinot Noir / Rioja — Max 1 glass on special occasions with food)',
    nameEs: 'Vino Tinto Seco (Máx. 1 copa puntual en eventos siempre con comida)',
    nutrients: ['Resveratrol', 'Ethanol (Depletes B9/B12)'],
    tags: ['mthfr_paralysis'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Alcohol blocks folate (MTHFR) absorption and fragments REM sleep; reserve for rare social occasions with plenty of water.',
    rationaleEs: 'El alcohol frena el folato (MTHFR) y reduce el sueño REM; reservar solo para ocasiones muy puntuales con agua.'
  },
  {
    id: 'bev_beer_cider',
    subfamilyCode: '3.4.5',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Alcoholic beverages',
    nameEn: 'Beer (Alcoholic & High-Maltose 0.0 Beer) & Sweet Cider',
    nameEs: 'Cerveza (Con Alcohol y 0,0 Tostada con Maltosa) y Sidra Dulce',
    nutrients: ['Maltose (GI = 105)', 'Gluten', 'Ethanol', 'Purines'],
    tags: ['hyperglycemia', 'insulin_surge', 'liver_fat', 'mthfr_paralysis'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Beer maltose has a higher glycemic index than pure table sugar (GI 105), driving belly fat and liver stagnation.',
    rationaleEs: 'La maltosa de la cerveza sube la glucosa más rápido que el azúcar puro (IG 105), acumulando grasa abdominal.'
  },
  {
    id: 'bev_commercial_spirits_beer',
    subfamilyCode: '3.4.5',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Alcoholic beverages',
    nameEn: 'Distilled Spirits (Vodka, Gin, Whisky, Rum) & Sweet Cocktails',
    nameEs: 'Licores Destilados, Copas y Cócteles Azucarados',
    nutrients: ['High Ethanol', 'Acetaldehyde', 'Syrups'],
    tags: ['liver_fat', 'glutathione_depletion', 'mthfr_paralysis', 'adora2a_insomnia'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Depletes your liver glutathione and active folate (MTHFR) stores for 48 hours while spiking nighttime heart rate.',
    rationaleEs: 'Vacía tus reservas hepáticas de glutatión y folato activo (MTHFR) durante 48 horas y destruye el descanso.'
  },
  // Additional Fagron NutriGen™ Staple Foods to reach 116 Complete Items
  {
    id: 'veg_artichoke',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Artichoke Hearts (Steamed or Grilled)',
    nameEs: 'Alcachofas (Al Vapor o a la Plancha)',
    nutrients: ['Cynarin', 'Inulin Prebiotic Fiber', 'Natural Folate (B9)', 'Potassium'],
    tags: ['methylation', 'prebiotic', 'insulin_friendly', 'pyy_stimulator'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Supports liver bile flow and feeds beneficial gut bacteria (inulin) while delivering natural folate.',
    rationaleEs: 'Apoya la función hepática y alimenta tu microbiota intestinal con fibra prebiótica e inulina.'
  },
  {
    id: 'veg_kale',
    subfamilyCode: '3.1.1',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Vegetables',
    nameEn: 'Curly Kale & Swiss Chard',
    nameEs: 'Kale (Col Rizada) y Acelgas',
    nutrients: ['Lutein', 'Vitamin K1', 'Magnesium', 'Natural Folate (B9)'],
    tags: ['methylation', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Dense source of magnesium and natural folate; massage with olive oil and lemon for easy digestion.',
    rationaleEs: 'Fuente concentrada de magnesio y folato natural; aliñar con aceite de oliva y limón.'
  },
  {
    id: 'frt_kiwi',
    subfamilyCode: '3.1.2',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Fruits',
    nameEn: 'Green or Gold Kiwi (1 whole fruit with skin/fiber)',
    nameEs: 'Kiwi Verde o Amarillo (1 pieza entera)',
    nutrients: ['Actinidin Enzyme', 'Vitamin C', 'Soluble Fiber', 'Serotonin Precursors'],
    tags: ['prebiotic', 'insulin_friendly', 'gaba_calm'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Natural actinidin enzyme aids protein digestion and supports bowel regularity without spiking glucose.',
    rationaleEs: 'Su enzima natural actinidina mejora la digestión de proteínas y el tránsito intestinal sin picos de azúcar.'
  },
  {
    id: 'cer_couscous_white_pasta',
    subfamilyCode: '3.1.3',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Cereals',
    nameEn: 'Refined Couscous & White Wheat Pasta',
    nameEs: 'Cuscús Refinado y Pasta Blanca de Trigo',
    nutrients: ['Rapid Refined Starch', 'Gluten'],
    tags: ['hyperglycemia', 'insulin_surge'],
    defaultLevel: 'RED_RESTRICT',
    rationaleEn: 'Finely milled wheat starch absorbs rapidly, triggering an immediate blood sugar and insulin spike (IRS1).',
    rationaleEs: 'Harina refinada de absorción rápida que dispara la glucosa e insulina después de comer (IRS1).'
  },
  {
    id: 'leg_fava_beans',
    subfamilyCode: '3.1.4',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Legumes',
    nameEn: 'Broad / Fava Beans (Foul Medames — Moderate Lunch Portion)',
    nameEs: 'Habas Cocidas (Foul Medames — Ración Moderada al Mediodía)',
    nutrients: ['L-DOPA Precursor', 'Plant Protein', 'Folate (B9)', 'Fiber'],
    tags: ['methylation', 'pyy_stimulator', 'insulin_friendly'],
    defaultLevel: 'YELLOW_CONTROLLED',
    rationaleEn: 'Traditional Middle Eastern staple rich in folate and satiety fiber; dress generously with EVOO, lemon, and cumin.',
    rationaleEs: 'Ricas en folato y fibra saciante; preparar con abundante AOVE, limón y comino en comida principal.'
  },
  {
    id: 'tub_cassava_yuca',
    subfamilyCode: '3.1.5',
    categoryGroup: 'CARBO+',
    categoryFamily: 'Tubers',
    nameEn: 'Boiled Cassava / Yuca (Small Side Portion Only)',
    nameEs: 'Yuca Cocida (Solo Guarnición Pequeña)',
    nutrients: ['Dense Starch', 'Vitamin C', 'Potassium'],
    tags: ['insulin_surge'],
    defaultLevel: 'ORANGE_REDUCE',
    rationaleEn: 'Higher starch density than sweet potato; limit to occasional small portions after vegetables and protein.',
    rationaleEs: 'Mayor densidad de almidón que el boniato; limitar a pequeñas guarniciones ocasionales tras verdura y proteína.'
  },
  {
    id: 'egg_quail',
    subfamilyCode: '3.2.2',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Eggs',
    nameEn: 'Quail Eggs (Pasture-Raised)',
    nameEs: 'Huevos de Codorniz Camperos',
    nutrients: ['Choline', 'Vitamin B12', 'Bioavailable Iron', 'Selenium'],
    tags: ['methylation_fuel', 'pyy_surge', 'satiety_gold_standard'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Rich in choline and B12 to support your MTHFR methylation pathway and morning fullness.',
    rationaleEs: 'Ricos en colina y vitamina B12 para apoyar tu metilación (MTHFR) y saciedad matutina.'
  },
  {
    id: 'fsh_hamour_grouper',
    subfamilyCode: '3.2.4',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Fish',
    nameEn: 'Wild Arabian Hamour / Grouper & Sea Bream (Baked/Grilled)',
    nameEs: 'Mero Salvaje (Hamour) y Dorada al Horno o Brasa',
    nutrients: ['Lean Marine Protein', 'Selenium', 'Iodine', 'Phosphorus'],
    tags: ['pyy_surge', 'satiety_gold_standard', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Premier local Gulf white fish providing clean, high-satiety protein for lunch or light early dinner.',
    rationaleEs: 'Pescado blanco salvaje ideal para alcanzar tu objetivo de proteína saciante en comida o cena ligera.'
  },
  {
    id: 'shf_clams_cockles',
    subfamilyCode: '3.2.5',
    categoryGroup: 'PROTEIN+',
    categoryFamily: 'Shellfish',
    nameEn: 'Steamed Clams & Cockles with Garlic & Parsley',
    nameEs: 'Almejas y Berberechos al Vapor con Ajo y Perejil',
    nutrients: ['Highest Natural Vitamin B12', 'Heme Iron', 'Zinc', 'Selenium'],
    tags: ['remethylation_b12', 'methylation', 'pyy_surge', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Top natural source of active Vitamin B12 and iron to power cellular energy and homocysteine recycling.',
    rationaleEs: 'La mayor fuente natural de vitamina B12 activa y hierro para tu energía celular y reciclaje de homocisteína.'
  },
  {
    id: 'spc_rosemary_oregano_zaatar',
    subfamilyCode: '3.3.2',
    categoryGroup: 'LIPID+',
    categoryFamily: 'Sauces and spices',
    nameEn: 'Fresh Rosemary, Oregano, Sumac & Pure Za\'atar (Salt-Free)',
    nameEs: 'Romero, Orégano, Zumaque y Za\'atar Puro',
    nutrients: ['Rosmarinic Acid', 'Carvacrol', 'Polyphenols'],
    tags: ['endothelium', 'cyp4f2_safe', 'insulin_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Protects cooking oils and meats from heat oxidation while supporting healthy gut flora.',
    rationaleEs: 'Protege los aceites y carnes de la oxidación al cocinar y favorece el equilibrio digestivo.'
  },
  {
    id: 'swt_monk_fruit_erythritol',
    subfamilyCode: '3.4.1',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Sugars and sweeteners',
    nameEn: 'Pure Monk Fruit Extract (Luo Han Guo)',
    nameEs: 'Extracto Puro de Fruta del Monje (Monk Fruit)',
    nutrients: ['Mogrosides (Zero Glycemic Impact)'],
    tags: ['insulin_friendly', 'mcm6_friendly'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'Natural zero-calorie sweetener that does not spike blood sugar, insulin (IRS1), or hunger signals.',
    rationaleEs: 'Endulzante natural sin calorías que no eleva la glucosa ni la insulina (IRS1) ni despierta el apetito.'
  },
  {
    id: 'snk_lupini_beans',
    subfamilyCode: '3.4.3',
    categoryGroup: 'EXTRAS',
    categoryFamily: 'Cacao and snacks',
    nameEn: 'Lupini Beans / Altramuces in Brine (Savory Snack)',
    nameEs: 'Altramuces al Natural (Snack Salado Rico en Proteína)',
    nutrients: ['Plant Protein (36%)', 'Prebiotic Fiber', 'Zero Starch', 'Magnesium'],
    tags: ['pyy_stimulator', 'insulin_friendly', 'prebiotic'],
    defaultLevel: 'GREEN_ADJUSTING',
    rationaleEn: 'High-protein, ultra-low-glycemic Mediterranean snack that satisfies afternoon savory cravings safely.',
    rationaleEs: 'Snack mediterráneo muy rico en proteína y fibra que calma el hambre de media tarde sin subir el azúcar.'
  }
];

/**
 * Evaluates any food from the master catalog against an individual patient's
 * genetic profile (MTHFR, MC4R, FTO, IRS1, TCF7L2, CYP4F2, MCM6, VDR, ADORA2A).
 * Returns the adjusted traffic light classification, genetic rationale, and clinical tag.
 */
export function evaluateFoodForGeneticProfile(foodItem, snpMap = {}) {
  const mthfrRisk = snpMap.mthfrRisk || 'HIGH';
  const mcm6LactoseIntolerant = snpMap.mcm6Intolerant ?? true;
  const mc4rLowSatiety = snpMap.mc4rLowSatiety ?? true;
  const irs1InsulinResistant = snpMap.irs1Resistant ?? true;
  const cyp4f2VitERisk = snpMap.cyp4f2Risk ?? true;
  const adora2aCaffeineSensitive = snpMap.caffeineSensitive ?? true;

  let finalLevel = foodItem.defaultLevel;
  const geneticDrivers = [];

  // Rule 1: MCM6 Adult Hypolactasia (Dairy & Lactose)
  if (mcm6LactoseIntolerant) {
    if (foodItem.categoryFamily === 'Milk and derivatives' || foodItem.tags.includes('mcm6_conflict') || foodItem.tags.includes('mcm6_friendly')) {
      if (foodItem.tags.includes('mcm6_conflict')) {
        finalLevel = 'RED_RESTRICT';
        geneticDrivers.push('Lactose Sensitivity (MCM6): Causes bloating, gas, and gut inflammation.');
      } else if (foodItem.tags.includes('mcm6_friendly')) {
        finalLevel = 'GREEN_ADJUSTING';
        geneticDrivers.push('Lactose-Free / A2 Safe (MCM6): Easy to digest without bloating.');
      }
    }
  }

  // Rule 2: MTHFR C677T & Active Folate / Methylation
  if (mthfrRisk === 'HIGH') {
    if (foodItem.tags.includes('methylation') || foodItem.tags.includes('methylation_fuel') || foodItem.tags.includes('remethylation_b12') || foodItem.tags.includes('liver_methylation')) {
      if (finalLevel !== 'YELLOW_CONTROLLED' && finalLevel !== 'ORANGE_REDUCE') {
        finalLevel = 'GREEN_ADJUSTING';
      }
      geneticDrivers.push('Active Folate & Methylation Ally (MTHFR): Natural B9/B12/Choline fuel.');
    }
    if (foodItem.tags.includes('mthfr_toxic') || foodItem.tags.includes('mthfr_paralysis')) {
      if (foodItem.defaultLevel === 'RED_RESTRICT') {
        finalLevel = 'RED_RESTRICT';
      }
      geneticDrivers.push('Folate Blocker (MTHFR): Blocks natural folate metabolism.');
    }
  }

  // Rule 3: MC4R / FTO Fullness & Satiety Signaling
  if (mc4rLowSatiety) {
    if (foodItem.tags.includes('pyy_surge') || foodItem.tags.includes('satiety_gold_standard') || foodItem.tags.includes('pyy_stimulator')) {
      if (finalLevel === 'GREEN_ADJUSTING') {
        geneticDrivers.push('High Fullness Power (MC4R): Activates natural PYY/GLP-1 satiety signals.');
      }
    }
    if (foodItem.tags.includes('sugar_spike') || foodItem.tags.includes('hyperglycemia')) {
      if (foodItem.defaultLevel === 'RED_RESTRICT') {
        finalLevel = 'RED_RESTRICT';
      }
      geneticDrivers.push('Triggers Cravings (MC4R): Fast sugar causes rebound hunger 90 min later.');
    }
  }

  // Rule 4: IRS1 / TCF7L2 Sugar & Carb Sensitivity
  if (irs1InsulinResistant) {
    if (foodItem.tags.includes('insulin_friendly') || foodItem.tags.includes('insulin_sensitizer')) {
      if (finalLevel === 'GREEN_ADJUSTING') {
        geneticDrivers.push('Steady Blood Sugar (IRS1): Keeps energy stable without afternoon crashes.');
      }
    }
    if (foodItem.tags.includes('insulin_surge') || foodItem.tags.includes('pro_inflammatory')) {
      if (foodItem.defaultLevel === 'RED_RESTRICT') {
        finalLevel = 'RED_RESTRICT';
      }
      geneticDrivers.push('Insulin Spike Alert (IRS1): Rapid starch/sugar promotes afternoon fatigue.');
    }
  }

  // Rule 5: CYP4F2 / ZPR1 Natural Vitamin E & Lipid Safety
  if (cyp4f2VitERisk) {
    if (foodItem.tags.includes('cyp4f2_vit_e') || foodItem.tags.includes('cyp4f2_safe')) {
      geneticDrivers.push('Safe Natural Vitamin E (ZPR1/CYP4F2): Whole-food antioxidant protection.');
    }
    if (foodItem.tags.includes('peroxidation_hazard')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('Oxidized Lipid Hazard (ZPR1): Seed oils inflame blood vessels.');
    }
  }

  // Rule 6: ADORA2A Sleep & Caffeine Cutoff
  if (adora2aCaffeineSensitive) {
    if (foodItem.tags.includes('adora2a_insomnia')) {
      finalLevel = 'RED_RESTRICT';
      geneticDrivers.push('Sleep Disruptor (ADORA2A): Blocks deep REM sleep when taken after 11 AM.');
    }
    if (foodItem.tags.includes('adora2a_safe') || foodItem.tags.includes('gaba_calm')) {
      geneticDrivers.push('Deep Sleep Friendly (ADORA2A): Calms the nervous system naturally.');
    }
  }

  const levelMeta = FOOD_TRAFFIC_LEVELS[finalLevel] || FOOD_TRAFFIC_LEVELS.YELLOW_CONTROLLED;
  const trafficColor = finalLevel === 'GREEN_ADJUSTING' ? 'green' : finalLevel === 'RED_RESTRICT' ? 'red' : 'amber';

  return {
    ...foodItem,
    fagronCode: foodItem.subfamilyCode,
    trafficLevel: finalLevel,
    trafficColor,
    levelMeta,
    geneticDrivers
  };
}

/**
 * Groups the entire evaluated Fagron food catalog into the 17 official Fagron NutriGen™
 * sub-families, with clean Green (Eat Freely), Yellow/Orange (Moderate/Rule), and Red (Avoid)
 * lists for each of the 17 sub-families.
 */
export function getFagron17SubfamilyMatrix(snpMap = {}) {
  const evaluated = MASTER_FOOD_CATALOG.map(f => evaluateFoodForGeneticProfile(f, snpMap));

  return FAGRON_17_SUBFAMILIES.map(sub => {
    const familyFoods = evaluated.filter(f => f.subfamilyCode === sub.code || f.categoryFamily === sub.family);
    const green = familyFoods.filter(f => f.trafficLevel === 'GREEN_ADJUSTING');
    const yellow = familyFoods.filter(f => f.trafficLevel === 'YELLOW_CONTROLLED' || f.trafficLevel === 'ORANGE_REDUCE');
    const red = familyFoods.filter(f => f.trafficLevel === 'RED_RESTRICT');

    return {
      ...sub,
      macroGroup: sub.group,
      familyEn: sub.labelEn.replace(/^\d+\.\d+\.\d+\s*/, ''),
      familyEs: sub.labelEs.replace(/^\d+\.\d+\.\d+\s*/, ''),
      totalCount: familyFoods.length,
      greenItems: green,
      yellowItems: yellow,
      redItems: red,
      greenFoods: green,
      amberFoods: yellow,
      redFoods: red,
      greenSummaryEn: green.map(f => f.nameEn.split(' (')[0]).join(', ') || '—',
      yellowSummaryEn: yellow.map(f => f.nameEn.split(' (')[0]).join(', ') || '—',
      redSummaryEn: red.map(f => f.nameEn.split(' (')[0]).join(', ') || '—',
      greenSummaryEs: green.map(f => f.nameEs.split(' (')[0]).join(', ') || '—',
      yellowSummaryEs: yellow.map(f => f.nameEs.split(' (')[0]).join(', ') || '—',
      redSummaryEs: red.map(f => f.nameEs.split(' (')[0]).join(', ') || '—'
    };
  });
}

/**
 * Returns filtered supermarket grocery checklist items grouped into the 4 Official
 * Fagron Macro-Groups (CARBO+, PROTEIN+, LIPID+, EXTRAS), extracting GREEN and YELLOW foods.
 */
export function getPersonalizedGroceryAisles(snpMap = {}) {
  const evaluatedCatalog = MASTER_FOOD_CATALOG.map(f => evaluateFoodForGeneticProfile(f, snpMap));
  const allowedFoods = evaluatedCatalog.filter(
    f => f.trafficLevel === 'GREEN_ADJUSTING' || f.trafficLevel === 'YELLOW_CONTROLLED'
  );

  return [
    {
      id: 'aisle_produce',
      category: '1. CARBO+ · Veggies, Berries, Quinoa & Lentils',
      categoryEs: '1. CARBO+ · Verduras, Frutos Rojos, Quinoa y Lentejas',
      icon: '🥬',
      subtitle: 'Sub-families 3.1.1 to 3.1.5 · Folate & Steady Glucose',
      items: allowedFoods
        .filter(f => f.categoryGroup === 'CARBO+')
        .map(f => `${f.trafficLevel === 'GREEN_ADJUSTING' ? '[Superfood]' : '[Moderate]'} ${f.nameEn.split(' (')[0]}`)
    },
    {
      id: 'aisle_protein',
      category: '2. PROTEIN+ · Wild Fish, Shellfish, Poultry, Eggs & A2 Dairy',
      categoryEs: '2. PROTEIN+ · Pescados, Mariscos, Aves, Huevos y Lácteos A2',
      icon: '🐟',
      subtitle: 'Sub-families 3.2.1 to 3.2.5 · Fullness & Lactose-Free',
      items: allowedFoods
        .filter(f => f.categoryGroup === 'PROTEIN+')
        .map(f => `${f.trafficLevel === 'GREEN_ADJUSTING' ? '[Superfood]' : '[Moderate]'} ${f.nameEn.split(' (')[0]}`)
    },
    {
      id: 'aisle_fats',
      category: '3. LIPID+ · Olive Oil, Avocado, Ghee, Spices & Vinegars',
      categoryEs: '3. LIPID+ · AOVE, Aguacate, Ghee, Especias y Vinagre',
      icon: '🫒',
      subtitle: 'Sub-families 3.3.1 to 3.3.2 · Safe Vit E & Vitamin D Absorption',
      items: allowedFoods
        .filter(f => f.categoryGroup === 'LIPID+')
        .map(f => `${f.trafficLevel === 'GREEN_ADJUSTING' ? '[Superfood]' : '[Moderate]'} ${f.nameEn.split(' (')[0]}`)
    },
    {
      id: 'aisle_beverages',
      category: '4. EXTRAS · Raw Nuts, Seeds, 85% Cacao, Teas & Stevia',
      categoryEs: '4. EXTRAS · Frutos Secos, Semillas, Cacao 85%, Tés y Estevia',
      icon: '🍵',
      subtitle: 'Sub-families 3.4.1 to 3.4.5 · Magnesium, Crunch & Deep Sleep',
      items: allowedFoods
        .filter(f => f.categoryGroup === 'EXTRAS')
        .map(f => `${f.trafficLevel === 'GREEN_ADJUSTING' ? '[Superfood]' : '[Moderate]'} ${f.nameEn.split(' (')[0]}`)
    }
  ];
}
