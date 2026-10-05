/**
 * fagronClinicalMonographs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Evidence-based clinical monographs and pharmacogenomic annotations
 * for all Fagron APIs (TrichoTest, NutriGen, TeloTest, Compounding).
 *
 * Each entry provides:
 *  - canonicalName: Standard International Nonproprietary Name (INN)
 *  - aliases: Array of common synonyms, trade names, and spelling variations
 *  - geneTargets: Official Gene Symbols (HGNC)
 *  - pharmacologicalClass: Specific therapeutic class
 *  - clinicalIndication: Medical indication for targeted therapy
 *  - mechanismOfAction: Biological cellular mechanism (papilla, follicular stem cells, metabolism)
 *  - compatibleVehicles: Recommended galenic compounding bases
 *  - standardDosages: Typical concentration or dose ranges
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FAGRON_CLINICAL_MONOGRAPHS = {
  'finasteride': {
    canonicalName: 'Finasteride',
    aliases: ['finasteride', 'finasterida', 'propecia', 'proscar', 'finast'],
    geneTargets: ['SRD5A2', 'SRD5A1'],
    pharmacologicalClass: 'Inhibidor Selectivo 5α-Reductasa Tipo II',
    clinicalIndication: 'Supresión de DHT folicular, reversión de miniaturización & mantenimiento de densidad capilar',
    mechanismOfAction: 'Inhibe selectivamente la enzima esteroide 5α-reductasa tipo II, bloqueando la conversión de testosterona en dihidrotestosterona (DHT) en la papila dérmica folicular. Reduce los niveles de DHT en >70% frenando la apoptosis folicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Micronizadas USP'],
    standardDosages: '0.1% - 1% Tópico · 1 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'dutasteride': {
    canonicalName: 'Dutasteride',
    aliases: ['dutasteride', 'dutasterida', 'avodart', 'dutas'],
    geneTargets: ['SRD5A1', 'SRD5A2', 'SRD5A3'],
    pharmacologicalClass: 'Inhibidor Dual 5α-Reductasa Tipo I, II y III',
    clinicalIndication: 'Inhibición androgénica folicular profunda en alopecia androgenética refractaria',
    mechanismOfAction: 'Bloqueador dual de isoenzimas 5α-reductasa tipo I y II. Suprime los niveles de DHT folicular en >90%, con afinidad 3 veces superior a la isoenzima tipo II y 100 veces superior a la tipo I respecto a finasteride.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Mesoterapia Capilar', 'Cápsulas Micronizadas'],
    standardDosages: '0.01% - 0.5% Tópico · 0.5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'minoxidil': {
    canonicalName: 'Minoxidil',
    aliases: ['minoxidil', 'minoxidil base', 'minoxidil sulfato', 'rogaine', 'regaine', 'loniten'],
    geneTargets: ['SULT1A1', 'KCNJ8', 'ABCC9'],
    pharmacologicalClass: 'Activador de Sulfotransferasa & Canales K_ATP Foliculares',
    clinicalIndication: 'Inducción de fase anágena, estimulación de perfusión microvascular folicular y grosor del tallo',
    mechanismOfAction: 'Bioactivado enzimáticamente por la sulfotransferasa folicular (SULT1A1) a sulfato de minoxidil activo. Abre los canales de potasio sensibles a ATP (K_ATP), provocando hiperpolarización celular, vasodilatación papilar y estimulación mitogénica de queratinocitos.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Solución Hidroalcohólica Fagron'],
    standardDosages: '2% - 7% Tópico · 0.25 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'l-arginine': {
    canonicalName: 'L-Arginina (L-Arginine Base / HCl)',
    aliases: ['arginine', 'l-arginine', 'l-arginina', 'arginina', 'arginine hcl', 'arginina base'],
    geneTargets: ['NOS1', 'NOS2', 'NOS3', 'GATM'],
    pharmacologicalClass: 'Precursor Esencial de Óxido Nítrico (NO) & Vasodilatador Folicular',
    clinicalIndication: 'Estimulación de microperfusión capilar papilar, angiogénesis y bioenergía del bulbo',
    mechanismOfAction: 'Sustrato biológico primordial para la óxido nítrico sintasa endotelial (eNOS/NOS3). Incrementa la síntesis de óxido nítrico (NO), favoreciendo la vasodilatación fisiológica en el lecho microvascular de la papila dérmica y aportando nutrientes esenciales a la matriz queratinocítica.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Orales Micronizadas'],
    standardDosages: '0.5% - 2% Tópico · 500 mg - 3,000 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'zinc-sulfate': {
    canonicalName: 'Zinc Sulfato Monohidrato / Heptahidrato',
    aliases: ['zinc sulfate', 'zinc sulphate', 'sulfato de zinc', 'zinc sulfato', 'zinc', 'zinc elemental', 'zinc gluconato', 'zinc picolinato'],
    geneTargets: ['MT1A', 'ZNT1', 'SLC30A1', 'ZIP4'],
    pharmacologicalClass: 'Metaloenzima Esencial & Regulador Enzimático Folicular',
    clinicalIndication: 'Inmunidad dérmica, control de hiperseborrea folicular y cofactor de división celular en el bulbo piloso',
    mechanismOfAction: 'Forma biodisponible de zinc inorgánico. Actúa como cofactor estructural de más de 300 enzimas celulares, estabiliza las membranas celulares del folículo, modula la secreción de sebo a través de la inhibición de 5α-reductasa y estimula la síntesis de proteínas queratínicas.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Orales Micronizadas'],
    standardDosages: '0.2% - 1% Tópico · 50 mg - 220 mg Oral (10 mg - 50 mg Zn elemental)',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'zinc-citrate': {
    canonicalName: 'Zinc Citrato',
    aliases: ['zinc citrate', 'citrato de zinc', 'zinc citrato trihidrato'],
    geneTargets: ['MT1A', 'ZNT1', 'ZIP4'],
    pharmacologicalClass: 'Cofactor Metaloproteasa Esencial & Modulador 5α-Reductasa',
    clinicalIndication: 'Inmunidad celular, síntesis de queratina e inhibición coadyuvante de 5α-reductasa',
    mechanismOfAction: 'Cofactor de más de 300 metaloenzimas esenciales para la replicación del ADN y síntesis proteica en queratinocitos. Ejerce una inhibición alostérica no competitiva sinérgica sobre la 5α-reductasa folicular.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoSol™'],
    standardDosages: '15 mg - 30 mg Zinc Elemental Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'astaxanthin': {
    canonicalName: 'Astaxantina Natural (Haematococcus pluvialis)',
    aliases: ['astaxanthin', 'astaxantina', 'astaxanthin natural', 'astaxantina microencapsulada'],
    geneTargets: ['NFE2L2', 'NRF2', 'SOD1', 'CAT', 'GPX1'],
    pharmacologicalClass: 'Carotenoide Xantófila de Ultra-Alta Potencia Antioxidante',
    clinicalIndication: 'Protección mitocondrial frente a estrés oxidativo severo, anti-fotoenvejecimiento dérmico y longevidad folicular',
    mechanismOfAction: 'Potente carotenoide antioxidante con capacidad de cruzar completamente la bicapa lipídica de las membranas celulares (efecto transmembrana). Su capacidad de neutralización de radicales de oxígeno singlete es 6,000 veces superior a la vitamina C y 550 veces superior a la vitamina E. Inhibe la peroxidación lipídica en la papila dérmica y preserva la microvasculatura folicular.',
    compatibleVehicles: ['Cápsulas Blandas Lipídicas USP', 'TrichoOil™', 'Cápsulas Micronizadas'],
    standardDosages: '4 mg - 12 mg Oral Diaria',
    fagronPrograms: ['NutriGen', 'TeloTest', 'TrichoTest']
  },
  'vitamin-b12': {
    canonicalName: 'Vitamina B12 (Cianocobalamina / Metilcobalamina)',
    aliases: ['cyanocobalamin', 'cianocobalamina', 'vitamin b12', 'vitamina b12', 'b12', 'methylcobalamin', 'metilcobalamina', 'cobalamin', 'cobalamina'],
    geneTargets: ['MTR', 'MTRR', 'TCN2', 'MTHFR'],
    pharmacologicalClass: 'Cofactor de Metionina Sintasa & Síntesis de ADN Eritropoyético',
    clinicalIndication: 'Optimización del ciclo de un carbono, oxigenación microvascular periférica y replicación celular en la matriz capilar',
    mechanismOfAction: 'Cofactor esencial para la síntesis de purinas y pirimidinas durante la división celular de alta frecuencia de los queratinocitos de la matriz folicular. Participa en la conversión de homocisteína a metionina (ciclo de metilación), previniendo la isquemia microvascular perifolicular y garantizando una eritropoyesis normal.',
    compatibleVehicles: ['Cápsulas Sublinguales / Orales', 'TrichoSol™'],
    standardDosages: '500 mcg - 2,500 mcg Oral / Sublingual',
    fagronPrograms: ['NutriGen', 'TeloTest']
  },
  'selenium-yeast': {
    canonicalName: 'Selenio (Levadura Enriquecida / L-Selenometionina)',
    aliases: ['selenium yeast', 'levadura de selenio', 'selenio', 'selenium', 'l-selenomethionine', 'selenometionina', 'sodium selenite', 'selenito sodico'],
    geneTargets: ['GPX1', 'GPX4', 'TXNRD1', 'DIO2'],
    pharmacologicalClass: 'Selenoproteína Esencial & Cofactor de Glutatión Peroxidasa',
    clinicalIndication: 'Protección frente a peroxidación lipídica, función tiroidea folicular y calidad estructural del cabello',
    mechanismOfAction: 'Componente catalítico de las selenoproteínas humanas, incluidas las glutatión peroxidasas (GPx1, GPx4) y las tiorredoxina reductasas. Cataliza la degradación de peróxidos de hidrógeno y lípidos, previniendo el daño oxidativo en la membrana celular folicular.',
    compatibleVehicles: ['Cápsulas Orales'],
    standardDosages: '50 mcg - 200 mcg Selenio Elemental Oral Diaria',
    fagronPrograms: ['NutriGen', 'TeloTest', 'TrichoTest']
  },
  'l-carnitine-l-tartrate': {
    canonicalName: 'L-Carnitina L-Tartrato (LCLT)',
    aliases: ['l-carnitine l-tartrate', 'l-carnitine', 'l-carnitina', 'carnitine', 'carnitina', 'lclt', 'l-carnitine tartrate', 'levocarnitina'],
    geneTargets: ['CPT1A', 'CPT2', 'SLC22A5', 'PPARGC1A'],
    pharmacologicalClass: 'Lanzadera Mitocondrial de Ácidos Grasos & Estimulador Energético Folicular',
    clinicalIndication: 'Elongación del tallo piloso, retraso de fase catágena y optimización de bioenergética folicular',
    mechanismOfAction: 'Transporta ácidos grasos de cadena larga a través de la membrana mitocondrial interna para β-oxidación y generación de ATP en las células de la papila dérmica. Estimula significativamente la proliferación de queratinocitos foliculares y regula al alza factores de proliferación celular retrasando la apoptosis de fase catágena.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Orales Micronizadas'],
    standardDosages: '1% - 2% Tópico · 1,000 mg - 2,000 mg Oral Diaria',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'vitamin-e': {
    canonicalName: 'Vitamina E (D-α-Tocoferol / DL-α-Tocoferil Acetato)',
    aliases: ['vitamin e', 'vitamina e', 'tocopherol', 'tocoferol', 'tocopheryl acetate', 'acetato de tocoferilo', 'alpha tocopherol', 'alfa tocoferol'],
    geneTargets: ['GPX4', 'TTPA', 'SECISBP2'],
    pharmacologicalClass: 'Antioxidante Lipofílico de Membrana & Protector Endotelial',
    clinicalIndication: 'Inhibición de peroxidación lipídica en cuero cabelludo, protección de la cutícula y microperfusión capilar',
    mechanismOfAction: 'Principal antioxidante liposoluble endógeno de las membranas celulares. Interrumpe la cascada de radicales libres reaccionando con radicales peroxilo lipídicos (LOO•), protegiendo los ácidos grasos poliinsaturados de la barrera cutánea folicular y manteniendo la integridad vascular de la papila dérmica.',
    compatibleVehicles: ['TrichoOil™', 'TrichoSol™', 'Cápsulas Blandas Lipídicas USP'],
    standardDosages: '0.5% - 2% Tópico · 200 UI - 800 UI (134 mg - 536 mg) Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen', 'TeloTest']
  },
  'cetirizine-hcl': {
    canonicalName: 'Cetirizine Hcl',
    aliases: ['cetirizine', 'cetirizina', 'cetirizina hcl', 'cetirizine dihydrochloride', 'zyrtec'],
    geneTargets: ['PTGDR2', 'CRTH2', 'HRH1'],
    pharmacologicalClass: 'Antagonista Selectivo del Receptor PGD2 / CRTH2',
    clinicalIndication: 'Neutralización del freno microinflamatorio perifolicular y desbloqueo de fase anágena',
    mechanismOfAction: 'Antagoniza de forma competitiva los receptores de prostaglandina D2 (PGD2/CRTH2) sobreexpresados en cuero cabelludo alopécico. Bloquea la apoptosis de queratinocitos foliculares y suprime el infiltrado inflamatorio mastocitario perifolicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.5% - 1% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'd-panthenol': {
    canonicalName: 'D-Panthenol (Provitamina B5)',
    aliases: ['panthenol', 'pantenol', 'd-panthenol', 'dexpanthenol', 'dexpantenol', 'provitamina b5', 'vitamina b5'],
    geneTargets: ['PANK1', 'PANK2', 'COA_SYNTHESIS'],
    pharmacologicalClass: 'Precursor de Coenzima A & Regenerador Celular Folicular',
    clinicalIndication: 'Bioenergía folicular (ATP), reparación de cutícula y resistencia tensil de la fibra capilar',
    mechanismOfAction: 'Precursor fisiológico del ácido pantoténico y la Coenzima A. Impulsa la biosíntesis de ATP celular y lípidos de la vaina epitelial externa, optimizando la capacidad higroscópica del tallo y reparando el daño térmico y mecánico.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™'],
    standardDosages: '0.25% - 2% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'latanoprost-fagron': {
    canonicalName: 'Latanoprost',
    aliases: ['latanoprost', 'xalatan', 'latanoprost pure api'],
    geneTargets: ['PTGFR', 'FP_RECEPTOR'],
    pharmacologicalClass: 'Agonista Selectivo de Receptores de Prostaglandina F2α (FP)',
    clinicalIndication: 'Inducción de anagénesis precoz, hipertrofia folicular y estimulación de melanogénesis',
    mechanismOfAction: 'Activa directamente los receptores FP de la papila dérmica, induciendo la transición de folículos de fase telógena a anágena. Estimula el reclutamiento microvascular y aumenta el diámetro y pigmentación de cabellos miniaturizados.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.005% - 0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'bimatoprost': {
    canonicalName: 'Bimatoprost',
    aliases: ['bimatoprost', 'lumigan', 'latisse'],
    geneTargets: ['PTGFR', 'FP_RECEPTOR'],
    pharmacologicalClass: 'Análogo de Prostamida & Estimulador de Fase Anágena Folicular',
    clinicalIndication: 'Alargamiento del ciclo anágeno, hipertrofia del tallo capilar y pigmentación del bulbo',
    mechanismOfAction: 'Estimula la transición de telógeno a anágeno mediante activación de receptores prostanoides FP en la papila dérmica, aumentando el tiempo en fase de crecimiento activo y la síntesis de eumelanina.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.01% - 0.03% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'spironolactone': {
    canonicalName: 'Spironolactone',
    aliases: ['spironolactone', 'espironolactona', 'aldactone', 'spiro'],
    geneTargets: ['AR', 'NR3C2'],
    pharmacologicalClass: 'Antagonista Competitivo de Receptores Androgénicos',
    clinicalIndication: 'Bloqueo androgénico folicular localizado sin alteración hormonal sistémica',
    mechanismOfAction: 'Compite con la dihidrotestosterona por el receptor androgénico intracelular en las células de la papila dérmica folicular. Previene la translocación nuclear del receptor y detiene la expresión de señales paracrinas miniaturizantes.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 5% Tópico · 25 mg - 100 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  '17-alpha-estradiol': {
    canonicalName: '17-α Estradiol (Alfatradiol)',
    aliases: ['17-alpha-estradiol', '17-alfa-estradiol', 'alfatradiol', 'estradiol', 'ell-cranell', 'pantostin'],
    geneTargets: ['CYP19A1', 'SRD5A1'],
    pharmacologicalClass: 'Inhibidor Local de 5α-Reductasa & Estimulador de Aromatasa',
    clinicalIndication: 'Terapia antiandrogénica tópica segura en hombres y mujeres sin feminización sistémica',
    mechanismOfAction: 'Estereoisómero no feminizante del 17-β-estradiol. Inhibe la 5α-reductasa folicular e incrementa la actividad aromatasa local en el bulbo piloso, favoreciendo la conversión de andrógenos a estrógenos protectores.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.025% - 0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'clobetasol-propionate': {
    canonicalName: 'Clobetasol Propionato',
    aliases: ['clobetasol', 'clobetasol propionate', 'clobetasol propionato', 'clobesol', 'dermovate'],
    geneTargets: ['NR3C1', 'GLUCOCORTICOID_RECEPTOR'],
    pharmacologicalClass: 'Corticosteroide Tópico de Muy Alta Potencia (Clase IV)',
    clinicalIndication: 'Supresión de alopecia areata y procesos inflamatorios autoinmunes del cuero cabelludo',
    mechanismOfAction: 'Unión de alta afinidad a receptores glucocorticoides citoplasmáticos. Inhibe la transcripción de citoquinas proinflamatorias (IL-1, IL-2, TNF-α) y suprime el ataque linfocitario al privilegio inmune folicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'caffeine': {
    canonicalName: 'Caffeine Pure API',
    aliases: ['caffeine', 'cafeina', 'cafeina anhidra', 'caffeine pure api'],
    geneTargets: ['PDE4', 'CAMP_PATHWAY'],
    pharmacologicalClass: 'Inhibidor de Fosfodiesterasa & Activador Mitocondrial',
    clinicalIndication: 'Estimulación de proliferación celular folicular y neutralización del freno por testosterona',
    mechanismOfAction: 'Inhibe la fosfodiesterasa intracelular incrementando los niveles de adenosín monofosfato cíclico (cAMP). Estimula el metabolismo celular, promueve la elongación folicular y contrarresta el freno inducido por andrógenos.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™'],
    standardDosages: '0.5% - 2% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'cafeisome': {
    canonicalName: 'CafeiSome™ (Cafeína Liposomal)',
    aliases: ['cafeisome', 'cafeina liposomal', 'liposomal caffeine'],
    geneTargets: ['PDE4', 'CAMP_PATHWAY'],
    pharmacologicalClass: 'Cafeína Encapsulada en Vesículas Liposomales',
    clinicalIndication: 'Liberación prolongada de cafeína folicular con penetración transdérmica optimizada',
    mechanismOfAction: 'Sistema nanovesicular liposomal que transporta cafeína purificada profundamente hacia el bulbo folicular sin evaporación en la superficie cutánea, manteniendo niveles estimulantes durante 24 horas.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 3% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'melatonin': {
    canonicalName: 'Melatonina',
    aliases: ['melatonin', 'melatonina', 'circadin'],
    geneTargets: ['MTNR1A', 'MTNR1B', 'CLOCK_GENES'],
    pharmacologicalClass: 'Agonista de Receptores MT1/MT2 & Antioxidante Mitocondrial',
    clinicalIndication: 'Cronobiología folicular, mantenimiento del anágeno y eliminación de radicales libres',
    mechanismOfAction: 'Se une a receptores melatonérgicos MT1/MT2 en queratinocitos foliculares y fibroblastos de la papila. Regula los ritmos circadianos del ciclo capilar y actúa como potente captador de radicales hidroxilo.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™', 'Cápsulas Orales'],
    standardDosages: '0.0033% - 0.1% Tópico · 1 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest', 'TeloTest']
  },
  'ginkgo-biloba': {
    canonicalName: 'Ginkgo Biloba Extracto Estandarizado',
    aliases: ['ginkgo', 'ginkgo biloba', 'ginkgo extract', 'extracto de ginkgo biloba', 'tanakan'],
    geneTargets: ['NOS3', 'VEGF', 'ENOS'],
    pharmacologicalClass: 'Vasoprotector Folicular & Captador de Radicales Libres',
    clinicalIndication: 'Optimización de microcirculación capilar papilar y escudo antioxidante dérmico',
    mechanismOfAction: 'Flavonoides y terpenoides estandarizados que estimulan la síntesis endotelial de óxido nítrico (eNOS). Mejoran la deformabilidad eritrocitaria en capilares terminales y protegen las membranas del bulbo piloso.',
    compatibleVehicles: ['TrichoOil™', 'TrichoSol™', 'Cápsulas Orales'],
    standardDosages: '1% - 3% Tópico · 60 mg - 240 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen', 'TeloTest']
  },
  'ginseng': {
    canonicalName: 'Panax Ginseng Extracto',
    aliases: ['ginseng', 'panax ginseng', 'korean ginseng', 'ginseng extract', 'extracto de ginseng'],
    geneTargets: ['VEGFA', 'FGF7', 'BCL2'],
    pharmacologicalClass: 'Fitoestimulante Celular & Up-regulador de Factores de Crecimiento',
    clinicalIndication: 'Proliferación celular en la matriz papilar y retraso de entrada en fase catágena',
    mechanismOfAction: 'Ginsenósidos bioactivos (Rb1, Rg1) que sobreexpresan VEGF y FGF-7 en la papila dérmica. Inhiben la caspasa-3 y sobreexpresan Bcl-2, protegiendo las células madre del folículo contra la involución prematura.',
    compatibleVehicles: ['TrichoOil™', 'TrichoSol™', 'Cápsulas Orales'],
    standardDosages: '1% - 3% Tópico · 100 mg - 500 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'biotin': {
    canonicalName: 'Biotina (Vitamina B7 / Vitamina H)',
    aliases: ['biotin', 'biotina', 'vitamin b7', 'vitamina b7', 'vitamin h', 'vitamina h', 'd-biotin'],
    geneTargets: ['BTD', 'HLCS', 'KERATIN_GENES'],
    pharmacologicalClass: 'Cofactor Enzimático de Carboxilasas & Síntesis de Queratina',
    clinicalIndication: 'Fortalecimiento estructural del tallo piloso y metabolismo de aminoácidos azufrados',
    mechanismOfAction: 'Coenzima indispensable para carboxilasas mitocondriales. Facilita la síntesis de ácidos grasos y el metabolismo de aminoácidos como la cisteína, reforzando los puentes disulfuro de la queratina capilar.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Orales'],
    standardDosages: '0.1% - 0.5% Tópico · 2.5 mg - 10 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'copper-tripeptide-1': {
    canonicalName: 'GHK-Cu (Tripéptido de Cobre-1 / Copper Tripeptide-1)',
    aliases: ['ghk-cu', 'copper tripeptide-1', 'copper tripeptide', 'peptido de cobre', 'tripeptido de cobre', 'ghk copper'],
    geneTargets: ['COL1A1', 'COL3A1', 'VEGFA', 'MMP2', 'TIMP1'],
    pharmacologicalClass: 'Péptido Señalizador Celular & Remodelador de Matriz Extracelular',
    clinicalIndication: 'Reactivación de células madre foliculares, angiogénesis papilar e hipertrofia del folículo',
    mechanismOfAction: 'Estimula la proliferación de células de la papila dérmica y fibroblastos. Aumenta la producción de colágeno, elastina y proteoglicanos, protegiendo al folículo del daño oxidativo y favoreciendo el engrosamiento del tallo capilar.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Solución Liposomal'],
    standardDosages: '0.1% - 1% Tópico',
    fagronPrograms: ['TrichoTest', 'TeloTest']
  },
  'ketoconazole': {
    canonicalName: 'Ketoconazol USP',
    aliases: ['ketoconazole', 'ketoconazol', 'nizoral', 'fungarest'],
    geneTargets: ['CYP51A1', 'SRD5A1', 'MALASSEZIA'],
    pharmacologicalClass: 'Antifúngico Imidazólico & Antiandrógeno Folicular Tópico',
    clinicalIndication: 'Control de dermatitis seborreica, sobrecrecimiento de Malassezia y reducción de DHT folicular',
    mechanismOfAction: 'Inhibe la síntesis de ergosterol en membranas fúngicas y ejerce una acción antiinflamatoria y antiandrogénica tópica en el receptor de andrógenos, reduciendo la descamación y el microambiente inflamatorio perifolicular.',
    compatibleVehicles: ['TrichoWash™', 'TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 2% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'azelaic-acid': {
    canonicalName: 'Ácido Azelaico Micronizado',
    aliases: ['azelaic acid', 'acido azelaico', 'skinoren', 'finacea'],
    geneTargets: ['SRD5A1', 'SRD5A2', 'TYR'],
    pharmacologicalClass: 'Inhibidor Competitivo de 5α-Reductasa & Regulador de Queratinización',
    clinicalIndication: 'Tratamiento sinérgico antiandrogénico, queratolítico y antiinflamatorio folicular',
    mechanismOfAction: 'Inhibe competitivamente la 5α-reductasa tipo I y II folicular. Normaliza la hiperqueratosis en el infundíbulo folicular y neutraliza radicales libres derivados del sebo oxigenado.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 15% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'tretinoin': {
    canonicalName: 'Tretinoína (Ácido Retinoico Todo-trans)',
    aliases: ['tretinoin', 'tretinoina', 'retinoic acid', 'acido retinoico', 'retin-a'],
    geneTargets: ['RARA', 'RARB', 'SULT1A1', 'CRABP2'],
    pharmacologicalClass: 'Retinoide Activador de Transcripción & Up-Regulador de SULT1A1',
    clinicalIndication: 'Potenciador de absorción dérmica y sobreexpresión de sulfotransferasa para minoxidil',
    mechanismOfAction: 'Aumenta la expresión y actividad de la enzima sulfotransferasa (SULT1A1) en la papila dérmica, transformando respondedores deficientes a minoxidil en respondedores óptimos. Incrementa el recambio celular infundibular y la penetración de principios activos.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.01% - 0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'adenosine': {
    canonicalName: 'Adenosina Pura API',
    aliases: ['adenosine', 'adenosina', 'adenosina pura'],
    geneTargets: ['ADORA1', 'ADORA2A', 'FGF7', 'VEGFA'],
    pharmacologicalClass: 'Agonista Purinérgico A2A & Estimulador de Fibroblastos Foliculares',
    clinicalIndication: 'Inducción de factores de crecimiento capilar (FGF-7, VEGF) y aumento de grosor folicular',
    mechanismOfAction: 'Activa receptores de adenosina A2A en la papila dérmica, induciendo la expresión de FGF-7 y VEGF. Favorece la entrada y permanencia en fase anágena, incrementando el diámetro de los cabellos miniaturizados.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.5% - 1.5% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'saw-palmetto': {
    canonicalName: 'Saw Palmetto (Serenoa repens Extracto Lipídico >85%)',
    aliases: ['saw palmetto', 'serenoa repens', 'sabal serrulata', 'extracto de saw palmetto'],
    geneTargets: ['SRD5A1', 'SRD5A2', 'AR'],
    pharmacologicalClass: 'Fitofármaco Antiandrogénico & Inhibidor Dual 5α-Reductasa',
    clinicalIndication: 'Reducción de DHT folicular, prevención de miniaturización y alternativa fitoterápica a finasteride',
    mechanismOfAction: 'Ácidos grasos libres (láurico, mirístico, oleico) y fitoesteroles (β-sitosterol) que inhiben de manera dual las isoformas 1 y 2 de la 5α-reductasa, reduciendo la producción local de dihidrotestosterona (DHT) y antagonizando competitivamente los receptores androgénicos en la papila dérmica.',
    compatibleVehicles: ['Cápsulas Blandas Lipídicas USP', 'TrichoOil™', 'TrichoSol™'],
    standardDosages: '160 mg - 320 mg Oral Diaria · 1% - 3% Tópico',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'resveratrol': {
    canonicalName: 'trans-Resveratrol Micronizado Puro (>98%)',
    aliases: ['resveratrol', 'trans-resveratrol', 'trans resveratrol', 'polygonum cuspidatum'],
    geneTargets: ['SIRT1', 'AMPK', 'NFE2L2', 'FOXO3'],
    pharmacologicalClass: 'Activador de Sirtuina 1 (SIRT1) & Polifenol Antisenescencia Folicular',
    clinicalIndication: 'Longevidad folicular, regeneración mitocondrial dérmica y supresión de senescencia prematura',
    mechanismOfAction: 'Polifenol estilbenoide natural que actúa como potente mimético de restricción calórica activando alostéricamente la desacetilasa SIRT1 y la vía AMPK. Fomenta la autofagia mitocondrial en células madre del bulbo, incrementa la expresión de enzimas antioxidantes y preserva la capacidad proliferativa del nicho folicular.',
    compatibleVehicles: ['Cápsulas Micronizadas USP', 'TrichoSol™', 'TrichoOil™'],
    standardDosages: '250 mg - 500 mg Oral Diaria · 0.5% - 1% Tópico',
    fagronPrograms: ['TeloTest', 'NutriGen', 'TrichoTest']
  },
  'n-acetylcysteine': {
    canonicalName: 'N-Acetilcisteína (NAC) USP',
    aliases: ['n-acetylcysteine', 'n-acetilcisteina', 'nac', 'acetylcysteine', 'acetilcisteina', 'fluimucil'],
    geneTargets: ['GCLC', 'GSS', 'GSR', 'SOD1'],
    pharmacologicalClass: 'Precursor Limitante de Glutatión Reducido (GSH) & Mucolítico Celular',
    clinicalIndication: 'Detoxificación celular, síntesis de enlaces disulfuro en queratina y protección contra estrés oxidativo ambiental',
    mechanismOfAction: 'Aporta cisteína biodisponible, el aminoácido limitante para la biosíntesis intracelular de glutatión (GSH). Incrementa las defensas redox intracelulares en el bulbo piloso, protege contra el estrés oxidativo por toxinas y radiación UV, y proporciona puentes de azufre para la cohesión y resistencia de la fibra queratínica.',
    compatibleVehicles: ['Cápsulas Orales Micronizadas'],
    standardDosages: '600 mg - 1,200 mg Oral Diaria',
    fagronPrograms: ['NutriGen', 'TeloTest', 'TrichoTest']
  },
  'folic-acid': {
    canonicalName: 'Ácido Fólico / L-Metilfolato de Calcio',
    aliases: ['folic acid', 'acido folico', 'methylfolate', 'metilfolato', 'l-methylfolate', 'folate', 'folato', 'vitamina b9', 'vitamin b9'],
    geneTargets: ['MTHFR', 'FOLR1', 'DHFR', 'TYMS'],
    pharmacologicalClass: 'Donador de Grupos Metilo & Cofactor de Síntesis de Timidilato',
    clinicalIndication: 'Proliferación celular en queratinocitos del bulbo piloso y metilación del ADN',
    mechanismOfAction: 'Forma activa del folato esencial para la síntesis de timidina y metilación del ADN. Garantiza la división celular mitótica acelerada de los queratinocitos foliculares en fase anágena y previene la elevación de homocisteína dañina para el endotelio dérmico.',
    compatibleVehicles: ['Cápsulas Orales Micronizadas'],
    standardDosages: '400 mcg - 1,000 mcg (1 mg) Oral Diaria',
    fagronPrograms: ['NutriGen', 'TrichoTest']
  },
  'vitamin-d3': {
    canonicalName: 'Vitamina D3 (Colecalciferol)',
    aliases: ['vitamin d3', 'vitamina d3', 'cholecalciferol', 'colecalciferol', 'vitamin d', 'vitamina d'],
    geneTargets: ['VDR', 'CYP27B1', 'CYP24A1'],
    pharmacologicalClass: 'Ligando del Receptor de Vitamina D (VDR) & Modulador Inmunitario',
    clinicalIndication: 'Activación del ciclo folicular y diferenciación de células madre en el bulbo piloso',
    mechanismOfAction: 'Se une al receptor nuclear VDR expresado abundantemente en queratinocitos del folículo piloso. Induce la expresión de genes esenciales para el inicio del ciclo anágeno y previene la alopecia mediada por fallo de VDR.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoOil™'],
    standardDosages: '1,000 UI - 10,000 UI Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen', 'TeloTest']
  },
  'coenzyme-q10': {
    canonicalName: 'Coenzima Q10 (Ubiquinona / Ubiquinol)',
    aliases: ['coenzyme q10', 'coenzima q10', 'q10', 'ubiquinone', 'ubiquinona', 'ubiquinol'],
    geneTargets: ['COQ2', 'COQ7', 'OXPHOS'],
    pharmacologicalClass: 'Transportador Electrónico Mitocondrial & Escudo Lipídico',
    clinicalIndication: 'Bioenergética celular mitocondrial, prevención de senescencia celular y salud vascular',
    mechanismOfAction: 'Componente indispensable de la cadena de transporte de electrones (Complejos I, II y III) para fosforilación oxidativa mitocondrial. Previene la peroxidación de lípidos de membrana y preserva la función endotelial.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoOil™'],
    standardDosages: '100 mg - 300 mg Oral',
    fagronPrograms: ['NutriGen', 'TeloTest']
  },
  'pyridoxine': {
    canonicalName: 'Piridoxina Clorhidrato (Vitamina B6 / P5P)',
    aliases: ['pyridoxine', 'piridoxina', 'vitamin b6', 'vitamina b6', 'pyridoxal 5-phosphate', 'p5p', 'piridoxal fosfato'],
    geneTargets: ['SRD5A1', 'SHMT1', 'CBS'],
    pharmacologicalClass: 'Cofactor de Transaminación & Regulador de Homocisteína',
    clinicalIndication: 'Metabolismo de aminoácidos de queratina e inhibición sinérgica de 5α-reductasa junto con Zinc',
    mechanismOfAction: 'Coenzima esencial para el metabolismo de cisteína y metionina en la síntesis de queratina capilar. Ejerce inhibición sinérgica sobre la 5α-reductasa cuando se combina con sales de zinc.',
    compatibleVehicles: ['Cápsulas Orales Micronizadas', 'TrichoSol™'],
    standardDosages: '10 mg - 50 mg Oral Diaria · 0.2% - 0.5% Tópico',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  }
};

/**
 * Normalizes an ingredient name string for robust fuzzy matching.
 * @param {string} str 
 * @returns {string}
 */
function cleanNormalizeKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ' ') // replace punctuation/hyphens with space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds clinical monograph data for any given API name, synonym, or slug.
 * Highly resilient: matches direct keys, aliases, canonical names, and sub-tokens.
 * 
 * @param {string} rawName 
 * @returns {Object|null}
 */
export function getFagronClinicalMonograph(rawName) {
  if (!rawName) return null;
  const cleanInput = cleanNormalizeKey(rawName);
  if (!cleanInput) return null;

  // 1. Exact match on raw lowercase or clean key
  if (FAGRON_CLINICAL_MONOGRAPHS[cleanInput]) {
    return FAGRON_CLINICAL_MONOGRAPHS[cleanInput];
  }

  // 2. Match against all monograph keys, aliases, and canonical names
  for (const [key, mono] of Object.entries(FAGRON_CLINICAL_MONOGRAPHS)) {
    const cleanKey = cleanNormalizeKey(key);
    const cleanCanonical = cleanNormalizeKey(mono.canonicalName);

    // Direct key match
    if (cleanInput === cleanKey || cleanInput === cleanCanonical) {
      return mono;
    }

    // Alias matches
    if (Array.isArray(mono.aliases)) {
      for (const alias of mono.aliases) {
        const cleanAlias = cleanNormalizeKey(alias);
        if (cleanInput === cleanAlias || cleanInput.includes(cleanAlias) || cleanAlias.includes(cleanInput)) {
          return mono;
        }
      }
    }

    // Substring in key or canonical
    if (cleanInput.includes(cleanKey) || cleanKey.includes(cleanInput)) {
      return mono;
    }
  }

  // 3. Intelligent fallback synthesis by biochemical keyword
  if (cleanInput.includes('zinc')) {
    return FAGRON_CLINICAL_MONOGRAPHS['zinc-sulfate'];
  }
  if (cleanInput.includes('arginin')) {
    return FAGRON_CLINICAL_MONOGRAPHS['l-arginine'];
  }
  if (cleanInput.includes('carnitin')) {
    return FAGRON_CLINICAL_MONOGRAPHS['l-carnitine-l-tartrate'];
  }
  if (cleanInput.includes('cobalamin') || cleanInput.includes('b12')) {
    return FAGRON_CLINICAL_MONOGRAPHS['vitamin-b12'];
  }
  if (cleanInput.includes('seleni')) {
    return FAGRON_CLINICAL_MONOGRAPHS['selenium-yeast'];
  }
  if (cleanInput.includes('tocofer') || cleanInput.includes('tocopherol') || cleanInput.includes('vitamin e') || cleanInput.includes('vitamina e')) {
    return FAGRON_CLINICAL_MONOGRAPHS['vitamin-e'];
  }
  if (cleanInput.includes('pantot') || cleanInput.includes('panthenol') || cleanInput.includes('pantenol')) {
    return FAGRON_CLINICAL_MONOGRAPHS['d-panthenol'];
  }
  if (cleanInput.includes('caffein') || cleanInput.includes('cafein')) {
    return FAGRON_CLINICAL_MONOGRAPHS['caffeine'];
  }
  if (cleanInput.includes('melatonin')) {
    return FAGRON_CLINICAL_MONOGRAPHS['melatonin'];
  }
  if (cleanInput.includes('biotin')) {
    return FAGRON_CLINICAL_MONOGRAPHS['biotin'];
  }
  if (cleanInput.includes('minoxidil')) {
    return FAGRON_CLINICAL_MONOGRAPHS['minoxidil'];
  }
  if (cleanInput.includes('finasterid')) {
    return FAGRON_CLINICAL_MONOGRAPHS['finasteride'];
  }
  if (cleanInput.includes('dutasterid')) {
    return FAGRON_CLINICAL_MONOGRAPHS['dutasteride'];
  }

  return null;
}

