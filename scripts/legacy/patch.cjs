const fs = require('fs');
const file = 'src/components/admin/AdminWholesellersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import ERPStatusBadge from '\.\.\/shared\/ERPStatusBadge';/, "import ERPStatusBadge from '../shared/ERPStatusBadge';\nimport { Tabs, StatusChip } from '../ui';");

content = content.replace(/<SupplierStatusBadge status=\{([^\}]+)\} \/>/g, "<StatusChip status={$1} />");

content = content.replace(/\/\/ Helper for status badge[\s\S]+?\}\n\n\/\/ ── Wholeseller Detail/, "// ── Wholeseller Detail");

const tabButtonsRegex = /\{\/\* Zoho Style Tabs Menu \*\/\}[\s\S]+?\{\/\* Detail Content \(Scrollable\) \*\/\}/;

content = content.replace(tabButtonsRegex, 
`{/* Detail Content via Tabs component */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Master Data Alert Banner */}
                  {w.isZohoMaster && (
                    <div style={{
                      padding: '0.85rem 1.15rem',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      color: '#b45309',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      lineHeight: 1.4
                    }}>
                      <Lock size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Zoho Master Record</strong> — Field editing is disabled to preserve catalog alignment. Make modifications directly in Zoho Books.
                      </div>
                    </div>
                  )}

                  {/* General Info Card */}
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="#3b82f6" /> General Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.25rem' }}>
                      {renderCopyableField('Company Name', w.companyName, 'companyName', w.isZohoMaster, true)}
                      {renderCopyableField('Contact Email', w.email, 'email', w.isZohoMaster, true, 'email')}
                      {renderCopyableField('Phone Number', w.phone, 'phone', true)}
                      {renderCopyableField('Tax ID / VAT', w.taxId, 'taxId', w.isZohoMaster, true)}
                      {renderCopyableField('Currency', w.currency || 'USD', 'currency', true)}
                      {renderCopyableField('Payment Terms', w.paymentTerms || 'Due on Shipment', 'paymentTerms', true)}
                    </div>
                  </div>

                  {/* Geography Card */}
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={14} color="#10b981" /> Territory & Geography
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      {renderCopyableField('Primary Country', w.country || 'Global / Unassigned', 'country', true)}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Zones</label>
                        {w.zones && w.zones.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {w.zones.map(z => (
                              <span key={z} style={{
                                padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                                fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb',
                                border: '1px solid #bfdbfe'
                              }}>
                                {z}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No active zones configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Card */}
                  {w.isZohoMaster && (w.cf_bank_name || w.cf_account_number || w.cf_iban || w.cf_swift_bic) && (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Landmark size={14} color="#8b5cf6" /> Bank & Billing Details
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.25rem' }}>
                        {w.cf_bank_name && renderCopyableField('Bank Name', w.cf_bank_name, 'cf_bank_name', true)}
                        {w.cf_account_holder && renderCopyableField('Account Holder', w.cf_account_holder, 'cf_account_holder', true)}
                        {w.cf_account_number && renderCopyableField('Account Number', w.cf_account_number, 'cf_account_number', true)}
                        {w.cf_iban && renderCopyableField('IBAN', w.cf_iban, 'cf_iban', true)}
                        {w.cf_swift_bic && renderCopyableField('SWIFT / BIC', w.cf_swift_bic, 'cf_swift_bic', true)}
                      </div>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'pos',
              label: 'Purchase Orders',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Linked Purchase Orders</h3>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>{pos.length} total</span>
                  </div>
                  
                  {poLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={20} className="sync-spin" style={{ animation: 'syncSpin 1s linear infinite', color: '#94a3b8' }} /></div>
                  ) : pos.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>No Purchase Orders found</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>PO Number</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Date</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pos.map(po => {
                            const date = po.createdAt?.toDate ? po.createdAt.toDate() : new Date(po.createdAt || 0);
                            return (
                              <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b' }}>{po.poNumber}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{date.toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem 1rem' }}><ERPStatusBadge status={po.status} size="sm" /></td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{fmtCurrency(po.totalAmount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'bills',
              label: 'Bills',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Supplier Bills</h3>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>{bills.length} total</span>
                  </div>
                  
                  {billLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={20} className="sync-spin" style={{ animation: 'syncSpin 1s linear infinite', color: '#94a3b8' }} /></div>
                  ) : bills.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>No bills registered for this supplier</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Bill ID</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Due Date</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map(bill => {
                            const dueDate = bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate || 0);
                            return (
                              <tr key={bill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b' }}>{bill.billNumber || bill.id.slice(0, 8)}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{dueDate.toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem 1rem' }}><ERPStatusBadge status={bill.status} size="sm" /></td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{fmtCurrency(bill.totalAmount || bill.amount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'history',
              label: 'Sync History',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>Synchronization Timeline</h3>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #ecfdf5' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                        {w.isZohoMaster ? 'Zoho Books Imported' : 'Local Wholeseller Created'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {w.createdAt ? new Date(w.createdAt).toLocaleString() : 'System Default Timestamp'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #e2e8f0' }}>
                        {w.isZohoMaster 
                          ? \`Synchronized with Zoho Books organization: \${w.orgSource || 'Spain/UAE Catalog'}. Local updates restricted.\`
                          : 'Created locally inside Atlas Health database. Local editing enabled.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
`);

// Now remove the old conditional blocks that were replaced
const contentBlocksRegex = /\{\/\* TAB 1: OVERVIEW \*\/\}[\s\S]+?\{\/\* Detail Footer \*\/\}/;
content = content.replace(contentBlocksRegex, '{/* Detail Footer */}');

fs.writeFileSync(file, content);
console.log('patched');
