const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const startRemove = "  const loadTesseract = () => {";
const endRemove = "  const [orderId, setOrderId] = useState('');";

const startIndex = content.indexOf(startRemove);
const endIndex = content.indexOf(endRemove);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
  
  // also remove isScanningPrescription state
  content = content.replace("const [isScanningPrescription, setIsScanningPrescription] = useState(false);", "");

  fs.writeFileSync(file, content);
  console.log("OCR logic removed.");
} else {
  console.log("Could not find bounds.");
}
