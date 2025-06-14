// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { checkAuth } from '../checkauth';
import ReviewForm from '../components/ReviewForm';

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






  const fetchUserReviews = async () => {
    const rv = await api.get('/users/me/reviews/');
    setReviews(rv.data);
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
            <Link to={`/housing/${b.housing.id}`}>
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
      <ul>
        {matches.map(m => (
          <li key={m.user.id}>
            <strong>{m.user.username}</strong> — Score: {m.score.toFixed(2)}
            <Link to={`/user/${m.user.id}/profile`}>View Profile</Link>
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
