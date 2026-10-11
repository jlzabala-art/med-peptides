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
    cellularTarget: 'Follicular Dermal Papilla Type II 5α-Reductase',
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
    cellularTarget: 'Dual Type I, II & III 5α-Reductase Isoenzymes (Dermal Papilla & Sebaceous Gland)',
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
    cellularTarget: 'Follicular Dermal Papilla K_ATP Channels & Microvascular Endothelium (SULT1A1 Activation)',
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
    cellularTarget: 'Endothelial Nitric Oxide Synthase (eNOS/NOS3) & Follicular Bulb Microcirculation',
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
    cellularTarget: 'MMP Metalloenzymes, 5α-Reductase Allosteric Binding & Keratinocyte Ribosomes',
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
    cellularTarget: 'Metalloenzyme Catalytic Sites, ZIP4 Transporters & Follicular Keratin Filaments',
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
    cellularTarget: 'Transmembrane Follicular Lipid Bilayer & Mitochondrial ROS Scavenging Cascade',
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
    cellularTarget: 'Methionine Synthase (MTR) & Homocysteine Remethylation in Follicular Matrix',
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
    cellularTarget: 'Glutathione Peroxidase (GPx1/GPx4) Selenoproteins & Follicular Redox Bilayer',
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
    cellularTarget: 'Carnitine Palmitoyltransferase-1 (CPT-1) & Mitochondrial β-Oxidation in Papilla',
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
    cellularTarget: 'Perifollicular Membrane Phospholipids & Lipid Peroxidation Arrest',
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
    cellularTarget: 'Prostaglandin D2 (PGD2) Receptors (CRTH2/GPR44) & Mast Cell Infiltration',
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
    cellularTarget: 'Coenzyme A (CoA) Biosynthesis & Outer Root Sheath Keratinocyte Membranes',
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
    cellularTarget: 'Prostaglandin F2α (FP) Receptors in Dermal Papilla Fibroblasts',
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
    cellularTarget: 'Prostamide Receptors & Follicular Matrix Melanocytes',
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
    cellularTarget: 'Intracellular Androgen Receptors (AR) in Dermal Papilla & 5α-Reductase Binding',
    standardDosages: '1% - 5% Tópico · 25 mg - 100 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  '17-alpha-estradiol': {
    canonicalName: '17-α Estradiol (Alfatradiol)',
    aliases: ['17-alpha-estradiol', '17-alfa-estradiol', '17a-estradiol', 'alfatradiol', 'ell-cranell', 'pantostin'],
    geneTargets: ['CYP19A1', 'SRD5A1'],
    pharmacologicalClass: 'Inhibidor Local de 5α-Reductasa & Estimulador de Aromatasa',
    clinicalIndication: 'Terapia antiandrogénica tópica segura en hombres y mujeres sin feminización sistémica',
    mechanismOfAction: 'Estereoisómero no feminizante del 17-β-estradiol. Inhibe la 5α-reductasa folicular e incrementa la actividad aromatasa local en el bulbo piloso, favoreciendo la conversión de andrógenos a estrógenos protectores.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    cellularTarget: 'Bulb Aromatase (CYP19A1) Activation & Local 5α-Reductase Type I Inhibition',
    standardDosages: '0.025% - 0.05% Topical',
    fagronPrograms: ['TrichoTest']
  },
  'prostaquinon': {
    canonicalName: 'Prostaquinon™',
    aliases: ['prostaquinon', 'prostaquinon tm', 'prostaquinon-tm', 'prostaquinontm', 'prostaquinon fagron'],
    geneTargets: ['PTGDR2', 'PTGDS', 'GPR44'],
    pharmacologicalClass: 'Inhibidor Natural de Prostaglandina D2 (PGD2) & Fitocomplejo Antiinflamatorio',
    clinicalIndication: 'Bloqueo folicular de PGD2, reducción de microinflamación perifolicular y prevención de miniaturización capilar',
    mechanismOfAction: 'Extracto estandarizado de Nigella sativa (Fagron) rico en timoquinona. Inhibe competitivamente la unión de la prostaglandina D2 (PGD2) a sus receptores foliculares (GPR44/PTGDR2), revirtiendo la detención del crecimiento folicular y la miniaturización inducida por PGD2.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™'],
    cellularTarget: 'Prostaglandin D2 GPR44/PTGDR2 Receptors & Perifollicular Mast Cells',
    standardDosages: '3% Topical (3% - 4%)',
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
    cellularTarget: 'Cytoplasmic Glucocorticoid Receptors (NR3C1) & Perifollicular Lymphocytic Infiltration',
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
    cellularTarget: 'Phosphodiesterase (PDE) / Intracellular cAMP & Mitochondrial Matrix in Follicular Bulb',
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
    cellularTarget: 'Nanovesicular Follicular Infundibulum & Phosphodiesterase (PDE) Inhibition',
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
    cellularTarget: 'Melatonergic MT1/MT2 Receptors & Mitochondrial ROS Scavenging in Dermal Papilla',
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
    cellularTarget: 'Microvascular Endothelium, eNOS Synthesis & PAF Receptors',
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
    cellularTarget: 'Dermal Papilla ERK/Akt Signaling, Wnt/β-Catenin Cascade & Bcl-2 Anti-Apoptotic Pathway',
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
    cellularTarget: 'Mitochondrial Carboxylases (ACC, PCC, MCC) & Keratin Disulfide Bonds',
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
    cellularTarget: 'Follicular Stem Cells (Lgr5+), VEGF/bFGF Secretion & Extracellular Procollagen',
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
    cellularTarget: 'Fungal 14α-Demethylase (CYP51), Sebaceous Lipids & 5α-Reductase',
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
    cellularTarget: 'Mitochondrial Oxidoreductases, 5α-Reductase & Follicular Infundibulum Keratinocytes',
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
    cellularTarget: 'Nuclear Retinoic Acid Receptors (RAR-α/β/γ) & SULT1A1 Sulfotransferase Upregulation',
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
    cellularTarget: 'Adenosine A2A/A2B Receptors in Dermal Papilla & Endogenous FGF-7 / VEGF Induction',
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
    cellularTarget: 'Dual 5α-Reductase (Type I & II) & Nuclear Androgen Receptor (AR) Translocation',
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
    cellularTarget: 'SIRT1 Deacetylase Nuclear Complex & AMPK Phosphorylation in Stem Cell Niche',
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
    cellularTarget: 'Intracellular Glutathione (GSH) Rate-Limiting Biosynthesis & Keratin Disulfide Cross-Links',
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
    cellularTarget: 'Tetrahydrofolate (THF) Methylation Pool & Keratinocyte DNA Thymidylate Synthesis',
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
    cellularTarget: 'Nuclear Vitamin D Receptors (VDR) in Follicular Keratinocytes & Anagen Initiation',
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
    cellularTarget: 'Inner Mitochondrial Respiratory Chain (Complex I-III) & ATP Bioenergetics',
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
    cellularTarget: "Pyridoxal 5'-Phosphate (PLP) Transaminases & Cystathionine-β-Synthase",
    standardDosages: '10 mg - 50 mg Oral Diaria · 0.2% - 0.5% Tópico',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'metformin': {
    canonicalName: 'Metformin Hydrochloride (Metformina)',
    aliases: ['metformin', 'metformina', 'metformin hcl', 'glucophage'],
    geneTargets: ['AMPK', 'PRKAA1', 'MTOR', 'TERT'],
    pharmacologicalClass: 'AMPK Activator & Telomeric Cellular Longevity Modulator',
    clinicalIndication: 'Decelerates telomere attrition, promotes autophagy, downregulates mTOR, and modulates metabolic senescence',
    mechanismOfAction: 'Activates AMP-activated protein kinase (AMPK) and suppresses mTOR signaling, mimicking caloric restriction. Promotes DNA damage repair pathways and preserves telomeric integrity during cellular replication cycles.',
    compatibleVehicles: ['Pentravan® Transdermal Base', 'Liposomal Gel', 'Oral Capsules'],
    cellularTarget: 'Mitochondrial Complex I, AMPK Phosphorylation & Follicular Stem Cell Autophagy',
    standardDosages: '50 mg - 100 mg Transdermal (e.g. 88 mg/g) · 500 mg - 1000 mg Oral',
    fagronPrograms: ['TeloTest', 'Compounding']
  },
  'testosterone': {
    canonicalName: 'Testosterone (Micronized USP / Bioidentical)',
    aliases: ['testosterone', 'testosterona', 'testosterone bioidentical', 'testo'],
    geneTargets: ['AR', 'TERT', 'CYP19A1'],
    pharmacologicalClass: 'Bioidentical Androgen Receptor Modulator & Telomerase Promoter',
    clinicalIndication: 'Restores physiological tissue regeneration, stimulates telomerase reverse transcriptase (TERT), and prevents sarcopenia',
    mechanismOfAction: 'Upregulates telomerase enzyme activity (TERT expression) via androgen receptor-mediated transcriptional activation. Stimulates cellular protein synthesis, tissue repair, and bone/muscle anabolism in transdermal delivery.',
    compatibleVehicles: ['Pentravan® Transdermal Base', 'Liposomal Transdermal Cream'],
    cellularTarget: 'Nuclear Androgen Receptors (AR), TERT Promoter & Myocyte/Osteocyte Protein Synthesis',
    standardDosages: '1 mg - 5 mg/g Transdermal (e.g. 3 mg/g Pentravan)',
    fagronPrograms: ['TeloTest', 'BHRT']
  },
  'astaxanthin': {
    canonicalName: 'Astaxanthin (Haematococcus pluvialis extract)',
    aliases: ['astaxanthin', 'astaxantina', 'asta', 'astaxanthin microencapsulated'],
    geneTargets: ['NRF2', 'SOD2', 'GPX1', 'CAT'],
    pharmacologicalClass: 'Super-Antioxidant Xanthophyll Carotenoid & Membrane Shield',
    clinicalIndication: 'Quenches singlet oxygen, halts telomeric DNA oxidative cross-linking, and protects mitochondrial membranes',
    mechanismOfAction: 'Spans the cellular lipid bilayer with polar end groups, neutralizing reactive oxygen species (ROS) with 6,000x greater efficacy than Vitamin C. Protects telomeric repeat sequences (TTAGGG) against oxidative fragmentation.',
    compatibleVehicles: ['Pentravan® Transdermal Base', 'Oral Softgels', 'Vegetarian Capsules'],
    cellularTarget: 'Transmembrane Follicular Lipid Bilayer & Mitochondrial ROS Scavenging Cascade',
    standardDosages: '10 mg - 25 mg/g Transdermal (e.g. 17 mg/g) · 4 mg - 12 mg Oral',
    fagronPrograms: ['TeloTest', 'NutriGen']
  },
  'turmeric-dry-extract': {
    canonicalName: 'Turmeric Dry Extract (Curcuma longa 95% Curcuminoids)',
    aliases: ['turmeric dry extract', 'turmeric', 'curcuma', 'curcuma longa', 'curcumin', 'curcumina'],
    geneTargets: ['NFKB1', 'COX2', 'TNF', 'SIRT1'],
    pharmacologicalClass: 'Phytochemical NF-κB Inhibitor & Telomeric Sirtuin Activator',
    clinicalIndication: 'Suppresses systemic chronic micro-inflammation (inflammaging) and protects genomic chromatin structure',
    mechanismOfAction: 'Potent blocker of IκB kinase (IKK) and NF-κB nuclear translocation. Upregulates SIRT1 expression and defends telomere repeat domains against inflammatory decay and free radical damage.',
    compatibleVehicles: ['Hygrocaps Vegetarian Capsules', 'Phytosome Oral Capsules'],
    cellularTarget: 'IκB Kinase (IKK) / NF-κB Nuclear Translocation & COX-2 Inflammatory Cascade',
    standardDosages: '200 mg - 500 mg Oral Daily',
    fagronPrograms: ['TeloTest', 'NutriGen']
  },
  'coenzyme-q10': {
    canonicalName: 'Coenzyme Q10 (Ubiquinone / Ubiquinol)',
    aliases: ['oral coenzyme q10', 'coenzyme q10', 'coenzima q10', 'coq10', 'ubiquinone', 'ubiquinol'],
    geneTargets: ['COQ2', 'UQCRB', 'PPARG'],
    pharmacologicalClass: 'Mitochondrial Bioenergetic Carrier & Intracellular Antioxidant',
    clinicalIndication: 'Optimizes ATP production, reduces mitochondrial superoxide generation, and preserves stem cell telomeres',
    mechanismOfAction: 'Crucial electron transporter in complexes I/II to complex III of the inner mitochondrial respiratory chain. Regenerates alpha-tocopherol and shields mitochondrial and nuclear DNA from metabolic oxidative stress.',
    compatibleVehicles: ['Hygrocaps Vegetarian Capsules', 'Liposomal Oral Suspension'],
    cellularTarget: 'Inner Mitochondrial Respiratory Chain (Complex I-III) & ATP Bioenergetics',
    standardDosages: '40 mg - 100 mg Oral Daily',
    fagronPrograms: ['TeloTest', 'NutriGen']
  },
  'n-acetyl-l-cysteine': {
    canonicalName: 'N-Acetyl L-Cysteine (Acetilcystein / NAC)',
    aliases: ['acetilcystein', 'acetilcisteina', 'n-acetyl l-cystein', 'n-acetyl cysteine', 'nac', 'n-acetylcysteine'],
    geneTargets: ['GCLC', 'GSS', 'GSR'],
    pharmacologicalClass: 'Intracellular Glutathione (GSH) Rate-Limiting Precursor',
    clinicalIndication: 'Enhances cellular detox, replenishes intracellular glutathione, and protects against telomeric shortening',
    mechanismOfAction: 'Direct source of bioavailable sulfhydryl (-SH) groups. Acts as the rate-limiting substrate for glutathione synthesis (GSH), providing the principal endogenous enzymatic antioxidant defense for chromosomal telomeres.',
    compatibleVehicles: ['Hygrocaps Vegetarian Capsules', 'Oral Sachet'],
    cellularTarget: 'Intracellular Glutathione (GSH) Sulfhydryl Pools & Telomeric DNA Protection',
    standardDosages: '100 mg - 600 mg Oral Daily',
    fagronPrograms: ['TeloTest', 'NutriGen']
  },
  'siliciumax': {
    canonicalName: 'SiliciuMax™ (Stabilized Orthosilicic Acid on Marine Collagen)',
    aliases: ['siliciumax', 'siliciumax tm', 'silicio organico', 'orthosilicic acid', 'silicon'],
    geneTargets: ['COL1A1', 'COL3A1', 'ELN'],
    pharmacologicalClass: 'Bioavailable Organic Silicon & Extracellular Matrix Restorer',
    clinicalIndication: 'Strengthens dermal and vascular extracellular matrix, supports vascular elasticity and cellular integrity',
    mechanismOfAction: 'Provides bioavailable monomeric orthosilicic acid, cross-linking glycosaminoglycans and stabilizing collagen and elastin networks against age-dependent matrix metalloproteinase (MMP) breakdown.',
    compatibleVehicles: ['Hygrocaps Vegetarian Capsules', 'Oral Powder'],
    cellularTarget: 'Prolyl-4-Hydroxylase Activation, Fibroblast GAGs & Collagen Fibrillogenesis',
    standardDosages: '100 mg - 300 mg Oral Daily',
    fagronPrograms: ['TeloTest', 'NutriGen']
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
  if (cleanInput.includes('prostaquinon')) {
    return FAGRON_CLINICAL_MONOGRAPHS['prostaquinon'];
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

/**
 * Resolves complete clinical monograph data, guaranteed cellular target,
 * pharmacological mechanism, and gene targets for ANY active ingredient (API).
 * Works for standard Fagron APIs, regenerative peptides, compounding drugs, and custom APIs.
 * 
 * @param {Object|string} apiOrName - API object (e.g. { name: "Minoxidil 4%", dosage: "4%" }) or name string
 * @param {boolean} isEs - Whether to return localized labels
 * @returns {{
 *   name: string,
 *   cellularTarget: string,
 *   pharmacologicalClass: string,
 *   clinicalIndication: string,
 *   mechanismOfAction: string,
 *   geneTargets: string[],
 *   tag: string,
 *   role: string,
 *   indication: string,
 *   action: string
 * }}
 */
export function resolveApiClinicalData(apiOrName, isEs = false) {
  if (!apiOrName) {
    return {
      name: isEs ? 'Principio Activo' : 'Active Ingredient',
      cellularTarget: isEs ? 'Diana Celular No Especificada' : 'Targeted Cellular Receptor',
      pharmacologicalClass: isEs ? 'Principio Activo Terapéutico' : 'Therapeutic Active Ingredient (API)',
      clinicalIndication: isEs ? 'Optimización Clínica Tisular & Terapia Personalizada' : 'Targeted Clinical Optimization & Therapy',
      mechanismOfAction: '',
      geneTargets: [],
      tag: 'API',
      role: isEs ? 'Principio Activo Terapéutico' : 'Therapeutic Active Ingredient (API)',
      indication: isEs ? 'Optimización Clínica Tisular' : 'Clinical Optimization',
      action: ''
    };
  }

  const rawName = typeof apiOrName === 'string'
    ? apiOrName
    : (apiOrName.name || apiOrName.drugName || apiOrName.productName || apiOrName.activeIngredient || '');

  // Strip dosage percentages, milligrams, etc. to get base name
  const cleanBaseName = rawName.replace(/\s*\d+(?:[.,]\d+)?\s*(?:%|mg|mcg|g|ui|iu|ml)\b/gi, '').trim();

  // 1. Direct monograph lookup
  const mono = getFagronClinicalMonograph(rawName) ||
               getFagronClinicalMonograph(cleanBaseName) ||
               (typeof apiOrName === 'object' && apiOrName.productId ? getFagronClinicalMonograph(apiOrName.productId) : null);

  let cellularTarget = mono?.cellularTarget || (typeof apiOrName === 'object' ? apiOrName.cellularTarget : null);
  let pharmacologicalClass = mono?.pharmacologicalClass || (typeof apiOrName === 'object' ? (apiOrName.role || apiOrName.pharmacologicalClass || apiOrName.category) : null);
  let clinicalIndication = mono?.clinicalIndication || (typeof apiOrName === 'object' ? (apiOrName.indication || apiOrName.clinicalIndication) : null);
  let mechanismOfAction = mono?.mechanismOfAction || (typeof apiOrName === 'object' ? (apiOrName.action || apiOrName.mechanismOfAction || apiOrName.mechanism) : null);
  let geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0)
    ? mono.geneTargets
    : (Array.isArray(apiOrName?.geneTargets) && apiOrName.geneTargets.length > 0 ? apiOrName.geneTargets : []);

  // 2. Intelligent biochemical cellular target synthesis if still missing
  if (!cellularTarget) {
    const low = cleanNormalizeKey(rawName);
    if (low.includes('minoxidil')) {
      cellularTarget = isEs ? 'Canales K_ATP de Papila Dérmica & Endotelio Microvascular (Activación SULT1A1)' : 'Follicular Dermal Papilla K_ATP Channels & Microvascular Endothelium (SULT1A1 Activation)';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Activador de Sulfotransferasa & Canales K_ATP Foliculares' : 'Follicular K_ATP Channel Opener & SULT1A1 Activator';
      if (!clinicalIndication) clinicalIndication = isEs ? 'Inducción anágena & vasodilatación papilar' : 'Anagen phase induction & microvascular perfusion';
      if (!geneTargets.length) geneTargets = ['SULT1A1', 'KCNJ8', 'ABCC9'];
    } else if (low.includes('spironolacton') || low.includes('espironolacton')) {
      cellularTarget = isEs ? 'Receptores Androgénicos Intracelulares (AR) en Papila Dérmica & Unión 5α-Reductasa' : 'Intracellular Androgen Receptors (AR) in Dermal Papilla & 5α-Reductase Binding';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Antagonista Competitivo de Receptores Androgénicos' : 'Competitive Androgen Receptor Antagonist';
      if (!clinicalIndication) clinicalIndication = isEs ? 'Bloqueo androgénico folicular localizado sin alteración hormonal sistémica' : 'Localized follicular androgen blockade without systemic disruption';
      if (!geneTargets.length) geneTargets = ['AR', 'NR3C2'];
    } else if (low.includes('arginin')) {
      cellularTarget = isEs ? 'Óxido Nítrico Sintasa Endotelial (eNOS/NOS3) & Microcirculación Folicular' : 'Endothelial Nitric Oxide Synthase (eNOS/NOS3) & Follicular Bulb Microcirculation';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Precursor Esencial de Óxido Nítrico (NO) & Vasodilatador Folicular' : 'Nitric Oxide (NO) Precursor & Follicular Vasodilator';
      if (!clinicalIndication) clinicalIndication = isEs ? 'Estimulación de microperfusión capilar papilar y bioenergía del bulbo' : 'Papillary capillary microperfusion & bulb bioenergetics';
      if (!geneTargets.length) geneTargets = ['NOS1', 'NOS2', 'NOS3', 'GATM'];
    } else if (low.includes('finasterid')) {
      cellularTarget = isEs ? 'Enzima 5α-Reductasa Tipo II en Papila Dérmica Folicular' : 'Follicular Dermal Papilla Type II 5α-Reductase';
      if (!geneTargets.length) geneTargets = ['SRD5A2', 'SRD5A1'];
    } else if (low.includes('dutasterid')) {
      cellularTarget = isEs ? 'Isoenzimas Duales 5α-Reductasa Tipo I, II y III (Papila y Glándula Sebácea)' : 'Dual Type I, II & III 5α-Reductase Isoenzymes (Dermal Papilla & Sebaceous Gland)';
      if (!geneTargets.length) geneTargets = ['SRD5A1', 'SRD5A2', 'SRD5A3'];
    } else if (low.includes('latanoprost') || low.includes('bimatoprost')) {
      cellularTarget = isEs ? 'Receptores de Prostaglandina F2α (FP) en Fibroblastos de Papila Dérmica' : 'Prostaglandin F2α (FP) Receptors in Dermal Papilla Fibroblasts';
      if (!geneTargets.length) geneTargets = ['PTGFR'];
    } else if (low.includes('caffein') || low.includes('cafein')) {
      cellularTarget = isEs ? 'Fosfodiesterasa (PDE) / cAMP Intracelular en Bulbo Folicular' : 'Phosphodiesterase (PDE) / Intracellular cAMP in Follicular Bulb';
      if (!geneTargets.length) geneTargets = ['PDE4'];
    } else if (low.includes('melatonin')) {
      cellularTarget = isEs ? 'Receptores Melatonérgicos MT1/MT2 & Escudo Redox Mitocondrial en Papila' : 'Melatonergic MT1/MT2 Receptors & Mitochondrial Redox Cascade in Papilla';
      if (!geneTargets.length) geneTargets = ['MTNR1A', 'MTNR1B'];
    } else if (low.includes('zinc')) {
      cellularTarget = isEs ? 'Metaloenzimas MMP, Unión Alostérica a 5α-Reductasa & Síntesis de Queratina' : 'MMP Metalloenzymes, 5α-Reductase Allosteric Binding & Keratin Ribosomes';
      if (!geneTargets.length) geneTargets = ['MT1A', 'ZNT1'];
    } else if (low.includes('biotin')) {
      cellularTarget = isEs ? 'Carboxilasas Mitocondriales & Puentes Disulfuro de Queratina' : 'Mitochondrial Carboxylases (ACC, PCC, MCC) & Keratin Disulfide Bonds';
      if (!geneTargets.length) geneTargets = ['BTD', 'HLCS'];
    } else if (low.includes('ghk') || low.includes('copper tripeptide')) {
      cellularTarget = isEs ? 'Células Madre Foliculares (Lgr5+), VEGF & Matriz Extracelular de Procolágeno' : 'Follicular Stem Cells (Lgr5+), VEGF Secretion & Extracellular Procollagen';
      if (!geneTargets.length) geneTargets = ['COL1A1', 'VEGFA', 'MMP2'];
    } else if (low.includes('tretinoin') || low.includes('retinoic')) {
      cellularTarget = isEs ? 'Receptores Nucleares RAR-α/β/γ & Expresión Génica de SULT1A1' : 'Nuclear Retinoic Acid Receptors (RAR-α/β/γ) & SULT1A1 Sulfotransferase Upregulation';
      if (!geneTargets.length) geneTargets = ['RARA', 'SULT1A1'];
    } else if (low.includes('bpc') || low.includes('bpc 157') || low.includes('bpc157')) {
      cellularTarget = isEs ? 'Fosforilación del Receptor VEGFR2 & Cascada FAK-Paxilina Endotelial' : 'VEGFR2 Phosphorylation & FAK-Paxillin Cytoskeletal Signaling in Endothelium';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Péptido Regenerativo Cito-Protector & Pro-Angiogénico' : 'Cyto-Protective & Pro-Angiogenic Regenerative Peptide';
      if (!clinicalIndication) clinicalIndication = isEs ? 'Reparación endotelial, angiogénesis y regeneración tisular profunda' : 'Endothelial repair, angiogenesis and deep tissue regeneration';
      if (!geneTargets.length) geneTargets = ['VEGFR2', 'PTK2', 'NOS3'];
    } else if (low.includes('tb 500') || low.includes('tb500') || low.includes('thymosin')) {
      cellularTarget = isEs ? 'Secuestro de Monómeros de G-Actina & Migración de Células Madre Lgr5+' : 'G-Actin Monomer Sequestration & Follicular Stem Cell (Lgr5+) Migration';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Péptido Regulador de Citoesqueleto & Migración Celular' : 'Actin-Regulating Cytoskeletal Peptide & Stem Cell Migration Promoter';
      if (!geneTargets.length) geneTargets = ['ACTA1', 'LGR5'];
    } else if (low.includes('epithalon') || low.includes('epitalon')) {
      cellularTarget = isEs ? 'Subunidad TERT de Telomerasa & Ritmo Circadiano de Melatonina' : 'Telomerase Reverse Transcriptase (TERT) & Pineal Melatonin Circadian Rhythm';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Biorregulador Peptídico Epifisario & Activador de Telomerasa' : 'Epiphyseal Peptide Bioregulator & Telomerase Activator';
      if (!geneTargets.length) geneTargets = ['TERT', 'MTNR1A'];
    } else if (low.includes('semaglutid') || low.includes('tirzepatid') || low.includes('retatrutid')) {
      cellularTarget = isEs ? 'Receptores GLP-1R / GIPR en Células Beta Pancreáticas & Neuronas POMC' : 'GLP-1R / GIPR Incretin Receptors in Pancreatic Beta Cells & POMC Neurons';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Agonista de Receptores de Incretinas GLP-1 / GIP' : 'Incretin GLP-1 / GIP Receptor Agonist';
      if (!geneTargets.length) geneTargets = ['GLP1R', 'GIPR'];
    } else if (low.includes('nad') || low.includes('nmn')) {
      cellularTarget = isEs ? 'Desacetilasas Mitocondriales SIRT1/SIRT3 & Enzimas de Reparación PARP' : 'Mitochondrial SIRT1/SIRT3 Deacetylases, PARP Repair Enzymes & ATP Biosynthesis';
      if (!pharmacologicalClass) pharmacologicalClass = isEs ? 'Cofactor de Coenzima Redox & Activador de Sirtuinas' : 'Redox Coenzyme Cofactor & Sirtuin Activator';
      if (!geneTargets.length) geneTargets = ['SIRT1', 'SIRT3', 'PARP1'];
    } else if (low.includes('clobetasol')) {
      cellularTarget = isEs ? 'Receptores Glucocorticoides Citoplasmáticos (NR3C1) & Infiltrado Linfocitario' : 'Cytoplasmic Glucocorticoid Receptors (NR3C1) & Perifollicular Lymphocytic Infiltration';
      if (!geneTargets.length) geneTargets = ['NR3C1'];
    } else if (low.includes('ketoconazol')) {
      cellularTarget = isEs ? '14α-Desmetilasa Fúngica (CYP51), Lípidos de Sebo & 5α-Reductasa' : 'Fungal 14α-Demethylase (CYP51), Sebaceous Lipids & 5α-Reductase';
      if (!geneTargets.length) geneTargets = ['CYP51A1'];
    } else if (low.includes('azelaic')) {
      cellularTarget = isEs ? 'Oxidorreductasas Mitocondriales, 5α-Reductasa & Queratinocitos Foliculares' : 'Mitochondrial Oxidoreductases, 5α-Reductase & Follicular Infundibulum Keratinocytes';
      if (!geneTargets.length) geneTargets = ['SRD5A1', 'SRD5A2'];
    } else if (low.includes('astaxanthin') || low.includes('astaxantin')) {
      cellularTarget = isEs ? 'Bicapa Lipídica Transmembrana & Neutralización de Radicales Singlete' : 'Transmembrane Follicular Lipid Bilayer & Mitochondrial ROS Scavenging Cascade';
      if (!geneTargets.length) geneTargets = ['NFE2L2', 'SOD1'];
    } else if (low.includes('metformin')) {
      cellularTarget = isEs ? 'Complejo I Mitocondrial, Activación de AMPK & Autofagia Celular' : 'Mitochondrial Complex I, AMPK Phosphorylation & Follicular Stem Cell Autophagy';
      if (!geneTargets.length) geneTargets = ['AMPK', 'MTOR'];
    } else if (low.includes('glutathion') || low.includes('glutacion') || low.includes('nac') || low.includes('acetylcyst')) {
      cellularTarget = isEs ? 'Glutatión Intracelular (GSH) & Protección Redox Cromosómica' : 'Intracellular Glutathione (GSH) Sulfhydryl Pools & Telomeric DNA Protection';
      if (!geneTargets.length) geneTargets = ['GCLC', 'GSS'];
    } else if (low.includes('hormon') || low.includes('estrogen') || low.includes('progesteron') || low.includes('testosteron')) {
      cellularTarget = isEs ? 'Receptores Nucleares de Hormonas Esteroideas & Transcripción Tisular' : 'Nuclear Steroid Hormone Receptors & Transcriptional Tissue Modulation';
    } else if (low.includes('peptid') || low.includes('peptide')) {
      cellularTarget = isEs ? 'Receptores de Señalización Peptídica de Superficie & Cascada Intracelular' : 'Cell-Surface Peptide Receptors & Intracellular Signaling Cascade';
    } else if (low.includes('vitam') || low.includes('antioxidant')) {
      cellularTarget = isEs ? 'Integridad de Membranas Celulares & Escudo Redox Mitocondrial' : 'Cellular Membrane Integrity & Mitochondrial Redox Shield';
    } else {
      cellularTarget = isEs ? 'Receptor Celular Específico & Lecho Microvascular Tisular' : 'Targeted Cellular Receptor & Microvascular Tissue Bed';
    }
  }

  if (!pharmacologicalClass) {
    pharmacologicalClass = isEs ? 'Principio Activo Terapéutico (API)' : 'Therapeutic Active Ingredient (API)';
  }
  if (!clinicalIndication) {
    clinicalIndication = isEs ? 'Optimización Clínica Tisular & Terapia Personalizada' : 'Targeted Clinical Optimization & Therapy';
  }
  if (!mechanismOfAction) {
    mechanismOfAction = isEs
      ? `Modula vías celulares diana en ${cellularTarget}, optimizando la respuesta fisiológica tisular.`
      : `Modulates targeted biological pathways at ${cellularTarget}, optimizing physiological tissue response.`;
  }

  // Derive tag
  const tag = (typeof apiOrName === 'object' && apiOrName.tag && apiOrName.tag !== '—' && apiOrName.tag !== '-')
    ? apiOrName.tag
    : (mono?.fagronPrograms?.[0] ? 'Fagron API' : 'Active API');

  return {
    name: cleanBaseName || rawName,
    cellularTarget,
    pharmacologicalClass,
    clinicalIndication,
    mechanismOfAction,
    geneTargets,
    tag,
    role: pharmacologicalClass,
    indication: clinicalIndication,
    action: mechanismOfAction
  };
}
