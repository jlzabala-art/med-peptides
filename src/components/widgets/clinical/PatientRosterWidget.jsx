import React from 'react';
import { Users, UserPlus, ChevronRight } from 'lucide-react';
import BaseWidget from '../core/BaseWidget';

export default function PatientRosterWidget(props) {
  const { role = 'doctor' } = props;

  // Mock data for UI preview
  const patients = [
    { id: '1', name: 'Ana García', lastVisit: 'Hace 2 días', status: 'Activo' },
    { id: '2', name: 'Carlos López', lastVisit: 'Hace 1 semana', status: 'En Tratamiento' },
    { id: '3', name: 'Marta Díaz', lastVisit: 'Hace 1 mes', status: 'Seguimiento' },
  ];

  return (
    <BaseWidget 
      title={role === 'admin' ? "Directorio Global de Pacientes" : "Mis Pacientes Activos"} 
      icon={Users} 
      {...props}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 mr-4">
          <input 
            type="text" 
            placeholder="Buscar paciente..." 
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#C0A062] hover:bg-[#a68850] text-black rounded-lg text-sm font-bold transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-2">
        {patients.map(patient => (
          <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-medium">
                {patient.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{patient.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{patient.lastVisit}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                  <span className="text-xs text-blue-400">{patient.status}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}
