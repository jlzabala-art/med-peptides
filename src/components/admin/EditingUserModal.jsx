import React from 'react';
import { X } from '@/lib/icons';
import DataTable from '../ui/DataTable';

export default function EditingUserModal({
  editingUser,
  setEditingUser,
  users,
  allRelationships,
  handleSaveUser,
  zohoLoading,
  zohoData,
  zohoQueryEmail,
  setZohoQueryEmail,
  zohoError,
  handleZohoSearch,
  handleRevokeAssignment,
  handleAssignUser,
  setDetailsUser
}) {
  if (!editingUser) return null;

        
          const isWS =
            editingUser.role === 'wholesaler' ||
            (editingUser.roles && editingUser.roles.includes('wholesaler'));

          // Compute lists for assignments
          const wholesalerIds = new Set(
            users
              .filter((u) => (u.roles && u.roles.includes('wholesaler')) || u.role === 'wholesaler')
              .map((u) => u.id)
          );
          const assignedToWholesalerIds = new Set();
          allRelationships.forEach((r) => {
            if (r.status === 'active' && wholesalerIds.has(r.doctorId)) {
              assignedToWholesalerIds.add(r.patientId);
            }
          });
          const freeDoctors = users.filter(
            (u) =>
              (u.role === 'doctor' || (u.roles && u.roles.includes('doctor'))) &&
              !assignedToWholesalerIds.has(u.id)
          );
          const freePatients = users.filter(
            (u) =>
              (u.role === 'patient' ||
                u.role === 'guest' ||
                (u.roles && (u.roles.includes('patient') || u.roles.includes('guest')))) &&
              !assignedToWholesalerIds.has(u.id)
          );

          const currentAssignments = allRelationships.filter(
            (r) => r.doctorId === editingUser.id && r.status === 'active'
          );

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
                  maxWidth: '650px',
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
                      color: 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    Edit User Data
                  </h2>
                  <button
                    onClick={() => setEditingUser(null)}
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
                  <form id="edit-user-form" onSubmit={handleSaveUser}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.fullName || editingUser.displayName || ''}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, fullName: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontSize: '0.9rem',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Institution / Clinic{' '}
                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontWeight: 400,
                              textTransform: 'none',
                            }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={editingUser.institution || ''}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, institution: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontSize: '0.9rem',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          System Role
                        </label>
                        <select
                          value={editingUser.role || 'guest'}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                          }}
                        >
                          <option value="guest">Guest / Patient</option>
                          <option value="doctor">Physician</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  {isWS && (
                    <>
                      <hr
                        style={{
                          border: 'none',
                          borderTop: '1px solid var(--border)',
                          margin: '1.5rem 0',
                        }}
                      />

                      {/* Zoho Books Section */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.75rem',
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
                            }}
                          >
                            Zoho Books Integration
                          </h3>
                          {zohoLoading ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Searching...
                            </span>
                          ) : zohoData ? (
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
                              Match: {zohoData.source}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#f1f3f4',
                                color: '#5f6368',
                                fontWeight: 600,
                              }}
                            >
                              Not Found in Zoho
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <input
                            type="email"
                            placeholder="Search by email in Zoho..."
                            value={zohoQueryEmail}
                            onChange={(e) => setZohoQueryEmail(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            onClick={() => handleZohoSearch(zohoQueryEmail)}
                            disabled={zohoLoading}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                          >
                            Sync / Search
                          </button>
                        </div>

                        {zohoError && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#d93025',
                              backgroundColor: '#fce8e6',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '4px',
                              marginBottom: '1rem',
                            }}
                          >
                            {zohoError}
                          </div>
                        )}

                        {zohoData?.contact && (
                          <div
                            style={{
                              backgroundColor: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              padding: '0.75rem 1rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <div>
                                <strong>Zoho Name:</strong> {zohoData.contact.fullName}
                              </div>
                              <div>
                                <strong>Company:</strong> {zohoData.contact.company || 'N/A'}
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <div>
                                <strong>Phone:</strong> {zohoData.contact.phone || 'N/A'}
                              </div>
                              <div>
                                <strong>Email:</strong> {zohoData.contact.email}
                              </div>
                            </div>
                            <div>
                              <strong>Address:</strong>{' '}
                              {[
                                zohoData.contact.address,
                                zohoData.contact.city,
                                zohoData.contact.country,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                            </div>
                            {zohoData.contact.description && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  fontStyle: 'italic',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                "{zohoData.contact.description}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <hr
                        style={{
                          border: 'none',
                          borderTop: '1px solid var(--border)',
                          margin: '1.5rem 0',
                        }}
                      />

                      {/* Doctor & Patient Assignments */}
                      <div>
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
                          Assigned Physicians & Patients
                        </h3>

                        {/* Current assignments list */}
                        <div
                          style={{
                            marginBottom: '1rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        >
                          {currentAssignments.length === 0 ? (
                            <div
                              style={{
                                padding: '1rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                              }}
                            >
                              No users assigned currently.
                            </div>
                          ) : (
                            <DataTable
                              data={currentAssignments.map((r, i) => {
                                const peer = users.find((usr) => usr.id === r.patientId);
                                return { ...r, _idx: i, peer };
                              }).filter(item => item.peer)}
                              keyField="_idx"
                              columns={[
                                { key: 'name', header: 'Name', render: (r) => (
                                  <button type="button" onClick={() => setDetailsUser(r.peer)} style={{ background: 'none', border: 'none', padding: 0, color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left' }}>
                                    {r.peer.fullName || r.peer.displayName || r.peer.email}
                                  </button>
                                )},
                                { key: 'role', header: 'Role', render: (r) => {
                                  const isDoc = r.peer.role === 'doctor' || (r.peer.roles && r.peer.roles.includes('doctor'));
                                  return (
                                    <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', backgroundColor: isDoc ? 'rgba(26, 115, 232, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isDoc ? '#1a73e8' : '#b45309', textTransform: 'capitalize', fontWeight: 600 }}>
                                      {isDoc ? 'physician' : 'patient'}
                                    </span>
                                  );
                                }},
                                { key: 'action', header: '', render: (r) => (
                                  <div style={{ textAlign: 'right' }}>
                                    <button type="button" onClick={() => handleRevokeAssignment(r.id)} style={{ color: '#d93025', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                      Unlink
                                    </button>
                                  </div>
                                )}
                              ]}
                            />
                          )}
                        </div>

                        {/* Assign new doctor */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <select
                            id="assign-doctor-select"
                            defaultValue=""
                            style={{
                              padding: '0.4rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value="" disabled>
                              Select Free Physician...
                            </option>
                            {freeDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.fullName || doc.displayName} ({doc.email})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const val = document.getElementById('assign-doctor-select').value;
                              if (val) {
                                handleAssignUser(val);
                                document.getElementById('assign-doctor-select').value = '';
                              }
                            }}
                          >
                            Link Physician
                          </button>
                        </div>

                        {/* Assign new patient */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '0.5rem',
                          }}
                        >
                          <select
                            id="assign-patient-select"
                            defaultValue=""
                            style={{
                              padding: '0.4rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value="" disabled>
                              Select Free Patient...
                            </option>
                            {freePatients.map((pat) => (
                              <option key={pat.id} value={pat.id}>
                                {pat.fullName || pat.displayName} ({pat.email})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const val = document.getElementById('assign-patient-select').value;
                              if (val) {
                                handleAssignUser(val);
                                document.getElementById('assign-patient-select').value = '';
                              }
                            }}
                          >
                            Link Patient
                          </button>
                        </div>
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
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => setEditingUser(null)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    form="edit-user-form"
                    type="submit"
                    className="gcp-btn-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        
}
