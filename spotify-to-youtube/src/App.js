import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import PlaylistPage from './components/PlaylistPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          {/* You can add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
