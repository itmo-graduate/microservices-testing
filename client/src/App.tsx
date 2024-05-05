import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box } from '@mui/material';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Services from './pages/Services';
import FileManager from './pages/FileManager';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Box sx={{ width: '600px', m: '0 auto' }}>
        <nav>
          <Link to="/create-service">Create Service</Link> |{" "}
          <Link to="/services">Service list</Link> |{" "}
          <Link to="/file-manager">File manager</Link> |{" "}
          <Link to="/settings">Settings</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Settings />} />
          <Route path="/services" element={<Services />} />
          <Route path="/create-service" element={<CreateService />} />
          <Route path="/edit-service/:id" element={<EditService />} />
          <Route path="/file-manager/" element={<FileManager />} />
          <Route path="/settings/" element={<Settings />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
