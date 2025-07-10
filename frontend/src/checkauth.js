import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "./auth";


export async function checkAuth() {
  const access = localStorage.getItem(ACCESS_TOKEN);
  if (!access) return false;

  try {
    const { exp } = jwtDecode(access);
    const isExpired = Date.now() / 1000 > exp;

    return isExpired ? await refreshAccessToken() : true;
  } catch {
    return false; // malformed token
  }
}