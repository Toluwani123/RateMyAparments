// src/components/Form.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { publicApi } from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

export default function Form({ route, method }) {
  const isLogin = method === 'login';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [campuses, setCampuses] = useState([]);
  const [loading , setLoading ] = useState(false);
  const [error   , setError   ] = useState(null);

  const firstInputRef = useRef(null);

  /* ---------- load campus list (register only) ---------- */
  useEffect(() => {
    if (!isLogin) {
      publicApi.get('/campuses/')
        .then(res => setCampuses(res.data.results ?? res.data))
        .catch(()  => setCampuses([]));
    }
  }, [isLogin]);

  /* ---------- focus first field on mount ---------- */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /* ---------- handlers ---------- */
  const onChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post(route, formData);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, data.access);
        localStorage.setItem(REFRESH_TOKEN, data.refresh);
        navigate('/');
      } else {
        alert('Registration successful! Please verify your email.');
        navigate('/verify-email');
      }
    } catch (err) {
      const detail = err.response?.data;
      const msg = typeof detail === 'string'
        ? detail
        : Object.values(detail || {}).flat().join('\n') ||
          'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- jsx ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={onSubmit}
          className="bg-white shadow-lg rounded-xl px-8 py-10 space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isLogin ? 'Login' : 'Create an account'}
          </h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </p>
          )}

          {/* ───────────── Fields ───────────── */}
          {!isLogin && (
            <>
              <input
                ref={firstInputRef}
                name="username"
                placeholder="Username"
                onChange={onChange}
                required
                className="input"
              />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                onChange={onChange}
                required
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="first_name"
                  placeholder="First name"
                  onChange={onChange}
                  required
                  className="input"
                />
                <input
                  name="last_name"
                  placeholder="Last name"
                  onChange={onChange}
                  required
                  className="input"
                />
              </div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={onChange}
                required
                className="input"
              />
              <input
                name="password2"
                type="password"
                placeholder="Confirm password"
                onChange={onChange}
                required
                className="input"
              />

              <select
                name="campus"
                onChange={onChange}
                required
                className="input pr-10"
              >
                <option value="">Select campus</option>
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </>
          )}

          {isLogin && (
            <>
              <input
                ref={firstInputRef}
                name="username"
                placeholder="Username"
                onChange={onChange}
                required
                className="input"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={onChange}
                required
                className="input"
              />
            </>
          )}

          {/* ───────────── Submit ───────────── */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-medium transition
              ${loading ? 'bg-blue-300 cursor-not-allowed'
                         : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Processing…' : isLogin ? 'Login' : 'Register'}
          </button>

          {/* ───────────── Helper links ───────────── */}
          <div className="text-center text-sm">
            {isLogin ? (
              <>
                <span className="text-gray-600">Don’t have an account?</span>{' '}
                <a href="/register" className="text-blue-600 hover:underline">
                  Register
                </a>
              </>
            ) : (
              <>
                <span className="text-gray-600">Already registered?</span>{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  Login
                </a>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* -- Tailwind shortcut: style for every input/select -- */
const inputBase =
  'input px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 ' +
  'focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400';

