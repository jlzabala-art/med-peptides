const fs = require('fs');
const file = '/Users/joseluiszabala/.gemini/antigravity-ide/brain/304e6595-69a7-41c6-b174-2587300a3029/implementation_plan.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("Extraeremos la lógica de OCR y subida de PDFs de recetas médicas (loadTesseract, loadPdfJs) a su propio componente especializado para no sobrecargar el bundle inicial.",
"**ACTUALIZACIÓN B2C / B2B AI OCR**: Eliminaremos Tesseract y PdfJs por completo. Implementaremos un hook compartido `usePrescriptionAI` que reutilice el pipeline de Inteligencia Artificial del portal (que sube el documento a Firebase Storage y crea una tarea en la colección `inbound_emails` para que la Cloud Function procese el documento con Gemini/Vertex AI). Este hook se consumirá tanto en el Checkout (B2C) como en el Portal (B2B) garantizando la misma IA para ambos.");

content = content.replace("#### [NEW] src/hooks/checkout/useCheckoutSubmit.js\nEncapsulará el envío de la orden a Firestore (`addDoc(collection(db, 'orders'), ...)`), manejo de errores de Auth, registro del usuario y guardado de prescripción.",
"#### [NEW] src/hooks/shared/useOrderSubmit.js (reemplaza useCheckoutSubmit)\nEncapsulará la creación de órdenes (`addDoc(collection(db, 'orders'), ...)`) en un único hook unificado. Esto integrará B2C y B2B, garantizando coherencia en la estructura de datos, registro de usuarios, y guardado de prescripciones para ambas partes.");

fs.writeFileSync(file, content);
console.log("Plan updated.");
