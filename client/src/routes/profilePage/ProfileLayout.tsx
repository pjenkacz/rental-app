import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './ProfileLayout.scss';

const ProfileLayout: React.FC = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="profileLayout">
        <div className="profileLoading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="profileLayout">

      {/* Gradient banner header */}
      <header className="profileBanner">
        <div className="profileBannerInner">
          <img
            src={user.imageUrl}
            alt={user.fullName ?? 'Avatar'}
            className="profileAvatar"
            onClick={() => navigate('/profile/settings')}
          />
          <div className="profileInfo">
            <h1 className="profileName">{user.fullName ?? user.username}</h1>
            <span className="profileEmail">
              {user.primaryEmailAddress?.emailAddress}
            </span>
            <div className="profileStats">
              <div className="profileStat">
                <span className="statNum">0</span>
                <span className="statLabel">Listings</span>
              </div>
              <div className="profileStat">
                <span className="statNum">0</span>
                <span className="statLabel">Saved</span>
              </div>
              <div className="profileStat">
                <span className="statNum">0</span>
                <span className="statLabel">Messages</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="profileTabBar">
        <nav className="profileTabNav">
          <NavLink
            to="/profile"
            end
            className={({ isActive }) => `profileTab${isActive ? ' profileTab--active' : ''}`}
          >
            Overview
          </NavLink>
          <NavLink
            to="/profile/listings"
            className={({ isActive }) => `profileTab${isActive ? ' profileTab--active' : ''}`}
          >
            My Listings
          </NavLink>
          <NavLink
            to="/profile/saved"
            className={({ isActive }) => `profileTab${isActive ? ' profileTab--active' : ''}`}
          >
            Saved
          </NavLink>
          <NavLink to="/messages" className="profileTab profileTab--external">
            Messages →
          </NavLink>
        </nav>
      </div>

      {/* Sub-page content */}
      <div className="profileBody">
        <Outlet />
      </div>

    </div>
  );
};

export default ProfileLayout;
