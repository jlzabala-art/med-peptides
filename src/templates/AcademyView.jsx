import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Award from "lucide-react/dist/esm/icons/award";
import Clock from "lucide-react/dist/esm/icons/clock";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Circle from "lucide-react/dist/esm/icons/circle";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';










import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';

// ── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is peptide therapy in clinical medicine?',
    a: 'Peptides are short chains of amino acids that act as biological signalers. In clinical medicine, they are used to optimize recovery, metabolism, neurobiology, and longevity with high specificity and minimal side effects.',
  },
  {
    q: 'How do I access course materials?',
    a: 'Once enrolled, you will receive access to the online educational platform with all modules, recordings, and downloadable materials. Access remains active for 12 months from the start date.',
  },
  {
    q: 'Do the courses offer official certification?',
    a: 'Yes. All completed courses award an Official Certificate from Atlas Health / Renewal EU, recognized in multiple European and Latin American medical jurisdictions.',
  },
  {
    q: 'Can I access clinical protocols directly from the Academy?',
    a: 'Yes. The Clinical Protocols section is available to all verified professionals. You can access complete blueprints from the Protocols section in the main menu.',
  },
  {
    q: 'How often is content updated?',
    a: 'Content is updated quarterly with the latest scientific evidence, new approved protocols, and masterclasses from international experts.',
  },
  {
    q: 'Are there prerequisites for enrollment?',
    a: 'A professional degree in health sciences (medicine, pharmacy, advanced nursing, or others) is required, along with completing the Atlas Health professional verification process.',
  },
];

// ── Course Data ───────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 'renewal-master-protocols',
    title: 'Renewal Master Protocols',
    subtitle: 'Peptide Therapy for Human Optimization',
    category: 'Global Lecture Series',
    duration: '8 weeks',
    modules: 8,
    status: 'available', // available | enrolled | completed
    startDate: 'Mar 24, 2026',
    certification: true,
  },
  {
    id: 'metabolic-optimization-masterclass',
    title: 'Metabolic Optimization Masterclass',
    subtitle: 'GLP-1, GIP & metabolic pathways in precision medicine',
    category: 'Clinical Workshop',
    duration: '4 weeks',
    modules: 6,
    status: 'upcoming',
    startDate: 'May 2026',
    certification: true,
  },
  {
    id: 'longevity-neuro-series',
    title: 'Longevity & Neuroprotection Series',
    subtitle: 'Anti-aging peptides and cognitive enhancement protocols',
    category: 'Advanced Track',
    duration: '6 weeks',
    modules: 10,
    status: 'upcoming',
    startDate: 'July 2026',
    certification: true,
  },
];

// ── FAQ Accordion Item ────────────────────────────────────────────────────────
function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(0,54,102,0.08)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ fontSize: '0.97rem', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.4 }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          style={{
            flexShrink: 0,
            color: 'var(--secondary)',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? '300px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingBottom: '1.1rem', margin: 0 }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  available:  { label: 'Available',  color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)',  icon: Circle },
  enrolled:   { label: 'Enrolled',   color: 'var(--color-primary)', bg: 'rgba(37,99,235,0.1)',  icon: PlayCircle },
  completed:  { label: 'Completed',  color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: CheckCircle2 },
  upcoming:   { label: 'Upcoming',   color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.1)',  icon: Clock },
};

function CourseCard({ course, onSelect }) {
  const cfg = STATUS_CONFIG[course.status] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  return (
    <div
      onClick={() => onSelect && onSelect(course.id)}
      style={{
        background: 'white',
        border: '1px solid rgba(0,54,102,0.09)',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: course.status !== 'upcoming' ? 'pointer' : 'default',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(0,54,102,0.04)',
      }}
      onMouseEnter={e => {
        if (course.status !== 'upcoming') {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,54,102,0.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,54,102,0.04)';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--secondary)',
          background: 'rgba(0,163,224,0.08)', padding: '0.2rem 0.6rem', borderRadius: '99px',
        }}>
          {course.category}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
          color: cfg.color, background: cfg.bg, padding: '0.2rem 0.65rem', borderRadius: '99px',
        }}>
          <Icon size={11} />
          {cfg.label}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.25rem 0', lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          {course.subtitle}
        </p>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
          <Clock size={11} /> {course.duration}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
          <BookOpen size={11} /> {course.modules} modules
        </span>
        {course.certification && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
            <Award size={11} /> Certification
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Starts: <strong>{course.startDate}</strong>
        </span>
        {course.status !== 'upcoming' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>
            View details <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AcademyView({ onSelectCourse }) {
  usePageMeta({
    title: 'Professional Academy',
    description: 'Access exclusive educational content on peptide therapy, clinical protocols, and research methodology — available to verified medical professionals.',
    path: '/academy',
  });

  const { isProfessional } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  if (!isProfessional) {
    return (
      <div className="container" style={{ paddingTop: '120px', minHeight: '60vh', textAlign: 'center' }}>
        <h2>Restricted Access</h2>
        <p>This section is available exclusively for verified medical professionals.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '4rem', minHeight: '80vh', backgroundColor: 'var(--background)' }}>

      {/* ── Hero ── */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)', background: 'rgba(0,163,224,0.08)', border: '1px solid rgba(0,163,224,0.2)', padding: '0.3rem 0.9rem', borderRadius: '99px', marginBottom: '1rem' }}>
          <GraduationCap size={14} />
          Professional Academy
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Knowledge & Academy
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '700px', lineHeight: 1.65 }}>
          Exclusive educational resources, advanced clinical protocols, and masterclasses designed for precision medicine and peptide therapy professionals.
        </p>
      </div>

      {/* ── Featured Course ── */}
      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ width: '100%', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Featured Course</h2>
        </div>

        <div
          onClick={() => onSelectCourse && onSelectCourse('renewal-master-protocols')}
          style={{
            background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,54,102,0.1)',
            overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(0,54,102,0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,54,102,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,54,102,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: '20px', right: '24px', background: 'var(--primary)', color: 'white', padding: '0.35rem 0.9rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', zIndex: 10 }}>
            New Masterclass
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)' }}>
            <div style={{ background: 'linear-gradient(135deg,#003666 0%,#005a9c 60%,#0070c0 100%)', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', minHeight: '260px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Global Lecture Series</span>
              <h3 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 0.75rem 0' }}>Renewal Master Protocols</h3>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Peptide Therapy for Human Optimization</p>
            </div>
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                Learn all relevant clinical protocols for immunity, metabolism, neurobiology, and longevity from leading international experts.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                {[
                  [PlayCircle, 'Online Access: Mar 24, 2026'],
                  [Clock, 'Duration: 8 weeks (1 class/week)'],
                  [Award, 'Certification: Official Renewal EU'],
                ].map(([Icon, text], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <Icon size={16} color="var(--primary)" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.95rem', gap: '0.4rem' }}>
                View Masterclass details <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Catalog ── */}
      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Course Catalog</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{COURSES.length} courses available</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {COURSES.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
            />
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <HelpCircle size={18} color="var(--secondary)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ maxWidth: '780px' }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}