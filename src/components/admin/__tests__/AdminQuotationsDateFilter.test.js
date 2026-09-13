import { describe, it, expect } from 'vitest';

describe('Admin Quotations Date Range Filtering', () => {
  function filterByRange(list, rangeFilter) {
    if (!rangeFilter || rangeFilter === 'all') {
      return list;
    }

    const now = new Date();
    const cutoff = new Date();

    switch (rangeFilter) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
      case 'this_week':
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
      case 'this_month':
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      case 'year':
      case 'this_year':
        cutoff.setDate(now.getDate() - 365);
        break;
      default:
        cutoff.setDate(now.getDate() - 7);
        break;
    }

    return list.filter(q => q.createdDate instanceof Date && !isNaN(q.createdDate.getTime()) && q.createdDate >= cutoff);
  }

  const now = new Date();
  const mockQuotations = [
    { id: 'q-today', quotationNumber: 'QUO-001', createdDate: new Date(now.getTime() - 2 * 3600 * 1000) }, // 2 hours ago
    { id: 'q-3days', quotationNumber: 'QUO-002', createdDate: new Date(now.getTime() - 3 * 24 * 3600 * 1000) }, // 3 days ago
    { id: 'q-10days', quotationNumber: 'QUO-003', createdDate: new Date(now.getTime() - 10 * 24 * 3600 * 1000) }, // 10 days ago
    { id: 'q-45days', quotationNumber: 'QUO-004', createdDate: new Date(now.getTime() - 45 * 24 * 3600 * 1000) }, // 45 days ago
    { id: 'q-120days', quotationNumber: 'QUO-005', createdDate: new Date(now.getTime() - 120 * 24 * 3600 * 1000) }, // 120 days ago
    { id: 'q-old', quotationNumber: 'QUO-006', createdDate: new Date(now.getTime() - 400 * 24 * 3600 * 1000) }, // 400 days ago
  ];

  it('filters correctly for "week" / "7d" preserving this week filter from overview', () => {
    const resultsWeek = filterByRange(mockQuotations, 'week');
    expect(resultsWeek.map(q => q.id)).toEqual(['q-today', 'q-3days']);

    const results7d = filterByRange(mockQuotations, '7d');
    expect(results7d.map(q => q.id)).toEqual(['q-today', 'q-3days']);
  });

  it('filters correctly for "today"', () => {
    const resultsToday = filterByRange(mockQuotations, 'today');
    expect(resultsToday.map(q => q.id)).toEqual(['q-today']);
  });

  it('filters correctly for "month" / "30d"', () => {
    const resultsMonth = filterByRange(mockQuotations, 'month');
    expect(resultsMonth.map(q => q.id)).toEqual(['q-today', 'q-3days', 'q-10days']);
  });

  it('filters correctly for "90d"', () => {
    const results90d = filterByRange(mockQuotations, '90d');
    expect(results90d.map(q => q.id)).toEqual(['q-today', 'q-3days', 'q-10days', 'q-45days']);
  });

  it('filters correctly for "year"', () => {
    const resultsYear = filterByRange(mockQuotations, 'year');
    expect(resultsYear.map(q => q.id)).toEqual(['q-today', 'q-3days', 'q-10days', 'q-45days', 'q-120days']);
  });

  it('returns all when range is "all"', () => {
    const resultsAll = filterByRange(mockQuotations, 'all');
    expect(resultsAll.length).toBe(mockQuotations.length);
  });
});
