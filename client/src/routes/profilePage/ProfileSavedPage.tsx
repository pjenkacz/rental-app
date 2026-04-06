import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileSavedPage.scss';

const ProfileSavedPage: React.FC = () => {
  return (
    <div className="profileSaved">
      <h3>Saved Listings</h3>

      {/* Grid populated from API — placeholder empty state */}
      <div className="emptyState">
        <p>You haven't saved any listings yet.</p>
        <Link to="/listings" className="ctaLink">Browse listings →</Link>
      </div>
    </div>
  );
};

export default ProfileSavedPage;
