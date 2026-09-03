// Helper to generate canonical ID from string
export function generateCanonicalId(name) {
  if (!name) return '';
  let id = name.toLowerCase().trim();
  
  // Remove anything in parentheses
  id = id.replace(/\s*\([^)]*\)/g, '');
  
  // Replace slashes, pluses, spaces with hyphen
  id = id.replace(/[\s\/\+]+/g, '-');
  
  // Remove non-alphanumeric and hyphens
  id = id.replace(/[^a-z0-9\-]/g, '');
  
  // Deduplicate hyphens
  id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Custom manual mappings for common variations
  if (id.startsWith('ghk-cu')) return 'ghk-cu';
  if (id.startsWith('bpc-157')) return 'bpc-157';
  if (id.startsWith('tb-500')) return 'tb-500';
  if (id.includes('cjc') && id.includes('ipamorelin')) return 'cjc-1295-ipamorelin';
  if (id.startsWith('cjc-1295')) {
    if (id.includes('no-dac') || id.includes('without-dac')) return 'cjc-1295-no-dac';
    if (id.includes('dac')) return 'cjc-1295-dac';
    return 'cjc-1295';
  }
  if (id.startsWith('aod-9604')) return 'aod-9604';
  if (id.startsWith('pt-141')) return 'pt-141';
  if (id.startsWith('ss-31')) return 'ss-31';
  if (id.startsWith('ipamorelin')) return 'ipamorelin';
  if (id.startsWith('tesamorelin')) return 'tesamorelin';
  if (id.startsWith('thymosin-alpha-1')) return 'thymosin-alpha-1';
  
  // Remove trailing dosages like -10mg, -5mg, -5000iu
  id = id.replace(/-\d+(mg|mcg|iu|g)$/, '');
  id = id.replace(/-$/, '');
  
  return id;
}
