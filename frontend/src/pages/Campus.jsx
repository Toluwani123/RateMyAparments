// src/components/CampusPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../api';

// Constants for view toggle
const VIEW_TYPES = [
  { key: 'both',      label: 'All Housing' },
  { key: 'apartment', label: 'Off-Campus Apartments' },
  { key: 'hall',      label: 'On-Campus Halls' },
];
const DEFAULT_FILTERS = {
  cost:       [1, 5],
  safety:     [1, 5],
  management: [1, 5],
  noise:      [1, 5],
};

// Modal for selecting rating ranges
function FilterModal({ filters, onApply, onClose }) {
  const [local, setLocal] = useState(filters);

  const updateLocal = (key, idx, value) => {
    const range = [...local[key]];
    range[idx] = Number(value);
    setLocal({ ...local, [key]: range });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Filter by Ratings</h2>
        {Object.keys(local).map(key => (
          <div key={key} style={{ marginBottom: '0.5rem' }}>
            <label style={{ textTransform: 'capitalize' }}>{key}</label><br/>
            <input
              type="number" min="1" max="5"
              value={local[key][0]}
              onChange={e => updateLocal(key, 0, e.target.value)}
              style={styles.rangeInput}
            />
            <span> to </span>
            <input
              type="number" min="1" max="5"
              value={local[key][1]}
              onChange={e => updateLocal(key, 1, e.target.value)}
              style={styles.rangeInput}
            />
          </div>
        ))}
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => { onApply(local); onClose(); }} style={styles.button}>
            Apply
          </button>
          <button onClick={onClose} style={styles.button}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampusPage() {
  const { id } = useParams();
  const [campus,      setCampus]      = useState(null);
  const [housingList, setHousingList] = useState([]);
  const [viewType,    setViewType]    = useState('both');
  const [filters,     setFilters]     = useState(DEFAULT_FILTERS );
  const [isFilterOpen, setFilterOpen] = useState(false);

  // 1️⃣ Fetch campus metadata
  useEffect(() => {
    publicApi.get(`/campuses/${id}/`)
      .then(res => setCampus(res.data))
      .catch(console.error);
  }, [id]);

  // 2️⃣ Fetch all housing once
  useEffect(() => {
    publicApi.get(`/housing/?campus=${id}`)
      .then(res => {
        const data = res.data.results ?? res.data;
        setHousingList(data);
      })
      .catch(console.error);
  }, [id]);

  // 3️⃣ Filtered & typed list
  
  const displayed = useMemo(() => {
    // ❶ Detect default vs. custom filters
    const isDefault = Object.keys(filters).every(key => {
      return filters[key][0] === DEFAULT_FILTERS[key][0]
          && filters[key][1] === DEFAULT_FILTERS[key][1];
    });

    // ❷ Start from your full (typified) list
    let list = housingList;
    if (viewType !== 'both') {
      list = list.filter(h => h.type === viewType);
    }

    return list.filter(h => {
      // ❸ Unrated always shown when filters are default
      if (!h.review_count) {
        return isDefault;
      }

      // ❹ When any filter is custom, unrated are dropped and rated must fit
      return (
        h.avg_cost       >= filters.cost[0]       &&
        h.avg_cost       <= filters.cost[1]       &&
        h.avg_safety     >= filters.safety[0]     &&
        h.avg_safety     <= filters.safety[1]     &&
        h.avg_management >= filters.management[0] &&
        h.avg_management <= filters.management[1] &&
        h.avg_noise      >= filters.noise[0]      &&
        h.avg_noise      <= filters.noise[1]
      );
    });
  }, [housingList, viewType, filters]);
  // 4️⃣ Campus-level averages of displayed
  const campusMetrics = useMemo(() => {
    const stats = { cost:0, safety:0, management:0, noise:0, total:0 };
    displayed.forEach(h => {
      stats.total += h.review_count;
      stats.cost       += h.avg_cost       * h.review_count;
      stats.safety     += h.avg_safety     * h.review_count;
      stats.management += h.avg_management * h.review_count;
      stats.noise      += h.avg_noise      * h.review_count;
    });
    if (stats.total === 0) return {};
    return {
      avg_cost:       stats.cost       / stats.total,
      avg_safety:     stats.safety     / stats.total,
      avg_management: stats.management / stats.total,
      avg_noise:      stats.noise      / stats.total,
      review_count:   stats.total,
    };
  }, [displayed]);

  if (!campus) return <p>Loading campus…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{campus.name}</h1>

      {/* View Type Toggle */}
      <div>
        {VIEW_TYPES.map(v => (
          <button
            key={v.key}
            onClick={() => setViewType(v.key)}
            style={viewType === v.key ? styles.activeTab : styles.tab}
          >
            {v.label}
          </button>
        ))}
        <button onClick={() => setFilterOpen(true)} style={{ marginLeft: '1rem' }}>
          Filters
        </button>
        <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ marginLeft: '0.5rem' }}>
          Reset Filters
        </button>
      </div>

      {/* Campus-level Metrics */}
      <p style={{ marginTop: '1rem' }}>
        <strong>{VIEW_TYPES.find(v => v.key === viewType).label}:</strong> {displayed.length}<br/>
        {campusMetrics.review_count
          ? <>Avg Cost: {campusMetrics.avg_cost?.toFixed(1)} | 
              Avg Safety: {campusMetrics.avg_safety?.toFixed(1)} | 
              Avg Mgmt: {campusMetrics.avg_management?.toFixed(1)} | 
              Avg Noise: {campusMetrics.avg_noise?.toFixed(1)} | 
              Reviews: {campusMetrics.review_count}
            </>
          : <em>No reviews in this category</em>
        }
      </p>

      {/* Housing List */}
      <ul>
        {displayed.map(h => (
          <li key={h.id} style={{ margin: '0.75rem 0' }}>
            <strong>{h.name}</strong> &nbsp;
            <em>({h.type === 'hall' ? 'On-Campus Hall' : 'Off-Campus Apt'})</em><br/>
            {h.review_count > 0
              ? `Avg Cost: ${h.avg_cost.toFixed(1)}, Safety: ${h.avg_safety.toFixed(1)}, Mgmt: ${h.avg_management.toFixed(1)}, Noise: ${h.avg_noise.toFixed(1)}`
              : <em>No reviews yet</em>
            }<br/>
            <Link to={`/housing/${h.id}`}>View details</Link>
          </li>
        ))}
        {displayed.length === 0 && <p>No options found.</p>}
      </ul>

      {/* Filter Modal */}
      {isFilterOpen && (
        <FilterModal
          filters={filters}
          onApply={newFilters => setFilters(newFilters)}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}

// Simple inline styles for demo
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', minWidth: '300px',
  },
  rangeInput: { width: '3rem', margin: '0 0.5rem' },
  tab: { marginRight: '0.5rem' },
  activeTab: { marginRight: '0.5rem', fontWeight: 'bold' },
  button: { margin: '0.5rem' },
};
