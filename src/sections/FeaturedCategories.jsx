 
import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Activity, Zap, Sparkles, Brain, Moon, Target, ShieldCheck } from 'lucide-react';

const featuredCategories = [
  {
    name: "Recovery",
    fullName: "Recovery & Repair",
    tagline: "Biological Restoration",
    desc: "Targeted research into tissue regeneration, inflammatory response, and physical resilience.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/recovery_lifestyle_1777913809223.png",
    color: "#EC4899", // pink-600
    colorBorder: "rgba(236,72,153,0.12)",
    gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)",
    searchTerm: "Recovery & Repair",
    icon: <Activity size={16} />
  },
  {
    name: "Metabolic",
    fullName: "Metabolic & Weight",
    tagline: "Energy Systems",
    desc: "Investigating GLP-1 pathways, insulin sensitivity, and lipid metabolism optimization.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/metabolic_lifestyle_1777913723773.png",
    color: "#16A34A", // green-600
    colorBorder: "rgba(22,163,74,0.12)",
    gradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(22, 163, 74, 0.05) 100%)",
    searchTerm: "Metabolic & Weight",
    icon: <Zap size={16} />
  },
  {
    name: "Longevity",
    fullName: "Longevity & Anti-Aging",
    tagline: "Cellular Aging",
    desc: "Exploring telomere support, cellular senescence, and biological age deceleration.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/longevity_lifestyle_1777913741244.png",
    color: "#6D28D9", // violet-700
    colorBorder: "rgba(109,40,217,0.12)",
    gradient: "linear-gradient(135deg, rgba(109, 40, 217, 0.15) 0%, rgba(109, 40, 217, 0.05) 100%)",
    searchTerm: "Longevity & Anti-Aging",
    icon: <Sparkles size={16} />
  },
  {
    name: "Cognitive",
    fullName: "Cognitive & Mood",
    tagline: "Neural Enhancement",
    desc: "Researching neuroprotection, synaptic plasticity, and neurotransmitter balance.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/cognitive_lifestyle_v2_1777913855821.png",
    color: "#0891B2", // cyan-600
    colorBorder: "rgba(8,145,178,0.12)",
    gradient: "linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)",
    searchTerm: "Cognitive & Mood",
    icon: <Brain size={16} />
  },
  {
    name: "Sleep",
    fullName: "Sleep & Circadian",
    tagline: "Restorative Cycles",
    desc: "Optimizing deep sleep architecture and rhythmic biological synchronization.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/sleep_lifestyle_1777913767102.png",
    color: "#4F46E5", // indigo-600
    colorBorder: "rgba(79,70,229,0.12)",
    gradient: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)",
    searchTerm: "Sleep & Circadian",
    icon: <Moon size={16} />
  },
  {
    name: "Hormonal",
    fullName: "Hormonal Optimization",
    tagline: "Endocrine Balance",
    desc: "Analyzing GH-axis stimulation and regulatory hormone signaling pathways.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/hormonal_lifestyle_1777913782136.png",
    color: "#EA580C", // orange-600
    colorBorder: "rgba(234,88,12,0.12)",
    gradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(234, 88, 12, 0.05) 100%)",
    searchTerm: "Hormonal Optimization",
    icon: <Target size={16} />
  },
  {
    name: "Immune",
    fullName: "Immune Support",
    tagline: "Defense Modulation",
    desc: "Investigating innate immunity, cytokine regulation, and host defense mechanisms.",
    image: "/Users/joseluiszabala/.gemini/antigravity/brain/12ef6b9e-42a6-441d-9ec0-301c8298ac57/immune_lifestyle_1777913796065.png",
    color: "var(--color-success)", // emerald-600
    colorBorder: "rgba(5,150,105,0.12)",
    gradient: "linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)",
    searchTerm: "Immune Support",
    icon: <ShieldCheck size={16} />
  }
];

