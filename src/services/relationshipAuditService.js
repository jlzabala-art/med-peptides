 
import { productRepository } from '../repositories/productRepository.js';
import { protocolRepository } from '../repositories/protocolRepository.js';
import { faqRepository } from '../repositories/faqRepository.js';

/**
 * Service to execute a full structural audit 
 * across Products, Protocols, and FAQs.
 */
export const relationshipAuditService = {
  
  async generateAuditReport() {
    try {
      const [products, protocols, faqs, faqMappings] = await Promise.all([
        productRepository.getAllProducts(),
        protocolRepository.getAllProtocols(),
        faqRepository.getAllFaqs(),
        faqRepository.getFaqMappings()
      ]);

      const report = {
        summary: {
          totalProducts: products.length,
          totalProtocols: protocols.length,
          totalFaqs: faqs.length,
          totalFaqMappings: faqMappings.length,
        },
        warnings: [],
        issues: []
      };

      // 1. Audit Products for Missing Fields
      products.forEach(p => {
        if (!p.name) report.issues.push({ type: "PRODUCT_MISSING_NAME", refId: p.id });
        if (!p.slug && !p.name) report.warnings.push({ type: "PRODUCT_MISSING_SLUG", refId: p.id, name: p.name });
      });

      // 2. Audit Protocols for orphaned peptide references
      // Assuming protocols.peptides holds array of product names
      const productNames = new Set(products.map(p => (p.name || '').toLowerCase()));
      const productAliases = new Set(products.flatMap(p => p.searchAliases || []).map(a => a.toLowerCase()));
      
      protocols.forEach(proto => {
        if (!proto.peptides || !Array.isArray(proto.peptides)) {
          report.warnings.push({ type: "PROTOCOL_MISSING_PEPTIDES_ARRAY", refId: proto.id, title: proto.title });
          return;
        }

        proto.peptides.forEach(peptide => {
          const lowerToken = typeof peptide === 'string' ? peptide.toLowerCase() : '';
          const found = productNames.has(lowerToken) || productAliases.has(lowerToken);
          
          if (!found) {
            report.issues.push({
              type: "ORPHANED_PROTOCOL_PEPTIDE",
              refId: proto.id,
              protocolTitle: proto.title,
              invalidReference: peptide
            });
          }
        });
      });

      // 3. Audit FAQ Mappings for orphaned links
      const activeFaqIds = new Set(faqs.map(f => f.faqId || f.id));
      faqMappings.forEach(mapping => {
        if (!mapping.faqId || !activeFaqIds.has(mapping.faqId)) {
          report.issues.push({
            type: "ORPHANED_FAQ_MAPPING",
            refId: mapping.id || 'unknown',
            faqId: mapping.faqId,
            peptideName: mapping.peptideName
          });
        }
        
        if (mapping.peptideName) {
           const lowerName = mapping.peptideName.toLowerCase();
           if (!productNames.has(lowerName) && !productAliases.has(lowerName)) {
              report.issues.push({
                 type: "FAQ_MAPPING_INVALID_PRODUCT",
                 refId: mapping.id,
                 invalidReference: mapping.peptideName
              });
           }
        }
      });

      return report;
    } catch (err) {
      console.error("Audit Service Failed:", err);
      throw err;
    }
  }
};
