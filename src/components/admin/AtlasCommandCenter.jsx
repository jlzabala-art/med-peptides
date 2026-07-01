import Activity from 'lucide-react/dist/esm/icons/activity';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Eye from 'lucide-react/dist/esm/icons/eye';
import React, { useState, useEffect } from 'react';
import ExecutiveStatusBar from './widgets/ExecutiveStatusBar';
import MobileExecutiveDashboard from './mobile/MobileExecutiveDashboard';

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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { WorkspaceProvider, useWorkspace, WORKSPACE_TEMPLATES } from './workspace/WorkspaceContext';
import WorkspaceBuilderDrawer from './workspace/WorkspaceBuilderDrawer';
import GlobalFilterBar from './workspace/GlobalFilterBar';
import AskAtlasBar from './workspace/AskAtlasBar';

import UniversalTimeline from '../shared/UniversalTimeline';
import TasksEngine from '../shared/TasksEngine';
// Mock metrics component imports (In real app, these would be dedicated components)
const MetricCard = ({ label, value }) => (
  <div
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
  >
    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted, #64748b)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
      {value}
    </div>
  </div>
);

function SortableWidget({ id, widget }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    // 12 column grid system
    gridColumn:
      widget.size === 'full'
        ? 'span 12'
        : widget.size === 'large'
          ? 'span 8'
          : widget.type === 'kpi'
            ? 'span 3'
            : 'span 4',
    minHeight: widget.type === 'kpi' ? '120px' : '400px',
    cursor: 'grab',
  };

  const renderWidgetContent = () => {
    if (widget.type === 'kpi') {
      // Mock Data binding based on field
      const val =
        widget.data.field === 'revenueToday'
          ? '$12,450'
          : widget.data.field === 'patientsFollowup'
            ? '45'
            : '12';
      return <MetricCard label={widget.data.label} value={val} />;
    }
    if (widget.type === 'widget') {
      if (widget.data.component === 'UniversalTimeline')
        return (
          <div
            style={{
              height: '100%',
              backgroundColor: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <UniversalTimeline />
          </div>
        );
      if (widget.data.component === 'TasksEngine')
        return (
          <div
            style={{
              height: '100%',
              backgroundColor: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <TasksEngine />
          </div>
        );
    }
    return (
      <div
        style={{
          padding: '1rem',
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        Unknown Widget
      </div>
    );
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
      const oldIndex = activeLayout.findIndex((w) => w.id === active.id);
      const newIndex = activeLayout.findIndex((w) => w.id === over.id);
      updateLayout(arrayMove(activeLayout, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activeLayout.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {activeLayout.map((widget) => (
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
  const [isExecutiveMode, setIsExecutiveMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const activeTemplate = workspaces[activeWorkspaceId];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileExecutiveDashboard />;
  }

  return (
    <div style={{ paddingBottom: '4rem', background: 'var(--color-bg-app)' }}>
      {/* 1. Mobile-First Executive Status Bar */}
      <ExecutiveStatusBar />

      <div style={{ padding: '1rem 1.5rem' }}>
        {/* Header with Executive Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.25rem',
              }}
            >
              <LayoutDashboard size={24} color="var(--primary)" />
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                }}
              >
                {activeTemplate?.name || 'Atlas Command Center'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsExecutiveMode(!isExecutiveMode)}
              className={isExecutiveMode ? 'gcp-btn-primary' : 'gcp-btn-secondary'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
              }}
            >
              <Eye size={16} />
              {isExecutiveMode ? 'CEO Cockpit Active' : 'Enable CEO Cockpit'}
            </button>
            <button
              onClick={() => setShowBuilder(true)}
              className="gcp-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
              }}
            >
              <Settings size={16} /> Customize
            </button>
          </div>
        </div>

        {/* AI Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <AskAtlasBar />
        </div>

        {!isExecutiveMode && (
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <GlobalFilterBar />
          </div>
        )}

        {/* Dynamic Drag and Drop Grid - In CEO mode, we would filter to only show strategic KPIs */}
        <div style={{ opacity: isExecutiveMode ? 0.9 : 1, transition: 'opacity 0.3s' }}>
          <WorkspaceGrid isExecutiveMode={isExecutiveMode} />
        </div>

        {/* Builder Drawer */}
        {showBuilder && <WorkspaceBuilderDrawer onClose={() => setShowBuilder(false)} />}
      </div>
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
