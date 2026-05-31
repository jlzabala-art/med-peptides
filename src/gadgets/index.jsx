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

// Define the custom element if it hasn't been defined yet
if (!customElements.get('ai-importer')) {
  customElements.define('ai-importer', AIImporterElement);
}
