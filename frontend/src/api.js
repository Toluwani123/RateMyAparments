import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { refreshAccessToken } from './auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


export const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ──────────────── RESPONSE interceptor ─────────────── */
let refreshPromise = null;           // ⬅️ 2. shared promise

api.interceptors.response.use(
  res => res,                        // happy path → pass straight through
  async err => {
    const { config, response } = err;

    // We only handle *one* case: 401 + not-retried-yet
    if(!localStorage.getItem(REFRESH_TOKEN)) {
      throw err; // no refresh token, so we can't do anything
    }
    if (response?.status === 401 && !config._retry) {
      // if another request is already refreshing, await the same promise
      if (!refreshPromise) refreshPromise = refreshAccessToken();
      const ok = await refreshPromise;
      refreshPromise = null;

      if (ok) {
        config._retry  = true; // mark so we don't loop forever
        config.headers.Authorization =
          `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`;  // new token
        return api(config);   // 3. REPLAY the original call
      }
    }

    /* any other error, or refresh failed → bubble up */
    throw err;
  }
);


export default api;