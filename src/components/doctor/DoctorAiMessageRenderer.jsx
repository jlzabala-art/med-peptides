"use client";

import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Sparkles, TrendingDown, FileText } from 'lucide-react';

/**
 * CopyableCodePill
 * Inline copy-on-click badge for Invoice IDs (MY20251230039Y, OF-LOTUS-...),
 * Rx codes (#RX-...), and PO numbers (Golden Rule #11).
 */
function CopyableCodePill({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy reference ID"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '1px 7px',
        borderRadius: '5px',
        background: copied ? '#ecfdf5' : '#eff6ff',
        color: copied ? '#047857' : '#1d4ed8',
        border: `1px solid ${copied ? '#a7f3d0' : '#bfdbfe'}`,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.75rem',
        fontWeight: 750,
        cursor: 'pointer',
        margin: '0 2px',
        verticalAlign: 'baseline',
        transition: 'all 0.15s ease'
      }}
    >
      <span>{code}</span>
      {copied ? <Check size={10} color="#047857" /> : <Copy size={10} style={{ opacity: 0.65 }} />}
    </button>
  );
}

/**
 * Parses inline markdown:
 * - **bold** (including semantic badges for savings deltas, prices, and PO codes)
 * - *italic*
 * - `code`
 * - [label](url)
 * - Status keywords (🟢 SOLD, ⏳ UNACCEPTED, etc.)
 * - Invoice / PO / Rx IDs (MY2025..., OF-LOTUS..., #RX-..., #PO-...)
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
      const inner = part.slice(2, -2).trim();

      // Status keyword badges embedded in bold
      if (/(sold|invoiced|confirmed|paid|reconciled)/i.test(inner) && /^(🟢|sold|invoiced|reconciled)/i.test(inner)) {
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
              fontSize: '0.73rem',
              fontWeight: 750,
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
              fontSize: '0.73rem',
              fontWeight: 750,
              letterSpacing: '0.01em'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            {inner.replace(/^[⏳\s]+/, '')}
          </span>
        );
      }

      // Percentage savings / delta badge (e.g. **-37.1%**, **-74.8% cost reduction**)
      if (/^-\d+(\.\d+)?%/.test(inner)) {
        return (
          <span
            key={k}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '1px 7px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontSize: '0.73rem',
              fontWeight: 800,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace'
            }}
          >
            <TrendingDown size={11} />
            <span>{inner}</span>
          </span>
        );
      }

      // Currency / Unit Price pill (e.g. **$242.62 / g**, **$450.00/g**, **$37,179.50 USD**)
      if (/^([$€£]\d[\d,.]*(?:\s*\/\s*g|\s*USD|\s*EUR)?)$/.test(inner)) {
        return (
          <span
            key={k}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1px 7px',
              borderRadius: '5px',
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.77rem',
              fontWeight: 800,
              margin: '0 1px'
            }}
          >
            {inner}
          </span>
        );
      }

      // Invoice / PO ID inside bold (e.g. **MY20251230039Y**)
      if (/^(MY\d{8,}[A-Z0-9]*|OF-[A-Z0-9-]+|PO-[A-Z0-9-]+|RX-[A-Z0-9-]+)$/i.test(inner)) {
        return <CopyableCodePill key={k} code={inner} />;
      }

      return (
        <strong key={k} style={{ fontWeight: 750, color: '#0f172a' }}>
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
      const codeInner = part.slice(1, -1);
      if (/^(MY\d{8,}[A-Z0-9]*|OF-[A-Z0-9-]+|PO-[A-Z0-9-]+|RX-[A-Z0-9-]+)$/i.test(codeInner)) {
        return <CopyableCodePill key={k} code={codeInner} />;
      }
      return (
        <code
          key={k}
          style={{
            background: '#f1f5f9',
            color: '#0f172a',
            padding: '1px 6px',
            borderRadius: '4px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.80em',
            fontWeight: 700,
            border: '1px solid #cbd5e1'
          }}
        >
          {codeInner}
        </code>
      );
    }

    // 5. Plain text: detect Invoice IDs (MY20251230039Y, OF-LOTUS-...) or #RX-12345
    const idRegex = /(\bMY\d{8,}[A-Z0-9]*\b|\bOF-[A-Z0-9-]+\b|#\w+[-\w]*)/g;
    const textPieces = part.split(idRegex);
    if (textPieces.length > 1) {
      return textPieces.map((piece, pIdx) => {
        if (
          piece &&
          (/^MY\d{8,}[A-Z0-9]*$/.test(piece) ||
            /^OF-[A-Z0-9-]+$/.test(piece) ||
            (piece.startsWith('#') && piece.length >= 3))
        ) {
          return <CopyableCodePill key={`${k}-id-${pIdx}`} code={piece} />;
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
 * Google Cloud UX compliant parser for Atlas Clinical & Procurement AI Copilot responses.
 * Renders structured purchase order trajectories, KPI summary cards, copyable
 * reference IDs, and high-contrast tabular layouts.
 */
