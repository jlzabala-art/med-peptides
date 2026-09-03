// Clinical Alternatives & Equivalent Compounds Matrix for Magistral & Peptide Formulations

export const CLINICAL_ALTERNATIVES_MATRIX = {
  // Prostaglandins & Vasodilators
  'latanoprost': {
    category: 'Prostaglandin Analog / Hair Growth',
    standardDoses: ['0.005%', '0.01%', '0.05%'],
    alternatives: [
      { name: 'Bimatoprost', dose: '0.03%', note: 'Potent prostaglandin F2alpha analog' },
      { name: 'Minoxidil', dose: '5%', note: 'Standard K-channel opener vasodilator' },
      { name: 'TrichoXidil', dose: '2.5%', note: 'Plant-derived phytocomplex for hair growth' },
      { name: 'Alfatradiol', dose: '0.025%', note: '17-alpha-estradiol topical inhibitor' }
    ]
  },
  'minoxidil': {
    category: 'Vasodilator & Hair Growth Stimulant',
    standardDoses: ['2%', '5%', '7%', '10%'],
    alternatives: [
      { name: 'Latanoprost Fagron', dose: '0.005%', note: 'Prostaglandin analog for hair density' },
      { name: 'TrichoXidil', dose: '5%', note: 'Natural plant-derived alternative' },
      { name: 'Nanoxidil', dose: '5%', note: 'Encapsulated lower molecular weight variant' }
    ]
  },
  'trichoxidil': {
    category: 'Natural Phytocomplex Hair Growth',
    standardDoses: ['2.5%', '5%'],
    alternatives: [
      { name: 'Latanoprost Fagron', dose: '0.005%', note: 'Synthetic prostaglandin F2a' },
      { name: 'Minoxidil', dose: '5%', note: 'Synthetic vasodilator' }
    ]
  },

  // Anti-Androgens & DHT Blockers
  'spironolactone': {
    category: 'Topical Anti-Androgen',
    standardDoses: ['1%', '2%', '5%'],
    alternatives: [
      { name: 'Finasteride', dose: '0.1%', note: 'Topical 5-alpha reductase Type II inhibitor' },
      { name: 'Dutasteride', dose: '0.05%', note: 'Dual 5-alpha reductase Type I & II inhibitor' },
      { name: 'Cetirizine Hcl', dose: '1%', note: 'Prostaglandin D2 (PGD2) receptor antagonist' },
      { name: 'Saw Palmetto', dose: '2%', note: 'Natural liposterolic DHT blocker' }
    ]
  },
  'finasteride': {
    category: '5-Alpha Reductase Inhibitor',
    standardDoses: ['0.1%', '0.25%', '0.5%', '1mg'],
    alternatives: [
      { name: 'Dutasteride', dose: '0.05%', note: 'More potent dual 5-AR inhibitor' },
      { name: 'Spironolactone', dose: '1%', note: 'Topical aldosterone / androgen receptor blocker' },
      { name: 'Alfatradiol', dose: '0.025%', note: 'Milder estrogenic DHT inhibitor' }
    ]
  },
  'dutasteride': {
    category: 'Dual 5-Alpha Reductase Inhibitor',
    standardDoses: ['0.05%', '0.1%', '0.5mg'],
    alternatives: [
      { name: 'Finasteride', dose: '0.1%', note: 'Selective Type II 5-AR inhibitor' },
      { name: 'Spironolactone', dose: '2%', note: 'Androgen receptor antagonist' }
    ]
  },

  // Peptides & Factors
  'igrantine-f1': {
    category: 'Peptide Growth Factor Complex',
    standardDoses: ['0.5%', '1%', '2%'],
    alternatives: [
      { name: 'Copper Tripeptide-1 (GHK-Cu)', dose: '1%', note: 'Tissue remodeling & follicle enlargement peptide' },
      { name: 'Acetyl Tetrapeptide-3', dose: '1%', note: 'Extracellular matrix anchoring peptide' },
      { name: 'BPC-157', dose: '250mcg', note: 'Angiogenic regenerative peptide' }
    ]
  },

  // Base Vehicles & Solutions
  'trichosol': {
    category: 'Topical Vehicles & Base Solutions',
    standardDoses: ['100ml', '60ml', '50ml'],
    alternatives: [
      { name: 'TrichoFoam', dose: '100ml', note: 'Alcohol-free foam vehicle' },
      { name: 'Espumil', dose: '100ml', note: 'Ready-to-use lipid foam base' },
      { name: 'Cleoderm', dose: '100g', note: 'Topical dermatological cream vehicle' }
    ]
  }
};

export function getClinicalAlternatives(ingredientName) {
  if (!ingredientName) return null;
  const cleanName = ingredientName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const [key, data] of Object.entries(CLINICAL_ALTERNATIVES_MATRIX)) {
    if (cleanName.includes(key)) {
      return data;
    }
  }
  
  // Generic fallback if not explicitly mapped
  return {
    category: 'Magistral Component',
    standardDoses: ['0.1%', '0.5%', '1%', '2%', '5%', '100ml'],
    alternatives: [
      { name: 'Custom Alternative', dose: '1%', note: 'Select from catalog or custom compound' }
    ]
  };
}
