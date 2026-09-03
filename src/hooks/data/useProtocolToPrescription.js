'use client';
/**
 * hooks/data/useProtocolToPrescription.js
 *
 * Hook de flujo completo: Protocolo → Prescripción.
 *
 * Orquesta:
 * 1. Extrae los productos del protocolo
 * 2. Crea un borrador de prescripción con createFromProtocol
 * 3. Retorna el ID de la nueva prescripción para que el componente navegue
 *
 * Uso:
 *   const { initiateFromProtocol, isLoading, prescriptionId } = useProtocolToPrescription();
 *   const id = await initiateFromProtocol(protocol, { doctorId, patientId });
 *   router.push(`/prescriptions/${id}`);
 *
 * El hook NO navega por sí solo — devuelve el ID y el componente decide qué hacer.
 */

import { useCreatePrescriptionFromProtocol } from './usePrescriptionsQuery';
import { useProtocolProducts } from './useProtocolProductsSync';

/**
 * @param {object|null} protocol  — Protocolo activo (puede ser null si aún no se ha cargado)
 * @param {{ enabled?: boolean }} opts
 */
export function useProtocolToPrescription(protocol = null, opts = {}) {
  const { enabled = true } = opts;

  // Pre-carga los productos del protocolo para poder incluirlos en el estado
  const { productsList, isLoading: productsLoading } = useProtocolProducts(protocol, { enabled });

  // Mutación de creación
  const { createFromProtocol, isCreating, newPrescriptionId } = useCreatePrescriptionFromProtocol();

  /**
   * Inicia el flujo de creación de prescripción desde un protocolo.
   *
   * @param {object} proto — El objeto protocolo (puede diferir del `protocol` del hook si el doctor está en otra vista)
   * @param {{ doctorId?: string, patientId?: string, notes?: string }} overrides
   * @returns {Promise<string>} — ID de la nueva prescripción creada
   */
  const initiateFromProtocol = async (proto, overrides = {}) => {
    const target = proto || protocol;
    if (!target) throw new Error('[useProtocolToPrescription] Protocol is required');
    return await createFromProtocol({ protocol: target, overrides });
  };

  return {
    initiateFromProtocol,
    isLoading: isCreating || productsLoading,
    isCreating,
    prescriptionId: newPrescriptionId,
    // Info de productos para mostrar en el botón (ej: "Iniciar Prescripción (5 productos)")
    productCount: productsList.length,
    products: productsList,
  };
}
