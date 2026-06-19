import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import React, { useState } from 'react';



/**
 * ExpandableTableRow - A reusable table row component with an optional extra column and expandable detail panel.
 * 
 * @param {React.ReactNode} mainContent     - First column (Title, Slugs)
 * @param {React.ReactNode} subContent      - Second column (Status, Badge)
 * @param {React.ReactNode} [extraContent]  - Optional third column (Formats & Date)
 * @param {React.ReactNode} actions         - Last column (Action buttons)
 * @param {React.ReactNode} expandedContent - Content shown when row is expanded
 */
export default function ExpandableTableRow({ mainContent, subContent, extraContent, actions, expandedContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colSpan = extraContent ? 4 : 3;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      <tr style={rowStyle}>
        <td style={mainTdStyle}>
          {mainContent}
        </td>
        <td style={subTdStyle}>
          {subContent}
        </td>
        {extraContent && (
          <td style={extraTdStyle}>
            {extraContent}
          </td>
        )}
        <td style={actionsTdStyle}>
          <div style={actionsContainerStyle}>
            {actions}
            <button 
              onClick={toggleExpand} 
              style={{ ...expandButtonStyle, backgroundColor: isExpanded ? '#e8eaed' : 'transparent' }}
              title={isExpanded ? "Collapse Details" : "Expand Details"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr style={expandedRowStyle}>
          <td colSpan={colSpan} style={expandedTdStyle}>
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  );
}


// ── Styles ──────────────────────────────────────────

const rowStyle = {
  borderBottom: '1px solid #e0e0e0',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f8f9fa'
  }
};

const expandedRowStyle = {
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '0.85rem',
  color: '#3c4043',
  verticalAlign: 'middle',
};

const mainTdStyle = {
  ...tdStyle,
  width: '45%',
};

const subTdStyle = {
  ...tdStyle,
  width: '20%',
};

const extraTdStyle = {
  ...tdStyle,
  width: '20%',
};

const actionsTdStyle = {
  ...tdStyle,
  textAlign: 'right',
  width: '25%',
};

const actionsContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
};

const expandButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: '#5f6368',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  marginLeft: '4px'
};

const expandedTdStyle = {
  padding: '16px',
};