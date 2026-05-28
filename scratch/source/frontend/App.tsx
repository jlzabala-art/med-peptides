
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OrchestrationView, DataLayerView, ApiGatewayView } from './components/Views';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orchestration');

  const renderContent = () => {
    switch (activeTab) {
      case 'orchestration':
        return <OrchestrationView />;
      case 'data':
        return <DataLayerView />;
      case 'api':
        return <ApiGatewayView />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
            Module '{activeTab}' is currently under maintenance or not implemented in this view.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden selection:bg-brand-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
