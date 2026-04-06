import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter } from '../lib/apiClient';

// Ustawia interceptor tokenu Clerk w apiClient.
// Wywoływany raz w Layout — od tej chwili każdy request przez apiClient
// automatycznie dołącza token Authorization.
export const useSetupApiClient = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);
};
