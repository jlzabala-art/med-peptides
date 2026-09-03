"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useFABStore } from '../../stores/useFABStore';

// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Box, Building2, ShoppingCart, Receipt, CalendarPlus, MessageSquarePlus, GraduationCap, FileText, FilePlus, Zap, Search, Settings, Bot, CheckCircle2 } from '@/lib/icons';
import { useScrollDirection } from '../../hooks/useScrollDirection';

// Context mapping configuration
const getContextConfig = (pathname) => {
  const isMatch = (path) => pathname.includes(path);

  if (isMatch('/admin/products')) {
    return {
      id: 'products',
      theme: '#0ea5e9', // Blue
      icon: <Box size={20} />,
      label: 'Add Product',
      actions: [
        {
          id: 'new_product',
          label: 'Create Product',
          icon: <Box size={16} color="#0ea5e9" />,
          bg: '#e0f2fe',
        },
        {
          id: 'import_products',
          label: 'Import Catalog',
          icon: <FileText size={16} color="#0ea5e9" />,
          bg: '#e0f2fe',
        },
      ],
    };
  }
  if (isMatch('/admin/prescriptions')) {
    return {
      id: 'prescriptions',
      theme: '#e11d48', // Rose
      icon: <FileText size={20} />,
      label: 'New Prescription',
      actions: [
        {
          id: 'new_prescription_manual',
          label: 'Manual Prescription',
          icon: <FileText size={16} color="#e11d48" />,
          bg: '#ffe4e6',
        },
        {
          id: 'import_pdf',
          label: 'Import PDF',
          icon: <FilePlus size={16} color="#e11d48" />,
          bg: '#ffe4e6',
        },
      ],
    };
  }
  if (isMatch('/admin/suppliers')) {
    return {
      id: 'suppliers',
      theme: '#f97316', // Orange
      icon: <Building2 size={20} />,
      label: 'Add Supplier',
      actions: [
        {
          id: 'new_supplier',
          label: 'New Supplier',
          icon: <Building2 size={16} color="#f97316" />,
          bg: '#ffedd5',
        },
        {
          id: 'request_rfq',
          label: 'Request RFQ',
          icon: <FileText size={16} color="#f97316" />,
          bg: '#ffedd5',
        },
      ],
    };
  }
  if (isMatch('/admin/sales') || isMatch('/admin/orders')) {
    return {
      id: 'sales',
      theme: '#10b981', // Green
      icon: <ShoppingCart size={20} />,
      label: 'Create Order',
      actions: [
        {
          id: 'new_order',
          label: 'New Order',
          icon: <ShoppingCart size={16} color="#10b981" />,
          bg: '#d1fae5',
        },
        {
          id: 'create_quote',
          label: 'Create Quote',
          icon: <FileText size={16} color="#10b981" />,
          bg: '#d1fae5',
        },
      ],
    };
  }
  if (isMatch('/admin/invoices') || isMatch('/admin/billing')) {
    return {
      id: 'invoices',
      theme: '#8b5cf6', // Purple
      icon: <Receipt size={20} />,
      label: 'New Invoice',
      actions: [
        {
          id: 'new_invoice',
          label: 'Create Invoice',
          icon: <Receipt size={16} color="#8b5cf6" />,
          bg: '#ede9fe',
        },
      ],
    };
  }
  if (isMatch('/admin/calendar')) {
    return {
      id: 'calendar',
      theme: '#14b8a6', // Teal
      icon: <CalendarPlus size={20} />,
      label: 'New Appointment',
      actions: [
        {
          id: 'new_appt',
          label: 'Schedule Consult',
          icon: <CalendarPlus size={16} color="#14b8a6" />,
          bg: '#ccfbf1',
        },
      ],
    };
  }
  if (isMatch('/admin/messages')) {
    return {
      id: 'messages',
      theme: '#6366f1', // Indigo
      icon: <MessageSquarePlus size={20} />,
      label: 'New Message',
      actions: [
        {
          id: 'new_msg',
          label: 'Start Chat',
          icon: <MessageSquarePlus size={16} color="#6366f1" />,
          bg: '#e0e7ff',
        },
      ],
    };
  }
  if (isMatch('/admin/academy')) {
    return {
      id: 'academy',
      theme: '#eab308', // Yellow
      icon: <GraduationCap size={20} />,
      label: 'New Course',
      actions: [
        {
          id: 'new_course',
          label: 'Create Course',
          icon: <GraduationCap size={16} color="#eab308" />,
          bg: '#fef08a',
        },
      ],
    };
  }

  if (isMatch('/admin/command-center') || isMatch('/admin/dashboard')) {
    return {
      id: 'dashboard',
      theme: '#4f46e5', // Indigo for Atlas
      icon: <Zap size={20} />,
      label: 'Ask Atlas',
      actions: [
        {
          id: 'ask_atlas',
          label: 'Ask Atlas',
          icon: <Zap size={16} color="#4f46e5" />,
          bg: '#e0e7ff',
        },
        {
          id: 'create_task',
          label: 'Create Task',
          icon: <FileText size={16} color="#4f46e5" />,
          bg: '#e0e7ff',
        },
        {
          id: 'create_reminder',
          label: 'Create Reminder',
          icon: <CalendarPlus size={16} color="#4f46e5" />,
          bg: '#e0e7ff',
        },
        {
          id: 'create_approval',
          label: 'Create Approval',
          icon: <CheckCircle2 size={16} color="#4f46e5" />,
          bg: '#e0e7ff',
        },
      ],
    };
  }

  if (
    isMatch('/admin/physicians') ||
    isMatch('/admin/account-managers') ||
    isMatch('/admin/users')
  ) {
    return {
      id: 'users',
      theme: '#0284c7', // Sky
      icon: <Plus size={20} />,
      label: 'User Actions',
      actions: [
        {
          id: 'invite_whatsapp',
          label: 'Invite Practitioner (WhatsApp)',
          icon: <MessageSquarePlus size={16} color="#16a34a" />,
          bg: '#dcfce7',
        },
        {
          id: 'ai_scribe',
          label: 'AI Clinical Scribe',
          icon: <Zap size={16} color="#0d9488" />,
          bg: '#ccfbf1',
        },
        {
          id: 'open_workspace',
          label: 'Workspace Buffer & Quotes',
          icon: <ShoppingCart size={16} color="#0284c7" />,
          bg: '#e0f2fe',
        },
        {
          id: 'new_user',
          label: 'Create User Profile',
          icon: <Plus size={16} color="#0284c7" />,
          bg: '#e0f2fe',
        },
      ],
    };
  }

  // Generic Admin Fallback (always provide 4 thumb actions)
  if (isMatch('/admin')) {
    return {
      id: 'admin_general',
      theme: '#003666',
      icon: <Zap size={20} />,
      label: 'Quick Actions',
      actions: [
        {
          id: 'ai_scribe',
          label: 'AI Clinical Scribe',
          icon: <Zap size={16} color="#0d9488" />,
          bg: '#ccfbf1',
        },
        {
          id: 'invite_whatsapp',
          label: 'Invite Practitioner (WhatsApp)',
          icon: <MessageSquarePlus size={16} color="#16a34a" />,
          bg: '#dcfce7',
        },
        {
          id: 'open_workspace',
          label: 'Workspace Buffer & Quotes',
          icon: <ShoppingCart size={16} color="#0284c7" />,
          bg: '#e0f2fe',
        },
        {
          id: 'ask_atlas',
          label: 'Ask Atlas AI Copilot',
          icon: <Bot size={16} color="#7c3aed" />,
          bg: '#f3e8ff',
        },
      ],
    };
  }

  if (isMatch('/doctor')) {
    return {
      id: 'doctor',
      theme: '#0d9488',
      icon: <Plus size={20} />,
      label: 'Clinical Actions',
      actions: [
        {
          id: 'new_prescription_manual',
          label: 'New Prescription',
          icon: <FilePlus size={16} color="#0d9488" />,
          bg: '#ccfbf1',
        },
        {
          id: 'ai_scribe',
          label: 'AI Clinical Scribe',
          icon: <Zap size={16} color="#0d9488" />,
          bg: '#ccfbf1',
        },
        {
          id: 'ask_atlas',
          label: 'Clinical Intelligence',
          icon: <Bot size={16} color="#0d9488" />,
          bg: '#ccfbf1',
        },
      ],
    };
  }

  if (isMatch('/patient')) {
    return {
      id: 'patient',
      theme: '#7c3aed',
      icon: <Zap size={20} />,
      label: 'Patient Care',
      actions: [
        {
          id: 'new_order',
          label: '1-Click Refill',
          icon: <ShoppingCart size={16} color="#7c3aed" />,
          bg: '#ede9fe',
        },
        {
          id: 'ask_atlas',
          label: 'Ask Protocol AI',
          icon: <Bot size={16} color="#7c3aed" />,
          bg: '#ede9fe',
        },
      ],
    };
  }

  if (isMatch('/wholesaler')) {
    return {
      id: 'wholesaler',
      theme: '#c2410c',
      icon: <ShoppingCart size={20} />,
      label: 'Wholesale Actions',
      actions: [
        {
          id: 'new_order',
          label: 'New Bulk Order',
          icon: <ShoppingCart size={16} color="#c2410c" />,
          bg: '#ffedd5',
        },
        {
          id: 'create_quote',
          label: 'New B2B Quote',
          icon: <FileText size={16} color="#c2410c" />,
          bg: '#ffedd5',
        },
      ],
    };
  }

  if (isMatch('/supplier')) {
    return {
      id: 'supplier',
      theme: '#0284c7',
      icon: <Box size={20} />,
      label: 'Supplier Actions',
      actions: [
        {
          id: 'new_product',
          label: 'Add API Batch',
          icon: <Box size={16} color="#0284c7" />,
          bg: '#e0f2fe',
        },
        {
          id: 'request_rfq',
          label: 'Respond to RFQs',
          icon: <FileText size={16} color="#0284c7" />,
          bg: '#e0f2fe',
        },
      ],
    };
  }

  // B2C Guest / Default
  if (pathname === '/' || pathname.startsWith('/product') || pathname.startsWith('/collection')) {
    return {
      id: 'b2c_copilot',
      theme: '#1a73e8', // AI Blue
      icon: <Bot size={20} />,
      label: 'AI Copilot',
      actions: [
        {
          id: 'open_ai_copilot',
          label: 'Ask Clinical AI',
          icon: <Bot size={16} color="#1a73e8" />,
          bg: '#e8f0fe',
        },
        {
          id: 'open_personalization',
          label: 'Refine Profile',
          icon: <Settings size={16} color="#1a73e8" />,
          bg: '#e8f0fe',
        },
      ],
    };
  }
  return null;
}