/**
 * Evaluates whether an extracted dose is within the standard compounding safety range.
 * @param {string} apiName 
 * @param {string} dosageStr 
 * @param {string} route 
 * @returns {{ evaluated: boolean, isWithinStandardRange: boolean, level: string, standardRange: string|null, message: string|null }}
 */
export function checkDosageSafety(apiName, dosageStr, route = 'topical') {
  if (!apiName || !dosageStr) {
    return { evaluated: false, isWithinStandardRange: true, level: 'unrated', standardRange: null, message: null };
  }
  
  const mono = getFagronClinicalMonograph(apiName);
  if (!mono || !mono.standardDosages) {
    return { evaluated: false, isWithinStandardRange: true, level: 'unrated', standardRange: null, message: null };
  }

  const rangeStr = typeof mono.standardDosages === 'string' 
    ? mono.standardDosages 
    : (mono.standardDosages[route] || mono.standardDosages.topical || mono.standardDosages.oral || '');

  // Extract percentage or numerical value with unit
  const numMatch = String(dosageStr).match(/(\d+(?:[.,]\d+)?)\s*(%|mg|mcg|g)/i);
  if (!numMatch) {
    const cleanRange = rangeStr.replace(/Oral Diaria/gi, 'Daily Oral').replace(/Tópico/gi, 'Topical').replace(/Selenio Elemental/gi, 'Elemental Selenium');
    return { evaluated: false, isWithinStandardRange: true, level: 'unrated', standardRange: cleanRange, message: `Reference range: ${cleanRange}` };
  }

  const cleanRange = rangeStr.replace(/Oral Diaria/gi, 'Daily Oral').replace(/Tópico/gi, 'Topical').replace(/Selenio Elemental/gi, 'Elemental Selenium');
  const val = parseFloat(numMatch[1].replace(',', '.'));
  const unit = numMatch[2].toLowerCase();

  // Range parser, e.g. "0.1% - 0.25%" or "2% - 5%"
  const rangeMatches = [...rangeStr.matchAll(/(\d+(?:[.,]\d+)?)\s*(%|mg|mcg|g)?/gi)];
  if (rangeMatches.length >= 2) {
    const minVal = parseFloat(rangeMatches[0][1].replace(',', '.'));
    const maxVal = parseFloat(rangeMatches[1][1].replace(',', '.'));
    const rangeUnit = (rangeMatches[1][2] || rangeMatches[0][2] || '').toLowerCase();

    if (unit === rangeUnit && !isNaN(minVal) && !isNaN(maxVal)) {
      if (val < minVal * 0.5) {
        return {
          evaluated: true,
          isWithinStandardRange: false,
          level: 'low',
          standardRange: cleanRange,
          message: `Dose ${dosageStr} is below standard reference range (${cleanRange}). Prescriber confirmed.`
        };
      }
      if (val > maxVal * 1.5) {
        return {
          evaluated: true,
          isWithinStandardRange: false,
          level: 'high',
          standardRange: cleanRange,
          message: `Dose ${dosageStr} exceeds typical reference range (${cleanRange}). Prescriber confirmed.`
        };
      }
      return {
        evaluated: true,
        isWithinStandardRange: true,
        level: 'standard',
        standardRange: cleanRange,
        message: `Dose within standard therapeutic range (${cleanRange}).`
      };
    }
  }

  return { evaluated: true, isWithinStandardRange: true, level: 'standard', standardRange: cleanRange, message: `Standard reference range: ${cleanRange}` };
}
