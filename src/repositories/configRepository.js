/**
 * repositories/configRepository.js
 *
 * Data-access layer para configuración global de la aplicación.
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Obtiene la configuración de agentes de AI.
 * @returns {Promise<object|null>}
 */
export async function getAiAgents() {
  const agentSnap = await getDoc(doc(db, 'ai_config', 'agents'));
  return agentSnap.exists() ? agentSnap.data() : null;
}

const configRepository = {
  getAiAgents,
};

export default configRepository;
