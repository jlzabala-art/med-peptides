import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Universal Optimized Export API Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Streams or downloads sanitized CSV / JSON datasets for:
 *   - clinics
 *   - prescriptions
 *   - products
 *   - patients
 *   - orders
 *
 * Implements:
 *   - AGENTS.md Rule #1: Server-side paging & hard limit (max 5000).
 *   - AGENTS.md Rule #10: CSV Injection Prevention & Sanitization.
 *   - Microsoft Excel compatibility with UTF-8 BOM (\uFEFF).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // Prevent Excel / Google Sheets formula injection (=, +, -, @, \t, \r)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

function formatDate(val) {
  if (!val) return '';
  try {
    if (typeof val.toDate === 'function') return val.toDate().toISOString().slice(0, 10);
    if (val._seconds || val.seconds) return new Date((val._seconds || val.seconds) * 1000).toISOString().slice(0, 10);
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString().slice(0, 10);
  } catch {
    return String(val);
  }
}

// Entity configuration schema & column transformers
const ENTITY_CONFIG = {
  clinics: {
    collection: 'clinics',
    columns: [
      { header: 'Clinic ID', accessor: (d) => d.id },
      { header: 'Name', accessor: (d) => d.name || d.clinicName || '' },
      { header: 'Medical Director', accessor: (d) => d.medicalDirector || d.doctorName || '' },
      { header: 'Email', accessor: (d) => d.email || d.contactEmail || '' },
      { header: 'Phone', accessor: (d) => d.phone || '' },
      { header: 'City', accessor: (d) => d.city || d.address?.city || '' },
      { header: 'Country', accessor: (d) => d.country || d.address?.country || '' },
      { header: 'Status', accessor: (d) => d.status || 'active' },
      { header: 'Created Date', accessor: (d) => formatDate(d.createdAt) },
    ]
  },
  prescriptions: {
    collection: 'prescriptions',
    columns: [
      { header: 'Rx ID', accessor: (d) => d.rxNumber || d.id },
      { header: 'Patient Name', accessor: (d) => d.patientName || d.patient?.fullName || d.patient?.name || '' },
      { header: 'Doctor Name', accessor: (d) => d.doctorName || d.physicianName || d.doctor?.name || '' },
      { header: 'Clinic', accessor: (d) => d.clinicName || d.clinic || '' },
      { header: 'Status', accessor: (d) => d.status || 'draft' },
      { 
        header: 'Medications / Protocols', 
        accessor: (d) => {
          if (Array.isArray(d.items)) {
            return d.items.map(i => `${i.name || i.productName || 'Item'} (${i.dosage || i.dose || 'std'})`).join('; ');
          }
          if (Array.isArray(d.medications)) {
            return d.medications.map(m => `${m.name} (${m.dosage || ''})`).join('; ');
          }
          return d.medication || d.productName || '';
        } 
      },
      { header: 'Total ($)', accessor: (d) => (d.total ? parseFloat(d.total).toFixed(2) : '0.00') },
      { header: 'Prescribed Date', accessor: (d) => formatDate(d.createdAt) },
    ]
  },
  products: {
    collection: 'products',
    columns: [
      { header: 'Product ID / SKU', accessor: (d) => d.sku || d.id },
      { header: 'Name', accessor: (d) => d.name || '' },
      { header: 'Category', accessor: (d) => d.category || '' },
      { header: 'Dosage / Presentation', accessor: (d) => d.dosage || d.presentation || '' },
      { header: 'Base Price ($)', accessor: (d) => (d.price ? parseFloat(d.price).toFixed(2) : '0.00') },
      { header: 'Wholesale Price ($)', accessor: (d) => (d.wholesalePrice ? parseFloat(d.wholesalePrice).toFixed(2) : '') },
      { header: 'Stock Units', accessor: (d) => (d.stock !== undefined ? d.stock : (d.inventory !== undefined ? d.inventory : 'N/A')) },
      { header: 'Status', accessor: (d) => d.status || (d.active === false ? 'draft' : 'published') },
      { header: 'Created Date', accessor: (d) => formatDate(d.createdAt) },
    ]
  },
  patients: {
    collection: 'patients',
    columns: [
      { header: 'Patient ID', accessor: (d) => d.id },
      { header: 'Full Name', accessor: (d) => d.fullName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() },
      { header: 'Email', accessor: (d) => d.email || '' },
      { header: 'Phone', accessor: (d) => d.phone || '' },
      { header: 'Assigned Doctor', accessor: (d) => d.doctorName || d.physician || '' },
      { header: 'Clinic', accessor: (d) => d.clinic || d.clinicName || '' },
      { header: 'Status', accessor: (d) => d.status || 'active' },
      { header: 'Last Visit', accessor: (d) => formatDate(d.lastVisit || d.updatedAt) },
      { header: 'Created Date', accessor: (d) => formatDate(d.createdAt) },
    ]
  },
  orders: {
    collection: 'orders',
    columns: [
      { header: 'Order Number', accessor: (d) => d.orderNumber || d.orderId || d.id },
      { header: 'Customer', accessor: (d) => d.customer?.fullName || d.customer?.name || d.customerName || '' },
      { header: 'Email', accessor: (d) => d.customer?.email || d.customerEmail || '' },
      { header: 'Doctor', accessor: (d) => d.doctorName || d.physicianName || '' },
      { header: 'Status', accessor: (d) => d.status || 'pending' },
      { header: 'Subtotal ($)', accessor: (d) => (d.subtotal ? parseFloat(d.subtotal).toFixed(2) : '') },
      { header: 'Total ($)', accessor: (d) => (d.total ? parseFloat(d.total).toFixed(2) : '0.00') },
      { header: 'Items Count', accessor: (d) => (Array.isArray(d.items) ? d.items.length : 1) },
      { header: 'Source', accessor: (d) => d.source || 'web' },
      { header: 'Created Date', accessor: (d) => formatDate(d.createdAt) },
    ]
  }
};

