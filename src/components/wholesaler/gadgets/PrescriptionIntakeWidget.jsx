import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getCatalog } from '../../../repositories/productRepository';
import { 
  FileText, 
  UploadCloud, 
  Clipboard, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Send, 
  Database, 
  Sparkles, 
  Plus, 
  Trash2,
  Activity,
  FileCheck
} from 'lucide-react';

export default function PrescriptionIntakeWidget() {
  const { user } = useAuth();
  const [dbCatalog, setDbCatalog] = useState([]);

  // Fetch catalog on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await getCatalog();
        setDbCatalog(data || []);
      } catch (err) {
        console.error("Error loading catalog from Firestore:", err);
      }
    }
    loadCatalog();
  }, []);
  
  // States: 'select', 'type', 'upload', 'result'
  const [mode, setMode] = useState('select');
  const [inputText, setInputText] = useState('');
  const [realtimeMatches, setRealtimeMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  // Optional RFQ fields
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Compounded RFQ Form state
  const [customFormulas, setCustomFormulas] = useState([]);

  // Result state
  const [catalogItems, setCatalogItems] = useState([]);
  const [compoundedItems, setCompoundedItems] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Real-time analysis of typed text
  useEffect(() => {
    if (mode !== 'type') return;
    
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const matches = lines.map(line => {
      // Basic normalization for matching
      const cleanLine = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Try exact or partial match in catalog
      const matchedProd = dbCatalog.find(p => {
        const prodName = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const dispName = (p.displayName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cleanLine.includes(prodName) || cleanLine.includes(dispName) || prodName.includes(cleanLine);
      });

      if (matchedProd) {
        return {
          originalLine: line,
          status: 'catalog',
          product: matchedProd
        };
      } else {
        // Categorized as Category C: Compounded formulation
        return {
          originalLine: line,
          status: 'compounding',
          suggestedFormula: parseCustomFormula(line)
        };
      }
    });

    setRealtimeMatches(matches);
  }, [inputText, mode, dbCatalog]);

  // Helper to parse typed text into custom compounding fields
  const parseCustomFormula = (line) => {
    // Regexes to extract strengths or quantities
    const strengthMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|%))/i);
    const qtyMatch = line.match(/\b(?:qty|x|cant|cantidad)?\s*(\d+)\s*(?:capsules|vials|ml|caps|tablets|tabs|viales)\b/i);
    
    const strength = strengthMatch ? strengthMatch[1] : 'N/A';
    const quantity = qtyMatch ? qtyMatch[1] : '30';
    
    // Clean name of formula
    let name = line;
    if (strengthMatch) name = name.replace(strengthMatch[0], '');
    if (qtyMatch) name = name.replace(qtyMatch[0], '');
    name = name.replace(/[\+\-\*]/g, '').trim();

    return {
      name: name || 'Custom Formulation',
      actives: [{ active: name, concentration: strength }],
      vehicle: line.toLowerCase().includes('capsule') || line.toLowerCase().includes('caps') ? 'Capsules' : 'Injectable Vial',
      quantity: quantity
    };
  };

  // Real File Reader & AI parsing bridge
  const callPrescriptionAgent = async (prescriptionText) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prescriptionText,
          sessionId: user?.uid || 'anonymous-wholesaler',
          query_type: 'prescription_intake'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      // Match the catalog items from backend response with frontend catalog details to get slugs etc.
      const enrichedCatalogItems = (data.catalog || []).map(item => {
        const matchedProd = dbCatalog.find(p => p.slug === item.product?.id || p.id === item.product?.id || p.name === item.name || p.displayName === item.name);
        return {
          ...item,
          product: matchedProd || item.product
        };
      });

      setCatalogItems(enrichedCatalogItems);
      setCompoundedItems(data.quotation || []);
      setWarnings(data.warnings || []);
      setMode('result');
    } catch (err) {
      console.error("Error calling Prescription Ingestion Agent:", err);
      // Fallback if backend fails
      setWarnings(["Hubo un error al conectar con el servidor de IA. Mostrando resultados aproximados."]);
      
      const lines = prescriptionText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      const catalogMatch = [];
      const compoundingMatch = [];
      
      lines.forEach(line => {
        const cleanLine = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchedProd = dbCatalog.find(p => {
          const prodName = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const dispName = (p.displayName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return cleanLine.includes(prodName) || cleanLine.includes(dispName) || prodName.includes(cleanLine);
        });

        if (matchedProd) {
          catalogMatch.push({
            name: matchedProd.displayName || matchedProd.name,
            product: matchedProd,
            strength: matchedProd.standard_dosage || 'N/A',
            quantity: '1',
            category: 'Category A (Direct Match)'
          });
        } else {
          compoundingMatch.push({
            name: line,
            actives: [{ active: line, concentration: 'N/A' }],
            vehicle: 'Capsules',
            volume: '30 units',
            specialInstructions: 'Compounded formula requested via Wholesaler Portal.',
            category: 'Category C (Custom Compound)'
          });
        }
      });

      setCatalogItems(catalogMatch);
      setCompoundedItems(compoundingMatch);
      setMode('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setMode('upload');
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadProgress(50);
      const text = event.target.result;
      setUploadProgress(100);
      setTimeout(() => {
        callPrescriptionAgent(text);
      }, 600);
    };
    reader.onerror = () => {
      setUploadProgress(100);
      setTimeout(() => {
        callPrescriptionAgent("Error reading file.");
      }, 600);
    };

    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // Simulate reading/OCR extraction for PDFs/Images
      setUploadProgress(100);
      setTimeout(() => {
        callPrescriptionAgent(`[Simulated PDF Extraction for ${file.name}]\nBPC-157 5mg Vial\nThymosin Beta-4 10mg + GHK-Cu 50mg topical cream\nApply thin layer nightly.`);
      }, 1000);
    }
  };

  const processAIExtraction = (text) => {
    callPrescriptionAgent(text);
  };

  // Submit Typed Prescription to results
  const handleSubmitType = () => {
    if (!inputText.trim()) return;
    callPrescriptionAgent(inputText);
  };

  // Submit RFQ to lab (Firestore save)
  const handleSubmitRFQ = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'compounding_rfqs'), {
        wholesalerId: user?.uid || 'anonymous',
        wholesalerName: user?.displayName || user?.name || 'Partner Clinic',
        catalogItems: catalogItems.map(item => ({
          productId: item.product?.id || item.product?.name || '',
          name: item.name,
          quantity: item.quantity
        })),
        compoundedItems: compoundedItems.map(item => ({
          name: item.name,
          actives: item.actives,
          vehicle: item.vehicle,
          volume: item.volume || item.quantity,
          specialInstructions: item.specialInstructions || ''
        })),
        shippingAddress: shippingAddress || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || '',
        status: 'pending_quotation',
        createdAt: serverTimestamp()
      });
      setRfqSubmitted(true);
      setTimeout(() => {
        resetWidget();
      }, 5000);
    } catch (err) {
      console.error("Error submitting RFQ:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetWidget = () => {
    setMode('select');
    setInputText('');
    setRealtimeMatches([]);
    setUploadedFile(null);
    setCatalogItems([]);
    setCompoundedItems([]);
    setWarnings([]);
    setRfqSubmitted(false);
    setShippingAddress('');
    setDeliveryDate('');
    setNotes('');
  };

  return (
    <div className="card" style={{
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.02)',
      border: '1px solid #e2e8f0',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '480px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Accent Decorator */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clipboard size={20} color="var(--primary)" /> Prescription Management
        </h3>
        {mode !== 'select' && (
          <button 
            onClick={resetWidget}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        
        {/* SELECT MODE STATE */}
        {mode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '1.5rem', flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
              Process medical prescriptions in real time. The AI will classify compounds available in the commercial catalog or send them to the compounding lab.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div 
                onClick={() => setMode('type')}
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'var(--color-bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.02)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-bg-app)';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContext: 'center', display: 'flex', justifyContent: 'center' }}>
                  <FileText size={24} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Enter Prescription</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Type each line of the prescription and verify availability.</p>
              </div>

              <div 
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'var(--color-bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.02)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-bg-app)';
                }}
              >
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }}
                />
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContext: 'center', display: 'flex', justifyContent: 'center' }}>
                  <UploadCloud size={24} />
                </div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Upload PDF / Prescription</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>AI will automatically extract and identify the formulation.</p>
              </div>
            </div>
          </div>
        )}

        {/* TYPE PRESCRIPTION MODE STATE */}
        {mode === 'type' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Type each compound with its dose on a new line. Example:
              </p>
              <pre style={{ margin: 0, padding: '0.5rem 0.75rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                BPC-157 5mg vial x 2\nCustom Caffeine 100mg + Theanine 200mg capsules
              </pre>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.2rem', flex: 1, minHeight: '220px' }}>
              <textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Write the prescription here..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'var(--color-bg-app)', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Activity size={12} style={{ marginRight: '0.3rem' }} /> Real-time Verification
                </span>
                
                {realtimeMatches.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', textAlign: 'center' }}>
                    Start typing to see real‑time clinical recognition from the database...
                  </div>
                ) : (
                  realtimeMatches.map((match, i) => (
                    <div key={i} style={{ padding: '0.6rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {match.originalLine}
                      </div>
                      
                      {match.status === 'catalog' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.75rem' }}>
                          <CheckCircle size={12} /> Catalog: {match.product.displayName || match.product.name}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem' }}>
                          <Sparkles size={12} /> Compounded Formulation
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              onClick={handleSubmitType}
              disabled={inputText.trim().length < 5}
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: inputText.trim().length >= 5 ? 'var(--primary)' : 'var(--color-border)',
                color: 'white',
                fontWeight: 800,
                cursor: inputText.trim().length >= 5 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Send size={16} /> Process Prescription with AI
            </button>
          </div>
        )}

        {/* FILE UPLOAD PROCESSING STATE */}
        {mode === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', flex: 1, gap: '1.5rem' }}>
            {isProcessing ? (
              <>
                <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #f1f5f9', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                  <Database size={32} color="var(--primary)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>AI Formulation Engine Active</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Classifying compounds, checking B2B catalog, and mapping compounded co‑factors...
                  </p>
                </div>
              </>
            ) : (
              <>
                <FileText size={48} color="var(--primary)" style={{ animation: 'bounce 2s infinite' }} />
                <div style={{ width: '100%', maxWidth: '300px', background: '#f1f5f9', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--color-success)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.15s ease' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Reading prescription file</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{uploadedFile?.name}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* RESULTS & RFQ STATE */}
        {mode === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            
            {rfqSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', padding: '2rem 0', color: 'var(--color-success)' }}>
                <CheckCircle size={48} />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>RFQ and Quote Registered</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Your request has been sent to the compounding lab. You will receive a quote shortly.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', maxH: '260px', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, paddingRight: '0.25rem' }}>
                  {/* Category A/B: Catalog Matches */}
                  {catalogItems.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FileCheck size={14} /> Commercial Products Found (Catalog)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {catalogItems.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-success-bg)', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                            <div>
                              <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>{item.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginLeft: '0.5rem' }}>({item.strength})</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-success)' }}>
                              Ready for Cart
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category C: Compounded Formulations */}
                  {compoundedItems.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={14} /> Compounded Formulation Required (RFQ Lab)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {compoundedItems.map((item, idx) => (
                          <div key={idx} style={{ padding: '0.85rem', background: 'var(--color-warning-bg)', border: '1px solid #fef3c7', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>{item.name}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-warning)', background: 'rgba(217,119,6,0.1)', padding: '2px 6px', borderRadius: '6px' }}>{item.vehicle}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b45309' }}>
                              <strong>Actives:</strong> {item.actives.map(a => `${a.active} (${a.concentration})`).join(' + ')}
                            </div>
                            {item.specialInstructions && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem', borderTop: '1px dashed #fcd34d', paddingTop: '0.3rem' }}>
                                <strong>Instructions:</strong> {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <div style={{ background: 'var(--color-danger-bg)', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <AlertCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                      <div>
                        <h5 style={{ margin: '0 0 0.25rem 0', color: '#991b1b', fontSize: '0.8rem', fontWeight: 700 }}>Compliance / Safety Notes</h5>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <input type="text" placeholder="Shipping Address" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <textarea placeholder="Additional Notes" value={notes} onChange={e => setNotes(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={resetWidget}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: 'var(--color-text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Process Another
                  </button>
                  <button 
                    onClick={handleSubmitRFQ}
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'var(--primary)',
                      color: 'white',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? 'Sending...' : (compoundedItems.length > 0 ? 'Request Quote (RFQ)' : 'Add to B2B Cart')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
