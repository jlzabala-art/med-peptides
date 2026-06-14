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
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente Wrapper para hacer un Widget Sortable (arrastrable)
function SortableWidgetWrapper({ id, component: Component, onRemove, widgetProps }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-span-1">
      <Component 
        id={id}
        isDraggable={true}
        dragListeners={listeners}
        dragAttributes={attributes}
        onRemove={onRemove}
        {...widgetProps}
      />
    </div>
  );
}

export default function DraggableDashboard({ 
  availableWidgets, 
  initialLayout, 
  onLayoutChange 
}) {
  const [layout, setLayout] = useState(initialLayout);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires a 5px movement to start dragging to avoid clicking issues
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newLayout = arrayMove(items, oldIndex, newIndex);
        if (onLayoutChange) {
          onLayoutChange(newLayout);
        }
        return newLayout;
      });
    }
  };

  const handleRemoveWidget = (id) => {
    const newLayout = layout.filter(w => w.id !== id);
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={layout.map(w => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {layout.map((widgetConfig) => {
            const WidgetComponent = availableWidgets[widgetConfig.type];
            if (!WidgetComponent) return null;

            return (
              <SortableWidgetWrapper 
                key={widgetConfig.id} 
                id={widgetConfig.id}
                component={WidgetComponent}
                widgetProps={widgetConfig.props || {}}
                onRemove={handleRemoveWidget}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
