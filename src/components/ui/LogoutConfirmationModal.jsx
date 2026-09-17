"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle, Loader2 } from 'lucide-react';
import AvatarGenerator from './AvatarGenerator';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

/**
 * LogoutConfirmationModal
 * Enterprise Google Cloud Console inspired Sign Out confirmation dialog.
 * 
 * Features:
 * - Clear account identity card (Avatar, Name, Email, Role)
 * - Intelligent staging check: Warns if local Workspace has staged products
 * - Keyboard navigation (Esc to dismiss)
 * - Safe async logout with localized spinner
 */
export default function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userProfile,
  user,
  currentRole = 'patient',
}) {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const activeWs = workspaces?.[activeWorkspaceId] || Object.values(workspaces || {})[0];
  const stagedCount = (activeWs?.items || []).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation: Escape closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoggingOut, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const displayName = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.fullName || userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  const displayEmail = userProfile?.email || user?.email || '';

  const handleConfirmClick = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={() => {
        if (!isLoggingOut) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogOut size={18} />
            </div>
            <div>
              <h3
                id="logout-dialog-title"
                style={{
                  margin: 0,
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Sign out of Atlas Health?
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Google Cloud Identity Security Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            aria-label="Close dialog"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Active Account Pill Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <AvatarGenerator
                name={displayName}
                email={displayEmail}
                size={40}
                round={true}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayEmail}
                </div>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                {currentRole}
              </span>
            </div>
          </div>

          {/* Intelligent Staging Workspace Warning */}
          {stagedCount > 0 ? (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={17} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.4 }}>
                <strong>{stagedCount} staged product{stagedCount > 1 ? 's' : ''} in Workspace:</strong> Your staged drafts remain saved locally on this browser, but unsaved changes will not be visible on other devices until submitted.
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              Are you sure you want to end your active session? You will need to authenticate again to access patient records and clinical orders.
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: '14px 20px 18px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isLoggingOut}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              touchAction: 'manipulation',
            }}
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut size={15} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
