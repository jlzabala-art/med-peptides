const fs = require('fs');

const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import for PrescriptionUploadSection and invoiceGenerator
const importStr = "import PrescriptionUploadSection from '../components/checkout/PrescriptionUploadSection';\nimport { generateInvoicePDF, getReceiptHTML, previewReceipt as invoicePreviewReceipt } from '../utils/checkout/invoiceGenerator';\n";
content = content.replace("import PaymentSection from '../components/checkout/PaymentSection';", "import PaymentSection from '../components/checkout/PaymentSection';\n" + importStr);

// 2. Replace the prescription upload card
const rxStartStr = "                  {/* Prescription Upload Card */}";
const rxEndStr = "                    <PaymentSection formData={formData} set={set} isProfessional={isProfessional} />";

const startIndex = content.indexOf(rxStartStr);
const endIndex = content.indexOf(rxEndStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `                  <PrescriptionUploadSection 
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
                  />

`;
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  console.log("Prescription block replaced successfully!");
} else {
  console.log("Could not find prescription block.");
}

// 3. Replace downloadPDF function
const pdfStartStr = "  const downloadPDF = useCallback(async () => {";
const receiptHTMLStartStr = "  const previewReceipt = useCallback(() => {";

const pdfStartIndex = content.indexOf(pdfStartStr);
const pdfEndIndex = content.indexOf(receiptHTMLStartStr);

if (pdfStartIndex !== -1 && pdfEndIndex !== -1) {
  const replacementPDF = `  const downloadPDF = useCallback(async () => {
    generateInvoicePDF({
      targetItems: finalOrderData ? finalOrderData.items : enrichedCartItems,
      targetTotals: finalOrderData ? finalOrderData.totals : checkoutTotals,
      targetOrderId: finalOrderData ? finalOrderData.orderId : orderId,
      targetFormData: finalOrderData ? finalOrderData.formData : formData,
      targetShipping: finalOrderData ? finalOrderData.selectedShipping : selectedShipping,
      protocolGroups
    });
  }, [orderId, formData, enrichedCartItems, protocolGroups, checkoutTotals, selectedShipping, finalOrderData]);

`;
  content = content.slice(0, pdfStartIndex) + replacementPDF + content.slice(pdfEndIndex);
  console.log("downloadPDF replaced successfully!");
} else {
  console.log("Could not find downloadPDF.");
}

// 4. Replace previewReceipt
const newContent = content; // re-read because indices changed
const pRStart = newContent.indexOf("  const previewReceipt = useCallback(() => {");
const dRStart = newContent.indexOf("  const downloadReceiptPDF = useCallback(() => {");

if (pRStart !== -1 && dRStart !== -1) {
  const replacementPR = `  const previewReceipt = useCallback(() => {
    invoicePreviewReceipt({
      targetTotals: finalOrderData ? finalOrderData.totals : checkoutTotals,
      targetItems: finalOrderData ? finalOrderData.items : enrichedCartItems,
      targetOrderId: finalOrderData ? finalOrderData.orderId : orderId,
      targetFormData: finalOrderData ? finalOrderData.formData : formData,
      targetShipping: finalOrderData ? finalOrderData.selectedShipping : selectedShipping
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping]);

`;
  content = newContent.slice(0, pRStart) + replacementPR + newContent.slice(dRStart);
  console.log("previewReceipt replaced successfully!");
} else {
  console.log("Could not find previewReceipt.");
}

// 5. Replace downloadReceiptPDF
const newContent2 = content;
const dRStartIndex = newContent2.indexOf("  const downloadReceiptPDF = useCallback(() => {");
// Find the end of downloadReceiptPDF. It ends before sendOrderEmail
const sOEStart = newContent2.indexOf("  const sendOrderEmail = async () => {");

if (dRStartIndex !== -1 && sOEStart !== -1) {
  const replacementDR = `  const downloadReceiptPDF = useCallback(() => {
    const html = getReceiptHTML({
      targetTotals: finalOrderData ? finalOrderData.totals : checkoutTotals,
      targetItems: finalOrderData ? finalOrderData.items : enrichedCartItems,
      targetOrderId: finalOrderData ? finalOrderData.orderId : orderId,
      targetFormData: finalOrderData ? finalOrderData.formData : formData,
      targetShipping: finalOrderData ? finalOrderData.selectedShipping : selectedShipping
    });
    
    // Auto-print wrapper
    const printHtml = \`
      <!DOCTYPE html>
      <html>
        <head><title>Receipt - \${finalOrderData ? finalOrderData.orderId : orderId}</title></head>
        <body onload="window.print(); window.close();">\${html}</body>
      </html>
    \`;
    const win = window.open('', '_blank', 'width=700,height=900');
    if (win) {
      win.document.write(printHtml);
      win.document.close();
    }
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping]);

`;
  content = newContent2.slice(0, dRStartIndex) + replacementDR + newContent2.slice(sOEStart);
  console.log("downloadReceiptPDF replaced successfully!");
} else {
  console.log("Could not find downloadReceiptPDF.");
}

fs.writeFileSync(file, content);
console.log("Done patching Checkout.jsx");

