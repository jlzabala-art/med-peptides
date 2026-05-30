import React from 'react';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppStatusChip from '../ui/AppStatusChip';
import AppActionGroup from '../ui/AppActionGroup';
import {
  User,
  Building2,
  Link2Off,
  AlertCircle,
  Clock,
  Link as LinkIcon,
  Edit,
  Eye,
  DollarSign,
} from 'lucide-react';

export default function AdminUsersTable({
  users,
  filteredUsersList,
  selectedUserIds,
  handleSelectAll,
  handleSelectUser,
  defaultRole,
  isPatientView,
  isWholesalerView,
  isDoctorView,
  readOnly,
  canApprove,

  // Handlers
  setEditingUser,
  setDetailsUser,
  handleToggleApproval,
  handleToggleArchive,
  handleSendEmail,
  sendingEmail,
  setFinancialWholesaler,

  // Expansion state
  expandedPatientId,
  setExpandedPatientId,
  fetchUserOrders,
  loadingUserOrders,
  userOrdersMap,
  handleSendWelcomeOffer,

  // Relationships
  getPatientRelationships,
  handleAssignDoctorToPatient,
  getDoctorWholesaler,
  getWholesalerStats,
  activeAssignments,
  renderBatchActions,

  // Pagination
  currentPage,
  totalPages,
  totalItems,
  rowsPerPage,
  onRowsPerPageChange,
  onPageChange,

  // Toolbar
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterRemove,
  renderCustomFilters,
}) {
  // Define columns
  const columns = [
    {
      key: 'user',
      header: 'User / Clinic',
      sortKey: 'fullName',
      sortValue: (u) => (u.fullName || u.displayName || u.email || '').toLowerCase(),
      render: (u) => {
        const roles = (u.roles && u.roles.length > 0 ? u.roles : u.role ? [u.role] : []).filter(
          (r) => !(defaultRole === 'wholesaler' && r === 'wholesaler')
        );

        const sourceBadge = u.zohoContactId ? 'Zoho Sync' : 'Local';
        const displayBadges = [...roles, sourceBadge];

        return (
          <div
            onClick={() => {
              if (isPatientView) {
                const isNowExpanded = expandedPatientId !== u.id;
                setExpandedPatientId(isNowExpanded ? u.id : null);
                if (isNowExpanded) {
                  fetchUserOrders(u.id, u.email);
                }
              }
            }}
            style={{ cursor: isPatientView ? 'pointer' : 'default' }}
          >
            <AppEntityCell
              title={u.fullName || u.displayName || `User (${u.id.substring(0, 6)})`}
              subtitle={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{u.institution || 'Individual / No Clinic'}</span>
                  {u.email && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ opacity: 0.5 }}>↳</span> {u.email}
                    </span>
                  )}
                </div>
              }
              badges={displayBadges}
            />
          </div>
        );
      },
    },
  ];

  // Wholesaler and Doctor dynamic columns have been moved to the expanded view to strictly enforce the 3-column paradigm.

  columns.push({
    key: 'status',
    header: 'Status',
    hideOnMobile: true,
    width: '120px',
    sortKey: 'status',
    sortValue: (u) => {
      if (u.isArchived) return 'archived';
      if (u.approved) return 'active';
      return 'pending';
    },
    render: (u) => {
      let statusStr = 'Pending';
      if (u.approved) statusStr = 'Active';
      if (u.isArchived) statusStr = 'Archived';

      const createdAt = u.createdAt ? new Date(u.createdAt) : new Date();
      const daysPending = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AppStatusChip status={statusStr} />
          {!u.approved && daysPending > 10 && (
            <span
              title={`Pending > 10 days (${daysPending} days). Please review.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--error)',
                cursor: 'help',
              }}
            >
              <AlertCircle size={16} />
            </span>
          )}
          {activeAssignments && activeAssignments.has(u.id) && (
            <span
              title="Assigned / Relationship Active"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#1a73e8',
                backgroundColor: 'rgba(26,115,232,0.1)',
                padding: '0.2rem',
                borderRadius: '50%',
              }}
            >
              <LinkIcon size={14} />
            </span>
          )}
        </div>
      );
    },
  });

  // Force actions to always render for debugging
  if (true) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '100px',
      render: (u) => {
        const actions = [];

        if (u.role === 'wholesaler' || (u.roles && u.roles.includes('wholesaler'))) {
          actions.push({ type: 'pricing', onClick: () => setFinancialWholesaler(u) });
        }

        actions.push({ type: 'edit', onClick: () => setEditingUser(u) });

        if (canApprove) {
          actions.push({
            type: u.approved ? 'revoke' : 'approve',
            onClick: () => handleToggleApproval(u.id, u.approved),
          });
        }

        actions.push({ type: 'archive', onClick: () => handleToggleArchive(u.id, u.isArchived) });

        if (u.approved && !u.isArchived) {
          actions.push({ type: 'send', onClick: () => handleSendEmail(u) });
          actions.push({ type: 'view', onClick: () => setDetailsUser(u) });
        }

        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  const renderExpandedRow = (u) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '1.5rem',
          borderLeft: '3px solid var(--primary)',
          paddingLeft: '1.25rem',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <div className="rp-desktop-only">
            {/* On desktop, this is visible as a column, but we keep it here just in case, or we can use show-on-mobile */}
          </div>
          <div className="show-on-mobile" style={{ display: 'none' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Email: </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{u.email || 'N/A'}</span>
          </div>
          <div className="show-on-mobile" style={{ display: 'none', marginTop: '4px' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Status: </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
              {u.approved ? 'Active' : 'Pending'} {u.isArchived ? '(Archived)' : ''}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Registered: </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
              {u.createdAt
                ? new Date(
                    u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt
                  ).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
              Region / Location:{' '}
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
              {u.country || u.shippingCountry || u.billingCountry || 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Purchases: </span>
            {isPatientView ? (
              (() => {
                if (loadingUserOrders[u.id]) {
                  return (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Loading purchase history...
                    </span>
                  );
                }
                const userOrders = userOrdersMap[u.id] || [];
                const totalSpent = userOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
                if (userOrders.length > 0) {
                  return (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {userOrders.length} order{userOrders.length === 1 ? '' : 's'} ($
                      {totalSpent.toFixed(2)} total)
                    </span>
                  );
                } else {
                  const isGuest = u.role === 'guest' || (u.roles && u.roles.includes('guest'));
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                        No purchases yet
                      </span>
                      {isGuest && !readOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWelcomeOffer(u);
                          }}
                          style={{
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.7rem',
                            backgroundColor: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            color: '#0369a1',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginLeft: '0.5rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#bae6fd')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                        >
                          Send Re-engagement Offer
                        </button>
                      )}
                    </span>
                  );
                }
              })()
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        </div>

        {/* Right Column: Visual Hierarchy Flowchart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Node 1: Patient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}
          >
            <User size={14} color="var(--primary)" />
            <span>{u.fullName || u.displayName || 'Patient'}</span>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>──▶</span>

          {/* Node 2: Physician (Doctor) */}
          {(() => {
            const { doctor } = getPatientRelationships ? getPatientRelationships(u.id) : {};
            const doctorList = users
              ? users.filter(
                  (usr) => usr.role === 'doctor' || (usr.roles && usr.roles.includes('doctor'))
                )
              : [];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <select
                  value={doctor ? doctor.id : ''}
                  onChange={(e) =>
                    handleAssignDoctorToPatient && handleAssignDoctorToPatient(u.id, e.target.value)
                  }
                  disabled={readOnly}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    border: doctor ? '1px solid rgba(26,115,232,0.3)' : '1px dashed var(--border)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: doctor ? '#1a73e8' : 'var(--text-muted)',
                    cursor: readOnly ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    maxWidth: '180px',
                  }}
                >
                  <option value="">-- Unassigned Doctor --</option>
                  {doctorList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.fullName || doc.displayName || doc.email}
                    </option>
                  ))}
                </select>
                {doctor && (
                  <button
                    type="button"
                    onClick={() => setDetailsUser && setDetailsUser(doctor)}
                    title="View Doctor Details"
                    style={{
                      padding: '0.4rem',
                      backgroundColor: 'white',
                      border: '1px solid rgba(26,115,232,0.3)',
                      borderRadius: '6px',
                      color: '#1a73e8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                      outline: 'none',
                    }}
                  >
                    <Eye size={14} />
                  </button>
                )}
              </div>
            );
          })()}

          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>──▶</span>

          {/* Node 3: Wholesaler */}
          {(() => {
            const { wholesaler } = getPatientRelationships ? getPatientRelationships(u.id) : {};
            if (wholesaler) {
              return (
                <button
                  type="button"
                  onClick={() => setDetailsUser && setDetailsUser(wholesaler)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid rgba(26,115,232,0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1a73e8',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <Building2 size={14} />
                  <span>{wholesaler.fullName || wholesaler.displayName}</span>
                </button>
              );
            }
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px dashed var(--border)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
              >
                <Link2Off size={14} />
                <span>Unassigned Wholesaler</span>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <DataTable
      data={filteredUsersList}
      columns={columns}
      keyField="id"
      selectedIds={selectedUserIds}
      onSelectionChange={
        handleSelectAll
          ? (ids) => {
              // DataTable passes an array of IDs.
              // We need to map this to our parent's logic.
              // Wait, the parent's handleSelectAll currently toggles all,
              // and handleSelectUser toggles one.
              // Let's implement an adapter here.
              if (ids.length === filteredUsersList.length) {
                handleSelectAll(filteredUsersList);
              } else if (ids.length === 0) {
                handleSelectAll([]); // Assuming parent handles this
              } else {
                // It's a single toggle
                // Find the difference
                const added = ids.find((id) => !selectedUserIds.includes(id));
                const removed = selectedUserIds.find((id) => !ids.includes(id));
                if (added) handleSelectUser(added);
                if (removed) handleSelectUser(removed);
              }
            }
          : undefined
      }
      renderBatchActions={renderBatchActions}
      expandableRender={renderExpandedRow}
      emptyTitle="No users found"
      emptyDescription="There are no users matching your current filters."
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      onPageChange={onPageChange}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      onFilterRemove={onFilterRemove}
      renderCustomFilters={renderCustomFilters}
    />
  );
}
