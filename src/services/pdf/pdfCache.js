/**
 * pdfCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Caching and filename utilities for generated clinical protocol PDFs.
 */

import { storage, ref, uploadBytes, getDownloadURL } from '../../firebase.js';
import logger from '../../utils/logger.js';

export const getProtocolFilename = (protocol) => {
  const version = protocol.metadata?.version || '1.0';
  const rawTitle = protocol.metadata?.scientificName
    || protocol.protocol_title
    || protocol.blueprint?.title
    || 'Protocol';
  const cleanTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `Protocol-${cleanTitle}-v${version}.pdf`;
};

export const getCachedProtocolPDF = async (protocol) => {
  if (!protocol) return null;
  const filename = getProtocolFilename(protocol);
  const cacheKey = `pdf_cache_${filename}`;

  try {
    const cachedUrl = sessionStorage.getItem(cacheKey);
    if (cachedUrl) {
      logger.info(`PDF found in local session cache: ${filename}`);
      return cachedUrl;
    }
  } catch (e) {
    logger.warn('Failed to read from sessionStorage', e);
  }

  if (protocol.pdf_url) {
    logger.info(`PDF URL found in protocol metadata: ${protocol.pdf_url}`);
    return protocol.pdf_url;
  }

  try {
    const storageRef = ref(storage, `protocols/pdfs/${filename}`);
    const downloadUrl = await getDownloadURL(storageRef);
    if (downloadUrl) {
      logger.info(`PDF found in Firebase Storage: ${filename}`);
      try {
        sessionStorage.setItem(cacheKey, downloadUrl);
      } catch (e) {
        logger.warn('Failed to cache in sessionStorage', e);
      }
      return downloadUrl;
    }
  } catch {
    // File does not exist in Storage yet
  }

  return null;
};

export const cacheProtocolPDF = async (protocol, blob) => {
  if (!protocol || !blob) return null;
  const filename = getProtocolFilename(protocol);
  const cacheKey = `pdf_cache_${filename}`;

  try {
    const storageRef = ref(storage, `protocols/pdfs/${filename}`);
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'application/pdf',
      customMetadata: {
        protocolId: protocol.id || protocol.protocol_id || '',
        version: protocol.metadata?.version || '1.0',
        generatedAt: new Date().toISOString()
      }
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    logger.info(`Cached generated PDF to Storage: ${filename}`);

    try {
      sessionStorage.setItem(cacheKey, downloadUrl);
    } catch (e) {
      logger.warn('Failed to store in sessionStorage', e);
    }

    return downloadUrl;
  } catch (err) {
    logger.error('Failed to cache PDF in Firebase Storage:', err);
    return null;
  }
};
