'use client';
import { useState, useCallback } from 'react';
import notifier from '@/services/NotificationService';

/**
 * useStreamProgress
 * 
 * Reusable hook to consume streaming SSE / NDJSON endpoints
 * (e.g. /api/generate-pdf, /api/export-catalog, /api/sync-suppliers).
 */
export function useStreamProgress() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const startStream = useCallback(async (url, payload, options = {}) => {
    const {
      onProgress,
      onDone,
      onError,
      progressMap = {},
      successToast = 'Operation completed successfully ✓',
    } = options;

    setIsStreaming(true);
    setProgress(5);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            const step = data.step || data.type;

            if (step && step !== 'done') {
              setCurrentStep(step);
              setCurrentMessage(data.message || '');
              const pct = progressMap[step] ?? (data.progress || 50);
              setProgress(pct);
              onProgress?.(data);
            }

            if (data.type === 'done' || step === 'done') {
              finalData = data;
              setProgress(100);
              setCurrentStep('done');
              setResult(data);
              if (successToast) notifier.success(successToast);
              onDone?.(data);
            }

            if (data.type === 'error') {
              throw new Error(data.message || 'Stream error');
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') {
              console.warn('[useStreamProgress] parse warning:', e);
            }
          }
        }
      }

      setIsStreaming(false);
      return finalData;
    } catch (err) {
      console.error('[useStreamProgress] stream error:', err);
      setIsStreaming(false);
      setError(err.message || 'An error occurred during streaming.');
      notifier.error(err.message || 'Streaming failed');
      onError?.(err);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsStreaming(false);
    setProgress(0);
    setCurrentStep('');
    setCurrentMessage('');
    setError(null);
    setResult(null);
  }, []);

  return {
    isStreaming,
    progress,
    currentStep,
    currentMessage,
    error,
    result,
    startStream,
    reset,
  };
}
