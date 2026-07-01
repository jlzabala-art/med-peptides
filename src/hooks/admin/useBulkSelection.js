import { useState, useMemo } from 'react';

export function useBulkSelection(items, extractId = (item) => item.id) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(items.map(extractId));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items, selectedIds]);

  const selectedArray = Array.from(selectedIds);

  return {
    selectedIds,
    selectedArray,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
    isAllSelected,
  };
}
