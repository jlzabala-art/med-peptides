import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Activity, Search, X, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SymptomMatchmakerWidget = ({ onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsTyping(true);
    setRecommendation(null);

    // Simulate AI matchmaker reasoning
    setTimeout(() => {
      setIsTyping(false);
      setRecommendation({
        analysis: "Has mencionado problemas de sueño, dolor articular leve y un deseo de recomposición corporal. Esto sugiere una necesidad de estimulación de la hormona de crecimiento natural y recuperación de tejidos blandos.",
        stack: [
          {
            id: 'cjc-ipa',
            name: "CJC-1295 / Ipamorelin Blend",
            benefit: "Mejora los pulsos nocturnos de GH, promoviendo sueño profundo (fase REM/Slow-wave) y lipólisis.",
            price: 145.00
          },
          {
            id: 'bpc-157',
            name: "BPC-157",
            benefit: "El estándar dorado para la recuperación acelerada de articulaciones y tendones.",
            price: 85.00
          }
        ],
        totalPrice: 230.00
      });
    }, 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '64px',
              height: '64px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, var(--primary), #003666)',
              color: 'white',
              border: 'none',
              boxShadow: '0 10px 25px rgba(0, 54, 102, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <Sparkles size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '380px',
              maxHeight: '600px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, var(--primary), #003666)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Atlas AI</h3>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Symptom Matchmaker</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', background: 'rgba(248, 250, 252, 0.5)' }}>
              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '16px 16px 16px 4px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: '#334155',
                lineHeight: 1.5,
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}>
                👋 ¡Hola! Soy Atlas AI. Descríbeme tus síntomas o tus objetivos de salud y encontraré los péptidos perfectos para ti.
              </div>

              {recommendation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    padding: '1rem',
                    borderRadius: '16px 16px 16px 4px',
                    border: '1px solid #bbf7d0',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: '#166534',
                    lineHeight: 1.5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                      <Activity size={16} /> Diagnóstico Predictivo
                    </div>
                    {recommendation.analysis}
                  </div>

                  {recommendation.stack.map((item, idx) => (
                    <div key={idx} style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '0.75rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{item.name}</strong>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>${item.price}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{item.benefit}</p>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      if (onAddToCart) onAddToCart(recommendation.stack);
                      toast.success("Stack añadido al carrito exitosamente.");
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ShoppingCart size={18} /> Añadir Stack (${recommendation.totalPrice})
                  </button>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ej: Tengo dolor de rodilla y mal sueño..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1rem',
                    borderRadius: '24px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isTyping || !query.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '22px',
                    background: query.trim() ? 'var(--primary)' : '#e2e8f0',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: query.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  {isTyping ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
};

export default SymptomMatchmakerWidget;
