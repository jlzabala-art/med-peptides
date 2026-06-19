import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import Save from 'lucide-react/dist/esm/icons/save';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { doc, updateDoc, collection, getDocs, query, addDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';
import RightWorkspacePanel from '../catalog/RightWorkspacePanel';
import { Button } from '../../ui';
import { getCategorySchema } from './VariantSchemas';

export default function VariantDetailsModal({ isOpen, onClose, product, variant, onSave, mode = 'overview' }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [suppliersList, setSuppliersList] = useState(['REGENPEPT-LABS', 'Global Peptide Synthesis Ltd.', 'Apex Biochemicals Corp', 'Unassigned']);
  const [supplierData, setSupplierData] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Map mode to schema section
  const getSectionForMode = (m) => {
    switch (m) {
      case 'commercial': return 'commercial';
      case 'regulatory': return 'regulatory';
      case 'inventory': return 'inventory';
      case 'supplier': return 'general';
      case 'overview':
      default: return 'general';
    }
  };

  const activeSection = getSectionForMode(mode);

  useEffect(() => {
    if (isOpen) {
      const fetchSuppliers = async () => {
        try {
          const snap = await getDocs(collection(db, 'wholesellers'));
          const dataMap = {};
          const list = snap.docs.map(d => {
            const data = d.data();
            const rawName = data.companyName || data.name || d.id;
            const cleanName = rawName.replace(/\s+(eur|usd|aed|r\$)$/i, '').trim();
            if (data.warehouses && data.warehouses.length > 0) {
              dataMap[cleanName] = data.warehouses;
            }
            return cleanName;
          });
          const uniqueNames = [...new Set([...suppliersList, ...list])].filter(Boolean);
          setSuppliersList(uniqueNames.sort(Intl.Collator().compare));
          setSupplierData(dataMap);
        } catch (err) {
          console.error('Error fetching suppliers:', err);
        }
      };
      fetchSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (variant) {
      const prodName = product?.name || product?.displayName || 'UNK';
      const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
      const format = (variant.format || '').substring(0, 3).toUpperCase();
      const size = (variant.size || variant.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const generatedSku = ['SKU', safeName, format, size].filter(Boolean).join('-');

      setForm({
        ...variant,
        sku: variant.sku || generatedSku,
        supplier: variant.supplier || '',
        cost: variant.cost_per_gram || variant.cost || variant.unitCost || variant.baseCost || variant.pricing?.master?.perUnit || 0,
        msrp: variant.pricing?.retail?.perUnit || variant.msrp || variant.retailPrice || variant.price || 0,
        clinicPrice: variant.pricing?.clinic?.perUnit || variant.clinicPrice || variant.clinic || 0,
        wholesalePrice: variant.pricing?.wholesale?.perUnit || variant.wholesalePrice || variant.wholesale || 0,
        regStatus: variant.regStatus || variant.registrationStatus || 'Unregistered',
        coaAvailable: variant.coaAvailable || false,
      });
      setValidationErrors([]);
    }
  }, [variant, product]);

  if (!isOpen || !variant || !product) return null;

  const schema = getCategorySchema(product, variant);

  const validateForm = () => {
    const errors = [];
    const fieldsToCheck = schema[activeSection] || [];
    
    fieldsToCheck.forEach(field => {
      if (field.required) {
        const val = form[field.name];
        if (val === undefined || val === null || val === '') {
          errors.push(`${field.label} is required.`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload = { updatedAt: new Date().toISOString() };
      
      // Strip undefined values to prevent Firestore errors
      Object.keys(form).forEach(k => {
        if (form[k] !== undefined) {
          updatePayload[k] = form[k];
        }
      });
      
      // Clean up pricing structure if clinicPrice exists
      if (updatePayload.clinicPrice !== undefined) {
        updatePayload.pricing = {
          ...variant.pricing,
          clinic: { ...(variant.pricing?.clinic || {}), perUnit: updatePayload.clinicPrice }
        };
        delete updatePayload.clinicPrice;
      }

      if (updatePayload.inventory !== undefined) {
        updatePayload.stock = updatePayload.inventory;
        delete updatePayload.inventory;
      }

      // We need to robustly find the variant doc reference.
      const variantsRef = collection(db, 'products', product.id, 'variants');
      const snapshot = await getDocs(query(variantsRef));
      
      let variantDocId = variant.id;
      if (!snapshot.docs.some((d) => d.id === variant.id)) {
        const found = snapshot.docs.find((d) => d.data().sku === variant.sku);
        if (found) variantDocId = found.id;
      }

      if (variantDocId && !variantDocId.includes('-root')) {
        const vRef = doc(db, 'products', product.id, 'variants', variantDocId);
        await updateDoc(vRef, updatePayload);
      } else {
        // Fallback to updating the product if it's a flat catalog item without variant subdocs
        const pRef = doc(db, 'products', product.id);
        await updateDoc(pRef, updatePayload);
      }

      toast.success('Variant updated successfully.');
      if (onSave) onSave();
      // We don't automatically close the modal so they can review saved changes (as requested)
      setValidationErrors([]);
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Failed to save variant details: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupplierChange = async (val) => {
    if (val === '___ADD_NEW___') {
      const newSupplier = window.prompt("Enter new supplier name:");
      if (newSupplier && newSupplier.trim()) {
        const nameTrimmed = newSupplier.trim();
        try {
          await addDoc(collection(db, 'wholesellers'), {
            companyName: nameTrimmed,
            createdAt: new Date().toISOString(),
            status: 'active'
          });
          setSuppliersList(prev => [...new Set([...prev, nameTrimmed])].sort());
          setForm({ ...form, supplier: nameTrimmed });
          toast.success('New supplier added successfully');
        } catch (err) {
          toast.error('Failed to add new supplier');
        }
      }
    } else {
      setForm({ ...form, supplier: val });
    }
  };

  const renderField = (field) => {
    const value = form[field.name] !== undefined ? form[field.name] : '';
    const isError = validationErrors.some(e => e.includes(field.label));

    const inputBaseStyle = {
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${isError ? '#ef4444' : '#cbd5e1'}`,
      fontSize: '0.95rem',
      outline: 'none',
      width: '100%',
      backgroundColor: '#fff',
      transition: 'border-color 0.2s',
    };

    if (field.type === 'supplierSelect') {
      const options = [
        ...suppliersList.map(s => ({ value: s, label: s })),
        { value: '___ADD_NEW___', label: '+ Add New Supplier...' }
      ];
      return (
        <Select 
          value={options.find(o => o.value === value) || null}
          onChange={(opt) => handleSupplierChange(opt ? opt.value : '')}
          options={options}
          isSearchable={true}
          placeholder="Search or select a supplier..."
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: '8px',
              borderColor: isError ? '#ef4444' : '#cbd5e1',
              fontSize: '0.95rem',
              minHeight: '42px'
            })
          }}
        />
      );
    }

    if (field.type === 'warehouse_stock') {
      const selectedSupplier = form.supplier;
      let warehouses = ['US Main', 'EU Central', 'UK Hub', 'Partner 3PL'];
      if (selectedSupplier && supplierData[selectedSupplier] && supplierData[selectedSupplier].length > 0) {
        warehouses = supplierData[selectedSupplier];
      }
      
      const stockData = value || {};

      const handleStockChange = (wh, val) => {
        const numVal = parseInt(val, 10) || 0;
        const newStockData = { ...stockData, [wh]: numVal };
        // Auto-calculate total inventory
        const totalStock = Object.values(newStockData).reduce((sum, curr) => sum + curr, 0);
        
        setForm(prev => ({
          ...prev,
          [field.name]: newStockData,
          inventory: totalStock
        }));
      };

      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {warehouses.map(wh => (
            <div key={wh} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{wh}</label>
              <input
                type="number"
                min="0"
                value={stockData[wh] || ''}
                onChange={(e) => handleStockChange(wh, e.target.value)}
                style={{ ...inputBaseStyle, padding: '6px 8px', fontSize: '0.85rem' }}
                placeholder="0"
              />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: '#10b981', textAlign: 'right', fontWeight: 600, marginTop: '4px' }}>
            Total automatically synced to Total Stock
          </div>
        </div>
      );
    }

    if (field.type === 'file_upload') {
      const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFiles(prev => ({ ...prev, [field.name]: true }));
        try {
          // Generate a safe file name
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `coas/${product.id}/${variant?.sku || Date.now()}_${safeName}`;
          const storageRef = ref(storage, filePath);
          
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          
          setForm(prev => ({ 
            ...prev, 
            [field.name]: downloadUrl,
            ...(field.name === 'coaFileUrl' ? { coaAvailable: true } : {})
          }));
          toast.success(`${field.label} uploaded successfully.`);
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload file: ${error.message}`);
        } finally {
          setUploadingFiles(prev => ({ ...prev, [field.name]: false }));
        }
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#166534', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value.split('/').pop().split('?')[0]}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(value, '_blank')}
                style={{ padding: '4px 8px', height: 'auto', fontSize: '0.75rem' }}
              >
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setForm({ ...form, [field.name]: '', ...(field.name === 'coaFileUrl' ? { coaAvailable: false } : {}) })}
                style={{ padding: '4px 8px', height: 'auto', fontSize: '0.75rem', color: '#ef4444', borderColor: '#fca5a5' }}
              >
                Remove
              </Button>
            </div>
          )}
          {!value && (
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept={field.accept || "*"}
                onChange={handleFileUpload}
                disabled={uploadingFiles[field.name]}
                style={{
                  ...inputBaseStyle,
                  padding: '8px',
                  color: uploadingFiles[field.name] ? '#94a3b8' : '#334155'
                }}
              />
              {uploadingFiles[field.name] && (
                <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500 }}>
                  Uploading...
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <select 
          value={value} 
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} 
          style={{ ...inputBaseStyle, appearance: 'auto' }}
        >
          <option value="">Select...</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }

    if (field.type === 'boolean') {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '42px' }}>
          <input 
            type="checkbox" 
            checked={!!value} 
            onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })} 
            style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
          />
          <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 500 }}>{field.label}</span>
        </label>
      );
    }

    if (['wholesalePrice', 'clinicPrice', 'msrp'].includes(field.name)) {
      let prevValue = 0;
      if (field.name === 'wholesalePrice') prevValue = Number(form.cost) || 0;
      if (field.name === 'clinicPrice') prevValue = Number(form.wholesalePrice) || 0;
      if (field.name === 'msrp') prevValue = Number(form.clinicPrice) || 0;

      const currentPrice = Number(value) || 0;
      const margin = currentPrice && currentPrice > prevValue ? Math.round(((currentPrice - prevValue) / currentPrice) * 100) : 0;

      const handleMarginChange = (e) => {
        const newMargin = Number(e.target.value);
        if (newMargin >= 100) return;
        const newPrice = Math.round(prevValue / (1 - newMargin / 100));
        setForm({ ...form, [field.name]: newPrice });
      };

      return (
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }}>$</span>
            <input 
              type="number" 
              value={value} 
              onChange={(e) => setForm({ ...form, [field.name]: Number(e.target.value) })} 
              style={{ ...inputBaseStyle, paddingLeft: '24px' }} 
              placeholder={field.label}
            />
          </div>
          <div style={{ width: '100px', position: 'relative', flexShrink: 0 }}>
            <input 
              type="number" 
              value={margin} 
              onChange={handleMarginChange} 
              style={{ ...inputBaseStyle, paddingRight: '28px', textAlign: 'right' }} 
              title="Margin %"
            />
            <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#64748b', pointerEvents: 'none' }}>%</span>
          </div>
        </div>
      );
    }

    if (field.name === 'cost') {
      return (
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }}>$</span>
          <input 
            type="number" 
            value={value} 
            onChange={(e) => setForm({ ...form, [field.name]: Number(e.target.value) })} 
            style={{ ...inputBaseStyle, paddingLeft: '24px' }} 
            placeholder={field.label}
          />
        </div>
      );
    }

    // Default text/number inputs
    return (
      <input 
        type={field.type} 
        value={value} 
        onChange={(e) => setForm({ ...form, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })} 
        style={inputBaseStyle} 
        placeholder={field.label}
      />
    );
  };

  const renderSection = (fields) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {fields.map(field => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', gap: '4px' }}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    );
  };

  const TABS = [
    { id: 'general', label: 'General Information', fields: schema.general },
    { id: 'technical', label: 'Technical Specifications', fields: schema.technical },
    { id: 'regulatory', label: 'Regulatory', fields: schema.regulatory },
    { id: 'commercial', label: 'Commercial', fields: schema.commercial },
    { id: 'inventory', label: 'Inventory', fields: schema.inventory },
  ];

  const modalContent = (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{product.name || 'Unknown Product'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{variant.name || form.sku || 'Variant Details'}</span>
            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 600 }}>
              {product.type || product.category || 'Product'}
            </span>
          </div>
        </div>
      }
      icon={<PackageOpen size={24} color="#6366f1" />}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            {validationErrors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
                <AlertCircle size={16} /> Please fix validation errors.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={isSaving} icon={<Save size={16} />} style={{ minWidth: '140px', justifyContent: 'center' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', padding: '24px', overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: '#1e293b' }}>
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Details
          </h3>
          {schema[activeSection] && renderSection(schema[activeSection])}
        </div>
      </div>
    </RightWorkspacePanel>
  );

  return isOpen ? createPortal(modalContent, document.body) : null;
}
