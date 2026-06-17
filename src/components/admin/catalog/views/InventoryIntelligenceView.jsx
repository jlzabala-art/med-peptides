import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Activity from 'lucide-react/dist/esm/icons/activity';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ArchiveX from 'lucide-react/dist/esm/icons/archive-x';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Search from 'lucide-react/dist/esm/icons/search';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Zap from 'lucide-react/dist/esm/icons/zap';
import PackageMinus from 'lucide-react/dist/esm/icons/package-minus';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Tag from 'lucide-react/dist/esm/icons/tag';
import PackagePlus from 'lucide-react/dist/esm/icons/package-plus';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Send from 'lucide-react/dist/esm/icons/send';
import React from 'react';

const mockData = [
  {
    id: 1,
    name: 'BPC-157 5mg',
    stock: 12,
    reorderPoint: 50,
    supplier: 'PeptideSci',
    moq: 100,
    leadTime: '14 days',
    salesStatus: 'fast',
    price: 45,
    noSalesDays: 2,
  },
  {
    id: 2,
    name: 'TB-500 10mg',
    stock: 0,
    reorderPoint: 30,
    supplier: 'BioGenetics',
    moq: 50,
    leadTime: '7 days',
    salesStatus: 'fast',
    price: 65,
    noSalesDays: 0,
  },
  {
    id: 3,
    name: 'GHK-Cu 50mg',
    stock: 450,
    reorderPoint: 20,
    supplier: 'CopperLabs',
    moq: 200,
    leadTime: '21 days',
    salesStatus: 'dead',
    price: 25,
    noSalesDays: 125,
  },
  {
    id: 4,
    name: 'Ipamorelin 2mg',
    stock: 8,
    reorderPoint: 40,
    supplier: 'PeptideSci',
    moq: 100,
    leadTime: '14 days',
    salesStatus: 'normal',
    price: 30,
    noSalesDays: 5,
  },
  {
    id: 5,
    name: 'CJC-1295 2mg',
    stock: 15,
    reorderPoint: 50,
    supplier: 'BioGenetics',
    moq: 50,
    leadTime: '7 days',
    salesStatus: 'fast',
    price: 35,
    noSalesDays: 1,
  },
  {
    id: 6,
    name: 'Semaglutide 5mg',
    stock: 320,
    reorderPoint: 100,
    supplier: 'PharmaTech',
    moq: 500,
    leadTime: '30 days',
    salesStatus: 'fast',
    price: 120,
    noSalesDays: 0,
  },
  {
    id: 7,
    name: 'Tirzepatide 10mg',
    stock: 5,
    reorderPoint: 200,
    supplier: 'PharmaTech',
    moq: 500,
    leadTime: '30 days',
    salesStatus: 'fast',
    price: 150,
    noSalesDays: 0,
  },
  {
    id: 8,
    name: 'Melanotan II 10mg',
    stock: 210,
    reorderPoint: 50,
    supplier: 'SunLabs',
    moq: 100,
    leadTime: '10 days',
    salesStatus: 'dead',
    price: 40,
    noSalesDays: 140,
  },
];

