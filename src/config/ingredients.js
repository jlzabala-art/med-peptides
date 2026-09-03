export const ACTIVE_INGREDIENTS = [
  { id: 'semaglutide', label: 'Semaglutide' },
  { id: 'tirzepatide', label: 'Tirzepatide' },
  { id: 'bpc_157', label: 'BPC-157' },
  { id: 'tb_500', label: 'TB-500' },
  { id: 'ipamorelin', label: 'Ipamorelin' },
  { id: 'cjc_1295', label: 'CJC-1295' },
  { id: 'tesamorelin', label: 'Tesamorelin' },
  { id: 'nad_plus', label: 'NAD+' },
  { id: 'glutathione', label: 'Glutathione' },
  { id: 'melanotan_ii', label: 'Melanotan II' },
  { id: 'pt_141', label: 'PT-141' },
  { id: 'dsip', label: 'DSIP' },
  { id: 'epitalon', label: 'Epitalon' },
  { id: 'motsc', label: 'MOTS-c' },
  { id: 'ss_31', label: 'SS-31' },
  { id: '5_htp', label: '5-HTP' },
  { id: 'l_theanine', label: 'L-Theanine' },
  { id: 'caffeine', label: 'Caffeine' },
  { id: 'vitamin_b12', label: 'Vitamin B12' },
  { id: 'vitamin_d3', label: 'Vitamin D3' },
  { id: 'magnesium', label: 'Magnesium' }
];

export function getIngredientLabel(ingredientId) {
  if (!ingredientId) return 'Unknown';
  const ing = ACTIVE_INGREDIENTS.find(i => i.id === ingredientId);
  return ing ? ing.label : ingredientId;
}
