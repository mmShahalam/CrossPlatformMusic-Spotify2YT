// Inisialisasi paket
const express = require('express');
const request = require('request');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();

// Akses client_id dan client_secret
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

// Redirect URI setelah login berhasil
const redirect_uri_login = 'https://cross-platform-playlist-spotify2-yt-server.vercel.app/callback'; // URL backend

// Middleware
app.use(cors());

// Route Root
app.get('/', (req, res) => {
  res.send('Backend server is running. Use endpoints like /login or /playlists.');
});

// Login Spotify
app.get('/login', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: spotifyClientId,
    scope: 'user-read-private user-read-email user-library-read playlist-read-private',
    redirect_uri: redirect_uri_login,
  }).toString();

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// Callback Spotify
app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri_login,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64'),
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return res.status(500).send('Failed to authenticate with Spotify');
    }

    const access_token = body.access_token;
    res.redirect(
      `https://cross-platform-playlist-spotify2-yt-client.vercel.app/playlists?access_token=${access_token}` // URL frontend
    );
  });
});

// Endpoint untuk mendapatkan playlist
app.get('/playlists', (req, res) => {
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).send('Access token is required');
  }

  const options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { Authorization: `Bearer ${access_token}` },
    json: true,
  };

  request.get(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return res.status(500).send('Failed to fetch playlists');
    }

    res.json(body);
  });
});

// Endpoint untuk mendapatkan tracks dalam playlist
app.get('/playlist-tracks', (req, res) => {
  const { access_token, playlist_id } = req.query;

  if (!access_token || !playlist_id) {
    return res.status(400).send('Access token and playlist ID are required');
  }

  const options = {
    url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
    headers: { Authorization: `Bearer ${access_token}` },
    json: true,
  };

  request.get(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return res.status(500).send('Failed to fetch playlist tracks');
    }

    const tracks = body.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      cover: item.track.album.images[0]?.url,
    }));

    res.json(tracks);
  });
});

// Endpoint untuk mencari lagu di YouTube
app.get('/youtube-search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    console.error('Query is missing');
    return res.status(400).send('Query is required');
  }

  console.log(`YouTube Search Query: ${query}`);

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
    query
  )}&key=${youtubeApiKey}`;

  try {
    const response = await axios.get(url);
    console.log(`YouTube API Response:`, response.data);
    res.json(response.data.items[0]); // Kirim hasil pertama
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).send('Failed to fetch from YouTube API');
  }
});

// Menjalankan server
const port = process.env.PORT || 8888;
console.log(`Listening on port ${port}. Go to /login to initiate authentication flow.`);
app.listen(port);