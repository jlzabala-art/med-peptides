/**
 * src/app/api/ultraman/calculate-cost/route.js
 * 
 * Interactive calculation endpoint for Ultraman / UltraPerson Compounding Costs.
 * Reconstructs Pharmapolis CAT-CAP v1.1 model + Cost Structure DOCX.
 */

import { NextResponse } from 'next/server';
import { calculatePharmapolisCost } from '@/services/pharmapolisCostEngine';
import { getUltramanApis } from '@/repositories/ultramanApiRepository';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      activeIngredients = [],
      capsPerBottle = 60,
      grossMargin = 0.15,
      formulaName = 'Custom Formula'
    } = body;

    if (!Array.isArray(activeIngredients) || activeIngredients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'activeIngredients array is required'
      }, { status: 400 });
    }

    const apisCatalog = await getUltramanApis();

    const result = calculatePharmapolisCost({
      activeIngredients,
      capsPerBottle,
      grossMargin,
      apisCatalog
    });

    return NextResponse.json({
      success: true,
      formulaName,
      supplier: {
        id: 'supplier-pharmapolis',
        name: 'Pharmapolis Compounding Pharmacy',
        standard: 'CAT-CAP Costing model v1.1'
      },
      calculation: result
    }, { status: 200 });
  } catch (error) {
    console.error('❌ [API /api/ultraman/calculate-cost] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate compounding cost'
    }, { status: 500 });
  }
}
