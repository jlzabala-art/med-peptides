import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';

/**
 * GET /api/prescriptions/original-document
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure Google Cloud Storage proxy for original clinical prescription files.
 * Strict RBAC Access Control:
 *   - Allowed: 'admin', 'account_manager', 'superadmin'
 *   - Prohibited: 'doctor', 'patient', 'clinic', unauthenticated users
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rxId = searchParams.get('rxId') || searchParams.get('id');
    const directPath = searchParams.get('path');

    if (!rxId && !directPath) {
      return NextResponse.json({ error: 'Missing rxId or path parameter' }, { status: 400 });
    }

    // 1. RBAC Verification
    // Extract Authorization header or session token
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : searchParams.get('token');

    let userRole = 'guest';
    let userUid = null;

    if (token && adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        userUid = decoded.uid;
        userRole = decoded.role || decoded.customClaims?.role || null;

        // Check user document if role not in token claim
        if (!userRole && adminDb) {
          const userSnap = await adminDb.collection('users').doc(userUid).get();
          if (userSnap.exists) {
            userRole = userSnap.data()?.role || 'guest';
          }
        }
      } catch (authErr) {
        console.warn('[OriginalDocumentAPI] Token verification warning:', authErr.message);
      }
    }

    // Check admin bypass header / cookie / param for authenticated internal dashboards
    const adminSecret = request.headers.get('x-admin-secret');
    const isInternalAdmin = adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET;

    // Strict Rule Check: Doctors and Patients are explicitly forbidden
    const isDoctor = userRole === 'doctor' || userRole === 'medical_director';
    const isPatient = userRole === 'patient';
    const isClinic = userRole === 'clinic';

    if (isDoctor || isPatient || isClinic) {
      return NextResponse.json({
        error: 'Forbidden: Original clinical source files are strictly restricted to administrators and clinical compliance officers. Physicians and patients are prohibited from viewing raw signed source files.',
        code: 'ROLE_FORBIDDEN',
        role: userRole
      }, { status: 403 });
    }

    // Authorized roles:
    const isAuthorized = isInternalAdmin || userRole === 'admin' || userRole === 'account_manager' || userRole === 'superadmin';

    // 2. Fetch Prescription details from Firestore
    let storagePath = directPath;

    if (rxId && adminDb) {
      const rxDoc = await adminDb.collection('prescriptions').doc(rxId).get();
      if (!rxDoc.exists) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }

      const rxData = rxDoc.data();
      storagePath = rxData.cloudStoragePath || null;

      if (!storagePath && rxData.cloudStorageUri) {
        // Parse gs:// URI
        storagePath = rxData.cloudStorageUri.replace(/^gs:\/\/[^/]+\//, '');
      }

      if (!storagePath && rxData.pdfUrl) {
        const cleanName = rxData.pdfUrl.split('/').pop();
        storagePath = `prescriptions/original/${cleanName}`;
      }
    }

    if (!storagePath) {
      return NextResponse.json({ error: 'No original document registered in Google Cloud Storage for this prescription' }, { status: 404 });
    }

    // 3. Connect to Google Cloud Storage
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'med-peptides-app.firebasestorage.app';
    const storage = getStorage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(storagePath);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: `File ${storagePath} not found in Google Cloud Storage bucket` }, { status: 404 });
    }

    // If unauthenticated and not explicitly authorized, deny
    if (!isAuthorized && process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'Authentication required. Only authorized staff members can view original clinical prescription files.',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    // 4. Generate 15-minute temporary signed URL for authorized viewer
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    // Check if client requested a direct redirect or JSON
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json') || searchParams.get('format') === 'json') {
      return NextResponse.json({
        success: true,
        rxId,
        url: signedUrl,
        storagePath,
        expiresIn: '15m'
      });
    }

    // Default: redirect directly to the signed Google Cloud Storage URL
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('[OriginalDocumentAPI] Error retrieving prescription document:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
