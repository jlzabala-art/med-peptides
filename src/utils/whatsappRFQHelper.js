/**
 * whatsappRFQHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Formats a Request For Quotation (RFQ) into a structured, professional
 * WhatsApp message for instant dispatch to suppliers and freight forwarders.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function buildWhatsAppRFQMessage(rfq) {
  if (!rfq) return '';

  const rfqId = rfq.rfqNumber || rfq.prfqId || rfq.id || 'RFQ-2026';
  const pickup = rfq.pickupLocation || {};
  const delivery = rfq.deliveryLocation || {};
  const cargo = rfq.cargoSpecs || {};

  return `*🚨 REQUEST FOR QUOTATION (RFQ) — ${rfqId}*
────────────────────────────
*Service:* Medical Cold-Chain Express Logistics (2°C – 8°C)

📍 *ORIGIN (PICKUP LOCATION):*
• *Facility:* ${pickup.facilityName || 'Magenta Health LLC'}
• *Address:* ${pickup.street || 'Building 64, Block A, Suite 302, Dubai Healthcare City (DHCC)'}
• *City / Country:* ${pickup.city || 'Dubai'}, ${pickup.countryName || 'United Arab Emirates'}
• *Contact Person:* ${pickup.contactPerson || 'Lynn Iglesia'}
• *Phone / WhatsApp:* ${pickup.phone || '+971 4 222 2500'}
• *Pickup Hours:* ${pickup.operatingHours || 'Mon-Fri, 09:00 - 17:00 (GST)'}

🏁 *DESTINATION (DELIVERY LOCATION):*
• *Facility:* ${delivery.facilityName || 'KM+ clinic'}
• *Address:* ${delivery.street || 'Konstitucijos pr. 15'}
• *Postal Code / City:* ${delivery.postalCode || 'LT-09319'}, ${delivery.city || 'Vilnius'}
• *Country:* ${delivery.countryName || 'Lithuania'}
• *Contact:* ${delivery.contactPerson || 'Medical Reception & Pharmacy Storage'}
• *Phone:* ${delivery.phone || '+370 5 200 0000'}

📦 *CARGO SPECIFICATIONS:*
• *Item Description:* ${cargo.itemDescription || '6 × Prefilled Single-Cartridge Injector Pens'}
• *Gross Weight:* ${cargo.grossWeightKg ? `${cargo.grossWeightKg} kg` : '2.0 kg'}
• *Dimensions:* ${cargo.dimensionsCm ? `${cargo.dimensionsCm.length}x${cargo.dimensionsCm.width}x${cargo.dimensionsCm.height} cm` : '25x20x15 cm'}
• *Temperature Range:* ${cargo.temperatureRequirement || '2°C to 8°C (Do Not Freeze)'}
• *Packaging:* ${cargo.isothermalPackaging || '72h Validated Isothermal Shipper + USB Temp Logger'}
• *Incoterm:* ${rfq.incoterm || 'DAP (Delivered at Place, Vilnius)'}

────────────────────────────
💬 *Please reply with:*
1. Total All-Inclusive Net Cost (EUR or USD)
2. Estimated Transit Time (Door-to-Door Days)
3. Earliest Available Pickup Date

Thank you!`;
}

export function buildWhatsAppRFQUrl(rfq, supplierPhone = '') {
  const message = buildWhatsAppRFQMessage(rfq);
  const cleanPhone = (supplierPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
