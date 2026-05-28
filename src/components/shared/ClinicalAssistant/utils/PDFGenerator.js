/* eslint-disable no-unused-vars */
import { jsPDF } from "jspdf";

export async function generateClinicalBriefPDF(messages = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(0, 75, 135); // Med-Peptides Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Med-Peptides", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Clinical Research Assistant Brief", 20, 32);
  
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 70, 32);

  y = 55;

  messages.forEach((msg, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const role = msg.role === 'user' ? 'RESEARCHER' : 'CLINICAL AI';
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(role, 20, y);
    y += 5;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Remove tags from text for PDF
    const cleanText = msg.content
      .replace(/\[EVIDENCE:.*?\]/gi, '')
      .replace(/\[STACK_SYNERGY:.*?\]/gi, '')
      .replace(/\[(?:COMPOUNDS|PEPTIDES):.*?\]/gi, '')
      .replace(/\[PRODUCT:.*?\]/gi, (match, slug) => slug)
      .replace(/\[PROTOCOL:.*?\]/gi, (match, slug) => slug);

    const splitText = doc.splitTextToSize(cleanText, pageWidth - 40);
    doc.text(splitText, 20, y);
    y += (splitText.length * 5) + 10;
  });

  // Footer on each page would be nice, but for now just simple
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Disclaimer: For laboratory research use only. Not for human consumption.", pageWidth / 2, 285, { align: "center" });

  doc.save(`Med-Peptides_Brief_${new Date().toISOString().slice(0, 10)}.pdf`);
}
