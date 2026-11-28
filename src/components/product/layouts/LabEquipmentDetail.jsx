'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Snowflake,
  Sliders,
  Settings,
  ShieldCheck,
  Package,
  Layers,
  Share2,
  Send,
  ShoppingBag,
  CheckCircle2,
  ThermometerSnowflake,
  Box,
  Cpu,
  AlertCircle,
  ExternalLink,
} from '@/lib/icons';
import ProductDetailShell from '@/components/product/ProductDetailShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import { useAuth } from '@/context/AuthContext';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { convertCurrency, formatCurrency } from '@/constants/fxRates';
import { getTelstarEquipmentBySlug, TELSTAR_2027_MODELS } from '@/data/telstarLyophilizersRegistry';
import './LabEquipmentDetail.css';

export default function LabEquipmentDetail({
  product = {},
  slug = '',
  baseUrl = 'https://www.atlashealth-services.com',
}) {
  const { isAdmin } = useAuth();
  const workspace = usePublicWorkspace?.() || null;
  const isEs = workspace?.lang === 'es';

  const [currency, setCurrency] = useState('EUR');
  const [activeNavId, setActiveNavId] = useState('overview');
  const [selectedVoltageSku, setSelectedVoltageSku] = useState(null);
  const [selectedPumpSku, setSelectedPumpSku] = useState(null);
  const [selectedChamberSku, setSelectedChamberSku] = useState(null);
  const [selectedOptionSkus, setSelectedOptionSkus] = useState([]);
  const [selectedServiceSkus, setSelectedServiceSkus] = useState([]);

  const fallbackDoc = useMemo(() => getTelstarEquipmentBySlug(slug || product?.slug) || {}, [slug, product?.slug]);
  const specs = useMemo(
    () => ({
      ...(fallbackDoc.equipmentSpecs || {}),
      ...(product.equipmentSpecs || {}),
    }),
    [fallbackDoc, product.equipmentSpecs]
  );

  const voltageVariants = useMemo(() => specs.voltageVariants || [], [specs.voltageVariants]);
  const vacuumPumps = useMemo(() => specs.vacuumPumps || [], [specs.vacuumPumps]);
  const chambersAndManifolds = useMemo(() => specs.chambersAndManifolds || [], [specs.chambersAndManifolds]);
  const factoryOptions = useMemo(() => specs.factoryOptions || [], [specs.factoryOptions]);
  const associatedServices = useMemo(() => specs.associatedServices || [], [specs.associatedServices]);
  const labwareConsumables = useMemo(() => specs.labwareConsumables || [], [specs.labwareConsumables]);
  const sparePartKits = useMemo(() => specs.sparePartKits || [], [specs.sparePartKits]);
  const packaging = useMemo(() => specs.packaging || [], [specs.packaging]);

  const activeVoltage = useMemo(
    () => voltageVariants.find((v) => v.sku === selectedVoltageSku) || voltageVariants[0] || { sku: product.sku, label: '230V / 50Hz', listPriceEur: product.listPriceEur },
    [voltageVariants, selectedVoltageSku, product.sku, product.listPriceEur]
  );

  const activePump = useMemo(
    () => vacuumPumps.find((p) => p.sku === selectedPumpSku) || (vacuumPumps.length === 1 ? vacuumPumps[0] : null),
    [vacuumPumps, selectedPumpSku]
  );

  const activeChamber = useMemo(
    () => chambersAndManifolds.find((c) => c.sku === selectedChamberSku) || null,
    [chambersAndManifolds, selectedChamberSku]
  );

  const toggleSku = useCallback((list, setList, sku) => {
    setList((prev) => (prev.includes(sku) ? prev.filter((x) => x !== sku) : [...prev, sku]));
  }, []);

  const formatEurAs = useCallback(
    (eurVal) => {
      if (eurVal == null || Number.isNaN(Number(eurVal))) return isEs ? 'Bajo consulta' : 'On request';
      const converted = convertCurrency(Number(eurVal), 'EUR', currency);
      return formatCurrency(converted, currency);
    },
    [currency, isEs]
  );

  const configuredTotals = useMemo(() => {
    const baseList = Number(activeVoltage?.listPriceEur || product.listPriceEur || 0);
    const pumpList = Number(activePump?.listPriceEur || 0);
    const chamberList = Number(activeChamber?.listPriceEur || 0);
    const optItems = factoryOptions.filter((o) => selectedOptionSkus.includes(o.sku));
    const svcItems = associatedServices.filter((s) => selectedServiceSkus.includes(s.sku));

    const optList = optItems.reduce((acc, o) => acc + Number(o.listPriceEur || 0), 0);
    const svcList = svcItems.reduce((acc, s) => acc + Number(s.listPriceEur || 0), 0);
    const totalListEur = baseList + pumpList + chamberList + optList + svcList;

    const netRatioBase = 0.7;
    const baseNet = baseList * netRatioBase;
    const pumpNet = Number(activePump?.netTransferPriceEur ?? pumpList * netRatioBase);
    const chamberNet = Number(activeChamber?.netTransferPriceEur ?? chamberList * netRatioBase);
    const optNet = optItems.reduce((acc, o) => acc + Number(o.netTransferPriceEur ?? Number(o.listPriceEur || 0) * netRatioBase), 0);
    const svcNet = svcItems.reduce((acc, s) => acc + Number(s.netTransferPriceEur ?? Number(s.listPriceEur || 0) * netRatioBase), 0);
    const totalNetEur = Number((baseNet + pumpNet + chamberNet + optNet + svcNet).toFixed(2));

    const wholesaleEur = Math.round(totalListEur * 0.805);
    const clinicEur = Math.round(totalListEur * 0.92);

    return {
      totalListEur,
      wholesaleEur,
      clinicEur,
      totalNetEur,
      summaryLines: [
        `Base: ${product.name || specs.series} (${activeVoltage?.sku || product.sku})`,
        activePump ? `Pump: ${activePump.model} (${activePump.sku})` : null,
        activeChamber ? `Chamber/Manifold: ${activeChamber.model} (${activeChamber.sku})` : null,
        ...optItems.map((o) => `Option: ${o.model} (${o.sku})`),
        ...svcItems.map((s) => `Service: ${s.model} (${s.sku})`),
      ].filter(Boolean),
    };
  }, [activeVoltage, activePump, activeChamber, factoryOptions, associatedServices, selectedOptionSkus, selectedServiceSkus, product, specs.series]);

  const handleNavClick = useCallback((sectionId) => {
    setActiveNavId(sectionId);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(`telstar-${sectionId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAddConfiguredToRfq = useCallback(() => {
    const label = `${product.name} (${configuredTotals.summaryLines.length} items)`;
    if (typeof workspace?.addRfqItem === 'function') {
      workspace.addRfqItem({
        id: `${product.id}-${activeVoltage?.sku || 'std'}`,
        sku: activeVoltage?.sku || product.sku,
        name: label,
        unitPrice: configuredTotals.wholesaleEur,
        currency: 'EUR',
        qty: 1,
        category: 'Laboratory Equipment',
      });
    }
    toast.success(isEs ? `${product.name} añadido a tu solicitud B2B` : `${product.name} added to B2B RFQ`);
  }, [product, activeVoltage, configuredTotals, workspace, isEs]);

  const railNavItems = useMemo(
    () => [
      { id: 'overview', label: isEs ? 'Resumen y KPIs' : 'Overview & KPIs', icon: Cpu },
      { id: 'configurator', label: isEs ? 'Configurador Modular' : 'System Configurator', icon: Sliders, badge: configuredTotals.summaryLines.length },
      { id: 'factory-options', label: isEs ? 'Opciones de Fábrica' : 'Factory Options (FB*)', icon: Settings, badge: factoryOptions.length },
      { id: 'services', label: isEs ? 'Servicios FAT / IQ-OQ' : 'GMP Services & Qual.', icon: ShieldCheck, badge: associatedServices.length },
      { id: 'consumables', label: isEs ? 'Material y Repuestos' : 'Labware & Spares', icon: Package, badge: labwareConsumables.length + sparePartKits.length },
      { id: 'logistics', label: isEs ? 'Embalaje y Términos' : 'Packaging & Terms', icon: Box, badge: packaging.length },
    ],
    [isEs, configuredTotals.summaryLines.length, factoryOptions.length, associatedServices.length, labwareConsumables.length, sparePartKits.length, packaging.length]
  );

  const railProperties = useMemo(
    () => [
      { label: 'Series', value: specs.series || 'LYOQUEST' },
      { label: 'Condenser', value: `${specs.condenserTempC ?? -85} °C` },
      { label: 'Shelves', value: specs.shelfAreaM2 ? `${specs.shelfAreaM2} m²` : 'Modular' },
      { label: 'Cooling', value: specs.coolingType || 'Air cooled' },
      { label: 'Incoterm', value: specs.incoterm || 'FCA Terrassa' },
      { label: 'Warranty', value: `${specs.warrantyYears || 2} yrs parts` },
      { label: 'Lead Time', value: `~${specs.leadTimeWeeks || 4} weeks` },
    ],
    [specs]
  );

  const railLinks = useMemo(
    () => [
      { label: isEs ? 'Todos los Liofilizadores Telstar (14)' : 'All Telstar Freeze Dryers (14)', href: '/collection/telstar-lyophilizers' },
      { label: isEs ? 'Tarifa Oficial Telstar 2027' : 'Telstar 2027 B2B Price Schedule', href: '/pricing/telstar-freeze-dryers' },
    ],
    [isEs]
  );

  const catalogColumns = useMemo(() => {
    const baseCols = [
      {
        key: 'sku',
        label: 'Part Nº',
        width: '14%',
        sortable: true,
        render: (_, row) => <CopyableId value={row.sku} maxLength={16} />,
      },
      {
        key: 'model',
        label: isEs ? 'Módulo / Opción' : 'Module / Option',
        width: '24%',
        sortable: true,
        render: (_, row) => (
          <div>
            <div style={{ fontWeight: 600, color: '#202124', fontSize: '0.84rem' }}>{row.model}</div>
            {row.tariffBugCorrected && (
              <span style={{ fontSize: '0.68rem', color: '#1a73e8', fontWeight: 600 }}>2027 70% net normalized</span>
            )}
          </div>
        ),
      },
      {
        key: 'description',
        label: isEs ? 'Especificación Técnica' : 'Technical Specification',
        width: isAdmin ? '34%' : '42%',
        render: (_, row) => <span style={{ fontSize: '0.82rem', color: '#5f6368' }}>{row.description}</span>,
      },
      {
        key: 'listPriceEur',
        label: isEs ? `Tarifa OEM (${currency})` : `OEM List (${currency})`,
        width: '14%',
        sortable: true,
        render: (_, row) => (
          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#202124' }}>
            {row.onRequest ? (isEs ? 'Consultar' : 'On request') : formatEurAs(row.listPriceEur)}
          </span>
        ),
      },
    ];

    if (isAdmin) {
      baseCols.push({
        key: 'netTransferPriceEur',
        label: `Admin Net (${currency})`,
        width: '14%',
        sortable: true,
        render: (_, row) => (
          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#137333' }}>
            {row.onRequest ? '—' : formatEurAs(row.netTransferPriceEur)}
          </span>
        ),
      });
    }

    return baseCols;
  }, [isAdmin, currency, formatEurAs, isEs]);

  const packagingColumns = useMemo(
    () => [
      { key: 'box', label: 'Box Nº', width: '16%' },
      { key: 'type', label: isEs ? 'Tipo de Embalaje' : 'Crate / Packing Type', width: '38%' },
      { key: 'dimensionsCm', label: 'Dimensions W×D×H (cm)', width: '28%' },
      { key: 'weightKg', label: 'Weight ±10% (kg)', width: '18%', render: (v) => `${v} kg` },
    ],
    [isEs]
  );

  const extraRailContent = (
    <div style={{ padding: '0.5rem 0.875rem', borderTop: '1px solid var(--gcp-sb-divider, #e8eaed)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
        {isEs ? 'Otros Modelos Telstar' : 'Switch Telstar Model'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '190px', overflowY: 'auto' }}>
        {TELSTAR_2027_MODELS.map((m) => {
          const isCur = m.slug === slug || m.id === product.id;
          return (
            <Link
              key={m.slug}
              href={`/p/${m.slug}`}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: isCur ? 700 : 500,
                color: isCur ? '#1a73e8' : '#3c4043',
                background: isCur ? '#e8f0fe' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '6px',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.replace('Telstar ', '')}</span>
              <span style={{ color: '#80868b', fontSize: '0.7rem', flexShrink: 0 }}>{m.condenserTempC}°C</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <ProductDetailShell
      product={product}
      slug={slug}
      baseUrl={baseUrl}
      currentBrand="Telstar — A Syntegon Company"
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Telstar Lyophilizers', href: '/collection/telstar-lyophilizers' },
        { label: product.name || slug },
      ]}
      railTitle={product.name || slug}
      railStatus={product.status || 'published'}
      railStatusLabel={specs.series || 'TELSTAR'}
      railEntityId={activeVoltage?.sku || product.sku || product.id}
      railNavTitle={isEs ? 'Navegación Técnica' : 'Technical Dossier'}
      railNavItems={railNavItems}
      activeNavId={activeNavId}
      onSelectNav={handleNavClick}
      railPropertiesTitle={isEs ? 'Especificaciones Base' : 'Base Equipment Specs'}
      railProperties={railProperties}
      railLinks={railLinks}
      extraRailContent={extraRailContent}
      storageKey="atlas_telstar_left_rail_v1"
      mobileTriggerLabel={isEs ? 'Ficha & Configurador' : 'Specs & Configurator'}
      railPrimaryAction={{
        label: isEs ? 'Solicitar Cotización (RFQ)' : 'Request Equipment Quote',
        icon: Send,
        kind: 'inquiry',
      }}
      railSecondaryActions={[
        { label: isEs ? 'Añadir Config. a Lista' : 'Add Config to RFQ', icon: ShoppingBag, onClick: handleAddConfiguredToRfq },
        { label: isEs ? 'Compartir Ficha' : 'Share Dossier', icon: Share2, kind: 'share' },
      ]}
      inquiryInitialNotes={`Telstar Equipment Configuration:\n${configuredTotals.summaryLines.join('\n')}\nEstimated OEM List: ${formatEurAs(configuredTotals.totalListEur)}`}
      atlasContextConfig={{
        mode: 'lab_equipment_detail',
        contextType: 'product',
        storageKey: `telstar-${slug}`,
        contextAnchor: {
          sectionTitle: product.name,
          code: activeVoltage?.sku || product.sku,
          currency,
          series: specs.series,
          condenserTempC: specs.condenserTempC,
          mechanisms: product.shortDesc || product.description,
        },
      }}
    >
      {({ openInquiry, openShare }) => (
        <>
          {/* Section 1: Hero & Commercial Summary */}
          <section id="telstar-overview" className="telstar-hero-card">
            <div className="telstar-hero-top">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <span className="telstar-series-pill">
                    <Snowflake size={13} />
                    <span>Telstar — A Syntegon Company · {specs.series}</span>
                  </span>
                  <StatusBadge status={product.status || 'published'} />
                  <CopyableId value={activeVoltage?.sku || product.sku} />
                </div>

                <h1 className="telstar-title">{product.displayName || product.name}</h1>
                <p className="telstar-subtitle">{product.description || product.shortDesc}</p>

                {specs.availabilityNote && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#92400e',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                    }}
                  >
                    <AlertCircle size={14} />
                    <span>{specs.availabilityNote}</span>
                  </div>
                )}
              </div>

              <div className="telstar-price-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                    {isEs ? 'Precio Base OEM' : 'Base OEM List'}
                  </span>
                  <div className="telstar-currency-tabs">
                    {['EUR', 'USD', 'AED'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`telstar-currency-btn ${currency === c ? 'is-active' : ''}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#202124', fontVariantNumeric: 'tabular-nums', marginTop: '4px' }}>
                  {formatEurAs(activeVoltage?.listPriceEur ?? product.listPriceEur)}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#5f6368' }}>
                  B2B Partner est.: <strong>{formatEurAs(Math.round(Number(activeVoltage?.listPriceEur ?? product.listPriceEur) * 0.805))}</strong> · {specs.incoterm || 'FCA Terrassa'}
                </div>
                {isAdmin && (
                  <div style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700, marginTop: '2px' }}>
                    Admin Net Transfer (-30%): {formatEurAs(Number(activeVoltage?.listPriceEur ?? product.listPriceEur) * 0.7)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button type="button" onClick={openInquiry} className="gcp-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Send size={14} />
                    <span>{isEs ? 'Solicitar Oferta' : 'Request Quote'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openShare}
                    className="gcp-btn-secondary"
                    style={{ color: '#5f6368', borderColor: '#dadce0', background: '#ffffff' }}
                    aria-label="Share dossier"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4 KPI Strip (Rule #22) */}
          <div className="telstar-kpi-grid">
            <div className="telstar-kpi-box">
              <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>CONDENSER TEMPERATURE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#202124', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThermometerSnowflake size={18} color="#1a73e8" />
                <span>{specs.condenserTempC} °C</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#80868b', marginTop: '2px' }}>{specs.condenserSpec}</div>
            </div>

            <div className="telstar-kpi-box">
              <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>SHELF CAPACITY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#202124', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={18} color="#1a73e8" />
                <span>{specs.shelfAreaM2} m²</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#80868b', marginTop: '2px' }}>{specs.shelves}</div>
            </div>

            <div className="telstar-kpi-box">
              <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>COOLING & CONTROL</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#202124', marginTop: '6px' }}>
                {specs.coolingType}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#80868b', marginTop: '2px' }}>
                {specs.heatedShelves ? 'Heated shelf control + PLC' : 'PLC Touchscreen Control'}
              </div>
            </div>

            <div className="telstar-kpi-box">
              <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>DELIVERY & WARRANTY</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#202124', marginTop: '6px' }}>
                ~{specs.leadTimeWeeks || 4} Weeks · {specs.warrantyYears || 2}Y Warranty
              </div>
              <div style={{ fontSize: '0.74rem', color: '#80868b', marginTop: '2px' }}>{specs.incoterm || 'FCA Terrassa'}</div>
            </div>
          </div>

          {/* Section 2: Interactive System Configurator */}
          <section id="telstar-configurator" className="telstar-section-card">
            <div className="telstar-section-head">
              <h2 className="telstar-section-title">
                <Sliders size={17} color="#1a73e8" />
                <span>{isEs ? 'Configurador Modular del Sistema (Tarifa 2027)' : 'Interactive Modular Configurator (2027 Tariff)'}</span>
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs ? 'Selecciona tensión, bomba, cámara y opciones FB*' : 'Select voltage, pump, chamber & FB* options'}
              </span>
            </div>

            <div className="telstar-config-grid">
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5f6368', marginBottom: '6px', textTransform: 'uppercase' }}>
                  1. {isEs ? 'Alimentación Eléctrica' : 'Voltage & Frequency'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {voltageVariants.map((v) => {
                    const isSel = activeVoltage?.sku === v.sku;
                    return (
                      <button
                        key={v.sku}
                        type="button"
                        onClick={() => setSelectedVoltageSku(v.sku)}
                        className={`telstar-option-pill ${isSel ? 'is-selected' : ''}`}
                      >
                        <span>{v.label} <code style={{ fontSize: '0.72rem', color: '#5f6368' }}>[{v.sku}]</code></span>
                        <span style={{ fontWeight: 700 }}>{v.onRequest ? (isEs ? 'Consultar' : 'On request') : formatEurAs(v.listPriceEur)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5f6368', marginBottom: '6px', textTransform: 'uppercase' }}>
                  2. {isEs ? 'Bomba de Vacío' : 'Vacuum Pump'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {vacuumPumps.map((p) => {
                    const isSel = activePump?.sku === p.sku;
                    return (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => setSelectedPumpSku(isSel && vacuumPumps.length > 1 ? null : p.sku)}
                        className={`telstar-option-pill ${isSel ? 'is-selected' : ''}`}
                      >
                        <span>{p.model} <code style={{ fontSize: '0.72rem', color: '#5f6368' }}>[{p.sku}]</code></span>
                        <span style={{ fontWeight: 700 }}>{Number(p.listPriceEur || 0) === 0 ? (isEs ? 'Incluida' : 'Included') : formatEurAs(p.listPriceEur)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5f6368', marginBottom: '6px', textTransform: 'uppercase' }}>
                  3. {isEs ? 'Cámara, Colector o Bandejas (Top)' : 'Chamber, Manifold or Trays'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                  {chambersAndManifolds.map((c) => {
                    const isSel = activeChamber?.sku === c.sku;
                    return (
                      <button
                        key={c.sku}
                        type="button"
                        onClick={() => setSelectedChamberSku(isSel ? null : c.sku)}
                        className={`telstar-option-pill ${isSel ? 'is-selected' : ''}`}
                      >
                        <span>{c.model} <code style={{ fontSize: '0.72rem', color: '#5f6368' }}>[{c.sku}]</code></span>
                        <span style={{ fontWeight: 700 }}>{c.onRequest ? 'On request' : formatEurAs(c.listPriceEur)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5f6368', marginBottom: '6px', textTransform: 'uppercase' }}>
                  4. {isEs ? 'Opciones de Fábrica (FB*) y Servicios GMP' : 'Factory Options (FB*) & Services'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                  {factoryOptions.slice(0, 6).map((o) => {
                    const isSel = selectedOptionSkus.includes(o.sku);
                    return (
                      <button
                        key={o.sku}
                        type="button"
                        onClick={() => toggleSku(selectedOptionSkus, setSelectedOptionSkus, o.sku)}
                        className={`telstar-option-pill ${isSel ? 'is-selected' : ''}`}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {isSel && <CheckCircle2 size={14} color="#1a73e8" />}
                          <span>{o.model}</span>
                        </span>
                        <span style={{ fontWeight: 700 }}>{o.onRequest ? 'On req.' : formatEurAs(o.listPriceEur)}</span>
                      </button>
                    );
                  })}
                  {associatedServices.slice(0, 4).map((s) => {
                    const isSel = selectedServiceSkus.includes(s.sku);
                    return (
                      <button
                        key={s.sku}
                        type="button"
                        onClick={() => toggleSku(selectedServiceSkus, setSelectedServiceSkus, s.sku)}
                        className={`telstar-option-pill ${isSel ? 'is-selected' : ''}`}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {isSel && <CheckCircle2 size={14} color="#1a73e8" />}
                          <span>[Service] {s.model}</span>
                        </span>
                        <span style={{ fontWeight: 700 }}>{s.onRequest ? 'On req.' : formatEurAs(s.listPriceEur)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="telstar-config-summary">
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1967d2', textTransform: 'uppercase' }}>
                  {isEs ? `Sistema Configurado (${configuredTotals.summaryLines.length} elementos)` : `Configured System (${configuredTotals.summaryLines.length} items)`}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {formatEurAs(configuredTotals.totalListEur)}{' '}
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368' }}>
                    OEM List · {isEs ? 'Partner est.' : 'Partner est.'} {formatEurAs(configuredTotals.wholesaleEur)}
                  </span>
                </div>
                {isAdmin && (
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#137333', marginTop: '2px' }}>
                    Admin Net Transfer Total: {formatEurAs(configuredTotals.totalNetEur)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button type="button" onClick={handleAddConfiguredToRfq} className="gcp-btn-secondary" style={{ color: '#5f6368', borderColor: '#dadce0', background: '#ffffff' }}>
                  <ShoppingBag size={14} />
                  <span>{isEs ? 'Añadir a RFQ' : 'Add to RFQ'}</span>
                </button>
                <button type="button" onClick={openInquiry} className="gcp-btn-primary">
                  <Send size={14} />
                  <span>{isEs ? 'Solicitar Oferta Formal' : 'Request Configured Quote'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Factory Options */}
          <section id="telstar-factory-options" className="telstar-section-card">
            <div className="telstar-section-head">
              <h2 className="telstar-section-title">
                <Settings size={17} color="#1a73e8" />
                <span>{isEs ? 'Opciones Instaladas en Fábrica (FB*) y Accesorios' : 'Factory-Built Options (FB*) & Chambers/Manifolds'}</span>
              </h2>
            </div>
            <DataTable
              columns={catalogColumns}
              data={[...chambersAndManifolds, ...factoryOptions].map((r, i) => ({ ...r, id: `${r.sku}-${i}` }))}
              keyField="id"
              pagination={true}
              initialRowsPerPage={12}
              searchPlaceholder="Search options by SKU or description..."
            />
          </section>

          {/* Section 4: Associated GMP & Qualification Services */}
          <section id="telstar-services" className="telstar-section-card">
            <div className="telstar-section-head">
              <h2 className="telstar-section-title">
                <ShieldCheck size={17} color="#1a73e8" />
                <span>{isEs ? 'Servicios Asociados, FAT e IQ/OQ GMP' : 'Associated Services, FAT & GMP IQ-OQ Qualification'}</span>
              </h2>
            </div>
            <DataTable
              columns={catalogColumns}
              data={associatedServices.map((r, i) => ({ ...r, id: `${r.sku}-${i}` }))}
              keyField="id"
              pagination={false}
            />
          </section>

          {/* Section 5: Labware Consumables (2.4) & Spare Parts Kits (0% Discount) */}
          <section id="telstar-consumables" className="telstar-section-card">
            <div className="telstar-section-head">
              <h2 className="telstar-section-title">
                <Package size={17} color="#1a73e8" />
                <span>{isEs ? 'Kits de Repuestos (0% Dto.) y Consumibles Sección 2.4' : 'Basic Spare Parts Kits & Section 2.4 Labware'}</span>
              </h2>
            </div>
            <DataTable
              columns={catalogColumns}
              data={[...sparePartKits, ...labwareConsumables].map((r, i) => ({ ...r, id: `${r.sku}-${i}` }))}
              keyField="id"
              pagination={false}
            />
          </section>

          {/* Section 6: Packaging Dimensions & Commercial Terms */}
          <section id="telstar-logistics" className="telstar-section-card">
            <div className="telstar-section-head">
              <h2 className="telstar-section-title">
                <Box size={17} color="#1a73e8" />
                <span>{isEs ? 'Dimensiones de Embalaje (cm) y Condiciones 2027' : 'Standard Packaging Dimensions (cm) & 2027 Terms'}</span>
              </h2>
              <Link href="/pricing/telstar-freeze-dryers" className="gcp-btn-secondary" style={{ textDecoration: 'none', color: '#5f6368', borderColor: '#dadce0', background: '#ffffff' }}>
                <ExternalLink size={14} />
                <span>{isEs ? 'Ver Tarifa Completa' : 'View Full Tariff'}</span>
              </Link>
            </div>
            <DataTable
              columns={packagingColumns}
              data={packaging.map((p, i) => ({ ...p, id: `pkg-${i}` }))}
              keyField="id"
              pagination={false}
            />
            <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#5f6368', lineHeight: 1.6 }}>
              <strong>2027 Commercial Conditions:</strong> Prices {specs.incoterm || 'FCA Terrassa'} (Spain). Outside EU customs clearance +60 €. Payment with order; 25% cancellation fee after official order acknowledgment. Standard 2-year warranty on parts (6 months on sensors).
            </div>
          </section>
        </>
      )}
    </ProductDetailShell>
  );
}
