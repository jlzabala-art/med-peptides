import Link from 'next/link';
import { Search, Compass, BookOpen, Home, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Página No Encontrada | Atlas Health Clinical',
  description: 'El recurso, ficha técnica o protocolo clínico solicitado no existe o ha sido reubicado.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '580px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          border: '1px solid #bfdbfe'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
          Error 404 · Registro No Encontrado
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 0.75rem',
          letterSpacing: '-0.025em'
        }}>
          Recurso Clínico No Disponible
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#64748b',
          lineHeight: '1.6',
          margin: '0 0 2rem'
        }}>
          El producto, lote analítico o protocolo clínico que estás buscando no se encuentra disponible en este enlace. Puede haber sido actualizado, reasignado o encontrarse en revisión técnica.
        </p>

        {/* Quick Search */}
        <form 
          action="/catalog" 
          method="GET"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '0.35rem 0.5rem 0.35rem 0.85rem',
            border: '1px solid #cbd5e1',
            marginBottom: '2rem'
          }}
        >
          <Search size={18} color="#64748b" style={{ flexShrink: 0, marginRight: '0.5rem' }} />
          <input 
            type="text" 
            name="q" 
            placeholder="Buscar por péptido, activo o protocolo..." 
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{
              backgroundColor: '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 0.9rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Buscar
          </button>
        </form>

        {/* Navigation Action Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Link
            href="/catalog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#003666',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}
          >
            <Compass size={16} />
            Catálogo
          </Link>
          <Link
            href="/protocols"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}
          >
            <BookOpen size={16} />
            Protocolos
          </Link>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#64748b',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} />
            Regresar a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
