"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, AlertCircle, RefreshCw, Link2, Plus, ExternalLink,
  ChevronDown, ChevronUp, Search, CheckCircle2, ShieldCheck, Sparkles, Box, Edit3
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
        toast.error(res.error || 'Failed to match prescription APIs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to Zoho matching engine: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      toast.error('Por favor, selecciona un ítem válido de Zoho Books para vincular.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Vinculando ${itemEval.coreName} con Zoho Books...`);

    try {
      const res = await confirmApiZohoAssociationAction({
        apiRawName: itemEval.rawInput || itemEval.coreName,
        apiDose: itemEval.dose || '',
        zohoItem,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ ${itemEval.coreName} vinculado permanentemente`, { id: toastId });
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
        toast.error(res.error || 'Failed to confirm link', { id: toastId });
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
      toast.error('Selecciona primero un candidato para editar');
      return;
    }

    setEditingCandidateIndex(apiIndex);
    setEditCandidateForm({
      itemId: candidate.item_id,
      name: candidate.name || candidate.item_name || '',
      sku: candidate.sku || itemEval.suggestedSku || '',
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

  const handleSubmitUpdateCandidate = async (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!editCandidateForm.name || !editCandidateForm.name.trim()) {
      toast.error('El nombre del ítem en Zoho es obligatorio.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Actualizando '${editCandidateForm.name}' en Zoho Books...`);

    try {
      const res = await updateZohoItemAndConfirmAction({
        itemId: editCandidateForm.itemId,
        updatedFields: editCandidateForm,
        apiData: itemEval,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Actualizado en Zoho y vinculado permanentemente`, { id: toastId });
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
        toast.error(res.error || 'Error al actualizar ítem en Zoho', { id: toastId });
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
      sku: itemEval.suggestedSku || `API-${itemEval.coreName.toUpperCase().slice(0, 8)}`,
      unit: itemEval.dose && itemEval.dose.toLowerCase().includes('ml') ? 'mL' : 'g',
      rate: 0,
      purchase_rate: 0,
      description: `Active Compounded Pharmaceutical Ingredient (API): ${itemEval.coreName}. Dosage: ${itemEval.dose || 'N/A'}.`
    });
  };

  const handleSubmitCreate = async (apiIndex) => {
    const itemEval = evalData[apiIndex];
    if (!createForm.name || !createForm.sku) {
      toast.error('Nombre y SKU son requeridos.');
      return;
    }

    setActingIndex(apiIndex);
    const toastId = toast.loading(`Creando '${createForm.name}' en Zoho Books...`);

    try {
      const res = await createZohoItemAndAssociateAction({
        apiData: itemEval,
        itemData: createForm,
        prescriptionId: prescription?.id,
        userEmail: user?.email || 'admin'
      });

      if (res.success) {
        toast.success(`✓ Ítem creado en Zoho Books y vinculado`, { id: toastId });
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
        toast.error(res.error || 'Error al crear ítem en Zoho', { id: toastId });
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
        toast.error('No se encontraron ítems en Zoho Books con esa búsqueda.');
      } else {
        toast.success(`Encontrados ${liveResults.length} ítems en Zoho Books`);
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
      toast.error('Error buscando en Zoho Books: ' + err.message);
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
        background: 'rgba(15, 23, 42, 0.65)',
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
          maxWidth: '860px',
          maxHeight: '94vh',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Link2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Vincular APIs & Concentraciones con Zoho Books
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: isAllLinked ? '#dcfce7' : '#eff6ff',
                    color: isAllLinked ? '#15803d' : '#2563eb',
                    border: isAllLinked ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                  }}
                >
                  {isAllLinked ? '✓ 100% Vinculados' : `${totalLinked} de ${evalData.length} vinculados`}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Receta: <strong>#{prescription?.id?.slice(0, 8) || 'Rx'}</strong> · Paciente: <strong>{prescription?.patient?.name || prescription?.patientName || 'Paciente'}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#0284c7' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                Buscando candidatos en Zoho Books y validando concentraciones...
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Comparando tokens, dosis farmacológica y materias primas
              </div>
            </div>
          ) : evalData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px auto', color: '#f59e0b' }} />
              <div style={{ fontWeight: 600 }}>No se detectaron APIs en esta prescripción.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Explanatory note */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  fontSize: '0.75rem',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Control de Dosis & Compras:</strong> El nombre y concentración en Zoho Books deben coincidir exactamente para que los pedidos de compra a proveedores salgan calibrados. Puedes pulsar <strong>✏️ Editar en Zoho</strong> para ajustar el nombre antes de confirmar.
                </span>
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

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: isLinked ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Top Row: API Name & Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isLinked ? '#dcfce7' : '#f1f5f9',
                            color: isLinked ? '#16a34a' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{apiItem.coreName}</span>
                            {apiItem.dose && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#0284c7',
                                  background: '#e0f2fe',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #bae6fd'
                                }}
                              >
                                Concentración: {apiItem.dose}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Identificador único: <code style={{ color: '#475569' }}>{apiItem.slug}</code>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isLinked ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          <CheckCircle2 size={13} />
                          Vinculado en Diccionario
                        </span>
                      ) : apiItem.candidates.length > 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          ⚡ {apiItem.candidates[0].score}% Similitud
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a'
                          }}
                        >
                          Sin coincidencia exacta
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Active Zoho Link Display */}
                    {isLinked && apiItem.linkedItem ? (
                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <Box size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#14532d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {apiItem.linkedItem.name || apiItem.linkedItem.zoho_item_name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#166534', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span>SKU: <strong>{apiItem.linkedItem.sku || apiItem.linkedItem.zoho_sku || '—'}</strong></span>
                              <span>ID: <strong>{apiItem.linkedItem.item_id || apiItem.linkedItem.zoho_item_id}</strong></span>
                              {apiItem.linkedItem.rate > 0 && <span>Venta: <strong>{apiItem.linkedItem.rate} AED</strong></span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEvalData(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], isPersistent: false };
                              return next;
                            });
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      /* Not linked yet -> show Candidate Selector & Dosage Validation */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Dosage Mismatch / Match Alert Callout */}
                        {dosageEval && dosageEval.status === 'mismatch' && (
                          <div
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              fontSize: '0.73rem',
                              color: '#92400e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                              <span>{dosageEval.label}</span>
                            </div>
                            <button
                              onClick={() => handleOpenEditCandidate(idx)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid #d97706',
                                background: '#ffffff',
                                color: '#b45309',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              ✏️ Ajustar nombre en Zoho
                            </button>
                          </div>
                        )}

                        {dosageEval && dosageEval.status === 'exact' && (
                          <div
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              fontSize: '0.73rem',
                              color: '#15803d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                            <span>{dosageEval.label}</span>
                          </div>
                        )}

                        {/* Candidates Selector & Actions Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <select
                              value={selectedCandidate[idx] || ''}
                              onChange={(e) => setSelectedCandidate(prev => ({ ...prev, [idx]: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                fontSize: '0.8rem',
                                color: '#1e293b'
                              }}
                            >
                              {apiItem.candidates.length === 0 ? (
                                <option value="">No hay candidatos automáticos</option>
                              ) : (
                                apiItem.candidates.map((cand) => (
                                  <option key={cand.item_id} value={cand.item_id}>
                                    [{cand.score}% match] {cand.name} (SKU: {cand.sku || 'N/A'}) - {cand.rate || 0} AED
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              const promptVal = window.prompt(`Buscar en Zoho Books para '${apiItem.coreName}':`, apiItem.coreName);
                              if (promptVal) {
                                setLiveQuery(promptVal);
                                handleLiveSearch(idx);
                              }
                            }}
                            disabled={liveSearchingIndex === idx}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Search size={13} />
                            Buscar
                          </button>

                          {/* EDIT BEFORE CONFIRMING BUTTON */}
                          <button
                            onClick={() => isEditing ? setEditingCandidateIndex(null) : handleOpenEditCandidate(idx)}
                            disabled={!selectedCandidate[idx]}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              background: isEditing ? '#f1f5f9' : '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#b45309',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Editar el nombre o SKU en Zoho Books antes de vincular"
                          >
                            <Edit3 size={13} />
                            {isEditing ? 'Cancelar Edición' : 'Editar en Zoho'}
                          </button>

                          <button
                            onClick={() => handleConfirm(idx)}
                            disabled={isActing || !selectedCandidate[idx]}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '6px',
                              background: '#16a34a',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Check size={14} />
                            Confirmar Asociación
                          </button>

                          <button
                            onClick={() => isCreating ? setCreatingIndex(null) : handleOpenCreate(idx)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              background: isCreating ? '#f1f5f9' : '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={14} />
                            {isCreating ? 'Cancelar Alta' : 'Dar de Alta'}
                          </button>
                        </div>

                        {/* Inline Edit Form (Edit Zoho Item before matching) */}
                        {isEditing && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '12px',
                              borderRadius: '8px',
                              background: '#fffdf5',
                              border: '1px solid #fde68a',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e' }}>
                                ✏️ Editar ítem en Zoho Books antes de vincular:
                              </div>
                              {apiItem.dose && (
                                <button
                                  type="button"
                                  onClick={() => handleAppendDoseToName(idx)}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: '#e0f2fe',
                                    border: '1px solid #bae6fd',
                                    color: '#0369a1',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Añadir Dosis ({apiItem.dose}) al Nombre
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
                                  Nombre en Zoho Books (Debe incluir fármaco y concentración)
                                </label>
                                <input
                                  type="text"
                                  value={editCandidateForm.name || ''}
                                  onChange={(e) => setEditCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>SKU Código</label>
                                <input
                                  type="text"
                                  value={editCandidateForm.sku || ''}
                                  onChange={(e) => setEditCandidateForm(prev => ({ ...prev, sku: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>Precio Venta (AED)</label>
                                <input
                                  type="number"
                                  value={editCandidateForm.rate || 0}
                                  onChange={(e) => setEditCandidateForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => setEditingCandidateIndex(null)}
                                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => handleSubmitUpdateCandidate(idx)}
                                disabled={isActing}
                                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', border: 'none', background: '#b45309', color: '#ffffff', cursor: 'pointer' }}
                              >
                                {isActing ? 'Actualizando en Zoho...' : '💾 Actualizar en Zoho y Vincular'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Create Form */}
                        {isCreating && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '12px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              border: '1px dashed #93c5fd',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af' }}>
                              Dar de alta nuevo ítem en Zoho Books:
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>Nombre del Ítem</label>
                                <input
                                  type="text"
                                  value={createForm.name || ''}
                                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>SKU Código</label>
                                <input
                                  type="text"
                                  value={createForm.sku || ''}
                                  onChange={(e) => setCreateForm(prev => ({ ...prev, sku: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>Unidad</label>
                                <input
                                  type="text"
                                  value={createForm.unit || 'g'}
                                  onChange={(e) => setCreateForm(prev => ({ ...prev, unit: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>Precio Venta (AED)</label>
                                <input
                                  type="number"
                                  value={createForm.rate || 0}
                                  onChange={(e) => setCreateForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => setCreatingIndex(null)}
                                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => handleSubmitCreate(idx)}
                                disabled={isActing}
                                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', border: 'none', background: '#0284c7', color: '#ffffff', cursor: 'pointer' }}
                              >
                                {isActing ? 'Creando en Zoho...' : 'Crear y Vincular en Zoho Books'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {totalLinked} de {evalData.length} asociados permanentemente.
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                toast.success('Cambios aplicados correctamente.');
                if (onSaved) onSaved();
                onClose();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                background: '#0f766e',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
