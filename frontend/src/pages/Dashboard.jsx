// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { checkAuth } from '../checkauth';
import ReviewForm from '../components/ReviewForm';
import ProfileForm from '../components/ProfileForm';

const TABS = ['reviews','bookmarks','profile'];
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState('reviews');
  const [error, setError]           = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [reviews, setReviews]       = useState([]);
  const [bookmarks, setBookmarks]   = useState([]);
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState(new Set());


  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview]   = useState(null);
  const [showEditForm, setShowEditForm]       = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  
  
  
  
  
  
  
  
  
  

  function openProfileModal(profile) {
    setProfileModal(profile);
  }
  function closeProfileModal() {
    setProfileModal(null);  
  }

  







  const fetchUserReviews = async () => {
    const rv = await api.get('/users/me/reviews/');
    setReviews(rv.data);
  };

  const fetchProfile = async () => {

    api.get('/users/me/profile/')
      .then(res => setProfile(res.data))
      .catch(err => setError(err.toString()));
  };

  const toggleReviewExpansion = (id) => {
    setExpandedReviews(prev=>{
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    })
  }

  useEffect(() => {
    (async () => {
      try {
        const ok = await checkAuth();
        setIsLoggedIn(ok);
        if (!ok) return navigate('/login');
        // fetch all three in parallel
        fetchUserReviews();
        fetchProfile();
        const [bm, u, mt] = await Promise.all([
          api.get('/users/me/bookmarks/'),
          api.get('/users/me/'),
          api.get('/users/me/matches/'),
          
        ]);
        setBookmarks(bm.data);
        setCurrentUser(u.data);
        setMatches(mt.data);
        
      } catch (e) {
        setError(e.toString());
      }
    })();
  }, [navigate]);

  // --- Handlers ---
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Really delete this review?')) return;
    await api.delete(`/reviews/${id}/`);
    setReviews(rs => rs.filter(r => r.id !== id));
  };

  const handleRemoveBookmark = async (id) => {
    await api.delete(`/bookmarks/${id}/`);
    setBookmarks(bs => bs.filter(b => b.id !== id));
  };
  const handleDeleteMedia = async (reviewId, mediaId) => {
    if (!window.confirm('Delete this image?')) return;
    await api.delete(`/reviews/${reviewId}/media/${mediaId}/`);
    // refresh just that review list:
    fetchUserReviews();
  };

  // --- Tab Content ---
  const renderReviews = () => (
    <>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">My Reviews</h2>

      {reviews.length === 0 && (
        <p className="text-gray-500">You haven’t written any reviews yet.</p>
      )}

      <ul className="space-y-4">
        {reviews.map((r) => {
          const isExpanded = expandedReviews.has(r.id);

          return (
            <li
              key={r.id}
              className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* ── top row ─────────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {r.housing_name}
                </h3>

                {/* type badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.housing_type === 'hall'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {r.housing_type === 'hall' ? 'On-Campus Hall' : 'Apartment'}
                </span>

                <span className="text-sm text-gray-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-2">
                <button
                  onClick={() => toggleReviewExpansion(r.id)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              </div>

              

              {/* edit / delete actions */}
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedReview(r);
                    setShowEditForm(true);
                  }}
                  className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>

              {/* ── expanded content ───────────────────────────────────── */}
              {isExpanded && (
                <div className="mt-4 space-y-4 text-sm">
                  <p>
                    <span className="font-semibold text-gray-800">Comment:</span>{' '}
                    {r.comment || <em className="text-gray-500">No comment</em>}
                  </p>

                  <p className="text-gray-700">
                    <span className="font-semibold">Ratings:</span>{' '}
                    Cost <b>{r.cost}</b>, Safety <b>{r.safety}</b>, Management{' '}
                    <b>{r.management}</b>, Noise <b>{r.noise}</b>
                  </p>

                  <p className="text-gray-700">
                    <span className="font-semibold">Tags:</span>{' '}
                    {[r.tag1_display, r.tag2_display, r.tag3_display]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>

                  {/* media thumbnails */}
                  {r.media_urls.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {r.media_items.map((m) => (
                        <div key={m.id} className="relative">
                          <img
                            src={m.url}
                            alt=""
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                          <button
                            onClick={() => handleDeleteMedia(r.id, m.id)}
                            className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-xs text-red-600 backdrop-blur hover:bg-white"
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );


  const renderBookmarks = () => (
    <>
      {/* ─────────────── section header ─────────────── */}
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">My Bookmarks</h2>

      {bookmarks.length === 0 && (
        <p className="text-gray-500">You haven’t bookmarked any housing yet.</p>
      )}

      {/* ─────────────── bookmark cards ─────────────── */}
      <ul className="space-y-4">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {/* left – name & type */}
            <Link
              to={`/housing/${b.housing_id}`}
              className="flex flex-col sm:flex-row sm:items-center gap-1 text-blue-600 hover:underline"
            >
              <span className="font-medium">{b.housing_name}</span>
              <span className="text-sm text-gray-500">
                &nbsp;—&nbsp;
                {b.housing.type === 'hall' ? 'On-Campus Hall' : 'Apartment'}
              </span>
            </Link>

            {/* right – remove button */}
            <button
              onClick={() => handleRemoveBookmark(b.id)}
              className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {/* ─────────────── roommate matches ─────────────── */}
      <h3 className="mt-12 mb-4 text-xl font-semibold text-gray-800">
        Matched Housing for {currentUser.username}
      </h3>

      {/* modal for profiles */}
      {profileModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {profileModal.user.username}’s Profile
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Bio:</strong> {profileModal.bio || '–'}
              </p>
              <p>
                <strong>Age:</strong> {profileModal.age ?? '–'}
              </p>
              <p>
                <strong>Gender:</strong> {profileModal.gender_display}
              </p>
              <p>
                <strong>Pets OK:</strong>{' '}
                {profileModal.pets_ok ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Smoker OK:</strong>{' '}
                {profileModal.smoker_ok ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Cleanliness:</strong> {profileModal.cleanliness}
              </p>
              <p>
                <strong>Noise Tolerance:</strong>{' '}
                {profileModal.noise_tolerance}
              </p>
              <p>
                <strong>Sleep Schedule:</strong>{' '}
                {profileModal.sleep_schedule_display}
              </p>

              {profileModal.twitter && (
                <p>
                  <a
                    href={profileModal.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Twitter ↗
                  </a>
                </p>
              )}
            </div>

            <button
              onClick={closeProfileModal}
              className="mt-6 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* roommate match list */}
      <ul className="mt-4 space-y-3">
        {matches.map((m) => (
          <li
            key={m.user.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <strong className="text-gray-800">{m.user.username}</strong>
              <span className="ml-2 text-sm text-gray-500">
                Match Score: {m.score.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => openProfileModal(m.profile)}
              className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              View Profile
            </button>
          </li>
        ))}
      </ul>
    </>
  );


  const renderProfile = () => (
    <>
      {/* ───────────── page heading ───────────── */}
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">My Profile</h2>

      {/* ───────────── basic account info ───────────── */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Username', value: currentUser.username },
          { label: 'Email', value: currentUser.email },
          { label: 'Campus', value: currentUser.campus_name },
          { label: 'Verified', value: currentUser.is_verified ? 'Yes' : 'No' },
          {
            label: 'Joined',
            value: new Date(currentUser.date_joined).toLocaleDateString(),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ───────────── extended profile details ───────────── */}
      {profile ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
          {/* header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Profile Details
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>

          {showForm && (
            <ProfileForm
              profile={profile}
              onSuccess={fetchProfile}
              onClose={() => setShowForm(false)}
            />
          )}

          {/* detail grid */}
          <dl className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            {[
              {
                term: 'Looking for roommate',
                val: profile.looking_for_roommate ? 'Yes' : 'No',
              },
              { term: 'Bio', val: profile.bio || 'No bio provided' },
              { term: 'Age', val: profile.age ?? 'Not set' },
              { term: 'Gender', val: profile.gender_display },
              { term: 'Pets OK', val: profile.pets_ok ? 'Yes' : 'No' },
              { term: 'Smoking OK', val: profile.smoker_ok ? 'Yes' : 'No' },
              { term: 'Cleanliness', val: profile.cleanliness ?? 'Not set' },
              {
                term: 'Noise Tolerance',
                val: profile.noise_tolerance ?? 'Not set',
              },
              { term: 'Sleep Schedule', val: profile.sleep_schedule_display },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-sm font-medium text-gray-500">
                  {item.term}
                </dt>
                <dd className="mt-1 text-base text-gray-800">{item.val}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="text-gray-500">Loading profile details…</p>
      )}
    </>
  );


  if (error) return <p style={{color:'red'}}>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {showEditForm && selectedReview && (
        <ReviewForm
            housingId={selectedReview.housing}
            review={selectedReview}        // ← new prop
            onSuccess={() => { fetchUserReviews(); setShowEditForm(false); }}
            onClose={() => setShowEditForm(false)}
        />
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Welcome, <span className="font-medium">{currentUser?.username ?? 'loading…'}</span>!
        </p>
        <Link
          to="/"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          ⬅︎ Back Home
        </Link>
      </header>

      {/* Tab Nav */}
      <nav className="mb-10 border-b border-gray-200">
        <ul className="flex gap-4 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white text-gray-600 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Active Pane */}
      <section className="space-y-8">
        {activeTab === 'reviews' && (
          <div className="rounded-xl bg-white p-6 shadow">{renderReviews()}</div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="rounded-xl bg-white p-6 shadow">{renderBookmarks()}</div>
        )}

        {activeTab === 'profile' && (
          <div className="rounded-xl bg-white p-6 shadow">{renderProfile()}</div>
        )}
      </section>
    </div>
  );
}
