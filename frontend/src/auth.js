// auth.js
import api from './api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

export async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN);
  if (!refresh) return false;

  try {
    const { data } = await api.post('/token/refresh/', { refresh });
    localStorage.setItem(ACCESS_TOKEN, data.access);
    if (data.refresh) {                      // ← keep it fresh
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
    }
    return true;
  } catch {
    // refresh token invalid / expired
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    return false;
  }
}
