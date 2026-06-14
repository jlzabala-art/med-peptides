import Beaker from "lucide-react/dist/esm/icons/beaker";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Save from "lucide-react/dist/esm/icons/save";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { catalog } from '../../../data/v2/index.js';






export default function ProtocolBuilderWidget() {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [protocolName, setProtocolName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProtocols() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'custom_protocols'), where('doctorId', '==', user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProtocols(list);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProtocols();
  }, [user, loading]); // reload when loading changes (after save)

  const toggleProduct = (prodId) => {
    setSelectedProducts(prev => 
      prev.includes(prodId) ? prev.filter(p => p !== prodId) : [...prev, prodId]
    );
  };

  const handleSave = async () => {
    if (!protocolName || selectedProducts.length === 0) return;
    setLoading(true);
    try {
      const prods = selectedProducts.map(id => {
        const p = catalog.find(x => x.id === id);
        return { id, name: p?.name || id };
      });
      await addDoc(collection(db, 'custom_protocols'), {
        doctorId: user.uid,
        name: protocolName,
        products: prods,
        instructions: instructions,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setProtocolName('');
      setSelectedProducts([]);
      setInstructions('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Eliminar este protocolo?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'custom_protocols', id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={18} color="var(--primary)" /> Mis Protocolos
        </h3>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={16} /> Nuevo
          </button>
        )}
      </div>

      {isCreating ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Nombre del Protocolo</label>
            <input type="text" value={protocolName} onChange={e => setProtocolName(e.target.value)} placeholder="Ej: Protocolo Inmune Fuerte" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Productos Incluidos</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {catalog.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  style={{
                    padding: '0.5rem 0.8rem', borderRadius: '20px', border: '1.5px solid',
                    borderColor: selectedProducts.includes(p.id) ? 'var(--primary)' : 'var(--color-border)',
                    background: selectedProducts.includes(p.id) ? 'rgba(37,99,235,0.1)' : 'white',
                    color: selectedProducts.includes(p.id) ? 'var(--primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Instrucciones (opcional)</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} placeholder="Instrucciones combinadas..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <button 
              onClick={() => setIsCreating(false)}
              style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: 'var(--color-text-secondary)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading || !protocolName || selectedProducts.length === 0}
              style={{ flex: 2, padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Save size={16} /> {loading ? 'Guardando...' : 'Save Protocolo'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          {protocols.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
              No tienes protocolos personalizados.
            </div>
          ) : (
            protocols.map(prot => (
              <div key={prot.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{prot.name}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                    {prot.products?.map((p, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                  {prot.instructions && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      {prot.instructions}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(prot.id)}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}