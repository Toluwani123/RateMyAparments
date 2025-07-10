import React from 'react';
import { useState, useEffect } from 'react';
import { checkAuth } from './checkauth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Campus from './pages/Campus';
import Housing from './pages/Housing';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Verify from './pages/Verify';



function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterandLogout()  {
  localStorage.clear();
  return <Register />;
}

function App() {
  const [authReady, setReady] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setReady(true));
  }, []);

  if (!authReady) return <div className="grid place-items-center h-screen">Loading…</div>;

  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterandLogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/campuses/:id" element={<Campus />} />
        <Route path="/housing/:id" element={<Housing />} />
        <Route path="/verify-email" element={<Verify />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>

  )
}

export default App
