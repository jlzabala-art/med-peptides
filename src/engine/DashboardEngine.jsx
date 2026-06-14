import Settings from "lucide-react/dist/esm/icons/settings";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect } from 'react';
import { WIDGET_REGISTRY, DEFAULT_DOCTOR_CONFIG, DEFAULT_PATIENT_CONFIG, DEFAULT_WHOLESALER_CONFIG, DEFAULT_ADMIN_CONFIG, DEFAULT_CLINIC_CONFIG } from './WidgetRegistry';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';


import DashboardCustomizer from './DashboardCustomizer';

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
          loadedConfig = userSnap.data().dashboardConfig;
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
      await setDoc(doc(db, 'users', user.uid), { dashboardConfig: newConfig }, { merge: true });
    } catch (err) {
      console.error("Error saving dashboard config:", err);
    }
  };

  if (loading || !config) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('dashboard.loading')}</div>;
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
      {/* Customize Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setIsCustomizing(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.5rem 1rem', background: 'white', color: 'var(--color-text-secondary)', 
            border: '1px solid #e2e8f0', borderRadius: '8px', 
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <Settings size={16} /> {t('dashboard.customize')}
        </button>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '2rem' 
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
          @media (max-width: 1300px) {
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