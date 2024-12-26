import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlaylistPage.css';

function PlaylistPage() {
  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [youtubeResults, setYoutubeResults] = useState([]);

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

  const fetchPlaylistTracks = async (playlistId) => {
    const response = await axios.get('http://localhost:8888/playlist-tracks', {
      params: { access_token: accessToken, playlist_id: playlistId },
    });
    const tracksWithCovers = response.data.map((track) => ({
      ...track,
      cover: track.cover || 'https://via.placeholder.com/60',
    }));
    setTracks(tracksWithCovers);
  };

  const searchYouTube = async (track) => {
    const query = `${track.name} ${track.artist}`;
    const response = await axios.get(`http://localhost:8888/youtube-search`, {
      params: { q: query },
    });
    return response.data;
  };

  const fetchYouTubeResults = async () => {
    const results = await Promise.all(tracks.map((track) => searchYouTube(track)));
    setYoutubeResults(results);
  };

  return (
    <div className="playlist-page">
      <h1>Spotify Playlists</h1>
      {selectedPlaylist ? (
        <>
          <button
            className="back-button"
            onClick={() => {
              setSelectedPlaylist(null);
              setTracks([]);
              setYoutubeResults([]);
            }}
          >
            Back to Playlists
          </button>
          <h2>{selectedPlaylist.name}</h2>
          <button className="search-button" onClick={fetchYouTubeResults}>
            Search YouTube
          </button>
          <ul className="tracks-list">
            {tracks.map((track, index) => (
              <li key={index}>
                <img src={track.cover} alt={track.name} className="track-cover" />
                <div className="track-info">
                  <p className="track-title">{track.name}</p>
                  <p className="track-artist">by {track.artist}</p>
                </div>
                {youtubeResults[index] && (
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeResults[index].id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-link"
                  >
                    Watch on YouTube
                  </a>
                )}
              </li>
            ))}
          </ul>
        </>
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
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  fetchPlaylistTracks(playlist.id);
                }}
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
