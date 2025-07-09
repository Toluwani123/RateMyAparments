import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../api';
import Footer from '../components/Footer';
import RadarChart from '../components/Radial';
import { IoCheckmarkDone } from "react-icons/io5";
import { LiaDollarSignSolid } from "react-icons/lia";
import { FaShieldHalved } from "react-icons/fa6";
import { MdManageAccounts } from "react-icons/md";
import { MdNoiseControlOff } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { FaWalking } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";

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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'housing';
  const [searchQuery,  setSearchQuery] = useState('');
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


  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<CiStar key={i} className="text-yellow-400" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex mr-1">{stars}</div>
        <span className="text-gray-700">{(rating ?? 0).toFixed(1)}</span>
      </div>
    );
  };

    
    

  if (!campus) return <p>Loading campus…</p>;

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center">
          <div className="flex items-center">
            <a 
              href='/'
              data-readdy="true"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Back to Campuses</span>
            </a>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{campus.name}</h1>
          <div className="flex items-center">
            <button className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <i className="fas fa-search text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative">
        <div className="h-64 md:h-80 overflow-hidden">
          <img 
            src={campus.background_image}
            alt="Campus Background" 
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-lg shadow-md p-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  <img 
                    src={campus.logo}
                    alt="Campus Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{campus.name}</h2>
                  {renderStars(campus.avg_cost)}
                </div>
              </div>
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Total Housing Options</p>
                  <p className="text-xl font-bold text-gray-800">{campus.housing_count}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Average Monthly Rent Apartments</p>
                  <p className="text-xl font-bold text-gray-800">${(campus.avg_lowest_rent_apartment ?? 0).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Average Monthly Rent Halls</p>
                  <p className="text-xl font-bold text-gray-800">${(campus.avg_lowest_rent_hall ?? 0).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Total Reviews</p>
                  <p className="text-xl font-bold text-gray-800">{campus.review_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-3 px-6 font-medium text-sm !rounded-button whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Campus Overview
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm !rounded-button whitespace-nowrap cursor-pointer ${
              activeTab === 'housing' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('housing')}
          >
            Housing Options
          </button>
        </div>

        {/* Rating Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Rating Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <div id="campus-ratings-chart" className="flex items-center justify-center mb-6">
                <RadarChart metrics={campusMetrics} />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Cost</h4>
                    <div className="flex items-center">
                      <LiaDollarSignSolid className="text-blue-500 mr-1" />
                      <span className="font-bold">{(campusMetrics.avg_cost ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(campusMetrics.avg_cost / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Safety</h4>
                    <div className="flex items-center">
                      <FaShieldHalved className="text-green-500 mr-1" />
                      <span className="font-bold">{(campusMetrics.avg_safety ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(campusMetrics.avg_safety / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Management</h4>
                    <div className="flex items-center">
                      <MdManageAccounts className="text-purple-500 mr-1" />
                      <span className="font-bold">{(campusMetrics.avg_management ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(campusMetrics.avg_management / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Noise</h4>
                    <div className="flex items-center">
                      <MdNoiseControlOff className="text-red-500 mr-1" />
                      <span className="font-bold">{(campusMetrics.avg_noise ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(campusMetrics.avg_noise / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">About {campus.name}</h3>
                <p className="text-gray-700 mb-4">
                  {campus.description}
                </p>
                <p className="text-gray-700 mb-4">
                  {campus.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-gray-500 text-sm">Founded</p>
                    <p className="font-medium">1989</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Location</p>
                    <p className="font-medium">Lubbock, TX</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Website</p>
                    <p className="font-medium text-blue-600">{campus.website}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Enrollment</p>
                    <p className="font-medium">100 students</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Housing Overview</h3>
                <p className="text-gray-700 mb-4">
                  UC Berkeley offers a diverse range of housing options to accommodate its large student population. On-campus residence halls provide a 
                  traditional college experience with easy access to classes and campus facilities. These buildings vary from historic halls with classic 
                  architecture to modern complexes with suite-style accommodations.
                </p>
                <p className="text-gray-700 mb-4">
                  For students seeking more independence, the surrounding Berkeley area offers numerous apartment complexes and shared houses. The Southside 
                  and Northside neighborhoods are particularly popular among students due to their proximity to campus. Housing costs vary significantly based 
                  on location, size, and amenities, with the average monthly rent around $2,100.
                </p>
                <button 
                  className="mt-2 text-blue-600 font-medium flex items-center cursor-pointer"
                  onClick={() => setActiveTab('housing')}
                >
                  View all housing options
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Housing</h3>
                <div className="space-y-4">
                  {displayed.slice(0, 3).map(housing => (
                    <div key={housing.id} className="flex cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="w-20 h-20 rounded-md overflow-hidden mr-3">
                        <img 
                          src={housing.thumbnail || housing.image} 
                          alt={housing.name} 
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{housing.name}</h4>
                        <p className="text-sm text-gray-500">{housing.type}</p>
                        <p className="text-sm font-medium text-blue-600">$200/month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Housing Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <IoCheckmarkDone size={24} className="text-green-500 mt-1 mr-2" />
                    <p className="text-gray-700">Start your housing search early, especially for fall semester</p>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkDone size={24} className="text-green-500 mt-1 mr-2" />
                    <p className="text-gray-700">Consider locations north of campus for quieter environments</p>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkDone size={24} className="text-green-500 mt-1 mr-2" />
                    <p className="text-gray-700">Check proximity to public transportation routes</p>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkDone size={24} className="text-green-500 mt-1 mr-2" />
                    <p className="text-gray-700">Visit properties in person before signing a lease</p>
                  </li>
                  <li className="flex items-start">
                    <IoCheckmarkDone size={24} className="text-green-500 mt-1 mr-2" />
                    <p className="text-gray-700">Read reviews from current and former residents</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'housing' && (
          <>
            {/* Housing Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Housing Options</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    className="block w-full md:w-64 p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search housing options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center">
                  {/* ─── View-type selector ─────────────────────────────── */}
                  <span className="text-gray-700 mr-2">View:</span>

                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    {VIEW_TYPES.map((v, i) => (
                      <button
                        key={v.key}
                        type="button"
                        className={`px-4 py-2 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer
                          ${viewType === v.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'}
                          ${
                            i === 0
                              ? 'rounded-l-lg border border-gray-200'
                              : i === VIEW_TYPES.length - 1
                              ? 'rounded-r-lg border border-gray-200'
                              : 'border-t border-b border-gray-200'
                          }`}
                        onClick={() => setViewType(v.key)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  {/* ─── Filter / Reset buttons ─────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    className="ml-4 px-4 py-2 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer
                              bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm"
                  >
                    Filters
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="ml-2 px-4 py-2 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer
                              bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm"
                  >
                    Reset Filters
                  </button>

                </div>


              </div>
            </div>

            {/* Housing List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(housing => (
                <div key={housing.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={housing.thumbnail || housing.image}
                      alt={housing.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{housing.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        housing.type === 'Apartment' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {housing.type.toUpperCase().charAt(0)+housing.type.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
                      <FaWalking className="mr-1 text-red-500" />
                      <span>{housing.commute}</span>
                    </div>
                    <p className="text-blue-600 font-medium mb-4">${housing.lowest_rent ?? 0}/month</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div className="flex items-center">

                        <LiaDollarSignSolid className="text-blue-500 mr-1" />

                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(housing.avg_cost / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{(housing.avg_cost ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaShieldHalved className="text-green-500 mr-1" />
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(housing.avg_safety / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{(housing.avg_safety ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        
                        <MdManageAccounts className="text-purple-500 mr-1" />
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(housing.avg_management / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{(housing.avg_management ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <MdNoiseControlOff className="text-red-500 mr-1" />
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(housing.avg_noise / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{(housing.avg_noise ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-600">{housing.review_count} reviews</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer"
                        onClick={() => window.location.href=`/housing/${housing.id}`}
                      >
                        View Details
                        <FaChevronRight className="ml-1 text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
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
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', padding: '1rem', borderRadius: '4px', minWidth: '300px'
  },
  rangeInput: {
    width: '3rem', margin: '0 .5rem'
  },
  button: {
    marginLeft: '.5rem', padding: '.5rem 1rem'
  }
};
