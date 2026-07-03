import React from 'react';
import { X, FileText, UploadCloud, Stethoscope, Sparkles, Box, FileEdit } from 'lucide-react';
import { PRESCRIPTION_SOURCES } from '../../schemas/prescriptionSchema';

const SourceSelectorModal = ({ onClose, onSelectSource }) => {
  const sources = [
    {
      id: PRESCRIPTION_SOURCES.FAGRON,
      title: 'Fagron Genomics',
      description: 'Import and extract recommendations from a Fagron Genomics report.',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      id: PRESCRIPTION_SOURCES.UPLOAD,
      title: 'Upload Document',
      description: 'Upload a PDF or image of an existing prescription for OCR extraction.',
      icon: <UploadCloud className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: PRESCRIPTION_SOURCES.AI_REPORT,
      title: 'AI Biomarker Report',
      description: 'Generate recommendations from 24Genomics or Bloodo reports.',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      id: PRESCRIPTION_SOURCES.ITEMS,
      title: 'From Items',
      description: 'Select products directly from the catalog to prescribe.',
      icon: <Box className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      id: PRESCRIPTION_SOURCES.PROTOCOL,
      title: 'From Protocol',
      description: 'Generate a prescription based on a standardized clinical protocol.',
      icon: <Stethoscope className="w-6 h-6 text-teal-600" />,
      color: 'bg-teal-50',
      border: 'border-teal-200'
    },
    {
      id: PRESCRIPTION_SOURCES.MANUAL,
      title: 'Manual Prescription',
      description: 'Create a prescription from scratch manually.',
      icon: <FileEdit className="w-6 h-6 text-gray-600" />,
      color: 'bg-gray-50',
      border: 'border-gray-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Prescription</h2>
            <p className="text-sm text-gray-500 mt-1">Select the source to generate the prescription from.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                className={`flex items-start p-4 text-left border rounded-xl hover:shadow-md transition-all group ${source.border} hover:border-gray-300`}
              >
                <div className={`p-3 rounded-lg ${source.color} group-hover:scale-105 transition-transform mr-4`}>
                  {source.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{source.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{source.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceSelectorModal;
