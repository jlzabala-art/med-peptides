 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const faqRepository = {
  /**
   * Fetch all FAQ records from Firestore.
   * Each doc already embeds:
   *   - product_ids[]   — canonical product doc IDs
   *   - protocol_ids[]  — related protocol IDs
   *   - is_global       — true if not product-specific
   */
  async getAllFaqs() {
    try {
      const snapshot = await getDocs(collection(db, 'peptide_faq'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  /**
   * Fetch FAQs for a specific product by its canonical ID.
   * Uses the product doc's embedded faq_ids[] array.
   */
  async getFaqsForProduct(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) return [];

      const faqIds = productSnap.data().faq_ids || [];
      if (!faqIds.length) return [];

      // Fetch each FAQ by its ID directly (no mapping needed)
      const faqDocs = await Promise.all(
        faqIds.map(faqId => getDoc(doc(db, 'peptide_faq', faqId)))
      );

      return faqDocs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error(`Error fetching FAQs for product ${productId}:`, error);
      throw error;
    }
  }
};
