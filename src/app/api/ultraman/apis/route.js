/**
 * src/app/api/ultraman/apis/route.js
 * 
 * Official API endpoint for Ultraman / UltraPerson APIs (Pharmapolis Compounding Pharmacy).
 */

import { NextResponse } from 'next/server';
import { getUltramanApis } from '@/repositories/ultramanApiRepository';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const priority = searchParams.get('priority');
    const forceRefresh = searchParams.get('refresh') === 'true';

    let apis = await getUltramanApis({ forceRefresh });

    if (query) {
      apis = apis.filter(item => 
        (item.name || '').toLowerCase().includes(query) ||
        (item.spec || '').toLowerCase().includes(query) ||
        (item.id || '').toLowerCase().includes(query)
      );
    }

    if (priority) {
      apis = apis.filter(item => item.priority === priority);
    }

    return NextResponse.json({
      success: true,
      total: apis.length,
      supplier: {
        id: 'supplier-pharmapolis',
        name: 'Pharmapolis Compounding Pharmacy',
        hub: 'Plovdiv, Bulgaria'
      },
      data: apis
    }, { status: 200 });
  } catch (error) {
    console.error('❌ [API /api/ultraman/apis] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Ultraman APIs'
    }, { status: 500 });
  }
}
