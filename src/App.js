import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AppBar from './components/AppBar';
import Login from './components/Login';
import { Box, Toolbar } from '@mui/material';
import './App.css';

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/"; // Check if it's the login page

  return (
    <div className="App">
      {!isLoginPage && <AppBar />} {/* Show AppBar only if not on login page */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {!isLoginPage && <Toolbar />} {/* Adds spacing when AppBar is visible */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Box>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
