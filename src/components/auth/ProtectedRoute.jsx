import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function ProtectedRoute({ allowedRoles }) {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Si no está logueado, enviar al login (guardando la ruta para redirección futura si se desea)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está logueado pero el rol no está en la lista permitida
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    // Redirigir al dashboard base (el App router ya decide adónde lo manda según el rol)
    return <Navigate to="/patient" replace />;
  }

  return <Outlet />;
}