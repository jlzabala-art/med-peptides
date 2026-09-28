import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { scheduleRefillAlertAction, triggerPrescriptionRefillAlertAction } from '@/actions/prescriptionsActions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/prescriptions/refill-alerts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Batch Cron / Liveness Scanner for Prescription Refill Alerts.
 * Scans prescriptions and fires notifications for those within 15 days of exhaustion.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function GET(request) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Find active / ordered / approved prescriptions
    const snap = await adminDb.collection('prescriptions')
      .where('status', 'in', ['active', 'ordered', 'processing', 'in_transit'])
      .limit(100)
      .get();

    const results = [];

    for (const doc of snap.docs) {
      const rx = doc.data();
      const rxId = doc.id;
      const alert = rx.refillAlert || {};

      let alertDate = rx.refillAlertDate || alert.alertDate;
      let exhaustionDate = rx.exhaustionDate || alert.exhaustionDate;

      // If not yet computed, compute it automatically based on 15 days before duration
      if (!alertDate || !exhaustionDate) {
        const scheduleRes = await scheduleRefillAlertAction({
          prescriptionId: rxId,
          daysBefore: 15
        });
        if (scheduleRes.success && scheduleRes.refillAlert) {
          alertDate = scheduleRes.refillAlert.alertDate;
          exhaustionDate = scheduleRes.refillAlert.exhaustionDate;
        }
      }

      // Check if today is within the 15-day alert window (today >= alertDate)
      const isDue = alertDate && todayStr >= alertDate;
      const isExhausted = exhaustionDate && todayStr >= exhaustionDate;

      if (isDue && alert.status !== 'active' && alert.status !== 'exhausted') {
        const newStatus = isExhausted ? 'exhausted' : 'active';
        await doc.ref.update({
          'refillAlert.status': newStatus,
          'refillAlert.triggeredAt': new Date().toISOString()
        });

        const patientName = rx.patient?.name || rx.patientName || 'Patient';
        const message = `⚠️ Alerta de Reposición (15 días): El tratamiento de ${patientName} finaliza el ${exhaustionDate}. Proceder con renovación.`;

        await adminDb.collection('notifications').add({
          message,
          type: 'prescription_refill',
          prescriptionId: rxId,
          patientName,
          doctorName: rx.doctorName || 'Doctor',
          targetRoles: ['doctor', 'admin'],
          link: `/admin/prescriptions?id=${rxId}`,
          read: false,
          createdAt: new Date().toISOString()
        });

        results.push({ prescriptionId: rxId, patientName, alertDate, exhaustionDate, status: 'alert_sent' });
      } else {
        results.push({ prescriptionId: rxId, alertDate, exhaustionDate, status: alert.status || 'scheduled' });
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount: snap.size,
      processed: results,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[API Refill Alerts] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/prescriptions/refill-alerts
 * Configure or trigger an alert for a specific prescription.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prescriptionId, action = 'schedule', daysBefore = 15, courseDurationDays = null, startDate = null } = body;

    if (!prescriptionId) {
      return NextResponse.json({ error: 'prescriptionId is required' }, { status: 400 });
    }

    if (action === 'trigger') {
      const res = await triggerPrescriptionRefillAlertAction(prescriptionId);
      return NextResponse.json(res);
    }

    const res = await scheduleRefillAlertAction({
      prescriptionId,
      daysBefore,
      courseDurationDays,
      startDate
    });

    return NextResponse.json(res);
  } catch (err) {
    console.error('[API Refill Alerts POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
