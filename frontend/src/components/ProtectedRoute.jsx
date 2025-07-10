import React, { useState, useEffect } from "react";
import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants";
import {refreshAccessToken} from "../auth";


function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const [ok,   setOk]     = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return setReady(true), setOk(false);

      try {
        const { exp } = jwtDecode(token);
        const valid = exp * 1000 > Date.now() || await refreshAccessToken();
        setOk(valid);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return <div>Loading…</div>;
  return ok ? children : <Navigate to="/login" replace />;
}


export default ProtectedRoute;