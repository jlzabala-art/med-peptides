'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Package,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  DollarSign,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Phone,
  MessageCircle,
  Download,
  Percent,
  Calculator,
  Globe2
} from 'lucide-react';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';

const FX_RATES = {
  QAR: 1.0,
  USD: 1 / 3.6795,
  PLN: 94 / (24 * 3.6795) // ~1.06 PLN per QAR orientative
};

export default function QatarColwayPriceClient() {
  const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' | 'monographs' | 'terms'
  const [selectedProduct, setSelectedProduct] = useState('shampoo');
  const [orderQuantity, setOrderQuantity] = useState(80); // default 80 units (40 + 40)

  // Calculations based on 80-unit batch (scalable)
  const shampooUnits = Math.round(orderQuantity / 2);
  const conditionerUnits = orderQuantity - shampooUnits;

  // Base unit economics in QAR
  const unitFactoryCostQar = 88.31; // 94 PLN = $24.00 USD * 3.6795
  const unitFreightQar = 11.55; // $251.18 / 80 * 3.6795
  const unitCustomsQar = 4.42; // $96 / 80 * 3.6795
  const unitLandedCostQar = 104.28; // 28.34 USD * 3.6795

  const unitDistributorPriceQar = 112.00; // Price to Hossam
  const unitRecommendedRetailQar = 187.00; // Target price in Qatar clinics/salons

  const totalDistributorInvoiceQar = orderQuantity * unitDistributorPriceQar;
  const totalDistributorInvoiceUsd = (totalDistributorInvoiceQar / 3.6795).toFixed(2);

  const distributorGrossMarginPerUnit = unitRecommendedRetailQar - unitDistributorPriceQar; // 75.00 QAR
  const distributorTotalGrossProfit = orderQuantity * distributorGrossMarginPerUnit; // 6,000 QAR on 80 units
  const distributorGrossMarginPct = ((distributorGrossMarginPerUnit / unitRecommendedRetailQar) * 100).toFixed(1); // 40.1%

  const distributorOpexPerUnit = 28.05; // 15% operating & bad debt buffer
  const distributorNetProfitPerUnit = 44.74; // 23.93%
  const distributorTotalNetProfit = orderQuantity * distributorNetProfitPerUnit; // 3,579.25 QAR on 80 units

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top B2B Navigation */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Sparkles size={16} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#003666', letterSpacing: '-0.02em' }}>MEDILUXE</span>
              <span style={{ fontWeight: 500, fontSize: '0.90rem', color: '#0284c7' }}>B2B EXPORT</span>
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Qatar Distribution Hub</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/pricing/24genomics-qatar"
              style={{
                fontSize: '0.78rem',
                fontWeight: 650,
                color: '#0d9488',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Switch to 24Genetics Nutrigenomics</span>
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/971504789841?text=Hello%20Jose,%20regarding%20the%20Qatar%20Colway%20Hair%20Distributor%20Schedule%20for%20Hossam"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: '0.80rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={15} />
              <span>Contact Mediluxe</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Schedules', href: '/pricing' },
          { label: 'Qatar Exclusive Distribution', href: '/pricing/colway-qatar' },
          { label: 'Hossam · Colway Trichology Line' }
        ]} />

        {/* Hero Header */}
        <div style={{ marginTop: '1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px' }}>
              Official Distributor Schedule · Qatar Territory
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px' }}>
              Partner: Hossam / The Masters Medical Center
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.02em', margin: 0 }}>
                Colway® Clinical Hair Care & Trichology Line
              </h1>
              <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', maxWidth: '780px', lineHeight: 1.5 }}>
                Official landed-cost and commercial distribution architecture for <strong>Hossam / The Masters Medical Center</strong> acting as the exclusive commercial distributor for the State of Qatar. Featuring biologically active fish tropocollagen, <strong>Baicapil™ 2%</strong>, and micronized diosmin.
              </p>
            </div>

            {/* Quick Pricing Badge */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem 1.25rem', textAlign: 'right', minWidth: '240px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Distributor Purchase Price</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                112.00 <span style={{ fontSize: '1rem', fontWeight: 600 }}>QAR / unit</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 650, marginTop: '2px' }}>
                ≈ $30.44 USD · Factory landed in Doha
              </div>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('commercial')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: activeTab === 'commercial' ? '2px solid #003666' : '1px solid #e2e8f0',
                backgroundColor: activeTab === 'commercial' ? '#003666' : '#ffffff',
                color: activeTab === 'commercial' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileSpreadsheet size={15} />
              <span>Commercial & Cost Breakdown</span>
            </button>
            <button
              onClick={() => setActiveTab('monographs')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: activeTab === 'monographs' ? '2px solid #003666' : '1px solid #e2e8f0',
                backgroundColor: activeTab === 'monographs' ? '#003666' : '#ffffff',
                color: activeTab === 'monographs' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} />
              <span>Product Monographs & Fichas Técnicas</span>
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: activeTab === 'terms' ? '2px solid #003666' : '1px solid #e2e8f0',
                backgroundColor: activeTab === 'terms' ? '#003666' : '#ffffff',
                color: activeTab === 'terms' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={15} />
              <span>Commercial Terms & Currency Rules</span>
            </button>
          </div>
        </div>

        {/* TAB 1: COMMERCIAL & COST BREAKDOWN */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top 4 KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Purchase Units</span>
                  <Package size={16} style={{ color: '#003666' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666' }}>{orderQuantity} Units</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  40× Shampoo (250 mL) + 40× Conditioner (200 mL)
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Total Landed Cost</span>
                  <Truck size={16} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7' }}>104.28 QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px' }}>
                  $28.34 USD · Factory COGS + Freight + 5% Customs
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#f0fdf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Distributor Gross Margin</span>
                  <Percent size={16} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>{distributorGrossMarginPct}% (75 QAR)</div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                  6,000.00 QAR gross margin on 80-unit batch
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Distributor Net Profit</span>
                  <TrendingUp size={16} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>23.93% Net</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  3,579.25 QAR net after 15% local risk buffer
                </div>
              </div>
            </div>

            {/* Landed Cost & Margin Full Breakdown Table (Shopify B2B Standard) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Detailed Landed Cost & Commercial Architecture (80 Units)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    Transparent reconciliation between European compounding origin, international courier freight, Mediluxe export margin, and Distributor wholesale revenue.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#003666', color: '#ffffff', padding: '4px 10px', borderRadius: '4px' }}>
                  Currency: QAR & USD
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>Cost & Commercial Element</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Basis / Documentation</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Per Unit (USD)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Per Unit (QAR)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total Batch (USD)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#003666', textAlign: 'right' }}>Total Batch (QAR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650 }}>
                        <div>Factory Purchase Cost (COGS)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>40× Shampoo + 40× Conditioner at 94 PLN factory rate</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Supplier Invoice (PLN)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$24.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>88.31 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$1,920.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>7,064.64 QAR</td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650 }}>
                        <div>Express Courier Freight (Poland → Doha, Qatar)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Direct air courier dispatch for 80 units</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Courier Freight Bill</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$3.14</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>11.55 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$251.18</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>924.22 QAR</td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650 }}>
                        <div>Estimated Customs Clearance & Duty (5% CIF)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Import duty estimate at Doha port of entry</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Illustrative CIF Method</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$1.20</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>4.42 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$96.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>353.23 QAR</td>
                    </tr>

                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', fontWeight: 750 }}>
                      <td style={{ padding: '12px 16px', color: '#0f172a' }}>TOTAL LANDED COST (Cost to Port of Doha)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Total Landed Basis</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0f172a' }}>$28.34</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0f172a' }}>104.28 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0f172a' }}>$2,267.18</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#003666', fontWeight: 800 }}>8,342.16 QAR</td>
                    </tr>

                    {/* Mediluxe Margin Row */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f0f9ff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650, color: '#0369a1' }}>
                        <div>Mediluxe Commercial Markup & Export Management (6.9% Gross)</div>
                        <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>Covers bank FX processing (0.94 QAR) & financing costs (2.06 QAR). Net Mediluxe margin: 4.22%</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#0284c7' }}>Mediluxe Margin</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0369a1' }}>+$2.10</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0369a1' }}>+7.72 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0369a1' }}>+$167.91</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0369a1', fontWeight: 700 }}>+617.84 QAR</td>
                    </tr>

                    {/* Official Price to Hossam */}
                    <tr style={{ backgroundColor: '#003666', color: '#ffffff', fontWeight: 800 }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.92rem' }}>
                        <div>OFFICIAL SELLING PRICE TO DISTRIBUTOR (HOSSAM)</div>
                        <div style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 500 }}>Price invoiced to The Masters Medical Center / Distributing Entity</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#93c5fd', fontSize: '0.78rem' }}>Agreed B2B Invoice</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1rem' }}>$30.44</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1.05rem', color: '#38bdf8' }}>112.00 QAR</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1rem' }}>$2,435.11</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1.15rem', color: '#38bdf8' }}>8,960.00 QAR</td>
                    </tr>

                    {/* Distributor Resale Horizon */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f0fdf4' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650, color: '#15803d' }}>
                        <div>Recommended Resale Price in Qatar (Clinics / Salons / Retail)</div>
                        <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Target end-user & aesthetic clinic price point in Doha</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#15803d' }}>Market MSRP</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d' }}>$50.82</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d', fontWeight: 700 }}>187.00 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d' }}>$4,065.77</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d', fontWeight: 800 }}>14,960.00 QAR</td>
                    </tr>

                    <tr style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>DISTRIBUTOR GROSS PROFIT FOR HOSSAM (40.1% MARGIN)</div>
                        <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 500 }}>Gross margin before local distribution and collection costs</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>Gross Margin (40.1%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$20.38</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+75.00 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$1,630.66</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '1.05rem' }}>+6,000.00 QAR</td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        <div>Local Operating Expenses & 90-Day Credit Risk Buffer (15%)</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Allocated for salon delivery, finance, and 90-day delayed clinic payments</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>Risk Buffer</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-$7.62</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-28.05 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-$610.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-2,244.00 QAR</td>
                    </tr>

                    <tr style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 800 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>DISTRIBUTOR NET PROFIT (23.93% NET PROFIT MARGIN)</div>
                        <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 500 }}>Clean net operating profit for distributor on first 80 units</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>Net Clean Margin</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$12.16</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+44.74 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$972.75</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '1.05rem' }}>+3,579.25 QAR</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Order Proforma Action Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>Ready to Confirm Initial 80-Unit Batch?</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Total Pro-Forma Invoice: <strong>8,960.00 QAR</strong> ($2,435.11 USD). 100% advance payment required upon PO confirmation.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="mailto:jose@mediluxeme.com?subject=PO%20Confirmation%20-%20Hossam%20Qatar%20Colway%20Hair%20Care%20(80%20Units)&body=Hello%20Jose,%0A%0AWe%20confirm%20our%20distributor%20purchase%20order%20for%20the%20initial%20commercial%20batch%20of%20Colway%20Hair%20Care%20(80%20Units%20at%20112%20QAR%20/%20unit%20=%208,960%20QAR).%0A%0APlease%20issue%20the%20official%20pro-forma%20invoice%20for%20100%25%20advance%20wire%20transfer.%0A%0ACompany:%20The%20Masters%20Medical%20Center%20/%20Qatar%20Distribution%0AContact:%20Hossam"
                  style={{
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} />
                  <span>Request Official Pro-Forma (Email)</span>
                </a>
                <a
                  href="https://wa.me/971504789841?text=Hello%20Jose,%20Hossam%20here.%20We%20want%20to%20confirm%20the%2080%20units%20batch%20of%20Colway%20Hair%20(Shampoo%20+%20Conditioner)%20for%208,960%20QAR."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Confirm via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MONOGRAPHS (FICHAS TÉCNICAS) */}
        {activeTab === 'monographs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setSelectedProduct('shampoo')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  border: selectedProduct === 'shampoo' ? '2px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: selectedProduct === 'shampoo' ? '#003666' : '#ffffff',
                  color: selectedProduct === 'shampoo' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                1. Hair Strengthening Shampoo (250 mL)
              </button>
              <button
                onClick={() => setSelectedProduct('conditioner')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  border: selectedProduct === 'conditioner' ? '2px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: selectedProduct === 'conditioner' ? '#003666' : '#ffffff',
                  color: selectedProduct === 'conditioner' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                2. Hair Strengthening Conditioner (200 mL)
              </button>
            </div>

            {selectedProduct === 'shampoo' ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', backgroundColor: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                      Clinical Trichology Monograph
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666', marginTop: '6px', margin: 0 }}>
                      Colway Strengthening Anti-Hair Loss Shampoo
                    </h2>
                    <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '4px' }}>
                      Szampon Zagęszczający Włosy Colway · 250 mL Dispenser Bottle · Physiologic pH 5.5
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Distributor Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003666' }}>112.00 QAR</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Resale: 187.00 QAR (40.1% Margin)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Active Biological Compounds
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Baicapil™ 2.0% (Clinical Grade):</strong> Synergistic blend of Scutellaria baicalensis root extract, Glycine soja (soybean) germ extract, and Triticum vulgare (wheat) germ extract. Stimulates hair follicle stem cells in the bulge, increases cellular energy (ATP), and extends the anagen growth phase.</li>
                      <li><strong>Native Fish Tropocollagen:</strong> Biologically active, triple-helix marine collagen extracted cold. Rebuilds the perifollicular extracellular matrix and strengthens the dermal papilla anchor.</li>
                      <li><strong>Micronized Diosmin (Vascular Activator):</strong> Flavonoid compound that dramatically stimulates microcirculation in scalp capillaries, improving arterial perfusion and oxygenation to hair roots.</li>
                      <li><strong>Caffeine & Niacinamide:</strong> Neutralizes local DHT receptor micro-inflammation and accelerates nutrient absorption.</li>
                      <li><strong>Zinc PCA & Mild Cleansing Base:</strong> Regulates excess sebum without stripping the protective stratum corneum barrier.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Clinical Indications & Protocols
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Pre-Hair Transplant Preparation:</strong> Prepares the scalp ostium and stimulates capillary density 30 days prior to FUE/DHI extraction.</li>
                      <li><strong>Post-Transplant Recovery (Day 10+):</strong> Accelerated healing of recipient micro-crusts and prevention of shock loss.</li>
                      <li><strong>Androgenetic Alopecia & Telogen Effluvium:</strong> Proven reduction in shedding within 4 weeks and increase in hair density by +18.0%.</li>
                      <li><strong>Application Protocol:</strong> Apply to wet scalp, massage gently for 2-3 minutes to allow transfollicular absorption of diosmin and Baicapil™, then rinse thoroughly with lukewarm water.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      Clinical Trichology Monograph
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666', marginTop: '6px', margin: 0 }}>
                      Colway Strengthening Hair Conditioner
                    </h2>
                    <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '4px' }}>
                      Odżywka Zagęszczająca Włosy Colway · 200 mL Flexible Tube · Acidic pH 4.5 (Cuticle Sealer)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Distributor Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003666' }}>112.00 QAR</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Resale: 187.00 QAR (40.1% Margin)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Active Biological Compounds
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Baicapil™ Trichology Complex:</strong> Maintains active stimulation along the hair shaft and roots during conditioning.</li>
                      <li><strong>Hydrolyzed Keratin:</strong> Micro-peptides that penetrate micro-fractures in the hair cortex, reinforcing tensile resistance (+24%).</li>
                      <li><strong>Native Marine Collagen:</strong> Forms an invisible biomimetic protective shield that locks in moisture without weighing down fine hair.</li>
                      <li><strong>Argania Spinosa & Gossypium (Cotton) Seed Oil:</strong> Rich in essential Omega-6 and Omega-9 fatty acids for deep cuticular lipid seal.</li>
                      <li><strong>D-Panthenol (Provitamin B5):</strong> Enhances hair shaft elasticity and imparts natural clinical luster.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Mechanism of Action & Clinical Synergy
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>pH 4.5 Acidic Sealing:</strong> Immediately seals the keratin cuticle scales opened during washing, preventing mechanical breakage.</li>
                      <li><strong>Non-Comedogenic Scalp Formulation:</strong> Unlike commercial conditioners, it can be applied directly to the scalp without clogging follicular ostia.</li>
                      <li><strong>Thermal & Environmental Protection:</strong> Shields the hair shaft from intense Qatar heat and UV degradation.</li>
                      <li><strong>Application Protocol:</strong> After shampooing, apply along damp hair and scalp, leave for 3 to 5 minutes, then rinse.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMMERCIAL TERMS & CONDITIONS */}
        {activeTab === 'terms' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#003666', marginBottom: '1.25rem' }}>
              Official Distributor Terms & Conditions (State of Qatar)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <strong style={{ color: '#15803d', display: 'block', marginBottom: '4px' }}>
                  1. Distributor Role & Territory Exclusivity
                </strong>
                This price schedule and commercial cost breakdown are strictly and exclusively formulated for <strong>Hossam / The Masters Medical Center</strong> acting as the commercial distributor in the State of Qatar. These privileged landed prices cannot be transferred or published to third parties without prior authorization.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>
                  2. Mandatory Payment Terms: 100% Advance Payment with Order (Strict Standard)
                </strong>
                All export orders require <strong>100% advance wire transfer payment</strong> upon confirmation of the official pro-forma invoice. Commercial dispatch from the European logistics center is triggered immediately upon receipt of funds. No open-credit or delayed accounts are offered at export level.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>
                  3. Origin in Polish Złoty (PLN) & QAR / USD Exchange Rate Settlement
                </strong>
                Primary manufacturing contracts and factory purchase prices in Poland are denominated in <strong>Polish Złoty (PLN)</strong> at <strong>94.00 PLN / unit</strong>. All prices shown in <strong>Qatari Riyal (QAR)</strong> and <strong>US Dollars (USD)</strong> are calculated using current interbank exchange rates and are provided for <strong>guidance and commercial orientation purposes</strong>. Invoices are settled in USD or pegged QAR equivalent at the time of order execution.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  4. Freight, Insurance & Port of Entry (CIF / DDU Doha)
                </strong>
                Initial batch shipping is quoted based on supplier express air freight invoice ($251.18 USD for 80 units). Customs clearance handling and the illustrative 5% CIF duty are included in the landed cost estimation. Consignee in Doha will facilitate standard Ministry of Public Health / customs entry.
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
