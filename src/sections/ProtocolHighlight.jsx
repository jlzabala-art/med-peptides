import Beaker from "lucide-react/dist/esm/icons/beaker";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import FileText from "lucide-react/dist/esm/icons/file-text";






import { useNavigate } from 'react-router-dom';

export default function ProtocolHighlight() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{
        background: 'linear-gradient(135deg, var(--primary, #003666) 0%, var(--primary-dark, #001f3f) 100%)',
        borderRadius: '32px',
        padding: 'clamp(3rem, 6vw, 5rem)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Decorative Elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0, 163, 224, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, flex: '1 1 500px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <Beaker size={16} /> Precision Research Workflow
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.2rem)', color: 'white', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Build Clinical-Grade <br /> Protocols in Seconds
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '550px' }}>
            Transform clinical objectives into structured, multi-phase titration schedules with automated safety validation and real-time economic forecasting.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '3rem' 
          }}>
            {[
              { icon: <Activity size={20} />, title: "Multi-phase Titration", text: "Automated dosing escalations." },
              { icon: <ShieldCheck size={20} />, title: "Safety Validation", text: "Pre-built clinical safety guards." },
              { icon: <DollarSign size={20} />, title: "Economic Estimation", text: "Real-time program cost analysis." },
              { icon: <FileText size={20} />, title: "Clinical Export", text: "Professional PDF documentation." }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--secondary)', paddingTop: '0.2rem' }}>{f.icon}</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{f.text}</div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/protocol-finder')}
            className="btn btn-primary"
            style={{ 
              backgroundColor: 'white', 
              color: 'var(--primary)', 
              padding: '1.25rem 2.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              borderRadius: '20px',
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Launch Blueprint Finder <ArrowRight size={20} />
          </button>
        </div>

        {/* Visual Mockup representation */}
        <div style={{ position: 'relative', zIndex: 1, flex: '1 1 350px', display: 'flex', justifyContent: 'center' }}>
           <div style={{ 
             background: 'rgba(255,255,255,0.05)', 
             border: '1px solid rgba(255,255,255,0.12)', 
             backdropFilter: 'blur(30px)', 
             borderRadius: '32px', 
             padding: '2.5rem',
             width: '100%',
             maxWidth: '450px',
             boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
             position: 'relative'
           }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }}/>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }}/>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }}/>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px' }}>PROTOCOL_V5.6</div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ width: '40%', height: '14px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ width: '90%', height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ width: '75%', height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                 <div style={{ height: '60px', background: 'rgba(0,163,224,0.12)', borderRadius: '16px', border: '1px solid rgba(0,163,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50%', height: '8px', background: 'rgba(0,163,224,0.4)', borderRadius: '4px' }} />
                 </div>
                 <div style={{ height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                 </div>
              </div>

              <div style={{ height: '120px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)', borderRadius: '16px', padding: '1.5rem' }}>
                 <div style={{ width: '30%', height: '8px', background: 'var(--secondary)', borderRadius: '4px', marginBottom: '1rem', opacity: 0.5 }} />
                 <div>
                   <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', marginBottom: '0.5rem' }} />
                   <div style={{ width: '85%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', marginBottom: '0.5rem' }} />
                   <div style={{ width: '60%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}