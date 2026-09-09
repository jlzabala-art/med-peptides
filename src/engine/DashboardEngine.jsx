"use client";

import React, { useState, useEffect } from 'react';
import { WIDGET_REGISTRY, DEFAULT_DOCTOR_CONFIG, DEFAULT_PATIENT_CONFIG, DEFAULT_WHOLESALER_CONFIG, DEFAULT_ADMIN_CONFIG, DEFAULT_CLINIC_CONFIG } from './WidgetRegistry';
import { motion } from 'framer-motion';
import * as fb from '../firebase';
const db = fb?.db;
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';


import DashboardCustomizer from './DashboardCustomizer';
import { Settings, X } from '@/lib/icons';
import PatientCommandHub from '../components/patient/PatientCommandHub';
import SupplierCommandHub from '../components/supplier/SupplierCommandHub';
import WholesalerCommandHub from '../components/wholesaler/WholesalerCommandHub';

export default function DashboardEngine({ role, dataContext }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [config, setConfig] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine default config based on role
  const getDefaultConfig = () => {
    switch(role) {
      case 'admin': return DEFAULT_ADMIN_CONFIG;
      case 'clinic': return DEFAULT_CLINIC_CONFIG;
      case 'doctor': return DEFAULT_DOCTOR_CONFIG;
      case 'patient': return DEFAULT_PATIENT_CONFIG;
      case 'wholesaler': return DEFAULT_WHOLESALER_CONFIG;
      default: return DEFAULT_PATIENT_CONFIG;
    }
  };

  useEffect(() => {
    async function loadConfig() {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let loadedConfig = null;
        if (userSnap.exists() && userSnap.data().dashboardConfig) {
          const userDashboard = userSnap.data().dashboardConfig;
          if (userDashboard[role]) {
            loadedConfig = userDashboard[role];
          } else if (userDashboard.role === role) {
            loadedConfig = userDashboard;
          }
        }

        // If no custom config or missing widgets, fallback to defaults
        if (!loadedConfig) {
          loadedConfig = getDefaultConfig();
        }
        setConfig(loadedConfig);
      } catch (err) {
        console.error("Error loading dashboard config:", err);
        setConfig(getDefaultConfig());
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [user, role]);

  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { dashboardConfig: { [role]: newConfig, role } }, { merge: true });
    } catch (err) {
      console.error("Error saving dashboard config:", err);
    }
  };

  if (loading || !config) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('dashboard.loading', 'Loading workspace...')}</div>;
  }

  const activeWidgets = config.widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Role-Specific Action Command Hub */}
      {role === 'patient' && <PatientCommandHub userId={dataContext?.uid || user?.uid} />}
      {role === 'supplier' && <SupplierCommandHub userId={dataContext?.uid || user?.uid} />}
      {(role === 'wholesaler' || role === 'wholeseller') && (
        <WholesalerCommandHub 
          userId={dataContext?.uid || user?.uid} 
          initialData={dataContext?.initialData} 
        />
      )}

      {/* Customize Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button 
          onClick={() => setIsCustomizing(true)}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.45rem 0.9rem', background: '#ffffff', color: '#475569', 
            border: '1px solid #cbd5e1', borderRadius: '8px', 
            fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <Settings size={15} /> {t('dashboard.customize', 'Customize Layout')}
        </button>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '1.25rem' 
        }}
      >
        {activeWidgets.map(widgetConfig => {
          const WidgetComponent = WIDGET_REGISTRY[widgetConfig.id];
          if (!WidgetComponent) return null;

          // Inject context
          const widgetProps = {};
          if (dataContext) {
            if (widgetConfig.id === 'kpi_overview') widgetProps.metrics = dataContext.metrics;
            if (widgetConfig.id === 'urgent_alerts') widgetProps.alerts = dataContext.alerts;
            if (widgetConfig.id === 'urgent_queue') widgetProps.activities = dataContext.recentActivity;
          }

          const span = widgetConfig.colSpan || 12;

          return (
            <motion.div 
              key={widgetConfig.id} 
              variants={itemVariants}
              style={{ 
                gridColumn: `span ${span}`,
                minWidth: 0 
              }}
              className={`widget-container col-span-${span}`}
            >
              <WidgetComponent {...widgetProps} />
            </motion.div>
          );
        })}

        <style>{`
          @media (max-width: 768px) {
            .widget-container {
              grid-column: span 12 !important;
            }
          }
        `}</style>
      </motion.div>

      {/* Customization Drawer/Modal */}
      {isCustomizing && (
        <DashboardCustomizer 
          currentConfig={config} 
          defaultConfig={getDefaultConfig()}
          onClose={() => setIsCustomizing(false)} 
          onSave={(newConfig) => {
            saveConfig(newConfig);
            setIsCustomizing(false);
          }} 
        />
      )}
    </div>
  );
}