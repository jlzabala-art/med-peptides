import X from "lucide-react/dist/esm/icons/x";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';



import { useToast } from '../../../hooks/useToast';

export default function BulkOrderSelectionModal({ isOpen, onClose, selectedProducts }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchDrafts();
    }
  }, [isOpen, user]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bulk_orders'),
        where('userId', '==', user.uid),
        where('status', '==', 'draft')
      );
      const snap = await getDocs(q);
      const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrafts(loaded.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('Error fetching bulk order drafts:', err);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDraft = async (draftId) => {
    setSubmitting(true);
    try {
      const ref = doc(db, 'bulk_orders', draftId);
      // format items to add
      const newItems = selectedProducts.map(p => ({
        productId: p.id,
        sku: p.sku || '',
        name: p.name || 'Unknown Product',
        quantity: 1, // Default to 1, user will adjust in the Bulk Orders page
        addedAt: new Date().toISOString()
      }));

      await updateDoc(ref, {
        items: arrayUnion(...newItems),
        updatedAt: new Date().toISOString()
      });

      toast.success(`${selectedProducts.length} items added to Bulk Order!`);
      onClose();
    } catch (err) {
      console.error('Error adding to draft:', err);
      toast.error('Could not add to draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewDraft = async (e) => {
    e.preventDefault();
    if (!newDraftName.trim()) return;
    setSubmitting(true);
    try {
      const newItems = selectedProducts.map(p => ({
        productId: p.id,
        sku: p.sku || '',
        name: p.name || 'Unknown Product',
        quantity: 1,
        addedAt: new Date().toISOString()
      }));

      await addDoc(collection(db, 'bulk_orders'), {
        userId: user.uid,
        referenceName: newDraftName.trim(),
        status: 'draft',
        items: newItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(`Created "${newDraftName}" with ${selectedProducts.length} items!`);
      setIsCreating(false);
      setNewDraftName('');
      onClose();
    } catch (err) {
      console.error('Error creating new draft:', err);
      toast.error('Could not create new draft');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Add to Bulk Order</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Adding {selectedProducts.length} items to a Requisition Draft.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Loading your drafts...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {drafts.length > 0 && !isCreating && (
                <>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Drafts</h4>
                  {drafts.map(draft => (
                    <button
                      key={draft.id}
                      onClick={() => handleAddToDraft(draft.id)}
                      disabled={submitting}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '6px' }}>
                          <Package size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{draft.referenceName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{draft.items?.length || 0} items currently</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>Select</span>
                    </button>
                  ))}
                  <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>or</span>
                  </div>
                </>
              )}

              {(!isCreating && drafts.length === 0) || !isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '8px',
                    backgroundColor: 'transparent', color: '#475569', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                >
                  <Plus size={16} /> Create New Draft
                </button>
              ) : (
                <form onSubmit={handleCreateNewDraft} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Reference Name (e.g. Q3 Clinic Supply)
                    </label>
                    <input
                      type="text"
                      value={newDraftName}
                      onChange={e => setNewDraftName(e.target.value)}
                      placeholder="Enter a name for this order..."
                      autoFocus
                      required
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1',
                        borderRadius: '6px', outline: 'none', fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {drafts.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={submitting || !newDraftName.trim()}
                      style={{
                        padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white',
                        border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                        opacity: (submitting || !newDraftName.trim()) ? 0.7 : 1
                      }}
                    >
                      {submitting ? 'Creating...' : 'Create & Add Items'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}