import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileListingsPage.scss';

const ProfileListingsPage: React.FC = () => {
  return (
    <div className="profileListings">
      <div className="listingsHeader">
        <h3>My Listings</h3>
        <Link to="/listings/new" className="createBtn">+ Create New Listing</Link>
      </div>

      {/* Grid populated from API — placeholder empty state */}
      <div className="emptyState">
        <p>You haven't created any listings yet.</p>
        <Link to="/listings/new" className="ctaLink">Create your first listing →</Link>
      </div>
    </div>
  );
};

export default ProfileListingsPage;
