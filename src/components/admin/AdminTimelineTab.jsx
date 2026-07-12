"use client";

import React, { useState } from 'react';
import UniversalTimeline from '../shared/UniversalTimeline';
import TasksEngine from '../shared/TasksEngine';
import { Layers, CheckSquare, Activity } from '@/lib/icons';

export default function AdminTimelineTab() {
  const [view, setView] = useState('feed'); // 'feed' | 'tasks'

  return (
    <div className="admin-tab-container p-6 w-full max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layers className="text-blue-600" /> Clinical Timeline
          </h1>
          <p className="text-gray-500 mt-1">
            Global air traffic control for operational and clinical events.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              view === 'feed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity size={16} /> Global Feed
          </button>
          <button
            onClick={() => setView('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              view === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare size={16} /> Action Items
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {view === 'feed' && (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-6 border-b pb-4">Activity Stream</h2>
            <div className="max-w-4xl">
              <UniversalTimeline maxItems={50} />
            </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-6 border-b pb-4">Pending Tasks & Milestones</h2>
            <TasksEngine />
          </div>
        )}
      </div>
    </div>
  );
}