export default function InventoryIntelligenceView({ variants = [], onAction }) {
  const data = React.useMemo(() => {
    if (!variants || variants.length === 0) return mockData;

    return variants.map((v) => {
      const stock = v.stock;
      return {
        ...v,
        salesStatus: stock < 50 ? 'fast' : stock > 150 ? 'dead' : 'normal',
        noSalesDays: stock > 150 ? 125 : 5,
      };
    });
  }, [variants]);

  const totalValue = data.reduce((sum, p) => sum + p.stock * p.price, 0);
  const lowStockCount = data.filter((p) => p.stock > 0 && p.stock < p.reorderPoint).length;
  const outOfStockCount = data.filter((p) => p.stock === 0).length;
  const deadStockCount = data.filter((p) => p.salesStatus === 'dead' || p.noSalesDays > 120).length;
  const reorderCount = lowStockCount + outOfStockCount;
  // Fake health score based on metrics
  const healthScore = Math.max(
    0,
    100 - outOfStockCount * 5 - lowStockCount * 2 - deadStockCount * 3
  );

  const reorderRecommendations = data.filter((p) => p.stock < p.reorderPoint);
  const deadStockItems = data.filter((p) => p.salesStatus === 'dead' || p.noSalesDays > 120);
  const fastMovers = data.filter((p) => p.salesStatus === 'fast').sort((a, b) => a.stock - b.stock);

  return (
    <div className="intelligence-workspace">
      <style>{`
        .intelligence-workspace {
          font-family: 'Inter', system-ui, sans-serif;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border-radius: 24px;
          padding: 1.5rem;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .metric-icon-wrap {
          padding: 0.5rem;
          border-radius: 12px;
        }

        .metric-value {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 1rem 0 0.25rem 0;
          letter-spacing: -0.02em;
        }

        .metric-sub {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .ai-query-container {
          background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
          border-radius: 24px;
          padding: 2px;
          box-shadow: 0 8px 30px rgba(79, 70, 229, 0.2);
        }

        .ai-query-inner {
          background: white;
          border-radius: 22px;
          display: flex;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 1.5rem;
          gap: 1rem;
        }

        .ai-query-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 1.1rem;
          color: #1e293b;
        }

        .ai-query-input::placeholder {
          color: #94a3b8;
        }

        .ai-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 18px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }

        .ai-badge:hover {
          opacity: 0.9;
        }

        .carousel-container {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.5rem 0 1.5rem 0;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .carousel-container::-webkit-scrollbar {
          height: 6px;
        }
        .carousel-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .alert-card {
          flex: 0 0 calc(33.333% - 0.67rem);
          scroll-snap-align: start;
          min-width: 300px;
          cursor: pointer;
          border-left: 5px solid;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .alert-card.critical { 
          border-left-color: #ef4444; 
          background: linear-gradient(to right, #fef2f2, white);
        }
        .alert-card.warning { 
          border-left-color: #f59e0b; 
          background: linear-gradient(to right, #fffbeb, white);
        }
        .alert-card.info { 
          border-left-color: #3b82f6; 
          background: linear-gradient(to right, #eff6ff, white);
        }

        .section-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0f172a;
        }

        .table-container {
          overflow-x: auto;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
        }

        .modern-table th {
          text-align: left;
          padding: 1.25rem 1rem;
          color: #64748b;
          font-weight: 600;
          border-bottom: 2px solid #f1f5f9;
          white-space: nowrap;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modern-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
          font-size: 0.95rem;
        }

        .modern-table tr:hover td {
          background: #f8fafc;
        }

        .action-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        .action-btn.primary {
          background: #0f172a;
          color: white;
        }

        .action-btn.primary:hover {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        .action-btn.outline {
          background: white;
          border-color: #e2e8f0;
          color: #475569;
        }

        .action-btn.outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .action-btn.ai {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
          color: #6366f1;
          border-color: rgba(99, 102, 241, 0.2);
        }

        .action-btn.ai:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
          border-color: rgba(99, 102, 241, 0.3);
        }
        .action-btn.danger {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .action-btn.danger:hover {
          background: #fee2e2;
        }

        .forecast-bar-container {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.75rem;
          width: 100%;
        }

        .forecast-bar {
          height: 100%;
          border-radius: 4px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .status-badge.critical { background: #fee2e2; color: #ef4444; }
        .status-badge.warning { background: #fffbeb; color: #f59e0b; }
        .status-badge.success { background: #dcfce7; color: #22c55e; }

        .desktop-table { display: table; }
        .mobile-card-container { display: none; }
        .mobile-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        @media (max-width: 1024px) {
          .alert-card {
            flex: 0 0 calc(50% - 0.5rem);
          }
        }

        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .alert-card {
            flex: 0 0 85%;
          }
          .desktop-table { display: none; }
          .mobile-card-container { display: block; }
        }

        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Contextual AI Action */}
      <div className="ai-query-container">
        <div className="ai-query-inner">
          <Sparkles size={24} color="#6366f1" />
          <input
            type="text"
            className="ai-query-input"
            placeholder="Ask Atlas AI... e.g. 'Which products should I reorder this week?'"
          />
          <button className="ai-badge">
            Generate Insights <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="metric-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#f1f5f9', color: '#475569' }}>
              <DollarSign size={20} />
            </div>
            Total Value
          </div>
          <div>
            <div className="metric-value" style={{ color: '#0f172a' }}>
              ${totalValue.toLocaleString()}
            </div>
            <div className="metric-sub">Capital currently in inventory</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <TrendingDown size={20} />
            </div>
            Low Stock
          </div>
          <div>
            <div className="metric-value" style={{ color: '#d97706' }}>
              {lowStockCount}
            </div>
            <div className="metric-sub">Below reorder threshold</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            Out of Stock
          </div>
          <div>
            <div className="metric-value" style={{ color: '#dc2626' }}>
              {outOfStockCount}
            </div>
            <div className="metric-sub">Requires immediate action</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#f3f4f6', color: '#6b7280' }}>
              <ArchiveX size={20} />
            </div>
            Dead Stock
          </div>
          <div>
            <div className="metric-value" style={{ color: '#4b5563' }}>
              {deadStockCount}
            </div>
            <div className="metric-sub">No sales in 120+ days</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <ShoppingCart size={20} />
            </div>
            To Reorder
          </div>
          <div>
            <div className="metric-value" style={{ color: '#2563eb' }}>
              {reorderCount}
            </div>
            <div className="metric-sub">POs ready to be generated</div>
          </div>
        </div>

        <div
          className="glass-card metric-card"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}
        >
          <div className="metric-header">
            <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#22c55e' }}>
              <HeartPulse size={20} />
            </div>
            Health Score
          </div>
          <div>
            <div className="metric-value" style={{ color: '#16a34a' }}>
              {healthScore}%
            </div>
            <div className="metric-sub">Overall inventory efficiency</div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts Carousel */}
      <div>
        <h2 className="section-title">
          <AlertCircle size={24} color="#0f172a" /> Intelligence Alerts
        </h2>
        <div className="carousel-container">
          <div className="glass-card alert-card critical" style={{ padding: '1rem', alignItems: 'center' }}>
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#7f1d1d', fontSize: '1rem' }}>
                {outOfStockCount} Products Out of Stock
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#991b1b' }}>
                Immediate replenishment required for top sellers.
              </p>
            </div>
            <button className="action-btn outline" style={{ background: 'white', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>View</button>
          </div>

          <div className="glass-card alert-card warning" style={{ padding: '1rem', alignItems: 'center' }}>
            <TrendingDown size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#92400e', fontSize: '1rem' }}>
                {lowStockCount} Products Below Threshold
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309' }}>
                Depleting within 14 days based on current velocity.
              </p>
            </div>
            <button className="action-btn outline" style={{ background: 'white', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Review</button>
          </div>

          <div className="glass-card alert-card info" style={{ padding: '1rem', alignItems: 'center' }}>
            <ArchiveX size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e3a8a', fontSize: '1rem' }}>
                {deadStockCount} Slow Moving Assets
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#1d4ed8' }}>
                Capital is locked. Consider promotions.
              </p>
            </div>
            <button className="action-btn outline" style={{ background: 'white', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Analyze</button>
          </div>
        </div>
      </div>

      {/* Reorder Recommendations */}
      <div className="glass-card">
        <h2 className="section-title">
          <PackagePlus size={24} color="#2563eb" />
          Reorder Recommendations
        </h2>
        <div className="table-container">
          <table className="modern-table desktop-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Supplier / Stock</th>
                <th>Forecast & Days Left</th>
                <th>Risk & AI Conf.</th>
                <th>Recommended Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reorderRecommendations.map((item) => {
                const daysLeft = item.stock === 0 ? 0 : Math.max(1, Math.floor(item.stock / (item.price > 100 ? 2 : 5)));
                const confidence = daysLeft < 7 ? '95%' : '82%';
                return (
                  <tr 
                    key={item.id}
                    onClick={() => {
                      if (onAction) onAction('edit', item.originalProduct || item);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.name || item.productName}</td>
                    <td>
                      <div style={{ color: '#475569', fontSize: '0.85rem' }}>{item.supplier}</div>
                      <span className={`status-badge ${item.stock === 0 ? 'critical' : 'warning'}`} style={{ marginTop: '4px' }}>
                        {item.stock} / {item.reorderPoint}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{daysLeft}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>days<br/>remaining</span>
                      </div>
                      <div className="forecast-bar-container" style={{ width: '80px', height: '4px', marginTop: '4px' }}>
                        <div className="forecast-bar" style={{ width: `${Math.min(100, Math.max(5, (daysLeft/30)*100))}%`, background: daysLeft < 7 ? '#ef4444' : daysLeft < 14 ? '#f59e0b' : '#22c55e' }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: daysLeft < 7 ? '#ef4444' : '#f59e0b' }}>
                          {daysLeft === 0 ? 'Critical (Stock-out)' : 'High Risk'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}><Sparkles size={10} color="#8b5cf6" /> {confidence} AI Confidence</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                      {Math.max(item.moq, item.reorderPoint * 2 - item.stock)}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="action-btn primary" style={{ padding: '0.4rem 0.8rem' }}>
                          <Send size={14} /> PO
                        </button>
                        <button className="action-btn ai" style={{ padding: '0.4rem 0.8rem' }}>
                          <Sparkles size={14} /> AI
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reorderRecommendations.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}
                  >
                    <PackageOpen
                      size={48}
                      style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }}
                    />
                    No products currently require reordering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mobile-card-container">
            {reorderRecommendations.map((item) => (
              <div 
                key={item.id} 
                className="mobile-card"
                onClick={() => {
                  if (onAction) onAction('edit', item.originalProduct || item);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{item.name || item.productName}</h4>
                  <span className={`status-badge ${item.stock === 0 ? 'critical' : 'warning'}`}>
                    {item.stock} / {item.reorderPoint}
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#475569',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <strong>Supplier:</strong> {item.supplier}
                  </div>
                  <div>
                    <strong>MOQ:</strong> {item.moq}
                  </div>
                  <div>
                    <strong>Lead Time:</strong> {item.leadTime}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Reorder:</strong>{' '}
                    {Math.max(item.moq, item.reorderPoint * 2 - item.stock)}
                  </div>
                </div>
                <div
                  className="action-group"
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <button
                    className="action-btn primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Send size={14} /> PO
                  </button>
                  <button
                    className="action-btn outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    RFQ
                  </button>
                </div>
              </div>
            ))}
            {reorderRecommendations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <PackageOpen
                  size={32}
                  style={{ opacity: 0.2, margin: '0 auto 0.5rem auto', display: 'block' }}
                />
                No products currently require reordering.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Stock Forecast */}
        <div className="glass-card">
          <h2 className="section-title">
            <BarChart3 size={24} color="#8b5cf6" /> Stock Depletion Forecast
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {fastMovers.slice(0, 4).map((item, idx) => {
              // Fake prediction logic
              const daysLeft =
                item.stock === 0
                  ? 0
                  : Math.max(1, Math.floor(item.stock / (item.price > 100 ? 2 : 5)));
              const percentageLeft = Math.min(100, Math.max(5, (daysLeft / 60) * 100));
              const color = daysLeft < 14 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : '#22c55e';
              return (
                <div key={item.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Sparkles size={12} color="#8b5cf6" />
                      {daysLeft === 0 ? 'Stocked out' : `Stock-out expected in ${daysLeft} days`}
                    </span>
                  </div>
                  <div className="forecast-bar-container">
                    <div
                      className="forecast-bar"
                      style={{ width: `${percentageLeft}%`, background: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fast Movers */}
        <div className="glass-card">
          <h2 className="section-title">
            <Zap size={24} color="#eab308" /> Fast Movers (Top Selling)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fastMovers.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      background: '#fef08a',
                      color: '#a16207',
                      padding: '0.5rem',
                      borderRadius: '10px',
                    }}
                  >
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>{item.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Moving fast • Stock: {item.stock}
                    </span>
                  </div>
                </div>
                <button className="action-btn outline">View Trend</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dead Stock Analysis */}
      <div className="glass-card">
        <h2 className="section-title">
          <PackageMinus size={24} color="#64748b" /> Dead Stock Analysis
        </h2>
        <div className="table-container">
          <table className="modern-table desktop-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Days W/O Sales</th>
                <th>Tied Capital</th>
                <th>Current Stock</th>
                <th>AI Suggestion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deadStockItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                  <td>
                    <span
                      style={{
                        color: '#ef4444',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Activity size={16} /> {item.noSalesDays} days
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${(item.stock * item.price).toLocaleString()}</td>
                  <td>{item.stock}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#f3e8ff',
                        color: '#7e22ce',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      }}
                    >
                      <Sparkles size={12} />{' '}
                      {item.stock > 200 ? 'Bundle & Discount 20%' : 'Promote via Email'}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn outline">
                        <Tag size={14} /> Discount
                      </button>
                      <button className="action-btn outline">
                        <PackagePlus size={14} /> Bundle
                      </button>
                      <button className="action-btn danger">
                        <ArchiveX size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {deadStockItems.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}
                  >
                    <Activity
                      size={48}
                      style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }}
                    />
                    Excellent! You have no dead stock right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mobile-card-container">
            {deadStockItems.map((item) => (
              <div key={item.id} className="mobile-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{item.name}</h4>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    {item.noSalesDays} days W/O
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#475569',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <strong>Tied Capital:</strong> ${(item.stock * item.price).toLocaleString()}
                  </div>
                  <div>
                    <strong>Current Stock:</strong> {item.stock}
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#f3e8ff',
                        color: '#7e22ce',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      }}
                    >
                      <Sparkles size={12} />{' '}
                      {item.stock > 200 ? 'Bundle & Discount 20%' : 'Promote via Email'}
                    </span>
                  </div>
                </div>
                <div
                  className="action-group"
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <button
                    className="action-btn outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Tag size={14} /> Discount
                  </button>
                  <button
                    className="action-btn danger"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <ArchiveX size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
            {deadStockItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <Activity
                  size={32}
                  style={{ opacity: 0.2, margin: '0 auto 0.5rem auto', display: 'block' }}
                />
                Excellent! You have no dead stock right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
