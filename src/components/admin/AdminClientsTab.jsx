import React, { useState, useEffect } from 'react';
import userRepository from '../../repositories/userRepository';
import { Users, Edit2, Trash2 } from '@/lib/icons';

const AdminClientsTab = ({ ownerId, ownerType }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        // Fetch users (assuming clients are patients or we fetch all and filter)
        // Adjust the role as needed based on the actual domain logic
        const data = await userRepository.getUsersByRole('patient', 100);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Users size={24} style={{ color: 'var(--primary-color, #2563eb)' }} />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Clients Management</h2>
      </div>
      
      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="gcp-table-container">
          <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px' }}>Nombre</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Rol</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td data-label="Nombre" style={{ padding: '12px 16px', fontWeight: 500 }}>{client.firstName} {client.lastName}</td>
                <td data-label="Email" style={{ padding: '12px 16px', color: '#64748b' }}>{client.email}</td>
                <td data-label="Rol" style={{ padding: '12px 16px' }}>
                  <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {client.role}
                  </span>
                </td>
                <td data-label="Acciones" style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button className="gcp-btn gcp-btn--text" style={{ padding: '4px' }} title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button className="gcp-btn gcp-btn--text" style={{ padding: '4px', color: '#ef4444' }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No hay clientes disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default AdminClientsTab;

