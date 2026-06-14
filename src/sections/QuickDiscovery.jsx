import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Layers from "lucide-react/dist/esm/icons/layers";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';





import { useNavigate } from 'react-router-dom';

const DISCOVERY_CARDS = [
  {
    id: 'peptides',
    icon: FlaskConical,
    title: 'Browse Peptides',
    description: 'Explore our full catalog and find the right compound for your goals.',
    color: 'var(--color-primary)',
    bg: 'rgba(0,163,224,0.06)',
    border: 'rgba(0,163,224,0.15)',
    searchTab: 'peptides',
  },
  {
    id: 'protocols',
    icon: Layers,
    title: 'Browse Protocols',
    description: 'Ready-to-use guides that show you how to get the most from each peptide.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.15)',
    searchTab: 'protocols',
  },
  {
    id: 'knowledge',
    icon: BookOpen,
    title: 'Learn & Understand',
    description: 'Clear explanations, dosing guidance, and answers to your questions.',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.15)',
    searchTab: 'questions',
  },
  {
    id: 'reconstitution',
    icon: Beaker,
    title: 'Reconstitution Guides',
    description: 'Simple, step-by-step instructions to prepare each compound safely.',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.06)',
    border: 'rgba(217,119,6,0.15)',
    route: '/reconstitution-guide',
  },
];


export default function QuickDiscovery({ onOpenSearch }) {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    if (card.soon) return;                       // Coming Soon — no action
    if (card.searchTab && onOpenSearch) {
      // Open search modal with the correct pre-selected tab
      onOpenSearch(undefined, card.searchTab);
    } else if (card.route) {
      navigate(card.route);
    }
  };

  return (
    <section className="qd-section">
      <div className="qd-container">

        {/* Section header */}
        <div className="qd-header">
          <p className="qd-eyebrow">
            Where Do You Want to Start?
          </p>
          <h2 className="qd-title">
            Your Wellness Journey, One Step at a Time
          </h2>
        </div>

        {/* Cards grid */}
        <div className="qd-grid">
          {DISCOVERY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`qd-card ${card.soon ? 'qd-card--soon' : ''}`}
                style={{
                  '--qd-color': card.color,
                  '--qd-bg': card.bg,
                  '--qd-border': card.border,
                }}
              >
                {/* Icon */}
                <div className="qd-icon-wrapper">
                  <Icon size={22} color={card.color} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <div className="qd-card-content">
                  <div className="qd-card-title">
                    {card.title}
                  </div>
                  <div className="qd-card-desc">
                    {card.description}
                  </div>
                </div>

                {/* Arrow or Coming Soon badge */}
                {card.soon ? (
                  <div className="qd-soon-badge">
                    Coming Soon
                  </div>
                ) : (
                  <div className="qd-action-link">
                    Explore <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}