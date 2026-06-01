import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, HelpCircle, User, Bot, X, Sparkles } from 'lucide-react';
import ClinicalAssistant from '../shared/ClinicalAssistant';
import SidebarGadget from '../shared/AppSidebar/SidebarGadget';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import CommandPalette from '../CommandPalette';
import useSessionTracking from '../../hooks/useSessionTracking';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import AvatarGenerator from './AvatarGenerator';

// ── Atlas AI — Suggested Prompts per Role ──────────────────────────────────────
const ROLE_SUGGESTED_PROMPTS = {
  admin: [
    { label: '🔄 Sync catalog with Zoho' },
    { label: '🛠️ Check SKU Sync errors' },
    { label: '📦 Unprocessed orders today' },
    { label: '⚠️ Low stock alerts' },
    { label: '💰 Summarize accounts receivable (AR)' },
    { label: '📉 Project net income based on sales' }
  ],
  doctor: [
    { label: '💉 Protocolo para pérdida de peso' },
    { label: '🔬 Evidencia clínica BPC-157' },
    { label: '💊 Interacciones: Semaglutide + Metformina' },
    { label: '📋 Redactar nota clínica' },
    { label: '⚖️ Dosis ajustada por peso para Tirzepatide' },
  ],
  patient: [
    { label: '💬 Explícame mi protocolo actual' },
    { label: '📅 ¿Qué esperar en semana 2 con BPC-157?' },
    { label: '🩺 Tuve rojez en el sitio — ¿es normal?' },
    { label: '⏰ Recordatorio de adherencia' },
    { label: '📈 ¿Cómo mido mi progreso?' },
  ],
  wholesaler: [
    { label: '📦 ¿Qué péptidos tienen más demanda?' },
    { label: '💰 Optimizar márgenes con estos costos' },
    { label: '🗺️ Análisis de territorio para Madrid' },
    { label: '📜 Regulación Semaglutide en España' },
    { label: '🤝 Presentación para nueva clínica' },
  ],
  compounding_pharmacy: [
    { label: '⚗️ Formulación BPC-157 200mcg/ml × 5ml' },
    { label: '🛒 Sourcing API CJC-1295 con DAC' },
    { label: '🧊 Estabilidad Semax a 4°C vs -20°C' },
    { label: '✅ ¿Cumple mi proceso con GMP España?' },
    { label: '💵 Precio de formulación desde API a €X/g' },
  ],
  supplier: [
    { label: '📄 Generar ficha técnica de API' },
    { label: '📊 Forecast demanda Q3' },
    { label: '🤝 Propuesta B2B para nuevo wholesaler' },
    { label: '📋 Documentación para exportar a México' },
    { label: '🔬 Interpretar Certificate of Analysis' },
  ],
};

const ROLE_AGENT_TYPE = {
  admin: 'admin_operations',
  doctor: 'clinical_decision',
  patient: 'wellness_companion',
  wholesaler: 'b2b_optimizer',
  compounding_pharmacy: 'formulation_expert',
  supplier: 'api_catalog_expert',
};

/**
 * PortalLayout - The universal layout wrapper for all private portals
 * Mimics Google Cloud Console layout (Left Sidebar + Topbar + Main Area + Right AI Drawer)
 */
