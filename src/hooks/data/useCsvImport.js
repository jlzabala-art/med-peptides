import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../../firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

/**
 * Hook to handle CSV file imports, parsing, validation, and batch uploading to Firestore.
 *
 * @param {Object} options
 * @param {string} options.collectionName - Name of the Firestore collection
 * @param {number} [options.batchSize=500] - Number of docs to write per batch
 * @param {Function} [options.schemaValidator] - Optional Zod/Yup validator or custom validation function
 * @param {Function} [options.transformRow] - Optional function to map parsed row into Firestore doc format
 * @param {Function} [options.onSuccess] - Callback when import finishes successfully
 */
export function useCsvImport({
  collectionName,
  batchSize = 500,
  schemaValidator,
  transformRow,
  onSuccess,
}) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  // Generate a template CSV
  const downloadTemplate = (columns, filename = 'template.csv') => {
    const csvContent = 'data:text/csv;charset=utf-8,' + columns.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (file) => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setResults([]);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResult) => {
        const parsedData = parseResult.data;
        const validDocs = [];
        const currentErrors = [];

        // 1. Process and validate rows
        for (let i = 0; i < parsedData.length; i++) {
          let row = parsedData[i];

          if (transformRow) {
            try {
              row = transformRow(row);
            } catch (err) {
              currentErrors.push({ row: i + 1, message: `Transformation error: ${err.message}` });
              continue;
            }
          }

          if (schemaValidator) {
            try {
              schemaValidator(row);
            } catch (err) {
              currentErrors.push({ row: i + 1, message: `Validation error: ${err.message}` });
              continue;
            }
          }

          validDocs.push(row);
        }

        setErrors(currentErrors);

        if (validDocs.length === 0) {
          toast.error('No valid rows found to import.');
          setIsImporting(false);
          return;
        }

        // 2. Upload to Firestore in batches
        try {
          const totalBatches = Math.ceil(validDocs.length / batchSize);
          for (let b = 0; b < totalBatches; b++) {
            const batch = writeBatch(db);
            const slice = validDocs.slice(b * batchSize, (b + 1) * batchSize);

            slice.forEach((docData) => {
              // If the data provides an id, use it. Otherwise, doc() auto-generates.
              let docRef;
              const dataToWrite = { ...docData };

              if (dataToWrite.id) {
                docRef = doc(db, collectionName, dataToWrite.id);
                delete dataToWrite.id;
              } else {
                docRef = doc(collection(db, collectionName));
              }

              batch.set(docRef, dataToWrite, { merge: true });
            });

            await batch.commit();
            setProgress(Math.round(((b + 1) / totalBatches) * 100));
          }

          setResults(validDocs);
          toast.success(`Successfully imported ${validDocs.length} records`);
          if (onSuccess) onSuccess(validDocs);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Error uploading data: ${uploadError.message}`);
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
        setIsImporting(false);
      },
    });
  };

  return {
    importData,
    isImporting,
    progress,
    results,
    errors,
    downloadTemplate,
  };
}
