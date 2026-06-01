import React, { useState, useEffect } from 'react';
import { X, GripVertical, Settings2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategory({ group }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    backgroundColor: 'white',
    padding: '1rem',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GripVertical size={20} color="#94a3b8" style={{ cursor: 'grab' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#334155' }}>
          {group.emoji && <span style={{ marginRight: '8px' }}>{group.emoji}</span>}
          {group.label}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {group.items?.length || 0} items
        </div>
      </div>
    </div>
  );
}

export default function SidebarOrderModal({ isOpen, onClose, groups, onSave }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setItems(groups);
    }
  }, [isOpen, groups]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Ensure "favorites" is always forced to the top if present
        const favIndex = newOrder.findIndex(i => i.id === 'favorites');
        if (favIndex > 0) {
           const fav = newOrder.splice(favIndex, 1)[0];
           newOrder.unshift(fav);
        }

        return newOrder;
      });
    }
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-app, white)', width: '100%', maxWidth: '500px',
        borderRadius: '16px', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}>
              <Settings2 size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#1e293b' }}>Customize Sidebar</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Drag to reorder your categories</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(group => (
                <SortableCategory key={group.id} group={group} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{
            padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
            background: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{
            padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer'
          }}>
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
