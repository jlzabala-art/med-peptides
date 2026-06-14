import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export const WORKSPACE_TEMPLATES = {
  ceo: {
    id: 'ceo',
    name: 'CEO Workspace',
    focus: 'Revenue, Profit, Forecasts, Strategic KPIs',
    layout: [
      { id: 'rev-today', type: 'kpi', size: 'small', data: { label: 'Revenue Today', field: 'revenueToday' } },
      { id: 'rev-mtd', type: 'kpi', size: 'small', data: { label: 'MTD Revenue', field: 'revenueMonth' } },
      { id: 'profit-margin', type: 'kpi', size: 'small', data: { label: 'Profit Margin', field: 'profitMargin' } },
      { id: 'forecast', type: 'kpi', size: 'small', data: { label: 'Q3 Forecast', field: 'forecast' } },
      { id: 'timeline', type: 'widget', size: 'large', data: { component: 'UniversalTimeline' } }
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
