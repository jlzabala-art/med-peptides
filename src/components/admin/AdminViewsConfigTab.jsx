import Eye from "lucide-react/dist/esm/icons/eye";
import Save from "lucide-react/dist/esm/icons/save";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Settings from "lucide-react/dist/esm/icons/settings";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import notifier from '../../services/NotificationService';






import { useStaticData } from '../../hooks/useStaticData';
import styles from './AdminViewsConfigTab.module.css';

export default function AdminViewsConfigTab() {
  const { productCategories } = useStaticData();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const availableTabs = [
    { id: 'users', label: 'Users' },
    { id: 'products', label: 'Products & Catalog' },
    { id: 'costs', label: 'Costs & Supplier' },
    { id: 'prices', label: 'Prices & Discounts' },
    { id: 'relationships', label: 'Peptide Relations' },
    { id: 'semantic', label: 'Semantic AI Search' },
    { id: 'settings', label: 'Global Settings' },
    { id: 'invitations', label: 'Invitations Manager' },
    { id: 'patients', label: 'Physician Patients (B2B)' },
    { id: 'orders', label: 'Orders & History' },
    { id: 'protocols', label: 'Protocols Registry' },
    { id: 'doctor_protocols', label: 'Physician Protocols (B2B)' },
    { id: 'variants', label: 'Product Variants' },
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      setLoading(true);
      const q = query(collection(db, 'viewConfigs'));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setConfigs(list);
    } catch (err) {
      console.error('Error fetching configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({
      name: 'New View Profile',
      roleKey: 'custom_role',
      tabs: {},
    });
  };

  const handleEdit = (cfg) => {
    setEditingId(cfg.id);
    setEditForm(JSON.parse(JSON.stringify(cfg))); // Deep copy
  };

  async function handleSave() {
    if (!editForm.name || !editForm.roleKey) {
      notifier.info('Name and Role Key are required.');
      return;
    }

    try {
      const idToSave = editingId === 'new' ? editForm.roleKey : editingId;
      const ref = doc(db, 'viewConfigs', idToSave);
      await setDoc(ref, {
        name: editForm.name,
        roleKey: editForm.roleKey,
        tabs: editForm.tabs || {},
        updatedAt: new Date().toISOString(),
      });

      notifier.info('View Configuration Saved!');
      setEditingId(null);
      fetchConfigs();
    } catch (err) {
      console.error('Error saving config:', err);
      notifier.info('Failed to save configuration.');
    }
  };

  async function handleDelete(id) {
    notifier.confirmCritical('Are you sure you want to delete this view configuration?', async () => {
      try {
        await deleteDoc(doc(db, 'viewConfigs', id));
        fetchConfigs();
      } catch (err) {
        console.error('Error deleting config:', err);
      }
    });
  };

  const toggleTab = (tabId) => {
    const newTabs = { ...editForm.tabs };
    if (newTabs[tabId]) {
      delete newTabs[tabId];
    } else {
      newTabs[tabId] = { enabled: true, readOnly: true, hideCosts: false, canApprove: false };
    }
    setEditForm({ ...editForm, tabs: newTabs });
  };

  const updateTabProp = (tabId, propName, value) => {
    const newTabs = { ...editForm.tabs };
    if (!newTabs[tabId]) newTabs[tabId] = {};
    newTabs[tabId][propName] = value;
    setEditForm({ ...editForm, tabs: newTabs });
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <div
          style={{
            animation: 'spin 1s linear infinite',
            border: '4px solid rgba(0,54,102,0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
          }}
        />
        <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Loading configurations...
        </span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={`${styles.container} anim-fade-in`}>
      {/* Title Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.6rem',
              fontWeight: 850,
              color: 'var(--primary)',
              letterSpacing: '-0.02em',
            }}
          >
            <Eye size={26} color="var(--primary)" />
            View Configurations
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              marginTop: '0.5rem',
              fontWeight: 500,
            }}
          >
            Dynamically configure tab visibility, data restrictions, and workspace modes for B2B
            roles.
          </p>
        </div>
        {!editingId && (
          <button
            onClick={handleAddNew}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
            }}
          >
            <Plus size={16} /> Create View Profile
          </button>
        )}
      </div>

      {editingId ? (
        <div
          className="card"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid rgba(0,54,102,0.06)',
            boxShadow: 'var(--shadow-sm)',
            background: 'white',
          }}
        >
          {/* Edit Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '1.25rem',
            }}
          >
            <h3
              style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}
            >
              {editingId === 'new' ? 'Create New View Profile' : 'Edit View Profile'}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setEditingId(null)}
                className="btn btn-outline"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 750,
                  padding: '0.5rem 1.25rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 750,
                  padding: '0.5rem 1.25rem',
                }}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '0.5rem',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Profile Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. Physician Dashboard"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '0.5rem',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Role Key (Unique ID)
              </label>
              <input
                type="text"
                value={editForm.roleKey}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    roleKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                  })
                }
                disabled={editingId !== 'new'}
                placeholder="e.g. doctor_view"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: editingId !== 'new' ? 'var(--color-bg-app)' : 'white',
                  color: editingId !== 'new' ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: editingId !== 'new' ? 'not-allowed' : 'text',
                }}
              />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.35rem',
                  fontWeight: 500,
                }}
              >
                Lowercase alphanumeric and underscores only. This corresponds to the user's profile
                role.
              </p>
            </div>
          </div>

          {/* Permissions Grid */}
          <h4
            style={{
              margin: '0 0 1.25rem 0',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.5rem',
            }}
          >
            Workplace Modules & Permissions
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
            {availableTabs.map((tab) => {
              const isEnabled = !!editForm.tabs?.[tab.id];
              const tabConfig = editForm.tabs?.[tab.id] || {};

              return (
                <div
                  key={tab.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.25rem',
                    backgroundColor: isEnabled ? 'rgba(0,54,102,0.02)' : 'white',
                    border: '1.5px solid',
                    borderColor: isEnabled ? 'var(--primary)' : 'var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isEnabled ? '0 2px 8px rgba(0,54,102,0.03)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifySelf: 'start',
                      gap: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleTab(tab.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      readOnly
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--primary)',
                      }}
                    />
                    <strong
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: isEnabled ? 'var(--primary)' : 'var(--text-main)',
                        userSelect: 'none',
                      }}
                    >
                      {tab.label}
                    </strong>
                    {isEnabled && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(0,54,102,0.08)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  {isEnabled && (
                    <div
                      className="anim-fade-in"
                      style={{
                        marginTop: '1.25rem',
                        paddingLeft: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        borderLeft: '2px solid rgba(0,54,102,0.08)',
                      }}
                    >
                      {/* Standard Controls */}
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={tabConfig.readOnly !== false}
                            onChange={(e) => updateTabProp(tab.id, 'readOnly', e.target.checked)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          Read Only (Disable Modifications)
                        </label>

                        {tab.id === 'users' && (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={tabConfig.canApprove === true}
                              onChange={(e) =>
                                updateTabProp(tab.id, 'canApprove', e.target.checked)
                              }
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            Allow Approving Registrations
                          </label>
                        )}
                      </div>

                      {/* Products Custom Config */}
                      {tab.id === 'products' && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            width: '100%',
                            borderTop: '1px dashed var(--border)',
                            paddingTop: '0.85rem',
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={tabConfig.hideCosts === true}
                              onChange={(e) => updateTabProp(tab.id, 'hideCosts', e.target.checked)}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            Hide Cost / Supplier Info
                          </label>
                          <div style={{ width: '100%' }}>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 750,
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Restrict Catalog Categories:
                            </span>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '0.4rem',
                                marginTop: '0.25rem',
                              }}
                            >
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  padding: '0.5rem 0.75rem',
                                  background: 'white',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={(tabConfig.allowedCategories || ['All']).includes('All')}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      updateTabProp(tab.id, 'allowedCategories', ['All']);
                                    } else {
                                      updateTabProp(tab.id, 'allowedCategories', []);
                                    }
                                  }}
                                  style={{ accentColor: 'var(--primary)' }}
                                />
                                <strong>All Categories (Full Catalog)</strong>
                              </label>
                              {productCategories.map((cat) => {
                                const allowedList = tabConfig.allowedCategories || ['All'];
                                const isSelected = allowedList.includes(cat);
                                const isDisabled = allowedList.includes('All');
                                return (
                                  <label
                                    key={cat}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      color: isDisabled
                                        ? 'var(--text-muted)'
                                        : 'var(--color-text-primary)',
                                      padding: '0.5rem 0.75rem',
                                      background: isDisabled ? 'var(--color-bg-app)' : 'white',
                                      border: '1px solid',
                                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                                      opacity: isDisabled ? 0.65 : 1,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={isDisabled}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        let list = [...allowedList].filter((x) => x !== 'All');
                                        if (e.target.checked) {
                                          list.push(cat);
                                        } else {
                                          list = list.filter((item) => item !== cat);
                                        }
                                        if (list.length === 0) list = ['All'];
                                        updateTabProp(tab.id, 'allowedCategories', list);
                                      }}
                                      style={{ accentColor: 'var(--primary)' }}
                                    />
                                    {cat}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Orders Custom Config */}
                      {tab.id === 'orders' && (
                        <div
                          style={{
                            width: '100%',
                            borderTop: '1px dashed var(--border)',
                            paddingTop: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 750,
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              Pipeline View Mode:
                            </span>
                            <select
                              value={tabConfig.viewMode || 'wholesaler'}
                              onChange={(e) => updateTabProp(tab.id, 'viewMode', e.target.value)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                outline: 'none',
                                background: 'white',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="wholesaler">Wholesaler Mode (Own orders only)</option>
                              <option value="doctor">
                                Physician Mode (Assigned patients' orders)
                              </option>
                              <option value="admin">Admin Mode (All platform orders)</option>
                            </select>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(0,54,102,0.15)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 0.35rem 0',
                      fontSize: '1.1rem',
                      fontWeight: 850,
                      color: 'var(--primary)',
                    }}
                  >
                    {cfg.name}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    id: {cfg.roleKey}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => handleEdit(cfg)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cfg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1rem',
                  marginTop: 'auto',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Enabled Modules ({Object.keys(cfg.tabs || {}).length})
                </span>
                {Object.keys(cfg.tabs || {}).length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.35rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {Object.entries(cfg.tabs).map(([tabKey, props]) => (
                      <span
                        key={tabKey}
                        style={{
                          backgroundColor: 'rgba(0,54,102,0.04)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(0,54,102,0.06)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {availableTabs.find((t) => t.id === tabKey)?.label.split(' ')[0] || tabKey}
                        <span
                          style={{
                            color: props.readOnly
                              ? 'var(--color-text-tertiary)'
                              : 'var(--color-success)',
                            marginLeft: '3px',
                            fontWeight: 850,
                          }}
                        >
                          {props.readOnly ? 'R' : 'W'}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span
                    style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}
                  >
                    No modules active
                  </span>
                )}
              </div>
            </div>
          ))}

          {configs.length === 0 && (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border)',
                gridColumn: '1 / -1',
              }}
            >
              <ShieldCheck
                size={54}
                color="var(--primary)"
                style={{ opacity: 0.15, marginBottom: '1rem' }}
              />
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  margin: '0 0 0.5rem 0',
                }}
              >
                No View Profiles Configured
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Create a profile to customize which tabs are visible for different roles.
              </p>
            </div>
          )}
        </div>
      )}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminViewsConfigTab | Props: none
      </div>
</div>
  );
}