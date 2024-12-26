import React from 'react';

function LoginPage() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login'; // Redirect ke backend untuk login Spotify
  };

  return (
    <div className="login-page">
      <h1>Spotify Playlist Viewer</h1>
      <button className="btn-login" onClick={handleLogin}>
        Login with Spotify
      </button>
    </div>
  );
}

export default LoginPage;
