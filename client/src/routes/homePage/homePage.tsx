import React from 'react';
import './homePage.scss';
import SearchBar from '../../components/searchBar/SearchBar';

const HomePage: React.FC = () => {
  return (
    <div className="homePage">
      <div className="backgroundOverlay"></div>
      <div className="contentWrapper">
        <div className="heroSection">
          <div className="heroContent">
            <span className="tagline">PREMIUM LIVING SPACES</span>
            <h1 className="mainTitle">
              Find Your 
              <span className="highlight"> Perfect </span>
               Place
            </h1>
            <p className="subtitle">
              Discover exceptional apartments in the world's most vibrant cities.
              Experience luxury living redefined.
            </p>
            <div className="searchBarContainer">
              <SearchBar />
            </div>
          </div>
          
          <div className="statsContainer">
            <div className="statCard">
              <div className="statNumber">16k+</div>
              <div className="statLabel">Premium Properties</div>
            </div>
            <div className="statCard">
              <div className="statNumber">2k+</div>
              <div className="statLabel">Trusted Partners</div>
            </div>
            <div className="statCard">
              <div className="statNumber">5k+</div>
              <div className="statLabel">Happy Residents</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scrollIndicator">
        
      </div>
    </div>
  );
};

export default HomePage;