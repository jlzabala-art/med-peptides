import { productRepository } from '../repositories/productRepository';
import { protocolRepository } from '../repositories/protocolRepository';
import { faqRepository } from '../repositories/faqRepository';

/**
 * Service to execute deep data exports.
 */
export const exportService = {
  
  /**
   * Export all products.
   * mode: "raw" (shallow) or "expanded" (includes resolved relationships)
   */
  async exportProducts(mode = "raw") {
    const products = await productRepository.getAllProducts();
    
    if (mode === "raw") {
      return products;
    }

    // Expanded mode: Fetch faqs and protocols and attach full references
    const [protocols, mappings, faqs] = await Promise.all([
      protocolRepository.getAllProtocols(),
      faqRepository.getFaqMappings(),
      faqRepository.getAllFaqs()
    ]);

    const activeFaqMap = new Map(faqs.map(f => [f.faqId || f.id, f]));

    return products.map(product => {
      const pName = (product.name || '').toLowerCase();
      
      // Find matching protocols
      const linkedProtocols = protocols.filter(proto => 
        (proto.peptides || []).some(pep => typeof pep === 'string' && pep.toLowerCase() === pName)
      ).map(p => ({ protocol_id: p.protocol_id, title: p.title }));

      // Find matched FAQs
      const productMappings = mappings.filter(m => (m.peptideName || '').toLowerCase() === pName);
      const linkedFaqs = productMappings.map(m => activeFaqMap.get(m.faqId)).filter(Boolean);

      return {
        ...product,
        _expandedRelations: {
          protocols: linkedProtocols,
          faqs: linkedFaqs
        }
      };
    });
  },

  /**
   * Export all protocols.
   */
  async exportProtocols(mode = "raw") {
    const protocols = await protocolRepository.getAllProtocols();
    
    if (mode === "raw") {
      return protocols;
    }

    const products = await productRepository.getAllProducts();
    const productNames = new Map(products.map(p => [(p.name || '').toLowerCase(), p]));

    return protocols.map(proto => {
      const linkedProducts = (proto.peptides || [])
        .map(pep => {
           const lowerPep = typeof pep === 'string' ? pep.toLowerCase() : '';
           return productNames.get(lowerPep);
        })
        .filter(Boolean);

      return {
        ...proto,
        _expandedRelations: {
          peptides: linkedProducts
        }
      };
    });
  },

  /**
   * Export all FAQs.
   */
  async exportFaqs(mode = "raw") {
    const faqs = await faqRepository.getAllFaqs();
    
    if (mode === "raw") {
      return faqs;
    }

    const mappings = await faqRepository.getFaqMappings();
    const mapByFaqId = {};
    mappings.forEach(m => {
       if (!mapByFaqId[m.faqId]) mapByFaqId[m.faqId] = [];
       mapByFaqId[m.faqId].push(m.peptideName);
    });

    return faqs.map(faq => {
      const relatedProductNames = mapByFaqId[faq.faqId || faq.id] || [];
      return {
        ...faq,
        _expandedRelations: {
          associatedProducts: relatedProductNames
        }
      };
    });
  }
};
