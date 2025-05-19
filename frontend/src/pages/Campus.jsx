// src/components/CampusPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function CampusPage() {
  const { id } = useParams();
  const [campus, setCampus]         = useState(null);
  const [apartments, setApartments] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters]       = useState({
    cost:       [1, 5],
    safety:     [1, 5],
    management: [1, 5],
    noise:      [1, 5],
  });

  // 1️⃣ Fetch campus metadata
  useEffect(() => {
    api.get(`/campuses/${id}/`)
       .then(res => setCampus(res.data))
       .catch(console.error);
  }, [id]);

  // 2️⃣ Fetch all apartments once
  useEffect(() => {
    api.get(`/apartments/?campus=${id}`)
       .then(res => {
         const data = res.data.results ?? res.data;
         setApartments(data);
         setFiltered(data);
       })
       .catch(console.error);
  }, [id]);

  // 3️⃣ Re-filter on apartments, searchTerm, or filters change


  //testing git to see howthis works

  if (!campus) return <p>Loading campus…</p>;

  return (

    // Im editing some page functionality here
    <div>
      
      <h1>{campus.name}</h1>
      <p>
        Apartments: {campus.apt_count} | 
        Avg Cost: {campus.avg_cost?.toFixed(1)} |
        Avg Safety: {campus.avg_safety?.toFixed(1)} |
        Avg Management: {campus.avg_management?.toFixed(1)} |
        Avg Noise: {campus.avg_noise?.toFixed(1)}
      </p>

      <ul>
        {apartments.map(apt => (
          <li key={apt.id} style={{ margin: '0.5rem 0' }}>
            <strong>{apt.name}</strong> — {apt.addressline1}<br/>
            {apt.avg_cost != null
              ? `Avg Cost: ${apt.avg_cost.toFixed(1)}, Safety: ${apt.avg_safety.toFixed(1)}, Management: ${apt.avg_management.toFixed(1)}, Noise: ${apt.avg_noise.toFixed(1)}`
              : <em>No reviews yet</em>
            }<br/>
            <a>View details</a>
          </li>
        ))}
        {apartments.length === 0 && <p>No apartments found for this campus.</p>}
      </ul>
    </div>
  );
}

export default CampusPage;
