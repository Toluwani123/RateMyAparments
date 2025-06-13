import React, {useEffect, useState} from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'



export default function ReviewForm({housingId,review=null, onSuccess, onClose}) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      cost:       review?.cost       ?? 3,
      safety:     review?.safety     ?? 3,
      management: review?.management ?? 3,
      noise:      review?.noise      ?? 3,
      comment:    review?.comment    ?? '',
      tag1:       review?.tag1       ?? '',
      tag2:       review?.tag2       ?? '',
      tag3:       review?.tag3       ?? '',
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const TAGS = [
        'close_to_campus','responsive_maintenance','affordable',
        'thin_walls','party_atmosphere','secure_building',
        'noisy_neighbors','all_inclusive_utilities',
        'helpful_office_staff','modern_appliances',
        'walkable_area','unresponsive_management',
        'quiet_and_chill','free_parking','frequent_pest_issues'
    ];
    useEffect(() => {
      if (review) {
        setFormData({
          cost:       review.cost,
          safety:     review.safety,
          management: review.management,
          noise:      review.noise,
          comment:    review.comment,
          tag1:       review.tag1,
          tag2:       review.tag2,
          tag3:       review.tag3,
        });
      }
    }, [review]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
    const handleFileChange = (e) => {
      setFiles(Array.from(e.target.files));
    }
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      try {
        // 1️⃣ Create the review
        const res = review
          ? await api.patch(`/reviews/${review.id}/`, formData)
          : await api.post(  `/housing/${housingId}/reviews/`, formData);
        const reviewId = res.data.id;

        // 2️⃣ Upload each file
        if (files.length) {
          await Promise.all(files.map(file => {
            const fd = new FormData();
            fd.append('image', file);
            return api.post(
              `/reviews/${reviewId}/media/`,
              fd,
              { headers: { 'Content-Type': 'multipart/form-data' }}
            );
          }));
        }

        onSuccess();
        onClose();
      }
      catch (err){
            setError(err.response?.data?.detail || 'An error occurred while submitting your review.');
        }
    }
  
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>Rate this housing</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {['cost','safety','management','noise'].map(field => (
            <div key={field}>
              <label>{field.charAt(0).toUpperCase()+field.slice(1)}:
                <select name={field} value={formData[field]} onChange={handleChange}>
                  {[1,2,3,4,5].map(n =>
                    <option key={n} value={n}>{n}</option>
                  )}
                </select>
              </label>
            </div>
          ))}
          <div>
            <label>Comment:
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
              />
            </label>
          </div>

          


          {[1,2,3].map(i => (
            <div key={i}>
              <label>Tag {i}:
                <select
                  name={`tag${i}`}
                  value={formData[`tag${i}`]}
                  onChange={handleChange}
                >
                  <option value="">-- select --</option>
                  {TAGS.map(tag =>
                    <option key={tag} value={tag}>{tag.replace(/_/g,' ')}</option>
                  )}
                </select>
              </label>
            </div>
          ))}

          <div style={{ marginTop: '1rem' }}>
            <label>Upload Photos/Videos:</label><br/>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose} style={{ marginLeft: '0.5rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed', top:0, left:0, width:'100vw', height:'100vh',
    background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
  },
  modal: {
    background:'#fff', padding:'1rem', borderRadius:'4px', minWidth:'300px', position:'relative', zIndex:1001
  }
};