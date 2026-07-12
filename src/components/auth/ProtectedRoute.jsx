import { usePathname } from 'next/navigation';
import React from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from '@/lib/icons';


export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, activeRole, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Si no está logueado, enviar al login (guardando la ruta para redirección futura si se desea)
  if (!user) {
    redirect('/login');
  }

  // Si está logueado pero el rol no está en la lista permitida
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    // Redirigir al dashboard base (el App router ya decide adónde lo manda según el rol)
    redirect('/login');
  }

  return children;
}