/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Search, Paperclip, FileText, CheckCircle, AlertCircle, X, ClipboardList, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';

const CLINICAL_QUICK_PROMPTS = [
  { label: 'Reconstitute Peptides', text: 'How do I reconstitute a research peptide vial?' },
  { label: 'Calculate Dosage', text: 'Explain how to calculate peptide research dosages.' },
  { label: 'Compare Peptides', text: 'Compare BPC-157 and TB-500.' },
  { label: 'Side Effects & Safety', text: 'What are the potential side effects of research peptides?' },
  { label: 'Research Protocols', text: 'Show me popular research protocols.' },
  { label: 'Purity & Quality', text: 'How is peptide purity tested?' }
];

const ADMIN_QUICK_PROMPTS = [
  { label: 'Inactive Users', text: 'Show me users who have been inactive for more than 30 days.' },
  { label: 'Today\'s Orders', text: 'Summarize today\'s order volume and revenue.' },
  { label: 'Audit Permissions', text: 'Audit admin and wholesaler permissions.' },
  { label: 'Inventory Alerts', text: 'Which products are low in stock?' },
  { label: 'Monthly Report', text: 'Generate a summary of this month\'s platform activity.' },
  { label: 'Pending Invites', text: 'Show me pending invitations older than 7 days.' }
];

const RESEARCH_QUICK_PROMPTS = [
  { label: 'Optimization Goals', text: 'How do I set up my research goals?' },
  { label: 'Track Biomarkers', text: 'What biomarkers should I track for cellular health?' },
  { label: 'Peptide Functions', text: 'Explain the difference between growth hormone secretagogues and bioregulators.' },
  { label: 'Longevity Studies', text: 'Summarize the latest research on longevity peptides.' },
  { label: 'Research Log', text: 'Show me how to log my optimization progress.' },
  { label: 'Anti-Aging Research', text: 'What peptides are currently being researched for anti-aging?' }
];

