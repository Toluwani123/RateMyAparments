import React, {useState, useEffect, use} from 'react'
import api, { publicApi } from '../api'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { checkAuth } from '../checkauth'
import { jwtDecode } from 'jwt-decode'
import { ACCESS_TOKEN } from '../constants'

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

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const { username } = jwtDecode(token);
      setCurrentUser(username);
      setIsLoggedIn(true);
    }
  }, []);


  useEffect(() => {
    publicApi.get(`/housing/${id}/`)
      .then(res => setHousing(res.data))
      .catch(err => setError(err.toString()))
  }, [id])

  const fetchReviews = () => {
    publicApi.get(`/housing/${id}/reviews/`)
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
      const res = await api.get(`/housing/${id}/`);
      setHousing(res.data);
    }
    catch (err) {
      setError(err.toString());
    }
  };


    // Determine type label
  const typeLabel = housing.type === 'hall'
    ? 'On-Campus Residence Hall'
    : 'Off-Campus Apartment';



  return (
    <div style={{ padding: '1rem' }}>

      {showForm && (
        <ReviewForm
          housingId={id}
          onSuccess={fetchReviews}
          onClose={() => setShowForm(false)}
        />
      )}
      <div >
        <h1>{housing.name}</h1>
        <p><em>{typeLabel}</em></p>

        {/* Key details */}
        
        <p>Address: {housing.addressline1}{housing.addressline2 && `, ${housing.addressline2}`}, {housing.county}, {housing.state}</p>
        <p>Rating Distribution</p>
        <p>Average Cost Rating: {housing.avg_cost?.toFixed(1) ?? '—'}</p>
        <p>Average Safety Rating: {housing.avg_safety?.toFixed(1) ?? '—'}</p>
        <p>Average Management Rating: {housing.avg_management?.toFixed(1) ?? '—'}</p>
        <p>Average Noise Rating: {housing.avg_noise?.toFixed(1) ?? '—'}</p>
        <p>Overall Quality based on {housing.review_count ?? 0} ratings</p>

        <p>
          Top Tags:{' '}
          {housing.top_tags && housing.top_tags.length
            ? housing.top_tags.join(', ')
            : 'None yet'}
        </p>

        {/* Action buttons */}
        <div style={{ margin: '1rem 0' }}>
          <button onClick={openForm}>
            ✍️ Rate this {typeLabel.toLowerCase()}
          </button>
          <Link to="/">← Back to Home</Link>

        </div>

        <button onClick={toggleBookmark} style={{ marginLeft: '1rem' }}>
          {housing.is_bookmarked ? '★ Remove Bookmark' : '☆ Add Bookmark'}
        </button>

        {/* Reviews List */}
        <h2>Reviews</h2>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        <ul>
          {reviews.map(r => (
            <li key={r.id} style={{ position: 'relative', margin: '0.75rem 0', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
              <p>
                <strong>{r.user.username}</strong> &bull; 
                {new Date(r.created_at).toLocaleDateString()} 
                {r.updated_at !== r.created_at && ` (updated ${new Date(r.updated_at).toLocaleDateString()})`}
              </p>
              <p>{r.comment || <em>No comment.</em>}</p>
              <p>{currentUser}</p>
              {currentUser === r.user.username && (
                <button
                  onClick={() => navigate(`/housing/${id}/reviews/${r.id}/edit`)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                >
                  Edit
                </button>
              )}
              <p>
                Ratings: Cost {r.cost}, Safety {r.safety}, Management {r.management}, Noise {r.noise}
              </p>
              <p>Tags: {r.tag1_display}, {r.tag2_display}, {r.tag3_display}</p>
              {/* Media thumbnails */}
              {r.media_urls?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {r.media_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="" width="80" height="80" style={{ objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Housing