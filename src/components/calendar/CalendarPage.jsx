import React from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import { Card } from '../ui';
import './CalendarCloud.css'; // Keep for FullCalendar overrides but we will style the wrapper

export default function CalendarPage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your prescriptions, follow-ups, and treatment protocols.
          </p>
        </div>
      </div>
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <RegeneraCalendar />
      </Card>
    </div>
  );
}
