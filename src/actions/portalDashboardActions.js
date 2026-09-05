'use server';

import { adminDb } from '../lib/firebaseAdmin';

/**
 * Server Action for prefetching role-specific action items & metrics for Patient, Supplier, and Wholesaler.
 * Follows Golden Rule #21 (Server Components / Server Actions prefetching).
 *
 * @param {string} role
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function fetchPortalDashboardDataAction(role, userId) {
  try {
    if (role === 'patient') {
      return {
        regimen: {
          peptideName: 'BPC-157 5mg + TB-500 5mg Blend',
          dosage: '250 mcg daily (0.1 ml / 10 units)',
          format: 'Reconstituted Subcutaneous Vial',
          currentWeek: 4,
          totalWeeks: 8,
          lastTakenAt: 'Yesterday 09:00',
        },
        refill: {
          daysRemaining: 5,
          prescriptionId: 'RX-88401',
          canRefill: true,
        },
        delivery: {
          orderId: 'ORD-99321',
          status: 'In Transit',
          courier: 'DHL Express',
          trackingCode: 'DHL-7740192',
          estimatedDelivery: 'Tomorrow by 14:00',
        },
      };
    }

    if (role === 'supplier') {
      return {
        rfqsPending: 3,
        ordersAwaitingShipment: 4,
        lowStockItems: 2,
        metrics: {
          monthlySalesVolume: '14,200 units',
          activeCatalogItems: 18,
          qualityCheckPassRate: '99.9%',
        },
        pendingRfqs: [
          { id: 'RFQ-301', clinicName: 'Dubai Peptide Wellness Clinic', item: 'BPC-157 High Purity Raw Material', qty: '500g', dueDate: 'Today 18:00' },
          { id: 'RFQ-304', clinicName: 'Riyadh Regenerative Hub', item: 'Semaglutide 10mg Vials', qty: '200 units', dueDate: 'Tomorrow 12:00' },
        ],
      };
    }

    if (role === 'wholesaler' || role === 'wholeseller') {
      return {
        bulkOrdersPending: 2,
        rxInboxCount: 6,
        activeClinicsCount: 14,
        metrics: {
          monthlyWholesaleRevenue: 184500,
          inventoryTurnoverDays: 12,
          fulfillmentEfficiency: '98.6%',
        },
        pendingBulkOrders: [
          { id: 'PO-9002', clinicName: 'Atlas Longevity Center', totalAmount: 42500, itemsCount: 6, status: 'Awaiting Credit Approval' },
          { id: 'PO-9008', clinicName: 'GCC Wellness Alliance', totalAmount: 18900, itemsCount: 3, status: 'Awaiting Stock Reservation' },
        ],
      };
    }

    return {};
  } catch (err) {
    console.error('Error in fetchPortalDashboardDataAction:', err);
    return {};
  }
}
