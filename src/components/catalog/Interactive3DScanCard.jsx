'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

export default function Interactive3DScanCard({
  url = '',
  batchCode = '',
  recipientName = ''
}) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -8 });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: {
        dark: '#002244',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(data => setQrDataUrl(data))
      .catch(err => console.warn('[Interactive3DScanCard] QR error:', err));
  }, [url]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((centerY - y) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 14;

    setTilt({ rotateX: Number(rotX.toFixed(2)), rotateY: Number(rotY.toFixed(2)) });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 4, rotateY: -8 });
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        perspective: '1000px',
        display: 'inline-block',
        width: '100%',
        maxWidth: '260px',
      }}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${isHovered ? 'scale(1.03)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'linear-gradient(145deg, rgba(7, 34, 68, 0.85) 0%, rgba(2, 19, 39, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '14px 14px 12px 14px',
          boxShadow: isHovered
            ? '0 20px 35px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.25)'
            : '0 12px 28px -8px rgba(0, 0, 0, 0.45), 0 0 14px rgba(30, 58, 138, 0.3)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handleCopy}
        title="Click to copy shared catalog link"
      >
        {/* Ambient Holographic Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            left: '-30%',
            width: '160%',
            height: '160%',
            background: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#7dd3fc',
                textTransform: 'uppercase',
              }}
            >
              Live Synced Web App
            </span>
          </div>

          <div
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? (
              <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Check size={11} /> Link Copied
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Copy size={11} /> Tap to Copy
              </span>
            )}
          </div>
        </div>

        {/* QR Code Container with 3D Pop and Laser Scan Line */}
        <div
          style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: '10px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(18px)',
            overflow: 'hidden',
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan to open shared catalog"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1 / 1',
                display: 'block',
                borderRadius: '4px',
              }}
            />
          ) : (
            <div
              style={{
                width: '140px',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '0.75rem',
              }}
            >
              Generating QR...
            </div>
          )}

          {/* Animated Cyan Scan Line */}
          <div
            style={{
              position: 'absolute',
              left: '4px',
              right: '4px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)',
              boxShadow: '0 0 10px #06b6d4, 0 0 4px #38bdf8',
              animation: 'hologramScan 2.4s ease-in-out infinite alternate',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Footer info: Action callout */}
        <div
          style={{
            marginTop: '10px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <Smartphone size={12} color="#38bdf8" />
            <span>Scan with phone camera</span>
          </div>

          {batchCode && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '0.62rem',
                fontFamily: 'monospace',
                color: '#94a3b8',
                letterSpacing: '0.04em',
              }}
            >
              REF: {batchCode}
            </div>
          )}
        </div>

        {/* CSS Keyframes for Scan Animation */}
        <style jsx>{`
          @keyframes hologramScan {
            0% {
              top: 8px;
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
            100% {
              top: calc(100% - 10px);
              opacity: 0.3;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
