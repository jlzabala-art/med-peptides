'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Layers, ArrowRight } from '@/lib/icons';

/**
 * CollectionSiblingsWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact Google Cloud UX sidebar widget listing sibling products in the same
 * brand/collection without consuming excessive vertical space.
 * - Collapsible header with live count
 * - Single-line items (22x22 thumbnail or dot + short name + micro-tag)
 * - Max-height 210px scroll container + 1-line link to full collection
 */
export default function CollectionSiblingsWidget({
  items = [],
  collectionName = 'Collection',
  collectionHref = '',
  lang = 'en',
}) {
  const [expanded, setExpanded] = useState(true);
  const isEs = lang === 'es';

  if (!Array.isArray(items) || items.length <= 1) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          padding: '8px 10px',
          background: '#f8f9fa',
          border: 'none',
          borderBottom: expanded ? '1px solid #dadce0' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.67rem',
            fontWeight: 700,
            color: '#5f6368',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Layers size={12} style={{ color: '#1a73e8', flexShrink: 0 }} />
          <span>
            {isEs ? 'En esta línea' : 'Same line'} · {collectionName} ({items.length})
          </span>
        </span>
        {expanded ? (
          <ChevronDown size={13} style={{ color: '#5f6368', flexShrink: 0 }} />
        ) : (
          <ChevronRight size={13} style={{ color: '#5f6368', flexShrink: 0 }} />
        )}
      </button>

      {expanded && (
        <>
          <div
            style={{
              maxHeight: '210px',
              overflowY: 'auto',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {items.map((item) => {
              const active = Boolean(item.isCurrent);
              return (
                <Link
                  key={item.slug}
                  href={`/p/${encodeURIComponent(item.slug)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    padding: '5px 7px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    background: active ? '#e8f0fe' : 'transparent',
                    borderLeft: active ? '2px solid #1a73e8' : '2px solid transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                          border: '1px solid #dadce0',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: active ? '#1a73e8' : '#bdc1c6',
                          flexShrink: 0,
                          marginLeft: '4px',
                          marginRight: '3px',
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? '#1967d2' : '#202124',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </span>
                  {item.shortMeta && (
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 600,
                        color: active ? '#1967d2' : '#5f6368',
                        background: active ? '#ffffff' : '#f1f3f4',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        maxWidth: '88px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.shortMeta}
                    >
                      {item.shortMeta}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {collectionHref && (
            <Link
              href={collectionHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderTop: '1px solid #f1f3f4',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: '#1a73e8',
                textDecoration: 'none',
                background: '#ffffff',
              }}
            >
              <span>{isEs ? 'Ver toda la colección' : 'View full collection'}</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
