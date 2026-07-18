'use client';
import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import { ClinicalProvider } from './ClinicalContext';
import AdminPatientsTab from './AdminPatientsTab';
import AdminPrescriptionIntakeTab from './AdminPrescriptionIntakeTab';
import AdminProtocolsTab from './AdminProtocolsTab';
import AdminProgramsTab from './AdminProgramsTab';
import AdminSupervisionTab from './AdminSupervisionTab';
import AdminClinicalLogsTab from './AdminClinicalLogsTab';
import AdminAssignDoctorTab from './AdminAssignDoctorTab';
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";

export default function AdminClinicalHub() {
  const [activeTab, setActiveTab] = useState('patients');

  const tabs = [
    { id: 'patients', label: 'Patients' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'protocols', label: 'Protocols' },
    { id: 'programs', label: 'Programs' },
    { id: 'supervision', label: 'Supervision' },
    { id: 'logs', label: 'Clinical Logs' },
    { id: 'assign-doctor', label: 'Assign Doctor' },
  ];

  return (
    <ClinicalProvider>
      <div className="space-y-6">
        <PageHeader
          title="Clinical Practice"
          subtitle="Manage patients, prescriptions, protocols, and clinical records"
          icon={Stethoscope}
        />

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200 mt-4">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Render Active Tab */}
        <div className="mt-6">
          {activeTab === 'patients' && <AdminPatientsTab isSubTab={true} />}
          {activeTab === 'prescriptions' && <AdminPrescriptionIntakeTab isSubTab={true} />}
          {activeTab === 'protocols' && <AdminProtocolsTab isSubTab={true} />}
          {activeTab === 'programs' && <AdminProgramsTab isSubTab={true} />}
          {activeTab === 'supervision' && <AdminSupervisionTab isSubTab={true} />}
          {activeTab === 'logs' && <AdminClinicalLogsTab isSubTab={true} />}
          {activeTab === 'assign-doctor' && <AdminAssignDoctorTab isSubTab={true} />}
        </div>
      </div>
    </ClinicalProvider>
  );
}
