/**
 * AdminBulkOrderBuilder.jsx
 *
 * Admin view to generate a bulk B2B order on behalf of a Wholesaler.
 * Provides:
 *   1. Wholesaler selector (queried from users with role == 'wholesaler')
 *   2. Prescription selection assigned to that wholesaler
 *   3. B2C orders selection (recent patient orders)
 *   4. Full catalog search (products & protocols) to add direct/own items
 *   5. Consolidated aggregated items preview (deduplicated & summed)
 *   6. Submit → Atomically creates the bulk order, updates statuses, links sources, and writes a notification.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  Send,
  Save,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { BULK_STATUS, RX_STATUS, ITEM_UNITS } from '../../config/prescriptionConfig';
import B2BOrderBuilderTable from './B2BOrderBuilderTable';

// ── Date Formatter ────────────────────────────────────────────────────────────
function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Catalog Search Bar ──────────────────────────────────────────────────────────
function CatalogSearchBar({ onAdd }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const search = useCallback(async (term) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'products'), limit(200)));
      const all = snap.docs.map((d) => ({ id: d.id, type: 'product', ...d.data() }));
      const filtered = all.filter((p) =>
        (p.name || p.displayName || '').toLowerCase().includes(term.toLowerCase())
      );

      const pSnap = await getDocs(query(collection(db, 'protocols'), limit(100)));
      const protos = pSnap.docs
        .map((d) => ({ id: d.id, type: 'protocol', ...d.data() }))
        .filter((p) => (p.name || '').toLowerCase().includes(term.toLowerCase()));

      setResults([...filtered.slice(0, 6), ...protos.slice(0, 4)]);
    } catch (err) {
      console.error('[CatalogSearch] Error in search:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    setQ(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 300);
  };

  const handleAdd = (item) => {
    onAdd({
      type: item.type,
      id: item.id,
      name: item.name || item.displayName || '',
      sku: item.sku || item.variants?.[0]?.sku || '',
      imageUrl: item.imageUrl || item.image || '',
      quantity: 1,
      unit: 'vials',
      dosage: item.dosage || '',
      notes: '',
    });
    setQ('');
    setResults([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-surface)',
        }}
      >
        {loading ? (
          <Loader2
            size={14}
            color="var(--color-text-tertiary)"
            style={{ animation: 'adminSpin 1s linear infinite' }}
          />
        ) : (
          <Search size={14} color="var(--color-text-tertiary)" />
        )}
        <input
          value={q}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Buscar producto o protocolo del catálogo..."
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: '0.78rem',
            color: 'var(--color-text-primary)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleAdd(r)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '1px solid #f1f5f9',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '0.8rem' }}>{r.type === 'protocol' ? '🧬' : '💊'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {r.name || r.displayName}
                </div>
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 600,
                  }}
                >
                  {r.type === 'protocol' ? 'Protocolo' : `SKU: ${r.sku || '—'}`}
                </div>
              </div>
              <Plus size={12} color="var(--color-primary)" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Source Row ────────────────────────────────────────────────────────────────
function SourceRow({ item, type, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const isPrescription = type === 'prescription';
  const alreadyInBulk = Boolean(item.bulkOrderId);

  return (
    <div
      onClick={() => !alreadyInBulk && onToggle(item.id)}
      style={{
        border: `1.5px solid ${selected ? 'var(--color-primary)' : alreadyInBulk ? 'var(--color-border)' : '#f1f5f9'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: alreadyInBulk
          ? 'var(--color-bg-app)'
          : selected
            ? 'rgba(0,54,102,0.01)'
            : 'var(--color-bg-surface)',
        opacity: alreadyInBulk ? 0.6 : 1,
        transition: 'all 0.12s',
        cursor: alreadyInBulk ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '4px',
            flexShrink: 0,
            border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: selected ? 'var(--color-primary)' : 'var(--color-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected && <CheckCircle2 size={10} color="var(--color-bg-surface)" strokeWidth={3} />}
        </div>

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            flexShrink: 0,
            background: isPrescription ? 'rgba(0,54,102,0.05)' : 'rgba(16,185,129,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPrescription ? (
            <ClipboardList size={12} color="var(--color-primary)" />
          ) : (
            <ShoppingBag size={12} color="var(--color-success)" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.78rem',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isPrescription
              ? item.patient?.name || item.patient?.email || 'Paciente sin nombre'
              : item.customerName || item.userName || item.uid?.slice(0, 8)}
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              color: 'var(--color-text-tertiary)',
              fontWeight: 600,
              marginTop: '0.1rem',
              display: 'flex',
              gap: '0.3rem',
              flexWrap: 'wrap',
            }}
          >
            <span>{fmtDate(item.createdAt)}</span>
            {isPrescription && item.doctorName && <span>· Dr. {item.doctorName}</span>}
            <span>
              · {(item.items || []).length} ítem{(item.items || []).length !== 1 ? 's' : ''}
            </span>
            {alreadyInBulk && (
              <span style={{ color: '#6366f1', fontWeight: 700 }}>· Ya en bulk</span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-border)',
            padding: '0.2rem',
          }}
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {open && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderTop: '1px solid #f8fafc',
            background: '#fafbfc',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {(item.items || item.lineItems || []).map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem' }}>
                <span>{it.type === 'protocol' ? '🧬' : '💊'}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', flex: 1 }}>
                  {it.name || it.productName}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {it.quantity} {it.unit || 'vials'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Catalog Item Row ────────────────────────────────────────────────────
function CatalogItemRow({ item, index, onChange, onRemove }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        background: 'var(--color-bg-app)',
        border: '1px solid #f1f5f9',
      }}
    >
      <span style={{ fontSize: '0.8rem' }}>{item.type === 'protocol' ? '🧬' : '💊'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </div>
        {item.sku && (
          <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
            SKU: {item.sku}
          </div>
        )}
      </div>
      <button
        onClick={() =>
          onChange(index, { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) })
        }
        style={qb}
      >
        −
      </button>
      <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center', fontSize: '0.78rem' }}>
        {item.quantity || 1}
      </span>
      <button
        onClick={() => onChange(index, { ...item, quantity: (item.quantity || 1) + 1 })}
        style={qb}
      >
        +
      </button>
      <select
        value={item.unit || 'vials'}
        onChange={(e) => onChange(index, { ...item, unit: e.target.value })}
        style={{ ...inpSelect, width: 64 }}
      >
        {ITEM_UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <button
        onClick={() => onRemove(index)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fca5a5',
          padding: '0.2rem',
        }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

const qb = {
  width: 20,
  height: 20,
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  background: 'var(--color-bg-surface)',
  cursor: 'pointer',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const inpSelect = {
  fontSize: '0.72rem',
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  padding: '0.2rem 0.3rem',
  outline: 'none',
  fontFamily: 'inherit',
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-bg-surface)',
};

// ── Aggregated preview item ───────────────────────────────────────────────────
function AggregatedItemRow({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        background: 'var(--color-bg-app)',
        border: '1px solid #f1f5f9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>{item.type === 'protocol' ? '🧬' : '💊'}</span>
        <span
          style={{
            fontWeight: 800,
            fontSize: '0.78rem',
            color: 'var(--color-text-primary)',
            flex: 1,
          }}
        >
          {item.name || item.id}
        </span>
        <span
          style={{
            fontWeight: 900,
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
            minWidth: 24,
            textAlign: 'right',
          }}
        >
          {item.quantity}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', minWidth: 32 }}>
          {item.unit}
        </span>
        {item.sources?.length > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-border)',
              padding: '0.1rem',
            }}
          >
            <Eye size={12} />
          </button>
        )}
      </div>
      {open && item.sources?.length > 0 && (
        <div
          style={{
            marginTop: '0.3rem',
            paddingLeft: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
          }}
        >
          {item.sources.map((s, i) => (
            <div
              key={i}
              style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}
            >
              {s.type === 'own'
                ? '📦 stock catalog'
                : s.type === 'prescription'
                  ? `💊 Rx: ${s.patientName || '—'} (Dr. ${s.doctorName || '—'})`
                  : `🛒 Order: ${s.patientName || '—'}`}
              {' · '}
              {s.quantity} {item.unit}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminBulkOrderBuilder({ onBack, onSuccess }) {
  const { user } = useAuth();

  // Wholesalers list
  const [wholesalers, setWholesalers] = useState([]);
  const [selectedWS, setSelectedWS] = useState(null);

  // Sources data
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingWSData, setLoadingWSData] = useState(false);

  // Selections
  const [selectedPrescriptions, setSP] = useState(new Set());
  const [selectedOrders, setSO] = useState(new Set());
  const [catalogItems, setCatalogItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState('prescriptions'); // 'prescriptions' | 'orders' | 'catalog' | 'preview'

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Load wholesalers ──
  useEffect(() => {
    getDocs(
      query(
        collection(db, 'users'),
        where('role', '==', 'wholesaler'),
        orderBy('firstName'),
        limit(100)
      )
    )
      .then((snap) => {
        setWholesalers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      })
      .catch((err) => {
        console.error('Error loading wholesalers:', err);
        setErrorMsg('Error al cargar la lista de wholesalers.');
      });
  }, []);

  // ── Load prescriptions + orders for the selected wholesaler ──
  useEffect(() => {
    if (!selectedWS) {
      setPrescriptions([]);
      setOrders([]);
      setSP(new Set());
      setSO(new Set());
      return;
    }
    setLoadingWSData(true);

    const loadData = async () => {
      try {
        // Query prescriptions assigned to this wholesaler
        const qRx = query(
          collection(db, 'prescriptions'),
          where('wholesalerIds', 'array-contains', selectedWS.uid),
          limit(100)
        );
        const rxSnap = await getDocs(qRx);
        const rxList = rxSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Filter in-memory for active status to avoid complex composite index
        const validRx = rxList.filter((d) =>
          [RX_STATUS.SENT, RX_STATUS.ASSIGNED_TO_WS].includes(d.status)
        );
        validRx.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setPrescriptions(validRx);

        // Load recent B2C orders (wholesalers can fulfill any B2C orders)
        const qOrd = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
        const ordSnap = await getDocs(qOrd);
        const ordList = ordSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Only show orders that aren't already grouped in another bulk order
        const availableOrders = ordList.filter((o) => !o.bulkOrderId);
        setOrders(availableOrders);
      } catch (err) {
        console.error('Error loading wholesaler data:', err);
      } finally {
        setLoadingWSData(false);
      }
    };

    loadData();
  }, [selectedWS]);

  // ── Aggregation Logic ──
  const selectedRxData = prescriptions.filter((p) => selectedPrescriptions.has(p.id));
  const selectedOrdData = orders.filter((o) => selectedOrders.has(o.id));

  const aggregated = (() => {
    const map = new Map();
    const addItems = (items, source) => {
      for (const item of items || []) {
        const key = `${item.type || 'product'}__${item.id || item.productId}`;
        if (map.has(key)) {
          const ex = map.get(key);
          ex.quantity += Number(item.quantity) || 0;
          ex.sources.push({ ...source, quantity: Number(item.quantity) || 0 });
        } else {
          map.set(key, {
            type: item.type || 'product',
            id: item.id || item.productId,
            name: item.name || item.productName || '',
            sku: item.sku || item.variantSku || '',
            unit: item.unit || 'vials',
            quantity: Number(item.quantity) || 0,
            sources: [{ ...source, quantity: Number(item.quantity) || 0 }],
          });
        }
      }
    };
    selectedRxData.forEach((rx) =>
      addItems(rx.items, {
        type: 'prescription',
        patientName: rx.patient?.name,
        doctorName: rx.doctorName,
      })
    );
    selectedOrdData.forEach((o) =>
      addItems(o.items || o.lineItems, { type: 'order', patientName: o.customerName })
    );
    catalogItems.forEach((i) => {
      // Add custom rate explicitly for B2B Order Builder
      const key = `${i.type || 'product'}__${i.id}`;
      if (map.has(key)) {
        const ex = map.get(key);
        ex.quantity += Number(i.quantity) || 0;
        ex.sources.push({ type: 'own', quantity: Number(i.quantity) || 0, rate: i.rate });
      } else {
        map.set(key, {
          type: i.type || 'product',
          id: i.id,
          name: i.name || '',
          sku: i.sku || '',
          unit: i.unit || 'vials',
          quantity: Number(i.quantity) || 0,
          rate: i.rate,
          sources: [{ type: 'own', quantity: Number(i.quantity) || 0, rate: i.rate }],
        });
      }
    });
    return Array.from(map.values());
  })();

  const totalSelected = selectedPrescriptions.size + selectedOrders.size;

  // Toggle selectors
  const toggleRx = (id) =>
    setSP((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleOrd = (id) =>
    setSO((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Catalog item management
  const addCatalogItem = (item) => setCatalogItems((p) => [...p, item]);
  const updateCatalogItem = (i, v) =>
    setCatalogItems((p) => p.map((x, idx) => (idx === i ? v : x)));
  const removeCatalogItem = (i) => setCatalogItems((p) => p.filter((_, idx) => idx !== i));

  // ── Batch Create Bulk Order B2B ──
  const handleSubmit = async () => {
    if (!selectedWS) {
      setErrorMsg('Selecciona un Wholesaler.');
      return;
    }
    if (aggregated.length === 0) {
      setErrorMsg('Añade al menos un producto o selecciona prescripciones/órdenes.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const batch = writeBatch(db);

      // Create new bulk order document reference
      const bulkRef = doc(collection(db, 'bulk_orders'));
      const bulkId = bulkRef.id;

      const wsName =
        `${selectedWS.firstName || ''} ${selectedWS.lastName || ''}`.trim() || 'Wholesaler';

      const payload = {
        wholesalerId: selectedWS.uid,
        wholesalerName: wsName,
        wholesalerEmail: selectedWS.email || '',
        status: 'submitted', // Submitted directly by Admin
        source_prescription_ids: [...selectedPrescriptions],
        source_order_ids: [...selectedOrders],
        own_items: catalogItems,
        aggregated_items: aggregated,
        totalItems: aggregated.reduce((s, i) => s + i.quantity, 0),
        notes: notes,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        timeline: [
          {
            event: 'submitted',
            actorId: user?.uid || 'admin',
            actorRole: 'admin',
            note: 'Generada por el Administrador en representación del wholesaler.',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // 1. Write bulk order doc
      batch.set(bulkRef, payload);

      // 2. Mark prescriptions as added_to_bulk
      for (const rxId of selectedPrescriptions) {
        const rxRef = doc(db, 'prescriptions', rxId);
        batch.update(rxRef, {
          status: 'added_to_bulk',
          bulkOrderId: bulkId,
          updatedAt: serverTimestamp(),
          timeline: [
            {
              event: 'added_to_bulk',
              actorId: user?.uid || 'admin',
              actorRole: 'admin',
              note: `Consolidada en pedido bulk B2B #${bulkId.slice(0, 8)}`,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }

      // 3. Mark B2C orders with bulkOrderId
      for (const ordId of selectedOrders) {
        const ordRef = doc(db, 'orders', ordId);
        batch.update(ordRef, {
          bulkOrderId: bulkId,
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Create admin notification
      const notifRef = doc(collection(db, 'admin_notifications'));
      batch.set(notifRef, {
        type: 'bulk_order_submitted',
        title: 'Nuevo Bulk Order B2B (Admin)',
        body: `Pedido bulk generado por Administrador para ${wsName} con ${aggregated.length} líneas.`,
        bulkOrderId: bulkId,
        wholesalerId: selectedWS.uid,
        wholesalerName: wsName,
        status: 'unread',
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      onSuccess?.();
    } catch (err) {
      console.error('Error creating bulk order batch:', err);
      setErrorMsg('Error al guardar el pedido en Firestore: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header / Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
            Generar Bulk Order B2B
          </h2>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            Crea un pedido consolidado en representación de un wholesaler.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            borderRadius: '4px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--color-danger)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={14} />
          {errorMsg}
        </div>
      )}

      {/* Step 1: Select Wholesaler */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          padding: '1rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.65rem',
            fontWeight: 900,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '0.5rem',
          }}
        >
          1. Seleccionar Wholesaler
        </label>
        <select
          value={selectedWS?.uid || ''}
          onChange={(e) => {
            const ws = wholesalers.find((w) => w.uid === e.target.value);
            setSelectedWS(ws || null);
          }}
          style={{
            width: '100%',
            padding: '0.55rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--color-bg-surface)',
            fontSize: '0.82rem',
          }}
        >
          <option value="">-- Selecciona un wholesaler --</option>
          {wholesalers.map((w) => (
            <option key={w.uid} value={w.uid}>
              {`${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email} ({w.email})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Wholesaler Workflow */}
      {selectedWS ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
          {/* Left Column: Source selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tabs Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '0.2rem',
                padding: '0.2rem',
                borderRadius: '6px',
                background: '#f1f5f9',
              }}
            >
              {[
                { id: 'prescriptions', label: `Rx Asignadas (${prescriptions.length})` },
                { id: 'orders', label: `B2C Libres (${orders.length})` },
                { id: 'catalog', label: `Añadir Catálogo (${catalogItems.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.35rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: 'none',
                    fontFamily: 'inherit',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: tab === t.id ? 'var(--color-bg-surface)' : 'transparent',
                    color: tab === t.id ? '#0f172a' : 'var(--color-text-secondary)',
                    boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 280 }}
            >
              {loadingWSData ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 200,
                  }}
                >
                  <Loader2
                    size={24}
                    style={{ animation: 'adminSpin 1s linear infinite' }}
                    color="#6366f1"
                  />
                </div>
              ) : (
                <>
                  {/* Prescriptions Tab */}
                  {tab === 'prescriptions' &&
                    (prescriptions.length === 0 ? (
                      <div style={emptyTab}>
                        No hay prescripciones activas asignadas a este wholesaler.
                      </div>
                    ) : (
                      prescriptions.map((rx) => (
                        <SourceRow
                          key={rx.id}
                          item={rx}
                          type="prescription"
                          selected={selectedPrescriptions.has(rx.id)}
                          onToggle={toggleRx}
                        />
                      ))
                    ))}

                  {/* Orders Tab */}
                  {tab === 'orders' &&
                    (orders.length === 0 ? (
                      <div style={emptyTab}>
                        No hay órdenes B2C de pacientes sin pedido bulk asignado.
                      </div>
                    ) : (
                      orders.map((o) => (
                        <SourceRow
                          key={o.id}
                          item={o}
                          type="order"
                          selected={selectedOrders.has(o.id)}
                          onToggle={toggleOrd}
                        />
                      ))
                    ))}

                  {/* Catalog / Custom Tab */}
                  {tab === 'catalog' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <B2BOrderBuilderTable 
                        items={catalogItems} 
                        onChange={setCatalogItems} 
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Consolidation preview & Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Consolidated Preview */}
            <div
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  Resumen Consolidado B2B
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: 'rgba(99,102,241,0.06)',
                    color: '#6366f1',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  {totalSelected} fuentes
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  maxHeight: 320,
                  overflowY: 'auto',
                  paddingRight: '0.2rem',
                }}
              >
                {aggregated.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '0.75rem',
                      padding: '2rem 0',
                    }}
                  >
                    Selecciona fuentes a la izquierda o añade ítems del catálogo para ver el resumen
                    consolidado.
                  </div>
                ) : (
                  aggregated.map((item, i) => <AggregatedItemRow key={i} item={item} />)
                )}
              </div>

              {aggregated.length > 0 && (
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span>{aggregated.length} Líneas totales</span>
                  <span style={{ color: 'var(--color-primary)', fontSize: '0.78rem' }}>
                    {aggregated.reduce((s, i) => s + i.quantity, 0)} unidades
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                Notas de la orden
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones del administrador, notas de asignación..."
                  rows={2}
                  style={{
                    fontSize: '0.78rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '0.45rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                  }}
                />
              </label>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmit}
              disabled={submitting || aggregated.length === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: submitting || aggregated.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} style={{ animation: 'adminSpin 1s linear infinite' }} />
                  Procesando lote...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Crear y Enviar Pedido B2B
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--color-text-tertiary)',
            border: '1.5px dashed #e2e8f0',
            borderRadius: '8px',
            background: '#fafbfc',
          }}
        >
          <Building size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
            Selecciona un wholesaler arriba
          </div>
          <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
            Podrás consolidar prescripciones, órdenes o agregar ítems propios para este canal.
          </div>
        </div>
      )}

      <style>{`
        @keyframes adminSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const emptyTab = {
  textAlign: 'center',
  padding: '3rem 1rem',
  color: 'var(--color-text-tertiary)',
  fontSize: '0.75rem',
  border: '1px dashed #e2e8f0',
  borderRadius: '6px',
  background: '#fafbfc',
};
