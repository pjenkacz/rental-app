import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import { useUserSync } from '../../hooks/useUserSync';
import { useSetupApiClient } from '../../hooks/useSetupApiClient';
import './layout.scss';

const Layout: React.FC = () => {
  useUserSync();
  useSetupApiClient();

  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;