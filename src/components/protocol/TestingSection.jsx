import Activity from "lucide-react/dist/esm/icons/activity";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import React from 'react';




import './TestingSection.css';

export default function TestingSection({ protocol }) {
  // Mock testing data, ideally this comes from the canonical protocol model.
  const baselineTests = protocol?.testing_requirements?.baseline || [
    "Comprehensive Metabolic Panel (CMP)",
    "Complete Blood Count (CBC)",
    "Fasting Insulin & HbA1c",
    "Lipid Panel"
  ];

  const followUpTests = protocol?.testing_requirements?.follow_up || [
    "CMP & CBC (Month 3)",
    "HbA1c & Fasting Insulin (Month 3)",
    "Specific Marker Check (if applicable)"
  ];

  return (
    <div className="proto-testing">
      <div className="proto-testing__header">
        <Activity size={24} className="proto-testing__icon" />
        <h2 className="proto-testing__title">Clinical Monitoring & Labs</h2>
      </div>
      <p className="proto-testing__subtitle">
        Recommended baseline and follow-up testing to ensure clinical safety and efficacy during this protocol.
      </p>

      <div className="proto-testing__grid">
        <div className="proto-testing__card">
          <div className="proto-testing__card-header proto-testing__card-header--baseline">
            <Beaker size={18} />
            <h3>Baseline Testing</h3>
          </div>
          <ul className="proto-testing__list">
            {baselineTests.map((test, idx) => (
              <li key={idx}>
                <CheckCircle size={14} className="proto-testing__check" />
                {test}
              </li>
            ))}
          </ul>
        </div>

        <div className="proto-testing__card">
          <div className="proto-testing__card-header proto-testing__card-header--followup">
            <FileText size={18} />
            <h3>Follow-up Testing</h3>
          </div>
          <ul className="proto-testing__list">
            {followUpTests.map((test, idx) => (
              <li key={idx}>
                <CheckCircle size={14} className="proto-testing__check proto-testing__check--followup" />
                {test}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}