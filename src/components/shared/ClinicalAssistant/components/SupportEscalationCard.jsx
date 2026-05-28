/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SupportEscalationCard({ 
  showSupportCard, 
  isOpen, 
  dismissSupportCard, 
  buildWhatsAppUrl, 
  trackSupportEvent, 
  trackAIToWhatsApp, 
  sessionId, 
  supportContext, 
  messagesSent 
}) {
  return (
    <AnimatePresence>
      {showSupportCard && (
        <motion.div
          key="support-card"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: isOpen ? '560px' : '6.5rem',
            left: '2rem',
            zIndex: 9998,
            width: '280px',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(0, 120, 215, 0.18)',
            boxShadow: '0 8px 32px rgba(0,75,135,0.18)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882l6.206-1.438C7.878 23.44 9.894 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.937 0-3.741-.524-5.288-1.437l-.379-.225-3.683.853.872-3.583-.247-.39C2.524 15.73 2 13.926 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Need Help?</span>
            </div>
            <button onClick={dismissSupportCard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}><X size={14} /></button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem' }}>
            Our team can continue this discussion directly on WhatsApp and help you explore the most relevant peptides and protocols.
          </p>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackSupportEvent('support_prompt_clicked', 'whatsapp_cta');
              trackAIToWhatsApp(sessionId, supportContext || 'manual', messagesSent);
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%',
              padding: '0.7rem', borderRadius: '12px', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none'
            }}
          >
            Continue on WhatsApp
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
