'use client';

import React from 'react';
import PharmapolisLabelSvg from '@/components/prescription/PharmapolisLabelSvg';
import { detectOptimalLabelDimensions } from '@/utils/labels/containerDimensionDetector';

export default function LabelsOffscreenRenderer({ patientQueue = [] }) {
  return (
    <div
      id="pls-offscreen-batch-render"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: '800px',
        height: '800px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0
      }}
      aria-hidden="true"
    >
      {patientQueue.flatMap((pItem) => {
        const labels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
        const partsToRender = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
          ? [pItem.selectedPartIndex]
          : labels.map((_, idx) => idx);

        return partsToRender.map((partIdx) => {
          const pLabel = labels[partIdx] || labels[0] || {};
          const optDims = detectOptimalLabelDimensions(pLabel);
          const effectiveWidthMm = Number(pLabel.widthMm || (pItem.widthMm !== 75 ? pItem.widthMm : optDims.widthMm)) || 75;
          const effectiveHeightMm = Number(pLabel.heightMm || (pItem.heightMm !== 45 ? pItem.heightMm : optDims.heightMm)) || 45;

          return (
            <div key={`offscreen-${pItem.code}-${partIdx}`}>
              <PharmapolisLabelSvg
                labelData={{
                  ...pLabel,
                  partLabel: pLabel.partLabel || (labels.length > 1 ? `Part ${partIdx + 1} of ${labels.length}` : ''),
                  partIndex: partIdx,
                  totalParts: labels.length
                }}
                variant={pLabel.variant || pLabel.lastVariant || pItem.variant || 'backQr'}
                widthMm={effectiveWidthMm}
                heightMm={effectiveHeightMm}
                showCutGuides={false}
                svgRef={(node) => {
                  if (node) {
                    node.id = `batch-svg-${pItem.code}-${partIdx}`;
                  }
                }}
              />
            </div>
          );
        });
      })}
    </div>
  );
}
