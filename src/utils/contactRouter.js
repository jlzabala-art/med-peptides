import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Resolves the contact details and WhatsApp links for a given catalog,
 * dynamically routing inquiries to the wholesaler/owner or falling back to global admin support.
 *
 * @param {Object} catalog - The catalog document
 * @param {Object} [userProfile] - The currently logged-in user profile, if any
 * @returns {Promise<{ email: string, phone: string, whatsAppLink: string|null, ownerName: string }>}
 */
export async function resolveCatalogContact(catalog, userProfile = null) {
  // If catalog has branding-specific contact options, use them
  if (catalog?.branding?.contactEmail || catalog?.branding?.contactPhone) {
    const email = catalog.branding.contactEmail || '';
    const phone = catalog.branding.contactPhone || '';
    return {
      email,
      phone,
      whatsAppLink: phone
        ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
        : null,
      ownerName: catalog.branding.companyName || 'Catalog Support'
    };
  }

  // Fallback 1: If catalog has an ownerId, fetch owner details from users collection
  if (catalog?.ownerId && catalog?.ownerId !== 'admin') {
    try {
      const userSnap = await getDoc(doc(db, 'users', catalog.ownerId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const email = userData.email || '';
        const phone = userData.phone || userData.mobile || '';
        return {
          email,
          phone,
          whatsAppLink: phone
            ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
            : null,
          ownerName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Assigned Wholesaler'
        };
      }
    } catch (e) {
      console.error('Error resolving catalog owner contact:', e);
    }
  }

  // Fallback 2: Global admin contact
  return {
    email: 'support@med-peptides.com',
    phone: '+18005550199',
    whatsAppLink: 'https://wa.me/18005550199',
    ownerName: 'Atlas Health Support'
  };
}
