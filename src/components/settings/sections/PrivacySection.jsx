import Eye from "lucide-react/dist/esm/icons/eye";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Database from "lucide-react/dist/esm/icons/database";
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAutoSave } from '../../../hooks/useAutoSave';





export default function PrivacySection() {
  const { userProfile, updateProfileData } = useAuth();
  const { data, updateField } = useAutoSave({
    publicProfile: userProfile?.privacy?.publicProfile ?? false,
    dataSharing: userProfile?.privacy?.dataSharing ?? true,
    aiTraining: userProfile?.privacy?.aiTraining ?? false,
  }, async (changedFields) => {
    await updateProfileData({
      privacy: {
        ...(userProfile?.privacy || {}),
        ...data,
        ...changedFields
      }
    });
  }, 500);

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Privacy & Data</h3>
      <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Control how your information is displayed and used within Atlas Health.</p>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Profile Visibility */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--background)', color: 'var(--text-muted)', borderRadius: '8px', height: 'fit-content' }}>
            <Eye size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Public Profile Visibility</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Allow other verified professionals in the network to find your profile.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={data.publicProfile} onChange={(e) => updateField('publicProfile', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Telemetry & Analytics */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--background)', color: 'var(--text-muted)', borderRadius: '8px', height: 'fit-content' }}>
            <Database size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Usage Data & Analytics</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Share anonymized usage data to help us improve the platform.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={data.dataSharing} onChange={(e) => updateField('dataSharing', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* AI Training */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--background)', color: 'var(--text-muted)', borderRadius: '8px', height: 'fit-content' }}>
            <ShieldAlert size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Atlas AI Data Training</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Allow your de-identified interaction data to be used to improve Atlas AI models. Medical data is strictly excluded.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={data.aiTraining} onChange={(e) => updateField('aiTraining', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Data Export & Deletion</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Request Data Export
          </button>
          <button className="gcp-btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            Delete Account
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deleting your account is permanent. All your data will be wiped within 30 days.</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--primary);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px var(--primary);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}} />
    </div>
  );
}