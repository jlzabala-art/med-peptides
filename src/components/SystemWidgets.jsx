import React from 'react';

/**
 * SystemWidgets component
 * Props:
 *   - auditEvents: array of { timestamp, title, description, user }
 *   - securityAlerts: array of { timestamp, title, description, user }
 *   - permissionChanges: array of { timestamp, title, description, user }
 *   - wholesaleReviews: array of { timestamp, title, description, user }
 *   - doctorPayments: array of { doctorName, period, amount, status }
 *
 * All sections are optional; if a section receives an empty or undefined array, it is omitted.
 * The UI is in English (no Spanish text) and contains no placeholder data.
 */
const SystemWidgets = ({
  auditEvents = [],
  securityAlerts = [],
  permissionChanges = [],
  wholesaleReviews = [],
  doctorPayments = [],
}) => {
  const hasContent =
    auditEvents.length ||
    securityAlerts.length ||
    permissionChanges.length ||
    wholesaleReviews.length ||
    doctorPayments.length;

  if (!hasContent) return null;

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h2>
      {children}
    </section>
  );

  const ListItem = ({ children }) => (
    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e0e0e0' }}>{children}</li>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {auditEvents.length > 0 && (
        <Section title="System Audit Log">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {auditEvents.map((e, i) => (
              <ListItem key={`audit-${i}`}> 
                <strong>{e.title}</strong> – {e.description}<br />
                <small>{e.timestamp} – {e.user}</small>
              </ListItem>
            ))}
          </ul>
        </Section>
      )}

      {securityAlerts.length > 0 && (
        <Section title="Security Alerts">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {securityAlerts.map((a, i) => (
              <ListItem key={`alert-${i}`}> 
                <strong>{a.title}</strong> – {a.description}<br />
                <small>{a.timestamp} – {a.user}</small>
              </ListItem>
            ))}
          </ul>
        </Section>
      )}

      {permissionChanges.length > 0 && (
        <Section title="Permission Changes">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {permissionChanges.map((p, i) => (
              <ListItem key={`perm-${i}`}> 
                <strong>{p.title}</strong> – {p.description}<br />
                <small>{p.timestamp} – {p.user}</small>
              </ListItem>
            ))}
          </ul>
        </Section>
      )}

      {wholesaleReviews.length > 0 && (
        <Section title="Wholesale Review Queue">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {wholesaleReviews.map((w, i) => (
              <ListItem key={`wholesale-${i}`}> 
                <strong>{w.title}</strong> – {w.description}<br />
                <small>{w.timestamp} – {w.user}</small>
              </ListItem>
            ))}
          </ul>
        </Section>
      )}

      {doctorPayments.length > 0 && (
        <Section title="Physician Settlements">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>Physician</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>Period</th>
                <th style={{ textAlign: 'right', borderBottom: '2px solid #ccc' }}>Amount</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctorPayments.map((d, i) => (
                <tr key={`pay-${i}`} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td>{d.doctorName}</td>
                  <td>{d.period}</td>
                  <td style={{ textAlign: 'right' }}>${d.amount.toFixed(2)}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
};

export default SystemWidgets;
