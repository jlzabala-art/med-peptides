/**
 * repositories/index.js — Punto de entrada centralizado para todos los repositorios.
 * 
 * REGLA DE ORO: Importa siempre desde aquí en vez de desde Firestore directamente.
 * Esto garantiza que podemos cambiar la fuente de datos (Firestore → API → cache)
 * sin tocar los componentes UI.
 * 
 * @example
 *   import { productRepository, userRepository } from '@/repositories';
 */

export { default as productRepository } from './productRepository';
export { default as catalogRepository } from './catalogRepository';
export { default as protocolRepository } from './protocolRepository';
export { default as supplementRepository } from './supplementRepository';
export { default as navigationRepository } from './navigationRepository';
export { default as faqRepository } from './faqRepository';
export { default as emailCampaignRepository } from './emailCampaignRepository';
export { default as userRepository } from './userRepository';
export { default as orderRepository } from './orderRepository';
export { default as patientRepository } from './patientRepository';
export { default as inventoryRepository } from './inventoryRepository';
export { default as wholesalerRepository } from './wholesalerRepository';
export { default as appointmentRepository } from './appointmentRepository';
export { default as biomarkersRepository } from './biomarkersRepository';


