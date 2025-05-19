// src/components/Home.jsx

import React, { useEffect, useState } from 'react'
import { checkAuth } from '../checkauth'
import { SEARCH_TYPES } from '../constants'
import { publicApi } from '../api';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchType, setSearchType] = useState('apartments');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // check auth once
  useEffect(() => {
    checkAuth().then(setIsLoggedIn)
  }, [])

  // run search when term or type changes
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      const { endpoint } = SEARCH_TYPES[searchType];
      publicApi.get(`${endpoint}?search=${encodeURIComponent(query)}`)
         .then(res => {
           // DRF paginated vs non-paginated:
           const data = res.data.results ?? res.data;
           setResults(data);
         })
         .catch(err => setError(err.toString()))
         .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchType]);
  
  return (
    <div>
      <h1>RateMyApartments</h1>
      <p>{isLoggedIn ? "You are logged in." : "You are not logged in."}</p>
      <nav>
        <a href="/login">Login</a> | <a href="/register">Register</a>
      </nav>

      {/* Toggle Buttons */}
      <div style={{ margin: '1rem 0' }}>
        {Object.entries(SEARCH_TYPES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => { setSearchType(key); setQuery(''); }}
            style={{
              fontWeight: searchType === key ? 'bold' : 'normal',
              marginRight: '0.5rem'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder={`Search ${SEARCH_TYPES[searchType].label}…`}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {/* Status */}
      {loading && <p>Loading…</p>}
      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {query.length > 0 && query.length < 3 && (
        <p>Type at least 3 characters to search.</p>
      )}

      {/* Results */}
      <ul>
        {results.map(item => (
          <li key={item.id}>
            {searchType === 'apartments' ? (
              <>
                {item.name} — {item.addressline1} (<a href={`/apartments/${item.id}`}>View</a>)
              </>
            ) : (
              <>
                {item.name} (<a href={`/campuses/${item.id}`}>View</a>)
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home
