import React from 'react';
import './LoginPage.css';

function LoginPage() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login';
  };

  return (
    <div className="login-page">
      <h1>Spotify Playlist to Youtube</h1>
      <button className="btn-login" onClick={handleLogin}>
        Login with Spotify
      </button>
    </div>
  );
}

export default LoginPage;