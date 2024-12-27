import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackPage from './TrackPage';
import './PlaylistPage.css';

function PlaylistPage() {
  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      fetchPlaylists(token);
    }
  }, []);

  const fetchPlaylists = async (token) => {
    const response = await axios.get('http://localhost:8888/playlists', {
      params: { access_token: token },
    });
    setPlaylists(response.data.items || []);
  };

  return (
    <div className="playlist-page">
      <h1>Spotify Playlists</h1>
      {selectedPlaylist ? (
        <TrackPage
          accessToken={accessToken}
          playlistId={selectedPlaylist.id}
          playlistName={selectedPlaylist.name}
          onBack={() => setSelectedPlaylist(null)}
        />
      ) : (
        <div className="playlists">
          {playlists.map((playlist) => (
            <div className="playlist-card" key={playlist.id}>
              <img
                src={playlist.images[0]?.url || 'https://via.placeholder.com/150'}
                alt={playlist.name}
                className="playlist-image"
              />
              <h2 className="playlist-name">{playlist.name}</h2>
              <p className="playlist-info">{playlist.tracks.total} Tracks</p>
              <button
                className="playlist-link"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                View Tracks
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistPage;