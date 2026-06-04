import { useState, useRef } from 'react';
import { storage, functions } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

export function useInvoiceUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Bill');
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState(null);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setStep(2);
    setError(null);

    try {
      // 1. Upload to temporary storage
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const storagePath = `temp_imports/${userId || 'anonymous'}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);

      const parseUniversalDocument = httpsCallable(functions, 'parseUniversalDocument');
      const response = await parseUniversalDocument({
        storagePath,
        mimeType: file.type,
        context: 'Invoice',
        instructions: `Expected type: ${docType === 'Bill' ? 'Supplier Bill' : 'Customer Invoice'}. Pay attention to totals, line items, and due dates. IMPORTANT: Also predict the most likely 'accounting_category' (e.g. 'Software Subscriptions', 'Office Supplies', 'Legal Fees', 'Marketing', 'Inventory') based on the line items. Also extract 'due_date'.`
      });

      if (response.data && response.data.success && response.data.items && response.data.items.length > 0) {
        let extracted = response.data.items[0];
        // Ensure type matches user selection
        extracted.type = docType;
        // Provide mock category if the AI didn't return one for the demo
        if (!extracted.accounting_category) {
          extracted.accounting_category = 'Software Subscriptions'; // fallback demo value
        }
        if (!extracted.due_date) {
          extracted.due_date = extracted.date || new Date().toISOString().split('T')[0];
        }
        setParsedData(extracted);
        setStep(3);
      } else {
        throw new Error("Failed to extract invoice data. The AI returned empty results.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while parsing the document.");
      setStep(1); // Go back to upload step
    }
  };

  const handlePushToZoho = async () => {
    setIsPushing(true);
    setError(null);
    try {
      const pushZohoInvoice = httpsCallable(functions, 'pushZohoInvoice');
      const response = await pushZohoInvoice(parsedData);
      
      if (response.data && response.data.success) {
        setStep(4);
      } else {
        throw new Error("Failed to push to Zoho Books.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error communicating with Zoho Books.");
    } finally {
      setIsPushing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFile(null);
    setStep(1);
    setParsedData(null);
    setError(null);
  };

  return {
    file,
    docType,
    setDocType,
    step,
    setStep,
    parsedData,
    isPushing,
    error,
    fileInputRef,
    handleFileChange,
    handleParse,
    handlePushToZoho,
    handleFieldChange,
    resetForm,
  };
}
