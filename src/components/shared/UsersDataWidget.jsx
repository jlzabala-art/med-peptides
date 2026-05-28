import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AppDataTable from '../ui/AppDataTable';
import AppFilterBar from '../ui/AppFilterBar';
import { Check, X, Shield, Star, Trash2 } from 'lucide-react';

export default function UsersDataWidget({
  portalContext = 'admin', // 'admin', 'physician', 'clinic'
  baseRole = null,
  baseDoctorId = null,
  readOnly = false,
  hideToolbar = false
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación (GCP Style)
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageHistory, setPageHistory] = useState([null]); // Array de cursores 'startAfter' (el índice 0 es null para la pag 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalEstimated, setTotalEstimated] = useState(0); // Opcional, si mantenemos count

  // Filtros UI
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchUsers = useCallback(async (pageIndex = 1, forceCursor = undefined) => {
    setLoading(true);
    try {
      let q = collection(db, 'users');
      let constraints = [];

      // Filtros Base (Inyectados por el Portal)
      if (baseRole) constraints.push(where('role', '==', baseRole));
      if (baseDoctorId) constraints.push(where('assignedDoctor', '==', baseDoctorId));

      // Filtro UI (Rango de Fechas)
      if (dateRange.start) {
        constraints.push(where('createdAt', '>=', new Date(dateRange.start).toISOString()));
      }
      if (dateRange.end) {
        const endDay = new Date(dateRange.end);
        endDay.setHours(23, 59, 59, 999);
        constraints.push(where('createdAt', '<=', endDay.toISOString()));
      }

      // Ordenación principal (Requerido para cursores)
      constraints.push(orderBy('createdAt', 'desc'));

      // Cursor de paginación
      const currentCursor = forceCursor !== undefined ? forceCursor : pageHistory[pageIndex - 1];
      if (currentCursor) {
        constraints.push(startAfter(currentCursor));
      }

      // Limit: pedimos N + 1 para saber si hay página siguiente
      constraints.push(limit(rowsPerPage + 1));

      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);

      const docs = snapshot.docs;
      const hasMore = docs.length > rowsPerPage;
      
      // Si hay más, nos quedamos con los primeros N
      const visibleDocs = hasMore ? docs.slice(0, rowsPerPage) : docs;

      let fetchedUsers = visibleDocs.map(d => ({ id: d.id, ...d.data() }));

      // Filtro UI (Búsqueda local sobre la página, ya que Firestore no soporta texto completo fácilmente)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        fetchedUsers = fetchedUsers.filter(u => 
          (u.email || '').toLowerCase().includes(lowerSearch) ||
          (u.firstName || '').toLowerCase().includes(lowerSearch) ||
          (u.lastName || '').toLowerCase().includes(lowerSearch)
        );
      }

      setUsers(fetchedUsers);
      setHasNextPage(hasMore);

      // Si avanzamos a una página nueva y hay más, guardamos el cursor para la *siguiente* página
      if (hasMore) {
        const nextCursor = visibleDocs[visibleDocs.length - 1];
        setPageHistory(prev => {
          const newHistory = [...prev];
          newHistory[pageIndex] = nextCursor; // El cursor para la página N+1 es el último de la página N
          return newHistory;
        });
      }
      setCurrentPage(pageIndex);
    } catch (err) {
      console.error("[UsersDataWidget] Error fetching users:", err);
      // alert("Error de índices en Firebase. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  }, [baseRole, baseDoctorId, dateRange, rowsPerPage, pageHistory, searchTerm]);

  useEffect(() => {
    // Al cambiar filtros principales o límite, volvemos a la pag 1
    setPageHistory([null]);
    fetchUsers(1, null);
  }, [baseRole, baseDoctorId, dateRange, rowsPerPage, fetchUsers]);

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchUsers(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchUsers(currentPage - 1);
    }
  };

  // ---- Definición de Columnas ----
  const columns = [
    {
      key: 'user', header: 'User', width: '35%',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.85rem'
          }}>
            {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
              {u.firstName} {u.lastName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role', header: 'Role', width: '20%',
      render: (u) => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem', fontWeight: 700,
          backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' :
                           u.role === 'physician' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          color: u.role === 'admin' ? 'var(--error)' :
                 u.role === 'physician' ? 'var(--success)' : 'var(--primary)'
        }}>
          {u.role === 'admin' ? <Shield size={12} /> : u.role === 'physician' ? <Star size={12} /> : null}
          {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'User'}
        </span>
      )
    },
    {
      key: 'status', header: 'Status', width: '15%',
      render: (u) => {
        const isApproved = u.status === 'approved';
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem', fontWeight: 700,
            backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            color: isApproved ? 'var(--success)' : 'var(--warning)'
          }}>
            {isApproved ? <Check size={12} /> : <X size={12} />}
            {isApproved ? 'Approved' : 'Pending'}
          </span>
        );
      }
    }
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions', header: '', align: 'right', width: '20%',
      render: (u) => (
        <button 
          className="admin-danger-btn"
          onClick={() => { /* Implement delete logic or open modal */ }}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <Trash2 size={14} /> Remove
        </button>
      )
    });
  }

  // Texto GCP
  const startIdx = ((currentPage - 1) * rowsPerPage) + 1;
  const endIdx = startIdx + users.length - 1;
  const paginationText = users.length > 0 ? `${startIdx}-${endIdx} of many` : '0-0 of 0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!hideToolbar && (
        <AppFilterBar 
          onSearch={setSearchTerm}
          searchPlaceholder="Search users in page..."
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={() => alert('Export not implemented in widget yet')}
        />
      )}

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading users...
        </div>
      ) : (
        <AppDataTable 
          columns={columns}
          data={users}
          keyField="id"
          emptyTitle="No users found"
          emptyDescription="There are no users matching the current criteria."
          
          // GCP Pagination Props
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          hasPrevPage={currentPage > 1}
          hasNextPage={hasNextPage}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          paginationText={paginationText}
        />
      )}
      <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', opacity: 0.5 }}>
        Widget: UsersDataWidget
      </div>
    </div>
  );
}
