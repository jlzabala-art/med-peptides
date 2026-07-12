const fs = require('fs');
const file = 'src/components/admin/prescriptions/PrescriptionIntakeLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('usePrescriptionAI')) {
  content = content.replace("import { useDropzone } from 'react-dropzone';", "import { useDropzone } from 'react-dropzone';\nimport { usePrescriptionAI } from '../../../hooks/shared/usePrescriptionAI';");
}

const onDropStart = "  const onDrop = useCallback(async (acceptedFiles) => {";
const onDropEnd = "  }, []);";

const startIndex = content.indexOf(onDropStart);
let endIndex = content.indexOf(onDropEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex += onDropEnd.length;
  const replacement = `  const { queuePrescription } = usePrescriptionAI();
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Uploading document...', { id: 'upload-toast' });

      // Reutiliza la función compartida de B2B/B2C para encolar el pipeline de IA
      await queuePrescription(file, 'b2b_portal');

      toast.success('Document uploaded and sent to AI queue!', { id: 'upload-toast' });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, [queuePrescription]);`;

  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log("PrescriptionIntakeLayout patched.");
} else {
  console.log("Could not find onDrop block.");
}
