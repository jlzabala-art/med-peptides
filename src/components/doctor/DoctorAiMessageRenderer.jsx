"use client";

import React, { useMemo } from 'react';
import { Check, Copy, ExternalLink, Sparkles, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

/**
 * Parses inline markdown:
 * - **bold**
 * - *italic*
 * - `code`
 * - [label](url)
 * - Status keywords (🟢 SOLD, ⏳ UNACCEPTED, etc.)
 * - Rx IDs (#RX-..., #PO-...)
 */
function renderInlineText(text, keyPrefix = 'inline') {
  if (!text) return null;

  // Split text by tokens: links, bold, italic, code
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = String(text).split(tokenRegex);

  return parts.map((part, idx) => {
    const k = `${keyPrefix}-${idx}`;
    if (!part) return null;

    // 1. Link: [label](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, label, href] = match;
        const isInternal = href.startsWith('/');
        return (
          <a
            key={k}
            href={href}
            target={isInternal ? '_self' : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            style={{
              color: '#1a73e8',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '1px solid rgba(26, 115, 232, 0.3)',
              transition: 'border-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#1a73e8')}
            onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(26, 115, 232, 0.3)')}
          >
            {label}
            {!isInternal && <ExternalLink size={10} style={{ marginLeft: 3, verticalAlign: 'middle' }} />}
          </a>
        );
      }
    }

    // 2. Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      // Status keyword badges embedded in bold
      if (/(sold|invoiced|confirmed|paid)/i.test(inner) && /^(🟢|sold|invoiced)/i.test(inner)) {
        return (
          <span
            key={k}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '1px 7px',
              borderRadius: '9999px',
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.01em'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            {inner.replace(/^[🟢\s]+/, '')}
          </span>
        );
      }
      if (/(unaccepted|proposal|pending|offer)/i.test(inner) && /^(⏳|unaccepted|proposal)/i.test(inner)) {
        return (
          <span
            key={k}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '1px 7px',
              borderRadius: '9999px',
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.01em'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            {inner.replace(/^[⏳\s]+/, '')}
          </span>
        );
      }
      return (
        <strong key={k} style={{ fontWeight: 700, color: '#0f172a' }}>
          {renderInlineText(inner, `${k}-b`)}
        </strong>
      );
    }

    // 3. Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={k} style={{ fontStyle: 'italic', color: '#475569' }}>
          {renderInlineText(part.slice(1, -1), `${k}-i`)}
        </em>
      );
    }

    // 4. Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={k}
          style={{
            background: '#f1f5f9',
            color: '#0f172a',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.82em',
            fontWeight: 600,
            border: '1px solid #e2e8f0'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 5. Plain text: detect Rx codes like #RX-12345 or #12345
    const rxRegex = /(#\w+[-\w]*)/g;
    const textPieces = part.split(rxRegex);
    if (textPieces.length > 1) {
      return textPieces.map((piece, pIdx) => {
        if (piece.startsWith('#') && piece.length >= 3) {
          return (
            <span
              key={`${k}-rx-${pIdx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 5px',
                borderRadius: '4px',
                background: '#eef2ff',
                color: '#4338ca',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid #c7d2fe',
                margin: '0 2px'
              }}
            >
              {piece}
            </span>
          );
        }
        return piece;
      });
    }

    return part;
  });
}

/**
 * DoctorAiMessageRenderer
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX compliant parser for Doctor Portal AI Copilot responses.
 * Replaces unparsed Markdown asterisks with high-contrast typography,
 * pill badges, bullet cards, and clean tabular layouts.
 */
export default function DoctorAiMessageRenderer({ content, onExecuteAction }) {
  const renderedBlocks = useMemo(() => {
    if (!content) return null;

    const rawLines = String(content).split(/\r?\n/);
    const blocks = [];
    let currentBulletGroup = [];
    let currentTableRows = [];

    const flushBullets = () => {
      if (currentBulletGroup.length > 0) {
        blocks.push({
          type: 'bullet-group',
          items: [...currentBulletGroup]
        });
        currentBulletGroup = [];
      }
    };

    const flushTable = () => {
      if (currentTableRows.length > 0) {
        blocks.push({
          type: 'table',
          rows: [...currentTableRows]
        });
        currentTableRows = [];
      }
    };

    rawLines.forEach((line) => {
      const trimmed = line.trim();

      // Check for Table Row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushBullets();
        currentTableRows.push(trimmed);
        return;
      }
      flushTable();

      // Check for Bullet points (•, -, *)
      const bulletMatch = trimmed.match(/^([•\-\*]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const marker = bulletMatch[1];
        const body = bulletMatch[2];
        currentBulletGroup.push({ marker, body });
        return;
      }
      flushBullets();

      // Empty line
      if (!trimmed) {
        blocks.push({ type: 'spacer' });
        return;
      }

      // Heading 2 / 3 or bold headline
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const titleText = trimmed.replace(/^#+\s*/, '');
        blocks.push({ type: 'heading', level: 3, text: titleText });
        return;
      }

      // Check if entire line is a bold title like: **Executive Practice Intelligence — Dr. Name**
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        blocks.push({ type: 'heading', level: 4, text: trimmed.slice(2, -2) });
        return;
      }

      // Standard paragraph
      blocks.push({ type: 'paragraph', text: trimmed });
    });

    flushBullets();
    flushTable();

    return blocks;
  }, [content]);

  if (!renderedBlocks || renderedBlocks.length === 0) {
    return <div style={{ fontSize: '0.80rem', color: '#64748b' }}>No clinical intelligence to display.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem', lineHeight: 1.55 }}>
      {renderedBlocks.map((block, bIdx) => {
        if (block.type === 'spacer') {
          return <div key={bIdx} style={{ height: '4px' }} />;
        }

        if (block.type === 'heading') {
          return (
            <div
              key={bIdx}
              style={{
                fontSize: block.level === 3 ? '0.90rem' : '0.84rem',
                fontWeight: 750,
                color: '#0f172a',
                marginTop: bIdx === 0 ? '0px' : '6px',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} color="#6366f1" />
              <span>{renderInlineText(block.text, `head-${bIdx}`)}</span>
            </div>
          );
        }

        if (block.type === 'bullet-group') {
          return (
            <div
              key={bIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                margin: '2px 0'
              }}
            >
              {block.items.map((item, iIdx) => {
                const isNumbered = /^\d+\.?$/.test(item.marker);
                return (
                  <div
                    key={iIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.79rem',
                      color: '#1e293b',
                      lineHeight: 1.5
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: '2px',
                        width: isNumbered ? '16px' : '6px',
                        height: isNumbered ? '16px' : '6px',
                        borderRadius: isNumbered ? '4px' : '50%',
                        background: isNumbered ? '#eef2ff' : '#6366f1',
                        color: isNumbered ? '#4338ca' : 'transparent',
                        fontSize: isNumbered ? '0.64rem' : '0px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1
                      }}
                    >
                      {isNumbered ? item.marker.replace('.', '') : ''}
                    </span>
                    <div style={{ flex: 1 }}>{renderInlineText(item.body, `b-${bIdx}-${iIdx}`)}</div>
                  </div>
                );
              })}
            </div>
          );
        }

        if (block.type === 'table') {
          const parsedRows = block.rows
            .map((r) =>
              r
                .split('|')
                .map((cell) => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            )
            .filter((cells) => cells.length > 0);

          const isSep = (cells) => cells.every((c) => /^[\s\-:]+$/.test(c));
          const cleanRows = parsedRows.filter((cells) => !isSep(cells));
          if (cleanRows.length === 0) return null;

          const [header, ...body] = cleanRows;

          return (
            <div
              key={bIdx}
              style={{
                overflowX: 'auto',
                margin: '6px 0',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                {header && (
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      {header.map((th, thIdx) => (
                        <th
                          key={thIdx}
                          style={{
                            padding: '6px 10px',
                            textAlign: 'left',
                            fontWeight: 700,
                            color: '#334155'
                          }}
                        >
                          {renderInlineText(th, `th-${bIdx}-${thIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {body.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: rIdx === body.length - 1 ? 'none' : '1px solid #f1f5f9'
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '6px 10px', color: '#1e293b' }}>
                          {renderInlineText(cell, `td-${bIdx}-${rIdx}-${cIdx}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Paragraph
        return (
          <div key={bIdx} style={{ color: '#1e293b' }}>
            {renderInlineText(block.text, `p-${bIdx}`)}
          </div>
        );
      })}
    </div>
  );
}
