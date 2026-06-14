import X from "lucide-react/dist/esm/icons/x";
import GripVertical from "lucide-react/dist/esm/icons/grip-vertical";
import Check from "lucide-react/dist/esm/icons/check";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import React, { useState } from 'react';





import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Format IDs to readable names
const formatId = (id) => {
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

function SortableItem({ id, widget, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="sortable-item"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '0.5rem' }}>
        <button {...attributes} {...listeners} style={{ background: 'none', border: 'none', cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--color-text-tertiary)' }}>
          <GripVertical size={20} />
        </button>
        <div style={{ flex: 1, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {formatId(widget.id)}
          {!widget.enabled && <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: 'var(--color-text-secondary)', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 600 }}>Oculto</span>}
        </div>

        <button 
          onClick={() => onToggle(widget.id)}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', 
            color: widget.enabled ? 'var(--color-success)' : 'var(--color-text-tertiary)', padding: '0.5rem', borderRadius: '8px',
            backgroundColor: widget.enabled ? '#dcfce7' : '#f1f5f9'
          }}
        >
          {widget.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function DashboardCustomizer({ currentConfig, defaultConfig, onClose, onSave }) {
  // Sort widgets by current order
  const [widgets, setWidgets] = useState([...currentConfig.widgets].sort((a, b) => a.order - b.order));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        // Re-assign orders
        return newArray.map((w, index) => ({ ...w, order: index + 1 }));
      });
    }
  };

  const handleToggle = (id) => {
    setWidgets(items => items.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const handleSave = () => {
    onSave({
      ...currentConfig,
      widgets: widgets
    });
  };

  const handleRestore = () => {
    setWidgets([...defaultConfig.widgets].sort((a, b) => a.order - b.order));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '400px', maxWidth: '100%', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Personalizar Panel</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Arrastra los módulos para reorganizarlos. Usa el icono del ojo para mostrar u ocultar herramientas de tu panel.
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
              {widgets.map((widget) => (
                <SortableItem key={widget.id} id={widget.id} widget={widget} onToggle={handleToggle} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: 'var(--color-bg-app)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleRestore}
            style={{ padding: '0.75rem', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Restaurar Valores por Defecto
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.85rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Check size={18} /> Save Cambios
          </button>
        </div>
      </div>
    </div>
  );
}