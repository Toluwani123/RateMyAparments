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
       

        // 2️⃣ Upload each file
        if (files.length) {
          await Promise.all(files.map(file => {
            const fd = new FormData();
            fd.append('image', file);
            return api.post(
              `/reviews/${res.data.id}/media/`,
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      {/* Modal */}
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {review ? "Edit Your Review" : "Write a Review"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          {/* Error banner */}
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Ratings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {["cost", "safety", "management", "noise"].map((field) => (
              <label key={field} className="flex flex-col gap-1 text-sm">
                <span className="font-medium capitalize text-gray-700">
                  {field}
                </span>
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {/* Comment */}
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Comment</span>
            <textarea
              name="comment"
              rows={4}
              maxLength={1000}
              value={formData.comment}
              onChange={handleChange}
              className="mt-1 w-full resize-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Share your experience…"
            />
            <span className="mt-1 block text-right text-xs text-gray-500">
              {formData.comment.length}/1000
            </span>
          </label>

          {/* Tags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <label key={i} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Tag {i}</span>
                <select
                  name={`tag${i}`}
                  value={formData[`tag${i}`]}
                  onChange={handleChange}
                  className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">— select —</option>
                  {TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {/* Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Photos / Videos
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700"
            />
            {files.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {files.length} file{files.length > 1 && "s"} selected
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {review ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
