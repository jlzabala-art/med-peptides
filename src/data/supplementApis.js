export const SUPPLEMENT_APIS = [
  {
    id: 'nmn',
    name: 'NMN (Nicotinamida Mononucleótido)',
    unit: 'mg',
    costPerUnit: 0.02, // 0.02 EUR per mg
    category: 'Longevidad',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Co-factor celular clave en la elevación de los niveles de NAD+ y la función mitocondrial.'
  },
  {
    id: 'resveratrol',
    name: 'Trans-Resveratrol 98%',
    unit: 'mg',
    costPerUnit: 0.015, // 0.015 EUR per mg
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Polifenol antioxidante activador de las sirtuinas (SIRT1).'
  },
  {
    id: 'zinc_picolinate',
    name: 'Zinc (Picolinato)',
    unit: 'mg',
    costPerUnit: 0.005, // 0.005 EUR per mg
    category: 'Minerales',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Forma altamente absorbible de zinc, mineral esencial para el sistema inmune y enzimático.'
  },
  {
    id: 'nad_pure',
    name: 'NAD+ Puro (Nicotinamida Adenina Dinucleótido)',
    unit: 'mg',
    costPerUnit: 0.05, // 0.05 EUR per mg
    category: 'Longevidad',
    compatibleVehicles: ['cellulose_capsule', 'liposomal_liquid'],
    desc: 'Nucleótido esencial para la producción de energía celular (ATP) y la reparación del ADN.'
  },
  {
    id: 'vitamin_d3',
    name: 'Vitamina D3 (Colecalciferol)',
    unit: 'IU',
    costPerUnit: 0.0001, // 0.0001 EUR per IU
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'vegetable_glycerin', 'liposomal_liquid'],
    desc: 'Vitamina liposoluble crucial para la absorción de calcio, salud ósea e inmunomodulación.'
  },
  {
    id: 'magnesium_glycinate',
    name: 'Glicinato de Magnesio',
    unit: 'mg',
    costPerUnit: 0.004, // 0.004 EUR per mg
    category: 'Minerales',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Magnesio quelado con glicina, promueve la relajación muscular y soporte al sistema nervioso sin efecto laxante.'
  },
  {
    id: 'coq10',
    name: 'Coenzima Q10 (CoQ10)',
    unit: 'mg',
    costPerUnit: 0.025, // 0.025 EUR per mg
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'liposomal_liquid'],
    desc: 'Antioxidante mitocondrial indispensable para la cadena de transporte de electrones.'
  },
  {
    id: 'vitamin_c',
    name: 'Vitamina C (Ácido Ascórbico)',
    unit: 'mg',
    costPerUnit: 0.002, // 0.002 EUR per mg
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base', 'liposomal_liquid'],
    desc: 'Antioxidante hidrosoluble fundamental para la síntesis de colágeno y el soporte inmune.'
  },
  {
    id: 'vitamin_b12',
    name: 'Vitamina B12 (Metilcobalamina)',
    unit: 'mcg',
    costPerUnit: 0.0005, // 0.0005 EUR per mcg
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'vegetable_glycerin', 'liposomal_liquid'],
    desc: 'Forma activa de la vitamina B12, clave en la síntesis de glóbulos rojos y función neurológica.'
  },
  {
    id: 'quercetin',
    name: 'Quercetina',
    unit: 'mg',
    costPerUnit: 0.018, // 0.018 EUR per mg
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Flavonoide senolítico natural que ayuda en la regulación de la respuesta inflamatoria.'
  }
];

export const FORMATS = [
  { id: 'capsules', label: 'Cápsulas', defaultServings: 60, baseFee: 10, unitLabel: 'cápsulas' },
  { id: 'powder', label: 'Polvo Oral', defaultServings: 30, baseFee: 7, unitLabel: 'tomas (dosis)' },
  { id: 'drops', label: 'Gotas Orales', defaultServings: 30, baseFee: 8, unitLabel: 'tomas (dosis)' },
  { id: 'liposomal', label: 'Líquido Liposomal', defaultServings: 30, baseFee: 12, unitLabel: 'tomas (dosis)' }
];

export const VEHICLES = [
  { id: 'cellulose_capsule', label: 'Cápsula de celulosa (veggie)', formats: ['capsules'] },
  { id: 'flavored_powder_base', label: 'Base de polvo saborizada (stevia/citrus)', formats: ['powder'] },
  { id: 'vegetable_glycerin', label: 'Gotas de glicerina vegetal pura', formats: ['drops'] },
  { id: 'liposomal_liquid', label: 'Vehículo liposomal líquido', formats: ['liposomal'] }
];
