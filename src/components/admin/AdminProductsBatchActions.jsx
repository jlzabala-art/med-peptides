import React from 'react';
import { ShoppingCart, ClipboardList, XCircle, Download, Percent, BookOpen, Eye } from '@/lib/icons';

export default function AdminProductsBatchActions({
  selectedIds,
  readOnly,
  bulkMode,
  onAddToBulkOrder,
  onCreatePrescription,
  onDeactivateSelected,
  onExportCSV,
  onToggleBulkMode,
  onOpenCatalogSelect,
}) {
  return (
    <>
      <button
        onClick={() => onAddToBulkOrder(selectedIds)}
        className="btn btn-primary flex items-center gap-2 text-xs py-1.5 px-3 bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
      >
        <ShoppingCart size={14} /> Add to Bulk Order
      </button>
      
      <button
        onClick={() => onCreatePrescription(selectedIds)}
        className="flex items-center gap-2 py-1.5 px-3 bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-md text-xs cursor-pointer transition-all duration-200 font-medium shrink-0 hover:bg-gray-50"
      >
        <ClipboardList size={14} /> Create Prescription
      </button>
      
      <button
        onClick={() => onDeactivateSelected(selectedIds)}
        className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 text-red-500 border-red-500 bg-red-50 hover:bg-red-100"
      >
        <XCircle size={14} /> Deactivate
      </button>
      
      <button
        onClick={onExportCSV}
        className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 bg-white"
      >
        <Download size={14} /> Export Selected
      </button>
      
      {!readOnly && (
        <button
          onClick={onToggleBulkMode}
          className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 bg-white"
        >
          <Percent size={14} /> Bulk Price Update
        </button>
      )}
      
      {!readOnly && (
        <button
          onClick={onOpenCatalogSelect}
          className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 bg-white"
        >
          <BookOpen size={14} /> Include in Catalog
        </button>
      )}

      {!readOnly && (
        <button
          onClick={() => onManageVisibility?.(selectedIds)}
          className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
        >
          <Eye size={14} /> Manage Visibility
        </button>
      )}
    </>
  );
}
