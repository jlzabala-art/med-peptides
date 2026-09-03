import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { dbAdmin } from '@/lib/firebaseAdmin';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export async function POST(request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    const { imageBase64, mimeType = 'image/jpeg', targetCategory, targetSupplierId, instructions } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing imageBase64 data in request body.' },
        { status: 400 }
      );
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    // Fetch existing catalog items from Firestore for smart matching
    let catalog = [];
    try {
      if (dbAdmin) {
        let query = dbAdmin.collection('products');
        const snap = await query.limit(500).get();
        catalog = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.canonicalName || data.name || data.displayName || doc.id,
            sku: data.sku || '',
            category: data.category || '',
            type: data.type || '',
            variants: (data.variants || []).map(v => ({
              id: v.id,
              dose: v.dose || '',
              unit_price: v.unit_price || 0,
              purity: v.purity || ''
            }))
          };
        });
      }
    } catch (e) {
      console.warn('[scan-price-list] Failed to fetch catalog products for matching:', e.message);
    }

    const catalogContext = JSON.stringify(catalog.slice(0, 200));

    const prompt = `You are a world-class clinical procurement and pharmaceutical AI specialist.
Your task is to thoroughly analyze this price list, quotation, or invoice image from a supplier (such as Lotusland or raw API distributors).

CRITICAL NUMBER FORMATTING RULE:
The image frequently uses European / Spanish Excel notation where:
- Comma (,) is the DECIMAL separator (e.g., "$ 21,00" = 21.0, "$ 0,17" = 0.17, "$ 3,55" = 3.55).
- Period/Dot (.) is the THOUSANDS separator (e.g., "63.000,00" = 63000.0, "106.500,00" = 106500.0, "179.800,00" = 179800.0, "134.850,00" = 134850.0).
- Percentages like "-25%" or "25%" mean a 25% discount.
ALWAYS output clean, normalized standard floating point numbers in JSON without commas or currency signs.

Extract every product line item with precision:
1. "peptide_name": Name of the peptide, API, or chemical (e.g., "Methylene Blue", "NAD +", "Benzocaine USP", "Lidocaine USP", "Calcitonin").
2. "quantity": Numeric quantity requested or quoted (e.g., 3000, 30000, 20000).
3. "unit_of_measure": Unit for the quantity (e.g. "g", "mg", "kg", "vials", "boxes").
4. "purity_or_grade": e.g., "USP", "HPLC 98%", "Raw API", "Analytical".
5. "unit_price": The unit price per gram/vial (e.g. 21.00, 3.55, 0.17, 0.23).
6. "total_price": The line item total price = quantity * unit_price (e.g. 63000.00, 106500.00, 3400.00, 6900.00).
7. "currency": Detected currency (e.g. "USD", "EUR", "AED").

Also extract global quotation totals and terms:
- "gross_subtotal": Total before discounts (e.g. 179800.00).
- "global_discount_percentage": Discount percentage applied (e.g. 25 for 25%).
- "discounted_total": Net total after discount (e.g. 134850.00).
- "commission_percentage" or "commission_amount" if noted.

Match each extracted item against the provided catalog where possible. If not found in catalog, mark "requires_creation: true".

Catalog Context for matching:
${catalogContext}
${instructions ? `\nSpecial User Instructions: ${instructions}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currency: { type: Type.STRING },
            gross_subtotal: { type: Type.NUMBER },
            global_discount_percentage: { type: Type.NUMBER },
            discounted_total: { type: Type.NUMBER },
            commission_percentage: { type: Type.NUMBER },
            commission_amount: { type: Type.NUMBER },
            shipping_cost: { type: Type.NUMBER },
            vat_percentage: { type: Type.NUMBER },
            supplier_name_detected: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original_text: { type: Type.STRING },
                  peptide_name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit_of_measure: { type: Type.STRING },
                  purity_or_grade: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  unit_price: { type: Type.NUMBER },
                  total_price: { type: Type.NUMBER },
                  productId: { type: Type.STRING },
                  requires_creation: { type: Type.BOOLEAN },
                  suggested_matches: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        productId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        confidence: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ['peptide_name', 'unit_price']
              }
            }
          },
          required: ['items']
        }
      }
    });

    const text = response?.text?.trim() || '{}';
    let parsedData = { items: [] };

    try {
      parsedData = JSON.parse(text);
    } catch (err) {
      console.error('[scan-price-list] Error parsing Gemini JSON output:', text);
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Ensure each item has formatted new_cost, quantity, uom, and valid matching fields
    const normalizedItems = (parsedData.items || []).map((item, idx) => {
      const unitCost = Number(item.unit_price || item.new_cost || 0);
      const qty = Number(item.quantity || 1);
      const uom = item.unit_of_measure || (item.dosage && item.dosage.match(/[a-zA-Z]+/)?.[0]) || 'g';
      const lineTotal = Number(item.total_price || (unitCost * qty) || 0);

      // Intelligent catalog matching
      const cleanName = (item.peptide_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedProd = (catalog || []).find(p => {
        if (item.productId && p.id === item.productId) return true;
        const pClean = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return pClean.includes(cleanName) || cleanName.includes(pClean);
      });

      return {
        id: `scanned_${idx}_${Date.now()}`,
        original_text: item.original_text || item.peptide_name,
        peptide_name: item.peptide_name || 'Unknown Item',
        quantity: qty,
        unit_of_measure: uom,
        dosage: item.dosage || `${qty}${uom}`,
        purity_or_grade: item.purity_or_grade || 'USP / API Grade',
        unit_price: unitCost,
        new_cost: unitCost,
        total_price: lineTotal,
        productId: item.productId || matchedProd?.id || null,
        matchedProductName: matchedProd?.name || null,
        requires_creation: item.requires_creation ?? (!item.productId && !matchedProd),
        action: (item.productId || matchedProd) ? 'update' : 'create', // 'update' | 'create' | 'ignore'
        suggested_matches: item.suggested_matches || (matchedProd ? [{ productId: matchedProd.id, name: matchedProd.name, confidence: 'high' }] : [])
      };
    });

    return NextResponse.json({
      success: true,
      currency: parsedData.currency || 'USD',
      gross_subtotal: parsedData.gross_subtotal || null,
      global_discount_percentage: parsedData.global_discount_percentage || null,
      discounted_total: parsedData.discounted_total || null,
      commission_percentage: parsedData.commission_percentage || null,
      commission_amount: parsedData.commission_amount || null,
      shipping_cost: parsedData.shipping_cost || null,
      vat_percentage: parsedData.vat_percentage || null,
      supplier_name_detected: parsedData.supplier_name_detected || null,
      items: normalizedItems
    });

  } catch (error) {
    console.error('[scan-price-list] API Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while parsing price list.' },
      { status: 500 }
    );
  }
}
