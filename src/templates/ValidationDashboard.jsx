import Activity from "lucide-react/dist/esm/icons/activity";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import FileText from "lucide-react/dist/esm/icons/file-text";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Search from "lucide-react/dist/esm/icons/search";
import Clock from "lucide-react/dist/esm/icons/clock";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';











import { runValidationSuite } from '../validation/engine/runner';

export default function ValidationDashboard({ products }) {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, lastId: '' });
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState('all'); // all, passed, failed
  const [searchTerm, setSearchTerm] = useState('');

  const handleRunTests = async () => {
    if (!products || products.length === 0) {
      alert("No products loaded. Cannot run validation.");
      return;
    }

    setIsRunning(true);
    setResults(null);
    try {
      const suiteResults = await runValidationSuite(products, (current, total, lastId) => {
        setProgress({ current, total, lastId });
      });
      setResults(suiteResults);
    } catch (err) {
      console.error("Suite Execution Error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = results?.caseResults.filter(res => {
    if (filter === 'passed' && res.isFailed) return false;
    if (filter === 'failed' && !res.isFailed) return false;
    if (searchTerm && !res.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()) && !res.patientCategory.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="template-root" style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text-main)' }}>
      <div className="pb-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} /> CLINICAL VALIDATION ENGINE
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Quality Assurance Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Automated clinical plausibility testing across 50 patient scenarios.</p>
          </div>
          <button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2rem', fontSize: '1rem' }}
          >
            {isRunning ? <RefreshCw className="spinner-icon" size={20} /> : <Activity size={20} />}
            {isRunning ? 'Executing Suite...' : 'Run Validation Suite'}
          </button>
        </header>

        {/* Progress Bar */}
        {isRunning && (
          <div style={{ marginBottom: '3rem', backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Running Tests...</span>
              <span style={{ color: 'var(--text-muted)' }}>{progress.current} / {progress.total} Case: {progress.lastId}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                backgroundColor: 'var(--primary)', 
                width: `${(progress.current / progress.total) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {results && !isRunning && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <StatCard label="Total Tests" value={results.totalTests} icon={<FileText size={20} />} />
            <StatCard label="Passed" value={results.passed} icon={<CheckCircle2 size={20} color="var(--color-success)" />} />
            <StatCard label="Failed" value={results.failed} icon={<XCircle size={20} color="var(--color-danger)" />} color={results.failed > 0 ? 'var(--color-danger)' : undefined} />
            <StatCard label="Avg. Score" value={`${results.averageSystemScore} / 5`} icon={<BarChart3 size={20} color="var(--primary)" />} />
          </div>
        )}

        {/* Results List */}
        {results && !isRunning && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '1.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All Cases" count={results.totalTests} />
                <FilterButton active={filter === 'passed'} onClick={() => setFilter('passed')} label="Passed" count={results.passed} />
                <FilterButton active={filter === 'failed'} onClick={() => setFilter('failed')} label="Failed" count={results.failed} />
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by ID or Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    padding: '0.8rem 1rem 0.8rem 3rem', 
                    borderRadius: '1rem', 
                    border: '1px solid var(--border)', 
                    backgroundColor: 'var(--background)',
                    width: '300px'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1.2rem 1.5rem' }}>TEST CASE ID</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>CATEGORY</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>AVG SCORE</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>DIMENSIONS</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>STATUS</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((res, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover-row">
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>{res.testCaseId}</td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem', backgroundColor: 'var(--background)', fontSize: '0.85rem' }}>
                          {res.patientCategory}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${(res.averageScore / 5) * 100}%`,
                              backgroundColor: res.averageScore >= 4 ? 'var(--color-success)' : res.averageScore >= 3 ? '#f59e0b' : 'var(--color-danger)'
                            }}></div>
                          </div>
                          <span style={{ fontWeight: 600 }}>{res.averageScore}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {Object.values(res.dimensions).map((val, i) => (
                            <div key={i} title={`D${i+1}: ${val}`} style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '2px', 
                              backgroundColor: val >= 4 ? 'var(--color-success)' : val >= 3 ? '#f59e0b' : 'var(--color-danger)',
                              opacity: 0.8
                            }}></div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        {res.isFailed ? (
                          <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            <AlertTriangle size={16} /> FAILED
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            <CheckCircle2 size={16} /> PASSED
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredResults.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No results found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {!results && !isRunning && (
          <div style={{ 
            marginTop: '4rem', 
            padding: '4rem', 
            textAlign: 'center', 
            backgroundColor: 'var(--surface)', 
            borderRadius: '2rem', 
            border: '2px dashed var(--border)' 
          }}>
            <ShieldCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
            <h3>Clinician Sandbox Ready</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '1rem auto' }}>
              The validation engine will automatically run 50 patient scenarios through the ClinicalAI engine to detect clinical contradictions, goal misalignment, and dosage errors.
            </p>
            <button onClick={handleRunTests} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Initialize Engine
            </button>
          </div>
        )}
      </div>

      <style>{`
        .hover-row:hover {
          background-color: rgba(255, 255, 255, 0.04);
        }
        .pb-wrapper {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ 
      backgroundColor: 'var(--surface)', 
      padding: '1.5rem', 
      borderRadius: '1.5rem', 
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--text-main)' }}>
        {value}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        padding: '0.6rem 1.2rem', 
        borderRadius: '0.8rem', 
        border: '1px solid',
        borderColor: active ? 'var(--primary)' : 'var(--border)',
        backgroundColor: active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
      <span style={{ 
        padding: '0.1rem 0.5rem', 
        borderRadius: '0.4rem', 
        backgroundColor: active ? 'var(--primary)' : 'var(--border)',
        color: active ? 'white' : 'var(--text-main)',
        fontSize: '0.75rem'
      }}>
        {count}
      </span>
    </button>
  );
}