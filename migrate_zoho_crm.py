import re

def migrate_file():
    path = '/Users/joseluiszabala/regenpept-web.nosync/src/components/admin/gadgets/AdminZohoCRMWidget.jsx'
    with open(path, 'r') as f:
        content = f.read()

    # Find the first table section
    start_str_1 = '              {filteredCustomers.length === 0 ? ('
    end_str_1 = '                  </table>\n                </div>\n              )}'

    start_idx_1 = content.find(start_str_1)
    if start_idx_1 != -1:
        end_idx_1 = content.find(end_str_1, start_idx_1)
        if end_idx_1 != -1:
            end_idx_1 += len(end_str_1)

            new_table_1 = """              <DataTable
                data={filteredCustomers}
                keyField="contact_id"
                emptyTitle="No data loaded"
                emptyDescription={filter || typeFilter !== 'all' ? 'No clients found matching the filter.' : 'No data loaded. Force sync to retrieve.'}
                columns={[
                  { key: 'rank', label: 'Rank', style: { width: '40px', fontWeight: 600, color: '#5f6368' }, render: (c, idx) => `#${idx + 1}` },
                  { key: 'client', label: 'Client Name', render: (c) => (<div><div style={{ fontWeight: 600, color: '#202124' }}>{c.name}</div>{c.company && <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{c.company}</div>}</div>) },
                  { key: 'contact', label: 'Email / Phone', render: (c) => (<div>{c.email && (<div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.1rem' }}><Mail size={11} color="#5f6368" /><a href={`mailto:${c.email}`} style={{ color: '#1a73e8', textDecoration: 'none' }}>{c.email}</a></div>)}{c.phone && (<div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={11} color="#5f6368" /><span style={{ color: '#202124' }}>{c.phone}</span></div>)}</div>) },
                  { key: 'type', label: 'Type', render: (c) => { const isCorp = c.type === 'corporate'; return (<span style={{ display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: isCorp ? '#e8f0fe' : '#e6f4ea', color: isCorp ? '#1a73e8' : '#137333' }}>{c.type}</span>); } },
                  { key: 'revenue', label: 'Revenue', style: { textAlign: 'right', fontWeight: 600, color: '#202124' }, render: (c) => fmtAED_USD(c.total_revenue) },
                  { key: 'balance', label: 'Outstanding Balance', style: { textAlign: 'right', fontWeight: 600 }, render: (c) => { const hasBalance = c.outstanding_balance > 0; return <span style={{ color: hasBalance ? '#d93025' : '#5f6368' }}>{hasBalance ? fmtAED(c.outstanding_balance) : '—'}</span>; } },
                  { key: 'actions', label: 'Actions', style: { textAlign: 'center' }, render: (c) => (<a href={`https://erp.mediluxeme.com/app/662274409#/contacts/${c.contact_id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem', border: '1px solid #dadce0', backgroundColor: 'var(--color-bg-surface)', borderRadius: '4px', color: '#5f6368', textDecoration: 'none' }} title="Open in Zoho Books"><ExternalLink size={12} /></a>) }
                ]}
                expandableRender={(c) => (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start', padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e8eaed' }}>
                        <ShoppingBag size={14} color="#1a73e8" />
                        <span style={{ fontWeight: 600, color: '#202124', fontSize: '0.75rem' }}>Products Bought</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: '#5f6368', backgroundColor: '#f1f3f4', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>{c.products_bought?.length || 0}</span>
                      </div>
                      {c.products_bought?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {c.products_bought.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e8eaed', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.7rem', color: '#202124', fontWeight: 500 }}>{p.name}</div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', color: '#5f6368' }}>{p.quantity} {p.quantity === 1 ? 'unit' : 'units'}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#137333' }}>{fmtAED(p.total_spent)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={{ fontSize: '0.7rem', color: '#5f6368', fontStyle: 'italic' }}>No product history found.</div>)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e8eaed' }}>
                        <Activity size={14} color="#1a73e8" />
                        <span style={{ fontWeight: 600, color: '#202124', fontSize: '0.75rem' }}>Invoices</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: '#5f6368', backgroundColor: '#f1f3f4', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>{c.invoices?.length || 0}</span>
                      </div>
                      {c.invoices?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {c.invoices.map((inv, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 70px', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e8eaed', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.65rem', color: '#5f6368', fontFamily: 'monospace' }}>{inv.date}</div>
                              <div style={{ fontSize: '0.7rem', color: '#1a73e8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <a href={`https://erp.mediluxeme.com/app/662274409#/invoices/${inv.invoice_id}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{inv.number} <ExternalLink size={8} /></a>
                              </div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#202124', textAlign: 'right' }}>{fmtAED(inv.total)}</div>
                              <div style={{ textAlign: 'right' }}><span style={{ display: 'inline-block', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: inv.status === 'paid' ? '#e6f4ea' : inv.status === 'overdue' ? '#fce8e6' : '#fef7e0', color: inv.status === 'paid' ? '#137333' : inv.status === 'overdue' ? '#d93025' : '#b06000' }}>{inv.status}</span></div>
                            </div>
                          ))}
                        </div>
                      ) : (<div style={{ fontSize: '0.7rem', color: '#5f6368', fontStyle: 'italic' }}>No invoices found.</div>)}
                    </div>
                  </div>
                )}
              />"""

            content = content[:start_idx_1] + new_table_1 + content[end_idx_1:]

    # Import DataTable if not present
    if "import DataTable" not in content:
        content = content.replace("import React,", "import React, { useState, useEffect, useMemo, useCallback } from 'react';\nimport DataTable from '../ui/DataTable';\n//")

    with open(path, 'w') as f:
        f.write(content)
        
    print("Migration complete!")

if __name__ == '__main__':
    migrate_file()
