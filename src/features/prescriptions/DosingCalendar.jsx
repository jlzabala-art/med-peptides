import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const DosingCalendar = ({ prescription }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Dosing Calendar</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button className="px-3 py-1 text-sm font-medium rounded-md bg-white shadow-sm text-gray-900">Daily</button>
          <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900">Weekly</button>
          <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900">Monthly</button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center p-12 text-center">
        <div>
          <CalendarIcon className="w-12 h-12 text-blue-200 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">Calendar View</h4>
          <p className="text-sm text-gray-500 max-w-sm">
            Events will appear here automatically based on the dosing schedule defined in the Prescription Lines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DosingCalendar;
