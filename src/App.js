import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AppBar from './components/AppBar';
import { Box, Toolbar } from '@mui/material';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AppBar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar /> {/* This creates space below AppBar */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Box>
      </div>
    </Router>
  );
}

export default App;