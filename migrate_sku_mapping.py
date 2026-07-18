import re

def migrate_file():
    path = '/Users/joseluiszabala/regenpept-web.nosync/src/components/admin/SkuMappingTab/AdminSkuMappingTab.jsx'
    with open(path, 'r') as f:
        content = f.read()

    # Find the table section
    start_str = '{/* Table */}'
    end_str = r'\s*</>\n\s*\)}\n\s*</div>'

    start_idx = content.find(start_str)
    if start_idx == -1:
        print("Could not find start")
        return
        
    match = re.search(end_str, content[start_idx:])
    if not match:
        print("Could not find end")
        return
        
    end_idx = start_idx + match.end()

    new_table = """{/* Table */}
      <div style={styles.tableWrapper}>
        <DataTable
          data={filtered}
          keyField="id"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          virtualize={true}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          emptyTitle="No mappings found"
          emptyDescription={mappings.length === 0 ? 'No mappings discovered yet. Click "Run Discovery" to scan catalogs.' : `No mappings match the active filter: ${filter}`}
          columns={[
            {
              key: 'details',
              label: 'Product Details',
              render: (m) => (
                <div style={{ cursor: 'pointer', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', width: 65 }}>Firebase</span>
                    <div style={styles.productName}>{m.firebase_name || <span style={{color: '#9aa0a6', fontStyle: 'italic'}}>Missing</span>}</div>
                    <code style={styles.sku}>{m.firebase_sku || '—'}</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#34a853', textTransform: 'uppercase', width: 65 }}>Zoho</span>
                    <div style={styles.productName}>{m.zoho_name || <span style={{color: '#9aa0a6', fontStyle: 'italic'}}>Missing</span>}</div>
                    <code style={styles.sku}>{m.zoho_sku || '—'}</code>
                  </div>
                </div>
              )
            },
            {
              key: 'confidence',
              label: 'Confidence',
              render: (m) => (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    (m.match_confidence || 0) >= 85
                      ? 'rgba(16,185,129,0.1)'
                      : (m.match_confidence || 0) >= 60
                        ? 'rgba(245,158,11,0.1)'
                        : 'rgba(239,68,68,0.1)',
                  color:
                    (m.match_confidence || 0) >= 85
                      ? '#10b981'
                      : (m.match_confidence || 0) >= 60
                        ? '#f59e0b'
                        : '#ef4444',
                }}>
                  {m.match_confidence || 0}%
                </span>
              )
            },
            {
              key: 'status',
              label: 'Status',
              style: { textAlign: 'center' },
              render: (m) => {
                const isZohoOnly = m.status === 'zoho_only';
                const isFirebaseOnly = m.status === 'firebase_only';
                let meta;
                if (isZohoOnly) meta = { icon: Database, color: '#5f6368', label: 'In Zoho Only' };
                else if (isFirebaseOnly) meta = { icon: Database, color: '#fbbc04', label: 'In Firebase Only' };
                else meta = STATUS_META[m.status] || STATUS_META.pending;

                const IconComponent = meta.icon;
                return (
                  <span
                    title={`${meta.label} - Click row details for options`}
                    style={{ display: 'inline-flex', verticalAlign: 'middle', color: meta.color }}
                  >
                    <IconComponent size={18} />
                  </span>
                );
              }
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (m) => {
                const isActing = actionId === m.id;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.status === 'pending' && (
                      <div style={styles.actionBtns}>
                        <button
                          style={styles.quickConfirmBtn}
                          onClick={(e) => { e.stopPropagation(); handleAction(m.id, 'confirm'); }}
                          disabled={isActing}
                          title="Confirm Match"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          style={styles.quickRejectBtn}
                          onClick={(e) => { e.stopPropagation(); handleAction(m.id, 'reject'); }}
                          disabled={isActing}
                          title="Reject Match"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {m.status === 'confirmed' && (
                      <span style={{ color: '#1a73e8', fontSize: 11, fontWeight: 500 }}>Ready</span>
                    )}
                    {m.status === 'synced' && (
                      <span style={{ color: 'var(--color-success)', fontSize: 11, fontWeight: 500 }}>Synced</span>
                    )}
                    {m.status === 'error' && (
                      <span style={{ color: 'var(--color-danger)', fontSize: 11, fontWeight: 500 }}>Error</span>
                    )}
                    {m.firebase_product_id && (
                      <button
                        style={styles.btnAlignFamily}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFamilyProductId(m.firebase_product_id);
                        }}
                        title="Align Product Family Variants"
                      >
                        Align Family
                      </button>
                    )}
                  </div>
                );
              }
            }
          ]}
          expandableRender={(m) => (
            <div style={{ ...styles.detailPanel, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {/* Unified Mapping Details Card */}
                <div style={styles.detailCard}>
                  <span style={styles.detailCardTitle}>Mapping Details</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: '16px', alignItems: 'center' }}>
                    {/* Header Row */}
                    <div style={{ fontWeight: 600, color: '#5f6368', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Firebase Catalog</div>
                    <div></div>
                    <div style={{ fontWeight: 600, color: '#5f6368', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoho Books Item</div>
                    {/* Row 1: Name */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Product Name</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_name !== undefined ? edits[m.id].firebase_name : (m.firebase_name || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_name', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'name')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'name')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Item Name</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_name !== undefined ? edits[m.id].zoho_name : (m.zoho_name || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_name', e.target.value)}
                      />
                    </div>

                    {/* Row 2: Category */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Category</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_category !== undefined ? edits[m.id].firebase_category : (m.category || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_category', e.target.value)}
                        placeholder="No category set"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'category')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'category')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Category / Group</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_category !== undefined ? edits[m.id].zoho_category : (m.zoho_category || m.category || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_category', e.target.value)}
                        placeholder="No category set"
                      />
                    </div>

                    {/* Row 3: SKU */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Firebase SKU</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_sku !== undefined ? edits[m.id].firebase_sku : (m.firebase_sku || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_sku', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'sku')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'sku')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Zoho SKU</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_sku !== undefined ? edits[m.id].zoho_sku : (m.zoho_sku || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_sku', e.target.value)}
                      />
                    </div>

                    {/* Row 4: Sale Price */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Sale Price (USD)</span>
                      <input
                        type="number"
                        style={styles.editInput}
                        value={edits[m.id]?.guest_usd !== undefined ? edits[m.id].guest_usd : (m.guest_usd || 0)}
                        onChange={(e) => handleEditChange(m.id, 'guest_usd', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'sale_price')} style={styles.copyBtn} title="Copy and Convert to AED"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'sale_price')} style={styles.copyBtn} title="Copy and Convert to USD"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Sale Rate (AED)</span>
                      <input
                        type="number"
                        style={styles.editInput}
                        value={edits[m.id]?.guest_aed !== undefined ? edits[m.id].guest_aed : (m.guest_aed || 0)}
                        onChange={(e) => handleEditChange(m.id, 'guest_aed', e.target.value)}
                      />
                    </div>

                    {/* Row 5: Purchase Price */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Purchase Price (USD)</span>
                      <input
                        type="number"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_purchase_usd !== undefined ? edits[m.id].firebase_purchase_usd : (m.firebase_purchase_usd || 0)}
                        onChange={(e) => handleEditChange(m.id, 'firebase_purchase_usd', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'purchase_price')} style={styles.copyBtn} title="Copy and Convert to AED"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'purchase_price')} style={styles.copyBtn} title="Copy and Convert to USD"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Purchase Rate (AED)</span>
                      <input
                        type="number"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_purchase_rate !== undefined ? edits[m.id].zoho_purchase_rate : (m.zoho_purchase_rate || 0)}
                        onChange={(e) => handleEditChange(m.id, 'zoho_purchase_rate', e.target.value)}
                      />
                    </div>

                    {/* Row 6: Sale Description */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Sale Description</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_description !== undefined ? edits[m.id].firebase_description : (m.firebase_description || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_description', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'description')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'description')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Sale Description</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_description !== undefined ? edits[m.id].zoho_description : (m.zoho_description || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_description', e.target.value)}
                      />
                    </div>

                    {/* Row 7: Purchase Description */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Purchase Description</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_purchase_description !== undefined ? edits[m.id].firebase_purchase_description : (m.firebase_purchase_description || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_purchase_description', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'purchase_description')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'purchase_description')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Purchase Description</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_purchase_description !== undefined ? edits[m.id].zoho_purchase_description : (m.zoho_purchase_description || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_purchase_description', e.target.value)}
                      />
                    </div>

                    {/* Row 8: Supplier */}
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Supplier Name</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.firebase_supplier_name !== undefined ? edits[m.id].firebase_supplier_name : (m.firebase_supplier_name || '')}
                        onChange={(e) => handleEditChange(m.id, 'firebase_supplier_name', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                      <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'supplier')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                      <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'supplier')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                    </div>
                    <div style={styles.detailField}>
                      <span style={styles.detailLabel}>Preferred Vendor Name</span>
                      <input
                        type="text"
                        style={styles.editInput}
                        value={edits[m.id]?.zoho_vendor_name !== undefined ? edits[m.id].zoho_vendor_name : (m.zoho_vendor_name || '')}
                        onChange={(e) => handleEditChange(m.id, 'zoho_vendor_name', e.target.value)}
                      />
                    </div>

                    {/* Row 9: IDs / Links */}
                    <div style={{ ...styles.detailField, paddingTop: 12, borderTop: '1px solid #f1f3f4', marginTop: 8 }}>
                      <span style={styles.detailLabel}>IDs</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {m.firebase_product_id ? (
                          <span style={styles.idBadge}>Firebase ID: {m.firebase_product_id.substring(0,8)}...</span>
                        ) : <span style={{fontSize: 11, color: '#9aa0a6'}}>Not in Firebase</span>}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f3f4', marginTop: 8, paddingTop: 12 }}></div>
                    <div style={{ ...styles.detailField, paddingTop: 12, borderTop: '1px solid #f1f3f4', marginTop: 8 }}>
                      <span style={styles.detailLabel}>IDs</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {m.zoho_item_id ? (
                          <a href={`https://books.zoho.com/app#/inventory/items/${m.zoho_item_id}`} target="_blank" rel="noreferrer" style={styles.idBadgeLink}>
                            Zoho ID: {m.zoho_item_id} <ExternalLink size={10} />
                          </a>
                        ) : <span style={{fontSize: 11, color: '#9aa0a6'}}>Not in Zoho</span>}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Conflict Resolution Tools */}
                <div style={{ ...styles.detailCard, backgroundColor: '#fef7e0', border: '1px solid #fbbc04' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <AlertTriangle size={16} color="#f9ab00" />
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#b06000' }}>Conflict Resolution</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#5f6368', marginBottom: 16, lineHeight: 1.5 }}>
                    If this is a false match or the items should not be synced, you can explicitly unlink them or set the master record.
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button style={styles.btnGcpDangerBorder} onClick={(e) => { e.stopPropagation(); handleAction(m.id, 'reject'); }} disabled={isActing}>
                      Reject Match (Unlink)
                    </button>
                    <button style={styles.btnGcpSecondary} onClick={(e) => { e.stopPropagation(); handleAction(m.id, 'force_zoho_master'); }} disabled={isActing}>
                      Force Zoho as Master
                    </button>
                    <button style={styles.btnGcpSecondary} onClick={(e) => { e.stopPropagation(); handleAction(m.id, 'force_fb_master'); }} disabled={isActing}>
                      Force Firebase as Master
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      </div>"""

    content = content[:start_idx] + new_table + content[end_idx:]
    
    # Also we need to import DataTable
    if "import DataTable" not in content:
        import_str = "import { Package, Search, Database, Check, X, AlertTriangle, ArrowRight, ArrowLeft, ExternalLink, Activity } from 'lucide-react';\n"
        content = content.replace(import_str, import_str + "import DataTable from '../ui/DataTable';\n")

    with open(path, 'w') as f:
        f.write(content)
        
    print("Migration complete!")

if __name__ == '__main__':
    migrate_file()
