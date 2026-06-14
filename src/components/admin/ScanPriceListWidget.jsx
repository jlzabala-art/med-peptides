import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';







import { getFunctions, httpsCallable } from 'firebase/firestore';
import { db, functions } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ScanPriceListWidget({ onClose, onScanComplete }) {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setScanResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1 
  });

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const parsePriceListImage = httpsCallable(functions, 'parsePriceListImage');
          const result = await parsePriceListImage({
            imageBase64: base64Data,
            mimeType: file.type
          });

          if (result.data?.success && result.data?.items) {
            setScanResult(result.data.items);
          } else {
            throw new Error("Failed to parse data");
          }
        } catch (err) {
          console.error("Scanning failed:", err);
          setError(err.message || "An error occurred while scanning the image.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.onerror = () => {
        setIsScanning(false);
        setError("Failed to read the file.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
      setError("An unexpected error occurred.");
    }
  };

  const handleApply = async () => {
    if (!scanResult || scanResult.length === 0) return;
    setIsApplying(true);
    try {
      const promises = scanResult
        .filter(item => item.productId && !item.requires_creation && item.new_cost)
        .map(item => {
          const productRef = doc(db, 'products', item.productId);
          return updateDoc(productRef, {
            guestVialPrice: parseFloat(item.new_cost),
            updatedAt: new Date().toISOString()
          });
        });
      await Promise.all(promises);
      if (onScanComplete) onScanComplete();
      onClose();
    } catch (err) {
      console.error("Failed to apply prices:", err);
      setError("Failed to save some prices. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const matchedItems = scanResult ? scanResult.filter(i => i.productId) : [];
  const unmatchedItems = scanResult ? scanResult.filter(i => !i.productId) : [];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}><BookOpen size={20} /> Scan Price List</h2>
          <button onClick={onClose} style={styles.closeBtn}><XCircle size={24} /></button>
        </div>

        <div style={styles.body}>
          {!scanResult && !isScanning && (
            <div style={styles.dropzoneContainer}>
              <div {...getRootProps()} style={{
                ...styles.dropzone,
                borderColor: isDragActive ? 'var(--primary)' : 'var(--border)',
                backgroundColor: isDragActive ? 'rgba(0,54,102,0.05)' : 'var(--bg-surface)'
              }}>
                <input {...getInputProps()} />
                <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                {file ? (
                  <p style={styles.dropText}>Selected: <strong>{file.name}</strong></p>
                ) : (
                  <p style={styles.dropText}>Drag and drop a price list image here, or click to select</p>
                )}
                <span style={styles.subText}>Supports JPG, PNG, WEBP</span>
              </div>
              {error && (
                <div style={styles.errorBox}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <button 
                onClick={handleScan} 
                disabled={!file} 
                className="admin-quick-btn" 
                style={{ ...styles.scanBtn, opacity: !file ? 0.5 : 1 }}
              >
                Scan with AI <ArrowRight size={16} />
              </button>
            </div>
          )}

          {isScanning && (
            <div style={styles.scanningContainer}>
              <RefreshCw size={32} className="animate-spin" color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={styles.scanningTitle}>Analyzing Image...</h3>
              <p style={styles.scanningText}>Extracting products and matching them to your catalog.</p>
            </div>
          )}

          {scanResult && !isScanning && (
            <div style={styles.resultContainer}>
              <div style={styles.resultHeader}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>AI Extraction Complete</h3>
                <span style={styles.badge}>{scanResult.length} items found</span>
              </div>

              {matchedItems.length > 0 && (
                <div style={styles.resultSection}>
                  <h4 style={styles.sectionTitle}>Ready to Update</h4>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Product (Firebase)</th>
                        <th style={styles.th}>Detected Value</th>
                        <th style={styles.th}>New Guest Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedItems.map((item, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}><strong>{item.peptide_name}</strong> {item.dosage && <span style={styles.mutedText}>({item.dosage})</span>}</td>
                          <td style={styles.td}><span style={styles.mutedText}>"{item.original_text}"</span></td>
                          <td style={styles.td}>
                            <span style={styles.newPrice}>${parseFloat(item.new_cost).toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {unmatchedItems.length > 0 && (
                <div style={styles.resultSection}>
                  <h4 style={{ ...styles.sectionTitle, color: 'var(--warning)' }}>Unmatched Items (Will be ignored)</h4>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Detected Text</th>
                        <th style={styles.th}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unmatchedItems.map((item, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}>{item.original_text}</td>
                          <td style={styles.td}>${parseFloat(item.new_cost || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {error && (
                <div style={styles.errorBox}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <div style={styles.actionRow}>
                <button onClick={() => { setScanResult(null); setFile(null); }} style={styles.secondaryBtn}>Start Over</button>
                <button 
                  onClick={handleApply} 
                  disabled={matchedItems.length === 0 || isApplying} 
                  style={styles.primaryBtn}
                >
                  {isApplying ? <><RefreshCw size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Apply Prices</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-main)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  body: {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1
  },
  dropzoneContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'center'
  },
  dropzone: {
    width: '100%',
    padding: '4rem 2rem',
    border: '2px dashed var(--border)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  dropText: {
    margin: 0,
    fontSize: '1.1rem',
    color: 'var(--text-main)',
    textAlign: 'center'
  },
  subText: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  scanBtn: {
    width: '100%',
    maxWidth: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1.1rem'
  },
  scanningContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 0'
  },
  scanningTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: 'var(--text-main)'
  },
  scanningText: {
    marginTop: '0.5rem',
    color: 'var(--text-muted)'
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '1rem'
  },
  badge: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 600
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-main)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem'
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid var(--border)',
    color: 'var(--text-muted)',
    fontWeight: 600
  },
  tr: {
    borderBottom: '1px solid var(--border)'
  },
  td: {
    padding: '0.75rem 1rem',
    color: 'var(--text-main)'
  },
  mutedText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem'
  },
  newPrice: {
    fontWeight: 700,
    color: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    width: '100%'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)'
  },
  primaryBtn: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600
  }
};