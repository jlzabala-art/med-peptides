import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const faqRepository = {
  /**
   * Fetch all FAQ records, including invisible or deprecated ones.
   */
  async getAllFaqs() {
    try {
      const snapshot = await getDocs(collection(db, 'peptide_faq'));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error("Error fetching all faqs:", error);
      throw error;
    }
  },

  /**
   * Fetch all faq-to-product mapping relationships.
   */
  async getFaqMappings() {
    try {
      const snapshot = await getDocs(collection(db, 'faq_peptide_mapping'));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error("Error fetching faq mappings:", error);
      throw error;
    }
  }
};
