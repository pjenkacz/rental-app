import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './ProfileSettingsPage.scss';

const ProfileSettingsPage: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    await user?.delete();
    navigate('/');
  };

  return (
    <div className="profileSettings">

      {/* 1. Profile Info */}
      <section className="settingsSection">
        <h3>Profile Info</h3>
        <div className="field">
          <label>Display Name</label>
          <p>{user?.fullName ?? '—'}</p>
          <span className="hint">Managed via Clerk — click your avatar in the top bar to edit.</span>
        </div>
      </section>

      {/* 2. Account */}
      <section className="settingsSection">
        <h3>Account</h3>
        <div className="field">
          <label>Email</label>
          <p>{user?.primaryEmailAddress?.emailAddress}</p>
          <span className="hint">Email is managed by Clerk and cannot be changed here.</span>
        </div>
      </section>

      {/* 3. Security */}
      <section className="settingsSection">
        <h3>Security</h3>
        <p className="hint">Password management is handled by Clerk. Use the profile button in the Navbar to change your password.</p>
      </section>

      {/* 4. Notifications — placeholder for future */}
      <section className="settingsSection">
        <h3>Notifications</h3>
        <p className="hint">Notification preferences coming soon.</p>
      </section>

      {/* 5. Danger Zone */}
      <section className="settingsSection dangerZone">
        <h3>Danger Zone</h3>
        <p>Permanently delete your account. This action cannot be undone.</p>
        <div className="deleteConfirmBlock">
          <label htmlFor="deleteConfirm">Type <strong>DELETE</strong> to confirm</label>
          <input
            id="deleteConfirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <button
            className="deleteBtn"
            disabled={deleteConfirm !== 'DELETE'}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </section>

    </div>
  );
};

export default ProfileSettingsPage;
