// src/components/Home.jsx

import React, { useEffect, useState } from 'react'
import { checkAuth } from '../checkauth'
import { SEARCH_TYPES } from '../constants'
import { publicApi } from '../api';
import { Link } from 'react-router-dom';
import { MdAttachMoney } from "react-icons/md";
import { FaBuildingShield } from "react-icons/fa6";
import { BsBuildingFillGear } from "react-icons/bs";
import { IoIosMegaphone } from "react-icons/io";
import { RiSearchEyeFill } from "react-icons/ri";
import { VscOpenPreview } from "react-icons/vsc";
import { TbHomeSpark } from "react-icons/tb";
import Footer from '../components/Footer';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchMode, setSearchMode] = useState("housing");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [popularCampuses, setPopularCampuses] = useState([]);
  const [topRatedHousing, setTopRatedHousing] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);


  // check auth once
  useEffect(() => {
    checkAuth().then(setIsLoggedIn)
  }, [])

  useEffect(() => {
    const loadPopularData = async () => {
      setDataLoading(true);
      try {
        // Load popular campuses
        const campusResponse = await publicApi.get('/campuses/');
        const campusData = campusResponse.data.results ?? campusResponse.data;
        setPopularCampuses(campusData.slice(0, 3)); // Take first 3 for display
        
        // Load top rated housing
        const housingResponse = await publicApi.get('/housing/');
        const housingData = housingResponse.data.results ?? housingResponse.data;
        setTopRatedHousing(housingData.slice(0, 3)); // Take first 3 for display
      } catch (error) {
        console.error('Error loading popular data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadPopularData();
  }, []);

   

  // run search when term or type changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timer = setTimeout(() => {
        setLoading(true);
        setError(null);

        const { endpoint } = SEARCH_TYPES[searchMode];
        publicApi.get(`${endpoint}?search=${encodeURIComponent(searchQuery)}`)
          .then(res => {
            const data = res.data.results ?? res.data;
            setSearchResults(data);
            setShowResults(true);
          })
          .catch(err => {
            setError(err.toString());
            setShowResults(false);
          })
          .finally(() => setLoading(false));
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [searchQuery, searchMode]);

  const getRating = (item, field, defaultValue = 0) => {
    return (item[field] ?? defaultValue).toFixed(1);
  };

  const getHousingCount = (campus) => {
    return campus.housing_count || campus.housingCount || 0;
  };


  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Authentication Status Bar */}
      {isLoggedIn && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="container mx-auto">
            <p className="text-sm text-green-700">
              Welcome back! You are logged in. 
              <a href="/dashboard" className="ml-2 underline hover:text-green-800">Go to Dashboard</a>
            </p>
          </div>
        </div>
      )}

      
      {/* Homepage */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            RateMyApartments
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Find and review the best housing options for your campus
          </p>
          
          {/* Auth Links */}
          {!isLoggedIn && (
            <div className="mb-6">
              <a href="/login" className="text-blue-600 hover:text-blue-800 mx-2">Login</a>
              <span className="text-gray-400">|</span>
              <a href="/register" className="text-blue-600 hover:text-blue-800 mx-2">Register</a>
            </div>
          )}

          {/* Search Mode Toggle */}
          <div className="inline-flex rounded-md shadow-sm mb-8" role="group">
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer ${
                searchMode === "housing"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } rounded-l-lg border border-gray-200`}
              onClick={() => setSearchMode("housing")}
            >
              Search Housing
            </button>
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer ${
                searchMode === "campuses"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } rounded-r-lg border border-gray-200`}
              onClick={() => setSearchMode("campuses")}
            >
              Search Campuses
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Search ${SEARCH_TYPES[searchMode]?.label || searchMode}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <p className="text-center text-gray-500">Loading...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-red-200 p-4">
                <p className="text-center text-red-500">Error: {error}</p>
              </div>
            )}

            {/* Search Results */}
            {showResults && searchResults.length > 0 && !loading && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                <ul className="py-2">
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {searchMode === "campuses" ? (
                        <div>
                          <a href={`/campuses/${result.id}`} className="block">
                            <div className="font-medium text-gray-900">
                              {result.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getHousingCount(result)} housing options
                            </div>
                          </a>
                        </div>
                      ) : (
                        <div>
                          <a href={`/housing/${result.id}`} className="block">
                            <div className="font-medium text-gray-900">
                              {result.name}
                              <span
                                className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                  result.type === "apartment" || result.type === "apt"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {result.type === "hall" ? "Hall" : "Apt"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              <div>
                                { result.campus_name 
                                    ?? result.campus?.name 
                                    ?? "Unknown campus" }
                              </div>

                            </div>
                            <div className="flex mt-1 space-x-4 text-xs">
                              <span>
                                
                                <MdAttachMoney />
                                
                                {getRating(result, 'avg_cost')}
                              </span>
                              <span>
                                <FaBuildingShield />
                                {getRating(result, 'avg_safety')}
                              </span>
                              <span>
                                <BsBuildingFillGear />
                                {getRating(result, 'avg_management')}
                              </span>
                              <span>
                                <IoIosMegaphone />
                                {getRating(result, 'avg_noise')}
                              </span>
                            </div>
                          </a>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No Results */}
            {showResults && searchResults.length === 0 && !loading && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <p className="text-center text-gray-500">No results found</p>
              </div>
            )}
          </div>
        </div>

        {/* Featured Sections */}
        {dataLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading popular data...</p>
          </div>
        ) : (
          <>
            {/* Popular Campuses */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Popular Campuses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {popularCampuses.map((campus) => (
                  <div
                    key={campus.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={`https://readdy.ai/api/search-image?query=Beautiful%20university%20campus%20with%20modern%20buildings%2C%20green%20spaces%2C%20and%20students%20walking%20around%2C%20bright%20daylight%2C%20clear%20blue%20sky%2C%20professional%20photography%2C%20high%20resolution%2C%20architectural%20photography&width=600&height=400&seq=${campus.id}&orientation=landscape`}
                        alt={campus.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="p-5">
                      <a href={`/campuses/${campus.id}`}>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {campus.name}
                        </h3>
                      </a>
                      <p className="text-gray-600 mb-3">
                        {getHousingCount(campus)} housing options
                      </p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <MdAttachMoney className="text-blue-500 mr-1" />
                          <span>{getRating(campus, 'avg_cost')}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBuildingShield className="text-green-500 mr-1" />
                          <span>{getRating(campus, 'avg_safety')}</span>
                        </div>
                        <div className="flex items-center">
                          <BsBuildingFillGear className="text-purple-500 mr-1" />
                          <span>{getRating(campus, 'avg_management')}</span>
                        </div>
                        <div className="flex items-center">
                          <IoIosMegaphone className="text-red-500 mr-1" />
                          <span>{getRating(campus, 'avg_noise')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Rated Housing */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Top Rated Housing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topRatedHousing.map((housing) => (
                  <div
                    key={housing.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={`https://readdy.ai/api/search-image?query=Modern%20apartment%20building%20or%20student%20residence%20hall%2C%20clean%20architecture%2C%20well-maintained%20exterior%2C%20with%20some%20greenery%2C%20bright%20daylight%2C%20professional%20real%20estate%20photography%2C%20high%20resolution&width=600&height=400&seq=${housing.id + 10}&orientation=landscape`}
                        alt={housing.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <a href={`/housing/${housing.id}`}>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {housing.name}
                          </h3>
                        </a>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            housing.type === "apartment" || housing.type === "apt"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {housing.type === "hall" ? "Hall" : "Apt"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {housing.campus_name || housing.campus}
                      </p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <MdAttachMoney className="text-blue-500 mr-1" />
                          <span>{getRating(housing, 'avg_cost')}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBuildingShield className="text-green-500 mr-1" />
                          <span>{getRating(housing, 'avg_safety')}</span>
                        </div>
                        <div className="flex items-center">
                          <BsBuildingFillGear className="text-purple-500 mr-1" />
                          <span>{getRating(housing, 'avg_management')}</span>
                        </div>
                        <div className="flex items-center">
                          <IoIosMegaphone className="text-red-500 mr-1" />
                          <span>{getRating(housing, 'avg_noise')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* How It Works Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            How RateMyApartments Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiSearchEyeFill className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search</h3>
              <p className="text-gray-600">
                Find your campus or search directly for housing options in your
                area.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <VscOpenPreview  className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Review</h3>
              <p className="text-gray-600">
                Read honest reviews from students or add your own experience.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TbHomeSpark className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Decide</h3>
              <p className="text-gray-600">
                Make informed housing decisions based on real student
                experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />



    </div>
  );
}

export default Home
