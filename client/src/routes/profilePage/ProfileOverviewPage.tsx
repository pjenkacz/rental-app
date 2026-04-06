import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileOverviewPage.scss';

const ProfileOverviewPage: React.FC = () => {
  return (
    <div className="profileOverview">
      <section className="overviewSection">
        <h3>Recent Activity</h3>
        <p className="emptyState">No recent activity yet.</p>
      </section>

      <section className="overviewSection">
        <h3>Messages</h3>
        <p className="emptyState">No unread conversations.</p>
        <Link to="/messages" className="ctaLink">Go to Messages →</Link>
      </section>
    </div>
  );
};

export default ProfileOverviewPage;
