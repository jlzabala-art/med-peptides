import { generateSignedQuoteToken, calculateChannelPrice } from '@/services/dynamicPricingEngine';
import { shareQuoteSchema } from '@/schemas/apiSchemas';
import { apiSuccess, apiValidationError, apiError } from '@/lib/apiResponse';

export async function POST(request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = shareQuoteSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error, 'Invalid quote payload');
    }

    const {
      items,
      channel,
      clientName,
      clientEmail,
      currency,
      validityHours,
      notes,
    } = parseResult.data;

    // Process and calculate each line item with channel pricing rules
    let totalSubtotal = 0;
    let totalColdChain = 0;
    const processedItems = items.map(item => {
      const pricing = calculateChannelPrice({
        baseCost: item.cost || item.netCost || 0,
        listPrice: item.price || item.unitPrice || 0,
        channel,
        targetCurrency: currency,
        requiresColdChain: Boolean(item.requiresColdChain),
        quantity: item.quantity || 1
      });

      totalSubtotal += pricing.subtotal;
      totalColdChain = Math.max(totalColdChain, pricing.coldChainFee);

      return {
        id: item.id || item.productId || item.name || 'item',
        name: item.name || item.canonicalName || 'Compounded Formulation',
        dosage: item.dosage || null,
        sku: item.sku || null,
        quantity: item.quantity || 1,
        unitPrice: pricing.unitPrice,
        subtotal: pricing.subtotal,
        currency
      };
    });

    const grandTotal = totalSubtotal + totalColdChain;

    const quotePayload = {
      quoteId: `Q-${Date.now().toString(36).toUpperCase()}`,
      clientName,
      clientEmail,
      channel,
      currency,
      items: processedItems,
      subtotal: Number(totalSubtotal.toFixed(2)),
      coldChainFee: Number(totalColdChain.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      notes,
      validityHours,
      issuedAt: new Date().toISOString()
    };

    const token = generateSignedQuoteToken(quotePayload, validityHours);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableUrl = `${origin}/shared/quote/${token}`;

    return apiSuccess({
      quoteId: quotePayload.quoteId,
      shareableUrl,
      token,
      quote: quotePayload
    });

  } catch (error) {
    console.error('Quote generation error:', error);
    return apiError(error.message || 'Failed to generate signed quote', 500, 'QUOTE_GENERATION_ERROR');
  }
}
