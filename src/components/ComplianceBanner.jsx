import React from 'react';
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import { useTranslation } from 'react-i18next';

const ComplianceBanner = () => {
  const { t } = useTranslation();
  return (
    <div style={{ backgroundColor: 'var(--color-primary, #0f172a)', padding: '0.75rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 'bold' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0 0.5rem' }}>
            {t('compliance.banner', 'ATTENTION: ALL PRODUCTS ARE STRICTLY FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN CONSUMPTION.')}
          </span>
          <ShieldAlert size={20} />
        </div>
      </div>
    </div>
  );
};

export default ComplianceBanner;
