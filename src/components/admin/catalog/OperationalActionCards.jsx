import React, { useMemo, useState } from 'react';
import Box from 'lucide-react/dist/esm/icons/box';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileWarning from 'lucide-react/dist/esm/icons/file-warning';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import LinkIcon from 'lucide-react/dist/esm/icons/link';
import Activity from 'lucide-react/dist/esm/icons/activity';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import PackageX from 'lucide-react/dist/esm/icons/package-x';
import { motion, AnimatePresence } from 'framer-motion';

import X from 'lucide-react/dist/esm/icons/x';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

export default function OperationalActionCards({ products, activeFilters = [], onFilterSelect, onAction, globalKpis, totalProducts }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAiDismissed, setIsAiDismissed] = useState(false);

  const kpis = useMemo(() => {
    let missingCoa = [];
    let missingSupplier = [];
    let regulatoryRisk = [];
    let singleSource = [];
    let lowHealth = [];
    let outOfStock = [];

    products.forEach((p) => {
      const variants = p.variants || [];

      const hasMissingCoa = !p.hasCoa || variants.some((v) => !v.hasCoa);
      if (hasMissingCoa) missingCoa.push(p);

      const hasMissingSupplier = !p.supplier || p.supplier === 'Unassigned' || variants.some((v) => !v.supplier || v.supplier === 'Unassigned');
      if (hasMissingSupplier) missingSupplier.push(p);

      const hasRisk = p.registrationStatus !== 'Registered' || variants.some((v) => v.registrationStatus !== 'Registered');
      if (hasRisk) regulatoryRisk.push(p);

      const isSingleSource = p.suppliersCount === 1 || !p.suppliersCount || variants.some((v) => v.suppliersCount === 1 || !v.suppliersCount);
      if (isSingleSource) singleSource.push(p);

      const hasLowHealth = (p.healthScore || 100) < 70 || variants.some((v) => (v.healthScore || 100) < 70);
      if (hasLowHealth) lowHealth.push(p);

      const hasOutOfStock = p.stock === 0 || p.inventoryLevel === 0 || variants.some((v) => v.stock === 0 || v.inventoryLevel === 0);
      if (hasOutOfStock) outOfStock.push(p);
    });

    return {
      compliance: [
        {
          id: 'missing_coa',
          title: 'Missing COA',
          count: globalKpis?.missing_coa ?? missingCoa.length,
          total: totalProducts || products.length,
          severity: 'warning',
          icon: FileWarning,
          trend: `↓ ${Math.max(1, Math.floor((globalKpis?.missing_coa ?? missingCoa.length) * 0.15))} this week`,
          trendDir: 'down',
          impact: `${globalKpis?.missing_coa ?? missingCoa.length} Products cannot be sold until certified`,
          actionLabel: 'Request Documents',
          affectedItems: missingCoa.slice(0, 3),
        },
        {
          id: 'regulatory_risk',
          title: 'Regulatory Risk',
          count: globalKpis?.regulatory_risk ?? regulatoryRisk.length,
          total: totalProducts || products.length,
          severity: 'critical',
          icon: ShieldAlert,
          trend: `↑ ${Math.max(1, Math.floor((globalKpis?.regulatory_risk ?? regulatoryRisk.length) * 0.2))} this month`,
          trendDir: 'up',
          impact: `$${((globalKpis?.regulatory_risk ?? regulatoryRisk.length) * 15000).toLocaleString()} Revenue Exposure`,
          actionLabel: 'Review Issues',
          affectedItems: regulatoryRisk.slice(0, 3),
        },
      ],
      supplyChain: [
        {
          id: 'missing_supplier',
          title: 'Missing Supplier',
          count: globalKpis?.missing_supplier ?? missingSupplier.length,
          total: totalProducts || products.length,
          severity: 'warning',
          icon: AlertCircle,
          trend: `↓ ${Math.max(1, Math.floor((globalKpis?.missing_supplier ?? missingSupplier.length) * 0.1))} this week`,
          trendDir: 'down',
          impact: `Cannot be reordered without assignment`,
          actionLabel: 'Assign Suppliers',
          affectedItems: missingSupplier.slice(0, 3),
        },
        {
          id: 'single_source',
          title: 'Single Source Risk',
          count: globalKpis?.single_source ?? singleSource.length,
          total: totalProducts || products.length,
          severity: 'medium',
          icon: LinkIcon,
          trend: `- Stable`,
          trendDir: 'neutral',
          impact: `Potential supply chain interruption`,
          actionLabel: 'Find Alternatives',
          affectedItems: singleSource.slice(0, 3),
        },
      ],
      inventory: [
        {
          id: 'out_of_stock',
          title: 'Out of Stock',
          count: globalKpis?.out_of_stock ?? outOfStock.length,
          total: totalProducts || products.length,
          severity: 'critical',
          icon: PackageX,
          trend: `↑ ${Math.max(1, Math.floor((globalKpis?.out_of_stock ?? outOfStock.length) * 0.3))} this week`,
          trendDir: 'up',
          impact: `Immediate lost sales risk`,
          actionLabel: 'Reorder Now',
          affectedItems: outOfStock.slice(0, 3),
        },
        {
          id: 'low_health',
          title: 'Low Health Score',
          count: globalKpis?.low_health ?? lowHealth.length,
          total: totalProducts || products.length,
          severity: 'medium',
          icon: Activity,
          trend: `↓ ${Math.max(1, Math.floor((globalKpis?.low_health ?? lowHealth.length) * 0.05))} this month`,
          trendDir: 'down',
          impact: `Products require data enrichment`,
          actionLabel: 'View Recommendations',
          affectedItems: lowHealth.slice(0, 3),
        },
      ],
    };
  }, [products, globalKpis, totalProducts]);

  const severityColors = {
    critical: { border: '#fca5a5', bg: '#fef2f2', text: '#b91c1c', bar: '#ef4444', hover: '#fee2e2' },
    warning: { border: '#fcd34d', bg: '#fffbeb', text: '#b45309', bar: '#f59e0b', hover: '#fef3c7' },
    medium: { border: '#fde047', bg: '#fefce8', text: '#854d0e', bar: '#eab308', hover: '#fef9c3' },
    healthy: { border: '#86efac', bg: '#f0fdf4', text: '#15803d', bar: '#22c55e', hover: '#dcfce7' },
  };

  const ActionCard = ({ card }) => {
    const isActive = activeFilters.some((f) => f.id === card.id);
    const colors = severityColors[card.severity] || severityColors.medium;
    const progress = card.total > 0 ? ((card.total - card.count) / card.total) * 100 : 100;

    return (
      <div
        style={{
          position: 'relative',
          flex: '0 0 auto',
          width: isExpanded ? '280px' : 'auto',
          minWidth: isExpanded ? '280px' : '220px',
          scrollSnapAlign: 'start',
        }}
        onMouseEnter={() => setHoveredCard(card.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          onClick={() => onFilterSelect(card.id)}
          style={{
            height: '100%',
            backgroundColor: isActive ? colors.hover : '#ffffff',
            border: `1px solid ${isActive ? colors.border : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: isExpanded ? '1rem' : '0.4rem 0.6rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: isExpanded ? 'column' : 'row',
            alignItems: isExpanded ? 'stretch' : 'center',
            gap: isExpanded ? '0.75rem' : '0.5rem',
            boxShadow: isActive ? `0 0 0 1px ${colors.border}40` : 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isExpanded ? 'flex-start' : 'center', flex: isExpanded ? 'none' : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  padding: '0.3rem',
                  borderRadius: '6px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  display: 'flex',
                }}
              >
                <card.icon size={14} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                {card.title}
              </span>
            </div>
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.text, lineHeight: 1 }}>
                  {card.count}
                </span>
              </div>
            )}
          </div>

          {!isExpanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
                {card.count}
              </span>
            </div>
          )}

          {isExpanded && (
            <>
              {/* Progress / Trend */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Coverage Rate</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: colors.bar, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
                  {card.trendDir === 'down' ? <TrendingDown size={12} color="#10b981" /> : card.trendDir === 'up' ? <TrendingUp size={12} color="#ef4444" /> : null}
                  {card.trend}
                </div>
              </div>

              {/* Impact */}
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                {card.impact}
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAction) onAction(card.id);
                    else onFilterSelect(card.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bg; }}
                >
                  {card.actionLabel} <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hover Popover */}
        <AnimatePresence>
          {hoveredCard === card.id && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                width: '280px',
                marginTop: '0.5rem',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Top Affected Items
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {card.affectedItems.length > 0 ? (
                  card.affectedItems.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      • {item.productName || item.sku || 'Unknown Product'}
                    </li>
                  ))
                ) : (
                  <li style={{ fontSize: '0.8rem', color: '#64748b' }}>No items affected.</li>
                )}
              </ul>
              {card.count > 3 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#0ea5e9' }}>
                  + {card.count - 3} more items...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
      
      {/* Header controls for KPIs */}
      {isExpanded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Catalog Intelligence KPIs
          </span>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6366f1',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Collapse Details
            <ChevronUp size={14} />
          </button>
        </div>
      )}

      {/* AI Contextual Insights Strip - Thin version */}
      {!isAiDismissed && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '0.75rem', 
            backgroundColor: '#f0fdfa', 
            border: '1px solid #ccfbf1', 
            borderRadius: '4px', 
            padding: '4px 8px',
            color: '#0f766e',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={12} color="#0d9488" />
            <div>
              <strong style={{ fontWeight: 600 }}>Atlas AI:</strong>{' '}
              {kpis.compliance[0].count > 0 
                ? `Requesting missing documents now can prevent ${kpis.compliance[0].count} shipping delays.`
                : `Assigning alternative suppliers could reduce single-source risks.`}
            </div>
          </div>
          <button 
            onClick={() => setIsAiDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div 
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '1rem',
          paddingBottom: '0.5rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'thin',
        }}
        className="kpi-action-scroll"
      >
        <style>{`
          .kpi-action-scroll::-webkit-scrollbar { height: 4px; }
          .kpi-action-scroll::-webkit-scrollbar-track { background: transparent; }
          .kpi-action-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        `}</style>

        {kpis.compliance.map((card) => <ActionCard key={card.id} card={card} />)}
        {isExpanded && <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }} />}
        {kpis.supplyChain.map((card) => <ActionCard key={card.id} card={card} />)}
        {isExpanded && <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }} />}
        {kpis.inventory.map((card) => <ActionCard key={card.id} card={card} />)}
      </div>


    </div>
  );
}
