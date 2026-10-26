import { NextResponse } from 'next/server';
import { seedMcgSupplierAndProduct, MCG_SUPPLIER_DOC } from '@/scripts/seedMcgSupplierAndProduct.mjs';

export async function GET() {
  try {
    await seedMcgSupplierAndProduct();
    return NextResponse.json({
      success: true,
      message: 'MCG Cosmetics supplier and Kapigen 5% Procapil product seeded successfully.',
      supplier: MCG_SUPPLIER_DOC.id,
      productId: 'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack'
    });
  } catch (error) {
    console.error('[API/admin/seed-mcg] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
