import Link from 'next/link';
import { Search, Compass, BookOpen, ArrowLeft, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found | Atlas Health Clinical',
  description: 'The requested clinical resource, product datasheet, or treatment protocol is not available or has been moved.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      zIndex: 99999
    }}>
      {/* 
        SECURITY ENFORCEMENT:
        When a route is not found, completely hide any header, navbar, admin bar, 
        or impersonation banner to prevent public visitors from discovering or 
        clicking internal B2B / Admin portal links.
      */}
      <style>{`
        header, 
        .site-header, 
        .header-disclaimer-bar, 
        .impersonation-banner, 
        [class*="site-header"], 
        #site-header, 
        .portal-header, 
        [data-portal-header], 
        .admin-topbar, 
        .admin-view-bar,
        .rp-desktop-only, 
        nav.mobile-tab-bar, 
        .bottom-tab-bar,
        footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          background-color: #f8fafc !important;
        }
      `}</style>

      <div style={{
        maxWidth: '560px',
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
          Error 404 · Record Not Found
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 0.75rem',
          letterSpacing: '-0.025em'
        }}>
          Clinical Resource Not Available
        </h1>

        <p style={{
          fontSize: '0.92rem',
          color: '#64748b',
          lineHeight: '1.6',
          margin: '0 0 2rem'
        }}>
          The product, analytical batch, or clinical protocol you are looking for is not available at this link. It may have been updated, reassigned, or is currently under technical review.
        </p>

        {/* Action Link: Return Home */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              backgroundColor: '#003666',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'background-color 0.2s',
              boxShadow: '0 1px 3px rgba(0,54,102,0.2)'
            }}
          >
            <ArrowLeft size={16} />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
