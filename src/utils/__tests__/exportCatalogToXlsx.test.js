import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('exportCatalogToXlsx — Structured Workbook Generator', () => {
  const sampleItems = [
    {
      refCode: 'PEP-BPC-01',
      name: 'BPC-157',
      dosage: '5 mg',
      presentation: 'Vial',
      category: 'Peptides',
      goal: 'Tissue Repair & Gut Health',
      casNumber: '137525-51-0',
      supplier: 'Lotusland Limited',
      warehouse: 'Poland & USA',
      price: 26.50,
      kitPrice: 240.00,
      inStock: true
    },
    {
      refCode: 'PEP-TB5-01',
      name: 'TB-500',
      dosage: '10 mg',
      presentation: 'Vial',
      category: 'Peptides',
      goal: 'Wound Healing & Recovery',
      supplier: 'Lotusland Limited',
      price: 32.00,
      kitPrice: 290.00,
      inStock: true
    }
  ];

  it('correctly constructs multi-sheet workbook structure in memory', () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ['ATLAS SOLUTIONS — CLINICAL PORTFOLIO', ''],
      ['Catalogue Brand', 'RegenPept Portfolio'],
      ['Total Variants', sampleItems.length]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Commercial Terms');

    // Sheet 2: Catalogue
    const catalogRows = sampleItems.map(item => [
      item.refCode,
      item.name,
      item.dosage,
      item.price,
      item.kitPrice
    ]);
    const wsCatalog = XLSX.utils.aoa_to_sheet([['Ref Code', 'Name', 'Dosage', 'Unit Cost', 'Kit Price'], ...catalogRows]);
    XLSX.utils.book_append_sheet(wb, wsCatalog, 'Product Catalogue');

    expect(wb.SheetNames).toContain('Commercial Terms');
    expect(wb.SheetNames).toContain('Product Catalogue');

    const readSummary = XLSX.utils.sheet_to_json(wb.Sheets['Commercial Terms'], { header: 1 });
    expect(readSummary[0][0]).toBe('ATLAS SOLUTIONS — CLINICAL PORTFOLIO');

    const readCatalog = XLSX.utils.sheet_to_json(wb.Sheets['Product Catalogue'], { header: 1 });
    expect(readCatalog.length).toBe(3); // Header + 2 items
    expect(readCatalog[1][0]).toBe('PEP-BPC-01');
    expect(readCatalog[1][3]).toBe(26.50);
  });
});
