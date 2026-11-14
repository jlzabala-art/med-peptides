'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateA4BatchPdf } from '@/utils/a4BatchPdfGenerator';
import { generateBatchZpl } from '@/utils/labels/zplGenerator';
import { generatePackingListPdf } from '@/utils/labels/packingListPdfGenerator';
import { trackToolUsage } from '@/hooks/useAnalytics';

export function useBatchExport({
  patientQueue,
  startOffset,
  isEs,
  user,
  userProfile,
  zplDpi = 203,
  setPrintCountsMap,
  setPrintDetailsMap,
  setLabelsKpis
}) {
  const [isGeneratingBatchPdf, setIsGeneratingBatchPdf] = useState(false);
  const [batchPdfProgress, setBatchPdfProgress] = useState(null);

  const operatorName = user?.displayName || userProfile?.firstName || user?.email?.split('@')[0] || 'Pharmacy Staff';

  const recordPrintAudit = useCallback(async (format = 'a4') => {
    try {
      const kpiItems = patientQueue.map((pItem) => {
        const partsCount = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
          ? 1
          : (Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1);
        const partsIndices = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
          ? [Number(pItem.selectedPartIndex)]
          : (Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.map((_, i) => i) : [0]);

        return {
          code: pItem.rx?.fileNumber || pItem.rx?.code || pItem.code,
          docId: pItem.rx?.id || pItem.code,
          partsCount,
          parts: partsIndices,
          trigger: format === 'zpl' ? 'zpl_batch' : 'a4_batch',
          format,
          printedBy: operatorName
        };
      }).filter((item) => item.code);

      if (kpiItems.length === 0) return;

      const kpiRes = await fetch('/api/labels/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: kpiItems, printedBy: operatorName, format })
      });
      const kpiData = await kpiRes.json();
      if (kpiData?.success) {
        if (kpiData.printCountsByCode) {
          setPrintCountsMap?.((prev) => ({ ...prev, ...kpiData.printCountsByCode }));
        }
        if (kpiData.printDetailsByCode) {
          setPrintDetailsMap?.((prev) => ({ ...prev, ...kpiData.printDetailsByCode }));
        }
        setLabelsKpis?.((prev) => ({
          ...prev,
          totalPrintedA4Count: (prev.totalPrintedA4Count || 0) + (kpiData.updated || kpiItems.length)
        }));
      }
    } catch (err) {
      console.warn('Could not persist print audit:', err);
    }
  }, [patientQueue, operatorName, setPrintCountsMap, setPrintDetailsMap, setLabelsKpis]);

  const handleDownloadA4BatchPdf = useCallback(async () => {
    if (!patientQueue || patientQueue.length === 0) return;

    setIsGeneratingBatchPdf(true);
    setBatchPdfProgress({ current: 0, total: patientQueue.length });
    try {
      await new Promise((r) => setTimeout(r, 150));

      const labelsPayload = [];
      for (let qIdx = 0; qIdx < patientQueue.length; qIdx++) {
        const pItem = patientQueue[qIdx];
        const pLabels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
        const targetPartIndex = pItem.selectedPartIndex;
        const partIndices = (targetPartIndex != null && targetPartIndex !== 'all' && pLabels[targetPartIndex])
          ? [Number(targetPartIndex)]
          : pLabels.map((_, i) => i);

        for (const pIdx of partIndices) {
          const domId = `pls-offscreen-svg-${qIdx}-${pIdx}`;
          const svgEl = document.getElementById(domId);
          if (svgEl) {
            const lbl = pLabels[pIdx] || {};
            labelsPayload.push({
              svgElement: svgEl,
              widthMm: lbl.widthMm || pItem.widthMm || 75,
              heightMm: lbl.heightMm || pItem.heightMm || 45,
              patientName: pItem.rx?.patient?.name || pItem.rx?.patientName || 'Patient',
              code: pItem.code
            });
          }
        }
      }

      if (labelsPayload.length === 0) {
        toast.error(isEs ? 'No se encontraron etiquetas vectoriales listas.' : 'No vector labels ready.');
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      await generateA4BatchPdf(labelsPayload, {
        fileName: `Pharmapolis-Batch-A4-${dateStr}.pdf`,
        startOffset,
        onProgress: (curr, tot) => setBatchPdfProgress({ current: curr, total: tot })
      });

      await recordPrintAudit('a4');

      try {
        trackToolUsage({
          tool: 'labels_studio_a4_batch',
          patientCount: patientQueue.length,
          labelCount: labelsPayload.length,
          userId: user?.uid || null,
          userRole: userProfile?.role || null
        });
      } catch { /* ignore analytics */ }

      toast.success(
        isEs
          ? `PDF A4 generado (${labelsPayload.length} etiquetas)`
          : `A4 PDF exported (${labelsPayload.length} labels)`
      );
    } catch (err) {
      console.error('Error generating batch A4 PDF:', err);
      toast.error(isEs ? 'Error al generar el PDF A4' : 'Failed to generate A4 PDF');
    } finally {
      setIsGeneratingBatchPdf(false);
      setBatchPdfProgress(null);
    }
  }, [patientQueue, startOffset, isEs, user, userProfile, recordPrintAudit]);

  const handleDownloadZplBatch = useCallback(async () => {
    if (!patientQueue || patientQueue.length === 0) return;
    try {
      const zpl = generateBatchZpl(patientQueue, { dpi: zplDpi });
      if (!zpl) {
        toast.error(isEs ? 'No hay etiquetas para exportar en ZPL' : 'No labels to export as ZPL');
        return;
      }
      const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pharmapolis-Zebra-${new Date().toISOString().slice(0, 10)}.zpl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      try {
        await navigator.clipboard?.writeText(zpl);
      } catch { /* clipboard optional */ }

      await recordPrintAudit('zpl');
      toast.success(
        isEs
          ? `Archivo .ZPL descargado y copiado (${zplDpi} DPI)`
          : `.ZPL file downloaded & copied (${zplDpi} DPI)`
      );
    } catch (err) {
      console.error('Error generating ZPL:', err);
      toast.error(isEs ? 'Error al generar ZPL' : 'Failed to generate ZPL');
    }
  }, [patientQueue, zplDpi, isEs, recordPrintAudit]);

  const handleDownloadPackingListPdf = useCallback(async () => {
    if (!patientQueue || patientQueue.length === 0) return;
    try {
      await generatePackingListPdf(patientQueue, { isEs, operatorName });
      toast.success(isEs ? 'Packing List PDF descargado' : 'Batch Packing List PDF downloaded');
    } catch (err) {
      console.error('Error generating packing list:', err);
      toast.error(isEs ? 'Error al generar Packing List' : 'Failed to generate Packing List');
    }
  }, [patientQueue, isEs, operatorName]);

  return {
    isGeneratingBatchPdf,
    batchPdfProgress,
    handleDownloadA4BatchPdf,
    handleDownloadZplBatch,
    handleDownloadPackingListPdf
  };
}
