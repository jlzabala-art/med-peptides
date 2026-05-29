/* eslint-disable no-unused-vars */
import React from 'react';
import { AI_SECTION_MAP, CLINICAL_GLOSSARY } from '../constants';
import GlossaryTooltip from '../components/GlossaryTooltip';

export function getInternalPath(url) {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    const domains = ['atlas-health.com', 'www.atlas-health.com', window.location.hostname];
    if (domains.includes(parsed.hostname)) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (e) {
    // Not a valid URL
  }
  return null;
}

export function inlineFormat(text) {
  if (!text) return null;
  
  // First, identify all glossary terms in the text
  const glossaryTerms = Object.keys(CLINICAL_GLOSSARY).sort((a, b) => b.length - a.length); // Longest first for greedy matching
  const glossaryRegex = new RegExp(`\\b(${glossaryTerms.join('|')})\\b`, 'gi');

  const parts = text.split(/(\[(?:[^\]]+)\]\((?:[^)]+)\)|\[REF:\d+\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  const result = [];
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (!part) { i++; continue; }

    // If it's a special markdown part, handle
    if (part.startsWith('[REF:') && part.endsWith(']')) {
      const refId = part.match(/\d+/)?.[0];
      if (refId) {
        result.push(
          <sup key={i} style={{ marginLeft: '2px' }}>
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${refId}/`} 
               target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.65rem', padding: '1px 4px', backgroundColor: 'rgba(0,75,135,0.06)', borderRadius: '4px' }}>
              Ref:{refId}
            </a>
          </sup>
        );
      }
    } else if (part.startsWith('[') && /^\[([^\]]+)\]\(([^)]+)\)$/.test(part)) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const href = m[2];
        const internalPath = getInternalPath(href);
        const isInternal = internalPath !== null;
        result.push(
          <a key={i} href={internalPath || href}
            target={isInternal ? '_self' : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              transition: 'opacity 0.2s'
            }}
            onClick={(e) => {
              if (isInternal) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('nav:internal', { detail: { href: internalPath } }));
              }
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >{m[1]}</a>
        );
      }
    } else if (part.startsWith('**') && part.endsWith('**')) {
      result.push(<strong key={i} style={{ fontWeight: 700, color: '#0f172a' }}>{inlineFormat(part.slice(2, -2))}</strong>);
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      result.push(<em key={i} style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>{inlineFormat(part.slice(1, -1))}</em>);
    } else if (part.startsWith('`') && part.endsWith('`')) {
      result.push(
        <code key={i} style={{
          background: 'rgba(0,75,135,0.05)',
          border: '1px solid rgba(0,75,135,0.08)',
          color: 'var(--primary)',
          borderRadius: '6px',
          padding: '0.15em 0.35em',
          fontSize: '0.85em',
          fontFamily: 'monospace',
          fontWeight: 600
        }}>
          {part.slice(1, -1)}
        </code>
      );
    } else {
      // It's normal text, look for glossary terms
      const textParts = part.split(glossaryRegex);
      textParts.forEach((tPart, ti) => {
        const lower = tPart.toLowerCase();
        if (CLINICAL_GLOSSARY[lower]) {
          result.push(<GlossaryTooltip key={`${i}-${ti}`} term={tPart} definition={CLINICAL_GLOSSARY[lower]} />);
        } else {
          result.push(tPart);
        }
      });
    }
    i++;
  }
  return result;
}

function renderMarkdownTable(lines, key) {
  const parseRow = (row) =>
    row.trim().split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
  const isSeparator = (row) => /^[\s|:\-]+$/.test(row);
  const nonSep = lines.filter(l => !isSeparator(l));
  if (!nonSep.length) return null;
  const headers = parseRow(nonSep[0]);
  const dataRows = nonSep.slice(1).map(parseRow);
  return (
    <div key={key} style={{
      overflowX: 'auto',
      margin: '0.85rem 0',
      borderRadius: '12px',
      border: '1px solid rgba(226, 234, 245, 0.8)',
      boxShadow: '0 4px 12px rgba(0, 75, 135, 0.02)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
        {headers.length > 0 && (
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, rgba(0, 75, 135, 0.05) 0%, rgba(0, 75, 135, 0.02) 100%)', borderBottom: '2px solid rgba(226, 234, 245, 0.9)' }}>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: '0.75rem 0.9rem',
                  textAlign: 'left',
                  color: 'var(--primary)',
                  fontWeight: 750,
                  fontSize: '0.76rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} style={{
              borderBottom: ri === dataRows.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: ri % 2 === 0 ? 'white' : 'var(--color-bg-app)',
              transition: 'background 0.2s'
            }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '0.65rem 0.9rem',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.5',
                  fontWeight: 500
                }}>{inlineFormat(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function processMarkdown(content) {
  if (!content) return { html: '', metadata: {} };

  const metadata = {
    products: [],
    protocols: [],
    questions: [],
    reconTool: null,
    evidenceLevel: null,
    stackSynergy: null,
    comparisonMatrix: null,
    protocolTimeline: null,
    visualRecon: null,
    deepDive: null,
  };

  let processed = content;

  // Extract Deep Dive
  const deepDiveMatch = processed.match(/\[DEEP_DIVE:(\{.*?\})\]/i);
  if (deepDiveMatch) {
    try {
      metadata.deepDive = JSON.parse(deepDiveMatch[1]);
      processed = processed.replace(/\[DEEP_DIVE:.*?\]/g, '');
    } catch (e) {
      console.error('Failed to parse Deep Dive', e);
    }
  }

  // Extract Visual Recon
  const visualReconMatch = processed.match(/\[VISUAL_RECON:(\{.*?\})\]/i);
  if (visualReconMatch) {
    try {
      metadata.visualRecon = JSON.parse(visualReconMatch[1]);
      processed = processed.replace(/\[VISUAL_RECON:.*?\]/g, '');
    } catch (e) {
      console.error('Failed to parse Visual Recon', e);
    }
  }

  // Extract Protocol Timeline
  const timelineMatch = processed.match(/\[TIMELINE:(\[.*?\])\]/i);
  if (timelineMatch) {
    try {
      metadata.protocolTimeline = JSON.parse(timelineMatch[1]);
      processed = processed.replace(/\[TIMELINE:.*?\]/g, '');
    } catch (e) {
      console.error('Failed to parse Protocol Timeline', e);
    }
  }

  // Extract Comparison Matrix
  const matrixMatch = processed.match(/\[COMPARE_MATRIX:(.*?)\]/i);
  if (matrixMatch) {
    metadata.comparisonMatrix = {
      compounds: matrixMatch[1].split(',').map(s => s.trim()),
      data: {}
    };
    const dataMatch = processed.match(/\[MATRIX_DATA:(\{.*?\})\]/i);
    if (dataMatch) {
      try {
        metadata.comparisonMatrix.data = JSON.parse(dataMatch[1]);
        processed = processed.replace(/\[MATRIX_DATA:.*?\]/g, '');
      } catch (e) {
        console.error('Failed to parse Matrix Data', e);
      }
    }
    processed = processed.replace(/\[COMPARE_MATRIX:.*?\]/g, '');
  }

  // Extract Evidence Level
  const evidenceMatch = processed.match(/\[EVIDENCE:(HIGH|MODERATE|EMERGING|ANECDOTAL)\]/i);
  if (evidenceMatch) {
    metadata.evidenceLevel = evidenceMatch[1].toUpperCase();
    processed = processed.replace(/\[EVIDENCE:.*?\]/g, '');
  }

  // Extract Stack Synergy
  const synergyMatch = processed.match(/\[STACK_SYNERGY:(\d+)\]/i);
  if (synergyMatch) {
    metadata.stackSynergy = {
      score: parseInt(synergyMatch[1], 10),
      compounds: []
    };
    const compMatch = processed.match(/\[(?:COMPOUNDS|PEPTIDES):(.*?)\]/i);
    if (compMatch) {
      metadata.stackSynergy.compounds = compMatch[1].split(',').map(s => s.trim());
      processed = processed.replace(/\[(?:COMPOUNDS|PEPTIDES):.*?\]/g, '');
    }
    processed = processed.replace(/\[STACK_SYNERGY:.*?\]/g, '');
  }

  return { html: renderAIMarkdown(processed), metadata };
}

export function renderAIMarkdown(raw) {
  if (!raw) return null;
  const rawText = raw.replace(/\[RECON_TOOL:.*?\]/g, '').trim();
  const allLines = rawText.split('\n');
  const normLines = [];
  
  allLines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      normLines.push('');
      return;
    }
    const isHeading = /^\s*(#{1,4})\s/.test(line);
    const isTable = /^\s*\|/.test(line);
    const isList = /^\s*([-*•]|\d+\.)\s/.test(line);
    
    if (normLines.length > 0 && normLines[normLines.length - 1] !== '') {
      const prevTrimmed = normLines[normLines.length - 1].trim();
      const prevWasList = /^\s*([-*•]|\d+\.)\s/.test(prevTrimmed);
      const prevWasHeading = /^\s*(#{1,4})\s/.test(prevTrimmed);
      
      if (isHeading || isTable || (isList && !prevWasList)) {
        normLines.push('');
      } else if (prevWasHeading) {
        normLines.push('');
      }
    }
    normLines.push(line);
  });
  
  const text = normLines.join('\n');
  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      const lines = trimmed.split('\n');
      const lang = lines[0].slice(3).trim();
      const codeText = lines.slice(1, -1).join('\n');
      return (
        <div key={bi} style={{
          position: 'relative',
          margin: '0.85rem 0',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          border: '1px solid #334155'
        }}>
          {lang && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-text-primary)',
              padding: '0.35rem 0.75rem',
              borderBottom: '1px solid #334155',
              color: 'var(--color-text-tertiary)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              <span>{lang}</span>
            </div>
          )}
          <pre style={{
            margin: 0,
            padding: '0.85rem 1rem',
            overflowX: 'auto',
            fontSize: '0.78rem',
            color: 'var(--color-bg-app)',
            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
            lineHeight: '1.5'
          }}>
            <code>{codeText}</code>
          </pre>
        </div>
      );
    }

    if (trimmed.startsWith('>')) {
      const cleanContent = trimmed.split('\n').map(l => l.trim().replace(/^>\s*/, '')).join('\n');
      return (
        <blockquote key={bi} style={{
          borderLeft: '4px solid var(--primary)',
          backgroundColor: 'rgba(0, 75, 135, 0.03)',
          padding: '0.65rem 1rem',
          margin: '0.85rem 0',
          borderRadius: '0 8px 8px 0',
          fontSize: '0.84rem',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          lineHeight: '1.5',
          whiteSpace: 'pre-line'
        }}>
          {inlineFormat(cleanContent)}
        </blockquote>
      );
    }

    if (/^(---+|\*\*\*+|___)$/.test(trimmed)) {
      return <hr key={bi} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />;
    }

    if (/^#\s/.test(trimmed)) {
      return (
        <h1 key={bi} style={{
          fontSize: '1.12rem',
          fontWeight: 800,
          color: 'var(--primary)',
          margin: '1.1rem 0 0.65rem 0',
          letterSpacing: '-0.02em',
          lineHeight: '1.3',
          borderBottom: '1px solid rgba(0, 75, 135, 0.08)',
          paddingBottom: '0.35rem'
        }}>
          {inlineFormat(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
    }

    if (/^##\s/.test(trimmed)) {
      return (
        <h2 key={bi} style={{
          fontSize: '1.0rem',
          fontWeight: 750,
          color: 'var(--color-text-primary)',
          margin: '0.9rem 0 0.5rem 0',
          letterSpacing: '-0.015em',
          lineHeight: '1.3'
        }}>
          {inlineFormat(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
    }

    if (/^###\s/.test(trimmed)) {
      return (
        <h3 key={bi} style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          margin: '0.75rem 0 0.4rem 0',
          letterSpacing: '0.01em',
          lineHeight: '1.3'
        }}>
          {inlineFormat(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
    }

    // Graphical Steps Renderer
    const stepLineRe = /^(\d+[\.\)]|Step\s+\d+:?|[-*•]\s+\*\*(?:Step|Paso|Phase|Fase|Etapa|Stage|Etapa|\d+)\b)/i;
    const blockLines = trimmed.split('\n');
    const hasMultipleSteps = blockLines.filter(l => stepLineRe.test(l.trim())).length >= 2;

    if (hasMultipleSteps) {
      const parsedSteps = [];
      let currentStep = null;
      let stepCounter = 1;

      blockLines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const stepMatch = trimmedLine.match(/^(\d+[\.\)]|Step\s+\d+:?|[-*•])\s*(?:\*\*(.*?)\*\*|([a-zA-Z0-9\s,&_]+)):?(.*)$/i);
        if (stepMatch) {
          if (currentStep) parsedSteps.push(currentStep);
          const stepMarker = stepMatch[1];
          const title = (stepMatch[2] || stepMatch[3] || '').trim();
          const desc = (stepMatch[4] || '').trim();

          const parsedNum = parseInt(stepMarker.replace(/[^\d]/g, ''), 10);
          const stepNumber = isNaN(parsedNum) ? stepCounter : parsedNum;
          stepCounter = stepNumber + 1;

          currentStep = {
            number: stepNumber,
            title: title || `Step ${stepNumber}`,
            description: desc
          };
        } else {
          if (currentStep) {
            currentStep.description += (currentStep.description ? ' ' : '') + trimmedLine;
          } else {
            currentStep = {
              number: stepCounter++,
              title: `Step 1`,
              description: trimmedLine
            };
          }
        }
      });
      if (currentStep) parsedSteps.push(currentStep);

      if (parsedSteps.length >= 2) {
        return (
          <div key={bi} className="ca-steps-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            margin: '0.9rem 0',
            width: '100%'
          }}>
            {parsedSteps.map((step, idx) => (
              <div key={idx} className="ca-step-card" style={{
                display: 'flex',
                gap: '12px',
                backgroundColor: 'rgba(248, 250, 252, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                borderRadius: '12px',
                padding: '0.85rem 1.05rem',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
              }}>
                <div className="ca-step-number" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,163,224,0.2)'
                }}>
                  {step.number}
                </div>
                <div style={{ flex: 1 }}>
                  {step.title && (
                    <div className="ca-step-title" style={{
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      marginBottom: '0.2rem'
                    }}>
                      {inlineFormat(step.title)}
                    </div>
                  )}
                  {step.description && (
                    <div className="ca-step-desc" style={{
                      fontWeight: 400,
                      fontSize: '0.80rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.5'
                    }}>
                      {inlineFormat(step.description)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }

    const tableLines = trimmed.split('\n');
    if (tableLines.length >= 1 && tableLines.every(l => /^\|/.test(l.trim()))) {
      return renderMarkdownTable(tableLines, bi);
    }

    const listLineRe = /^([-•*]|\d+\.)\ +/;
    const lines = trimmed.split('\n');
    const hasListItem = lines.some(l => listLineRe.test(l.trim()));

    // Pure list — every line is a bullet
    if (lines.every(l => listLineRe.test(l.trim()))) {
      return (
        <ul key={bi} style={{
          margin: '0.4rem 0 0.85rem 0',
          paddingLeft: '1.3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem'
        }}>
          {lines.map((l, li) => (
            <li key={li} style={{
              fontSize: '0.84rem',
              lineHeight: '1.55',
              color: 'var(--color-text-primary)',
              paddingLeft: '0.15rem',
              fontWeight: 400
            }}>
              {inlineFormat(l.replace(listLineRe, '').trim())}
            </li>
          ))}
        </ul>
      );
    }

    // Mixed block — has at least one list item plus prose lines (e.g. Benefits:, Phases:)
    // Render line-by-line: list items as <li>, others as sub-text on the last <li> or standalone
    if (hasListItem) {
      const items = [];
      let currentItem = null;

      lines.forEach((line, li) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        if (listLineRe.test(trimmedLine)) {
          if (currentItem) items.push(currentItem);
          currentItem = { text: trimmedLine.replace(listLineRe, '').trim(), sub: [] };
        } else {
          if (currentItem) {
            currentItem.sub.push(trimmedLine);
          } else {
            // Before first list item — treat as leading prose
            items.push({ text: null, sub: [trimmedLine] });
          }
        }
      });
      if (currentItem) items.push(currentItem);

      return (
        <ul key={bi} style={{
          margin: '0.4rem 0 0.85rem 0',
          paddingLeft: '1.3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          listStyle: 'disc'
        }}>
          {items.map((item, ii) => (
            item.text !== null ? (
              <li key={ii} style={{
                fontSize: '0.84rem',
                lineHeight: '1.55',
                color: 'var(--color-text-primary)',
                paddingLeft: '0.15rem',
                fontWeight: 400
              }}>
                {inlineFormat(item.text)}
                {item.sub.length > 0 && (
                  <div style={{ marginTop: '0.2rem', paddingLeft: '0.1rem' }}>
                    {item.sub.map((s, si) => (
                      <div key={si} style={{
                        fontSize: '0.80rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.5',
                        marginTop: '0.1rem'
                      }}>
                        {inlineFormat(s)}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ) : (
              <div key={ii} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                {item.sub.map((s, si) => <div key={si}>{inlineFormat(s)}</div>)}
              </div>
            )
          ))}
        </ul>
      );
    }

    // Smart Warning / Safety Disclaimers Rendering
    const isDisclaimer = trimmed.includes('⚠️') || 
                         trimmed.toLowerCase().includes('always review the full safety profile') || 
                         trimmed.toLowerCase().includes('strictly for research purposes') || 
                         trimmed.toLowerCase().includes('under all jurisdictions') || 
                         trimmed.toLowerCase().includes('not approved for human consumption');
                         
    if (isDisclaimer) {
      const cleanText = trimmed.replace(/^⚠️\s*/, '');
      return (
        <div key={bi} className="ca-disclaimer" style={{
          borderLeft: '4px solid #d97706', // Warm amber / orange accent
          backgroundColor: 'var(--color-warning-bg)', // Light warning amber bg
          padding: '0.9rem 1.15rem',
          borderRadius: '12px',
          margin: '0.85rem 0',
          boxShadow: '0 4px 12px rgba(217,119,6,0.03)',
          border: '1px solid rgba(217,119,6,0.08)',
          borderLeftWidth: '4px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.15rem', lineHeight: '1', display: 'inline-block', marginTop: '2px' }}>⚠️</span>
          <div style={{ fontSize: '0.78rem', fontWeight: 650, color: '#78350f', lineHeight: '1.5', flex: 1 }}>
            {inlineFormat(cleanText)}
          </div>
        </div>
      );
    }

    // AI Section Header match
    const headerMatch = trimmed.match(/^\*\*([A-Z][A-Z0-9 _\-]+?):?\*\*\s*([\s\S]*)$/i);
    if (headerMatch) {
      const labelRaw = headerMatch[1].trim().toUpperCase();
      const style = AI_SECTION_MAP[labelRaw];
      if (style) {
        return (
          <div key={bi} className="ca-section-card" style={{
            borderLeft: `4px solid ${style.accent}`,
            backgroundColor: style.bg,
            padding: '0.95rem 1.2rem',
            borderRadius: '12px',
            margin: '0.9rem 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
            border: '1px solid rgba(0,0,0,0.02)',
            borderLeftWidth: '4px'
          }}>
            <div className="ca-section-card-title" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: style.accent,
              fontWeight: 800,
              fontSize: '0.80rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.45rem'
            }}>
              <span>{style.icon}</span>
              <span>{labelRaw}</span>
            </div>
            <div className="ca-section-card-body" style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--color-text-primary)', fontWeight: 400 }}>
              {renderAIMarkdown(headerMatch[2])}
            </div>
          </div>
        );
      }
    }

    return (
      <p key={bi} style={{
        margin: '0 0 0.85rem 0',
        fontSize: '0.85rem',
        lineHeight: '1.625',
        color: 'var(--color-text-primary)',
        fontWeight: 400
      }}>
        {inlineFormat(trimmed)}
      </p>
    );
  });
}
