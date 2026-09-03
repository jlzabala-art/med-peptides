import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebaseAdmin';
import { normalizeSupplierId, getCanonicalSupplierName } from '@/data/productConstants';
import { invalidateCatalogSummaryCache } from '../summary/route';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      items = [], 
      targetSupplierId = 'supplier-lotusland',
      newSupplierName,
      targetCategory = 'Recovery & Repair',
      agreementDiscount = 25,
      quotationDate = new Date().toISOString().split('T')[0],
      sourceFile = null,
      paymentTerms = '50% Advance / 50% on B/L',
      shippingCost = 0,
      incoterm = 'DAP',
      quotationStatus = 'accepted', // 'received' | 'accepted'
      notes = ''
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided for import.' },
        { status: 400 }
      );
    }

    let finalSupplierId = targetSupplierId || 'supplier-lotusland';
    let finalSupplierName = 'Lotusland';

    if (targetSupplierId === 'new' && newSupplierName) {
      const supRef = await dbAdmin.collection('suppliers').add({
        name: newSupplierName,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      finalSupplierId = supRef.id;
      finalSupplierName = newSupplierName;
    } else {
      finalSupplierId = normalizeSupplierId(targetSupplierId);
      finalSupplierName = getCanonicalSupplierName(finalSupplierId);
    }

    const discNum = parseFloat(agreementDiscount) || 0;
    const shippingNum = parseFloat(shippingCost) || 0;
    const activeItems = items.filter(it => it.action !== 'ignore');
    const affectedProductIds = [];
    let createdCount = 0;
    let updatedCount = 0;

    // Calculate quotation totals
    const grossSubtotal = activeItems.reduce((acc, it) => {
      const q = parseFloat(it.quantity) || 1;
      const p = parseFloat(it.unit_price || it.new_cost) || 0;
      return acc + (Number(it.total_price) || (q * p));
    }, 0);
    const discountAmount = discNum > 0 ? (grossSubtotal * discNum) / 100 : 0;
    const netSubtotal = grossSubtotal - discountAmount;
    const totalPayable = netSubtotal + shippingNum;

    // Generate unique Quotation Reference Number
    const shortRand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const supCode = finalSupplierName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'SUP';
    const year = new Date(quotationDate).getFullYear() || 2026;
    const quotationNumber = `SQ-${year}-${supCode}-${shortRand}`;
    const quotationDocRef = dbAdmin.collection('supplier_quotations').doc();
    const quotationId = quotationDocRef.id;

    // Compute Valid Until (30 days default)
    const validUntilDate = new Date(quotationDate);
    validUntilDate.setDate(validUntilDate.getDate() + 30);
    const validUntilStr = validUntilDate.toISOString().split('T')[0];

    const quotationLineItems = [];

    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const newCostNum = parseFloat(item.unit_price || item.new_cost || 0);
      const qtyNum = parseFloat(item.quantity) || 1;
      const uom = item.unit_of_measure || 'g';
      const listPrice = discNum > 0 ? Number((newCostNum / (1 - discNum / 100)).toFixed(2)) : newCostNum;
      const itemDiscountAmount = Number((listPrice - newCostNum).toFixed(2));
      const lineTotal = Number(item.total_price || (newCostNum * qtyNum).toFixed(2));

      const updatedSupplierPricing = {
        listPrice,
        discountPercent: discNum,
        discountAmount: itemDiscountAmount,
        netCost: newCostNum,
        lastQuotationDate: quotationDate,
        unitOfMeasure: uom,
        moq: qtyNum,
        lineTotal,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        agreementNotes: discNum > 0 ? `${finalSupplierName} Volume Agreement (-${discNum}% Discount on Bulk APIs)` : null,
        quotationId,
        quotationNumber,
        quotationDocUrl: sourceFile?.fileUrl || null,
        quotationFileName: sourceFile?.fileName || null,
        quotationStatus,
        paymentTerms,
        shippingCost: shippingNum,
        incoterm,
        currency: 'USD'
      };

      const timelineEntry = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        field: 'supplier_cost',
        fieldLabel: 'Supplier Quotation Cost',
        category: 'pricing',
        previousValue: null,
        newValue: newCostNum,
        currency: 'USD',
        quotationId,
        quotationNumber,
        quotationDocUrl: sourceFile?.fileUrl || null,
        note: `Imported from ${quotationNumber} (${finalSupplierName}, Qty: ${qtyNum}${uom}, Cost: $${newCostNum}/${uom}, List: $${listPrice}/${uom}, Disc: -${discNum}%)`
      };

      let currentProductId = item.productId || null;
      let currentVariantId = null;

      // CASE A: Update existing catalog product
      if (item.action === 'update' && item.productId) {
        const prodRef = dbAdmin.collection('products').doc(item.productId);
        const prodDoc = await prodRef.get();

        if (prodDoc.exists) {
          const variantsRef = prodRef.collection('variants');
          const varSnap = await variantsRef.get();

          if (varSnap.empty) {
            const newVarDoc = await variantsRef.add({
              dose: `${qtyNum}${uom}`,
              unit_price: newCostNum,
              price: newCostNum,
              supplierCost: newCostNum,
              moq: qtyNum,
              supplierId: finalSupplierId,
              supplierName: finalSupplierName,
              supplierPricing: updatedSupplierPricing,
              timeline: [timelineEntry],
              updatedAt: new Date().toISOString()
            });
            currentVariantId = newVarDoc.id;
          } else {
            const firstVar = varSnap.docs[0];
            currentVariantId = firstVar.id;
            const existingVarData = firstVar.data();
            const existingTimeline = Array.isArray(existingVarData.timeline) ? existingVarData.timeline : [];

            await firstVar.ref.update({
              unit_price: newCostNum,
              supplierCost: newCostNum,
              price: newCostNum,
              moq: qtyNum,
              supplierId: finalSupplierId,
              supplierName: finalSupplierName,
              supplierPricing: updatedSupplierPricing,
              timeline: [timelineEntry, ...existingTimeline].slice(0, 50),
              updatedAt: new Date().toISOString()
            });
          }

          await prodRef.update({
            supplierId: finalSupplierId,
            supplierName: finalSupplierName,
            supplier: finalSupplierName,
            supplierPricing: updatedSupplierPricing,
            // Keep denormalized fields in sync — no embedded variants array ever
            variantsCount: varSnap.size + (varSnap.empty ? 1 : 0),
            supplierIds: [...new Set(varSnap.docs.map(d => d.data().supplierId).filter(Boolean).concat(finalSupplierId))],
            minPrice: newCostNum,
            updatedAt: new Date().toISOString()
          });

          affectedProductIds.push(item.productId);
          updatedCount++;
        }
      } 
      // CASE B: Create new product in catalog
      else {
        const newProdRef = await dbAdmin.collection('products').add({
          canonicalName: item.peptide_name,
          name: item.peptide_name,
          category: targetCategory || 'Recovery & Repair',
          type: 'raw_material',
          status: 'active',
          isActive: true,
          supplierId: finalSupplierId,
          supplierName: finalSupplierName,
          supplier: finalSupplierName,
          supplierPricing: updatedSupplierPricing,
          // ── Denormalized fields (NO embedded variants array — subcollection only) ──
          variantsCount: 1,
          supplierIds: [finalSupplierId],
          presentations: ['vial'],
          minPrice: newCostNum,
          maxPrice: newCostNum,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        currentProductId = newProdRef.id;

        // Always write the variant to the subcollection — never to the parent doc array
        const newVarDoc = await dbAdmin.collection('products').doc(newProdRef.id).collection('variants').add({
          dose: `${qtyNum}${uom}`,
          dosage: `${qtyNum}${uom}`,
          purity: item.purity_or_grade || 'USP Grade',
          strength: item.purity_or_grade || 'USP Grade',
          moq: qtyNum,
          unit_price: newCostNum,
          price: newCostNum,
          supplierCost: newCostNum,
          supplierId: finalSupplierId,
          supplierName: finalSupplierName,
          supplierPricing: updatedSupplierPricing,
          isActive: true,
          isDefault: true,
          presentation: 'vial',
          productId: newProdRef.id,
          timeline: [timelineEntry],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        currentVariantId = newVarDoc.id;
        affectedProductIds.push(newProdRef.id);
        createdCount++;
      }

      quotationLineItems.push({
        lineIndex: i + 1,
        peptide_name: item.peptide_name,
        quantity: qtyNum,
        unit_of_measure: uom,
        purity_or_grade: item.purity_or_grade || 'USP / API Grade',
        unit_price: newCostNum,
        list_price: listPrice,
        discount_amount: itemDiscountAmount,
        line_total: lineTotal,
        productId: currentProductId,
        variantId: currentVariantId,
        action: item.action || 'create',
        status: quotationStatus === 'accepted' ? 'accepted' : 'pending'
      });
    }

    // Save the formal Supplier Quotation document in Firestore
    await quotationDocRef.set({
      id: quotationId,
      quotationNumber,
      supplierId: finalSupplierId,
      supplierName: finalSupplierName,
      quotationDate,
      validUntil: validUntilStr,
      status: quotationStatus, // 'received' | 'accepted' | 'rejected'
      paymentTerms,
      shippingCost: shippingNum,
      incoterm,
      currency: 'USD',
      grossSubtotal: Number(grossSubtotal.toFixed(2)),
      discountPercentage: discNum,
      discountAmount: Number(discountAmount.toFixed(2)),
      netSubtotal: Number(netSubtotal.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      sourceFile: sourceFile ? {
        fileName: sourceFile.fileName || 'Quotation_Document',
        fileUrl: sourceFile.fileUrl || '',
        fileSize: sourceFile.fileSize || 0,
        mimeType: sourceFile.mimeType || 'image/jpeg',
        uploadedAt: new Date().toISOString()
      } : null,
      items: quotationLineItems,
      notes: notes || `Extracted via AI OCR from ${sourceFile?.fileName || 'supplier quote'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update supplier metadata aggregates for 0ms lookups
    try {
      if (finalSupplierId) {
        await dbAdmin.collection('suppliers').doc(finalSupplierId).set({
          id: finalSupplierId,
          name: finalSupplierName,
          lastQuotationId: quotationId,
          lastQuotationNumber: quotationNumber,
          lastQuotationDate: quotationDate,
          defaultPaymentTerms: paymentTerms,
          defaultIncoterm: incoterm,
          defaultDiscount: discNum,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (supErr) {
      console.warn('[apply-price-list] Non-blocking supplier metadata update notice:', supErr);
    }

    return NextResponse.json({
      success: true,
      quotationId,
      quotationNumber,
      quotationDocUrl: sourceFile?.fileUrl || null,
      createdCount,
      updatedCount,
      affectedProductIds,
      finalSupplierId,
      finalSupplierName
    });
  } catch (err) {
    console.error('[apply-price-list] Error applying prices and saving quotation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to apply price list and save quotation' },
      { status: 500 }
    );
  }
}
