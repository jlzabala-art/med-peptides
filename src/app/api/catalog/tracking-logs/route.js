import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/catalog/tracking-logs?q=term&status=all&limit=50
 * Fetches historical audit and tracking logs of generated catalogs & price lists.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const limitNum = Math.min(parseInt(searchParams.get('limit') || '50', 10), 150);
    const status = searchParams.get('status') || 'all';
    const q = (searchParams.get('q') || '').toLowerCase().trim();

    let query = adminDb.collection('catalog_generation_logs').orderBy('generatedAt', 'desc').limit(limitNum);

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snap = await query.get();
    let logs = [];
    snap.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    if (q) {
      logs = logs.filter(l => 
        (l.recipient?.name || '').toLowerCase().includes(q) ||
        (l.recipient?.email || '').toLowerCase().includes(q) ||
        (l.accountManager?.name || '').toLowerCase().includes(q) ||
        (l.docType || '').toLowerCase().includes(q) ||
        (l.productSummary || '').toLowerCase().includes(q) ||
        (l.productName || '').toLowerCase().includes(q) ||
        (l.productSlug || '').toLowerCase().includes(q)
      );
    }

    // Pre-calculate summary KPIs for tracking
    const kpis = {
      totalGenerated: logs.length,
      wholesalerDocs: logs.filter(l => l.recipient?.type === 'wholeseller' || l.tier === 'wholeseller').length,
      clinicDocs: logs.filter(l => l.recipient?.type === 'clinic' || l.tier === 'clinic' || l.recipient?.type === 'doctor').length,
      convertedCount: logs.filter(l => l.status === 'converted_to_order').length,
      viewedCount: logs.filter(l => l.status === 'viewed').length,
    };

    return NextResponse.json({
      items: logs,
      total: logs.length,
      kpis,
    });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] GET Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/catalog/tracking-logs
 * 1. Creates a new tracking log when sharing a product or catalog.
 * 2. Handles view telemetry sent via navigator.sendBeacon (which sends POST).
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();

    // ── Branch A: Telemetry View & Engagement Event ──
    if (body.event === 'cart_update' && (body.catalogId || body.id)) {
      const targetId = body.catalogId || body.id;
      try {
        const linkRef = adminDb.collection('shared_catalog_links').doc(targetId);
        await linkRef.set({
          status: 'engaged',
          lastCartUpdateAt: new Date().toISOString(),
          cartItemsCount: body.cartItemsCount || (body.cartItems ? body.cartItems.length : 0),
          cartSummary: (body.cartItems || []).slice(0, 5).map(c => `${c.qty || c.quantity || 1}x ${c.name || c.productName || 'Item'}`).join(', '),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Error recording cart_update telemetry:', e);
      }
      return NextResponse.json({ success: true, event: 'cart_update_recorded' });
    }

    if (body.event === 'view' || body.action === 'view' || (body.id && body.viewedAt)) {
      const targetId = body.id || body.catalogId;
      try {
        // Also update shared_catalog_links if exists
        const linkRef = adminDb.collection('shared_catalog_links').doc(targetId);
        const linkSnap = await linkRef.get();
        if (linkSnap.exists) {
          const lData = linkSnap.data() || {};
          await linkRef.update({
            status: lData.status === 'converted' ? 'converted' : lData.status === 'engaged' ? 'engaged' : 'viewed',
            lastVisitedAt: body.viewedAt || new Date().toISOString(),
            visitsCount: FieldValue.increment(1),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        // Non-blocking
      }

      const logRef = adminDb.collection('catalog_generation_logs').doc(targetId);
      const docSnap = await logRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ success: true, event: 'view_recorded_on_link' });
      }

      const existing = docSnap.data();
      const newStatus = existing.status === 'converted_to_order' ? 'converted_to_order' : 'viewed';

      const updateData = {
        status: newStatus,
        lastViewedAt: body.viewedAt || new Date().toISOString(),
        viewCount: FieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      };

      if (body.userAgent || body.screen || body.referrer) {
        updateData.views = FieldValue.arrayUnion({
          timestamp: body.viewedAt || new Date().toISOString(),
          userAgent: (body.userAgent || '').slice(0, 150),
          screen: body.screen || null,
          referrer: (body.referrer || '').slice(0, 100),
        });
      }

      await logRef.update(updateData);
      return NextResponse.json({ success: true, id: body.id, event: 'view_recorded' });
    }

    // ── Branch B: Creation of a New Share Log ──
    const {
      docType = 'product_datasheet',
      productSlug,
      productName,
      recipient,
      targetType,
      sharedWith,
      sharedPhone,
      sharedEmail,
      accountManager,
      shareUrl,
      items,
    } = body;

    const recipientData = recipient || {
      name: sharedWith || '',
      phone: sharedPhone || '',
      email: sharedEmail || '',
      type: targetType || 'custom',
    };

    const isInfoRequest = (docType === 'info_request');
    const internalAccountManager = isInfoRequest
      ? { name: 'Operations Desk', email: 'jose@mediluxeme.com' }
      : (accountManager || {
          name: 'Atlas Commercial Desk',
          email: 'orders@atlas-solutions.com',
        });

    const newLog = {
      docType: docType || 'product_datasheet',
      productSlug: productSlug || null,
      productName: productName || (productSlug ? productSlug.replace(/-/g, ' ').toUpperCase() : null),
      productSummary: productName || productSlug || 'Precision Clinical Product',
      recipient: recipientData,
      accountManager: internalAccountManager,
      shareUrl: shareUrl || null,
      status: 'sent',
      items: items || null,
      itemCount: items ? items.length : 1,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      views: [],
    };

    const docRef = await adminDb.collection('catalog_generation_logs').add(newLog);

    // Attempt direct SMTP alert to jose@mediluxeme.com if credentials are available
    if (isInfoRequest) {
      try {
        const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
        const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;
        if (gmailUser && gmailPass) {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailPass },
          });

          const topic = items?.[0]?.topic || 'Clinical Details';
          const notes = items?.[0]?.notes || 'No additional notes provided.';

          await transporter.sendMail({
            from: `"Atlas Clinical System" <${gmailUser}>`,
            to: 'jose@mediluxeme.com',
            subject: `📬 New Clinical Info Request: ${newLog.productName} — Dr. ${recipientData.name}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <span style="font-size: 20px;">🔬</span>
                  <h2 style="margin: 0; font-size: 18px; color: #0f172a;">New Clinical Information Request</h2>
                </div>
                <p style="color: #475569; font-size: 14px; margin-top: 0;">A practitioner requested clinical literature on a shared catalog product.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
                
                <table style="width: 100%; font-size: 13px; color: #334155; line-height: 1.6;">
                  <tr>
                    <td style="font-weight: 700; width: 120px; padding: 4px 0;">Compound:</td>
                    <td style="color: #2563eb; font-weight: 800;">${newLog.productName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700; padding: 4px 0;">Practitioner:</td>
                    <td>${recipientData.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700; padding: 4px 0;">Email:</td>
                    <td><a href="mailto:${recipientData.email}" style="color: #2563eb;">${recipientData.email}</a></td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700; padding: 4px 0;">Requested Topic:</td>
                    <td><strong>${topic}</strong></td>
                  </tr>
                </table>

                ${notes ? `
                  <div style="margin-top: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-weight: 700; font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Clinical Context / Notes:</div>
                    <div style="font-size: 13px; color: #1e293b;">${notes}</div>
                  </div>
                ` : ''}

                <div style="margin-top: 24px; text-align: center;">
                  <a href="mailto:${recipientData.email}?subject=Clinical%20Documentation:%20${encodeURIComponent(newLog.productName)}&body=Dear%20${encodeURIComponent(recipientData.name)},%0A%0AThank%20you%20for%20requesting%20clinical%20information%20on%20${encodeURIComponent(newLog.productName)}.%0A%0A" 
                     style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">
                    Reply to Practitioner
                  </a>
                </div>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.warn('[/api/catalog/tracking-logs] Direct email dispatch warning (non-fatal):', mailErr.message);
      }
    }

    // Sanitize response to never leak internal email to the client browser
    const clientSafeLog = { ...newLog };
    if (isInfoRequest) {
      clientSafeLog.accountManager = { name: 'Clinical Operations Desk' };
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      item: { id: docRef.id, ...clientSafeLog },
    });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/catalog/tracking-logs
 * Updates status, follow-up notes, or records a view event on a generated catalog log.
 */
export async function PATCH(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, followUpNotes, followUpDate, event, viewedAt, userAgent, screen, referrer } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing log id' }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (event === 'view' || status === 'viewed') {
      updateData.status = 'viewed';
      updateData.lastViewedAt = viewedAt || new Date().toISOString();
      updateData.viewCount = FieldValue.increment(1);

      if (userAgent || screen || referrer) {
        updateData.views = FieldValue.arrayUnion({
          timestamp: viewedAt || new Date().toISOString(),
          userAgent: (userAgent || '').slice(0, 150),
          screen: screen || null,
          referrer: (referrer || '').slice(0, 100),
        });
      }
    } else if (status !== undefined) {
      updateData.status = status;
    }

    if (followUpNotes !== undefined) updateData.followUpNotes = followUpNotes;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;

    await adminDb.collection('catalog_generation_logs').doc(id).update(updateData);

    return NextResponse.json({ success: true, id, updated: updateData });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] PATCH Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
