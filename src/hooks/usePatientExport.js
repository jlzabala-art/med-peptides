import { useToast } from './useToast';

export function usePatientExport() {
  const { toast } = useToast();

  const handleBulkExportCSV = (items) => {
    if (!items || !items.length) return;
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Clinic', 'Physician', 'Status'];
    const rows = items.map(p => [
      p.id || p.objectID,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.age || '',
      p.gender || '',
      `"${(p.clinic || '').replace(/"/g, '""')}"`,
      `"${(p.physician || '').replace(/"/g, '""')}"`,
      p.status || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${items.length} patients to CSV.`);
  };

  return {
    handleBulkExportCSV
  };
}
