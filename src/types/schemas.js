/**
 * @typedef {Object} User
 * @property {string} id - The user's UID from Firebase Auth
 * @property {string} email - The user's email address
 * @property {string} role - User role (e.g. 'admin', 'doctor', 'patient', 'wholesaler')
 * @property {string} [fullName] - The user's full name
 * @property {string} [displayName] - Alternative display name
 * @property {boolean} approved - Whether the user has been approved by admin
 * @property {Date|string} createdAt - Account creation timestamp
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Firestore document ID
 * @property {string} name - Product name
 * @property {string} [sku] - Product SKU
 * @property {string} category - Product category
 * @property {number} price - Base price of the product
 * @property {number} stock - Current inventory stock
 * @property {string} [status] - 'active' | 'inactive'
 */

/**
 * @typedef {Object} Protocol
 * @property {string} id - Firestore document ID
 * @property {string} protocol_name - Display name of the protocol
 * @property {string} status - 'draft' | 'active' | 'archived'
 * @property {string} [overview_summary] - Brief summary of the protocol
 * @property {string} [therapeutic_category] - Category of therapy
 * @property {ProtocolPhase[]} phases - Array of phases in the protocol
 * @property {Date|string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} ProtocolPhase
 * @property {number} phase_index - Index of the phase (1-based)
 * @property {number} duration_weeks - Duration in weeks
 * @property {string} product_id - Reference ID to the product
 * @property {string} dosage - Dosage instructions
 */

/**
 * @typedef {Object} Prescription
 * @property {string} id - Firestore document ID
 * @property {string} patientId - Reference ID to the patient User
 * @property {string} patientName - Denormalized patient name
 * @property {string} doctorId - Reference ID to the prescribing doctor User
 * @property {string} [protocolId] - Reference ID to the assigned protocol (if applicable)
 * @property {string} status - e.g. 'active', 'draft', 'fulfilled', 'cancelled'
 * @property {PrescriptionItem[]} items - Array of prescribed items
 * @property {Date|string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} PrescriptionItem
 * @property {string} productId - Reference ID to the product
 * @property {string} [customName] - Custom name if product not linked
 * @property {string} dosage - Dosage instructions
 * @property {number} quantity - Quantity prescribed
 */

export {};
