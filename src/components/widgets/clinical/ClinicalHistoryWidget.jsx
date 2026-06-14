import React from 'react';
import { Activity, Clock } from 'lucide-react';
import BaseWidget from '../core/BaseWidget';

export default function ClinicalHistoryWidget(props) {
  const { role = 'doctor' } = props;

  const logs = [
    { id: '1', date: '12 May, 2026', time: '10:30 AM', action: 'Nueva Prescripción', detail: 'BPC-157 / TB-500 Añadido al carrito', user: 'Dr. Smith' },
    { id: '2', date: '05 May, 2026', time: '14:15 PM', action: 'Nota SOAP', detail: 'Paciente reporta mejoría en articulaciones', user: 'Dr. Smith' },
    { id: '3', date: '28 Apr, 2026', time: '09:00 AM', action: 'Análisis de Sangre', detail: 'Niveles hormonales subidos al sistema', user: 'Admin' },
  ];

  return (
    <BaseWidget 
      title={role === 'patient' ? "Mi Historial Clínico" : "Registro de Actividad Clínica"} 
      icon={Activity} 
      {...props}
    >
      <div className="relative pl-6 border-l border-white/10 space-y-6 mt-2">
        {logs.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-[#C0A062] border-[3px] border-[#1a1a1a]" />
            
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-white text-sm font-medium">{log.action}</h4>
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Clock className="w-3 h-3" />
                <span>{log.date}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">{log.detail}</p>
            
            {role !== 'patient' && (
              <p className="text-xs text-blue-400 mt-2 font-medium">Por: {log.user}</p>
            )}
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}
