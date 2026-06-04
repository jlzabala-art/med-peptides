import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateProtocolFull } from '../../services/protocolStorage';
import { useToast } from '../../hooks/useToast';
import ProtocolEditorWidget from '../protocol/ProtocolEditorWidget';

export default function AdminProtocolEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setProtocol({
        protocol_name: '',
        status: 'draft',
        phases: [{ label: 'Phase 1', durationWeeks: 4, items: [] }],
        supplements: [],
        technicalInfo: { halfLife: '24 hours' }
      });
      setLoading(false);
      return;
    }

    const fetchProtocol = async () => {
      try {
        const docRef = doc(db, 'protocols', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProtocol({ id: snap.id, ...snap.data() });
        } else {
          showToast('Protocol not found', 'error');
          navigate('/admin/protocols');
        }
      } catch (err) {
        console.error('Error fetching protocol:', err);
        showToast('Error loading protocol', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProtocol();
  }, [id, navigate, showToast]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      // Logic for saving. Update the document in Firestore
      // For 'new', we would use addDoc, but updateProtocolFull usually handles it if id is provided.
      // Assuming updateProtocolFull handles the deep merge
      const docId = id === 'new' ? (formData.protocol_slug || `new-${Date.now()}`) : id;
      await updateProtocolFull(docId, formData);
      showToast('Protocol saved successfully', 'success');
      navigate('/admin/protocols');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Error saving protocol', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/protocols');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Editor...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <ProtocolEditorWidget 
        initialData={protocol} 
        onSave={handleSave} 
        isSaving={saving}
        onCancel={handleCancel}
        showCancel={true}
      />
    </div>
  );
}
