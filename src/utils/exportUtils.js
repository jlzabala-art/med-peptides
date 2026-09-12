
import { exportToCSV as universalExportToCSV } from './universalExporter';
import { toast } from 'react-hot-toast';

/**
 * Universal CSV Export with Anti-Injection Sanitization & UTF-8 BOM.
 * Compatible with signatures (data, filename, columns) and (data, columns, filename).
 */
export const exportToCSV = (data, filename = 'export.csv', columns = []) => {
  if (!data || data.length === 0) {
    toast('No data to export');
    return;
  }
  universalExportToCSV(data, filename, columns);
};
