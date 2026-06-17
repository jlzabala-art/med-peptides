import React from 'react';
import ReactDOM from 'react-dom/client';
import GadgetImportTab from './GadgetImportTab';

class AIImporterElement extends HTMLElement {
  connectedCallback() {
    const context = this.getAttribute('context') || 'PriceList';
    const apiUrl = this.getAttribute('api-url') || 'https://us-central1-med-peptides-app.cloudfunctions.net/apiParseDocument';
    const apiKey = this.getAttribute('api-key') || '';
    const title = this.getAttribute('title') || 'Data Importer';
    const description = this.getAttribute('description') || '';

    const root = ReactDOM.createRoot(this);
    root.render(
      <GadgetImportTab 
        context={context} 
        apiUrl={apiUrl} 
        apiKey={apiKey}
        title={title}
        description={description}
        onSave={(data) => {
          this.dispatchEvent(new CustomEvent('import-complete', { 
            detail: data,
            bubbles: true,
            composed: true
          }));
        }}
      />
    );
  }
}

// Define the AI Importer custom element
if (!customElements.get('ai-importer')) {
  customElements.define('ai-importer', AIImporterElement);
}

import CatalogIntelligenceHub from '../components/admin/catalog/CatalogIntelligenceHub';

class CatalogHubElement extends HTMLElement {
  connectedCallback() {
    const readOnly = this.getAttribute('readonly') === 'true';
    const ownerId = this.getAttribute('owner-id') || null;
    const ownerType = this.getAttribute('owner-type') || 'admin';
    const hideCosts = this.getAttribute('hide-costs') === 'true';
    
    const root = ReactDOM.createRoot(this);
    root.render(
      <CatalogIntelligenceHub 
        readOnly={readOnly}
        ownerId={ownerId}
        ownerType={ownerType}
        hideCosts={hideCosts}
      />
    );
  }
}

// Define the Catalog Hub custom element
if (!customElements.get('catalog-hub-gadget')) {
  customElements.define('catalog-hub-gadget', CatalogHubElement);
}
