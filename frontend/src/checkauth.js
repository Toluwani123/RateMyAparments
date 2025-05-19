import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import { jwtDecode } from "jwt-decode";
import api from "./api";

export async function checkAuth() {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Try to refresh
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (refreshToken) {
          try {
            const response = await api.post('/token/refresh/', { refresh: refreshToken });
            if (response.status === 200) {
              localStorage.setItem(ACCESS_TOKEN, response.data.access);
              localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
              return true;
            }
          } catch {
            return false;
          }
        }
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}