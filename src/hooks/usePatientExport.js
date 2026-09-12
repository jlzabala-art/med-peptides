import { useToast } from './useToast';
import { exportToCSV, triggerServerExport } from '../utils/universalExporter';

export function usePatientExport() {
  const { toast } = useToast();

  const handleBulkExportCSV = async (items = []) => {
    if (!items || items.length === 0) {
      toast('Starting direct database export stream...');
      try {
        await triggerServerExport({ entity: 'patients', format: 'csv' });
        toast.success('Patient registry export completed.');
      } catch (err) {
        toast.error('Failed to export patients: ' + err.message);
      }
      return;
    }

    const columns = [
      { key: 'id', header: 'ID', accessor: p => p.id || p.objectID || '' },
      { key: 'name', header: 'Name', accessor: p => p.name || '' },
      { key: 'age', header: 'Age', accessor: p => p.age || '' },
      { key: 'gender', header: 'Gender', accessor: p => p.gender || '' },
      { key: 'clinic', header: 'Clinic', accessor: p => p.clinic || p.clinicName || '' },
      { key: 'physician', header: 'Physician', accessor: p => p.physician || p.doctorName || '' },
      { key: 'status', header: 'Status', accessor: p => p.status || 'active' },
      { key: 'email', header: 'Email', accessor: p => p.email || '' },
      { key: 'phone', header: 'Phone', accessor: p => p.phone || '' },
    ];

    const filename = `patients_export_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(items, columns, filename);
    toast.success(`Exported ${items.length} patients to CSV.`);
  };

  const handleServerExportCSV = async (filters = {}) => {
    try {
      await triggerServerExport({ entity: 'patients', format: 'csv', ...filters });
      toast.success('Database export initiated successfully.');
    } catch (err) {
      toast.error('Failed to initiate server export: ' + err.message);
    }
  };

  return {
    handleBulkExportCSV,
    handleServerExportCSV
  };
}
