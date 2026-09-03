/**
 * workspaceClinicalChecker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time Clinical & Supply Intelligence Engine for the Workspace Buffer.
 * Computes peptide synergies, redundancy warnings, and accessory requirements.
 */

export const KNOWN_SYNERGIES = [
  {
    ids: ['bpc-157', 'tb-500', 'thymosin-beta-4'],
    name: 'Wolverine / Tissue Healing Synergy',
    tag: 'Tissue Repair',
    color: '#059669',
    message: 'Synergy detected: BPC-157 (angiogenesis & gut repair) + TB-500 (cell migration & actin upregulation) provide comprehensive tissue healing.'
  },
  {
    ids: ['cjc-1295', 'ipamorelin'],
    name: 'Pulsatile GH Release Synergy',
    tag: 'GH Secretagogue',
    color: '#0284c7',
    message: 'Synergy detected: CJC-1295 (GHRH analog) + Ipamorelin (selective ghrelin/GHS agonist) maximize natural pituitary GH pulses without desensitization.'
  },
  {
    ids: ['nad', 'nmn', 'resveratrol', 'quercetin'],
    name: 'Cellular Longevity & Sirtuin Activation',
    tag: 'Longevity / NAD+',
    color: '#7c3aed',
    message: 'Synergy detected: NAD+ pool elevation combined with polyphenol sirtuin activators optimizes mitochondrial ATP and cellular repair.'
  },
  {
    ids: ['ss-31', 'mots-c'],
    name: 'Mitochondrial Rejuvenation Synergy',
    tag: 'Mitochondrial Matrix',
    color: '#d97706',
    message: 'Synergy detected: SS-31 (cardiolipin stabilizer) + MOTS-c (mitochondrial-derived peptide) enhance metabolic flexibility and ATP output.'
  }
];

export const KNOWN_REDUNDANCIES = [
  {
    ids: ['ghrp-2', 'ghrp-6', 'hexarelin'],
    message: 'Mechanism Overlap: Multiple 1st/2nd generation GHRPs detected. Combining these may increase cortisol/prolactin without additive GH benefit.'
  },
  {
    ids: ['semaglutide', 'tirzepatide', 'retatrutide'],
    message: 'Incretin Overlap: Multiple GLP-1 / GIP / Glucagon co-agonists detected. Use a single incretin agent at tailored titration.'
  }
];

/**
 * Checks workspace items for synergies, redundancies, and required supplies
 * @param {Array} items - List of items in the workspace buffer
 * @returns {{ synergies: Array, redundancies: Array, accessorySuggestion: Object|null }}
 */
export function checkWorkspaceClinicalStatus(items = []) {
  if (!items || items.length === 0) {
    return { synergies: [], redundancies: [], accessorySuggestion: null };
  }

  // Normalize item names/product IDs
  const presentKeys = items.map(item => {
    const raw = `${item.productId || ''} ${item.name || ''}`.toLowerCase();
    return raw;
  });

  // 1. Detect Synergies
  const synergies = [];
  KNOWN_SYNERGIES.forEach(syn => {
    const matchCount = syn.ids.filter(synId => 
      presentKeys.some(key => key.includes(synId.replace(/-/g, ' ')) || key.includes(synId))
    ).length;

    if (matchCount >= 2) {
      synergies.push(syn);
    }
  });

  // 2. Detect Redundancies
  const redundancies = [];
  KNOWN_REDUNDANCIES.forEach(red => {
    const matchCount = red.ids.filter(redId => 
      presentKeys.some(key => key.includes(redId.replace(/-/g, ' ')) || key.includes(redId))
    ).length;

    if (matchCount >= 2) {
      redundancies.push(red);
    }
  });

  // 3. Accessory Suggestions (BAC Water / Syringes for Lyophilized Vials)
  const hasLyophilizedVials = items.some(item => {
    const pres = (item.presentation || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return pres.includes('vial') || name.includes('vial') || name.includes('mg');
  });

  const hasSolvent = items.some(item => {
    const name = (item.name || '').toLowerCase();
    return name.includes('bacteriostatic') || name.includes('bac water') || name.includes('water') || name.includes('solvent');
  });

  let accessorySuggestion = null;
  if (hasLyophilizedVials && !hasSolvent) {
    accessorySuggestion = {
      title: 'Bacteriostatic Water (BAC Water 30ml) & Syringes Recommended',
      description: 'Your workspace contains lyophilized peptide vials requiring sterile reconstitution.',
      actionLabel: 'Add BAC Water + Syringes Bundle',
      itemPayload: {
        productId: 'bac-water-30ml',
        variantId: 'vial-30ml',
        name: 'Bacteriostatic Water (30ml USP Grade)',
        dosage: '30 ml',
        presentation: 'vial',
        price: 12.00,
        costPrice: 6.00,
        quantity: 1,
        type: 'accessory'
      }
    };
  }

  return {
    synergies,
    redundancies,
    accessorySuggestion
  };
}
