import React from 'react';
import '../styles/Header.css';
import logo from '../images/Farm Track.png'; // Import your logo image

const Header = () => {
  const handleNewsClick = () => {
    window.open('https://agrowon.esakal.com/', '_blank');
  };

  const handlePodcastClick = () => {
    window.open('https://agrowon.esakal.com/podcast', '_blank');
  };

  return (
    <header className="main-page-header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="FarmTrack Logo" className="logo" />
          <h1>FarmTrack</h1>
        </div>
        <div className="buttons-container">
          <button className="news-button" onClick={handleNewsClick}>Agriculture News</button>
          <button className="podcast-button" onClick={handlePodcastClick}>Podcasts</button>
        </div>
      </div>
    </header>
  );
};

export default Header;