import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, Box, Building2, ShoppingCart, Receipt, CalendarPlus, 
  MessageSquarePlus, GraduationCap, FileText, Zap, Search, Settings
} from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';

// Context mapping configuration
const getContextConfig = (pathname) => {
  const isMatch = (path) => pathname.includes(path);
  
  if (isMatch('/admin/products') || isMatch('/admin/variants')) {
    return {
      id: 'products',
      theme: '#0ea5e9', // Blue
      icon: <Box size={20} />,
      label: 'Add Product',
      actions: [
        { id: 'new_product', label: 'Create Product', icon: <Box size={16} color="#0ea5e9" />, bg: '#e0f2fe' },
        { id: 'import_products', label: 'Import Catalog', icon: <FileText size={16} color="#0ea5e9" />, bg: '#e0f2fe' },
      ]
    };
  }
  if (isMatch('/admin/suppliers')) {
    return {
      id: 'suppliers',
      theme: '#f97316', // Orange
      icon: <Building2 size={20} />,
      label: 'Add Supplier',
      actions: [
        { id: 'new_supplier', label: 'New Supplier', icon: <Building2 size={16} color="#f97316" />, bg: '#ffedd5' },
        { id: 'request_rfq', label: 'Request RFQ', icon: <FileText size={16} color="#f97316" />, bg: '#ffedd5' },
      ]
    };
  }
  if (isMatch('/admin/sales') || isMatch('/admin/orders')) {
    return {
      id: 'sales',
      theme: '#10b981', // Green
      icon: <ShoppingCart size={20} />,
      label: 'Create Order',
      actions: [
        { id: 'new_order', label: 'New Order', icon: <ShoppingCart size={16} color="#10b981" />, bg: '#d1fae5' },
        { id: 'create_quote', label: 'Create Quote', icon: <FileText size={16} color="#10b981" />, bg: '#d1fae5' },
      ]
    };
  }
  if (isMatch('/admin/invoices') || isMatch('/admin/billing')) {
    return {
      id: 'invoices',
      theme: '#8b5cf6', // Purple
      icon: <Receipt size={20} />,
      label: 'New Invoice',
      actions: [
        { id: 'new_invoice', label: 'Create Invoice', icon: <Receipt size={16} color="#8b5cf6" />, bg: '#ede9fe' },
      ]
    };
  }
  if (isMatch('/admin/calendar')) {
    return {
      id: 'calendar',
      theme: '#14b8a6', // Teal
      icon: <CalendarPlus size={20} />,
      label: 'New Appointment',
      actions: [
        { id: 'new_appt', label: 'Schedule Consult', icon: <CalendarPlus size={16} color="#14b8a6" />, bg: '#ccfbf1' },
      ]
    };
  }
  if (isMatch('/admin/messages')) {
    return {
      id: 'messages',
      theme: '#6366f1', // Indigo
      icon: <MessageSquarePlus size={20} />,
      label: 'New Message',
      actions: [
        { id: 'new_msg', label: 'Start Chat', icon: <MessageSquarePlus size={16} color="#6366f1" />, bg: '#e0e7ff' },
      ]
    };
  }
  if (isMatch('/admin/academy')) {
    return {
      id: 'academy',
      theme: '#eab308', // Yellow
      icon: <GraduationCap size={20} />,
      label: 'New Course',
      actions: [
        { id: 'new_course', label: 'Create Course', icon: <GraduationCap size={16} color="#eab308" />, bg: '#fef08a' },
      ]
    };
  }

  // Default Fallback
  return {
    id: 'default',
    theme: '#0f172a', // Slate 900
    icon: <Plus size={20} />,
    label: 'New Action',
    actions: [
      { id: 'quick_action', label: 'Quick Command', icon: <Zap size={16} color="#8b5cf6" />, bg: '#f5f3ff' },
      { id: 'search', label: 'Global Search', icon: <Search size={16} color="#0ea5e9" />, bg: '#e0f2fe' }
    ]
  };
};

export default function ContextualFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAtTop, scrollDirection } = useScrollDirection();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close speed dial when navigating or scrolling
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, scrollDirection]);

  // Do not render anything on Desktop
  if (!isMobile) return null;

  const config = getContextConfig(location.pathname);
  const showLabel = isAtTop || scrollDirection === 'up';

  const handleActionClick = (actionId) => {
    setIsOpen(false);
    console.log(`[FAB Action Clicked] ${actionId}`);
    // Fallback simple routing if needed
    // if (actionId === 'new_product') navigate('/admin/products?new=true');
  };

  return (
    <>
      {/* Dim overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 9998, backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', right: '16px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        
        {/* Speed Dial Actions */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}
            >
              {config.actions.map((action, idx) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleActionClick(action.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#fff', border: 'none', borderRadius: '24px',
                    padding: '8px 16px', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                    {action.label}
                  </span>
                  <div style={{ background: action.bg, padding: '8px', borderRadius: '50%', display: 'flex' }}>
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary FAB Button */}
        <motion.button
          layout
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: config.theme, color: 'white', border: 'none',
            borderRadius: '28px', padding: showLabel ? '0 20px' : '0',
            height: '56px', width: showLabel ? 'auto' : '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            overflow: 'hidden', whiteSpace: 'nowrap'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
            {isOpen ? <Plus size={24} /> : config.icon}
          </motion.div>
          
          <AnimatePresence mode="popLayout">
            {showLabel && !isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontWeight: 600, fontSize: '15px' }}
              >
                {config.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>
    </>
  );
}
