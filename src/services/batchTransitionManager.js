import { db } from '@/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { canTransitionTo } from '@/schemas/transactionalStateMachine';
import { logger } from '@/utils/logger';

/**
 * Executes an atomic batch transition over multiple documents.
 * Verifies validity of every transition prior to committing to Firestore.
 * 
 * @param {Array<Object>} records - Array of records [{ id, status, ... }]
 * @param {string} targetStatus - The desired target status
 * @param {Object} options
 * @param {string} options.entityType - 'quotation' | 'purchase_order' | 'sales_order'
 * @param {string} options.collectionName - 'prescriptions' | 'orders' | 'purchase_orders'
 * @param {Function} [options.validator] - Optional extra business rule validator (record, target) => { valid, error }
 * @param {string} [options.actorId] - UID of user performing the action
 * @returns {Promise<{ success: boolean, updatedCount: number, skipped: Array<{ id: string, reason: string }> }>}
 */
export async function executeBatchStatusTransition(
  records = [],
  targetStatus,
  {
    entityType = 'quotation',
    collectionName = 'orders',
    validator = null,
    actorId = null
  } = {}
) {
  if (!records.length || !targetStatus) {
    return { success: true, updatedCount: 0, skipped: [] };
  }

  const batch = writeBatch(db);
  const eligible = [];
  const skipped = [];

  for (const record of records) {
    const current = (record.status || 'draft').toLowerCase();
    
    // 1. Check taxonomy transition legality
    if (!canTransitionTo(entityType, current, targetStatus)) {
      skipped.push({
        id: record.id,
        reason: `Cannot transition from "${current}" to "${targetStatus}".`
      });
      continue;
    }

    // 2. Check custom business rules if provided
    if (validator) {
      const check = validator(record, targetStatus);
      if (check && !check.valid) {
        skipped.push({
          id: record.id,
          reason: check.error || 'Failed business prerequisite check.'
        });
        continue;
      }
    }

    eligible.push(record);
  }

  // If none eligible, exit early
  if (eligible.length === 0) {
    return { success: false, updatedCount: 0, skipped };
  }

  // 3. Stage updates in Firestore Batch
  const timestamp = Date.now();
  const dateIso = new Date().toISOString();

  for (const record of eligible) {
    const ref = doc(db, collectionName, record.id);
    batch.update(ref, {
      status: targetStatus,
      updatedAt: serverTimestamp(),
      [`statusHistory.${timestamp}`]: {
        from: record.status || 'draft',
        to: targetStatus,
        by: actorId,
        at: dateIso,
        batch: true
      }
    });
  }

  try {
    await batch.commit();
    logger.info(`[executeBatchStatusTransition] Successfully transitioned ${eligible.length} documents to ${targetStatus}`, {
      collection: collectionName,
      targetStatus,
      eligibleCount: eligible.length,
      skippedCount: skipped.length
    });

    return {
      success: true,
      updatedCount: eligible.length,
      skipped
    };
  } catch (err) {
    logger.error('[executeBatchStatusTransition] Batch commit failed', {
      error: err.message,
      collection: collectionName,
      targetStatus
    });
    throw err;
  }
}
