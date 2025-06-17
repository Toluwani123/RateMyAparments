import React, {useEffect, useState} from 'react'
import api from '../api'

export default function ProfileForm({profile, onSuccess, onClose}) {
    const [formData, setFormData] = useState({
        looking_for_roommate: profile?.looking_for_roommate ?? false,
        bio:                  profile?.bio                  ?? '',
        age:                  profile?.age                  ?? '',
        gender:               profile?.gender               ?? '',
        pets_ok:              profile?.pets_ok              ?? false,
        smoker_ok:            profile?.smoker_ok            ?? false,
        cleanliness:          profile?.cleanliness          ?? '',
        noise_tolerance:      profile?.noise_tolerance      ?? '',
        sleep_schedule:       profile?.sleep_schedule       ?? '',
        
    });
    const [error, setError] = useState(null);

    useEffect(() => {
      if (profile) {
        setFormData({
          looking_for_roommate: profile.looking_for_roommate,
          bio:profile.bio,
          age: profile.age,
          gender: profile.gender,
          pets_ok: profile.pets_ok,
          smoker_ok: profile.smoker_ok,
          cleanliness: profile.cleanliness,
          noise_tolerance: profile.noise_tolerance,
          sleep_schedule:       profile.sleep_schedule,
        });
      }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      try {
        // 1️⃣ Create or update the profile
        const res = await api.patch('users/me/profile/', formData);
        onSuccess(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'An error occurred');
      }
    }
  return (
    <div style={modalStyles.overlay}>
      
      <div style={modalStyles.modal}>
        <h2>Edit Roommate Profile</h2>
        {error && <p style={{ color:'red' }}>{JSON.stringify(error)}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="checkbox"
              name="looking_for_roommate"
              checked={formData.looking_for_roommate}
              onChange={handleChange}
            /> I’m looking for a roommate
          </label>

          <div>
            <label>Bio:
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>Age:
              <input
                name="age"
                type="number"
                min="16"
                max="120"
                value={formData.age}
                onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>Gender:
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">-- choose --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="n/a">Prefer not to say</option>
              </select>
            </label>
          </div>

          <label>
            <input
              type="checkbox"
              name="pets_ok"
              checked={formData.pets_ok}
              onChange={handleChange}
            /> Pets OK
          </label>
          <label>
            <input
              type="checkbox"
              name="smoker_ok"
              checked={formData.smoker_ok}
              onChange={handleChange}
            /> Smoker OK
          </label>

          {['cleanliness','noise_tolerance'].map(field => (
            <div key={field}>
              <label>
                {field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}:
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                >
                  <option value="">--</option>
                  {[1,2,3,4,5].map(n =>
                    <option key={n} value={n}>{n}</option>
                  )}
                </select>
              </label>
            </div>
          ))}

          <div>
            <label>Sleep Schedule:
              <select
                name="sleep_schedule"
                value={formData.sleep_schedule}
                onChange={handleChange}
              >
                <option value="">--</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Night Owl">Night Owl</option>
                <option value="Flexible">Flexible</option>
              </select>
            </label>
          </div>

          <div style={{ marginTop:'1rem' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} style={{ marginLeft:'.5rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const modalStyles = {
  overlay: {
    position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
    background:'rgba(0,0,0,0.5)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
  },
  modal: {
    background:'#fff', padding:'1rem', borderRadius:'4px', minWidth:'320px', zIndex:1001
  }
};

