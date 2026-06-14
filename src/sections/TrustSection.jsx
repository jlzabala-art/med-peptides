import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Shield from "lucide-react/dist/esm/icons/shield";
import Truck from "lucide-react/dist/esm/icons/truck";
import Zap from "lucide-react/dist/esm/icons/zap";





export default function TrustSection() {
  const stats = [
    { label: 'Purity Standard', value: '99%+', icon: <CheckCircle className="icon-blue" /> },
    { label: 'Third Party Verified', value: '100%', icon: <Shield className="icon-purple" /> },
    { label: 'Global Shipping', value: '4-7 Days', icon: <Truck className="icon-green" /> },
    { label: 'Customer Rating', value: '4.9/5', icon: <Zap className="icon-orange" /> }
  ];

  return (
    <section className="trust">
      <div className="container">
        <div className="trust-grid">
          <div className="trust-content">
            <h2 className="title">Built on Trust, <br/>Defined by Data.</h2>
            <p className="description">
              In an industry often clouded by ambiguity, we prioritize transparency above all else. Every product undergoes rigorous analytical testing to ensure it meets the highest standards of peptide research.
            </p>
            <div className="badges">
              <div className="badge">ISO 9001 Certified</div>
              <div className="badge">USP Grade Materials</div>
              <div className="badge">Secure Checkout</div>
            </div>
          </div>
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon-box">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .trust {
          padding: 8rem 1.5rem;
          background: var(--surface);
          border-top: 1px solid var(--border);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }
        .title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .description {
          font-size: 1.125rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 540px;
        }
        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .badge {
          padding: 0.5rem 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 50px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .stat-card {
          background: var(--background);
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
        }
        .stat-icon-box {
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
        }
        .stat-icon-box svg {
          width: 32px;
          height: 32px;
        }
        .icon-blue { color: #3b82f6; }
        .icon-purple { color: #8b5cf6; }
        .icon-green { color: #10b981; }
        .icon-orange { color: #f59e0b; }
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        @media (max-width: 992px) {
          .trust {
            padding: 4rem 1.5rem;
          }
          .trust-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .description {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
            font-size: 1rem;
          }
          .badges {
            justify-content: center;
          }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}