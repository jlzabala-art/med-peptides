import { z } from 'zod';

export const PrescriptionLineSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().optional(),
  variantId: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  instructions: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  durationDays: z.number().int().positive().optional(),
  refills: z.number().int().nonnegative().default(0),
});

export const PrescriptionSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().optional(),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  doctorName: z.string().optional(),
  clinicId: z.string().optional(),
  status: z.enum(['draft', 'pending', 'approved', 'processing', 'en tránsito', 'completed', 'cancelled']).default('pending'),
  prescriptionLines: z.array(PrescriptionLineSchema).min(1, 'At least one prescription line is required'),
  clinicalNotes: z.string().optional(),
  diagnosis: z.string().optional(),
  validUntil: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export function validatePrescription(data) {
  return PrescriptionSchema.safeParse(data);
}
