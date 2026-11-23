/**
 * Legacy Customs-Safe Shipping Labels Dictionary & Rule Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Derived from historical Dubai/GCC customs-safe shipping declarations.
 * STRICT RULE: Only applies to `shippingTitle` (Shipping Label).
 * NEVER alters clinical Delivery Label fields (`productTitle`, `productName`, `dose`).
 */

export const LEGACY_HISTORICAL_ENTRIES = [
  // Rows 2-13
  { patient: 'Basma Haitham K Bouzo', prescription: 'Morning Formula Estradiol + Testosterone', label: 'TrichoMask 30ml' },
  { patient: 'Matthew Taylor', prescription: 'TrichoSol 100ml', label: 'TrichoSol 100ml' },
  { patient: 'Matthew Taylor', prescription: 'TrichoOil 30ml', label: 'TrichoOil 30ml' },
  { patient: 'Mangesh Sakharkar', prescription: 'TrichoSol 100ml', label: 'TrichoSol 100ml' },
  { patient: 'Mangesh Sakharkar', prescription: 'Capsules', label: 'Hair Growth Vitamins 90 caps' },
  { patient: 'Rashid Shahin Malalla', prescription: 'TrichoFoam 100ml', label: 'TrichoFoam 100ml' },
  { patient: 'Rashid Shahin Malalla', prescription: 'TrichoOil 30ml', label: 'TrichoOil 30ml' },
  { patient: 'Noura Mohamed Aqueel Alkhoori', prescription: 'Morning Formula Estradiol + Testosterone', label: 'TrichoSerum Morning 60ml' },
  { patient: 'Noura Mohamed Aqueel Alkhoori', prescription: 'Estriol + Hyaluronic Acid Vaginal Cream', label: 'TrichoSerum Evening 60ml' },
  { patient: 'Noura Mohamed Aqueel Alkhoori', prescription: 'Micronized Progesterone 200 mg IR', label: 'Morning Hair Multi-Complex 60 caps' },
  { patient: 'Alan Maclean Rutledge', prescription: 'TrichoSol 100ml', label: 'TrichoShampoo 100ml' },
  { patient: 'Maria Cecilia Reinaldo Santos Correa', prescription: 'Personalized Evening Formula 1', label: 'Evening Hair Multi-Complex 60 caps' },

  // Rows 15-27
  { patient: 'Eldose Babu', prescription: 'TrichoFoam 100ml', label: 'TrichoFoam 100ml' },
  { patient: 'Alan Maclean Rutledge', prescription: 'Compounded Formula Acid-Resistant Vegetable Capsules', label: 'Morning Hair Multi-Complex 270 caps' },
  { patient: 'Alan Maclean Rutledge', prescription: 'Compounded Liver & Mitochondrial Support Formula', label: 'Evening Hair Multi-Complex 90 caps' },
  { patient: 'Basma Haitham K Bouzo', prescription: 'Morning Formula Testosterone', label: 'Morning Hair Mask 90ml' },
  { patient: 'Basma Haitham K Bouzo', prescription: 'Evening Formula Estradiol', label: 'Evening Hair Mask 90ml' },
  { patient: 'Aamer Reza Habib', prescription: 'Diltiazem 2% + Lidocaine 2% topical ointment', label: 'Hair Serum 30 ml' },
  { patient: 'Amna Sultan Mohamed Ahmed Alota', prescription: 'Morning Formula', label: 'Morning Hair Growth Vitamins 60 caps' },
  { patient: 'Amna Sultan Mohamed Ahmed Alota', prescription: 'Metabolic and Lipid Formula', label: 'Evening Hair Growth Vitamins 120 caps' },
  { patient: 'Abdulla Sultan Mohamed Ahmed Alo', prescription: 'Formula 1 Morning', label: 'Morning Hair Growth Vitamins 180 caps' },
  { patient: 'Abdulla Sultan Mohamed Ahmed Alo', prescription: 'Formula 2 before bed', label: 'Evening Hair Growth Vitamins 120 caps' },
  { patient: 'Julien Boiteux', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Julien Boiteux', prescription: 'TrichoOil 30ml', label: 'Hair Oil 30ml' },
  { patient: 'Mohammed Ahmad Aishehhi', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },

  // Rows 28-40
  { patient: 'Noura Majed Mohamed Alfuttaim', prescription: 'Personalized Evening Formula', label: 'Evening Hair Multi-Complex 60 caps' },
  { patient: 'Daria Grek', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Daria Grek', prescription: 'Capsules', label: 'Hair Growth Vitamins 90 caps' },
  { patient: 'Daria Grek', prescription: 'TrichoOil 30ml', label: 'Hair Oil 30ml' },
  { patient: 'Daria Grek', prescription: 'TrichoWash 250ml', label: 'Hair Shampoo 250ml' },
  { patient: 'Ghada Abdulaziz Ishaq', prescription: 'Formula Estradiol (Transdermal)', label: 'Hair Mask 60ml' },
  { patient: 'Ghada Abdulaziz Ishaq', prescription: 'Dehydroepiandrosterone (DHEA) - 5 mg', label: 'Hair Growth Vitamins 60 caps' },
  { patient: 'Reem F M Alghanim', prescription: 'Bioidentical Hormone Cream (Micronized Base)', label: 'Hair Mask 60ml' },
  { patient: 'George Mills', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Sara Khalid Al-Meadadi', prescription: 'Pentravan', label: 'Hair Serum 90ml' },
  { patient: 'Sara Khalid Al-Meadadi', prescription: 'Capsules', label: 'Hair Growth Vitamins 90 caps' },

  // Rows 44-53
  { patient: 'Haya Hassen Al-Haidose', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Haya Hassen Al-Haidose', prescription: 'TrichoWash 250ml', label: 'Hair Shampoo 250ml' },
  { patient: 'Mouza Kmaid Saeed Althuwaib Alame', prescription: 'Transdermal Bioidentical Estradiol Cream', label: 'Hair Mask 90ml' },
  { patient: 'Tausifuzzaman Khaleequzza', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Tausifuzzaman Khaleequzza', prescription: 'TrichoOil 30ml', label: 'Hair Oil 30ml' },
  { patient: 'Amna Sultan Mohamed Ahmed Alota', prescription: 'Metabolic and Lipid Formula', label: 'Evening Hair Vitamins 120 caps' },
  { patient: 'Lucas De Morais Arruda', prescription: 'Anti-hair loss', label: 'Hair Multi-Complex 90 caps' },
  { patient: 'May Ali Khamis Almazrouei', prescription: 'Personalized Formula Sleep & Stress Support', label: 'Hair Multi-Complex 270 caps' },
  { patient: 'Asmhan Khalfan Mohammed Khalifa', prescription: 'Formula Sleep & Stress Support', label: 'Morning Hair Vitamins 180 caps' },
  { patient: 'Fatima Yousef Al-mohannadi', prescription: 'TrichoWash 250ml', label: 'Hair Shampoo 250ml' },

  // Rows 55-60
  { patient: 'Alia Faraj R Alofi', prescription: 'Testosterone transdermal cream', label: 'Hair mask 90 ml' },
  { patient: 'Alia Faraj R Alofi', prescription: 'Vagifem 10 mcg vaginal tablets', label: 'Hair Multi-Complex 30 tabs' },
  { patient: 'Alia Faraj R Alofi', prescription: 'Micronized Progesterone 100 mg per capsule', label: 'Hair Vitamins 90 caps' },
  { patient: 'Hanan Abduljaleel Alsayed Ahmad', prescription: 'Morning Formula DHEA + Testosterone Cream Transdermal', label: 'Morning Hair Serum 60 ml' },
  { patient: 'Hanan Abduljaleel Alsayed Ahmad', prescription: 'Evening Formula Estradiol Cream', label: 'Evening Hair Serum 60 ml' },
  { patient: 'Puranjay Dham Rakesh Dham', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },

  // Rows 62-70
  { patient: 'Aisha Ahmad Al Derham', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Turky Bakhit S A Al-shahwani', prescription: 'Capsules', label: 'Hair Multi-Complex 90 caps' },
  { patient: 'Turky Bakhit S A Al-shahwani', prescription: 'TrichoSol 100ml', label: 'Hair Lotion 100ml' },
  { patient: 'Hamna Sajjad Sajjad Butt', prescription: 'TrichoWash 250ml', label: 'Hair Shampoo 250ml' },
  { patient: 'Fawziya Edrees Al-Sulaiti', prescription: 'Capsules', label: 'Hair Multi-Complex 90 caps' },
  { patient: 'Fawziya Edrees Al-Sulaiti', prescription: 'Oral capsules', label: 'Rejuval Vitamins 90 caps' },
  { patient: 'Shamsa Khalifa Humaid Alraqraqi Al', prescription: 'Morning Formula DHEA + Testosterone Transdermal Cream', label: 'Morning Hair Serum 60ml' },
];

export function normalizeText(str = '') {
  return String(str || '')
    .toLowerCase()
    .replace(/[®™–—\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function patientNamesMatch(a = '', b = '') {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Support Excel-truncated patient names (e.g., "Amna Sultan Mohamed Ahmed Alota" vs "... Alotaiba")
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  if (shorter.length >= 16 && longer.startsWith(shorter)) return true;
  const tokensA = na.split(' ').filter((t) => t.length > 2);
  const tokensB = nb.split(' ').filter((t) => t.length > 2);
  if (tokensA.length >= 2 && tokensB.length >= 2) {
    const overlap = tokensA.filter((t) => tokensB.includes(t));
    if (overlap.length >= Math.min(3, tokensA.length, tokensB.length)) return true;
  }
  return false;
}

/**
 * Find an exact historical shipping label for a known patient + prescription.
 */
export function findHistoricalLegacyLabel(patientName = '', prescriptionTitle = '') {
  const np = normalizeText(prescriptionTitle);
  if (!patientName || !np) return null;

  const patientEntries = LEGACY_HISTORICAL_ENTRIES.filter((e) =>
    patientNamesMatch(patientName, e.patient)
  );
  if (patientEntries.length === 0) return null;

  // 1. Exact prescription match
  const exact = patientEntries.find((e) => normalizeText(e.prescription) === np);
  if (exact) return exact.label;

  // 2. Partial / substring prescription match
  const partial = patientEntries.find((e) => {
    const ep = normalizeText(e.prescription);
    return ep.length >= 5 && (np.includes(ep) || ep.includes(np));
  });
  return partial ? partial.label : null;
}

/**
 * Rule-based Legacy Labels generator for any clinical prescription item.
 * Preserves volume (ml) or capsule/tablet count, strips all hormonal/anatomical terms,
 * and maps into consistent Tricho / Hair-Care declarations.
 */
export function getLegacyLabelSuggestions(item = {}, siblingItems = []) {
  const title = `${item.productTitle || ''} ${item.productName || ''}`.trim();
  const netQty = `${item.netQuantity || item.quantity || ''}`.trim();
  const combined = `${title} ${netQty}`.trim();
  const low = normalizeText(combined);

  const volMatch = combined.match(/(\d+(?:\.\d+)?)\s*(ml|mL)\b/i);
  const volLabel = volMatch ? `${volMatch[1]}ml` : '';
  const capsMatch = combined.match(/(\d+)\s*(caps|capsules|tabs|tablets)\b/i);
  const countNum = capsMatch ? capsMatch[1] : '90';
  const unitWord = /tab/i.test(combined) ? 'tabs' : 'caps';

  const isMorning = /\b(morning|am|day)\b/i.test(low);
  const isEvening = /\b(evening|night|pm|before bed|bedtime|sleep)\b/i.test(low);
  const timePrefix = isMorning ? 'Morning ' : isEvening ? 'Evening ' : '';

  const candidates = [];
  const historical = findHistoricalLegacyLabel(item.patientName, title);
  if (historical) candidates.push(historical);

  if (/\b(nasal|intranasal|nostril|spray|mist)\b/i.test(low) && !/\btrichosol\b/i.test(low)) {
    const v = volLabel || '10 mL';
    candidates.push(
      `Botanical Nasal Mist ${v}`,
      `Isotonic Saline Nasal Spray ${v}`,
      `Scalp Mist Spray ${v}`
    );
  } else if (/\b(pen|cartridge|pluma|semaglutide|tirzepatide|retatrutide|cagrilintide|liraglutide)\b/i.test(low)) {
    const v = volLabel || '3 mL';
    candidates.push(
      `Precision Dermal Serum Pen ${v}`,
      `Botanical Applicator Pen ${v}`,
      `Cosmetic Serum Cartridge ${v}`
    );
  } else if (/\b(vial|lyophilized|liofilizado|ampoule|bpc|tb-?500|cjc|ipamorelin|ghk-?cu|epithalon|nad\+|glutathione|peptid)\b/i.test(low)) {
    const v = volLabel || '10 mL';
    candidates.push(
      `Botanical Scalp Ampoule ${v}`,
      `Cosmetic Ampoule Serum ${v}`,
      `Concentrate Serum Vial ${v}`
    );
  } else if (/\btrichosol\b/i.test(low)) {
    const v = volLabel || '100ml';
    candidates.push(`Hair Lotion ${v}`, `TrichoSol ${v}`, `TrichoShampoo ${v}`);
  } else if (/\btrichooil\b/i.test(low)) {
    const v = volLabel || '30ml';
    candidates.push(`Hair Oil ${v}`, `TrichoOil ${v}`);
  } else if (/\btrichowash\b/i.test(low)) {
    const v = volLabel || '250ml';
    candidates.push(`Hair Shampoo ${v}`);
  } else if (/\btrichofoam\b/i.test(low)) {
    const v = volLabel || '100ml';
    candidates.push(`TrichoFoam ${v}`, `Hair Foam ${v}`);
  } else if (/\b(pentravan|ointment|diltiazem|lidocaine)\b/i.test(low)) {
    const v = volLabel || (/\bointment\b/i.test(low) ? '30ml' : '90ml');
    candidates.push(`Hair Serum ${v}`, `Hair Mask ${v}`);
  } else if (
    /\b(cream|transdermal|vaginal|estradiol|estriol|testosterone|bioidentical|topical|gel|lotion|serum|mask)\b/i.test(low)
  ) {
    const v = volLabel || (/\b(serum)\b/i.test(low) ? '60ml' : '90ml');
    candidates.push(
      `${timePrefix}Hair Mask ${v}`.trim(),
      `${timePrefix}Hair Serum ${v}`.trim(),
      `TrichoSerum ${timePrefix || ''}${volLabel || '60ml'}`.replace(/\s+/g, ' ').trim(),
      `TrichoMask ${volLabel || '30ml'}`
    );
  } else if (
    /\b(caps|capsule|capsules|tablet|tablets|vagifem|progesterone|dhea|oral|formula|sleep|stress|metabolic|lipid|liver|mitochondrial|anti-hair|acid-resistant)\b/i.test(low)
  ) {
    candidates.push(
      `${timePrefix}Hair Multi-Complex ${countNum} ${unitWord}`.trim(),
      `${timePrefix}Hair Growth Vitamins ${countNum} ${unitWord}`.trim(),
      `${timePrefix}Hair Vitamins ${countNum} ${unitWord}`.trim(),
      `Rejuval Vitamins ${countNum} ${unitWord}`
    );
  } else {
    candidates.push(
      `Hair Serum ${volLabel || '60ml'}`,
      `Hair Multi-Complex ${countNum} ${unitWord}`,
      `Hair Lotion ${volLabel || '100ml'}`
    );
  }

  // Deduplicate & avoid colliding with sibling items already assigned a shippingTitle
  const usedBySiblings = new Set(
    (siblingItems || [])
      .filter((sib) => sib && sib !== item && sib.shippingTitle)
      .map((sib) => normalizeText(sib.shippingTitle))
  );

  const unique = [];
  for (const c of candidates) {
    const cleaned = c.replace(/\s+/g, ' ').trim();
    if (cleaned && !unique.some((u) => normalizeText(u) === normalizeText(cleaned))) {
      unique.push(cleaned);
    }
  }

  // Prefer suggestions not already used by another item in the same patient parcel
  const nonColliding = unique.filter((u) => !usedBySiblings.has(normalizeText(u)));
  return nonColliding.length > 0 ? [...nonColliding, ...unique.filter((u) => usedBySiblings.has(normalizeText(u)))] : unique;
}
