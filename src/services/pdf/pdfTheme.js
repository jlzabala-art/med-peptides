/**
 * pdfTheme.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Theme, Fonts, Formatters and Layout Helpers for PDF Document Generation.
 */

import { ROUTE_LABELS, ROUTE } from '../../constants/productEnums.js';
import { doseToObject } from '../../utils/protocolSchemaAdapter.js';

export const PDF_COLORS = {
  primary: [0, 54, 102],       // Navy / Brand
  primaryLight: [240, 245, 250],
  secondary: [100, 116, 139],  // Slate
  success: [22, 163, 74],      // Emerald
  danger: [220, 38, 38],       // Red
  warning: [217, 119, 6],      // Amber
  cyan: [8, 145, 178],         // Cyan
  purple: [124, 58, 237],      // Violet
  dark: [15, 23, 42],          // Slate 900
  lightBg: [248, 250, 252],    // Slate 50
  white: [255, 255, 255],
  border: [226, 232, 240]
};

export const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatPrice = (val) => {
  if (typeof val !== 'number') return val;
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const normalizeDosing = (d) => {
  const compound = d.product_title || d.name || d.product_slug?.charAt(0).toUpperCase() + d.product_slug?.slice(1).replace(/-/g, ' ') || 'Product';
  const strength = d.strength || d.selected_strength || d.vial_strength_used || 'Standard';
  const dose = d.weekly_dose || d.per_administration_dose || 'Titrated';
  
  let freq = d.dosing_frequency || d.frequency || 'As directed';
  if (freq.toLowerCase() === 'daily') freq = 'Daily';
  if (freq.toLowerCase() === 'weekly' || freq.toLowerCase() === 'once_weekly') freq = 'Weekly';
  if (freq.toLowerCase() === '3x_week' || freq.toLowerCase() === '3x week') freq = '3x/week';
  if (freq.toLowerCase() === '2x_week' || freq.toLowerCase() === '2x week') freq = '2x/week';
  if (freq.toLowerCase() === '5x_week' || freq.toLowerCase() === '5x/week') freq = '5x/week';

  const rawRoute = d.variantRef?.route ?? d.route ?? ROUTE.SC;
  const route = ROUTE_LABELS[rawRoute] ?? (rawRoute.charAt(0).toUpperCase() + rawRoute.slice(1).toLowerCase());
  
  return { compound, strength, dose, freq, route };
};

export const getDaysForFrequency = (freq) => {
  const f = freq?.toLowerCase() || '';
  if (f.includes('daily') || f.includes('nightly')) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (f === '3x_week' || f.includes('3x week')) return ['Mon', 'Wed', 'Fri'];
  if (f === '2x_week' || f.includes('2x week')) return ['Tue', 'Thu'];
  if (f === '5x_week' || f.includes('5x/week') || f.includes('5 days')) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  if (f === 'weekly' || f.includes('once weekly') || f === 'once_weekly') return ['Mon'];
  return ['Mon'];
};

export const checkPageBreak = (doc, currentY, neededSpace, pageHeight = 297, bottomMargin = 25) => {
  if (currentY + neededSpace > (pageHeight - bottomMargin)) {
    doc.addPage();
    return 20; // Top margin for new page
  }
  return currentY;
};

export const addRunningFooter = (doc, options = {}) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Bottom rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    // Footer text
    doc.text(
      options.disclaimer || 'ATLAS CLINICAL PLATFORM · CONFIDENTIAL & PROPRIETARY · FOR AUTHORIZED MEDICAL USE ONLY',
      14,
      pageHeight - 9
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 9,
      { align: 'right' }
    );
  }
};
