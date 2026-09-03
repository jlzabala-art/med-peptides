const variants = [
  { supplierId: "OLlBbQjgrj6tY7GmM2Jo", supplier: "Lotusland Limited" },
  { supplier: "fagron_iberica" }
];
const activeSupplierFilter = "Lotusland Limited";
const mVar = variants.find(v => 
  (v.supplier && v.supplier.toLowerCase() === activeSupplierFilter.toLowerCase()) || 
  (v.supplierId && v.supplierId === activeSupplierFilter)
);
console.log("Matched var:", mVar);
let preselected = null;
if (mVar) preselected = mVar.supplierId || mVar.supplier;
console.log("Preselected:", preselected);

const uniqueSuppliers = [...new Set(variants.map(v => v?.supplierId || v?.supplier || 'lotusland'))];
console.log("Unique suppliers:", uniqueSuppliers);
console.log("Includes preselected?", uniqueSuppliers.includes(preselected));

