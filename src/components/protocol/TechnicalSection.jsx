/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChevronDown, Beaker, ShieldCheck, Zap } from 'lucide-react';

/**
 * TechnicalSection Component
 * 
 * Renders clinical technical data using Tabs on Desktop and Accordions on Mobile.
 * Designed for Peptides and Supplements technical sections.
 */
const TechnicalSection = ({ title, items = [], icon: Icon = Beaker }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <div className="technical-section mt-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
          <Icon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      {isMobile ? (
        <div className="accordion-group space-y-3">
          {items.map((item, idx) => (
            <AccordionItem 
              key={item.peptide_id || item.id || idx}
              item={item}
              isOpen={activeIndex === idx}
              onClick={() => setActiveIndex(activeIndex === idx ? -1 : idx)}
            />
          ))}
        </div>
      ) : (
        <div className="tabs-container rounded-2xl bg-black/30 border border-white/5 overflow-hidden">
          <div className="tabs-header flex border-b border-white/5 bg-white/5">
            {items.map((item, idx) => (
              <button
                key={item.peptide_id || item.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-6 py-4 text-sm font-medium transition-all relative ${
                  activeIndex === idx ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.name}
                {activeIndex === idx && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="tab-content p-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TechnicalDetails item={items[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={`rounded-xl border transition-all duration-300 ${
      isOpen ? 'bg-white/10 border-cyan-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'
    }`}>
      <button 
        onClick={onClick}
        className="w-full px-5 py-4 flex justify-between items-center text-left"
      >
        <span className={`font-semibold ${isOpen ? 'text-cyan-400' : 'text-gray-200'}`}>
          {item.name}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={20} className="text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 border-t border-white/5">
              <TechnicalDetails item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TechnicalDetails = ({ item }) => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h4 className="text-xs uppercase tracking-widest text-cyan-500 font-bold mb-3 flex items-center gap-2">
            <Zap size={14} /> Mecanismo de Acción
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {item.rationale || "Información clínica en proceso de actualización por el equipo médico."}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Vía de Adm.</div>
            <div className="text-cyan-100 text-sm">{item.route_term}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Vida Media (Rec)</div>
            <div className="text-cyan-100 text-sm">{item.post_reconstitution_half_life} días</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-3 flex items-center gap-2">
            <ShieldCheck size={14} /> Consideraciones Clinics
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              Mantener refrigerado entre 2-8°C tras su reconstitución.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              Evitar la exposición directa a la luz solar.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              No agitar el vial; realizar movimientos circulares suaves.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSection;
