import React, { useState, useEffect } from 'react';
import IntakeDashboardHeader from './prescriptions/IntakeDashboardHeader';
import PrescriptionIntakeLayout from './prescriptions/PrescriptionIntakeLayout';
import PrescriptionMobileWizard from './prescriptions/PrescriptionMobileWizard';

export default function AdminPrescriptionIntakeTab() {
  const [isMobile, setIsMobile] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null); // null means showing dashboard list

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <IntakeDashboardHeader />
      
      <div style={{ flex: 1, minHeight: 0 }}>
        {isMobile ? (
          <PrescriptionMobileWizard 
            prescription={activePrescription} 
            onSelect={setActivePrescription} 
          />
        ) : (
          <PrescriptionIntakeLayout 
            prescription={activePrescription} 
            onSelect={setActivePrescription} 
          />
        )}
      </div>
    </div>
  );
}
