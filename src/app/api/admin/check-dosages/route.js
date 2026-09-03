import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const productsSnap = await adminDb.collection('products').get();
    
    let total = 0;
    const missing = [];
    
    productsSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'inactive' || data.status === 'archived' || data.isActive === false) return;
      total++;
      if (!data.dosage && !data.dose) {
        // Look for dosage in the canonicalName or name
        const name = data.canonicalName || data.name || '';
        const match = name.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|iu)/i);
        let extracted = null;
        if (match) {
          extracted = match[0];
        }
        
        missing.push({
          id: doc.id,
          name: name,
          supplierName: data.supplierName,
          price: data.price,
          extracted_dosage: extracted
        });
      }
    });

    return NextResponse.json({ total, missingCount: missing.length, missing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
