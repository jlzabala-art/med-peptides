import Search from "lucide-react/dist/esm/icons/search";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";






export default function PowerSearch({ onOpenSearch, searchQuery, setSearchQuery }) {
  const examples = [
    "tirzepatide escalation",
    "weight management",
    "reconstitution"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onOpenSearch && searchQuery?.trim()) {
      onOpenSearch(searchQuery.trim());
    }
  };

  // Open modal automatically as user types (no Enter needed)
  const handleChange = (val) => {
    setSearchQuery?.(val);
    if (val.trim().length >= 2) {
      onOpenSearch?.(val.trim());
    }
  };

  return (
    <section className="ps-section" style={{
      padding: 'clamp(2.5rem, 6vw, 4rem) 0',
      backgroundColor: '#fcfdfe',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

          <div className="ps-header" style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-primary)',
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.75rem'
            }}>
              <FlaskConical size={14} /> Unified discovery
            </div>

            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 850,
              color: '#0f172a',
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em'
            }}>
              Clinical Intelligence
            </h2>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .ps-form {
              position: relative;
              max-width: 600px;
              margin: 0 auto 1.5rem;
            }
            .ps-input {
              width: 100%;
              padding: 1.1rem 5.5rem 1.1rem 3rem;
              font-size: 1.1rem;
              border-radius: 16px;
              border: 2px solid #e2e8f0;
              background-color: white;
              color: #0f172a;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
              transition: all 0.2s ease;
              outline: none;
            }
            .ps-input:focus {
              border-color: #00A3E0;
              box-shadow: 0 10px 25px rgba(0, 163, 224, 0.12);
            }
            .ps-search-icon {
              position: absolute;
              left: 1rem;
              top: 50%;
              transform: translateY(-50%);
              color: #94a3b8;
              pointer-events: none;
            }
            .ps-search-btn {
              position: absolute;
              right: 0.5rem;
              top: 50%;
              transform: translateY(-50%);
              background: #00A3E0;
              color: white;
              border: none;
              border-radius: 10px;
              padding: 0.55rem 1rem;
              font-size: 0.85rem;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
              transition: background 0.2s ease;
              white-space: nowrap;
            }
            .ps-search-btn:hover { background: #0087b8; }
            .ps-search-btn:active { background: #006d96; }
            .ps-examples-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              overflow-x: auto;
              padding: 0.5rem 0;
              -webkit-overflow-scrolling: touch;
            }
            .ps-examples-container::-webkit-scrollbar { display: none; }
            .ps-chip {
              white-space: nowrap;
              background: white;
              border: 1px solid #e2e8f0;
              padding: 0.4rem 0.9rem;
              border-radius: 100px;
              color: #64748b;
              font-size: 0.85rem;
              font-weight: 600;
              cursor: pointer;
            }

            .ps-indicators-grid {
              margin-top: 3rem;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
              border-top: 1px solid #f1f5f9;
              padding-top: 2rem;
            }

            .indicator-item {
              display: flex;
              align-items: center;
              gap: 0.75rem;
            }

            @media (max-width: 640px) {
              .ps-header { margin-bottom: 1.5rem; }
              .ps-input { 
                padding: 0.9rem 5.5rem 0.9rem 2.8rem;
                font-size: 1rem; 
                border-radius: 12px;
              }
              .ps-search-icon { left: 0.85rem; width: 18px; }
              .ps-search-btn { font-size: 0.8rem; padding: 0.5rem 0.85rem; }
              .ps-examples-container {
                justify-content: flex-start;
                padding-left: 1rem;
                margin: 0 -1.5rem;
              }
              .ps-indicators-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 0.625rem;
                padding: 1.25rem 0;
                margin-top: 1.5rem;
                border-top: 1px solid #f1f5f9;
                justify-items: center;
                max-width: 380px;
                margin-left: auto;
                margin-right: auto;
              }
              .indicator-item {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 0.5rem;
                background: white;
                border: 1px solid #e8f0f8;
                border-radius: 14px;
                padding: 1rem 0.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              }
              .indicator-item .indicator-icon {
                width: 44px;
                height: 44px;
                border-radius: 12px;
              }
              .indicator-item .indicator-title {
                font-size: 0.8rem;
              }
              .indicator-item .indicator-sub {
                display: none;
              }
            }
          ` }} />

          <form className="ps-form" onSubmit={handleSearch}>
            <Search className="ps-search-icon" size={20} />
            <input
              type="text"
              className="ps-input"
              placeholder="Search peptides, protocols..."
              value={searchQuery || ''}
              onChange={(e) => handleChange(e.target.value)}
            />
            <button type="submit" className="ps-search-btn">
              Search <ArrowRight size={14} />
            </button>
          </form>

          <div className="ps-examples-container">
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Try:</span>
            {examples.map(ex => (
              <button
                key={ex}
                className="ps-chip"
                onClick={() => {
                  setSearchQuery?.(ex);
                  onOpenSearch?.(ex);
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Type Indicators */}
      <div className="container">
        <div className="ps-indicators-grid">

          <div className="indicator-item">
            <div className="indicator-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(0,163,224,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <FlaskConical size={18} />
            </div>
            <div>
              <div className="indicator-title" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Products</div>
              <div className="indicator-sub" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>HPLC Purity</div>
            </div>
          </div>

          <div className="indicator-item">
            <div className="indicator-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', flexShrink: 0 }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div className="indicator-title" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Protocols</div>
              <div className="indicator-sub" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Step-by-step</div>
            </div>
          </div>

          <div className="indicator-item">
            <div className="indicator-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="indicator-title" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Knowledge</div>
              <div className="indicator-sub" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Clinical FAQ</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}