import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin DB is not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const {
      clientName = 'Ryhanh Medical Company',
      contactPerson = 'Hossam Ahmed',
      contactEmail = 'jose@mediluxeme.com',
      territory = 'State of Qatar',
      currency = 'QAR',
      items = [],
      subtotal = 8960.00,
      grandTotal = 8960.00,
      marginPercent = 40.1,
      landedCost = 8960.00,
      notes = '100% advance wire transfer payment with purchase order. Approved Colway commercial terms: 102 PLN product + 19.73 PLN shipping (Total 121.73 PLN / $31.00 USD / 112.00 QAR). Price set in PLN.',
      source = 'atlas_ai_qatar_schedule',
      distributorProfit = 6000.00,
      distributorMarginPct = 40.1
    } = body;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const quotationNumber = body.quotationNumber || `QT-QA-COL-${randomSuffix}`;
    const now = new Date().toISOString();

    const quotationData = {
      id: quotationNumber,
      quotationNumber,
      refNumber: quotationNumber,
      clientName,
      companyName: clientName,
      contactPerson,
      contactEmail,
      recipientType: 'wholesaler',
      category: 'wholesaler',
      territory,
      status: 'pending',
      currency,
      subtotal: Number(subtotal),
      taxTotal: 0,
      grandTotal: Number(grandTotal),
      landedCost: Number(landedCost),
      marginPercent: Number(marginPercent),
      distributorProfit: Number(distributorProfit),
      distributorMarginPct: Number(distributorMarginPct),
      items: Array.isArray(items) ? items : [],
      terms: '100% advance payment with purchase order before European dispatch',
      notes,
      source,
      channel: 'distributor_direct',
      createdAt: now,
      updatedAt: now
    };

    // 1. Write authoritative document to Firestore
    await adminDb.collection('quotations').doc(quotationNumber).set(quotationData);

    // 2. Send instant transactional email alert to Jose / Admin
    try {
      const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

      if (gmailUser && gmailPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass }
        });

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;">
              <div style="background-color: #003666; padding: 20px 24px; color: #ffffff;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #38bdf8; margin-bottom: 4px;">
                  Atlas AI™ Commercial Dispatch Engine
                </div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 800;">
                  New Formal Quotation #${quotationNumber}
                </h2>
                <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">
                  Consignee: ${clientName} · ${territory}
                </div>
              </div>

              <div style="padding: 24px;">
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                  <div style="font-weight: 700; color: #15803d; font-size: 14px;">Quotation Registered in Atlas Health SSOT ✓</div>
                  <div style="font-size: 12px; color: #166534; margin-top: 2px;">
                    Distributor confirmed commercial proposal via public Atlas AI interactive portal.
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Consignee Entity:</td>
                      <td style="padding: 8px 0; font-weight: 700; text-align: right;">${clientName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Contact Person:</td>
                      <td style="padding: 8px 0; font-weight: 600; text-align: right;">${contactPerson}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Commercial Batch:</td>
                      <td style="padding: 8px 0; font-weight: 600; text-align: right;">80 Units (40× Shampoo + 40× Conditioner)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Invoiced Amount (QAR):</td>
                      <td style="padding: 8px 0; font-weight: 800; color: #003666; font-size: 16px; text-align: right;">${Number(grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} QAR</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Invoiced Amount (USD):</td>
                      <td style="padding: 8px 0; font-weight: 700; text-align: right;">$${(grandTotal / 3.6795).toFixed(2)} USD</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Payment Terms:</td>
                      <td style="padding: 8px 0; font-weight: 600; color: #b45309; text-align: right;">100% Advance Wire Transfer with PO</td>
                    </tr>
                  </tbody>
                </table>

                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://www.atlashealth-services.com/admin/quotations" style="display: inline-block; background-color: #003666; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">
                    Manage Quotations in Admin Portal →
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Atlas AI Orders Desk" <${gmailUser}>`,
          to: 'jose@mediluxeme.com',
          subject: `[Atlas Quotation] New B2B Distributor Quotation #${quotationNumber} - ${clientName}`,
          html: emailHtml
        });
      }
    } catch (mailErr) {
      console.warn('[POST /api/quotes/create] Notification email error:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      quotationId: quotationNumber,
      quotationNumber,
      grandTotal: Number(grandTotal),
      currency,
      clientName,
      message: `Quotation ${quotationNumber} successfully registered in Atlas Health SSOT`
    });
  } catch (error) {
    console.error('[POST /api/quotes/create] Error creating quote:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 500 });
  }
}

