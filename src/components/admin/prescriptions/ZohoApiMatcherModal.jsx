"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, AlertCircle, RefreshCw, Link2, Plus, ExternalLink,
  ChevronDown, ChevronUp, Search, CheckCircle2, ShieldCheck, Sparkles, Box, Edit3,
  Copy, ArrowRight
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import {
  matchPrescriptionApisAction,
  confirmApiZohoAssociationAction,
  createZohoItemAndAssociateAction,
  updateZohoItemAndConfirmAction,
  searchZohoBooksLiveItems
} from '../../../actions/zohoItemMatchingActions';
import { useAuth } from '../../../context/AuthContext';

const ZOHO_ORG_ID = '662274409'; // Mediluxe Health Solutions (UAE)

export default function ZohoApiMatcherModal({
  isOpen,
  onClose,
  prescription,
  onSaved = null
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actingIndex, setActingIndex] = useState(null);
  const [evalData, setEvalData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const [creatingIndex, setCreatingIndex] = useState(null);
  const [createForm, setCreateForm] = useState({});
  const [editingCandidateIndex, setEditingCandidateIndex] = useState(null);
  const [editCandidateForm, setEditCandidateForm] = useState({});
  const [liveSearchingIndex, setLiveSearchingIndex] = useState(null);
  const [liveQuery, setLiveQuery] = useState('');
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);

  // Extract raw API list from prescription
  const apis = useMemo(() => {
    if (!prescription) return [];
    const items = prescription.items || prescription.compounds || prescription.products || prescription.prescriptionLines || [];
    return items.map((it, idx) => ({
      id: it.id || it.productId || `api_${idx}`,
      name: it.name || it.productName || it.activeIngredient || it.product_title || `API #${idx + 1}`,
      dosage: it.dosage || it.dose || it.strength || it.concentration || '',
      quantity: it.quantity || 1,
      zoho_item_id: it.zoho_item_id || null,
      zoho_item_name: it.zoho_item_name || null,
      zoho_sku: it.zoho_sku || null
    }));
  }, [prescription]);

  // Load matches whenever modal opens
  useEffect(() => {
    if (isOpen && prescription) {
      loadMatching();
    } else {
      setEvalData([]);
      setSelectedCandidate({});
      setCreatingIndex(null);
      setEditingCandidateIndex(null);
      setCopiedSkuIndex(null);
    }
  }, [isOpen, prescription]);

  const loadMatching = async () => {
    setLoading(true);
    try {
      const res = await matchPrescriptionApisAction({
        prescriptionId: prescription?.id,
        apis
      });

      if (res.success && Array.isArray(res.apis)) {
        setEvalData(res.apis);
        // Pre-select top candidate or persistent match for each
        const initialSelections = {};
        res.apis.forEach((item, idx) => {
          if (item.linkedItem) {
            initialSelections[idx] = item.linkedItem.item_id;
          } else if (item.candidates && item.candidates[0]) {
            initialSelections[idx] = item.candidates[0].item_id;
          }
        });
        setSelectedCandidate(initialSelections);
      } else {
        toast.error(res.error || 'Failed to match prescription APIs with Zoho Books');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to Zoho matching engine: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAtlasSku = (skuText, idx) => {
    if (!skuText) return;
    navigator.clipboard.writeText(skuText);
    setCopiedSkuIndex(idx);
    toast.success(`Copied Atlas SKU '${skuText}' to clipboard`);
    setTimeout(() => setCopiedSkuIndex(null), 2000);
  };

  const handleConfirm = async (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!itemEval) return;

    const candidateId = selectedCandidate[apiIndex];
    let zohoItem = itemEval.candidates.find(c => c.item_id === candidateId) || itemEval.linkedItem;

    if (!zohoItem && candidateId) {
      zohoItem = { item_id: candidateId, name: itemEval.coreName };
    }

    if (!zohoItem || !zohoItem.item_id) {
      toast.error('Please select a valid Zoho Books inventory item to link.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Linking ${itemEval.coreName} with Zoho Books...`);

    try {
      const res = await confirmApiZohoAssociationAction({
        apiRawName: itemEval.rawInput || itemEval.coreName,
        apiDose: itemEval.dose || '',
        zohoItem,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Linked ${itemEval.coreName} permanently in Master Dictionary`, { id: toastId });
        setEvalData(prev => {
          const next = [...prev];
          next[apiIndex] = {
            ...next[apiIndex],
            isPersistent: true,
            linkedItem: zohoItem
          };
          return next;
        });
        if (onSaved) onSaved();
      } else {
        toast.error(res.error || 'Failed to confirm association', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setActingIndex(null);
    }
  };

  // ── Open Inline Editor to edit Zoho Item BEFORE confirming ──────────
  const handleOpenEditCandidate = (apiIndex) => {
    const itemEval = evalData[apiIndex];
    const candidateId = selectedCandidate[apiIndex];
    const candidate = itemEval.candidates.find(c => c.item_id === candidateId) || itemEval.linkedItem;

    if (!candidate) {
      toast.error('Please select a candidate to edit first');
      return;
    }

    setEditingCandidateIndex(apiIndex);
    setEditCandidateForm({
      itemId: candidate.item_id,
      name: candidate.name || candidate.item_name || '',
      sku: candidate.sku || itemEval.suggestedSku || itemEval.slug || '',
      rate: candidate.rate || 0,
      purchase_rate: candidate.purchase_rate || 0,
      unit: candidate.unit || 'Piece',
      description: candidate.description || ''
    });
  };

  const handleAppendDoseToName = (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!itemEval.dose) return;
    const currentName = editCandidateForm.name || '';
    if (!currentName.toLowerCase().includes(itemEval.dose.toLowerCase())) {
      setEditCandidateForm(prev => ({
        ...prev,
        name: `${currentName} ${itemEval.dose}`.trim(),
        sku: prev.sku ? `${prev.sku}-${itemEval.dose.toUpperCase().replace(/[^A-Z0-9]/g, '')}` : prev.sku
      }));
    }
  };

  const handleApplyAtlasSkuToForm = (apiIndex, skuToUse) => {
    setEditCandidateForm(prev => ({
      ...prev,
      sku: skuToUse
    }));
    toast.success(`Atlas SKU applied to Zoho form: ${skuToUse}`);
  };

  // ── Instant 1-Click Sync of Atlas SKU to Zoho Books ─────────────────
  const handleDirectSyncAtlasSkuToZoho = async (apiIndex, targetSku) => {
    const itemEval = evalData[apiIndex];
    const candidateId = selectedCandidate[apiIndex];
    const candidate = itemEval.candidates.find(c => c.item_id === candidateId) || itemEval.linkedItem;

    if (!candidate || !candidate.item_id) {
      toast.error('Select a Zoho item candidate first.');
      return;
    }

    const skuToSet = targetSku || itemEval.suggestedSku || itemEval.slug;
    setActingIndex(apiIndex);
    const toastId = toast.loading(`Updating SKU in Zoho Books to '${skuToSet}'...`);

    try {
      const res = await updateZohoItemAndConfirmAction({
        itemId: candidate.item_id,
        updatedFields: {
          name: candidate.name || candidate.item_name || itemEval.coreName,
          sku: skuToSet,
          rate: candidate.rate || 0,
          purchase_rate: candidate.purchase_rate || 0,
          unit: candidate.unit || 'g',
          description: candidate.description || ''
        },
        apiData: itemEval,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Updated Zoho SKU to '${skuToSet}' and linked`, { id: toastId });
        setEvalData(prev => {
          const next = [...prev];
          next[apiIndex] = {
            ...next[apiIndex],
            isPersistent: true,
            linkedItem: res.updatedItem
          };
          return next;
        });
        if (onSaved) onSaved();
      } else {
        toast.error(res.error || 'Failed to update SKU in Zoho Books', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setActingIndex(null);
    }
  };

  const handleSubmitUpdateCandidate = async (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!editCandidateForm.name || !editCandidateForm.name.trim()) {
      toast.error('Item name in Zoho Books is required.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Updating '${editCandidateForm.name}' in Zoho Books...`);

    try {
      const res = await updateZohoItemAndConfirmAction({
        itemId: editCandidateForm.itemId,
        updatedFields: editCandidateForm,
        apiData: itemEval,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Updated in Zoho Books & permanently linked`, { id: toastId });
        setEditingCandidateIndex(null);
        setEvalData(prev => {
          const next = [...prev];
          next[apiIndex] = {
            ...next[apiIndex],
            isPersistent: true,
            linkedItem: res.updatedItem
          };
          return next;
        });
        if (onSaved) onSaved();
      } else {
        toast.error(res.error || 'Failed to update item in Zoho', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setActingIndex(null);
    }
  };

  // ── Open Inline Creator for brand new Zoho Item ─────────────────────
  const handleOpenCreate = (apiIndex) => {
    const itemEval = evalData[apiIndex];
    setCreatingIndex(apiIndex);
    setCreateForm({
      name: `${itemEval.coreName} API${itemEval.dose ? ` ${itemEval.dose}` : ''}`,
      sku: itemEval.suggestedSku || itemEval.slug || `API-${itemEval.coreName.toUpperCase().slice(0, 8)}`,
      unit: itemEval.dose && itemEval.dose.toLowerCase().includes('ml') ? 'mL' : 'g',
      rate: 0,
      purchase_rate: 0,
      description: `Active Compounded Pharmaceutical Ingredient (API): ${itemEval.coreName}. Dosage: ${itemEval.dose || 'N/A'}.`
    });
  };

  const handleSubmitCreate = async (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!createForm.name || !createForm.sku) {
      toast.error('Name and SKU are required.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Creating '${createForm.name}' in Zoho Books...`);

    try {
      const res = await createZohoItemAndAssociateAction({
        apiData: itemEval,
        itemData: createForm,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Created in Zoho Books & permanently linked`, { id: toastId });
        setCreatingIndex(null);
        setEvalData(prev => {
          const next = [...prev];
          next[apiIndex] = {
            ...next[apiIndex],
            isPersistent: true,
            linkedItem: res.createdItem
          };
          return next;
        });
        if (onSaved) onSaved();
      } else {
        toast.error(res.error || 'Failed to create item in Zoho', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setActingIndex(null);
    }
  };

  const handleLiveSearch = async (apiIndex) => {
    if (!liveQuery.trim()) return;
    setLiveSearchingIndex(apiIndex);
    try {
      const liveResults = await searchZohoBooksLiveItems(liveQuery.trim());
      if (liveResults.length === 0) {
        toast.error('No items found in Zoho Books matching that query.');
      } else {
        toast.success(`Found ${liveResults.length} items in Zoho Books`);
        setEvalData(prev => {
          const next = [...prev];
          const curr = next[apiIndex];
          const existingIds = new Set((curr.candidates || []).map(c => c.item_id));
          const newCandidates = [...liveResults.filter(r => !existingIds.has(r.item_id)), ...(curr.candidates || [])];
          next[apiIndex] = {
            ...curr,
            candidates: newCandidates
          };
          return next;
        });
        setSelectedCandidate(prev => ({ ...prev, [apiIndex]: liveResults[0].item_id }));
      }
    } catch (err) {
      toast.error('Error searching Zoho Books: ' + err.message);
    } finally {
      setLiveSearchingIndex(null);
    }
  };

  if (!isOpen) return null;

  const totalLinked = evalData.filter(d => d.isPersistent || d.linkedItem).length;
  const isAllLinked = evalData.length > 0 && totalLinked === evalData.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(32, 33, 36, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(60, 64, 67, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #dadce0',
          fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Google Cloud Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#e8f0fe',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Link2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#202124', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Link APIs & Concentrations with Zoho Books</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    background: isAllLinked ? '#e6f4ea' : '#e8f0fe',
                    color: isAllLinked ? '#137333' : '#1a73e8',
                    border: isAllLinked ? '1px solid #ceead6' : '1px solid #d2e3fc'
                  }}
                >
                  {isAllLinked ? '✓ 100% Linked' : `${totalLinked} of ${evalData.length} linked`}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                Prescription: <strong style={{ color: '#202124' }}>#{prescription?.id?.slice(0, 10) || 'Rx'}</strong> · Patient: <strong style={{ color: '#202124' }}>{prescription?.patient?.name || prescription?.patientName || 'Patient'}</strong> · Organization: <span style={{ color: '#1a73e8' }}>Mediluxe (UAE · AED)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#f8fafd' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5f6368' }}>
              <RefreshCw size={30} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#1a73e8' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}>
                Querying Zoho Books inventory & matching pharmaceutical concentrations...
              </div>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '4px' }}>
                Analyzing token similarity, dosage strength, and catalog SKUs
              </div>
            </div>
          ) : evalData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5f6368' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px auto', color: '#f29900' }} />
              <div style={{ fontWeight: 500, color: '#202124' }}>No active pharmaceutical ingredients detected in this formulation.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Google Cloud Info Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  border: '1px solid #d2e3fc',
                  fontSize: '0.78rem',
                  color: '#174ea6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  lineHeight: 1.5
                }}
              >
                <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#1a73e8' }} />
                <div>
                  <strong>Dose & Procurement Calibration:</strong> Ingredient names, strengths, and SKUs in Zoho Books must match Atlas specifications so purchase orders to suppliers are accurately calibrated. You can click <strong>Edit in Zoho</strong> to update the item name or <strong>Copy Atlas SKU</strong> into Zoho Books before confirming.
                </div>
              </div>

              {/* Cards List */}
              {evalData.map((apiItem, idx) => {
                const isLinked = apiItem.isPersistent || (apiItem.linkedItem && apiItem.isPersistent);
                const isCreating = creatingIndex === idx;
                const isEditing = editingCandidateIndex === idx;
                const isActing = actingIndex === idx;

                const candidateId = selectedCandidate[idx];
                const selectedCand = apiItem.candidates.find(c => c.item_id === candidateId) || apiItem.candidates[0] || null;
                const dosageEval = selectedCand?.dosageEval || null;

                const atlasSku = apiItem.slug || `api_${apiItem.coreName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                const standardClinicalSku = apiItem.suggestedSku || `API-${apiItem.coreName.toUpperCase().slice(0, 8)}`;
                const zohoItemSku = isLinked 
                  ? (apiItem.linkedItem?.sku || apiItem.linkedItem?.zoho_sku || 'Not set')
                  : (selectedCand?.sku || 'Not set');

                const zohoItemId = isLinked 
                  ? (apiItem.linkedItem?.item_id || apiItem.linkedItem?.zoho_item_id)
                  : (selectedCand?.item_id);

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: isLinked ? '1.5px solid #34a853' : '1px solid #dadce0',
                      boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        padding: '12px 18px',
                        background: isLinked ? '#f6fbf7' : '#ffffff',
                        borderBottom: '1px solid #f1f3f4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isLinked ? '#ceead6' : '#f1f3f4',
                            color: isLinked ? '#137333' : '#3c4043',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#202124', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{apiItem.coreName}</span>
                            {apiItem.dose && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  color: '#1a73e8',
                                  background: '#e8f0fe',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  border: '1px solid #d2e3fc'
                                }}
                              >
                                Dose: {apiItem.dose}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isLinked ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 500,
                              background: '#e6f4ea',
                              color: '#137333',
                              border: '1px solid #ceead6'
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Linked in Master Dictionary
                          </span>
                        ) : apiItem.candidates.length > 0 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 500,
                              background: '#e8f0fe',
                              color: '#1a73e8',
                              border: '1px solid #d2e3fc'
                            }}
                          >
                            ⚡ {apiItem.candidates[0].score}% Similarity
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 500,
                              background: '#fef7e0',
                              color: '#b06000',
                              border: '1px solid #feefc3'
                            }}
                          >
                            No Direct Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side Comparison Grid (Atlas vs Zoho) */}
                    <div
                      style={{
                        padding: '16px 18px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '16px',
                        background: '#ffffff'
                      }}
                    >
                      {/* Left Column: ATLAS HEALTH SOURCE */}
                      <div
                        style={{
                          background: '#f8fafd',
                          borderRadius: '6px',
                          border: '1px solid #e8eaed',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#5f6368',
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              background: '#e8eaed',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Atlas Health (Prescription Spec)
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                            Qty: <strong>{apiItem.quantity || 1}</strong>
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Active Ingredient:</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#202124' }}>
                            {apiItem.coreName}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Prescribed Dose:</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a73e8' }}>
                              {apiItem.dose || 'Standard API'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Raw Input:</div>
                            <div style={{ fontSize: '0.78rem', color: '#3c4043', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {apiItem.rawInput || apiItem.coreName}
                            </div>
                          </div>
                        </div>

                        {/* Atlas SKU & Copy actions */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #dadce0',
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                              Atlas Logical SKU:
                            </div>
                            <code style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124' }}>
                              {atlasSku}
                            </code>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyAtlasSku(atlasSku, idx)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #dadce0',
                                background: '#ffffff',
                                color: copiedSkuIndex === idx ? '#137333' : '#3c4043',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Copy Atlas SKU to clipboard"
                            >
                              {copiedSkuIndex === idx ? <Check size={12} color="#137333" /> : <Copy size={12} />}
                              <span>{copiedSkuIndex === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectSyncAtlasSkuToZoho(idx, atlasSku)}
                              disabled={isActing || !selectedCand}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #d2e3fc',
                                background: '#e8f0fe',
                                color: '#1a73e8',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Sync this Atlas SKU directly into Zoho Books item"
                            >
                              <span>Apply to Zoho →</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: ZOHO BOOKS TARGET */}
                      <div
                        style={{
                          background: isLinked ? '#f6fbf7' : '#ffffff',
                          borderRadius: '6px',
                          border: isLinked ? '1px solid #ceead6' : '1px solid #dadce0',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#1a73e8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              background: '#e8f0fe',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Zoho Books (Inventory Item)
                          </span>
                          {zohoItemId && (
                            <a
                              href={`https://books.zoho.com/app/${ZOHO_ORG_ID}#/items/${zohoItemId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.72rem',
                                color: '#1a73e8',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontWeight: 500
                              }}
                              title="Open this item directly in Zoho Books web app"
                            >
                              <span>Open in Zoho</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        {/* Candidate Dropdown Selector (if not yet permanently linked) */}
                        {!isLinked ? (
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                              Select Matching Zoho Item:
                            </label>
                            <select
                              value={selectedCandidate[idx] || ''}
                              onChange={(e) => setSelectedCandidate(prev => ({ ...prev, [idx]: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid #dadce0',
                                background: '#ffffff',
                                fontSize: '0.8rem',
                                color: '#202124',
                                outline: 'none'
                              }}
                            >
                              {apiItem.candidates.length === 0 ? (
                                <option value="">No automatic candidate found</option>
                              ) : (
                                apiItem.candidates.map((cand) => (
                                  <option key={cand.item_id} value={cand.item_id}>
                                    [{cand.score}% match] {cand.name} (SKU: {cand.sku || 'N/A'})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Linked Zoho Item Name:</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#137333' }}>
                              {apiItem.linkedItem?.name || apiItem.linkedItem?.zoho_item_name}
                            </div>
                          </div>
                        )}

                        {/* Zoho Item Details Box */}
                        <div
                          style={{
                            background: '#f8fafd',
                            borderRadius: '6px',
                            border: '1px solid #e8eaed',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                                Zoho Books SKU:
                              </div>
                              <code style={{ fontSize: '0.82rem', fontWeight: 600, color: zohoItemSku === 'Not set' ? '#d93025' : '#202124' }}>
                                {zohoItemSku}
                              </code>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>Item ID:</div>
                              <div style={{ fontSize: '0.72rem', color: '#3c4043' }}>
                                {zohoItemId || '—'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#5f6368', borderTop: '1px solid #e8eaed', paddingTop: '4px' }}>
                            <span>Price / Rate: <strong style={{ color: '#202124' }}>{selectedCand?.rate || apiItem.linkedItem?.rate || 0} AED</strong></span>
                            <span>Unit: <strong style={{ color: '#202124' }}>{selectedCand?.unit || apiItem.linkedItem?.unit || 'g'}</strong></span>
                          </div>
                        </div>

                        {/* Dosage Mismatch Alert */}
                        {dosageEval && dosageEval.status === 'mismatch' && (
                          <div
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              background: '#fef7e0',
                              border: '1px solid #feefc3',
                              fontSize: '0.72rem',
                              color: '#b06000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertCircle size={13} style={{ color: '#f29900', flexShrink: 0 }} />
                              <span>{dosageEval.label}</span>
                            </div>
                            <button
                              onClick={() => handleOpenEditCandidate(idx)}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid #f29900',
                                background: '#ffffff',
                                color: '#b06000',
                                fontSize: '0.68rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Edit in Zoho
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row for this Card */}
                    <div
                      style={{
                        padding: '10px 18px',
                        background: '#f8fafd',
                        borderTop: '1px solid #dadce0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Live Search Zoho Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const promptVal = window.prompt(`Search Zoho Books inventory for '${apiItem.coreName}':`, apiItem.coreName);
                            if (promptVal) {
                              setLiveQuery(promptVal);
                              handleLiveSearch(idx);
                            }
                          }}
                          disabled={liveSearchingIndex === idx}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            background: '#ffffff',
                            border: '1px solid #dadce0',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            color: '#3c4043',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Search size={13} />
                          <span>Search Zoho</span>
                        </button>

                        {/* Create new Zoho item button */}
                        <button
                          type="button"
                          onClick={() => isCreating ? setCreatingIndex(null) : handleOpenCreate(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            background: isCreating ? '#f1f3f4' : '#ffffff',
                            border: '1px solid #dadce0',
                            color: '#1a73e8',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Plus size={13} />
                          <span>{isCreating ? 'Cancel Create' : 'Create New in Zoho'}</span>
                        </button>

                        {/* Open Zoho in Web Tab button */}
                        {zohoItemId && (
                          <a
                            href={`https://books.zoho.com/app/${ZOHO_ORG_ID}#/items/${zohoItemId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              border: '1px solid #dadce0',
                              color: '#5f6368',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            title="Edit this item on the official Zoho Books website"
                          >
                            <ExternalLink size={13} />
                            <span>Edit in Zoho Web</span>
                          </a>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* EDIT BEFORE CONFIRMING BUTTON */}
                        <button
                          type="button"
                          onClick={() => isEditing ? setEditingCandidateIndex(null) : handleOpenEditCandidate(idx)}
                          disabled={!selectedCandidate[idx] && !isLinked}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            background: isEditing ? '#f1f3f4' : '#ffffff',
                            border: '1px solid #dadce0',
                            color: '#1a73e8',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Edit name, SKU, or rates in Zoho Books directly via REST API"
                        >
                          <Edit3 size={13} />
                          <span>{isEditing ? 'Close Editor' : 'Edit in Zoho'}</span>
                        </button>

                        {/* CONFIRM ASSOCIATION BUTTON */}
                        {isLinked ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEvalData(prev => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], isPersistent: false };
                                return next;
                              });
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              border: '1px solid #dadce0',
                              color: '#5f6368',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Change Link
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirm(idx)}
                            disabled={isActing || !selectedCandidate[idx]}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '4px',
                              background: '#1a73e8',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                            }}
                          >
                            <Check size={14} />
                            <span>Confirm Link</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form (Edit Zoho Item before matching) */}
                    {isEditing && (
                      <div
                        style={{
                          margin: '12px 18px',
                          padding: '14px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1.5px solid #1a73e8',
                          boxShadow: '0 2px 8px rgba(26,115,232,0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Edit3 size={15} />
                            <span>Edit Item in Zoho Books (Direct Cloud Update):</span>
                          </div>
                          {apiItem.dose && (
                            <button
                              type="button"
                              onClick={() => handleAppendDoseToName(idx)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: '#e8f0fe',
                                border: '1px solid #d2e3fc',
                                color: '#1a73e8',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              + Append Dose ({apiItem.dose}) to Name
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                              Item Name in Zoho Books (Should include drug & concentration)
                            </label>
                            <input
                              type="text"
                              value={editCandidateForm.name || ''}
                              onChange={(e) => setEditCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368' }}>Zoho SKU Code</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleApplyAtlasSkuToForm(idx, atlasSku)}
                                  style={{
                                    fontSize: '0.68rem',
                                    color: '#1a73e8',
                                    background: '#e8f0fe',
                                    border: 'none',
                                    borderRadius: '3px',
                                    padding: '1px 5px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                  }}
                                  title="Use logical Atlas SKU in Zoho form"
                                >
                                  Use Atlas SKU
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyAtlasSkuToForm(idx, standardClinicalSku)}
                                  style={{
                                    fontSize: '0.68rem',
                                    color: '#1a73e8',
                                    background: '#e8f0fe',
                                    border: 'none',
                                    borderRadius: '3px',
                                    padding: '1px 5px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                  }}
                                  title="Use standardized clinical SKU"
                                >
                                  Use Std SKU
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={editCandidateForm.sku || ''}
                              onChange={(e) => setEditCandidateForm(prev => ({ ...prev, sku: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Sales Rate (AED)</label>
                            <input
                              type="number"
                              value={editCandidateForm.rate || 0}
                              onChange={(e) => setEditCandidateForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Purchase Cost Rate (AED)</label>
                            <input
                              type="number"
                              value={editCandidateForm.purchase_rate || 0}
                              onChange={(e) => setEditCandidateForm(prev => ({ ...prev, purchase_rate: parseFloat(e.target.value) || 0 }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Unit of Measure</label>
                            <input
                              type="text"
                              value={editCandidateForm.unit || 'g'}
                              onChange={(e) => setEditCandidateForm(prev => ({ ...prev, unit: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f3f4', paddingTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setEditingCandidateIndex(null)}
                            style={{ padding: '7px 14px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #dadce0', background: '#ffffff', color: '#3c4043', cursor: 'pointer' }}
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitUpdateCandidate(idx)}
                            disabled={isActing}
                            style={{
                              padding: '7px 16px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: 'none',
                              background: '#1a73e8',
                              color: '#ffffff',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                            }}
                          >
                            {isActing ? 'Saving to Zoho Books...' : '💾 Save to Zoho Books & Link'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Create Form (Brand New Zoho Item) */}
                    {isCreating && (
                      <div
                        style={{
                          margin: '12px 18px',
                          padding: '14px',
                          borderRadius: '6px',
                          background: '#f8fafd',
                          border: '1.5px dashed #1a73e8',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={15} />
                          <span>Create New Item in Zoho Books Inventory:</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Item Name</label>
                            <input
                              type="text"
                              value={createForm.name || ''}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>SKU Code</label>
                            <input
                              type="text"
                              value={createForm.sku || ''}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, sku: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Unit</label>
                            <input
                              type="text"
                              value={createForm.unit || 'g'}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, unit: e.target.value }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '4px' }}>Sales Price (AED)</label>
                            <input
                              type="number"
                              value={createForm.rate || 0}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', color: '#202124' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setCreatingIndex(null)}
                            style={{ padding: '7px 14px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #dadce0', background: '#ffffff', color: '#3c4043', cursor: 'pointer' }}
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitCreate(idx)}
                            disabled={isActing}
                            style={{
                              padding: '7px 16px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: 'none',
                              background: '#1a73e8',
                              color: '#ffffff',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                            }}
                          >
                            {isActing ? 'Creating in Zoho...' : 'Create & Link in Zoho Books'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Google Cloud Style Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #dadce0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>
            <strong style={{ color: '#202124' }}>{totalLinked} of {evalData.length}</strong> formulation ingredients permanently linked in Master Dictionary.
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#3c4043',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Changes applied successfully.');
                if (onSaved) onSaved();
                onClose();
              }}
              style={{
                padding: '8px 20px',
                borderRadius: '4px',
                border: 'none',
                background: '#1a73e8',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
              }}
            >
              Done & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
