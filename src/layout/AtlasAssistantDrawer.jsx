import React from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import ClinicalAssistant from '@/components/shared/ClinicalAssistant';
import { useAtlasContext } from '@/hooks/shared/useAtlasContext';
import { Cpu } from '@/lib/icons';

export default function AtlasAssistantDrawer({ isOpen, onClose }) {
  const { 
    contextMode, 
    agentType, 
    suggestedPrompts, 
    assistantName, 
    themeAccent 
  } = useAtlasContext();

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeAccent }}>
          <Cpu size={22} />
          <span style={{ fontWeight: 600 }}>{assistantName}</span>
        </div>
      }
      width="500px" // Standardized width
    >
      {/* We pass embedded=true so it fits natively into the StandardDrawer body */}
      <ClinicalAssistant 
        isOpen={isOpen} 
        setIsOpen={onClose} 
        embedded={true}
        contextMode={contextMode}
        agentType={agentType}
        suggestedPrompts={suggestedPrompts}
      />
    </StandardDrawer>
  );
}
