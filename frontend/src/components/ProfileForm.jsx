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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        {/* ───── header ───── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Roommate Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            title="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* error */}
          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* looking for roommate */}
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="looking_for_roommate"
              checked={formData.looking_for_roommate}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            I’m looking for a roommate
          </label>

          {/* bio */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tell others about yourself…"
            />
          </div>

          {/* age & gender */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                name="age"
                type="number"
                min="16"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">– choose –</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="n/a">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* pets & smoker */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {[
              { name: 'pets_ok', label: 'Pets OK' },
              { name: 'smoker_ok', label: 'Smoker OK' },
            ].map((opt) => (
              <label
                key={opt.name}
                className="flex items-center gap-3 text-sm font-medium text-gray-700"
              >
                <input
                  type="checkbox"
                  name={opt.name}
                  checked={formData[opt.name]}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* sliders */}
          {['cleanliness', 'noise_tolerance'].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </label>
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">–</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* sleep schedule */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sleep Schedule
            </label>
            <select
              name="sleep_schedule"
              value={formData.sleep_schedule}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">–</option>
              <option value="Early Bird">Early Bird</option>
              <option value="Night Owl">Night Owl</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          {/* action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
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

