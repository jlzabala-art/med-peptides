import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import User from "lucide-react/dist/esm/icons/user";
import Bot from "lucide-react/dist/esm/icons/bot";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';





import DataTable from '../ui/DataTable';
import AppFilterBar from '../ui/AppFilterBar';

export default function AdminClinicalLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  async function fetchLogs() {
    setLoading(true);
    try {
      const q = query(collection(db, 'clinical_logs'), orderBy('timestamp', 'desc'), limit(1000));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLang, agentFilter, statusFilter, startDate, endDate]);

  const sessions = Array.from(new Set(logs.map((l) => l.sessionId))).map((sid) => {
    const sessionLogs = logs.filter((l) => l.sessionId === sid);
    const sortedLogs = sessionLogs.sort(
      (a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)
    );

    const hasError = sortedLogs.some(
      (l) => l.error === true || !l.aiReply || /error|failed|timeout|unavailable/i.test(l.aiReply)
    );

    return {
      id: sid,
      lastMessage: sortedLogs[sortedLogs.length - 1],
      count: sortedLogs.length,
      language: sortedLogs[0].language,
      timestamp: sortedLogs[sortedLogs.length - 1].timestamp,
      logs: sortedLogs,
      hasError,
    };
  });

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.lastMessage?.userQuery
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLang = filterLang === 'all' || s.language === filterLang;

    const sessionAgent = s.logs[0]?.agentId || 'clinical_ai';
    const matchesAgent = agentFilter === 'all' || sessionAgent === agentFilter;

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'error' ? s.hasError : !s.hasError;

    let matchesDate = true;
    if (s.timestamp) {
      const d = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
      if (startDate && d < new Date(startDate)) {
        matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        if (d >= end) matchesDate = false;
      }
    }

    return matchesSearch && matchesLang && matchesAgent && matchesStatus && matchesDate;
  });

  const paginatedData = filteredSessions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns = [
    {
      key: 'session',
      header: 'Session Detail',
      sortValue: (s) => s.lastMessage?.userQuery || '',
      render: (s) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {s.lastMessage?.userQuery || 'Empty session'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ opacity: 0.5 }}>↳</span> ID: {s.id}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status & Info',
      width: '240px',
      sortValue: (s) => s.count,
      render: (s) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(59,130,246,0.1)',
                color: 'var(--primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {s.language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <MessageSquare
                size={12}
                style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
              />
              {s.count} msgs
            </span>
            {s.hasError && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  color: 'var(--danger)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                ⚠️ Error
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Bot size={12} />
            Agent: {s.logs[0]?.agentId || 'clinical_ai'}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '140px',
      sortValue: (s) => s.timestamp?.seconds || 0,
      render: (s) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>
          {formatDate(s.timestamp)} <br />
          <span style={{ color: 'var(--text-muted)' }}>{formatTime(s.timestamp)}</span>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '0.5rem' }}>
      <AppFilterBar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search user queries..."
        secondaryActions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                From:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                To:
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Agents</option>
              <option value="clinical_ai">clinical_ai</option>
              <option value="order_assistant">order_assistant</option>
              <option value="prescription_agent">prescription_agent</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Has Errors</option>
            </select>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Langs</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        keyField="id"
        loading={loading}
        emptyTitle="No conversations found"
        emptyDescription="Try adjusting your filters or search."
        // Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredSessions.length / rowsPerPage)}
        totalItems={filteredSessions.length}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        expandableRender={(session) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '1.5rem',
              borderLeft: '3px solid var(--primary)',
              paddingLeft: '1.25rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Conversation Thread
              </h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Source Agent:{' '}
                  <strong style={{ color: 'var(--text-main)' }}>
                    {session.logs[0]?.agentId || 'clinical_ai'}
                  </strong>
                </div>
                <div
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    color: 'var(--success)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ShieldCheck size={14} /> CLINICAL DATA ENCRYPTED
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '800px',
              }}
            >
              {session.logs.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* User Query */}
                  <div
                    style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end', maxWidth: '85%' }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          padding: '1rem',
                          borderRadius: '16px 16px 4px 16px',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {msg.userQuery}
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.35rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        USER • {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: 'var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <User size={18} color="var(--text-muted)" />
                    </div>
                  </div>

                  {/* AI Reply */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignSelf: 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <Bot size={18} color="white" />
                    </div>
                    <div>
                      <div
                        style={{
                          padding: '1rem',
                          borderRadius: '16px 16px 16px 4px',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          color: 'var(--text-main)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {msg.aiReply}

                        {(msg.matchedPeptides?.length > 0 || msg.matchedFaqs?.length > 0) && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px dashed var(--border)',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}
                          >
                            {msg.matchedPeptides?.map((p) => (
                              <span
                                key={p}
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(59,130,246,0.1)',
                                  color: 'var(--primary)',
                                  fontWeight: 700,
                                }}
                              >
                                🔬 {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.35rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        AI ASSISTANT • {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      />

      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminClinicalLogsTab | Props: none
      </div>
    </div>
  );
}