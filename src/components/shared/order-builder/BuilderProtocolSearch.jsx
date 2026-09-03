import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { Search, Plus, Loader, Stethoscope, Clock, Tag, AlertTriangle, ShieldAlert, Sparkles, User, SlidersHorizontal, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getProtocolById } from '../../../services/protocolStorage';
import { generatePrescriptionLines } from '../../../engine/protocolMath';
import toast from 'react-hot-toast';


export default function BuilderProtocolSearch({ onSelectProtocol }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSex, setSelectedSex] = useState('all'); // all, male_only, female_only
  const [selectedAge, setSelectedAge] = useState('all'); // all, 18+, 30+
  const [selectedPeptides, setSelectedPeptides] = useState([]); // Array of selected peptides to filter
  const [selectedGoals, setSelectedGoals] = useState([]); // Array of selected goals to filter
  const [peptideSearchText, setPeptideSearchText] = useState('');
  const [peptidesDropdownOpen, setPeptidesDropdownOpen] = useState(false);
  const [goalSearchText, setGoalSearchText] = useState('');
  const [goalsDropdownOpen, setGoalsDropdownOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // Reset all search terms & filters on mount so previous searches do not persist
  useEffect(() => {
    setTerm('');
    setSelectedCategory('All');
    setSelectedSex('all');
    setSelectedAge('all');
    setSelectedPeptides([]);
    setSelectedGoals([]);
    setPeptideSearchText('');
    setGoalSearchText('');
  }, []);

  // Compute search parameters based on selected category
  const searchParams = React.useMemo(() => {
    const params = {};
    if (selectedCategory && selectedCategory !== 'All') {
      params.facetFilters = [`category:${selectedCategory}`];
    }
    return params;
  }, [selectedCategory]);

  const searchQuery = term || (selectedCategory && selectedCategory !== 'All' ? '' : 'Weight');
  const { hits, loading } = useAlgoliaSearch('protocols', searchQuery, searchParams);

  // Filter and sort hits client-side
  const filteredAndSortedHits = React.useMemo(() => {
    let result = [...hits];

    // Filter by sex
    if (selectedSex !== 'all') {
      result = result.filter(h => h.sex_restriction === selectedSex);
    }

    // Filter by age
    if (selectedAge === '18+') {
      result = result.filter(h => h.min_age === 18 || !h.min_age);
    } else if (selectedAge === '30+') {
      result = result.filter(h => h.min_age >= 30);
    }

    // Filter by ALL selected peptides (AND match)
    if (selectedPeptides.length > 0) {
      result = result.filter(h => {
        const peps = Array.isArray(h.peptides) ? h.peptides.map(p => p.toLowerCase()) : [];
        return selectedPeptides.every(selectedPep =>
          peps.some(p => p.includes(selectedPep.toLowerCase()))
        );
      });
    }

    // Filter by selected goals (OR/AND match — let's match if it contains any of the selected goals)
    if (selectedGoals.length > 0) {
      result = result.filter(h => {
        // Algolia goals is comma-separated string, or array from firestore
        const protocolGoals = Array.isArray(h.goals)
          ? h.goals.map(g => g.toLowerCase())
          : typeof h.goals === 'string'
            ? h.goals.split(',').map(g => g.trim().toLowerCase())
            : [];

        return selectedGoals.every(selectedGoal =>
          protocolGoals.some(g => g.includes(selectedGoal.toLowerCase()))
        );
      });
    }

    // Sort hits
    return result.sort((a, b) => {
      const aActive = (a.status || '').toLowerCase() === 'active' ? 1 : 0;
      const bActive = (b.status || '').toLowerCase() === 'active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const aHasPep = (Array.isArray(a.peptides) && a.peptides.length > 0) || (a.bom && a.bom.length > 0) ? 1 : 0;
      const bHasPep = (Array.isArray(b.peptides) && b.peptides.length > 0) || (b.bom && b.bom.length > 0) ? 1 : 0;
      if (aHasPep !== bHasPep) return bHasPep - aHasPep;

      const aName = a.name || a.title || '';
      const bName = b.name || b.title || '';
      return aName.localeCompare(bName);
    });
  }, [hits, selectedSex, selectedAge, selectedPeptides, selectedGoals]);

  const handleSelect = async (hit) => {
    const id = hit.objectID || hit.id;
    setLoadingId(id);
    try {
      const fullProtocol = await getProtocolById(id);
      const protocol = fullProtocol || hit;

      let prescriptionLines = [];
      try {
        prescriptionLines = generatePrescriptionLines(protocol);
      } catch (e) {
        console.warn('Could not generate prescription lines from protocol:', e);
        let rawItems = [];
        if (protocol.bom && protocol.bom.length > 0) {
          rawItems = protocol.bom;
        } else {
          const firstPhase = protocol.phases?.[0];
          rawItems = firstPhase?.items || firstPhase?.medications || firstPhase?.drugs_used || protocol.peptides || [];
        }
        
        prescriptionLines = rawItems.map((item, idx) => {
          if (typeof item === 'string') {
            console.error("BuilderProtocolSearch: String peptide found, missing productId.", item);
            throw new Error(`Legacy protocol item format unsupported: ${item}`);
          }
          
          if (!item.productId) {
            console.error("BuilderProtocolSearch: Missing productId in protocol item", item);
            throw new Error(`Protocol item is missing productId: ${item.name || item.productName || 'Unknown'}`);
          }

          return {
            id: item.id || item.productId || crypto.randomUUID(),
            productId: item.productId,
            variantId: item.variantId || null,
            sku: item.sku || '',
            product_name: item.productName || item.name || 'Unknown',
            dosage: item.dosage || '',
            frequency: item.frequency || '',
            route: item.route || 'SC',
            duration: item.duration || '',
            quantity: item.quantity || 1,
          };
        });
      }

      onSelectProtocol({
        protocolId: id,
        protocolName: protocol.name || protocol.name || hit.name,
        doctorId: protocol.created_by?.user_id || protocol.doctorId || null,
        doctorName: protocol.created_by?.user_name || protocol.doctorName || null,
        therapeuticCategory: protocol.therapeutic_category || hit.therapeutic_category,
        prescriptionLines,
        rawProtocol: protocol,
      });

      toast.success(`Protocol "${protocol.name || protocol.name}" loaded — ${prescriptionLines.length} line(s) calculated.`);
    } catch (err) {
      console.error('Error loading protocol:', err);
      toast.error('Could not load the full protocol. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const categories = ['All', 'Weight Management', 'Metabolism', 'Regenerative', 'Sleep', 'Immune Support', 'Longevity'];

  // Dynamic list of all peptides in the clinical knowledge base
  const availablePeptides = [
    'BPC-157', 'TB-500', 'Semaglutide', 'Tirzepatide', 'MOTS-c', 'NAD+', 'DSIP', 'Epitalon',
    '5-Amino-1MQ', 'Thymosin Alpha-1', 'Melanotan', 'PT-141', 'Sermorelin', 'Ipamorelin', 'CJC-1295'
  ];

  // Dynamic list of popular goals in our index
  const availableGoals = [
    'Weight Loss', 'Recovery', 'Healthy Aging', 'Performance', 'Sleep Optimization',
    'Immune Support', 'Longevity', 'Muscle Growth', 'Cognitive', 'Libido'
  ];

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Stethoscope size={18} style={{ color: 'var(--color-primary, #2563eb)' }} /> Select Base Protocol
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none',
            color: showAdvanced ? 'var(--color-primary, #2563eb)' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer'
          }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
        Doses and vial quantities will be automatically calculated based on the selected protocol.
      </p>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setTerm('');
              }}
              style={{
                fontSize: '0.72rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '9999px',
                border: isSelected ? '1px solid var(--color-primary, #2563eb)' : '1px solid var(--border)',
                background: isSelected ? 'var(--color-primary, #2563eb)' : 'var(--surface)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Sex Restriction</label>
              <select
                value={selectedSex}
                onChange={e => setSelectedSex(e.target.value)}
                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
              >
                <option value="all">Any Sex</option>
                <option value="male_only">Male Only</option>
                <option value="female_only">Female Only</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Age Group</label>
              <select
                value={selectedAge}
                onChange={e => setSelectedAge(e.target.value)}
                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
              >
                <option value="all">Any Age</option>
                <option value="18+">General (18+)</option>
                <option value="30+">Mature (30+)</option>
              </select>
            </div>
          </div>

          {/* Peptides Multi-Select Searchable Input */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
              Filter by Peptides (Type to search & add)
            </label>
            <input
              type="text"
              placeholder="Type peptide name (e.g. BPC-157)..."
              value={peptideSearchText}
              onChange={e => {
                setPeptideSearchText(e.target.value);
                setPeptidesDropdownOpen(true);
              }}
              onFocus={() => setPeptidesDropdownOpen(true)}
              onBlur={() => {
                // Short delay to allow clicking options before closing
                setTimeout(() => setPeptidesDropdownOpen(false), 200);
              }}
              style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', boxSizing: 'border-box' }}
            />
            {peptidesDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff',
                border: '1px solid var(--border)', borderRadius: '6px', zIndex: 10,
                maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '2px'
              }}>
                {availablePeptides
                  .filter(pep => pep.toLowerCase().includes(peptideSearchText.toLowerCase()) && !selectedPeptides.includes(pep))
                  .map(pep => (
                    <div
                      key={pep}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents blur event
                        setSelectedPeptides([...selectedPeptides, pep]);
                        setPeptideSearchText('');
                        setPeptidesDropdownOpen(false);
                      }}
                      style={{ padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', background: '#ffffff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {pep}
                    </div>
                  ))}
              </div>
            )}
            {selectedPeptides.length > 0 && (
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {selectedPeptides.map(pep => (
                  <span
                    key={pep}
                    onClick={() => setSelectedPeptides(selectedPeptides.filter(p => p !== pep))}
                    style={{
                      fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                      padding: '0.15rem 0.45rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500
                    }}
                  >
                    {pep} <span style={{ fontWeight: 'bold' }}>&times;</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Goals Multi-Select Searchable Input */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
              Filter by Goals (Type to search & add)
            </label>
            <input
              type="text"
              placeholder="Type goal name (e.g. Weight Loss)..."
              value={goalSearchText}
              onChange={e => {
                setGoalSearchText(e.target.value);
                setGoalsDropdownOpen(true);
              }}
              onFocus={() => setGoalsDropdownOpen(true)}
              onBlur={() => {
                setTimeout(() => setGoalsDropdownOpen(false), 200);
              }}
              style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', boxSizing: 'border-box' }}
            />
            {goalsDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff',
                border: '1px solid var(--border)', borderRadius: '6px', zIndex: 10,
                maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '2px'
              }}>
                {availableGoals
                  .filter(goal => goal.toLowerCase().includes(goalSearchText.toLowerCase()) && !selectedGoals.includes(goal))
                  .map(goal => (
                    <div
                      key={goal}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedGoals([...selectedGoals, goal]);
                        setGoalSearchText('');
                        setGoalsDropdownOpen(false);
                      }}
                      style={{ padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', background: '#ffffff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {goal}
                    </div>
                  ))}
              </div>
            )}
            {selectedGoals.length > 0 && (
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {selectedGoals.map(goal => (
                  <span
                    key={goal}
                    onClick={() => setSelectedGoals(selectedGoals.filter(g => g !== goal))}
                    style={{
                      fontSize: '0.68rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      padding: '0.15rem 0.45rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500
                    }}
                  >
                    {goal} <span style={{ fontWeight: 'bold' }}>&times;</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          value={term}
          onChange={e => {
            setTerm(e.target.value);
            if (selectedCategory !== 'All') {
              setSelectedCategory('All');
            }
          }}
          placeholder="Search by name, goals, category, tags..."
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
          autoFocus
        />
      </div>

      {/* Hits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Searching...
          </div>
        )}
        {!loading && filteredAndSortedHits.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            No protocols match your search filters. Try clearing some selections.
          </div>
        )}
        {!loading && filteredAndSortedHits.map(hit => {
          const isLoading = loadingId === (hit.objectID || hit.id);
          const isExpanded = expandedId === (hit.objectID || hit.id);
          const title = hit.name || hit.name || '—';
          const category = hit.therapeutic_category || hit.category || null;
          const phaseCount = hit.phaseCount || hit.phases?.length || 0;
          const description = hit.description || null;
          const tags = Array.isArray(hit.tags) ? hit.tags.slice(0, 3) : [];
          const peptides = Array.isArray(hit.peptides) ? hit.peptides : [];

          return (
            <div
              key={hit.objectID || hit.id}
              style={{
                display: 'flex', flexDirection: 'column',
                padding: '0.75rem 0.9rem', border: '1px solid var(--border)', borderRadius: '10px',
                background: 'var(--surface)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                gap: '0.35rem'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(37,99,235,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const targetId = hit.objectID || hit.id || hit.protocol_id || hit.protocolId || hit.slug;
                      if (!targetId) {
                        toast.error("Protocol ID unavailable.");
                        return;
                      }
                      router.push(`/admin/protocols/${targetId}`);
                    }}
                    style={{
                      fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.25',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                    }}
                    title="Click to view full protocol page"
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary, #2563eb)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-main)'}
                  >
                    {title}
                    <ExternalLink size={12} style={{ color: 'var(--text-tertiary)' }} />
                  </div>

                  {/* Compact Meta & Peptides Row */}
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {category && (
                      <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Tag size={9} /> {category}
                      </span>
                    )}
                    <span style={{ fontSize: '0.68rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={10} style={{ color: 'var(--color-primary, #2563eb)' }} /> {phaseCount > 0 ? `${phaseCount} phase${phaseCount !== 1 ? 's' : ''}` : '1 phase'}
                    </span>

                    {/* Compact Inline Peptides Pills */}
                    {peptides.length > 0 && (
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.2rem', alignItems: 'center', marginLeft: '0.1rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                          <Sparkles size={10} style={{ color: '#eab308' }} />
                        </span>
                        {peptides.map(pep => (
                          <span key={pep} style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.08rem 0.35rem', borderRadius: '4px', fontWeight: 500 }}>
                            {pep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const targetId = hit.objectID || hit.id || hit.protocol_id || hit.protocolId || hit.slug;
                      if (!targetId) {
                        toast.error("Protocol ID unavailable.");
                        return;
                      }
                      router.push(`/admin/protocols/${targetId}`);
                    }}
                    style={{
                      background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.35rem 0.5rem', borderRadius: '6px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500
                    }}
                    title="View full protocol detail page"
                  >
                    <ExternalLink size={13} /> Details
                  </button>
                  <button
                    onClick={() => handleSelect(hit)}
                    disabled={isLoading}
                    className="gcp-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  >
                    {isLoading ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
                    {isLoading ? 'Loading...' : 'Select'}
                  </button>
                </div>
              </div>

              {/* Expanded details panel */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      <strong>Description:</strong> {description}
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tags:</strong>
                      {tags.map(t => (
                        <span key={t} style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '0.05rem 0.3rem', borderRadius: '3px' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
