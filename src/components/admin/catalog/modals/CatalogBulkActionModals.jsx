import React, { useState } from 'react';
import { Tag, Building, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function BulkSupplierModal({ isOpen, onClose, selectedIds, onApply, suppliers = [] }) {
  const [supplier, setSupplier] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '400px', maxWidth: '90%',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="#3b82f6" />
            Assign Supplier
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '16px' }}>
          Select a new supplier for the {selectedIds.length} selected items.
        </p>
        <select
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          style={{
            width: '100%', padding: '10px', borderRadius: '6px',
            border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '0.95rem'
          }}
        >
          <option value="">-- Select Supplier --</option>
          {suppliers.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
          <button
            onClick={() => {
              if (!supplier) {
                toast.error('Please select a supplier');
                return;
              }
              onApply(supplier);
            }}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkTagModal({ isOpen, onClose, selectedIds, onApply }) {
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '400px', maxWidth: '90%',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color="#8b5cf6" />
            Edit Tags
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '16px' }}>
          Add comma-separated tags to the {selectedIds.length} selected items.
        </p>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., clearance, backorder, high-priority"
          style={{
            width: '100%', padding: '10px', borderRadius: '6px',
            border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '0.95rem'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
          <button
            onClick={() => {
              if (!tags.trim()) {
                toast.error('Please enter at least one tag');
                return;
              }
              const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
              onApply(tagArray);
            }}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: '#8b5cf6', color: 'white', cursor: 'pointer', fontWeight: 500
            }}
          >
            Apply Tags
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkPoModal({ isOpen, onClose, selectedIds, onApply }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '400px', maxWidth: '90%',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
            Add to Purchase Order
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '24px' }}>
          You are adding <strong>{selectedIds.length} items</strong> to a new Purchase Order draft.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
          <button
            onClick={() => onApply()}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500
            }}
          >
            Create PO Draft
          </button>
        </div>
      </div>
    </div>
  );
}

export function BulkQuoteModal({ isOpen, onClose, selectedIds, onApply }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '400px', maxWidth: '90%',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
            Create Quotation
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '24px' }}>
          Create a new B2B Quotation draft containing these <strong>{selectedIds.length} items</strong>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
          <button
            onClick={() => onApply()}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: '#8b5cf6', color: 'white', cursor: 'pointer', fontWeight: 500
            }}
          >
            Create Quote Draft
          </button>
        </div>
      </div>
    </div>
  );
}
