import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import WorkflowDetailWorkspace from './components/WorkflowDetailWorkspace';
import { 
  Clock, CheckCircle2, AlertCircle, FileText, Pill, Truck, 
  DollarSign, Search, Inbox, Inbox as ArchiveIcon, Trash2, UserPlus, FileUp, Filter, Zap
} from 'lucide-react';

const sidebarViews = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'awaiting-review', label: 'Awaiting Review', icon: Clock },
  { id: 'awaiting-approval', label: 'Awaiting Approval', icon: CheckCircle2 },
  { id: 'processed-today', label: 'Processed Today', icon: Zap },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'archived', label: 'Archived', icon: ArchiveIcon },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle },
  { id: 'no-action', label: 'No Action Required', icon: FileText },
  { id: 'my-items', label: 'My Items', icon: UserPlus },
  { id: 'team-items', label: 'Team Items', icon: UserPlus },
];

export default function OperationsInboxHub() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('inbox');
  const [queue, setQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIntent, setFilterIntent] = useState('All');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Connect directly to the operations_queue collection
    const q = query(
      collection(db, 'operations_queue'),
      orderBy('date', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQueue(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching operations queue:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute counts for sidebar
  const getCount = (viewId) => {
    switch (viewId) {
      case 'inbox': return queue.filter(q => q.status === 'New' || q.status === 'AI Processing').length;
      case 'awaiting-review': return queue.filter(q => q.status === 'Awaiting Review').length;
      case 'awaiting-approval': return queue.filter(q => q.status === 'Awaiting Approval').length;
      case 'completed': return queue.filter(q => q.status === 'Completed' || q.status === 'Workflow Generated').length;
      case 'archived': return queue.filter(q => q.status === 'Archived').length;
      case 'no-action': return queue.filter(q => q.status === 'No Action Required' || q.outcome === 'No Action Required').length;
      case 'my-items': return queue.filter(q => q.assignedTo === user?.uid || q.ownerEmail === user?.email).length;
      case 'team-items': return queue.filter(q => q.assignedTo !== user?.uid && q.ownerEmail !== user?.email).length;
      default: return 0; // Return 0 instead of empty so we don't show badges for everything yet
    }
  };

  const getFilteredQueue = () => {
    let result = queue;
    
    // View filter
    switch (activeView) {
      case 'inbox': result = result.filter(q => q.status === 'New' || q.status === 'AI Processing'); break;
      case 'awaiting-review': result = result.filter(q => q.status === 'Awaiting Review'); break;
      case 'awaiting-approval': result = result.filter(q => q.status === 'Awaiting Approval'); break;
      case 'completed': result = result.filter(q => q.status === 'Completed' || q.status === 'Workflow Generated'); break;
      case 'archived': result = result.filter(q => q.status === 'Archived'); break;
      case 'no-action': result = result.filter(q => q.status === 'No Action Required' || q.outcome === 'No Action Required'); break;
      case 'my-items': result = result.filter(q => q.assignedTo === user?.uid || q.ownerEmail === user?.email); break;
      case 'team-items': result = result.filter(q => q.assignedTo !== user?.uid && q.ownerEmail !== user?.email); break;
      default: break;
    }

    // Intent filter
    if (filterIntent !== 'All') {
      result = result.filter(q => q.detectedIntent === filterIntent);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const sq = searchQuery.toLowerCase();
      result = result.filter(q => 
        (q.subject && q.subject.toLowerCase().includes(sq)) || 
        (q.senderName && q.senderName.toLowerCase().includes(sq)) || 
        (q.senderEmail && q.senderEmail.toLowerCase().includes(sq))
      );
    }

    return result;
  };

  const filteredQueue = getFilteredQueue();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedItem) {
        if (e.key === 'Escape') {
          setSelectedItem(null);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredQueue.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredQueue.length) {
        e.preventDefault();
        setSelectedItem(filteredQueue[focusedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredQueue, selectedItem]);

  if (selectedItem) {
    return (
      <WorkflowDetailWorkspace 
        item={selectedItem} 
        onBack={() => setSelectedItem(null)} 
        onUpdateItem={(updated) => {
          setQueue(queue.map(q => q.id === updated.id ? updated : q));
          setSelectedItem(updated);
        }}
      />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      case 'AI Processing': return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      case 'Awaiting Review': return <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      case 'Awaiting Approval': return <span style={{ background: '#fed7aa', color: '#9a3412', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      case 'Workflow Generated':
      case 'Completed': return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      case 'Archived':
      case 'Deleted':
      case 'Rejected':
      case 'No Action Required': return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
      default: return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{status}</span>;
    }
  };

  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredQueue.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredQueue.map(q => q.id));
    }
  };

  const handleBulkArchive = async () => {
    if (!selectedRows.length) return;
    try {
      const batch = writeBatch(db);
      selectedRows.forEach(id => {
        const ref = doc(db, 'operations_queue', id);
        batch.update(ref, { status: 'Archived', updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      setSelectedRows([]);
    } catch (err) {
      console.error('Error archiving:', err);
      alert('Error archiving items.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Left Sidebar */}
      <div style={{ width: '260px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Operations Inbox</h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>AI-Powered Workflow Engine</div>
        </div>
        <div style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          <nav style={{ flex: 1 }}>
            {sidebarViews.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: activeView === view.id ? '#e0f2fe' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeView === view.id ? '#0369a1' : '#475569',
                  fontWeight: activeView === view.id ? 700 : 500,
                  borderRadius: '8px',
                  marginBottom: '4px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <view.icon size={18} color={activeView === view.id ? '#0ea5e9' : '#94a3b8'} />
                  <span style={{ fontSize: '14px' }}>{view.label}</span>
                </div>
                {getCount(view.id) > 0 && (
                  <span style={{
                    background: activeView === view.id ? '#bae6fd' : '#f1f5f9',
                    color: activeView === view.id ? '#0369a1' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {getCount(view.id)}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* KPI Dashboard (Top) */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{queue.filter(q => q.status === 'Awaiting Review').length}</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>RFQs Generated</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{queue.filter(q => q.detectedIntent === 'CUSTOMER_RFQ').length}</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>AI Accuracy</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{queue.length > 0 ? '98.2%' : '—'}</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Avg Processing</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{queue.length > 0 ? '1.2s' : '—'}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedRows.length > 0 ? (
              <>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', alignSelf: 'center', marginRight: '8px' }}>{selectedRows.length} selected</span>
                <button onClick={handleBulkArchive} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Archive</button>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '8px' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows..." 
                  style={{ padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', width: '250px', outline: 'none' }}
                />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={14} color="#64748b" />
            <select 
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 28px 6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">All Intents</option>
              <option value="CUSTOMER_RFQ">Customer RFQ</option>
              <option value="SUPPLIER_QUOTATION">Supplier Quote</option>
              <option value="PRICE_LIST">Price List</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="COA">Certificate of Analysis (COA)</option>
              <option value="INQUIRY">General Inquiry</option>
              <option value="PURCHASE_ORDER">Purchase Order</option>
            </select>
          </div>
        </div>

        {/* Queue List / Mobile Cards */}
        <div style={{ flex: 1, overflowY: 'auto', background: isMobile ? '#f1f5f9' : '#fff', padding: isMobile ? '12px' : '0' }}>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredQueue.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{ 
                    background: '#fff', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    borderLeft: selectedRows.includes(item.id) ? '4px solid #0ea5e9' : '4px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(item.id)} 
                        onChange={(e) => { e.stopPropagation(); toggleRow(item.id); }}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      {getStatusBadge(item.status)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{item.date}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {item.detectedIntent}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      From: <span style={{ fontWeight: 600 }}>{item.senderName || item.senderEmail}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      {/* Fake Confidence Badge for UI showcase */}
                      <span style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: item.status === 'New' ? '#fbbf24' : '#10b981' 
                      }} />
                      {item.status === 'New' ? 'Needs Review' : 'High Confidence'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); console.log('Approve', item.id); }}
                        style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredQueue.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No items in this view.
                </div>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input type="checkbox" checked={selectedRows.length === filteredQueue.length && filteredQueue.length > 0} onChange={toggleAll} />
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Intent</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Outcome</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Linked Record</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Sender</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Owner</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item, index) => (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0', 
                      background: selectedRows.includes(item.id) ? '#f0f9ff' : (index === focusedIndex ? '#f1f5f9' : '#fff'),
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      setFocusedIndex(index);
                      if (!selectedRows.includes(item.id)) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => !selectedRows.includes(item.id) && index !== focusedIndex && (e.currentTarget.style.background = '#fff')}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => toggleRow(item.id)} />
                    </td>
                    <td style={{ padding: '16px' }}>{getStatusBadge(item.status)}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.detectedIntent}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>{item.outcome}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#0ea5e9' }} onClick={(e) => {
                      e.stopPropagation();
                      if(item.linkedRecord) {
                        console.log('Navigating to', item.linkedRecord);
                      }
                    }}>
                      {item.linkedRecord ? <span style={{ textDecoration: 'underline' }}>{item.linkedRecord}</span> : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#0f172a' }} onClick={() => setSelectedItem(item)}>
                      <div style={{ fontWeight: 600 }}>{item.senderName}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{item.senderEmail}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }} onClick={() => setSelectedItem(item)}>{item.owner}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }} onClick={() => setSelectedItem(item)}>{item.date}</td>
                  </tr>
                ))}
                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      No items in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
