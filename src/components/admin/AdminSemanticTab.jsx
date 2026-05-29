import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  where,
  startAt,
  endAt,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Sparkles,
  X,
  Loader2,
  Info,
  Check,
} from 'lucide-react';
import AppDataTable from '../ui/AppDataTable';

const CANONICAL_GOALS = [
  'cognitive_mood',
  'hormonal_optimization',
  'immune_support',
  'longevity_anti_aging',
  'metabolic_weight',
  'recovery_repair',
  'sleep_circadian',
];

const GOAL_LABELS = {
  cognitive_mood: 'Cognitive & Mood',
  hormonal_optimization: 'Hormonal Optimization',
  immune_support: 'Immune Support',
  longevity_anti_aging: 'Longevity & Anti-Aging',
  metabolic_weight: 'Metabolic & Weight',
  recovery_repair: 'Recovery & Repair',
  sleep_circadian: 'Sleep & Circadian',
};

export default function AdminSemanticTab({ readOnly = false }) {
  const { user } = useAuth();

  // Products and Pagination State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'ready' | 'pending'

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Refining states
  const [editingProduct, setEditingProduct] = useState(null);
  const [refiningIds, setRefiningIds] = useState(new Set());
  const [bulkRefining, setBulkRefining] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (msg, type = 'info') =>
    setLog((prev) => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 15));

  const getToken = async () => user?.getIdToken?.();

  // Call the AI refinement Cloud Function
  async function callRefineAgent(body) {
    const token = await getToken();
    const baseUrl =
      import.meta.env.VITE_FUNCTIONS_BASE_URL ||
      'https://europe-west1-atlas-health-app.cloudfunctions.net';
    const resp = await fetch(`${baseUrl}/refineSemanticAgent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  };

  // Fetch products from Firestore
  const fetchProducts = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setProducts([]);
      }

      try {
        let qRef = collection(db, 'products');
        let constraints = [];

        // Goal Filter
        if (selectedGoal && selectedGoal !== 'all') {
          constraints.push(where('goals', 'array-contains', selectedGoal));
        }

        // Name Search Prefix Match (case-sensitive)
        if (searchTerm.trim()) {
          constraints.push(orderBy('name'));
          constraints.push(startAt(searchTerm.trim()));
          constraints.push(endAt(searchTerm.trim() + '\uf8ff'));
        } else {
          constraints.push(orderBy('name'));
        }

        // Pagination
        if (isLoadMore && lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(20));

        const q = query(qRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const newDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply client-side status filter
        let filteredDocs = newDocs;
        if (selectedStatus === 'ready') {
          filteredDocs = newDocs.filter((p) => p.goals && p.goals.length > 0);
        } else if (selectedStatus === 'pending') {
          filteredDocs = newDocs.filter((p) => !(p.goals && p.goals.length > 0));
        }

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...filteredDocs]);
        } else {
          setProducts(filteredDocs);
        }

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(querySnapshot.docs.length === 20);

        if (!isLoadMore) {
          addLog(`Loaded ${newDocs.length} products (Page 1)`, 'success');
        } else {
          addLog(`Loaded ${newDocs.length} additional products`, 'success');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        addLog(`Fetch error: ${err.message}`, 'error');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, selectedGoal, selectedStatus, lastDoc]
  );

  useEffect(() => {
    setLastDoc(null);
    fetchProducts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGoal, selectedStatus]);

  // Run AI refinement for a single product
  async function handleSingleRefine(product) {
    setRefiningIds((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    addLog(`Refining "${product.name}" with Gemini AI...`, 'info');

    try {
      await callRefineAgent({
        mode: 'refine',
        productId: product.id,
        name: product.name,
        category: product.category || '',
        description: product.description || '',
        currentGoals: product.goals || [],
        currentSecondaryFactors: product.secondaryFactors || [],
        currentMechanisms: product.mechanisms || [],
      });

      const docRef = doc(db, 'products', product.id);
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        const updatedData = { id: product.id, ...updatedSnap.data() };
        setProducts((prev) => prev.map((p) => (p.id === product.id ? updatedData : p)));
      }
      addLog(`Refined "${product.name}" successfully!`, 'success');
    } catch (err) {
      console.error(err);
      addLog(`Refinement failed for "${product.name}": ${err.message}`, 'error');
    } finally {
      setRefiningIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // Run AI refinement for selected products in bulk
  async function handleBulkRefine(idsToRefine) {
    if (!idsToRefine || idsToRefine.length === 0) return;
    setBulkRefining(true);
    addLog(`Running bulk refinement for ${idsToRefine.length} items...`, 'info');

    const productsToRefine = products
      .filter((p) => idsToRefine.includes(p.id))
      .map((p) => ({
        productId: p.id,
        name: p.name,
        category: p.category || '',
        description: p.description || '',
        currentGoals: p.goals || [],
        currentSecondaryFactors: p.secondaryFactors || [],
        currentMechanisms: p.mechanisms || [],
      }));

    try {
      await callRefineAgent({ mode: 'refine_bulk', products: productsToRefine });
      addLog(`Bulk refinement completed successfully!`, 'success');
      setLastDoc(null);
      await fetchProducts(false);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      addLog(`Bulk refinement failed: ${err.message}`, 'error');
    } finally {
      setBulkRefining(false);
    }
  };

  // Save manual edits to Firestore
  async function handleSaveManualEdits(e) {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const docRef = doc(db, 'products', editingProduct.id);

      const cleanGoals = editingProduct.goals.filter((g) => CANONICAL_GOALS.includes(g));
      const cleanSecondary = editingProduct.secondaryFactors
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);
      const cleanMechanisms = editingProduct.mechanisms
        .map((mech) => mech.trim())
        .filter((mech) => mech.length > 0);

      const updatePayload = {
        goals: cleanGoals,
        secondaryFactors: cleanSecondary,
        mechanisms: cleanMechanisms,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatePayload);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...updatePayload,
                updatedAt: new Date(),
              }
            : p
        )
      );

      addLog(`Saved edits for "${editingProduct.name}"`, 'success');
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      addLog(`Save failed: ${err.message}`, 'error');
    }
  };

  const columns = [
    {
      header: 'Product Details',
      key: 'name',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {p.category || 'No Category'} • {p.dosage || 'No Dosage'}
          </div>
        </div>
      ),
    },
    {
      header: 'AI Status',
      key: 'status',
      render: (p) => {
        const isReady = p.goals && p.goals.length > 0;
        return (
          <div
            title={isReady ? 'Ready for Semantic Search' : 'Requires AI Semantic Refinement'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              color: isReady ? 'var(--color-success)' : '#f59e0b',
              background: isReady ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
            }}
          >
            {isReady ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{isReady ? 'READY' : 'PENDING'}</span>
          </div>
        );
      },
    },
    {
      header: 'Primary Goals',
      key: 'goals',
      render: (p) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {p.goals && p.goals.length > 0 ? (
            p.goals.slice(0, 2).map((goal) => (
              <span
                key={goal}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'var(--color-bg-hover)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '4px',
                }}
              >
                {GOAL_LABELS[goal] || goal}
              </span>
            ))
          ) : (
            <span
              style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}
            >
              No goals assigned
            </span>
          )}
          {p.goals && p.goals.length > 2 && (
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
              +{p.goals.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Mechanisms Summary',
      key: 'mechanisms',
      render: (p) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {p.mechanisms && p.mechanisms.length > 0 ? p.mechanisms.slice(0, 2).join(', ') : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (p) => {
        const isRefining = refiningIds.has(p.id);
        return (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              title="Edit manually"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProduct({
                  ...p,
                  goals: p.goals || [],
                  secondaryFactors: p.secondaryFactors || [],
                  mechanisms: p.mechanisms || [],
                });
              }}
              disabled={isRefining || readOnly}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-surface)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit2 size={13} />
            </button>
            <button
              title="Refine with AI"
              onClick={(e) => {
                e.stopPropagation();
                handleSingleRefine(p);
              }}
              disabled={isRefining || readOnly}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-surface)',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isRefining ? (
                <Loader2 size={13} className="spinner-small" />
              ) : (
                <Sparkles size={13} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  const renderExpandedRow = (p) => (
    <div
      style={{
        padding: '16px 24px',
        background: 'var(--color-bg-app)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.05)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.05em',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '10px',
          }}
        >
          Product Description
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--color-text-secondary)',
          }}
        >
          {p.description || 'No description provided for this product.'}
        </p>
      </div>

      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.05)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.05em',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '10px',
          }}
        >
          Canonical Optimization Goals
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CANONICAL_GOALS.map((goal) => {
            const isActive = p.goals?.includes(goal);
            return (
              <div
                key={goal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                {isActive ? (
                  <CheckCircle2
                    size={14}
                    style={{ color: 'var(--color-success)', marginRight: 8 }}
                  />
                ) : (
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '1px solid var(--color-border)',
                      marginRight: '8px',
                    }}
                  />
                )}
                <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                  {GOAL_LABELS[goal]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.05)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.05em',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '10px',
          }}
        >
          Secondary Search Tags (English)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {p.secondaryFactors && p.secondaryFactors.length > 0 ? (
            p.secondaryFactors.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'rgba(26,115,232,0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: '4px',
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <span
              style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}
            >
              No search tags generated
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.05em',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '10px',
            marginTop: '14px',
          }}
        >
          Biological Mechanisms
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: '16px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {p.mechanisms && p.mechanisms.length > 0 ? (
            p.mechanisms.map((mech, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {mech}
              </li>
            ))
          ) : (
            <span
              style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}
            >
              No biological mechanisms declared
            </span>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: 'var(--color-bg-surface)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔬 AI Semantic Intelligence Sync
          </h2>
          <p
            style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}
          >
            Enrich Firestore product catalogs for medical/clinical natural language search queries.
          </p>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--table-radius)',
          backgroundColor: 'var(--color-bg-surface)',
          overflow: 'hidden',
        }}
      >
        <AppDataTable
          columns={columns}
          data={products}
          keyField="id"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          expandableRender={renderExpandedRow}
          renderBatchActions={(ids) => (
            <button
              onClick={() => handleBulkRefine(ids)}
              disabled={bulkRefining}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {bulkRefining ? (
                <Loader2 size={14} className="spinner-small" />
              ) : (
                <Sparkles size={14} />
              )}
              Refine Selected with AI
            </button>
          )}
          emptyTitle="No semantic data found"
          emptyDescription="No products matched the given filters."
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by product name prefix (case-sensitive)..."
          filters={[
            ...(selectedGoal !== 'all' ? [{ label: 'Canonical Goal', value: selectedGoal, type: 'goal' }] : []),
            ...(selectedStatus !== 'all' ? [{ label: 'AI Status', value: selectedStatus, type: 'status' }] : [])
          ]}
          onFilterRemove={(f) => {
            if (f.type === 'goal') setSelectedGoal('all');
            if (f.type === 'status') setSelectedStatus('all');
          }}
          renderCustomFilters={() => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                style={{
                  height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
                  border: '1px solid var(--border)', backgroundColor: selectedGoal === 'all' ? 'white' : 'var(--primary-light)',
                  color: selectedGoal === 'all' ? 'var(--text-main)' : 'var(--primary)',
                  fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
                }}
              >
                <option value="all">Goal: All</option>
                {CANONICAL_GOALS.map((g) => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
                  border: '1px solid var(--border)', backgroundColor: selectedStatus === 'all' ? 'white' : 'var(--primary-light)',
                  color: selectedStatus === 'all' ? 'var(--text-main)' : 'var(--primary)',
                  fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
                }}
              >
                <option value="all">Status: All</option>
                <option value="ready">READY (Enriched)</option>
                <option value="pending">PENDING (Incomplete)</option>
              </select>
            </div>
          )}
        />
        {hasMore && products.length > 0 && !loading && (
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-app)',
            }}
          >
            <button
              onClick={() => fetchProducts(true)}
              disabled={loadingMore}
              className="btn btn-outline"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {loadingMore ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}
      </div>

      {/* Log Console */}
      <div style={{ marginTop: '2rem' }}>
        <div
          style={{
            background: 'var(--color-bg-app)',
            borderRadius: '4px',
            padding: '14px 18px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}
          >
            System Execution Logs
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {log.length === 0 ? (
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                Console idle... awaiting requests.
              </div>
            ) : (
              log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    padding: '2px 0',
                    lineHeight: 1.6,
                    color:
                      entry.type === 'error'
                        ? 'var(--color-danger)'
                        : entry.type === 'success'
                          ? 'var(--color-success)'
                          : 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-tertiary)', marginRight: '8px' }}>
                    [{entry.ts}]
                  </span>
                  {entry.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal popup */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--color-bg-surface)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Edit Semantic Metadata: {editingProduct.name}
              </h3>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                onClick={() => setEditingProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveManualEdits}
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Canonical Optimization Goals
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {CANONICAL_GOALS.map((goal) => {
                    const isChecked = editingProduct.goals.includes(goal);
                    return (
                      <label
                        key={goal}
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const nextGoals = e.target.checked
                              ? [...editingProduct.goals, goal]
                              : editingProduct.goals.filter((g) => g !== goal);
                            setEditingProduct({ ...editingProduct, goals: nextGoals });
                          }}
                          style={{ marginRight: 8 }}
                        />
                        {GOAL_LABELS[goal]}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Secondary Search Tags (English, comma-separated)
                </label>
                <textarea
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg-app)',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                  rows={2}
                  value={editingProduct.secondaryFactors.join(', ')}
                  placeholder="e.g. skin health, wrinkle reduction, anti aging"
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim());
                    setEditingProduct({ ...editingProduct, secondaryFactors: arr });
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Biological Mechanisms (comma-separated)
                </label>
                <textarea
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg-app)',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                  rows={2}
                  value={editingProduct.mechanisms.join(', ')}
                  placeholder="e.g. collagen synthesis, cell proliferation"
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim());
                    setEditingProduct({ ...editingProduct, mechanisms: arr });
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminSemanticTab | Props: none
      </div>
    
</div>
  );
}
