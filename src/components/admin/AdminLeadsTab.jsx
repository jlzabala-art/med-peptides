import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { catalogRepository } from '../../repositories/catalogRepository';
import { useToast } from '../../hooks/useToast';
import AdminPageHeader from './AdminPageHeader';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import { Users, FileText, Mail, Calendar, AlertTriangle, ArrowUpRight, DollarSign, Target, Trello, List, Map } from 'lucide-react';
import LeadKanbanBoard from './leads/LeadKanbanBoard';
import LeadProfileDrawer from './leads/LeadProfileDrawer';
import { calculateAILeadScore } from './leads/LeadUtils';

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
  
  // Drawer State
  const [selectedLead, setSelectedLead] = useState(null);

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
          name: data.clientName || 'RFQ Client',
          email: 'N/A (B2B)',
          message: `RFQ from ${data.supplierName || 'Supplier'}\nItems: ${data.items?.length || 0}`,
          status: data.status?.toLowerCase() || 'new',
          createdAt: isoCreatedAt,
          type: 'rfq',
          originalData: data
        };
      });

      const combined = [...(leadsData || []), ...rfqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Map legacy statuses to Kanban stages if needed, but for now just use status directly
      const mapped = combined.map(l => {
        let st = l.status;
        if(st === 'completed') st = 'won';
        if(st === 'draft') st = 'pricing';
        if(st === 'contacted') st = 'qualified';
        return { ...l, status: st };
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

  const filteredLeads = leads.filter((l) => {
    if (selectedTypeTab === 'B2C' && l.type === 'rfq') return false;
    if (selectedTypeTab === 'B2B' && l.type !== 'rfq') return false;
    const searchLower = searchTerm.toLowerCase();
    if (searchLower) {
      return (l.name || '').toLowerCase().includes(searchLower) ||
             (l.email || '').toLowerCase().includes(searchLower) ||
             (l.phone || '').toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Calculate KPIs based on the mapped leads
  const totalCount = leads.length;
  const openRfqs = leads.filter(l => l.type === 'rfq' && l.status !== 'won' && l.status !== 'lost').length;
  
  // Potential Pipeline Value
  const pipelineValue = leads.reduce((acc, lead) => {
    if (lead.status === 'won' || lead.status === 'lost') return acc;
    if (lead.type === 'rfq') {
      const items = lead.originalData?.items || [];
      // Approximate value if clientUnitPrice not set
      const val = items.reduce((sum, it) => sum + ((it.clientUnitPrice || 250) * (it.quantity || 1)), 0);
      return acc + val;
    }
    return acc + 500; // Mock B2C value
  }, 0);

  const hotLeadsCount = leads.filter(l => calculateAILeadScore(l) >= 80).length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const kpis = [
    { id: 'total', title: 'Total Leads', value: totalCount, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { id: 'rfqs', title: 'Open RFQs', value: openRfqs, icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'pipeline', title: 'Pipeline Value', value: `$${(pipelineValue / 1000).toFixed(1)}k`, icon: DollarSign, color: '#10b981', bg: '#f0fdf4' },
    { id: 'hot', title: 'Hot Opportunities', value: hotLeadsCount, icon: Target, color: '#ef4444', bg: '#fef2f2' },
    { id: 'new', title: 'New Leads', value: newLeadsCount, icon: ArrowUpRight, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const columns = [
    {
      key: 'contact',
      header: 'Company / Contact',
      render: (l) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AppEntityCell
            title={l.name || 'Unknown Contact'}
            subtitle={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Mail size={10} /> {l.email}</span>
              </div>
            }
          />
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (l) => (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', backgroundColor: l.type === 'rfq' ? '#f5f3ff' : '#f0fdf4', color: l.type === 'rfq' ? '#6d28d9' : '#15803d' }}>
          {l.type === 'rfq' ? 'Wholesaler RFQ' : 'B2C Request'}
        </span>
      ),
    },
    {
      key: 'score',
      header: 'AI Score',
      render: (l) => {
        const score = calculateAILeadScore(l);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
            <Target size={14} /> {score}
          </div>
        );
      }
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
          <option value="pricing">Pricing</option>
          <option value="quoted">Quoted</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="hold">Hold</option>
        </select>
      ),
    },
    {
      key: 'date',
      header: 'Age',
      render: (l) => {
        const days = Math.max(0, Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24)));
        return <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{days} days</span>;
      }
    }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Executive Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--color-bg-base)', paddingBottom: '1rem', paddingTop: '1rem' }}>
        <AdminPageHeader
          title="Lead Management"
          subtitle="Manage RFQs, clinic requests, commercial opportunities, and quotations."
          icon={Target}
          rightContent={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUpRight size={16} /> Import Leads</button>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} /> Create RFQ</button>
            </div>
          }
        />
      </div>

      {/* KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: kpi.bg, color: kpi.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{kpi.title}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{kpi.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Switcher & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setCurrentView('kanban')}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', backgroundColor: currentView === 'kanban' ? '#ffffff' : 'transparent', color: currentView === 'kanban' ? '#0f172a' : '#64748b', boxShadow: currentView === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <Trello size={16} /> Pipeline
          </button>
          <button 
            onClick={() => setCurrentView('table')}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', backgroundColor: currentView === 'table' ? '#ffffff' : 'transparent', color: currentView === 'table' ? '#0f172a' : '#64748b', boxShadow: currentView === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <List size={16} /> List
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '20px' }}>
            {['All', 'B2C', 'B2B'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTypeTab(tab)}
                style={{ padding: '4px 16px', fontSize: '0.8rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, backgroundColor: selectedTypeTab === tab ? '#1e3a8a' : 'transparent', color: selectedTypeTab === tab ? '#ffffff' : '#64748b' }}
              >
                {tab}
              </button>
            ))}
          </div>
          <input 
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '250px' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading pipeline...</div>
      ) : (
        <>
          {currentView === 'kanban' ? (
            <LeadKanbanBoard 
              leads={filteredLeads} 
              onLeadClick={setSelectedLead}
              onStatusChange={handleStatusChange} 
            />
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <DataTable
                data={filteredLeads}
                columns={columns}
                keyField="id"
                onRowClick={setSelectedLead}
                emptyTitle="No leads found"
              />
            </div>
          )}
        </>
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
