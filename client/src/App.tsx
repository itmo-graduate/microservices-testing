import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from './pages/Home';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Services from './pages/Services';
import FileManager from './pages/FileManager';

function App() {
  return (
    <Router>
      <Box sx={{ width: '600px', m: '0 auto' }}>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/create-service">Create Service</Link> |{" "}
          <Link to="/services">Service list</Link> |{" "}
          <Link to="/file-manager">File manager</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/create-service" element={<CreateService />} />
          <Route path="/edit-service/:id" element={<EditService />} />
          <Route path="/file-manager/" element={<FileManager />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
