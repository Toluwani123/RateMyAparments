// src/pages/Verify.jsx  (or wherever you render this)

import { useState } from 'react';
import { publicApi } from '../api';
import { useNavigate } from 'react-router-dom';

export default function VerificationForm() {
  const [code   , setCode   ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error  , setError  ] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await publicApi.post('/verify-email/', { code });
      alert('Verification successful! You can now log in.');
      navigate('/login');
    } catch {
      setError('Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Email Verification
        </h2>
        <p className="text-center text-gray-600">
          Enter the 6-digit code we just sent to your inbox.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </p>
        )}

        <input
          type="text"
          name="code"
          value={code}
          maxLength={6}
          onChange={e => setCode(e.target.value.toUpperCase())}
          required
          placeholder="Verification code"
          className="w-full px-4 py-2 border border-gray-300 rounded-md
                     text-center tracking-widest text-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-medium transition
            ${loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>

        <p className="mt-2 text-center text-sm text-gray-500">
          Entered the wrong email?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up again
          </a>
        </p>
      </form>
    </div>
  );
}
