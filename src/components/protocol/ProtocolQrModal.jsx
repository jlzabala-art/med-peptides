"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from '@/lib/icons';

export default function ProtocolQrModal({
  isOpen,
  onClose,
  publicUrl,
  displayName,
  protocolCode,
  t,
  copied,
  onCopyUrl
}) {
  if (!isOpen) return null;

  return (
    <div className="gcp-qr-modal-backdrop" onClick={onClose}>
      <div className="gcp-qr-modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#0f172a" }}>
            {t.verifiedProtocol}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b", padding: "0 4px" }}
          >
            ✕
          </button>
        </div>
        <QRCodeSVG value={publicUrl} size={180} level="M" />
        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
          {displayName}
        </div>
        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
          ID: {protocolCode} • {t.clinicalRegistryBadge}
        </div>
        <button
          type="button"
          onClick={onCopyUrl}
          style={{
            width: "100%",
            background: "#0d9488",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "0.65rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? t.linkCopied : t.copyLink}</span>
        </button>
      </div>
    </div>
  );
}
