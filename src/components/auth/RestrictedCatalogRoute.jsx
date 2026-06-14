import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function RestrictedCatalogRoute({ catalogName, children }) {
  const { userProfile, loading, activeRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Admins always have access
  if (activeRole === 'admin') {
    return children;
  }

  // Check if the user has specific catalog restrictions
  const allowedCatalogs = userProfile?.allowedCatalogs;
  if (allowedCatalogs && Array.isArray(allowedCatalogs)) {
    if (!allowedCatalogs.includes(catalogName)) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', textAlign: 'center', padding: '2rem'
        }}>
          <ShieldAlert size={64} style={{ color: 'var(--accent-color, #ff4b4b)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-color, #111)' }}>
            Acceso Restringido
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-color-light, #666)', maxWidth: '500px', lineHeight: 1.6 }}>
            Tu cuenta no tiene permisos para acceder al catálogo de <strong>{catalogName}</strong>. 
            Contacta a tu gestor de cuenta para solicitar acceso a esta sección.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
            style={{ marginTop: '2rem' }}
          >
            Volver
          </button>
        </div>
      );
    }
  }

  return children;
}