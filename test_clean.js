function cleanProductName(name) {
  if (!name) return '';
  return name
    .replace(/\s*\(\d+(mg|mcg|iu|ml)\)/i, '') // e.g. (5mg)
    .replace(/\s*\d+(mg|mcg|iu|ml)\b/i, '')    // e.g. 5mg
    .replace(/\s*(vial|kit|pre-filled pen|pen|capsules|spray|drops|cream|gel|syringes?)\b/gi, '') // forms
    .replace(/\s*-\s*$/, '') // trailing dash
    .trim();
}
console.log(cleanProductName('BPC-157 (5mg)'));
console.log(cleanProductName('Tirzepatide 30mg Vial'));
console.log(cleanProductName('Semaglutide 5mg Pre-filled Pen'));
console.log(cleanProductName('GHK-Cu 50mg Cream'));
