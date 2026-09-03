import React from 'react';
import { X, DollarSign } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';

export default function FinancialWholesalerModal({
  financialWholesaler,
  setFinancialWholesaler,
  users,
  allRelationships,
  wholesalerOrders
}) {
  if (!financialWholesaler) return null;

        
          // Compute revenue data
          const directPatientRels = allRelationships.filter(
            (r) => r.doctorId === financialWholesaler.id && r.status === 'active'
          );
          const directPatientIds = new Set();
          const associatedDoctorIds = new Set();

          directPatientRels.forEach((r) => {
            const peer = users.find((usr) => usr.id === r.patientId);
            if (peer) {
              const isDoc = peer.role === 'doctor' || (peer.roles && peer.roles.includes('doctor'));
              if (isDoc) {
                associatedDoctorIds.add(peer.id);
              } else {
                directPatientIds.add(peer.id);
              }
            }
          });

          const doctorPatientRels = allRelationships.filter(
            (r) => associatedDoctorIds.has(r.doctorId) && r.status === 'active'
          );
          const doctorPatientMap = {};
          doctorPatientRels.forEach((r) => {
            doctorPatientMap[r.patientId] = r.doctorId;
          });

          let doctorRevenue = {};
          let patientRevenue = {};

          wholesalerOrders.forEach((order) => {
            if (order.status === 'cancelled') return;
            const total = order.total || 0;
            const userId = order.userId;
            if (!userId) return;

            if (directPatientIds.has(userId)) {
              const patientUser = users.find((u) => u.id === userId);
              const name = patientUser
                ? patientUser.fullName || patientUser.displayName
                : `Paciente (${userId.substring(0, 6)})`;
              if (!patientRevenue[userId]) {
                patientRevenue[userId] = { name, total: 0, orderCount: 0 };
              }
              patientRevenue[userId].total += total;
              patientRevenue[userId].orderCount += 1;
            } else if (doctorPatientMap[userId]) {
              const docId = doctorPatientMap[userId];
              const doctorUser = users.find((u) => u.id === docId);
              const docName = doctorUser
                ? doctorUser.fullName || doctorUser.displayName
                : `Médico (${docId.substring(0, 6)})`;
              if (!doctorRevenue[docId]) {
                doctorRevenue[docId] = { name: docName, total: 0, orderCount: 0 };
              }
              doctorRevenue[docId].total += total;
              doctorRevenue[docId].orderCount += 1;
            }
          });

          const docList = Object.values(doctorRevenue).sort((a, b) => b.total - a.total);
          const patList = Object.values(patientRevenue).sort((a, b) => b.total - a.total);

          const totalDocRevenue = docList.reduce((acc, curr) => acc + curr.total, 0);
          const totalPatRevenue = patList.reduce((acc, curr) => acc + curr.total, 0);
          const grandTotalRevenue = totalDocRevenue + totalPatRevenue;

          return (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(2px)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--background)',
                  width: '100%',
                  maxWidth: '550px',
                  maxHeight: '85vh',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: '#1a73e8',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <DollarSign size={18} /> Revenue Summary
                  </h2>
                  <button
                    onClick={() => setFinancialWholesaler(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Wholesaler
                    </span>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {financialWholesaler.fullName || financialWholesaler.displayName}
                    </div>
                  </div>

                  {loadingOrders ? (
                    <div
                      style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      Loading order history...
                    </div>
                  ) : (
                    <>
                      {/* Portal Orders (USD) */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h3
                          style={{
                            margin: '0 0 0.75rem 0',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Portal Orders (USD)
                        </h3>
                        {/* Summary Totals */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              Via Physicians
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginTop: '0.2rem',
                              }}
                            >
                              $
                              {totalDocRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              Direct Patients
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginTop: '0.2rem',
                              }}
                            >
                              $
                              {totalPatRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1rem',
                            background: 'rgba(26, 115, 232, 0.05)',
                            border: '1px solid rgba(26, 115, 232, 0.15)',
                            borderRadius: '6px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#1a73e8', fontSize: '0.95rem' }}>
                            ACCUMULATED TOTAL
                          </span>
                          <span style={{ fontWeight: 900, color: '#1a73e8', fontSize: '1.4rem' }}>
                            $
                            {grandTotalRevenue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        {/* Table for Doctors */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Revenue by Clinics / Physicians ({docList.length})
                          </h4>
                          {docList.length === 0 ? (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                padding: '0.5rem 0',
                              }}
                            >
                              No revenue recorded via associated physicians.
                            </div>
                          ) : (
                            <DataTable
                              data={docList.map((d, i) => ({ ...d, _idx: i }))}
                              keyField="_idx"
                              columns={[
                                { key: 'name', header: 'Physician / Clinic', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.name}</span> },
                                { key: 'orders', header: 'Orders', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.orderCount}</span> },
                                { key: 'total', header: 'Total', render: (r) => <span style={{ fontWeight: 700 }}>${r.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> }
                              ]}
                            />
                          )}
                        </div>

                        {/* Table for Direct Patients */}
                        <div>
                          <h4
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Revenue by Direct Patients ({patList.length})
                          </h4>
                          {patList.length === 0 ? (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                padding: '0.5rem 0',
                              }}
                            >
                              No revenue recorded from direct patients.
                            </div>
                          ) : (
                            <DataTable
                              data={patList.map((p, i) => ({ ...p, _idx: i }))}
                              keyField="_idx"
                              columns={[
                                { key: 'name', header: 'Patient', render: (r) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.name}</span> },
                                { key: 'orders', header: 'Orders', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.orderCount}</span> },
                                { key: 'total', header: 'Total', render: (r) => <span style={{ fontWeight: 700 }}>${r.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> }
                              ]}
                            />
                          )}
                        </div>
                      </div>

                      {/* Zoho Books ERP Integration */}
                      <div
                        style={{
                          marginTop: '2rem',
                          borderTop: '2px solid var(--border)',
                          paddingTop: '1.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <Building2 size={16} color="var(--primary)" /> Zoho Books ERP
                            Integration
                          </h3>
                          {zohoFinancialLoading ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Loading Zoho data...
                            </span>
                          ) : zohoFinancialData ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#e6f4ea',
                                color: '#137333',
                                fontWeight: 600,
                              }}
                            >
                              Matched
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#fdf2f2',
                                color: '#c5221f',
                                fontWeight: 600,
                              }}
                            >
                              Not Found
                            </span>
                          )}
                        </div>

                        {zohoFinancialLoading ? (
                          <div
                            style={{
                              padding: '1.5rem',
                              textAlign: 'center',
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem',
                            }}
                          >
                            Fetching Zoho Books invoices...
                          </div>
                        ) : zohoFinancialError ? (
                          <div
                            style={{
                              backgroundColor: '#fdf2f2',
                              border: '1px solid #fde2e2',
                              borderRadius: '6px',
                              padding: '1rem',
                              fontSize: '0.85rem',
                              color: '#c5221f',
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                              Not Connected to Zoho Books
                            </div>
                            <div>
                              No wholesaler contact found in Zoho Books matching email:{' '}
                              <strong>{financialWholesaler.email}</strong>.
                            </div>
                            <div
                              style={{
                                marginTop: '0.75rem',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Please ensure the wholesaler's email in the portal matches their
                              contact profile in Zoho Books.
                            </div>
                          </div>
                        ) : zohoFinancialData ? (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--color-bg-app)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                padding: '0.75rem 1rem',
                                marginBottom: '1.5rem',
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {zohoFinancialData.contact.fullName}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '0.1rem',
                                  }}
                                >
                                  {zohoFinancialData.contact.company || 'No Company'} •{' '}
                                  {zohoFinancialData.contact.email}
                                </div>
                              </div>
                              <a
                                href={`https://erp.mediluxeme.com/app/662274409#/contacts/${zohoFinancialData.contact.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gcp-btn-secondary"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '0.35rem 0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  textDecoration: 'none',
                                }}
                              >
                                Open in Zoho Books ↗
                              </a>
                            </div>

                            <h4
                              style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Zoho Books Invoices ({zohoFinancialData.invoices?.length || 0})
                            </h4>

                            {!zohoFinancialData.invoices ||
                            zohoFinancialData.invoices.length === 0 ? (
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'var(--text-muted)',
                                  padding: '0.5rem 0',
                                  textAlign: 'center',
                                  fontStyle: 'italic',
                                }}
                              >
                                No invoices found in Zoho Books.
                              </div>
                            ) : (
                              <div
                                style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  border: '1px solid var(--border)',
                                  borderRadius: '6px',
                                }}
                              >
                                <DataTable
                                  data={zohoFinancialData.invoices.map((inv, i) => ({ ...inv, _idx: i }))}
                                  keyField="_idx"
                                  columns={[
                                    { key: 'invoice', header: 'Invoice #', render: (r) => <a href={`https://erp.mediluxeme.com/app/662274409#/invoices/${r.invoiceId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>{r.invoiceNumber}</a> },
                                    { key: 'date', header: 'Date', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.date}</span> },
                                    { key: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
                                    { key: 'total', header: 'Total (AED)', render: (r) => <span style={{ fontWeight: 700 }}>{r.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> }
                                  ]}
                                />
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--color-bg-app)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => setFinancialWholesaler(null)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        
}
