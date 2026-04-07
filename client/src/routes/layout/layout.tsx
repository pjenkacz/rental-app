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
    <>
      <Navbar />
      <main className="pageContent">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
