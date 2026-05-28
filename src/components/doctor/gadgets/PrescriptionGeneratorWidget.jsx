import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { catalog } from '../../../data/v2/index.js';
import { Plus, Search, FileText, CheckCircle2 } from 'lucide-react';

export default function PrescriptionGeneratorWidget() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(''); // can be a catalog product ID or a protocol ID
  const [dose, setDose] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch doctor's patients & protocols
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      try {
        const qPatients = query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', user.uid), where('status', '==', 'active'));
        const snapP = await getDocs(qPatients);
        setPatients(snapP.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const qProtocols = query(collection(db, 'custom_protocols'), where('doctorId', '==', user.uid));
        const snapProt = await getDocs(qProtocols);
        setProtocols(snapProt.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching data for generator", err);
      }
    }
    fetchData();
  }, [user]);

  const handlePrescribe = async () => {
    if (!selectedPatient || !selectedProduct || !dose || !durationDays || durationDays <= 0) {
      alert("Please fill all fields with valid data.");
      return;
    }
    setLoading(true);
    try {
      const p = patients.find(x => x.patientId === selectedPatient);
      
      let productName = selectedProduct;
      let peptidesList = [selectedProduct];
      let instructions = dose;

      // Check if the selected product is actually a custom protocol
      const customProt = protocols.find(x => x.id === selectedProduct);
      if (customProt) {
        productName = `Protocolo: ${customProt.name}`;
        peptidesList = customProt.products.map(prod => prod.id);
        if (customProt.instructions) {
          instructions = `${dose} | Notas del Protocolo: ${customProt.instructions}`;
        }
      } else {
        const prod = catalog.find(x => x.id === selectedProduct);
        if (prod) productName = prod.name;
      }
      
      // Calculate dates
      const now = new Date();
      const endD = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));
      // Alert 10 days before the end date to account for shipping
      const alertD = new Date(endD.getTime() - (10 * 24 * 60 * 60 * 1000));
      
      await addDoc(collection(db, 'recommendations'), {
        doctorId: user.uid,
        doctorName: user.displayName || 'Physician',
        patientId: p.patientId,
        patientName: p.patientName,
        patientEmail: p.patientEmail,
        peptides: peptidesList,
        productName: productName,
        notes: instructions,
        durationDays: Number(durationDays),
        estimatedEndDate: Timestamp.fromDate(endD),
        refillAlertDate: Timestamp.fromDate(alertD),
        status: 'pending', // Key trigger for Admin supply
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedPatient('');
        setSelectedProduct('');
        setDose('');
        setDurationDays(30);
      }, 3000);
    } catch (err) {
      console.error("Error prescribing", err);
      alert("Failed to issue prescription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={20} color="var(--primary)" /> Generar Receta
      </h3>
      
      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', gap: '1rem' }}>
          <CheckCircle2 size={48} />
          <h4 style={{ margin: 0, fontWeight: 800 }}>Receta Enviada</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Admin ha sido notificado para suministro.<br/>Se ha programado alerta de renovación (Refill) para el paciente.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Patient</label>
            <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }}>
              <option value="">-- Seleccionar Patient --</option>
              {patients.map(p => <option key={p.id} value={p.patientId}>{p.patientName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Fórmula / Producto</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }}>
              <option value="">-- Seleccionar --</option>
              {protocols.length > 0 && (
                <optgroup label="Mis Protocolos Personalizados">
                  {protocols.map(prot => <option key={prot.id} value={prot.id}>⚡ {prot.name}</option>)}
                </optgroup>
              )}
              <optgroup label="Catálogo Individual">
                {catalog.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Dosis</label>
              <input type="text" value={dose} onChange={e => setDose(e.target.value)} placeholder="Ej: 250mcg diarios" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Duración (Días)</label>
              <input type="number" min="1" value={durationDays} onChange={e => setDurationDays(e.target.value)} placeholder="30" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button 
            onClick={handlePrescribe}
            disabled={loading}
            style={{ 
              marginTop: 'auto', padding: '0.85rem', width: '100%',
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Procesando...' : <><Plus size={18} /> Emitir Prescripción</>}
          </button>
        </div>
      )}
    </div>
  );
}
