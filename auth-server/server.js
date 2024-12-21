// Inisialisasi paket
const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
require('dotenv').config();

// Akses client_id dan client_secret
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const youtubeClientId = process.env.YOUTUBE_CLIENT_ID;
const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;

const redirect_uri_login = 'http://localhost:8888/callback';
const client_id = '';
const client_secret = '';

// YouTube API konfigurasi
const youtube_client_id = '500342624967-vh5vjjphpfltbcfj3p38vmb6llk3u5ir.apps.googleusercontent.com';
const youtube_client_secret = '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';
const youtube_redirect_uri = 'http://localhost:8888/youtube_callback';

 // Tempat menyimpan token YouTube
let youtube_access_token = '';

// Middleware
app.use(cors());

// Login Spotify
app.get('/login', function (req, res) {
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email user-library-read',
        redirect_uri: redirect_uri_login,
      })
  );
});

// Callback Spotify
app.get('/callback', function (req, res) {
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
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    const access_token = body.access_token;
    res.redirect('/token'); // Redirect ke endpoint token
  });
});

// Login YouTube
app.get('/youtube_login', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    youtube_client_id,
    youtube_client_secret,
    youtube_redirect_uri
  );

  const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
});

// Callback YouTube
app.get('/youtube_callback', async (req, res) => {
  const code = req.query.code || null;

  const oauth2Client = new google.auth.OAuth2(
    youtube_client_id,
    youtube_client_secret,
    youtube_redirect_uri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    youtube_access_token = tokens.access_token; // Simpan token
    res.redirect('/token'); // Redirect ke endpoint token
  } catch (error) {
    console.error('Error during YouTube callback:', error);
    res.status(500).send('Authentication failed');
  }
});

// Token endpoint
app.get('/token', function (req, res) {
  if (youtube_access_token) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ token: youtube_access_token }));
  } else {
    res.status(400).send('No YouTube access token available');
  }
});

// Menjalankan server
const port = process.env.PORT || 8888;
console.log(`Listening on port ${port}. Go to /login or /youtube_login to initiate authentication flow.`);
app.listen(port);
