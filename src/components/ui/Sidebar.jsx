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
    <aside className={`ui-sidebar ${className}`}>
      <div className="ui-sidebar__header">
        <h2 className="ui-sidebar__title">{title}</h2>
      </div>
      <nav className="ui-sidebar__nav" aria-label="Main Navigation">
        {items.map((item) => {
          // Next.js equivalent of `end={item.path === '/'}`:
          const isRoot = item.path === '/';
          const isActive = isRoot ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`ui-sidebar__link ${isActive ? 'ui-sidebar__link--active' : ''}`}
            >
              {item.icon && <span className="ui-sidebar__icon">{item.icon}</span>}
              <span className="ui-sidebar__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
