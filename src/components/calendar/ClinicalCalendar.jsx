"use client";

import React, { useState } from 'react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { Tabs } from '../ui';

/**
 * Clinical Calendar - Unified UI Component for Atlas Health
 * Can display Dosing Calendar (for Prescriptions) and Visual Timeline (for Protocols).
 * Views: Daily, Weekly, Monthly, Timeline.
 */
export const ClinicalCalendar = ({ events = [], defaultView = 'weekly', onEventClick }) => {
  const [view, setView] = useState(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getEventsForDate = (date) => {
    return events.filter(e => isSameDay(new Date(e.date), date));
  };

  const renderWeeklyView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            &larr; Prev
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            Week of {format(startDate, 'MMM dd, yyyy')}
          </span>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            Next &rarr;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day.toISOString()} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden flex flex-col h-48">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {format(day, 'EEE dd')}
              </div>
              <div className="flex-1 p-2 overflow-y-auto space-y-2">
                {getEventsForDate(day).map((event, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onEventClick && onEventClick(event)}
                    className={`text-xs p-2 rounded-md cursor-pointer border-l-4 ${getEventColor(event.type)} bg-opacity-10 hover:bg-opacity-20 transition-colors`}
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-100">{event.title}</div>
                    {event.subtitle && <div className="text-gray-500 mt-1">{event.subtitle}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'injection': return 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'oral': return 'border-green-500 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lab': return 'border-purple-500 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reconstitution': return 'border-orange-500 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'border-gray-400 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="clinical-calendar w-full">
      {/* View Switcher */}
      <Tabs
        tabs={[
          { id: 'daily', label: 'Daily' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'monthly', label: 'Monthly' },
          { id: 'timeline', label: 'Timeline' },
        ]}
        activeTab={view}
        onChange={setView}
      />
      
      {/* Render selected view */}
      {view === 'weekly' && renderWeeklyView()}
      {view !== 'weekly' && <div className="text-center py-10 text-gray-500">View '{view}' is currently under development.</div>}
    </div>
  );
};

export default ClinicalCalendar;
