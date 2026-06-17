import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Package from 'lucide-react/dist/esm/icons/package';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Award from 'lucide-react/dist/esm/icons/award';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Building from 'lucide-react/dist/esm/icons/building';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SUPPLIERS = [
  {
    id: 'sup-001',
    name: 'Lotusland Pharma',
    healthScore: 92,
    productsSupplied: 14,
    avgLeadTime: 12,
    moq: '500g',
    reliability: 98,
    qualityScore: 95,
    status: 'active',
    alerts: [],
    recentPOs: 45,
    totalSpent: '$1.2M',
    pricingTrend: 'stable',
    compliance: 'ISO9001, cGMP',
    recommendation:
      'Top performing supplier. Consider consolidating more volume here for tier discounts.',
    trendData: [65, 78, 82, 85, 90, 92],
  },
  {
    id: 'sup-002',
    name: 'Zenith Synthetics',
    healthScore: 76,
    productsSupplied: 8,
    avgLeadTime: 22,
    moq: '1kg',
    reliability: 82,
    qualityScore: 88,
    status: 'at-risk',
    alerts: ['Lead time increased by 4 days', 'Pricing up 8%'],
    recentPOs: 12,
    totalSpent: '$450k',
    pricingTrend: 'up',
    compliance: 'ISO9001',
    recommendation: 'Prices increased 8%. Backup supplier recommended for Semaglutide.',
    trendData: [85, 82, 80, 78, 77, 76],
  },
  {
    id: 'sup-003',
    name: 'Aegis Bio',
    healthScore: 85,
    productsSupplied: 3,
    avgLeadTime: 15,
    moq: '100g',
    reliability: 90,
    qualityScore: 92,
    status: 'active',
    alerts: ['Missing COA for latest batch'],
    recentPOs: 8,
    totalSpent: '$120k',
    pricingTrend: 'down',
    compliance: 'cGMP',
    recommendation: 'Request updated COA for Batch #4092 immediately.',
    trendData: [80, 81, 84, 85, 85, 85],
  },
  {
    id: 'sup-004',
    name: 'Apex Peptides',
    healthScore: 64,
    productsSupplied: 5,
    avgLeadTime: 28,
    moq: '2kg',
    reliability: 70,
    qualityScore: 80,
    status: 'critical',
    alerts: ['Supplier concentration risk detected', 'Delivery delayed > 7 days'],
    recentPOs: 5,
    totalSpent: '$800k',
    pricingTrend: 'stable',
    compliance: 'Pending Review',
    recommendation: 'High concentration risk. Onboard secondary supplier for Tirzepatide ASAP.',
    trendData: [75, 72, 70, 68, 65, 64],
  },
];

const MOCK_STATS = [
  { label: 'Total Suppliers', value: '24', icon: Building, color: '#3b82f6' },
  { label: 'Active Suppliers', value: '18', icon: Activity, color: '#10b981' },
  { label: 'Risk Alerts', value: '4', icon: AlertTriangle, color: '#ef4444' },
  { label: 'Avg Lead Time', value: '16 Days', icon: Clock, color: '#8b5cf6' },
  { label: 'Open RFQs', value: '12', icon: FileText, color: '#f59e0b' },
  { label: 'Avg Health Score', value: '84', icon: ShieldCheck, color: '#0ea5e9' },
];

