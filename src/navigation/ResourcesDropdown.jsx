 
import { Link } from 'react-router-dom';
import { Info, Mail, Scale, ShieldCheck, FileText } from 'lucide-react';
import { RESOURCES_MENU } from './navConfig';
import '../styles/header.css';

const ICON_MAP = { Info, Mail, Scale, ShieldCheck, FileText };

export default function ResourcesDropdown({ onClose }) {
  return (
    <div
      role="navigation"
      aria-label="Resources menu"
      className="dropdown-panel dropdown-panel--rich"
      style={{ left: '50%', transform: 'translateX(-50%)', minWidth: 340 }}
    >
      <div className="dropdown-rich-header">
        <span className="dropdown-rich-eyebrow">Resources</span>
        <span className="dropdown-rich-hint">Company &amp; legal information</span>
      </div>
      <div className="dropdown-rich-list">
        {RESOURCES_MENU.map((item) => {
          const Icon = ICON_MAP[item.icon] || Info;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="dropdown-rich-item"
              onClick={onClose}
            >
              <span className="dropdown-rich-icon">
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="dropdown-rich-text">
                <span className="dropdown-rich-label">{item.label}</span>
                {item.desc && <span className="dropdown-rich-desc">{item.desc}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
