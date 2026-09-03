import { NextResponse } from 'next/server';
import { productRepositoryServer } from '@/repositories/productRepository.server';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRICING_TIER } from '@/constants/productEnums';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      supplierId = null,
      catalogueFilter = null,
      category = 'all',
      currency = 'USD',
      markupPercent = 0
    } = body;

    const products = await productRepositoryServer.getProducts({
      supplierId,
      catalogueFilter,
      category,
      limitCount: 300
    });

    const exportItems = [];

    products.forEach(p => {
      const variants = p.variants || [];
      variants.forEach(v => {
        // Resolve cost base
        const priceInfo = resolveVariantPrice(v, {
          tier: PRICING_TIER.MASTER,
          targetCurrency: currency
        });

        let unitPrice = priceInfo.perUnit;
        let kitPrice = priceInfo.kit;

        // Apply commercial markup if specified
        if (markupPercent > 0) {
          const factor = 1 + (Number(markupPercent) / 100);
          if (unitPrice != null) unitPrice = unitPrice * factor;
          if (kitPrice != null) kitPrice = kitPrice * factor;
        }

        exportItems.push({
          productId: p.id,
          name: p.name,
          variantId: v.id,
          refCode: v.sku || v.refCode || `PEP-${(p.name || 'PEP').slice(0, 3).toUpperCase()}-01`,
          dosage: v.dosage || v.fill_volume || '-',
          presentation: v.format || v.presentation || 'Vial',
          category: p.category || 'Peptides',
          goal: p.goal || p.target || '-',
          casNumber: p.casNumber || p.cas || '-',
          supplier: v.supplier || p.supplier || 'Atlas Network',
          price: unitPrice,
          kitPrice: kitPrice,
          inStock: v.inStock !== false && v.isActive !== false
        });
      });
    });

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      totalVariants: exportItems.length,
      items: exportItems
    });

  } catch (error) {
    console.error('[/api/catalog/export] Error exporting catalogue:', error);
    return NextResponse.json({ error: error.message || 'Failed to export catalogue' }, { status: 500 });
  }
}
