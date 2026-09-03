import { useState, useCallback } from 'react';
import { generateClinicalPDF, generatePatientGuide, getCachedProtocolPDF, cacheProtocolPDF } from '../services/pdfService';
import { useToast } from './useToast';
import { trackProtocolPDFDownload } from '../utils/analytics';

/**
 * Triggers a manual download of a Blob in the browser
 */
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Hook to manage asynchronous PDF generation of protocols.
 * Allows programmatic generation of B2B and B2C PDF protocols.
 */
export function useProtocolPDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  /**
   * Generates and downloads the PDF directly in the browser
   * @param {Object} protocol - The protocol object
   * @param {string} audienceType - 'doctor' | 'patient'
   * @param {Object} formData - Optional form data needed by the generators
   * @param {Object} options - Options passed to pdfService
   */
  const generatePDF = useCallback(async (protocol, audienceType = 'doctor', formData = {}, options = {}) => {
    if (!protocol) {
      console.warn("No protocol provided for PDF generation.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Caching (Rendimiento) - Sólo para documentos clínicos (B2B)
      if (audienceType !== 'patient') {
        const cachedUrl = await getCachedProtocolPDF(protocol);
        if (cachedUrl) {
          window.open(cachedUrl, '_blank');
          toast.success("PDF loaded successfully!");
          trackProtocolPDFDownload(protocol.protocol_title || protocol.name, protocol.id, audienceType);
          setIsGenerating(false);
          return;
        }
      }

      // 2. Generation
      let blob;
      const genOpts = { ...options, returnBlob: true };
      if (audienceType === 'patient') {
        blob = await generatePatientGuide(protocol, formData, genOpts);
      } else {
        blob = await generateClinicalPDF(protocol, formData, genOpts);
      }

      if (blob) {
        // 3. Trigger manual download
        const slug = (protocol.protocol_slug || 'PROTOCOL').toUpperCase();
        const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = audienceType === 'patient' 
          ? `REGEN-PATIENT-GUIDE-${dateTag}.pdf` 
          : `REGEN-DOS-ADM-${slug}-${dateTag}.pdf`;
        triggerDownload(blob, filename);

        // 4. Background caching
        cacheProtocolPDF(protocol, blob).catch(e => console.warn("Background cache failed:", e));
      }

      // 5. Toast & Analytics (Notificaciones e Inteligencia)
      toast.success("PDF generated successfully!");
      trackProtocolPDFDownload(protocol.protocol_title || protocol.name, protocol.id, audienceType);
    } catch (err) {
      console.error("Error generating Protocol PDF:", err);
      setError(err.message || 'An error occurred during PDF generation.');
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    isGenerating,
    error,
    generatePDF
  };
}
