// auth.js
import api from './api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { jwtDecode } from 'jwt-decode';



export function tokenIsValid(token) {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false; // malformed token
  }
}


function redirectIfNotAuthenticated() {
  
  window.location.assign('/login');

}


export async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN);
  if (!tokenIsValid(refresh)) {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    redirectIfNotAuthenticated();
    return false;

  }

  try {
    const { data } = await api.post('/token/refresh/', { refresh });
    localStorage.setItem(ACCESS_TOKEN, data.access);
    if (data.refresh) {                      // ← keep it fresh
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
    }
    return true;
  } catch {
    // refresh token invalid / expired
    
    redirectIfNotAuthenticated();
    return false;
  }
}


