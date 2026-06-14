import Filter from "lucide-react/dist/esm/icons/filter";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Building from "lucide-react/dist/esm/icons/building";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';





import { useWorkspace } from './WorkspaceContext';

export default function GlobalFilterBar() {
  const { globalFilters, setGlobalFilters } = useWorkspace();

  const updateFilter = (key, value) => {
    setGlobalFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
         <Filter size={16} /> Global Filters:
       </div>

       <div style={{ display: 'flex', gap: '0.5rem' }}>
         {/* Date Range */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}>
           <Calendar size={14} color="var(--text-muted)" />
           <select style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                   value={globalFilters.dateRange} onChange={e => updateFilter('dateRange', e.target.value)}>
             <option value="Today">Today</option>
             <option value="MTD">Month to Date</option>
             <option value="QTD">Quarter to Date</option>
             <option value="YTD">Year to Date</option>
             <option value="All">All Time</option>
           </select>
         </div>

         {/* Region */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}>
           <MapPin size={14} color="var(--text-muted)" />
           <select style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                   value={globalFilters.country} onChange={e => updateFilter('country', e.target.value)}>
             <option value="All">All Regions</option>
             <option value="EU">Europe</option>
             <option value="NA">North America</option>
             <option value="MENA">MENA</option>
           </select>
         </div>

         {/* Clinic */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}>
           <Building size={14} color="var(--text-muted)" />
           <select style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                   value={globalFilters.clinic} onChange={e => updateFilter('clinic', e.target.value)}>
             <option value="All">All Clinics</option>
             <option value="Tier1">Tier 1 Partners</option>
             <option value="Internal">Internal Only</option>
           </select>
         </div>
       </div>

       <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
         These filters apply to all widgets in the current workspace.
       </div>
    </div>
  );
}