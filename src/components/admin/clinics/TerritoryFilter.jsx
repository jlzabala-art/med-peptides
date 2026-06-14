import Map from "lucide-react/dist/esm/icons/map";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import React from 'react';




export default function TerritoryFilter({ selectedTerritory, onSelectTerritory }) {
  // Mock territories - in real life this would come from a 'territories' collection
  const hierarchy = {
    'North America': {
      'USA West': ['California', 'Nevada', 'Washington'],
      'USA East': ['New York', 'Florida', 'Massachusetts']
    },
    'Europe': {
      'UK & Ireland': ['London', 'Dublin'],
      'DACH': ['Germany', 'Switzerland']
    }
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 600, borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
        <Map size={18} color="var(--primary)" />
        Territory Filter
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
        <button 
          onClick={() => onSelectTerritory('All')}
          style={{ 
            padding: '0.4rem 1rem', 
            borderRadius: '20px', 
            border: selectedTerritory === 'All' ? '1px solid var(--primary)' : '1px solid var(--border)', 
            backgroundColor: selectedTerritory === 'All' ? '#eff6ff' : 'white',
            color: selectedTerritory === 'All' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>
          Global
        </button>
        {Object.entries(hierarchy).map(([region, subregions]) => (
          Object.keys(subregions).map(sub => (
            <button 
              key={sub}
              onClick={() => onSelectTerritory(sub)}
              style={{ 
                padding: '0.4rem 1rem', 
                borderRadius: '20px', 
                border: selectedTerritory === sub ? '1px solid var(--primary)' : '1px solid var(--border)', 
                backgroundColor: selectedTerritory === sub ? '#eff6ff' : 'white',
                color: selectedTerritory === sub ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }}/> {sub}
            </button>
          ))
        ))}
      </div>
    </div>
  );
}