// PDF.js dynamic CDN loader
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      console.error("Failed to load PDF.js script:", err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

const loadTesseractJs = () => {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tesseract.js@v4.0.1/dist/tesseract.min.js';
    script.onload = () => {
      resolve(window.Tesseract);
    };
    script.onerror = (err) => {
      console.error("Failed to load Tesseract.js script:", err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

const scanCatalogProducts = (text, productsList = []) => {
  const found = [];
  if (!text || !productsList || !productsList.length) return found;

  const textLower = text.toLowerCase();
  productsList.forEach(prod => {
    if (!prod || !prod.name) return;
    const nameLower = prod.name.toLowerCase();
    
    // Look for exact word match or standard contains to prevent false positives on very short names
    const isShort = nameLower.length <= 3;
    let matches = false;
    
    if (isShort) {
      const rx = new RegExp(`\\b${nameLower}\\b`, 'i');
      matches = rx.test(textLower);
    } else {
      matches = textLower.includes(nameLower);
    }

    // Also match synonyms if available
    if (!matches && prod.synonyms && Array.isArray(prod.synonyms)) {
      matches = prod.synonyms.some(syn => {
        const synLower = syn.toLowerCase();
        return synLower.length <= 3 
          ? new RegExp(`\\b${synLower}\\b`, 'i').test(textLower)
          : textLower.includes(synLower);
      });
    }

    if (matches) {
      if (!found.some(f => f.id === prod.id || f.name === prod.name)) {
        found.push(prod);
      }
    }
  });
  return found;
};

export default function ChatInputBar({ 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  isListening, 
  startListening, 
  stopListening,
  voiceSupported,
  products = [],
  autocompleteCandidates = [],
  messages = [],
  suggestions = [],
  isTyping = false,
  contextMode = 'clinical',
  onUploadPrice,
  onUploadStock
}) {
  const { isProfessional } = useAuth();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [extractedSpecs, setExtractedSpecs] = useState({ dosage: '', frequency: '' });
  const [selectedVariants, setSelectedVariants] = useState({});
  const [placeholder, setPlaceholder] = useState("Ask ClinicalAI or upload...");
  const [isFocused, setIsFocused] = useState(false);

  const themeAccent = contextMode === 'admin' ? '#1a73e8' : contextMode === 'doctor' ? '#0f9d58' : '#4285f4';
  const themeBgActive = contextMode === 'admin' ? '#e8f0fe' : contextMode === 'doctor' ? '#e6f4ea' : '#e8f0fe';
  const themeScanBg = contextMode === 'admin' ? 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)' : contextMode === 'doctor' ? 'linear-gradient(135deg, #0f9d58 0%, #0b7843 100%)' : 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)';
  const themeScanShadow = contextMode === 'admin' ? '0 4px 10px rgba(26,115,232,0.25)' : contextMode === 'doctor' ? '0 4px 10px rgba(15,157,88,0.25)' : '0 4px 10px rgba(66,133,244,0.25)';

  React.useEffect(() => {
    const handleResize = () => {
      const isAd = contextMode === 'admin';
      const isDoc = contextMode === 'doctor';
      if (window.innerWidth < 640) {
        setPlaceholder(isAd ? "Ask AdminAI..." : isDoc ? "Ask ClinicalAI..." : "Ask ResearchAI...");
      } else {
        setPlaceholder(
          isAd 
            ? "Ask AdminAI or upload system log..." 
            : isDoc 
              ? "Ask ClinicalAI or upload clinical protocol/case..." 
              : "Ask ResearchAI or upload goal/activity log..."
        );
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [contextMode]);

  const getVariantDisplayPrice = (prod, variant) => {
    const tier = isProfessional ? 'pro' : 'guest';
    if (variant.pricing) {
      const entry = variant.pricing[tier] || variant.pricing.retail || variant.pricing.guest;
      if (entry && (entry.perUnit || entry.unit)) {
        return `$${entry.perUnit || entry.unit}`;
      }
    }
    if (variant.price) return `$${variant.price}`;
    if (variant.perVialPriceUSD) return `$${variant.perVialPriceUSD}`;
    if (prod.price) return `$${prod.price}`;
    if (prod.perVialPriceUSD) return `$${prod.perVialPriceUSD}`;
    return '$45.00';
  };

  React.useEffect(() => {
    const handleTriggerUpload = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    window.addEventListener('trigger-prescription-upload', handleTriggerUpload);
    return () => {
      window.removeEventListener('trigger-prescription-upload', handleTriggerUpload);
    };
  }, []);

  // File Upload State
  const fileInputRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.length >= 2) {
      const filtered = autocompleteCandidates.filter(c => 
        c && typeof c.label === 'string' && c.label.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
      setActiveIndex(0);
    } else {
      setShowAutocomplete(false);
    }
  };

  const selectSuggestion = (s) => {
    onSend(`Tell me about ${s.label}`);
    setInput('');
    setShowAutocomplete(false);
  };

  const handleKeyDown = (e) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    } else if (e.key === 'Enter') {
      onSend();
    }
  };

  // Document Scanning Methods
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsAnalyzing(true);
    setMatchedProducts([]);
    setErrorMessage('');
    setExtractedText('');

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        text = fullText;
      } else if (file.type.startsWith('image/')) {
        const tesseract = await loadTesseractJs();
        const result = await tesseract.recognize(file, 'eng');
        text = result.data.text;
      } else if (file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported file format. Please upload a PDF, Image, TXT or CSV file.');
      }

      if (!text.trim()) {
        throw new Error('The document appears to be empty or contains no extractable text.');
      }

      setExtractedText(text);
      const matches = scanCatalogProducts(text, products);
      setMatchedProducts(matches);

      const dosageRegex = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|µg)\b/i;
      const dosageMatch = text.match(dosageRegex);
      const extractedDose = dosageMatch ? dosageMatch[0].toLowerCase().replace(/\s+/g, '') : '';

      const initialSelected = {};
      matches.forEach(prod => {
        const vars = prod.variants || [];
        const matchedVar = vars.find(v => {
          const vDose = (v.dosage || v.strength || v.size || '').toLowerCase().replace(/\s+/g, '');
          return extractedDose && vDose.includes(extractedDose);
        });
        if (matchedVar) {
          initialSelected[prod.id || prod.name] = matchedVar.variantId || matchedVar.id;
        } else if (vars.length > 0) {
          initialSelected[prod.id || prod.name] = vars[0].variantId || vars[0].id;
        }
      });
      setSelectedVariants(initialSelected);

      const frequencyRegex = /\b(?:weekly|daily|twice\s+a\s+week|every\s+other\s+day|subcutaneous|sub-q|sc|im|intramuscular|qd|qhs|biw)\b/i;
      const frequencyMatch = text.match(frequencyRegex);

      setExtractedSpecs({
        dosage: dosageMatch ? dosageMatch[0] : 'Not specified',
        frequency: frequencyMatch ? frequencyMatch[0] : 'Not specified'
      });

      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing document:', err);
      setErrorMessage(err.message || 'Error processing document.');
      setIsAnalyzing(false);
    }

    e.target.value = '';
  };

  const handleClearAnalysis = () => {
    setFileName('');
    setExtractedText('');
    setMatchedProducts([]);
    setErrorMessage('');
    setIsAnalyzing(false);
    setExtractedSpecs({ dosage: '', frequency: '' });
  };

  const handleAskAI = () => {
    if (!extractedText) return;
    
    const prompt = `[DOC_ANALYSIS] I have uploaded a research document named "${fileName}". Here is the extracted text from it:

${extractedText.slice(0, 3000)}

Please perform a thorough clinical and research analysis of these compounds. Focus on:
1. Identifying which of these compounds are in our current catalog (${matchedProducts.map(p => p.name).join(', ') || 'none'}).
2. Detailing the standard scientific research protocols, dosages, and mechanisms of action for the identified compounds.
3. Suggesting complementary stacks or secondary goals (e.g. recovery, longevity) from our catalog.`;
    
    onSend(prompt);
    handleClearAnalysis();
  };

  return (
    <div className="ca-input-bar-container" style={{ padding: '0.75rem 0', borderTop: '1px solid #f1f5f9', backgroundColor: 'white', position: 'relative' }}>
      <AnimatePresence>
        {showAutocomplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '1.25rem',
              right: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              marginBottom: '0.5rem',
              zIndex: 1000
            }}
          >
            {filteredSuggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => selectSuggestion(s)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: i === activeIndex ? 'var(--color-bg-app)' : 'transparent',
                  borderBottom: i === filteredSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  backgroundColor: s.type === 'compound' ? 'rgba(0,75,135,0.06)' : 'rgba(16,185,129,0.06)',
                  color: s.type === 'compound' ? 'var(--primary)' : 'var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Search size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.label}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>{s.type}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.txt,.csv,image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: 'none' }}
      />
      <input 
        type="file" 
        id="price-upload-input"
        onChange={(e) => {
          if (e.target.files[0] && onUploadPrice) {
            onUploadPrice(e.target.files[0]);
          }
          e.target.value = '';
        }}
        accept=".pdf,.csv,.xlsx,.xls"
        style={{ display: 'none' }}
      />
      <input 
        type="file" 
        id="stock-upload-input"
        onChange={(e) => {
          if (e.target.files[0] && onUploadStock) {
            onUploadStock(e.target.files[0]);
          }
          e.target.value = '';
        }}
        accept=".pdf,.csv,.xlsx,.xls"
        style={{ display: 'none' }}
      />
 
      {/* File Analysis Preview Card */}
      <AnimatePresence>
        {(isAnalyzing || fileName) && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            style={{
              marginBottom: '0.75rem',
              backgroundColor: '#fafafa',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={handleClearAnalysis}
              style={{
                position: 'absolute',
                top: '0.6rem',
                right: '0.6rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={14} />
            </button>
 
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
                {fileName}
              </span>
            </div>
 
            {isAnalyzing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
                <div className="spinner-small" style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(0, 75, 135, 0.15)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  Extracting text and scanning catalog...
                </span>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : errorMessage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '0.72rem', fontWeight: 600 }}>
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <div>
                {/* Extracted Specifications Chips with options to edit/correct */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '0.85rem' }}>
                  <div style={{
                    flex: 1,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
                  }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      📋 Extracted Dose
                    </span>
                    <input 
                      type="text"
                      value={extractedSpecs.dosage}
                      onChange={(e) => setExtractedSpecs(prev => ({ ...prev, dosage: e.target.value }))}
                      style={{
                        border: 'none',
                        borderBottom: '1px dashed #cbd5e1',
                        fontSize: '0.78rem',
                        color: '#0f172a',
                        fontWeight: 800,
                        backgroundColor: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                        width: '100%'
                      }}
                      placeholder="Enter dose..."
                    />
                  </div>
                  
                  <div style={{
                    flex: 1,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
                  }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      🕒 Extracted Freq
                    </span>
                    <input 
                      type="text"
                      value={extractedSpecs.frequency}
                      onChange={(e) => setExtractedSpecs(prev => ({ ...prev, frequency: e.target.value }))}
                      style={{
                        border: 'none',
                        borderBottom: '1px dashed #cbd5e1',
                        fontSize: '0.78rem',
                        color: '#0f172a',
                        fontWeight: 800,
                        backgroundColor: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                        width: '100%'
                      }}
                      placeholder="Enter frequency..."
                    />
                  </div>
                </div>
 
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                  {matchedProducts.length > 0 ? (
                    <span style={{ color: 'var(--color-success)' }}>
                      ✓ Detected Catalog Compounds
                    </span>
                  ) : (
                    "No direct catalog matches detected. You can still consult the Clinical AI."
                  )}
                </div>
 
                {matchedProducts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    {matchedProducts.map((p, idx) => {
                      const vars = p.variants || [];
                      const selectedVarId = selectedVariants[p.id || p.name] || (vars[0]?.variantId || vars[0]?.id);
                      const activeVar = vars.find(v => (v.variantId || v.id) === selectedVarId) || vars[0] || p;
                      const activePrice = getVariantDisplayPrice(p, activeVar);
                      
                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 800 }}>
                              {p.productType === 'supplement' || p.category?.toLowerCase() === 'supplements' ? '🌿' : '🧪'} {p.name}
                            </span>
                            {vars.length > 1 ? (
                              <select 
                                value={selectedVarId} 
                                onChange={(e) => setSelectedVariants(prev => ({ ...prev, [p.id || p.name]: e.target.value }))}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.64rem',
                                  color: 'var(--color-text-secondary)',
                                  backgroundColor: 'var(--color-bg-app)',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  marginTop: '2px',
                                  width: 'fit-content'
                                }}
                              >
                                {vars.map(v => {
                                  const label = v.dosage || v.strength || v.size || v.name || 'Standard option';
                                  const priceStr = getVariantDisplayPrice(p, v);
                                  return (
                                    <option key={v.variantId || v.id} value={v.variantId || v.id}>
                                      {label} ({priceStr})
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <span style={{ fontSize: '0.64rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                {activeVar.dosage || activeVar.strength || activeVar.size || 'Standard option'} • {activePrice}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => {
                              const addDose = activeVar.dosage || activeVar.strength || activeVar.size || null;
                              window.dispatchEvent(new CustomEvent('add-to-cart-direct', { 
                                detail: { 
                                  product: {
                                    name: p.name,
                                    dosage: addDose
                                  } 
                                } 
                              }));
                            }}
                            style={{
                              background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 1px 4px rgba(0,75,135,0.15)',
                              flexShrink: 0
                            }}
                          >
                            + Add to Order
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
 
                {/* Essential Accessories section */}
                {matchedProducts.length > 0 && (
                  <div style={{
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '0.75rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      📦 Recommended Reconstitution & Injectables
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {products.filter(p => p && p.name && (
                        p.name.toLowerCase().includes('water') || 
                        p.name.toLowerCase().includes('bacteriostatic') || 
                        p.name.toLowerCase().includes('syringe') || 
                        p.name.toLowerCase().includes('insulin')
                      )).slice(0, 2).map((acc, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.75rem',
                          backgroundColor: 'rgba(0, 75, 135, 0.02)',
                          border: '1px solid rgba(0, 75, 135, 0.05)',
                          borderRadius: '10px',
                          fontSize: '0.70rem'
                        }}>
                          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 750 }}>
                            {acc.name.toLowerCase().includes('water') ? '💧' : '💉'} {acc.name}
                          </span>
                          <button 
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('add-to-cart-direct', { detail: { product: acc } }));
                            }}
                            style={{
                              backgroundColor: 'white',
                              color: 'var(--primary)',
                              border: '1px solid var(--primary)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'var(--primary)';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.color = 'var(--primary)';
                            }}
                          >
                            + Bundle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
 
                {matchedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      matchedProducts.forEach(p => {
                        const vars = p.variants || [];
                        const selectedVarId = selectedVariants[p.id || p.name] || (vars[0]?.variantId || vars[0]?.id);
                        const activeVar = vars.find(v => (v.variantId || v.id) === selectedVarId) || vars[0] || p;
                        const addDose = activeVar.dosage || activeVar.strength || activeVar.size || null;
                        
                        window.dispatchEvent(new CustomEvent('add-to-cart-direct', { 
                          detail: { 
                            product: {
                              name: p.name,
                              dosage: addDose
                            } 
                          } 
                        }));
                      });
                      const accessories = products.filter(p => p && p.name && (
                        p.name.toLowerCase().includes('water') || 
                        p.name.toLowerCase().includes('bacteriostatic') || 
                        p.name.toLowerCase().includes('syringe') || 
                        p.name.toLowerCase().includes('insulin')
                      )).slice(0, 2);
                      accessories.forEach(acc => {
                        window.dispatchEvent(new CustomEvent('add-to-cart-direct', { detail: { product: acc } }));
                      });
                      alert('🎉 All selected compounds & essential reconstitution supplies successfully added to your cart!');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '0.5rem',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.18)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.filter = 'brightness(1.05)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    🛒 Add Entire Prescription Bundle to Cart
                  </button>
                )}
 
                <button
                  onClick={handleAskAI}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '12px',
                    backgroundColor: themeAccent,
                    color: 'white',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${themeAccent}2D`
                  }}
                  onMouseEnter={e => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = `${themeAccent}D9`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = themeAccent;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                    Consult {contextMode === 'admin' ? 'Admin Assistant' : contextMode === 'doctor' ? 'Clinical Advisor' : 'Research Assistant'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Smart Quick Prompts / Contextual Suggestions Bar */}
      {!showAutocomplete && !fileName && !(isLoading || isTyping) && (
        <div style={{ position: 'relative', width: '100%' }}>
          <div className="quick-prompts-fade-left" />
          <div className="quick-prompts-fade-right" />
          <div 
            className="quick-prompts-scroll"
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '0.5rem', 
              paddingBottom: '0.75rem'
            }}
          >
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((s, index) => {
                const labelText = typeof s === 'string' ? s : s.label || s.payload || '';
                return (
                  <button
                    key={index}
                    onClick={() => onSend(s)}
                    style={{
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: 'var(--color-bg-surface)',
                      color: 'var(--color-text-secondary)',
                      borderRadius: '20px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      outline: 'none',
                      flexShrink: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = `${themeAccent}0D`;
                      e.currentTarget.style.borderColor = themeAccent;
                      e.currentTarget.style.color = themeAccent;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {labelText}
                  </button>
                );
              })
            ) : (
              (contextMode === 'admin' ? ADMIN_QUICK_PROMPTS : contextMode === 'doctor' ? CLINICAL_QUICK_PROMPTS : RESEARCH_QUICK_PROMPTS).map((p, index) => (
                <button
                  key={`quick-${index}`}
                  onClick={() => onSend(p.text)}
                  style={{
                    border: `1px solid ${themeAccent}1C`,
                    backgroundColor: 'var(--color-bg-app)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '20px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    outline: 'none',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = `${themeAccent}0F`;
                    e.currentTarget.style.borderColor = themeAccent;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-app)';
                    e.currentTarget.style.borderColor = `${themeAccent}1C`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
 
      <div className="ca-input-bar-row" style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '0.5rem', 
        backgroundColor: 'var(--color-bg-app)', 
        padding: '0.4rem 0.6rem', 
        borderRadius: '4px',
        border: `1px solid ${isFocused ? themeAccent : 'var(--color-border)'}`,
        boxShadow: isFocused ? `0 0 0 1px ${themeAccent}` : 'inset 0 1px 2px rgba(0,0,0,0.02)',
        transition: 'all 0.2s',
        minHeight: '40px'
      }}>
        {/* Simple Attachment Button */}
        {contextMode === 'admin' && (
          <>
            <button
              onClick={() => document.getElementById('price-upload-input').click()}
              disabled={isAnalyzing || isLoading}
              className="ca-scan-btn"
              style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'transparent',
                color: 'var(--color-text-tertiary)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
              }}
              title="Upload Supplier Price Catalog (PDF/CSV)"
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'; e.currentTarget.style.color = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => document.getElementById('stock-upload-input').click()}
              disabled={isAnalyzing || isLoading}
              className="ca-scan-btn"
              style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'transparent',
                color: 'var(--color-text-tertiary)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
              }}
              title="Upload Stock File (PDF/CSV)"
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'; e.currentTarget.style.color = '#f59e0b'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
            >
              <ClipboardList size={18} />
            </button>
          </>
        )}
        <button
          onClick={handleFileClick}
          disabled={isAnalyzing || isLoading}
          className="ca-scan-btn"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'transparent',
            color: 'var(--color-text-tertiary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          title="Attach document or image"
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
            e.currentTarget.style.color = themeAccent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
          }}
        >
          <Paperclip size={18} />
        </button>

        <textarea 
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0.45rem 0',
            fontSize: '0.9rem',
            lineHeight: '1.45',
            color: 'var(--color-text-primary)',
            resize: 'none',
            maxHeight: '120px',
            fontWeight: 500,
            overflowY: 'auto',
            alignSelf: 'center',
            minWidth: 0
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button 
            onClick={() => onSend()}
            disabled={!input.trim() || isLoading}
            className="ca-send-btn"
            title="Send message"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: (!input.trim() || isLoading) ? 'var(--color-bg-surface)' : themeAccent,
              color: (!input.trim() || isLoading) ? 'var(--color-text-tertiary)' : 'white',
              border: (!input.trim() || isLoading) ? '1px solid var(--color-border)' : 'none',
              cursor: (!input.trim() || isLoading) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 0 10px ${themeAccent}4D`;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Send 
              size={16} 
              color={(!input.trim() || isLoading) ? 'var(--color-text-tertiary)' : 'white'} 
              style={{ flexShrink: 0 }} 
            />
          </button>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
        AI may make mistakes. Verify important information.
      </div>
    </div>
  );
}
