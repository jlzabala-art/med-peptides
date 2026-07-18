import React from 'react';
import { EMAIL_TEMPLATE_REGISTRY } from '../../data/emailTemplateRegistry';
import AdminEmailTemplatesTabClient from './AdminEmailTemplatesTabClient';

export default function AdminEmailTemplatesTab({ isSubTab }) {
  // Server-side data processing
  // Serializing the HTML output so it can be passed as a prop to the Client Component
  const serializedTemplates = EMAIL_TEMPLATE_REGISTRY.map((template) => {
    let previewHtml = '';
    try {
      if (typeof template.getHtml === 'function') {
        previewHtml = template.getHtml();
      }
    } catch (e) {
      previewHtml = `<p style="color:red">Preview error: ${e.message}</p>`;
    }
    
    // We omit the getHtml function from the serialized object to avoid Next.js serialization errors
    const { getHtml, ...serializableTemplate } = template;
    
    return {
      ...serializableTemplate,
      previewHtml
    };
  });

  return <AdminEmailTemplatesTabClient templates={serializedTemplates} isSubTab={isSubTab} />;
}
