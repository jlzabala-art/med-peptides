import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, HelpCircle, User, Bot, X } from 'lucide-react';
import ClinicalAssistant from '../shared/ClinicalAssistant';
import SidebarGadget from '../shared/AppSidebar/SidebarGadget';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import CommandPalette from '../CommandPalette';

/**
 * PortalLayout - The universal layout wrapper for all private portals
 * Mimics Google Cloud Console layout (Left Sidebar + Topbar + Main Area + Right AI Drawer)
 */
export default function PortalLayout({ 
  children, 
  sidebarNavGroups = [], 
  activeNavId, 
  onNavigate,
  portalTitle = 'Cloud Console',
  roleContext = 'patient',
  pageContext = null,
  headerActions
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAiOpen, setAiOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // Holds live data injected by admin tab components via 'admin-context-update' events
  const [enrichedContext, setEnrichedContext] = useState(null);
  
  // Real-time attention notifications state
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  
  // Command Palette
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real-time attention alerts (doctors pending, orders pending, low stock products)
  useEffect(() => {
    if (roleContext !== 'admin') return;

    // 1. Doctors pending verification
    const qDocs = query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false));
    const unsubscribeDocs = onSnapshot(qDocs, (snap) => {
      const docsPending = snap.docs.map(doc => ({
        id: doc.id,
        type: 'VERIFICATION',
        title: `Médico pendiente: ${doc.data().fullName || doc.data().displayName || 'Profesional'}`,
        description: 'Requiere revisión de credenciales y aprobación de cuenta.',
        severity: 'critical',
        timeLabel: 'Nuevo',
        actionPath: '/admin/doctors'
      }));

      // 2. Orders pending dispatch
      const qOrders = query(collection(db, 'orders'), where('status', '==', 'pending'));
      const unsubscribeOrders = onSnapshot(qOrders, (snapOrders) => {
        const ordersPending = snapOrders.docs.map(doc => ({
          id: doc.id,
          type: 'ORDER',
          title: `Pedido Pendiente #${doc.id.slice(0, 6)}`,
          description: `Total: $${doc.data().total || doc.data().amount || 0} - En espera de validación de pago.`,
          severity: 'warning',
          timeLabel: '24h',
          actionPath: '/admin/orders'
        }));

        // 3. Low stock products (e.g. less than 10 vials/units)
        const qProducts = query(collection(db, 'products'), where('status', '==', 'active'));
        const unsubscribeProducts = onSnapshot(qProducts, (snapProducts) => {
          const lowStock = [];
          snapProducts.docs.forEach(doc => {
            const data = doc.data();
            const variants = data.variants || [];
            variants.forEach((v, index) => {
              const stock = v.stock ?? v.quantity ?? 100;
              if (stock <= 10) {
                lowStock.push({
                  id: `${doc.id}_${index}`,
                  type: 'STOCK',
                  title: `Stock Bajo: ${data.displayName || data.name}`,
                  description: `Quedan solo ${stock} unidades de este producto en inventario.`,
                  severity: 'critical',
                  timeLabel: 'Urgente',
                  actionPath: '/admin/products'
                });
              }
            });
          });

          // Merge all attention alerts
          setNotifications([...docsPending, ...ordersPending, ...lowStock]);
        });

        return () => unsubscribeProducts();
      });

      return () => unsubscribeOrders();
    });

    return () => {
      unsubscribeDocs();
    };
  }, [roleContext]);

  // Listen for context enrichment events from any admin tab
  useEffect(() => {
    const handleContextUpdate = (e) => {
      if (e?.detail) {
        setEnrichedContext(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('admin-context-update', handleContextUpdate);
    return () => window.removeEventListener('admin-context-update', handleContextUpdate);
  }, []);

  // Reset enrichedContext when the active tab/page changes
  useEffect(() => {
    setEnrichedContext(null);
  }, [pageContext?.activeTab]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setAiOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-app)' }}>
      
      {/* TOPBAR */}
      <header style={{ 
        height: '60px', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50,
        color: 'var(--color-text-primary)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Menu"
            >
              <Menu size={20} color="var(--color-text-primary)" />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-primary)', letterSpacing: '-0.3px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {portalTitle}
          </div>
        </div>

        {/* Center - Global Search (Optional) */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search everything... (Cmd+K)" 
                onClick={() => setPaletteOpen(true)}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.8rem',
                  borderRadius: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headerActions}
          <button onClick={() => setAiOpen(!isAiOpen)} style={iconBtnStyle} title="Toggle Atlas AI">
            <Bot size={20} color={isAiOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
          </button>
          <button style={iconBtnStyle} title="Help"><HelpCircle size={20} color="var(--color-text-secondary)" /></button>
          
          {/* Notifications Dropdown (GCP Attention Style) */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setNotificationsOpen(!isNotificationsOpen)} 
              style={{
                ...iconBtnStyle,
                position: 'relative',
                backgroundColor: isNotificationsOpen ? 'rgba(26,115,232,0.1)' : 'rgba(255,255,255,0.5)',
                borderColor: isNotificationsOpen ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)'
              }} 
              title="Alertas de Atención"
            >
              <Bell size={20} color={notifications.length > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--color-text-secondary)'} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Attention Items</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{notifications.length} pending</span>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      ✨ No items require attention.
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (n.actionPath) onNavigate(n.actionPath);
                          setNotificationsOpen(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: idx < notifications.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: n.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            backgroundColor: n.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {n.type}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{n.timeLabel}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, marginTop: '3px' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.description}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginLeft: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(var(--color-primary-rgb), 0.3)'
          }}>
            U
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR GADGET */}
        <SidebarGadget 
          groups={sidebarNavGroups}
          activeId={activeNavId}
          onNavigate={onNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          header={{ title: '', subtitle: '' }} // Let PortalLayout topbar handle branding
          prefsKey={`${roleContext}_sidebar`}
        />

        {/* CENTER CONTENT */}
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          backgroundColor: 'var(--color-bg-app)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>

        {isAiOpen && (
          <aside style={{
            width: isMobile ? '100%' : '300px',
            position: isMobile ? 'absolute' : 'relative',
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'var(--color-bg-surface)',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: isMobile ? 60 : 40,
            boxShadow: isMobile ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none'
          }}>
            {isMobile && (
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={18} /> Atlas AI
                </span>
                <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none' }}><X size={20} /></button>
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ClinicalAssistant 
                embedded={true} 
                isOpen={true} 
                setIsOpen={() => setAiOpen(false)} 
                pageContext={enrichedContext ? { ...pageContext, ...enrichedContext } : pageContext} 
                contextMode={roleContext} 
              />
            </div>
          </aside>
        )}
      </div>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.5)',
  border: '1px solid rgba(0,0,0,0.05)',
  padding: '0.5rem',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};
