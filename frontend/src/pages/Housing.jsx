import React, {useState, useEffect} from 'react'
import api, { publicApi } from '../api'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { checkAuth } from '../checkauth'
import { jwtDecode } from 'jwt-decode'
import { ACCESS_TOKEN } from '../constants'
import { HiCheckBadge } from "react-icons/hi2";
import Footer from '../components/Footer'
import { FaStar, FaStarHalf } from 'react-icons/fa'
import RadarChart from '../components/Radial'
import { CiStar } from 'react-icons/ci'
import { ImCheckmark } from "react-icons/im";
import { FaPencilAlt } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { FaBuildingShield } from "react-icons/fa6";
import { BsBuildingFillGear } from "react-icons/bs";
import { IoIosMegaphone } from "react-icons/io";
import { MdOutlineMapsHomeWork } from "react-icons/md";
import { MdOutlinePermPhoneMsg } from "react-icons/md";
import { SiWebauthn } from "react-icons/si";
import { MdOutlinePriceChange } from "react-icons/md";
import { FaPersonWalkingArrowLoopLeft } from "react-icons/fa6";
import { MdBathroom, MdBedroomParent } from "react-icons/md";


import ReviewForm from '../components/ReviewForm'

function Housing() {
  const navigate = useNavigate();
  const {id} = useParams()
  const [housing, setHousing] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');



  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const { username } = jwtDecode(token);
      setCurrentUser(username);
      setIsLoggedIn(true);
       // Use authenticated API client
    }
  }, []);


  useEffect(() => {
    api.get(`/housing/${id}/`)
      .then(res => setHousing(res.data))
      .catch(err => setError(err.toString()))
  }, [id])

  const fetchReviews = () => {
    api.get(`/housing/${id}/reviews/`)
      .then(res => {
        const data = res.data.results ?? res.data;
        setReviews(data);
      })
      .catch(err => setError(err.toString()));
  }

  useEffect(fetchReviews, [id]);

  if (error) {
    return <div>Error: {error}</div>
  }
  if (!housing) {
    return <div>Loading...</div>
  }
  const openForm = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setShowForm(true);
  };

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      if (housing.is_bookmarked) {
        await api.delete(`/bookmarks/${housing.bookmark_id}/`);
      }
      else {
        await api.post('users/me/bookmarks/', { housing: housing.id });
      }
      setHousing(prev => ({
        ...prev,
        is_bookmarked: !prev.is_bookmarked,
        bookmark_id: prev.is_bookmarked ? null : housing.id
      }));
    }
    catch (err) {
      setError(err.toString());
    }
  };


    // Determine type label
  const typeLabel = housing.type === 'hall'
    ? 'On-Campus Residence Hall'
    : 'Off-Campus Apartment';


  const nextPhoto =() => {
    if (housing.image_urls && housing.image_urls.length > 0) {
      setCurrentPhotoIndex(p => (p + 1) % housing.image_urls.length);
    }
  };
  const prevPhoto = () => {
    if (housing.image_urls && housing.image_urls.length > 0) {
      setCurrentPhotoIndex(p => (p - 1 + housing.image_urls.length) % housing.image_urls.length);
    }
  };
  const selectPhoto = (index) => {
    if (housing.image_urls && housing.image_urls.length > 0) {
      setCurrentPhotoIndex(index % housing.image_urls.length);
    }
  };

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
        </div>
      );
    };

    

  

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm && (
        <ReviewForm
          housingId={id}
          onSuccess={fetchReviews}
          onClose={() => setShowForm(false)}
        />
      )}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a
              href="/"
              data-readdy="true"
              className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              <span className="font-medium">Back to Search</span>
            </a>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{housing.name}</h1>
          <div className="flex items-center">
            <button className="text-gray-700 hover:text-blue-600 cursor-pointer">
              <i className="fas fa-share-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      <div className='relative'>
        <div className='relative h-[500px]'>
          <img src={housing.image_urls[currentPhotoIndex]} alt={housing.name} className='object-cover w-full h-full' />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={prevPhoto}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 text-gray-800 shadow-md cursor-pointer"
            >
              <i className="fas fa-chevron-left text-lg"></i>
            </button>
            <button
              onClick={nextPhoto}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 text-gray-800 shadow-md cursor-pointer"
            >
              <i className="fas fa-chevron-right text-lg"></i>
            </button>
          </div>
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {currentPhotoIndex + 1}/{housing.image_urls.length}
            </div>

          </div>

        </div>
        { housing.image_urls.length > 0 && (
          <div className="container mx-auto px-4 -mt-16 relative z-10">
            
            <div className="bg-white p-2 rounded-lg shadow-lg overflow-x-auto">
              <div className="flex space-x-2">
                {housing.image_urls.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => selectPhoto(i)}
                    className={`w-24 h-16 flex-shrink-0 cursor-pointer ${currentPhotoIndex === i ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <img
                      src={url}
                      alt={`Housing image ${i + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800 mr-3">
                  {housing.name}
                </h1>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {typeLabel}
                </span>
              </div>
              <p className="text-gray-600 text-lg">{housing.campus_name}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-center">
              <div className="flex items-center mb-1">
                <div className="flex mr-2">
                  {renderStars(housing?.avg_overall)}
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {(housing.avg_overall ?? 0).toFixed(1)}
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                {housing.review_count} reviews
              </p>
            {isLoggedIn ? (
              <button
                onClick={toggleBookmark}
                className={`mt-3 py-2 px-4 font-medium rounded-md !rounded-button whitespace-nowrap cursor-pointer
                  ${
                    housing.is_bookmarked
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' // bookmarked style
                      : 'bg-blue-600 hover:bg-blue-700 text-white'        // not-bookmarked style
                  }`}
              >
                {housing.is_bookmarked ? '★ Remove Bookmark' : '☆ Add Bookmark'}
              </button>
                  
                ) : null}


            </div>
          </div>
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } cursor-pointer`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("amenities")}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "amenities"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } cursor-pointer`}
              >
                Amenities
              </button>
              
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } cursor-pointer`}
              >
                Reviews
              </button>
              
              <button
                onClick={() => setActiveTab("contact")}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "contact"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } cursor-pointer`}
              >
                Contact
              </button>
            </nav>
          </div>
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Ratings Breakdown
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div
                      style={{ width: "100%", height: "300px" }}
                    >
                      <RadarChart
                        metrics={{
                          avg_cost:       housing.avg_cost,
                          avg_safety:     housing.avg_safety,
                          avg_management: housing.avg_management,
                          avg_noise:      housing.avg_noise,
                        }}
                        height={300}               // optional – defaults to 320 × 320
                        width={300}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Cost</span>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-bold mr-2">
                            {(housing.avg_cost ?? 0).toFixed(1)}
                          </span>
                          <MdAttachMoney className="text-blue-500" />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${((housing.avg_cost ?? 0) / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">
                          Safety
                        </span>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-bold mr-2">
                            {(housing.avg_safety ?? 0).toFixed(1)}
                          </span>
                          <FaBuildingShield className="text-green-500" />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${((housing.avg_safety ?? 0) / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">
                          Management
                        </span>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-bold mr-2">
                            {(housing.avg_management ?? 0).toFixed(1)}
                          </span>
                          <BsBuildingFillGear className="text-purple-500" />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${((housing.avg_management ?? 0) / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Noise</span>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-bold mr-2">
                            {(housing.avg_noise ?? 0).toFixed(1)}
                          </span>
                          <IoIosMegaphone className="text-red-500" />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${((housing.avg_noise ?? 0) / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Property Overview
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {housing.description}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Top Tags
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {housing.top_tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-sm font-semibold mr-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Top Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {housing.features.slice(0, 6).map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <HiCheckBadge className="text-blue-500 mr-2" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("amenities")}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    View all amenities
                    <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recent Reviews
                </h2>
                {reviews.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 p-4 rounded-lg mb-4"
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {review.user.username.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {review.user.username}
                          </h4>
                          <p className="text-gray-500 text-sm">{new Date(review.created_at).toLocaleDateString()} 
                            {review.updated_at !== review.created_at && ` (updated ${new Date(review.updated_at).toLocaleDateString()})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(review.overall_rating ?? 0)}
                        </div>
                        <span className="font-bold text-gray-800">
                          {(review.overall_rating ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{review.comment}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span className="mr-4">{review.tag1_display}</span>
                        <span className="mr-4">{review.tag2_display}</span>
                        <span className="mr-4">{review.tag3_display}</span>
                      </div>
                      
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  View all {housing.review_count} reviews
                  <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          )}

          
          {activeTab === "amenities" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                All Amenities
              </h2>
              {(() => {
                // Split the list once per render
                const features = Array.isArray(housing.features) ? housing.features : [];
                const half   = Math.ceil(features.length / 2);
                const left   = features.slice(0, half);
                const right  = features.slice(half);

                return (
                  <div className="bg-gray-50 p-5 rounded-lg w-full">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Amenities
                    </h3>

                    {/* 2-column layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {/* LEFT column */}
                      <div className="space-y-3">
                        {left.map((amenity, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              {/*  fall back to fa-check if we don’t recognise the amenity  */}
                              <ImCheckmark className={`text-blue-600`} />
                            </div>
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>

                      {/* RIGHT column */}
                      <div className="space-y-3">
                        {right.map((amenity, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              {/*  fall back to fa-check if we don’t recognise the amenity  */}
                              <ImCheckmark className={`text-blue-600`} />
                            </div>
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
              



              <div className="mt-8 bg-blue-50 p-5 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Additional Information
                </h3>
                <p className="text-gray-700">
                  Contacting the housing office is recommended for more details on amenities, availability, and any specific requirements.
                </p>
              </div>
            </div>
          )}

          
          {activeTab === "reviews" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  All Reviews ({housing.review_count})
                </h2>
                <div className="mt-3 md:mt-0 flex space-x-2">
                  <div className="relative">
                    <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md !rounded-button whitespace-nowrap cursor-pointer flex items-center">
                      <span>Sorting by Most Recent</span>
                    </button>
                  </div>
                  {isLoggedIn ? (
                    reviews.some(r => r.user?.username === currentUser) ? (
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md !rounded-button whitespace-nowrap cursor-pointer"
                      >
                        Edit your Review on your Dashboard ✍️
                      </button>
                    ) : (
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md !rounded-button whitespace-nowrap cursor-pointer"
                        onClick={openForm}
                      >
                        Write your Review ✍️
                      </button>
                    )
                  ) : null}



                  
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex flex-col md:flex-row md:justify-between mb-4">
                      <div className="flex items-center mb-3 md:mb-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-lg">
                            {review.user.username.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {review.user.username}
                          </h4>
                          <p className="text-gray-500 text-sm">{review.created_at ? new Date(review.created_at).toLocaleDateString() : "Unknown"}</p>
                          <p className="text-gray-500 text-sm">{review.updated_at ? new Date(review.updated_at).toLocaleDateString() : ""}</p>

                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.media_urls?.slice(0, 4).map((url, i, arr) => {
                          // If this is the last visible slot *and* there are extra images, show a +N overlay
                          const extras = review.media_urls.length - 4;
                          const showMoreBadge = i === arr.length - 1 && extras > 0;

                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative block w-10 h-10 rounded overflow-hidden"
                              title="View full image"
                            >
                              <img src={url} alt="" className="object-cover w-full h-full" />

                              {showMoreBadge && (
                                <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-semibold text-white">
                                  +{extras}
                                </span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <span className="text-gray-500 text-sm">Cost</span>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-medium mr-1">
                              {review.cost}
                            </span>
                            <MdAttachMoney className="text-blue-500 text-sm" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Safety</span>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-medium mr-1">
                              {review.safety}
                            </span>
                            <FaBuildingShield className="text-green-500 text-sm" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">
                            Management
                          </span>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-medium mr-1">
                              {review.management}
                            </span>
                            <BsBuildingFillGear className="text-purple-500 text-sm" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Noise</span>
                          <div className="flex items-center">
                            <span className="text-gray-900 font-medium mr-1">
                              {review.noise}
                            </span>
                            <IoIosMegaphone className="text-red-500 text-sm" />
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700">{review.comment}</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between md:items-center text-sm">
                      <div className="mb-3 md:mb-0">
                        <span className="text-gray-600 mr-4">
                          <i className="far fa-calendar-alt text-gray-400 mr-1"></i>
                          {review.tag1_display || "No Tag 1"}
                        </span>
                        <span className="text-gray-600">
                          <i className="fas fa-bed text-gray-400 mr-1"></i>
                          {review.tag2_display || "No Tag 2"}
                        </span>
                        <span className="text-gray-600 ml-4">
                          <i className="fas fa-comments text-gray-400 mr-1"></i>
                          {review.tag3_display || "No Tag 3"}
                        </span>
                      </div>
                     
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md !rounded-button whitespace-nowrap cursor-pointer">
                  Load More Reviews
                </button>
              </div>
            </div>
          )}

          
          {activeTab === "contact" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Housing Office
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <MdOutlineMapsHomeWork className="text-blue-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Address
                        </span>
                        <p className="text-gray-600">{housing.addressline1 + (housing.addressline2 ?? "") + ", "  + housing.state + " " }</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <MdOutlinePermPhoneMsg className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">Phone</span>
                        <p className="text-gray-600">{housing.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <SiWebauthn className="text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Website
                        </span>
                        <p>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(
                              `${housing.name} ${housing.campus_name ?? housing.campus?.name ?? ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Search on&nbsp;Google
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <MdOutlinePriceChange className="text-red-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Starting Price
                        </span>
                        <p className="text-gray-600">${housing.lowest_rent}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <FaPersonWalkingArrowLoopLeft className="text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Commute
                        </span>
                        <p className="text-gray-600">
                          {housing.commute}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <MdBedroomParent className="text-brown-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Bedrooms
                        </span>
                        <p className="text-gray-600">{housing.bedrooms} Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <MdBathroom className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">
                          Bathrooms
                        </span>
                        <p className="text-gray-600">{housing.bathrooms} Bathrooms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          )}




        </div>

      </div>

      <Footer />




      
    </div>
  );
}

export default Housing