export default function DoctorAiMessageRenderer({ content }) {
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

      // Check for Bullet points (•, -, *, or numbered 1.)
      const bulletMatch = trimmed.match(/^([•\-\*]|\d+\.?)\s+(.+)$/);
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

      // Check if entire line is a bold title like: **Key Commercial Takeaways:**
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
    return <div style={{ fontSize: '0.80rem', color: '#64748b' }}>No intelligence to display.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem', lineHeight: 1.55 }}>
      {renderedBlocks.map((block, bIdx) => {
        if (block.type === 'spacer') {
          return <div key={bIdx} style={{ height: '2px' }} />;
        }

        if (block.type === 'heading') {
          return (
            <div
              key={bIdx}
              style={{
                fontSize: block.level === 3 ? '0.90rem' : '0.82rem',
                fontWeight: 800,
                color: '#003666',
                marginTop: bIdx === 0 ? '0px' : '4px',
                paddingBottom: block.level === 3 ? '6px' : '2px',
                borderBottom: block.level === 3 ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '-0.01em'
              }}
            >
              <Sparkles size={14} color="#0284c7" style={{ flexShrink: 0 }} />
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

                // Detect Purchase Order Trajectory line:
                // e.g. "**MY20251230039Y (Dec 30, 2025):** 140 g @ **$450.00/g** ($63,000.00)"
                // or "MY20251230039Y (Dec 30, 2025): 140 g @ $450.00/g ($63,000.00)"
                const cleanBody = item.body.replace(/\*\*/g, '');
                const poMatch = cleanBody.match(
                  /^([A-Z0-9-]+)\s*\(([^)]+)\):\s*([\d,.]+\s*g)\s*@\s*([^\s(]+(?:\s*\([^)]+\))?)\s*\(([$€][\d,.]+)\)/i
                );

                if (poMatch) {
                  const [, poCode, poDate, poMass, poRate, poTotal] = poMatch;
                  return (
                    <div
                      key={iIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '7px 10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {isNumbered && (
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: '#003666',
                              color: '#ffffff',
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {item.marker.replace('.', '')}
                          </span>
                        )}
                        <CopyableCodePill code={poCode} />
                        <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600 }}>
                          {poDate}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#334155',
                            background: '#f1f5f9',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                          }}
                        >
                          {poMass}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#0369a1',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                          }}
                        >
                          {poRate}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            minWidth: '78px',
                            textAlign: 'right'
                          }}
                        >
                          {poTotal}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Detect Key-Value Metric Bullet: "**Label:** Value..."
                const kvMatch = item.body.match(/^\*\*([^*:]+):\*\*\s*(.+)$/);
                if (kvMatch) {
                  const [, labelPart, valPart] = kvMatch;
                  return (
                    <div
                      key={iIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '6px 10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: '3px solid #0284c7',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        lineHeight: 1.45,
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ fontWeight: 750, color: '#0f172a' }}>
                        {labelPart}:
                      </span>
                      <div style={{ flex: 1, minWidth: '180px', color: '#334155' }}>
                        {renderInlineText(valPart, `kv-${bIdx}-${iIdx}`)}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={iIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.79rem',
                      color: '#1e293b',
                      lineHeight: 1.5,
                      padding: '2px 0'
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: '3px',
                        width: isNumbered ? '18px' : '6px',
                        height: isNumbered ? '18px' : '6px',
                        borderRadius: isNumbered ? '4px' : '50%',
                        background: isNumbered ? '#e0f2fe' : '#0284c7',
                        color: isNumbered ? '#0369a1' : 'transparent',
                        fontSize: isNumbered ? '0.66rem' : '0px',
                        fontWeight: 800,
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
                margin: '4px 0',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}
            >
              {/* eslint-disable-next-line no-restricted-syntax */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                {header && (
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                      {header.map((th, thIdx) => (
                        <th
                          key={thIdx}
                          style={{
                            padding: '7px 10px',
                            textAlign: thIdx >= 2 ? 'right' : 'left',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            color: '#334155',
                            whiteSpace: 'nowrap'
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
                        borderBottom: rIdx === body.length - 1 ? 'none' : '1px solid #e2e8f0'
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '7px 10px',
                            color: '#1e293b',
                            textAlign: cIdx >= 2 ? 'right' : 'left',
                            fontFamily: cIdx >= 2 ? 'ui-monospace, SFMono-Regular, monospace' : 'inherit',
                            whiteSpace: cIdx === 0 || cIdx >= 2 ? 'nowrap' : 'normal'
                          }}
                        >
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
          <div key={bIdx} style={{ color: '#334155', fontSize: '0.79rem' }}>
            {renderInlineText(block.text, `p-${bIdx}`)}
          </div>
        );
      })}
    </div>
  );
}