export async function GET(request, { params }) {
  try {
    const { entity } = await params;
    const { searchParams } = new URL(request.url);

    const config = ENTITY_CONFIG[entity];
    if (!config) {
      return NextResponse.json(
        { error: `Invalid export entity '${entity}'. Supported: ${Object.keys(ENTITY_CONFIG).join(', ')}` },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Server database connection unavailable' },
        { status: 503 }
      );
    }

    const format = searchParams.get('format')?.toLowerCase() || 'csv';
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctorId');
    const clinicId = searchParams.get('clinicId');
    const parsedLimit = parseInt(searchParams.get('limit') || '1000', 10);
    const queryLimit = Math.min(Math.max(parsedLimit, 1), 5000); // 1 to 5000 safety bound

    let colQuery = adminDb.collection(config.collection);

    if (status && status !== 'all') {
      colQuery = colQuery.where('status', '==', status);
    }
    if (doctorId) {
      colQuery = colQuery.where('doctorId', '==', doctorId);
    }
    if (clinicId) {
      colQuery = colQuery.where('clinicId', '==', clinicId);
    }

    // Sort by createdAt desc if possible
    try {
      colQuery = colQuery.orderBy('createdAt', 'desc');
    } catch {
      // Ignore if index is not present for this combination
    }

    colQuery = colQuery.limit(queryLimit);

    const snapshot = await colQuery.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      const jsonStr = JSON.stringify(records, null, 2);
      return new NextResponse(jsonStr, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${entity}_export_${dateStr}.json"`,
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    // CSV format with UTF-8 BOM
    const headersLine = config.columns.map(c => sanitizeCSVCell(c.header)).join(',');
    const rows = records.map(record => {
      return config.columns.map(c => {
        const val = c.accessor(record);
        return sanitizeCSVCell(val);
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headersLine, ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${entity}_export_${dateStr}.csv"`,
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error) {
    console.error(`[Export API Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}
