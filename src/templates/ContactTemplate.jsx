import React, { memo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Contact from './Contact';

/**
 * ContactTemplate - Antigravity Version
 * Refactorizado para alto rendimiento y UX móvil.
 * - Memoizado para evitar re-renders desde el estado global.
 * - Gestión de scroll automática al montar.
 * - Navegación segura con fallback.
 */
const ContactTemplate = memo(({
  cart,
  region,
  isProfessional,
  products,
  pendingQuote,
  setPendingQuote
}) => {
  const navigate = useNavigate();

  // FASE 1: Mobile UX - Asegurar posición de lectura inicial
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FASE 2: Navegación Segura
  // Evita que el usuario quede atrapado si no hay historial previo en el móvil
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog'); // Fallback seguro a la tienda
    }
  }, [navigate]);

  return (
    <Contact
      onBack={handleBack}
      cart={cart}
      region={region}
      isProfessional={isProfessional}
      products={products}
      pendingQuote={pendingQuote}
      setPendingQuote={setPendingQuote}
    />
  );
});

// Asignar display name para debugging (buenas prácticas de React.memo)
ContactTemplate.displayName = 'ContactTemplate';

export default ContactTemplate;
