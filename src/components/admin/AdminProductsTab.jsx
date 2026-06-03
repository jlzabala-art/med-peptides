/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Search,
  Copy,
  Download,
  UploadCloud,
  Percent,
  ArrowUpRight,
  XCircle,
  EyeOff,
  Eye,
  Trash2,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  ClipboardList,
  Bot,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Activity,
  FileText,
  LineChart,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../ui/DataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';
import { catalogRepository } from '../../repositories/catalogRepository';
import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import InlineEditField from '../ui/InlineEditField';
import BulkOrderSelectionModal from './BulkOrders/BulkOrderSelectionModal';
import TooltipWrapper from '../ui/TooltipWrapper';
import AdminPageHeader from './AdminPageHeader';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

// ─── ProductMicrosite Component ────────────────────────────────────────────────
function ProductMicrosite({ product, onUpdateProduct }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(product.clinical_summary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: `Hello! I'm Atlas AI. I've loaded the data for ${product.name}. What would you like to know about its clinical applications or interactions?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('clinical'); // 'clinical', 'inventory', 'protocols', 'ai'
  const [relatedProtocols, setRelatedProtocols] = useState([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    async function fetchBatches() {
      setLoadingBatches(true);
      try {
        // Querying all batches for this product (needs where if it scales, but filtering here for now to avoid needing composite indexes if we order)
        // A simple where is fine:
        const { query, where, collection, getDocs } = await import('firebase/firestore');
        const docsRef = collection(db, 'uploaded_documents');
        const q = query(docsRef, where('productId', '==', product.id));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by date
        data.sort((a, b) => {
          const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return d2 - d1;
        });
        setBatches(data);
      } catch (err) {
        console.error('Error fetching batches', err);
      } finally {
        setLoadingBatches(false);
      }
    }
    fetchBatches();
  }, [product.id, product.sku]);

  useEffect(() => {
    async function fetchRelatedProtocols() {
      setLoadingProtocols(true);
      try {
        const protocolsRef = collection(db, 'protocols');
        const snap = await getDocs(protocolsRef);
        const allProtocols = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const matched = allProtocols.filter(p => {
          if (!p.phases) return false;
          return p.phases.some(phase => 
            phase.items && phase.items.some(item => item.productId === product.id || item.productId === product.sku)
          );
        });
        setRelatedProtocols(matched);
      } catch (err) {
        console.error('Error fetching related protocols', err);
      } finally {
        setLoadingProtocols(false);
      }
    }
    fetchRelatedProtocols();
  }, [product.id, product.sku]);

  useEffect(() => {
    if (!product.materia_medica && !product.clinical_summary) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        const mockSummary = `**${product.name}** is typically categorized under ${product.category}. \n\n### Mechanism of Action\nData not available. Please wait for the auto-enrichment script to process this product.\n\n### Clinical Applications\n- N/A\n\n### Contraindications\n- N/A`;
        setSummary(mockSummary);
        setIsGenerating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [product]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newLog = [...chatLog, { role: 'user', text: chatInput }];
    setChatLog(newLog);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setChatLog([...newLog, { 
        role: 'ai', 
        text: `Based on the clinical profile of ${product.name}, I am analyzing the provided Materia Medica. (This is a placeholder for the actual ClinicDAG LLM integration which will be hooked up shortly).` 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const materia = product.materia_medica;

  const AccordionHeader = ({ title, subtitle, icon: Icon, id }) => {
    const isExpanded = expandedAccordion === id;
    return (
      <button 
        type="button"
        onClick={() => setExpandedAccordion(isExpanded ? null : id)}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
        style={{ 
          width: '100%',
          padding: '1.25rem 1.5rem', 
          backgroundColor: isExpanded ? '#f8fafc' : '#ffffff', 
          borderBottom: '1px solid #e2e8f0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          outline: 'none',
          border: 'none',
          textAlign: 'left'
        }}
        onFocus={(e) => e.target.style.boxShadow = 'inset 0 0 0 2px #3b82f6'}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
        onMouseEnter={(e) => { if (!isExpanded) e.target.style.backgroundColor = '#f8fafc'; }}
        onMouseLeave={(e) => { if (!isExpanded) e.target.style.backgroundColor = '#ffffff'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '8px',
            backgroundColor: isExpanded ? '#eff6ff' : '#f1f5f9',
            color: isExpanded ? '#2563eb' : '#64748b',
            transition: 'all 0.2s ease'
          }}>
            {Icon && <Icon size={20} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: isExpanded ? '#0f172a' : '#334155' }}>{title}</span>
            {subtitle && <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', backgroundColor: isExpanded ? '#e2e8f0' : 'transparent' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
    );
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      margin: '0.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>




      {/* Accordion 1: Clinical Information */}
      <AccordionHeader 
        title="Clinical Information" 
        subtitle="Materia Medica, MOA, and contraindications"
        icon={Stethoscope}
        id="clinical" 
      />
      <div 
        id="accordion-content-clinical"
        style={{ 
          display: expandedAccordion === 'clinical' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {isGenerating ? (
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', borderWidth: '0.15em' }}></span>
            Checking AI Data...
          </div>
        ) : materia ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, paddingBottom: '1rem' }}>
            
            {/* CAS Number Header if present */}
            {product.casNumber && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CAS Registry Number</span>
                <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, fontSize: '1rem' }}>{product.casNumber}</span>
              </div>
            )}

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#0f172a', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Mechanism of Action</h4>
              <p style={{ margin: 0, textAlign: 'justify' }}>{materia.mechanism_of_action}</p>
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#0f172a', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Clinical Applications</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {materia.clinical_applications?.map((app, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{app}</li>
                ))}
              </ul>
            </div>

            {materia.contraindications && materia.contraindications.length > 0 && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#991b1b', fontWeight: 700, borderBottom: '2px solid #fecaca', paddingBottom: '0.5rem' }}>Contraindications & Interactions</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#b91c1c' }}>
                  {materia.contraindications.map((ci, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{ci}</li>
                  ))}
                </ul>
              </div>
            )}

            {materia.references && materia.references.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scientific References</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                  {materia.references.map((ref, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s', ':hover': { color: '#2563eb' } }}>
                        {ref.title || 'View Study'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Contact Action */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                onClick={() => window.location.href = `/admin/messages?to=medical_team&product=${product.sku}`} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#334155'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
              >
                <MessageSquare size={18} /> Request Additional Information
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ 
              __html: summary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h4 style="margin: 1.5rem 0 0.5rem; font-size: 1rem; color: #0f172a; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">$1</h4>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/\n- /g, '<br/>&bull; ') 
            }}
          />
        )}
      </div>

      {/* Accordion 2: Batches & CoAs */}
      <AccordionHeader 
        title="Batches & CoAs" 
        subtitle="Quality control and laboratory certificates"
        icon={FileText}
        id="batches" 
      />
      <div 
        id="accordion-content-batches"
        style={{ 
          display: expandedAccordion === 'batches' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out',
          backgroundColor: '#f8fafc'
        }}
      >
        {loadingBatches ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading batches...</div>
        ) : batches.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No batches or CoAs registered for this product.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {batches.map(batch => (
              <div key={batch.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Document: {batch.fileName || batch.id}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', fontWeight: 600 }}>{batch.documentType || 'CoA'}</span>
                  </div>
                </div>
                
                {batch.extractedData && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Peptide</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.peptide_name || 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Dosage</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.dosage || 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>HPLC Purity</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.purity_percentage || batch.extractedData.purityHPLC ? `${batch.extractedData.purity_percentage || batch.extractedData.purityHPLC}` : 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Net Content</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.netPeptideContent ? `${batch.extractedData.netPeptideContent}` : 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Result / Status</span><span style={{ fontWeight: 700, color: batch.extractedData.conclusion === 'Pass' || batch.extractedData.conclusion === 'Approved' ? '#10b981' : '#f59e0b' }}>{batch.extractedData.conclusion || 'N/A'}</span></div>
                  </div>
                )}
                
                {batch.url && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <a href={batch.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FileText size={14} /> View Original Document (PDF) &rarr;
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: AI Access */}
      <AccordionHeader 
        title="AI Access (ClinicDAG Assistant)" 
        subtitle="Chat with AI about this specific product"
        icon={Bot}
        id="ai" 
      />
      <div 
        id="accordion-content-ai"
        style={{ 
          display: expandedAccordion === 'ai' ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Atlas AI Q&A</span>
          </div>
          <div style={{ padding: '1.5rem', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {msg.role === 'user' ? 'You' : 'Atlas AI'}
                </span>
                <div style={{
                  backgroundColor: msg.role === 'user' ? '#0f172a' : '#f1f5f9',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  borderBottomRightRadius: msg.role === 'user' ? 0 : '8px',
                  borderBottomLeftRadius: msg.role === 'ai' ? 0 : '8px',
                  fontSize: '0.85rem',
                  maxWidth: '85%',
                  lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                Atlas AI is typing...
              </div>
            )}
          </div>
          <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask something about the clinical profile..."
              style={{ flex: 1, padding: '1rem 1.5rem', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#0f172a' }}
            />
            <button type="submit" disabled={!chatInput.trim() || isTyping} style={{ padding: '0 1.5rem', backgroundColor: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', opacity: (!chatInput.trim() || isTyping) ? 0.5 : 1 }}>
              Send
            </button>
          </form>
        </div>
      {/* Accordion 4: Competitor Tracking */}
      <AccordionHeader 
        title="Competitor Analysis (Track Pricing)" 
        subtitle="Monitor competitor prices daily"
        icon={LineChart}
        id="competitors" 
      />
      <div 
        id="accordion-content-competitors"
        style={{ 
          display: expandedAccordion === 'competitors' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out',
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Active Price Monitoring</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              If you enable this option, the scraper will search for this product's prices in competitors' catalogs every night.
            </p>
          </div>
          <AppStatusToggle 
            isActive={!!product.trackCompetitors}
            onToggle={() => {
              if (onUpdateProduct) {
                onUpdateProduct(product.id, { trackCompetitors: !product.trackCompetitors });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsTab({
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All'],
  isWholesaler = false,
}) {
  const { isAdmin, user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearchTerm(searchVal);
    }
  }, [searchParams]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterZoho, setFilterZoho] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [bulkMode, setBulkMode] = useState(null);
  const [bulkValue, setBulkValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [importing, setImporting] = useState(false);
  const [savingProduct, setSavingProduct] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [catalogSelectMode, setCatalogSelectMode] = useState(false);
  const [myCatalogs, setMyCatalogs] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  // Bulk Orders Modal State
  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false);
  const [productsToBulkOrder, setProductsToBulkOrder] = useState([]);

  // Pagination State (Firestore)
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Pagination State (Local UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterStock, filterWarehouse, filterZoho, filterSource, dateRange]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(loadMore = false) {
    try {
      if (!loadMore) setLoading(true);
      
      let q;
      if (loadMore && lastVisible) {
        q = query(collection(db, 'products'), orderBy('name'), startAfter(lastVisible), limit(50));
      } else {
        q = query(collection(db, 'products'), orderBy('name'), limit(50));
      }
      
      const querySnapshot = await getDocs(q);
      const newDocs = querySnapshot.docs;
      
      if (newDocs.length < 50) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (newDocs.length > 0) {
        setLastVisible(newDocs[newDocs.length - 1]);
      }

      let productsList = newDocs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Filter if restricted by allowedCategories
      if (!allowedCategories.includes('All')) {
        productsList = productsList.filter((p) => allowedCategories.includes(p.category));
      }

      if (loadMore) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = productsList.filter(p => !existingIds.has(p.id));
          const updated = [...prev, ...uniqueNew];
          // Inject data context for Atlas AI
          const lowStock = updated.filter(p => (p.stock || 0) < 20);
          const outOfStock = updated.filter(p => (p.stock || 0) === 0);
          window.dispatchEvent(new CustomEvent('admin-context-update', {
            detail: {
              page: 'products',
              totalProducts: updated.length,
              lowStockCount: lowStock.length,
              outOfStockCount: outOfStock.length,
              categories: [...new Set(updated.map(p => p.category).filter(Boolean))],
              lowStockItems: lowStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })),
              summary: `Product catalog: ${updated.length} products loaded. ${outOfStock.length} out of stock, ${lowStock.length} with low stock (<20 units).`
            }
          }));
          return updated;
        });
      } else {
        setProducts(productsList);
        // Inject data context for Atlas AI
        const lowStock = productsList.filter(p => (p.stock || 0) < 20);
        const outOfStock = productsList.filter(p => (p.stock || 0) === 0);
        window.dispatchEvent(new CustomEvent('admin-context-update', {
          detail: {
            page: 'products',
            totalProducts: productsList.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            categories: [...new Set(productsList.map(p => p.category).filter(Boolean))],
            lowStockItems: lowStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })),
            summary: `Product catalog: ${productsList.length} products loaded. ${outOfStock.length} out of stock, ${lowStock.length} with low stock (<20 units).`
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleMigrate() {
    if (readOnly) return;
    setMigrating(true);
    toast.info('Migration already completed. Products live in Firestore.');
    setMigrating(false);
  };

  async function handleUpdateProduct(id, updates) {
    if (readOnly) return;
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product.');
    } finally {
      setSavingProduct(null);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;

    const headers = [
      'ID',
      'SKU',
      'Name',
      'Category',
      'Dosage',
      'Guest Vial Price',
      'Guest Kit Price',
      'Pro Vial Price',
      'Pro Kit Price',
      'Stock',
      'Warehouse',
    ];
    if (!hideCosts && isAdmin) headers.push('Cost Price', 'Supplier');
    headers.push('Active');

    const csvContent = [
      headers.join(','),
      ...products.map((p) => {
        const row = [
          p.id,
          `"${p.sku || ''}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.dosage}"`,
          p.guestVialPrice,
          p.guestKitPrice,
          p.proVialPrice,
          p.proKitPrice,
          p.stock || 0,
          `"${p.warehouse || 'Poland'}"`,
        ];
        if (!hideCosts && isAdmin) row.push(p.costPrice || 0, `"${p.supplier || ''}"`);
        row.push(p.isActive === false ? 'inactive' : 'active');
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `catalog_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'ID',
      'SKU',
      'Name',
      'Category',
      'Dosage',
      'Guest Vial Price',
      'Guest Kit Price',
      'Pro Vial Price',
      'Pro Kit Price',
      'Stock',
      'Warehouse',
      'Cost Price',
      'Supplier',
      'Active',
    ];
    const sampleRow = [
      'sample_id',
      'BPC157-5',
      'BPC-157',
      'Healing & Recovery',
      '5mg/vial',
      '28.75',
      '172.50',
      '24.44',
      '146.63',
      '100',
      'Poland',
      '15.00',
      'Regpept',
      'active',
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'med_peptides_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleImportCSV(event) {
    if (readOnly) return;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImporting(true);
      try {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',');

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          if (cols.length < 9) continue;

          const id = cols[0].replace(/"/g, '');
          const updates = {
            sku: cols[1]?.replace(/"/g, '') || '',
            guestVialPrice: parseFloat(cols[5]),
            guestKitPrice: parseFloat(cols[6]),
            proVialPrice: parseFloat(cols[7]),
            proKitPrice: parseFloat(cols[8]),
            stock: parseInt(cols[9]),
            warehouse: cols[10]?.replace(/"/g, '') || 'Poland',
            costPrice: parseFloat(cols[11]) || 0,
            supplier: cols[12]?.replace(/"/g, '') || '',
            isActive: cols[13]?.toLowerCase().includes('inactive') ? false : true,
            updatedAt: new Date().toISOString(),
            lastImportedAt: new Date().toISOString(),
          };

          const productRef = doc(db, 'products', id);
          await updateDoc(productRef, updates);
        }
        toast.success('Import complete! Refreshing catalog...');
        fetchProducts();
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Error importing CSV. Ensure the format is correct.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  async function handleBulkAdjust() {
    if (readOnly) return;
    if (!bulkValue || isNaN(bulkValue)) {
      toast.warning('Please enter a valid number.');
      return;
    }

    const affectedProducts = products.filter(
      (p) =>
        (bulkCategory === 'All' || p.category === bulkCategory) &&
        (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))
    );

    if (affectedProducts.length === 0) {
      toast.warning('No products found in the selected category/selection.');
      return;
    }

    if (!window.confirm(`Apply adjustment to ${affectedProducts.length} products?`)) return;

    setLoading(true);
    try {
      const val = parseFloat(bulkValue);
      for (const p of affectedProducts) {
        let updates = {};
        if (bulkMode === 'percent') {
          const factor = 1 + val / 100;
          updates = {
            guestVialPrice: (p.guestVialPrice * factor).toFixed(2),
            guestKitPrice: (p.guestKitPrice * factor).toFixed(2),
            proVialPrice: (p.proVialPrice * factor).toFixed(2),
            proKitPrice: (p.proKitPrice * factor).toFixed(2),
          };
        } else if (bulkMode === 'fixed') {
          updates = {
            guestVialPrice: (p.guestVialPrice + val).toFixed(2),
            guestKitPrice: (p.guestKitPrice + val).toFixed(2),
            proVialPrice: (p.proVialPrice + val).toFixed(2),
            proKitPrice: (p.proKitPrice + val).toFixed(2),
          };
        }

        const productRef = doc(db, 'products', p.id);
        await updateDoc(productRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success('Bulk adjustment complete!');
      fetchProducts();
      setBulkMode(null);
      setBulkValue('');
      setSelectedProductIds([]);
    } catch (err) {
      console.error('Bulk adjust error:', err);
      toast.error('Error applying bulk adjustments.');
    } finally {
      setLoading(false);
    }
  };

  async function handleOpenCatalogSelect() {
    setCatalogSelectMode(true);
    setLoadingCatalogs(true);
    try {
      const list = isAdmin ? await catalogRepository.getAllCatalogs() : await catalogRepository.getCatalogsByOwner(user?.uid);
      setMyCatalogs(list || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load catalogs');
    } finally {
      setLoadingCatalogs(false);
    }
  }

  async function handleAddToCatalog(catalog) {
    if (!selectedProductIds.length) return;
    try {
      const updatedCatalog = { ...catalog };
      let targetSection = null;
      if (updatedCatalog.sections && updatedCatalog.sections.length > 0) {
        targetSection = updatedCatalog.sections[0];
      } else {
        targetSection = { title: 'Products', products: [], protocols: [] };
        updatedCatalog.sections = [targetSection];
      }
      
      const newProducts = [...(targetSection.products || [])];
      selectedProductIds.forEach(id => {
        if (!newProducts.includes(id)) newProducts.push(id);
      });
      targetSection.products = newProducts;

      await catalogRepository.saveCatalog(updatedCatalog);
      toast.success(`Added ${selectedProductIds.length} products to ${catalog.title}`);
      setCatalogSelectMode(false);
      setSelectedProductIds([]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to add to catalog');
    }
  }

  async function handleDeleteProduct(id) {
    if (readOnly) return;
    if (
      !window.confirm('Are you sure you want to delete this product? This action cannot be undone.')
    )
      return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted.');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product.');
    }
  };

  // Determine which categories to show in filter dropdown
  const categoriesToShow = allowedCategories.includes('All')
    ? [...new Set(products.map((p) => p.category))]
    : allowedCategories;

  const columns = [
    {
      key: 'product',
      header: 'Product / Category',
      sortKey: 'product',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {p.zoho_item_id ? (
            <TooltipWrapper text="Synced to Zoho Inventory">
              <UploadCloud size={16} color="#1a73e8" />
            </TooltipWrapper>
          ) : (
            <div style={{ width: 16 }}></div>
          )}
          <AppEntityCell
            title={p.name}
            subtitle={
              <>
                <span style={{ opacity: 0.5 }}>↳</span> {p.category} | {p.dosage}
              </>
            }
          />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '80px',
      sortKey: 'status',
      render: (p) => {
        let isLocked = false;
        let isLocallyActive = p.isActive !== false;
        
        if (!isAdmin && user) {
          if (p.isActive === false) {
            isLocked = true;
            isLocallyActive = false;
          } else {
            const localOverrides = p.localOverrides || {};
            if (localOverrides[user.uid] === false) {
              isLocallyActive = false;
            }
          }
        }
        
        const handleToggle = (willBeActive) => {
          if (isAdmin) {
            handleUpdateProduct(p.id, { isActive: willBeActive });
          } else {
            if (!user) return;
            handleUpdateProduct(p.id, { [`localOverrides.${user.uid}`]: willBeActive });
          }
        };

        return (
          <AppStatusToggle
            isActive={isLocallyActive}
            isLocked={isLocked}
            onToggle={handleToggle}
          />
        );
      },
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '180px',
      render: (p) => {
  const actions = [
    { type: 'inventory', onClick: () => {
      navigate(`/admin/sku-sync?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`);
    } },
    { type: 'pricing', onClick: () => {
      navigate(`/admin/prices?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`);
    } },
    { type: 'protocols', onClick: () => {
      navigate(`/admin/protocols`);
    } },
    { type: 'ai', onClick: () => {
      window.dispatchEvent(new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
        detail: { product: p.name, sku: p.sku }
      }));
    } },
    { type: 'search', label: 'Search Competitors', onClick: () => handleScrapeCompetitor(p) },
    { type: 'delete', onClick: () => handleDeleteProduct(p.id) }
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {savingProduct === p.id && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
      )}
      <AppActionGroup actions={actions} />
    </div>
  );
      },
    });
  }

  const handleScrapeCompetitor = async (p) => {
    toast.info(`Buscando precios para ${p.name}...`);
    try {
      // Using fetch directly since forceScrapeCompetitors is an onRequest (HTTP) function
      const url = `https://us-central1-med-peptides-app.cloudfunctions.net/forceScrapeCompetitors?productId=${encodeURIComponent(p.id)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { productId: p.id } })
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      toast.success(`Precios actualizados para ${p.name}`);
      // Navigate to pricing tab as requested
      navigate(`/admin/prices?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`);
    } catch (error) {
      console.error('Error scraping:', error);
      toast.error('Error al buscar precios.');
    }
  };

  const handleAddToBulkOrder = async (selectedIds) => {
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    setProductsToBulkOrder(selectedProducts);
    setIsBulkOrderModalOpen(true);
  };

  const handleDeactivateSelected = async (selectedIds) => {
    try {
      const promises = selectedIds.map(id => {
        const ref = doc(db, 'products', id);
        return updateDoc(ref, { isActive: false });
      });
      await Promise.all(promises);
      addToast(`${selectedIds.length} products have been deactivated.`, 'success');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error) {
      addToast('Error deactivating products: ' + error.message, 'error');
    }
  };

  const renderExpandedRow = (product) => {
    return <ProductMicrosite product={product} onUpdateProduct={handleUpdateProduct} />;
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && p?.isActive !== false) ||
      (filterStatus === 'Inactive' && p?.isActive === false);
    const matchesWarehouse = filterWarehouse === 'All' || p?.warehouse === filterWarehouse;

    let matchesStock = true;
    if (filterStock === 'Out of Stock') matchesStock = p?.stock < 1;
    else if (filterStock === 'Low Stock') matchesStock = p?.stock >= 1 && p?.stock < 20;
    else if (filterStock === 'In Stock') matchesStock = p?.stock >= 20;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (p?.name || '').toLowerCase().includes(searchLower) ||
      (p?.category || '').toLowerCase().includes(searchLower) ||
      (p?.objective && p.objective.toLowerCase().includes(searchLower)) ||
      (p?.dosage && p.dosage.toLowerCase().includes(searchLower));

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      // Fallback to createdAt if updatedAt is null
      let updatedStr = p.updatedAt;
      if (!updatedStr && p.createdAt) {
        if (p.createdAt?.toDate) {
          updatedStr = p.createdAt.toDate().toISOString();
        } else if (typeof p.createdAt === 'string') {
          updatedStr = p.createdAt;
        }
      }
      
      const updated = updatedStr ? new Date(updatedStr) : null;
      if (updated) {
        if (dateRange.start && updated < new Date(dateRange.start)) matchesDate = false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (updated > endDate) matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }

    let matchesZoho = true;
    if (filterZoho !== 'All') {
      if (filterZoho === 'Synced') matchesZoho = !!p.zoho_item_id;
      if (filterZoho === 'Not Synced') matchesZoho = !p.zoho_item_id;
    }

    let matchesSource = true;
    if (filterSource === 'Recently Imported') {
      let baseDateStr = p.updatedAt;
      if (!baseDateStr && p.createdAt) {
        if (p.createdAt?.toDate) {
          baseDateStr = p.createdAt.toDate().toISOString();
        } else if (typeof p.createdAt === 'string') {
          baseDateStr = p.createdAt;
        }
      }
      const importedAt = p.lastImportedAt ? new Date(p.lastImportedAt) : (baseDateStr ? new Date(baseDateStr) : null);
      if (!importedAt) {
        matchesSource = false;
      } else {
        const hoursSinceImport = (new Date() - importedAt) / (1000 * 60 * 60);
        if (hoursSinceImport > 24) matchesSource = false;
      }
    }

    return (
      matchesCategory &&
      matchesStatus &&
      matchesWarehouse &&
      matchesStock &&
      matchesSearch &&
      matchesDate &&
      matchesZoho &&
      matchesSource
    );
  });

  const activeFilters = [];
  if (filterCategory !== 'All') activeFilters.push({ label: 'Category', value: filterCategory, type: 'category' });
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  if (filterWarehouse !== 'All') activeFilters.push({ label: 'Warehouse', value: filterWarehouse, type: 'warehouse' });
  if (filterStock !== 'All') activeFilters.push({ label: 'Stock', value: filterStock, type: 'stock' });
  if (filterZoho !== 'All') activeFilters.push({ label: 'Zoho', value: filterZoho, type: 'zoho' });
  if (filterSource !== 'All') activeFilters.push({ label: 'Source', value: filterSource, type: 'source' });

  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setFilterCategory('All');
    if (filter.type === 'status') setFilterStatus('All');
    if (filter.type === 'warehouse') setFilterWarehouse('All');
    if (filter.type === 'stock') setFilterStock('All');
    if (filter.type === 'zoho') setFilterZoho('All');
  };

  const renderCustomFilters = () => (
    <>
      {categoriesToShow.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
            border: '1px solid var(--border)', backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
            color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
          }}
        >
          <option value="All">Category: All</option>
          {categoriesToShow.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      )}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Status: All</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select
        value={filterZoho}
        onChange={(e) => setFilterZoho(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterZoho === 'All' ? 'white' : 'var(--primary-light)',
          color: filterZoho === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Zoho Sync: All</option>
        <option value="Synced">Synced</option>
        <option value="Not Synced">Not Synced</option>
      </select>
      <select
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterSource === 'All' ? 'white' : 'var(--primary-light)',
          color: filterSource === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Source: All</option>
        <option value="Recently Imported">Recently Imported (24h)</option>
      </select>
      <select
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterStock === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStock === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Stock: All</option>
        <option value="In Stock">Healthy (20+)</option>
        <option value="Low Stock">Low (&lt;20)</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>
      <select
        value={filterWarehouse}
        onChange={(e) => setFilterWarehouse(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterWarehouse === 'All' ? 'white' : 'var(--primary-light)',
          color: filterWarehouse === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Warehouse: All</option>
        <option value="Poland">Poland</option>
        <option value="UK">UK</option>
        <option value="USA">USA</option>
        <option value="Greece">Greece</option>
      </select>
    </>
  );

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      <AdminPageHeader
        title="Products & Catalog"
        subtitle="Manage product details, pricing, inventory categories, and Zoho Catalog integrations."
        icon={Package}
      />
      {isAdmin && !readOnly && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AdminSupplyNotifierWidget />
        </div>
      )}


      {/* Table Action Toolbar */}
      {!readOnly && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Products ({filteredProducts.length})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#1a73e8',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                cursor: 'pointer',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(26,115,232,0.04)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Copy size={16} /> TEMPLATE
            </button>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'white',
                backgroundColor: '#1a73e8',
                border: '1px solid transparent',
                cursor: 'pointer',
                padding: '0.4rem 1rem',
                margin: 0,
                borderRadius: '4px',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                transition: 'background-color 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#1765cc';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#1a73e8';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
              }}
            >
              <UploadCloud size={16} /> {importing ? 'IMPORTING...' : 'IMPORT'}
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
                disabled={importing}
              />
            </label>
          </div>
        </div>
      )}

      {/* Bulk Adjustment Panel */}
      {!readOnly && bulkMode && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ArrowUpRight size={20} /> Bulk Price Adjustment
            </h3>
            <XCircle
              size={20}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setBulkMode(null)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                Apply to Category:
              </label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="All">All Categories</option>
                {categoriesToShow.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                Adjustment Type:
              </label>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setBulkMode('percent')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    backgroundColor: bulkMode === 'percent' ? 'var(--primary)' : 'white',
                    color: bulkMode === 'percent' ? 'white' : 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setBulkMode('fixed')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    backgroundColor: bulkMode === 'fixed' ? 'var(--primary)' : 'white',
                    color: bulkMode === 'fixed' ? 'white' : 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Fixed Amount ($)
                </button>
              </div>
            </div>
            <div style={{ width: '150px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                {bulkMode === 'percent' ? 'Percentage (e.g. 5 or -10)' : 'Amount (e.g. 10 or -5)'}
              </label>
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
            <button
              onClick={handleBulkAdjust}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.5rem' }}
            >
              Apply to{' '}
              {
                products.filter(
                  (p) =>
                    (bulkCategory === 'All' || p.category === bulkCategory) &&
                    (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))
                ).length
              }{' '}
              Products
            </button>
          </div>
        </div>
      )}

      {/* Catalog Select Panel */}
      {!readOnly && catalogSelectMode && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <BookOpen size={20} /> Include {selectedProductIds.length} Products in Catalog
            </h3>
            <XCircle
              size={20}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setCatalogSelectMode(false)}
            />
          </div>
          
          {loadingCatalogs ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your catalogs...</div>
          ) : myCatalogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No catalogs found. You need to create a catalog first before adding products to it.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {myCatalogs.map(catalog => (
                <div 
                  key={catalog.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'var(--color-bg-subtle)'
                  }}
                  onClick={() => handleAddToCatalog(catalog)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{catalog.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {catalog.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your catalog is empty.
          </p>
          {!readOnly && (
            <button className="btn btn-primary" onClick={handleMigrate} disabled={migrating}>
              {migrating ? 'Migrating...' : 'Run Initial Products Migration'}
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Catalog is empty.
          </div>
        ) : (
          <>
          <DataTable
            data={paginatedProducts}
            columns={columns}
            keyField="id"
            expandableRender={renderExpandedRow}
            selectedIds={selectedProductIds}
            onSelectionChange={setSelectedProductIds}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search products by name, category, dosage..."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={activeFilters}
            onFilterRemove={handleFilterRemove}
            renderCustomFilters={renderCustomFilters}
            renderBatchActions={(selected) => (
              <>
                <button
                  onClick={() => handleAddToBulkOrder(selected)}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#10b981',
                    borderColor: '#10b981'
                  }}
                >
                  <ShoppingCart size={14} /> Add to Bulk Order
                </button>
                <button
                  onClick={() => handleDeactivateSelected(selected)}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                    color: '#ef4444',
                    borderColor: '#ef4444',
                    background: '#fef2f2'
                  }}
                >
                  <XCircle size={14} /> Deactivate
                </button>
                <button
                  onClick={handleExportCSV}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                    background: 'white',
                  }}
                >
                  <Download size={14} /> Export Selected
                </button>
                {!readOnly && (
                  <button
                    onClick={() => setBulkMode(bulkMode ? null : 'percent')}
                    className="btn btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      background: 'white',
                    }}
                  >
                    <Percent size={14} /> Bulk Price Update
                  </button>
                )}
                {!readOnly && (
                  <button
                    onClick={handleOpenCatalogSelect}
                    className="btn btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      background: 'white',
                    }}
                  >
                    <BookOpen size={14} /> Include in Catalog
                  </button>
                )}
              </>
            )}
          />
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => fetchProducts(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more products'}
              </button>
            </div>
          )}
          </>
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminProductsTab | Props: none
      </div>
    
      {/* Modals */}
      <BulkOrderSelectionModal 
        isOpen={isBulkOrderModalOpen}
        onClose={() => {
          setIsBulkOrderModalOpen(false);
          setSelectedProductIds([]);
        }}
        selectedProducts={productsToBulkOrder}
      />
    </div>
  );
}