export default function FeaturedCategories({ onSelectCategory, onOpenSearch }) {
  const tickerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const animationRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let speed = 0.5; // pixels per frame
    const animate = () => {
      if (!isInteracting) {
        ticker.scrollLeft += speed;
        // Simple loop reset if it reaches the end (cloned items handle the visual loop)
        if (ticker.scrollLeft >= ticker.scrollWidth / 2) {
          ticker.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isInteracting]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    setIsInteracting(true);
    startX.current = e.pageX - tickerRef.current.offsetLeft;
    scrollLeft.current = tickerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsInteracting(false);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    // Delay returning to auto-scroll slightly for better feel
    setTimeout(() => setIsInteracting(false), 1000);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - tickerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll-fast factor
    tickerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = (e) => {
    setIsInteracting(true);
    startX.current = e.touches[0].pageX - tickerRef.current.offsetLeft;
    scrollLeft.current = tickerRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX - tickerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    tickerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsInteracting(false), 1000);
  };

  return (
    <section className="fc-section">
      {/* Section header */}
      <div className="fc-header">
        <h2 className="fc-heading">Research Focus Areas</h2>
        <p className="fc-subheading">Select biological pathway to explore research peptides</p>
      </div>

      {/* Goal Ticker Strip */}
      <div className="fc-ticker-wrapper">
        <div 
          className="fc-ticker-strip"
          ref={tickerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="fc-ticker-track-drag">
            {[...featuredCategories, ...featuredCategories, ...featuredCategories, ...featuredCategories].map((cat, idx) => (
              <div 
                key={`${cat.name}-${idx}`} 
                className="fc-ticker-item"
                onClick={() => {
                  if (!isDragging.current) {
                    onOpenSearch ? onOpenSearch(cat.searchTerm, 'peptides') : onSelectCategory(cat.fullName);
                  }
                }}
              >
                <span className="fc-ticker-dot" style={{ background: cat.color }}></span>
                <span className="fc-ticker-label">{cat.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fc-container" style={{ position: 'relative', zIndex: 10, marginTop: '2rem' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .fc-section {
            padding: 4rem 0 2rem;
            background: var(--background, #F4F8FB);
            overflow: hidden;
          }

          .fc-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 0 1.5rem;
          }

          .fc-heading {
            font-size: clamp(1.6rem, 3vw, 2.25rem);
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -0.025em;
            margin: 0 0 0.5rem;
          }

          .fc-subheading {
            font-size: 1rem;
            color: var(--text-muted);
            margin: 0;
            font-weight: 400;
          }

          /* Ticker Strip */
          .fc-ticker-wrapper {
            width: 100%;
            background: white;
            border-top: 1px solid var(--border-light);
            border-bottom: 1px solid var(--border-light);
            position: relative;
            z-index: 5;
          }

          .fc-ticker-strip {
            padding: 0.85rem 0;
            display: flex;
            overflow-x: auto;
            cursor: grab;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
          }

          .fc-ticker-strip::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }

          .fc-ticker-strip:active {
            cursor: grabbing;
          }

          .fc-ticker-track-drag {
            display: flex;
            gap: 3rem;
            white-space: nowrap;
            padding: 0 1.5rem;
          }

          .fc-ticker-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-main);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .fc-ticker-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .fc-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          .fc-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
            padding: 1.5rem;
            background: var(--surface, #FFFFFF);
            border-radius: 28px;
            border: 1px solid var(--border-light, #DDE6EF);
            box-shadow: 0 8px 32px rgba(0, 54, 102, 0.08);
          }

          .fc-card {
            border-radius: 20px;
            border: 1px solid var(--fc-border);
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--background, #F4F8FB);
            position: relative;
          }

          .fc-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 40px rgba(0, 54, 102, 0.14);
            border-color: var(--fc-hover-border);
          }

          .fc-img-wrap {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            overflow: hidden;
            flex-shrink: 0;
          }

          .fc-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            display: block;
          }

          .fc-card:hover .fc-img-wrap img {
            transform: scale(1.06);
          }

          .fc-img-overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .fc-body {
            padding: 1.25rem 1.35rem 1.35rem;
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            flex: 1;
          }

          .fc-tagline {
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            opacity: 0.9;
          }

          .fc-title {
            font-size: 1.05rem;
            font-weight: 700;
            margin: 0;
            color: var(--primary);
            letter-spacing: -0.01em;
            line-height: 1.25;
          }

          .fc-desc {
            font-size: 0.82rem;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.55;
          }

          .fc-cta {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 0.78rem;
            font-weight: 700;
            margin-top: 0.75rem;
            letter-spacing: 0.01em;
          }

          @media (max-width: 900px) {
            .fc-grid { grid-template-columns: repeat(2, 1fr); }
          }

          @media (max-width: 640px) {
            .fc-section { padding: 3rem 0 1rem; }
            
            .fc-container {
              padding: 0 0 1rem 1.25rem !important;
              margin-top: 1rem !important;
            }

            .fc-grid {
              display: flex !important;
              overflow-x: auto !important;
              scroll-snap-type: x mandatory;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0.75rem 1.25rem 0.75rem 0 !important;
              gap: 1rem;
              -webkit-overflow-scrolling: touch;
              border-radius: 0;
            }

            .fc-grid::-webkit-scrollbar { display: none; }

            .fc-card {
              min-width: 280px;
              scroll-snap-align: start;
              background: var(--surface) !important;
              border: 1px solid var(--border-light) !important;
              box-shadow: 0 4px 16px rgba(0, 54, 102, 0.07);
            }
            .fc-img-wrap img { object-position: center 20%; }
            .fc-img-wrap { aspect-ratio: 16/10; }
          }
        `}} />

        <div className="fc-grid">
          {featuredCategories.map((cat) => (
            <div
              key={cat.name}
              className="fc-card"
              onClick={() => {
                if (onOpenSearch) {
                  onOpenSearch(cat.searchTerm, 'peptides');
                } else if (onSelectCategory) {
                  onSelectCategory(cat.fullName);
                }
              }}
              style={{
                '--fc-border': cat.colorBorder,
                '--fc-hover-border': cat.color,
              }}
            >
              {/* Image */}
              <div className="fc-img-wrap">
                <img src={cat.image} alt={cat.tagline} loading="lazy" />
                <div className="fc-img-overlay" style={{ background: cat.gradient }} />
              </div>

              {/* Body */}
              <div className="fc-body">
                <span className="fc-tagline" style={{ color: cat.color }}>{cat.tagline}</span>
                <h3 className="fc-title">
                  {cat.fullName}
                </h3>
                <p className="fc-desc">{cat.desc}</p>
                <span className="fc-cta" style={{ color: cat.color }}>
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}