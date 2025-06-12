import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Campus from './pages/Campus';
import Housing from './pages/Housing';

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterandLogout()  {
  localStorage.clear();
  return <Register />;
}

function App() {
  

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
      </Routes>
    </Router>

  )
}

export default App
