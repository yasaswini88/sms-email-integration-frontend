import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AppBar from './components/AppBar';
import Login from './components/Login';
import FirmDashboard from "./components/FirmDashboard";
import VerifyCode from './components/VerifyCode';
import { Box, Toolbar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';
import { Navigate } from 'react-router-dom';

import './App.css';


function PrivateRoute({ children }) {

  const isAuthenticated = !!localStorage.getItem('email');

  return isAuthenticated ? children : <Navigate to="/" />;
}


function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isVerifyCodePage = location.pathname === "/verifyCode";

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        {/* Show AppBar only if not on login or verify code page */}
        {!isLoginPage && !isVerifyCodePage && <AppBar />}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {!isLoginPage && !isVerifyCodePage && <Toolbar />}
          <Routes>
            +  <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
            <Route
              path="/FirmDashboard"
              element={
                <PrivateRoute>
                  <FirmDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/verifyCode" element={<VerifyCode />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Box>
      </div>
    </ThemeProvider>
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
