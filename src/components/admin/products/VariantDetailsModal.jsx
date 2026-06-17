import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import Save from 'lucide-react/dist/esm/icons/save';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import { doc, updateDoc, collection, getDocs, query, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';
import RightWorkspacePanel from '../catalog/RightWorkspacePanel';
import { Button } from '../../ui';

export default function VariantDetailsModal({ isOpen, onClose, product, variant, onSave, mode = 'overview' }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [suppliersList, setSuppliersList] = useState(['REGENPEPT-LABS', 'Global Peptide Synthesis Ltd.', 'Apex Biochemicals Corp', 'Unassigned']);
  const [catalogOptions, setCatalogOptions] = useState({ formats: ['vial', 'bottle', 'tablet', 'capsule', 'kit'], units: ['mg', 'mcg', 'iu', 'ml', 'g'] });

  useEffect(() => {
    if (isOpen) {
      const fetchSuppliers = async () => {
        try {
          const snap = await getDocs(collection(db, 'wholesellers'));
          const list = snap.docs.map(d => {
            const rawName = d.data().companyName || d.data().name || d.id;
            return rawName.replace(/\s+(eur|usd|aed|r\\$)$/i, '').trim();
          });
          const uniqueNames = [...new Set([...suppliersList, ...list])].filter(Boolean);
          setSuppliersList(uniqueNames.sort(Intl.Collator().compare));
        } catch (err) {
          console.error('Error fetching suppliers:', err);
        }
      };
      
      const fetchOptions = async () => {
        try {
          const d = await getDoc(doc(db, 'settings', 'catalogOptions'));
          if (d.exists()) {
            setCatalogOptions(d.data());
          }
        } catch (err) {
          console.error('Error fetching catalog options:', err);
        }
      };
      
      fetchSuppliers();
      fetchOptions();
    }
  }, [isOpen]);

  const handleSupplierChange = async (e) => {
    const val = e.target.value;
    if (val === '___ADD_NEW___') {
      const newSupplier = window.prompt("Enter new supplier name:");
      if (newSupplier && newSupplier.trim()) {
        const nameTrimmed = newSupplier.trim();
        try {
          await addDoc(collection(db, 'wholesellers'), {
            companyName: nameTrimmed,
            createdAt: new Date().toISOString(),
            status: 'active',
            isZohoMaster: false
          });
          setSuppliersList(prev => [...new Set([...prev, nameTrimmed])].sort());
          setForm({ ...form, supplier: nameTrimmed });
          toast.success('New supplier added successfully');
        } catch (err) {
          console.error('Error adding supplier:', err);
          toast.error('Failed to add new supplier');
        }
      }
    } else {
      setForm({ ...form, supplier: val });
    }
  };

  useEffect(() => {
    if (variant) {
      const prodName = product?.name || product?.displayName || 'UNK';
      const safeName = prodName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 5)
        .toUpperCase();
      const format = (variant.format || '').substring(0, 3).toUpperCase();
      const size = (variant.size || variant.dosage || '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      const generatedSku = ['SKU', safeName, format, size].filter(Boolean).join('-');

      setForm({
        sku: variant.sku || generatedSku,
        supplier: variant.supplier || '',
        cost: variant.cost || 0,
        msrp: variant.msrp || 0,
        stock: variant.stock || 0,
        reorderPoint: variant.reorderPoint || 20,
        moq: variant.moq || 50,
        format: variant.format || '',
        sizeValue: (variant.size || variant.dosage || '').replace(/[^\d\.\s|]/g, '').trim(),
        sizeUnit: (variant.size || variant.dosage || '').replace(/[\d\.\s|]/g, '').toLowerCase() || 'mg',
        size: variant.size || '',
        dosage: variant.dosage || '',
        // Add defaults for new specialized fields that might not exist yet
        clinicPrice: variant.clinicPrice || variant.pricing?.clinic?.perUnit || 0,
        wholesalePrice: variant.wholesalePrice || 0,
        leadTime: variant.leadTime || 14,
        regStatus: variant.regStatus || 'Unregistered',
        coaAvailable: variant.coaAvailable || false,
      });
    }
  }, [variant, product]);

  if (!isOpen || !variant || !product) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const variantsRef = collection(db, 'products', product.id, 'variants');
      const q = query(variantsRef);
      const snapshot = await getDocs(q);

      let variantDocId = variant.id;
      if (!snapshot.docs.some((d) => d.id === variant.id)) {
        const found = snapshot.docs.find((d) => d.data().sku === variant.sku);
        if (found) variantDocId = found.id;
      }

      // Prepare payload - strip undefined values
      const updatePayload = {
        updatedAt: new Date().toISOString(),
      };
      
      const formCopy = { ...form };
      if (formCopy.sizeValue || formCopy.sizeUnit) {
        formCopy.size = `${formCopy.sizeValue || ''} ${formCopy.sizeUnit || ''}`.trim();
        formCopy.dosage = formCopy.size;
      }
      delete formCopy.sizeValue;
      delete formCopy.sizeUnit;

      Object.keys(formCopy).forEach(k => {
        if (formCopy[k] !== undefined) updatePayload[k] = formCopy[k];
      });

      if (updatePayload.clinicPrice !== undefined) {
        updatePayload.pricing = {
          ...variant.pricing,
          clinic: { ...(variant.pricing?.clinic || {}), perUnit: updatePayload.clinicPrice }
        };
        delete updatePayload.clinicPrice;
      }

      if (variantDocId && !variantDocId.includes('-root')) {
        const vRef = doc(db, 'products', product.id, 'variants', variantDocId);
        await updateDoc(vRef, updatePayload);
      } else {
        const pRef = doc(db, 'products', product.id);
        await updateDoc(pRef, updatePayload);
      }

      toast.success('Variant details saved successfully!');
      if (onClose) onClose();
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Failed to save variant details: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%'
  };

  const labelStyle = { 
    fontSize: '0.85rem', 
    fontWeight: 600, 
    color: '#334155', 
    marginBottom: '8px', 
    display: 'block' 
  };

  const FormGroup = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  const getTitle = () => {
    switch(mode) {
      case 'commercial': return 'Edit Commercial Data';
      case 'inventory': return 'Edit Inventory Settings';
      case 'regulatory': return 'Edit Regulatory Info';
      case 'supplier': return 'Edit Supplier';
      case 'analytics': return 'Edit Analytics Info';
      default: return 'Edit Variant Details';
    }
  };

  const supplierOptions = [
    ...suppliersList.map(s => ({ value: s, label: s })),
    { value: '___ADD_NEW___', label: '+ Add New Supplier...' }
  ];

  const renderContent = () => {
    switch(mode) {
      case 'commercial':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormGroup label="Cost Price ($)">
              <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="MSRP ($)">
              <input type="number" value={form.msrp} onChange={(e) => setForm({ ...form, msrp: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Clinic Price ($)">
              <input type="number" value={form.clinicPrice} onChange={(e) => setForm({ ...form, clinicPrice: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Wholesale Price ($)">
              <input type="number" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
          </div>
        );
      case 'inventory':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormGroup label="Current Stock">
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Reorder Point">
              <input type="number" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="MOQ (Minimum Order Quantity)">
              <input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Lead Time (Days)">
              <input type="number" value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })} style={inputStyle} />
            </FormGroup>
          </div>
        );
      case 'supplier':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormGroup label="Supplier">
              <Select 
                value={supplierOptions.find(o => o.value === form.supplier) || null}
                onChange={(opt) => handleSupplierChange({ target: { value: opt ? opt.value : '' }})}
                options={supplierOptions}
                isSearchable={true}
                placeholder="Search or select a supplier..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '0.9rem',
                    minHeight: '40px'
                  })
                }}
              />
            </FormGroup>
            <FormGroup label="SKU (Supplier Reference)">
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={inputStyle} />
            </FormGroup>
          </div>
        );
      case 'regulatory':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormGroup label="Registration Status">
              <select value={form.regStatus} onChange={(e) => setForm({ ...form, regStatus: e.target.value })} style={{...inputStyle, backgroundColor: '#fff'}}>
                <option value="Unregistered">Unregistered</option>
                <option value="Registered">Registered</option>
                <option value="Pending">Pending Approval</option>
                <option value="Restricted">Restricted</option>
              </select>
            </FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', ...labelStyle }}>
              <input 
                type="checkbox" 
                checked={form.coaAvailable} 
                onChange={(e) => setForm({ ...form, coaAvailable: e.target.checked })} 
                style={{ width: '16px', height: '16px' }}
              />
              COA Available
            </label>
          </div>
        );
      case 'analytics':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Analytics are automatically calculated from sales and views. Edit specific overrides here if needed.</p>
            <FormGroup label="Manual Score Adjustment">
              <input type="number" placeholder="0" style={inputStyle} />
            </FormGroup>
          </div>
        );
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormGroup label="SKU">
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Supplier">
              <Select 
                value={supplierOptions.find(o => o.value === form.supplier) || null}
                onChange={(opt) => handleSupplierChange({ target: { value: opt ? opt.value : '' }})}
                options={supplierOptions}
                isSearchable={true}
                placeholder="Search or select a supplier..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '0.9rem',
                    minHeight: '40px'
                  })
                }}
              />
            </FormGroup>
            <FormGroup label="Format">
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} style={{...inputStyle, backgroundColor: '#fff', appearance: 'auto'}}>
                <option value="">Select format...</option>
                {catalogOptions.formats?.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Size / Dosage">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="e.g. 10 or 5 | 5" 
                  value={form.sizeValue} 
                  onChange={(e) => setForm({ ...form, sizeValue: e.target.value })} 
                  style={{...inputStyle, flex: 1}} 
                />
                <select 
                  value={form.sizeUnit} 
                  onChange={(e) => setForm({ ...form, sizeUnit: e.target.value })} 
                  style={{...inputStyle, backgroundColor: '#fff', width: '100px', appearance: 'auto'}}
                >
                  <option value="">Unit...</option>
                  {catalogOptions.units?.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </FormGroup>
          </div>
        );
    }
  };

  const modalContent = (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      icon={<PackageOpen size={20} color="#6366f1" />}
      badge={variant.sku || 'N/A'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '12px' }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} icon={<Save size={16} />}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div style={{ padding: '24px' }}>
        {renderContent()}
      </div>
    </RightWorkspacePanel>
  );

  return isOpen ? createPortal(modalContent, document.body) : null;
}
