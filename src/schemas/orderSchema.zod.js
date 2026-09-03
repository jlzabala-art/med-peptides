import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  name: z.string().min(1),
  dosage: z.string().optional(),
  supplier: z.string().optional(),
  supplierId: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  supplierInvoiceNumber: z.string().optional(),
  supplierInvoiceStatus: z.enum(['pending', 'paid']).default('pending'),
  signedPrescriptionUrl: z.string().optional(),
  productionStatus: z.enum(['pending', 'production', 'done', 'canceled']).default('pending'),
  supplierShippingCost: z.number().nonnegative().optional(),
  supplierItemsCost: z.number().nonnegative().optional(),
  role: z.enum(['patient', 'doctor', 'clinic', 'wholesaler', 'supplier', 'admin']).default('patient'),
  status: z.enum(['draft', 'awaiting payment', 'processing', 'en tránsito', 'delivered', 'disputed', 'cancelled']).default('awaiting payment'),
  currency: z.string().default('USD'),
  subtotal: z.number().nonnegative(),
  shippingFee: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  shippingAddress: z.record(z.string(), z.any()).optional(),
  billingAddress: z.record(z.string(), z.any()).optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  notes: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export function validateOrder(data) {
  return OrderSchema.safeParse(data);
}
