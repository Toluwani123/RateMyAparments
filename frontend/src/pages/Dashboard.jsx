// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { checkAuth } from '../checkauth';
import ReviewForm from '../components/ReviewForm';
import ProfileForm from '../components/ProfileForm';

const TABS = ['reviews','bookmarks','profile'];
export default function Dashboard() {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm]       = useState(false);
  const [selectedReview, setSelectedReview]   = useState(null);
  const [activeTab, setActiveTab]   = useState('reviews');
  const [error, setError]           = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews]       = useState([]);
  const [bookmarks, setBookmarks]   = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      <h2>My Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet.</p>}
      <ul>
        {reviews.map(r => {
          const isExpanded = expandedReviews.has(r.id);
          return (
            <li key={r.id} style={{ position:'relative', padding:'.5rem', border:'1px solid #ddd', margin:'.5rem 0' }}>
              {/* Header line */}
              <strong>{r.housing_name}</strong> — {r.housing_type==='hall'?'On-Campus':'Off-Campus'}
              <small style={{ marginLeft:'1rem' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </small>

              {/* Expand/Collapse toggle */}
              <button
                onClick={() => toggleReviewExpansion(r.id)}
                style={{ marginLeft:'1rem' }}
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {/* Edit/Delete buttons */}
              <button
                onClick={() => { setSelectedReview(r); setShowEditForm(true); }}
                style={{ position:'absolute', top:'5px', right:'5px' }}
              >Edit</button>
              <button
                onClick={() => handleDeleteReview(r.id)}
                style={{ position:'absolute', top:'5px', right:'60px' }}
              >Delete</button>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                  <p><strong>Comment:</strong> {r.comment || <em>No comment</em>}</p>
                  <p>
                    <strong>Ratings:</strong>
                    Cost {r.cost}, Safety {r.safety},
                    Mgmt {r.management}, Noise {r.noise}
                  </p>
                  <p>
                    <strong>Tags:</strong>
                    {r.tag1_display}, {r.tag2_display}, {r.tag3_display}
                  </p>
                  {r.media_urls.length > 0 && (
                    <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                        {r.media_items.map(m => (
                        <div key={m.id} style={{ position:'relative' }}>
                            <img
                            src={m.url}
                            width="80"
                            height="80"
                            style={{ objectFit:'cover' }}
                            />
                            <button
                            onClick={() => handleDeleteMedia(r.id, m.id)}
                            style={{
                                position:'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(255,255,255,0.8)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            >
                            🗑️
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
      <h2>My Bookmarks</h2>
      {bookmarks.length === 0 && <p>No bookmarks yet.</p>}
      <ul>
        {bookmarks.map(b => (
          <li key={b.id} style={{ padding:'.5rem', border:'1px solid #ddd', margin:'.5rem 0' }}>
            <Link to={`/housing/${b.housing_id}`}>
              {b.housing_name} — {b.housing.type==='hall'?'On-Campus':'Off-Campus'}
            </Link>
            <button
              onClick={() => handleRemoveBookmark(b.id)}
              style={{ marginLeft:'1rem' }}
            >Remove</button>
          </li>
        ))}
      </ul>
      <h3>Matched Housing for {currentUser.username}</h3>
      {profileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{profileModal.user.username}’s Profile</h3>
            <p><strong>Bio:</strong> {profileModal.bio || '–'}</p>
            <p><strong>Age:</strong> {profileModal.age ?? '–'}</p>
            <p><strong>Gender:</strong> {profileModal.gender_display}</p>
            <p><strong>Pets OK:</strong> {profileModal.pets_ok ? 'Yes':'No'}</p>
            <p><strong>Smoker OK:</strong> {profileModal.smoker_ok ? 'Yes':'No'}</p>
            <p><strong>Cleanliness:</strong> {profileModal.cleanliness}</p>
            <p><strong>Noise Tolerance:</strong> {profileModal.noise_tolerance}</p>
            <p><strong>Sleep Schedule:</strong> {profileModal.sleep_schedule_display}</p>
            {/* later: social URLs, e.g.: */}
            {profileModal.twitter && (
              <p><a href={profileModal.twitter}>Twitter</a></p>
            )}
            <button onClick={closeProfileModal}>Close</button>
          </div>
        </div>
      )}

      <ul>
        {matches.map(m => (
          <li key={m.user.id}>
            <strong>{m.user.username}</strong> — Score: {m.score.toFixed(2)}
            <button onClick={() => openProfileModal(m.profile)}>View Profile</button>
          </li>
        ))}
      </ul>
    </>
  );

  const renderProfile = () => (
    <>
      <h2>My Profile</h2>
      <p><strong>Username:</strong> {currentUser.username}</p>
      <p><strong>Email:</strong> {currentUser.email}</p>
      <p><strong>Campus:</strong> {currentUser.campus_name}</p>
      <p><strong>Verified:</strong> {currentUser.is_verified ? 'Yes' : 'No'}</p>
      <p><strong>Joined:</strong> {new Date(currentUser.date_joined).toLocaleDateString()}</p>

      {profile ? (
          <div>
            <h3>Profile Details</h3>
            <button onClick={() => setShowForm(true)}>Edit Profile</button>

            {showForm && (
              <ProfileForm
                profile={profile}
                onSuccess={fetchProfile}
                onClose={() => setShowForm(false)}
              />
            )}

            <p><strong>Looking for roommate:</strong> {profile.looking_for_roommate ? 'Yes' : 'No'}</p>
            <p><strong>Bio:</strong> {profile.bio || <em>No bio provided</em>}</p>
            <p><strong>Age:</strong> {profile.age ?? <em>Not set</em>}</p>
            <p><strong>Gender:</strong> {profile.gender_display}</p>
            <p><strong>Pets OK:</strong> {profile.pets_ok ? 'Yes' : 'No'}</p>
            <p><strong>Smoking OK:</strong> {profile.smoker_ok ? 'Yes' : 'No'}</p>
            <p><strong>Cleanliness:</strong> {profile.cleanliness ?? <em>Not set</em>}</p>
            <p><strong>Noise Tolerance:</strong> {profile.noise_tolerance ?? <em>Not set</em>}</p>
            <p><strong>Sleep Schedule:</strong> {profile.sleep_schedule_display}</p>
          </div>
      ) : (
          <p>Loading profile details...</p>
      )}

      
    </>
  );

  if (error) return <p style={{color:'red'}}>{error}</p>;

  return (
    <div style={{ padding:'1rem' }}>
      {showEditForm && selectedReview && (
        <ReviewForm
            housingId={selectedReview.housing}
            review={selectedReview}        // ← new prop
            onSuccess={() => { fetchUserReviews(); setShowEditForm(false); }}
            onClose={() => setShowEditForm(false)}
        />
      )}
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser?.username || 'loading…'}!</p>
      <Link to="/">Home</Link>
      {/* Tab Nav */}
      <nav style={{ marginBottom:'1rem' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              marginRight:'0.5rem',
              fontWeight: activeTab===tab ? 'bold' : 'normal'
            }}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Active Pane */}
      {activeTab === 'reviews'   && renderReviews()}
      {activeTab === 'bookmarks' && renderBookmarks()}
      {activeTab === 'profile'   && renderProfile()}
    </div>
  );
}
