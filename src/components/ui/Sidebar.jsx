'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sidebar — A Google Cloud Platform (GCP) inspired side navigation.
 *
 * @param {Array<{id: string, label: string, path: string, icon?: React.ReactNode}>} items
 * @param {string} title
 */
export default function Sidebar({ items = [], title = 'Atlas Health', className = '' }) {
  const pathname = usePathname() || '';

  return (
    <aside className={`gcp-sb-card ${className}`.trim()}>
      <div className="gcp-sb-card-header">
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--gcp-sb-text, #202124)' }}>
          {title}
        </h2>
      </div>
      <nav className="gcp-sb-card-body gcp-sb-items" aria-label="Main Navigation">
        {items.map((item) => {
          const isRoot = item.path === '/';
          const isActive = isRoot ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`gcp-sb-item ${isActive ? 'is-active' : ''}`}
            >
              <span className="gcp-sb-item-main">
                {item.icon && <span className="gcp-sb-item-icon">{item.icon}</span>}
                <span className="gcp-sb-item-label">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
