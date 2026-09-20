"use client";

import React from 'react';
import { PUBLIC_APP_VERSION, getPublicVersionInfo } from '../../config/publicVersionConfig';

/**
 * Standardized GCP/Atlas Public Version Badge
 * Provides homogeneous version rendering across all public pages (Products, Protocols, Catalogs)
 */
export default function PublicVersionBadge({
  version = null,
  updatedAt = null,
  lang = 'en',
  showDate = false,
  className = ''
}) {
  const info = getPublicVersionInfo(version, updatedAt, lang);

  return (
    <span
      className={`pds-version-tag ${className}`}
      title={`Clinical Monograph Revision ${info.version} (Verified Production Release)`}
    >
      <span className="pds-version-dot" />
      <span>{info.label}</span>
      {showDate && (
        <>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{lang === 'es' ? 'Actualizado:' : 'Updated:'} {info.updatedAtDate}</span>
        </>
      )}
    </span>
  );
}
