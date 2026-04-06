import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <RedirectToSignIn />;

  return <Outlet />;
};

export default ProtectedRoute;
