import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Globe, FileText, CheckCircle, AlertCircle, Share2, Search, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppActionGroup from '../ui/AppActionGroup';

export default function AdminMarketingTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // LinkedIn Auth Status
  const [linkedInStatus, setLinkedInStatus] = useState({ connected: false, expiresAt: null, urn: null });

  useEffect(() => {
    // 1. Check if we just returned from LinkedIn OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setAuthLoading(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Send code to backend
      fetch('https://us-central1-med-peptides-app.cloudfunctions.net/handleLinkedinAuthCallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          alert('LinkedIn conectado correctamente!');
        } else {
          alert('Error conectando LinkedIn: ' + data.error);
        }
        setAuthLoading(false);
      })
      .catch(e => {
        console.error(e);
        setAuthLoading(false);
      });
    }

    // 2. Load LinkedIn Status from settings
    const unsubStatus = onSnapshot(doc(db, 'settings', 'linkedin'), (docSnap) => {
      try {
        if (docSnap.exists() && docSnap.data()?.accessToken) {
          const data = docSnap.data();
          let expiresAtDate = null;
          let updatedAtDate = null;
          
          if (data.expiresAt) {
            expiresAtDate = typeof data.expiresAt.toDate === 'function' ? data.expiresAt.toDate() : new Date(data.expiresAt);
          }
          if (data.updatedAt) {
            updatedAtDate = typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(data.updatedAt);
          }
          
          setLinkedInStatus({ 
            connected: true, 
            expiresAt: expiresAtDate,
            updatedAt: updatedAtDate,
            urn: data.urn
          });
        } else {
          setLinkedInStatus({ connected: false, expiresAt: null, updatedAt: null });
        }
      } catch (err) {
        console.error("Error parsing LinkedIn status:", err);
        setLinkedInStatus({ connected: false, expiresAt: null, updatedAt: null });
      }
    }, (error) => {
      console.error("Error fetching LinkedIn status:", error);
    });

    // 3. Load Blogs
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const unsubscribeBlogs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogs(docs);
      setLoading(false);
    });

    return () => {
      unsubStatus();
      unsubscribeBlogs();
    };
  }, []);

  const handleConnectLinkedIn = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('https://us-central1-med-peptides-app.cloudfunctions.net/generateLinkedinAuthUrl');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error: No URL received');
        setAuthLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error contactando con el servidor');
      setAuthLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await deleteDoc(doc(db, 'blogPosts', id));
    }
  };

  const handleToggleStatus = async (id, willBeActive) => {
    await updateDoc(doc(db, 'blogPosts', id), {
      status: willBeActive ? 'published' : 'draft'
    });
  };

  const filteredBlogs = blogs.filter(b => 
    (b.title || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      key: 'blog',
      header: 'Blog Article',
      sortKey: 'blog',
      sortValue: (b) => (b.title || '').toLowerCase(),
      render: (b) => (
        <AppEntityCell
          title={b.title || 'Untitled'}
          subtitle={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>By {b.author || 'Admin'}</span>
              <span>• {new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt).toLocaleDateString()}</span>
            </div>
          }
        />
      ),
    },
    {
      key: 'channels',
      header: 'Publication Channels',
      width: '280px',
      render: (b) => (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blog</span>
            <AppStatusToggle
              isActive={b.status === 'published' || b.publishToBlog}
              onToggle={(willBeActive) => {
                updateDoc(doc(db, 'blogPosts', b.id), {
                  status: willBeActive ? 'published' : 'draft',
                  publishToBlog: willBeActive
                });
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LinkedIn</span>
            <AppStatusToggle
              isActive={b.publishToLinkedIn || b.linkedInShared}
              onToggle={(willBeActive) => {
                updateDoc(doc(db, 'blogPosts', b.id), {
                  publishToLinkedIn: willBeActive
                });
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '120px',
      render: (b) => {
        const actions = [
          { type: 'view', onClick: () => window.open(`/blog/${b.slug}`, '_blank') },
          { type: 'delete', onClick: () => handleDelete(b.id) },
        ];
        return <AppActionGroup actions={actions} />;
      },
    }
  ];

  const renderExpandedRow = (b) => {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        margin: '0.5rem 0'
      }}>
        <div>
          <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>SEO Details</h5>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><strong>Slug:</strong> /{b.slug}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><strong>Views:</strong> {b.views || 0}</div>
        </div>
        <div>
          <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Future Channels</h5>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            <span>Facebook (Coming Soon)</span>
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            <span>Instagram (Coming Soon)</span>
          </div>
        </div>
        <div>
          <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tags / Category</h5>
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {(b.tags || ['Health', 'Peptides']).map(t => (
              <span key={t} style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getDaysUntilExpiry = () => {
    if (!linkedInStatus.expiresAt) return 0;
    const diffTime = Math.abs(linkedInStatus.expiresAt - new Date());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={24} color="var(--color-primary)" /> Content & Marketing
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Manage blog articles and social media automation parameters.
          </p>
        </div>
        
        {/* LinkedIn Connection Widget */}
        <div style={{ 
          padding: '1.25rem', 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
          minWidth: '250px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e40af', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Share2 size={16} /> LinkedIn Auto-Poster</span>
          </div>
          {linkedInStatus.connected ? (
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Connected & Verified
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span><strong>Last verification:</strong> {linkedInStatus.updatedAt ? linkedInStatus.updatedAt.toLocaleString() : 'Recent'}</span>
                  <span><strong>Token Status:</strong> Valid ({getDaysUntilExpiry()} days remaining)</span>
                  <span><strong>Auto-renewal:</strong> Active (1st & 15th)</span>
                </div>
                {getDaysUntilExpiry() < 5 && (
                  <button 
                    onClick={handleConnectLinkedIn}
                    disabled={authLoading}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Manually Renew Token
                  </button>
                )}
             </div>
          ) : (
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
               <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                 Connect LinkedIn to automatically publish articles when they change to "Published" status.
               </p>
               <button 
                 onClick={handleConnectLinkedIn}
                 disabled={authLoading}
                 style={{
                   padding: '8px 16px',
                   backgroundColor: '#0a66c2', // LinkedIn blue
                   color: '#fff',
                   border: 'none',
                   borderRadius: '6px',
                   fontSize: '0.85rem',
                   fontWeight: 600,
                   cursor: authLoading ? 'not-allowed' : 'pointer',
                   opacity: authLoading ? 0.7 : 1,
                   alignSelf: 'stretch'
                 }}
               >
                 {authLoading ? 'Connecting...' : 'Connect with LinkedIn'}
               </button>
             </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Blog Articles</h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search blogs..." 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{
                padding: '8px 12px 8px 30px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                width: '250px'
              }}
            />
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading blogs...</div>
        ) : (
          <DataTable 
            data={filteredBlogs}
            columns={columns}
            expandableRender={renderExpandedRow}
          />
        )}
      </div>
    </div>
  );
}