export default function PortalLayout({ 
  children, 
  sidebarNavGroups = [], 
  sidebarPinnedItems = [],
  activeNavId, 
  onNavigate,
  portalTitle = 'Cloud Console',
  roleContext = 'patient',
  pageContext = null,
  headerActions
}) {
  useSessionTracking(); // Start tracking session for the current user
  const routerNavigate = useNavigate();
  const { user, userProfile } = useAuth();

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

  // Fetch real-time attention alerts (all 10 sources)
  useEffect(() => {
    if (roleContext !== 'admin') return;

    const unsubscribes = [];
    const stateMap = new Map();

    const updateState = (type, items) => {
      stateMap.set(type, items);
      const allItems = Array.from(stateMap.values()).flat();
      setNotifications(allItems);
    };

    // 1. Doctors pending verification
    unsubscribes.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false)), (snap) => {
      updateState('VERIFICATION', snap.docs.map(d => ({ id: d.id, type: 'VERIFICATION', title: `Médico pendiente: ${d.data().fullName || 'Profesional'}`, description: 'Requiere revisión.', severity: 'critical', actionPath: `doctors?search=${encodeURIComponent(d.data().fullName || d.id)}` })));
    }));

    // 2. Orders pending dispatch
    unsubscribes.push(onSnapshot(query(collection(db, 'orders'), where('status', '==', 'pending')), (snap) => {
      updateState('ORDER', snap.docs.map(d => ({ id: d.id, type: 'ORDER', title: `Pedido #${d.id.slice(0, 6)}`, description: `Esperando validación.`, severity: 'warning', actionPath: `orders?orderId=${d.id}` })));
    }));

    // 3. Low stock products
    unsubscribes.push(onSnapshot(query(collection(db, 'products'), where('status', '==', 'active')), (snap) => {
      const lowStock = [];
      snap.docs.forEach(doc => {
        const data = doc.data();
        (Array.isArray(data.variants) ? data.variants : []).forEach((v, index) => {
          if ((v?.stock ?? v?.quantity ?? 100) <= 10) {
            lowStock.push({ id: `${doc.id}_${index}`, type: 'STOCK', title: `Stock Bajo: ${data.displayName || data.name}`, description: `Quedan ${v?.stock ?? v?.quantity ?? 0} unidades.`, severity: 'critical', actionPath: `stock?search=${encodeURIComponent(data.displayName || data.name || '')}` });
          }
        });
      });
      updateState('STOCK', lowStock);
    }));

    // 4. Leads new
    unsubscribes.push(onSnapshot(query(collection(db, 'leads'), where('status', '==', 'new')), (snap) => {
      updateState('LEAD', snap.docs.map(d => ({ id: d.id, type: 'LEAD', title: `Nuevo Lead: ${d.data().name || d.data().email || d.id}`, description: 'Lead sin contactar.', severity: 'warning', actionPath: `leads?search=${d.id}` })));
    }));

    // 5. Invitations pending
    unsubscribes.push(onSnapshot(query(collection(db, 'invitations'), where('status', '==', 'pending')), (snap) => {
      updateState('INVITE', snap.docs.map(d => ({ id: d.id, type: 'INVITE', title: `Invitación Pdte: ${d.data().email}`, description: 'Sin aceptar aún.', severity: 'info', actionPath: `invitations?search=${encodeURIComponent(d.data().email || '')}` })));
    }));

    // 6. Agency RFQs
    unsubscribes.push(onSnapshot(query(collection(db, 'agency_rfqs'), where('status', 'in', ['NEW', 'PENDING_REVIEW'])), (snap) => {
      updateState('RFQ', snap.docs.map(d => ({ id: d.id, type: 'RFQ', title: `Nuevo RFQ B2B`, description: `RFQ de agencia pendiente.`, severity: 'critical', actionPath: `agency-deals?rfqId=${d.id}` })));
    }));

    // 7. Bulk orders pending
    unsubscribes.push(onSnapshot(query(collection(db, 'bulk_orders'), where('status', '==', 'pending_admin_approval')), (snap) => {
      updateState('BULK', snap.docs.map(d => ({ id: d.id, type: 'BULK', title: `Pedido B2B: ${d.id.slice(0,6)}`, description: 'Requiere aprobación.', severity: 'warning', actionPath: `bulk-orders?search=${d.id}` })));
    }));

    // 8. SKU Mappings pending
    unsubscribes.push(onSnapshot(query(collection(db, 'sku_mappings'), where('status', '==', 'pending')), (snap) => {
      updateState('SKU', snap.docs.map(d => ({ id: d.id, type: 'SKU', title: `SKU Sync: ${d.data().firebase_sku}`, description: 'Mapeo pendiente.', severity: 'info', actionPath: `sku-sync?search=${encodeURIComponent(d.data().firebase_sku || '')}` })));
    }));

    // 9. Wholesalers pending
    unsubscribes.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'wholesaler'), where('approved', '==', false)), (snap) => {
      updateState('WHOLESALER', snap.docs.map(d => ({ id: d.id, type: 'WHOLESALER', title: `Mayorista Pdte: ${d.data().fullName || 'Usuario'}`, description: 'Requiere aprobación.', severity: 'critical', actionPath: `wholesellers?search=${encodeURIComponent(d.data().fullName || d.id)}` })));
    }));

    // 10. Failed payments
    unsubscribes.push(onSnapshot(query(collection(db, 'orders'), where('status', '==', 'payment_failed')), (snap) => {
      updateState('PAYMENT', snap.docs.map(d => ({ id: d.id, type: 'PAYMENT', title: `Failed Payment: #${d.id.slice(0,6)}`, description: 'Review order details.', severity: 'critical', actionPath: `orders?orderId=${d.id}` })));
    }));

    // 11. High Value Orders (>= 1000)
    unsubscribes.push(onSnapshot(query(collection(db, 'orders'), where('status', '==', 'pending'), where('total', '>=', 1000)), (snap) => {
      updateState('HIGH_VALUE', snap.docs.map(d => ({ id: d.id, type: 'HIGH_VALUE', title: `High Value Order: #${d.id.slice(0,6)}`, description: `Total: $${d.data().total}. Requires attention.`, severity: 'critical', actionPath: `orders?orderId=${d.id}` })));
    }));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [roleContext]);

  // Derived state: Filter out read notifications and sort
  const readIds = userProfile?.read_notifications || [];
  const visibleNotifications = notifications
    .filter(n => !readIds.includes(n.id))
    .sort((a, b) => {
      const severityScore = { critical: 3, warning: 2, info: 1 };
      return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    });

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(id)
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    if (!user || visibleNotifications.length === 0) return;
    try {
      const allIds = visibleNotifications.map(n => n.id);
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(...allIds)
      });
      setNotificationsOpen(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

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

  const siriAnimation = `
    @keyframes siriGlow {
      0%, 100% { box-shadow: 0 0 10px 2px rgba(168, 85, 247, 0.4); transform: scale(1); }
      50% { box-shadow: 0 0 25px 6px rgba(168, 85, 247, 0.8); transform: scale(1.08); }
    }
    @keyframes siriGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-app)' }}>
      <style>{siriAnimation}</style>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/logo-icon-only.png" 
              alt="Atlas Health" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }} 
            />
            {portalTitle && (
              <>
                <span style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 300 }}>|</span>
                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-secondary)', letterSpacing: '-0.2px' }}>
                  {portalTitle}
                </span>
              </>
            )}
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
          <button 
            onClick={() => setAiOpen(!isAiOpen)} 
            style={iconBtnStyle} 
            title="Ask Atlas AI"
          >
            <Sparkles size={20} color={isAiOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
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
              <Bell size={20} color={visibleNotifications.length > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--color-text-secondary)'} />
              {visibleNotifications.length > 0 && (
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
                  {visibleNotifications.length}
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{visibleNotifications.length} pending</span>
                    {visibleNotifications.length > 0 && (
                      <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Mark all read</button>
                    )}
                  </div>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {visibleNotifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      ✨ No items require attention.
                    </div>
                  ) : (
                    visibleNotifications.slice(0, 15).map((n, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (n.actionPath) {
                            // If path contains query string, navigate to /admin/<tab>?query
                            const [tabPart, queryPart] = n.actionPath.split('?');
                            const fullPath = `/admin/${tabPart}${queryPart ? '?' + queryPart : ''}`;
                            routerNavigate(fullPath);
                          }
                          setNotificationsOpen(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: idx < Math.min(visibleNotifications.length, 15) - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
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

          <div style={{ marginLeft: '0.75rem' }}>
            <AvatarGenerator 
              name={userProfile?.fullName || userProfile?.displayName}
              email={userProfile?.email || user?.email}
              size={36}
              onClick={() => routerNavigate(`/${roleContext}/my-profile`)}
            />
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR GADGET */}
        <SidebarGadget 
          groups={sidebarNavGroups}
          pinnedItems={sidebarPinnedItems}
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
                agentType={ROLE_AGENT_TYPE[roleContext] || 'default'}
                suggestedPrompts={ROLE_SUGGESTED_PROMPTS[roleContext] || []}
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
