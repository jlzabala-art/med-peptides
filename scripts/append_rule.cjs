const fs = require('fs');
const rule = `
## 43. Taxonomía y Esquema de Variantes (Golden Rule)
Toda variante dentro del arreglo \`variants\` de un producto debe pertenecer a un 'Péptido Canónico' (con un \`canonicalId\` único transversal a todos los proveedores) y debe cumplir estrictamente con el siguiente esquema:
1. \`supplierId\` y \`supplier\`: Identificación clara del proveedor.
2. \`strength\` / \`dosage\`: Dosis del producto (ej. 2mg, 5mg, 50mg).
3. \`presentation\`: Formato físico del producto (ej. \`vial\`, \`prefilled_pen\`, \`nasal_spray\`, \`tablet\`).
4. \`unit_price\`: Precio unitario base.
5. \`cost_tiers\`: Un objeto con exactamente 4 niveles de precios de coste por volumen: \`cost_10\`, \`cost_20\`, \`cost_50\`, \`cost_100\`.
`;
fs.appendFileSync('.agents/AGENTS.md', rule);
console.log('Appended rule 43');
