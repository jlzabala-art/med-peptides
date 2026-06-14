import React from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, X } from 'lucide-react';

export default function BaseWidget({ 
  id,
  title, 
  icon: Icon, 
  children, 
  isDraggable = false,
  dragListeners,
  dragAttributes,
  onRemove,
  className = "" 
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col ${className}`}
      style={{ minHeight: '300px' }}
    >
      {/* Header del Widget */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          {isDraggable && (
            <button 
              {...dragListeners} 
              {...dragAttributes}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors"
            >
              <GripHorizontal className="w-5 h-5" />
            </button>
          )}
          
          {Icon && <Icon className="w-5 h-5 text-[#C0A062]" />}
          <h3 className="text-white font-medium tracking-wide">{title}</h3>
        </div>

        {onRemove && (
          <button 
            onClick={() => onRemove(id)}
            className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
            title="Remover widget"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido del Widget */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
}
