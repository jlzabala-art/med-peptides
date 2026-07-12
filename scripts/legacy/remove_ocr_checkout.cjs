const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const startRemove = "  // --- PRESCRIPTION UPLOAD & OCR LOGIC ---";
const endRemove = "  // --- MAIN EFFECTS & HANDLERS ---";

const startIndex = content.indexOf(startRemove);
const endIndex = content.indexOf(endRemove);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
  console.log("OCR logic removed.");
}

// Update PrescriptionUploadSection call
const oldProps = `<PrescriptionUploadSection 
                    prescriptionName={prescriptionName}
                    isScanningPrescription={isScanningPrescription}
                    prescriptionSpecs={prescriptionSpecs}
                    prescriptionSelectedVariants={prescriptionSelectedVariants}
                    setPrescriptionSelectedVariants={setPrescriptionSelectedVariants}
                    handlePrescriptionUpload={handlePrescriptionUpload}
                    enrichedCartItems={enrichedCartItems}
                    products={products}
                    region={region}
                    updateCart={updateCart}
                  />`;
const newProps = `<PrescriptionUploadSection 
                    prescriptionName={prescriptionName}
                    setPrescriptionName={setPrescriptionName}
                    prescriptionSpecs={prescriptionSpecs}
                    setPrescriptionSpecs={setPrescriptionSpecs}
                    prescriptionSelectedVariants={prescriptionSelectedVariants}
                    setPrescriptionSelectedVariants={setPrescriptionSelectedVariants}
                    enrichedCartItems={enrichedCartItems}
                    products={products}
                    region={region}
                    updateCart={updateCart}
                  />`;

content = content.replace(oldProps, newProps);
content = content.replace("const [isScanningPrescription, setIsScanningPrescription] = useState(false);", "");

fs.writeFileSync(file, content);
console.log("Checkout.jsx updated.");
