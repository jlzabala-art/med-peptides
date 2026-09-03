/**
 * repositories/configRepository.js
 *
 * Data-access layer para configuración global de la aplicación.
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

const VIEW_CONFIGS_COLLECTION = 'viewConfigs';

/**
 * Obtiene la configuración de agentes de AI.
 * @returns {Promise<object|null>}
 */
export async function getAiAgents() {
  const agentSnap = await getDoc(doc(db, 'ai_config', 'agents'));
  return agentSnap.exists() ? agentSnap.data() : null;
}

/**
 * Obtiene todas las configuraciones de vistas.
 * @returns {Promise<Array<object>>}
 */
export async function getViewConfigs() {
  try {
    const q = query(collection(db, VIEW_CONFIGS_COLLECTION));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    logger.error('Error fetching view configs', { error });
    throw error;
  }
}

/**
 * Guarda o actualiza una configuración de vista.
 * @param {string} id
 * @param {object} configData
 * @returns {Promise<void>}
 */
export async function saveViewConfig(id, configData) {
  try {
    const ref = doc(db, VIEW_CONFIGS_COLLECTION, id);
    await setDoc(ref, {
      ...configData,
      updatedAt: new Date().toISOString(),
    });
    logger.info('Saved view config', { id });
  } catch (error) {
    logger.error('Error saving view config', { id, error });
    throw error;
  }
}

/**
 * Obtiene los mercados globales.
 * @returns {Promise<Array<object>>}
 */
export async function getGlobalMarkets() {
  try {
    const q = query(collection(db, 'global_markets'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    logger.error('Error fetching global markets', { error });
    return [];
  }
}

/**
 * Elimina una configuración de vista.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteViewConfig(id) {
  try {
    await deleteDoc(doc(db, VIEW_CONFIGS_COLLECTION, id));
    logger.info('Deleted view config', { id });
  } catch (error) {
    logger.error('Error deleting view config', { id, error });
    throw error;
  }
}

const configRepository = {
  getAiAgents,
  getViewConfigs,
  saveViewConfig,
  deleteViewConfig,
  getGlobalMarkets,
};

export default configRepository;
