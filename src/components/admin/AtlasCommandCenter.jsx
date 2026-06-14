import Activity from "lucide-react/dist/esm/icons/activity";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import Settings from "lucide-react/dist/esm/icons/settings";
import React, { useState, useEffect } from 'react';



import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { WorkspaceProvider, useWorkspace, WORKSPACE_TEMPLATES } from './workspace/WorkspaceContext';
import WorkspaceBuilderDrawer from './workspace/WorkspaceBuilderDrawer';
import GlobalFilterBar from './workspace/GlobalFilterBar';
import AskAtlasBar from './workspace/AskAtlasBar';

import UniversalTimeline from '../shared/UniversalTimeline';
import TasksEngine from '../shared/TasksEngine';
// Mock metrics component imports (In real app, these would be dedicated components)
const MetricCard = ({ label, value }) => (
  <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{value}</div>
  </div>
);

function SortableWidget({ id, widget }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    gridColumn: widget.size === 'large' ? 'span 2' : widget.size === 'full' ? 'span 3' : 'span 1',
    minHeight: widget.type === 'kpi' ? '140px' : '400px',
    cursor: 'grab'
  };

  const renderWidgetContent = () => {
    if (widget.type === 'kpi') {
      // Mock Data binding based on field
      const val = widget.data.field === 'revenueToday' ? '$12,450' : widget.data.field === 'patientsFollowup' ? '45' : '12';
      return <MetricCard label={widget.data.label} value={val} />;
    }
    if (widget.type === 'widget') {
      if (widget.data.component === 'UniversalTimeline') return <div style={{ height: '100%', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}><UniversalTimeline /></div>;
      if (widget.data.component === 'TasksEngine') return <div style={{ height: '100%', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}><TasksEngine /></div>;
    }
    return <div style={{ padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>Unknown Widget</div>;
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderWidgetContent()}
    </div>
  );
}

function WorkspaceGrid() {
  const { activeLayout, updateLayout } = useWorkspace();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activeLayout.findIndex(w => w.id === active.id);
      const newIndex = activeLayout.findIndex(w => w.id === over.id);
      updateLayout(arrayMove(activeLayout, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activeLayout.map(w => w.id)} strategy={rectSortingStrategy}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
           {activeLayout.map(widget => (
             <SortableWidget key={widget.id} id={widget.id} widget={widget} />
           ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function CommandCenterInner() {
  const { activeWorkspaceId, workspaces } = useWorkspace();
  const [showBuilder, setShowBuilder] = useState(false);
  const activeTemplate = workspaces[activeWorkspaceId];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
               {activeTemplate?.name || 'Atlas Command Center'}
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{activeTemplate?.focus}</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={18} /> Customize Workspace
        </button>
      </div>

      {/* AI Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AskAtlasBar />
      </div>

      {/* Global Filter */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <GlobalFilterBar />
      </div>

      {/* Dynamic Drag and Drop Grid */}
      <WorkspaceGrid />

      {/* Builder Drawer */}
      {showBuilder && <WorkspaceBuilderDrawer onClose={() => setShowBuilder(false)} />}
    </div>
  );
}

export default function AtlasCommandCenter() {
  return (
    <WorkspaceProvider>
      <CommandCenterInner />
    </WorkspaceProvider>
  );
}