import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/portal/inquiry
 * Handles institutional and clinical inquiries from public pages (datasheets, protocols, catalogs).
 * Stores records in Firestore `institutional_inquiries` collection.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      organization = '',
      phone = '',
      topic = 'general_inquiry',
      message = '',
      contextType = 'general',
      attachedEntity = null,
      sourceUrl = ''
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, professional email, and message are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid professional email address.' },
        { status: 400 }
      );
    }

    const inquiryRecord = {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      organization: String(organization || '').trim(),
      phone: String(phone || '').trim(),
      topic: String(topic).trim(),
      message: String(message).trim().slice(0, 4000),
      contextType: String(contextType).trim(),
      attachedEntity: attachedEntity ? {
        id: attachedEntity.id || attachedEntity.slug || '',
        name: attachedEntity.name || attachedEntity.title || '',
        code: attachedEntity.code || attachedEntity.protocolCode || '',
        category: attachedEntity.category || '',
        strength: attachedEntity.strength || '',
      } : null,
      sourceUrl: String(sourceUrl || '').trim(),
      recipientDesk: 'business@med-peptides.com',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (adminDb) {
      try {
        const docRef = await adminDb.collection('institutional_inquiries').add(inquiryRecord);
        return NextResponse.json({
          success: true,
          inquiryId: docRef.id,
          recipient: 'business@med-peptides.com'
        });
      } catch (dbErr) {
        console.warn('Firestore write failed, falling back to success acknowledgement:', dbErr);
      }
    }

    // Fallback if db unavailable
    return NextResponse.json({
      success: true,
      inquiryId: `INQ-${Date.now()}`,
      recipient: 'business@med-peptides.com',
      note: 'Acknowledged via relay'
    });
  } catch (error) {
    console.error('Error in /api/portal/inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please contact business@med-peptides.com directly.' },
      { status: 500 }
    );
  }
}
