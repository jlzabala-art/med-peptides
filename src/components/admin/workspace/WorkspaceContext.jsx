"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export const WORKSPACE_TEMPLATES = {
  ceo: {
    id: 'ceo',
    name: 'Atlas Command Center',
    focus: 'Strategic oversight & operational real-time control room',
    layout: [
      { id: 'ai-brief', type: 'widget', size: 'full', data: { component: 'AIBrief' } },
      { id: 'revenue', type: 'kpi', size: 'small', data: { label: 'Revenue', field: 'revenueToday' } },
      { id: 'open-orders', type: 'kpi', size: 'small', data: { label: 'Open Orders', field: 'openOrders' } },
      { id: 'approvals', type: 'kpi', size: 'small', data: { label: 'Approvals', field: 'approvals' } },
      { id: 'open-rfqs', type: 'kpi', size: 'small', data: { label: 'Open RFQs', field: 'openRfqs' } },
      { id: 'sourcing-hub', type: 'widget', size: 'large', data: { component: 'SourcingHub' } },
      { id: 'priority-queue', type: 'widget', size: 'small', data: { component: 'PriorityQueue' } }
    ]
  },
  operations: {
    id: 'operations',
    name: 'Operations Workspace',
    focus: 'Orders, Tasks, Logistics, Supplier performance',
    layout: [
      { id: 'active-orders', type: 'kpi', size: 'small', data: { label: 'Active Orders', field: 'activeOrders' } },
      { id: 'overdue-tasks', type: 'kpi', size: 'small', data: { label: 'Overdue Tasks', field: 'overdueTasks' } },
      { id: 'tasks', type: 'widget', size: 'large', data: { component: 'TasksEngine' } },
      { id: 'timeline', type: 'widget', size: 'medium', data: { component: 'UniversalTimeline' } }
    ]
  },
  medical: {
    id: 'medical',
    name: 'Medical Workspace',
    focus: 'Patients, Programs, Follow-ups, Testing',
    layout: [
      { id: 'patients', type: 'kpi', size: 'small', data: { label: 'Patients to Follow-up', field: 'patientsFollowup' } },
      { id: 'rx-expiring', type: 'kpi', size: 'small', data: { label: 'Rx Expiring', field: 'prescriptionsExpiring' } },
      { id: 'tests', type: 'kpi', size: 'small', data: { label: 'Pending Tests', field: 'testsPending' } },
      { id: 'timeline', type: 'widget', size: 'large', data: { component: 'UniversalTimeline' } }
    ]
  }
};

export function WorkspaceProvider({ children }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('medical'); // default
  const [workspaces, setWorkspaces] = useState(WORKSPACE_TEMPLATES);
  const [globalFilters, setGlobalFilters] = useState({
    country: 'All',
    clinic: 'All',
    dateRange: 'MTD'
  });
  
  const [isBuilderMode, setIsBuilderMode] = useState(false);

  const activeLayout = workspaces[activeWorkspaceId]?.layout || [];

  const updateLayout = (newLayout) => {
    setWorkspaces(prev => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        layout: newLayout
      }
    }));
  };

  const addWidget = (widget) => {
    updateLayout([...activeLayout, widget]);
  };

  const removeWidget = (id) => {
    updateLayout(activeLayout.filter(w => w.id !== id));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspaceId,
      setActiveWorkspaceId,
      activeLayout,
      updateLayout,
      addWidget,
      removeWidget,
      globalFilters,
      setGlobalFilters,
      isBuilderMode,
      setIsBuilderMode
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
