// App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Navigate, useLocation
} from 'react-router-dom';
import { checkAuth } from './checkauth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Campus from './pages/Campus';
import Housing from './pages/Housing';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Verify from './pages/Verify';


/* -------- helpers -------- */
function Logout   () { localStorage.clear(); return <Navigate to="/login" />; }
function RegClear () { localStorage.clear(); return <Register            />; }

/* -------- inner wrapper --------
   (gets Router context, location, etc.) */
function AppRoutes() {
  const { pathname }      = useLocation();               // ✅ now inside Router
  const isAuthPage        = ['/login','/register','/verify-email']
                            .includes(pathname);
  const [ready, setReady] = useState(false);

  /* run checkAuth once, *unless* we’re already on an auth page */
  useEffect(() => {
    if (isAuthPage) return setReady(true);    // allow page to load immediately
    checkAuth().then(() => setReady(true));
  }, [isAuthPage]);

  if (!ready)
    return <div className="grid place-items-center h-screen">Loading…</div>;

  return (
    <Routes>
      <Route path="/"               element={<Home />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<RegClear />} />
      <Route path="/logout"         element={<Logout />} />
      <Route path="/verify-email"   element={<Verify />} />
      <Route path="/campuses/:id"   element={<Campus />} />
      <Route path="/housing/:id"    element={<Housing />} />
      <Route path="/dashboard"      element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/* -------- exported component -------- */
export default function App() {
  return (
    <Router>
      <AppRoutes />      {/* location & auth logic live here */}
    </Router>
  );
}
