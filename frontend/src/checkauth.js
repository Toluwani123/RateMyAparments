import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "./auth";
import { tokenIsValid } from "./auth";


export async function checkAuth() {
  const access = localStorage.getItem(ACCESS_TOKEN);
  if (!tokenIsValid(access)) {
   return await refreshAccessToken();
  }
  return true;
}