export default function SupplierInsightsView({ variants = [], onAction }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const suppliersData = React.useMemo(() => {
    const supplierMap = new Map();
    (variants || []).forEach((v) => {
      const sName = v.supplier || v.vendor;
      if (!sName) return;
      if (!supplierMap.has(sName)) {
        supplierMap.set(sName, {
          id: sName,
          name: sName,
          productsSupplied: 0,
          prices: [],
          moqs: [],
          leadTimes: [],
          coas: [],
          gmps: [],
          alerts: [],
          missingDataFlags: [],
        });
      }
      const s = supplierMap.get(sName);
      s.productsSupplied++;

      // Extract pricing
      const price = v.price || v.cost;
      if (price) s.prices.push(Number(price));
      else s.missingDataFlags.push(`Missing price for ${v.sku || v.productName}`);

      if (v.moq) s.moqs.push(Number(v.moq));
      if (v.leadTime) s.leadTimes.push(Number(v.leadTime));
      else s.missingDataFlags.push(`Missing lead time for ${v.sku || v.productName}`);

      s.coas.push(!!v.coa);
      if (!v.coa) s.alerts.push(`Missing COA for ${v.sku || v.productName}`);

      s.gmps.push(!!v.gmp);
      if (!v.gmp) s.missingDataFlags.push(`Missing GMP for ${v.sku || v.productName}`);
    });

    return Array.from(supplierMap.values())
      .map((s) => {
        const avgPrice = s.prices.length
          ? s.prices.reduce((a, b) => a + b, 0) / s.prices.length
          : 0;
        const avgLeadTime = s.leadTimes.length
          ? Math.round(s.leadTimes.reduce((a, b) => a + b, 0) / s.leadTimes.length)
          : 14;
        const minMoq = s.moqs.length ? Math.min(...s.moqs) : '100';

        // Dynamic Scoring Algorithm
        let score = 100;
        let quality = 100;
        let reliability = 100;

        // COA penalty: -15 pts
        const missingCOAs = s.coas.filter((has) => !has).length;
        if (missingCOAs > 0) {
          score -= missingCOAs * 15;
          quality -= missingCOAs * 20;
        }

        // GMP penalty: -10 pts
        const missingGMPs = s.gmps.filter((has) => !has).length;
        if (missingGMPs > 0) {
          score -= missingGMPs * 10;
          quality -= missingGMPs * 10;
        }

        // Missing Data Penalty: -5 pts
        const missingData = s.missingDataFlags.length;
        if (missingData > 0) {
          score -= missingData * 5;
          reliability -= missingData * 10;
        }

        score = Math.max(0, score);
        quality = Math.max(0, quality);
        reliability = Math.max(0, reliability);

        let status = 'active';
        if (score < 75) status = 'at-risk';
        if (score < 50) status = 'critical';

        let recommendation = `Monitor ${s.name} performance continuously.`;
        if (score < 50) {
          recommendation = `Critical Risk: Halt purchase orders. Missing critical compliance documents (COA/GMP) for ${missingCOAs + missingGMPs} variants.`;
        } else if (score < 75 && missingCOAs > 0) {
          recommendation = `Action Required: Request missing COAs for ${missingCOAs} variants immediately.`;
        } else if (score < 90 && missingData > 0) {
          recommendation = `Data Cleanup: Missing lead times or prices for ${missingData} variants.`;
        } else if (score >= 90) {
          recommendation = `Top performing supplier with full compliance. Ideal for consolidating volume.`;
        }

        return {
          ...s,
          healthScore: score,
          qualityScore: quality,
          reliability: reliability,
          status,
          recommendation,
          trendData: [score - 5, score - 2, score, score, score, score].map((v) =>
            Math.max(0, Math.min(100, v))
          ),
          avgLeadTime,
          priceDisplay: avgPrice > 0 ? `$${avgPrice.toFixed(2)} avg` : 'Varies',
          moqDisplay: minMoq !== '100' ? `${minMoq} units` : 'Varies',
          recentPOs: (s.name.length % 10) + 1, // Mock POs
          totalSpent: `$${((s.name.charCodeAt(0) % 100) + 10).toFixed(1)}k`, // Mock Spend
          compliance:
            missingGMPs === 0 && missingCOAs === 0
              ? 'Fully Compliant'
              : missingCOAs > 0
                ? 'Missing COA'
                : 'Missing GMP',
        };
      })
      .sort((a, b) => a.healthScore - b.healthScore); // Sort lowest score first
  }, [variants]);

  const suppliers = suppliersData.length > 0 ? suppliersData : MOCK_SUPPLIERS;

  const getHealthColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'si-badge si-badge-success';
      case 'at-risk':
        return 'si-badge si-badge-warning';
      case 'critical':
        return 'si-badge si-badge-error';
      default:
        return 'si-badge';
    }
  };

  return (
    <div
      className="supplier-insights"
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
        color: 'var(--text-main, #1f2937)',
        alignItems: 'flex-start',
      }}
    >
      <style>
        {`
        .si-grid { display: grid; gap: 1.5rem; }
        .si-stats { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .si-2col { grid-template-columns: 1fr; }
        @media(min-width: 1024px) {
          .si-2col { grid-template-columns: 1fr 1fr; }
        }
        .si-card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
        }
        .si-glass {
          background: var(--bg-glass, rgba(255, 255, 255, 0.8));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.3));
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .si-ai-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .si-table-container { overflow-x: auto; margin-top: 1rem; }
        .si-table { width: 100%; border-collapse: collapse; text-align: left; }
        .si-table th, .si-table td { padding: 1rem; border-bottom: 1px solid var(--border, #e5e7eb); }
        .si-table th { color: var(--text-muted, #6b7280); font-weight: 500; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .si-table tr { transition: background-color 0.2s; }
        .si-table tr:hover { background-color: var(--bg-hover, #f9fafb); cursor: pointer; }
        .si-badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .si-badge-success { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .si-badge-warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .si-badge-error { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .si-side-panel {
          background: var(--bg-main, #ffffff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .si-mobile-card { display: none; }
        .si-desktop-table { display: table; }

        @media(max-width: 768px) {
          .si-desktop-table { display: none; }
          .si-mobile-card { display: block; margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--border, #e5e7eb); border-radius: 12px; background: var(--bg-card, #fff); cursor: pointer; }
        }

        .si-score-ring {
          width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem;
        }
        .si-btn-icon {
          background: none; border: none; cursor: pointer; color: var(--text-muted, #6b7280); padding: 0.5rem; border-radius: 8px; transition: background 0.2s;
        }
        .si-btn-icon:hover { background: var(--bg-hover, #f3f4f6); color: var(--text-main, #111827); }

        .si-action-chip {
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e5e7eb);
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.875rem;
          color: var(--text-muted, #4b5563);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .si-action-chip:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }
      `}
      </style>

      {/* Main Content Area: 65% when selected, 100% when not */}
      <div style={{ flex: selectedSupplier ? '0 0 calc(65% - 1rem)' : '1', transition: 'all 0.3s ease', minWidth: 0 }}>
        <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Building size={32} color="#3b82f6" />
            Supplier Insights
          </h1>
          <p
            style={{ color: 'var(--text-muted, #6b7280)', marginTop: '0.5rem', fontSize: '1.1rem' }}
          >
            AI-driven analytics and risk management for your supply chain.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            className="si-glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
            }}
          >
            <Search size={18} color="var(--text-muted, #6b7280)" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-main, #111827)',
                width: '200px',
              }}
            />
          </div>
          <button
            className="si-btn-icon"
            style={{
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="si-grid si-stats" style={{ marginBottom: '2rem' }}>
        {MOCK_STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            className="si-glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ background: `${stat.color}15`, padding: '1rem', borderRadius: '12px' }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <div
                style={{
                  color: 'var(--text-muted, #6b7280)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-main, #111827)',
                }}
              >
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="si-grid si-2col" style={{ marginBottom: '2rem' }}>
        <motion.div
          className="si-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: 0,
              fontSize: '1.25rem',
            }}
          >
            <AlertTriangle color="#ef4444" size={24} />
            Supplier Risk Center
          </h3>
          <div
            style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {suppliers.flatMap((s) =>
              s.alerts.map((alert, i) => (
                <div
                  key={`${s.id}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.05)',
                    borderRadius: '12px',
                    borderLeft: '4px solid #ef4444',
                  }}
                >
                  <AlertCircle
                    size={20}
                    color="#ef4444"
                    style={{ flexShrink: 0, marginTop: '0.1rem' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#991b1b' }}>
                      {s.name}
                    </strong>
                    <span style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{alert}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          className="si-card si-ai-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: 0,
              fontSize: '1.25rem',
              color: '#6d28d9',
            }}
          >
            <Sparkles color="#8b5cf6" size={24} />
            AI Insights & Recommendations
          </h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suppliers
              .map((s) => (
                <div
                  key={`ai-${s.id}`}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }}
                    ></div>
                    <strong style={{ fontSize: '0.9rem' }}>{s.name} Insight</strong>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--text-muted, #4b5563)',
                      lineHeight: 1.5,
                    }}
                  >
                    {s.recommendation}
                  </p>
                </div>
              ))
              .slice(0, 3)}
            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#8b5cf6',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em',
                }}
              >
                Contextual Actions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="si-action-chip">
                  <Search size={14} /> Find backup suppliers
                </div>
                <div className="si-action-chip">
                  <TrendingUp size={14} /> Analyze pricing trends
                </div>
                <div className="si-action-chip">
                  <ShieldAlert size={14} /> Generate risk report
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="si-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '1.5rem',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Award size={24} color="#3b82f6" />
          Supplier Rankings
        </h3>
        <div className="si-table-container si-desktop-table">
          <table className="si-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>MOQ</th>
                <th>Lead Time</th>
                <th>Price (Avg)</th>
                <th>Quality Score</th>
                <th>Reliability</th>
                <th>Health Score</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} onClick={() => setSelectedSupplier(s)}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={getStatusBadge(s.status)}
                        style={{ width: 8, height: 8, padding: 0, borderRadius: '50%' }}
                      ></span>
                      {s.name}
                    </div>
                  </td>
                  <td>{s.moqDisplay || s.moq}</td>
                  <td>{s.avgLeadTime} days</td>
                  <td>{s.priceDisplay || 'Varies'}</td>
                  <td>{s.qualityScore}/100</td>
                  <td>{s.reliability}%</td>
                  <td>
                    <div
                      className="si-score-ring"
                      style={{
                        border: `3px solid ${getHealthColor(s.healthScore)}`,
                        color: getHealthColor(s.healthScore),
                        width: '40px',
                        height: '40px',
                        fontSize: '0.875rem',
                      }}
                    >
                      {s.healthScore}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="si-mobile-card-container">
          {suppliers.map((s) => (
            <div
              key={`mob-${s.id}`}
              className="si-mobile-card"
              onClick={() => setSelectedSupplier(s)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{s.name}</h4>
                  <span className={getStatusBadge(s.status)}>{s.status.replace('-', ' ')}</span>
                </div>
                <div
                  className="si-score-ring"
                  style={{
                    border: `4px solid ${getHealthColor(s.healthScore)}`,
                    color: getHealthColor(s.healthScore),
                  }}
                >
                  {s.healthScore}
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div>
                  <strong>Lead Time:</strong> {s.avgLeadTime}d
                </div>
                <div>
                  <strong>Reliability:</strong> {s.reliability}%
                </div>
                <div>
                  <strong>Products:</strong> {s.productsSupplied}
                </div>
                <div>
                  <strong>Quality:</strong> {s.qualityScore}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      </div> {/* End Main Content Area */}

      <AnimatePresence>
        {selectedSupplier && (
          <motion.div
            style={{ 
              flex: '0 0 calc(35% - 1rem)', 
              position: 'sticky', 
              top: '2rem', 
              height: 'calc(100vh - 4rem)',
              overflowY: 'auto'
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="si-side-panel" style={{ height: '100%' }}>
              <div
                style={{
                  padding: '2rem',
                  borderBottom: '1px solid var(--border, #e5e7eb)',
                  background: 'var(--bg-card, #fff)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {selectedSupplier.name}
                      <span
                        className={getStatusBadge(selectedSupplier.status)}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        {selectedSupplier.status.replace('-', ' ')}
                      </span>
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Supplier 360 Overview</p>
                  </div>
                  <button className="si-btn-icon" onClick={() => setSelectedSupplier(null)}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '2rem', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    background: 'var(--bg-hover, #f9fafb)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    className="si-score-ring"
                    style={{
                      width: '80px',
                      height: '80px',
                      fontSize: '2rem',
                      border: `6px solid ${getHealthColor(selectedSupplier.healthScore)}`,
                      color: getHealthColor(selectedSupplier.healthScore),
                    }}
                  >
                    {selectedSupplier.healthScore}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>Overall Health</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Based on delivery, quality, and pricing metrics.
                    </p>
                  </div>
                </div>

                <div
                  className="si-ai-card"
                  style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      color: '#6d28d9',
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={18} /> AI Analysis
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {selectedSupplier.recommendation}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div
                    style={{
                      border: '1px solid var(--border, #e5e7eb)',
                      padding: '1rem',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Products Supplied
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Package size={18} /> {selectedSupplier.productsSupplied}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid var(--border, #e5e7eb)',
                      padding: '1rem',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Total Spend
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <DollarSign size={18} /> {selectedSupplier.totalSpent}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid var(--border, #e5e7eb)',
                      padding: '1rem',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Recent POs
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <FileText size={18} /> {selectedSupplier.recentPOs}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid var(--border, #e5e7eb)',
                      padding: '1rem',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Compliance
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <ShieldCheck size={18} color="#10b981" /> {selectedSupplier.compliance}
                    </div>
                  </div>
                </div>

                <h4
                  style={{
                    borderBottom: '1px solid var(--border, #e5e7eb)',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  Performance Metrics
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span>Quality Score</span>
                      <span style={{ fontWeight: 600 }}>{selectedSupplier.qualityScore}/100</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--border, #e5e7eb)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedSupplier.qualityScore}%`,
                          height: '100%',
                          background: '#3b82f6',
                          borderRadius: '4px',
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span>Delivery Reliability</span>
                      <span style={{ fontWeight: 600 }}>{selectedSupplier.reliability}%</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--border, #e5e7eb)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedSupplier.reliability}%`,
                          height: '100%',
                          background: '#10b981',
                          borderRadius: '4px',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <h4
                  style={{
                    borderBottom: '1px solid var(--border, #e5e7eb)',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  Pricing & Health Trend
                </h4>
                <div
                  style={{
                    height: '150px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    padding: '1rem',
                    background: 'var(--bg-hover, #f9fafb)',
                    borderRadius: '12px',
                  }}
                >
                  {selectedSupplier.trendData.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background: '#8b5cf6',
                        height: `${val}%`,
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.8,
                      }}
                    ></div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>6 Months Ago</span>
                  <span>Current</span>
                </div>

                <h4
                  style={{
                    borderBottom: '1px solid var(--border, #e5e7eb)',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem',
                    marginTop: '2rem',
                  }}
                >
                  Products from {selectedSupplier.name}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(() => {
                    const supplierProducts = (variants || []).filter(
                      (v) => (v.supplier || v.vendor) === selectedSupplier.name
                    );
                    if (supplierProducts.length === 0) {
                      return (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            padding: '1rem',
                            background: 'var(--bg-hover, #f9fafb)',
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          No products found for this supplier.
                        </div>
                      );
                    }
                    return supplierProducts.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onAction) onAction('edit', v.originalProduct);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          border: '1px solid var(--border, #e5e7eb)',
                          borderRadius: '8px',
                          background: 'var(--bg-card, #fff)',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Package size={20} color="#94a3b8" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {v.productName} - {v.format} {v.size}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            SKU: {v.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
