// src/skills/clinical_portal.js
/**
 * Clinical Portal Skill
 * -------------------------------------------------
 * Responsibilities:
 *   • Load role‑specific dashboard data (patient, doctor, admin)
 *   • Manage doctor‑patient assignments
 *   • Build and manipulate carts (products & protocols)
 *   • Submit orders and track their status
 *   • Map recommendations to user context
 */

/** Load dashboard data based on role */
export async function loadUserDashboard(user, services) {
  const { profileService, orderService, recommendationService } = services;
  const profile = await profileService.getProfile(user.id);
  const recs = await recommendationService.getForUser(user.id);
  const orders = await orderService.listByUser(user.id);
  return { profile, recommendations: recs, orders };
}

/** Assign a doctor to a patient */
export async function assignDoctorToPatient(patientId, doctorId, assignmentRepo) {
  const existing = await assignmentRepo.find({ patientId, doctorId });
  if (existing) return existing; // already assigned
  return assignmentRepo.create({ patientId, doctorId, assignedAt: new Date() });
}

/** Create a new cart object */
export function createCart() {
  return {
    items: [], // each item: {type:'product'|'protocol', id, quantity}
    addItem(item) {
      this.items.push(item);
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
    },
    totalQuantity() {
      return this.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    },
  };
}

/** Submit an order – returns orderId */
export async function submitOrder(cart, user, orderRepo, pricingEngine) {
  // 1. price each item
  const pricedItems = await Promise.all(
    cart.items.map(async (it) => {
      const price = await pricingEngine.calculate(it, user.tier);
      return { ...it, price };
    })
  );
  const total = pricedItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const order = await orderRepo.create({
    userId: user.id,
    items: pricedItems,
    total,
    status: 'pending',
    createdAt: new Date(),
  });
  return order.id;
}

/** Track order progress – returns array of status objects */
export async function trackOrderProgress(orderId, orderRepo, logisticsService) {
  const order = await orderRepo.get(orderId);
  if (!order) throw new Error('Order not found');
  const shipment = await logisticsService.getShipmentByOrder(orderId);
  const tracking = await logisticsService.getTrackingUpdates(shipment.trackingNumber);
  return { orderStatus: order.status, shipmentStatus: shipment.status, tracking };
}

/** Map recommendations (product/protocol IDs) to full objects using look‑ups */
export function mapRecommendations(recs, productLookup, protocolLookup) {
  return recs.map(r => {
    if (r.type === 'product') return { ...r, data: productLookup[r.id] || null };
    if (r.type === 'protocol') return { ...r, data: protocolLookup[r.id] || null };
    return r;
  });
}

export default {
  loadUserDashboard,
  assignDoctorToPatient,
  createCart,
  submitOrder,
  trackOrderProgress,
  mapRecommendations,
};
