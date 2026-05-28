const products = [
  "5-AMINO 1 MQ",
  "5-HTP",
  "AOD-9604",
  "BPC-157",
  "BPC-157 + TB-500",
  "CJC-1295 with DAC",
  "CJC-1295 without DAC (Modified GRF 1-29)",
  "CJC-1295 without DAC + Ipamorelin",
  "FST-344 (Follistatin)",
  "GHK-Cu (Copper Peptide)",
  "GLOW (BPC-157/TB-500/GHK-Cu)",
  "KLOW (BPC-157/TB-500/GHK-Cu/KPV)",
  "LDN 0.5mg",
  "LDN 1.5mg",
  "MT2 (Melanotan II)",
  "MK-677 (Ibutamoren)",
  "PT-141 (Bremelanotide)",
  "TB-500 (Thymosin β4)",
  "Vit. D3 10,000IU + K2",
  "Serrapeptase 300,000SPU"
];

const getPharmaBaseName = (name) => {
  if (!name) return '';
  
  let clean = name;
  
  // 1. Separate blends/combos (keep only first compound, or query them separately)
  // e.g. "BPC-157 + TB-500" -> "BPC-157", "GLOW (BPC-157/...)" -> "BPC-157" (or GLOW? wait, GLOW is commercial name, the compounds inside are BPC-157/TB-500/GHK-Cu)
  // Let's look at GLOW (BPC-157/TB-500/GHK-Cu). If we extract the first compound inside the parentheses: "BPC-157"
  
  // If there's a slash or plus inside parentheses, let's extract the first compound
  // e.g. "GLOW (BPC-157/TB-500/GHK-Cu)" -> let's extract the first part of parentheses if it contains slashes/plus
  
  // Let's handle parenthetical info first
  const parenMatch = clean.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const content = parenMatch[1].trim();
    // If the content is a blend/list of compounds (contains / or +), let's extract the first one
    if (content.includes('/') || content.includes('+')) {
      const parts = content.split(/[\/src\+]/);
      clean = parts[0].trim();
    } else {
      // If it's a synonym/substance name (like Follistatin in FST-344 (Follistatin) or Melanotan II in MT2 (Melanotan II)),
      // let's use the synonym as it's often more specific, OR we can combine them?
      // PubMed search: "Melanotan II" is much better than "MT2".
      // "Follistatin" is much better than "FST-344".
      // "Bremelanotide" is great, "PT-141" is also great.
      // Let's use the synonym if it's a known chemical name. Or let's use the synonym directly.
      if (content.toLowerCase() === 'copper peptide') {
        clean = 'GHK-Cu'; // Keep GHK-Cu, copper peptide is too broad
      } else {
        clean = content;
      }
    }
  }
  
  // Remove parenthetical stuff if we didn't use it
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  
  // 2. Remove blends/combos if not caught in parentheses (e.g. "BPC-157 + TB-500" -> "BPC-157")
  if (clean.includes('+')) {
    clean = clean.split('+')[0].trim();
  }
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }
  
  // 3. Remove "with DAC" / "without DAC" commercial qualifiers
  clean = clean.replace(/\s+with\s+DAC\b/gi, '');
  clean = clean.replace(/\s+without\s+DAC\b/gi, '');
  clean = clean.replace(/\s+DAC\b/gi, '');
  
  // 4. Normalize specific known products
  if (clean.toUpperCase().includes('5-AMINO 1 MQ') || clean.toUpperCase().includes('5-AMINO-1-MQ')) {
    return '5-amino-1-methylquinolinium';
  }
  if (clean.toUpperCase() === 'LDN') {
    return 'low dose naltrexone';
  }
  
  // 5. Remove dosage/unit qualifiers cleanly
  // Matches digits followed by mg, mcg, ml, g, iu, ui, spu, etc.
  // We want to be careful not to match "1" in "5-AMINO 1 MQ" (so we match boundary before units)
  clean = clean.replace(/\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|ui|spu)\b/gi, '');
  
  // 6. General commercial noise
  clean = clean.replace(/\/?\s?vial\b/gi, '');
  clean = clean.replace(/\b(pure|grade|research|grade|lyophilized|acetate)\b/gi, '');
  
  return clean.trim();
};

for (const p of products) {
  console.log(`"${p}" -> "${getPharmaBaseName(p)}"`);
}
