import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './ProfileLayout.scss';

const ProfileLayout: React.FC = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) return <div className="profileLoading">Loading...</div>;

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="profileLayout">
      {/* Profile Header */}
      <div className="profileHeader">
        <div className="headerInner">
          <img
            src={user.imageUrl}
            alt={user.fullName ?? 'Avatar'}
            className="avatar"
            onClick={() => navigate('/profile/settings')}
          />
          <div className="headerInfo">
            <h2>{user.fullName ?? user.username}</h2>
            <span>{user.primaryEmailAddress?.emailAddress}</span>
            <div className="stats">
              <span>0 listings</span>
              <span>·</span>
              <span>0 saved</span>
              <span>·</span>
              <span>0 messages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <nav className="profileTabs">
        <NavLink to="/profile" end className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Overview
        </NavLink>
        <NavLink to="/profile/listings" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          My Listings
        </NavLink>
        <NavLink to="/profile/saved" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Saved
        </NavLink>
        <NavLink to="/messages" className="tab tab--external">
          Messages →
        </NavLink>
      </nav>

      {/* Tab Content */}
      <div className="profileContent">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
