import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { getPrescription, updatePrescription, createPrescription } from '../../services/prescriptionsService';
import { getProtocolById } from '../../services/protocolStorage';
import { generatePrescriptionLines } from '../../engine/protocolMath';
import DosingCalendar from './DosingCalendar';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    async function initNewPrescription() {
      let initialLines = [];
      let pName = '';
      let initialStatus = 'Draft';
      
      if (source === 'Protocol' && searchParams.get('protocol')) {
        const protocolId = searchParams.get('protocol');
        try {
          const protocol = await getProtocolById(protocolId);
          if (protocol) {
            pName = protocol.patient || '';
            initialLines = generatePrescriptionLines(protocol);
            initialStatus = 'AI Generated';
          }
        } catch (e) {
          console.error("Failed to load protocol for prescription", e);
        }
      }

      setPrescription({
        patientName: pName,
        doctorId: '',
        sourceType: source || 'Manual',
        status: initialStatus,
        prescriptionLines: initialLines,
        sourceReferenceId: searchParams.get('protocol') || searchParams.get('items') || null,
      });
      setLoading(false);
    }

    if (isNew) {
      initNewPrescription();
    } else {
      fetchPrescription(id);
    }
  }, [id, isNew, source, searchParams]);

  const fetchPrescription = async (rxId) => {
    try {
      const data = await getPrescription(rxId);
      setPrescription(data);
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (isNew) {
      const newId = await createPrescription(prescription);
      navigate(`/prescriptions/${newId}`);
    } else {
      await updatePrescription(id, prescription);
      // Optional: show toast notification
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!prescription) return <div className="p-8">Prescription not found.</div>;

  const tabs = ['Overview', 'Lines', 'Calendar', 'Protocol', 'Calculations', 'Validation', 'Documents', 'Quotation', 'Audit Trail'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/prescriptions')} className="mr-4 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'New Prescription' : `Prescription ${id.substring(0, 8)}...`}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                {prescription.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                {prescription.sourceType}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {prescription.patientName || 'No patient assigned'} • Dr. {prescription.doctorId || 'Unassigned'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Overview</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input 
                  type="text" 
                  value={prescription.patientName || ''}
                  onChange={(e) => setPrescription({...prescription, patientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                <input 
                  type="text" 
                  value={prescription.doctorId || ''}
                  onChange={(e) => setPrescription({...prescription, doctorId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Goal</label>
                <textarea 
                  value={prescription.treatmentGoal || ''}
                  onChange={(e) => setPrescription({...prescription, treatmentGoal: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Lines' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Prescription Lines</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                + Add Line
              </button>
            </div>
            {prescription.prescriptionLines && prescription.prescriptionLines.length > 0 ? (
              <table className="w-full text-left border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-500">Dosage</th>
                    <th className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-500">Frequency</th>
                    <th className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-500">Duration</th>
                    <th className="px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-500">Qty (Vials)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prescription.prescriptionLines.map((line, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">{line.product_name || line.itemName}</td>
                      <td className="px-4 py-3">{line.dosage || `${line.dose} ${line.doseUnit}`}</td>
                      <td className="px-4 py-3">{line.frequency}</td>
                      <td className="px-4 py-3">{line.duration}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No lines added yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Calendar' && (
          <DosingCalendar prescription={prescription} />
        )}

        {/* Other tabs omitted for brevity, following the prompt logic */}
        {!['Overview', 'Lines', 'Calendar'].includes(activeTab) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab}</h3>
            <p className="text-gray-500">This section is currently under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetail;
