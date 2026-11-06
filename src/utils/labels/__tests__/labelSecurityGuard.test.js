import { describe, it, expect } from 'vitest';
import { verifyLabelSaveSecurity, REASON_CODES } from '../labelSecurityGuard';

describe('verifyLabelSaveSecurity', () => {
  it('allows saving when all criteria are met', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      currentItem: { patientName: 'John Doe' },
      readOnly: false,
      role: 'admin',
      isSaving: false,
      isOnline: true
    });

    expect(res.canSave).toBe(true);
    expect(res.canApprove).toBe(true);
    expect(res.reasonCode).toBe(REASON_CODES.OK);
  });

  it('strictly disables saving when readOnly is true', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      readOnly: true,
      role: 'admin'
    });

    expect(res.canSave).toBe(false);
    expect(res.canApprove).toBe(false);
    expect(res.canEdit).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.READ_ONLY);
  });

  it('strictly disables saving when user role lacks edit permission', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      role: 'patient',
      can: (action) => action !== 'edit:prescriptions'
    });

    expect(res.canSave).toBe(false);
    expect(res.canApprove).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.PERMISSION_DENIED);
  });

  it('strictly disables saving when rawId is missing', () => {
    const res = verifyLabelSaveSecurity({
      rawId: '',
      role: 'doctor'
    });

    expect(res.canSave).toBe(false);
    expect(res.canApprove).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.MISSING_ID);
  });

  it('strictly disables saving when prescription is locked or archived', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      sourceRx: { status: 'archived' },
      role: 'admin'
    });

    expect(res.canSave).toBe(false);
    expect(res.canApprove).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.ARCHIVED);
  });

  it('strictly disables saving when offline', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      isOnline: false,
      role: 'admin'
    });

    expect(res.canSave).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.OFFLINE);
  });

  it('strictly disables saving when a save is already in progress', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      isSaving: true,
      role: 'admin'
    });

    expect(res.canSave).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.SAVING);
  });

  it('respects canSaveOverride when explicitly set', () => {
    const res = verifyLabelSaveSecurity({
      rawId: 'rx-12345',
      canSaveOverride: false
    });

    expect(res.canSave).toBe(false);
    expect(res.reasonCode).toBe(REASON_CODES.OVERRIDE_DISABLED);
  });
});
