import { useState, useMemo } from 'react';

export function useProductFilters(products, initialSearch = '') {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeChip, setActiveChip] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Advanced Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterProductType, setFilterProductType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterZoho, setFilterZoho] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Compute Grouped and Filtered Products
  const { paginatedProducts, filteredGroups, totalItems, totalPages } = useMemo(() => {
    // 1. Group by Name
    const allGroupsMap = products.reduce((acc, p) => {
      const gName = p.name || 'Unnamed Product';
      if (!acc[gName]) {
        acc[gName] = {
          name: gName,
          category: p.category || '',
          supplier: p.supplier || '',
          warehouse: p.warehouse || '',
          objective: p.objective || '',
          totalStock: 0,
          isActive: false,
          variants: [],
          zoho_item_id: null,
          sku: null,
        };
      }
      acc[gName].variants.push(p);
      acc[gName].totalStock += p.stock || 0;
      if (p.isActive !== false) acc[gName].isActive = true;

      if (!acc[gName].sku && p.sku) acc[gName].sku = p.sku.substring(0, 8);
      if (!acc[gName].zoho_item_id && p.zoho_item_id) acc[gName].zoho_item_id = p.zoho_item_id;

      return acc;
    }, {});

    const allGroups = Object.values(allGroupsMap);

    // 2. Filter Groups
    const filtered = allGroups.filter((group) => {
      // Smart Chip Filters
      if (activeChip === 'active') {
        if (!group.variants.some((v) => v.isActive !== false)) return false;
      }
      if (activeChip === 'draft') {
        if (!group.variants.some((v) => v.isActive === false)) return false;
      }
      if (activeChip === 'low_stock') {
        if (!group.variants.some((v) => v.stock <= (v.minStock || 5))) return false;
      }

      return group.variants.some((p) => {
        const matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
        const matchesSupplier = filterSupplier === 'All' || p?.supplier === filterSupplier;
        const matchesStatus =
          filterStatus === 'All' ||
          (filterStatus === 'Active' && p?.isActive !== false) ||
          (filterStatus === 'Inactive' && p?.isActive === false);
        const matchesWarehouse = filterWarehouse === 'All' || p?.warehouse === filterWarehouse;

        let matchesStock = true;
        if (filterStock === 'Out of Stock') matchesStock = p?.stock < 1;
        else if (filterStock === 'Low Stock') matchesStock = p?.stock >= 1 && p?.stock < 20;
        else if (filterStock === 'In Stock') matchesStock = p?.stock >= 20;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (p?.name || '').toLowerCase().includes(searchLower) ||
          (p?.category || '').toLowerCase().includes(searchLower) ||
          (p?.supplier || '').toLowerCase().includes(searchLower) ||
          (p?.objective && p.objective.toLowerCase().includes(searchLower)) ||
          (p?.dosage && p.dosage.toLowerCase().includes(searchLower)) ||
          (p?.sku && p.sku.toLowerCase().includes(searchLower));

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
          let updatedStr = p.updatedAt;
          if (!updatedStr && p.createdAt) {
            if (p.createdAt?.toDate) {
              updatedStr = p.createdAt.toDate().toISOString();
            } else if (typeof p.createdAt === 'string') {
              updatedStr = p.createdAt;
            }
          }
          if (updatedStr) {
            const upDate = new Date(updatedStr);
            if (dateRange.start && new Date(dateRange.start) > upDate) matchesDate = false;
            if (dateRange.end && new Date(dateRange.end) < upDate) matchesDate = false;
          } else {
            matchesDate = false;
          }
        }

        let matchesZoho = true;
        if (filterZoho === 'Synced') matchesZoho = !!p.zoho_item_id;
        else if (filterZoho === 'Not Synced') matchesZoho = !p.zoho_item_id;

        return (
          matchesCategory &&
          matchesSupplier &&
          matchesStatus &&
          matchesWarehouse &&
          matchesStock &&
          matchesSearch &&
          matchesDate &&
          matchesZoho
        );
      });
    });

    const sortedGroups = filtered.sort((a, b) => a.name.localeCompare(b.name));

    // 3. Paginate
    const tItems = sortedGroups.length;
    const tPages = Math.ceil(tItems / rowsPerPage);
    const paginated = sortedGroups.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    return {
      paginatedProducts: paginated,
      filteredGroups: sortedGroups,
      totalItems: tItems,
      totalPages: tPages,
    };
  }, [
    products,
    searchTerm,
    activeChip,
    filterCategory,
    filterSupplier,
    filterStatus,
    filterWarehouse,
    filterStock,
    dateRange,
    filterZoho,
    currentPage,
    rowsPerPage,
  ]);

  return {
    searchTerm,
    setSearchTerm,
    activeChip,
    setActiveChip,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    filterCategory,
    setFilterCategory,
    filterSupplier,
    setFilterSupplier,
    filterProductType,
    setFilterProductType,
    filterStatus,
    setFilterStatus,
    filterStock,
    setFilterStock,
    filterWarehouse,
    setFilterWarehouse,
    filterZoho,
    setFilterZoho,
    filterSource,
    setFilterSource,
    dateRange,
    setDateRange,
    paginatedProducts,
    filteredGroups,
    totalItems,
    totalPages,
  };
}
