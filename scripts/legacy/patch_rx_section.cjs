const fs = require('fs');
const file = 'src/components/checkout/PrescriptionUploadSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import for usePrescriptionAI
content = content.replace("import { Activity, CheckCircle2, Sparkles, Check, FileSearch, Zap } from '@/lib/icons';", "import { Activity, CheckCircle2, Sparkles, Check, FileSearch, Zap } from '@/lib/icons';\nimport { usePrescriptionAI } from '../../hooks/shared/usePrescriptionAI';");

// Remove handlePrescriptionUpload from props and add internal handler
const propsStart = "const PrescriptionUploadSection = ({";
const propsEnd = "}) => {";
const startIndex = content.indexOf(propsStart);
const endIndex = content.indexOf(propsEnd) + propsEnd.length;

const newProps = `const PrescriptionUploadSection = ({
  prescriptionName,
  setPrescriptionName,
  prescriptionSpecs,
  setPrescriptionSpecs,
  prescriptionSelectedVariants,
  setPrescriptionSelectedVariants,
  enrichedCartItems,
  products,
  region,
  updateCart
}) => {
  const { processPrescription, isProcessing, error } = usePrescriptionAI();

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPrescriptionName(file.name);
    try {
      const aiResult = await processPrescription(file, 'anonymous');
      setPrescriptionSpecs({
        dosage: aiResult.dosage,
        frequency: aiResult.frequency,
        match: aiResult.match,
        matchedProducts: aiResult.matchedProducts
      });
    } catch (err) {
      console.error("AI Prescription processing failed", err);
      // fallback or show error
    }
  };
`;

content = content.slice(0, startIndex) + newProps + content.slice(endIndex);

// replace isScanningPrescription with isProcessing
content = content.replace(/isScanningPrescription/g, "isProcessing");

fs.writeFileSync(file, content);
console.log("Patched PrescriptionUploadSection.");
