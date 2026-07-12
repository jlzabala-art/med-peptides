const fs = require('fs');

const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = "  const downloadReceiptPDF = useCallback(() => {";
const endStr = "  const sendOrderEmail = async () => {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const downloadReceiptPDF = useCallback(() => {
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
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping, finalOrderData]);

`;
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log("downloadReceiptPDF replaced successfully!");
} else {
  console.log("Could not find downloadReceiptPDF or sendOrderEmail.");
}