export default function ContextualFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAtTop, scrollDirection } = useScrollDirection();
  const [isMobile, setIsMobile] = useState(false);
  const setFabConfig = useFABStore((state) => state.setFabConfig);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = getContextConfig(pathname);

  // Sync to global store for PageHeader (Desktop)
  useEffect(() => {
    setFabConfig(config);
    setIsOpen(false);
  }, [pathname, setFabConfig]); // config depends on pathname

  const showLabel = !isMobile || isAtTop || scrollDirection === 'up';

  if (!config) return null;

  const handleActionClick = (actionId) => {
    setIsOpen(false);
    console.log(`[FAB Action Clicked] ${actionId}`);

    if (actionId === 'ai_scribe') {
      window.dispatchEvent(new CustomEvent('OPEN_AI_CLINICAL_SCRIBE'));
    } else if (actionId === 'invite_whatsapp') {
      window.dispatchEvent(new CustomEvent('OPEN_INVITE_USER_MODAL'));
    } else if (actionId === 'open_workspace') {
      window.dispatchEvent(new CustomEvent('open-cart'));
    } else if (actionId === 'new_user') {
      router.push('/admin/physicians?action=new');
    } else if (actionId === 'new_product') {
      router.push('/admin/master-catalog?action=new');
    } else if (actionId === 'new_supplier') {
      router.push('/admin/suppliers?action=new');
    } else if (actionId === 'new_msg') {
      window.dispatchEvent(new Event('open-compose-menu'));
    } else if (actionId === 'quick_action' || actionId === 'search') {
      window.dispatchEvent(new Event('OPEN_COMMAND_PALETTE'));
    } else if (actionId === 'ask_atlas') {
      window.dispatchEvent(new CustomEvent('ATLAS_PREFILL_QUERY', { detail: { query: '' } }));
    } else if (actionId === 'create_task') {
      window.dispatchEvent(new CustomEvent('OPEN_COMMAND_PALETTE'));
    }
  };

  // Hide the default FAB entirely on protocols page
  if (pathname.includes('/admin/protocols')) {
    return null;
  }

  // Hide on Desktop (Desktop uses PageHeader instead)
  if (!isMobile) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Drawer for Mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#fff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 16px',
              zIndex: 9999,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{
              width: '40px',
              height: '4px',
              background: '#e2e8f0',
              borderRadius: '2px',
              margin: '0 auto 20px',
            }} />
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#1e293b' }}>
              {config.label}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '16px',
                    border: 'none',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ background: action.bg, padding: '8px', borderRadius: '50%', display: 'flex' }}>
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <motion.button
          layout
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: config.theme,
            color: 'white',
            border: 'none',
            borderRadius: '28px',
            padding: showLabel ? '0 20px' : '0',
            height: '56px',
            width: showLabel ? 'auto' : '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Plus size={24} />
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
