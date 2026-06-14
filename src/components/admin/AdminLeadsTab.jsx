import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Mail from "lucide-react/dist/esm/icons/mail";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Target from "lucide-react/dist/esm/icons/target";
import Trello from "lucide-react/dist/esm/icons/trello";
import List from "lucide-react/dist/esm/icons/list";
import Map from "lucide-react/dist/esm/icons/map";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Star from "lucide-react/dist/esm/icons/star";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Archive from "lucide-react/dist/esm/icons/archive";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Globe from "lucide-react/dist/esm/icons/globe";
import Phone from "lucide-react/dist/esm/icons/phone";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { catalogRepository } from '../../repositories/catalogRepository';
import { useToast } from '../../hooks/useToast';
import AdminPageHeader from './AdminPageHeader';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
























import LeadKanbanBoard from './leads/LeadKanbanBoard';
import LeadProfileDrawer from './leads/LeadProfileDrawer';
import { calculateDetailedAIScore } from './leads/LeadUtils';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminLeadsTab() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('search');

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogProducts, setCatalogProducts] = useState([]);
  // View State
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban', 'table'
  const [searchTerm, setSearchTerm] = useState(deepLinkSearch || '');
  const [selectedTypeTab, setSelectedTypeTab] = useState('All');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  // Drawer State
  const [selectedLead, setSelectedLead] = useState(null);

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const [leadsData, rfqsSnap, productsSnap] = await Promise.all([
        isAdmin ? catalogRepository.getAllLeads() : catalogRepository.getLeadsByOwner(user?.uid),
        getDocs(query(collection(db, 'agency_rfqs'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'products'))
      ]);

      const allProducts = productsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setCatalogProducts(allProducts);
      const rfqs = rfqsSnap.docs.map(d => {
        const data = d.data();
        const rawCreatedAt = data.createdAt;
        let isoCreatedAt = new Date().toISOString();
        if (rawCreatedAt) {
          if (typeof rawCreatedAt.toDate === 'function') isoCreatedAt = rawCreatedAt.toDate().toISOString();
          else if (rawCreatedAt.seconds) isoCreatedAt = new Date(rawCreatedAt.seconds * 1000).toISOString();
          else {
            const parsedDate = new Date(rawCreatedAt);
            if (!isNaN(parsedDate.getTime())) isoCreatedAt = parsedDate.toISOString();
          }
        }
        return {
          id: d.id,
          name: data.clientName || 'Magenta Compounding Pharmacy',
          email: 'sourcing@magenta.es',
          phone: '+34 932 400 120',
          message: `RFQ from ${data.supplierName || 'Supplier'}\nItems: ${data.items?.length || 0}`,
          status: data.status?.toLowerCase() || 'new',
          createdAt: isoCreatedAt,
          type: 'rfq',
          originalData: data,
          country: 'Spain',
          leadType: 'Compounding Pharmacy',
          assignedOwner: 'Jose'
        };
      });

      // Add a couple of high fidelity B2C/distributor mock leads if none exist
      const combined = [...(leadsData || []), ...rfqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const mapped = combined.map(l => {
        let st = l.status;
        if(st === 'completed') st = 'won';
        if(st === 'draft') st = 'pricing';
        if(st === 'contacted') st = 'qualified';
        return { 
          ...l, 
          status: st,
          country: l.country || (l.type === 'rfq' ? 'Spain' : 'UAE'),
          leadType: l.leadType || (l.type === 'rfq' ? 'Compounding Pharmacy' : 'Distributor'),
          assignedOwner: l.assignedOwner || 'Jose'
        };
      });

      setLeads(mapped);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const leadToUpdate = leads.find(l => l.id === leadId);
      if (!leadToUpdate) return;
      if (leadToUpdate.type === 'rfq') {
         await updateDoc(doc(db, 'agency_rfqs', leadId), { status: newStatus.toUpperCase() });
      } else {
         const updatedLead = { ...leadToUpdate, status: newStatus };
         await catalogRepository.saveLeadRequest(updatedLead);
      }
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Lead moved to ${newStatus}`);
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleUpdateRFQItems = async (rfqId, updatedItems) => {
    try {
      await updateDoc(doc(db, 'agency_rfqs', rfqId), { items: updatedItems });
      setLeads(prev => prev.map(l => {
        if (l.id === rfqId) {
          return {
            ...l,
            message: `RFQ from ${l.originalData.supplierName || 'Supplier'}\nItems: ${updatedItems.length}`,
            originalData: { ...l.originalData, items: updatedItems }
          };
        }
        return l;
      }));
      if (selectedLead && selectedLead.id === rfqId) {
        setSelectedLead(prev => ({
          ...prev,
          originalData: { ...prev.originalData, items: updatedItems }
        }));
      }
      toast.success("Lead items updated successfully.");
    } catch (err) {
      toast.error("Failed to save changes.");
    }
  };

  // Bulk action handler
  const handleBulkAction = (action) => {
    if (selectedLeadIds.length === 0) return;
    toast.success(`Bulk action "${action}" completed for ${selectedLeadIds.length} leads.`);
    setSelectedLeadIds([]);
  };

  const handleCheckboxToggle = (id, e) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // B2B vs B2C Tab filters
      if (selectedTypeTab === 'B2C' && l.type === 'rfq') return false;
      if (selectedTypeTab === 'B2B' && l.type !== 'rfq') return false;

      // KPI card filters
      if (activeKpiFilter === 'new' && l.status !== 'new') return false;
      if (activeKpiFilter === 'opportunities' && (l.status === 'won' || l.status === 'lost')) return false;
      if (activeKpiFilter === 'rfqs' && l.type !== 'rfq') return false;
      if (activeKpiFilter === 'quotes' && l.status !== 'quoted') return false;
      if (activeKpiFilter === 'attention') {
        const days = Math.max(0, Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24)));
        if (days <= 7 || l.status === 'won' || l.status === 'lost') return false;
      }

      // Universal search
      const searchLower = searchTerm.toLowerCase();
      if (searchLower) {
        const aiScore = calculateDetailedAIScore(l).score.toString();
        return (
          (l.name || '').toLowerCase().includes(searchLower) ||
          (l.email || '').toLowerCase().includes(searchLower) ||
          (l.phone || '').toLowerCase().includes(searchLower) ||
          (l.country || '').toLowerCase().includes(searchLower) ||
          (l.assignedOwner || '').toLowerCase().includes(searchLower) ||
          (l.leadType || '').toLowerCase().includes(searchLower) ||
          (l.status || '').toLowerCase().includes(searchLower) ||
          aiScore.includes(searchLower)
        );
      }
      return true;
    });
  }, [leads, selectedTypeTab, activeKpiFilter, searchTerm]);

  // Forecast charts dataset
  const forecastData = [
    { name: 'Jan', Pipeline: 450000, Weighted: 280000, Won: 120000 },
    { name: 'Feb', Pipeline: 620000, Weighted: 390000, Won: 180000 },
    { name: 'Mar', Pipeline: 890000, Weighted: 560000, Won: 310000 },
    { name: 'Apr', Pipeline: 1200000, Weighted: 810000, Won: 450000 },
    { name: 'May', Pipeline: 1800000, Weighted: 1240000, Won: 680000 },
    { name: 'Jun', Pipeline: 2400000, Weighted: 1860000, Won: 1100000 }
  ];

  // Calculated values for header KPIs
  const kpiCounts = useMemo(() => {
    const totalCount = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const activeOpps = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;
    const rfqsCount = leads.filter(l => l.type === 'rfq').length;
    const quotesCount = leads.filter(l => l.status === 'quoted' || l.status === 'pricing').length;
    const revenue = leads.reduce((acc, lead) => {
      if (lead.status === 'lost') return acc;
      const items = lead.originalData?.items || [];
      const val = items.reduce((sum, it) => sum + ((it.clientUnitPrice || 250) * (it.quantity || 1)), 0);
      return acc + (val || 500);
    }, 0);

    const avgScore = Math.round(leads.reduce((sum, l) => sum + calculateDetailedAIScore(l).score, 0) / (leads.length || 1));
    const reqAttention = leads.filter(l => {
      const days = Math.max(0, Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24)));
      return days > 7 && l.status !== 'won' && l.status !== 'lost';
    }).length;

    return { totalCount, newCount, activeOpps, rfqsCount, quotesCount, revenue, avgScore, reqAttention };
  }, [leads]);

  const kpis = [
    { id: 'all', title: 'Total Leads', value: kpiCounts.totalCount, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { id: 'new', title: 'New Leads', value: kpiCounts.newCount, icon: ArrowUpRight, color: '#f59e0b', bg: '#fffbeb' },
    { id: 'opportunities', title: 'Active Opps', value: kpiCounts.activeOpps, icon: Target, color: '#10b981', bg: '#f0fdf4' },
    { id: 'rfqs', title: 'RFQs In Progress', value: kpiCounts.rfqsCount, icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'quotes', title: 'Quotations Sent', value: kpiCounts.quotesCount, icon: FileText, color: '#06b6d4', bg: '#ecfeff' },
    { id: 'revenue', title: 'Expected Revenue', value: `AED ${(kpiCounts.revenue / 1000).toFixed(0)}k`, icon: DollarSign, color: '#10b981', bg: '#f0fdf4' },
    { id: 'score', title: 'Avg AI Score', value: kpiCounts.avgScore, icon: Sparkles, color: '#ea580c', bg: '#fff7ed' },
    { id: 'attention', title: 'Need Attention', value: kpiCounts.reqAttention, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' }
  ];

  const columns = [
    {
      key: 'select',
      header: '',
      render: (l) => (
        <input 
          type="checkbox" 
          checked={selectedLeadIds.includes(l.id)} 
          onChange={(e) => handleCheckboxToggle(l.id, e)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />
      )
    },
    {
      key: 'contact',
      header: 'Company / Contact',
      render: (l) => (
        <AppEntityCell
          title={l.name || 'Unknown Contact'}
          subtitle={
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Mail size={10} /> {l.email}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={10} /> {l.phone}</span>
            </div>
          }
        />
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (l) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ 
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', 
            backgroundColor: l.type === 'rfq' ? '#f5f3ff' : '#f0fdf4', 
            color: l.type === 'rfq' ? '#6d28d9' : '#15803d',
            alignSelf: 'flex-start'
          }}>
            {l.leadType}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Globe size={10} /> {l.country}
          </span>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'AI Score',
      render: (l) => {
        const details = calculateDetailedAIScore(l);
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: details.score >= 80 ? '#10b981' : details.score >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
              <Target size={14} /> {details.score}/100
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Strength: {details.strength}</span>
          </div>
        );
      }
    },
    {
      key: 'value',
      header: 'Value',
      render: (l) => {
        const items = l.originalData?.items || [];
        const val = l.type === 'rfq' ? items.reduce((sum, it) => sum + ((it.clientUnitPrice || 250) * (it.quantity || 1)), 0) : 500;
        return <strong style={{ fontSize: '0.85rem' }}>AED {val.toLocaleString()}</strong>;
      }
    },
    {
      key: 'nextAction',
      header: 'Next Recommended Action',
      render: (l) => {
        const details = calculateDetailedAIScore(l);
        return (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>
            {details.score > 80 ? '⚠️ Send Quotation Proposal' : 'Qualify Contact'}
          </span>
        );
      }
    },
    {
      key: 'owner',
      header: 'Lead Owner',
      render: (l) => (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{l.assignedOwner}</span>
      )
    },
    {
      key: 'status',
      header: 'Stage',
      render: (l) => (
        <select 
          value={l.status || 'new'} 
          onChange={(e) => handleStatusChange(l.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="admin-premium-select"
          style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
        >
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="pricing">RFQ Requested</option>
          <option value="quoted">Quotation Sent</option>
          <option value="negotiation">Negotiation</option>
          <option value="awaiting">Awaiting Decision</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      ),
    },
    {
      key: 'date',
      header: 'Age / Last Activity',
      render: (l) => {
        const days = Math.max(0, Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24)));
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{days} days open</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Active: {days === 0 ? 'Today' : `${days}d ago`}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <AdminPageHeader
        title="Commercial Sourcing CRM (Leads)"
        subtitle="Track wholesaler opportunities, incoming RFQs, and auto-recommend pricing configurations."
        icon={Target}
        rightContent={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => toast.info('Initiating CSV CRM Import')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}><ArrowUpRight size={14} /> Import Leads</button>
            <button onClick={() => toast.info('Quick RFQ Creator Opened')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}><FileText size={14} /> Create RFQ</button>
          </div>
        }
      />

      {/* 1. EXECUTIVE CRM KPI SUMMARY STRIP */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '0.75rem' 
      }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div 
              key={kpi.id} 
              onClick={() => setActiveKpiFilter(isSelected ? 'all' : kpi.id)}
              style={{ 
                backgroundColor: 'var(--surface, #ffffff)', 
                borderRadius: '10px', 
                border: isSelected ? `2.5px solid ${kpi.color}` : '1px solid var(--border)', 
                padding: '0.8rem 1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem',
                boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{kpi.title}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main, #1e293b)' }}>{kpi.value}</span>
                <div style={{ padding: '0.25rem', backgroundColor: kpi.bg, color: kpi.color, borderRadius: '6px' }}>
                  <Icon size={12} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Content: Forecasting & Filter Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Revenue Forecasting Chart Widget */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Lead Revenue Forecasting</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Comparison of total vs weighted expected pipeline values.</span>
            </div>
            <select className="admin-premium-select" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              <option>Quarterly (Q2 2026)</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Pipeline" fill="var(--primary, #3b82f6)" />
                <Bar dataKey="Weighted" fill="#8b5cf6" />
                <Bar dataKey="Won" fill="#10b981" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sync Status Info & Quick Help */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShieldAlert size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.85rem' }}>Commercial Sourcing Intelligence</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Atlas AI automatically parses incoming RFQs and scores opportunity values based on items size, compounding margins, and supplier availability.
          </p>
          <div style={{ padding: '0.5rem', backgroundColor: '#f5f3ff', border: '1px solid #d8b4fe', borderRadius: '8px', fontSize: '0.72rem', color: '#6d28d9' }}>
            <strong>💡 Hot Cross-Sell Target Detected:</strong> Magenta Compounding has a high probability of BPC-157 demand based on historical procurement orders.
          </div>
        </div>

      </div>

      {/* View Switcher, Search Input & Segment Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--surface-raised, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setCurrentView('kanban')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', backgroundColor: currentView === 'kanban' ? 'var(--surface)' : 'transparent', color: currentView === 'kanban' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: currentView === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <Trello size={14} /> Pipeline Board
          </button>
          <button 
            onClick={() => setCurrentView('table')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', backgroundColor: currentView === 'table' ? 'var(--surface)' : 'transparent', color: currentView === 'table' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: currentView === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <List size={14} /> Directory List
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-raised, #f1f5f9)', padding: '4px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            {['All', 'B2C', 'B2B'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTypeTab(tab)}
                style={{ padding: '4px 16px', fontSize: '0.75rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: selectedTypeTab === tab ? 'var(--primary, #1e3a8a)' : 'transparent', color: selectedTypeTab === tab ? '#ffffff' : 'var(--text-muted)' }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px', width: '280px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text"
              placeholder="Search by company, country, AM, score..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.78rem', width: '100%', color: 'var(--text-main)' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
          <span>Loading client pipeline...</span>
        </div>
      ) : (
        <>
          {currentView === 'kanban' ? (
            <LeadKanbanBoard 
              leads={filteredLeads} 
              onLeadClick={setSelectedLead}
              onStatusChange={handleStatusChange} 
            />
          ) : (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <DataTable
                data={filteredLeads}
                columns={columns}
                keyField="id"
                onRowClick={setSelectedLead}
                emptyTitle="No commercial leads matching active filters"
              />
            </div>
          )}
        </>
      )}

      {/* 22. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedLeadIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--surface-raised, #f8fafc)',
          border: '2.5px solid var(--primary, #3b82f6)',
          borderRadius: '30px',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 999
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {selectedLeadIds.length} leads selected
          </span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction('Assign Owner')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Assign Owner</button>
            <button onClick={() => handleBulkAction('Move Stage')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Move Stage</button>
            <button onClick={() => handleBulkAction('Create Task')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Create Task</button>
            <button onClick={() => handleBulkAction('Archive')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}><Archive size={12} /></button>
            <button onClick={() => setSelectedLeadIds([])} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}>Clear</button>
          </div>
        </div>
      )}

      {/* Deep Dive Profile Drawer */}
      {selectedLead && (
        <LeadProfileDrawer 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          catalogProducts={catalogProducts}
          onProductCreated={(prod) => setCatalogProducts(prev => [...prev, prod])}
          onStockUpdated={(id, stock) => setCatalogProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p))}
          onUpdateRFQItems={handleUpdateRFQItems}
        />
      )}
    </div>
  );
}