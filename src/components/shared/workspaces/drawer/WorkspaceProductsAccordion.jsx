"use client";

import React, { useState, useEffect } from 'react';
import {
  Package,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Droplet,
  Search,
  X,
  Sparkles,
  Share2,
  Check,
  MessageCircle,
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import toast from 'react-hot-toast';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import ClinicalSyringeHelper from './ClinicalSyringeHelper';
import WorkspaceCompactRow from './products/WorkspaceCompactRow';
import WorkspaceItemCard from './products/WorkspaceItemCard';
import WorkspaceCatalogPickers from './products/WorkspaceCatalogPickers';
import QuickShareDatasheetModal from './QuickShareDatasheetModal';

export default function WorkspaceProductsAccordion({
  isExpanded,
  onToggleExpand,
  items = [],
  activeWs,
  subtotalSaleAmount = 0,
  getItemUnitPrice,
  getItemTierInfo = null,
  onUpdateItemQuantity,
  onUpdateItemPrice,
  onUpdateItemFormat,
  onRemoveItem,
  onAddBacteriostaticWater,
  protocols = [],
  availableProducts = [],
  savedKits = [],
  onLoadProtocol,
  onAddProduct,
  onLoadKit,
  onDeleteKit,
  searchingCatalog,
  onSearchCatalogFast,
  isAdmin = false,
  isDoctor = false,
  isWholesaler = false,
  isPatient = false,
  onAddClinicalRegimen,
  stepperMode = false,
  onOpenShareDatasheets = null,
}) {
  const [expandedItemIds, setExpandedItemIds] = useState({});
  const [activePicker, setActivePicker] = useState(null); // 'products' | 'protocols' | 'kits' | null
  const [pickerSearch, setPickerSearch] = useState('');
  const [showSyringeHelper, setShowSyringeHelper] = useState(false);
  const [shareDatasheetItem, setShareDatasheetItem] = useState(null);

  // High-capacity visualization state
  const [viewMode, setViewMode] = useState(items.length >= 6 ? 'compact' : 'cards');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [transferItemId, setTransferItemId] = useState(null);

  const workspacesMap = useWorkspaceStore((s) => s.workspaces);
  const moveItemBetweenWorkspaces = useWorkspaceStore((s) => s.moveItemBetweenWorkspaces);
  const copyItemBetweenWorkspaces = useWorkspaceStore((s) => s.copyItemBetweenWorkspaces);

  const handleShareItemDatasheet = async (item) => {
    const target = activeWs?.targetEntity;
    const recipientName = target?.name || target?.displayName || target?.companyName;

    // 1-Click Fast Path: if recipient is already bound to workspace, generate & copy instantly!
    if (recipientName) {
      const recipientType = target.role || target.type || (activeWs?.type === 'wholesaler' ? 'wholesaler' : 'doctor');
      const itemSlug = item.slug || String(item.canonicalName || item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const itemName = item.canonicalName || item.name || 'Compound';

      try {
        notifier.info(`Generating unique tracked link for ${recipientName}...`);
        const res = await fetch('/api/short-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: itemSlug,
            dose: item.dosage || item.dose || '',
            format: item.format || item.presentation || '',
            supplier: item.supplier || item.supplierId || null,
            productName: itemName,
            recipient: {
              id: target.id || null,
              name: recipientName,
              email: target.email || '',
              phone: target.phone || '',
              type: recipientType,
            },
            variant: {
              productId: item.productId || item.id,
              productName: itemName,
              dose: item.dosage || item.dose || '',
              format: item.format || item.presentation || '',
            },
          }),
        });

        if (!res.ok) throw new Error('Failed to generate tracked link');
        const data = await res.json();

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.shortUrl);
          toast.success(`Unique tracked link copied for ${recipientName}!`);
        }
      } catch (err) {
        console.error('[handleShareItemDatasheet]', err);
        setShareDatasheetItem(item);
      }
    } else {
      // No recipient in context: open quick picker modal
      setShareDatasheetItem(item);
    }
  };

  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleShareAllDatasheets = async () => {
    if (!items || items.length === 0) return;
    const target = activeWs?.targetEntity;
    const recipientName = target?.name || target?.displayName || target?.companyName || 'Client / Wholesaler';
    const recipientType = target?.role || target?.type || (activeWs?.type === 'wholesaler' ? 'wholesaler' : 'doctor');

    setIsGeneratingAll(true);
    notifier.info(`Generating unique tracked links for ${items.length} variants...`);

    try {
      const results = await Promise.all(
        items.map(async (item) => {
          const itemSlug = item.slug || String(item.canonicalName || item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const itemName = item.canonicalName || item.name || 'Compound';
          const itemDose = item.dosage || item.dose || '';
          const itemFormat = item.format || item.presentation || '';

          const res = await fetch('/api/short-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: itemSlug,
              dose: itemDose,
              format: itemFormat,
              supplier: item.supplier || item.supplierId || null,
              productName: itemName,
              recipient: {
                id: target?.id || null,
                name: recipientName,
                email: target?.email || '',
                phone: target?.phone || '',
                type: recipientType,
              },
              variant: {
                productId: item.productId || item.id,
                productName: itemName,
                dose: itemDose,
                format: itemFormat,
              },
            }),
          });

          if (!res.ok) throw new Error(`Failed to generate link for ${itemName}`);
          const data = await res.json();
          try {
            useWorkspaceStore.getState().updateItemData(item.id, {
              shortUrl: data.shortUrl,
              code: data.code,
              readStatus: 'unread',
              viewCount: 0,
              generatedAt: new Date().toISOString()
            }, activeWs?.id);
          } catch (_) {}

          return {
            name: itemName,
            dose: itemDose,
            format: itemFormat,
            shortUrl: data.shortUrl,
            targetUrl: data.targetUrl,
          };
        })
      );

      // Format text for WhatsApp / Clipboard
      const textLines = [
        `*Official Technical Datasheets — ATLAS HEALTH*`,
        `Recipient: ${recipientName}`,
        '',
        ...results.map((r, idx) => `${idx + 1}. *${r.name}* (${r.dose ? `${r.dose} ` : ''}${r.format || 'Vial'})\n👉 ${r.shortUrl}`),
        '',
        `Direct access with analytical traceability and clinical monograph.`
      ];

      const fullText = textLines.join('\n');
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
        toast.success(`Tracked links for ${results.length} variants copied to clipboard!`);
      }
    } catch (err) {
      console.error('[handleShareAllDatasheets]', err);
      notifier.error(`Error generating links: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Real-time link status & read tracking check (Buying Intent)
  useEffect(() => {
    const itemsWithCode = (items || []).filter(it => it.code);
    if (itemsWithCode.length === 0) return;

    itemsWithCode.forEach(async (it) => {
      try {
        const res = await fetch(`/api/short-url?code=${encodeURIComponent(it.code)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.viewCount !== it.viewCount || data.readStatus !== it.readStatus) {
            useWorkspaceStore.getState().updateItemData(it.id, {
              viewCount: data.viewCount || 0,
              readStatus: data.readStatus || 'unread',
              lastViewedAt: data.lastViewedAt || null,
            }, activeWs?.id);
          }
        }
      } catch (_) {}
    });
  }, [items?.length, activeWs?.id]);

  const handleShareWhatsAppBundle = async () => {
    if (!items || items.length === 0) {
      notifier.error('No products in workspace to quote.');
      return;
    }

    setIsGeneratingAll(true);
    try {
      const target = activeWs?.targetEntity;
      const recipientName = target?.name || target?.companyName || 'Valued Client';
      const recipientType = target?.type || 'Client';
      const currency = target?.currency || 'USD';

      // 1. Generate short URLs for each item in parallel
      const results = await Promise.all(
        items.map(async (item) => {
          const itemSlug = item.slug || String(item.canonicalName || item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const itemName = item.canonicalName || item.name || 'Compound';
          const itemDose = item.dosage || item.dose || '';
          const itemFormat = item.format || item.presentation || '';
          const qty = item.quantity || 1;
          const price = item.price || item.unitPrice || 0;
          const lineTotal = Number((qty * price).toFixed(2));

          let shortUrl = '';
          try {
            const res = await fetch('/api/short-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug: itemSlug,
                dose: itemDose,
                format: itemFormat,
                supplier: item.supplier || item.supplierId || null,
                productName: itemName,
                recipient: {
                  id: target?.id || null,
                  name: recipientName,
                  email: target?.email || '',
                  phone: target?.phone || '',
                  type: recipientType,
                },
                variant: {
                  productId: item.productId || item.id,
                  productName: itemName,
                  dose: itemDose,
                  format: itemFormat,
                },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              shortUrl = data.shortUrl;
              try {
                useWorkspaceStore.getState().updateItemData(item.id, {
                  shortUrl: data.shortUrl,
                  code: data.code,
                  readStatus: 'unread',
                  viewCount: 0,
                  generatedAt: new Date().toISOString()
                }, activeWs?.id);
              } catch (_) {}
            }
          } catch (e) {
            console.warn('Error generating short url for item', e);
          }

          return {
            name: itemName,
            dose: itemDose,
            format: itemFormat,
            qty,
            price,
            lineTotal,
            shortUrl,
          };
        })
      );

      const grandTotal = results.reduce((sum, r) => sum + r.lineTotal, 0);

      // Build complete WhatsApp Commercial Deal text in English
      const textLines = [
        `📋 *COMMERCIAL PROPOSAL — ATLAS HEALTH*`,
        `👤 *Client:* ${recipientName} (${String(recipientType).toUpperCase()})`,
        `📅 *Date:* ${new Date().toLocaleDateString()}`,
        `─────────────────────`,
        `*ITEMS & FORMULATIONS:*`,
        ...results.map((r, idx) => {
          const doseStr = r.dose ? ` ${r.dose}` : '';
          const formatStr = r.format ? ` (${r.format})` : '';
          const linkStr = r.shortUrl ? `\n   🔗 Technical Datasheet: ${r.shortUrl}` : '';
          return `${idx + 1}. *${r.name}*${doseStr}${formatStr}\n   Qty: ${r.qty} units × $${r.price.toFixed(2)} = *$${r.lineTotal.toFixed(2)} ${currency}*${linkStr}`;
        }),
        `─────────────────────`,
        `💰 *TOTAL PROPOSAL: $${grandTotal.toFixed(2)} ${currency}*`,
        `📦 *Includes:* Certified HPLC/MS analytical monograph + Batch release traceability.`,
        `⚡ Immediate stock availability & temperature-controlled priority dispatch.`
      ];

      const fullText = textLines.join('\n');
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
        toast.success(`Commercial proposal copied to clipboard ✓`);
      }

      // If recipient has phone, open WhatsApp directly
      const rawPhone = target?.phone || '';
      const cleanDigits = rawPhone.replace(/[^\d+]/g, '').replace('+', '');
      if (cleanDigits.length >= 7) {
        const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(fullText)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error('[handleShareWhatsAppBundle]', err);
      notifier.error(`Error generating proposal: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const availableWorkspaces = Object.values(workspacesMap || {}).filter((w) => w.id !== activeWs?.id);

  const handleTransferItem = (itemId, targetWorkspaceId, action) => {
    if (action === 'copy') {
      copyItemBetweenWorkspaces(itemId, activeWs?.id, targetWorkspaceId);
      const targetName = targetWorkspaceId === 'new' ? 'new workspace' : (workspacesMap[targetWorkspaceId]?.name || 'workspace');
      notifier.info(`Copied to ${targetName}`);
    } else {
      moveItemBetweenWorkspaces(itemId, activeWs?.id, targetWorkspaceId);
      const targetName = targetWorkspaceId === 'new' ? 'new workspace' : (workspacesMap[targetWorkspaceId]?.name || 'workspace');
      notifier.info(`Moved to ${targetName}`);
    }
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleGroupCollapse = (groupKey) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Filter items in workspace by live search query
  const displayedItems = (items || []).filter((it) => {
    if (!workspaceSearch.trim()) return true;
    const q = workspaceSearch.toLowerCase();
    const name = (it.canonicalName || it.name || it.displayName || '').toLowerCase();
    const sku = (it.sku || '').toLowerCase();
    const format = (it.format || '').toLowerCase();
    const dosage = (it.dosage || '').toLowerCase();
    const category = (it.category || '').toLowerCase();
    return name.includes(q) || sku.includes(q) || format.includes(q) || dosage.includes(q) || category.includes(q);
  });

  const getItemCategoryKey = (it) => {
    const fmt = (it.format || '').toLowerCase();
    const cat = (it.category || '').toLowerCase();
    const name = (it.canonicalName || it.name || '').toLowerCase();

    if (name.includes('bacteriostatic') || name.includes('water') || name.includes('saline') || cat.includes('diluent')) {
      return 'diluents';
    }
    if (fmt.includes('cartridge') || fmt.includes('pen')) {
      return 'cartridges';
    }
    if (fmt.includes('sublingual') || fmt.includes('drop') || fmt.includes('capsule') || fmt.includes('oral') || fmt.includes('nasal')) {
      return 'oral_topical';
    }
    return 'injectables';
  };

  const categoryMeta = {
    injectables: { label: '💉 Injectables & Lyophilized Vials', color: '#0284c7' },
    cartridges: { label: '🧪 Pre-filled Cartridges & Pens', color: '#7c3aed' },
    oral_topical: { label: '💧 Sublingual & Oral Formats', color: '#059669' },
    diluents: { label: '🌊 Reconstitution & Diluents', color: '#0891b2' },
  };

  const groupedItems = displayedItems.reduce((acc, it) => {
    const key = getItemCategoryKey(it);
    if (!acc[key]) acc[key] = [];
    acc[key].push(it);
    return acc;
  }, {});

  return (
    <div
      style={{
        backgroundColor: stepperMode ? 'transparent' : '#ffffff',
        border: stepperMode ? 'none' : '1px solid #cbd5e1',
        borderRadius: stepperMode ? '0' : '12px',
        overflow: stepperMode ? 'visible' : 'hidden',
        boxShadow: stepperMode ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        flex: stepperMode ? 1 : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Accordion Header Bar (Hidden in Stepper Mode) */}
      {!stepperMode && (
        <div
          onClick={onToggleExpand}
          style={{
            padding: '0.85rem 1.1rem',
            backgroundColor: '#ffffff',
            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
            {isExpanded ? (
              <ChevronDown size={18} style={{ color: isDoctor ? '#0d9488' : '#003666', flexShrink: 0 }} />
            ) : (
              <ChevronRight size={18} style={{ color: '#64748b', flexShrink: 0 }} />
            )}
            <Package size={17} style={{ flexShrink: 0, color: isDoctor ? '#0d9488' : '#003666' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isDoctor ? '#0d9488' : '#003666', lineHeight: 1 }}>
              Staged Products
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '99px',
                backgroundColor: items.length > 0 ? (isDoctor ? '#0d9488' : '#003666') : '#e2e8f0',
                color: items.length > 0 ? '#ffffff' : '#475569',
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {items.length}
            </span>
            {items.length >= 10 && (
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                High-Volume
              </span>
            )}
          </div>

          {items.length > 0 && (
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
              ${subtotalSaleAmount.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Body Content */}
      {(isExpanded || stepperMode) && (
        <div
          style={{
            padding: stepperMode ? '0.25rem 0' : '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: stepperMode ? 'transparent' : '#f8fafc',
            flex: stepperMode ? 1 : 'none',
          }}
        >
          {items.length === 0 ? (
            <WorkspaceCatalogPickers
              itemsCount={items.length}
              isAdmin={isAdmin}
              isDoctor={isDoctor}
              isWholesaler={isWholesaler}
              isPatient={isPatient}
              activePicker={activePicker}
              setActivePicker={setActivePicker}
              pickerSearch={pickerSearch}
              setPickerSearch={setPickerSearch}
              onAddClinicalRegimen={onAddClinicalRegimen}
              protocols={protocols}
              onLoadProtocol={onLoadProtocol}
              availableProducts={availableProducts}
              onAddProduct={onAddProduct}
              savedKits={savedKits}
              onLoadKit={onLoadKit}
              onDeleteKit={onDeleteKit}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Unified GCP Action Ribbon */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}
              >
                {/* Row 1: Primary Staging Actions & View Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'products' ? null : 'products')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0b57d0',
                        border: '1px solid #0b57d0',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 1px 2px rgba(11, 87, 208, 0.2)',
                        touchAction: 'manipulation',
                      }}
                      title="Add pharmaceutical research compounds to workspace"
                    >
                      <Plus size={13} strokeWidth={2.5} /> Add Compound
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'protocols' ? null : 'protocols')}
                      style={{
                        padding: '6px 11px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#3c4043',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        touchAction: 'manipulation',
                      }}
                      title="Load standardized multi-phase clinical protocol"
                    >
                      <FileText size={13} color="#0b57d0" /> Load Protocol
                    </button>
                    <button
                      type="button"
                      onClick={onAddBacteriostaticWater}
                      style={{
                        padding: '6px 11px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#0b57d0',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                      title="Add 30mL Bacteriostatic Water diluent vial"
                    >
                      <Droplet size={13} color="#0284c7" /> + BAC Water
                    </button>
                  </div>

                  {/* GCP Segmented View Switcher */}
                  <div style={{ display: 'inline-flex', backgroundColor: '#e8eaed', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('compact')}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: viewMode === 'compact' ? '#ffffff' : 'transparent',
                        color: viewMode === 'compact' ? '#0b57d0' : '#5f6368',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'compact' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="Compact Table View"
                    >
                      ☰ Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: viewMode === 'cards' ? '#ffffff' : 'transparent',
                        color: viewMode === 'cards' ? '#0b57d0' : '#5f6368',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="Cards View"
                    >
                      ▦ Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupByCategory((prev) => !prev)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: groupByCategory ? '#ffffff' : 'transparent',
                        color: groupByCategory ? '#0b57d0' : '#5f6368',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: groupByCategory ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="Group items by clinical route / category"
                    >
                      {groupByCategory ? '✓ Grouped' : 'Group'}
                    </button>
                  </div>
                </div>

                {/* Row 2: Export & Sharing Actions */}
                {items.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                      paddingTop: '6px',
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    {onOpenShareDatasheets && (
                      <button
                        type="button"
                        onClick={onOpenShareDatasheets}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#0b57d0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title="Share clinical datasheets of staged compounds via AI email generator"
                      >
                        <Sparkles size={12} color="#0b57d0" /> Share Datasheets (AI)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleShareAllDatasheets}
                      disabled={isGeneratingAll}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#3c4043',
                        cursor: isGeneratingAll ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                      title="Generate and copy unique tracked links for all compounds in this workspace"
                    >
                      <Share2 size={12} color="#5f6368" />
                      <span>{isGeneratingAll ? 'Generating...' : 'Copy All Links'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsAppBundle}
                      disabled={isGeneratingAll}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#137333',
                        cursor: isGeneratingAll ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                      title="Copy detailed commercial proposal and tracked links for WhatsApp"
                    >
                      <MessageCircle size={12} color="#188038" />
                      <span>WhatsApp Summary</span>
                    </button>
                    {isDoctor && (
                      <>
                        <button
                          type="button"
                          onClick={onPrintPatientLabels}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #dadce0',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#0d9488',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                          title="Print Avery-compliant clinical patient dosage labels"
                        >
                          <Tag size={12} /> Label Sheet
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSyringeHelper(!showSyringeHelper)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: showSyringeHelper ? '#e8f0fe' : '#ffffff',
                            border: `1px solid ${showSyringeHelper ? '#0b57d0' : '#dadce0'}`,
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: showSyringeHelper ? '#0b57d0' : '#3c4043',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                          title="U-100 Syringe Units & Reconstitution Helper"
                        >
                          <Droplet size={12} color="#0284c7" /> Syringe Guide
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Inline Syringe Calculator */}
              {isDoctor && showSyringeHelper && (
                <ClinicalSyringeHelper
                  defaultVialMg={5}
                  defaultDiluentMl={2}
                  defaultDoseMg={0.25}
                  compoundName={items[0]?.canonicalName || 'Compound'}
                />
              )}

              {/* High-Capacity Search Filter (Visible if 5 or more items) */}
              {items.length >= 5 && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    placeholder={`Filter ${items.length} staged compounds...`}
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 28px 6px 28px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.76rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  {workspaceSearch && (
                    <button
                      type="button"
                      onClick={() => setWorkspaceSearch('')}
                      style={{
                        position: 'absolute',
                        right: '7px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Items Display: Grouped or Flat */}
              {displayedItems.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    No products matching &ldquo;{workspaceSearch}&rdquo;
                  </p>
                </div>
              ) : viewMode === 'compact' ? (
                /* --- COMPACT TABLE VIEW (~34px rows) --- */
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Table Column Headers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto auto',
                      gap: '8px',
                      padding: '5px 10px',
                      backgroundColor: '#f1f5f9',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <span>Product & Dosage</span>
                    <span style={{ textAlign: 'center', minWidth: '70px' }}>Qty</span>
                    <span style={{ textAlign: 'right', minWidth: '55px' }}>
                      {isDoctor ? 'Clinic Price' : isWholesaler ? 'Wholesale Price' : isPatient ? 'Retail Price' : 'Price'}
                    </span>
                    <span style={{ textAlign: 'right', minWidth: '52px' }}>Total</span>
                    <span style={{ width: '24px' }}></span>
                  </div>

                  {/* Body Content */}
                  {groupByCategory ? (
                    Object.entries(groupedItems).map(([grpKey, grpList]) => {
                      if (!grpList || grpList.length === 0) return null;
                      const isCollapsed = !!collapsedGroups[grpKey];
                      const meta = categoryMeta[grpKey] || { label: grpKey, color: '#0f172a' };

                      return (
                        <div key={grpKey} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <div
                            onClick={() => toggleGroupCollapse(grpKey)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#f8fafc',
                              borderBottom: isCollapsed ? 'none' : '1px solid #f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: meta.color,
                            }}
                          >
                            <span>{meta.label} ({grpList.length})</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                              {isCollapsed ? '▼' : '▲'}
                            </span>
                          </div>
                          {!isCollapsed &&
                            grpList.map((it, idx) => (
                              <WorkspaceCompactRow
                                key={it.id || idx}
                                item={it}
                                it={it}
                                idx={idx}
                                unitRate={getItemUnitPrice ? getItemUnitPrice(it) : (it.unitPrice || it.price || 0)}
                                isAdmin={isAdmin}
                                isDoctor={isDoctor}
                                isWholesaler={isWholesaler}
                                isPatient={isPatient}
                                getItemUnitPrice={getItemUnitPrice}
                                getItemTierInfo={getItemTierInfo}
                                onUpdateItemPrice={onUpdateItemPrice}
                                onUpdateItemQuantity={onUpdateItemQuantity}
                                onRemoveItem={onRemoveItem}
                                transferItemId={transferItemId}
                                setTransferItemId={setTransferItemId}
                                availableWorkspaces={availableWorkspaces}
                                currentWorkspaceId={activeWs?.id}
                                onTransferItem={handleTransferItem}
                                onShareDatasheet={handleShareItemDatasheet}
                              />
                            ))}
                        </div>
                      );
                    })
                  ) : (
                    displayedItems.map((it, idx) => (
                      <WorkspaceCompactRow
                        key={it.id || idx}
                        item={it}
                        it={it}
                        idx={idx}
                        unitRate={getItemUnitPrice ? getItemUnitPrice(it) : (it.unitPrice || it.price || 0)}
                        isAdmin={isAdmin}
                        isDoctor={isDoctor}
                        isWholesaler={isWholesaler}
                        isPatient={isPatient}
                        getItemUnitPrice={getItemUnitPrice}
                        getItemTierInfo={getItemTierInfo}
                        onUpdateItemPrice={onUpdateItemPrice}
                        onUpdateItemQuantity={onUpdateItemQuantity}
                        onRemoveItem={onRemoveItem}
                        transferItemId={transferItemId}
                        setTransferItemId={setTransferItemId}
                        availableWorkspaces={availableWorkspaces}
                        currentWorkspaceId={activeWs?.id}
                        onTransferItem={handleTransferItem}
                        onShareDatasheet={handleShareItemDatasheet}
                      />
                    ))
                  )}
                </div>
              ) : (
                /* --- CARDS VIEW (Detailed Cards) --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {displayedItems.map((it, idx) => (
                    <WorkspaceItemCard
                      key={it.id || idx}
                      item={it}
                      isAdmin={isAdmin}
                      isDoctor={isDoctor}
                      isWholesaler={isWholesaler}
                      isPatient={isPatient}
                      isExpanded={!!expandedItemIds[it.id]}
                      onToggleExpand={toggleItemExpanded}
                      getItemUnitPrice={getItemUnitPrice}
                      getItemTierInfo={getItemTierInfo}
                      onUpdateItemPrice={onUpdateItemPrice}
                      onUpdateItemQuantity={onUpdateItemQuantity}
                      onUpdateItemFormat={onUpdateItemFormat}
                      onRemoveItem={onRemoveItem}
                      transferItemId={transferItemId}
                      setTransferItemId={setTransferItemId}
                      availableWorkspaces={availableWorkspaces}
                      currentWorkspaceId={activeWs?.id}
                      onTransferItem={handleTransferItem}
                      onShareDatasheet={handleShareItemDatasheet}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Catalog / Protocols / Saved Kits Inline Modals */}
          <WorkspaceCatalogPickers
            itemsCount={items.length}
            isAdmin={isAdmin}
            isDoctor={isDoctor}
            isWholesaler={isWholesaler}
            isPatient={isPatient}
            activePicker={activePicker}
            setActivePicker={setActivePicker}
            pickerSearch={pickerSearch}
            setPickerSearch={setPickerSearch}
            onAddClinicalRegimen={onAddClinicalRegimen}
            protocols={protocols}
            onLoadProtocol={onLoadProtocol}
            availableProducts={availableProducts}
            onAddProduct={onAddProduct}
            savedKits={savedKits}
            onLoadKit={onLoadKit}
            onDeleteKit={onDeleteKit}
          />

          {/* Quick Tracked Datasheet Sharing Modal */}
          <QuickShareDatasheetModal
            isOpen={Boolean(shareDatasheetItem)}
            onClose={() => setShareDatasheetItem(null)}
            item={shareDatasheetItem}
            activeWs={activeWs}
          />
        </div>
      )}
    </div>
  );
}
