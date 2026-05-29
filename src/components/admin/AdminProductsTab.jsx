/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppDataTable from '../ui/AppDataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';
import { catalogRepository } from '../../repositories/catalogRepository';
import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import InlineEditField from '../ui/InlineEditField';

// ── ProductMicrosite Component ────────────────────────────────────────────────
function ProductMicrosite({ product, onUpdateProduct }) {
  const [summary, setSummary] = useState(product.clinical_summary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: `Hello! I'm Atlas AI. I've loaded the data for ${product.name}. What would you like to know about its clinical applications or interactions?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('clinical'); // 'clinical', 'inventory', 'ai'

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

  const AccordionHeader = ({ title, id }) => {
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
          fontWeight: 600,
          color: isExpanded ? '#0f172a' : '#475569',
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
        <span style={{ fontSize: '0.95rem' }}>{title}</span>
        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
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
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {product.category || 'Peptide'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{product.dosage || 'Standard'}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>{product.name}</h3>
        </div>
        <a href={`/catalog/product/${product.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
          View Store Page
        </a>
      </div>

      {/* Accordion 1: Clinical Information */}
      <AccordionHeader title="Información Clínica (Materia Medica)" id="clinical" />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mechanism of Action</h4>
              <p style={{ margin: 0 }}>{materia.mechanism_of_action}</p>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Applications</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {materia.clinical_applications?.map((app, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{app}</li>
                ))}
              </ul>
            </div>

            {materia.contraindications && materia.contraindications.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contraindications & Interactions</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#b91c1c' }}>
                  {materia.contraindications.map((ci, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{ci}</li>
                  ))}
                </ul>
              </div>
            )}

            {materia.references && materia.references.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scientific References</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                  {materia.references.map((ref, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', transition: 'color 0.2s', ':hover': { color: '#2563eb' } }}>
                        {ref.title || 'View Study'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {summary}
          </div>
        )}
      </div>

      {/* Accordion 2: Non-Clinical Information */}
      <AccordionHeader title="Información No Clínica (Inventario)" id="inventory" />
      <div 
        id="accordion-content-inventory"
        style={{ 
          display: expandedAccordion === 'inventory' ? 'block' : 'none',
          padding: '1.5rem', 
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU</span>
            <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f172a' }}>{product.sku || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warehouse</span>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a' }}>{product.warehouse || 'Poland'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplier</span>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a' }}>{product.supplier || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Status</span>
            <span style={{ 
              fontSize: '1rem', fontWeight: 700, 
              color: product.stock < 20 ? 'var(--error)' : product.stock < 50 ? '#f59e0b' : '#10b981' 
            }}>
              {product.stock} units
            </span>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#4338ca', lineHeight: 1.4 }}>
            To modify stock levels, supplier details, or SKU, please navigate to the Inventory Management screen.
          </p>
        </div>
      </div>

      {/* Accordion 3: AI Access */}
      <AccordionHeader title="Acceso al AI (ClinicDAG Asistente)" id="ai" />
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
              placeholder="Pregunta algo sobre el perfil clínico..."
              style={{ flex: 1, padding: '1rem 1.5rem', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#0f172a' }}
            />
            <button type="submit" disabled={!chatInput.trim() || isTyping} style={{ padding: '0 1.5rem', backgroundColor: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', opacity: (!chatInput.trim() || isTyping) ? 0.5 : 1 }}>
              Send
            </button>
          </form>
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
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterStock, filterWarehouse, dateRange]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      let productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter if restricted by allowedCategories
      if (!allowedCategories.includes('All')) {
        productsList = productsList.filter((p) => allowedCategories.includes(p.category));
      }

      setProducts(productsList);
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
        <AppEntityCell
          title={p.name}
          subtitle={
            <>
              <span style={{ opacity: 0.5 }}>↳</span> {p.category} | {p.dosage}
            </>
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '80px',
      sortKey: 'status',
      sortValue: (p) => (p.isActive !== false ? 1 : 0),
      render: (p) => {
        return (
          <AppStatusToggle
            isActive={p.isActive !== false}
            onToggle={(willBeActive) => handleUpdateProduct(p.id, { isActive: willBeActive })}
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
      width: '100px',
      render: (p) => {
        const actions = [];
        actions.push({ type: 'delete', onClick: () => handleDeleteProduct(p.id) });
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {savingProduct === p.id && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
            )}
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  const renderExpandedRow = (p) => {
    return <ProductMicrosite product={p} onUpdateProduct={handleUpdateProduct} />;
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
      const updated = p.updatedAt ? new Date(p.updatedAt) : null;
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

    return (
      matchesCategory &&
      matchesStatus &&
      matchesWarehouse &&
      matchesStock &&
      matchesSearch &&
      matchesDate
    );
  });

  const activeFilters = [];
  if (filterCategory !== 'All') activeFilters.push({ label: 'Category', value: filterCategory, type: 'category' });
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  if (filterWarehouse !== 'All') activeFilters.push({ label: 'Warehouse', value: filterWarehouse, type: 'warehouse' });
  if (filterStock !== 'All') activeFilters.push({ label: 'Stock', value: filterStock, type: 'stock' });

  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setFilterCategory('All');
    if (filter.type === 'status') setFilterStatus('All');
    if (filter.type === 'warehouse') setFilterWarehouse('All');
    if (filter.type === 'stock') setFilterStock('All');
  };

  const renderCustomFilters = () => (
    <>
      {categoriesToShow.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
            border: '1px solid var(--border)', backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
            color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
          border: '1px solid var(--border)', backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Status: All</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
        style={{
          height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
          border: '1px solid var(--border)', backgroundColor: filterStock === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStock === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
          border: '1px solid var(--border)', backgroundColor: filterWarehouse === 'All' ? 'white' : 'var(--primary-light)',
          color: filterWarehouse === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          <AppDataTable
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
                  onClick={handleExportCSV}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
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
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminProductsTab | Props: none
      </div>
    
</div>
  );
}
